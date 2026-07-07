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
import type { DeviceLinkStore } from "../db.js";

/**
 * Node-relayed device linking — the ciphertext mailbox
 * (docs/device-pairing.md §6.6).
 *
 * The node is a dumb relay: it stores an opaque, passphrase-wrapped
 * TransferEnvelope under an opaque channel id, hands it out exactly
 * once, and deletes it. It cannot decrypt the blob (the key never
 * touches the wire), cannot cheaply reverse the channel id to the
 * link code (deriving a channel id costs the same PBKDF2-600k as
 * deriving the envelope key), and never federates these rows — they
 * exist for one node, for minutes.
 *
 * Deliberately unauthenticated: the fetching device is not a member
 * yet (that's the point). Abuse is bounded by the global rate limit,
 * the body cap, the envelope size cap here, the row ceiling, and the
 * TTL prune on every write.
 */

/** Server-authoritative mailbox lifetime. The client embeds the same
 *  window inside the encrypted payload (unwrap enforces it end-to-end);
 *  this bound is the operator-side guarantee that rows die even if
 *  clients lie. */
export const DEVICE_LINK_TTL_MS = 15 * 60_000;

/** Envelope size cap. The envelope now carries the community
 *  snapshot (lib/communitySnapshot.ts caps it at 320K chars of JSON
 *  before sealing + base64); 480 KB covers that with sealing and
 *  encoding overhead while keeping the mailbox useless as general
 *  blob storage. */
const MAX_ENVELOPE_CHARS = 480 * 1024;

/** Table row ceiling — a mailbox outlives its row for at most 15
 *  minutes; 64 concurrent transfers is beyond any realistic burst
 *  for a community node and caps worst-case disk at ~30 MB now that
 *  envelopes can be snapshot-sized. */
const MAX_LIVE_ROWS = 64;

const CHANNEL_ID_RE = /^[0-9a-f]{64}$/;

interface Deps {
  store: DeviceLinkStore;
  /** Injectable clock for tests. */
  now?: () => number;
}

/**
 * POST /device-link
 *   - Body: { channelId: 64 lowercase hex chars, envelope: string }
 *   - 201 — stored; expires DEVICE_LINK_TTL_MS from now (server clock)
 *   - 400 — malformed channel id / envelope missing or oversized
 *   - 409 — channel id already occupied (codes are random per
 *           attempt; a collision means replay — start over)
 *   - 507 — mailbox table at ceiling (operator-level backstop)
 *
 * GET /device-link/:channelId
 *   - 200 { envelope } — one-shot: the row is deleted atomically with
 *     the read, so a second GET (or a racing attacker) gets 404 and
 *     the member's own import visibly fails instead of silently
 *     duplicating.
 *   - 404 — absent, expired, or already taken. One error shape on
 *     purpose: distinguishing "never existed" from "expired" would
 *     hand an online guesser a confirmation oracle.
 */
export async function registerDeviceLinkRoutes(
  app: FastifyInstance,
  { store, now = () => Date.now() }: Deps,
): Promise<void> {
  // Per-route body override: the global 64 KB cap fits every signed
  // federation record but not a snapshot-bearing pairing envelope.
  app.post("/device-link", { bodyLimit: 640 * 1024 }, async (req, reply) => {
    const body = req.body as
      | { channelId?: unknown; envelope?: unknown }
      | null
      | undefined;
    const channelId = body?.channelId;
    const envelope = body?.envelope;
    if (typeof channelId !== "string" || !CHANNEL_ID_RE.test(channelId)) {
      reply.code(400);
      return { error: "invalid_channel_id" };
    }
    if (
      typeof envelope !== "string" ||
      envelope.length === 0 ||
      envelope.length > MAX_ENVELOPE_CHARS
    ) {
      reply.code(400);
      return { error: "invalid_envelope" };
    }

    const t = now();
    // Prune on every write: rows never outlive the TTL by more than
    // one quiet period, without needing a background timer.
    store.pruneExpired(t);

    if (store.count() >= MAX_LIVE_ROWS) {
      reply.code(507);
      return { error: "mailbox_full" };
    }

    try {
      store.insert({
        channelId,
        envelope,
        createdAt: t,
        expiresAt: t + DEVICE_LINK_TTL_MS,
      });
    } catch {
      // PRIMARY KEY violation — the only throwing path for a
      // validated row.
      reply.code(409);
      return { error: "channel_occupied" };
    }
    reply.code(201);
    return { ok: true, expiresAt: t + DEVICE_LINK_TTL_MS };
  });

  app.get("/device-link/:channelId", async (req, reply) => {
    const { channelId } = req.params as { channelId: string };
    if (!CHANNEL_ID_RE.test(channelId)) {
      reply.code(404);
      return { error: "not_found" };
    }
    const envelope = store.take(channelId, now());
    if (envelope === null) {
      reply.code(404);
      return { error: "not_found" };
    }
    return { envelope };
  });
}
