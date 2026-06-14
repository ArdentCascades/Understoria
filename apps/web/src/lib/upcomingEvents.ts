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
import type { Event, EventCancellation, EventRsvpRow } from "@/types";

// "Coming up" — the next few community events, for a quiet Dashboard
// glance that helps fun gatherings find people who weren't already
// looking at the calendar.
//
// Ethos: this is a DISCOVERY surface, not a leaderboard. It carries no
// attendance count and no ranking beyond chronological — just "what's
// soon." The only per-member signal is the VIEWER'S OWN "going" status
// (RSVPs are local-only and never federate), shown to them alone. The
// caller hides the section entirely when this returns empty, so an
// eventless community never sees an "add an event" nudge
// (solidarity-not-shame).

export interface UpcomingGathering {
  event: Event;
  /** The current viewer's own "going" status — never anyone else's. */
  viewerGoing: boolean;
}

export interface UpcomingGatheringsInput {
  events: readonly Event[];
  eventCancellations?: readonly EventCancellation[];
  eventRsvps?: readonly EventRsvpRow[];
  currentMemberKey?: string | null;
  now: number;
  /** Cap on how many to surface. Default 4 — a glance, not a list. */
  limit?: number;
}

export function selectUpcomingGatherings(
  input: UpcomingGatheringsInput,
): UpcomingGathering[] {
  const limit = input.limit ?? 4;
  const cancelled = new Set<string>();
  for (const c of input.eventCancellations ?? []) cancelled.add(c.eventId);

  const going = new Set<string>();
  if (input.currentMemberKey) {
    for (const r of input.eventRsvps ?? []) {
      if (r.memberKey === input.currentMemberKey && r.status === "going") {
        going.add(r.eventId);
      }
    }
  }

  return input.events
    .filter((e) => !cancelled.has(e.id))
    // Still upcoming or in progress — an event that has fully ended drops
    // off (end-of-event comparison keeps a running multi-day event).
    .filter((e) => (e.endsAt ?? e.startsAt) >= input.now)
    .slice()
    .sort((a, b) => a.startsAt - b.startsAt)
    .slice(0, limit)
    .map((event) => ({ event, viewerGoing: going.has(event.id) }));
}
