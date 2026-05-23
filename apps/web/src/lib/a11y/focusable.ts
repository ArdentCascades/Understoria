/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Pure DOM helpers for the focus-trap hook. Split out so the
// tab-cycling math is testable in isolation under jsdom without
// having to mount a real React component (the project doesn't
// have React Testing Library and this slice isn't the right
// place to add it).

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
  "[contenteditable]:not([contenteditable='false'])",
].join(",");

/** Returns every focusable element inside `container`, in document
 *  order. Excludes elements with the `hidden` attribute. Does NOT
 *  walk computed styles for `display: none` or `visibility: hidden` —
 *  that walk is expensive and inconsistent across jsdom and real
 *  browsers. If a returned element happens to be off-screen,
 *  `.focus()` is a no-op and the trap moves on the next Tab. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => !el.hidden);
}

/** Given the current focused element and the full focusable list,
 *  returns the element that should receive focus on Tab (forward)
 *  or Shift+Tab (backward), wrapping at the ends. Returns null when
 *  the list is empty (caller should keep focus where it is). */
export function nextFocusable(
  current: Element | null,
  all: readonly HTMLElement[],
  direction: "forward" | "backward",
): HTMLElement | null {
  if (all.length === 0) return null;
  if (all.length === 1) return all[0];
  const idx = current ? all.indexOf(current as HTMLElement) : -1;
  if (direction === "forward") {
    if (idx === -1 || idx === all.length - 1) return all[0];
    return all[idx + 1];
  } else {
    if (idx === -1 || idx === 0) return all[all.length - 1];
    return all[idx - 1];
  }
}
