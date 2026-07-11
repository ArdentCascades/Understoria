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
import { getTemplate } from "@/content/projectTemplates";

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
export const TASK_STEPS: Record<
  string,
  readonly { readonly en: readonly string[]; readonly es: readonly string[] }[]
> = {
  // Populated by the authored-content pass (see the PR that ships
  // this module); an empty map simply means no suggestions render.
};

/**
 * The suggested starter steps for one live task, in the viewer's
 * language, or null.
 *
 * Same title→index recovery as `getTaskTips`: a `ProjectTask.title`
 * is the template task's `name` verbatim at instantiation, in
 * whichever locale created the project; both orders are identical by
 * the template parity guard, so matching en first and es second finds
 * the same index either way. Drift (renamed/added task, unknown
 * template) yields null and the affordance doesn't render.
 */
export function getTaskSteps(
  templateId: string | null | undefined,
  taskTitle: string,
  locale: string,
): string[] | null {
  if (!templateId) return null;
  const steps = TASK_STEPS[templateId];
  if (!steps) return null;
  const en = getTemplate(templateId, "en");
  if (!en) return null;
  let idx = en.tasks.findIndex((t) => t.name === taskTitle);
  if (idx < 0) {
    const es = getTemplate(templateId, "es");
    idx = es ? es.tasks.findIndex((t) => t.name === taskTitle) : -1;
  }
  if (idx < 0) return null;
  const entry = steps[idx];
  if (!entry) return null;
  const list = locale.startsWith("es") ? entry.es : entry.en;
  return list && list.length > 0 ? [...list] : null;
}
