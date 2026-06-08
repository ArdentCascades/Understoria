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
  addCoOrganizer,
  addProjectTask,
  archiveProject,
  canClaimTask,
  claimProjectTask,
  completeProject,
  confirmProjectTaskCompletion,
  createProject,
  detectCycle,
  handoffOrganizer,
  launchProject,
  markProjectTaskComplete,
  pauseProject,
  removeCoOrganizer,
  resumeProject,
  setTaskDependencies,
  unarchiveProject,
  unclaimProjectTask,
} from "./projects";
import type { ProjectTask } from "@/types";
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
    await addCoOrganizer(p.id, org.publicKey, coOrg.publicKey);
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

describe("handoffOrganizer", () => {
  beforeEach(reset);

  it("happy path: swaps organizer and demotes caller to co-organizer, logs activity", async () => {
    const alice = await createMember({ displayName: "Alice" }, NODE);
    const bob = await createMember({ displayName: "Bob" }, NODE);
    const p = await aProject(alice);
    await addCoOrganizer(p.id, alice.publicKey, bob.publicKey);

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
    await addCoOrganizer(p.id, alice.publicKey, bob.publicKey);

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
    await addCoOrganizer(p.id, alice.publicKey, bob.publicKey);
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
    await addCoOrganizer(p.id, alice.publicKey, bob.publicKey);

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
    await addCoOrganizer(p.id, alice.publicKey, bob.publicKey);

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
    await addCoOrganizer(p.id, alice.publicKey, bob.publicKey);

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
    await addCoOrganizer(p.id, alice.publicKey, bob.publicKey);

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
    createdAt: Date.now(),
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
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

  it("prevents claiming a task with unmet dependencies", async () => {
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
    await expect(
      claimProjectTask(t2.id, helper.publicKey),
    ).rejects.toThrow(/follows/i);
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
    await addCoOrganizer(p.id, org.publicKey, coOrg.publicKey);
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
