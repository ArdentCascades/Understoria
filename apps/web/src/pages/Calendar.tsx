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
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import {
  WEEK_MS,
  addUTCMonths,
  buildCalendar,
  calendarViewWindow,
  startOfUTCWeek,
  type CalendarEntry,
} from "@/lib/calendar";
import { useVirtualKeyboardOpen } from "@/lib/useVirtualKeyboard";
import { isOrganizer } from "@/db/projects";
import { getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { EmptyState } from "@/components/EmptyState";
import { CalendarAgenda } from "@/components/CalendarAgenda";
import { CalendarMonth } from "@/components/CalendarMonth";
import { CalendarWeek } from "@/components/CalendarWeek";
import type { Event, Exchange, Post, Project } from "@/types";

// Window: 30 days back, 60 days forward. The back-window covers
// recently-completed exchange density (historical) and the forward
// window covers project deadlines and post expiries. Recomputed when
// filters change so the window stays anchored to "now" not stale.
const WINDOW_BACK_MS = 30 * 24 * 60 * 60 * 1000;
const WINDOW_FORWARD_MS = 60 * 24 * 60 * 60 * 1000;

// Paging bounds for the month / week views: ~a year each way. History
// is real data (density, past events) and events can be created at any
// future date (EventNew caps the past, not the future), so both
// directions are legitimate — but unbounded paging just walks members
// into permanently empty grids. 52 weeks ≈ 12 months, so the two
// views share the same effective horizon.
const MAX_MONTH_OFFSET = 12;
const MAX_WEEK_OFFSET = 52;

type ViewMode = "agenda" | "month" | "week";

// Humanized fallback label for a category string the i18n `categories.*`
// block doesn't carry a key for (e.g. a peer's unknown event category).
function prettifyCategory(c: string): string {
  const s = c.replace(/[_-]+/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// `lg` breakpoint in default Tailwind is 1024px. Below that, agenda
// is the default; at or above, month is the default. The member's
// explicit override (a click on a view pill) persists across visits
// via the Dexie settings table (see the restore effect below).
function defaultViewForWidth(width: number): ViewMode {
  return width >= 1024 ? "month" : "agenda";
}

function isViewMode(v: string | undefined): v is ViewMode {
  return v === "agenda" || v === "month" || v === "week";
}

// Persisted-filter JSON shape (SETTING_KEYS.calendarFilters). Each
// field is validated on restore — a malformed or partial blob falls
// back per-field to the default rather than crashing the page.
interface StoredCalendarFilters {
  category?: unknown;
  projectId?: unknown;
  mine?: unknown;
  eventsOnly?: unknown;
}

export default function CalendarPage() {
  const {
    projects,
    posts,
    exchanges,
    currentMember,
    projectTasks,
    events,
    eventCancellations,
    eventProjectLinks,
    eventRsvps,
  } = useApp();
  const { t, i18n } = useTranslation();
  const keyboardOpen = useVirtualKeyboardOpen();

  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    defaultViewForWidth(
      typeof window !== "undefined" ? window.innerWidth : 320,
    ),
  );
  const [overrideView, setOverrideView] = useState<boolean>(false);

  // Track viewport for the breakpoint-derived default. Once the
  // member picks a view explicitly, we stop following the breakpoint.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (overrideView) return;
    function onResize() {
      setViewMode(defaultViewForWidth(window.innerWidth));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [overrideView]);

  // Free-text so an event-specific category ("social" etc.) — outside the
  // legacy `Category` enum — can be selected. "" means no filter.
  const [category, setCategory] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [mine, setMine] = useState<boolean>(false);
  // "Events only" filter chip — additive on top of the other filters
  // (the design-doc §9 model treats it as a view filter, not a category
  // swap). When on, the entry list passed to the views narrows to
  // `kind: "event"` only — project deadlines, post expiries, and the
  // density indicator drop out.
  const [eventsOnly, setEventsOnly] = useState<boolean>(false);

  // Persistence (view + filters). This DELIBERATELY reverses the
  // earlier session-only choice: the operator approved persistence for
  // the calendar specifically — the stored state is device-local Dexie
  // settings (never federated), so there's no ethos concern. Paging /
  // offset state is intentionally NOT persisted: the calendar always
  // opens anchored on today.
  //
  // `hydrated` gates the write-through effect below so the defaults
  // rendered during the async restore never clobber the stored values.
  const [hydrated, setHydrated] = useState<boolean>(false);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [storedView, storedFilters] = await Promise.all([
        getSetting(SETTING_KEYS.calendarViewMode),
        getSetting(SETTING_KEYS.calendarFilters),
      ]);
      if (cancelled) return;
      if (isViewMode(storedView)) {
        // A stored view is an explicit past choice — honour it and stop
        // following the breakpoint, same as a fresh pill click.
        setViewMode(storedView);
        setOverrideView(true);
      }
      if (storedFilters) {
        try {
          const parsed = JSON.parse(storedFilters) as StoredCalendarFilters;
          if (typeof parsed.category === "string") setCategory(parsed.category);
          if (typeof parsed.projectId === "string")
            setProjectId(parsed.projectId);
          if (typeof parsed.mine === "boolean") setMine(parsed.mine);
          if (typeof parsed.eventsOnly === "boolean")
            setEventsOnly(parsed.eventsOnly);
        } catch {
          // Malformed blob — keep the defaults; the next change
          // overwrites it with a well-formed one.
        }
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Write-through on any filter change, one JSON blob per change. No
  // debounce: every control is a select / chip that changes at most
  // once per interaction, so per-change single writes are already the
  // floor.
  useEffect(() => {
    if (!hydrated) return;
    void setSetting(
      SETTING_KEYS.calendarFilters,
      JSON.stringify({ category, projectId, mine, eventsOnly }),
    );
  }, [hydrated, category, projectId, mine, eventsOnly]);

  // Paging offsets for the month and week views (0 = the period
  // containing "now"). Session-local, one per view so switching views
  // doesn't lose the member's place — and deliberately NOT persisted
  // (unlike view + filters above): the calendar always opens anchored
  // on today. The page owns these (rather than the view components)
  // because the ENTRIES WINDOW must follow the view: a fixed
  // 30-back/60-forward window would render a paged-ahead month as
  // empty even when events exist there.
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const now = Date.now();
  // Union of the default window with the currently-viewed period —
  // at offset 0 the agenda / density behavior is unchanged; when
  // paged, the window widens to cover what the grid is showing.
  const { windowStart, windowEnd } = calendarViewWindow({
    now,
    defaultStart: now - WINDOW_BACK_MS,
    defaultEnd: now + WINDOW_FORWARD_MS,
    view: viewMode,
    offset:
      viewMode === "month" ? monthOffset : viewMode === "week" ? weekOffset : 0,
  });

  const myKey = currentMember?.publicKey ?? null;

  // "Mine" filter: projects I organize / co-organize / have claimed
  // tasks on, posts I authored. The exchange-density rows are NEVER
  // filtered by mine — density is community metabolism by design.
  const filteredProjects = useMemo<readonly Project[]>(() => {
    let out: readonly Project[] = projects;
    if (category) out = out.filter((p) => p.category === category);
    if (projectId) out = out.filter((p) => p.id === projectId);
    if (mine && myKey) {
      const myProjectIds = new Set<string>();
      // `isOrganizer` reads `Project.coOrganizerKeys` — the live
      // authority list a freshly-accepted co-organizer already lands in
      // (materialized on accept since PR #238), and the list a
      // stepped-down or handoff-demoted member is correctly in/out of.
      // See `docs/co-organizer-invitations.md` §5.
      for (const p of projects) {
        if (isOrganizer(p, myKey)) myProjectIds.add(p.id);
      }
      for (const tk of projectTasks) {
        if (tk.assignedTo === myKey) myProjectIds.add(tk.projectId);
      }
      out = out.filter((p) => myProjectIds.has(p.id));
    }
    return out;
  }, [projects, projectTasks, category, projectId, mine, myKey]);

  const filteredPosts = useMemo<readonly Post[]>(() => {
    let out: readonly Post[] = posts;
    if (category) out = out.filter((p) => p.category === category);
    // Posts aren't tied to a project — when projectId is set, drop
    // post-expiring entries entirely (the member is focused on a
    // single project's timeline).
    if (projectId) return [];
    if (mine && myKey) {
      out = out.filter((p) => p.postedBy === myKey);
    }
    return out;
  }, [posts, category, projectId, mine, myKey]);

  // Density is intentionally NOT filtered by Mine — that would be a
  // per-member metric, which is the failure mode the design doc names
  // (§5: "Member-specific calendars"). Category-filter also doesn't
  // narrow density: density is community-wide.
  const filteredExchanges = useMemo<readonly Exchange[]>(() => {
    if (projectId || category || mine) return [];
    return exchanges;
  }, [exchanges, projectId, category, mine]);

  // Event filters compose (project AND category AND mine):
  //  - project: this project's work days (plan 10) via the link set.
  //  - category: the event's free-text category (incl. the event-specific
  //    social / celebration / learning vocabulary).
  //  - mine: events I organize OR RSVP'd going/maybe to — own data only,
  //    the same status the "you're going" marker reads. Default off, so
  //    the calendar stays community-wide until a member opts to narrow.
  const filteredEvents = useMemo<readonly Event[]>(() => {
    let out: readonly Event[] = events;
    if (projectId) {
      const linkedIds = new Set(
        eventProjectLinks
          .filter((l) => l.projectId === projectId)
          .map((l) => l.eventId),
      );
      out = out.filter((e) => linkedIds.has(e.id));
    }
    if (category) {
      out = out.filter((e) => e.category === category);
    }
    if (mine && myKey) {
      const onMyRadar = new Set<string>();
      for (const r of eventRsvps) {
        if (
          r.memberKey === myKey &&
          (r.status === "going" || r.status === "maybe")
        ) {
          onMyRadar.add(r.eventId);
        }
      }
      out = out.filter((e) => e.createdBy === myKey || onMyRadar.has(e.id));
    }
    return out;
  }, [events, eventProjectLinks, eventRsvps, projectId, category, mine, myKey]);

  // Categories actually present across projects, posts, and events, so the
  // filter offers exactly what's filterable — including the event-specific
  // vocabulary (social / celebration / learning) — and drops categories
  // with no data. Mirrors TemplatePicker's category filter.
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) set.add(p.category);
    for (const p of posts) set.add(p.category);
    for (const e of events) set.add(e.category);
    const label = (c: string) =>
      t(`categories.${c}`, { defaultValue: prettifyCategory(c) });
    return Array.from(set).sort((a, b) =>
      label(a).localeCompare(label(b), i18n.language),
    );
  }, [projects, posts, events, t, i18n.language]);

  const allEntries = useMemo(
    () =>
      buildCalendar({
        projects: filteredProjects,
        posts: filteredPosts,
        exchanges: filteredExchanges,
        events: filteredEvents,
        eventCancellations,
        currentMemberKey: myKey,
        eventRsvps,
        windowStart,
        windowEnd,
      }),
    [
      filteredProjects,
      filteredPosts,
      filteredExchanges,
      filteredEvents,
      eventCancellations,
      myKey,
      eventRsvps,
      windowStart,
      windowEnd,
    ],
  );

  // The "Events only" filter narrows the displayed list to event
  // entries. The build step is unchanged so toggling the chip on and
  // off doesn't re-walk the source rows.
  const entries = useMemo<CalendarEntry[]>(
    () =>
      eventsOnly ? allEntries.filter((e) => e.kind === "event") : allEntries,
    [allEntries, eventsOnly],
  );

  const view = (mode: ViewMode) => () => {
    setOverrideView(true);
    setViewMode(mode);
    // Persist the explicit pick (device-local; see the restore effect).
    void setSetting(SETTING_KEYS.calendarViewMode, mode);
  };

  // How many filters are currently narrowing the calendar. Drives the
  // "Filters · N active" summary on the filter row and the
  // filtered-empty split below (mirrors Board's `filtersActive`).
  const activeFilterCount =
    (category !== "" ? 1 : 0) +
    (projectId !== "" ? 1 : 0) +
    (mine ? 1 : 0) +
    (eventsOnly ? 1 : 0);
  const filtersActive = activeFilterCount > 0;

  const resetFilters = () => {
    setCategory("");
    setProjectId("");
    setMine(false);
    setEventsOnly(false);
  };

  // Viewer-ownership sets for the agenda's commitment weighting —
  // "yours" means the viewer organizes / co-organizes the project, or
  // authored the post. Derived from rows the page already holds and the
  // viewer's own key; personal-view only, nothing new is stored or
  // federated (no-leaderboards: own data, never counts).
  const viewerProjectIds = useMemo<ReadonlySet<string>>(() => {
    const ids = new Set<string>();
    if (myKey) {
      for (const p of projects) {
        if (isOrganizer(p, myKey)) ids.add(p.id);
      }
    }
    return ids;
  }, [projects, myKey]);
  const viewerPostIds = useMemo<ReadonlySet<string>>(() => {
    const ids = new Set<string>();
    if (myKey) {
      for (const p of posts) {
        if (p.postedBy === myKey) ids.add(p.id);
      }
    }
    return ids;
  }, [posts, myKey]);

  return (
    <div className="px-4 pb-36 pt-stack-md">
      <header className="mb-stack-md">
        <h1 className="page-title">{t("calendar.title")}</h1>
        <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
          {t("calendar.tagline")}
        </p>
      </header>

      {/* View toggle pills. Three modes, breakpoint-derived default
          unless the member has picked one explicitly this session. */}
      <div
        role="tablist"
        aria-label={t("calendar.title")}
        className="mb-stack-sm flex gap-1"
      >
        {(["agenda", "month", "week"] as const).map((mode) => (
          <button
            key={mode}
            role="tab"
            aria-selected={viewMode === mode}
            onClick={view(mode)}
            className={[
              "rounded-full px-3 py-1 text-sm",
              viewMode === mode
                ? "bg-canopy-700 text-white"
                : "bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-900 dark:text-moss-200 dark:hover:bg-moss-800",
            ].join(" ")}
          >
            {t(`calendar.views.${mode}`)}
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="mb-stack-md flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-xs text-moss-600 dark:text-moss-300">
          <span className="sr-only">{t("calendar.filters.category")}</span>
          <select
            className="input py-1 text-xs"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label={t("calendar.filters.category")}
          >
            <option value="">{t("calendar.filters.allCategories")}</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {t(`categories.${c}`, { defaultValue: prettifyCategory(c) })}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1 text-xs text-moss-600 dark:text-moss-300">
          <span className="sr-only">{t("calendar.filters.project")}</span>
          <select
            className="input py-1 text-xs"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            aria-label={t("calendar.filters.project")}
          >
            <option value="">{t("calendar.filters.allProjects")}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        {/* "Mine" gets the same labeled-chip treatment as the
            Events-only chip beside it — a proper toggle rather than a
            bare checkbox lost among the selects. */}
        <button
          type="button"
          onClick={() => setMine((v) => !v)}
          aria-pressed={mine}
          disabled={!myKey}
          className={[
            "rounded-full px-3 py-1 text-xs disabled:opacity-50",
            mine
              ? "bg-canopy-700 text-white"
              : "bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700",
          ].join(" ")}
        >
          {t("calendar.filters.mine")}
        </button>
        <button
          type="button"
          onClick={() => setEventsOnly((v) => !v)}
          aria-pressed={eventsOnly}
          className={[
            "rounded-full px-3 py-1 text-xs",
            eventsOnly
              ? "bg-canopy-700 text-white"
              : "bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700",
          ].join(" ")}
        >
          {t("events.calendar.eventsOnlyChip")}
        </button>
        {/* Active-filter summary — same signal Board's `filtersActive`
            drives, rendered as a quiet count beside the controls so a
            member can see at a glance that the calendar is narrowed. */}
        {filtersActive ? (
          <span className="text-xs text-moss-600 dark:text-moss-300">
            {t("calendar.filters.active", { count: activeFilterCount })}
          </span>
        ) : null}
      </div>

      {entries.length === 0 ? (
        filtersActive ? (
          // Filter-empty: the filters are why it's empty — say so and
          // give a one-tap escape (mirrors Board's #227 pattern) rather
          // than the truly-empty copy, which would read as "the
          // community has nothing" when it's just a narrow filter.
          <div className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
            <p>{t("calendar.empty.filtered")}</p>
            <button
              type="button"
              className="mt-2 text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
              onClick={resetFilters}
            >
              {t("calendar.empty.clearFilters")}
            </button>
          </div>
        ) : (
          <EmptyState
            illustration="sapling"
            title={t("calendar.empty.title")}
            message={t("calendar.empty.body")}
          />
        )
      ) : viewMode === "agenda" ? (
        <CalendarAgenda
          entries={entries}
          locale={i18n.language}
          viewerProjectIds={viewerProjectIds}
          viewerPostIds={viewerPostIds}
        />
      ) : viewMode === "month" ? (
        <CalendarMonth
          entries={entries}
          anchorMs={addUTCMonths(now, monthOffset)}
          locale={i18n.language}
          onPrevMonth={() =>
            setMonthOffset((o) => Math.max(o - 1, -MAX_MONTH_OFFSET))
          }
          onNextMonth={() =>
            setMonthOffset((o) => Math.min(o + 1, MAX_MONTH_OFFSET))
          }
          onJumpToToday={() => setMonthOffset(0)}
          canPrev={monthOffset > -MAX_MONTH_OFFSET}
          canNext={monthOffset < MAX_MONTH_OFFSET}
          atToday={monthOffset === 0}
        />
      ) : (
        <CalendarWeek
          entries={entries}
          anchorMs={startOfUTCWeek(now) + weekOffset * WEEK_MS}
          locale={i18n.language}
          onPrevWeek={() =>
            setWeekOffset((o) => Math.max(o - 1, -MAX_WEEK_OFFSET))
          }
          onNextWeek={() =>
            setWeekOffset((o) => Math.min(o + 1, MAX_WEEK_OFFSET))
          }
          canPrev={weekOffset > -MAX_WEEK_OFFSET}
          canNext={weekOffset < MAX_WEEK_OFFSET}
        />
      )}

      {/* "+" FAB linking to /events/new. Matches the Board FAB's
          anchor (5rem + the safe-area inset, so the home-indicator
          band that also heightens the BottomNav can't swallow the
          pill's bottom edge) + pb-36 page clearance discipline from
          PR #181 so the last calendar cell never tucks under the
          floating button. Hidden while the on-screen keyboard is up —
          the fixed anchor would float detached mid-screen (see
          useVirtualKeyboard.ts). */}
      {!keyboardOpen && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 flex justify-center px-4 lg:bottom-6 lg:justify-end lg:px-8">
          <div className="pointer-events-auto flex gap-2 rounded-full bg-canopy-50 p-1 shadow-xl ring-1 ring-canopy-200 dark:bg-moss-800 dark:ring-moss-700">
            <Link
              to="/events/new"
              aria-label={t("events.calendar.fabAriaLabel")}
              className="btn-primary"
            >
              <span aria-hidden="true">+</span> {t("events.new.title")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
