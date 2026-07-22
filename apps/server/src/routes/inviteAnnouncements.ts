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
  parseInviteAnnouncement,
  verifyInviteAnnouncement,
} from "@understoria/shared/crypto";
import type { InviteAnnouncementStore } from "../db.js";
import type { TrustResolver } from "../trustGate.js";

interface Deps {
  store: InviteAnnouncementStore;
  now?: () => number;
  /**
   * Founder-rooted trust gate (trustGate.ts): only a TRUSTED member
   * may announce an invite — same rule and same 403 posture as the
   * /redemptions gate on the receipt's inviter (an announcement is
   * the issue-time half of the same invite). Optional so existing
   * tests/callers keep the old behavior; a founderless node skips
   * via `founderlessSkip`. No mirror exemption needed: this surface
   * is PWA↔node only and not mirror-replicated.
   */
  trust?: TrustResolver;
}

/**
 * Invite announcements (operator ruling, 2026-07: "when someone sends
 * an invite, that device sends what the invitee will need to the
 * server"). The inviter's device POSTs a signed announcement the
 * moment the invite is issued, so the invite exists somewhere other
 * than one phone; the redemptions route flips the row to `redeemed`
 * when the invitee's receipt lands, giving every member's device a
 * server-side answer to "was my invite used?".
 *
 * DELIBERATELY credential-free. The schema-v11 removal of the
 * original `/invites` surface established that a node must never
 * store a live invite token (a redeemable credential a compromised
 * node could play); that surface stays removed and its negative-space
 * tests stay green. This record carries `inviteTokenHash(token)` —
 * the node can RECOGNIZE the invite when its redemption receipt
 * arrives, and nothing else. The receipt's embedded, inviter-signed
 * invite remains the membership authority: an unannounced invite
 * (issued offline, or pre-v29) still redeems fine.
 *
 * POST /invite-announcements
 *   - Body: one signed InviteAnnouncement.
 *   - 201 — verified and novel (stored, stamping receivedAt)
 *   - 200 — idempotent replay: same tokenHash, same inviterKey
 *   - 400 — malformed body
 *   - 403 — inviterKey is not in the founder-rooted trusted set
 *           (`inviter_not_trusted`, see Deps.trust)
 *   - 409 — tokenHash already announced by a DIFFERENT inviterKey
 *           (poison for the outbox — retrying never succeeds)
 *   - 422 — signature does not verify
 *   Member-gated like every attributable POST (readAuth.ts write
 *   guard keys on `inviterKey` via the SURFACES map).
 *
 * GET /invite-announcements
 *   - Query: ?since=<ms>&sinceId=<tokenHash>&limit=<n>. Same composite
 *     cursor as the sibling feeds; cursor is the server-assigned
 *     `receivedAt`. Each row carries status/redeemedBy/redeemedAt.
 *   Member-authenticated read like every other feed.
 *
 * PWA↔node only — no peer-replication leg (invites never cross
 * communities).
 */
export async function registerInviteAnnouncementRoutes(
  app: FastifyInstance,
  { store, now = () => Date.now(), trust }: Deps,
): Promise<void> {
  app.post("/invite-announcements", async (req, reply) => {
    const parsed = parseInviteAnnouncement(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const announcement = parsed.value;

    if (!verifyInviteAnnouncement(announcement)) {
      reply.code(422);
      return { error: "invalid_announcement" };
    }

    const existing = store.getByTokenHash(announcement.tokenHash);
    if (existing !== null) {
      if (existing.announcement.inviterKey === announcement.inviterKey) {
        reply.code(200);
        return { stored: false, tokenHash: announcement.tokenHash };
      }
      reply.code(409);
      return { error: "token_already_announced" };
    }

    // Founder-rooted trust gate — NEW announcements only (replays of
    // stored rows stay idempotent-200 above). Same error key as the
    // /redemptions gate: both refuse the same act, an untrusted
    // member issuing invites.
    if (
      trust &&
      !trust.founderlessSkip() &&
      !trust.isTrusted(announcement.inviterKey)
    ) {
      reply.code(403);
      return { error: "inviter_not_trusted" };
    }

    store.insert(announcement, now());
    reply.code(201);
    return { stored: true, tokenHash: announcement.tokenHash };
  });

  app.get<{ Querystring: { since?: string; sinceId?: string; limit?: string } }>(
    "/invite-announcements",
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
      const safeSinceId =
        req.query.sinceId && req.query.sinceId.length > 0
          ? req.query.sinceId
          : undefined;
      const rows = store.list({
        since: safeSince,
        sinceId: safeSinceId,
        limit: safeLimit,
      });
      return {
        count: rows.length,
        inviteAnnouncements: rows.map((row) => ({
          ...row.announcement,
          status: row.status,
          redeemedBy: row.redeemedBy,
          redeemedAt: row.redeemedAt,
          receivedAt: row.receivedAt,
        })),
      };
    },
  );
}
