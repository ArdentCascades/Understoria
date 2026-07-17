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
import Dexie from "dexie";
import { db } from "./database";
import { uuid } from "@/lib/id";
import {
  canonicalAwaitingTransitionPayload,
  canonicalExchangePayload,
  sign,
  signStateRecord,
  verify,
} from "@/lib/crypto";
import { getSecretKey } from "./secrets";
import {
  enqueueAwaitingTransition,
  enqueueExchangeOutbox,
  enqueueProjectStateOutbox,
  enqueueTaskStateOutbox,
  flushOutboxNow,
} from "@/lib/outbox";
import { diffAchievements } from "@/lib/achievements";
import { evaluateSafeguards, exceedsDailyLimit } from "@/lib/safeguards";
import { getNodeConfig } from "./nodeConfig";
import { postTaskComment } from "./taskComments";
import { creditHoursForTask } from "@/lib/timebank";
import { normalizeExchangeCategory } from "@/lib/categories";
import type {
  Exchange,
  Project,
  ProjectActivity,
  ProjectActivityType,
  ProjectCategory,
  ProjectTask,
  Urgency,
} from "@/types";
import type { ProjectState, TaskState } from "@understoria/shared/types";

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
 *   - Auto-confirm when organizer is the completer — shipped via the
 *     system-key sweep (`lib/autoConfirmSweep.ts`, configurable
 *     `autoConfirmHours`, 168h default; see docs/auto-confirm-key.md)
 *   - Task dependencies enforcement (currently a UI hint only) — still deferred
 */

// -- Federation publish (docs/project-federation.md §5) ----------------------

/**
 * Sign the CURRENT local version of a project as a ProjectState record,
 * persist the stamped version locally (so `updatedAt` participates in
 * the pull-side LWW merge), and enqueue it for the community node.
 *
 * Every project mutator calls this AFTER its write transaction commits.
 * Soft-degrade by design: on a locked device (or for an actor key this
 * device doesn't hold) the local write has already landed and the
 * publish is skipped silently — the next unlocked mutation republishes
 * the whole row, which is safe because these are full-state LWW
 * records, not deltas.
 */
export async function publishProjectState(
  projectId: string,
  actorKey: string,
): Promise<void> {
  // Nested composition (createProjectWithTasks, cloneProject) invokes
  // mutators inside an ambient transaction whose table scope excludes
  // the outbox; the OUTERMOST mutator publishes after commit instead.
  if (Dexie.currentTransaction) return;
  try {
    const row = (await db.projects.get(projectId)) as
      | (Project & Partial<ProjectState>)
      | undefined;
    if (!row) return;
    const secret = await getSecretKey(actorKey);
    const { signature: _prev, ...rest } = row;
    const unsigned = {
      ...rest,
      updatedAt: Date.now(),
      signerKey: actorKey,
    } as Omit<ProjectState, "signature">;
    const record: ProjectState = {
      ...unsigned,
      signature: signStateRecord<ProjectState>(unsigned, secret),
    };
    await db.transaction(
      "rw",
      [db.projects, db.outbox, db.settings],
      async () => {
        await db.projects.put(record);
        await enqueueProjectStateOutbox(record);
      },
    );
    // Kick the worker so a connected node converges promptly — the
    // same unawaited pattern confirmProjectTaskCompletion uses.
    void flushOutboxNow().catch(() => {});
  } catch {
    // Locked device / missing key — see the soft-degrade note above.
  }
}

/** Task-row counterpart of `publishProjectState`; same contract. */
export async function publishTaskState(
  taskId: string,
  actorKey: string,
): Promise<void> {
  if (Dexie.currentTransaction) return;
  try {
    const row = (await db.projectTasks.get(taskId)) as
      | (ProjectTask & Partial<TaskState>)
      | undefined;
    if (!row) return;
    const secret = await getSecretKey(actorKey);
    const { signature: _prev, ...rest } = row;
    const unsigned = {
      ...rest,
      updatedAt: Date.now(),
      signerKey: actorKey,
    } as Omit<TaskState, "signature">;
    const record: TaskState = {
      ...unsigned,
      signature: signStateRecord<TaskState>(unsigned, secret),
    };
    await db.transaction(
      "rw",
      [db.projectTasks, db.outbox, db.settings],
      async () => {
        await db.projectTasks.put(record);
        await enqueueTaskStateOutbox(record);
      },
    );
    void flushOutboxNow().catch(() => {});
  } catch {
    // Locked device / missing key — soft-degrade, next mutation republishes.
  }
}

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
  await publishProjectState(project.id, organizerKey);
  return project;
}

/**
 * One staged task for `createProjectWithTasks`. `follows` holds
 * INDEXES into the same staged array (earlier entries only) — the
 * creator remaps them to the real task ids it mints, so template
 * content can express "task 2 follows task 0" without knowing ids.
 */
export interface StagedTaskInput {
  title: string;
  description: string;
  category?: ProjectCategory;
  estimatedHours: number;
  urgency?: Urgency;
  requiredSkills?: readonly string[];
  /** Indexes of earlier staged tasks this one follows (soft-block
   *  dependencies per docs/task-ordering-and-dependencies.md). A
   *  forward or self reference is a programming error and throws. */
  follows?: readonly number[];
  /** Rhythm for recurring work, carried from the template's cadence
   *  tag — see ProjectTask.recurringCadence. */
  recurringCadence?: ProjectTask["recurringCadence"];
}

