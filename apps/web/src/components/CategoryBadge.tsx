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
import {
  normalizeExchangeCategory,
  PROJECT_CATEGORY_META,
} from "@/lib/categories";
import type { ProjectCategory } from "@/types";

export function CategoryBadge({
  category,
  size = "md",
}: {
  category: ProjectCategory;
  size?: "sm" | "md";
}) {
  const { t } = useTranslation();
  // The parameter type promises ProjectCategory, but rows outlive
  // renames and task/project state federates verbatim — a stale id on
  // one old row must render as "Other", not crash the caller's whole
  // screen (lib/categories.ts, normalizeExchangeCategory).
  const safeId = normalizeExchangeCategory(category);
  const meta = PROJECT_CATEGORY_META[safeId];
  const base =
    "inline-flex items-center gap-1.5 rounded-full bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100";
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };
  return (
    <span className={`${base} ${sizes[size]}`}>
      <span aria-hidden="true">{meta.emoji}</span>
      <span>{t(`categories.${safeId}`)}</span>
    </span>
  );
}
