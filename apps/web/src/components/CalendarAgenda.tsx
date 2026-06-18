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
import {
  entryIsPast,
  getTodayDayKey,
  groupByDay,
  postEntryDisplay,
  startOfTodayMs,
  type CalendarEntry,
} from "@/lib/calendar";
import {
  PROJECT_CATEGORY_META,
  CATEGORY_META,
  eventCategoryMeta,
} from "@/lib/categories";
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

  // Agenda is forward-looking: past date-bound entries (events whose
  // end has rolled past, project deadlines and post expiries before
  // today) drop out before grouping. Exchange density rows are an
  // aggregate community signal and are NEVER filtered, regardless of
  // age. Month and week views keep showing past days (intrinsic to
  // the grid) — the filter lives here only. See entryIsPast in
  // lib/calendar.ts for the rule.
  //
  // The filter runs per-entry, NOT per-day: a day with both a past
  // morning event and a future evening event renders only the
  // evening one. groupByDay is called against the filtered list so
  // empty days (all past) drop out naturally.
  const visibleEntries = useMemo(() => {
    const todayStart = startOfTodayMs(Date.now());
    return entries.filter((e) => !entryIsPast(e, todayStart));
  }, [entries]);

  // Today's UTC day key, computed once per render. UTC-day bucketing
  // (see lib/calendar.ts) means members far from UTC may see the
  // highlight shift by one day near local midnight — same trade-off
  // as the rest of the calendar; out of scope to migrate here.
  const todayKey = getTodayDayKey();

  const days = useMemo(() => {
    const grouped = groupByDay(visibleEntries);
    return Array.from(grouped.entries()).map(([key, list]) => ({
      key,
      // All entries in a bucket share the same UTC day, so the first
      // one's date is enough to format the day header.
      ms: list[0].date,
      entries: list,
    }));
  }, [visibleEntries]);

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
      {days.map((day) => {
        const isToday = day.key === todayKey;
        return (
        <section
          key={day.key}
          aria-labelledby={`calendar-agenda-${day.key}`}
          aria-current={isToday ? "date" : undefined}
        >
          <h3
            id={`calendar-agenda-${day.key}`}
            className={
              isToday
                ? `sticky top-0 z-10 -mx-1 bg-white/95 px-1 py-1
                       text-sm font-semibold text-canopy-700 backdrop-blur
                       supports-[backdrop-filter]:bg-white/70
                       dark:bg-moss-950/95 dark:text-canopy-300`
                : `sticky top-0 z-10 -mx-1 bg-white/95 px-1 py-1
                       text-sm font-semibold text-bark-800 backdrop-blur
                       supports-[backdrop-filter]:bg-white/70
                       dark:bg-moss-950/95 dark:text-moss-100`
            }
          >
            {isToday
              ? `${t("calendar.todayLabel")} · ${dayFmt.format(new Date(day.ms))}`
              : dayFmt.format(new Date(day.ms))}
          </h3>
          <ul className="mt-1 flex flex-col gap-1">
            {day.entries.map((e) => (
              <li key={e.id}>
                <AgendaEntry entry={e} />
              </li>
            ))}
          </ul>
        </section>
        );
      })}
      {/* Density footer tooltip — only renders if at least one density
          entry is in the agenda. Per design doc §8.2, this is mounted
          once at the bottom of the agenda view, not on each row. */}
      {visibleEntries.some((e) => e.kind === "exchange_density") ? (
        <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
          {t("calendar.density.tooltipBody")}
          <WhyTooltip principleId="no-leaderboards" />
        </p>
      ) : null}
    </div>
  );
}

