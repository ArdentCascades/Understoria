/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * createProjectWithTasks — the transactional template-flow creator.
 * The contract under test: either the project lands with EVERY staged
 * task (skills + remapped dependency edges included), or nothing
 * lands. The previous page-level addProjectTask loop had a documented
 * partial-write window; this suite is the regression lock on its
 * replacement.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./database";
import {
  createProjectWithTasks,
  type StagedTaskInput,
} from "./projects";

const NODE = "node_cwt_test";
const ORGANIZER = "pk_organizer";

const PROJECT_INPUT = {
  title: "Community Fridge",
  description: "",
  category: "food" as const,
  targetHours: 20,
  deadline: null,
  locationZone: "north",
  tags: [],
  templateId: "community-fridge",
};

function staged(over: Partial<StagedTaskInput> = {}): StagedTaskInput {
  return {
    title: "Task",
    description: "",
    estimatedHours: 2,
    ...over,
  };
}

beforeEach(async () => {
  await Promise.all([
    db.projects.clear(),
    db.projectTasks.clear(),
    db.projectActivity.clear(),
  ]);
});

describe("createProjectWithTasks", () => {
  it("creates the project and every staged task with skills and remapped dependencies", async () => {
    const { project, tasks } = await createProjectWithTasks(
      ORGANIZER,
      PROJECT_INPUT,
      NODE,
      [
        staged({ title: "Find a host site", estimatedHours: 3 }),
        staged({
          title: "Source a fridge",
          estimatedHours: 8,
          requiredSkills: ["carpentry", "driving"],
          follows: [0],
        }),
        staged({
          title: "Recruit a cleaning rota",
          estimatedHours: 2,
          follows: [0, 1],
        }),
      ],
    );

    expect(project.templateId).toBe("community-fridge");
    expect(tasks).toHaveLength(3);
    expect(await db.projectTasks.count()).toBe(3);

    // follows indexes became the real ids of the earlier tasks.
    expect(tasks[0].dependencies).toEqual([]);
    expect(tasks[1].dependencies).toEqual([tasks[0].id]);
    expect(tasks[2].dependencies).toEqual([tasks[0].id, tasks[1].id]);
    expect(tasks[1].requiredSkills).toEqual(["carpentry", "driving"]);
    // Defaults: project category, low urgency — templates stay calm.
    expect(tasks[1].category).toBe("food");
    expect(tasks[1].urgency).toBe("low");
  });

  it("rolls back EVERYTHING when a mid-list task fails — no partial project", async () => {
    const poisoned = staged();
    Object.defineProperty(poisoned, "title", {
      get() {
        throw new Error("boom mid-transaction");
      },
    });

    await expect(
      createProjectWithTasks(ORGANIZER, PROJECT_INPUT, NODE, [
        staged({ title: "First task lands fine" }),
        poisoned,
        staged({ title: "Never reached" }),
      ]),
    ).rejects.toThrow(/boom/);

    // The atomicity contract: not the project, not the first task,
    // not the activity rows — nothing survives.
    expect(await db.projects.count()).toBe(0);
    expect(await db.projectTasks.count()).toBe(0);
    expect(await db.projectActivity.count()).toBe(0);
  });

  it("rejects forward and self follows references before writing anything", async () => {
    await expect(
      createProjectWithTasks(ORGANIZER, PROJECT_INPUT, NODE, [
        staged({ follows: [0] }), // self
      ]),
    ).rejects.toThrow(/earlier staged tasks/);
    await expect(
      createProjectWithTasks(ORGANIZER, PROJECT_INPUT, NODE, [
        staged(),
        staged({ follows: [2] }), // forward
      ]),
    ).rejects.toThrow(/earlier staged tasks/);
    expect(await db.projects.count()).toBe(0);
  });

  it("creates a task-less project when the staged list is empty (from-scratch parity)", async () => {
    const { project, tasks } = await createProjectWithTasks(
      ORGANIZER,
      { ...PROJECT_INPUT, templateId: null },
      NODE,
      [],
    );
    expect(tasks).toEqual([]);
    expect(await db.projects.get(project.id)).toBeTruthy();
  });
});
