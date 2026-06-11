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
  templateId: string | null;
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
    coOrganizerKeys: [],
    status: "planning",
    targetHours: input.targetHours,
    contributedHours: 0,
    deadline: input.deadline,
    createdAt: now,
    completedAt: null,
    pauseNote: null,
    pausedAt: null,
    locationZone: input.locationZone.trim(),
    tags: input.tags.map((t) => t.trim()).filter(Boolean),
    nodeId,
    templateId: input.templateId,
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
        // Stamp the transition so the "paused too long" attention item
        // computes honest days-since-pause instead of falling back to
        // createdAt (which would mis-fire on year-old projects paused
        // yesterday). See attention.ts.
        pausedAt: Date.now(),
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
      const updated: Project = {
        ...p,
        status: "active",
        pauseNote: null,
        pausedAt: null,
      };
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
        // Completing from "paused" clears the pause stamp — the project
        // is no longer in the paused state, so the "paused too long"
        // attention item must not re-surface if the status is later
        // toggled.
        pausedAt: null,
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

export async function archiveProject(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  return db.transaction(
    "rw",
    [db.projects, db.projectActivity],
    async () => {
      const p = await db.projects.get(projectId);
      if (!p) throw new Error("Project not found.");
      if (p.organizerKey !== organizerKey)
        throw new Error("Only the primary organizer can archive.");
      if (p.status !== "completed")
        throw new Error("Only completed projects can be archived.");
      const updated: Project = { ...p, status: "archived" };
      await db.projects.put(updated);
      await logActivity(
        projectId,
        "project_archived",
        organizerKey,
        {},
        p.nodeId,
      );
      return updated;
    },
  );
}

