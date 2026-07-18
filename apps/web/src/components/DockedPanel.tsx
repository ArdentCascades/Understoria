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
import { useEffect, useRef, type ReactNode } from "react";
import { SPLIT_CAPABLE_QUERY, useMediaQuery } from "@/lib/viewport";

// The docked-panel frame shared by the calendar's event panel and the
// board's post panel (docs/desktop-power-tools.md plan 3 extracted it
// from CalendarEventPanel). At lg+ it renders as a side column NEXT TO
// the parent page — the page stays mounted (filters, month state,
// scroll position alive) while the member reads or acts; opening
// another item simply swaps the panel's contents. Below lg it takes
// the whole viewport, which reads exactly like the standalone page —
// small screens never see half a page behind a half panel.
//
// It is a DOCKED PANEL, not a modal: no backdrop, no focus trap, the
// page behind stays fully interactive (that's the point). The panel
// takes focus on open/swap so keyboard and screen-reader users land
// in what they asked for, and Escape (from anywhere on the page) or
// the close button dismisses it.
//
// A phone held sideways ALSO docks when the viewport clears the
// split-capable floor (SPLIT_CAPABLE_QUERY, lib/viewport.ts: short
// landscape AND ≥700px wide) — width is abundant there, so the
// two-pane reading posture desktop gets is available too. Below the
// floor (SE-class phones) or in portrait the full-screen takeover
// stays. This gate is the JS hook rather than a CSS variant because
// the panel's siblings (Board/Calendar list columns) also switch
// their layout on the same boolean, and rotation mid-view must
// live-switch — the hook tracks the media query.
export function DockedPanel({
  ariaLabel,
  closeLabel,
  closeShortLabel,
  onClose,
  swapKey,
  children,
}: {
  ariaLabel: string;
  /** Accessible name for the close button. */
  closeLabel: string;
  /** The close button's visible text. */
  closeShortLabel: string;
  onClose: () => void;
  /** Refocus the panel when this changes (item swapped in place). */
  swapKey: string | undefined;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLElement | null>(null);
  // Short-landscape with room for two panes → dock instead of
  // taking over the viewport (see the header comment).
  const splitCapable = useMediaQuery(SPLIT_CAPABLE_QUERY);

  // Focus the panel when it opens and when the member swaps to a
  // different item from the page behind it.
  useEffect(() => {
    panelRef.current?.focus();
  }, [swapKey]);

  // Escape closes the panel from anywhere on the page (document
  // level rather than an aside key handler - jsx-a11y forbids key
  // listeners on non-interactive elements, and a member who has
  // clicked back into the page should still be able to dismiss).
  // Guarded so Escape inside a form field only does what the field
  // wants, never a surprise close.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
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
      onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <aside
      ref={panelRef}
      tabIndex={-1}
      aria-label={ariaLabel}
      className={`overflow-y-auto bg-white dark:bg-moss-950 ${
        splitCapable
          ? // Sideways dock: ~45% of the row with a tap-target floor,
            // sticky and viewport-capped like the lg column (top-2:
            // vertical space is the scarce axis here).
            `motion-safe:animate-slide-in sticky top-2 w-[45%] min-w-[280px]
               shrink-0 self-start max-h-[calc(100dvh-1rem)] rounded-2xl
               border border-moss-200 shadow-leaf dark:border-moss-800`
          : "fixed inset-0 z-40"
      }
                 lg:motion-safe:animate-slide-in
                 lg:static lg:z-auto lg:inset-auto lg:w-[26rem] xl:w-[30rem]
                 lg:shrink-0 lg:self-start lg:sticky lg:top-4
                 lg:max-h-[calc(100dvh-7rem)] lg:rounded-2xl
                 lg:border lg:border-moss-200 lg:bg-white lg:shadow-leaf
                 lg:dark:border-moss-800 lg:dark:bg-moss-950`}
    >
      <div className="flex justify-end px-4 pt-3 lg:pb-0">
        <button
          type="button"
          className="touch-target inline-flex items-center justify-center rounded-full px-2 text-moss-600 hover:bg-moss-100 hover:text-canopy-700 dark:text-moss-300 dark:hover:bg-moss-800 dark:hover:text-canopy-300"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
          <span className="ml-1 text-sm">{closeShortLabel}</span>
        </button>
      </div>
      {children}
    </aside>
  );
}
