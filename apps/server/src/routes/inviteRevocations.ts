/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { FastifyInstance } from "fastify";
import {
  parseInviteRevocation,
  verifyInviteRevocation,
} from "@understoria/shared/crypto";
import type { InviteRevocationStore } from "../db.js";
import { MIRROR_INTERNAL_HEADER } from "../mirrorPull.js";

interface Deps {
  store: InviteRevocationStore;
  now?: () => number;
  /**
   * `BuiltServer.internalBypassToken` — marks the mirror-pull worker's
   * self-injected replication POSTs (docs/community-resilience.md
   * §B.1). Only effect here: the wire row's `receivedAt` is preserved
   * (when plausible) instead of re-stamped, because `receivedAt` is
   * this feed's cursor and the revocation should keep one identity
   * across the whole mirror set. Verification and first-writer-wins
   * are untouched. See routes/redemptions.ts for the fuller story.
   */
  internalToken?: string;
}

/**
 * POST /invite-revocations
 *   - Body: one signed InviteRevocation (docs/invite-revocation.md §3).
 *   - 201 — verified and novel (stored, stamping receivedAt)
 *   - 200 — idempotent replay: same token, same inviterKey
 *   - 400 — malformed body
 *   - 409 — token already revoked by a DIFFERENT inviterKey (a third
 *           party cannot claim an already-revoked token; poison for
 *           the outbox — retrying never succeeds)
 *   - 422 — signature does not verify
 *
 * The server stores any validly-signed revocation first-writer-wins by
 * token. It does NOT authority-bind against the redeemed invite — that
 * check (matching the redemption receipt's embedded, inviter-signed
 * invite) lives at the client merge (§3.1), which is where trust is
 * computed. An unauthoritative revocation is inert until a matching
 * redemption exists, and the client refuses to apply it if the keys
 * don't match.
 *
 * GET /invite-revocations
 *   - Query: ?since=<ms>&limit=<n>. Same shape/cursor as /redemptions:
 *     the cursor is the server-assigned `receivedAt`, inclusive, with a
 *     token tiebreak. Each row carries its `receivedAt`.
 *
 * Like /redemptions, this is PWA↔node only — no peer-replication leg.
 */
export async function registerInviteRevocationRoutes(
  app: FastifyInstance,
  { store, now = () => Date.now(), internalToken }: Deps,
): Promise<void> {
  app.post("/invite-revocations", async (req, reply) => {
    const isMirrorApply =
      internalToken !== undefined &&
      req.headers[MIRROR_INTERNAL_HEADER] === internalToken;
    const parsed = parseInviteRevocation(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const revocation = parsed.value;

    if (!verifyInviteRevocation(revocation)) {
      reply.code(422);
      return { error: "invalid_revocation" };
    }

    const existing = store.getByToken(revocation.token);
    if (existing !== null) {
      if (existing.revocation.inviterKey === revocation.inviterKey) {
        reply.code(200);
        return { stored: false, token: revocation.token };
      }
      reply.code(409);
      return { error: "token_already_revoked" };
    }

    const wireReceivedAt = (req.body as Record<string, unknown>)?.receivedAt;
    const receivedAt =
      isMirrorApply &&
      typeof wireReceivedAt === "number" &&
      Number.isInteger(wireReceivedAt) &&
      wireReceivedAt > 0 &&
      wireReceivedAt <= now() + 24 * 60 * 60 * 1000
        ? wireReceivedAt
        : now();
    store.insert(revocation, receivedAt);
    reply.code(201);
    return { stored: true, token: revocation.token };
  });

  app.get<{ Querystring: { since?: string; sinceId?: string; limit?: string } }>(
    "/invite-revocations",
    async (req) => {
      const since = req.query.since
        ? Number.parseInt(req.query.since, 10)
        : undefined;
      const limit = req.query.limit
        ? Number.parseInt(req.query.limit, 10)
        : undefined;
      const safeSince =
        since !== undefined && Number.isFinite(since) && since >= 0
          ? since
          : undefined;
      const safeLimit =
        limit !== undefined && Number.isFinite(limit) && limit > 0
          ? limit
          : undefined;
      // Composite pair cursor (docs/composite-federation-cursors.md §2):
      // strictly-after-(since,sinceId) paging when both are present;
      // ignored without `since`, so it degrades to the legacy cursor.
      const safeSinceId =
        req.query.sinceId && req.query.sinceId.length > 0
          ? req.query.sinceId
          : undefined;
      const rows = store.list({ since: safeSince, sinceId: safeSinceId, limit: safeLimit });
      return {
        count: rows.length,
        inviteRevocations: rows.map((row) => ({
          ...row.revocation,
          receivedAt: row.receivedAt,
        })),
      };
    },
  );
}
