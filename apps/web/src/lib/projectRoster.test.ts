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
import { workingAlongsideKeys } from "./projectRoster";
import type { ProjectTask } from "@/types";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-05-23T12:00:00Z").getTime();
const CONFIG = {
  taskCheckInDays: 7,
  taskNeedsHelpDays: 14,
  taskCheckInGraceDays: 3,
};
const NO_BLOCKS = new Set<string>();

function task(overrides: Partial<ProjectTask> = {}): ProjectTask {
  return {
    id: "t1",
    projectId: "p1",
    title: "T",
    description: "",
    category: "other",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 0,
    createdAt: NOW - 30 * DAY,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
    checkInAcknowledgedAt: null,
    ...overrides,
  };
}

describe("workingAlongsideKeys", () => {
  it("returns an empty set when no task has hands on it", () => {
    const tasks = [task({ id: "a", status: "open" })];
    expect(workingAlongsideKeys(tasks, CONFIG, NO_BLOCKS, NOW).size).toBe(0);
  });

  it("includes claimers and completers, and dedupes a member across tasks", () => {
    const tasks = [
      task({
        id: "a",
        status: "claimed",
        assignedTo: "alice",
        claimedAt: NOW - 1 * DAY,
      }),
      task({
        id: "b",
        status: "completed",
        completedBy: "bob",
        completedAt: NOW - 2 * DAY,
      }),
      // alice again, this time as a completer — must not double-count.
      task({
        id: "c",
        status: "awaiting_confirmation",
        assignedTo: "alice",
        completedBy: "alice",
        claimedAt: NOW - 2 * DAY,
      }),
    ];
    const keys = workingAlongsideKeys(tasks, CONFIG, NO_BLOCKS, NOW);
    expect([...keys].sort()).toEqual(["alice", "bob"]);
  });

  it("suppresses the claimer of a needs_more_hands task (the row hides the name)", () => {
    const tasks = [
      task({
        id: "stale",
        status: "claimed",
        assignedTo: "carol",
        // 20 days ago, no ack — past both the needs-help floor and the
        // grace window, so the public chip fires and the name is dropped.
        claimedAt: NOW - 20 * DAY,
      }),
    ];
    expect(workingAlongsideKeys(tasks, CONFIG, NO_BLOCKS, NOW).has("carol")).toBe(
      false,
    );
  });

  it("still lists a suppressed claimer who has non-suppressed hands elsewhere", () => {
    const tasks = [
      task({
        id: "stale",
        status: "claimed",
        assignedTo: "carol",
        claimedAt: NOW - 20 * DAY,
      }),
      task({
        id: "fresh",
        status: "claimed",
        assignedTo: "carol",
        claimedAt: NOW - 1 * DAY,
      }),
    ];
    expect(workingAlongsideKeys(tasks, CONFIG, NO_BLOCKS, NOW).has("carol")).toBe(
      true,
    );
  });

  it("does NOT suppress a dependency-blocked stale claim (the row still names them)", () => {
    // The blocking task is incomplete, so canClaimTask is false and
    // taskCheckInState returns 'fresh' — no chip, name stays.
    const tasks = [
      task({ id: "dep", status: "open" }),
      task({
        id: "blocked-claim",
        status: "claimed",
        assignedTo: "dana",
        claimedAt: NOW - 20 * DAY,
        dependencies: ["dep"],
      }),
    ];
    expect(workingAlongsideKeys(tasks, CONFIG, NO_BLOCKS, NOW).has("dana")).toBe(
      true,
    );
  });

  it("excludes blocked members from both the claim and completion paths", () => {
    const tasks = [
      task({
        id: "a",
        status: "claimed",
        assignedTo: "blocked-claimer",
        claimedAt: NOW - 1 * DAY,
      }),
      task({
        id: "b",
        status: "completed",
        completedBy: "blocked-completer",
        completedAt: NOW - 1 * DAY,
      }),
      task({
        id: "c",
        status: "claimed",
        assignedTo: "ok",
        claimedAt: NOW - 1 * DAY,
      }),
    ];
    const blocked = new Set(["blocked-claimer", "blocked-completer"]);
    const keys = workingAlongsideKeys(tasks, CONFIG, blocked, NOW);
    expect([...keys]).toEqual(["ok"]);
  });
});
