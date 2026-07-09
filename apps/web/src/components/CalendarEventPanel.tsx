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
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DockedPanel } from "@/components/DockedPanel";
import EventDetailPage from "@/pages/EventDetail";

// The calendar's docked event panel (the /calendar/event/:eventId
// nested route). The frame — dock-at-lg / full-screen-below, focus
// on open/swap, Escape + close button — lives in DockedPanel; this
// wrapper binds it to the calendar. The content is the REAL
// EventDetailPage, not a summary — same RSVP buttons, shifts, menus,
// and share links (which keep the canonical /events/:id URL). One
// component, two frames.
export function CalendarEventPanel() {
  const { eventId } = useParams<{ eventId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const close = useCallback(() => navigate("/calendar"), [navigate]);

  return (
    <DockedPanel
      ariaLabel={t("calendar.panel.ariaLabel")}
      closeLabel={t("calendar.panel.close")}
      closeShortLabel={t("calendar.panel.closeShort")}
      onClose={close}
      swapKey={eventId}
    >
      <EventDetailPage />
    </DockedPanel>
  );
}
