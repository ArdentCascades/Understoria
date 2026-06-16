/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  Event,
  EventCancellation,
  Exchange,
  Post,
  Project,
  ProjectStatus,
} from "@/types";
import {
  buildCalendar,
  dayKey,
  dayKeyToMs,
  entryIsPast,
  getTodayDayKey,
  groupByDay,
  startOfTodayMs,
  startOfUTCDay,
  type CalendarEntry,
} from "./calendar";

// ─── Fixture helpers ─────────────────────────────────────────────────

const NODE = "node_calendar_test";

function project(opts: Partial<Project> & { id: string }): Project {
  const defaults: Omit<Project, "id"> = {
    title: `Project ${opts.id}`,
    description: "",
    category: "other",
    organizerKey: "org",
    coOrganizerKeys: [],
    status: "active",
    targetHours: 10,
    contributedHours: 0,
    deadline: null,
    createdAt: 0,
    completedAt: null,
    pauseNote: null,
    locationZone: "",
    tags: [],
    nodeId: NODE,
    templateId: null,
  };
  return { ...defaults, ...opts };
}

function post(opts: Partial<Post> & { id: string }): Post {
  const defaults: Omit<Post, "id"> = {
    type: "NEED",
    category: "other",
    title: `Post ${opts.id}`,
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "poster",
    claimedBy: null,
    status: "open",
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId: NODE,
    signature: "",
  };
  return { ...defaults, ...opts };
}

function event(opts: Partial<Event> & { id: string; startsAt: number }): Event {
  const defaults: Omit<Event, "id" | "startsAt"> = {
    kind: "event",
    title: `Event ${opts.id}`,
    description: "",
    category: "skills",
    endsAt: null,
    location: "the bench",
    capacity: null,
    templateId: null,
    createdAt: 0,
    createdBy: "organizer",
    nodeId: NODE,
    signature: "sig",
  };
  return { ...defaults, ...opts };
}

function cancellation(eventId: string): EventCancellation {
  return {
    id: `c_${eventId}`,
    kind: "event_cancellation",
    eventId,
    reason: "",
    cancelledAt: 0,
    createdBy: "organizer",
    nodeId: NODE,
    signature: "sig",
  };
}

function exchange(id: string, completedAt: number): Exchange {
  return {
    id,
    postId: `p_${id}`,
    helperKey: "h",
    helpedKey: "d",
    hoursExchanged: 1,
    helperSignature: "s",
    helpedSignature: "s",
    completedAt,
    category: "other",
    nodeId: NODE,
  };
}

// 2026-11-15T12:00:00Z — fixed "now" anchor for tests
const NOW = Date.UTC(2026, 10, 15, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

// Default 30-day window: 15 days back, 30 days forward
function defaultWindow() {
  return {
    windowStart: NOW - 15 * DAY,
    windowEnd: NOW + 30 * DAY,
  };
}

// ─── dayKey + startOfUTCDay + dayKeyToMs ────────────────────────────

describe("dayKey", () => {
  it("formats a midnight-UTC timestamp", () => {
    expect(dayKey(Date.UTC(2026, 0, 1))).toBe("2026-01-01");
    expect(dayKey(Date.UTC(2026, 11, 31))).toBe("2026-12-31");
  });

  it("formats a non-midnight timestamp by its UTC day", () => {
    expect(dayKey(Date.UTC(2026, 5, 15, 23, 59, 59))).toBe("2026-06-15");
    expect(dayKey(Date.UTC(2026, 5, 16, 0, 0, 0))).toBe("2026-06-16");
  });

  it("pads single-digit month and day", () => {
    expect(dayKey(Date.UTC(2026, 2, 5))).toBe("2026-03-05");
  });
});

describe("startOfUTCDay", () => {
  it("floors to midnight UTC of the same day", () => {
    const noon = Date.UTC(2026, 5, 15, 12, 0, 0);
    const midnight = Date.UTC(2026, 5, 15, 0, 0, 0);
    expect(startOfUTCDay(noon)).toBe(midnight);
  });

  it("does not move a value already at midnight UTC", () => {
    const midnight = Date.UTC(2026, 5, 15, 0, 0, 0);
    expect(startOfUTCDay(midnight)).toBe(midnight);
  });

  it("rolls just-before-midnight down to the same day, not the next", () => {
    const t = Date.UTC(2026, 5, 15, 23, 59, 59, 999);
    expect(startOfUTCDay(t)).toBe(Date.UTC(2026, 5, 15));
  });
});

describe("dayKeyToMs", () => {
  it("roundtrips with dayKey", () => {
    const k = dayKey(Date.UTC(2026, 5, 15, 14, 0, 0));
    expect(dayKey(dayKeyToMs(k))).toBe(k);
  });

  it("throws on malformed input rather than coercing", () => {
    expect(() => dayKeyToMs("nope")).toThrow();
    expect(() => dayKeyToMs("2026-13-01")).not.toThrow(); // sloppy but parseable
    expect(() => dayKeyToMs("")).toThrow();
    expect(() => dayKeyToMs("2026/06/15")).toThrow();
  });
});

describe("getTodayDayKey", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns dayKey(Date.now()) for the current clock", () => {
    vi.useFakeTimers();
    const fixed = Date.UTC(2026, 5, 10, 14, 30, 0);
    vi.setSystemTime(new Date(fixed));
    expect(getTodayDayKey()).toBe(dayKey(fixed));
    expect(getTodayDayKey()).toBe("2026-06-10");
  });

  it("rolls over at UTC midnight, not local midnight", () => {
    vi.useFakeTimers();
    const justBefore = Date.UTC(2026, 5, 15, 23, 59, 59);
    vi.setSystemTime(new Date(justBefore));
    expect(getTodayDayKey()).toBe("2026-06-15");
    const justAfter = Date.UTC(2026, 5, 16, 0, 0, 0);
    vi.setSystemTime(new Date(justAfter));
    expect(getTodayDayKey()).toBe("2026-06-16");
  });
});

