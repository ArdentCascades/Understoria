/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { hasOpenTasks, projectNeedsMoreHands } from "./projectFilter";
import type { ProjectTask, ProjectTaskStatus } from "@/types";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-05-23T12:00:00Z").getTime();
const CONFIG = {
  taskCheckInDays: 7,
  taskNeedsHelpDays: 14,
  taskCheckInGraceDays: 3,
};

function claimedTask(
  id: string,
  projectId: string,
  overrides: Partial<ProjectTask> = {},
): ProjectTask {
  return {
    id,
    projectId,
    title: "Test task",
    description: "",
    category: "other",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: "alice",
    status: "claimed",
    dependencies: [],
    orderIndex: 0,
    createdAt: NOW - 30 * DAY,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    // 20 days ago, no ack — past both the needs-help floor and the
    // grace window, so this is `needs_more_hands` by default.
    claimedAt: NOW - 20 * DAY,
    actualHours: null,
    checkInAcknowledgedAt: null,
    ...overrides,
  };
}

function makeTask(
  id: string,
  projectId: string,
  status: ProjectTaskStatus,
): ProjectTask {
  return {
    id,
    projectId,
    title: "Test task",
    description: "",
    category: "other",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status,
    dependencies: [],
    orderIndex: 0,
    createdAt: 0,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
    actualHours: null,
    checkInAcknowledgedAt: null,
  };
}

describe("projectFilter — hasOpenTasks", () => {
  it("returns false when the project has no tasks at all", () => {
    const tasks = [
      makeTask("t1", "other-project", "open"),
      makeTask("t2", "other-project", "claimed"),
    ];
    expect(hasOpenTasks("p1", tasks)).toBe(false);
  });

  it("returns false when every task on the project is non-open", () => {
    const tasks: ProjectTask[] = [
      makeTask("t1", "p1", "claimed"),
      makeTask("t2", "p1", "awaiting_confirmation"),
      makeTask("t3", "p1", "completed"),
      makeTask("t4", "p1", "blocked"),
    ];
    expect(hasOpenTasks("p1", tasks)).toBe(false);
  });

  it("returns true when exactly one task on the project is open", () => {
    const tasks = [
      makeTask("t1", "p1", "claimed"),
      makeTask("t2", "p1", "open"),
      makeTask("t3", "p1", "completed"),
    ];
    expect(hasOpenTasks("p1", tasks)).toBe(true);
  });

  it("returns true when multiple tasks on the project are open", () => {
    const tasks = [
      makeTask("t1", "p1", "open"),
      makeTask("t2", "p1", "open"),
      makeTask("t3", "p1", "claimed"),
    ];
    expect(hasOpenTasks("p1", tasks)).toBe(true);
  });

  it("ignores open tasks that belong to other projects", () => {
    const tasks = [
      makeTask("t1", "other-project", "open"),
      makeTask("t2", "p1", "claimed"),
      makeTask("t3", "p1", "completed"),
    ];
    expect(hasOpenTasks("p1", tasks)).toBe(false);
  });

  it("returns false for an empty tasks array", () => {
    expect(hasOpenTasks("p1", [])).toBe(false);
  });
});

describe("projectFilter — projectNeedsMoreHands", () => {
  it("returns true when a claimed task has gone long-silent", () => {
    const tasks = [claimedTask("t1", "p1")];
    expect(projectNeedsMoreHands("p1", tasks, CONFIG, NOW)).toBe(true);
  });

  it("returns false when the claimer recently acknowledged the nudge", () => {
    const tasks = [
      claimedTask("t1", "p1", { checkInAcknowledgedAt: NOW - 1 * DAY }),
    ];
    expect(projectNeedsMoreHands("p1", tasks, CONFIG, NOW)).toBe(false);
  });

  it("returns false for a dependency-blocked stale claim (issue is upstream, not capacity)", () => {
    const tasks = [
      makeTask("dep", "p1", "open"),
      claimedTask("blocked", "p1", { dependencies: ["dep"] }),
    ];
    expect(projectNeedsMoreHands("p1", tasks, CONFIG, NOW)).toBe(false);
  });

  it("returns false when the project has only open tasks", () => {
    const tasks = [
      makeTask("t1", "p1", "open"),
      makeTask("t2", "p1", "open"),
    ];
    expect(projectNeedsMoreHands("p1", tasks, CONFIG, NOW)).toBe(false);
  });

  it("ignores a long-silent claim that belongs to another project", () => {
    const tasks = [claimedTask("t1", "other-project")];
    expect(projectNeedsMoreHands("p1", tasks, CONFIG, NOW)).toBe(false);
  });

  it("returns false for an empty tasks array", () => {
    expect(projectNeedsMoreHands("p1", [], CONFIG, NOW)).toBe(false);
  });
});
