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
import { db } from "./database";
import { uuid } from "@/lib/id";
import { canonicalExchangePayload, sign } from "@/lib/crypto";
import { getSecretKey } from "./secrets";
import { enqueueExchangeOutbox, flushOutboxNow } from "@/lib/outbox";
import { diffAchievements } from "@/lib/achievements";
import type {
  Exchange,
  Project,
  ProjectActivity,
  ProjectActivityType,
  ProjectCategory,
  ProjectTask,
  Urgency,
} from "@/types";

/**
 * Agent 10 — Community Projects & Momentum (Phase 2).
 *
 * Projects are multi-task collective goals. Where a regular Post is one
 * person needing one thing from one helper, a Project is a collective
 * goal that multiple members contribute to over days or weeks.
 *
 * Credits work the same way: completing a project task creates a signed
 * Exchange record with the task completer as `helper` and the project's
 * organizer as `helped` (the organizer's balance pays the credit). This
 * keeps the timebank math consistent.
 *
 * Phase 2 (this slice) ships:
 *   - Project lifecycle: create → active → paused / resumed → completed
 *   - Task lifecycle: open → claimed → awaiting_confirmation → completed
 *   - Mutual confirmation: completer marks done; organizer confirms;
 *     credits transfer
 *   - Activity log for every state transition
 *
 * Phase 3 (in flight):
 *   - Momentum metrics, project sparkline (shipped)
 *   - 4 project achievements (Groundbreaker, Crew Member, Momentum
 *     Maker, Keystone) — shipped
 *   - Custom milestones beyond auto-25/50/75/100 — still deferred
 *   - Federation: cross-node task claims — still deferred
 *   - 48-hour auto-confirm when organizer is the completer — still deferred
 *   - Task dependencies enforcement (currently a UI hint only) — still deferred
 */

// -- Project lifecycle ------------------------------------------------------

export interface CreateProjectInput {
  title: string;
  description: string;
  category: ProjectCategory;
  targetHours: number;
  deadline: number | null;
  locationZone: string;
  tags: string[];
}

export async function createProject(
  organizerKey: string,
  input: CreateProjectInput,
  nodeId: string,
): Promise<Project> {
  const now = Date.now();
  const project: Project = {
    id: uuid(),
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    organizerKey,
    status: "planning",
    targetHours: input.targetHours,
    contributedHours: 0,
    deadline: input.deadline,
    createdAt: now,
    completedAt: null,
    pauseNote: null,
    locationZone: input.locationZone.trim(),
    tags: input.tags.map((t) => t.trim()).filter(Boolean),
    nodeId,
  };
  await db.transaction("rw", [db.projects, db.projectActivity], async () => {
    await db.projects.put(project);
    await logActivity(project.id, "project_created", organizerKey, {}, nodeId);
  });
  return project;
}

export async function launchProject(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  return updateProjectStatus(projectId, organizerKey, "planning", "active");
}

export async function pauseProject(
  projectId: string,
  organizerKey: string,
  note: string,
): Promise<Project> {
  return db.transaction(
    "rw",
    [db.projects, db.projectActivity],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      if (p.status !== "active")
        throw new Error("Only an active project can be paused.");
      const updated: Project = {
        ...p,
        status: "paused",
        pauseNote: note.trim(),
      };
      await db.projects.put(updated);
      await logActivity(
        projectId,
        "project_paused",
        organizerKey,
        { note: note.trim() },
        p.nodeId,
      );
      return updated;
    },
  );
}

export async function resumeProject(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  return db.transaction(
    "rw",
    [db.projects, db.projectActivity],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      if (p.status !== "paused")
        throw new Error("Only a paused project can be resumed.");
      const updated: Project = { ...p, status: "active", pauseNote: null };
      await db.projects.put(updated);
      await logActivity(
        projectId,
        "project_resumed",
        organizerKey,
        {},
        p.nodeId,
      );
      return updated;
    },
  );
}

