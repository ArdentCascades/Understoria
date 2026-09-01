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

// Three-state appearance preference. "system" follows the OS via
// matchMedia("(prefers-color-scheme: dark)"). "light" / "dark" pin
// the resolved theme regardless of the OS. The class-based Tailwind
// mechanism (darkMode: "class") toggles the resolved theme onto
// <html>; the inline script in index.html applies the same logic
// synchronously before first paint to avoid a flash of wrong theme.
export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_PREFERENCES: readonly ThemePreference[] = [
  "system",
  "light",
  "dark",
] as const;

/** Key used by the inline script in index.html to read the cached
 *  preference synchronously on first paint. The Dexie record is the
 *  source of truth; localStorage is a write-through cache. */
export const THEME_STORAGE_KEY = "understoria.theme";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

/** Pure resolver. `systemPrefersDark` is the current state of
 *  `matchMedia("(prefers-color-scheme: dark)").matches`. */
export function resolveTheme(
  pref: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (pref === "dark") return "dark";
  if (pref === "light") return "light";
  return systemPrefersDark ? "dark" : "light";
}

/** Toggle the `dark` class on `<html>`. No-op in non-DOM contexts
 *  (SSR, vitest without happy-dom) so callers don't need to guard. */
export function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/** Paper is always light. With darkMode: "class", every `dark:` rule
 *  compiles to a two-class selector that outranks the one-class
 *  `print:` utilities the print sheets rely on — so a dark-mode
 *  phone printed light titles on white paper and dark slabs where
 *  the page background showed. This guard drops the `dark` class
 *  for the duration of the print dialog (beforeprint) and restores
 *  the member's real theme after (afterprint). Returns an uninstall
 *  for tests; no-op in non-DOM contexts. */
export function installPrintThemeGuard(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }
  let wasDark = false;
  const before = () => {
    const root = document.documentElement;
    wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
  };
  const after = () => {
    if (wasDark) document.documentElement.classList.add("dark");
  };
  window.addEventListener("beforeprint", before);
  window.addEventListener("afterprint", after);
  return () => {
    window.removeEventListener("beforeprint", before);
    window.removeEventListener("afterprint", after);
  };
}

/** Mirror the resolved theme to localStorage so the inline script in
 *  index.html can read it synchronously on the next page load. */
export function cacheResolvedTheme(pref: ThemePreference): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // localStorage can throw in private-browsing / quota-exceeded
    // contexts. Falling back to a one-frame flash is acceptable.
  }
}

/** Subscribe to OS-level theme changes. Returns an unsubscribe fn.
 *  Caller is responsible for only subscribing when pref === "system". */
export function subscribeSystemTheme(
  cb: (systemPrefersDark: boolean) => void,
): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e: MediaQueryListEvent) => cb(e.matches);
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}

/** Current OS preference. Safe in non-DOM contexts (returns false). */
export function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
