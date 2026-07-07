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
import { verifyEvent } from "@understoria/shared/crypto";
import type { EventStore } from "../db.js";
import { parseEvent } from "../validate.js";

interface Deps {
  store: EventStore;
}

/**
 * POST /events
 *   - Body: signed Event JSON.
 *   - Side effects: persist if novel and cryptographically valid.
 *   - Status codes:
 *       201 — accepted (new row inserted)
 *       200 — already had this row (idempotent re-submission)
 *       400 — malformed body
 *       422 — well-formed but signature doesn't verify
 *
 * GET /events
 *   - Query: ?since=<ms>&limit=<n>
 *   - Returns events with `createdAt > since`, ordered by `createdAt`
 *     ASC (cursor pagination — the worker advances on max(createdAt)),
 *     capped at `limit` (default 200, hard ceiling 1000).
 *
 * NB: RSVPs federate since participation Phase 2
 * (docs/project-federation.md §6) — the `/event-rsvps` route lives in
 * `participationStates.ts` as a single-owner LWW state record, a
 * deliberate reversal of the original local-only stance (recorded in
 * threat-model §7).
 */
export async function registerEventRoutes(
  app: FastifyInstance,
  { store }: Deps,
): Promise<void> {
  app.post("/events", async (req, reply) => {
    const parsed = parseEvent(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;

    if (!verifyEvent(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    if (store.has(record.id)) {
      reply.code(200);
      return { stored: false, id: record.id };
    }

    store.insert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  app.get<{ Querystring: { since?: string; sinceId?: string; limit?: string } }>(
    "/events",
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
      const events = store.list({
        since: safeSince,
        sinceId: safeSinceId,
        limit: safeLimit,
      });
      return { count: events.length, events };
    },
  );
}
