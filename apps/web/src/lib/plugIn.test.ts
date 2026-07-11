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
import { describe, expect, it } from "vitest";
import { buildPlugInShelf, tokenize, type PlugInInputs } from "./plugIn";
import type {
  Event,
  EventShiftRow,
  Post,
  Project,
  ProjectTask,
  ShiftSignupRow,
} from "@/types";

// Pure-matcher tests for the "ways to plug in" shelf
// (docs/ways-to-plug-in.md). The lens is deliberately dumb token
// overlap — these tests pin the SPLIT (matched vs remainder), the
// EXCLUSIONS (mine, full, passed, expired), and the ORDERING, not any
// cleverness.

const ME = "me-key";
const OTHER = "other-key";
const NOW = 1_700_000_000_000;
const HOUR = 3_600_000;

let seq = 0;
const nextId = (p: string) => `${p}_${++seq}`;

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: nextId("post"),
    type: "NEED",
    category: "food",
    title: "Restock the shared pantry",
    description: "",
    estimatedHours: 2,
    urgency: "medium",
    postedBy: OTHER,
    claimedBy: null,
    status: "open",
    createdAt: NOW - HOUR,
    expiresAt: null,
    locationZone: "north",
    confirmedBy: [],
    nodeId: "node_test",
    signature: "",
    ...overrides,
  };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: nextId("proj"),
    title: "Community fridge",
    description: "",
    category: "infrastructure",
    organizerKey: OTHER,
    coOrganizerKeys: [],
    status: "active",
    targetHours: 40,
    contributedHours: 0,
    deadline: null,
    createdAt: NOW - 10 * HOUR,
    completedAt: null,
    pauseNote: null,
    locationZone: "north",
    tags: [],
    nodeId: "node_test",
    templateId: null,
    ...overrides,
  };
}

function task(
  projectId: string,
  overrides: Partial<ProjectTask> = {},
): ProjectTask {
  return {
    id: nextId("task"),
    projectId,
    title: "Paint the cabinet",
    description: "",
    category: "skilled_labor",
    estimatedHours: 3,
    urgency: "medium",
    requiredSkills: [],
    actualHours: null,
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 1000,
    createdAt: NOW - 5 * HOUR,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
    checkInAcknowledgedAt: null,
    ...overrides,
  };
}

function event(overrides: Partial<Event> = {}): Event {
  return {
    id: nextId("event"),
    kind: "event",
    title: "Repair café",
    description: "",
    category: "repair",
    startsAt: NOW + 24 * HOUR,
    endsAt: NOW + 28 * HOUR,
    location: "Community room",
    capacity: null,
    templateId: null,
    createdAt: NOW - 2 * HOUR,
    createdBy: OTHER,
    nodeId: "node_test",
    signature: "",
    ...overrides,
  };
}

function shift(
  eventId: string,
  overrides: Partial<EventShiftRow> = {},
): EventShiftRow {
  return {
    id: nextId("shift"),
    eventId,
    label: "Setup crew",
    startsAt: NOW + 24 * HOUR,
    endsAt: NOW + 26 * HOUR,
    capacity: null,
    createdBy: OTHER,
    createdAt: NOW - 2 * HOUR,
    ...overrides,
  };
}

function signup(
  s: EventShiftRow,
  memberKey: string,
): ShiftSignupRow {
  return {
    id: nextId("signup"),
    shiftId: s.id,
    eventId: s.eventId,
    memberKey,
    signedUpAt: NOW - HOUR,
  };
}

function build(partial: Partial<PlugInInputs>): ReturnType<typeof buildPlugInShelf> {
  return buildPlugInShelf({
    memberKey: ME,
    skills: [],
    posts: [],
    tasks: [],
    projects: [],
    events: [],
    shifts: [],
    signups: [],
    now: NOW,
    ...partial,
  });
}

