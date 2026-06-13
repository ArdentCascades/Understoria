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
import { useTranslation } from "react-i18next";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import type { Project, ProjectCategory } from "@/types";

/**
 * Projects-tab filter rail (category / status selects + the
 * "only with open tasks" toggle). Pure JSX extracted from
 * Board.tsx; all state lives in the parent and is passed through
 * as props.
 *
 * Rendered in TWO DOM positions on the Board page — once inside
 * the middle reading column (mobile-visible via `lg:hidden`) and
 * once as an outer-grid child in col-1 (desktop-visible via
 * `hidden lg:block`). The component itself carries NO layout /
 * order / column-placement classes; those live on the wrapper at
 * each render site. See Board.tsx for the rationale.
 */
export interface ProjectFilterRailProps {
  projectCategoryFilter: ProjectCategory | "";
  setProjectCategoryFilter: (value: ProjectCategory | "") => void;
  projectStatusFilter: Project["status"] | "";
  setProjectStatusFilter: (value: Project["status"] | "") => void;
  onlyWithOpenTasks: boolean;
  setOnlyWithOpenTasks: (next: (prev: boolean) => boolean) => void;
  onlyNeedsMoreHands: boolean;
  setOnlyNeedsMoreHands: (next: (prev: boolean) => boolean) => void;
}

export function ProjectFilterRail({
  projectCategoryFilter,
  setProjectCategoryFilter,
  projectStatusFilter,
  setProjectStatusFilter,
  onlyWithOpenTasks,
  setOnlyWithOpenTasks,
  onlyNeedsMoreHands,
  setOnlyNeedsMoreHands,
}: ProjectFilterRailProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-2 sm:grid-cols-3 md:max-w-2xl lg:grid-cols-1">
      <label className="sr-only" htmlFor="project-category-filter">
        {t("board.projectFilters.category.ariaLabel")}
      </label>
      <select
        id="project-category-filter"
        className="input"
        value={projectCategoryFilter}
        onChange={(e) =>
          setProjectCategoryFilter(e.target.value as ProjectCategory | "")
        }
        aria-label={t("board.projectFilters.category.ariaLabel")}
      >
        <option value="">
          {t("board.projectFilters.category.all")}
        </option>
        {ALL_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_META[c].emoji} {t(`categories.${c}`)}
          </option>
        ))}
        {/* Project-only extension categories. Mirrors the
            hardcoded options in ProjectNew.tsx — these three
            don't have entries in the `categories.*` i18n
            namespace (post types never use them), so they're
            written out inline rather than gaining new keys. */}
        <option value="infrastructure">🏗️ Infrastructure</option>
        <option value="organizing">📋 Organizing</option>
        <option value="mutual_aid_drive">💛 Mutual aid drive</option>
      </select>
      <label className="sr-only" htmlFor="project-status-filter">
        {t("board.projectFilters.status.ariaLabel")}
      </label>
      <select
        id="project-status-filter"
        className="input"
        value={projectStatusFilter}
        onChange={(e) =>
          setProjectStatusFilter(
            e.target.value as Project["status"] | "",
          )
        }
        aria-label={t("board.projectFilters.status.ariaLabel")}
      >
        <option value="">{t("board.projectFilters.status.all")}</option>
        <option value="planning">
          {t("board.projectFilters.status.planning")}
        </option>
        <option value="active">
          {t("board.projectFilters.status.active")}
        </option>
        <option value="paused">
          {t("board.projectFilters.status.paused")}
        </option>
        <option value="completed">
          {t("board.projectFilters.status.completed")}
        </option>
        {/* `archived` is intentionally NOT an option. Archived
            projects are reached only via the "View archive"
            link below; the Projects tab never lists them. */}
      </select>
      <button
        type="button"
        onClick={() => setOnlyWithOpenTasks((v) => !v)}
        aria-pressed={onlyWithOpenTasks}
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          onlyWithOpenTasks
            ? "bg-canopy-100 text-canopy-900 hover:bg-canopy-200 dark:bg-canopy-900/60 dark:text-canopy-100"
            : "bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
        }`}
      >
        {t("board.projectFilters.openTasks.toggle")}
      </button>
      {/* Points members at projects whose tasks have surfaced the
          "could use more hands" chip — framed at the task/project,
          never at a person (the chip's own wording, reused). */}
      <button
        type="button"
        onClick={() => setOnlyNeedsMoreHands((v) => !v)}
        aria-pressed={onlyNeedsMoreHands}
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          onlyNeedsMoreHands
            ? "bg-canopy-100 text-canopy-900 hover:bg-canopy-200 dark:bg-canopy-900/60 dark:text-canopy-100"
            : "bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
        }`}
      >
        {t("board.projectFilters.needsMoreHands.toggle")}
      </button>
    </div>
  );
}