function AgendaEntry({ entry }: { entry: CalendarEntry }) {
  const { t, i18n } = useTranslation();
  if (entry.kind === "exchange_density") {
    return (
      <p className="text-sm text-moss-600 dark:text-moss-300">
        {t("calendar.density.line", { count: entry.count })}
      </p>
    );
  }
  if (entry.kind === "event") {
    // Events colour their dot by category (like project deadlines / post
    // expiries) and carry a leading category emoji — the always-present
    // glyph that keeps an event distinct from a same-coloured project or
    // post chip. aria-label names the kind for screen readers; an unknown
    // peer category falls back to a neutral glyph/colour, never crashes.
    const meta = eventCategoryMeta(entry.category);
    const timeFmt = new Intl.DateTimeFormat(i18n.language, {
      hour: "numeric",
      minute: "2-digit",
    });
    // Day position within the event's UTC-day span. A multi-day event
    // emits one entry per day; first day reads like a single-day event,
    // middle days announce the continuation, the final day reads the
    // end time. dayIndex / dayCount carry the TRUE span position even
    // when the window clips the leading days.
    const isContinuation = entry.isMultiDay && entry.dayIndex > 0;
    const isLastDay =
      entry.isMultiDay && entry.dayIndex === entry.dayCount - 1;
    // Multi-day entries get a day-aware aria-label so a screen reader
    // hears "day 2 of 4" / "final day"; single-day entries keep the
    // plain kind label.
    let ariaLabel: string;
    if (entry.isMultiDay) {
      if (isLastDay) {
        ariaLabel = entry.viewerGoing
          ? t("events.calendar.multiDay.ariaLabelGoingFinal")
          : t("events.calendar.multiDay.ariaLabelFinal");
      } else {
        ariaLabel = entry.viewerGoing
          ? t("events.calendar.multiDay.ariaLabelGoing", {
              index: entry.dayIndex + 1,
              count: entry.dayCount,
            })
          : t("events.calendar.multiDay.ariaLabel", {
              index: entry.dayIndex + 1,
              count: entry.dayCount,
            });
      }
    } else {
      ariaLabel = entry.viewerGoing
        ? t("events.calendar.entryKindLabelGoing")
        : t("events.calendar.entryKindLabel");
    }
    return (
      <Link
        to={entry.path}
        aria-label={ariaLabel}
        className="group flex items-center gap-2 rounded-xl px-2 py-1.5
                   hover:bg-moss-50 dark:hover:bg-moss-900"
      >
        <span
          className={`inline-block h-3 w-3 rounded-full ${meta.barColorClass}`}
          aria-hidden="true"
        />
        <span className="text-sm text-bark-800 group-hover:text-canopy-700 dark:text-moss-100 dark:group-hover:text-canopy-300">
          <span aria-hidden="true" className="mr-1">
            {meta.emoji}
          </span>
          {isLastDay && entry.endsAt !== null ? (
            // Final day of a multi-day span — show the end time, not the
            // (now-passed) start time. endsAt is non-null here because a
            // null-end event is never multi-day.
            t("events.calendar.multiDay.endsAtLine", {
              time: timeFmt.format(new Date(entry.endsAt)),
              title: entry.title,
            })
          ) : isContinuation ? (
            // A middle day — the start time belongs to day 1, so suppress
            // it and announce the continuation + day-of-N instead.
            <>
              {t("events.calendar.multiDay.continues")} ·{" "}
              {t("events.calendar.multiDay.dayOf", {
                index: entry.dayIndex + 1,
                count: entry.dayCount,
              })}{" "}
              — {entry.title}
            </>
          ) : (
            // First day (or single-day) — unchanged start-time line.
            <>
              {timeFmt.format(new Date(entry.startsAt))} — {entry.title}
            </>
          )}
          {entry.location ? (
            <span className="text-moss-600 dark:text-moss-300">
              {" "}
              · {entry.location}
            </span>
          ) : null}
          {/* The viewer's own "going" — own data only, no count. */}
          {entry.viewerGoing ? (
            <span
              aria-hidden="true"
              className="ml-1.5 font-semibold text-canopy-600 dark:text-canopy-300"
            >
              ✓
            </span>
          ) : null}
        </span>
      </Link>
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
  const { glyph, labelKey } = postEntryDisplay(entry.postType);
  const label = t(labelKey, { title: entry.postTitle });
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
        <span aria-hidden="true" className="mr-1">{glyph}</span>
        {label}
      </span>
    </Link>
  );
}
