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
  WEEK_MS,
  dayKey,
  getTodayDayKey,
  postEntryDisplay,
  type CalendarEntry,
} from "@/lib/calendar";
import {
  CATEGORY_META,
  PROJECT_CATEGORY_META,
  eventCategoryMeta,
} from "@/lib/categories";
import { WhyTooltip } from "@/components/WhyTooltip";

// Week view of the currently-selected week. Header shows the week's
// date range (year included whenever the viewed week leaves the
// current year) and Prev/Next buttons step a week at a time; a quiet
// "Today" pill jumps back when paged away (mirrors CalendarMonth).
// The PAGE owns the paging offset (it must widen the entries window
// to cover the viewed week — see `Calendar.tsx`), so this component
// receives the resolved Sunday anchor plus prev/next/today callbacks,
// and paging is clamped to the page's bounds (buttons disable at the
// edges rather than walking into permanently empty grids).
//
// Unlike the month grid's title-only chips, week chips lead with the
// event's start time — a week is the horizon members actually plan
// around, so WHEN in the day matters here (deadline / expiry chips
// stay time-less: they're day-granular by nature). Two layouts from
// the same day buckets:
//   - lg+: the 7-column grid (chips + density dot per cell);
//   - below lg: seven stacked day rows — a 7-column grid at phone
//     widths left ~45px per day and truncated every chip to one
//     letter, so the narrow layout reads down, not across.
// A week with nothing scheduled says so under the grid instead of
// rendering silent blank cells, and offers a jump to the next
// scheduled thing inside the loaded window when there is one.

type ChipEntry = Extract<
  CalendarEntry,
  { kind: "project_deadline" | "post_expiring" | "event" }
>;

interface CalendarWeekProps {
  entries: readonly CalendarEntry[];
  /** Sunday-anchored (midnight UTC) ms of the week to render. The
   *  page passes `startOfUTCWeek(now) + weekOffset * WEEK_MS`. */
  anchorMs: number;
  locale: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  /** Resets the paging offset to 0 (the week containing "now"). */
  onJumpToToday: () => void;
  /** Pages to the week containing this ms-epoch (clamped by the
   *  page). Drives the quiet-week "next up" jump. */
  onJumpToDate: (ms: number) => void;
  /** False at the paging bounds — the matching button disables. */
  canPrev: boolean;
  canNext: boolean;
  /** True when the rendered week contains "now"; the header swaps
   *  between a quiet "This week" tag and a "Today" jump on this. */
  atToday: boolean;
}

