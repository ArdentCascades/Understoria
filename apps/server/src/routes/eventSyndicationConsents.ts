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
import { verifyEventSyndicationConsent } from "@understoria/shared/crypto";
import type {
  EventSyndicationConsentStore,
  EventStore,
} from "../db.js";
import { parseEventSyndicationConsent } from "../validate.js";

interface Deps {
  store: EventSyndicationConsentStore;
  eventStore: EventStore;
}

/**
 * Event syndication consents (docs/calendar.md §10.6 — the
 * organizer-consented calendar feed): an organizer's per-event "this
 * event may appear on the public community calendar feed" flag.
 * Default OFF for every event — absence of a record keeps the event
 * out of the feed entirely. The record carries a boolean only; the
 * fields the feed serves (title, times, location, description) are
 * read from the already public, already signed event at render time.
 *
 * Single-owner LWW keyed by eventId. Authority derives from the
 * EVENT, which is immutable and organizer-signed — exactly the
 * event-shift rule: the only legitimate signer is the stored
 * event's createdBy, and a consent for an event this node doesn't
 * hold yet is a retryable 409 (mirror pullers halt and retry after
 * the event lands). Retraction is allow:false — it must keep
 * winning LWW over stale allowing copies, so it is a state, not a
 * delete.
 */
export async function registerEventSyndicationConsentRoutes(
  app: FastifyInstance,
  { store, eventStore }: Deps,
): Promise<void> {
  app.post("/event-syndication-consents", async (req, reply) => {
    const parsed = parseEventSyndicationConsent(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;

    if (!verifyEventSyndicationConsent(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }
    const event = eventStore.get(record.eventId);
    if (!event) {
      reply.code(409);
      return { error: "unknown_event", eventId: record.eventId };
    }
    if (record.signerKey !== event.createdBy) {
      reply.code(403);
      return { error: "not_authorized", reason: "not_event_organizer" };
    }

    const stored = store.get(record.eventId);
    if (stored && record.updatedAt <= stored.updatedAt) {
      reply.code(200);
      return { stored: false, id: record.id };
    }

    store.upsert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/event-syndication-consents", async (req) => {
    const q = req.query;
    const since = q.since ? Number.parseInt(q.since, 10) : undefined;
    const limit = q.limit ? Number.parseInt(q.limit, 10) : undefined;
    const eventSyndicationConsents = store.list({
      since:
        since !== undefined && Number.isFinite(since) && since >= 0
          ? since
          : undefined,
      sinceId: q.sinceId && q.sinceId.length > 0 ? q.sinceId : undefined,
      limit:
        limit !== undefined && Number.isFinite(limit) && limit > 0
          ? limit
          : undefined,
    });
    return {
      count: eventSyndicationConsents.length,
      eventSyndicationConsents,
    };
  });
}
