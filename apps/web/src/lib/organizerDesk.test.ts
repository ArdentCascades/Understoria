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
//
// The desk's one new selector: shift coverage gaps. Locks:
//   1. Only the viewer's own events count (not others', not
//      cancelled ones) — the desk never reports on anyone else.
//   2. Capacity-less shifts can't gap; met capacity doesn't gap;
//      ended shifts don't gap.
//   3. Signup math and soonest-first ordering.
//
import { describe, expect, it } from "vitest";
import { shiftGaps } from "./organizerDesk";
import type { Event, EventShiftRow, ShiftSignupRow } from "@/types";

const ME = "me-key";
const NOW = 1_000_000;

function event(id: string, createdBy: string = ME): Event {
  return { id, title: `Event ${id}`, createdBy } as Event;
}

function shift(
  id: string,
  eventId: string,
  over: Partial<EventShiftRow> = {},
): EventShiftRow {
  return {
    id,
    eventId,
    label: `Shift ${id}`,
    startsAt: NOW + 10_000,
    endsAt: NOW + 20_000,
    capacity: 2,
    createdBy: ME,
    createdAt: 0,
    ...over,
  };
}

function signup(id: string, shiftId: string): ShiftSignupRow {
  return {
    id,
    shiftId,
    eventId: "irrelevant",
    memberKey: "helper",
    signedUpAt: 0,
  } as ShiftSignupRow;
}

describe("shiftGaps", () => {
  it("reports only under-capacity future shifts in my non-cancelled events", () => {
    const gaps = shiftGaps({
      memberKey: ME,
      events: [event("mine"), event("theirs", "other"), event("cxl")],
      cancelledEventIds: new Set(["cxl"]),
      shifts: [
        shift("gap", "mine"), // 1 of 2 → gap
        shift("full", "mine"), // 2 of 2 → no gap
        shift("uncapped", "mine", { capacity: null }),
        shift("past", "mine", { endsAt: NOW - 1 }),
        shift("not-mine", "theirs"),
        shift("cancelled", "cxl"),
      ],
      signups: [
        signup("s1", "gap"),
        signup("s2", "full"),
        signup("s3", "full"),
      ],
      now: NOW,
    });
    expect(gaps.map((g) => g.shift.id)).toEqual(["gap"]);
    expect(gaps[0].signedUp).toBe(1);
    expect(gaps[0].capacity).toBe(2);
  });

  it("orders gaps soonest-first", () => {
    const gaps = shiftGaps({
      memberKey: ME,
      events: [event("e")],
      cancelledEventIds: new Set(),
      shifts: [
        shift("later", "e", { startsAt: NOW + 50_000, endsAt: NOW + 60_000 }),
        shift("sooner", "e", { startsAt: NOW + 5_000, endsAt: NOW + 6_000 }),
      ],
      signups: [],
      now: NOW,
    });
    expect(gaps.map((g) => g.shift.id)).toEqual(["sooner", "later"]);
  });

  it("a shift running RIGHT NOW still gaps (endsAt in the future)", () => {
    const gaps = shiftGaps({
      memberKey: ME,
      events: [event("e")],
      cancelledEventIds: new Set(),
      shifts: [shift("live", "e", { startsAt: NOW - 1_000, endsAt: NOW + 1_000 })],
      signups: [],
      now: NOW,
    });
    expect(gaps).toHaveLength(1);
  });
});
