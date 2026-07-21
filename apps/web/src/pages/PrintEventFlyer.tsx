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
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/state/AppContext";
import { db } from "@/db/database";
import { shareOrigin } from "@/lib/appOrigin";
import { isAuthoritativeCancellation } from "@/lib/eventCancellation";
import { InviteQRCode } from "@/components/InviteQRCode";
import { PrintFooter, PrintToolbar } from "@/components/PrintChrome";

// The event flyer (docs/paper-systems.md P1): the invite poster's
// shape applied to a gathering — title, when, where, the plain-text
// description, and a QR to the event's canonical URL. Tape it to
// the community-center door.
//
// Verify-before-render, like the poster's expired-invite refusal:
// a flyer for a cancelled or already-ended gathering misdirects
// people, which is worse than no paper at all.

// Render an epoch-ms timestamp as "<date> · <time>" in the active
// locale — the same shape EventDetail uses (local clock, no zone).
function formatDateTime(ms: number, locale: string | undefined): string {
  const date = new Date(ms);
  return `${date.toLocaleDateString(locale)} · ${date.toLocaleTimeString(
    locale,
    { hour: "numeric", minute: "2-digit" },
  )}`;
}

export default function PrintEventFlyerPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events, eventCancellations } = useApp();
  const { t, i18n } = useTranslation();

  const event = events.find((e) => e.id === eventId) ?? null;
  const cancellation =
    eventCancellations.find((c) => c.eventId === eventId) ?? null;
  const cancelled = isAuthoritativeCancellation(cancellation, event);
  const ended =
    event !== null && (event.endsAt ?? event.startsAt) < Date.now();

  // Screen-only companion link: the sign-in sheet, offered when the
  // gathering actually has shifts.
  const shiftCount = useLiveQuery(
    () =>
      eventId
        ? db.eventShifts.where("eventId").equals(eventId).count()
        : Promise.resolve(0),
    [eventId],
    0,
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

  const eventUrl = `${shareOrigin()}/events/${event.id}`;
  const shareHost = new URL(shareOrigin()).host;
  const locale = i18n.resolvedLanguage;

  return (
    <div className="px-4 pb-8 pt-6 print:bg-white print:px-0 print:pb-0 print:pt-0 print:text-black">
      <div className="flex flex-wrap items-center gap-x-4 print:hidden">
        <PrintToolbar />
        {shiftCount > 0 && (
          <Link
            to={`/print/event/${event.id}/roster`}
            className="mb-4 text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("print.flyer.rosterLink")} →
          </Link>
        )}
      </div>

      <div className="mx-auto max-w-xl text-center">
        <h1 className="page-title print:text-black">{event.title}</h1>
        <p className="mt-1 text-sm font-medium text-moss-700 dark:text-moss-200 print:text-black">
          {shareHost}
        </p>

        <dl className="mx-auto mt-4 max-w-md text-sm text-moss-700 dark:text-moss-200 print:text-black">
          <div className="flex items-baseline justify-center gap-2">
            <dt className="font-semibold">
              {t("events.detail.startsAtLabel")}:
            </dt>
            <dd>
              {formatDateTime(event.startsAt, locale)}
              {event.endsAt !== null &&
                ` — ${formatDateTime(event.endsAt, locale)}`}
            </dd>
          </div>
          <div className="mt-1 flex items-baseline justify-center gap-2">
            <dt className="font-semibold">
              {t("events.detail.locationLabel")}:
            </dt>
            <dd>{event.location}</dd>
          </div>
        </dl>

        {event.description && (
          <p className="mx-auto mt-4 max-w-md whitespace-pre-wrap text-sm text-moss-700 dark:text-moss-200 print:text-black">
            {event.description}
          </p>
        )}

        <div className="mt-6 flex justify-center">
          <InviteQRCode
            value={eventUrl}
            size={280}
            ariaLabel={t("print.flyer.qrAria")}
          />
        </div>

        <p className="mx-auto mt-4 max-w-md text-sm text-moss-700 dark:text-moss-200 print:text-black">
          {t("print.flyer.rsvp", { host: shareHost })}
        </p>

        <PrintFooter />
      </div>
    </div>
  );
}
