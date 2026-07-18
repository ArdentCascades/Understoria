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
import { useEffect, useState } from "react";

// Viewport regime helpers for the landscape-short layouts. The
// tailwind `landscape-short` variant (tailwind.config.js) is the CSS
// twin of SHORT_LANDSCAPE_QUERY — keep the two queries in lockstep.
// SPLIT_CAPABLE adds a width floor: below ~700px there isn't room for
// two panes with usable tap targets, so those layouts fall back to
// single-pane even sideways (SE-class phones).
export const SHORT_LANDSCAPE_QUERY =
  "(orientation: landscape) and (max-height: 500px)";
export const SPLIT_CAPABLE_QUERY =
  "(orientation: landscape) and (max-height: 500px) and (min-width: 700px)";
// The JS twin of Tailwind's default `lg:` breakpoint — the width at
// which DockedPanel's CSS docks it as a side column. Keep in lockstep
// with tailwind's screens config (default: lg = 1024px).
export const DESKTOP_DOCK_QUERY = "(min-width: 1024px)";

/** Live media-query hook: tracks rotation/resize, safe under jsdom
 *  (no matchMedia → always false). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(query).matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}
