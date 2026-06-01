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

// Pure helper for the Start-a-project flow: given the local list of
// projects and the template the member is eyeing, surface the ones the
// community is already actively working on under that same template.
//
// This is solidarity routing, not duplicate prevention — the upcoming UI
// will render "N active projects in your community already use this
// template" with a "see this project" link to the most recent match so a
// member can join an existing effort instead of spinning up a parallel
// one. "Active" here means a project the community could still pour
// hours into: planning (organizers gathering tasks) or active (work in
// flight). Paused / completed / archived projects are deliberately
// excluded — joining a paused project doesn't help the member, and
// completed / archived ones aren't ongoing efforts at all.

import type { Project } from "@/types";

/**
 * Subset of `projects` that share the given `templateId` and are still
 * a live community effort (`status` is `"planning"` or `"active"`),
 * sorted newest-first by `createdAt` so the UI's "see this project"
 * link lands on the most recent match.
 *
 * Returns `[]` when `templateId` is `null` (the member hasn't picked a
 * template yet — there is nothing to route them toward). Projects whose
 * own `templateId` is `null` are skipped even when the parameter is
 * also `null`, because `null === null` would otherwise pull in every
 * scratch-built / pre-template project as a false match.
 *
 * Does not mutate the input.
 */
export function getActiveProjectsForTemplate(
  projects: readonly Project[],
  templateId: string | null,
): Project[] {
  if (templateId === null) return [];
  return projects
    .filter(
      (p) =>
        p.templateId !== null &&
        p.templateId === templateId &&
        (p.status === "planning" || p.status === "active"),
    )
    .sort((a, b) => b.createdAt - a.createdAt);
}