// ─── buildCalendar: empty inputs ────────────────────────────────────

describe("buildCalendar — empty inputs", () => {
  it("returns an empty array when nothing matches", () => {
    expect(
      buildCalendar({
        projects: [],
        posts: [],
        exchanges: [],
        ...defaultWindow(),
      }),
    ).toEqual([]);
  });
});

// ─── buildCalendar: project_deadline ────────────────────────────────

describe("buildCalendar — project_deadline", () => {
  it("emits an entry when a project has a deadline in the window", () => {
    const p = project({
      id: "proj_1",
      deadline: NOW + 5 * DAY,
      title: "Tenant Union Meeting",
      category: "organizing",
    });
    const result = buildCalendar({
      projects: [p],
      posts: [],
      exchanges: [],
      ...defaultWindow(),
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: "project_deadline",
      projectId: "proj_1",
      projectTitle: "Tenant Union Meeting",
      category: "organizing",
    });
  });

  it("skips projects with a null deadline", () => {
    const p = project({ id: "proj_1", deadline: null });
    const result = buildCalendar({
      projects: [p],
      posts: [],
      exchanges: [],
      ...defaultWindow(),
    });
    expect(result).toHaveLength(0);
  });

  it("skips completed projects even if the deadline is in the window", () => {
    const p = project({
      id: "proj_1",
      deadline: NOW + 5 * DAY,
      status: "completed",
    });
    const result = buildCalendar({
      projects: [p],
      posts: [],
      exchanges: [],
      ...defaultWindow(),
    });
    expect(result).toHaveLength(0);
  });

  it("skips archived projects even if the deadline is in the window", () => {
    const p = project({
      id: "proj_1",
      deadline: NOW + 5 * DAY,
      status: "archived",
    });
    const result = buildCalendar({
      projects: [p],
      posts: [],
      exchanges: [],
      ...defaultWindow(),
    });
    expect(result).toHaveLength(0);
  });

  it("includes planning, active, and paused projects", () => {
    const statuses: ProjectStatus[] = ["planning", "active", "paused"];
    for (const s of statuses) {
      const result = buildCalendar({
        projects: [
          project({ id: `proj_${s}`, deadline: NOW + 5 * DAY, status: s }),
        ],
        posts: [],
        exchanges: [],
        ...defaultWindow(),
      });
      expect(result).toHaveLength(1);
    }
  });

  it("skips a deadline before windowStart", () => {
    const w = defaultWindow();
    const p = project({ id: "proj_1", deadline: w.windowStart - 1 });
    const result = buildCalendar({
      projects: [p],
      posts: [],
      exchanges: [],
      ...w,
    });
    expect(result).toHaveLength(0);
  });

  it("skips a deadline after windowEnd", () => {
    const w = defaultWindow();
    const p = project({ id: "proj_1", deadline: w.windowEnd + 1 });
    const result = buildCalendar({
      projects: [p],
      posts: [],
      exchanges: [],
      ...w,
    });
    expect(result).toHaveLength(0);
  });

  it("includes deadlines exactly at the window edges (inclusive)", () => {
    const w = defaultWindow();
    const result = buildCalendar({
      projects: [
        project({ id: "edge_start", deadline: w.windowStart }),
        project({ id: "edge_end", deadline: w.windowEnd }),
      ],
      posts: [],
      exchanges: [],
      ...w,
    });
    expect(result).toHaveLength(2);
  });

  it("floors the entry date to midnight UTC of the deadline day", () => {
    const deadlineMs = Date.UTC(2026, 10, 20, 18, 30, 0);
    const p = project({ id: "proj_1", deadline: deadlineMs });
    const [entry] = buildCalendar({
      projects: [p],
      posts: [],
      exchanges: [],
      windowStart: NOW - DAY,
      windowEnd: NOW + 30 * DAY,
    });
    expect(entry.date).toBe(Date.UTC(2026, 10, 20));
  });
});

// ─── buildCalendar: post_expiring ───────────────────────────────────

