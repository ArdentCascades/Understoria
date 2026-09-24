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
import { authoritativeCancelledEventIds } from "./eventCancellation";
import {
  provenanceEventTitle,
  provenanceTitle,
} from "@/content/templateProvenance";

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
      /** Number of exchanges completed on this local day. The display
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
      /** True iff the event spans more than one LOCAL day (its `endsAt`
       *  lands on a later local day than its `startsAt`). A multi-day
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
      /** Total number of local days the event spans (>= 1). Single-day
       *  events carry `1`. */
      dayCount: number;
    };

export interface BuildCalendarInput {
  /** Viewer locale for provenance-verified display translation of
   *  template-derived titles; omit for stored text. */
  locale?: string;
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
 * Dexie access, day math via the canonical local-day stamps above, no
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
 * - `exchange_density`: one entry per local day that has at least one
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
  // Provenance-verified display translation of template-derived
  // titles (docs/provenance-translation.md): entries are compact,
  // marker-free surfaces — each opens the project/event page, where
  // the note and the View-original toggle live. Omit `locale` to
  // keep stored text (tests, non-UI callers).
  const displayProjectTitle = (p: { templateId: string | null; title: string }) =>
    input.locale
      ? provenanceTitle(p.templateId, p.title, input.locale).text
      : p.title;
  const displayEventTitle = (ev: { templateId: string | null; title: string }) =>
    input.locale
      ? provenanceEventTitle(ev.templateId, ev.title, input.locale).text
      : ev.title;
  const entries: CalendarEntry[] = [];

  for (const p of input.projects) {
    if (p.deadline === null) continue;
    // Tended/retired: building finished; a leftover deadline marker
    // would be noise on a commons.
    if (
      p.status === "completed" ||
      p.status === "archived" ||
      p.status === "tended" ||
      p.status === "retired"
    )
      continue;
    if (p.deadline < input.windowStart || p.deadline > input.windowEnd) continue;
    entries.push({
      kind: "project_deadline",
      id: `project_deadline:${p.id}`,
      date: dayStampOf(p.deadline),
      projectId: p.id,
      projectTitle: displayProjectTitle(p),
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
      date: dayStampOf(post.expiresAt),
      postId: post.id,
      postTitle: post.title,
      postType: post.type,
      category: post.category,
    });
  }

