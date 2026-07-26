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
import type { ResolvedTheme } from "./theme";

// Four-way color-palette preference (docs/themes-plan.md). Default
// "canopy" is today's palette — members who never open the setting
// see zero change. The other three swap ONLY the four brand
// families' CSS variables (index.css `[data-palette="…"]` blocks);
// light/dark stays orthogonal because every palette defines both
// modes on the same family steps.
//
// Attribute-based mechanism: sets `data-palette` on <html> for the
// three non-default palettes and REMOVES it for canopy, so the base
// `:root` variable block is the canopy statement. The inline script
// in index.html applies the same attribute synchronously before
// first paint so there's no flash of the wrong palette on reload.
export type PalettePreference =
  | "canopy"
  | "riverbed"
  | "harvest"
  | "fieldnotes";

export const PALETTE_PREFERENCES: readonly PalettePreference[] = [
  "canopy",
  "riverbed",
  "harvest",
  "fieldnotes",
] as const;

/** Key used by the inline script in index.html to read the cached
 *  preference synchronously on first paint. The Dexie record is
 *  the source of truth; localStorage is a write-through cache. */
export const PALETTE_STORAGE_KEY = "understoria.palette";

export function isPalettePreference(
  value: unknown,
): value is PalettePreference {
  return (
    value === "canopy" ||
    value === "riverbed" ||
    value === "harvest" ||
    value === "fieldnotes"
  );
}

/** Apply the palette attribute to the root element. Non-default
 *  palettes set `data-palette`; canopy removes it so the `:root`
 *  variables (the baseline palette) win. No-op in non-DOM contexts
 *  so callers don't need to guard. */
export function applyPalette(pref: PalettePreference): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (pref === "canopy") root.removeAttribute("data-palette");
  else root.setAttribute("data-palette", pref);
}

/** Mirror the preference to localStorage so the inline script in
 *  index.html can apply it synchronously on the next page load. */
export function cachePalette(pref: PalettePreference): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PALETTE_STORAGE_KEY, pref);
  } catch {
    // private-browsing / quota-exceeded — fall back to a one-frame
    // palette flash on next reload, acceptable.
  }
}

/** Browser-chrome bar colors per palette × resolved mode (D3 in
 *  docs/themes-plan.md): each palette's canopy-700 for light mode
 *  and its moss-950 for dark mode. Literal hexes on purpose — the
 *  meta tag can't read CSS variables, and these must match the
 *  index.css palette blocks. */
export const THEME_COLOR: Record<
  PalettePreference,
  { light: string; dark: string }
> = {
  canopy: { light: "#15803d", dark: "#161f13" },
  riverbed: { light: "#1f77a2", dark: "#171d24" },
  harvest: { light: "#5a781d", dark: "#1e1d15" },
  fieldnotes: { light: "#306e54", dark: "#171616" },
};

/** Keep the `<meta name="theme-color">` in sync with the chosen
 *  palette and resolved light/dark mode — this is why the browser
 *  chrome bar (Android address bar, iOS PWA status area) follows
 *  the palette. The static value in index.html is only the
 *  pre-boot fallback; every palette or theme change re-points it
 *  here. Creates the meta if absent (defensive only — index.html
 *  always ships one). No-op in non-DOM contexts. */
export function applyThemeColorMeta(
  pref: PalettePreference,
  resolvedTheme: ResolvedTheme,
): void {
  if (typeof document === "undefined") return;
  let meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", THEME_COLOR[pref][resolvedTheme]);
}
