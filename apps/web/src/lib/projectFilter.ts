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
import type { NodeConfig, ProjectTask } from "@/types";
import { taskCheckInState } from "./taskCheckInState";

/**
 * True iff at least one task on this project has `status === "open"`.
 *
 * Extracted from Board.tsx so the "Only with open tasks" filter can
 * be unit-tested in isolation, and so the call site in
 * `visibleProjects` reads at the same altitude as the other filter
 * predicates (category / status / search).
 */
export function hasOpenTasks(
  projectId: string,
  tasks: readonly ProjectTask[],
): boolean {
  return tasks.some(
    (t) => t.projectId === projectId && t.status === "open",
  );
}

/**
 * True iff at least one task on this project is in the
 * `needs_more_hands` state — the same computation that drives the
 * "Could use more hands" chip on the task row
 * (`lib/taskCheckInState.ts`). Lets the Board surface *which projects*
 * have tasks that could use additional support, framed at the
 * task/project, never at a person (solidarity-not-shame): the state
 * machine already protects responsive claimers (grace windows, ack
 * resets) and dependency-blocked tasks, and the claimer's name is
 * already dropped from such rows.
 *
 * `tasks` may be the whole task list or a project-scoped slice; the
 * internal filter scopes to `projectId` either way, and passing the
 * scoped list as `allTasks` is correct because task dependencies are
 * in-project by construction (see
 * `docs/task-ordering-and-dependencies.md`).
 */
export function projectNeedsMoreHands(
  projectId: string,
  tasks: readonly ProjectTask[],
  config: Pick<
    NodeConfig,
    "taskCheckInDays" | "taskNeedsHelpDays" | "taskCheckInGraceDays"
  >,
  now: number = Date.now(),
): boolean {
  const scoped = tasks.filter((t) => t.projectId === projectId);
  return scoped.some(
    (t) => taskCheckInState(t, config, scoped, now) === "needs_more_hands",
  );
}
