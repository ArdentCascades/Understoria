/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { shuffleCandidates, smallThingCandidates } from "./oneSmallThing";
import type { Post, Project, ProjectTask } from "@/types";

// The "one small thing" selector: feasibility filters + hour-sized
// preference, deliberately NOT a recommender (no ranking, no history).

const ME = "me-key";
const OTHER = "other-key";

function makeProject(over: Partial<Project> & { id: string }): Project {
  return {
    title: `Project ${over.id}`,
    description: "",
    category: "food",
    organizerKey: OTHER,
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
    nodeId: "n1",
    templateId: null,
    ...over,
  };
}

function makeTask(
  over: Partial<ProjectTask> & { id: string; projectId: string },
): ProjectTask {
  return {
    title: `Task ${over.id}`,
    description: "",
    category: "food",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 1000,
    createdAt: 0,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
    actualHours: null,
    checkInAcknowledgedAt: null,
    ...over,
  };
}

function makePost(over: Partial<Post> & { id: string }): Post {
  return {
    type: "NEED",
    title: `Post ${over.id}`,
    description: "",
    category: "food",
    estimatedHours: 1,
    urgency: "low",
    status: "open",
    postedBy: OTHER,
    claimedBy: null,
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    nodeId: "n1",
    signature: "",
    ...over,
  } as Post;
}

const NONE = new Set<string>();

describe("smallThingCandidates — feasibility", () => {
  it("offers open tasks in others' active projects and open NEEDs by others", () => {
    const out = smallThingCandidates({
      memberKey: ME,
      tasks: [makeTask({ id: "t1", projectId: "p1" })],
      projects: [makeProject({ id: "p1" })],
      posts: [makePost({ id: "n1" })],
      blockedKeys: NONE,
    });
    expect(out.map((c) => `${c.kind}:${c.id}`).sort()).toEqual([
      "post:n1",
      "task:t1",
    ]);
    expect(out.find((c) => c.kind === "task")?.to).toBe("/project/p1/task/t1");
    expect(out.find((c) => c.kind === "post")?.to).toBe("/post/n1");
  });

  it("excludes what the viewer can't claim: own projects, non-active projects, non-open items, own posts, blocked authors", () => {
    const out = smallThingCandidates({
      memberKey: ME,
      tasks: [
        makeTask({ id: "mine-org", projectId: "p-mine" }),
        makeTask({ id: "mine-coorg", projectId: "p-coorg" }),
        makeTask({ id: "paused", projectId: "p-paused" }),
        makeTask({ id: "claimed", projectId: "p1", status: "claimed" }),
        makeTask({ id: "orphan", projectId: "p-gone" }),
      ],
      projects: [
        makeProject({ id: "p-mine", organizerKey: ME }),
        makeProject({ id: "p-coorg", coOrganizerKeys: [ME] }),
        makeProject({ id: "p-paused", status: "paused" }),
        makeProject({ id: "p1" }),
      ],
      posts: [
        makePost({ id: "own", postedBy: ME }),
        makePost({ id: "offer", type: "OFFER" }),
        makePost({ id: "taken", status: "claimed" }),
        makePost({ id: "blocked-author", postedBy: "bad" }),
      ],
      blockedKeys: new Set(["bad"]),
    });
    expect(out).toEqual([]);
  });

  it("prefers hour-sized items when any exist, falls back to everything otherwise", () => {
    const base = {
      memberKey: ME,
      projects: [makeProject({ id: "p1" })],
      blockedKeys: NONE,
    };
    const mixed = smallThingCandidates({
      ...base,
      tasks: [
        makeTask({ id: "small", projectId: "p1", estimatedHours: 1 }),
        makeTask({ id: "big", projectId: "p1", estimatedHours: 6 }),
        makeTask({ id: "unsized", projectId: "p1", estimatedHours: 0 }),
      ],
      posts: [makePost({ id: "big-need", estimatedHours: 3 })],
    });
    expect(mixed.map((c) => c.id)).toEqual(["small"]);

    const allBig = smallThingCandidates({
      ...base,
      tasks: [makeTask({ id: "big", projectId: "p1", estimatedHours: 6 })],
      posts: [makePost({ id: "big-need", estimatedHours: 3 })],
    });
    expect(allBig.map((c) => c.id).sort()).toEqual(["big", "big-need"]);
  });
});

describe("shuffleCandidates", () => {
  it("permutes without loss", () => {
    const input = Array.from({ length: 20 }, (_, i) => i);
    const out = shuffleCandidates(input);
    expect([...out].sort((a, b) => a - b)).toEqual(input);
    expect(input).toEqual(Array.from({ length: 20 }, (_, i) => i));
  });
});
