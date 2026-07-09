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
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/state/AppContext";
import { db } from "@/db/database";
import { isAuthoritativeCancellation } from "@/lib/eventCancellation";
import { InviteQRCode } from "@/components/InviteQRCode";
import { PrintFooter, PrintToolbar } from "@/components/PrintChrome";
import type { EventShiftRow, ShiftSignupRow } from "@/types";

// The work-day sign-in sheet (docs/paper-systems.md P2): how
// volunteer days actually run — a clipboard, not a phone. Each
// shift with its time window, the app-side signup count, and BLANK
// RULED LINES for handwritten names; one QR (to the event page) so
// phone-holders can sign up digitally on the spot. The organizer
// transcribes handwritten names afterward — the sheet is an input
// medium, the app stays the record.
//
// Printing this sheet is a helper act, not an organizer power: the
// shift table it renders is the same one the event page shows every
// member. No per-member names print — handwriting happens on paper,
// in the room, by consent of the hand doing it.

/** Blank lines for a capacity-less shift — a clipboard has to guess
 *  something; the sheet says "and more are welcome" below. */
const UNCAPPED_BLANK_LINES = 8;

/** How many handwriting lines a shift gets. */
export function blankLineCount(
  capacity: number | null,
  signedUp: number,
): number {
  if (capacity === null) return UNCAPPED_BLANK_LINES;
  return Math.max(capacity - signedUp, 0);
}

function formatTime(ms: number, locale: string | undefined): string {
  return new Date(ms).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PrintShiftRosterPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events, eventCancellations } = useApp();
  const { t, i18n } = useTranslation();

  const event = events.find((e) => e.id === eventId) ?? null;
  const cancellation =
    eventCancellations.find((c) => c.eventId === eventId) ?? null;
  const cancelled = isAuthoritativeCancellation(cancellation, event);
  const ended =
    event !== null && (event.endsAt ?? event.startsAt) < Date.now();

  const shifts = useLiveQuery(
    () =>
      eventId
        ? db.eventShifts.where("eventId").equals(eventId).sortBy("startsAt")
        : Promise.resolve([] as EventShiftRow[]),
    [eventId],
    [] as EventShiftRow[],
  );
  const signups = useLiveQuery(
    () => db.shiftSignups.toArray(),
    [],
    [] as ShiftSignupRow[],
  );

  if (!event || cancelled || ended) {
    return (
      <div className="px-4 pb-8 pt-6">
        <PrintToolbar />
        <p className="text-sm text-moss-700 dark:text-moss-200">
          {t(
            !event
              ? "print.flyer.notFound"
              : cancelled
                ? "print.flyer.cancelled"
                : "print.flyer.ended",
          )}
        </p>
      </div>
    );
  }

  const locale = i18n.resolvedLanguage;
  const signupCountByShift = new Map<string, number>();
  for (const s of signups) {
    signupCountByShift.set(
      s.shiftId,
      (signupCountByShift.get(s.shiftId) ?? 0) + 1,
    );
  }

  return (
    <div className="px-4 pb-8 pt-6 print:bg-white print:px-0 print:pb-0 print:pt-0 print:text-black">
      <PrintToolbar />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title print:text-black">{event.title}</h1>
          <p className="mt-1 text-sm font-medium text-moss-700 dark:text-moss-200 print:text-black">
            {t("print.roster.subtitle", {
              date: new Date(event.startsAt).toLocaleDateString(locale),
            })}
            {" · "}
            {event.location}
          </p>
          <p className="mt-2 max-w-prose text-sm text-moss-700 dark:text-moss-200 print:text-black">
            {t("print.roster.instructions")}
          </p>
        </div>
        <div className="shrink-0">
          <InviteQRCode
            value={`${window.location.origin}/events/${event.id}`}
            size={112}
            ariaLabel={t("print.roster.qrAria")}
          />
        </div>
      </div>

      {shifts.length === 0 ? (
        <p className="mt-6 text-sm text-moss-600 dark:text-moss-300 print:text-black">
          {t("print.roster.noShifts")}
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {shifts.map((shift) => {
            const signedUp = signupCountByShift.get(shift.id) ?? 0;
            const lines = blankLineCount(shift.capacity, signedUp);
            return (
              <section key={shift.id} style={{ breakInside: "avoid" }}>
                <h2 className="text-base font-semibold print:text-black">
                  {shift.label}
                  <span className="ml-2 font-normal text-moss-600 dark:text-moss-300 print:text-black">
                    {formatTime(shift.startsAt, locale)} –{" "}
                    {formatTime(shift.endsAt, locale)}
                  </span>
                </h2>
                <p className="mt-0.5 text-xs text-moss-600 dark:text-moss-300 print:text-black">
                  {shift.capacity === null
                    ? t("print.roster.slotsUncapped", { signedUp })
                    : t("print.roster.slots", {
                        signedUp,
                        capacity: shift.capacity,
                      })}
                </p>
                {lines === 0 ? (
                  <p className="mt-2 text-sm text-moss-700 dark:text-moss-200 print:text-black">
                    {t("print.roster.full")}
                  </p>
                ) : (
                  <ol className="mt-2">
                    {Array.from({ length: lines }, (_, i) => (
                      <li
                        key={i}
                        className="flex h-9 items-end gap-2 border-b border-moss-300 text-xs text-moss-600 dark:border-moss-700 dark:text-moss-300 print:border-black/40 print:text-black/60"
                      >
                        {i + 1}.
                      </li>
                    ))}
                  </ol>
                )}
                {shift.capacity === null && lines > 0 && (
                  <p className="mt-1 text-xs text-moss-600 dark:text-moss-300 print:text-black">
                    {t("print.roster.andMore")}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}

      <PrintFooter />
    </div>
  );
}
