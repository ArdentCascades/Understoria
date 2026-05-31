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
