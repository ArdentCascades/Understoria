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
  archiveProject,
  bulkAddTasks,
  canClaimTask,
  claimProjectTask,
  cloneProject,
  completeProject,
  confirmProjectTaskCompletion,
  createProject,
  detectCycle,
  handoffOrganizer,
  launchProject,
  markProjectTaskComplete,
  pauseProject,
  removeCoOrganizer,
  reorderProjectTask,
  resumeProject,
  setTaskDependencies,
  unarchiveProject,
  unclaimProjectTask,
  _systemAutoConfirmTask,
} from "./projects";
import type { Exchange, ProjectTask } from "@/types";
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
    db.pairingLog.clear(),
    db.coorgInvitations.clear(),
    db.coorgInvitationResponses.clear(),
    db.coorgInvitationRevocations.clear(),
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
      templateId: null,
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

  it("pauseProject stamps pausedAt; resumeProject clears it", async () => {
    // Honest timing for the "paused too long" attention item — without
    // pausedAt, that item used to compute duration from createdAt and
    // mis-fire on year-old projects paused yesterday.
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    expect(p.pausedAt ?? null).toBeNull();
    await launchProject(p.id, org.publicKey);
    const before = Date.now();
    const paused = await pauseProject(p.id, org.publicKey, "Heatwave");
    const after = Date.now();
    expect(paused.pausedAt).toBeDefined();
    expect(paused.pausedAt!).toBeGreaterThanOrEqual(before);
    expect(paused.pausedAt!).toBeLessThanOrEqual(after);
    const resumed = await resumeProject(p.id, org.publicKey);
    expect(resumed.pausedAt ?? null).toBeNull();
  });

  it("completeProject clears pausedAt when completing from a paused state", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const paused = await pauseProject(p.id, org.publicKey, "Heatwave");
    expect(paused.pausedAt).toBeDefined();
    const done = await completeProject(p.id, org.publicKey);
    expect(done.status).toBe("completed");
    expect(done.pausedAt ?? null).toBeNull();
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

  it("unclaim from awaiting_confirmation returns task to open, clears completedBy, and logs a neutral release activity", async () => {
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
    await markProjectTaskComplete(task.id, helper.publicKey);
    const reopened = await unclaimProjectTask(task.id, helper.publicKey);
    // Clean revert: status open, no assignee, no completedBy
    // recorded against a member who walked the task back.
    expect(reopened.status).toBe("open");
    expect(reopened.assignedTo).toBeNull();
    expect(reopened.completedBy).toBeNull();
    // The neutral trace lives in the activity feed — distinct type
    // from the ordinary claimed→open release so HistoryTimeline can
    // render the "stepped back" sentence with the task title.
    const activity = await db.projectActivity
      .where("projectId")
      .equals(p.id)
      .toArray();
    const release = activity.find(
      (a) => a.type === "task_released_after_complete",
    );
    expect(release).toBeDefined();
    expect(release?.actorKey).toBe(helper.publicKey);
    expect(release?.data).toMatchObject({
      taskId: task.id,
      taskTitle: "Haul soil",
    });
    // The plain claimed→open path should still log task_unclaimed,
    // not the new type — verify the gap was only the awaiting path.
    expect(activity.find((a) => a.type === "task_unclaimed")).toBeUndefined();
  });

  it("unclaim from a plain claimed state still logs task_unclaimed (existing path unchanged)", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Plant beds",
      description: "",
      category: "infrastructure",
      estimatedHours: 1,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await claimProjectTask(task.id, helper.publicKey);
    await unclaimProjectTask(task.id, helper.publicKey);
    const activity = await db.projectActivity
      .where("projectId")
      .equals(p.id)
      .toArray();
    expect(
      activity.find((a) => a.type === "task_unclaimed"),
    ).toBeDefined();
    expect(
      activity.find((a) => a.type === "task_released_after_complete"),
    ).toBeUndefined();
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

  it("refuses confirmation by a non-organizer (not primary, not co-organizer)", async () => {
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

  it("allows confirmation by a co-organizer (the confirmer's balance is debited)", async () => {
    // Co-organizers can confirm task completions just like the primary
    // organizer. The signed Exchange records the confirmer as the
    // helped party, so the confirming co-organizer's balance is the
    // one debited — not the primary's. This distributes the
    // organizer load (which is the point of co-organizers).
    const org = await createMember({ displayName: "Org" }, NODE);
    const coOrg = await createMember({ displayName: "CoOrg" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const p = await aProject(org);
    await seedCoOrganizer(p.id, coOrg.publicKey);
    await launchProject(p.id, org.publicKey);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Carry compost",
      description: "",
      category: "transport",
      estimatedHours: 2,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await claimProjectTask(task.id, helper.publicKey);
    await markProjectTaskComplete(task.id, helper.publicKey);
    const result = await confirmProjectTaskCompletion(
      task.id,
      coOrg.publicKey,
      NODE,
    );
    expect(result.exchange).not.toBeNull();
    const exchanges = await db.exchanges.toArray();
    // Confirmer (co-organizer) was the helped party — their balance
    // goes down, not the primary's.
    expect(balanceFor(helper, exchanges)).toBe(7); // 5 seed + 2
    expect(balanceFor(coOrg, exchanges)).toBe(3); // 5 seed - 2
    expect(balanceFor(org, exchanges)).toBe(5); // unchanged — seed only
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

describe("actual hours at completion", () => {
  beforeEach(reset);

  async function setupClaimed(estimatedHours: number, targetHours = 10) {
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const p = await aProject(org, targetHours);
    await launchProject(p.id, org.publicKey);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Paint the shelter",
      description: "",
      category: "transport",
      estimatedHours,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await claimProjectTask(task.id, helper.publicKey);
    return { org, helper, project: p, task };
  }

  it("records the stated actual hours on the signed Exchange and rounds the input", async () => {
    const { org, helper, task } = await setupClaimed(2);
    // 6.125 → rounded to 6.13 (roundHours: 2 dp).
    const marked = await markProjectTaskComplete(task.id, helper.publicKey, 6.125);
    expect(marked.actualHours).toBe(6.13);

    const result = await confirmProjectTaskCompletion(task.id, org.publicKey, NODE);
    expect(result.exchange.hoursExchanged).toBe(6.13);
    expect(verifyExchange(result.exchange)).toBe(true);
    const exchanges = await db.exchanges.toArray();
    expect(balanceFor(helper, exchanges)).toBe(11.13); // 5 seed + 6.13
    expect(balanceFor(org, exchanges)).toBe(-1.13); // 5 seed - 6.13
  });

  it("falls back to the estimate when actual hours are not stated", async () => {
    const { org, helper, task } = await setupClaimed(2);
    const marked = await markProjectTaskComplete(task.id, helper.publicKey);
    expect(marked.actualHours).toBeNull();
    const result = await confirmProjectTaskCompletion(task.id, org.publicKey, NODE);
    expect(result.exchange.hoursExchanged).toBe(2);
  });

  it("rejects a non-positive or non-finite stated value", async () => {
    const { helper, task } = await setupClaimed(2);
    await expect(
      markProjectTaskComplete(task.id, helper.publicKey, 0),
    ).rejects.toThrow();
    await expect(
      markProjectTaskComplete(task.id, helper.publicKey, -3),
    ).rejects.toThrow();
    await expect(
      markProjectTaskComplete(task.id, helper.publicKey, Number.NaN),
    ).rejects.toThrow();
    // Still claimed — no partial write.
    const after = await db.projectTasks.get(task.id);
    expect(after?.status).toBe("claimed");
    expect(after?.actualHours).toBeNull();
  });

  it("drives contributedHours and milestones from the actual hours", async () => {
    // 1h-estimated task that actually took 4h, on a 4h-target project →
    // confirmation crosses 100% even though the estimate was 1h.
    const { org, helper, project, task } = await setupClaimed(1, 4);
    await markProjectTaskComplete(task.id, helper.publicKey, 4);
    const result = await confirmProjectTaskCompletion(task.id, org.publicKey, NODE);
    expect(result.project.contributedHours).toBe(4);
    expect(result.milestonesReached).toContain(1);
    expect((await db.projects.get(project.id))?.contributedHours).toBe(4);
  });

  it("records both the estimate and the actual in the completion + confirmation activity", async () => {
    const { org, helper, project, task } = await setupClaimed(2);
    await markProjectTaskComplete(task.id, helper.publicKey, 5);
    await confirmProjectTaskCompletion(task.id, org.publicKey, NODE);
    const activity = await db.projectActivity.toArray();
    const completed = activity.find(
      (a) => a.type === "task_completed" && a.data.taskId === task.id,
    );
    expect(completed?.data.estimatedHours).toBe(2);
    expect(completed?.data.actualHours).toBe(5);
    const confirmed = activity.find(
      (a) => a.type === "task_confirmed" && a.data.taskId === task.id,
    );
    expect(confirmed?.data.hours).toBe(5);
    expect(confirmed?.data.estimatedHours).toBe(2);
    expect(confirmed?.data.actualHours).toBe(5);
    expect(project.id).toBeDefined();
  });

  it("clears the stated actual hours when the completer walks the task back", async () => {
    const { helper, task } = await setupClaimed(2);
    await markProjectTaskComplete(task.id, helper.publicKey, 5);
    const released = await unclaimProjectTask(task.id, helper.publicKey);
    expect(released.status).toBe("open");
    expect(released.actualHours).toBeNull();
    expect(released.completedBy).toBeNull();
  });

  it("_systemAutoConfirmTask rejects an exchange whose hours don't match the task's credit hours", async () => {
    const { helper, task } = await setupClaimed(2);
    await markProjectTaskComplete(task.id, helper.publicKey, 5);
    // A pre-signed auto-confirm exchange with the WRONG hours (the
    // sweep builds creditHoursForTask = 5; this claims 99).
    const badExchange: Exchange = {
      id: "ex-bad",
      postId: `project:${task.projectId}/task:${task.id}`,
      helperKey: helper.publicKey,
      helpedKey: "someone",
      hoursExchanged: 99,
      helperSignature: "sig",
      helpedSignature: "sig",
      completedAt: Date.now(),
      category: "transport",
      nodeId: NODE,
      autoConfirmed: true,
      autoConfirmedBy: `system:${NODE}`,
      autoConfirmedAt: Date.now(),
    };
    await expect(
      _systemAutoConfirmTask(task.id, badExchange),
    ).rejects.toThrow();
  });
});

describe("handoffOrganizer", () => {
  beforeEach(reset);

  it("happy path: swaps organizer and demotes caller to co-organizer, logs activity", async () => {
    const alice = await createMember({ displayName: "Alice" }, NODE);
    const bob = await createMember({ displayName: "Bob" }, NODE);
    const p = await aProject(alice);
    await seedCoOrganizer(p.id, bob.publicKey);

    const updated = await handoffOrganizer(p.id, alice.publicKey, bob.publicKey);
    expect(updated.organizerKey).toBe(bob.publicKey);
    expect(updated.coOrganizerKeys).toContain(alice.publicKey);
    expect(updated.coOrganizerKeys).not.toContain(bob.publicKey);

    const activity = (await db.projectActivity.toArray()).filter(
      (a) => a.type === "organizer_handoff",
    );
    expect(activity).toHaveLength(1);
    expect(activity[0].data).toEqual({
      fromKey: alice.publicKey,
      toKey: bob.publicKey,
    });
  });

  it("rejects non-primary caller", async () => {
    const alice = await createMember({ displayName: "Alice" }, NODE);
    const bob = await createMember({ displayName: "Bob" }, NODE);
    const carol = await createMember({ displayName: "Carol" }, NODE);
    const p = await aProject(alice);
    await seedCoOrganizer(p.id, bob.publicKey);

    await expect(
      handoffOrganizer(p.id, carol.publicKey, bob.publicKey),
    ).rejects.toThrow(/primary organizer/i);
  });

  it("rejects target not in coOrganizerKeys", async () => {
    const alice = await createMember({ displayName: "Alice" }, NODE);
    const bob = await createMember({ displayName: "Bob" }, NODE);
    const p = await aProject(alice);
    // bob is NOT a co-organizer

    await expect(
      handoffOrganizer(p.id, alice.publicKey, bob.publicKey),
    ).rejects.toThrow(/co-organizer/i);
  });

  it("rejects completed project", async () => {
    const alice = await createMember({ displayName: "Alice" }, NODE);
    const bob = await createMember({ displayName: "Bob" }, NODE);
    const p = await aProject(alice);
    await seedCoOrganizer(p.id, bob.publicKey);
    await launchProject(p.id, alice.publicKey);
    await completeProject(p.id, alice.publicKey);

    await expect(
      handoffOrganizer(p.id, alice.publicKey, bob.publicKey),
    ).rejects.toThrow(/completed or archived/i);
  });
});

describe("removeCoOrganizer", () => {
  beforeEach(reset);

  it("primary organizer removes a co-organizer (no stepdown activity)", async () => {
    const alice = await createMember({ displayName: "Alice" }, NODE);
    const bob = await createMember({ displayName: "Bob" }, NODE);
    const p = await aProject(alice);
    await seedCoOrganizer(p.id, bob.publicKey);

    const updated = await removeCoOrganizer(
      p.id,
      alice.publicKey,
      bob.publicKey,
    );
    expect(updated.coOrganizerKeys).not.toContain(bob.publicKey);

    // Primary-initiated removal is a roster edit, not a self-exit;
    // intentionally does not write a coorganizer_stepdown row.
    const stepdownRows = (await db.projectActivity.toArray()).filter(
      (a) => a.type === "coorganizer_stepdown",
    );
    expect(stepdownRows).toHaveLength(0);
  });

  it("co-organizer self-removes (steps down) and writes a coorganizer_stepdown activity", async () => {
    const alice = await createMember({ displayName: "Alice" }, NODE);
    const bob = await createMember({ displayName: "Bob" }, NODE);
    const p = await aProject(alice);
    await seedCoOrganizer(p.id, bob.publicKey);

    const updated = await removeCoOrganizer(
      p.id,
      bob.publicKey,
      bob.publicKey,
    );
    expect(updated.coOrganizerKeys).not.toContain(bob.publicKey);
    expect(updated.organizerKey).toBe(alice.publicKey);

    const stepdownRows = (await db.projectActivity.toArray()).filter(
      (a) => a.type === "coorganizer_stepdown",
    );
    expect(stepdownRows).toHaveLength(1);
    expect(stepdownRows[0].actorKey).toBe(bob.publicKey);
    expect(stepdownRows[0].data).toEqual({ steppedDownKey: bob.publicKey });
  });

  it("random other member cannot remove a co-organizer", async () => {
    const alice = await createMember({ displayName: "Alice" }, NODE);
    const bob = await createMember({ displayName: "Bob" }, NODE);
    const carol = await createMember({ displayName: "Carol" }, NODE);
    const p = await aProject(alice);
    await seedCoOrganizer(p.id, bob.publicKey);

    await expect(
      removeCoOrganizer(p.id, carol.publicKey, bob.publicKey),
    ).rejects.toThrow(/primary organizer or the co-organizer themselves/i);
  });

  it("primary organizer cannot 'self-remove' themselves as if they were a co-organizer", async () => {
    // The primary is not in coOrganizerKeys, so the self-removal
    // branch (callerKey === coOrgKey && coOrgKey ∈ list) does not
    // match. The primary path also fails because callerKey !==
    // organizerKey only matters when they ARE the organizer; here
    // the primary IS the organizer but is trying to act on
    // themselves as a co-org, which is a no-op identity, so the
    // self-removal guard is what catches it.
    const alice = await createMember({ displayName: "Alice" }, NODE);
    const bob = await createMember({ displayName: "Bob" }, NODE);
    const p = await aProject(alice);
    await seedCoOrganizer(p.id, bob.publicKey);

    // Alice is primary, not a co-organizer. Trying to step down as
    // a co-organizer should reject.
    await expect(
      removeCoOrganizer(p.id, alice.publicKey, alice.publicKey),
    ).rejects.toThrow(/primary organizer or the co-organizer themselves/i);

    // And nothing was written to activity.
    const stepdownRows = (await db.projectActivity.toArray()).filter(
      (a) => a.type === "coorganizer_stepdown",
    );
    expect(stepdownRows).toHaveLength(0);
  });
});

// -- Task follows (dependencies) ---------------------------------------------

/**
 * Seed a co-organizer onto a project for test setup. Bypasses the
 * production signed-invitation flow (CoOrganizerInvitation +
 * CoOrganizerInvitationResponse) because most tests in this file
 * aren't exercising HOW the co-org got there — they need a co-org
 * as a precondition for testing other things (task confirmation,
 * dependency setting, organizer-only gates, etc.). Tests that
 * specifically exercise the invitation flow live in
 * `coorgInvitations.test.ts` and use the real action helpers.
 */
async function seedCoOrganizer(
  projectId: string,
  coOrgKey: string,
): Promise<void> {
  const p = await db.projects.get(projectId);
  if (!p) throw new Error(`seedCoOrganizer: project ${projectId} not found`);
  if (p.coOrganizerKeys.includes(coOrgKey)) return;
  await db.projects.put({
    ...p,
    coOrganizerKeys: [...p.coOrganizerKeys, coOrgKey],
  });
}

function fakeTask(overrides: Partial<ProjectTask> & { id: string }): ProjectTask {
  return {
    projectId: "p1",
    title: overrides.id,
    description: "",
    category: "other",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 0,
    createdAt: Date.now(),
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
    actualHours: null,
    checkInAcknowledgedAt: null,
    ...overrides,
  };
}

describe("canClaimTask", () => {
  it("returns true when a task has no dependencies", () => {
    const task = fakeTask({ id: "a" });
    expect(canClaimTask(task, [task])).toBe(true);
  });

  it("returns true when all dependencies are completed", () => {
    const dep = fakeTask({ id: "dep", status: "completed" });
    const task = fakeTask({ id: "a", dependencies: ["dep"] });
    expect(canClaimTask(task, [dep, task])).toBe(true);
  });

  it("returns false when a dependency is still open", () => {
    const dep = fakeTask({ id: "dep", status: "open" });
    const task = fakeTask({ id: "a", dependencies: ["dep"] });
    expect(canClaimTask(task, [dep, task])).toBe(false);
  });

  it("returns false when a dependency is claimed but not completed", () => {
    const dep = fakeTask({ id: "dep", status: "claimed" });
    const task = fakeTask({ id: "a", dependencies: ["dep"] });
    expect(canClaimTask(task, [dep, task])).toBe(false);
  });

  it("returns false when any one of several dependencies is incomplete", () => {
    const dep1 = fakeTask({ id: "dep1", status: "completed" });
    const dep2 = fakeTask({ id: "dep2", status: "open" });
    const task = fakeTask({ id: "a", dependencies: ["dep1", "dep2"] });
    expect(canClaimTask(task, [dep1, dep2, task])).toBe(false);
  });

  it("returns false when a dependency id is not found in allTasks", () => {
    const task = fakeTask({ id: "a", dependencies: ["nonexistent"] });
    expect(canClaimTask(task, [task])).toBe(false);
  });
});

describe("detectCycle", () => {
  it("returns false for an empty dependency list", () => {
    const a = fakeTask({ id: "a" });
    expect(detectCycle("a", [], [a])).toBe(false);
  });

  it("returns true for a direct self-cycle", () => {
    const a = fakeTask({ id: "a" });
    expect(detectCycle("a", ["a"], [a])).toBe(true);
  });

  it("returns true for A → B → A", () => {
    const a = fakeTask({ id: "a", dependencies: [] });
    const b = fakeTask({ id: "b", dependencies: ["a"] });
    // Proposing that A depends on B would create A → B → A
    expect(detectCycle("a", ["b"], [a, b])).toBe(true);
  });

  it("returns false for a valid chain A → B → C (no cycle)", () => {
    const c = fakeTask({ id: "c", dependencies: [] });
    const b = fakeTask({ id: "b", dependencies: ["c"] });
    const a = fakeTask({ id: "a", dependencies: [] });
    // Proposing A depends on B: A → B → C — no cycle
    expect(detectCycle("a", ["b"], [a, b, c])).toBe(false);
  });

  it("returns true for a longer cycle A → B → C → A", () => {
    const a = fakeTask({ id: "a", dependencies: [] });
    const b = fakeTask({ id: "b", dependencies: ["a"] });
    const c = fakeTask({ id: "c", dependencies: ["b"] });
    // Proposing A depends on C: A → C → B → A
    expect(detectCycle("a", ["c"], [a, b, c])).toBe(true);
  });

  it("returns false when the dependency target does not exist", () => {
    const a = fakeTask({ id: "a" });
    expect(detectCycle("a", ["ghost"], [a])).toBe(false);
  });
});

describe("setTaskDependencies", () => {
  beforeEach(reset);

  it("sets dependencies on an open task", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    const t1 = await addProjectTask(p.id, org.publicKey, {
      title: "First",
      description: "",
      category: "other",
      estimatedHours: 1,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    const t2 = await addProjectTask(p.id, org.publicKey, {
      title: "Second",
      description: "",
      category: "other",
      estimatedHours: 1,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    const updated = await setTaskDependencies(
      t2.id,
      org.publicKey,
      [t1.id],
    );
    expect(updated.dependencies).toEqual([t1.id]);
  });

  it("rejects a cycle", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    const t1 = await addProjectTask(p.id, org.publicKey, {
      title: "First",
      description: "",
      category: "other",
      estimatedHours: 1,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await setTaskDependencies(t1.id, org.publicKey, []);
    // Self-cycle via setTaskDependencies
    await expect(
      setTaskDependencies(t1.id, org.publicKey, [t1.id]),
    ).rejects.toThrow(/cycle/i);
  });

  it("allows claiming a task with unmet dependencies (soft-block, PR C)", async () => {
    // PR C reversed the hard-block-on-claim throw. Dependencies are
    // soft per docs/task-ordering-and-dependencies.md §3: claim is
    // allowed regardless of dependency status; canClaimTask still
    // reports false for the same task so attention/chip suppression
    // continues to work.
    const org = await createMember({ displayName: "Org" }, NODE);
    const helper = await createMember({ displayName: "Helper" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    const t1 = await addProjectTask(p.id, org.publicKey, {
      title: "First",
      description: "",
      category: "other",
      estimatedHours: 1,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    const t2 = await addProjectTask(p.id, org.publicKey, {
      title: "Second",
      description: "",
      category: "other",
      estimatedHours: 1,
      urgency: "low",
      requiredSkills: [],
      dependencies: [],
    });
    await setTaskDependencies(t2.id, org.publicKey, [t1.id]);
    const claimed = await claimProjectTask(t2.id, helper.publicKey);
    expect(claimed.status).toBe("claimed");
    expect(claimed.assignedTo).toBe(helper.publicKey);
    // The claim persisted in Dexie.
    const stored = await db.projectTasks.get(t2.id);
    expect(stored?.status).toBe("claimed");
    expect(stored?.assignedTo).toBe(helper.publicKey);
    // canClaimTask still returns false — the helper is unchanged, so
    // PR F's attention/chip suppression has the signal it needs.
    const allTasks = await db.projectTasks
      .where("projectId")
      .equals(p.id)
      .toArray();
    const reloaded = allTasks.find((t) => t.id === t2.id)!;
    expect(canClaimTask(reloaded, allTasks)).toBe(false);
  });
});

describe("archive lifecycle", () => {
  beforeEach(reset);

  it("happy path: create + launch + complete + archive → status === archived", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    await completeProject(p.id, org.publicKey);
    const archived = await archiveProject(p.id, org.publicKey);
    expect(archived.status).toBe("archived");
    const activity = (await db.projectActivity.toArray()).filter(
      (a) => a.type === "project_archived",
    );
    expect(activity).toHaveLength(1);
  });

  it("rejects non-primary organizer (co-organizer tries to archive)", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const coOrg = await createMember({ displayName: "CoOrg" }, NODE);
    const p = await aProject(org);
    await seedCoOrganizer(p.id, coOrg.publicKey);
    await launchProject(p.id, org.publicKey);
    await completeProject(p.id, org.publicKey);
    await expect(archiveProject(p.id, coOrg.publicKey)).rejects.toThrow(
      /primary organizer/i,
    );
  });

  it("rejects non-completed project (active project)", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    await expect(archiveProject(p.id, org.publicKey)).rejects.toThrow(
      /completed/i,
    );
  });

  it("unarchive: archive then unarchive → status === completed", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await launchProject(p.id, org.publicKey);
    await completeProject(p.id, org.publicKey);
    await archiveProject(p.id, org.publicKey);
    const restored = await unarchiveProject(p.id, org.publicKey);
    expect(restored.status).toBe("completed");
    const activity = (await db.projectActivity.toArray()).filter(
      (a) => a.type === "project_unarchived",
    );
    expect(activity).toHaveLength(1);
  });
});

// -- PR C: orderIndex migration + actions ----------------------------------

describe("orderIndex backfill migration (v25)", () => {
  beforeEach(reset);

  it("backfills orderIndex from createdAt rank × 1000 per project", async () => {
    // Construct a fixture set with no orderIndex (simulating
    // pre-v25 rows) by writing tasks then clearing the field.
    const org = await createMember({ displayName: "Org" }, NODE);
    const pA = await aProject(org);
    const pB = await createProject(
      org.publicKey,
      {
        title: "Other project",
        description: "",
        category: "infrastructure",
        targetHours: 5,
        deadline: null,
        locationZone: "",
        tags: [],
        templateId: null,
      },
      NODE,
    );
    // Add three tasks to project A out of insertion order by
    // patching createdAt directly after the put.
    const taskA1 = await addProjectTask(pA.id, org.publicKey, {
      title: "A1", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    const taskA2 = await addProjectTask(pA.id, org.publicKey, {
      title: "A2", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    const taskA3 = await addProjectTask(pA.id, org.publicKey, {
      title: "A3", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    const taskB1 = await addProjectTask(pB.id, org.publicKey, {
      title: "B1", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    // Force deterministic createdAt order: A1 < A2 < A3, B1
    // standalone. Wipe orderIndex on every row to simulate a
    // pre-v25 row.
    await db.projectTasks.put({ ...taskA1, createdAt: 1000 });
    await db.projectTasks.put({ ...taskA2, createdAt: 2000 });
    await db.projectTasks.put({ ...taskA3, createdAt: 3000 });
    await db.projectTasks.put({ ...taskB1, createdAt: 1500 });
    // Now strip orderIndex from each row to mimic the pre-v25
    // database shape. We use `update(id, { orderIndex: undefined })`
    // which lets Dexie clear the field.
    for (const id of [taskA1.id, taskA2.id, taskA3.id, taskB1.id]) {
      const t = await db.projectTasks.get(id);
      if (!t) continue;
      // Dexie + fake-indexeddb retains the field if we just
      // assign undefined; instead, write a row that explicitly
      // omits it via destructuring.
      const { orderIndex: _drop, ...rest } = t;
      void _drop;
      await db.projectTasks.put(rest as ProjectTask);
    }
    // Verify the precondition: orderIndex is missing.
    const beforeMigration = await db.projectTasks.toArray();
    for (const t of beforeMigration) {
      expect(t.orderIndex).toBeUndefined();
    }

    // Run the same algorithm the v25 upgrade callback runs.
    // This mirrors the pattern in coorgInvitations.test.ts's
    // v21 grandfather test: fake-indexeddb starts at the latest
    // version, so we exercise the upgrade logic by hand.
    const allTasks = await db.projectTasks.toArray();
    const byProject = new Map<string, ProjectTask[]>();
    for (const t of allTasks) {
      const list = byProject.get(t.projectId) ?? [];
      list.push(t);
      byProject.set(t.projectId, list);
    }
    for (const list of byProject.values()) {
      list.sort((a, b) => a.createdAt - b.createdAt);
      for (let i = 0; i < list.length; i++) {
        await db.projectTasks.put({
          ...list[i],
          orderIndex: (i + 1) * 1000,
        });
      }
    }

    // Assertions: each project's tasks have orderIndex matching
    // their createdAt rank × 1000.
    const after = await db.projectTasks.toArray();
    const aRows = after
      .filter((t) => t.projectId === pA.id)
      .sort((a, b) => a.createdAt - b.createdAt);
    expect(aRows.map((t) => t.orderIndex)).toEqual([1000, 2000, 3000]);
    const bRows = after.filter((t) => t.projectId === pB.id);
    expect(bRows.map((t) => t.orderIndex)).toEqual([1000]);
  });
});

describe("actualHours backfill migration (v26)", () => {
  beforeEach(reset);

  it("backfills actualHours = null on rows missing the field", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    const task = await addProjectTask(p.id, org.publicKey, {
      title: "Legacy task", description: "", category: "other",
      estimatedHours: 3, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    // Strip actualHours to mimic a pre-v26 row (fake-indexeddb opens at
    // the latest version, so we exercise the upgrade callback by hand —
    // same pattern as the v25 test above).
    const stored = await db.projectTasks.get(task.id);
    const { actualHours: _drop, ...rest } = stored!;
    void _drop;
    await db.projectTasks.put(rest as ProjectTask);
    expect((await db.projectTasks.get(task.id))?.actualHours).toBeUndefined();

    // Run the v26 algorithm.
    await db.projectTasks.toCollection().modify((row) => {
      const r = row as ProjectTask & { actualHours?: number | null };
      if (r.actualHours === undefined) r.actualHours = null;
    });

    const after = await db.projectTasks.get(task.id);
    expect(after?.actualHours).toBeNull();
    // Neighbors untouched.
    expect(after?.estimatedHours).toBe(3);
    expect(after?.orderIndex).toBe(task.orderIndex);
  });
});

describe("addProjectTask sets orderIndex", () => {
  beforeEach(reset);

  it("first task in a project gets orderIndex 1000", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    const t = await addProjectTask(p.id, org.publicKey, {
      title: "First", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    expect(t.orderIndex).toBe(1000);
  });

  it("subsequent tasks bump by + 1000 (max-based, not count-based)", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    const t1 = await addProjectTask(p.id, org.publicKey, {
      title: "First", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    const t2 = await addProjectTask(p.id, org.publicKey, {
      title: "Second", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    expect(t1.orderIndex).toBe(1000);
    expect(t2.orderIndex).toBe(2000);
    // Mutate t1 to a high orderIndex; the next add must use the
    // new max, proving max-based rather than count-based.
    await db.projectTasks.put({ ...t1, orderIndex: 50_000 });
    const t3 = await addProjectTask(p.id, org.publicKey, {
      title: "Third", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    expect(t3.orderIndex).toBe(51_000);
  });
});

describe("bulkAddTasks assigns sequential orderIndex", () => {
  beforeEach(reset);

  it("each task in the batch gets + 1000 from a single starting point", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    const tasks = await bulkAddTasks(
      p.id,
      org.publicKey,
      ["A", "B", "C"],
      NODE,
    );
    expect(tasks.map((t) => t.orderIndex)).toEqual([1000, 2000, 3000]);
  });

  it("starts above the existing max when the project has prior tasks", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    await addProjectTask(p.id, org.publicKey, {
      title: "Pre", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    const tasks = await bulkAddTasks(
      p.id,
      org.publicKey,
      ["A", "B"],
      NODE,
    );
    expect(tasks.map((t) => t.orderIndex)).toEqual([2000, 3000]);
  });
});

describe("cloneProject preserves source orderIndex", () => {
  beforeEach(reset);

  it("each cloned task copies its source's orderIndex", async () => {
    const org = await createMember({ displayName: "Org" }, NODE);
    const source = await aProject(org);
    const a = await addProjectTask(source.id, org.publicKey, {
      title: "A", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    const b = await addProjectTask(source.id, org.publicKey, {
      title: "B", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    // Bump A to an unusual value so we can detect copy vs.
    // re-derive.
    await db.projectTasks.put({ ...a, orderIndex: 12_345 });
    const cloned = await cloneProject(
      source.id,
      org.publicKey,
      "Clone",
      NODE,
    );
    const clonedTasks = await db.projectTasks
      .where("projectId")
      .equals(cloned.id)
      .toArray();
    const ordered = clonedTasks.sort((x, y) => x.orderIndex - y.orderIndex);
    expect(ordered.map((t) => t.orderIndex)).toEqual([2000, 12_345]);
    // Sanity: clones carry source titles in matching positions.
    expect(ordered[0].title).toBe(b.title);
    expect(ordered[1].title).toBe(a.title);
  });
});

describe("reorderProjectTask", () => {
  beforeEach(reset);

  async function setupThreeTasks() {
    const org = await createMember({ displayName: "Org" }, NODE);
    const p = await aProject(org);
    const t1 = await addProjectTask(p.id, org.publicKey, {
      title: "First", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    const t2 = await addProjectTask(p.id, org.publicKey, {
      title: "Second", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    const t3 = await addProjectTask(p.id, org.publicKey, {
      title: "Third", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    return { org, p, t1, t2, t3 };
  }

  it("midpoints between two neighbors", async () => {
    const { org, t1, t2, t3 } = await setupThreeTasks();
    // Move t3 between t1 and t2.
    await reorderProjectTask({
      taskId: t3.id,
      organizerKey: org.publicKey,
      beforeId: t1.id,
      afterId: t2.id,
    });
    const updated = await db.projectTasks.get(t3.id);
    expect(updated?.orderIndex).toBe(1500);
  });

  it("moves to the bottom via beforeId-only", async () => {
    const { org, t1, t3 } = await setupThreeTasks();
    // Move t1 past t3 (the current bottom).
    await reorderProjectTask({
      taskId: t1.id,
      organizerKey: org.publicKey,
      beforeId: t3.id,
      afterId: null,
    });
    const updated = await db.projectTasks.get(t1.id);
    expect(updated?.orderIndex).toBe(4000);
  });

  it("moves to the top via afterId-only", async () => {
    const { org, t1, t3 } = await setupThreeTasks();
    // Move t3 above t1 (the current top).
    await reorderProjectTask({
      taskId: t3.id,
      organizerKey: org.publicKey,
      beforeId: null,
      afterId: t1.id,
    });
    const updated = await db.projectTasks.get(t3.id);
    // t1.orderIndex is 1000, so candidate is 0; the floor branch
    // kicks in (candidate < 1) and we use after.orderIndex / 2.
    expect(updated?.orderIndex).toBe(500);
  });

  it("throws when both neighbors are null", async () => {
    const { org, t1 } = await setupThreeTasks();
    await expect(
      reorderProjectTask({
        taskId: t1.id,
        organizerKey: org.publicKey,
        beforeId: null,
        afterId: null,
      }),
    ).rejects.toThrow(/at least one neighbor/i);
  });

  it("throws when the moved task does not exist", async () => {
    const { org, t1 } = await setupThreeTasks();
    await expect(
      reorderProjectTask({
        taskId: "no-such-task",
        organizerKey: org.publicKey,
        beforeId: t1.id,
        afterId: null,
      }),
    ).rejects.toThrow(/not found/i);
  });

  it("throws when the caller is not an organizer", async () => {
    const { p, t1, t3 } = await setupThreeTasks();
    const stranger = await createMember({ displayName: "Other" }, NODE);
    // Sanity: this isn't the organizer of p.
    expect(p.organizerKey).not.toBe(stranger.publicKey);
    await expect(
      reorderProjectTask({
        taskId: t3.id,
        organizerKey: stranger.publicKey,
        beforeId: t1.id,
        afterId: null,
      }),
    ).rejects.toThrow(/organizer/i);
  });

  it("allows a co-organizer to reorder", async () => {
    const { p, t1, t3 } = await setupThreeTasks();
    const coOrg = await createMember({ displayName: "CoOrg" }, NODE);
    await seedCoOrganizer(p.id, coOrg.publicKey);
    await reorderProjectTask({
      taskId: t3.id,
      organizerKey: coOrg.publicKey,
      beforeId: null,
      afterId: t1.id,
    });
    const updated = await db.projectTasks.get(t3.id);
    expect(updated?.orderIndex).toBe(500);
  });

  it("throws when a neighbor belongs to a different project", async () => {
    const { org, t1 } = await setupThreeTasks();
    const otherProject = await createProject(
      org.publicKey,
      {
        title: "Other", description: "", category: "infrastructure",
        targetHours: 1, deadline: null, locationZone: "",
        tags: [], templateId: null,
      },
      NODE,
    );
    const foreign = await addProjectTask(otherProject.id, org.publicKey, {
      title: "Foreign", description: "", category: "other",
      estimatedHours: 1, urgency: "low", requiredSkills: [],
      dependencies: [],
    });
    await expect(
      reorderProjectTask({
        taskId: t1.id,
        organizerKey: org.publicKey,
        beforeId: foreign.id,
        afterId: null,
      }),
    ).rejects.toThrow(/different project/i);
  });

  it("throws when a neighbor equals taskId (no-op)", async () => {
    const { org, t1 } = await setupThreeTasks();
    await expect(
      reorderProjectTask({
        taskId: t1.id,
        organizerKey: org.publicKey,
        beforeId: t1.id,
        afterId: null,
      }),
    ).rejects.toThrow(/own neighbor/i);
  });

  it("throws when a neighbor does not exist", async () => {
    const { org, t1 } = await setupThreeTasks();
    await expect(
      reorderProjectTask({
        taskId: t1.id,
        organizerKey: org.publicKey,
        beforeId: "ghost-task",
        afterId: null,
      }),
    ).rejects.toThrow(/not found/i);
  });

  it("renumbers the project when precision degrades", async () => {
    const { org, p, t1, t2, t3 } = await setupThreeTasks();
    // Crush the gap between t1 and t2 to under the epsilon
    // threshold (1e-3), so the next midpoint between t1 and t2
    // would collapse.
    await db.projectTasks.put({ ...t1, orderIndex: 1000 });
    await db.projectTasks.put({ ...t2, orderIndex: 1000.0001 });
    // Move t3 between t1 and t2 — must trigger renumber.
    await reorderProjectTask({
      taskId: t3.id,
      organizerKey: org.publicKey,
      beforeId: t1.id,
      afterId: t2.id,
    });
    const after = await db.projectTasks
      .where("projectId")
      .equals(p.id)
      .toArray();
    const sorted = after.sort((a, b) => a.orderIndex - b.orderIndex);
    // After renumber the three tasks have round 1000-spaced
    // indices on round-number slots, and t3 lands somewhere
    // between t1 and t2's renumbered positions.
    // The renumber sorts by current orderIndex (createdAt
    // secondary), so t1=1000, t2=2000, t3=3000, then t3 is moved
    // between t1 and t2 → t3.orderIndex = (1000 + 2000) / 2 =
    // 1500.
    const t1Row = sorted.find((r) => r.id === t1.id)!;
    const t2Row = sorted.find((r) => r.id === t2.id)!;
    const t3Row = sorted.find((r) => r.id === t3.id)!;
    expect(t1Row.orderIndex).toBe(1000);
    expect(t2Row.orderIndex).toBe(2000);
    expect(t3Row.orderIndex).toBe(1500);
  });
});
