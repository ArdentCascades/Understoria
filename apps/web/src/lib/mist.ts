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

// "Morning mist" chrome treatment (docs/themes-plan.md §1.4, T3):
// a genuinely frosted look on the floating chrome surfaces (sticky
// header, page bands, bottom nav) — deep blur, a saturation lift,
// and a theme-following tint a notch more translucent than the
// default chrome's own /70 treatment. Opt-in only; default off.
//
// Contrast posture (plan §1.4 amendment): the statically-certified
// tint floors proved MORE opaque than the default /70-with-blur
// chrome and therefore invisible; mist instead shares the shipped
// default's acceptance basis — chrome-text-only surfaces over
// blur-averaged real content, with fully solid fallbacks when
// backdrop-filter is unavailable or transparency is reduced.
// Reading surfaces (cards, docked panels) never get this treatment
// — their contrast pairings assume solid backgrounds.
//
// Class-based mechanism (see index.css): toggles `html.mist`. The
// inline script in index.html applies the same class synchronously
// before first paint. Reduced-transparency and no-backdrop-filter
// environments fall back to solid tints in CSS — visually
// near-identical at these alphas, so the toggle is honest on every
// device.
export type MistPreference = "off" | "on";

export const MIST_PREFERENCES: readonly MistPreference[] = [
  "off",
  "on",
] as const;

/** Key used by the inline script in index.html to read the cached
 *  preference synchronously on first paint. The Dexie record is
 *  the source of truth; localStorage is a write-through cache. */
export const MIST_STORAGE_KEY = "understoria.mist";

export function isMistPreference(value: unknown): value is MistPreference {
  return value === "off" || value === "on";
}

/** Apply the mist class to the root element. No-op in non-DOM
 *  contexts so callers don't need to guard. */
export function applyMist(pref: MistPreference): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (pref === "on") root.classList.add("mist");
  else root.classList.remove("mist");
}

/** Mirror the preference to localStorage so the inline script in
 *  index.html can apply it synchronously on the next page load. */
export function cacheMist(pref: MistPreference): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MIST_STORAGE_KEY, pref);
  } catch {
    // private-browsing / quota-exceeded — fall back to a one-frame
    // chrome restyle on next reload, acceptable.
  }
}
