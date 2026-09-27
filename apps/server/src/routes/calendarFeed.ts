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
import { createHash, timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type {
  Event,
  EventSyndicationConsent,
} from "@understoria/shared/types";
import { buildVEventLines, joinIcsLines } from "@understoria/shared/ics";

/*
 * The organizer-consented public calendar feed — docs/calendar.md
 * §10.6, the deliberate, documented supersession of §10.5's iCal
 * rejection for exactly this narrowed shape. Three consents stack
 * before a single byte leaves:
 *
 *   1. The OPERATOR set `CALENDAR_FEED_TOKEN` (community-level).
 *      Unset — the default — means this route answers 404 for every
 *      path, indistinguishable from a node without the feature.
 *   2. The ORGANIZER signed an `EventSyndicationConsent` with
 *      `allow: true` for the specific event (per-event). Absence or
 *      retraction keeps the event out of the feed; a retraction
 *      takes effect on each subscriber's next poll.
 *   3. Each SUBSCRIBER pointed their own calendar app at the link
 *      (per-device) — nothing is ever pushed.
 *
 * What the feed serves and refuses, structurally:
 *
 *   - LOCAL-origin events only (`node_id` = this node): the
 *     organizer consented to the link of the community they posted
 *     in, not to every peer's feed. (Honesty note in the threat
 *     model: consent gates what honest software does — a hostile
 *     peer could republish any federated event regardless.)
 *   - Only upcoming events (still-running through +90 days): the
 *     feed is a notice board, never a public archive of the
 *     community's past.
 *   - Only title, times, location, description — the same four
 *     fields as the §11.5a single-event export. Never RSVPs, never
 *     any member identity, no VALARM (the shared VEVENT shape
 *     cannot express them).
 *   - A cancelled event stays in the feed as STATUS:CANCELLED until
 *     it ages out, so subscribers see the cancellation instead of a
 *     silently lingering copy.
 *
 * The capability token is the whole auth story (calendar apps cannot
 * sign read-auth headers): compared in constant time, wrong answers
 * the same 404 as disabled, and rotating the env value revokes every
 * previously shared link. DTSTAMP uses per-row LWW clocks (not
 * "now") so an unchanged feed renders byte-identical — the ETag then
 * turns vendor polling into 304s.
 */

/** How far ahead the feed looks. Beyond ~a quarter, a public feed
 *  stops being a notice board and starts being a planning archive. */
const FEED_WINDOW_AHEAD_MS = 90 * 24 * 60 * 60 * 1000;

interface Deps {
  db: DatabaseType;
  /** This node's own id — the feed is local-origin only. */
  nodeId: string;
  /** `config.calendarFeedToken`; null = the feed does not exist. */
  token: string | null;
  now?: () => number;
}

interface FeedRow {
  event_payload: string;
  consent_payload: string;
  cancelled: number | null;
}

/** Constant-time equality over unequal-length secrets: compare
 *  digests, which are always the same length. */
function tokenMatches(provided: string, configured: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(configured).digest();
  return timingSafeEqual(a, b);
}

export async function registerCalendarFeedRoutes(
  app: FastifyInstance,
  deps: Deps,
): Promise<void> {
  const now = deps.now ?? Date.now;
  const rowsStmt = deps.db.prepare(`
    SELECT e.payload AS event_payload,
           c.payload AS consent_payload,
           (SELECT 1 FROM event_cancellations ec
              WHERE ec.event_id = e.id) AS cancelled
    FROM events e
    JOIN event_syndication_consents c ON c.event_id = e.id
    WHERE e.node_id = @nodeId
      AND COALESCE(e.ends_at, e.starts_at) >= @from
      AND e.starts_at <= @to
    ORDER BY e.starts_at ASC, e.id ASC
  `);

  app.get<{ Params: { token: string } }>(
    "/calendar/:token",
    async (req, reply) => {
      // Disabled, wrong token, and a path without the .ics suffix all
      // answer the identical bare 404 — an outsider probing the route
      // learns nothing, not even that the feature exists.
      const param = req.params.token;
      if (
        deps.token === null ||
        !param.endsWith(".ics") ||
        !tokenMatches(param.slice(0, -".ics".length), deps.token)
      ) {
        reply.code(404);
        return { error: "not_found" };
      }

      const at = now();
      const rows = rowsStmt.all({
        nodeId: deps.nodeId,
        from: at,
        to: at + FEED_WINDOW_AHEAD_MS,
      }) as FeedRow[];

      const lines: string[] = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Understoria//Community Calendar//EN",
      ];
      for (const row of rows) {
        const event = JSON.parse(row.event_payload) as Event;
        const consent = JSON.parse(
          row.consent_payload,
        ) as EventSyndicationConsent;
        // allow:false retractions live in the same table (they must
        // keep winning LWW); the feed serves only affirmative
        // consents — and re-checks the referent rule the ingest
        // route already enforced, as defense in depth.
        if (!consent.allow) continue;
        if (consent.signerKey !== event.createdBy) continue;
        lines.push(
          ...buildVEventLines({
            uid: `${event.id}@${event.nodeId}`,
            // Per-row LWW clock, NOT now(): keeps the rendered body
            // byte-stable between polls so the ETag can 304.
            stampMs: Math.max(consent.updatedAt, event.createdAt),
            startsAtMs: event.startsAt,
            endsAtMs: event.endsAt,
            summary: event.title,
            location: event.location,
            description: event.description,
            status: row.cancelled ? "CANCELLED" : undefined,
          }),
        );
      }
      lines.push("END:VCALENDAR");
      const body = joinIcsLines(lines);

      const etag = `"${createHash("sha256").update(body).digest("base64url")}"`;
      reply.header("etag", etag);
      // Vendors poll on their own schedule; five minutes of caching
      // keeps a hot poller cheap without making retraction slower
      // than the polling already is.
      reply.header("cache-control", "max-age=300");
      const inm = req.headers["if-none-match"];
      if (typeof inm === "string" && inm.replace(/^W\//, "") === etag) {
        reply.code(304);
        return null;
      }
      reply.header("content-type", "text/calendar; charset=utf-8");
      return body;
    },
  );
}
