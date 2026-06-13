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
import { myClaimedTasks } from "./myTasks";
import type { Project, ProjectTask } from "@/types";

const ME = "me-key";
const OTHER = "other-key";

function makeProject(over: Partial<Project> & { id: string }): Project {
  const base: Project = {
    id: over.id,
    title: `Project ${over.id}`,
    description: "",
    category: "infrastructure",
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
    nodeId: "node-1",
    templateId: null,
  };
  return { ...base, ...over };
}

function makeTask(
  over: Partial<ProjectTask> & { id: string; projectId: string },
): ProjectTask {
  const base: ProjectTask = {
    id: over.id,
    projectId: over.projectId,
    title: `Task ${over.id}`,
    description: "",
    category: "infrastructure",
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
  };
  return { ...base, ...over };
}

describe("myClaimedTasks", () => {
  it("returns an empty view when the member has no active claims", () => {
    const view = myClaimedTasks(ME, [], []);
    expect(view.groups).toEqual([]);
    expect(view.taskCount).toBe(0);
    expect(view.projectCount).toBe(0);
  });

  it("includes claimed and awaiting_confirmation tasks assigned to the member", () => {
    const projects = [makeProject({ id: "p1" })];
    const tasks = [
      makeTask({
        id: "t1",
        projectId: "p1",
        assignedTo: ME,
        status: "claimed",
        claimedAt: 100,
      }),
      makeTask({
        id: "t2",
        projectId: "p1",
        assignedTo: ME,
        status: "awaiting_confirmation",
        claimedAt: 200,
        completedBy: ME,
      }),
    ];
    const view = myClaimedTasks(ME, tasks, projects);
    expect(view.taskCount).toBe(2);
    expect(view.projectCount).toBe(1);
    expect(view.groups[0].tasks.map((t) => t.id)).toEqual(["t2", "t1"]);
  });

  it("excludes other members' claims, open tasks, and completed tasks that still carry assignedTo", () => {
    const projects = [makeProject({ id: "p1" })];
    const tasks = [
      makeTask({
        id: "theirs",
        projectId: "p1",
        assignedTo: OTHER,
        status: "claimed",
        claimedAt: 100,
      }),
      makeTask({ id: "open", projectId: "p1" }),
      // assignedTo survives confirmation — the completed row keeps
      // the claimer's key. Status, not assignment, is the filter.
      makeTask({
        id: "done",
        projectId: "p1",
        assignedTo: ME,
        status: "completed",
        claimedAt: 100,
        completedAt: 300,
      }),
    ];
    const view = myClaimedTasks(ME, tasks, projects);
    expect(view.taskCount).toBe(0);
    expect(view.groups).toEqual([]);
  });

  it("drops tasks whose project row is missing", () => {
    const tasks = [
      makeTask({
        id: "orphan",
        projectId: "gone",
        assignedTo: ME,
        status: "claimed",
        claimedAt: 100,
      }),
    ];
    const view = myClaimedTasks(ME, tasks, []);
    expect(view.taskCount).toBe(0);
    expect(view.groups).toEqual([]);
  });

  it("groups by project and orders groups by their most recent claim", () => {
    const projects = [makeProject({ id: "p1" }), makeProject({ id: "p2" })];
    const tasks = [
      makeTask({
        id: "a",
        projectId: "p1",
        assignedTo: ME,
        status: "claimed",
        claimedAt: 100,
      }),
      makeTask({
        id: "b",
        projectId: "p2",
        assignedTo: ME,
        status: "claimed",
        claimedAt: 500,
      }),
      makeTask({
        id: "c",
        projectId: "p1",
        assignedTo: ME,
        status: "claimed",
        claimedAt: 300,
      }),
    ];
    const view = myClaimedTasks(ME, tasks, projects);
    expect(view.projectCount).toBe(2);
    // p2's newest claim (500) outranks p1's (300).
    expect(view.groups.map((g) => g.project.id)).toEqual(["p2", "p1"]);
    // Within p1: newest claim first.
    expect(view.groups[1].tasks.map((t) => t.id)).toEqual(["c", "a"]);
  });

  it("falls back to createdAt for legacy rows without claimedAt", () => {
    const projects = [makeProject({ id: "p1" })];
    const tasks = [
      makeTask({
        id: "legacy",
        projectId: "p1",
        assignedTo: ME,
        status: "claimed",
        claimedAt: null,
        createdAt: 400,
      }),
      makeTask({
        id: "fresh",
        projectId: "p1",
        assignedTo: ME,
        status: "claimed",
        claimedAt: 200,
      }),
    ];
    const view = myClaimedTasks(ME, tasks, projects);
    expect(view.groups[0].tasks.map((t) => t.id)).toEqual(["legacy", "fresh"]);
  });
});
