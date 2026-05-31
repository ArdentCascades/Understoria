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

// The four user-facing buckets surfaced as pills on the project
// detail page. We collapse the five-state task lifecycle
// (open / claimed / awaiting_confirmation / completed / blocked)
// into three actionable stages plus an "all" escape hatch:
//
//   - "open"        → open (claimable)
//   - "in_progress" → claimed OR awaiting_confirmation
//                     (somebody's working on it, just not done yet)
//   - "done"        → completed
//   - "all"         → no filter
//
// "blocked" is intentionally not surfaced as its own pill — it's
// a rare state and members can still find blocked tasks via "All"
// or via the search input.
export type TaskFilter = "all" | "open" | "in_progress" | "done";

export function matchesFilter(
  task: ProjectTask,
  filter: TaskFilter,
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
  }
}
