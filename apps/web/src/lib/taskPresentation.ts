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
import type { ProjectTask } from "@/types";

// Small presentational helpers shared by the task surfaces. Both the
// slim project-list `TaskCard` and the per-task-page `TaskDetailBody`
// need them, the per-task page header reuses them for its own chip row,
// and `ProjectDetailPage` reuses `capitalize` for the project status
// chip — so they live in one module rather than being duplicated or
// re-exported through a component file.

// Tailwind classes for a task status chip. Centralized so the same
// status reads identically across every surface (card, page body, page
// header). The switch is exhaustive over ProjectTask["status"].
export function statusChipClass(status: ProjectTask["status"]): string {
  switch (status) {
    case "open":
      return "bg-canopy-50 text-canopy-800 dark:bg-canopy-950/40 dark:text-canopy-100";
    case "claimed":
      return "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200";
    case "awaiting_confirmation":
      return "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100";
    case "completed":
      return "bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100";
    case "blocked":
      return "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100";
  }
}

// Capitalize the first letter — used to build the i18n key suffix for a
// status label (`projects.task.statusOpen`, `projects.statusActive`).
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
