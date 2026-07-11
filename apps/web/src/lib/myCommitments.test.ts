/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { myClaimedPosts, myUpcomingShifts } from "./myCommitments";
import type {
  Event,
  EventShiftRow,
  Post,
  ShiftSignupRow,
} from "@/types";

const ME = "me-key";
const HOUR = 3_600_000;
const NOW = 1_800_000_000_000;

function event(id: string, overrides: Partial<Event> = {}): Event {
  return {
    id,
    title: `Event ${id}`,
    description: "",
    category: "social",
    startsAt: NOW + 24 * HOUR,
    endsAt: null,
    location: "the park",
    capacity: null,
    createdBy: "organizer-key",
    createdAt: NOW - HOUR,
    nodeId: "node_test",
    signature: "sig",
    ...overrides,
  } as Event;
}

function shift(
  id: string,
  eventId: string,
  overrides: Partial<EventShiftRow> = {},
): EventShiftRow {
  return {
    id,
    eventId,
    label: `Shift ${id}`,
    startsAt: NOW + 24 * HOUR,
    endsAt: NOW + 26 * HOUR,
    capacity: null,
    createdBy: "organizer-key",
    createdAt: NOW - HOUR,
    ...overrides,
  };
}

function signup(
  shiftId: string,
  eventId: string,
  memberKey = ME,
): ShiftSignupRow {
  return {
    id: `signup-${shiftId}-${memberKey}`,
    shiftId,
    eventId,
    memberKey,
    signedUpAt: NOW - HOUR,
  };
}

describe("myUpcomingShifts", () => {
  it("returns only the member's own signups, soonest shift first", () => {
    const e = event("e1");
    const later = shift("s-later", "e1", {
      startsAt: NOW + 48 * HOUR,
      endsAt: NOW + 50 * HOUR,
    });
    const sooner = shift("s-sooner", "e1");
    const out = myUpcomingShifts({
      memberKey: ME,
      signups: [
        signup("s-later", "e1"),
        signup("s-sooner", "e1"),
        signup("s-sooner", "e1", "someone-else"),
      ],
      shifts: [later, sooner],
      events: [e],
      now: NOW,
    });
    expect(out.map((s) => s.shift.id)).toEqual(["s-sooner", "s-later"]);
  });

  it("keeps a shift that has started but not ended (mid-shift is still on it)", () => {
    const out = myUpcomingShifts({
      memberKey: ME,
      signups: [signup("s1", "e1")],
      shifts: [
        shift("s1", "e1", { startsAt: NOW - HOUR, endsAt: NOW + HOUR }),
      ],
      events: [event("e1")],
      now: NOW,
    });
    expect(out).toHaveLength(1);
  });

  it("drops ended shifts, cancelled events, and dangling references", () => {
    const out = myUpcomingShifts({
      memberKey: ME,
      signups: [
        signup("s-ended", "e1"),
        signup("s-cancelled", "e-cancelled"),
        signup("s-no-shift", "e1"),
        signup("s-no-event", "e-gone"),
      ],
      shifts: [
        shift("s-ended", "e1", { startsAt: NOW - 3 * HOUR, endsAt: NOW - HOUR }),
        shift("s-cancelled", "e-cancelled"),
        shift("s-no-event", "e-gone"),
      ],
      events: [event("e1"), event("e-cancelled")],
      eventCancellations: [
        { id: "c1", eventId: "e-cancelled" } as never,
      ],
      now: NOW,
    });
    expect(out).toHaveLength(0);
  });
});

function post(id: string, overrides: Partial<Post> = {}): Post {
  return {
    id,
    type: "NEED",
    category: "errands",
    title: `Post ${id}`,
    description: "",
    estimatedHours: 1,
    urgency: "medium",
    postedBy: "author-key",
    claimedBy: ME,
    status: "claimed",
    createdAt: NOW - HOUR,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId: "node_test",
    ...overrides,
  } as Post;
}

describe("myClaimedPosts", () => {
  it("returns NEED posts I claimed in claimed/awaiting states, newest first", () => {
    const older = post("p-old", { createdAt: NOW - 3 * HOUR });
    const newer = post("p-new", {
      createdAt: NOW - HOUR,
      status: "awaiting_confirmation",
    });
    const out = myClaimedPosts({ memberKey: ME, posts: [older, newer] });
    expect(out.map((p) => p.id)).toEqual(["p-new", "p-old"]);
  });

  it("excludes offers I claimed (help I receive is not work I owe), other claimers, resolved posts, and blocked authors", () => {
    const out = myClaimedPosts({
      memberKey: ME,
      posts: [
        post("p-offer", { type: "OFFER" }),
        post("p-other", { claimedBy: "someone-else" }),
        post("p-done", { status: "completed" }),
        post("p-open", { claimedBy: null, status: "open" }),
        post("p-blocked", { postedBy: "blocked-author" }),
      ],
      blockedKeys: new Set(["blocked-author"]),
    });
    expect(out).toHaveLength(0);
  });
});
