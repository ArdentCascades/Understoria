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

// Four-step text-size preference. "auto" resolves to "larger" on
// viewports ≥1024px (Tailwind's `lg` breakpoint — covers desktops
// and tablet-landscape) and "default" on anything narrower. The
// three explicit values pin a size regardless of viewport. Default
// preference is "auto" for first-time visitors; this is the way
// the project ships "larger on desktop" without overriding members
// who explicitly pick a size.
//
// Implementation: percentage on the <html> font-size, so every
// rem-based size in the app scales together. The preference
// multiplies on top of the user's OS / browser default
// (Dynamic Type, browser zoom) rather than replacing it.
//
// The class-based mechanism (see index.css) toggles
// `html.text-larger` / `html.text-largest`; the inline script in
// index.html applies the same resolution synchronously before
// first paint so there's no layout shift.
export type TextSizePreference = "auto" | "default" | "larger" | "largest";

/** The resolved value `applyTextSize` consumes. `auto` is never a
 *  resolved value — it always collapses to one of these three. */
export type TextSize = "default" | "larger" | "largest";

export const TEXT_SIZE_PREFERENCES: readonly TextSizePreference[] = [
  "auto",
  "default",
  "larger",
  "largest",
] as const;

/** Key used by the inline script in index.html to read the cached
 *  preference synchronously on first paint. The Dexie record is
 *  the source of truth; localStorage is a write-through cache. */
export const TEXT_SIZE_STORAGE_KEY = "understoria.text-size";

/** Viewport floor at which "auto" reads as "larger." Matches
 *  Tailwind's `lg` breakpoint. The constant is exported so the
 *  inline script in index.html and the tests can stay in sync —
 *  changing it changes both places. */
export const WIDE_VIEWPORT_QUERY = "(min-width: 1024px)";

export function isTextSizePreference(
  value: unknown,
): value is TextSizePreference {
  return (
    value === "auto" ||
    value === "default" ||
    value === "larger" ||
    value === "largest"
  );
}

/** Pure resolver. `wide` is the current state of the
 *  `(min-width: 1024px)` media query — callers pass it so tests
 *  can drive both sides without touching window.matchMedia. */
export function resolveTextSize(
  pref: TextSizePreference,
  wide: boolean,
): TextSize {
  if (pref === "default" || pref === "larger" || pref === "largest") {
    return pref;
  }
  return wide ? "larger" : "default";
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
export function cacheTextSize(pref: TextSizePreference): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, pref);
  } catch {
    // private-browsing / quota-exceeded — fall back to a one-
    // frame layout shift, acceptable.
  }
}

/** Current viewport width state. Safe in non-DOM contexts
 *  (returns false). */
export function isWideViewport(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(WIDE_VIEWPORT_QUERY).matches;
}

/** Subscribe to viewport-width changes. Returns an unsubscribe
 *  function. Caller is responsible for only subscribing when
 *  pref === "auto" — for the three explicit sizes the resolver
 *  ignores viewport, so the listener would just fire no-ops. */
export function subscribeViewportWidth(
  cb: (wide: boolean) => void,
): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mql = window.matchMedia(WIDE_VIEWPORT_QUERY);
  const handler = (e: MediaQueryListEvent) => cb(e.matches);
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}
