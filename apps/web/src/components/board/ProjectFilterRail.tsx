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
import { ToggleChip } from "@/components/board/ToggleChip";
import type { Project, ProjectCategory } from "@/types";

/**
 * Projects-tab filter rail (category / status selects + the
 * "only with open tasks" toggle). Pure JSX extracted from
 * Board.tsx; all state lives in the parent and is passed through
 * as props.
 *
 * Rendered ONCE on the Board page, inside the reading column
 * between search and list — the same DOM position at every
 * breakpoint, collapsed behind the Filters disclosure at every
 * width (board-calm pass; ActiveFilterChips keep applied state
 * visible while collapsed). Below sm the controls stack full-width;
 * from sm up they lay out as one compact wrap row of
 * intrinsic-width controls (`sm:w-auto` overrides `.input`'s
 * w-full). The old dedicated 240px desktop
 * rail column is retired — see Board.tsx's layout comment.
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
  onlyHourSized: boolean;
  setOnlyHourSized: (next: (prev: boolean) => boolean) => void;
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
  onlyHourSized,
  setOnlyHourSized,
}: ProjectFilterRailProps) {
  const { t } = useTranslation();
  return (
    // Phones: selects stack full-width (good dropdown targets), then
    // the toggles wrap as chips on their own row (`sm:contents`
    // flattens that group back into one wrap row from sm up, so the
    // desktop layout is byte-identical to before the drawer pass).
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <label className="sr-only" htmlFor="project-category-filter">
        {t("board.projectFilters.category.ariaLabel")}
      </label>
      <select
        id="project-category-filter"
        className="input sm:w-auto"
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
        className="input sm:w-auto"
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
      {/* Toggle group. On phones these wrap as chips on their own
          row under the two full-width selects; `sm:contents` dissolves
          the wrapper from sm up so the three chips flow into the outer
          wrap row exactly as they did before the drawer pass.
            • openTasks — projects with unclaimed work.
            • needsMoreHands — projects whose tasks surfaced the
              "could use more hands" chip (framed at the work, never a
              person — the chip's own wording, reused).
            • hourSized — projects with ≥1 open task of an hour or less
              (lib/projectFilter.ts hasHourSizedTasks): a bounded,
              finishable slice; filters the work, never the member. */}
      <div className="flex flex-wrap gap-2 sm:contents">
        <ToggleChip
          pressed={onlyWithOpenTasks}
          onToggle={() => setOnlyWithOpenTasks((v) => !v)}
        >
          {t("board.projectFilters.openTasks.toggle")}
        </ToggleChip>
        <ToggleChip
          pressed={onlyNeedsMoreHands}
          onToggle={() => setOnlyNeedsMoreHands((v) => !v)}
        >
          {t("board.projectFilters.needsMoreHands.toggle")}
        </ToggleChip>
        <ToggleChip
          pressed={onlyHourSized}
          onToggle={() => setOnlyHourSized((v) => !v)}
        >
          {t("board.projectFilters.hourSized.toggle")}
        </ToggleChip>
      </div>
    </div>
  );
}