export async function unarchiveProject(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  return db.transaction(
    "rw",
    [db.projects, db.projectActivity],
    async () => {
      const p = await db.projects.get(projectId);
      if (!p) throw new Error("Project not found.");
      if (p.organizerKey !== organizerKey)
        throw new Error("Only the primary organizer can unarchive.");
      if (p.status !== "archived")
        throw new Error("Only archived projects can be unarchived.");
      const updated: Project = { ...p, status: "completed" };
      await db.projects.put(updated);
      await logActivity(
        projectId,
        "project_unarchived",
        organizerKey,
        {},
        p.nodeId,
      );
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

/**
 * PR A of the co-organizer invitations series introduced a derived
 * `effectiveCoOrganizerKeys` view (in `db/coorgInvitations.ts`) that
 * is async — it walks the new invitation / response / revocation
 * tables. We deliberately KEEP this `isOrganizer` synchronous and
 * keep it reading the static `Project.coOrganizerKeys` array for
 * now, because:
 *
 *   1. The v21 Dexie migration synthesizes accepted-invitation
 *      rows for every existing co-organizer pair, so the static
 *      array and the derived view stay in sync until a PR mutates
 *      one without the other.
 *   2. The new flows (`issueCoOrganizerInvitation` /
 *      `respondToCoOrganizerInvitation`) currently write only to
 *      the invitation tables — they do NOT mutate `coOrganizerKeys`
 *      yet (that wiring lands with PR C, once the UI surfaces the
 *      accept flow).
 *   3. `isOrganizer` has scattered call sites across the PWA;
 *      async-ifying it would force a sweep that balloons the diff
 *      and risks breaking unrelated paths.
 *
 * The migration to the derived view happens in PR C, when the UI
 * stops feeding the static array directly. See
 * `docs/co-organizer-invitations.md` §11.
 */
export function isOrganizer(project: Project, memberKey: string): boolean {
  return (
    project.organizerKey === memberKey ||
    project.coOrganizerKeys.includes(memberKey)
  );
}

async function requireOrganizer(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  const p = await db.projects.get(projectId);
  if (!p) throw new Error("Project not found.");
  if (!isOrganizer(p, organizerKey))
    throw new Error("Only project organizers can do that.");
  return p;
}

/**
 * Compute the next `orderIndex` for a freshly-added task in the
 * given project. Returns `1000` when the project has no tasks
 * yet; otherwise `max(existing orderIndex) + 1000` so the new
 * task lands at the bottom of the list.
 *
 * The `t.orderIndex !== undefined` guard is defensive against the
 * Dexie v25 upgrade not yet having run (e.g., the upgrade
 * callback is still pending or a test fixture pre-dates the
 * migration). After the migration runs this branch is unreachable
 * in production code paths.
 *
 * See docs/task-ordering-and-dependencies.md §4.1 for the
 * `* 1000` gap rationale.
 */
async function nextOrderIndexForProject(projectId: string): Promise<number> {
  const existing = await db.projectTasks
    .where("projectId")
    .equals(projectId)
    .toArray();
  if (existing.length === 0) return 1000;
  const max = existing.reduce(
    (m, t) => (t.orderIndex !== undefined && t.orderIndex > m ? t.orderIndex : m),
    0,
  );
  return max + 1000;
}

export async function removeCoOrganizer(
  projectId: string,
  callerKey: string,
  coOrgKey: string,
): Promise<Project> {
  return db.transaction("rw", [db.projects, db.projectActivity], async () => {
    const p = await db.projects.get(projectId);
    if (!p) throw new Error("Project not found.");
    // Two valid callers: the primary organizer (managing the roster) OR
    // the co-organizer themselves (stepping down). No one is conscripted
    // into a role, so a co-organizer can leave without primary approval.
    // The target must actually be a co-organizer — otherwise both branches
    // are nonsensical and we reject so callers can't quietly remove
    // someone who isn't in the role.
    const isInRole = p.coOrganizerKeys.includes(coOrgKey);
    const isPrimary = p.organizerKey === callerKey;
    const isSelfRemoval = callerKey === coOrgKey && isInRole;
    if (!isInRole || (!isPrimary && !isSelfRemoval))
      throw new Error(
        "Only the primary organizer or the co-organizer themselves can remove this co-organizer role.",
      );
    const updated: Project = {
      ...p,
      coOrganizerKeys: p.coOrganizerKeys.filter((k) => k !== coOrgKey),
    };
    await db.projects.put(updated);
    // Self-removal leaves an audit trail in the project history so the
    // primary and other members can see the role transition. Mirrors
    // the organizer_handoff pattern.
    if (isSelfRemoval) {
      await logActivity(
        projectId,
        "coorganizer_stepdown",
        callerKey,
        { steppedDownKey: coOrgKey },
        p.nodeId,
      );
    }
    return updated;
  });
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
      const orderIndex = await nextOrderIndexForProject(projectId);
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
        orderIndex,
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
      // PR C: removed the hard-block-on-claim throw. Dependencies are
      // soft per docs/task-ordering-and-dependencies.md §3 — claim is
      // allowed regardless of dependency status. canClaimTask remains
      // exported as a UI/attention helper; the attention rail and the
      // public needs_more_hands chip suppress nudges when canClaimTask
      // returns false (the chip change ships in PR F).
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
  acknowledgment?: string,
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
  // Self-confirm prohibition: a member cannot attest credit to
  // themselves. This is the rule that motivates the node system key
  // (see docs/auto-confirm-key.md §1) — when an organizer completes
  // their own task there is no second member to confirm, and the
  // system key path is the bounded fallback. That fallback lives in
  // `_systemAutoConfirmTask`; this entry point keeps the guard.
  if (task.completedBy === organizerKey)
    throw new Error(
      "An organizer who completes a task themselves needs a different project member to confirm.",
    );
  if (!isOrganizer(project, organizerKey))
    throw new Error("Only project organizers can confirm completions.");

  const helperKey = task.completedBy;
  const helpedKey = organizerKey;
  const [helperSecret, helpedSecret] = await Promise.all([
    getSecretKey(helperKey),
    getSecretKey(helpedKey),
  ]);

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

  const result = await _writeTaskConfirmation({
    task,
    project,
    exchange,
    organizerKey,
    now,
    acknowledgment,
  });

  // Kick the outbox worker so a connected node sees this exchange right
  // away. Same pattern confirmExchange uses.
  void flushOutboxNow().catch((err) => {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[understoria] project flush kick crashed", err);
    }
  });

  return result;
}

/**
 * System-key auto-confirm entry point for project tasks. Bypasses the
 * self-confirm guard in `confirmProjectTaskCompletion` because, in the
 * §1 motivating case from `docs/auto-confirm-key.md`, the organizer
 * IS the completer and there is no second member to attest. Credit
 * still flows; the audit trail makes the substitution loud.
 *
 * Values context — this is the change to read carefully:
 *
 * The shipped rule that an organizer cannot confirm their own task is
 * the right rule for member-signed records. A member cannot attest
 * credit to themselves; that's `community-authority` enforced in
 * code. This function does not relax that rule for members — it
 * routes around it only when the attesting signature is the node
 * system key, which is published in `GET /config`, tagged on the
 * record (`autoConfirmed: true`, `autoConfirmedBy: "system:<nodeId>"`),
 * and verifiable post-hoc by any peer. The substitution is therefore
 * NOT a member self-confirming dressed up as something else; it is a
 * structurally different signing identity that an auditor can tell
 * apart from a member confirmation (§4 distinguishability).
 *
 * The pre-signed `exchange` argument carries the system-signed
 * helped-side signature; this function does not invoke any signer.
 * The sweep is the only caller — see
 * `apps/web/src/lib/autoConfirmSweep.ts`. Direct invocation from
 * anywhere else is a bug.
 */
export async function _systemAutoConfirmTask(
  taskId: string,
  exchange: Exchange,
  acknowledgment?: string,
): Promise<ConfirmTaskResult> {
  const task = await db.projectTasks.get(taskId);
  if (!task) throw new Error("Task not found.");
  const project = await db.projects.get(task.projectId);
  if (!project) throw new Error("Parent project not found.");
  if (task.status !== "awaiting_confirmation")
    throw new Error("Task isn't waiting for confirmation.");
  if (!task.completedBy)
    throw new Error("Task has no recorded completer.");
  // Sanity: the pre-signed exchange must match the task we're closing.
  if (exchange.helperKey !== task.completedBy) {
    throw new Error(
      "system auto-confirm: exchange helperKey does not match task.completedBy",
    );
  }
  if (!exchange.autoConfirmed || !exchange.autoConfirmedBy) {
    throw new Error(
      "system auto-confirm: exchange is missing autoConfirmed / autoConfirmedBy",
    );
  }
  return _writeTaskConfirmation({
    task,
    project,
    exchange,
    // For the audit log we record the system identity (not a member
    // key). The activity row reflects who acted: "system" — not the
    // organizer, who was the absent party.
    organizerKey: exchange.autoConfirmedBy,
    now: exchange.autoConfirmedAt ?? Date.now(),
    acknowledgment,
  });
}

/**
 * Private — the shared write path used by both
 * `confirmProjectTaskCompletion` (member-signed) and
 * `_systemAutoConfirmTask` (system-signed). Caller has already done
 * eligibility / signing; this function only persists, increments
 * project hours, fires milestones, and recomputes achievements.
 *
 * Not exported. Tests exercise it through the two public entry
 * points so the guard chain (self-confirm, organizer role) is part
 * of every coverage path.
 */
interface WriteTaskConfirmationInput {
  task: ProjectTask;
  project: Project;
  exchange: Exchange;
  /** Who acted, for the activity log. Member key for the manual
   *  path; `"system:<nodeId>"` for the auto-confirm path. */
  organizerKey: string;
  now: number;
  acknowledgment?: string;
}

async function _writeTaskConfirmation(
  input: WriteTaskConfirmationInput,
): Promise<ConfirmTaskResult> {
  const { task, project, exchange, organizerKey, now, acknowledgment } = input;
  return db.transaction(
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

      const confirmActivityData: Record<string, unknown> = {
        taskId: task.id,
        exchangeId: exchange.id,
        helperKey: exchange.helperKey,
        hours: task.estimatedHours,
      };
      if (exchange.autoConfirmed) {
        confirmActivityData.autoConfirmed = true;
      }
      if (acknowledgment?.trim()) {
        confirmActivityData.acknowledgment = acknowledgment.trim();
      }
      await logActivity(
        project.id,
        "task_confirmed",
        organizerKey,
        confirmActivityData,
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

      // Award any newly-earned achievements for the helper (who can
      // earn First Exchange, Connector, etc. from a project task
      // just as from a board exchange — it's a real signed
      // Exchange). On the auto-confirm path the "organizer" half of
      // this pair is the system identity, which can't earn member
      // achievements — so we evaluate only the helper to avoid
      // attributing a project achievement to "system:<nodeId>".
      const helperKey = exchange.helperKey;
      const orgEligibleForAchievements = !exchange.autoConfirmed;
      const allExchangesNow = await db.exchanges.toArray();
      const allProjectsNow = await db.projects.toArray();
      const allTasksNow = await db.projectTasks.toArray();
      const recipients = orgEligibleForAchievements
        ? [helperKey, organizerKey]
        : [helperKey];
      for (const memberKey of recipients) {
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

export async function logActivity(
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

export async function handoffOrganizer(
  projectId: string,
  callerKey: string,
  newPrimaryKey: string,
): Promise<Project> {
  return db.transaction("rw", [db.projects, db.projectActivity], async () => {
    const p = await db.projects.get(projectId);
    if (!p) throw new Error("Project not found.");
    if (p.organizerKey !== callerKey)
      throw new Error("Only the primary organizer can hand off.");
    if (!p.coOrganizerKeys.includes(newPrimaryKey))
      throw new Error("New primary must be a current co-organizer.");
    if (p.status === "completed" || p.status === "archived")
      throw new Error("Cannot hand off a completed or archived project.");
    const updated: Project = {
      ...p,
      organizerKey: newPrimaryKey,
      coOrganizerKeys: [
        ...p.coOrganizerKeys.filter((k) => k !== newPrimaryKey),
        callerKey,
      ],
    };
    await db.projects.put(updated);
    await logActivity(projectId, "organizer_handoff", callerKey, {
      fromKey: callerKey,
      toKey: newPrimaryKey,
    }, p.nodeId);
    return updated;
  });
}

// -- Announcements ----------------------------------------------------------

export async function postAnnouncement(
  projectId: string,
  callerKey: string,
  body: string,
  nodeId: string,
): Promise<void> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Announcement body is required.");
  if (trimmed.length > 2000)
    throw new Error("Announcement too long (max 2000 characters).");
  return db.transaction("rw", [db.projects, db.projectActivity], async () => {
    const p = await requireOrganizer(projectId, callerKey);
    if (p.status === "archived")
      throw new Error("Cannot post to an archived project.");
    await logActivity(projectId, "announcement", callerKey, { body: trimmed }, nodeId);
  });
}

export async function listAnnouncements(
  projectId: string,
  limit = 20,
): Promise<ProjectActivity[]> {
  const all = await db.projectActivity
    .where("[projectId+createdAt]")
    .between([projectId, 0], [projectId, Infinity])
    .reverse()
    .toArray();
  return all.filter((a) => a.type === "announcement").slice(0, limit);
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


// -- Task editing -----------------------------------------------------------

export async function editProjectTask(
  taskId: string,
  organizerKey: string,
  updates: {
    title?: string;
    description?: string;
    estimatedHours?: number;
    urgency?: Urgency;
    dependencies?: string[];
  },
): Promise<ProjectTask> {
  return db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity],
    async () => {
      const task = await db.projectTasks.get(taskId);
      if (!task) throw new Error("Task not found.");
      if (task.status !== "open")
        throw new Error("Only open tasks can be edited.");
      await requireOrganizer(task.projectId, organizerKey);
      const updated: ProjectTask = {
        ...task,
        title: updates.title?.trim() || task.title,
        description: updates.description?.trim() ?? task.description,
        estimatedHours: updates.estimatedHours ?? task.estimatedHours,
        urgency: updates.urgency ?? task.urgency,
      };
      if (updates.dependencies !== undefined) {
        const allTasks = await db.projectTasks
          .where("projectId").equals(task.projectId).toArray();
        if (detectCycle(task.id, updates.dependencies, allTasks))
          throw new Error("Adding these dependencies would create a cycle.");
        for (const depId of updates.dependencies) {
          if (!allTasks.some((t) => t.id === depId))
            throw new Error("Dependency not found in this project.");
        }
        updated.dependencies = updates.dependencies;
      }
      await db.projectTasks.put(updated);
      const project = await db.projects.get(task.projectId);
      await logActivity(task.projectId, "task_added", organizerKey, {
        taskId: task.id,
        taskTitle: updated.title,
        edited: true,
      }, project?.nodeId ?? "");
      return updated;
    },
  );
}

// -- Bulk task quick-add ----------------------------------------------------

export async function bulkAddTasks(
  projectId: string,
  organizerKey: string,
  lines: string[],
  nodeId: string,
): Promise<ProjectTask[]> {
  const titles = lines.map((l) => l.trim()).filter(Boolean);
  if (titles.length === 0) throw new Error("No tasks to add.");
  if (titles.length > 50) throw new Error("Maximum 50 tasks at a time.");

  return db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      if (p.status === "completed" || p.status === "archived")
        throw new Error("Tasks cannot be added to a completed project.");
      // Compute the starting orderIndex once; each task in the
      // batch gets `start + i * 1000` so they land at the bottom
      // in insertion order.
      const startOrderIndex = await nextOrderIndexForProject(projectId);
      const tasks: ProjectTask[] = [];
      for (let i = 0; i < titles.length; i++) {
        const title = titles[i];
        const task: ProjectTask = {
          id: uuid(),
          projectId,
          title,
          description: "",
          category: p.category,
          estimatedHours: 1,
          urgency: "low",
          requiredSkills: [],
          assignedTo: null,
          status: "open",
          dependencies: [],
          orderIndex: startOrderIndex + i * 1000,
          createdAt: Date.now(),
          completedAt: null,
          completedBy: null,
          exchangeId: null,
          claimedAt: null,
          checkInAcknowledgedAt: null,
        };
        await db.projectTasks.put(task);
        await logActivity(projectId, "task_added", organizerKey, {
          taskId: task.id,
          hours: task.estimatedHours,
        }, nodeId);
        tasks.push(task);
      }
      return tasks;
    },
  );
}

export function canClaimTask(
  task: ProjectTask,
  allTasks: readonly ProjectTask[],
): boolean {
  if (task.dependencies.length === 0) return true;
  return task.dependencies.every((depId) => {
    const dep = allTasks.find((t) => t.id === depId);
    return dep?.status === "completed";
  });
}

export function detectCycle(
  taskId: string,
  proposedDeps: string[],
  allTasks: readonly ProjectTask[],
): boolean {
  const visited = new Set<string>();
  function dfs(current: string): boolean {
    if (current === taskId) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    const task = allTasks.find((t) => t.id === current);
    if (!task) return false;
    return task.dependencies.some((depId) => dfs(depId));
  }
  return proposedDeps.some((depId) => dfs(depId));
}

export async function setTaskDependencies(
  taskId: string,
  organizerKey: string,
  dependencyIds: string[],
): Promise<ProjectTask> {
  return db.transaction(
    "rw",
    [db.projects, db.projectTasks],
    async () => {
      const task = await db.projectTasks.get(taskId);
      if (!task) throw new Error("Task not found.");
      if (task.status !== "open")
        throw new Error("Only open tasks can have dependencies changed.");
      await requireOrganizer(task.projectId, organizerKey);
      const allTasks = await db.projectTasks
        .where("projectId")
        .equals(task.projectId)
        .toArray();
      for (const depId of dependencyIds) {
        if (!allTasks.some((t) => t.id === depId))
          throw new Error("Dependency not found in this project.");
      }
      if (detectCycle(taskId, dependencyIds, allTasks))
        throw new Error("Adding these dependencies would create a cycle.");
      const updated: ProjectTask = { ...task, dependencies: dependencyIds };
      await db.projectTasks.put(updated);
      return updated;
    },
  );
}

/**
 * Threshold below which precision is considered "degraded" and a
 * full per-project renumber is triggered. Picked at `0.001` rather
 * than something like `1` to give fractional inserts ample
 * headroom — with 1000-unit starting gaps, a member can halve the
 * gap dozens of times before hitting this floor, while still
 * staying well clear of IEEE-754 double-precision imprecision.
 *
 * If the candidate `orderIndex` lands within `PRECISION_EPSILON`
 * of either neighbor — or if the two neighbors themselves are
 * within `PRECISION_EPSILON` of each other — `reorderProjectTask`
 * renumbers the project before placing the moved task.
 *
 * See docs/task-ordering-and-dependencies.md §4.1 and §13 for the
 * pilot-tuning note.
 */
const PRECISION_EPSILON = 0.001;

/**
 * Reorder a task within its parent project by placing it between
 * two neighbors. Neighbor-pair signature settled in
 * docs/task-ordering-and-dependencies.md §5.1 — the button path
 * (Move up / Move down) and the drag path both resolve to a
 * neighbor pair before calling.
 *
 * Algorithm:
 *
 * 1. Look up the task; throw if not found.
 * 2. Look up the project; require the caller is the primary
 *    organizer or a co-organizer.
 * 3. Resolve `beforeId` / `afterId` to actual rows. Reject if a
 *    neighbor doesn't exist, belongs to a different project, or
 *    equals `taskId` itself.
 * 4. Compute the candidate `orderIndex`:
 *      - both neighbors: midpoint = `(before.orderIndex + after.orderIndex) / 2`
 *      - only `beforeId` (moving past the last task): `before.orderIndex + 1000`
 *      - only `afterId` (moving above the first task): `after.orderIndex - 1000`
 *        (or `after.orderIndex / 2` if that drops below a sane floor)
 *      - both null: invalid — throw
 * 5. If the candidate is within `PRECISION_EPSILON` of either
 *    neighbor, or the two neighbors are within `PRECISION_EPSILON`
 *    of each other, renumber the entire project's task list to
 *    `(rank + 1) * 1000` and recompute the candidate against the
 *    renumbered neighbors. The renumber happens in the same Dexie
 *    transaction as the move — atomicity matters here, because a
 *    partial renumber would leave the project's task order
 *    incoherent.
 * 6. Persist the moved task with its new `orderIndex`.
 *
 * `beforeId` is the task that will render immediately *before*
 * the moved task at the destination; `afterId` is the task that
 * will render immediately *after*. The function does not care
 * about render direction (ascending vs descending) — it only
 * cares that `before.orderIndex < after.orderIndex` in the
 * canonical lower-renders-earlier convention.
 *
 * Reorders are not logged to the project activity feed (see
 * docs/task-ordering-and-dependencies.md §6.5).
 */
export async function reorderProjectTask(input: {
  taskId: string;
  organizerKey: string;
  beforeId: string | null;
  afterId: string | null;
}): Promise<void> {
  const { taskId, organizerKey, beforeId, afterId } = input;
  if (beforeId === null && afterId === null)
    throw new Error("Reorder requires at least one neighbor.");
  if (beforeId === taskId || afterId === taskId)
    throw new Error("A task cannot be its own neighbor in a reorder.");

  await db.transaction(
    "rw",
    [db.projects, db.projectTasks],
    async () => {
      const task = await db.projectTasks.get(taskId);
      if (!task) throw new Error("Task not found.");
      await requireOrganizer(task.projectId, organizerKey);

      const before =
        beforeId !== null ? await db.projectTasks.get(beforeId) : null;
      const after =
        afterId !== null ? await db.projectTasks.get(afterId) : null;
      if (beforeId !== null && !before)
        throw new Error("Neighbor task not found.");
      if (afterId !== null && !after)
        throw new Error("Neighbor task not found.");
      if (before && before.projectId !== task.projectId)
        throw new Error("Neighbor belongs to a different project.");
      if (after && after.projectId !== task.projectId)
        throw new Error("Neighbor belongs to a different project.");

      // Compute a candidate orderIndex from the current neighbor
      // values. If precision degrades, renumber and recompute
      // against the renumbered neighbors.
      const needsRenumber = (): boolean => {
        if (before && after) {
          if (Math.abs(after.orderIndex - before.orderIndex) < PRECISION_EPSILON)
            return true;
          const mid = (before.orderIndex + after.orderIndex) / 2;
          if (
            Math.abs(mid - before.orderIndex) < PRECISION_EPSILON ||
            Math.abs(mid - after.orderIndex) < PRECISION_EPSILON
          )
            return true;
        }
        return false;
      };

      if (needsRenumber()) {
        // Renumber the whole project: sort by current orderIndex
        // (createdAt as a stable secondary key), assign
        // `(rank + 1) * 1000`, persist every row.
        const allTasks = await db.projectTasks
          .where("projectId")
          .equals(task.projectId)
          .toArray();
        allTasks.sort((a, b) => {
          if (a.orderIndex !== b.orderIndex)
            return a.orderIndex - b.orderIndex;
          return a.createdAt - b.createdAt;
        });
        for (let i = 0; i < allTasks.length; i++) {
          const renumbered = { ...allTasks[i], orderIndex: (i + 1) * 1000 };
          await db.projectTasks.put(renumbered);
        }
        // Re-read the neighbors and the task so the post-renumber
        // values drive the placement.
        const refreshedTask = await db.projectTasks.get(taskId);
        if (!refreshedTask) throw new Error("Task not found.");
        const refreshedBefore =
          beforeId !== null ? await db.projectTasks.get(beforeId) : null;
        const refreshedAfter =
          afterId !== null ? await db.projectTasks.get(afterId) : null;
        const newOrderIndex = computePlacement(
          refreshedBefore ?? null,
          refreshedAfter ?? null,
        );
        await db.projectTasks.put({
          ...refreshedTask,
          orderIndex: newOrderIndex,
        });
        return;
      }

      const newOrderIndex = computePlacement(before ?? null, after ?? null);
      await db.projectTasks.put({ ...task, orderIndex: newOrderIndex });
    },
  );
}

/**
 * Compute the new `orderIndex` for a moved task given its
 * destination neighbors. Pure function; assumes precision is
 * adequate (the caller checks via `PRECISION_EPSILON`).
 */
function computePlacement(
  before: ProjectTask | null,
  after: ProjectTask | null,
): number {
  if (before && after) {
    return (before.orderIndex + after.orderIndex) / 2;
  }
  if (before && !after) {
    return before.orderIndex + 1000;
  }
  if (!before && after) {
    const candidate = after.orderIndex - 1000;
    // Stay above zero so we don't drift into negative territory
    // (the field is documented as monotonic; negative is fine in
    // theory, but staying positive keeps the values legible in
    // logs). When the target task already sits near zero, halve
    // instead of subtracting.
    if (candidate < 1) return after.orderIndex / 2;
    return candidate;
  }
  // Both null is rejected by the caller before this runs.
  throw new Error("Reorder requires at least one neighbor.");
}

export async function cloneProject(
  sourceProjectId: string,
  organizerKey: string,
  newTitle: string,
  nodeId: string,
): Promise<Project> {
  const source = await db.projects.get(sourceProjectId);
  if (!source) throw new Error("Source project not found.");
  const sourceTasks = await db.projectTasks
    .where("projectId")
    .equals(sourceProjectId)
    .toArray();

  const now = Date.now();
  const project: Project = {
    id: uuid(),
    title: newTitle.trim() || `${source.title} (copy)`,
    description: source.description,
    category: source.category,
    organizerKey,
    coOrganizerKeys: [],
    status: "planning",
    targetHours: source.targetHours,
    contributedHours: 0,
    deadline: null,
    createdAt: now,
    completedAt: null,
    pauseNote: null,
    pausedAt: null,
    locationZone: source.locationZone,
    tags: [...source.tags],
    nodeId,
    // Carry the source's templateId so a cloned project still groups
    // with sibling efforts under the same template.
    templateId: source.templateId,
  };

  await db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity],
    async () => {
      await db.projects.put(project);
      await logActivity(project.id, "project_created", organizerKey, {
        clonedFrom: sourceProjectId,
      }, nodeId);
      // Sort source tasks by createdAt to compute a deterministic
      // fallback rank when a source task pre-dates the v25 backfill
      // and somehow still lacks orderIndex. Post-migration this
      // fallback branch is unreachable.
      const sourceTasksByCreated = [...sourceTasks].sort(
        (a, b) => a.createdAt - b.createdAt,
      );
      for (let i = 0; i < sourceTasksByCreated.length; i++) {
        const t = sourceTasksByCreated[i];
        const orderIndex =
          t.orderIndex !== undefined ? t.orderIndex : (i + 1) * 1000;
        const task: ProjectTask = {
          id: uuid(),
          projectId: project.id,
          title: t.title,
          description: t.description,
          category: t.category,
          estimatedHours: t.estimatedHours,
          urgency: t.urgency,
          requiredSkills: [...t.requiredSkills],
          assignedTo: null,
          status: "open",
          dependencies: [],
          orderIndex,
          createdAt: now,
          completedAt: null,
          completedBy: null,
          exchangeId: null,
          claimedAt: null,
          checkInAcknowledgedAt: null,
        };
        await db.projectTasks.put(task);
      }
    },
  );
  return project;
}