export async function completeProject(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  return db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity, db.achievements, db.exchanges],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      if (p.status !== "active" && p.status !== "paused")
        throw new Error("Only active / paused projects can be completed.");
      const now = Date.now();
      const updated: Project = {
        ...p,
        status: "completed",
        completedAt: now,
      };
      await db.projects.put(updated);
      await logActivity(
        projectId,
        "project_completed",
        organizerKey,
        { contributedHours: p.contributedHours, targetHours: p.targetHours },
        p.nodeId,
      );

      // Keystone achievement fires here for the organizer. Use the
      // freshly-updated project list so the just-completed project is
      // visible to the evaluator.
      const allProjectsNow = (await db.projects.toArray()).map((proj) =>
        proj.id === updated.id ? updated : proj,
      );
      const allTasksNow = await db.projectTasks.toArray();
      const existing = await db.achievements
        .where("memberKey")
        .equals(organizerKey)
        .toArray();
      const organizedProjects = allProjectsNow.filter(
        (proj) => proj.organizerKey === organizerKey,
      );
      const organizedProjectIds = new Set(organizedProjects.map((p) => p.id));
      const organizedProjectTasks = allTasksNow.filter((t) =>
        organizedProjectIds.has(t.projectId),
      );
      const diff = diffAchievements(
        organizerKey,
        existing.map((a) => a.achievementType),
        await db.exchanges.toArray(),
        { organizedProjects, organizedProjectTasks },
        now,
      );
      if (diff.length > 0) await db.achievements.bulkPut(diff);

      return updated;
    },
  );
}

async function updateProjectStatus(
  projectId: string,
  organizerKey: string,
  from: Project["status"],
  to: Project["status"],
): Promise<Project> {
  return db.transaction(
    "rw",
    [db.projects, db.projectActivity],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      if (p.status !== from)
        throw new Error(`Project must be ${from} to transition to ${to}.`);
      const updated: Project = { ...p, status: to };
      await db.projects.put(updated);
      const type: ProjectActivityType =
        to === "active" ? "project_resumed" : "project_paused";
      await logActivity(projectId, type, organizerKey, { to }, p.nodeId);
      return updated;
    },
  );
}

async function requireOrganizer(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  const p = await db.projects.get(projectId);
  if (!p) throw new Error("Project not found.");
  if (p.organizerKey !== organizerKey)
    throw new Error("Only the project organizer can do that.");
  return p;
}

// -- Task lifecycle ---------------------------------------------------------

export interface AddTaskInput {
  title: string;
  description: string;
  category: ProjectCategory;
  estimatedHours: number;
  urgency: Urgency;
  requiredSkills: string[];
  dependencies: string[];
}

export async function addProjectTask(
  projectId: string,
  organizerKey: string,
  input: AddTaskInput,
): Promise<ProjectTask> {
  return db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      if (p.status === "completed" || p.status === "archived")
        throw new Error("Tasks cannot be added to a completed project.");
      const task: ProjectTask = {
        id: uuid(),
        projectId,
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        estimatedHours: input.estimatedHours,
        urgency: input.urgency,
        requiredSkills: input.requiredSkills
          .map((s) => s.trim())
          .filter(Boolean),
        assignedTo: null,
        status: "open",
        dependencies: input.dependencies,
        createdAt: Date.now(),
        completedAt: null,
        completedBy: null,
        exchangeId: null,
        claimedAt: null,
        checkInAcknowledgedAt: null,
      };
      await db.projectTasks.put(task);
      await logActivity(
        projectId,
        "task_added",
        organizerKey,
        { taskId: task.id, hours: task.estimatedHours },
        p.nodeId,
      );
      return task;
    },
  );
}

export async function claimProjectTask(
  taskId: string,
  memberKey: string,
): Promise<ProjectTask> {
  return db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity],
    async () => {
      const task = await db.projectTasks.get(taskId);
      if (!task) throw new Error("Task not found.");
      if (task.status !== "open")
        throw new Error("This task isn't available to claim.");
      const project = await db.projects.get(task.projectId);
      if (!project) throw new Error("Parent project not found.");
      if (project.status !== "active")
        throw new Error("Project isn't accepting claims right now.");
      const updated: ProjectTask = {
        ...task,
        status: "claimed",
        assignedTo: memberKey,
        // Stamp the claim time so staleness can be computed from
        // this point. Clear any prior ack — re-claim resets the
        // private-nudge clock too.
        claimedAt: Date.now(),
        checkInAcknowledgedAt: null,
      };
      await db.projectTasks.put(updated);
      await logActivity(
        task.projectId,
        "task_claimed",
        memberKey,
        { taskId },
        project.nodeId,
      );
      return updated;
    },
  );
}

export async function unclaimProjectTask(
  taskId: string,
  memberKey: string,
): Promise<ProjectTask> {
  return db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity],
    async () => {
      const task = await db.projectTasks.get(taskId);
      if (!task) throw new Error("Task not found.");
      if (task.assignedTo !== memberKey)
        throw new Error("Only the claimer can release the task.");
      if (task.status !== "claimed")
        throw new Error("Task cannot be released from its current state.");
      const updated: ProjectTask = {
        ...task,
        status: "open",
        assignedTo: null,
        // Defensive cleanup: clearing the claim metadata too so a
        // re-claim starts fresh and the prompts don't fire on
        // stale timestamps.
        claimedAt: null,
        checkInAcknowledgedAt: null,
      };
      await db.projectTasks.put(updated);
      const project = await db.projects.get(task.projectId);
      await logActivity(
        task.projectId,
        "task_unclaimed",
        memberKey,
        { taskId },
        project?.nodeId ?? "",
      );
      return updated;
    },
  );
}