  // Density: bucket exchanges by their LOCAL day. One entry per
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
  // emit ONE entry per LOCAL day the event spans (a Sat–Sun festival or a
  // 3-day build shows on every one of its days, not just the first).
  // The window check is per-day below — an event that began before
  // `windowStart` but continues into the window still surfaces its
  // in-window days.
  // Only AUTHORITATIVE cancellations (signed by the event's organizer)
  // hide an event — a non-organizer's forged cancellation is inert
  // (Round-4 review; lib/eventCancellation.ts).
  const cancelledIds = authoritativeCancelledEventIds(
    input.events ?? [],
    input.eventCancellations ?? [],
  );
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
  // Window lower bound, floored to its day stamp: a day-floored `dayMs`
  // (a canonical stamp) must be compared against a day-floored start
  // so a day whose midnight precedes `windowStart` but whose later hours
  // fall inside the window still counts as in-window.
  const windowStartDay = dayStampOf(input.windowStart);
  for (const ev of input.events ?? []) {
    if (cancelledIds.has(ev.id)) continue;
    const firstDay = dayStampOf(ev.startsAt);
    // A null `endsAt` is a single-point event; a malformed end before
    // the start is treated as single-day so we never emit a negative
    // range. Day stamps are exactly 86_400_000 ms apart (same arithmetic
    // the grid walks), so the span is a plain division.
    let lastDay = ev.endsAt === null ? firstDay : dayStampOf(ev.endsAt);
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
        id: `event:${ev.id}:${stampKey(dayMs)}`,
        date: dayMs,
        eventId: ev.id,
        title: displayEventTitle(ev),
        category: ev.category,
        viewerGoing: viewerGoingIds.has(ev.id),
        startsAt: ev.startsAt,
        endsAt: ev.endsAt,
        location: ev.location,
        organizerKey: ev.createdBy,
        // Calendar-originated event links open IN the calendar - the
        // nested route renders the event as a docked side panel at
        // desktop widths (full-screen below lg) while the calendar
        // stays mounted, so month/filter state survives the visit.
        // `/events/:id` remains the canonical standalone page for
        // shares, ICS files, and deep links from elsewhere.
        path: `/calendar/event/${ev.id}`,
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
 * Group a calendar list by local day key (entries' dates are
 * canonical stamps, so `stampKey`), preserving the input order
 * within each day. Used by the agenda + month views to render
 * day-by-day.
 */
export function groupByDay(
  entries: readonly CalendarEntry[],
): Map<string, CalendarEntry[]> {
  const map = new Map<string, CalendarEntry[]>();
  for (const e of entries) {
    const key = stampKey(e.date);
    let bucket = map.get(key);
    if (!bucket) {
      bucket = [];
      map.set(key, bucket);
    }
    bucket.push(e);
  }
  return map;
}

/*
 * ── The day model: LOCAL calendar days, canonically stamped ─────────
 *
 * The calendar buckets by the MEMBER'S LOCAL calendar day. The first
 * design chose UTC days ("runs identically on every device") and the
 * field falsified it within a day of events shipping: for a UTC-4
 * member, a single 6:00–8:30 PM event crosses UTC midnight, so it
 * rendered as a two-day "1/2 · 2/2" span, and every day header — a
 * UTC midnight formatted through a local formatter — labeled itself
 * as the previous day. Real calendar apps bucket locally; now this
 * one does too.
 *
 * The mechanics keep every piece of DST-proof arithmetic the old
 * model had, via one rule: a day is represented by a CANONICAL DAY
 * STAMP — `Date.UTC(y, m, d)` of the member's LOCAL year/month/day.
 * Stamps are labels, not instants: exactly 86_400_000 ms apart
 * (never a DST seam, because the local 23/25-hour days are absorbed
 * at conversion time), so week/month grids, span division, and the
 * send-window walks stay plain fixed-ms arithmetic.
 *
 * Two conversion directions, never mixed:
 *  - a REAL instant (startsAt, completedAt, Date.now()) enters day
 *    space through `dayStampOf` / `dayKey` (LOCAL getters);
 *  - a STAMP renders through `stampKey` (UTC getters) and, in the
 *    views, through Intl formatters pinned to `timeZone: "UTC"` —
 *    which yields the intended LOCAL day label, because the stamp
 *    encodes the local day at UTC midnight.
 * Comparing a stamp against a real instant is a bug; the window
 * bounds in `buildCalendar` are the one tolerated exception (their
 * edges are fuzzy by design at ±30/60 days).
 */

/**
 * LOCAL day key for a real ms-epoch instant. Shape: `YYYY-MM-DD`.
 * Two instants with the same key are on the same calendar day of the
 * member's wall clock.
 */
export function dayKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Day key of a canonical day STAMP (a `dayStampOf`/`dayKeyToMs`
 * value — UTC midnight encoding a local day). UTC getters on
 * purpose: reading a stamp with local getters is exactly the
 * off-by-one this model exists to kill.
 */
export function stampKey(stampMs: number): string {
  const d = new Date(stampMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Canonical day stamp for the LOCAL calendar day containing the real
 * instant `ms`. Used by `buildCalendar` so entries' `date` fields are
 * comparable and groupable with plain fixed-ms arithmetic.
 */
export function dayStampOf(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

/** One week of day stamps in ms. Stamps are exactly 86_400_000 ms
 *  apart (DST is absorbed at conversion, never in stamp space), so a
 *  week is a plain multiple — the same arithmetic the grids walk. */
export const WEEK_MS = 7 * 86_400_000;

/**
 * Day stamp of the first day of the month that is `months` whole
 * months away from the LOCAL month containing the real instant `ms`
 * (0 = that same month, negative = past). `Date.UTC` normalizes
 * out-of-range month indices, so year rollover is handled for free.
 * Used as the month view's paging anchor.
 */
export function monthAnchor(ms: number, months: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getFullYear(), d.getMonth() + months, 1);
}

/**
 * Day stamp of the Sunday on or before the LOCAL day containing the
 * real instant `ms` — the week view's anchor convention (week starts
 * Sunday, matching the grids' weekday headers).
 */
export function weekAnchor(ms: number): number {
  const sod = dayStampOf(ms);
  const weekday = new Date(sod).getUTCDay(); // stamps: UTC getters
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
export function monthGridRange(anchorStampMs: number): {
  start: number;
  end: number;
} {
  // The anchor is a day STAMP (from `monthAnchor`), so UTC getters.
  const d = new Date(anchorStampMs);
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
    const range = monthGridRange(monthAnchor(input.now, input.offset));
    viewStart = range.start;
    viewEnd = range.end;
  } else if (input.view === "week") {
    const anchor = weekAnchor(input.now) + input.offset * WEEK_MS;
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
 * Today's LOCAL day key. Thin wrapper around `dayKey(Date.now())` so
 * the three calendar views can compare each rendered day's key
 * against a single shared "today" without each one re-reading the
 * clock in a slightly different way. Directly comparable with
 * `stampKey` output — both name local calendar days.
 */
export function getTodayDayKey(): string {
  return dayKey(Date.now());
}

/**
 * Parse `YYYY-MM-DD` back to its canonical day STAMP. Strict: throws
 * on malformed input rather than coercing NaN, which would silently
 * land entries at the Unix epoch.
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
 * Returns true if the entry's day has already passed relative to
 * `todayStampMs` — TODAY's canonical day stamp (`dayStampOf(now)`),
 * NOT a real instant. Entries' `date` fields are stamps too, so the
 * whole comparison lives in stamp space and no timezone can shift it.
 *
 * - Single-day events (`dayCount === 1`, including every
 *   `endsAt: null` point event): hide once the event's local day is
 *   over — `dayStampOf(endsAt ?? startsAt) < todayStampMs`.
 * - Multi-day events (`dayCount > 1`): each spanned day is its OWN
 *   entry, judged per-day — a day drops once it has fully elapsed
 *   (`date + 86_400_000 <= todayStampMs`), so the past start days of
 *   a still-running event fall away while today's and the remaining
 *   days stay visible.
 * - Project deadlines and post expiries: hide when date < today.
 * - Exchange density: NEVER past — aggregate signal stays everywhere.
 *
 * The agenda view filters past entries; month and week views do not
 * (their grids intrinsically show the whole period).
 */
export function entryIsPast(
  entry: CalendarEntry,
  todayStampMs: number,
): boolean {
  switch (entry.kind) {
    case "event": {
      if (entry.dayCount > 1) {
        // Per-day: drop only once this local day has fully elapsed.
        return entry.date + 86_400_000 <= todayStampMs;
      }
      return dayStampOf(entry.endsAt ?? entry.startsAt) < todayStampMs;
    }
    case "project_deadline":
    case "post_expiring":
      return entry.date < todayStampMs;
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
