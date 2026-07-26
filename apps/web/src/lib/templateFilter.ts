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

// Pure helpers powering the template gallery's filter row on the
// Start-a-project page. Kept off the React tree so the bucket math and
// AND-composition logic are unit-testable without rendering anything.
//
// Filter shape mirrors the Board's Projects-tab filters: each filter is
// "empty string means no filter," and `matchesTemplate` composes them
// with AND so a template must satisfy every active filter to render.

import type { ProjectTemplate } from "@/content/projectTemplates";
import { matchesQuery } from "@/lib/messageSearch";
import type { Project, ProjectCategory } from "@/types";

/** Three buckets keyed to the templates' rough up-front setup cost in
 *  hours. Boundaries: quick ≤ 10, medium 11–25, bigger 26+. The breaks
 *  are inclusive on the low end of the next bucket — a template with
 *  exactly 10h of setup is "quick", one with exactly 25h is "medium". */
export type SetupBucket = "quick" | "medium" | "bigger";

export function getSetupBucket(hours: number): SetupBucket {
  if (hours <= 10) return "quick";
  if (hours <= 25) return "medium";
  return "bigger";
}

export interface TemplateFilters {
  /** Already-trimmed search string. Empty string means no search filter. */
  query: string;
  /** Empty string means no category filter. */
  category: ProjectCategory | "";
  /** Empty string means no setup-time filter. */
  setupBucket: SetupBucket | "";
}

/** AND-composes the three filter dimensions: a template must clear every
 *  active filter (non-empty string) to be shown. An empty `query` skips
 *  the search check — `matchesQuery` would otherwise return false on
 *  empty input and hide every template. */
export function matchesTemplate(
  tpl: ProjectTemplate,
  filters: TemplateFilters,
): boolean {
  if (filters.category && tpl.defaultCategory !== filters.category) {
    return false;
  }
  if (
    filters.setupBucket &&
    getSetupBucket(tpl.setupHours) !== filters.setupBucket
  ) {
    return false;
  }
  if (filters.query !== "") {
    const haystack = `${tpl.name} ${tpl.purpose} ${tpl.whoItServes} ${tpl.whatYoullNeed}`;
    if (!matchesQuery(haystack, filters.query)) return false;
  }
  return true;
}

/** Splits the gallery into the picker's two tabs: `fresh` templates (no
 *  live community project uses them) and `inUse` templates (at least one
 *  does, per a non-empty entry in `activeProjectsByTemplate` — see
 *  `getActiveProjectsForTemplate` in templateUsage.ts). A missing map
 *  entry or an empty array both mean "fresh"; an `undefined` map means
 *  the caller has no project data at all, so every template lands in
 *  `fresh` and the picker renders tabless. `fresh` keeps the curated
 *  gallery order; `inUse` is sorted by its newest matching project's
 *  `createdAt` descending (each map array is already newest-first, so
 *  index 0 is the sort key), keeping input order on ties. Does not
 *  mutate its inputs. */
export function partitionTemplates(
  templates: readonly ProjectTemplate[],
  activeProjectsByTemplate: Map<string, Project[]> | undefined,
): { fresh: ProjectTemplate[]; inUse: ProjectTemplate[] } {
  const fresh: ProjectTemplate[] = [];
  const used: { tpl: ProjectTemplate; newestCreatedAt: number }[] = [];
  for (const tpl of templates) {
    const live = activeProjectsByTemplate?.get(tpl.id);
    if (live !== undefined && live.length > 0) {
      used.push({ tpl, newestCreatedAt: live[0].createdAt });
    } else {
      fresh.push(tpl);
    }
  }
  // Array.prototype.sort is stable, so ties keep the gallery order.
  used.sort((a, b) => b.newestCreatedAt - a.newestCreatedAt);
  return { fresh, inUse: used.map((entry) => entry.tpl) };
}
