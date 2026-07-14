/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  canonicalFounderClaimMessage,
  verify,
} from "@understoria/shared/crypto";
import { READ_AUTH_MAX_SKEW_MS } from "../readAuth.js";

/**
 * First-run founder claim — docs/member-authenticated-reads.md,
 * "Claiming a fresh node".
 *
 * With READ_AUTH defaulting ON, a fresh node with no founder keys is
 * UNCLAIMED: every gated surface refuses, and the boot log prints a
 * one-time setup code. This route is how the founding member turns
 * that code into a trust root, in-band, without editing env files:
 * the PWA signs `canonicalFounderClaimMessage(publicKey, code, ts)`
 * and POSTs it here; on success the key lands in `claimed_founders`
 * and the membership resolver's next build includes it.
 *
 * Authority model (first-use, token-gated):
 *   - ONE-SHOT. The claim succeeds only while the node has NO
 *     founder at all (no env keys, no claimed row). Everything after
 *     the first founder goes through the ordinary membership
 *     machinery — invites for members, NODE_FOUNDER_KEYS for
 *     additional roots, quorum removal to retire one.
 *   - The setup code is the operator-possession proof: it exists
 *     only in the server's boot log (or the SETUP_TOKEN env the
 *     operator chose), so presenting it demonstrates control of the
 *     deployment, the same trust the env-edit path demonstrated.
 *   - The signature binds the claim to the presented key, so a
 *     network observer of the claim body cannot substitute their
 *     own key (they'd need the member's secret key to re-sign), and
 *     the timestamp bounds a captured body's usefulness exactly like
 *     a read signature's.
 *
 * This surface stays open under enforcement BY CONSTRUCTION: the
 * read guard gates GETs, and the write-membership gate covers only
 * the SURFACES map — the claim is the step that makes membership
 * exist, so like /redemptions it cannot itself be member-gated.
 * Token comparisons are timing-safe; the global rate limiter bounds
 * guessing on top of the token's entropy.
 */

export interface ClaimFounderDeps {
  db: DatabaseType;
  /** Env-configured trust roots — their presence means the node is
   *  already claimed and this route only ever answers 409. */
  envFounderKeys: readonly string[];
  /** The active setup code, or null when the node booted claimed
   *  (no code was generated or configured). */
  setupToken: string | null;
  /** Injectable clock for tests. */
  now?: () => number;
}

// Same loose shape bound config.ts applies to NODE_FOUNDER_KEYS:
// Ed25519 pubkeys are 44 base64 chars; the signature check is the
// real gate.
function plausibleKey(key: string): boolean {
  return key.length >= 40 && key.length <= 60;
}

function tokensMatch(presented: string, expected: string): boolean {
  const a = Buffer.from(presented, "utf8");
  const b = Buffer.from(expected, "utf8");
  // timingSafeEqual demands equal lengths; unequal lengths are an
  // honest mismatch (length itself is not a secret here — the code's
  // format is documented).
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function registerClaimFounderRoutes(
  app: FastifyInstance,
  deps: ClaimFounderDeps,
): Promise<void> {
  const now = deps.now ?? Date.now;
  const claimedCountStmt = deps.db.prepare(
    "SELECT COUNT(*) AS n FROM claimed_founders",
  );
  const insertStmt = deps.db.prepare(
    "INSERT INTO claimed_founders (founder_key, claimed_at) VALUES (?, ?)",
  );

  app.post("/claim-founder", async (req, reply) => {
    const body = req.body as Record<string, unknown> | null;
    const publicKey =
      body && typeof body.publicKey === "string" ? body.publicKey : null;
    const setupToken =
      body && typeof body.setupToken === "string" ? body.setupToken : null;
    const ts = body && typeof body.ts === "number" ? body.ts : null;
    const signature =
      body && typeof body.signature === "string" ? body.signature : null;
    if (!publicKey || !setupToken || ts === null || !signature) {
      reply.code(400);
      return {
        error: "invalid_body",
        reason: "publicKey, setupToken, ts, signature are required",
      };
    }
    if (!plausibleKey(publicKey)) {
      reply.code(400);
      return { error: "invalid_body", reason: "publicKey shape" };
    }

    const alreadyClaimed =
      deps.envFounderKeys.length > 0 ||
      (claimedCountStmt.get() as { n: number }).n > 0;
    if (alreadyClaimed) {
      reply.code(409);
      return { error: "already_claimed" };
    }

    // A claimed-at-boot node has no code; an unclaimed one always
    // does (generated or SETUP_TOKEN). Defensive null-check anyway.
    if (deps.setupToken === null || !tokensMatch(setupToken, deps.setupToken)) {
      reply.code(401);
      return { error: "bad_setup_token" };
    }

    if (Math.abs(now() - ts) > READ_AUTH_MAX_SKEW_MS) {
      reply.code(401);
      return { error: "stale_claim" };
    }
    if (
      !verify(
        canonicalFounderClaimMessage(publicKey, setupToken, ts),
        signature,
        publicKey,
      )
    ) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    insertStmt.run(publicKey, now());
    app.log.info(
      { founderKey: publicKey },
      "node claimed: founding member registered via setup code",
    );
    reply.code(201);
    return { claimed: true };
  });
}
