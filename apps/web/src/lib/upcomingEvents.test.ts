/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { selectUpcomingGatherings } from "./upcomingEvents";
import type { Event, EventRsvpRow } from "@/types";

const NOW = 1_000_000;
const HOUR = 60 * 60 * 1000;

function event(over: Partial<Event> & { id: string; startsAt: number }): Event {
  return {
    kind: "event",
    title: `Event ${over.id}`,
    description: "",
    category: "social",
    endsAt: null,
    location: "the bench",
    capacity: null,
    templateId: null,
    createdAt: 0,
    createdBy: "organizer",
    nodeId: "node-1",
    signature: "sig",
    ...over,
  };
}

function rsvp(
  eventId: string,
  memberKey: string,
  status: EventRsvpRow["status"],
): EventRsvpRow {
  return { id: `r-${eventId}-${memberKey}`, eventId, memberKey, status, respondedAt: 1 };
}

describe("selectUpcomingGatherings", () => {
  it("returns upcoming events soonest-first, capped at the limit", () => {
    const result = selectUpcomingGatherings({
      events: [
        event({ id: "c", startsAt: NOW + 3 * HOUR }),
        event({ id: "a", startsAt: NOW + 1 * HOUR }),
        event({ id: "b", startsAt: NOW + 2 * HOUR }),
        event({ id: "d", startsAt: NOW + 4 * HOUR }),
        event({ id: "e", startsAt: NOW + 5 * HOUR }),
      ],
      now: NOW,
      limit: 4,
    });
    expect(result.map((g) => g.event.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("drops events that have fully ended but keeps an in-progress one", () => {
    const result = selectUpcomingGatherings({
      events: [
        event({ id: "ended", startsAt: NOW - 5 * HOUR, endsAt: NOW - 1 * HOUR }),
        event({ id: "ongoing", startsAt: NOW - 1 * HOUR, endsAt: NOW + 1 * HOUR }),
        event({ id: "future", startsAt: NOW + 2 * HOUR }),
      ],
      now: NOW,
    });
    expect(result.map((g) => g.event.id)).toEqual(["ongoing", "future"]);
  });

  it("excludes cancelled events", () => {
    const result = selectUpcomingGatherings({
      events: [
        event({ id: "live", startsAt: NOW + 1 * HOUR }),
        event({ id: "cancelled", startsAt: NOW + 2 * HOUR }),
      ],
      eventCancellations: [
        {
          id: "c1",
          kind: "event_cancellation",
          eventId: "cancelled",
          reason: "",
          cancelledAt: NOW,
          createdBy: "organizer",
          nodeId: "node-1",
          signature: "s",
        },
      ],
      now: NOW,
    });
    expect(result.map((g) => g.event.id)).toEqual(["live"]);
  });

  it("marks the viewer's own 'going' only — never another member's, never 'maybe'", () => {
    const result = selectUpcomingGatherings({
      events: [
        event({ id: "going", startsAt: NOW + 1 * HOUR }),
        event({ id: "maybe", startsAt: NOW + 2 * HOUR }),
        event({ id: "theirs", startsAt: NOW + 3 * HOUR }),
      ],
      eventRsvps: [
        rsvp("going", "me", "going"),
        rsvp("maybe", "me", "maybe"),
        rsvp("theirs", "other", "going"),
      ],
      currentMemberKey: "me",
      now: NOW,
    });
    const byId = new Map(result.map((g) => [g.event.id, g.viewerGoing]));
    expect(byId.get("going")).toBe(true);
    expect(byId.get("maybe")).toBe(false);
    expect(byId.get("theirs")).toBe(false);
  });

  it("marks nothing when there's no current viewer", () => {
    const result = selectUpcomingGatherings({
      events: [event({ id: "e", startsAt: NOW + HOUR })],
      eventRsvps: [rsvp("e", "me", "going")],
      now: NOW,
    });
    expect(result[0].viewerGoing).toBe(false);
  });
});
