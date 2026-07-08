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
import { useEffect, type RefObject } from "react";

/**
 * Focus a search input when `/` is pressed — the affordance desktop
 * keyboard users reach for by habit (GitHub, YouTube, most docs
 * sites). Deliberately minimal:
 *
 *   - Plain `/` only. Any modifier (Ctrl//, Cmd//) is left alone —
 *     browsers and screen readers own those combinations.
 *   - Never fires while the member is already typing somewhere: any
 *     input, textarea, select, or contenteditable target swallows
 *     the check, so writing "either/or" in a post is unaffected.
 *   - No global registry, no shortcut framework — pages that have a
 *     search box opt in with a ref; everything else is untouched.
 *
 * The keydown is prevented so the slash never lands as text inside
 * the freshly-focused field.
 */
export function useSlashFocus(
  ref: RefObject<HTMLInputElement | null>,
): void {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      const el = ref.current;
      if (!el) return;
      e.preventDefault();
      el.focus();
      el.select();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [ref]);
}