describe("buildCalendar — post_expiring", () => {
  it("emits an entry for an open post expiring in the window", () => {
    const p = post({
      id: "post_1",
      expiresAt: NOW + 3 * DAY,
      title: "Need a ride to clinic",
      type: "NEED",
      category: "transport",
    });
    const result = buildCalendar({
      projects: [],
      posts: [p],
      exchanges: [],
      ...defaultWindow(),
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: "post_expiring",
      postId: "post_1",
      postTitle: "Need a ride to clinic",
      postType: "NEED",
      category: "transport",
    });
  });

  it("skips claimed posts even with an expiry in the window", () => {
    const p = post({
      id: "post_1",
      expiresAt: NOW + 3 * DAY,
      status: "claimed",
      claimedBy: "someone",
    });
    const result = buildCalendar({
      projects: [],
      posts: [p],
      exchanges: [],
      ...defaultWindow(),
    });
    expect(result).toHaveLength(0);
  });

  it("skips completed posts even with an expiry in the window", () => {
    const p = post({
      id: "post_1",
      expiresAt: NOW + 3 * DAY,
      status: "completed",
    });
    const result = buildCalendar({
      projects: [],
      posts: [p],
      exchanges: [],
      ...defaultWindow(),
    });
    expect(result).toHaveLength(0);
  });

  it("skips posts with null expiresAt", () => {
    const p = post({ id: "post_1", expiresAt: null });
    const result = buildCalendar({
      projects: [],
      posts: [p],
      exchanges: [],
      ...defaultWindow(),
    });
    expect(result).toHaveLength(0);
  });

  it("handles OFFER posts the same as NEED posts", () => {
    const result = buildCalendar({
      projects: [],
      posts: [
        post({ id: "p_n", type: "NEED", expiresAt: NOW + DAY }),
        post({ id: "p_o", type: "OFFER", expiresAt: NOW + DAY }),
      ],
      exchanges: [],
      ...defaultWindow(),
    });
    expect(result.filter((e) => e.kind === "post_expiring")).toHaveLength(2);
  });
});

// ─── buildCalendar: exchange_density ────────────────────────────────

describe("buildCalendar — exchange_density", () => {
  it("emits one entry per UTC day with at least one exchange", () => {
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [
        exchange("e1", NOW - 3 * DAY),
        exchange("e2", NOW - 3 * DAY + 60_000),
        exchange("e3", NOW - DAY),
      ],
      ...defaultWindow(),
    });
    const density = result.filter((e) => e.kind === "exchange_density");
    expect(density).toHaveLength(2);
  });

  it("counts exchanges on the same UTC day", () => {
    // Three exchanges on the same UTC day at different times
    const day = Date.UTC(2026, 10, 10);
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [
        exchange("e1", day + 1_000),
        exchange("e2", day + 3_600_000),
        exchange("e3", day + 12 * 3_600_000),
      ],
      ...defaultWindow(),
    });
    const density = result.filter((e) => e.kind === "exchange_density");
    expect(density).toHaveLength(1);
    if (density[0].kind === "exchange_density") {
      expect(density[0].count).toBe(3);
    }
  });

  it("skips exchanges outside the window", () => {
    const w = defaultWindow();
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [
        exchange("before", w.windowStart - DAY),
        exchange("after", w.windowEnd + DAY),
      ],
      ...w,
    });
    expect(result).toHaveLength(0);
  });

  it("produces a stable id keyed on UTC day", () => {
    const day = Date.UTC(2026, 10, 10);
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [exchange("e1", day + 3_600_000)],
      ...defaultWindow(),
    });
    expect(result[0].id).toBe("density:2026-11-10");
  });

  it("date field on a density entry is midnight UTC of its day", () => {
    const ex = exchange("e1", Date.UTC(2026, 10, 10, 14, 30, 0));
    const [entry] = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [ex],
      ...defaultWindow(),
    });
    expect(entry.date).toBe(Date.UTC(2026, 10, 10));
  });
});

// ─── buildCalendar: sort order ──────────────────────────────────────

describe("buildCalendar — sort order", () => {
  it("sorts entries chronologically", () => {
    const result = buildCalendar({
      projects: [
        project({ id: "p_far", deadline: NOW + 10 * DAY }),
        project({ id: "p_near", deadline: NOW + 2 * DAY }),
      ],
      posts: [post({ id: "post_mid", expiresAt: NOW + 5 * DAY })],
      exchanges: [],
      ...defaultWindow(),
    });
    const dates = result.map((e) => e.date);
    const sorted = [...dates].sort((a, b) => a - b);
    expect(dates).toEqual(sorted);
  });

  it("for same-day ties, density < project_deadline < post_expiring", () => {
    const day = NOW + 5 * DAY;
    const result = buildCalendar({
      projects: [project({ id: "p_1", deadline: day })],
      posts: [post({ id: "post_1", expiresAt: day })],
      exchanges: [exchange("e_1", day)],
      ...defaultWindow(),
    });
    const kinds = result.map((e) => e.kind);
    expect(kinds).toEqual([
      "exchange_density",
      "project_deadline",
      "post_expiring",
    ]);
  });
});

// ─── buildCalendar: cross-source mixing ─────────────────────────────

describe("buildCalendar — cross-source mixing", () => {
  it("returns all three entry kinds when each source has matches", () => {
    const result = buildCalendar({
      projects: [project({ id: "p_1", deadline: NOW + 5 * DAY })],
      posts: [post({ id: "post_1", expiresAt: NOW + 3 * DAY })],
      exchanges: [exchange("e_1", NOW - 2 * DAY)],
      ...defaultWindow(),
    });
    const kinds = new Set(result.map((e) => e.kind));
    expect(kinds).toEqual(
      new Set(["project_deadline", "post_expiring", "exchange_density"]),
    );
  });

  it("does not double-count when two projects share a deadline day", () => {
    const day = NOW + 5 * DAY;
    const result = buildCalendar({
      projects: [
        project({ id: "p_1", deadline: day }),
        project({ id: "p_2", deadline: day }),
      ],
      posts: [],
      exchanges: [],
      ...defaultWindow(),
    });
    expect(result.filter((e) => e.kind === "project_deadline")).toHaveLength(2);
  });
});

