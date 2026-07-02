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
import type {
  Category,
  Event,
  EventCancellation,
  EventRsvpRow,
  Exchange,
  Post,
  PostType,
  Project,
  ProjectCategory,
} from "@/types";

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
  | "exchange_density"
  | "event";

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
      /** ProjectCategory is the wider set — includes infrastructure,
       *  organizing, mutual_aid_drive on top of the Post Category
       *  enum. The UI looks up display metadata for both via
       *  `lib/categories.ts`. */
      category: ProjectCategory;
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
    }
  | {
      kind: "event";
      id: string;
      /** Midnight UTC of the event's startsAt day. */
      date: number;
      eventId: string;
      title: string;
      /** The event's free-text category (may be a string this node
       *  doesn't recognize — events federate with free-text categories).
       *  Looked up via `eventCategoryMeta` in `lib/categories.ts` for the
       *  chip's emoji + colour, with a neutral fallback. */
      category: string;
      /** Epoch ms of the event's actual start (NOT day-floored). The
       *  UI uses this to render the time-of-day; `date` is the UTC
       *  day for grouping. */
      startsAt: number;
      /** Epoch ms of the event's actual end (NOT day-floored), or null
       *  if the event has no defined end time. Used by the agenda view
       *  to decide whether a multi-day event is still ongoing. */
      endsAt: number | null;
      location: string;
      /** True iff the CURRENT viewer has RSVP'd "going" to this event —
       *  the viewer's own local status, never anyone else's and never a
       *  count. Drives a quiet "you're going" marker so a member can see
       *  what they're part of at a glance (no-leaderboards: own data
       *  only). */
      viewerGoing: boolean;
      /** Organizer's pubkey. The UI can look up the display name from
       *  the members map. Carried so renderers don't have to do their
       *  own event-to-organizer join. */
      organizerKey: string;
      /** Deep-link path to the event detail page. */
      path: string;
      /** True iff the event spans more than one UTC day (its `endsAt`
       *  lands on a later UTC day than its `startsAt`). A multi-day
       *  event emits one entry per spanned day; this flag lets a
       *  renderer branch the continuation copy. A `null`-end (single-
       *  point) event is never multi-day. */
      isMultiDay: boolean;
      /** 0-based index of THIS entry's day within the event's full
       *  UTC-day span, independent of window clipping — a window-clipped
       *  event whose first in-window day is its third overall still
       *  carries `dayIndex: 2` here, so "Day N of M" copy reflects the
       *  true position in the event rather than within the visible
       *  window. */
      dayIndex: number;
      /** Total number of UTC days the event spans (>= 1). Single-day
       *  events carry `1`. */
      dayCount: number;
    };

export interface BuildCalendarInput {
  projects: readonly Project[];
  posts: readonly Post[];
  exchanges: readonly Exchange[];
  /** Events to surface on the calendar. Cancelled events (those with a
   *  matching `eventCancellations` row) are filtered out at the data
   *  layer — the calendar never renders a cancelled event. */
  events?: readonly Event[];
  /** Cancellation records that suppress the corresponding event from
   *  appearing on the calendar. Lookup is by `eventId`. */
  eventCancellations?: readonly EventCancellation[];
  /** The CURRENT viewer's public key — used only to mark events the
   *  viewer themselves RSVP'd "going" to. Optional; when omitted no
   *  event is marked. */
  currentMemberKey?: string | null;
  /** Local-only RSVP rows. Only the current viewer's "going" rows are
   *  read, to set `viewerGoing` — never another member's, never a count
   *  (RSVPs are local-only and privacy-tiered; see
   *  `docs/community-events.md` §4 + §7). Optional. */
  eventRsvps?: readonly EventRsvpRow[];
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

/**
 * Upper bound on the number of per-day entries a single event may emit.
 * Belt-and-suspenders only: the window (`[windowStart, windowEnd]`) is
 * the PRIMARY bound on how many days an event can spread across the
 * grid. This clamp guards against a malformed far-future `endsAt`
 * ballooning the loop before the window test trims it — 92 sits just
 * above the ~90-day default window, and a real event spanning more
 * than three months of consecutive days is pathological data, not a
 * calendar. (The page may pass a wider window when the member pages
 * the month/week views away from today — see `calendarViewWindow` —
 * but the per-event clamp intentionally stays put.)
 */
const MAX_EVENT_DAYS = 92;

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
  //
  // Events deliberately do NOT count toward density — see
  // `docs/community-events.md` §9 + the WhyTooltip `no-leaderboards`
  // discipline. Density is community metabolism keyed to completed
  // exchanges; folding events into it would re-derive the
  // popularity/attendance signal `no-leaderboards` exists to prevent.
  // This loop iterates `input.exchanges` only; if you find yourself
  // reading `input.events` here you're about to violate that.
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

