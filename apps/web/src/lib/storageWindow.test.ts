/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import type { Post, Project, Event, ProjectTask } from "@/types";
import {
  applyWindow,
  collectWindowPlan,
  getWindowHorizonMs,
  maybeCompactWindow,
  planToPreview,
  undoWindowing,
  windowAdmits,
  WINDOW_HORIZON_KEY,
  WINDOW_LOCAL_TABLES,
  WINDOW_PINNED_TABLES,
  WINDOW_WINDOWABLE_TABLES,
  YEAR_MS,
} from "./storageWindow";

const ME = "me-key";
const OTHER = "other-key";
const NOW = Date.now();
const HORIZON = 2 * YEAR_MS;
const OLD = NOW - 3 * YEAR_MS; // past the 2-year cutoff
const RECENT = NOW - 10 * 24 * 60 * 60 * 1000; // inside the window

async function wipe() {
  await Promise.all(db.tables.map((t) => t.clear()));
  await setSetting(SETTING_KEYS.currentMember, ME);
}

function post(over: Partial<Post> & { id: string }): Post {
  return {
    type: "OFFER",
    category: "general",
    title: "t",
    description: "d",
    estimatedHours: 1,
    urgency: "low",
    postedBy: OTHER,
    claimedBy: null,
    status: "completed",
    createdAt: OLD,
    expiresAt: null,
    locationZone: "z",
    confirmedBy: [],
    nodeId: "n",
    signature: "sig",
    ...over,
  } as Post;
}

function event(over: Partial<Event> & { id: string }): Event {
  return {
    kind: "event",
    title: "e",
    description: "d",
    category: "c",
    startsAt: OLD,
    endsAt: OLD + 3600_000,
    location: "l",
    capacity: null,
    templateId: null,
    createdAt: OLD,
    createdBy: OTHER,
    nodeId: "n",
    signature: "sig",
    ...over,
  } as Event;
}

function project(over: Partial<Project> & { id: string }): Project {
  return {
    title: "p",
    description: "d",
    organizerKey: OTHER,
    coOrganizerKeys: [],
    status: "completed",
    createdAt: OLD,
    completedAt: OLD + 1000,
    ...over,
  } as unknown as Project;
}

function task(over: { id: string; projectId: string } & Partial<ProjectTask>) {
  return {
    status: "completed",
    assignedTo: null,
    completedBy: null,
    createdAt: OLD,
    ...over,
  } as unknown as ProjectTask;
}

beforeEach(wipe);

describe("classification drift guard", () => {
  it("every live table is classified in exactly one set", () => {
    const local = new Set<string>(WINDOW_LOCAL_TABLES);
    const pinned = new Set<string>(WINDOW_PINNED_TABLES);
    const windowable = new Set<string>(WINDOW_WINDOWABLE_TABLES);
    const live = db.tables.map((t) => t.name).sort();
    for (const name of live) {
      const hits = [local.has(name), pinned.has(name), windowable.has(name)]
        .filter(Boolean).length;
      // A table added to the schema without a windowing decision is a
      // design gap — decide (and test) before shipping it.
      expect(hits, `table "${name}" must be classified exactly once`).toBe(1);
    }
    const classified = [...local, ...pinned, ...windowable].sort();
    expect(classified).toEqual(live);
  });
});

