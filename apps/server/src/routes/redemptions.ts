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
  parseRedemption,
  verifyRedemptionReceipt,
} from "@understoria/shared/crypto";
import type { RedemptionStore } from "../db.js";
import { MIRROR_INTERNAL_HEADER } from "../mirrorPull.js";

interface Deps {
  store: RedemptionStore;
  /** Injectable clock for deterministic grace-window tests. */
  now?: () => number;
  /**
   * `BuiltServer.internalBypassToken`. A POST carrying it in
   * `x-understoria-internal` is the mirror-pull worker replicating a
   * receipt ANOTHER node already accepted (docs/community-resilience.md
   * §B.1). Two things relax for that caller and nothing else:
   *   - The delivery-grace check is skipped — it bounds how stale a
   *     NEW play can arrive; a receipt the community accepted long ago
   *     must still replicate to a brand-new mirror, or the mirror's
   *     membership closure (docs/member-authenticated-reads.md) would
   *     be missing members forever.
   *   - The wire row's `receivedAt` is preserved (when plausible)
   *     instead of re-stamped — `receivedAt` IS this feed's cursor, so
   *     keeping the origin stamp gives the receipt one identity across
   *     the whole mirror set instead of shuffling per node.
   * Signature verification and first-writer-wins are NOT relaxed. The
   * token never leaves the process, so no external caller can claim
   * this path.
   */
  internalToken?: string;
}

/**
 * Delivery-grace window on `receivedAt` — `docs/invite-redemption.md`
 * §7 / §15 ruling 3 (default confirmed by the operator): a receipt
 * may arrive up to this long AFTER the embedded invite expired and
 * still be accepted. Covers "redeemed offline on day 13, node
 * configured on day 18" without leaving expired-but-unredeemed
 * invites redeemable forever via back-dated `redeemedAt` (§11 — the
 * play stays signed and attributable; this bound caps how stale it
 * can be).
 */
export const REDEMPTION_DELIVERY_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * POST /redemptions
 *   - Body: one signed RedemptionReceipt JSON (design note §6 — the
 *     new member's signature over a payload embedding the inviter's
 *     original SignedInvite verbatim).
 *   - Side effects: persist if novel and cryptographically valid,
 *     stamping the server-assigned `receivedAt` cursor.
 *   - Status codes (design note §7):
 *       201 — verified and novel (stored)
 *       200 — idempotent replay: same token, same redeemedBy
 *       400 — malformed body
 *       409 — token already redeemed by a DIFFERENT redeemedBy
 *             (first-writer-wins: the server-side single-use
 *             enforcement the local-only design never had), or the
 *             receipt arrived later than invite.expiresAt plus the
 *             delivery-grace window
 *       422 — either signature fails, self-redeem, or a redeemedAt
 *             past the invite's expiry (all folded into the shared
 *             verifier so the PWA pull applies the identical checks)
 *     The 409 is a poison status for the PWA outbox — retrying a
 *     lost race will never succeed, and the poisoned row surfacing
 *     in the UI is exactly how the losing member learns her link was
 *     redeemed twice (a stolen-link tell).
 *
 * GET /redemptions
 *   - Query: ?since=<ms>&limit=<n>
 *   - Returns receipts with `receivedAt >= since` (INCLUSIVE, token
 *     tiebreak — a shared-millisecond row at a page boundary must be
 *     re-served, not skipped; pullers dedup by token), ASCENDING,
 *     capped at `limit` (default 200, hard ceiling 1000). Deviation from
 *     the sibling routes, named deliberately (§7): the cursor is the
 *     server-assigned `receivedAt`, not the client-claimed
 *     `redeemedAt` — a skewed or back-dated device clock must never
 *     strand a receipt below an inviter's cursor forever. Each row
 *     carries its `receivedAt` so clients can advance on it.
 *
 * NOTE: this route pair REPLACES the removed `POST/GET /invites`
 * surface (§8 / §10.1) — open invites never cross any wire; only
 * consummated redemptions do. And there is deliberately no
 * peer-replication leg for receipts: the roster stays off the
 * inter-node wire.
 */
export async function registerRedemptionRoutes(
  app: FastifyInstance,
  { store, now = () => Date.now(), internalToken }: Deps,
): Promise<void> {
  app.post("/redemptions", async (req, reply) => {
    const isMirrorApply =
      internalToken !== undefined &&
      req.headers[MIRROR_INTERNAL_HEADER] === internalToken;
    const parsed = parseRedemption(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const receipt = parsed.value;

    // Both signatures + self-redeem + redeemedAt-vs-expiry — the
    // exact checks the PWA pull runs (shared verifier, §6).
    if (!verifyRedemptionReceipt(receipt)) {
      reply.code(422);
      return { error: "invalid_receipt" };
    }

    // First-writer-wins on the token BEFORE the grace check: an
    // idempotent replay of an already-stored receipt must stay 200
    // even if it arrives after the grace window has lapsed.
    const existing = store.getByToken(receipt.invite.token);
    if (existing !== null) {
      if (existing.receipt.redeemedBy === receipt.redeemedBy) {
        reply.code(200);
        return { stored: false, token: receipt.invite.token };
      }
      reply.code(409);
      return { error: "token_already_redeemed" };
    }

    // Delivery grace: bound on ARRIVAL time (server clock), not on
    // the client-claimed redeemedAt — §11's cap on how stale a
    // back-dated play can be. Mirror replication (see Deps) skips the
    // bound and keeps the origin node's arrival stamp when the wire
    // row carries a plausible one.
    const wireReceivedAt = (req.body as Record<string, unknown>)?.receivedAt;
    const receivedAt =
      isMirrorApply &&
      typeof wireReceivedAt === "number" &&
      Number.isInteger(wireReceivedAt) &&
      wireReceivedAt > 0 &&
      wireReceivedAt <= now() + 24 * 60 * 60 * 1000
        ? wireReceivedAt
        : now();
    if (
      !isMirrorApply &&
      receivedAt > receipt.invite.expiresAt + REDEMPTION_DELIVERY_GRACE_MS
    ) {
      reply.code(409);
      return { error: "delivery_grace_expired" };
    }

    store.insert(receipt, receivedAt);
    reply.code(201);
    return { stored: true, token: receipt.invite.token };
  });

  app.get<{ Querystring: { since?: string; sinceId?: string; limit?: string } }>(
    "/redemptions",
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
        redemptions: rows.map((row) => ({
          ...row.receipt,
          receivedAt: row.receivedAt,
        })),
      };
    },
  );
}
