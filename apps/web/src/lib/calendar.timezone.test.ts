/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The timezone regression suite for the calendar's LOCAL-day model
// (lib/calendar.ts, day-model note). The original UTC-day model was
// falsified in the field within a day of events shipping: a member
// in US Eastern created "Movie night", 6:00–8:30 PM on Sep 23, and
// the calendar showed it on Sep 22 AND Sep 23 as a "1/2 · 2/2" span
// (the event crosses UTC midnight), with every row label shifted a
// day back (UTC midnights formatted through a local formatter).
//
// These tests pin the fix by actually running under non-UTC
// timezones. The default suite runs in UTC (where local == UTC and
// the old and new models coincide); this file re-pins process.env.TZ
// per test. Node on Linux honors runtime TZ changes for Date — the
// first test GUARD-ASSERTS that, so if a future runtime stops
// honoring it, this suite fails loudly instead of silently testing
// UTC again.
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import {
  buildCalendar,
  dayKey,
  dayStampOf,
  entryIsPast,
  getTodayDayKey,
  monthAnchor,
  stampKey,
  weekAnchor,
} from "./calendar";
import { computeAttentionItems } from "./attention";
import type { Event, Member } from "@/types";

const ORIGINAL_TZ = process.env.TZ;

afterAll(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});

afterEach(() => {
  vi.useRealTimers();
});

let seq = 0;
function makeEvent(startsAt: number, endsAt: number | null): Event {
  return {
    id: `ev_tz_${++seq}`,
    kind: "event",
    title: "Movie night — Indigenous People's History of the United States",
    description: "",
    category: "social",
    startsAt,
    endsAt,
    location: "Johnson city",
    capacity: 30,
    templateId: null,
    createdAt: 0,
    createdBy: "organizer",
    nodeId: "node_t",
    signature: "sig",
  };
}

function calendarFor(events: Event[]) {
  return buildCalendar({
    projects: [],
    posts: [],
    exchanges: [],
    events,
    windowStart: Date.UTC(2026, 8, 1),
    windowEnd: Date.UTC(2026, 10, 30),
  });
}

describe("US Eastern (UTC-4 in September) — the field bug", () => {
  it("guard: this runtime honors process.env.TZ at runtime", () => {
    process.env.TZ = "America/New_York";
    // 2026-09-23 22:00 UTC must read as Sep 23, 6 PM Eastern.
    const d = new Date(Date.UTC(2026, 8, 23, 22, 0));
    expect(d.getTimezoneOffset()).toBe(240); // EDT
    expect(d.getDate()).toBe(23);
    expect(d.getHours()).toBe(18);
  });

  it("a 6:00–8:30 PM event is ONE local day, on its own local day", () => {
    process.env.TZ = "America/New_York";
    // Exactly the screenshot: starts 9/23 6:00 PM, ends 9/23 8:30 PM
    // Eastern — which is 22:00 Sep 23 → 00:30 Sep 24 in UTC. The old
    // UTC-day model split this into a two-day span.
    const startsAt = Date.UTC(2026, 8, 23, 22, 0);
    const endsAt = Date.UTC(2026, 8, 24, 0, 30);
    const entries = calendarFor([makeEvent(startsAt, endsAt)]).filter(
      (e) => e.kind === "event",
    );
    expect(entries).toHaveLength(1);
    const entry = entries[0];
    if (entry.kind !== "event") throw new Error("unreachable");
    expect(entry.dayCount).toBe(1);
    expect(entry.isMultiDay).toBe(false);
    expect(stampKey(entry.date)).toBe("2026-09-23");
  });

  it("today's key follows the member's wall clock, not the UTC date", () => {
    process.env.TZ = "America/New_York";
    // 11 PM Eastern on Sep 23 — UTC has already rolled to Sep 24.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 8, 24, 3, 0)));
    expect(getTodayDayKey()).toBe("2026-09-23");
  });

  it("week and month anchors name local days (stamps), so headers label correctly", () => {
    process.env.TZ = "America/New_York";
    // 9:27 AM Eastern on Wed Sep 23 (13:27 UTC).
    const now = Date.UTC(2026, 8, 23, 13, 27);
    // The Sunday on or before local Wed Sep 23 is local Sun Sep 20.
    expect(stampKey(weekAnchor(now))).toBe("2026-09-20");
    // Late local evening, past UTC midnight: still the same local
    // week — 11 PM Eastern Sep 26 (Saturday) is 03:00 UTC Sep 27.
    const lateSaturday = Date.UTC(2026, 8, 27, 3, 0);
    expect(stampKey(weekAnchor(lateSaturday))).toBe("2026-09-20");
    // Month anchor of that same instant is local September, not the
    // UTC October it would drift to near a month boundary — e.g.
    // 9 PM Eastern on Sep 30 (01:00 UTC Oct 1).
    const lateSep30 = Date.UTC(2026, 9, 1, 1, 0);
    expect(stampKey(monthAnchor(lateSep30, 0))).toBe("2026-09-01");
  });

  it("entryIsPast judges by local days: yesterday's evening event is past, tonight's is not", () => {
    process.env.TZ = "America/New_York";
    // Now: Sep 24, 9:00 AM Eastern.
    const now = Date.UTC(2026, 8, 24, 13, 0);
    const todayStamp = dayStampOf(now);
    // Yesterday 6:00–8:30 PM Eastern (the movie night, day after).
    const yesterday = calendarFor([
      makeEvent(Date.UTC(2026, 8, 23, 22, 0), Date.UTC(2026, 8, 24, 0, 30)),
    ]).filter((e) => e.kind === "event")[0];
    expect(entryIsPast(yesterday, todayStamp)).toBe(true);
    // Tonight 6:00–8:30 PM Eastern.
    const tonight = calendarFor([
      makeEvent(Date.UTC(2026, 8, 24, 22, 0), Date.UTC(2026, 8, 25, 0, 30)),
    ]).filter((e) => e.kind === "event")[0];
    expect(entryIsPast(tonight, todayStamp)).toBe(false);
  });

  it("a genuinely multi-day festival still spans, with exact 86.4M-ms stamps across the DST fall-back", () => {
    process.env.TZ = "America/New_York";
    // Local Sat Oct 31 10:00 AM → Mon Nov 2 4:00 PM, 2026 — crossing
    // the US fall-back (Nov 1, a 25-hour local day). Stamp space
    // absorbs DST at conversion: three days, exactly one stamp apart.
    const startsAt = Date.UTC(2026, 9, 31, 14, 0); // 10 AM EDT
    const endsAt = Date.UTC(2026, 10, 2, 21, 0); // 4 PM EST
    const entries = calendarFor([makeEvent(startsAt, endsAt)]).filter(
      (e) => e.kind === "event",
    );
    expect(entries).toHaveLength(3);
    expect(entries.map((e) => stampKey(e.date))).toEqual([
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
    ]);
    expect(entries[1].date - entries[0].date).toBe(86_400_000);
    expect(entries[2].date - entries[1].date).toBe(86_400_000);
    for (const [i, e] of entries.entries()) {
      if (e.kind !== "event") throw new Error("unreachable");
      expect(e.dayCount).toBe(3);
      expect(e.dayIndex).toBe(i);
    }
  });
});

