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
  IconProfile,
  type IconProps,
} from "@/components/visual";

interface NavItem {
  to: string;
  labelKey:
    | "nav.board"
    | "nav.calendar"
    | "nav.dashboard"
    | "nav.messages"
    | "nav.profile";
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
  { to: "/profile", labelKey: "nav.profile", Icon: IconProfile },
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
  if (key === "Home") next = links[0];
  else if (key === "End") next = links[links.length - 1];
  else if (key === "ArrowRight") next = links[(idx + 1) % links.length];
  else next = links[(idx - 1 + links.length) % links.length];
  next.focus();
}

export function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("nav.primaryNav")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-moss-200
                 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur
                 supports-[backdrop-filter]:bg-white/70
                 dark:border-moss-800 dark:bg-moss-950/95
                 lg:sticky lg:pb-0"
    >
      <ul className="mx-auto flex max-w-screen-md items-stretch justify-around lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-[1440px]">
        {ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === "/"}
              onKeyDown={handleArrowNav}
              className={({ isActive }) =>
                [
                  "touch-target flex flex-col items-center justify-center gap-0.5 py-2 text-[0.6875rem] font-medium leading-tight transition-colors sm:text-xs sm:leading-normal",
                  isActive
                    ? "text-canopy-700 dark:text-canopy-300"
                    : "text-moss-600 dark:text-moss-400 hover:text-canopy-700 dark:hover:text-canopy-300",
                ].join(" ")
              }
            >
              <item.Icon size={22} />
              <span className="text-center break-words">
                {t(item.labelKey)}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
