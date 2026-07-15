/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./database";
import { createMember } from "./seed";
import {
  addProjectTask,
  claimProjectTask,
  completeProject,
  confirmProjectTaskCompletion,
  createProject,
  graduateProject,
  launchProject,
  markProjectTaskComplete,
  retireCommons,
  returnToBuilding,
  unretireCommons,
} from "./projects";

// The Commons, Phase 1 (docs/commons.md): graduation, the widened
// claim/respawn gates, retirement, and the hatches back.

const NODE = "node_commons_test";

async function reset() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

async function aProject(organizer: { publicKey: string }) {
  return createProject(
    organizer.publicKey,
    {
      title: "Tool library",
      description: "Shared tools for the block",
      category: "infrastructure",
      targetHours: 10,
      deadline: null,
      locationZone: "North",
      tags: [],
      templateId: null,
    },
    NODE,
  );
}

describe("graduation (docs/commons.md §4)", () => {
  beforeEach(reset);

  it("active → tended stamps completedAt and logs project_graduated", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const tended = await graduateProject(p.id, org.publicKey);
    expect(tended.status).toBe("tended");
    expect(tended.completedAt).not.toBeNull();
    const activity = await db.projectActivity
      .where("projectId")
      .equals(p.id)
      .toArray();
    expect(activity.some((a) => a.type === "project_graduated")).toBe(true);
  });

  it("retrofit: completed → tended keeps the ORIGINAL completedAt", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const completed = await completeProject(p.id, org.publicKey);
    const tended = await graduateProject(p.id, org.publicKey);
    expect(tended.status).toBe("tended");
    // completedAt still means "when building finished".
    expect(tended.completedAt).toBe(completed.completedAt);
  });

  it("planning projects cannot graduate — nothing was built yet", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await expect(graduateProject(p.id, org.publicKey)).rejects.toThrow();
  });

  it("graduating grants the keystone achievement like completing does", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    await graduateProject(p.id, org.publicKey);
    const earned = await db.achievements
      .where("memberKey")
      .equals(org.publicKey)
      .toArray();
    expect(earned.some((a) => a.achievementType === "keystone")).toBe(true);
  });
});

describe("the tended care rota (§3 — the load-bearing gates)", () => {
  beforeEach(reset);

  it("tasks on a tended commons stay claimable", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Inventory check",
      description: "",
      category: "infrastructure",
      estimatedHours: 2,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
      recurringCadence: "month",
    });
    await graduateProject(p.id, org.publicKey);
    const claimed = await claimProjectTask(task.id, helper.publicKey);
    expect(claimed.status).toBe("claimed");
  });

  it("recurring tasks respawn on confirm while TENDED — the care loop lives", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Inventory check",
      description: "",
      category: "infrastructure",
      estimatedHours: 2,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
      recurringCadence: "month",
    });
    await graduateProject(p.id, org.publicKey);
    await claimProjectTask(task.id, helper.publicKey);
    await markProjectTaskComplete(task.id, helper.publicKey);
    await confirmProjectTaskCompletion(task.id, org.publicKey, NODE);
    const tasks = await db.projectTasks
      .where("projectId")
      .equals(p.id)
      .toArray();
    expect(tasks).toHaveLength(2);
    const respawned = tasks.find((tk) => tk.id !== task.id)!;
    expect(respawned.status).toBe("open");
    expect(respawned.recurringCadence).toBe("month");
    // …and the care work earned credit through the ordinary path.
    const exchanges = await db.exchanges.toArray();
    expect(exchanges).toHaveLength(1);
    expect(exchanges[0].helperKey).toBe(helper.publicKey);
  });

  it("stewards can add one-off care tasks to a tended commons", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    await graduateProject(p.id, org.publicKey);
    const oneOff = await addProjectTask(p.id, org.publicKey, {
      title: "Fix the gate latch",
      description: "",
      category: "infrastructure",
      estimatedHours: 1,
      urgency: "medium",
      requiredSkills: [],
      dependencies: [],
    });
    expect(oneOff.status).toBe("open");
  });
});

describe("retirement (§7)", () => {
  beforeEach(reset);

  async function aTendedCommons() {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    await graduateProject(p.id, org.publicKey);
    return { org, p };
  }

  it("tended → retired requires the why-it-ended note and stamps retiredAt", async () => {
    const { org, p } = await aTendedCommons();
    await expect(
      retireCommons(p.id, org.publicKey, "   "),
    ).rejects.toThrow();
    const retired = await retireCommons(p.id, org.publicKey, "The lot was sold.");
    expect(retired.status).toBe("retired");
    expect(retired.retireNote).toBe("The lot was sold.");
    expect(retired.retiredAt).not.toBeNull();
  });

  it("retired commons refuse new tasks and new claims", async () => {
    const { org, p } = await aTendedCommons();
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Water the beds",
      description: "",
      category: "infrastructure",
      estimatedHours: 1,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
      recurringCadence: "month",
    });
    await retireCommons(p.id, org.publicKey, "Ended.");
    const stranger = await createMember({ displayName: "Late" }, NODE);
    await expect(
      claimProjectTask(task.id, stranger.publicKey),
    ).rejects.toThrow();
    await expect(
      addProjectTask(p.id, org.publicKey, {
        title: "Too late",
        description: "",
        category: "infrastructure",
        estimatedHours: 1,
        urgency: "low",
        requiredSkills: [],
        dependencies: [],
      }),
    ).rejects.toThrow();
  });

  it("un-retire restores tended and clears the retirement stamps", async () => {
    const { org, p } = await aTendedCommons();
    await retireCommons(p.id, org.publicKey, "Lost the lot.");
    const back = await unretireCommons(p.id, org.publicKey);
    expect(back.status).toBe("tended");
    expect(back.retiredAt).toBeNull();
    expect(back.retireNote).toBeNull();
  });

  it("return to building: tended → active (the mistake hatch)", async () => {
    const { org, p } = await aTendedCommons();
    const active = await returnToBuilding(p.id, org.publicKey);
    expect(active.status).toBe("active");
    // …and the full round-trip still works.
    const again = await graduateProject(p.id, org.publicKey);
    expect(again.status).toBe("tended");
  });
});
