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
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./database";
import { createMember } from "./seed";
import {
  addProjectTask,
  claimProjectTask,
  completeProject,
  confirmProjectTaskCompletion,
  createProject,
  launchProject,
  markProjectTaskComplete,
  pauseProject,
  resumeProject,
  unclaimProjectTask,
} from "./projects";
import { balanceFor } from "@/lib/timebank";
import { verifyExchange } from "@/lib/crypto";

const NODE = "node_projects_test";

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.posts.clear(),
    db.exchanges.clear(),
    db.achievements.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.invites.clear(),
    db.vouches.clear(),
    db.outbox.clear(),
    db.projects.clear(),
    db.projectTasks.clear(),
    db.projectActivity.clear(),
  ]);
}

async function aProject(organizer: { publicKey: string }, targetHours = 10) {
  return createProject(
    organizer.publicKey,
    {
      title: "Community garden",
      description: "Build raised beds + plant first season",
      category: "infrastructure",
      targetHours,
      deadline: null,
      locationZone: "North neighborhood",
      tags: ["garden"],
    },
    NODE,
  );
}

describe("project lifecycle", () => {
  beforeEach(reset);

  it("creates a project in planning status with a project_created activity entry", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    expect(p.status).toBe("planning");
    expect(p.contributedHours).toBe(0);
    expect(p.organizerKey).toBe(org.publicKey);
    const activity = await db.projectActivity.toArray();
    expect(activity).toHaveLength(1);
    expect(activity[0].type).toBe("project_created");
  });

  it("launchProject moves planning → active", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    const launched = await launchProject(p.id, org.publicKey);
    expect(launched.status).toBe("active");
  });

  it("refuses launch from a non-organizer", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const other = await createMember({ displayName: "Other" }, NODE);
    const p = await aProject(org);
    await expect(launchProject(p.id, other.publicKey)).rejects.toThrow(
      /organizer/i,
    );
  });

  it("pause then resume round-trips through paused", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const paused = await pauseProject(p.id, org.publicKey, "Heatwave");
    expect(paused.status).toBe("paused");
    expect(paused.pauseNote).toBe("Heatwave");
    const resumed = await resumeProject(p.id, org.publicKey);
    expect(resumed.status).toBe("active");
    expect(resumed.pauseNote).toBeNull();
  });

  it("completeProject can fire from active or paused", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const done = await completeProject(p.id, org.publicKey);
    expect(done.status).toBe("completed");
    expect(done.completedAt).not.toBeNull();
  });
});

describe("task lifecycle", () => {
  beforeEach(reset);

  it("only the organizer can add tasks to a project", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const other = await createMember({ displayName: "Other" }, NODE);
    const p = await aProject(org);
    await expect(
      addProjectTask(p.id, other.publicKey, {
        title: "Haul soil",
        description: "",
        category: "transport",
        estimatedHours: 2,
        urgency: "low",
        requiredSkills: [],
        dependencies: [],
      }),
    ).rejects.toThrow(/organizer/i);
  });

  it("members can claim open tasks once the project is active", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const p = await aProject(org);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Haul soil",
      description: "",
      category: "transport",
      estimatedHours: 2,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await expect(claimProjectTask(task.id, helper.publicKey)).rejects.toThrow(
      /accepting claims/i,
    );
    await launchProject(p.id, org.publicKey);
    const claimed = await claimProjectTask(task.id, helper.publicKey);
    expect(claimed.status).toBe("claimed");
    expect(claimed.assignedTo).toBe(helper.publicKey);
  });

  it("unclaim returns the task to open and clears the assignee", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Haul soil",
      description: "",
      category: "transport",
      estimatedHours: 2,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await claimProjectTask(task.id, helper.publicKey);
    const open = await unclaimProjectTask(task.id, helper.publicKey);
    expect(open.status).toBe("open");
    expect(open.assignedTo).toBeNull();
  });

  it("markComplete moves claimed → awaiting_confirmation and records completedBy", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Haul soil",
      description: "",
      category: "transport",
      estimatedHours: 2,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await claimProjectTask(task.id, helper.publicKey);
    const waiting = await markProjectTaskComplete(task.id, helper.publicKey);
    expect(waiting.status).toBe("awaiting_confirmation");
    expect(waiting.completedBy).toBe(helper.publicKey);
  });
});

describe("task confirmation transfers credit and surfaces milestones", () => {
  beforeEach(reset);

  it("creates a signed verifiable Exchange and credits flow helper ← organizer", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const p = await aProject(org, 10);
    await launchProject(p.id, org.publicKey);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Haul soil",
      description: "",
      category: "transport",
      estimatedHours: 3,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await claimProjectTask(task.id, helper.publicKey);
    await markProjectTaskComplete(task.id, helper.publicKey);

    const result = await confirmProjectTaskCompletion(
      task.id,
      org.publicKey,
      NODE,
    );
    expect(result.task.status).toBe("completed");
    expect(result.exchange.helperKey).toBe(helper.publicKey);
    expect(result.exchange.helpedKey).toBe(org.publicKey);
    expect(result.exchange.hoursExchanged).toBe(3);
    expect(verifyExchange(result.exchange)).toBe(true);
    expect(result.project.contributedHours).toBe(3);

    const exchanges = await db.exchanges.toArray();
    expect(balanceFor(helper, exchanges)).toBe(8); // 5 seed + 3
    expect(balanceFor(org, exchanges)).toBe(2); // 5 seed - 3
  });

  it("refuses confirmation by anyone other than the organizer", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const other = await createMember({ displayName: "Other" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Haul soil",
      description: "",
      category: "transport",
      estimatedHours: 1,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await claimProjectTask(task.id, helper.publicKey);
    await markProjectTaskComplete(task.id, helper.publicKey);
    await expect(
      confirmProjectTaskCompletion(task.id, other.publicKey, NODE),
    ).rejects.toThrow();
  });

  it("refuses self-confirmation when the organizer is also the completer", async () => {
    // (Auto-confirm-after-48h is Phase 3 work; for now self-confirm is forbidden.)
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Personal task",
      description: "",
      category: "other",
      estimatedHours: 1,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await claimProjectTask(task.id, org.publicKey);
    await markProjectTaskComplete(task.id, org.publicKey);
    await expect(
      confirmProjectTaskCompletion(task.id, org.publicKey, NODE),
    ).rejects.toThrow(/different project member/i);
  });

  it("fires milestone_reached activity entries when crossing 25/50/75/100%", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const p = await aProject(org, 4); // target 4h → tasks of 1h each cross 25/50/75/100
    await launchProject(p.id, org.publicKey);

    async function doOneHourTask() {
      const task = await addProjectTask(p.id, org.publicKey, {
        title: "task",
        description: "",
        category: "other",
        estimatedHours: 1,
        urgency: "low",
        requiredSkills: [],
        dependencies: [],
      });
      await claimProjectTask(task.id, helper.publicKey);
      await markProjectTaskComplete(task.id, helper.publicKey);
      return confirmProjectTaskCompletion(task.id, org.publicKey, NODE);
    }

    const r1 = await doOneHourTask();
    expect(r1.milestonesReached).toContain(0.25);
    const r2 = await doOneHourTask();
    expect(r2.milestonesReached).toContain(0.5);
    const r3 = await doOneHourTask();
    expect(r3.milestonesReached).toContain(0.75);
    const r4 = await doOneHourTask();
    expect(r4.milestonesReached).toContain(1);

    const milestoneActivity = (await db.projectActivity.toArray()).filter(
      (a) => a.type === "milestone_reached",
    );
    expect(milestoneActivity).toHaveLength(4);
  });
});
