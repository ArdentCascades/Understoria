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
import { useEffect, useRef, useState } from "react";

// Reusable overflow (kebab) menu. Behavior is ported verbatim from the
// header menu that was inlined in pages/Conversation.tsx so every
// affordance keeps the same a11y contract: a 44×44 trigger with
// aria-haspopup="menu" / aria-expanded, a role="menu" popover of
// role="menuitem" buttons, Escape-closes-and-refocuses-trigger, and
// outside-mousedown-closes (no refocus — the member moved on).
//
// We standardize the glyph on the VERTICAL ellipsis ⋮ (U+22EE) so the
// kebab reads the same everywhere, even though Conversation historically
// drew the horizontal ⋯.
export interface OverflowMenuItem {
  key: string;
  label: string;
  /** Optional one-line hint rendered as small muted text under the
   *  label, inside the same menuitem. For entries whose consequence
   *  isn't obvious from the label alone (e.g. "Add to calendar"
   *  downloads a file and leaves reminders to the member's own app). */
  description?: string;
  onSelect: () => void;
  tone?: "default" | "destructive";
  disabled?: boolean;
}

export function OverflowMenu({
  items,
  label,
  align = "right",
}: {
  /** Actions to render. An empty array renders no trigger at all —
   *  callers may pass `[]` when the viewer has no available actions. */
  items: OverflowMenuItem[];
  /** aria-label for the trigger button. */
  label: string;
  /** Which edge the popover aligns to. Defaults to "right". */
  align?: "left" | "right";
}): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Esc (refocusing the trigger — standard menu a11y) and on
  // click-outside (no refocus). Guarded by `open` so the listeners only
  // exist while the menu is showing.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointer(e: MouseEvent) {
      const target = e.target as Node | null;
      if (
        menuRef.current &&
        target &&
        !menuRef.current.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  // No actions → no trigger. Render nothing rather than an empty,
  // dead kebab.
  if (items.length === 0) return null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="btn-ghost inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-base"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">⋮</span>
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className={`absolute ${align === "right" ? "right-0" : "left-0"} z-20 mt-1 w-56 overflow-hidden rounded-lg border border-moss-200 bg-white shadow-lg dark:border-moss-700 dark:bg-moss-900`}
        >
          {items.map((item) => {
            const tone = item.tone ?? "default";
            const toneClass =
              tone === "destructive"
                ? "text-rose-700 hover:bg-rose-50 focus-visible:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                : "text-moss-800 hover:bg-moss-50 focus-visible:bg-moss-50 dark:text-moss-100 dark:hover:bg-moss-800/40";
            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={`flex min-h-[44px] w-full items-center px-3 py-2 text-left text-sm ${toneClass}${
                  item.disabled ? " cursor-not-allowed opacity-50" : ""
                }`}
                onClick={() => {
                  if (item.disabled) return;
                  // Close first, THEN run the action — so a handler that
                  // opens a dialog or navigates doesn't race the menu's
                  // own teardown.
                  setOpen(false);
                  item.onSelect();
                }}
              >
                <span className="flex flex-col">
                  <span>{item.label}</span>
                  {item.description && (
                    <span className="mt-0.5 text-xs font-normal text-moss-600 dark:text-moss-300">
                      {item.description}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
