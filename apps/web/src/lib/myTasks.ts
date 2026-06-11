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
import type { Project, ProjectTask } from "@/types";

// Cross-project view of the member's own active task commitments —
// the "what am I carrying right now?" question that previously
// required opening every project page one at a time.
//
// Scope decisions, each load-bearing:
//
// - SELF-ONLY. The caller passes the viewing member's own key, and no
//   UI surface offers a "claimed tasks for member X" variant. Activity
//   patterns are surveillance data (`no-activity-search`); this view
//   is a pure read over local rows the member already holds and never
//   crosses the wire.
//
// - Active commitments only: `claimed` and `awaiting_confirmation`.
//   `assignedTo` survives confirmation (`_writeTaskConfirmation` keeps
//   the claimer's key on the completed row for the history surfaces),
//   so filtering on `assignedTo` alone would resurface finished work —
//   that already lives in Profile's exchange history.
//   `awaiting_confirmation` stays in: until an organizer (or the
//   auto-confirm sweep) signs, the member can still step back, so the
//   task is still theirs to track.
//
// - Pull-only. Nothing here feeds a badge, count bubble, or
//   notification (`no-notifications`); the view renders when the
//   member chooses to open it.

export interface MyTaskGroup {
  project: Project;
  /** The member's active commitments in this project, most recent
   *  claim first — the newest-first convention `transactionHistory`
   *  and `pendingBalanceFor` already use. */
  tasks: ProjectTask[];
}

export interface MyClaimedTasksView {
  /** Ordered by each project's most recent claim, so the project the
   *  member engaged with last surfaces first. */
  groups: MyTaskGroup[];
  taskCount: number;
  /** Distinct projects across `groups`. */
  projectCount: number;
}

/** `claimedAt` is stamped by `claimProjectTask` and survives the
 *  claimed → awaiting_confirmation transition; only release clears it.
 *  The `createdAt` fallback covers legacy rows that escaped the v11
 *  backfill — same defensive posture as `taskCheckInState`. */
function claimAnchor(task: ProjectTask): number {
  return task.claimedAt ?? task.createdAt;
}

export function myClaimedTasks(
  memberKey: string,
  tasks: readonly ProjectTask[],
  projects: readonly Project[],
): MyClaimedTasksView {
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const tasksByProject = new Map<string, ProjectTask[]>();
  let taskCount = 0;
  for (const task of tasks) {
    if (task.assignedTo !== memberKey) continue;
    if (task.status !== "claimed" && task.status !== "awaiting_confirmation")
      continue;
    // No project row — federation could conceivably deliver a task
    // ahead of its project. Drop quietly rather than render a group
    // we can't title; same shape as computeAttentionItems'
    // missing-project branches.
    if (!projectById.has(task.projectId)) continue;
    const list = tasksByProject.get(task.projectId) ?? [];
    list.push(task);
    tasksByProject.set(task.projectId, list);
    taskCount += 1;
  }

  const groups: MyTaskGroup[] = [];
  for (const [projectId, list] of tasksByProject) {
    const project = projectById.get(projectId);
    if (!project) continue;
    list.sort((a, b) => claimAnchor(b) - claimAnchor(a));
    groups.push({ project, tasks: list });
  }
  groups.sort((a, b) => claimAnchor(b.tasks[0]) - claimAnchor(a.tasks[0]));

  return { groups, taskCount, projectCount: groups.length };
}
