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
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./database";
import { createMember } from "./seed";
import {
  addProjectTask,
  claimProjectTask,
  confirmProjectTaskCompletion,
  createProject,
  launchProject,
  markProjectTaskComplete,
  sendBackProjectTaskCompletion,
} from "./projects";
import { listTaskComments } from "./taskComments";

// Organizer send-back ("not done yet"): the honest third option
// between confirming unfinished work and letting the auto-confirm
// sweep turn silence into a yes. The claimer KEEPS the task, the
// completion attempt clears, and the required note travels as an
// ordinary task comment — nothing is recorded against anyone.

const NODE = "node_sendback_test";

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.exchanges.clear(),
    db.achievements.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.outbox.clear(),
    db.projects.clear(),
    db.projectTasks.clear(),
    db.projectActivity.clear(),
    db.taskComments.clear(),
  ]);
}

async function awaitingTask() {
  const org = await createMember({ displayName: "Org" }, NODE);
  const helper = await createMember({ displayName: "Helper" }, NODE);
  const p = await createProject(
    org.publicKey,
    {
      title: "Community garden",
      description: "",
      category: "infrastructure",
      targetHours: 10,
      deadline: null,
      locationZone: "",
      tags: [],
      templateId: null,
    },
    NODE,
  );
  await launchProject(p.id, org.publicKey);
  const task = await addProjectTask(p.id, org.publicKey, {
    title: "Paint the shelf",
    description: "",
    category: "skilled_labor",
    estimatedHours: 2,
    urgency: "low",
    requiredSkills: [],
    dependencies: [],
  });
  await claimProjectTask(task.id, helper.publicKey);
  await markProjectTaskComplete(task.id, helper.publicKey);
  return { org, helper, project: p, task };
}

describe("sendBackProjectTaskCompletion", () => {
  beforeEach(reset);

  it("returns the task to the claimer with the note as a comment and a neutral trace", async () => {
    const { org, helper, project, task } = await awaitingTask();

    const updated = await sendBackProjectTaskCompletion(
      task.id,
      org.publicKey,
      "Looks great so far — it still needs the second coat.",
      NODE,
    );

    // The claimer KEEPS the task; only the completion attempt clears.
    expect(updated.status).toBe("claimed");
    expect(updated.assignedTo).toBe(helper.publicKey);
    expect(updated.completedBy).toBeNull();
    expect(updated.actualHours).toBeNull();
    expect(updated.completionSignedAt).toBeNull();
    expect(updated.completionSignatures).toBeNull();

    // The note is an ordinary, federating task comment by the organizer.
    const comments = await listTaskComments(project.id, task.id);
    expect(comments).toHaveLength(1);
    expect(comments[0].authorKey).toBe(org.publicKey);
    expect(comments[0].body).toBe(
      "Looks great so far — it still needs the second coat.",
    );

    // Neutral activity trace, mirroring the completer's own walk-back.
    const activity = await db.projectActivity
      .where("projectId")
      .equals(project.id)
      .toArray();
    const sentBack = activity.find((a) => a.type === "task_sent_back");
    expect(sentBack).toBeDefined();
    expect(sentBack?.actorKey).toBe(org.publicKey);
    expect(sentBack?.data).toMatchObject({ taskId: task.id });

    // No credit moved.
    expect(await db.exchanges.count()).toBe(0);
  });

  it("requires a note — sending work back wordlessly is refused", async () => {
    const { org, task } = await awaitingTask();
    await expect(
      sendBackProjectTaskCompletion(task.id, org.publicKey, "   ", NODE),
    ).rejects.toThrow(/note is required/i);
    expect((await db.projectTasks.get(task.id))?.status).toBe(
      "awaiting_confirmation",
    );
  });

  it("refuses non-organizers", async () => {
    const { task } = await awaitingTask();
    const bystander = await createMember({ displayName: "Other" }, NODE);
    await expect(
      sendBackProjectTaskCompletion(
        task.id,
        bystander.publicKey,
        "not yours to send back",
        NODE,
      ),
    ).rejects.toThrow(/organizers/i);
  });

  it("refuses tasks that aren't awaiting confirmation", async () => {
    const { org, task } = await awaitingTask();
    await sendBackProjectTaskCompletion(task.id, org.publicKey, "note", NODE);
    // Now claimed again — a second send-back has nothing to act on.
    await expect(
      sendBackProjectTaskCompletion(task.id, org.publicKey, "again", NODE),
    ).rejects.toThrow(/waiting for confirmation/i);
  });

  it("re-completion after send-back re-signs and confirms cleanly", async () => {
    const { org, helper, task } = await awaitingTask();
    await sendBackProjectTaskCompletion(
      task.id,
      org.publicKey,
      "One more pass, please.",
      NODE,
    );

    // The claimer finishes up and marks complete again — fresh
    // pre-signatures over fresh figures.
    const redone = await markProjectTaskComplete(
      task.id,
      helper.publicKey,
      3,
    );
    expect(redone.status).toBe("awaiting_confirmation");
    expect(redone.completionSignatures?.[org.publicKey]).toBeTruthy();

    const result = await confirmProjectTaskCompletion(
      task.id,
      org.publicKey,
      NODE,
    );
    expect(result.task.status).toBe("completed");
    expect(result.exchange.hoursExchanged).toBe(3);
  });
});
