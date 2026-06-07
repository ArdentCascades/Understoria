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
import type { Category, Exchange, Post, PostType, Project } from "@/types";

/**
 * Community calendar data layer — aggregates date-shaped fields from
 * already-loaded `Project`, `Post`, and `Exchange` rows into a
 * chronologically-sorted list of calendar entries.
 *
 * See `docs/calendar.md` for the design (sources / non-sources /
 * threat model). This module implements §4 (data sources), §8.3
 * (UTC day boundaries), and §11 (PR 2 scope). The UI layer (PR 3)
 * consumes the output and handles display / localization.
 *
 * Why structural data only (no `title` field):
 * The aggregator emits the raw fields the UI needs to compose a
 * localized display string ("Deadline: <project name>"), but never
 * produces the localized string itself. Doing so would couple the
 * lib to react-i18next, force a wordlist of strings here, and
 * break the test-from-vanilla-vitest property the rest of the
 * `lib/` modules maintain.
 */

export type CalendarEntryKind =
  | "project_deadline"
  | "post_expiring"
  | "exchange_density";

/** Discriminated union — `kind` narrows the rest of the fields.
 *  Each entry carries the structural data the UI needs to render
 *  and route (project / post ids for click-through). */
export type CalendarEntry =
  | {
      kind: "project_deadline";
      /** Stable id for React keys — derived from kind + source id. */
      id: string;
      /** ms epoch, midnight UTC on the entry's day. Grouping operates
       *  on this; display formats it in the member's locale TZ. */
      date: number;
      projectId: string;
      projectTitle: string;
      category: Category;
    }
  | {
      kind: "post_expiring";
      id: string;
      date: number;
      postId: string;
      postTitle: string;
      postType: PostType;
      category: Category;
    }
  | {
      kind: "exchange_density";
      id: string;
      date: number;
      /** Number of exchanges completed on this UTC day. The display
       *  layer renders this as opacity / dot-density per the design
       *  note §8.2, not as a raw number on the calendar grid. */
      count: number;
    };

export interface BuildCalendarInput {
  projects: readonly Project[];
  posts: readonly Post[];
  exchanges: readonly Exchange[];
  /** Inclusive lower bound on the entry's source timestamp
   *  (deadline / expiresAt / completedAt). ms epoch. */
  windowStart: number;
  /** Inclusive upper bound on the entry's source timestamp. ms epoch. */
  windowEnd: number;
}

/**
 * Build the calendar entries for a window. Pure function — no
 * Dexie access, no time-zone math beyond UTC day-flooring, no
 * react-i18next. Tests stub the inputs directly.
 *
 * Filter rules:
 *
 * - `project_deadline`: project has a non-null `deadline`, status is
 *   not `completed` or `archived`, deadline falls within
 *   `[windowStart, windowEnd]`. A completed-or-archived project's
 *   deadline is past business; surfacing it on the calendar would
 *   add noise without value.
 * - `post_expiring`: post has a non-null `expiresAt`, status is
 *   `open` (claimed-already posts that happen to carry an expiry
 *   are not actionable on the calendar), expiry falls within the
 *   window.
 * - `exchange_density`: one entry per UTC day that has at least one
 *   completed exchange in the window. The count is the number of
 *   exchanges on that day. Zero-count days are skipped — sparse,
 *   not dense.
 *
 * Sorting: ascending by `date`. For same-day ties, `exchange_density`
 * sorts first (the UI renders it as a background indicator behind
 * deadline / expiry chips), then `project_deadline`, then
 * `post_expiring`. This produces a stable z-order at the UI layer
 * without it having to re-sort.
 */
export function buildCalendar(input: BuildCalendarInput): CalendarEntry[] {
  const entries: CalendarEntry[] = [];

  for (const p of input.projects) {
    if (p.deadline === null) continue;
    if (p.status === "completed" || p.status === "archived") continue;
    if (p.deadline < input.windowStart || p.deadline > input.windowEnd) continue;
    entries.push({
      kind: "project_deadline",
      id: `project_deadline:${p.id}`,
      date: startOfUTCDay(p.deadline),
      projectId: p.id,
      projectTitle: p.title,
      category: p.category,
    });
  }

  for (const post of input.posts) {
    if (post.expiresAt === null) continue;
    if (post.status !== "open") continue;
    if (post.expiresAt < input.windowStart || post.expiresAt > input.windowEnd)
      continue;
    entries.push({
      kind: "post_expiring",
      id: `post_expiring:${post.id}`,
      date: startOfUTCDay(post.expiresAt),
      postId: post.id,
      postTitle: post.title,
      postType: post.type,
      category: post.category,
    });
  }

  // Density: bucket exchanges by their UTC day. One entry per
  // non-empty day. The Map preserves insertion order, but we sort
  // the full output at the end so insertion order doesn't matter.
  const byDay = new Map<string, number>();
  for (const ex of input.exchanges) {
    if (ex.completedAt < input.windowStart || ex.completedAt > input.windowEnd)
      continue;
    const key = dayKey(ex.completedAt);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  for (const [key, count] of byDay) {
    entries.push({
      kind: "exchange_density",
      id: `density:${key}`,
      date: dayKeyToMs(key),
      count,
    });
  }

  // Stable sort by date, then by kind (density < deadline < post)
  // for same-day tie-breaking so the UI z-order is predictable.
  const kindOrder: Record<CalendarEntryKind, number> = {
    exchange_density: 0,
    project_deadline: 1,
    post_expiring: 2,
  };
  entries.sort((a, b) => {
    if (a.date !== b.date) return a.date - b.date;
    return kindOrder[a.kind] - kindOrder[b.kind];
  });

  return entries;
}

/**
 * Group a calendar list by UTC day key, preserving the input order
 * within each day. Used by the agenda + month views to render
 * day-by-day.
 */
export function groupByDay(
  entries: readonly CalendarEntry[],
): Map<string, CalendarEntry[]> {
  const map = new Map<string, CalendarEntry[]>();
  for (const e of entries) {
    const key = dayKey(e.date);
    let bucket = map.get(key);
    if (!bucket) {
      bucket = [];
      map.set(key, bucket);
    }
    bucket.push(e);
  }
  return map;
}

/**
 * UTC day key for a ms-epoch timestamp. Shape: `YYYY-MM-DD`. Two
 * timestamps with the same key are on the same UTC calendar day.
 *
 * Why UTC and not the member's local TZ:
 * §8.3 of the design doc — the aggregator runs identically on every
 * device regardless of TZ. The UI layer translates display via
 * `Intl.DateTimeFormat`. A deadline at 23:00 UTC may show as the
 * next day for some members; that's correct and matches every other
 * calendar app's convention.
 */
export function dayKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * ms-epoch for midnight UTC on the day that contains `ms`. Floors
 * to the day boundary. Used by `buildCalendar` so entries' `date`
 * fields are comparable and groupable directly.
 */
export function startOfUTCDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Inverse of `dayKey` — parse `YYYY-MM-DD` back to its midnight-UTC
 * ms-epoch. Strict: throws on malformed input rather than coercing
 * NaN, which would silently land entries at the Unix epoch.
 */
export function dayKeyToMs(key: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) throw new Error(`dayKeyToMs: malformed key "${key}"`);
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  return Date.UTC(y, m - 1, d);
}
