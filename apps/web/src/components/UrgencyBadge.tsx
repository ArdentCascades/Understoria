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
import type { Urgency } from "@/types";

const STYLES: Record<Urgency, string> = {
  low: "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200",
  medium:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  high: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const { t } = useTranslation();
  const label = t(`urgency.${urgency}`);
  return (
    <span
      className={`chip ${STYLES[urgency]}`}
      role="status"
      aria-label={t("urgency.ariaLabel", { label })}
    >
      {label}
    </span>
  );
}