describe("tokenize", () => {
  it("keeps the whole lowercased string AND parts ≥ 3 chars", () => {
    const t = tokenize("Bike Repair", "skilled_labor");
    expect(t.has("bike repair")).toBe(true);
    expect(t.has("bike")).toBe(true);
    expect(t.has("repair")).toBe(true);
    expect(t.has("skilled_labor")).toBe(true);
    expect(t.has("skilled")).toBe(true);
    expect(t.has("labor")).toBe(true);
  });

  it("drops short fragments and empty strings", () => {
    const t = tokenize("go to", "  ");
    expect(t.has("to")).toBe(false);
    expect(t.has("go")).toBe(false);
    expect(t.has("go to")).toBe(true);
    expect(t.has("")).toBe(false);
  });
});

describe("the lens (§2 + ruling R2)", () => {
  it("is built from profile skills plus the member's own open OFFER posts", () => {
    const shelf = build({
      skills: ["carpentry"],
      posts: [
        post({
          type: "OFFER",
          postedBy: ME,
          category: "repairs" as Post["category"],
          title: "Bike fixing",
        }),
        // closed offers and other people's offers contribute nothing
        post({ type: "OFFER", postedBy: ME, status: "completed", title: "Old offer plumbing" }),
        post({ type: "OFFER", postedBy: OTHER, title: "Their offer welding" }),
      ],
    });
    expect(shelf.lensTokens).toContain("carpentry");
    expect(shelf.lensTokens).toContain("bike");
    expect(shelf.lensTokens).not.toContain("plumbing");
    expect(shelf.lensTokens).not.toContain("welding");
  });

  it("empty lens → everything lands in the remainder, nothing is hidden (§3.4)", () => {
    const ev = event();
    const s = shift(ev.id);
    const p = project();
    const shelf = build({
      posts: [post()],
      events: [ev],
      shifts: [s],
      projects: [p],
      tasks: [task(p.id)],
    });
    expect(shelf.lensTokens).toEqual([]);
    expect(shelf.matched.shifts).toHaveLength(0);
    expect(shelf.matched.needs).toHaveLength(0);
    expect(shelf.matched.tasks).toHaveLength(0);
    expect(shelf.remainder.shifts).toHaveLength(1);
    expect(shelf.remainder.needs).toHaveLength(1);
    expect(shelf.remainder.tasks).toHaveLength(1);
  });
});

describe("shifts section (§3.1)", () => {
  it("matches on label/event tokens and reports what matched", () => {
    const ev = event({ title: "Repair café" });
    const s = shift(ev.id, { label: "Bike triage" });
    const shelf = build({
      skills: ["bike repair"],
      events: [ev],
      shifts: [s],
    });
    expect(shelf.matched.shifts).toHaveLength(1);
    expect(shelf.matched.shifts[0].matchedOn).toContain("bike");
    expect(shelf.matched.shifts[0].spotsOpen).toBeNull();
  });

  it("excludes my own signups, my own events, passed shifts, and full shifts", () => {
    const evMine = event({ createdBy: ME });
    const evPassed = event();
    const evFull = event();
    const evSigned = event();
    const sMineEvent = shift(evMine.id);
    const sPassed = shift(evPassed.id, { startsAt: NOW - HOUR, endsAt: NOW });
    const sFull = shift(evFull.id, { capacity: 1 });
    const sSigned = shift(evSigned.id);
    const shelf = build({
      events: [evMine, evPassed, evFull, evSigned],
      shifts: [sMineEvent, sPassed, sFull, sSigned],
      signups: [signup(sFull, OTHER), signup(sSigned, ME)],
    });
    expect(shelf.matched.shifts).toHaveLength(0);
    expect(shelf.remainder.shifts).toHaveLength(0);
  });

  it("counts spots open against capacity and sorts by start time", () => {
    const ev = event();
    const late = shift(ev.id, { startsAt: NOW + 48 * HOUR, capacity: 3 });
    const soon = shift(ev.id, { startsAt: NOW + 2 * HOUR, capacity: 3 });
    const shelf = build({
      events: [ev],
      shifts: [late, soon],
      signups: [signup(late, OTHER)],
    });
    expect(shelf.remainder.shifts.map((x) => x.shift.id)).toEqual([
      soon.id,
      late.id,
    ]);
    expect(shelf.remainder.shifts[1].spotsOpen).toBe(2);
  });
});

