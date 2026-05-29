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
import type { AvailabilityChip } from "@/types";
import { AVAILABILITY_CHIP_ORDER } from "./AvailabilityChipPicker";

interface AvailabilityChipsProps {
  chips: readonly AvailabilityChip[];
  /** When true, render at the smaller size used inside PostCard. */
  compact?: boolean;
}

// Read-only renderer for a member's selected availability chips.
// Renders nothing when the list is empty; the caller decides whether
// to wrap in additional surrounding chrome.
export function AvailabilityChips({ chips, compact }: AvailabilityChipsProps) {
  const { t } = useTranslation();
  if (chips.length === 0) return null;
  const present = new Set(chips);
  const ordered = AVAILABILITY_CHIP_ORDER.filter((c) => present.has(c));
  const gap = compact ? "gap-1" : "gap-1.5";
  return (
    <div
      className={`flex flex-wrap ${gap}`}
      aria-label={t("availability.summaryLabel")}
    >
      {ordered.map((chip) => (
        <span
          key={chip}
          className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200"
        >
          {t(`availability.${chip}`)}
        </span>
      ))}
    </div>
  );
}