/**
 * Create a project AND its staged tasks in ONE transaction — the
 * template flow's creator. The previous shape (createProject, then an
 * addProjectTask loop from the page) left a documented partial-write
 * window: a crash mid-loop produced a project with half its template
 * tasks. Composing the existing helpers inside one ambient
 * transaction removes that state entirely — either the project lands
 * with every included task (and its dependency edges), or nothing
 * lands.
 */
export async function createProjectWithTasks(
  organizerKey: string,
  input: CreateProjectInput,
  nodeId: string,
  tasks: readonly StagedTaskInput[],
): Promise<{ project: Project; tasks: ProjectTask[] }> {
  // Validate follows references before opening the transaction — a
  // bad index is a bug in the caller (template content), not a
  // runtime condition to half-apply.
  tasks.forEach((task, i) => {
    for (const dep of task.follows ?? []) {
      if (!Number.isInteger(dep) || dep < 0 || dep >= i) {
        throw new Error(
          `Staged task ${i} follows invalid index ${dep} — follows may only reference earlier staged tasks.`,
        );
      }
    }
  });
  const result = await db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity],
    async () => {
      const project = await createProject(organizerKey, input, nodeId);
      const created: ProjectTask[] = [];
      for (const task of tasks) {
        const row = await addProjectTask(project.id, organizerKey, {
          title: task.title,
          description: task.description,
          category: task.category ?? project.category,
          estimatedHours: task.estimatedHours,
          urgency: task.urgency ?? "low",
          requiredSkills: [...(task.requiredSkills ?? [])],
          recurringCadence: task.recurringCadence ?? null,
          // Remap staged indexes to the ids just minted. follows only
          // references earlier entries (validated above), so every
          // dependency id exists by the time we need it.
          dependencies: (task.follows ?? []).map((i) => created[i].id),
        });
        created.push(row);
      }
      return { project, tasks: created };
    },
  );
  // The nested createProject / addProjectTask calls skipped their own
  // publishes inside the ambient transaction; publish here, after the
  // whole batch has committed (project first — the node rejects tasks
  // whose project it hasn't seen).
  await publishProjectState(result.project.id, organizerKey);
  for (const t of result.tasks) {
    await publishTaskState(t.id, organizerKey);
  }
  return result;
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
  const result = await db.transaction(
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
  await publishProjectState(projectId, organizerKey);
  return result;
}

export async function resumeProject(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  const result = await db.transaction(
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
  await publishProjectState(projectId, organizerKey);
  return result;
}

export async function completeProject(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  const result = await db.transaction(
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

      await grantOrganizerCompletionAchievements(updated, organizerKey, now);

      return updated;
    },
  );
  await publishProjectState(projectId, organizerKey);
  return result;
}

/**
 * Keystone-and-friends evaluation at a completion-like transition,
 * shared by `completeProject` and `graduateProject` — graduating to
 * the Commons instead of closing must never cost the organizer their
 * completion achievement (docs/commons.md §3). Runs INSIDE the
 * caller's transaction; uses the freshly-updated project so the
 * transition is visible to the evaluator.
 */
async function grantOrganizerCompletionAchievements(
  updated: Project,
  organizerKey: string,
  now: number,
): Promise<void> {
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
}

// -- The Commons (docs/commons.md) ------------------------------------------
//
// A project that built something lasting can GRADUATE to `tended` —
// "a thing we tend" — instead of closing. Not a new object: the same
// Project row in a new state, with the recurring-task respawn and
// task claiming staying live (see the widened gates above). All four
// writers publish signed project state so mirrors converge.

/**
 * Graduate a project to the Commons — the organizer's choice at the
 * completion moment, or the retrofit path from `completed` for
 * projects that finished before the feature existed. `completedAt`
 * still means "when building finished": stamped on first transition,
 * preserved on retrofit.
 */
export async function graduateProject(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  const result = await db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity, db.achievements, db.exchanges],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      if (
        p.status !== "active" &&
        p.status !== "paused" &&
        p.status !== "completed"
      )
        throw new Error(
          "Only active, paused, or completed projects can move to the Commons.",
        );
      const now = Date.now();
      const updated: Project = {
        ...p,
        status: "tended",
        completedAt: p.completedAt ?? now,
        pausedAt: null,
        pauseNote: null,
      };
      await db.projects.put(updated);
      await logActivity(
        projectId,
        "project_graduated",
        organizerKey,
        { contributedHours: p.contributedHours },
        p.nodeId,
      );
      // Graduating IS completing the build — same achievement moment
      // as completeProject (a no-op on the retrofit path, where the
      // completion already granted it).
      await grantOrganizerCompletionAchievements(updated, organizerKey, now);
      return updated;
    },
  );
  await publishProjectState(projectId, organizerKey);
  return result;
}

/**
 * Retire a commons — it ended (the garden lost its lot). The one
 * required sentence is what the community will want to remember;
 * everything stays browsable in the archive (docs/commons.md §7).
 */
export async function retireCommons(
  projectId: string,
  organizerKey: string,
  note: string,
): Promise<Project> {
  const trimmed = note.trim();
  if (!trimmed) throw new Error("A short why-it-ended note is required.");
  const result = await db.transaction(
    "rw",
    [db.projects, db.projectActivity],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      if (p.status !== "tended")
        throw new Error("Only a tended commons can be retired.");
      const updated: Project = {
        ...p,
        status: "retired",
        retiredAt: Date.now(),
        retireNote: trimmed,
      };
      await db.projects.put(updated);
      await logActivity(
        projectId,
        "project_retired",
        organizerKey,
        { note: trimmed },
        p.nodeId,
      );
      return updated;
    },
  );
  await publishProjectState(projectId, organizerKey);
  return result;
}

