/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db, getSetting, SETTING_KEYS } from "@/db/database";
import {
  parseLastTouched,
  recordTaskTouch,
  resolveLastTouched,
} from "./lastTouched";
import type { Project, ProjectTask } from "@/types";

// "Pick up where you left off" — the interruption-recovery pointer.
// Under test: the settings-row write, the tolerant parse, and the
// resolver's staleness rules (the doorway must never render a dead or
// someone-else's link).

const ME = "me-key";

function makeProject(id: string): Project {
  return {
    id,
    title: `Project ${id}`,
    description: "",
    category: "food",
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
    nodeId: "n1",
    templateId: null,
  };
}

function makeTask(over: Partial<ProjectTask> & { id: string }): ProjectTask {
  return {
    projectId: "p1",
    title: `Task ${over.id}`,
    description: "",
    category: "food",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: ME,
    status: "claimed",
    dependencies: [],
    orderIndex: 1000,
    createdAt: 0,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: 100,
    actualHours: null,
    checkInAcknowledgedAt: null,
    ...over,
  };
}

beforeEach(async () => {
  await db.settings.clear();
});

describe("recordTaskTouch + parseLastTouched", () => {
  it("writes a parseable pointer to the settings row", async () => {
    recordTaskTouch("t1", "p1");
    // Fire-and-forget write — give it a beat.
    await new Promise((r) => setTimeout(r, 20));
    const raw = await getSetting(SETTING_KEYS.lastTouchedTask);
    const parsed = parseLastTouched(raw);
    expect(parsed?.taskId).toBe("t1");
    expect(parsed?.projectId).toBe("p1");
    expect(typeof parsed?.at).toBe("number");
  });

  it("reads absent or malformed settings as null", () => {
    expect(parseLastTouched(undefined)).toBeNull();
    expect(parseLastTouched("not json")).toBeNull();
    expect(parseLastTouched('{"taskId":42}')).toBeNull();
  });
});

describe("resolveLastTouched — staleness rules", () => {
  const pointer = { taskId: "t1", projectId: "p1", at: 1 };
  const project = makeProject("p1");

  it("resolves a live pointer to its task and project", () => {
    const task = makeTask({ id: "t1" });
    const hit = resolveLastTouched(pointer, ME, [task], [project]);
    expect(hit?.task.id).toBe("t1");
    expect(hit?.project.id).toBe("p1");
  });

  it("keeps resolving through awaiting_confirmation", () => {
    const task = makeTask({ id: "t1", status: "awaiting_confirmation" });
    expect(resolveLastTouched(pointer, ME, [task], [project])).not.toBeNull();
  });

  it("goes stale when the task is released, confirmed, gone, or someone else's", () => {
    expect(
      resolveLastTouched(
        pointer,
        ME,
        [makeTask({ id: "t1", status: "open", assignedTo: null })],
        [project],
      ),
    ).toBeNull();
    expect(
      resolveLastTouched(
        pointer,
        ME,
        [makeTask({ id: "t1", status: "completed" })],
        [project],
      ),
    ).toBeNull();
    expect(resolveLastTouched(pointer, ME, [], [project])).toBeNull();
    expect(
      resolveLastTouched(
        pointer,
        ME,
        [makeTask({ id: "t1", assignedTo: "other" })],
        [project],
      ),
    ).toBeNull();
  });

  it("goes stale when the project row is missing", () => {
    expect(
      resolveLastTouched(pointer, ME, [makeTask({ id: "t1" })], []),
    ).toBeNull();
  });

  it("resolves nothing without a member", () => {
    expect(
      resolveLastTouched(pointer, undefined, [makeTask({ id: "t1" })], [project]),
    ).toBeNull();
  });
});