export function CalendarWeek({
  entries,
  anchorMs,
  locale,
  onPrevWeek,
  onNextWeek,
  onJumpToToday,
  onJumpToDate,
  canPrev,
  canNext,
  atToday,
}: CalendarWeekProps) {
  const { t } = useTranslation();

  // Today's UTC day key, computed once per render. UTC-day bucketing
  // (see lib/calendar.ts) means members far from UTC may see the
  // highlight shift by one day near local midnight — same trade-off
  // as the rest of the calendar; out of scope to migrate here.
  const todayKey = getTodayDayKey();

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const e of entries) {
      const key = dayKey(e.date);
      const bucket = map.get(key);
      if (bucket) bucket.push(e);
      else map.set(key, [e]);
    }
    return map;
  }, [entries]);

  const days = useMemo(() => {
    const out: Array<{
      ms: number;
      key: string;
      chips: ChipEntry[];
      densityCount: number | null;
      isWeekend: boolean;
    }> = [];
    for (let i = 0; i < 7; i++) {
      const ms = anchorMs + i * 86400000;
      const key = dayKey(ms);
      const list = byDay.get(key) ?? [];
      const density = list.find((e) => e.kind === "exchange_density") as
        | Extract<CalendarEntry, { kind: "exchange_density" }>
        | undefined;
      out.push({
        ms,
        key,
        chips: list.filter(
          (e): e is ChipEntry =>
            e.kind === "project_deadline" ||
            e.kind === "post_expiring" ||
            e.kind === "event",
        ),
        densityCount: density ? density.count : null,
        isWeekend: i === 0 || i === 6,
      });
    }
    return out;
  }, [anchorMs, byDay]);

  // The range label carries the year whenever the viewed week touches
  // a year other than the current one — "Dec 28 – Jan 3" is ambiguous
  // once you've paged away from now.
  const currentYear = new Date().getUTCFullYear();
  const needsYear =
    new Date(days[0].ms).getUTCFullYear() !== currentYear ||
    new Date(days[6].ms).getUTCFullYear() !== currentYear;
  const rangeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        ...(needsYear ? { year: "numeric" } : {}),
      }),
    [locale, needsYear],
  );

  const headerFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
      }),
    [locale],
  );

  // Mobile day-row headers have room for the full weekday name.
  const rowFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    [locale],
  );

  const rangeLabel = t("calendar.weekNav.range", {
    start: rangeFmt.format(new Date(days[0].ms)),
    end: rangeFmt.format(new Date(days[6].ms)),
  });

  // Quiet week: no deadlines, expiries, or events on any of the 7
  // days (density alone isn't "scheduled" — it's history). Instead of
  // silent blank cells, say so, and offer the next scheduled thing in
  // the loaded window as a one-tap jump forward.
  const weekIsQuiet = days.every((d) => d.chips.length === 0);
  const nextUp = useMemo(() => {
    if (!weekIsQuiet) return null;
    const weekEnd = anchorMs + WEEK_MS;
    let best: ChipEntry | null = null;
    for (const e of entries) {
      if (
        (e.kind === "project_deadline" ||
          e.kind === "post_expiring" ||
          e.kind === "event") &&
        e.date >= weekEnd &&
        (best === null || e.date < best.date)
      ) {
        best = e;
      }
    }
    return best;
  }, [weekIsQuiet, entries, anchorMs]);
  const nextUpFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        ...(nextUp && new Date(nextUp.date).getUTCFullYear() !== currentYear
          ? { year: "numeric" }
          : {}),
      }),
    [locale, nextUp, currentYear],
  );

  const chipTitleOf = (e: ChipEntry): string =>
    e.kind === "event"
      ? e.title
      : e.kind === "project_deadline"
        ? e.projectTitle
        : e.postTitle;

  return (
    <div className="flex flex-col gap-stack-sm">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevWeek}
          disabled={!canPrev}
          aria-disabled={!canPrev}
          aria-label={t("calendar.weekNav.prev")}
          className="btn-ghost px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          ‹ {t("calendar.weekNav.prev")}
        </button>
        <span className="flex items-center gap-2">
          <p
            aria-live="polite"
            className="text-sm font-semibold text-bark-800 dark:text-moss-100"
          >
            {rangeLabel}
          </p>
          {atToday ? (
            <span className="rounded-full bg-canopy-50 px-2 py-0.5 text-xs text-canopy-700 dark:bg-canopy-950 dark:text-canopy-300">
              {t("calendar.weekNav.thisWeek")}
            </span>
          ) : (
            <button
              type="button"
              onClick={onJumpToToday}
              className="rounded-full bg-moss-100 px-2 py-0.5 text-xs text-moss-700
                         hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200
                         dark:hover:bg-moss-700"
            >
              {t("calendar.weekNav.today")}
            </button>
          )}
        </span>
        <button
          type="button"
          onClick={onNextWeek}
          disabled={!canNext}
          aria-disabled={!canNext}
          aria-label={t("calendar.weekNav.next")}
          className="btn-ghost px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("calendar.weekNav.next")} ›
        </button>
      </div>

      {/* lg+: the 7-column grid. display:none below lg (so the
          stacked layout below is the only one screen readers see on
          narrow viewports, and vice versa). */}
      <div
        className="hidden grid-cols-7 gap-px overflow-hidden rounded-xl
                   border border-moss-200 bg-moss-200
                   dark:border-moss-800 dark:bg-moss-800 lg:grid"
      >
        {days.map((day) => {
          const isToday = day.key === todayKey;
          return (
            <div
              key={day.key}
              aria-current={isToday ? "date" : undefined}
              className={
                isToday
                  ? `bg-canopy-50 px-2 py-1 text-center text-[11px]
                       font-semibold text-canopy-700 dark:bg-canopy-950 dark:text-canopy-300`
                  : `bg-moss-50 px-2 py-1 text-center text-[11px]
                       font-medium text-moss-600 dark:bg-moss-900 dark:text-moss-300`
              }
            >
              {headerFmt.format(new Date(day.ms))}
            </div>
          );
        })}
        {days.map((day) => {
          const isToday = day.key === todayKey;
          return (
            <div
              key={`cell-${day.key}`}
              aria-current={isToday ? "date" : undefined}
              className={
                isToday
                  ? "min-h-[120px] bg-canopy-50 p-1 text-canopy-700 dark:bg-canopy-950 dark:text-canopy-300"
                  : day.isWeekend
                    ? "min-h-[120px] bg-moss-50/60 p-1 dark:bg-moss-900/30"
                    : "min-h-[120px] bg-white p-1 dark:bg-moss-950"
              }
            >
              {day.densityCount !== null ? (
                <div className="mb-1 flex justify-end">
                  <DensityDot count={day.densityCount} />
                </div>
              ) : null}
              <ul className="flex flex-col gap-0.5">
                {day.chips.map((e) => (
                  <li key={e.id}>
                    <WeekChip entry={e} locale={locale} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Below lg: the same week as seven stacked day rows — full
          chip width, so titles and times stay readable on a phone. */}
      <ul
        className="flex flex-col overflow-hidden rounded-xl border
                   border-moss-200 bg-white
                   dark:border-moss-800 dark:bg-moss-950 lg:hidden"
      >
        {days.map((day) => {
          const isToday = day.key === todayKey;
          return (
            <li
              key={`row-${day.key}`}
              aria-current={isToday ? "date" : undefined}
              className={[
                "border-b border-moss-100 px-3 py-2 last:border-b-0 dark:border-moss-800",
                isToday
                  ? "bg-canopy-50 dark:bg-canopy-950"
                  : day.isWeekend
                    ? "bg-moss-50/60 dark:bg-moss-900/30"
                    : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={
                    isToday
                      ? "text-xs font-semibold text-canopy-700 dark:text-canopy-300"
                      : "text-xs font-medium text-moss-600 dark:text-moss-300"
                  }
                >
                  {rowFmt.format(new Date(day.ms))}
                </span>
                {day.densityCount !== null ? (
                  <DensityDot count={day.densityCount} />
                ) : null}
              </div>
              {day.chips.length > 0 ? (
                <ul className="mt-1.5 flex flex-col gap-1">
                  {day.chips.map((e) => (
                    <li key={e.id}>
                      <WeekChip entry={e} locale={locale} roomy />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>

      {weekIsQuiet ? (
        <p className="text-center text-sm text-moss-600 dark:text-moss-300 lg:text-left">
          {t("calendar.week.quiet")}{" "}
          {nextUp ? (
            <button
              type="button"
              onClick={() => onJumpToDate(nextUp.date)}
              className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
            >
              {t("calendar.week.nextUp", {
                title: chipTitleOf(nextUp),
                date: nextUpFmt.format(new Date(nextUp.date)),
              })}{" "}
              ›
            </button>
          ) : null}
        </p>
      ) : null}

      <DensityLegend
        anyDensity={entries.some((e) => e.kind === "exchange_density")}
      />
    </div>
  );
}

function DensityDot({ count }: { count: number }) {
  let opacity = "opacity-30";
  if (count >= 20) opacity = "opacity-90";
  else if (count >= 5) opacity = "opacity-60";
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full bg-canopy-600 ${opacity}`}
      aria-hidden="true"
      title={`${count}`}
    />
  );
}

function DensityLegend({ anyDensity }: { anyDensity: boolean }) {
  const { t } = useTranslation();
  if (!anyDensity) return null;
  return (
    <p className="text-xs text-moss-600 dark:text-moss-300">
      <span className="mr-1 inline-flex items-center gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-canopy-600 opacity-30" />
        <span className="inline-block h-2 w-2 rounded-full bg-canopy-600 opacity-60" />
        <span className="inline-block h-2 w-2 rounded-full bg-canopy-600 opacity-90" />
      </span>
      {t("calendar.density.legend")}.{" "}
      {t("calendar.density.tooltipBody")}
      <WhyTooltip principleId="no-leaderboards" />
    </p>
  );
}

function WeekChip({
  entry,
  locale,
  roomy = false,
}: {
  entry: ChipEntry;
  locale: string;
  /** Stacked-row (below-lg) sizing: full-width rows have room for a
   *  legible text size and padding; the grid keeps its compact chip. */
  roomy?: boolean;
}) {
  const { t } = useTranslation();
  const sizing = roomy
    ? "px-2 py-1 text-xs"
    : "px-1 py-0.5 text-[10px]";
  if (entry.kind === "event") {
    // Category-coloured chip + leading category emoji (the discriminator
    // from same-coloured project/post chips); unknown peer category falls
    // back neutrally. aria-label names the kind for screen readers.
    const meta = eventCategoryMeta(entry.category);
    // The start time is the week view's reason to exist — lead with it
    // on the event's first day. Continuation days of a multi-day span
    // show the day position instead (the time would be a lie there).
    const timeFmt = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
    });
    const showTime = !entry.isMultiDay || entry.dayIndex === 0;
    const isLastDay =
      entry.isMultiDay && entry.dayIndex === entry.dayCount - 1;
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
    const chipTitle = entry.isMultiDay
      ? t("events.calendar.multiDay.chipTitle", {
          title: entry.title,
          index: entry.dayIndex + 1,
          count: entry.dayCount,
        })
      : entry.title;
    return (
      <Link
        to={entry.path}
        aria-label={ariaLabel}
        // Inset ring marks an event the viewer RSVP'd "going" to — own
        // status only, never a count.
        className={`block truncate rounded ${sizing} text-white ${meta.barColorClass} hover:opacity-90 ${
          entry.viewerGoing ? "ring-2 ring-inset ring-white/80" : ""
        }`}
        title={chipTitle}
      >
        <span aria-hidden="true">{meta.emoji}</span>{" "}
        {showTime ? (
          <span className="font-semibold">
            {timeFmt.format(new Date(entry.startsAt))}
          </span>
        ) : (
          // Day position, spoken by the aria-label above.
          <span aria-hidden="true" className="font-semibold">
            {entry.dayIndex + 1}/{entry.dayCount}
          </span>
        )}{" "}
        {entry.title}
      </Link>
    );
  }
  if (entry.kind === "project_deadline") {
    const meta = PROJECT_CATEGORY_META[entry.category];
    return (
      <Link
        to={`/project/${entry.projectId}`}
        className={`block truncate rounded ${sizing} text-white ${meta.barColorClass} hover:opacity-90`}
        title={t("calendar.entry.projectDeadline", {
          title: entry.projectTitle,
        })}
      >
        {entry.projectTitle}
      </Link>
    );
  }
  const meta = CATEGORY_META[entry.category];
  const { glyph, labelKey } = postEntryDisplay(entry.postType);
  const label = t(labelKey, { title: entry.postTitle });
  return (
    <Link
      to={`/post/${entry.postId}`}
      aria-label={label}
      className={`block truncate rounded ${sizing} text-white ${meta.barColorClass} hover:opacity-90`}
      title={label}
    >
      <span aria-hidden="true">{glyph}</span> {entry.postTitle}
    </Link>
  );
}
