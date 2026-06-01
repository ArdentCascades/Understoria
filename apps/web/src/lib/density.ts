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

// Two-step layout-density preference. Default ships the comfortable
// card padding (1rem) members have seen since launch. "Compact"
// shaves that to 0.75rem so denser screens — especially Phase 1/2's
// reflowed multi-column lists at lg+ — fit more above the fold for
// members who prefer information density to breathing room.
//
// Opt-in only. There is no `prefers-reduced-data` auto-resolution —
// that media query is about bandwidth, not visual density, and
// turning it into a presentation switch would be unintuitive.
//
// Class-based mechanism (see index.css): toggles `html.density-compact`.
// The inline script in index.html applies the same class
// synchronously before first paint so there's no layout shift on
// reload.
export type DensityPreference = "default" | "compact";

export const DENSITY_PREFERENCES: readonly DensityPreference[] = [
  "default",
  "compact",
] as const;

/** Key used by the inline script in index.html to read the cached
 *  preference synchronously on first paint. The Dexie record is
 *  the source of truth; localStorage is a write-through cache. */
export const DENSITY_STORAGE_KEY = "understoria.density";

export function isDensityPreference(
  value: unknown,
): value is DensityPreference {
  return value === "default" || value === "compact";
}

/** Apply the density class to the root element. The class is the
 *  CSS-side selector for the compact overrides in index.css. No-op
 *  in non-DOM contexts so callers don't need to guard. */
export function applyDensity(pref: DensityPreference): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (pref === "compact") root.classList.add("density-compact");
  else root.classList.remove("density-compact");
}

/** Mirror the preference to localStorage so the inline script in
 *  index.html can apply it synchronously on the next page load. */
export function cacheDensity(pref: DensityPreference): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DENSITY_STORAGE_KEY, pref);
  } catch {
    // private-browsing / quota-exceeded — fall back to a one-frame
    // layout shift on next reload, acceptable.
  }
}
