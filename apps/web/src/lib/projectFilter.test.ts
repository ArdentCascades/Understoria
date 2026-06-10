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
import { hasOpenTasks } from "./projectFilter";
import type { ProjectTask, ProjectTaskStatus } from "@/types";

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
