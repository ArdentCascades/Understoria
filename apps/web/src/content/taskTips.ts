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

// Per-task tips — one short, task-specific pointer shown on a task's own
// page ("Tips for this task"). Authored content, kept OUT of the giant
// projectTemplates.ts table and off the federated ProjectTask so it stays
// content-only (no schema churn, nothing to sync). Both locales live here
// side by side, index-aligned to each template's `tasks` array; the
// en/es task order is parity-locked in projectTemplates.test.ts, so the
// index recovered from a live task's title resolves the same tip in
// either language. Coverage (every template task has a non-empty en+es
// tip) is CI-pinned in taskTips.test.ts.
// The tip tables live in per-language modules (taskTips.en.ts
// eagerly, taskTips.es.ts in the lazy Spanish content bundle);
// title->index recovery shares templateTaskIndex with taskSteps.
import { getContentBundle } from "./registry";
import { templateTaskIndex } from "./taskSteps";

export function getTaskTips(
  templateId: string | null | undefined,
  taskTitle: string,
  locale: string,
): string | null {
  if (!templateId) return null;
  const idx = templateTaskIndex(templateId, taskTitle);
  if (idx < 0) return null;
  const text =
    getContentBundle(locale).TASK_TIPS[templateId]?.[idx] ??
    getContentBundle("en").TASK_TIPS[templateId]?.[idx];
  return text && text.trim() ? text : null;
}
