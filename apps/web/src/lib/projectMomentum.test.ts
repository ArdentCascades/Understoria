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
import { computeProjectMomentum } from "./projectMomentum";
import type { Exchange, Project, ProjectTask } from "@/types";

const DAY = 24 * 60 * 60 * 1000;
const nodeId = "node_momentum_test";

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj_1",
    title: "T",
    description: "",
    category: "infrastructure",
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
    nodeId,
    templateId: null,
    ...overrides,
  };
}

function task(id: string, exchangeId: string | null = null): ProjectTask {
  return {
    id,
    projectId: "proj_1",
    title: "t",
    description: "",
    category: "infrastructure",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status: exchangeId ? "completed" : "open",
    dependencies: [],
    orderIndex: 0,
    createdAt: 0,
    completedAt: exchangeId ? 0 : null,
    completedBy: null,
    exchangeId,
    claimedAt: null,
    actualHours: null,
    checkInAcknowledgedAt: null,
  };
}

function exchange(id: string, completedAt: number, hours = 1): Exchange {
  return {
    id,
    postId: `project:proj_1/task:${id}`,
    helperKey: "h",
    helpedKey: "org",
    hoursExchanged: hours,
    helperSignature: "s",
    helpedSignature: "s",
    completedAt,
    category: "other",
    nodeId,
  };
}

describe("computeProjectMomentum", () => {
  // Pin "now" to noon UTC of a fictional day so day-boundary math is
  // stable regardless of when the test runs.
  const now = 100 * DAY + 12 * 60 * 60 * 1000;

  it("returns a windowDays-length daily array filled with zeros for a planning project", () => {
    const m = computeProjectMomentum({
      project: project({ status: "planning" }),
      tasks: [],
      exchanges: [],
      now,
    });
    expect(m.daily).toHaveLength(14);
    expect(m.daily.every((d) => d.hours === 0)).toBe(true);
    expect(m.state).toBe("planning");
  });

  it("buckets exchanges into the correct day", () => {
    const tasks = [task("t1", "x1"), task("t2", "x2")];
    const exchanges = [
      exchange("x1", now - 3 * DAY, 2),
      exchange("x2", now - 3 * DAY, 1.5),
    ];
    const m = computeProjectMomentum({
      project: project(),
      tasks,
      exchanges,
      now,
    });
    const sameDay = m.daily.filter((d) => d.hours > 0);
    expect(sameDay).toHaveLength(1);
    expect(sameDay[0].hours).toBe(3.5);
  });

  it("ignores exchanges outside the window", () => {
    const tasks = [task("t1", "x1"), task("t2", "x2")];
    const exchanges = [
      exchange("x1", now - 1 * DAY, 1),
      exchange("x2", now - 30 * DAY, 5),
    ];
    const m = computeProjectMomentum({
      project: project(),
      tasks,
      exchanges,
      now,
    });
    const total = m.daily.reduce((s, d) => s + d.hours, 0);
    expect(total).toBe(1);
  });

  it("ignores exchanges that aren't this project's", () => {
    // Only x1 is linked via task.exchangeId; x2 has no task pointer so
    // it doesn't count even though it exists.
    const tasks = [task("t1", "x1")];
    const exchanges = [
      exchange("x1", now - 1 * DAY, 2),
      exchange("x_stray", now - 1 * DAY, 99),
    ];
    const m = computeProjectMomentum({
      project: project(),
      tasks,
      exchanges,
      now,
    });
    const total = m.daily.reduce((s, d) => s + d.hours, 0);
    expect(total).toBe(2);
  });

  it("computes hoursLast7Days only from the recent half of the window", () => {
    const tasks = [task("t1", "x1"), task("t2", "x2")];
    const exchanges = [
      exchange("x1", now - 2 * DAY, 3),
      exchange("x2", now - 9 * DAY, 5),
    ];
    const m = computeProjectMomentum({
      project: project(),
      tasks,
      exchanges,
      now,
    });
    expect(m.hoursLast7Days).toBe(3);
    expect(m.activeDaysInWindow).toBe(2);
  });

  it("reports state=humming when at least half the days have activity", () => {
    const tasks: ProjectTask[] = [];
    const exchanges: Exchange[] = [];
    for (let i = 0; i < 7; i++) {
      tasks.push(task(`t${i}`, `x${i}`));
      exchanges.push(exchange(`x${i}`, now - i * DAY, 1));
    }
    const m = computeProjectMomentum({
      project: project(),
      tasks,
      exchanges,
      now,
    });
    expect(m.state).toBe("humming");
  });

  it("reports state=active for an active project with at least one recent contribution", () => {
    const m = computeProjectMomentum({
      project: project(),
      tasks: [task("t1", "x1")],
      exchanges: [exchange("x1", now - 2 * DAY, 1)],
      now,
    });
    expect(m.state).toBe("active");
  });

  it("reports state=stalled for an active project with no contributions in the last 7 days", () => {
    const m = computeProjectMomentum({
      project: project(),
      tasks: [task("t1", "x1")],
      exchanges: [exchange("x1", now - 10 * DAY, 1)],
      now,
    });
    expect(m.state).toBe("stalled");
  });

  it("respects terminal statuses (completed/paused) over derived state", () => {
    const tasks = [task("t1", "x1")];
    const exchanges = [exchange("x1", now - 2 * DAY, 1)];
    expect(
      computeProjectMomentum({
        project: project({ status: "completed" }),
        tasks,
        exchanges,
        now,
      }).state,
    ).toBe("completed");
    expect(
      computeProjectMomentum({
        project: project({ status: "paused" }),
        tasks,
        exchanges,
        now,
      }).state,
    ).toBe("paused");
  });
});
