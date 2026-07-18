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
import type { Category, Urgency } from "@/types";

const URGENCY_VALUES: Array<"" | Urgency> = ["", "high", "medium", "low"];

/**
 * Post-tab filter rail (category / urgency / zone selects + the
 * "show claimed" toggle). Pure JSX extracted from Board.tsx; all
 * state lives in the parent and is passed through as props.
 *
 * Rendered ONCE on the Board page, inside the reading column
 * between search and list — the same DOM position at every
 * breakpoint, collapsed behind the Filters disclosure at every
 * width (board-calm pass; ActiveFilterChips keep applied state
 * visible while collapsed). Below sm the controls stack full-width;
 * from sm up they lay out as one compact wrap row of
 * intrinsic-width controls (`sm:w-auto` overrides `.input`'s
 * w-full) so the filters spend one row of
 * height and zero horizontal tracks. The old dedicated 240px
 * desktop rail column is retired — see Board.tsx's layout comment.
 */
export interface PostFilterRailProps {
  categoryFilter: Category | "";
  setCategoryFilter: (value: Category | "") => void;
  urgencyFilter: Urgency | "";
  setUrgencyFilter: (value: Urgency | "") => void;
  zoneFilter: string;
  setZoneFilter: (value: string) => void;
  zones: string[];
  /** Number of in-scope posts that are currently claimed. When > 0
   *  the rail surfaces the "Show N claimed" / "Hide N claimed"
   *  toggle. */
  claimedInScope: number;
  showClaimed: boolean;
  setShowClaimed: (next: (prev: boolean) => boolean) => void;
}

export function PostFilterRail({
  categoryFilter,
  setCategoryFilter,
  urgencyFilter,
  setUrgencyFilter,
  zoneFilter,
  setZoneFilter,
  zones,
  claimedInScope,
  showClaimed,
  setShowClaimed,
}: PostFilterRailProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
        <label className="sr-only" htmlFor="category-filter">
          {t("board.filters.categoryAriaLabel")}
        </label>
        <select
          id="category-filter"
          className="input sm:w-auto"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Category | "")}
        >
          <option value="">{t("board.filters.allCategories")}</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].emoji} {t(`categories.${c}`)}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="urgency-filter">
          {t("board.filters.urgencyAriaLabel")}
        </label>
        <select
          id="urgency-filter"
          className="input sm:w-auto"
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value as Urgency | "")}
        >
          {URGENCY_VALUES.map((value) => (
            <option key={value} value={value}>
              {value === ""
                ? t("board.filters.allUrgencies")
                : t(`urgency.${value}`)}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="zone-filter">
          {t("board.filters.zoneAriaLabel")}
        </label>
        <select
          id="zone-filter"
          className="input sm:w-auto"
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
        >
          <option value="">{t("board.filters.allZones")}</option>
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </div>

      {/* Below sm the toggle keeps its own right-aligned row under
          the stacked selects; from sm it joins the wrap row as one
          more inline chip (mt-2 sm:mt-0 keeps the row rhythm). */}
      {claimedInScope > 0 && (
        <div className="mt-2 flex justify-end sm:mt-2 sm:justify-start">
          <button
            type="button"
            onClick={() => setShowClaimed((v) => !v)}
            aria-pressed={showClaimed}
            className="rounded-full bg-moss-100 px-3 py-1 text-xs font-medium text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
          >
            {showClaimed
              ? t("board.hideClaimed", { count: claimedInScope })
              : t("board.showClaimed", { count: claimedInScope })}
          </button>
        </div>
      )}
    </>
  );
}