// ─── groupByDay ─────────────────────────────────────────────────────

describe("groupByDay", () => {
  it("groups entries by UTC day key", () => {
    const entries = buildCalendar({
      projects: [project({ id: "p_a", deadline: NOW + 2 * DAY })],
      posts: [post({ id: "post_a", expiresAt: NOW + 2 * DAY })],
      exchanges: [exchange("e_a", NOW - DAY)],
      ...defaultWindow(),
    });
    const grouped = groupByDay(entries);
    expect(grouped.size).toBe(2);
    const sameDay = grouped.get(dayKey(NOW + 2 * DAY)) ?? [];
    expect(sameDay).toHaveLength(2);
  });

  it("returns an empty map for an empty input", () => {
    expect(groupByDay([]).size).toBe(0);
  });

  it("preserves within-day order from the input", () => {
    const day = NOW + 5 * DAY;
    const entries = buildCalendar({
      projects: [project({ id: "p_1", deadline: day })],
      posts: [post({ id: "post_1", expiresAt: day })],
      exchanges: [exchange("e_1", day)],
      ...defaultWindow(),
    });
    const grouped = groupByDay(entries);
    const sameDay = grouped.get(dayKey(day)) ?? [];
    // Sort order from buildCalendar should be preserved.
    expect(sameDay.map((e) => e.kind)).toEqual([
      "exchange_density",
      "project_deadline",
      "post_expiring",
    ]);
  });
});

// ─── buildCalendar: event ───────────────────────────────────────────

describe("buildCalendar — event viewerGoing", () => {
  const inWindow = Date.UTC(2026, 10, 20, 12, 0, 0);
  function build(
    currentMemberKey: string | null,
    eventRsvps: ReadonlyArray<{
      id: string;
      eventId: string;
      memberKey: string;
      status: "going" | "maybe" | "not_going";
      respondedAt: number;
    }>,
  ) {
    return buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [event({ id: "ev_1", startsAt: inWindow })],
      eventCancellations: [],
      currentMemberKey,
      eventRsvps,
      windowStart: NOW,
      windowEnd: NOW + 30 * DAY,
    });
  }

  it("marks an event the current viewer RSVP'd 'going' to — and ignores other members' going", () => {
    const result = build("me", [
      { id: "r1", eventId: "ev_1", memberKey: "me", status: "going", respondedAt: 1 },
      { id: "r2", eventId: "ev_1", memberKey: "other", status: "going", respondedAt: 1 },
    ]);
    expect(result[0]).toMatchObject({ kind: "event", viewerGoing: true });
  });

  it("does not mark 'maybe', no-RSVP, or when there's no viewer", () => {
    expect(
      build("me", [
        { id: "r", eventId: "ev_1", memberKey: "me", status: "maybe", respondedAt: 1 },
      ])[0],
    ).toMatchObject({ viewerGoing: false });
    expect(build("me", [])[0]).toMatchObject({ viewerGoing: false });
    // No viewer key — a going row exists but can't be attributed to "the
    // viewer," so nothing is marked.
    expect(
      build(null, [
        { id: "r", eventId: "ev_1", memberKey: "me", status: "going", respondedAt: 1 },
      ])[0],
    ).toMatchObject({ viewerGoing: false });
  });
});

