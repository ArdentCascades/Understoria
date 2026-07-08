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
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EventDetailPage from "@/pages/EventDetail";

// The calendar's docked event panel (the /calendar/event/:eventId
// nested route). At lg+ it renders as a side column NEXT TO the
// month/agenda/week view — the calendar stays mounted (and its
// month + filter state alive) while the member reads, RSVPs, or
// signs up for shifts; clicking another event simply swaps the
// panel's contents. Below lg it takes the whole viewport, which
// reads exactly like the standalone event page — small screens
// never see half a calendar behind a half panel.
//
// It is a DOCKED PANEL, not a modal: no backdrop, no focus trap,
// the calendar behind stays fully interactive (that's the point).
// The panel takes focus on open/swap so keyboard and screen-reader
// users land in what they asked for, and Escape (from anywhere
// inside the panel) or the close button returns to /calendar.
//
// The content is the REAL EventDetailPage, not a summary — same
// RSVP buttons, shifts, menus, and share links (which keep the
// canonical /events/:id URL). One component, two frames.
export function CalendarEventPanel() {
  const { eventId } = useParams<{ eventId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLElement | null>(null);

  // Focus the panel when it opens and when the member swaps to a
  // different event from the calendar behind it.
  useEffect(() => {
    panelRef.current?.focus();
  }, [eventId]);

  // Escape closes the panel from anywhere on the page (document
  // level rather than an aside key handler - jsx-a11y forbids key
  // listeners on non-interactive elements, and a member who has
  // clicked back into the calendar should still be able to dismiss).
  // Guarded so Escape inside a form field (e.g. the shifts editor)
  // only does what the field wants, never a surprise close.
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
      navigate("/calendar");
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  return (
    <aside
      ref={panelRef}
      tabIndex={-1}
      aria-label={t("calendar.panel.ariaLabel")}
      className="fixed inset-0 z-40 overflow-y-auto bg-white dark:bg-moss-950
                 lg:motion-safe:animate-slide-in
                 lg:static lg:z-auto lg:inset-auto lg:w-[26rem] xl:w-[30rem]
                 lg:shrink-0 lg:self-start lg:sticky lg:top-4
                 lg:max-h-[calc(100dvh-7rem)] lg:rounded-2xl
                 lg:border lg:border-moss-200 lg:bg-white lg:shadow-leaf
                 lg:dark:border-moss-800 lg:dark:bg-moss-950"
    >
      <div className="flex justify-end px-4 pt-3 lg:pb-0">
        <button
          type="button"
          className="touch-target inline-flex items-center justify-center rounded-full px-2 text-moss-600 hover:bg-moss-100 hover:text-canopy-700 dark:text-moss-300 dark:hover:bg-moss-800 dark:hover:text-canopy-300"
          onClick={() => navigate("/calendar")}
          aria-label={t("calendar.panel.close")}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
          <span className="ml-1 text-sm">{t("calendar.panel.closeShort")}</span>
        </button>
      </div>
      <EventDetailPage />
    </aside>
  );
}
