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
import type { ComponentType, KeyboardEvent } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IconBoard,
  IconCalendar,
  IconDashboard,
  IconMessages,
  IconCare,
  type IconProps,
} from "@/components/visual";
import { useVirtualKeyboardOpen } from "@/lib/useVirtualKeyboard";

interface NavItem {
  to: string;
  labelKey:
    | "nav.board"
    | "nav.calendar"
    | "nav.dashboard"
    | "nav.messages"
    | "nav.myWork";
  Icon: ComponentType<IconProps>;
}

// Five tabs; on the narrowest phones (320px / iPhone SE) each tab cell
// is ~64px wide. Labels are ALWAYS visible — sighted users without
// screen readers need to see them too, per operator feedback. To make
// them fit, mobile uses a smaller rem-based size (0.6875rem ≈ 11px,
// scales with the text-size preference) and `sm:text-xs` (12px) at
// 640px+. `break-words` on the label lets long copy (Spanish
// "Calendario") wrap rather than overflow at the largest text setting.
const ITEMS: NavItem[] = [
  { to: "/", labelKey: "nav.board", Icon: IconBoard },
  { to: "/dashboard", labelKey: "nav.dashboard", Icon: IconDashboard },
  { to: "/calendar", labelKey: "nav.calendar", Icon: IconCalendar },
  { to: "/messages", labelKey: "nav.messages", Icon: IconMessages },
  // The fifth slot is "In my care" (docs/navigation-shell.md; shipped
  // as "My work", renamed — care register, not labor): every tab is a
  // daily-work surface. Profile — identity, history, the things you
  // revisit rather than work in — lives in the me-menu (AppHeader,
  // top right), where its row is the member's own name.
  { to: "/my-work", labelKey: "nav.myWork", Icon: IconCare },
];

// Keyboard navigation inside the bottom nav. Tab still moves into
// and out of the nav as a unit; once inside, ArrowRight/Left (and
// Home/End) move focus between items without re-traversing the
// whole document. Standard pattern for nav menubars.
function handleArrowNav(e: KeyboardEvent<HTMLAnchorElement>) {
  const key = e.key;
  if (
    key !== "ArrowRight" &&
    key !== "ArrowLeft" &&
    key !== "ArrowUp" &&
    key !== "ArrowDown" &&
    key !== "Home" &&
    key !== "End"
  ) {
    return;
  }
  const list = e.currentTarget.closest("ul");
  if (!list) return;
  const links = Array.from(list.querySelectorAll<HTMLAnchorElement>("a"));
  if (links.length === 0) return;
  const idx = links.indexOf(e.currentTarget);
  e.preventDefault();
  let next: HTMLAnchorElement;
  // Both axes always work: Right/Down advance, Left/Up go back. The
  // bar is horizontal on mobile and a vertical rail at lg+, and
  // honoring both pairs everywhere beats trying to detect the
  // rendered orientation from inside a key handler.
  if (key === "Home") next = links[0];
  else if (key === "End") next = links[links.length - 1];
  else if (key === "ArrowRight" || key === "ArrowDown")
    next = links[(idx + 1) % links.length];
  else next = links[(idx - 1 + links.length) % links.length];
  next.focus();
}

export function BottomNav() {
  const { t } = useTranslation();
  const keyboardOpen = useVirtualKeyboardOpen();
  // The nav is a plain in-flow footer of the 100dvh app shell
  // (Layout.tsx) — NOT position:fixed. It sits at the bottom of the
  // screen because flexbox puts it there, so there is no viewport
  // metric to drift when iOS mangles the layout viewport around the
  // on-screen keyboard (the cause of the "detached menu floating
  // mid-screen" reports; see useVirtualKeyboard.ts).
  //
  // While the keyboard is up it is removed entirely (layout, a11y
  // tree, tab order): navigation is useless mid-typing, iOS draws the
  // keyboard over the shell's bottom edge anyway, and <main> gains
  // the freed row of space for the form being typed into.
  if (keyboardOpen) return null;
  // At lg+ the shell lays out as a row (Layout.tsx lg:flex-row-reverse)
  // and this same component becomes a slim vertical rail on the LEFT
  // edge: border moves from top to right, the item row becomes a
  // column, and the width is a fixed 5rem so five icon+label cells
  // read as a rail rather than five stretched tabs — the "stretched
  // phone app" half of the desktop-waste pilot report. Same DOM, same
  // five NavLinks, same labels at every width.
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "touch-target flex flex-col items-center justify-center gap-0.5 py-2 text-[0.6875rem] font-medium leading-tight transition-colors sm:text-xs sm:leading-normal lg:py-3",
      isActive
        ? "text-canopy-700 dark:text-canopy-300"
        : "text-moss-600 dark:text-moss-300 hover:text-canopy-700 dark:hover:text-canopy-300",
    ].join(" ");

  return (
    <nav
      aria-label={t("nav.primaryNav")}
      className="z-30 shrink-0 border-t print:hidden
                 border-moss-200 bg-white/95 pb-[env(safe-area-inset-bottom)]
                 backdrop-blur supports-[backdrop-filter]:bg-white/70
                 dark:border-moss-800 dark:bg-moss-950/95
                 lg:flex lg:w-20 lg:flex-col lg:border-r lg:border-t-0 lg:pb-0"
    >
      <ul className="mx-auto flex max-w-screen-md items-stretch justify-around lg:mx-0 lg:max-w-none lg:flex-col lg:justify-start lg:gap-1 lg:pt-4">
        {ITEMS.map((item) => (
          <li key={item.to} className="flex-1 lg:flex-none">
            <NavLink
              to={item.to}
              end={item.to === "/"}
              onKeyDown={handleArrowNav}
              className={linkClass}
            >
              <item.Icon size={22} />
              <span className="text-center break-words">
                {t(item.labelKey)}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
      {/* The desktop rail's pinned Settings slot (PR #399) is gone:
          Settings lives in the global me-menu (AppHeader, top-right)
          on BOTH platforms now, so the rail and the tab bar are the
          same five items everywhere. */}
    </nav>
  );
}
