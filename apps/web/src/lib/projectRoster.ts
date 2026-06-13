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
import type { NodeConfig, ProjectTask } from "@/types";
import { taskCheckInState } from "./taskCheckInState";

// "Working alongside" — the set of members with hands on a project's
// tasks, for a names-only roster on the project page. This is a
// per-project membership fact, NOT an activity ranking: no hours, no
// per-member counts, no ordering by contribution (no-leaderboards /
// no-activity-search). The caller resolves names and sorts them
// alphabetically.
//
// Inclusion mirrors exactly what the task rows already show on the
// page, so the roster reveals nothing new (privacy-precondition):
//   - completers of awaiting_confirmation / completed tasks
//     (the "Completed by {name}" line), and
//   - claimers of claimed / awaiting_confirmation tasks
//     (the "Claimed by {name}" line).
//
// LOAD-BEARING SUPPRESSION (solidarity-not-shame): when a claimed task
// crosses into `needs_more_hands`, its public row deliberately DROPS
// the claimer's name — the task becomes "community work again" (see the
// claimer-name branch in ProjectDetail's TaskRow, and
// docs/threat-model.md §7 "Public task check-in chip reveals claim
// duration"). The roster must apply the same suppression, or it would
// re-reveal a name the page just protected. The suppression is
// per-task: a member suppressed on a needs_more_hands task still
// appears if they have non-suppressed hands on ANY other task here.
//
// `needs_more_hands` only ever applies to `claimed` tasks
// (`taskCheckInState` returns "fresh" for every other status, and for
// dependency-blocked tasks), so the completion path is never
// suppressed and a dep-blocked stale claim stays listed — matching the
// row, which still names its claimer.

export function workingAlongsideKeys(
  tasks: readonly ProjectTask[],
  config: Pick<
    NodeConfig,
    "taskCheckInDays" | "taskNeedsHelpDays" | "taskCheckInGraceDays"
  >,
  blockedKeys: ReadonlySet<string>,
  now: number = Date.now(),
): Set<string> {
  const keys = new Set<string>();
  for (const task of tasks) {
    // Completion path — never suppressed.
    if (
      (task.status === "awaiting_confirmation" ||
        task.status === "completed") &&
      task.completedBy &&
      !blockedKeys.has(task.completedBy)
    ) {
      keys.add(task.completedBy);
    }
    // Claim path — suppressed when the row hides the claimer's name.
    if (
      (task.status === "claimed" ||
        task.status === "awaiting_confirmation") &&
      task.assignedTo &&
      !blockedKeys.has(task.assignedTo)
    ) {
      const suppressed =
        task.status === "claimed" &&
        taskCheckInState(task, config, tasks, now) === "needs_more_hands";
      if (!suppressed) keys.add(task.assignedTo);
    }
  }
  return keys;
}
