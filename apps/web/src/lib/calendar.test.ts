/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
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
  groupByDay,
  startOfUTCDay,
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

  it("respects the window bounds on startsAt", () => {
    const w = defaultWindow();
    const result = buildCalendar({
      projects: [],
      posts: [],
      exchanges: [],
      events: [
        event({ id: "before", startsAt: w.windowStart - 1 }),
        event({ id: "after", startsAt: w.windowEnd + 1 }),
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