describe("buildCalendar — event", () => {
  it("emits an event entry placed on the UTC day of startsAt", () => {
    // 23:30 UTC — falls on its own UTC day, not the next.
    const startsAt = Date.UTC(2026, 10, 20, 23, 30, 0);
    const ev = event({ id: "ev_1", startsAt, title: "Saturday skillshare" });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      windowStart: NOW,
      windowEnd: NOW + 30 * DAY,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: "event",
      eventId: "ev_1",
      title: "Saturday skillshare",
      path: "/events/ev_1",
      organizerKey: "organizer",
      // buildCalendar copies the event's free-text category onto the
      // entry for the chip's colour/emoji (Task 4).
      category: "skills",
    });
    expect(result[0].date).toBe(Date.UTC(2026, 10, 20));
  });

  it("filters cancelled events out at the data layer", () => {
    const ev = event({ id: "ev_cancel", startsAt: NOW + 2 * DAY });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [cancellation("ev_cancel")],
      ...defaultWindow(),
    });
    expect(result).toHaveLength(0);
  });

  it("produces one entry per event when multiple share a day", () => {
    const day = NOW + 5 * DAY;
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [
        event({ id: "ev_a", startsAt: day + 60_000 }),
        event({ id: "ev_b", startsAt: day + 2 * 3_600_000 }),
        event({ id: "ev_c", startsAt: day + 4 * 3_600_000 }),
      ],
      eventCancellations: [],
      ...defaultWindow(),
    });
    expect(result.filter((e) => e.kind === "event")).toHaveLength(3);
  });

  it("respects the per-day window bounds (whole-day-outside events drop)", () => {
    // The window check is DAY-based now (multi-day events emit per UTC
    // day): an event whose ONLY day is wholly before the window's first
    // UTC day, or after windowEnd, drops. Events on the edge days stay.
    const w = defaultWindow();
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [
        // A full UTC day before the floored window start.
        event({ id: "before", startsAt: startOfUTCDay(w.windowStart) - DAY }),
        // After windowEnd.
        event({ id: "after", startsAt: w.windowEnd + DAY }),
        event({ id: "edge_start", startsAt: w.windowStart }),
        event({ id: "edge_end", startsAt: w.windowEnd }),
      ],
      eventCancellations: [],
      ...w,
    });
    const ids = result.map((e) => (e.kind === "event" ? e.eventId : null));
    expect(ids).toEqual(expect.arrayContaining(["edge_start", "edge_end"]));
    expect(ids).not.toContain("before");
    expect(ids).not.toContain("after");
  });

  it("carries enough fields for rendering (title, time, location, link, organizer)", () => {
    const startsAt = NOW + 3 * DAY;
    const ev = event({
      id: "ev_full",
      startsAt,
      title: "Potluck",
      location: "community room",
      createdBy: "alice_key",
    });
    const [entry] = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      ...defaultWindow(),
    });
    if (entry.kind !== "event") throw new Error("expected event entry");
    expect(entry.title).toBe("Potluck");
    expect(entry.location).toBe("community room");
    expect(entry.path).toBe("/events/ev_full");
    expect(entry.organizerKey).toBe("alice_key");
    expect(entry.startsAt).toBe(startsAt);
  });

  it("propagates endsAt from the source Event onto the entry", () => {
    const startsAt = NOW + 3 * DAY;
    const endsAt = startsAt + 2 * 3_600_000;
    const ev = event({ id: "ev_ends", startsAt, endsAt });
    const [entry] = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      ...defaultWindow(),
    });
    if (entry.kind !== "event") throw new Error("expected event entry");
    expect(entry.endsAt).toBe(endsAt);
  });

  it("preserves a null endsAt (no defined end time)", () => {
    const ev = event({ id: "ev_open", startsAt: NOW + 2 * DAY, endsAt: null });
    const [entry] = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      ...defaultWindow(),
    });
    if (entry.kind !== "event") throw new Error("expected event entry");
    expect(entry.endsAt).toBeNull();
  });

  it("single-day (null endsAt) → one entry, isMultiDay false, dayCount 1", () => {
    const startsAt = Date.UTC(2026, 10, 20, 10, 0, 0);
    const ev = event({ id: "ev_1", startsAt, endsAt: null });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      windowStart: NOW,
      windowEnd: NOW + 30 * DAY,
    });
    const events = result.filter((e) => e.kind === "event");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      isMultiDay: false,
      dayCount: 1,
      dayIndex: 0,
    });
    expect(events[0].date).toBe(startOfUTCDay(startsAt));
  });

  it("single-day (same-UTC-day endsAt) → one entry, isMultiDay false", () => {
    const startsAt = Date.UTC(2026, 10, 20, 10, 0, 0);
    const endsAt = Date.UTC(2026, 10, 20, 14, 0, 0); // same UTC day
    const ev = event({ id: "ev_1", startsAt, endsAt });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      windowStart: NOW,
      windowEnd: NOW + 30 * DAY,
    });
    const events = result.filter((e) => e.kind === "event");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ isMultiDay: false, dayCount: 1 });
  });

  it("two-day span → two entries on consecutive days with dayIndex 0,1", () => {
    // Day D 20:00 → day D+1 02:00 UTC.
    const startsAt = Date.UTC(2026, 10, 20, 20, 0, 0);
    const endsAt = Date.UTC(2026, 10, 21, 2, 0, 0);
    const ev = event({ id: "ev_span", startsAt, endsAt });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      windowStart: NOW,
      windowEnd: NOW + 30 * DAY,
    });
    const events = result.filter((e) => e.kind === "event");
    expect(events).toHaveLength(2);
    expect(events.map((e) => e.date)).toEqual([
      Date.UTC(2026, 10, 20),
      Date.UTC(2026, 10, 21),
    ]);
    expect(events.map((e) => (e.kind === "event" ? e.dayIndex : -1))).toEqual([
      0, 1,
    ]);
    for (const e of events) {
      if (e.kind === "event") expect(e.dayCount).toBe(2);
    }
    // Distinct ids per day.
    expect(new Set(events.map((e) => e.id)).size).toBe(2);
  });

  it("three-day span → three entries with dayIndex 0,1,2 and dayCount 3", () => {
    const startsAt = Date.UTC(2026, 10, 20, 9, 0, 0);
    const endsAt = Date.UTC(2026, 10, 22, 17, 0, 0);
    const ev = event({ id: "ev_3", startsAt, endsAt });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      windowStart: NOW,
      windowEnd: NOW + 30 * DAY,
    });
    const events = result.filter((e) => e.kind === "event");
    expect(events.map((e) => e.date)).toEqual([
      Date.UTC(2026, 10, 20),
      Date.UTC(2026, 10, 21),
      Date.UTC(2026, 10, 22),
    ]);
    expect(events.map((e) => (e.kind === "event" ? e.dayIndex : -1))).toEqual([
      0, 1, 2,
    ]);
    for (const e of events) {
      if (e.kind === "event") expect(e.dayCount).toBe(3);
    }
  });

  it("carries viewerGoing onto every day of a multi-day event", () => {
    const startsAt = Date.UTC(2026, 10, 20, 20, 0, 0);
    const endsAt = Date.UTC(2026, 10, 21, 2, 0, 0);
    const ev = event({ id: "ev_going", startsAt, endsAt });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      currentMemberKey: "me",
      eventRsvps: [
        {
          id: "r1",
          eventId: "ev_going",
          memberKey: "me",
          status: "going",
          respondedAt: 1,
        },
      ],
      windowStart: NOW,
      windowEnd: NOW + 30 * DAY,
    });
    const events = result.filter((e) => e.kind === "event");
    expect(events).toHaveLength(2);
    for (const e of events) {
      expect(e).toMatchObject({ viewerGoing: true });
    }
  });

  it("a cancellation drops ALL days of a multi-day event", () => {
    const startsAt = Date.UTC(2026, 10, 20, 9, 0, 0);
    const endsAt = Date.UTC(2026, 10, 22, 17, 0, 0);
    const ev = event({ id: "ev_cx", startsAt, endsAt });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [cancellation("ev_cx")],
      windowStart: NOW,
      windowEnd: NOW + 30 * DAY,
    });
    expect(result.filter((e) => e.kind === "event")).toHaveLength(0);
  });

  it("clips a span that starts before the window — only in-window days, true dayIndex", () => {
    const w = defaultWindow();
    // Starts two days before windowStart, ends one day after — only the
    // in-window days emit, and the first emitted entry keeps its TRUE
    // position in the event's span (not 0).
    const startsAt = w.windowStart - 2 * DAY;
    const endsAt = w.windowStart + 1 * DAY;
    const ev = event({ id: "ev_clip_start", startsAt, endsAt });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      ...w,
    });
    const events = result.filter((e) => e.kind === "event");
    // The previously-dropped continuing event now appears at all.
    expect(events.length).toBeGreaterThan(0);
    // Every emitted day's floored date is >= the floored window start.
    const windowStartDay = startOfUTCDay(w.windowStart);
    for (const e of events) {
      expect(e.date).toBeGreaterThanOrEqual(windowStartDay);
    }
    // Pre-window days are absent.
    expect(events.some((e) => e.date === startOfUTCDay(startsAt))).toBe(false);
    // The first emitted entry reflects the true span position, not 0.
    const firstDayIndex = events[0].kind === "event" ? events[0].dayIndex : -1;
    expect(firstDayIndex).toBeGreaterThan(0);
  });

  it("clips a span that ends after the window — only in-window days", () => {
    const w = defaultWindow();
    // Starts one day before windowEnd, ends two days after.
    const startsAt = w.windowEnd - 1 * DAY;
    const endsAt = w.windowEnd + 2 * DAY;
    const ev = event({ id: "ev_clip_end", startsAt, endsAt });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      ...w,
    });
    const events = result.filter((e) => e.kind === "event");
    expect(events.length).toBeGreaterThan(0);
    // No emitted day exceeds the window end.
    for (const e of events) {
      expect(e.date).toBeLessThanOrEqual(w.windowEnd);
    }
  });

  it("bounds emission by the window, not a pathological far-future endsAt", () => {
    const w = defaultWindow();
    const startsAt = NOW + 2 * DAY;
    const endsAt = NOW + 5000 * DAY; // absurd far-future end
    const ev = event({ id: "ev_huge", startsAt, endsAt });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      ...w,
    });
    const events = result.filter((e) => e.kind === "event");
    // Window is ~45 days wide; emission is bounded by it, not the raw
    // span. Comfortably under the MAX_EVENT_DAYS clamp too.
    const windowDays = (w.windowEnd - startOfUTCDay(w.windowStart)) / DAY + 1;
    expect(events.length).toBeLessThanOrEqual(Math.ceil(windowDays));
    expect(events.length).toBeLessThanOrEqual(92);
  });

  it("treats a malformed endsAt < startsAt as single-day (no crash)", () => {
    const startsAt = Date.UTC(2026, 10, 20, 12, 0, 0);
    const endsAt = startsAt - 3 * DAY; // ends before it starts
    const ev = event({ id: "ev_bad", startsAt, endsAt });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      windowStart: NOW,
      windowEnd: NOW + 30 * DAY,
    });
    const events = result.filter((e) => e.kind === "event");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ isMultiDay: false, dayCount: 1 });
  });

  it("emits distinct ids for every day of a multi-day event", () => {
    const startsAt = Date.UTC(2026, 10, 20, 9, 0, 0);
    const endsAt = Date.UTC(2026, 10, 23, 17, 0, 0); // 4-day span
    const ev = event({ id: "ev_ids", startsAt, endsAt });
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [ev],
      eventCancellations: [],
      windowStart: NOW,
      windowEnd: NOW + 30 * DAY,
    });
    const ids = result
      .filter((e) => e.kind === "event")
      .map((e) => e.id);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
  });
});

