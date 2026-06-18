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
import { VouchDiscoveryNudge } from "@/components/VouchDiscoveryNudge";
import { KeepAccessNudge } from "@/components/KeepAccessNudge";
import { InstallGuide } from "@/components/InstallGuide";
import { matchesQuery } from "@/lib/messageSearch";
import { myClaimedTasks } from "@/lib/myTasks";
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
  // which sits at bottom-20 ≈ 5rem with ≈3rem of its own height — so
  // the last card in the scroll never tucks behind the floating
  // button on any tab.
  return (
    <div className="px-4 pb-36 pt-4">
      <header className="mb-4">
        <h1 className="page-title">{t("board.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("board.tagline")}
        </p>
      </header>

      <FirstActionNudge />
      <ProfileNudge />
      <VouchDiscoveryNudge />
      {/* Install card last in the cluster. NUDGE-STACKING NOTE: with
          this card the Board can now show up to four calm prompts at
          once. The three nudges above each gate on AppContext-derived
          content (posts / profile / vouches) AND an independent async
          dismiss flag, computed inside each component — there is no
          shared synchronous "is any nudge eligible?" signal to read.
          Making the install card defer would mean reimplementing all
          four eligibility predicates plus three more dismiss-flag reads
          here, which is neither contained nor drift-proof (it would
          silently break if a nudge's self-retire logic changed). So we
          place the card last and FLAG that a Board-nudge priority
          policy — one prompt at a time, by priority — is a recommended
          follow-up. The install card stays self-suppressing on its own
          terms (installed / dismissed → renders nothing). */}
      <InstallGuide variant="card" />
      {/* Keep-access reassurance last in the cluster. With it the Board
          can now show up to FIVE calm prompts at once (the three nudges
          above + the install card + this one). Same constraint as the
          install card's NUDGE-STACKING NOTE applies: each prompt gates
          on its own async eligibility + dismiss-flag reads with no
          shared synchronous "is any nudge eligible?" signal, so a
          one-prompt-at-a-time priority policy remains a recommended
          follow-up rather than something built here. This nudge
          self-suppresses on its own terms (paired a second device /
          dismissed → renders nothing). */}
      <KeepAccessNudge />
      <ContextualHint
        settingKey="boardHintDismissed"
        ariaLabel={t("hints.board.label")}
        message={t("hints.board.message")}
        technicalDetail={t("hints.board.technical")}
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

        {/* Sticky search: on mobile pins to top-0 so members can
            search from anywhere in a long scroll instead of jumping
            back to the page top. At lg+ pins at top-4 to match the
            other rails (filters + AttentionSection). Wrapper carries
            the grid placement + backdrop; the inner label keeps the
            input width cap. `-mx-4 lg:mx-0` lets the backdrop bleed
            to the viewport edge at mobile (cancelling the page's
            px-4) while staying within the middle column at lg+. */}
        <div className="sticky top-0 z-10 -mx-4 mb-3 bg-white/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-moss-950/95 dark:supports-[backdrop-filter]:bg-moss-950/70 lg:top-4 lg:mx-0 lg:mb-0 lg:px-0">
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

        {/* Mobile-visible filter rail copies. These sit between the
            search input and the list in DOM order, so on mobile
            (where the middle wrapper is `contents`) the page reads
            attention → tablist → search → filter → list, and the
            list never tab-reads before the controls that filter it.
            `lg:hidden` keeps these out of the desktop layout where
            the col-1 outer-grid copy below takes over. */}
        {tab !== "PROJECTS" && (
          <div className="lg:hidden">
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
          <div className="lg:hidden">
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

