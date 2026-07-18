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
import type { ReactNode } from "react";

/**
 * A single on/off filter chip inside the Board's filter drawer. One
 * component for the four toggles that used to be duplicated inline
 * across PostFilterRail / ProjectFilterRail.
 *
 * Accessibility:
 *   - `aria-pressed` carries the on/off state programmatically, so
 *     the leading ✓ is `aria-hidden` — a purely visual confirmation
 *     for sighted members that a toggle is on (the pre-drawer design
 *     leaned only on a subtle fill, ambiguous once chips sit beside
 *     dropdowns in a panel).
 *   - `py-1.5` keeps the target ≥28px tall — above the WCAG 2.5.8
 *     (AA) 24px minimum, where the old `py-1` sat right on the line.
 */
export function ToggleChip({
  pressed,
  onToggle,
  children,
}: {
  pressed: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        pressed
          ? "bg-canopy-100 text-canopy-900 hover:bg-canopy-200 dark:bg-canopy-900/60 dark:text-canopy-100"
          : "bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
      }`}
    >
      {pressed && <span aria-hidden="true">✓</span>}
      {children}
    </button>
  );
}
