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
import type { ProjectTask } from "@/types";

// The user-facing buckets surfaced as pills on the project detail
// page. We collapse the five-state task lifecycle
// (open / claimed / awaiting_confirmation / completed / blocked)
// into three actionable stages plus an "all" escape hatch — and an
// optional "mine" claimer-personal cut that's only rendered when the
// current member actually has a claimed task in this project:
//
//   - "open"        → open (claimable)
//   - "in_progress" → claimed OR awaiting_confirmation
//                     (somebody's working on it, just not done yet)
//   - "done"        → completed
//   - "mine"        → tasks the current member is the claimer on
//                     (any status — what they're carrying right now,
//                     including what they've already moved to
//                     awaiting_confirmation)
//   - "all"         → no filter
//
// "blocked" is intentionally not surfaced as its own pill — it's
// a rare state and members can still find blocked tasks via "All"
// or via the search input.
export type TaskFilter = "all" | "open" | "in_progress" | "done" | "mine";

export function matchesFilter(
  task: ProjectTask,
  filter: TaskFilter,
  currentKey?: string,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "open":
      return task.status === "open";
    case "in_progress":
      return (
        task.status === "claimed" || task.status === "awaiting_confirmation"
      );
    case "done":
      return task.status === "completed";
    case "mine":
      // No current member (signed-out viewer, or AppContext still
      // resolving) → "mine" matches nothing. The pill is only
      // rendered when the member has at least one of their own, so
      // this guard is defensive.
      if (!currentKey) return false;
      return task.assignedTo === currentKey;
  }
}