describe("needs section (§3.2)", () => {
  it("excludes my own posts, non-open posts, expired posts, and OFFERs", () => {
    const shelf = build({
      posts: [
        post({ postedBy: ME }),
        post({ status: "claimed" }),
        post({ expiresAt: NOW - 1 }),
        post({ type: "OFFER" }),
      ],
    });
    expect(shelf.matched.needs).toHaveLength(0);
    expect(shelf.remainder.needs).toHaveLength(0);
  });

  it("ranks by urgency then newest", () => {
    const low = post({ urgency: "low", createdAt: NOW - HOUR });
    const highOld = post({ urgency: "high", createdAt: NOW - 3 * HOUR });
    const highNew = post({ urgency: "high", createdAt: NOW - HOUR });
    const shelf = build({ posts: [low, highOld, highNew] });
    expect(shelf.remainder.needs.map((n) => n.post.id)).toEqual([
      highNew.id,
      highOld.id,
      low.id,
    ]);
  });

  it("splits matched from remainder by category/title overlap", () => {
    const garden = post({ category: "other", title: "Weed the garden beds" });
    const ride = post({ category: "transport", title: "Ride to clinic" });
    const shelf = build({ skills: ["garden"], posts: [garden, ride] });
    expect(shelf.matched.needs.map((n) => n.post.id)).toEqual([garden.id]);
    expect(shelf.remainder.needs.map((n) => n.post.id)).toEqual([ride.id]);
  });
});

describe("tasks section (§3.3)", () => {
  it("only open tasks in active projects appear", () => {
    const active = project();
    const paused = project({ status: "paused" });
    const shelf = build({
      projects: [active, paused],
      tasks: [
        task(active.id),
        task(active.id, { status: "claimed" }),
        task(paused.id),
        task("ghost-project"),
      ],
    });
    expect(
      shelf.remainder.tasks.length + shelf.matched.tasks.length,
    ).toBe(1);
  });

  it("matches on requiredSkills and reports the overlap", () => {
    const p = project();
    const t = task(p.id, { requiredSkills: ["carpentry", "patience"] });
    const shelf = build({
      skills: ["Carpentry"],
      projects: [p],
      tasks: [t],
    });
    expect(shelf.matched.tasks).toHaveLength(1);
    expect(shelf.matched.tasks[0].matchedOn).toContain("carpentry");
  });

  it("dependency-blocked tasks sort LAST with their unmet titles — never hidden", () => {
    const p = project();
    const dep = task(p.id, { title: "Pour the base", orderIndex: 500 });
    const blocked = task(p.id, {
      title: "Anchor the frame",
      dependencies: [dep.id],
      orderIndex: 250, // would sort first by index alone
    });
    const done = task(p.id, { status: "completed", title: "Done thing" });
    const alsoBlockedByDone = task(p.id, {
      dependencies: [done.id],
      orderIndex: 750,
    });
    const shelf = build({ projects: [p], tasks: [dep, blocked, done, alsoBlockedByDone] });
    const ids = shelf.remainder.tasks.map((x) => x.task.id);
    // completed dep counts as met, so alsoBlockedByDone is workable
    expect(ids).toEqual([dep.id, alsoBlockedByDone.id, blocked.id]);
    const blockedEntry = shelf.remainder.tasks.find((x) => x.task.id === blocked.id);
    expect(blockedEntry?.blockedByTitles).toEqual(["Pour the base"]);
  });
});
