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

// Three-step text-size preference. Implemented as a percentage on
// the <html> font-size, so it multiplies on top of the user's OS /
// browser default (Dynamic Type, browser zoom, etc.) rather than
// overwriting it. Every rem-based size in the app — typography,
// stack-* spacing, button padding — grows proportionally with no
// per-component changes.
//
// The class-based mechanism (see index.css) toggles
// `html.text-larger` / `html.text-largest`; the inline script in
// index.html applies the same logic synchronously before first
// paint to avoid a layout shift.
export type TextSize = "default" | "larger" | "largest";

export const TEXT_SIZES: readonly TextSize[] = [
  "default",
  "larger",
  "largest",
] as const;

/** Key used by the inline script in index.html to read the cached
 *  preference synchronously on first paint. The Dexie record is
 *  the source of truth; localStorage is a write-through cache. */
export const TEXT_SIZE_STORAGE_KEY = "understoria.text-size";

export function isTextSize(value: unknown): value is TextSize {
  return value === "default" || value === "larger" || value === "largest";
}

/** Toggle the `text-larger` / `text-largest` class on <html>. The
 *  two classes are mutually exclusive; switching always clears the
 *  other. No-op in non-DOM contexts so callers don't need to guard. */
export function applyTextSize(size: TextSize): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("text-larger", "text-largest");
  if (size === "larger") root.classList.add("text-larger");
  else if (size === "largest") root.classList.add("text-largest");
}

/** Mirror the preference to localStorage so the inline script in
 *  index.html can apply it synchronously on the next page load. */
export function cacheTextSize(size: TextSize): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
  } catch {
    // private-browsing / quota-exceeded — fall back to a one-
    // frame layout shift, acceptable.
  }
}
