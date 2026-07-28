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

// Suggested starter steps — the one-tap head start for the private
// plan on a claimed TEMPLATE task ("Start with suggested steps" in
// TaskPrivateChecklist). Same mechanism and discipline as
// content/taskTips.ts: authored content, index-aligned to each
// template's `tasks` array, both locales side by side, kept OUT of
// the federated ProjectTask (content-only, no schema churn, nothing
// to sync). Coverage (every template task has 3-5 non-empty steps in
// both locales) is CI-pinned in taskSteps.test.ts.
//
// Voice: each step is a short imperative the claimer could have
// written for themselves — a personal to-do, not documentation. The
// first step of every list is deliberately tiny (a two-minute
// action), because the feature exists for the executive-function gap
// between claiming and starting: the description says what done looks
// like; these say how to BEGIN. Once seeded they are ordinary private
// checklist items — editable, deletable, invisible to everyone else.
// The step tables live in per-language modules (taskSteps.en.ts
// eagerly, taskSteps.es.ts in the lazy Spanish content bundle);
// title->index recovery goes through the eager taskTitleIndex so a
// task created in ANY content language resolves without loading
// that language's full bundle.
import { getContentBundle } from "./registry";
import { TEMPLATE_TASK_NAMES } from "./taskTitleIndex";

/** Index of `taskTitle` in the template's task list, matched against
 *  every content language's name table (a ProjectTask.title is the
 *  template task name verbatim in whichever locale created the
 *  project; orders are parity-locked across locales). -1 on drift. */
export function templateTaskIndex(
  templateId: string,
  taskTitle: string,
): number {
  const tables = TEMPLATE_TASK_NAMES[templateId];
  if (!tables) return -1;
  for (const names of Object.values(tables)) {
    const idx = names.indexOf(taskTitle);
    if (idx >= 0) return idx;
  }
  return -1;
}

export function getTaskSteps(
  templateId: string | null | undefined,
  taskTitle: string,
  locale: string,
): string[] | null {
  if (!templateId) return null;
  const idx = templateTaskIndex(templateId, taskTitle);
  if (idx < 0) return null;
  const list =
    getContentBundle(locale).TASK_STEPS[templateId]?.[idx] ??
    getContentBundle("en").TASK_STEPS[templateId]?.[idx];
  return list && list.length > 0 ? [...list] : null;
}
