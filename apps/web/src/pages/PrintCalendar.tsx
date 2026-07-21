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
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { shareOrigin } from "@/lib/appOrigin";
import { InviteQRCode } from "@/components/InviteQRCode";
import { PrintFooter, PrintToolbar } from "@/components/PrintChrome";
import type { Event } from "@/types";

// The fridge calendar (paper-systems P3): a sheet of upcoming
// gatherings for the community fridge / lobby corkboard —
// date-grouped rows with a small QR each. The board sheet's sibling
// for time instead of needs.

/** How far ahead the sheet looks. Six weeks: far enough to be worth
 *  taping up, near enough that most of it will still be true. */
export const CALENDAR_WINDOW_MS = 42 * 24 * 60 * 60 * 1000;

/** Row cap — a fridge sheet is one page. The cap is never silent:
 *  the sheet prints "+N more in the app" when it bites. */
export const CALENDAR_ROW_CAP = 30;

export interface UpcomingSelection {
  events: Event[];
  /** How many upcoming events the cap cut. */
  overflow: number;
}

/** Upcoming, non-cancelled, soonest-first, capped. Exported for the
 *  test lock. */
export function selectUpcoming(input: {
  events: Event[];
  cancelledEventIds: Set<string>;
  now: number;
}): UpcomingSelection {
  const upcoming = input.events
    .filter(
      (e) =>
        !input.cancelledEventIds.has(e.id) &&
        (e.endsAt ?? e.startsAt) >= input.now &&
        e.startsAt <= input.now + CALENDAR_WINDOW_MS,
    )
    .sort((a, b) => a.startsAt - b.startsAt);
  return {
    events: upcoming.slice(0, CALENDAR_ROW_CAP),
    overflow: Math.max(upcoming.length - CALENDAR_ROW_CAP, 0),
  };
}

export default function PrintCalendarPage() {
  const { events, eventCancellations } = useApp();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage;

  const { events: upcoming, overflow } = useMemo(
    () =>
      selectUpcoming({
        events,
        cancelledEventIds: new Set(eventCancellations.map((c) => c.eventId)),
        now: Date.now(),
      }),
    [events, eventCancellations],
  );

  // Group by day, preserving the soonest-first order.
  const byDay = useMemo(() => {
    const groups: { day: string; rows: Event[] }[] = [];
    for (const ev of upcoming) {
      const day = new Date(ev.startsAt).toLocaleDateString(locale, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      const last = groups[groups.length - 1];
      if (last && last.day === day) last.rows.push(ev);
      else groups.push({ day, rows: [ev] });
    }
    return groups;
  }, [upcoming, locale]);

  return (
    <div className="px-4 pb-8 pt-6 print:bg-white print:px-0 print:pb-0 print:pt-0 print:text-black">
      <PrintToolbar />

      <h1 className="page-title print:text-black">
        {t("print.calendar.title")}
      </h1>
      <p className="mt-1 text-sm font-medium text-moss-700 dark:text-moss-200 print:text-black">
        {new URL(shareOrigin()).host}
      </p>

      {upcoming.length === 0 ? (
        <p className="mt-6 text-sm text-moss-600 dark:text-moss-300 print:text-black">
          {t("print.calendar.empty")}
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {byDay.map((group) => (
            <section key={group.day} style={{ breakInside: "avoid" }}>
              <h2 className="border-b border-moss-300 pb-1 text-sm font-semibold uppercase tracking-wide text-moss-700 dark:border-moss-700 dark:text-moss-200 print:border-black/30 print:text-black">
                {group.day}
              </h2>
              <ul className="mt-1 flex flex-col">
                {group.rows.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-center justify-between gap-4 py-2"
                    style={{ breakInside: "avoid" }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold print:text-black">
                        {new Date(ev.startsAt).toLocaleTimeString(locale, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {" · "}
                        {ev.title}
                      </p>
                      <p className="mt-0.5 text-xs text-moss-600 dark:text-moss-300 print:text-black">
                        {ev.location}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <InviteQRCode
                        value={`${shareOrigin()}/events/${ev.id}`}
                        size={64}
                        ariaLabel={t("print.calendar.qrAria", {
                          title: ev.title,
                        })}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {overflow > 0 && (
            <p className="text-sm text-moss-600 dark:text-moss-300 print:text-black">
              {t("print.calendar.more", { count: overflow })}
            </p>
          )}
        </div>
      )}

      <PrintFooter />
    </div>
  );
}
