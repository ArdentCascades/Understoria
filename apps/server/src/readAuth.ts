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
import type { FastifyInstance } from "fastify";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  canonicalReadAuthMessage,
  verify,
} from "@understoria/shared/crypto";

/**
 * Member-authenticated reads — docs/member-authenticated-reads.md.
 *
 * Joining the community is invite-gated; until this module, READING
 * it was not: every federation GET feed answered anyone who knew the
 * URL. This guard closes that gap without creating any new membership
 * register — it derives "who is a member" from artifacts the node
 * already stores and verifies:
 *
 *   member set = NODE_FOUNDER_KEYS
 *              ∪ transitive closure over verified redemption receipts
 *                (inviter must already be a member for the receipt to
 *                 admit its redeemer — two invented keys attesting
 *                 each other reach nothing)
 *
 * Reads carry `x-understoria-key` / `-ts` / `-sig` headers signing
 * `canonicalReadAuthMessage(path+query, ts)`; the timestamp must be
 * within ±10 minutes (a replay bound — reads are idempotent, so a
 * nonce scheme buys nothing further). Peer nodes authenticate with a
 * shared bearer token from PEER_READ_TOKENS instead.
 *
 * Known bound, stated plainly: membership is append-only — the app
 * has no expulsion record kind, so read access, once earned, is not
 * revocable here. Threat-model §7 records this.
 */

/** Clock skew + capture window for a signed read. */
export const READ_AUTH_MAX_SKEW_MS = 10 * 60 * 1000;

/**
 * Surfaces that stay OPEN under enforcement, each self-limiting:
 *  - /health: liveness + the origin-suggest probe.
 *  - /config: operator transparency + system-key discovery — needed
 *    BEFORE membership is provable (a fresh invitee configures the
 *    node from here).
 *  - /device-link, /link-request: a brand-new device has no identity
 *    yet; those surfaces authenticate by unguessable ids/ciphertext
 *    and carry their own TTLs and caps (docs/device-pairing.md §6).
 */
const OPEN_PATH_PREFIXES = ["/health", "/config", "/device-link", "/link-request"];

export interface MembershipResolver {
  isMember(publicKey: string): boolean;
  /** Test/inspection hook: the current member count (forces a build). */
  memberCount(): number;
}

/**
 * Membership from founder roots + the redemption-receipt chain. The
 * closure is cached and rebuilt only when the redemptions table has
 * grown since the last build, so a brand-new member is recognized on
 * their first read after their receipt lands — the receipt is the one
 * record the outbox pushes even before a node URL is confirmed,
 * precisely so proof-of-joining precedes everything else.
 */
export function createMembershipResolver(
  db: DatabaseType,
  founderKeys: readonly string[],
): MembershipResolver {
  const edgesStmt = db.prepare(
    "SELECT inviter_key, redeemed_by FROM redemptions",
  );
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM redemptions");

  let cache: Set<string> | null = null;
  let cachedAtCount = -1;

  function build(): Set<string> {
    const members = new Set<string>(founderKeys);
    const rows = edgesStmt.all() as {
      inviter_key: string;
      redeemed_by: string;
    }[];
    // BFS over invite edges. Receipts were signature-verified at
    // ingestion (route + verifyRedemptionReceipt), so each row is a
    // cryptographic attestation "inviter admitted redeemer"; rooting
    // at the founders is what makes it a membership proof rather
    // than a self-serve list.
    let grew = true;
    while (grew) {
      grew = false;
      for (const row of rows) {
        if (members.has(row.inviter_key) && !members.has(row.redeemed_by)) {
          members.add(row.redeemed_by);
          grew = true;
        }
      }
    }
    return members;
  }

  function current(): Set<string> {
    const n = (countStmt.get() as { n: number }).n;
    if (cache === null || n !== cachedAtCount) {
      cache = build();
      cachedAtCount = n;
    }
    return cache;
  }

  return {
    isMember(publicKey) {
      return current().has(publicKey);
    },
    memberCount() {
      return current().size;
    },
  };
}

export interface ReadAuthDeps {
  readAuth: "off" | "on";
  resolver: MembershipResolver;
  /** Accepted peer bearer tokens (values of PEER_READ_TOKENS). */
  peerTokens: readonly string[];
  /** Injectable clock for tests. */
  now?: () => number;
}

export function registerReadAuthGuard(
  app: FastifyInstance,
  deps: ReadAuthDeps,
): void {
  if (deps.readAuth !== "on") return;
  const now = deps.now ?? Date.now;
  const peerTokens = new Set(deps.peerTokens);

  // Deny-by-default over GETs: a future feed route is covered the day
  // it's registered, instead of depending on someone remembering to
  // add it to a protected-paths list.
  app.addHook("onRequest", async (req, reply) => {
    if (req.method !== "GET") return;
    const path = req.url.split("?")[0];
    if (OPEN_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
      return;
    }

    // Peer nodes: shared bearer token (docs/member-authenticated-reads.md §1).
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      if (peerTokens.has(authHeader.slice("Bearer ".length))) return;
      reply.code(401);
      return reply.send({ error: "member_read_required" });
    }

    const key = req.headers["x-understoria-key"];
    const tsRaw = req.headers["x-understoria-ts"];
    const sig = req.headers["x-understoria-sig"];
    if (
      typeof key !== "string" ||
      typeof tsRaw !== "string" ||
      typeof sig !== "string"
    ) {
      reply.code(401);
      return reply.send({ error: "member_read_required" });
    }
    const ts = Number.parseInt(tsRaw, 10);
    if (
      !Number.isFinite(ts) ||
      Math.abs(now() - ts) > READ_AUTH_MAX_SKEW_MS
    ) {
      reply.code(401);
      return reply.send({ error: "stale_read_signature" });
    }
    // The signed message covers path AND query (req.url), so a
    // captured header can't be replayed against a different cursor.
    if (!verify(canonicalReadAuthMessage(req.url, ts), sig, key)) {
      reply.code(401);
      return reply.send({ error: "bad_read_signature" });
    }
    if (!deps.resolver.isMember(key)) {
      reply.code(403);
      return reply.send({ error: "not_a_member" });
    }
  });
}
