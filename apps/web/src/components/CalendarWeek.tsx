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

// 7-column week view of the currently-selected week. Header shows the
// week's date range and Prev/Next buttons step a week at a time. The
// PAGE owns the paging offset (it must widen the entries window to
// cover the viewed week — see `Calendar.tsx`), so this component
// receives the resolved Sunday anchor plus prev/next callbacks, and
// paging is clamped to the page's bounds (buttons disable at the
// edges rather than walking into permanently empty grids). Same chip
// + density treatment as the month grid; see CalendarMonth for the
// design rationale.

interface CalendarWeekProps {
  entries: readonly CalendarEntry[];
  /** Sunday-anchored (midnight UTC) ms of the week to render. The
   *  page passes `startOfUTCWeek(now) + weekOffset * WEEK_MS`. */
  anchorMs: number;
  locale: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  /** False at the paging bounds — the matching button disables. */
  canPrev: boolean;
  canNext: boolean;
}

export function CalendarWeek({
  entries,
  anchorMs,
  locale,
  onPrevWeek,
  onNextWeek,
  canPrev,
  canNext,
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
    const out: Array<{ ms: number; key: string }> = [];
    for (let i = 0; i < 7; i++) {
      const ms = anchorMs + i * 86400000;
      out.push({ ms, key: dayKey(ms) });
    }
    return out;
  }, [anchorMs]);

  const rangeFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }),
    [locale],
  );

  const headerFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
      }),
    [locale],
  );

  const rangeLabel = t("calendar.weekNav.range", {
    start: rangeFmt.format(new Date(days[0].ms)),
    end: rangeFmt.format(new Date(days[6].ms)),
  });

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
        <p
          aria-live="polite"
          className="text-sm font-semibold text-bark-800 dark:text-moss-100"
        >
          {rangeLabel}
        </p>
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
      <div
        className="grid grid-cols-7 gap-px overflow-hidden rounded-xl
                   border border-moss-200 bg-moss-200
                   dark:border-moss-800 dark:bg-moss-800"
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
          const list = byDay.get(day.key) ?? [];
          const density = list.find((e) => e.kind === "exchange_density") as
            | Extract<CalendarEntry, { kind: "exchange_density" }>
            | undefined;
          const chips = list.filter(
            (e) =>
              e.kind === "project_deadline" ||
              e.kind === "post_expiring" ||
              e.kind === "event",
          );
          const isToday = day.key === todayKey;
          return (
            <div
              key={`cell-${day.key}`}
              aria-current={isToday ? "date" : undefined}
              className={
                isToday
                  ? "min-h-[120px] bg-canopy-50 p-1 text-canopy-700 dark:bg-canopy-950 dark:text-canopy-300"
                  : "min-h-[120px] bg-white p-1 dark:bg-moss-950"
              }
            >
              {density ? (
                <div className="mb-1 flex justify-end">
                  <DensityDot count={density.count} />
                </div>
              ) : null}
              <ul className="flex flex-col gap-0.5">
                {chips.map((e) => (
                  <li key={e.id}>
                    <WeekChip entry={e} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
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
}: {
  entry: Extract<
    CalendarEntry,
    { kind: "project_deadline" | "post_expiring" | "event" }
  >;
}) {
  const { t } = useTranslation();
  if (entry.kind === "event") {
    // Category-coloured chip + leading category emoji (the discriminator
    // from same-coloured project/post chips); unknown peer category falls
    // back neutrally. aria-label names the kind for screen readers.
    const meta = eventCategoryMeta(entry.category);
    // Multi-day spans keep the bare title visible (preserving truncation)
    // and carry the day position on the day-aware aria-label + title.
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
        className={`block truncate rounded px-1 py-0.5 text-[10px] text-white ${meta.barColorClass} hover:opacity-90 ${
          entry.viewerGoing ? "ring-1 ring-inset ring-white/80" : ""
        }`}
        title={chipTitle}
      >
        <span aria-hidden="true">{meta.emoji}</span> {entry.title}
      </Link>
    );
  }
  if (entry.kind === "project_deadline") {
    const meta = PROJECT_CATEGORY_META[entry.category];
    return (
      <Link
        to={`/project/${entry.projectId}`}
        className={`block truncate rounded px-1 py-0.5 text-[10px] text-white ${meta.barColorClass} hover:opacity-90`}
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
      className={`block truncate rounded px-1 py-0.5 text-[10px] text-white ${meta.barColorClass} hover:opacity-90`}
      title={label}
    >
      <span aria-hidden="true">{glyph}</span> {entry.postTitle}
    </Link>
  );
}

