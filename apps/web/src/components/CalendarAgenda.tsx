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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { groupByDay, type CalendarEntry } from "@/lib/calendar";
import { PROJECT_CATEGORY_META, CATEGORY_META } from "@/lib/categories";
import { WhyTooltip } from "@/components/WhyTooltip";

// Agenda view: chronological list grouped by UTC day, sticky day
// headers, calm density rendering. See docs/calendar.md §6.
// Empty days are skipped — only days with at least one entry render.
// Day headers format in the member's locale via Intl.DateTimeFormat.

interface CalendarAgendaProps {
  entries: readonly CalendarEntry[];
  locale: string;
}

export function CalendarAgenda({ entries, locale }: CalendarAgendaProps) {
  const { t } = useTranslation();

  const days = useMemo(() => {
    const grouped = groupByDay(entries);
    return Array.from(grouped.entries()).map(([key, list]) => ({
      key,
      // All entries in a bucket share the same UTC day, so the first
      // one's date is enough to format the day header.
      ms: list[0].date,
      entries: list,
    }));
  }, [entries]);

  const dayFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [locale],
  );

  return (
    <div className="flex flex-col gap-stack-md">
      {days.map((day) => (
        <section key={day.key} aria-labelledby={`calendar-agenda-${day.key}`}>
          <h3
            id={`calendar-agenda-${day.key}`}
            className="sticky top-0 z-10 -mx-1 bg-white/95 px-1 py-1
                       text-sm font-semibold text-bark-800 backdrop-blur
                       supports-[backdrop-filter]:bg-white/70
                       dark:bg-moss-950/95 dark:text-moss-100"
          >
            {dayFmt.format(new Date(day.ms))}
          </h3>
          <ul className="mt-1 flex flex-col gap-1">
            {day.entries.map((e) => (
              <li key={e.id}>
                <AgendaEntry entry={e} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {/* Density footer tooltip — only renders if at least one density
          entry is in the agenda. Per design doc §8.2, this is mounted
          once at the bottom of the agenda view, not on each row. */}
      {entries.some((e) => e.kind === "exchange_density") ? (
        <p className="mt-2 text-xs text-moss-500 dark:text-moss-400">
          {t("calendar.density.tooltipBody")}
          <WhyTooltip principleId="no-leaderboards" />
        </p>
      ) : null}
    </div>
  );
}

function AgendaEntry({ entry }: { entry: CalendarEntry }) {
  const { t } = useTranslation();
  if (entry.kind === "exchange_density") {
    return (
      <p className="text-sm text-moss-600 dark:text-moss-300">
        {t("calendar.density.line", { count: entry.count })}
      </p>
    );
  }
  if (entry.kind === "project_deadline") {
    const meta = PROJECT_CATEGORY_META[entry.category];
    return (
      <Link
        to={`/project/${entry.projectId}`}
        className="group flex items-center gap-2 rounded-xl px-2 py-1.5
                   hover:bg-moss-50 dark:hover:bg-moss-900"
      >
        <span
          className={`inline-block h-3 w-3 rounded-full ${meta.barColorClass}`}
          aria-hidden="true"
        />
        <span className="text-sm text-bark-800 group-hover:text-canopy-700 dark:text-moss-100 dark:group-hover:text-canopy-300">
          {t("calendar.entry.projectDeadline", { title: entry.projectTitle })}
        </span>
      </Link>
    );
  }
  // post_expiring
  const meta = CATEGORY_META[entry.category];
  const label =
    entry.postType === "NEED"
      ? t("calendar.entry.postExpiringNeed", { title: entry.postTitle })
      : t("calendar.entry.postExpiringOffer", { title: entry.postTitle });
  return (
    <Link
      to={`/post/${entry.postId}`}
      className="group flex items-center gap-2 rounded-xl px-2 py-1.5
                 hover:bg-moss-50 dark:hover:bg-moss-900"
    >
      <span
        className={`inline-block h-3 w-3 rounded-full ${meta.barColorClass}`}
        aria-hidden="true"
      />
      <span className="text-sm text-bark-800 group-hover:text-canopy-700 dark:text-moss-100 dark:group-hover:text-canopy-300">
        {label}
      </span>
    </Link>
  );
}