describe("the walker — pin rules", () => {
  it("drops old settled foreign posts; keeps mine, live, and recent ones", async () => {
    await db.posts.bulkPut([
      post({ id: "drop-settled" }),
      post({ id: "drop-expired", status: "open", expiresAt: OLD }),
      post({ id: "keep-mine", postedBy: ME }),
      post({ id: "keep-claimed-by-me", claimedBy: ME }),
      post({ id: "keep-open", status: "open" }),
      post({ id: "keep-recent", createdAt: RECENT }),
      post({ id: "keep-disputed", status: "disputed" }),
    ]);
    const removed = await applyWindow(HORIZON);
    expect(removed).toBe(2);
    expect((await db.posts.toCollection().primaryKeys()).sort()).toEqual([
      "keep-claimed-by-me",
      "keep-disputed",
      "keep-mine",
      "keep-open",
      "keep-recent",
    ]);
    expect(await getWindowHorizonMs()).toBe(HORIZON);
  });

  it("drops an old event subtree; participation and recency pin", async () => {
    await db.events.bulkPut([
      event({ id: "drop-old" }),
      event({ id: "keep-mine", createdBy: ME }),
      event({ id: "keep-participated" }),
      event({ id: "keep-future", startsAt: NOW + 1000, endsAt: null }),
      event({ id: "keep-cancelled-recently" }),
    ]);
    await db.eventRsvps.bulkPut([
      { id: "r1", eventId: "drop-old", memberKey: OTHER, status: "going", respondedAt: OLD },
      { id: "r2", eventId: "keep-participated", memberKey: ME, status: "going", respondedAt: OLD },
    ] as never[]);
    await db.eventShifts.put({ id: "s1", eventId: "drop-old", label: "x", startsAt: OLD, endsAt: OLD, createdAt: OLD, createdBy: OTHER } as never);
    await db.shiftSignups.put({ id: "su1", shiftId: "s1", eventId: "drop-old", memberKey: OTHER, signedUpAt: OLD } as never);
    await db.eventCancellations.bulkPut([
      { id: "c-old", kind: "event_cancellation", eventId: "drop-old", reason: "", cancelledAt: OLD, createdBy: OTHER, nodeId: "n", signature: "s" },
      { id: "c-recent", kind: "event_cancellation", eventId: "keep-cancelled-recently", reason: "", cancelledAt: RECENT, createdBy: OTHER, nodeId: "n", signature: "s" },
    ] as never[]);

    await applyWindow(HORIZON);

    expect((await db.events.toCollection().primaryKeys()).sort()).toEqual([
      "keep-cancelled-recently",
      "keep-future",
      "keep-mine",
      "keep-participated",
    ]);
    // drop-old's whole subtree went with it…
    expect(await db.eventRsvps.get("r1")).toBeUndefined();
    expect(await db.eventShifts.get("s1")).toBeUndefined();
    expect(await db.shiftSignups.get("su1")).toBeUndefined();
    expect(await db.eventCancellations.get("c-old")).toBeUndefined();
    // …while kept parents keep their children.
    expect(await db.eventRsvps.get("r2")).toBeDefined();
    expect(await db.eventCancellations.get("c-recent")).toBeDefined();
  });

  it("drops an old closed project subtree; my work and open status pin", async () => {
    await db.projects.bulkPut([
      project({ id: "drop-closed" }),
      project({ id: "keep-active", status: "active" }),
      project({ id: "keep-organized", organizerKey: ME }),
      project({ id: "keep-worked" }),
      project({ id: "keep-recent", completedAt: RECENT }),
    ]);
    await db.projectTasks.bulkPut([
      task({ id: "t1", projectId: "drop-closed" }),
      task({ id: "t2", projectId: "keep-worked", assignedTo: ME }),
    ]);
    await db.taskComments.put({ id: "tc1", projectId: "drop-closed", taskId: "t1", authorKey: OTHER, body: "b", createdAt: OLD, deletedAt: null, nodeId: "n", signature: "s" } as never);
    await db.projectActivity.put({ id: "pa1", projectId: "drop-closed", type: "created", actorKey: OTHER, createdAt: OLD, data: {} } as never);
    await db.coorgInvitations.put({ id: "ci1", projectId: "drop-closed", inviterKey: OTHER, inviteeKey: OTHER, createdAt: OLD, expiresAt: OLD, nodeId: "n", signature: "s" } as never);
    await db.coorgInvitationResponses.put({ id: "cr1", invitationId: "ci1", inviteeKey: OTHER, decision: "accept", decidedAt: OLD, nodeId: "n", signature: "s" } as never);

    await applyWindow(HORIZON);

    expect((await db.projects.toCollection().primaryKeys()).sort()).toEqual([
      "keep-active",
      "keep-organized",
      "keep-recent",
      "keep-worked",
    ]);
    expect(await db.projectTasks.get("t1")).toBeUndefined();
    expect(await db.taskComments.get("tc1")).toBeUndefined();
    expect(await db.projectActivity.get("pa1")).toBeUndefined();
    expect(await db.coorgInvitations.get("ci1")).toBeUndefined();
    expect(await db.coorgInvitationResponses.get("cr1")).toBeUndefined();
    expect(await db.projectTasks.get("t2")).toBeDefined();
  });

  it("preview counts equal what apply deletes, and pinned tables are untouched", async () => {
    await db.posts.bulkPut([post({ id: "a" }), post({ id: "b", postedBy: ME })]);
    await db.events.put(event({ id: "e" }));
    await db.exchanges.put({ id: "x", postId: "a", helperKey: OTHER, helpedKey: OTHER, completedAt: OLD } as never);
    await db.vouches.put({ id: "v" } as never);

    const plan = await collectWindowPlan(HORIZON);
    const preview = planToPreview(plan);
    expect(preview).toMatchObject({ posts: 1, events: 1, projects: 0 });
    const removed = await applyWindow(HORIZON);
    expect(removed).toBe(preview.total);
    // The ledger and trust graph never window — even when a windowed
    // post is what an exchange refers to.
    expect(await db.exchanges.get("x")).toBeDefined();
    expect(await db.vouches.get("v")).toBeDefined();
  });
});

