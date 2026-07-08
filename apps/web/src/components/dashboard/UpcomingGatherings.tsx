/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { selectUpcomingGatherings } from "@/lib/upcomingEvents";
import { eventCategoryMeta } from "@/lib/categories";
import { formatRelativeTime } from "@/lib/format";

// "Coming up" — a calm Dashboard glance at the next few community events.
// Discovery surface, not a leaderboard: no attendance counts, just the
// soonest events with their category emoji and the viewer's own quiet
// "going" check. Hidden entirely when nothing is upcoming.
export function UpcomingGatherings() {
  const { t } = useTranslation();
  const { events, eventCancellations, eventRsvps, currentMember } = useApp();

  const gatherings = useMemo(
    () =>
      selectUpcomingGatherings({
        events,
        eventCancellations,
        eventRsvps,
        currentMemberKey: currentMember?.publicKey ?? null,
        now: Date.now(),
        limit: 4,
      }),
    [events, eventCancellations, eventRsvps, currentMember],
  );

  if (gatherings.length === 0) return null;

  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("dashboard.gatherings.title")}
      </h2>
      <ul className="flex flex-col gap-0.5">
        {gatherings.map(({ event, viewerGoing }) => {
          const meta = eventCategoryMeta(event.category);
          return (
            <li key={event.id}>
              <Link
                to={`/events/${event.id}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-moss-50 dark:hover:bg-moss-900"
              >
                <span aria-hidden="true">{meta.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {event.title}
                </span>
                {viewerGoing ? (
                  <>
                    <span className="sr-only">
                      {t("dashboard.gatherings.going")}
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-semibold text-canopy-600 dark:text-canopy-300"
                    >
                      ✓
                    </span>
                  </>
                ) : null}
                <span className="whitespace-nowrap text-xs text-moss-600 dark:text-moss-300">
                  {formatRelativeTime(event.startsAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
