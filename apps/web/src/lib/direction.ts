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
//
// Reading direction, for the handful of places CSS can't decide it
// (docs/rtl-plan.md R2).
//
// Almost all of the app's directional behaviour is CSS logical
// properties, which the browser resolves for us. Keyboard navigation
// is the exception: an arrow key carries a *physical* meaning, and
// what "forward" means depends on which way the text runs. In a
// right-to-left layout the item to a member's right is the PREVIOUS
// one, so ArrowRight has to go back — the same rule the WAI-ARIA
// authoring practices give for menubars and tablists.
//

/**
 * Whether the given element renders right-to-left.
 *
 * Walks up for the nearest ancestor that states a direction outright,
 * falling back to `<html dir>` (which `i18n/index.ts` keeps in step
 * with the active language).
 *
 * `dir="auto"` is deliberately NOT treated as an answer. It resolves
 * per-content from the first strong character, so a member-authored
 * container holding a Latin name inside an Arabic UI reports "ltr" —
 * true of that text, wrong for the layout the arrow keys move
 * through. We want the direction of the CHROME, so we keep climbing
 * past `auto` until something commits.
 */
export function isRtl(from?: Element | null): boolean {
  for (let el: Element | null = from ?? null; el; el = el.parentElement) {
    const dir = el.getAttribute("dir")?.toLowerCase();
    if (dir === "rtl" || dir === "ltr") return dir === "rtl";
  }
  // `from` was null, or nothing on the way up (including <html>) said.
  return document.documentElement.dir.toLowerCase() === "rtl";
}

/**
 * How far an arrow key moves along the inline axis: +1 forward (toward
 * the reading end), -1 back, 0 for a key that isn't an inline arrow.
 *
 * Up/Down are inline arrows here too, because both of the app's
 * arrow-navigable surfaces render as a horizontal bar at one width and
 * a vertical rail at another. Vertical order never mirrors, so they
 * are direction-independent.
 */
export function inlineStep(key: string, rtl: boolean): -1 | 0 | 1 {
  switch (key) {
    case "ArrowDown":
      return 1;
    case "ArrowUp":
      return -1;
    case "ArrowRight":
      return rtl ? -1 : 1;
    case "ArrowLeft":
      return rtl ? 1 : -1;
    default:
      return 0;
  }
}