describe("the merge-time admission guard", () => {
  it("admits everything on an unwindowed device", async () => {
    expect(await windowAdmits("post", { ageAt: OLD, post: post({ id: "p" }) })).toBe(true);
    expect(await windowAdmits("event_child", { ageAt: OLD, parentPresent: false })).toBe(true);
  });

  it("refuses what the walker would delete — the mirror-switch resurrection scenario", async () => {
    await setSetting(WINDOW_HORIZON_KEY, String(HORIZON));
    // A fresh cursor (mirror failover / node move) re-offers the
    // archive; the guard, not the cursor, keeps it out.
    expect(await windowAdmits("post", { ageAt: OLD, post: post({ id: "p" }) })).toBe(false);
    expect(await windowAdmits("post", { ageAt: OLD, post: post({ id: "p", postedBy: ME }) })).toBe(true);
    expect(await windowAdmits("post", { ageAt: RECENT, post: post({ id: "p", createdAt: RECENT }) })).toBe(true);
    expect(await windowAdmits("event", { ageAt: OLD, event: event({ id: "e" }) })).toBe(false);
    expect(await windowAdmits("event", { ageAt: OLD, event: event({ id: "e", createdBy: ME }) })).toBe(true);
    expect(await windowAdmits("project", { ageAt: OLD, project: project({ id: "pr" }) })).toBe(false);
    expect(await windowAdmits("project", { ageAt: OLD, project: project({ id: "pr", status: "active" }) })).toBe(true);
  });

  it("my old participation pins its event against the guard", async () => {
    await setSetting(WINDOW_HORIZON_KEY, String(HORIZON));
    await db.eventRsvps.put({ id: "r", eventId: "e1", memberKey: ME, status: "going", respondedAt: OLD } as never);
    expect(await windowAdmits("event", { ageAt: OLD, event: event({ id: "e1" }) })).toBe(true);
  });

  it("children: parent present admits; absent parent admits fresh rows and refuses old ones", async () => {
    await setSetting(WINDOW_HORIZON_KEY, String(HORIZON));
    expect(await windowAdmits("event_child", { ageAt: OLD, parentPresent: true })).toBe(true);
    expect(await windowAdmits("event_child", { ageAt: RECENT, parentPresent: false })).toBe(true);
    expect(await windowAdmits("event_child", { ageAt: OLD, parentPresent: false })).toBe(false);
    // A recent cancellation tombstone converges even without its event.
    expect(await windowAdmits("event_cancellation", { ageAt: RECENT, parentPresent: false })).toBe(true);
    expect(await windowAdmits("event_cancellation", { ageAt: OLD, parentPresent: false })).toBe(false);
  });
});

describe("undo and scheduled re-compaction", () => {
  it("undo clears the horizon and every pull cursor, primary and mirror-scoped", async () => {
    await setSetting(WINDOW_HORIZON_KEY, String(HORIZON));
    await setSetting("federationLastPostPull", "123");
    await setSetting("federationLastEventPull::a1b2c3d4", "456");
    await setSetting("reseedCursor::x::/posts", "keep-me");
    await undoWindowing();
    expect(await getWindowHorizonMs()).toBeNull();
    expect(await getSetting("federationLastPostPull")).toBeUndefined();
    expect(await getSetting("federationLastEventPull::a1b2c3d4")).toBeUndefined();
    // Re-seed cursors are UPLOAD offsets — resetting them is not the
    // undo's business.
    expect(await getSetting("reseedCursor::x::/posts")).toBe("keep-me");
  });

  it("maybeCompactWindow is a no-op unwindowed, compacts when due, and respects the daily interval", async () => {
    await db.posts.put(post({ id: "old-post" }));
    await maybeCompactWindow();
    expect(await db.posts.get("old-post")).toBeDefined();

    await setSetting(WINDOW_HORIZON_KEY, String(HORIZON));
    await maybeCompactWindow();
    expect(await db.posts.get("old-post")).toBeUndefined();

    // Within the interval nothing runs again (a new old row survives).
    await db.posts.put(post({ id: "old-post-2" }));
    await maybeCompactWindow();
    expect(await db.posts.get("old-post-2")).toBeDefined();
    // Past the interval it compacts again.
    await maybeCompactWindow(Date.now() + 25 * 60 * 60 * 1000);
    expect(await db.posts.get("old-post-2")).toBeUndefined();
  });
});
