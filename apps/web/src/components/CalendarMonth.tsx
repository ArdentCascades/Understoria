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
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  dayKey,
  getTodayDayKey,
  startOfUTCDay,
  type CalendarEntry,
} from "@/lib/calendar";
import {
  CATEGORY_META,
  PROJECT_CATEGORY_META,
  eventCategoryMeta,
} from "@/lib/categories";
import { WhyTooltip } from "@/components/WhyTooltip";

// Month grid: 7 columns × ~5–6 weeks, rendering the month that
// contains the `currentMs` prop (the page passes "now" by default).
// Each cell shows the day number, up to three category-colored chips,
// a "+N more" overflow link when full, and a calm density dot whose
// opacity scales with exchange count.
//
// Per design doc §8.2: no numeric overlay on density by default. The
// overflow popover, when opened, lists every entry for that day —
// including the density count, so the number is "tap-to-reveal".

interface CalendarMonthProps {
  entries: readonly CalendarEntry[];
  currentMs: number;
  locale: string;
}

const MAX_CHIPS_PER_CELL = 3;

export function CalendarMonth({
  entries,
  currentMs,
  locale,
}: CalendarMonthProps) {
  const { t } = useTranslation();
  const [openDay, setOpenDay] = useState<string | null>(null);

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

  const grid = useMemo(() => buildMonthGrid(currentMs), [currentMs]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(new Date(grid.monthAnchorMs)),
    [locale, grid.monthAnchorMs],
  );

  const weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

  return (
    <div className="flex flex-col gap-stack-sm">
      <p className="text-sm font-semibold text-bark-800 dark:text-moss-100">
        {monthLabel}
      </p>
      <div
        className="grid grid-cols-7 gap-px overflow-hidden rounded-xl
                   border border-moss-200 bg-moss-200 text-xs
                   dark:border-moss-800 dark:bg-moss-800"
      >
        {weekdayKeys.map((k) => (
          <div
            key={k}
            className="bg-moss-50 px-2 py-1 text-center font-medium
                       text-moss-600 dark:bg-moss-900 dark:text-moss-300"
          >
            {t(`calendar.month.weekdayShort.${k}`)}
          </div>
        ))}
        {grid.cells.map((cell) => {
          const list = byDay.get(cell.key) ?? [];
          const chips = list.filter(
            (e) =>
              e.kind === "project_deadline" ||
              e.kind === "post_expiring" ||
              e.kind === "event",
          );
          const density = list.find(
            (e) => e.kind === "exchange_density",
          ) as Extract<CalendarEntry, { kind: "exchange_density" }> | undefined;
          const overflow = chips.length - MAX_CHIPS_PER_CELL;
          const shown = chips.slice(0, MAX_CHIPS_PER_CELL);
          const isToday = cell.key === todayKey;
          return (
            <div
              key={cell.key}
              aria-current={isToday ? "date" : undefined}
              className={[
                "relative min-h-[64px] p-1",
                isToday
                  ? "bg-canopy-50 text-canopy-700 dark:bg-canopy-950 dark:text-canopy-300"
                  : cell.inMonth
                    ? "bg-white text-bark-800 dark:bg-moss-950 dark:text-moss-100"
                    : "bg-white text-moss-400 dark:bg-moss-950 dark:text-moss-600",
              ].join(" ")}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-medium">{cell.dayNum}</span>
                {density ? (
                  <DensityDot count={density.count} />
                ) : null}
              </div>
              <ul className="mt-1 flex flex-col gap-0.5">
                {shown.map((e) => (
                  <li key={e.id}>
                    <MonthChip entry={e} />
                  </li>
                ))}
              </ul>
              {overflow > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    setOpenDay((prev) => (prev === cell.key ? null : cell.key))
                  }
                  className="mt-0.5 text-[11px] text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("calendar.overflowMore", { count: overflow })}
                </button>
              ) : null}
              {openDay === cell.key ? (
                <div
                  className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border
                             border-moss-200 bg-white p-2 text-left shadow-leaf
                             dark:border-moss-800 dark:bg-moss-900"
                  role="dialog"
                >
                  <button
                    type="button"
                    onClick={() => setOpenDay(null)}
                    className="float-right text-[11px] text-moss-600 hover:text-moss-700 dark:text-moss-300"
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <ul className="flex flex-col gap-1 clear-both">
                    {list.map((e) => (
                      <li key={e.id}>
                        <PopoverEntry entry={e} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
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

// Opacity-bucketed dot per design doc §8.2: roughly 3 buckets for
// 1, 5, 20+ counts. No numeric overlay by default.
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

function MonthChip({
  entry,
}: {
  entry: Extract<
    CalendarEntry,
    { kind: "project_deadline" | "post_expiring" | "event" }
  >;
}) {
  const { t } = useTranslation();
  if (entry.kind === "event") {
    // Category-coloured chip + a leading category emoji — the emoji is
    // the discriminator that keeps an event distinct from a same-coloured
    // project deadline / post expiry (which carry no glyph). aria-label
    // names the kind; an unknown peer category falls back neutrally.
    const meta = eventCategoryMeta(entry.category);
    return (
      <Link
        to={entry.path}
        aria-label={t("events.calendar.entryKindLabel")}
        className={`block truncate rounded px-1 py-0.5 text-[10px] text-white ${meta.barColorClass} hover:opacity-90`}
        title={entry.title}
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
  const title =
    entry.postType === "NEED"
      ? t("calendar.entry.postExpiringNeed", { title: entry.postTitle })
      : t("calendar.entry.postExpiringOffer", { title: entry.postTitle });
  return (
    <Link
      to={`/post/${entry.postId}`}
      className={`block truncate rounded px-1 py-0.5 text-[10px] text-white ${meta.barColorClass} hover:opacity-90`}
      title={title}
    >
      {entry.postTitle}
    </Link>
  );
}

function PopoverEntry({ entry }: { entry: CalendarEntry }) {
  const { t } = useTranslation();
  if (entry.kind === "exchange_density") {
    return (
      <span className="text-xs text-moss-600 dark:text-moss-300">
        {t("calendar.density.line", { count: entry.count })}
      </span>
    );
  }
  return <MonthChip entry={entry} />;
}

// Builds a 7-column × N-row grid covering the month that contains
// `currentMs`. Rows are padded from the prior month and the following
// month so the grid is always a rectangle and weeks are aligned.
// Week starts Sunday for simplicity — matches the weekday header.
function buildMonthGrid(currentMs: number): {
  cells: Array<{ key: string; dayNum: number; inMonth: boolean }>;
  monthAnchorMs: number;
} {
  const d = new Date(currentMs);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const firstOfMonth = Date.UTC(year, month, 1);
  const firstWeekday = new Date(firstOfMonth).getUTCDay(); // 0 = Sun
  // Walk back to the Sunday on or before the first.
  const gridStart = firstOfMonth - firstWeekday * 86400000;
  // Render 6 weeks (42 cells) — always covers any month.
  const cells: Array<{ key: string; dayNum: number; inMonth: boolean }> = [];
  for (let i = 0; i < 42; i++) {
    const ms = gridStart + i * 86400000;
    const cellDate = new Date(ms);
    cells.push({
      key: dayKey(ms),
      dayNum: cellDate.getUTCDate(),
      inMonth: cellDate.getUTCMonth() === month,
    });
  }
  return { cells, monthAnchorMs: startOfUTCDay(firstOfMonth) };
}