describe("east of UTC (Pacific/Auckland, UTC+12 — NZST until Sep 27)", () => {
  it("an early-morning event stays on its own local day", () => {
    process.env.TZ = "Pacific/Auckland";
    // 12:30 AM Sep 24 local = 12:30 Sep 23 UTC — the mirror-image
    // trap: the old model bucketed this to UTC Sep 23.
    const startsAt = Date.UTC(2026, 8, 23, 12, 30);
    const d = new Date(startsAt);
    expect(d.getDate()).toBe(24); // guard: TZ took effect
    const entries = calendarFor([
      makeEvent(startsAt, startsAt + 2 * 60 * 60_000),
    ]).filter((e) => e.kind === "event");
    expect(entries).toHaveLength(1);
    const entry = entries[0];
    if (entry.kind !== "event") throw new Error("unreachable");
    expect(entry.dayCount).toBe(1);
    expect(stampKey(entry.date)).toBe("2026-09-24");
  });

  it("dayKey (real instants) and stampKey (stamps) agree on the local day", () => {
    process.env.TZ = "Pacific/Auckland";
    const ms = Date.UTC(2026, 8, 23, 12, 30); // 00:30 Sep 24 local
    expect(dayKey(ms)).toBe("2026-09-24");
    expect(stampKey(dayStampOf(ms))).toBe("2026-09-24");
  });
});

describe("attention rail event_today — local day (US Eastern)", () => {
  const viewer: Member = {
    publicKey: "viewer",
    displayName: "Viewer",
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId: "node_t",
    locationZone: "",
  };

  function railFor(event: Event, now: number) {
    return computeAttentionItems({
      currentMember: viewer,
      posts: [],
      projects: [],
      projectTasks: [],
      members: [viewer],
      events: [event],
      eventRsvps: [
        {
          id: "r1",
          eventId: event.id,
          memberKey: viewer.publicKey,
          status: "going" as const,
          respondedAt: 0,
        },
      ],
      now,
    });
  }

  it("an 8:30 PM event TONIGHT surfaces even though its UTC day is tomorrow", () => {
    process.env.TZ = "America/New_York";
    // Now: Sep 23, 9:27 AM Eastern. Event: Sep 23, 8:30 PM Eastern
    // (= 00:30 Sep 24 UTC) — the old UTC-day window missed it.
    const now = Date.UTC(2026, 8, 23, 13, 27);
    const event = makeEvent(Date.UTC(2026, 8, 24, 0, 30), null);
    const items = railFor(event, now);
    expect(items.some((i) => i.kind === "event_today")).toBe(true);
  });

  it("an event TOMORROW morning does not surface today, even on the same UTC day", () => {
    process.env.TZ = "America/New_York";
    // Now: Sep 23, 9:00 PM Eastern (01:00 Sep 24 UTC). Event: Sep 24,
    // 7:00 AM Eastern (11:00 Sep 24 UTC) — same UTC day as "now"; the
    // old model would have called it today.
    const now = Date.UTC(2026, 8, 24, 1, 0);
    const event = makeEvent(Date.UTC(2026, 8, 24, 11, 0), null);
    const items = railFor(event, now);
    expect(items.some((i) => i.kind === "event_today")).toBe(false);
  });
});
