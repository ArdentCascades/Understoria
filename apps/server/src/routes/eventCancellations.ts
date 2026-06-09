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
import { verifyEventCancellation } from "@understoria/shared/crypto";
import type { EventCancellationStore, EventStore } from "../db.js";
import { parseEventCancellation } from "../validate.js";

interface Deps {
  store: EventCancellationStore;
  eventStore: EventStore;
}

/**
 * POST /event-cancellations
 *   - Body: signed EventCancellation JSON.
 *   - Side effects: persist if novel and cryptographically valid.
 *   - Status codes:
 *       201 — accepted (new row inserted)
 *       200 — already had a cancellation for this id or for this
 *             eventId (idempotent re-submission; first-write-wins
 *             per design doc §11)
 *       400 — malformed body
 *       403 — cross-record consistency violation: the cancellation's
 *             `createdBy` does not match the referenced event's
 *             `createdBy` (only enforced when we already have the
 *             event locally; if the event hasn't federated yet we
 *             accept-and-reconcile, matching the co-org pattern's
 *             "revocation before invitation arrives" posture; see
 *             docs/community-events.md §7)
 *       422 — well-formed but signature doesn't verify
 *
 * GET /event-cancellations
 *   - Query: ?since=<ms>&limit=<n>
 *   - Returns cancellations with `cancelledAt > since`, ordered ASC
 *     (cursor pagination — worker advances on max(cancelledAt)),
 *     capped at `limit` (default 200, hard ceiling 1000).
 */
export async function registerEventCancellationRoutes(
  app: FastifyInstance,
  { store, eventStore }: Deps,
): Promise<void> {
  app.post("/event-cancellations", async (req, reply) => {
    const parsed = parseEventCancellation(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;

    if (!verifyEventCancellation(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    // Cross-record consistency check. Only enforced when the cancelled
    // event is already in our local store; if the cancellation
    // federates ahead of the event (peer-pull ordering is per-kind, so
    // this is a real case) we accept-and-reconcile — the application
    // layer reconciles when the event arrives. Same posture as the
    // co-org revoke pattern; see docs/community-events.md §7.
    const localEvent = eventStore.get(record.eventId);
    if (localEvent !== null && localEvent.createdBy !== record.createdBy) {
      reply.code(403);
      return { error: "organizer_mismatch" };
    }

    // Idempotency, two flavors:
    // 1) Same row id already stored — straightforward re-POST.
    if (store.has(record.id)) {
      reply.code(200);
      return { stored: false, id: record.id };
    }
    // 2) Different row, same eventId — first-write-wins. Return the
    //    existing cancellation row so callers can see what stuck
    //    without overwriting it.
    const existingForEvent = store.getByEventId(record.eventId);
    if (existingForEvent !== null) {
      reply.code(200);
      return {
        stored: false,
        id: existingForEvent.id,
        firstWriteWins: true,
      };
    }

    store.insert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  app.get<{ Querystring: { since?: string; limit?: string } }>(
    "/event-cancellations",
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
      const eventCancellations = store.list({
        since: safeSince,
        limit: safeLimit,
      });
      return {
        count: eventCancellations.length,
        eventCancellations,
      };
    },
  );
}
