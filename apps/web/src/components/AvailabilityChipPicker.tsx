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

// Canonical order: weekday → weekend, day → evening; "ask me" last
// as the meta-option. Used by both the picker and the read-only
// renderer so chips always surface in the same sequence.
export const AVAILABILITY_CHIP_ORDER: readonly AvailabilityChip[] = [
  "weekday_days",
  "weekday_evenings",
  "weekend_days",
  "weekend_evenings",
  "ask_me",
];

interface AvailabilityChipPickerProps {
  value: AvailabilityChip[];
  onChange: (next: AvailabilityChip[]) => void;
  /** id for the legend / aria-labelledby. */
  id?: string;
}

export function AvailabilityChipPicker({
  value,
  onChange,
  id,
}: AvailabilityChipPickerProps) {
  const { t } = useTranslation();
  const selected = new Set(value);

  function toggle(chip: AvailabilityChip) {
    const next = new Set(selected);
    if (next.has(chip)) {
      next.delete(chip);
    } else {
      next.add(chip);
    }
    // Emit in canonical order so consumers don't have to sort.
    onChange(AVAILABILITY_CHIP_ORDER.filter((c) => next.has(c)));
  }

  return (
    <fieldset id={id} className="flex flex-wrap gap-2">
      <legend className="sr-only">
        {t("profile.about.availabilityHeading")}
      </legend>
      {AVAILABILITY_CHIP_ORDER.map((chip) => {
        const isSelected = selected.has(chip);
        const className = isSelected
          ? "chip cursor-pointer bg-canopy-700 text-white"
          : "chip cursor-pointer bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200";
        return (
          <button
            key={chip}
            type="button"
            className={className}
            aria-pressed={isSelected}
            onClick={() => toggle(chip)}
          >
            {t(`availability.${chip}`)}
          </button>
        );
      })}
    </fieldset>
  );
}
