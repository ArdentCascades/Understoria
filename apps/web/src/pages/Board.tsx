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
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { trustStatusWithInvites, type TrustStatus } from "@/lib/vouch";
import { PostCard } from "@/components/PostCard";
import { ProjectCard } from "@/components/ProjectCard";
import { AttentionSection } from "@/components/AttentionSection";
import { EmptyState } from "@/components/EmptyState";
import { ContextualHint } from "@/components/ContextualHint";
import { FirstActionNudge } from "@/components/FirstActionNudge";
import { ProfileNudge } from "@/components/ProfileNudge";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { matchesQuery } from "@/lib/messageSearch";
import { hasOpenTasks } from "@/lib/projectFilter";
import { parseTabParam, tabToParam, type BoardTab } from "@/lib/boardTab";
import type {
  Category,
  Project,
  ProjectCategory,
  Urgency,
} from "@/types";

const URGENCY_VALUES: Array<"" | Urgency> = ["", "high", "medium", "low"];

export default function BoardPage() {
  const {
    posts,
    members,
    currentMember,
    projects,
    projectTasks,
    vouches,
    invites,
    nodeId,
  } = useApp();
  const { t } = useTranslation();
  // Tab lives in the URL as `?tab=needs|offers|projects` so back-
  // buttons elsewhere in the app can deep-link to a specific tab
  // (e.g. ProjectDetail → `/?tab=projects`), browser back/forward
  // works naturally across tab switches, and Board URLs are
  // shareable. Other Board state (search query, filters, claimed
  // toggle) stays local React state — session-only is intentional.
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTabParam(searchParams.get("tab"));
  const setTab = (next: BoardTab) => {
    // Copy existing params so any future query/filter URL params
    // aren't blown away on tab change. `replace: true` keeps
    // browser history clean — switching tabs shouldn't burn
    // back-button entries.
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabToParam(next));
    setSearchParams(params, { replace: true });
  };
  const [categoryFilter, setCategoryFilter] = useState<Category | "">("");
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | "">("");
  // Live input value (every keystroke) + debounced value (250 ms after
  // last keystroke). Debouncing keeps the list from re-filtering on
  // every keystroke mid-word; the input itself stays responsive.
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  // Hide claimed posts by default — the Board is action-oriented
  // ("what can I help with now?") and a claimed post isn't
  // actionable for a new helper. Toggle persists for the session
  // (not across reloads); a member who wants always-on can flip
  // it each session.
  const [showClaimed, setShowClaimed] = useState(false);
  // Project-tab filters. Deliberately separate from the post-tab
  // category / urgency / zone filters above: a member might filter
  // Needs by `food` and want their Projects-tab category-filter to
  // start fresh. Session-only state (no URL persistence) matches
  // the rest of the Board — only the tab selection lives in the URL.
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<
    ProjectCategory | ""
  >("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<
    Project["status"] | ""
  >("");
  const [onlyWithOpenTasks, setOnlyWithOpenTasks] = useState(false);
  const navigate = useNavigate();

  // Debounce the visible→filtered transition. 250 ms matches the
  // Messages search debounce; small enough to feel live, long enough
  // to skip mid-word re-filters.
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(id);
  }, [query]);

  // Search is scoped to the current tab. Switching tabs clears the
  // input — a fresh tab gets a fresh search rather than a sticky
  // query that may not be meaningful in the new context.
  useEffect(() => {
    setQuery("");
    setDebouncedQuery("");
  }, [tab]);

  const memberName = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) map.set(m.publicKey, m.displayName);
    return map;
  }, [members]);

  // Map member key → availabilityChips so each OFFER card can surface
  // its poster's coarse availability without per-row lookups. Empty
  // chip lists render nothing; cross-node posts skip this entirely
  // (chips don't federate).
  const availabilityByKey = useMemo(() => {
    const map = new Map<string, typeof members[number]["availabilityChips"]>();
    for (const m of members) map.set(m.publicKey, m.availabilityChips);
    return map;
  }, [members]);

  // Precompute trust state for every member so each PostCard can
  // surface its poster's trust state without recomputing per row.
  // Cheap (one Set per member) but worth doing once at the list
  // level rather than O(posts × vouches) per scroll.
  const trustByKey = useMemo(() => {
    const map = new Map<string, TrustStatus>();
    for (const m of members) {
      map.set(
        m.publicKey,
        trustStatusWithInvites(m.publicKey, { vouches, invites }),
      );
    }
    return map;
  }, [members, vouches, invites]);

  const zones = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) {
      if (p.locationZone) set.add(p.locationZone);
    }
    return [...set].sort();
  }, [posts]);

  // Two-stage filter: `matchingPosts` is everything in scope for
  // the current tab + category + urgency + query. From there, the
  // default view hides any post that already has a claimer; the
  // "Show N claimed" toggle adds them back in.
  //
  // The query check reuses `matchesQuery` from lib/messageSearch.ts
  // (case-insensitive, trimmed, empty-query short-circuits to false).
  // When the debounced query is empty we skip the predicate entirely
  // so unfiltered scrolling stays the cheapest path.
  const matchingPosts = useMemo(() => {
    const q = debouncedQuery.trim();
    return posts.filter((p) => {
      if (p.type !== tab) return false;
      if (p.status === "cancelled") return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (urgencyFilter && p.urgency !== urgencyFilter) return false;
      if (zoneFilter && p.locationZone !== zoneFilter) return false;
      if (q !== "") {
        if (!matchesQuery(`${p.title} ${p.description}`, q)) return false;
      }
      return true;
    });
  }, [posts, tab, categoryFilter, urgencyFilter, zoneFilter, debouncedQuery]);

  const claimedInScope = useMemo(
    () => matchingPosts.filter((p) => p.claimedBy !== null).length,
    [matchingPosts],
  );

  const visiblePosts = useMemo(
    () =>
      showClaimed
        ? matchingPosts
        : matchingPosts.filter((p) => p.claimedBy === null),
    [matchingPosts, showClaimed],
  );

  const openCount = useMemo(() => {
    return {
      NEED: posts.filter((p) => p.type === "NEED" && p.status === "open")
        .length,
      OFFER: posts.filter((p) => p.type === "OFFER" && p.status === "open")
        .length,
    };
  }, [posts]);

  // Project-tab filter composition. All three new filters (category /
  // status / open-tasks) AND with the existing project search from
  // PR #107. Archived projects never appear here regardless of
  // selection — the dedicated "View archive" link below remains the
  // only entry point. That's why `archived` is intentionally absent
  // from the status dropdown (see board.projectFilters.status.* keys).
  const visibleProjects = useMemo(() => {
    const q = debouncedQuery.trim();
    return projects.filter((p) => {
      if (p.status === "archived") return false;
      if (projectCategoryFilter && p.category !== projectCategoryFilter)
        return false;
      if (projectStatusFilter && p.status !== projectStatusFilter) return false;
      if (onlyWithOpenTasks && !hasOpenTasks(p.id, projectTasks)) return false;
      if (q !== "" && !matchesQuery(`${p.title} ${p.description}`, q))
        return false;
      return true;
    });
  }, [
    projects,
    projectTasks,
    projectCategoryFilter,
    projectStatusFilter,
    onlyWithOpenTasks,
    debouncedQuery,
  ]);

  const projectFiltersActive =
    projectCategoryFilter !== "" ||
    projectStatusFilter !== "" ||
    onlyWithOpenTasks;

  return (
    <div className="px-4 pb-32 pt-4">
      <header className="mb-4">
        <h1 className="page-title">{t("board.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("board.tagline")}
        </p>
      </header>

      <FirstActionNudge />
      <ProfileNudge />
      <ContextualHint
        settingKey="boardHintDismissed"
        ariaLabel={t("hints.board.label")}
        message={t("hints.board.message")}
        technicalDetail={t("hints.board.technical")}
      />

      {/* Phase 2.1: at lg+ the Board reflows into a 3-column rail
          layout — filters become a sticky left rail, AttentionSection
          a sticky right rail, around the middle reading column. Below
          lg the `lg:*` classes are inert and the grid collapses to
          single-column DOM order: AttentionSection → tablist → search
          → filters → list, which matches the pre-Phase-2 layout
          exactly. Implemented with CSS grid placement (no DOM
          duplication), so screen-reader and tab order follow source
          order at every breakpoint.

          The right rail is reserved exclusively for AttentionSection.
          Do NOT dock additional informational components here —
          adding a "trending categories" / "active now" / unread-count
          panel by accretion would violate the no-notifications and
          no-leaderboards principles. AttentionSection itself remains
          curated, renders null when empty, and adds no badge count. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)_280px] lg:items-start lg:gap-6">
        <div className="lg:col-start-3 lg:row-start-1 lg:self-start lg:sticky lg:top-4">
          <AttentionSection />
        </div>

        <div
          role="tablist"
          aria-label={t("board.tabs.ariaLabel")}
          className="grid grid-cols-3 rounded-full bg-moss-100 p-1 dark:bg-moss-900 lg:col-start-2 lg:row-start-1"
        >
          {(["NEED", "OFFER", "PROJECTS"] as const).map((tt) => (
            <button
              key={tt}
              role="tab"
              aria-selected={tab === tt}
              onClick={() => setTab(tt)}
              className={`touch-target rounded-full text-sm font-semibold transition-colors ${
                tab === tt
                  ? "bg-white text-canopy-800 shadow-sm dark:bg-moss-950 dark:text-canopy-200"
                  : "text-moss-700 dark:text-moss-300"
              }`}
            >
              {tt === "NEED"
                ? t("board.tabs.needs")
                : tt === "OFFER"
                  ? t("board.tabs.offers")
                  : t("projects.tab")}
              {tt !== "PROJECTS" && (
                <span className="ml-1 text-xs text-moss-500 dark:text-moss-400">
                  {t("board.openCount", { count: openCount[tt] })}
                </span>
              )}
            </button>
          ))}
        </div>

        <label className="block md:max-w-md lg:col-start-2 lg:row-start-2">
          <span className="sr-only">
            {t(
              tab === "PROJECTS"
                ? "board.search.placeholderProjects"
                : "board.search.placeholderPosts",
            )}
          </span>
          <input
            type="search"
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              tab === "PROJECTS"
                ? "board.search.placeholderProjects"
                : "board.search.placeholderPosts",
            )}
          />
        </label>

        {tab !== "PROJECTS" && (
        <>
        <div className="lg:col-start-1 lg:row-start-1 lg:self-start lg:sticky lg:top-4">
          <div className="grid gap-2 sm:grid-cols-3 md:max-w-2xl lg:grid-cols-1">
            <label className="sr-only" htmlFor="category-filter">
              {t("board.filters.categoryAriaLabel")}
            </label>
            <select
              id="category-filter"
              className="input"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as Category | "")
              }
            >
              <option value="">{t("board.filters.allCategories")}</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_META[c].emoji} {t(`categories.${c}`)}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="urgency-filter">
              {t("board.filters.urgencyAriaLabel")}
            </label>
            <select
              id="urgency-filter"
              className="input"
              value={urgencyFilter}
              onChange={(e) =>
                setUrgencyFilter(e.target.value as Urgency | "")
              }
            >
              {URGENCY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value === ""
                    ? t("board.filters.allUrgencies")
                    : t(`urgency.${value}`)}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="zone-filter">
              {t("board.filters.zoneAriaLabel")}
            </label>
            <select
              id="zone-filter"
              className="input"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
            >
              <option value="">{t("board.filters.allZones")}</option>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {claimedInScope > 0 && (
            <div className="mt-3 flex justify-end lg:justify-start">
              <button
                type="button"
                onClick={() => setShowClaimed((v) => !v)}
                aria-pressed={showClaimed}
                className="rounded-full bg-moss-100 px-3 py-1 text-xs font-medium text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
              >
                {showClaimed
                  ? t("board.hideClaimed", { count: claimedInScope })
                  : t("board.showClaimed", { count: claimedInScope })}
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-start-2 lg:row-start-3">
          {visiblePosts.length === 0 ? (
            debouncedQuery.trim() !== "" ? (
              <p className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
                {t("board.search.noMatches")}
              </p>
            ) : (
              <EmptyState
                illustration="sapling"
                title={
                  tab === "NEED"
                    ? t("board.empty.titleNeeds")
                    : t("board.empty.titleOffers")
                }
                message={
                  tab === "NEED" ? t("board.empty.needs") : t("board.empty.offers")
                }
              />
            )
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
              {visiblePosts.map((p) => (
                <li key={p.id}>
                  <PostCard
                    post={p}
                    posterName={memberName.get(p.postedBy) ?? ""}
                    isCurrentMember={p.postedBy === currentMember?.publicKey}
                    posterTrust={trustByKey.get(p.postedBy)}
                    isCrossNode={p.nodeId !== nodeId && p.nodeId !== ""}
                    posterAvailabilityChips={availabilityByKey.get(p.postedBy)}
                    searchQuery={debouncedQuery}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
        </>
        )}

        {tab === "PROJECTS" && (
          <>
            <div className="lg:col-start-1 lg:row-start-1 lg:self-start lg:sticky lg:top-4">
              <div className="grid gap-2 sm:grid-cols-3 md:max-w-2xl lg:grid-cols-1">
                <label className="sr-only" htmlFor="project-category-filter">
                  {t("board.projectFilters.category.ariaLabel")}
                </label>
                <select
                  id="project-category-filter"
                  className="input"
                  value={projectCategoryFilter}
                  onChange={(e) =>
                    setProjectCategoryFilter(e.target.value as ProjectCategory | "")
                  }
                  aria-label={t("board.projectFilters.category.ariaLabel")}
                >
                  <option value="">
                    {t("board.projectFilters.category.all")}
                  </option>
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_META[c].emoji} {t(`categories.${c}`)}
                    </option>
                  ))}
                  {/* Project-only extension categories. Mirrors the
                      hardcoded options in ProjectNew.tsx — these three
                      don't have entries in the `categories.*` i18n
                      namespace (post types never use them), so they're
                      written out inline rather than gaining new keys. */}
                  <option value="infrastructure">🏗️ Infrastructure</option>
                  <option value="organizing">📋 Organizing</option>
                  <option value="mutual_aid_drive">💛 Mutual aid drive</option>
                </select>
                <label className="sr-only" htmlFor="project-status-filter">
                  {t("board.projectFilters.status.ariaLabel")}
                </label>
                <select
                  id="project-status-filter"
                  className="input"
                  value={projectStatusFilter}
                  onChange={(e) =>
                    setProjectStatusFilter(
                      e.target.value as Project["status"] | "",
                    )
                  }
                  aria-label={t("board.projectFilters.status.ariaLabel")}
                >
                  <option value="">{t("board.projectFilters.status.all")}</option>
                  <option value="planning">
                    {t("board.projectFilters.status.planning")}
                  </option>
                  <option value="active">
                    {t("board.projectFilters.status.active")}
                  </option>
                  <option value="paused">
                    {t("board.projectFilters.status.paused")}
                  </option>
                  <option value="completed">
                    {t("board.projectFilters.status.completed")}
                  </option>
                  {/* `archived` is intentionally NOT an option. Archived
                      projects are reached only via the "View archive"
                      link below; the Projects tab never lists them. */}
                </select>
                <button
                  type="button"
                  onClick={() => setOnlyWithOpenTasks((v) => !v)}
                  aria-pressed={onlyWithOpenTasks}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    onlyWithOpenTasks
                      ? "bg-canopy-100 text-canopy-900 hover:bg-canopy-200 dark:bg-canopy-900/60 dark:text-canopy-100"
                      : "bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
                  }`}
                >
                  {t("board.projectFilters.openTasks.toggle")}
                </button>
              </div>
            </div>

            <div className="lg:col-start-2 lg:row-start-3">
              <ProjectList
                projects={visibleProjects}
                projectTasks={projectTasks}
                memberName={memberName}
                searchQuery={debouncedQuery}
                filtersActive={projectFiltersActive}
              />
            </div>

            {/* Archive link sits below the project list at every
                breakpoint (a rarely-needed jump-off, not a primary
                control). At lg+ it's placed at the bottom of the
                left rail (col 1 row 2), below the sticky filters;
                at &lt;lg it appears below the list per source order.
                Kept as its own grid item so the mobile DOM order
                stays filters → list → archive, matching pre-2.1. */}
            <Link
              to="/projects/archive"
              className="mt-3 block text-center text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:text-left"
            >
              {t("projects.archive.viewArchive")}
            </Link>
          </>
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-20 flex justify-center px-4">
        <div className="pointer-events-auto flex gap-2 rounded-full bg-canopy-50 p-1 shadow-xl ring-1 ring-canopy-200 dark:bg-moss-800 dark:ring-moss-700">
          {tab === "PROJECTS" ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/project/new")}
            >
              <span aria-hidden="true">{"\u{1F331}"}</span>{" "}
              {t("projects.fab")}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(`/post/new?type=NEED`)}
              >
                <span aria-hidden="true">{"➕"}</span> {t("board.fab.postNeed")}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate(`/post/new?type=OFFER`)}
              >
                <span aria-hidden="true">{"\u{1F91D}"}</span>{" "}
                {t("board.fab.postOffer")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectList({
  projects,
  projectTasks,
  memberName,
  searchQuery,
  filtersActive,
}: {
  /** Projects to render. Already filtered by the parent — this
   *  component does NOT re-apply category / status / open-task
   *  filters or the search query; it just renders the list and
   *  picks the right empty state. */
  projects: import("@/types").Project[];
  projectTasks: import("@/types").ProjectTask[];
  memberName: Map<string, string>;
  /** Used by ProjectCard to highlight matched substrings. */
  searchQuery: string;
  /** True iff at least one of the three project-tab filters is
   *  narrowing the list. Drives the "Nothing matches your filters."
   *  empty state. */
  filtersActive: boolean;
}) {
  const { t } = useTranslation();
  const tasksByProject = useMemo(() => {
    const map = new Map<string, { total: number; open: number }>();
    for (const task of projectTasks) {
      const counts = map.get(task.projectId) ?? { total: 0, open: 0 };
      counts.total += 1;
      if (task.status === "open") counts.open += 1;
      map.set(task.projectId, counts);
    }
    return map;
  }, [projectTasks]);

  const trimmedQuery = searchQuery.trim();

  if (projects.length === 0) {
    // Empty-state priority: search > filters > "no projects yet".
    // An active search query is the most specific narrowing signal
    // a member is currently looking through, so it wins. Filters
    // win over the global empty state.
    if (trimmedQuery !== "") {
      return (
        <p className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
          {t("board.search.noMatches")}
        </p>
      );
    }
    if (filtersActive) {
      return (
        <p className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
          {t("board.projectFilters.emptyForFilters")}
        </p>
      );
    }
    return (
      <EmptyState
        illustration="book"
        title={t("projects.emptyTitle")}
        message={t("projects.empty")}
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((p) => {
        const counts = tasksByProject.get(p.id) ?? { total: 0, open: 0 };
        return (
          <li key={p.id}>
            <ProjectCard
              project={p}
              organizerName={memberName.get(p.organizerKey) ?? "Member"}
              taskCount={counts.total}
              openTaskCount={counts.open}
              searchQuery={searchQuery}
            />
          </li>
        );
      })}
    </ul>
  );
}

