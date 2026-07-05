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
import { BoardNudges } from "@/components/BoardNudges";
import { matchesQuery } from "@/lib/messageSearch";
import { myClaimedTasks } from "@/lib/myTasks";
import {
  useVirtualKeyboardOpen,
  useVisualViewportBottomGap,
  visualViewportGlueStyle,
} from "@/lib/useVirtualKeyboard";
import { myOrganizedProjects } from "@/lib/myProjects";
import { hasOpenTasks, projectNeedsMoreHands } from "@/lib/projectFilter";
import { parseTabParam, tabToParam, type BoardTab } from "@/lib/boardTab";
import { PostFilterRail } from "@/components/board/PostFilterRail";
import { ProjectFilterRail } from "@/components/board/ProjectFilterRail";
import type {
  Category,
  Project,
  ProjectCategory,
  ProjectTask,
  Urgency,
} from "@/types";

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
    nodeConfig,
    blockedKeys,
  } = useApp();
  const { t } = useTranslation();
  const keyboardOpen = useVirtualKeyboardOpen();
  // Same visual-viewport correction as the BottomNav (see
  // useVirtualKeyboard.ts) so the FAB never floats mid-screen in
  // iOS's post-keyboard stuck state.
  const bottomGap = useVisualViewportBottomGap();
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
  // Mobile-only "Filters" disclosure. Below sm (640px) the filter
  // rail's selects stack full-width between the sticky search and the
  // first card (~150px of chrome), so the rail collapses behind a
  // loud full-width trigger there. At sm+ the rail lays out as a
  // 3-across row and is always visible (the trigger is `sm:hidden`),
  // so this state has no effect at wider viewports. Default
  // collapsed; deliberately NOT persisted — session-local at most,
  // matching the filter values themselves. Shared across tabs (the
  // disclosure is one control; which rail it reveals follows the tab).
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
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
  const [onlyNeedsMoreHands, setOnlyNeedsMoreHands] = useState(false);
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
  // Set of project ids with at least one "could use more hands" task,
  // computed only when the toggle is on (null = filter off → zero cost
  // on the default path) and in its own memo so it doesn't recompute on
  // every search keystroke. Tasks are bucketed by project in one pass,
  // so the whole thing is O(tasks), not O(projects × tasks). `now` is
  // captured at memo time and deliberately left out of the deps — the
  // same staleness posture the attention rail's memo uses.
  const needsMoreHandsIds = useMemo<ReadonlySet<string> | null>(() => {
    if (!onlyNeedsMoreHands) return null;
    const now = Date.now();
    const byProject = new Map<string, ProjectTask[]>();
    for (const task of projectTasks) {
      const list = byProject.get(task.projectId);
      if (list) list.push(task);
      else byProject.set(task.projectId, [task]);
    }
    const ids = new Set<string>();
    for (const [projectId, scoped] of byProject) {
      if (projectNeedsMoreHands(projectId, scoped, nodeConfig, now)) {
        ids.add(projectId);
      }
    }
    return ids;
  }, [onlyNeedsMoreHands, projectTasks, nodeConfig]);

  const visibleProjects = useMemo(() => {
    const q = debouncedQuery.trim();
    return projects.filter((p) => {
      if (p.status === "archived") return false;
      if (projectCategoryFilter && p.category !== projectCategoryFilter)
        return false;
      if (projectStatusFilter && p.status !== projectStatusFilter) return false;
      if (onlyWithOpenTasks && !hasOpenTasks(p.id, projectTasks)) return false;
      if (onlyNeedsMoreHands && !needsMoreHandsIds?.has(p.id)) return false;
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
    onlyNeedsMoreHands,
    needsMoreHandsIds,
    debouncedQuery,
  ]);

  const projectFiltersActive =
    projectCategoryFilter !== "" ||
    projectStatusFilter !== "" ||
    onlyWithOpenTasks ||
    onlyNeedsMoreHands;

  // How many project-tab filters are narrowing right now — feeds the
  // mobile disclosure trigger's "Filters · N active" variant so a
  // member never wonders why a collapsed rail is shortening the list.
  const activeProjectFilterCount =
    (projectCategoryFilter !== "" ? 1 : 0) +
    (projectStatusFilter !== "" ? 1 : 0) +
    (onlyWithOpenTasks ? 1 : 0) +
    (onlyNeedsMoreHands ? 1 : 0);

  // Whether the member is carrying any task claims across projects —
  // gates the quiet "Tasks you're carrying" jump-off below the
  // archive link. Uses the same helper as the /my-tasks page so the
  // link only shows when the page would have something to show.
  const carryingCount = useMemo(
    () =>
      currentMember
        ? myClaimedTasks(currentMember.publicKey, projectTasks, projects)
            .taskCount
        : 0,
    [currentMember, projectTasks, projects],
  );

  // Whether the member organizes (or co-organizes) any project — gates
  // the quiet "Projects you organize" jump-off below the carrying link.
  // Same helper as /my-projects so the link only shows when the page
  // would have something to show; blockedKeys keeps the gate honest for
  // a completed project whose sole loose end is a blocked completer.
  const organizingCount = useMemo(
    () =>
      currentMember
        ? myOrganizedProjects({
            memberKey: currentMember.publicKey,
            projects,
            projectTasks,
            blockedKeys,
          }).projectCount
        : 0,
    [currentMember, projects, projectTasks, blockedKeys],
  );

  // Post-tab filter activity: drives the "filter-empty" empty state and
  // the Clear-filters reset affordance. Same shape as the project-tab
  // version above. `showClaimed` is intentionally excluded — toggling
  // it expands the visible set rather than narrowing it, so it can't
  // be the cause of an empty list.
  const postFiltersActive =
    categoryFilter !== "" || urgencyFilter !== "" || zoneFilter !== "";

  // Post-tab twin of activeProjectFilterCount above. `showClaimed`
  // is excluded for the same reason it's excluded from
  // postFiltersActive — it widens the list, never narrows it.
  const activePostFilterCount =
    (categoryFilter !== "" ? 1 : 0) +
    (urgencyFilter !== "" ? 1 : 0) +
    (zoneFilter !== "" ? 1 : 0);

  const resetPostFilters = () => {
    setCategoryFilter("");
    setUrgencyFilter("");
    setZoneFilter("");
  };

  const resetProjectFilters = () => {
    setProjectCategoryFilter("");
    setProjectStatusFilter("");
    setOnlyWithOpenTasks(false);
    setOnlyNeedsMoreHands(false);
  };

  // pb-36 (page wrapper) reserves clearance under the fixed FAB —
  // which sits at 5rem + the safe-area inset (the home-indicator band
  // also heightens the BottomNav, so a plain 5rem let the nav swallow
  // the pill's bottom edge) with ≈3rem of its own height — so the
  // last card in the scroll never tucks behind the floating button on
  // any tab.
  return (
    <div className="px-4 pb-36 pt-4">
      <header className="mb-4">
        <h1 className="page-title">{t("board.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("board.tagline")}
        </p>
      </header>

      {/* One calm prompt at a time, by priority — the orchestrator picks
          the highest-priority eligible Board nudge (or none) and never
          flashes a lower one while a higher one is still resolving.
          ContextualHint rides along as the orchestrator's FALLBACK: it
          renders only when every nudge has resolved to hidden, so the
          Board never stacks two banners (nudge + hint). The hint keeps
          its own dismiss persistence; only its turn-taking is governed
          here. Nudge priority itself is unchanged. */}
      <BoardNudges
        fallback={
          <ContextualHint
            settingKey="boardHintDismissed"
            ariaLabel={t("hints.board.label")}
            message={t("hints.board.message")}
            learnMoreTo="/help#post-something"
            learnMoreLabel={t("hints.board.learnMoreLabel")}
          />
        }
      />

      {/* Phase 2.1 (revised): at lg+ the Board reflows into a 3-column
          rail layout — filters become a sticky left rail,
          AttentionSection a sticky right rail, around the middle
          reading column. The three columns size INDEPENDENTLY: the
          outer grid is a single row track (lg:items-start) so a tall
          rail (e.g. AttentionSection's co-organizer card) grows only
          its own column and never inflates a shared row that the
          middle column's tablist / search / list sit inside. The
          middle column is one grid cell holding a flex-column wrapper
          (tablist → search → filter → list) so those stack tightly
          regardless of rail height.

          Below lg the grid is single-column. The middle wrapper uses
          `contents` at mobile so its children flatten into the outer
          grid. Mobile DOM order matches visual order natively —
          AttentionSection → tablist → search → filter → list →
          archive — so NO `order-*` utilities are needed. Focus order
          and reading order agree for screen-reader and keyboard
          users (WCAG 2.4.3 satisfied).

          Filter rails (PostFilterRail / ProjectFilterRail) are
          rendered TWICE: once inside the middle wrapper between
          search and list (`lg:hidden`, the mobile-visible copy that
          participates in the `contents` flatten), and once as an
          outer-grid child positioned in col-1 (`hidden lg:block`,
          the desktop-visible copy). The component JSX is identical
          in both render sites — only the wrapper layout classes
          differ. Filter state stays in this parent and threads
          through as props.

          Tradeoff: on DESKTOP the keyboard tab order is
          tablist → search → list → filter → archive (filter comes
          AFTER the list because its DOM position in the outer grid
          is the last sibling). Unusual, but NOT a WCAG violation —
          desktop users see the filter in col-1 regardless of tab
          order, and screen-reader reading order on desktop follows
          the same DOM sequence as on mobile would only if filters
          were inside the middle wrapper at lg too (which would give
          up the left-rail layout). We accept desktop tab-after-list
          to keep the left-rail layout AND mobile-DOM-order-equals-
          visual-order, which is the WCAG-relevant constraint.

          The right rail is reserved exclusively for AttentionSection.
          Do NOT dock additional informational components here —
          adding a "trending categories" / "active now" / unread-count
          panel by accretion would violate the no-notifications and
          no-leaderboards principles. AttentionSection itself remains
          curated, renders null when empty, and adds no badge count. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)_280px] lg:items-start lg:gap-6">
        {/* Right rail. Single grid cell in col 3, sticky. With the
            outer grid on one row track + lg:items-start, its height is
            its own concern — a tall attention card no longer drags the
            middle column's rhythm. */}
        <div className="lg:col-start-3 lg:row-start-1 lg:self-start lg:sticky lg:top-4">
          <AttentionSection />
        </div>

        {/* Middle reading column. At lg+ this is ONE col-2 grid cell
            laid out as a flex column so tablist → search → list stack
            tightly with no inter-rail height coupling. At mobile it is
            `contents`, dissolving into the outer single-column grid so
            DOM children flatten into the page stack. The mobile-visible
            filter rail is rendered HERE between search and list (with
            `lg:hidden`) so DOM order matches visual order natively —
            no `order-*` utilities required. The desktop-visible filter
            rail lives as an outer-grid child in col-1 below. */}
        <div className="contents min-w-0 lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-3">
        {/* Mobile sticky header group: tablist + search stick TOGETHER
            at top-0 so a member can flip NEED↔OFFER or search from
            anywhere in a long scroll — previously only the search
            stuck and switching tabs meant scrolling back up. ONE
            container carries the shared backdrop-blur band so the
            treatment is continuous across both rows. The mobile
            Filters disclosure below is deliberately OUTSIDE this
            group — only tablist + search stick. At lg+ the wrapper
            dissolves (`lg:contents`) and the two children return to
            being direct flex-column children, so the desktop sticky
            story (search alone at top-4) is untouched. DOM order
            inside the group is tablist → search, matching visual
            order at every breakpoint (WCAG 2.4.3, PR #199). z-10
            keeps the band under the FAB (z-20) and modal layers. */}
        <div className="sticky top-0 z-10 -mx-4 bg-white/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-moss-950/95 dark:supports-[backdrop-filter]:bg-moss-950/70 lg:contents">
        <div
          role="tablist"
          aria-label={t("board.tabs.ariaLabel")}
          className="grid grid-cols-3 rounded-full bg-moss-100 p-1 dark:bg-moss-900"
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
                <span className="ml-1 text-xs text-moss-600 dark:text-moss-300">
                  {t("board.openCount", { count: openCount[tt] })}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search row. On mobile it lives inside (and sticks with)
            the sticky header group above — the group's wrapper
            carries the backdrop band, so this row only needs its
            mobile spacing. At lg+ the group wrapper is `contents`,
            so this row is a flex-column child again and re-acquires
            its own sticky-at-top-4 + backdrop treatment to match
            the other rails (filters + AttentionSection) — the lg
            behavior is byte-for-byte what shipped before the mobile
            group existed. */}
        <div className="mt-2 lg:sticky lg:top-4 lg:z-10 lg:mx-0 lg:mt-0 lg:bg-white/95 lg:px-0 lg:py-2 lg:backdrop-blur lg:supports-[backdrop-filter]:bg-white/70 lg:dark:bg-moss-950/95 lg:dark:supports-[backdrop-filter]:bg-moss-950/70">
          <label className="block md:max-w-md">
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
        </div>
        </div>
        {/* end mobile sticky header group */}

        {/* Mobile-visible filter rail copies. These sit between the
            search input and the list in DOM order, so on mobile
            (where the middle wrapper is `contents`) the page reads
            attention → tablist → search → filters-toggle → filter →
            list, and the list never tab-reads before the controls
            that filter it. `lg:hidden` keeps these out of the
            desktop layout where the col-1 outer-grid copy below
            takes over.

            Below sm the rail collapses behind the MobileFiltersToggle
            trigger (see the component's comment for the affordance
            rationale); the toggle is `sm:hidden` and the rail flips
            to `hidden sm:block` while collapsed, so at sm..lg the
            rail renders exactly as before with no trigger. Trigger
            precedes rail in DOM — DOM order equals visual order in
            every disclosure state (WCAG 2.4.3). This block is NOT
            part of the sticky header group above on purpose: only
            tablist + search stick. */}
        {tab !== "PROJECTS" && (
          <div className="lg:hidden">
            <MobileFiltersToggle
              open={mobileFiltersOpen}
              activeCount={activePostFilterCount}
              controlsId="board-post-filters"
              onToggle={() => setMobileFiltersOpen((v) => !v)}
            />
            <div
              id="board-post-filters"
              className={mobileFiltersOpen ? "mt-2 sm:mt-0" : "hidden sm:block"}
            >
              <PostFilterRail
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                urgencyFilter={urgencyFilter}
                setUrgencyFilter={setUrgencyFilter}
                zoneFilter={zoneFilter}
                setZoneFilter={setZoneFilter}
                zones={zones}
                claimedInScope={claimedInScope}
                showClaimed={showClaimed}
                setShowClaimed={setShowClaimed}
              />
            </div>
          </div>
        )}

        {tab === "PROJECTS" && (
          <div className="lg:hidden">
            <MobileFiltersToggle
              open={mobileFiltersOpen}
              activeCount={activeProjectFilterCount}
              controlsId="board-project-filters"
              onToggle={() => setMobileFiltersOpen((v) => !v)}
            />
            <div
              id="board-project-filters"
              className={mobileFiltersOpen ? "mt-2 sm:mt-0" : "hidden sm:block"}
            >
              <ProjectFilterRail
                projectCategoryFilter={projectCategoryFilter}
                setProjectCategoryFilter={setProjectCategoryFilter}
                projectStatusFilter={projectStatusFilter}
                setProjectStatusFilter={setProjectStatusFilter}
                onlyWithOpenTasks={onlyWithOpenTasks}
                setOnlyWithOpenTasks={setOnlyWithOpenTasks}
                onlyNeedsMoreHands={onlyNeedsMoreHands}
                setOnlyNeedsMoreHands={setOnlyNeedsMoreHands}
              />
            </div>
          </div>
        )}

        {/* Per-tab LIST lives inside the middle wrapper (col 2). At
            mobile the wrapper is `contents`, so this list participates
            directly in the outer grid stack and sits AFTER the mobile
            filter rail above — DOM order matches visual order. */}
        {tab !== "PROJECTS" && (
          <div>
            {visiblePosts.length === 0 ? (
              debouncedQuery.trim() !== "" ? (
                // Search-empty: name the query back so the member can
                // see exactly what they searched for vs. fearing a
                // broken filter elsewhere.
                <p className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
                  {t("board.empty.search", { query: debouncedQuery.trim() })}
                </p>
              ) : postFiltersActive ? (
                // Filter-empty (no search): tell them filters are the
                // cause and give a one-tap escape. Without this they
                // can't distinguish "I filtered too tightly" from
                // "there's truly nothing here."
                <div className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
                  <p>{t("board.empty.filtered")}</p>
                  <button
                    type="button"
                    className="mt-2 text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                    onClick={resetPostFilters}
                  >
                    {t("board.empty.clearFilters")}
                  </button>
                </div>
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
              /* `lg:grid-cols-1` is a MEASURED decision, not a typo.
                 Layout.tsx caps the shell at max-w-screen-lg (1024px)
                 across the whole lg range, so the middle column is a
                 constant 1024 − 32 (page px-4) − 240 (left rail) −
                 280 (right rail) − 48 (2 × gap-6) = 424px at every
                 lg viewport. Two columns would mean (424 − 12) / 2 ≈
                 206px cards — unusably cramped. md (no rails) fits 2;
                 xl (1280 cap → 680px middle → ~334px cards) resumes
                 2. The 1-col dip at lg is the honest tradeoff for
                 gaining both rails. */
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
        )}

        {tab === "PROJECTS" && (
          <div>
            <ProjectList
              projects={visibleProjects}
              projectTasks={projectTasks}
              memberName={memberName}
              searchQuery={debouncedQuery}
              filtersActive={projectFiltersActive}
              onClearFilters={resetProjectFilters}
            />
          </div>
        )}
        </div>
        {/* end middle reading column */}

        {/* Desktop-visible left rail: filters. A separate grid child
            placed in col 1 at lg+, sticky. `hidden lg:block` hides
            this on mobile — the mobile-visible filter copy is rendered
            inside the middle wrapper between search and list above
            so DOM order matches visual order without `order-*`
            utilities. The filter rail's height is its own concern —
            single-row grid + lg:items-start means it never couples
            into the middle column's vertical rhythm. */}
        {tab !== "PROJECTS" && (
          <div className="hidden lg:col-start-1 lg:row-start-1 lg:self-start lg:sticky lg:top-4 lg:block">
            <PostFilterRail
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              urgencyFilter={urgencyFilter}
              setUrgencyFilter={setUrgencyFilter}
              zoneFilter={zoneFilter}
              setZoneFilter={setZoneFilter}
              zones={zones}
              claimedInScope={claimedInScope}
              showClaimed={showClaimed}
              setShowClaimed={setShowClaimed}
            />
          </div>
        )}

        {tab === "PROJECTS" && (
          <>
            <div className="hidden lg:col-start-1 lg:row-start-1 lg:self-start lg:sticky lg:top-4 lg:block">
              <ProjectFilterRail
                projectCategoryFilter={projectCategoryFilter}
                setProjectCategoryFilter={setProjectCategoryFilter}
                projectStatusFilter={projectStatusFilter}
                setProjectStatusFilter={setProjectStatusFilter}
                onlyWithOpenTasks={onlyWithOpenTasks}
                setOnlyWithOpenTasks={setOnlyWithOpenTasks}
                onlyNeedsMoreHands={onlyNeedsMoreHands}
                setOnlyNeedsMoreHands={setOnlyNeedsMoreHands}
              />
            </div>

            {/* Archive link sits below everything at every breakpoint
                (a rarely-needed jump-off, not a primary control). At
                lg+ it lands in col 1 below the sticky filter rail (an
                implicit row created after row 1); at mobile it
                naturally lands last in the outer grid stack. */}
            <Link
              to="/projects/archive"
              className="mt-3 block text-center text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300 lg:col-start-1 lg:row-start-2 lg:mt-3 lg:text-left"
            >
              {t("projects.archive.viewArchive")}
            </Link>

            {/* Cross-project commitments jump-off, same quiet register
                as the archive link. Conditional on actually carrying
                something — no count bubble, no empty destination
                (no-notifications; solidarity-not-shame). */}
            {carryingCount > 0 && (
              <Link
                to="/my-tasks"
                className="mt-2 block text-center text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300 lg:col-start-1 lg:row-start-3 lg:mt-2 lg:text-left"
              >
                {t("myTasks.boardLink")}
              </Link>
            )}

            {/* Organizer-side jump-off, same quiet register. Conditional
                on actually stewarding a project so the rail never nudges
                a non-organizer toward organizing (no-notifications;
                solidarity-not-shame). */}
            {organizingCount > 0 && (
              <Link
                to="/my-projects"
                className="mt-2 block text-center text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300 lg:col-start-1 lg:row-start-4 lg:mt-2 lg:text-left"
              >
                {t("myProjects.boardLink")}
              </Link>
            )}
          </>
        )}
      </div>

      {/* Hidden while the on-screen keyboard is up — the fixed anchor
          would float detached mid-screen (see useVirtualKeyboard.ts),
          and it sat directly over the Board search box's typing area. */}
      {!keyboardOpen && (
      <div
        style={visualViewportGlueStyle(bottomGap)}
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 flex justify-center px-4"
      >
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
      )}
    </div>
  );
}

/**
 * Mobile-only (<sm) disclosure trigger for the Board filter rails.
 *
 * Affordance ruling (operator): collapsed states must have LOUD,
 * full-width, high-affordance triggers — "very obvious to everyone
 * where to click." Hence a card-styled full-width button (border +
 * shadow + semibold label + chevron) at the 44px touch floor, not a
 * quiet text link.
 *
 * When any filter is narrowing the list, the label switches to
 * "Filters · N active" so a member never wonders why a collapsed
 * rail is shortening the list. Plain text in the label — no badge
 * pill, no dot (no-notifications principle: no badge counts).
 *
 * `sm:hidden`: at sm+ the rail is always visible and this trigger
 * disappears — the disclosure exists only where the rail's selects
 * stack full-width and cost real screen estate.
 */
function MobileFiltersToggle({
  open,
  activeCount,
  controlsId,
  onToggle,
}: {
  open: boolean;
  activeCount: number;
  /** id of the collapsible rail wrapper this trigger controls. */
  controlsId: string;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controlsId}
      onClick={onToggle}
      className="card flex min-h-[44px] w-full items-center justify-between px-3 py-2 text-sm font-semibold text-canopy-800 transition-colors hover:bg-moss-50 active:bg-moss-100 dark:text-canopy-200 dark:hover:bg-moss-800 sm:hidden"
    >
      <span>
        {activeCount > 0
          ? t("board.filters.toggleActive", { count: activeCount })
          : t("board.filters.toggle")}
      </span>
      {/* Sighted-only state cue; aria-expanded carries the meaning. */}
      <span aria-hidden="true" className="text-moss-500 dark:text-moss-300">
        {open ? "▾" : "▸"}
      </span>
    </button>
  );
}

function ProjectList({
  projects,
  projectTasks,
  memberName,
  searchQuery,
  filtersActive,
  onClearFilters,
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
  /** Reset all three project filters at once. Wired to the
   *  Clear-filters button on the filter-empty state so a member
   *  who narrowed too far has a one-tap escape. */
  onClearFilters: () => void;
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
          {t("board.empty.search", { query: trimmedQuery })}
        </p>
      );
    }
    if (filtersActive) {
      return (
        <div className="rounded-xl bg-moss-50 p-4 text-center text-sm text-moss-600 dark:bg-moss-950/30 dark:text-moss-300">
          <p>{t("board.empty.filtered")}</p>
          <button
            type="button"
            className="mt-2 text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
            onClick={onClearFilters}
          >
            {t("board.empty.clearFilters")}
          </button>
        </div>
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