// ─── Density stays exchange-keyed: events MUST NOT count ────────────

describe("buildCalendar — density excludes events (no-leaderboards)", () => {
  it("emits NO density entry when only events occur on a day", () => {
    // Three events on the same UTC day, zero exchanges — density
    // must stay empty. Events factoring into density would
    // re-derive the popularity/attendance signal that the
    // no-leaderboards principle exists to prevent.
    const day = NOW + 2 * DAY;
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [
        event({ id: "ev_a", startsAt: day + 60_000 }),
        event({ id: "ev_b", startsAt: day + 3_600_000 }),
        event({ id: "ev_c", startsAt: day + 7_200_000 }),
      ],
      eventCancellations: [],
      ...defaultWindow(),
    });
    expect(result.some((e) => e.kind === "exchange_density")).toBe(false);
  });

  it("density count comes from exchanges only when both are present", () => {
    const day = NOW - 2 * DAY;
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [
        exchange("ex_1", day + 60_000),
        exchange("ex_2", day + 3_600_000),
      ],
      events: [
        event({ id: "ev_a", startsAt: day + 30_000 }),
        event({ id: "ev_b", startsAt: day + 1_800_000 }),
      ],
      eventCancellations: [],
      ...defaultWindow(),
    });
    const density = result.find((e) => e.kind === "exchange_density");
    expect(density).toBeDefined();
    if (density && density.kind === "exchange_density") {
      // 2 exchanges, NOT 2+2=4 — events don't show up here.
      expect(density.count).toBe(2);
    }
  });
});