/**
 * Claimer dismisses the private "still on it?" nudge. Stamps
 * `checkInAcknowledgedAt`, which resets the private-prompt clock
 * for another `taskCheckInDays`. Doesn't affect the public
 * "could use more hands" chip — that's tied to `claimedAt`
 * directly so the community signal is harder to silence.
 */
export async function acknowledgeTaskCheckIn(
  taskId: string,
  memberKey: string,
): Promise<ProjectTask> {
  return db.transaction("rw", [db.projectTasks], async () => {
    const task = await db.projectTasks.get(taskId);
    if (!task) throw new Error("Task not found.");
    if (task.assignedTo !== memberKey)
      throw new Error("Only the claimer can acknowledge the check-in.");
    if (task.status !== "claimed") {
      throw new Error(
        "Check-in only applies to tasks currently in the claimed state.",
      );
    }
    const updated: ProjectTask = {
      ...task,
      checkInAcknowledgedAt: Date.now(),
    };
    await db.projectTasks.put(updated);
    return updated;
  });
}

export async function markProjectTaskComplete(
  taskId: string,
  memberKey: string,
): Promise<ProjectTask> {
  return db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity],
    async () => {
      const task = await db.projectTasks.get(taskId);
      if (!task) throw new Error("Task not found.");
      if (task.status !== "claimed")
        throw new Error("Task must be claimed before completion.");
      if (task.assignedTo !== memberKey)
        throw new Error("Only the claimer can mark the task complete.");
      const updated: ProjectTask = {
        ...task,
        status: "awaiting_confirmation",
        completedBy: memberKey,
      };
      await db.projectTasks.put(updated);
      const project = await db.projects.get(task.projectId);
      await logActivity(
        task.projectId,
        "task_completed",
        memberKey,
        { taskId },
        project?.nodeId ?? "",
      );
      return updated;
    },
  );
}

export interface ConfirmTaskResult {
  task: ProjectTask;
  project: Project;
  exchange: Exchange;
  /** Auto-milestones (25/50/75/100%) that fired in this confirmation. */
  milestonesReached: number[];
}

/**
 * Organizer-side confirmation. Creates the signed Exchange record,
 * increments `contributedHours`, fires any milestone events that just
 * crossed a threshold, and enqueues the exchange for community-node
 * mirroring.
 */