  // Events: skip any whose id has a matching cancellation row, then
  // emit ONE entry per UTC day the event spans (a Sat–Sun festival or a
  // 3-day build shows on every one of its days, not just the first).
  // The window check is per-day below — an event that began before
  // `windowStart` but continues into the window still surfaces its
  // in-window days.
  const cancelledIds = new Set<string>();
  for (const c of input.eventCancellations ?? []) cancelledIds.add(c.eventId);
  // The viewer's OWN "going" events — read only when we know who the
  // viewer is. Never another member's status; never a count.
  const viewerGoingIds = new Set<string>();
  if (input.currentMemberKey) {
    for (const r of input.eventRsvps ?? []) {
      if (r.memberKey === input.currentMemberKey && r.status === "going") {
        viewerGoingIds.add(r.eventId);
      }
    }
  }
  // Window lower bound, floored to its UTC day: a day-floored `dayMs`
  // (always midnight UTC) must be compared against a day-floored start
  // so a day whose midnight precedes `windowStart` but whose later hours
  // fall inside the window still counts as in-window.
  const windowStartDay = startOfUTCDay(input.windowStart);
  for (const ev of input.events ?? []) {
    if (cancelledIds.has(ev.id)) continue;
    const firstDay = startOfUTCDay(ev.startsAt);
    // A null `endsAt` is a single-point event; a malformed end before
    // the start is treated as single-day so we never emit a negative
    // range. UTC days are exactly 86_400_000 ms apart (same arithmetic
    // the grid walks), so the span is a plain division.
    let lastDay = ev.endsAt === null ? firstDay : startOfUTCDay(ev.endsAt);
    if (lastDay < firstDay) lastDay = firstDay;
    // Whole span outside the window — no in-window day to emit. Bail
    // before the day loop rather than testing each day for nothing.
    if (lastDay < windowStartDay || firstDay > input.windowEnd) continue;
    const dayCount = (lastDay - firstDay) / 86_400_000 + 1;
    const isMultiDay = dayCount > 1;
    // Clamp the loop count: the window already bounds emission, this
    // only stops a pathological far-future `endsAt` from spinning the
    // loop before the per-day window test trims it.
    const dayLimit = Math.min(dayCount, MAX_EVENT_DAYS);
    for (let i = 0; i < dayLimit; i++) {
      const dayMs = firstDay + i * 86_400_000;
      // Per-day window test (day-based — startsAt/endsAt aren't
      // day-floored). Skip days outside the window; keep `dayIndex` as
      // the TRUE position in the event's span so "Day N of M" copy is
      // honest under window clipping.
      if (dayMs < windowStartDay || dayMs > input.windowEnd) continue;
      entries.push({
        kind: "event",
        id: `event:${ev.id}:${dayKey(dayMs)}`,
        date: dayMs,
        eventId: ev.id,
        title: ev.title,
        category: ev.category,
        viewerGoing: viewerGoingIds.has(ev.id),
        startsAt: ev.startsAt,
        endsAt: ev.endsAt,
        location: ev.location,
        organizerKey: ev.createdBy,
        path: `/events/${ev.id}`,
        isMultiDay,
        dayIndex: i,
        dayCount,
      });
    }
  }