// ─── UTC boundary edge cases ────────────────────────────────────────

describe("UTC day boundary", () => {
  it("treats 23:59:59 UTC and 00:00:00 UTC the next day as different days", () => {
    const a = Date.UTC(2026, 5, 15, 23, 59, 59);
    const b = Date.UTC(2026, 5, 16, 0, 0, 0);
    expect(dayKey(a)).not.toBe(dayKey(b));
    expect(startOfUTCDay(a)).not.toBe(startOfUTCDay(b));
  });

  it("places a deadline at 23:00 UTC on its UTC day, not the next", () => {
    // Test the case the design doc names — "a deadline at 23:00 UTC
    // may show as the next day for some members" is a DISPLAY
    // concern. The aggregator places it on the UTC day.
    const deadlineMs = Date.UTC(2026, 10, 20, 23, 0, 0);
    const result = buildCalendar({
      projects: [project({ id: "p_1", deadline: deadlineMs })],
      posts: [],
      exchanges: [],
      windowStart: deadlineMs - DAY,
      windowEnd: deadlineMs + DAY,
    });
    expect(result[0].date).toBe(Date.UTC(2026, 10, 20));
  });
});

// ─── startOfTodayMs ─────────────────────────────────────────────────

describe("startOfTodayMs", () => {
  it("returns local-clock midnight for `now`", () => {
    // We can't fix the test's local TZ from here, but we can assert
    // the invariant: the returned value is at most `now` and within
    // 24h, and `getHours/getMinutes/getSeconds/getMilliseconds` of
    // the result are all 0 in local time.
    const now = Date.now();
    const start = startOfTodayMs(now);
    expect(start).toBeLessThanOrEqual(now);
    expect(now - start).toBeLessThan(24 * 60 * 60 * 1000);
    const d = new Date(start);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });

  it("is idempotent — a value already at local midnight is unchanged", () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const midnight = d.getTime();
    expect(startOfTodayMs(midnight)).toBe(midnight);
  });
});

// ─── entryIsPast ────────────────────────────────────────────────────

describe("entryIsPast — events", () => {
  // Use a synthetic local-midnight anchor: pick a noon timestamp and
  // derive the local-midnight floor from it the same way the helper
  // does, then build entries with offsets from that anchor. This is
  // TZ-stable without needing to mock Date.
  function makeAnchor() {
    const noon = new Date(2026, 5, 15, 12, 0, 0, 0); // local time
    const todayStart = startOfTodayMs(noon.getTime());
    return { noon: noon.getTime(), todayStart };
  }

  function eventEntry(
    startsAt: number,
    endsAt: number | null,
  ): CalendarEntry {
    return {
      kind: "event",
      id: "event:ev",
      date: startOfUTCDay(startsAt),
      eventId: "ev",
      title: "Test event",
      category: "other",
      viewerGoing: false,
      startsAt,
      endsAt,
      location: "anywhere",
      organizerKey: "org",
      path: "/events/ev",
      // Single-day fixture: dayCount 1 routes entryIsPast through the
      // (endsAt ?? startsAt) < startOfTodayMs branch — the same path the
      // pre-multi-day rule took.
      isMultiDay: false,
      dayIndex: 0,
      dayCount: 1,
    };
  }

  it("flags a past event (endsAt strictly before startOfToday) as past", () => {
    const { todayStart } = makeAnchor();
    const startsAt = todayStart - 2 * DAY + 10 * 3_600_000;
    const endsAt = todayStart - 2 * DAY + 12 * 3_600_000;
    expect(entryIsPast(eventEntry(startsAt, endsAt), todayStart)).toBe(true);
  });

  it("keeps today's event visible (startsAt today, endsAt today)", () => {
    const { todayStart } = makeAnchor();
    const startsAt = todayStart + 18 * 3_600_000;
    const endsAt = todayStart + 20 * 3_600_000;
    expect(entryIsPast(eventEntry(startsAt, endsAt), todayStart)).toBe(false);
  });

  it("keeps a multi-day event started yesterday, ending in 3 days, visible", () => {
    const { todayStart } = makeAnchor();
    const startsAt = todayStart - DAY + 9 * 3_600_000;
    const endsAt = todayStart + 3 * DAY + 17 * 3_600_000;
    expect(entryIsPast(eventEntry(startsAt, endsAt), todayStart)).toBe(false);
  });

  it("keeps a future event (startsAt tomorrow) visible", () => {
    const { todayStart } = makeAnchor();
    const startsAt = todayStart + DAY + 10 * 3_600_000;
    const endsAt = todayStart + DAY + 12 * 3_600_000;
    expect(entryIsPast(eventEntry(startsAt, endsAt), todayStart)).toBe(false);
  });

  it("with endsAt null + startsAt yesterday → past", () => {
    const { todayStart } = makeAnchor();
    const startsAt = todayStart - DAY + 10 * 3_600_000;
    expect(entryIsPast(eventEntry(startsAt, null), todayStart)).toBe(true);
  });

  it("with endsAt null + startsAt today → not past", () => {
    const { todayStart } = makeAnchor();
    const startsAt = todayStart + 10 * 3_600_000;
    expect(entryIsPast(eventEntry(startsAt, null), todayStart)).toBe(false);
  });

  // Multi-day events emit one entry per day; entryIsPast judges each
  // day on its own. Build a per-day entry with its own `date` /
  // dayIndex / dayCount the way buildCalendar does.
  function multiDayEntry(
    date: number,
    dayIndex: number,
    dayCount: number,
  ): CalendarEntry {
    return {
      kind: "event",
      id: `event:ev:${dayKey(date)}`,
      date,
      eventId: "ev",
      title: "Multi-day build",
      category: "other",
      viewerGoing: false,
      // startsAt/endsAt point at the whole event; the per-day rule reads
      // `date` + dayCount, not these, for a multi-day entry.
      startsAt: date - 2 * DAY,
      endsAt: date + 2 * DAY,
      location: "anywhere",
      organizerKey: "org",
      path: "/events/ev",
      isMultiDay: dayCount > 1,
      dayIndex,
      dayCount,
    };
  }

  it("multi-day: a start-day entry whose UTC day is fully past → past", () => {
    const { todayStart } = makeAnchor();
    // Day 0 of a 4-day event, two UTC days ago → fully elapsed.
    const startDay = startOfUTCDay(todayStart - 2 * DAY);
    expect(entryIsPast(multiDayEntry(startDay, 0, 4), todayStart)).toBe(true);
  });

  it("multi-day: a sibling entry on a future day stays visible", () => {
    const { todayStart } = makeAnchor();
    const futureDay = startOfUTCDay(todayStart + 2 * DAY);
    expect(entryIsPast(multiDayEntry(futureDay, 3, 4), todayStart)).toBe(false);
  });

  it("multi-day: a day-entry whose date is today → not past", () => {
    const { todayStart } = makeAnchor();
    const todayUtc = startOfUTCDay(todayStart);
    expect(entryIsPast(multiDayEntry(todayUtc, 1, 4), todayStart)).toBe(false);
  });
});