export async function confirmProjectTaskCompletion(
  taskId: string,
  organizerKey: string,
  nodeId: string,
): Promise<ConfirmTaskResult> {
  // Pre-load secrets outside the transaction so the signing keys don't
  // pull `secretKeys` into the transaction scope.
  const task = await db.projectTasks.get(taskId);
  if (!task) throw new Error("Task not found.");
  const project = await db.projects.get(task.projectId);
  if (!project) throw new Error("Parent project not found.");
  if (task.status !== "awaiting_confirmation")
    throw new Error("Task isn't waiting for confirmation.");
  if (!task.completedBy)
    throw new Error("Task has no recorded completer.");
  if (task.completedBy === organizerKey)
    throw new Error(
      "An organizer who completes a task themselves needs a different project member to confirm.",
    );
  if (project.organizerKey !== organizerKey)
    throw new Error("Only the project organizer can confirm completions.");

  const helperKey = task.completedBy;
  const helpedKey = organizerKey;
  const [helperSecret, helpedSecret] = await Promise.all([
    getSecretKey(helperKey),
    getSecretKey(helpedKey),
  ]);

  const result = await db.transaction(
    "rw",
    [
      db.projects,
      db.projectTasks,
      db.projectActivity,
      db.exchanges,
      db.outbox,
      db.settings,
      db.achievements,
    ],
    async () => {
      const now = Date.now();
      const payload = canonicalExchangePayload({
        postId: `project:${project.id}/task:${task.id}`,
        helperKey,
        helpedKey,
        hours: task.estimatedHours,
        category: task.category as Exchange["category"],
        completedAt: now,
      });
      const exchange: Exchange = {
        id: uuid(),
        postId: `project:${project.id}/task:${task.id}`,
        helperKey,
        helpedKey,
        hoursExchanged: task.estimatedHours,
        helperSignature: sign(payload, helperSecret),
        helpedSignature: sign(payload, helpedSecret),
        completedAt: now,
        category: task.category as Exchange["category"],
        nodeId,
      };
      await db.exchanges.put(exchange);
      await enqueueExchangeOutbox(exchange);

      const updatedTask: ProjectTask = {
        ...task,
        status: "completed",
        completedAt: now,
        exchangeId: exchange.id,
      };
      await db.projectTasks.put(updatedTask);

      const newContributed = roundHours(
        project.contributedHours + task.estimatedHours,
      );
      const milestones = milestonesCrossed(
        project.contributedHours,
        newContributed,
        project.targetHours,
      );
      const updatedProject: Project = {
        ...project,
        contributedHours: newContributed,
      };
      await db.projects.put(updatedProject);

      await logActivity(
        project.id,
        "task_confirmed",
        organizerKey,
        {
          taskId: task.id,
          exchangeId: exchange.id,
          helperKey,
          hours: task.estimatedHours,
        },
        project.nodeId,
      );
      for (const m of milestones) {
        await logActivity(
          project.id,
          "milestone_reached",
          organizerKey,
          { milestone: m },
          project.nodeId,
        );
      }

      // Award any newly-earned achievements for both the helper (who
      // can earn First Exchange, Connector, etc. from a project task
      // just as from a board exchange — it's a real signed Exchange)
      // and the organizer (Groundbreaker / Momentum Maker for project
      // achievements). Keystone fires from completeProject; not here.
      const allExchangesNow = await db.exchanges.toArray();
      const allProjectsNow = await db.projects.toArray();
      const allTasksNow = await db.projectTasks.toArray();
      for (const memberKey of [helperKey, organizerKey]) {
        const existing = await db.achievements
          .where("memberKey")
          .equals(memberKey)
          .toArray();
        const organizedProjects = allProjectsNow.filter(
          (p) => p.organizerKey === memberKey,
        );
        const organizedProjectIds = new Set(organizedProjects.map((p) => p.id));
        const organizedProjectTasks = allTasksNow.filter((t) =>
          organizedProjectIds.has(t.projectId),
        );
        const completedProjectTasks = allTasksNow.filter(
          (t) => t.status === "completed" && t.completedBy === memberKey,
        ).length;
        const previouslyFilledCategories = new Set(
          allExchangesNow
            .filter((x) => x.id !== exchange.id)
            .map((x) => x.category),
        );
        const diff = diffAchievements(
          memberKey,
          existing.map((a) => a.achievementType),
          allExchangesNow,
          {
            previouslyFilledCategories,
            organizedProjects,
            organizedProjectTasks,
            completedProjectTasks,
          },
          now,
        );
        if (diff.length > 0) await db.achievements.bulkPut(diff);
      }

      return {
        task: updatedTask,
        project: updatedProject,
        exchange,
        milestonesReached: milestones,
      };
    },
  );

  // Kick the outbox worker so a connected node sees this exchange right
  // away. Same pattern confirmExchange uses.
  void flushOutboxNow().catch((err) => {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[understoria] project flush kick crashed", err);
    }
  });

  return result;
}

// -- Helpers ----------------------------------------------------------------

const MILESTONE_THRESHOLDS = [0.25, 0.5, 0.75, 1];

function milestonesCrossed(
  prev: number,
  next: number,
  target: number,
): number[] {
  if (target <= 0) return [];
  const out: number[] = [];
  for (const pct of MILESTONE_THRESHOLDS) {
    const mark = target * pct;
    if (prev < mark && next >= mark) out.push(pct);
  }
  return out;
}

function roundHours(h: number): number {
  return Math.round(h * 100) / 100;
}

async function logActivity(
  projectId: string,
  type: ProjectActivityType,
  actorKey: string,
  data: Record<string, unknown>,
  nodeId: string,
): Promise<void> {
  const entry: ProjectActivity = {
    id: uuid(),
    projectId,
    type,
    actorKey,
    data,
    createdAt: Date.now(),
    nodeId,
  };
  await db.projectActivity.put(entry);
}

// -- Reads ------------------------------------------------------------------

export async function listProjects(opts: {
  status?: Project["status"];
} = {}): Promise<Project[]> {
  if (opts.status) {
    return db.projects.where("status").equals(opts.status).toArray();
  }
  return db.projects.toArray();
}

export async function listTasksForProject(
  projectId: string,
): Promise<ProjectTask[]> {
  return db.projectTasks.where("projectId").equals(projectId).toArray();
}

export async function listActivityForProject(
  projectId: string,
  limit = 50,
): Promise<ProjectActivity[]> {
  return db.projectActivity
    .where("[projectId+createdAt]")
    .between([projectId, -Infinity], [projectId, Infinity])
    .reverse()
    .limit(limit)
    .toArray();
}