  // Stable sort by date, then by kind (density < deadline < post)
  // for same-day tie-breaking so the UI z-order is predictable.
  // Within equal (date, kind) for events, tiebreak by `startsAt`
  // ascending so two same-day events list in time-of-day order (a
  // 10am skillshare above a 7pm potluck) instead of insertion order.
  // Other kinds carry no time-of-day; `sort` is stable, so returning
  // 0 preserves their input order.
  const kindOrder: Record<CalendarEntryKind, number> = {
    exchange_density: 0,
    project_deadline: 1,
    post_expiring: 2,
    event: 3,
  };
  entries.sort((a, b) => {
    if (a.date !== b.date) return a.date - b.date;
    if (a.kind !== b.kind) return kindOrder[a.kind] - kindOrder[b.kind];
    if (a.kind === "event" && b.kind === "event") {
      return a.startsAt - b.startsAt;
    }
    return 0;
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

/** One UTC week in ms. UTC days are exactly 86_400_000 ms apart (no
 *  DST in UTC), so a week is a plain multiple — the same arithmetic
 *  the grids walk. */
export const WEEK_MS = 7 * 86_400_000;

/**
 * Midnight UTC on the first day of the month that is `months` whole
 * months away from the month containing `ms` (0 = that same month,
 * negative = past). `Date.UTC` normalizes out-of-range month indices,
 * so year rollover is handled for free. Used as the month view's
 * paging anchor: any ms within the target month works for the grid,
 * and the first-of-month is a stable, clock-independent choice.
 */
export function addUTCMonths(ms: number, months: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1);
}

/**
 * Midnight UTC of the Sunday on or before `ms` — the week view's
 * anchor convention (week starts Sunday, matching the grids' weekday
 * headers).
 */
export function startOfUTCWeek(ms: number): number {
  const sod = startOfUTCDay(ms);
  const weekday = new Date(sod).getUTCDay(); // 0 = Sun
  return sod - weekday * 86_400_000;
}

/**
 * Inclusive ms range of the 6-week (42-cell) grid the month view
 * renders for the month containing `anchorMs`: from midnight UTC of
 * the Sunday on or before the 1st, through the last ms of the 42nd
 * cell. Must stay in lockstep with `buildMonthGrid` in
 * `CalendarMonth.tsx` (which derives its grid start from this) so the
 * entries window always covers every rendered cell.
 */
export function monthGridRange(anchorMs: number): {
  start: number;
  end: number;
} {
  const d = new Date(anchorMs);
  const firstOfMonth = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  const firstWeekday = new Date(firstOfMonth).getUTCDay(); // 0 = Sun
  const start = firstOfMonth - firstWeekday * 86_400_000;
  return { start, end: start + 42 * 86_400_000 - 1 };
}

/**
 * The entries window for the currently-displayed view: the union of
 * the page's default window (30 back / 60 forward, anchored to "now")
 * with the period the paged month/week view is actually showing.
 *
 * Why a union and not a swap: the default window is what the agenda
 * and the density signal are calibrated to — at offset 0 the behavior
 * of those surfaces is unchanged. But a FIXED window means paging the
 * month view two months ahead would render an empty grid even when
 * events exist there (they were being built out of the window). So
 * when the member pages, the window widens to cover the viewed
 * period; density on far-past months is honest history, and far-future
 * months simply have no density yet.
 *
 * Pure — the page passes `now` and its default bounds; unit-testable
 * without a clock or React.
 */
export function calendarViewWindow(input: {
  now: number;
  defaultStart: number;
  defaultEnd: number;
  view: "agenda" | "month" | "week";
  /** Paging offset for the active view: whole months for "month",
   *  whole weeks for "week". Ignored for "agenda" (not pageable). */
  offset: number;
}): { windowStart: number; windowEnd: number } {
  let viewStart: number | null = null;
  let viewEnd: number | null = null;
  if (input.view === "month") {
    const range = monthGridRange(addUTCMonths(input.now, input.offset));
    viewStart = range.start;
    viewEnd = range.end;
  } else if (input.view === "week") {
    const anchor = startOfUTCWeek(input.now) + input.offset * WEEK_MS;
    viewStart = anchor;
    viewEnd = anchor + WEEK_MS - 1;
  }
  return {
    windowStart:
      viewStart === null
        ? input.defaultStart
        : Math.min(input.defaultStart, viewStart),
    windowEnd:
      viewEnd === null ? input.defaultEnd : Math.max(input.defaultEnd, viewEnd),
  };
}

/**
 * Today's UTC day key. Thin wrapper around `dayKey(Date.now())` so the
 * three calendar views can compare each rendered day's key against a
 * single shared "today" without each one re-reading the clock in a
 * slightly different way.
 *
 * Pre-existing limitation: this uses the same UTC-day bucketing as the
 * rest of the calendar. A member whose local time is well past
 * midnight but whose UTC clock has not rolled over yet (or vice versa)
 * may see "today" highlight a day that, in their local calendar, is
 * yesterday or tomorrow. The whole calendar lives in UTC days
 * (§8.3 of docs/calendar.md); migrating that model is out of scope —
 * this helper inherits the same trade-off the rest of the layer makes.
 */
export function getTodayDayKey(): string {
  return dayKey(Date.now());
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

/**
 * ms-epoch for local-clock midnight on the day that contains `now`.
 *
 * The agenda view's "is this past?" decision wants to align with the
 * member's wall clock — at 11:30 PM local time, today's evening event
 * is still "today" even though its UTC day may already have rolled
 * over for some TZs. `buildCalendar` itself uses UTC day-flooring
 * (§8.3) for grouping; this helper is render-time only.
 */
export function startOfTodayMs(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Returns true if the entry's effective time has already passed
 * relative to `startOfTodayMs` (local-clock start of day).
 *
 * - Single-day events (`dayCount === 1`, including every `endsAt: null`
 *   point event): hide when (endsAt ?? startsAt) < startOfTodayMs.
 * - Multi-day events (`dayCount > 1`): each spanned day is its OWN
 *   entry, judged per-day — a day drops once it has fully elapsed
 *   (`date + 86_400_000 <= startOfTodayMs`), so the past start days of a
 *   still-running event fall away while today's and the remaining days
 *   stay visible.
 * - Project deadlines and post expiries: hide when date < startOfTodayMs.
 * - Exchange density: NEVER past — aggregate signal stays everywhere.
 *
 * The agenda view filters past entries; month and week views do not
 * (their grids intrinsically show the whole period).
 */
export function entryIsPast(
  entry: CalendarEntry,
  startOfTodayMs: number,
): boolean {
  switch (entry.kind) {
    case "event": {
      if (entry.dayCount > 1) {
        // Per-day: drop only once this UTC day has fully elapsed.
        return entry.date + 86_400_000 <= startOfTodayMs;
      }
      const end = entry.endsAt ?? entry.startsAt;
      return end < startOfTodayMs;
    }
    case "project_deadline":
    case "post_expiring":
      return entry.date < startOfTodayMs;
    case "exchange_density":
      return false;
  }
}

/**
 * Marker glyph + i18n label key for a post entry's kind. Pure +
 * i18n-free (returns a KEY, not a translated string) so this module
 * stays testable from vanilla vitest; the views translate the key.
 * NEED is an open, asking palms-up hand; OFFER a calm seedling.
 */
export function postEntryDisplay(postType: PostType): {
  glyph: string;
  labelKey: string;
} {
  return postType === "NEED"
    ? { glyph: "\u{1F932}", labelKey: "calendar.entry.postExpiringNeed" }
    : { glyph: "\u{1F331}", labelKey: "calendar.entry.postExpiringOffer" };
}