describe("entryIsPast — project_deadline", () => {
  function makeAnchor() {
    const noon = new Date(2026, 5, 15, 12, 0, 0, 0);
    return startOfTodayMs(noon.getTime());
  }

  function deadlineEntry(date: number): CalendarEntry {
    return {
      kind: "project_deadline",
      id: "project_deadline:p1",
      date,
      projectId: "p1",
      projectTitle: "Proj",
      category: "other",
    };
  }

  it("deadline yesterday → past", () => {
    const todayStart = makeAnchor();
    expect(entryIsPast(deadlineEntry(todayStart - DAY), todayStart)).toBe(true);
  });

  it("deadline today → not past", () => {
    const todayStart = makeAnchor();
    expect(entryIsPast(deadlineEntry(todayStart), todayStart)).toBe(false);
  });

  it("deadline tomorrow → not past", () => {
    const todayStart = makeAnchor();
    expect(entryIsPast(deadlineEntry(todayStart + DAY), todayStart)).toBe(false);
  });
});

describe("entryIsPast — post_expiring", () => {
  function makeAnchor() {
    const noon = new Date(2026, 5, 15, 12, 0, 0, 0);
    return startOfTodayMs(noon.getTime());
  }

  function expiringEntry(date: number): CalendarEntry {
    return {
      kind: "post_expiring",
      id: "post_expiring:po1",
      date,
      postId: "po1",
      postTitle: "Post",
      postType: "NEED",
      category: "other",
    };
  }

  it("expiry yesterday → past", () => {
    const todayStart = makeAnchor();
    expect(entryIsPast(expiringEntry(todayStart - DAY), todayStart)).toBe(true);
  });

  it("expiry today → not past", () => {
    const todayStart = makeAnchor();
    expect(entryIsPast(expiringEntry(todayStart), todayStart)).toBe(false);
  });

  it("expiry tomorrow → not past", () => {
    const todayStart = makeAnchor();
    expect(entryIsPast(expiringEntry(todayStart + DAY), todayStart)).toBe(false);
  });
});

describe("entryIsPast — exchange_density (never past)", () => {
  function densityEntry(date: number): CalendarEntry {
    return {
      kind: "exchange_density",
      id: `density:${dayKey(date)}`,
      date,
      count: 1,
    };
  }

  it("returns false for a density row dated last year", () => {
    const todayStart = startOfTodayMs(Date.now());
    expect(entryIsPast(densityEntry(todayStart - 365 * DAY), todayStart)).toBe(
      false,
    );
  });

  it("returns false for a density row dated today", () => {
    const todayStart = startOfTodayMs(Date.now());
    expect(entryIsPast(densityEntry(todayStart), todayStart)).toBe(false);
  });

  it("returns false for a density row dated in the future", () => {
    const todayStart = startOfTodayMs(Date.now());
    expect(entryIsPast(densityEntry(todayStart + 30 * DAY), todayStart)).toBe(
      false,
    );
  });
});