/** Un-retire — the garden got its lot back. A deliberate steward act
 *  (which is why retired resource links may become anchors again in
 *  Phase 2 — the re-vouching is real). */
export async function unretireCommons(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  const result = await db.transaction(
    "rw",
    [db.projects, db.projectActivity],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      if (p.status !== "retired")
        throw new Error("Only a retired commons can be un-retired.");
      const updated: Project = {
        ...p,
        status: "tended",
        retiredAt: null,
        retireNote: null,
      };
      await db.projects.put(updated);
      await logActivity(projectId, "project_unretired", organizerKey, {}, p.nodeId);
      return updated;
    },
  );
  await publishProjectState(projectId, organizerKey);
  return result;
}

/** The mistake hatch / major-rebuild path: tended → active. */
export async function returnToBuilding(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  const result = await db.transaction(
    "rw",
    [db.projects, db.projectActivity],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      if (p.status !== "tended")
        throw new Error("Only a tended commons can return to building.");
      const updated: Project = { ...p, status: "active" };
      await db.projects.put(updated);
      await logActivity(
        projectId,
        "project_returned_to_building",
        organizerKey,
        {},
        p.nodeId,
      );
      return updated;
    },
  );
  await publishProjectState(projectId, organizerKey);
  return result;
}

export async function archiveProject(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  const result = await db.transaction(
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
  await publishProjectState(projectId, organizerKey);
  return result;
}

export async function unarchiveProject(
  projectId: string,
  organizerKey: string,
): Promise<Project> {
  const result = await db.transaction(
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
  await publishProjectState(projectId, organizerKey);
  return result;
}

async function updateProjectStatus(
  projectId: string,
  organizerKey: string,
  from: Project["status"],
  to: Project["status"],
): Promise<Project> {
  const result = await db.transaction(
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
  await publishProjectState(projectId, organizerKey);
  return result;
}

/**
 * Synchronous authority predicate over the static
 * `Project.coOrganizerKeys` array — which is the LIVE authority
 * list, maintained by every path that grants or removes the role:
 *
 *   - v21 grandfather migration (pre-feature unilateral adds),
 *   - `materializeAcceptedCoOrganizer` in `db/coorgInvitations.ts`
 *     (signed acceptances — the local accept path and both
 *     federation ingest paths),
 *   - `handoffOrganizer` below (old primary demotes into the array),
 *   - `removeCoOrganizer` below (step-down / primary removal).
 *
 * The signed invitation / response / revocation tables are the
 * audit trail for HOW an entry earned its place, not a replacement
 * for this list: handoff demotion and removal have no signed record
 * types, so the rows alone can neither grant the handoff case nor
 * forget the removal case.
 *
 * Every read site reads this array as of PR #NNN — the pull surfaces
 * that PR #235 once pointed at the rows-derived view (attention.ts,
 * Calendar's "Mine" filter, AppContext's block-standing gate) were
 * reconciled onto `isOrganizer`, ending the divergence where a handoff
 * demotee went missing from those surfaces and a stepped-down
 * co-organizer lingered in them. Remote, signed provenance for the
 * row-less transitions (a real step-down / handoff record type) is the
 * remaining future work; see `docs/co-organizer-invitations.md` §5.
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
  const result = await db.transaction("rw", [db.projects, db.projectActivity], async () => {
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
  // A stepping-down co-organizer is still in the STORED version's
  // authority list on the node, so their self-removal signature is
  // accepted; the primary's removals are organizer-signed anyway.
  await publishProjectState(projectId, callerKey);
  return result;
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
  /** Rhythm for recurring work — see ProjectTask.recurringCadence.
   *  Omitted/null = one-shot. */
  recurringCadence?: ProjectTask["recurringCadence"];
}

export async function addProjectTask(
  projectId: string,
  organizerKey: string,
  input: AddTaskInput,
): Promise<ProjectTask> {
  const result = await db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      // `tended` deliberately passes — stewards add one-off care tasks
      // (the gate broke) alongside the recurring rota
      // (docs/commons.md §5.4).
      if (
        p.status === "completed" ||
        p.status === "archived" ||
        p.status === "retired"
      )
        throw new Error("Tasks cannot be added to a completed or retired project.");
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
        actualHours: null,
        exchangeId: null,
        claimedAt: null,
        checkInAcknowledgedAt: null,
        recurringCadence: input.recurringCadence ?? null,
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
  await publishTaskState(result.id, organizerKey);
  return result;
}

export async function claimProjectTask(
  taskId: string,
  memberKey: string,
): Promise<ProjectTask> {
  const result = await db.transaction(
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
      // "tended" claims are the Commons care rota (docs/commons.md §3):
      // a graduated project's recurring maintenance work stays exactly
      // as claimable as build work was.
      if (project.status !== "active" && project.status !== "tended")
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
  // Signed by the claimer — the "claiming an OPEN task" authority
  // case on the node (docs/project-federation.md §4).
  await publishTaskState(taskId, memberKey);
  return result;
}

export async function unclaimProjectTask(
  taskId: string,
  memberKey: string,
): Promise<ProjectTask> {
  const result = await db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity],
    async () => {
      const task = await db.projectTasks.get(taskId);
      if (!task) throw new Error("Task not found.");
      if (task.assignedTo !== memberKey)
        throw new Error("Only the claimer can release the task.");
      // Two release paths share this function:
      //   1. claimed → open: the ordinary "step back from a claim"
      //   2. awaiting_confirmation → open: the completer changes their
      //      mind before an organizer confirms (no Exchange has been
      //      written yet, so there is no credit to reverse — just the
      //      task state). The audit found nothing recorded this case;
      //      we log a distinct activity type so the organizer's pull
      //      surface (HistoryTimeline) gets a neutral trace.
      if (task.status !== "claimed" && task.status !== "awaiting_confirmation")
        throw new Error("Task cannot be released from its current state.");
      const wasAwaitingConfirmation = task.status === "awaiting_confirmation";
      const updated: ProjectTask = {
        ...task,
        status: "open",
        assignedTo: null,
        // Defensive cleanup: clearing the claim metadata too so a
        // re-claim starts fresh and the prompts don't fire on
        // stale timestamps. When releasing from awaiting_confirmation
        // we also clear completedBy AND the walked-back claimer's
        // actualHours, so a future completion by someone else isn't
        // attributed to them and doesn't inherit their stated figure.
        claimedAt: null,
        checkInAcknowledgedAt: null,
        completedBy: wasAwaitingConfirmation ? null : task.completedBy,
        actualHours: wasAwaitingConfirmation ? null : task.actualHours,
        // The walked-back completion's pre-signatures die with it — a
        // future completion signs fresh figures.
        completionSignedAt: wasAwaitingConfirmation
          ? null
          : task.completionSignedAt,
        completionSignatures: wasAwaitingConfirmation
          ? null
          : task.completionSignatures,
      };
      await db.projectTasks.put(updated);
      const project = await db.projects.get(task.projectId);
      await logActivity(
        task.projectId,
        wasAwaitingConfirmation
          ? "task_released_after_complete"
          : "task_unclaimed",
        memberKey,
        // Stash the title so HistoryTimeline can render the neutral
        // "stepped back from {{task}}" sentence without joining
        // against the (possibly later-edited) task row.
        { taskId, taskTitle: task.title },
        project?.nodeId ?? "",
      );
      return updated;
    },
  );
  await publishTaskState(taskId, memberKey);
  return result;
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
  const result = await db.transaction("rw", [db.projectTasks], async () => {
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
  // Republish so a peer's later LWW write can't silently reset the
  // ack clock (the whole row is the record; there are no deltas).
  await publishTaskState(taskId, memberKey);
  return result;
}

export async function markProjectTaskComplete(
  taskId: string,
  memberKey: string,
  actualHours?: number,
): Promise<ProjectTask> {
  // Validate outside the transaction so a bad number never starts one.
  // Omitted (undefined) means "not stated" → null, which credits the
  // estimate. We never coerce a missing value to the estimate here, so
  // "stated the estimate" and "never stated" stay distinguishable.
  let actual: number | null = null;
  if (actualHours !== undefined) {
    if (!Number.isFinite(actualHours) || actualHours <= 0)
      throw new Error("Actual hours must be a positive number.");
    actual = roundHours(actualHours);
  }
  // Completer's secret, resolved BEFORE the transaction (the unwrap
  // touches secretKeys, which must stay off the rw scope). Used to
  // sign the §5 awaiting-transition artifact. Soft-degrade: a locked
  // session marks the task complete exactly as before — the artifact
  // is an enforcement upgrade, not a gate on the member's own action.
  let completerSecret: string | null = null;
  try {
    completerSecret = await getSecretKey(memberKey);
  } catch {
    completerSecret = null;
  }
  const result = await db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity, db.outbox, db.settings],
    async () => {
      const task = await db.projectTasks.get(taskId);
      if (!task) throw new Error("Task not found.");
      if (task.status !== "claimed")
        throw new Error("Task must be claimed before completion.");
      if (task.assignedTo !== memberKey)
        throw new Error("Only the claimer can mark the task complete.");
      const project = await db.projects.get(task.projectId);
      const now = Date.now();

      // Pre-sign the eventual Exchange payload, one signature per
      // organizer who might confirm — THE moment the completer's key
      // is guaranteed present is right here, on their own device.
      // Without this, `confirmProjectTaskCompletion` had to read the
      // completer's secret on the ORGANIZER's device, which only ever
      // exists in dev profiles: on real one-identity devices the
      // confirm button could never work (the auto-confirm sweep was
      // silently the only production path). Every signed field is
      // known now — the completer just stated their actual hours —
      // and the map is keyed by helpedKey because the payload names
      // the organizer the credit moves FROM, so each potential
      // confirmer needs their own completer-signed bytes.
      // Soft-degrade like the artifact below: a locked session still
      // completes the task; the sweep path remains.
      let completionSignedAt: number | null = null;
      let completionSignatures: Record<string, string> | null = null;
      if (completerSecret && project) {
        const signedHours = creditHoursForTask({
          actualHours: actual,
          estimatedHours: task.estimatedHours,
        });
        completionSignedAt = now;
        completionSignatures = {};
        for (const orgKey of [
          project.organizerKey,
          ...project.coOrganizerKeys,
        ]) {
          completionSignatures[orgKey] = sign(
            canonicalExchangePayload({
              postId: `project:${task.projectId}/task:${taskId}`,
              helperKey: memberKey,
              helpedKey: orgKey,
              hours: signedHours,
              // Fold a stale task category into today's set BEFORE
              // signing (rows outlive renames; TaskState federates
              // verbatim from older builds), so the exchange this
              // signature becomes is renderable everywhere and the
              // community node accepts it instead of poisoning the
              // outbox. The confirm side normalizes identically.
              category: normalizeExchangeCategory(task.category),
              completedAt: now,
            }),
            completerSecret,
          );
        }
      }

      const updated: ProjectTask = {
        ...task,
        status: "awaiting_confirmation",
        completedBy: memberKey,
        actualHours: actual,
        completionSignedAt,
        completionSignatures,
      };
      await db.projectTasks.put(updated);
      // Record both numbers so the activity feed can show "took Xh ·
      // estimated Yh" — transparency, the anti-gaming control here
      // (the claimer signs the figure, the organizer countersigns it).
      await logActivity(
        task.projectId,
        "task_completed",
        memberKey,
        { taskId, estimatedHours: task.estimatedHours, actualHours: actual },
        project?.nodeId ?? "",
      );

      // Signed awaiting-transition artifact (auto-confirm-key.md §5).
      // This is what finally makes the auto-confirm window enforceable
      // for the PROJECT-TASK path — the one /auto-confirm can't bind
      // to a signed post (tasks are LWW state records, not signed
      // posts — docs/project-federation.md §3): the node stamps
      // received_at at ingestion and measures the window from its own
      // clock. Signed by the completer (the helper side of the
      // eventual exchange); helped side is the project's primary
      // organizer, matching the sweep's request construction.
      if (completerSecret && project) {
        const transitionPayload = {
          kind: "awaiting_transition" as const,
          postId: `project:${task.projectId}/task:${taskId}`,
          helperKey: memberKey,
          helpedKey: project.organizerKey,
          signedBy: memberKey,
          enteredAt: now,
          nodeId: project.nodeId ?? "",
        };
        await enqueueAwaitingTransition({
          ...transitionPayload,
          signature: sign(
            canonicalAwaitingTransitionPayload(transitionPayload),
            completerSecret,
          ),
        });
      }
      return updated;
    },
  );
  await publishTaskState(taskId, memberKey);
  return result;
}

/**
 * Organizer-side "not done yet — send it back" (the counterpart of
 * the completer's own walk-back in `unclaimProjectTask`). Before this
 * existed an organizer who thought the work wasn't finished had no
 * honest move at all: silence became a yes (the auto-confirm sweep
 * fires after the window), and the only explicit options were
 * confirming unfinished work or misusing the dispute flag.
 *
 * Deliberately NOT a decline/reject: nothing is recorded against
 * anyone. The task returns to `claimed` — the claimer KEEPS it — the
 * completion metadata clears (a fresh completion re-signs fresh
 * figures, and the sweep only considers `awaiting_confirmation`
 * tasks, so the auto-confirm clock stops while work continues), and
 * the organizer's note ships as an ordinary TASK COMMENT. The comment
 * is the altitude decision: comments already federate and render on
 * the task page, so the words reach the claimer on every device with
 * zero new record types, and no "rejection" field ever exists.
 *
 * The note is REQUIRED — sending work back wordlessly is where
 * resentment grows, and the note is the whole point. It posts FIRST
 * (it can throw on a locked session) so a reverted task can never
 * exist without its explanation; if the revert then fails, a stray
 * comment is harmless and the organizer simply retries.
 */
export async function sendBackProjectTaskCompletion(
  taskId: string,
  organizerKey: string,
  note: string,
  nodeId: string,
): Promise<ProjectTask> {
  const trimmed = note.trim();
  if (trimmed.length === 0)
    throw new Error(
      "A note is required — tell them what still needs doing.",
    );
  const preflight = await db.projectTasks.get(taskId);
  if (!preflight) throw new Error("Task not found.");
  const project = await db.projects.get(preflight.projectId);
  if (!project) throw new Error("Parent project not found.");
  if (!isOrganizer(project, organizerKey))
    throw new Error("Only project organizers can send a completion back.");
  if (preflight.status !== "awaiting_confirmation")
    throw new Error("Task isn't waiting for confirmation.");
  // Parity with confirmProjectTaskCompletion's self-confirm guard: an
  // organizer who completed the task themselves walks it back through
  // their own release path, not this one.
  if (preflight.completedBy === organizerKey)
    throw new Error(
      "You marked this complete yourself — release it instead of sending it back.",
    );

  await postTaskComment(taskId, trimmed, organizerKey, nodeId);

  const result = await db.transaction(
    "rw",
    [db.projectTasks, db.projects, db.projectActivity],
    async () => {
      const task = await db.projectTasks.get(taskId);
      if (!task || task.status !== "awaiting_confirmation")
        throw new Error("Task isn't waiting for confirmation.");
      const updated: ProjectTask = {
        ...task,
        status: "claimed",
        // The claimer keeps the task — send-back must never read as
        // taking it away. Only the completion attempt clears.
        completedBy: null,
        actualHours: null,
        completionSignedAt: null,
        completionSignatures: null,
      };
      await db.projectTasks.put(updated);
      // Neutral trace, mirroring the completer's own walk-back entry —
      // transparency without a permanent mark.
      await logActivity(
        task.projectId,
        "task_sent_back",
        organizerKey,
        { taskId, taskTitle: task.title },
        project.nodeId ?? "",
      );
      return updated;
    },
  );
  // Organizer-signed LWW state record so every device converges on
  // the revert (docs/project-federation.md §4 — organizers hold task
  // edit authority).
  await publishTaskState(taskId, organizerKey);
  return result;
}

export interface ConfirmTaskResult {
  task: ProjectTask;
  project: Project;
  exchange: Exchange;
  /** Auto-milestones (25/50/75/100%) that fired in this confirmation. */
  milestonesReached: number[];
  /** The fresh open copy minted when a recurring task is confirmed —
   *  present so the caller can publish its state record too. */
  respawnedTask?: ProjectTask;
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
  // Only the ORGANIZER's own secret is required here. The completer's
  // signature comes from `completionSignatures` (pre-signed on THEIR
  // device at mark-complete, keyed by confirming organizer, riding the
  // TaskState record) — the fix for the one-identity-per-device bug
  // where this function tried to read the completer's secret locally
  // and organizer confirmation could never work outside dev profiles.
  const helpedSecret = await getSecretKey(helpedKey);

  const now = Date.now();
  // The signed figure is the claimer-stated actual hours (estimate
  // fallback) — `creditHoursForTask`. The wire shape is unchanged;
  // only the value differs from the old `estimatedHours`.
  const creditHours = creditHoursForTask(task);

  // The signed exchange folds a stale task category into today's set
  // (normalizeExchangeCategory) — the same fold mark-complete applies
  // before pre-signing — so the record renders everywhere and the
  // community node accepts it. Rows outlive category renames, and
  // TaskState federates verbatim from older builds; one confirmed task
  // carrying an id today's maps don't know crashed the entire
  // Dashboard (the second category crash on that screen).
  let exchangeCategory = normalizeExchangeCategory(task.category);

  const preSignature = task.completionSignatures?.[organizerKey];
  let helperSignature: string;
  let completedAt: number;
  if (preSignature && task.completionSignedAt) {
    // The Exchange's completedAt is the moment the completer signed —
    // when the help actually finished — not the organizer's later
    // confirmation tap. Re-verify over the CURRENT task figures: if
    // hours were edited after completion, the bytes no longer match
    // and we refuse rather than credit a number the completer never
    // signed.
    completedAt = task.completionSignedAt;
    const payloadFor = (category: Exchange["category"]) =>
      canonicalExchangePayload({
        postId: `project:${project.id}/task:${task.id}`,
        helperKey,
        helpedKey,
        hours: creditHours,
        category,
        completedAt,
      });
    let verified = verify(
      payloadFor(exchangeCategory),
      preSignature,
      helperKey,
    );
    if (!verified && task.category !== exchangeCategory) {
      // A pre-sign from the build window that signed the task's RAW
      // (stale) category. Honor the signed bytes — the exchange must
      // carry exactly what the completer signed for verifyExchange to
      // hold; the read surfaces fold it for display, and the node may
      // refuse it (the outbox row surfaces as poisoned, honestly)
      // rather than us fabricating a signature over words the
      // completer never saw.
      const rawCategory = task.category as Exchange["category"];
      if (verify(payloadFor(rawCategory), preSignature, helperKey)) {
        exchangeCategory = rawCategory;
        verified = true;
      }
    }
    if (!verified) {
      throw new Error(
        "The completer's signature no longer matches this task — the hours or category changed after they marked it complete. Ask them to mark it complete again.",
      );
    }
    helperSignature = preSignature;
  } else {
    // Legacy path: tasks completed before pre-signing existed (or by
    // an older client). Signing the helper side needs the completer's
    // secret on THIS device — true in dev profiles and same-device
    // setups, impossible on a real one-identity device.
    completedAt = now;
    let helperSecret: string;
    try {
      helperSecret = await getSecretKey(helperKey);
    } catch {
      throw new Error(
        "This task was completed before signatures traveled with it, so your device can't confirm it directly. It will confirm on its own after the community's waiting window — or the completer can walk it back and mark it complete again.",
      );
    }
    helperSignature = sign(
      canonicalExchangePayload({
        postId: `project:${project.id}/task:${task.id}`,
        helperKey,
        helpedKey,
        hours: creditHours,
        category: exchangeCategory,
        completedAt,
      }),
      helperSecret,
    );
  }

  const payload = canonicalExchangePayload({
    postId: `project:${project.id}/task:${task.id}`,
    helperKey,
    helpedKey,
    hours: creditHours,
    category: exchangeCategory,
    completedAt,
  });
  const exchange: Exchange = {
    id: uuid(),
    postId: `project:${project.id}/task:${task.id}`,
    helperKey,
    helpedKey,
    hoursExchanged: creditHours,
    helperSignature,
    helpedSignature: sign(payload, helpedSecret),
    completedAt,
    category: exchangeCategory,
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

  // Publish the confirmed task, the project (contributedHours moved),
  // and any recurring respawn — all organizer-signed.
  await publishTaskState(taskId, organizerKey);
  await publishProjectState(project.id, organizerKey);
  if (result.respawnedTask) {
    await publishTaskState(result.respawnedTask.id, organizerKey);
  }

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
  if (exchange.hoursExchanged !== creditHoursForTask(task)) {
    throw new Error(
      "system auto-confirm: exchange hoursExchanged does not match the task's credit hours",
    );
  }
  if (!exchange.autoConfirmed || !exchange.autoConfirmedBy) {
    throw new Error(
      "system auto-confirm: exchange is missing autoConfirmed / autoConfirmedBy",
    );
  }
  const result = await _writeTaskConfirmation({
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
  // Publish signed by the completer — in the §1 motivating case the
  // organizer IS the completer, so the signer passes the node's
  // organizer authority check for both records. (The system identity
  // has no member secret on this device; it can't sign state records.)
  await publishTaskState(taskId, exchange.helperKey);
  await publishProjectState(project.id, exchange.helperKey);
  if (result.respawnedTask) {
    await publishTaskState(result.respawnedTask.id, exchange.helperKey);
  }
  return result;
}

/**
 * Private — the shared write path used by both
 * `confirmProjectTaskCompletion` (member-signed) and
 * `_systemAutoConfirmTask` (system-signed). Caller has already done
 * eligibility / signing on a pre-transaction snapshot; this function
 * RE-VALIDATES that snapshot against fresh rows inside its write
 * transaction (status still awaiting_confirmation, completer and
 * hours unchanged) so concurrent confirmations can't both land, then
 * persists, increments project hours, fires milestones, and
 * recomputes achievements.
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
  // nodeConfig lives in `db.nodeConfig`, which is NOT in the
  // transaction scope below — read it BEFORE opening the transaction
  // (awaiting an out-of-scope read inside a Dexie transaction commits
  // it early and would break the double-credit re-read guard).
  const nodeConfig = await getNodeConfig(exchange.nodeId);
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
      // Re-read BOTH rows inside the transaction and re-validate.
      // The public entry points checked eligibility on a
      // pre-transaction snapshot (the signing keys must load outside
      // the txn scope), so a concurrent confirmation — a
      // double-clicked button, a second tab, or the auto-confirm
      // sweep racing a manual confirm — could pass the outside check
      // twice and write two distinct Exchange rows for one task:
      // double credit. The re-check makes the loser abort here, and
      // Dexie rolls its transaction back with nothing written.
      const freshTask = await db.projectTasks.get(task.id);
      if (!freshTask) throw new Error("Task not found.");
      if (freshTask.status !== "awaiting_confirmation") {
        throw new Error("Task was already confirmed.");
      }
      if (freshTask.completedBy !== exchange.helperKey) {
        throw new Error(
          "Task's completer changed while confirming — please retry.",
        );
      }
      // The exchange was signed over creditHoursForTask(task). If the
      // claimer restated their hours between snapshot and write, the
      // signed figure no longer matches the task we'd be closing —
      // abort rather than record a mismatched amount.
      if (creditHoursForTask(freshTask) !== exchange.hoursExchanged) {
        throw new Error(
          "Task's hours changed while confirming — please retry.",
        );
      }
      const freshProject = await db.projects.get(project.id);
      if (!freshProject) throw new Error("Parent project not found.");

      // Anti-gaming safeguards apply to project-task exchanges too
      // (Round-4 review): the completer's task credit was escaping the
      // short-duration / reciprocal / daily-limit checks that the
      // board exchange path enforces. We FLAG rather than throw here —
      // the exchange is already signed (member- or system-side), and a
      // hard stop would block a legitimate organizer confirmation just
      // because the completer hit a limit elsewhere. Flag fields sit
      // outside the canonical payload, so the signature is untouched.
      const priorExchanges = await db.exchanges.toArray();
      const safeguard = evaluateSafeguards(
        {
          helperKey: exchange.helperKey,
          helpedKey: exchange.helpedKey,
          hoursExchanged: exchange.hoursExchanged,
          completedAt: exchange.completedAt,
        },
        priorExchanges,
        nodeConfig,
      );
      const overLimit = exceedsDailyLimit(
        exchange.helperKey,
        priorExchanges,
        now,
        nodeConfig,
      );
      const flagged =
        exchange.flaggedForReview || safeguard.flaggedForReview || overLimit;
      const exchangeToStore: Exchange = flagged
        ? {
            ...exchange,
            flaggedForReview: true,
            flagReason:
              exchange.flagReason ??
              safeguard.flagReason ??
              (overLimit ? "daily_limit_warning" : undefined),
          }
        : exchange;

      await db.exchanges.put(exchangeToStore);
      await enqueueExchangeOutbox(exchangeToStore);

      const updatedTask: ProjectTask = {
        ...freshTask,
        status: "completed",
        completedAt: now,
        exchangeId: exchange.id,
      };
      await db.projectTasks.put(updatedTask);

      // Recurring tasks: confirming a cadenced task re-opens the rota
      // slot — a FRESH open task with the same shape, minted inside
      // this same transaction so a crash can't credit the round
      // without re-opening it. Deliberate bounds:
      //   - Only while the project is ACTIVE. A paused/completed
      //     project's rota stops with it; resuming does not backfill
      //     missed rounds.
      //   - Skipped when an open task with the same title + cadence
      //     already exists in the project (an organizer may have
      //     hand-added next round early; and it caps any conceivable
      //     re-entry at one open copy — no runaway spawning).
      //   - The copy resets every per-round field (claim, completion,
      //     actual hours, exchange, check-in) and lands at the bottom
      //     of the list. `dependencies` carry over: the edges point at
      //     tasks that are by now complete, so they render as
      //     satisfied context, not blocks.
      // This runs on BOTH confirm paths (member confirm and the
      // system-key auto-confirm sweep) because both funnel through
      // this writer.
      let respawnedTask: ProjectTask | undefined;
      // "tended" is the single most load-bearing addition of the
      // Commons (docs/commons.md §3): a graduated project's care rota
      // keeps regenerating — that is what makes it a tended thing
      // rather than a finished one.
      if (
        freshTask.recurringCadence &&
        (freshProject.status === "active" || freshProject.status === "tended")
      ) {
        const openTwin = await db.projectTasks
          .where("[projectId+status]")
          .equals([freshProject.id, "open"])
          .filter(
            (t) =>
              t.title === freshTask.title &&
              t.recurringCadence === freshTask.recurringCadence,
          )
          .count();
        if (openTwin === 0) {
          const respawned: ProjectTask = {
            ...freshTask,
            id: uuid(),
            status: "open",
            assignedTo: null,
            orderIndex: await nextOrderIndexForProject(freshProject.id),
            createdAt: now,
            completedAt: null,
            completedBy: null,
            actualHours: null,
            exchangeId: null,
            claimedAt: null,
            checkInAcknowledgedAt: null,
          };
          await db.projectTasks.put(respawned);
          respawnedTask = respawned;
          await logActivity(
            freshProject.id,
            "task_added",
            organizerKey,
            {
              taskId: respawned.id,
              hours: respawned.estimatedHours,
              recurring: true,
              respawnedFromTaskId: freshTask.id,
            },
            freshProject.nodeId,
          );
        }
      }

      // Project progress is the sum of its signed exchanges, so it
      // counts the recorded (actual) hours — `creditHoursForTask`,
      // which equals `exchange.hoursExchanged`. Milestones fire against
      // that truth; `targetHours` stays an estimate. Summed from the
      // FRESH project row: two tasks of the same project confirmed
      // concurrently must both land in the total (a stale snapshot
      // here made the second write clobber the first).
      const creditHours = creditHoursForTask(freshTask);
      const newContributed = roundHours(
        freshProject.contributedHours + creditHours,
      );
      const milestones = milestonesCrossed(
        freshProject.contributedHours,
        newContributed,
        freshProject.targetHours,
      );
      const updatedProject: Project = {
        ...freshProject,
        contributedHours: newContributed,
      };
      await db.projects.put(updatedProject);

      const confirmActivityData: Record<string, unknown> = {
        taskId: freshTask.id,
        exchangeId: exchange.id,
        helperKey: exchange.helperKey,
        hours: creditHours,
        estimatedHours: freshTask.estimatedHours,
        actualHours: freshTask.actualHours,
      };
      if (exchange.autoConfirmed) {
        confirmActivityData.autoConfirmed = true;
      }
      if (acknowledgment?.trim()) {
        confirmActivityData.acknowledgment = acknowledgment.trim();
      }
      await logActivity(
        freshProject.id,
        "task_confirmed",
        organizerKey,
        confirmActivityData,
        freshProject.nodeId,
      );
      for (const m of milestones) {
        await logActivity(
          freshProject.id,
          "milestone_reached",
          organizerKey,
          { milestone: m },
          freshProject.nodeId,
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
        exchange: exchangeToStore,
        milestonesReached: milestones,
        respawnedTask,
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
  const result = await db.transaction("rw", [db.projects, db.projectActivity], async () => {
    const p = await db.projects.get(projectId);
    if (!p) throw new Error("Project not found.");
    if (p.organizerKey !== callerKey)
      throw new Error("Only the primary organizer can hand off.");
    if (!p.coOrganizerKeys.includes(newPrimaryKey))
      throw new Error("New primary must be a current co-organizer.");
    if (
      p.status === "completed" ||
      p.status === "archived" ||
      p.status === "retired"
    )
      throw new Error("Cannot hand off a completed, retired, or archived project.");
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
  // The handoff MUST be signed by the outgoing organizer — the node
  // accepts an organizerKey change only from the stored organizer
  // (docs/project-federation.md §4).
  await publishProjectState(projectId, callerKey);
  return result;
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
    if (p.status === "archived" || p.status === "retired")
      throw new Error("Cannot post to an archived or retired project.");
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
  const result = await db.transaction(
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
  await publishTaskState(taskId, organizerKey);
  return result;
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

  const result = await db.transaction(
    "rw",
    [db.projects, db.projectTasks, db.projectActivity],
    async () => {
      const p = await requireOrganizer(projectId, organizerKey);
      if (
        p.status === "completed" ||
        p.status === "archived" ||
        p.status === "retired"
      )
        throw new Error("Tasks cannot be added to a completed or retired project.");
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
          actualHours: null,
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
  for (const t of result) {
    await publishTaskState(t.id, organizerKey);
  }
  return result;
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
  const result = await db.transaction(
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
  await publishTaskState(taskId, organizerKey);
  return result;
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
  // Publish only the MOVED task. A precision renumber rewrites every
  // sibling's orderIndex locally without republishing them — ordering
  // is cosmetic, renumbering is rare, and each sibling republishes on
  // its next real mutation.
  await publishTaskState(taskId, organizerKey);
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
          actualHours: null,
          exchangeId: null,
          claimedAt: null,
          checkInAcknowledgedAt: null,
        };
        await db.projectTasks.put(task);
      }
    },
  );
  await publishProjectState(project.id, organizerKey);
  for (const t of await listTasksForProject(project.id)) {
    await publishTaskState(t.id, organizerKey);
  }
  return project;
}
