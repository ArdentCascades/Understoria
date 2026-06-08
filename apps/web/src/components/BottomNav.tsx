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

// Going from 4 to 5 tabs (see docs/calendar.md §8.1). At 320px (iPhone
// SE), five 44px touch targets fit horizontally — `touch-target` keeps
// the floor — but the text label crowds out. So labels collapse to
// icon-only below `sm` (640px) and reappear at small phones and up.
// Each item is still labelled for screen readers via the `<span>`,
// which is `sr-only` at the smallest viewports so the accessible name
// of the link is preserved.
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
      className="sticky bottom-0 z-30 border-t border-moss-200 bg-white/95
                 backdrop-blur supports-[backdrop-filter]:bg-white/70
                 dark:border-moss-800 dark:bg-moss-950/95"
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
                  "touch-target flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-canopy-700 dark:text-canopy-300"
                    : "text-moss-600 dark:text-moss-400 hover:text-canopy-700 dark:hover:text-canopy-300",
                ].join(" ")
              }
            >
              <item.Icon size={22} />
              <span className="sr-only sm:not-sr-only">
                {t(item.labelKey)}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
