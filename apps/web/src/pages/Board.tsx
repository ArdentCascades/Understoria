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
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  Outlet,
  useMatch,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
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
import { filterBoardPosts } from "@/lib/boardFilter";
import { isOurNode } from "@/lib/nodeIdentity";
import { myClaimedTasks } from "@/lib/myTasks";
import { useVirtualKeyboardOpen } from "@/lib/useVirtualKeyboard";
import { SPLIT_CAPABLE_QUERY, useMediaQuery } from "@/lib/viewport";
import { useSlashFocus } from "@/lib/useSlashFocus";
import { myOrganizedProjects } from "@/lib/myProjects";
import {
  hasHourSizedTasks,
  hasOpenTasks,
  projectNeedsMoreHands,
} from "@/lib/projectFilter";
import { parseTabParam, tabToParam, type BoardTab } from "@/lib/boardTab";
import { CATEGORY_META } from "@/lib/categories";
import { SETTING_KEYS } from "@/db/database";
import { PostFilterRail } from "@/components/board/PostFilterRail";
import { ProjectFilterRail } from "@/components/board/ProjectFilterRail";
import { DiscoveryLinks } from "@/components/board/DiscoveryLinks";
import {
  ActiveFilterChips,
  FilterPanelDone,
  FiltersToggle,
} from "@/components/filters/FiltersDisclosure";
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
    communityNodeIds,
    nodeConfig,
    blockedKeys,
    founderRoots,
  } = useApp();
  const { t } = useTranslation();
  const keyboardOpen = useVirtualKeyboardOpen();
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
  // Commons scope within the projects tab (docs/commons.md §5.1):
  // "Being built" (default) vs "Tended". URL-carried like the tab so
  // /?tab=projects&scope=tended deep-links; a commons IS a project,
  // so this is a scope on the existing tab, never a new tab.
  const scope: "build" | "tended" =
    searchParams.get("scope") === "tended" ? "tended" : "build";
  const setScope = (next: "build" | "tended") => {
    const params = new URLSearchParams(searchParams);
    if (next === "tended") params.set("scope", "tended");
    else params.delete("scope");
    setSearchParams(params, { replace: true });
  };
  const [categoryFilter, setCategoryFilter] = useState<Category | "">("");
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | "">("");
  // Live input value (every keystroke) + debounced value (250 ms after
  // last keystroke). Debouncing keeps the list from re-filtering on
  // every keystroke mid-word; the input itself stays responsive.
  const [query, setQuery] = useState("");
  // `/` focuses the search from anywhere on the page (desktop
  // keyboard habit); a no-op while typing in any field.
  const searchRef = useRef<HTMLInputElement | null>(null);
  useSlashFocus(searchRef);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  // Hide claimed posts by default — the Board is action-oriented
  // ("what can I help with now?") and a claimed post isn't
  // actionable for a new helper. Toggle persists for the session
  // (not across reloads); a member who wants always-on can flip
  // it each session.
  const [showClaimed, setShowClaimed] = useState(false);
  // The "Filters" disclosure — ONE affordance at every width since
  // the board-calm pass: the rail's controls collapse behind the
  // FiltersToggle button everywhere (full-width card trigger below
  // sm, compact pill from sm up), with ActiveFilterChips keeping the
  // applied state visible and one-tap removable while collapsed.
  // Default collapsed; deliberately NOT persisted — session-local at
  // most, matching the filter values themselves. Shared across tabs
  // (one control; which rail it reveals follows the tab).
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // The Filters trigger (only one tab's renders at a time). The
  // panel's "Done" button focuses it on close so keyboard / SR
  // members return to the trigger, not the top of the document.
  const filtersToggleRef = useRef<HTMLButtonElement>(null);
  const closeFilters = () => {
    setMobileFiltersOpen(false);
    filtersToggleRef.current?.focus();
  };
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
  const [onlyHourSized, setOnlyHourSized] = useState(false);
  const navigate = useNavigate();
  // Whether the docked post panel (the nested /post/:id route) is
  // open. /post/new can't false-positive here: it's a separate
  // static route, so this component isn't even mounted there. While
  // the panel is open, the AttentionSection rail hides at lg+ (the
  // panel needs its width — at exactly 1024px both can't fit beside
  // the reading column) and the FAB unmounts (its bottom-right perch
  // is where the panel docks; below lg the panel covers it anyway).
  const postPanelOpen = useMatch("/post/:id") !== null;
  // A phone held sideways with room for two panes: the docked post
  // panel opens beside the board (DockedPanel docks itself on the
  // same query), so the viewport-width md: column count lies about
  // the reading column's real width — the lists dial back below.
  // Live (rotation mid-view switches the layout with the panel).
  const splitCapable = useMediaQuery(SPLIT_CAPABLE_QUERY);

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
        trustStatusWithInvites(m.publicKey, { vouches, invites, founderRoots }),
      );
    }
    return map;
  }, [members, vouches, invites, founderRoots]);

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
  // The predicate lives in lib/boardFilter.ts, SHARED with the
  // printable board sheet (/print/board) so what prints is exactly
  // what's on screen. Claimed-hiding stays here — the Board needs
  // the claimed-in-scope count for its toggle label.
  const matchingPosts = useMemo(
    () =>
      tab === "PROJECTS"
        ? []
        : filterBoardPosts(posts, {
            type: tab,
            category: categoryFilter,
            urgency: urgencyFilter,
            zone: zoneFilter,
            query: debouncedQuery,
          }),
    [posts, tab, categoryFilter, urgencyFilter, zoneFilter, debouncedQuery],
  );

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
      // Archived AND retired rest in /projects/archive.
      if (p.status === "archived" || p.status === "retired") return false;
      // The Being built / Tended scope split (docs/commons.md §5.1).
      if (scope === "tended" ? p.status !== "tended" : p.status === "tended")
        return false;
      if (projectCategoryFilter && p.category !== projectCategoryFilter)
        return false;
      if (projectStatusFilter && p.status !== projectStatusFilter) return false;
      if (onlyWithOpenTasks && !hasOpenTasks(p.id, projectTasks)) return false;
      if (onlyNeedsMoreHands && !needsMoreHandsIds?.has(p.id)) return false;
      if (onlyHourSized && !hasHourSizedTasks(p.id, projectTasks)) return false;
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
    onlyHourSized,
    needsMoreHandsIds,
    debouncedQuery,
    scope,
  ]);

  const projectFiltersActive =
    projectCategoryFilter !== "" ||
    projectStatusFilter !== "" ||
    onlyWithOpenTasks ||
    onlyNeedsMoreHands ||
    onlyHourSized;

  // How many project-tab filters are narrowing right now — feeds the
  // mobile disclosure trigger's "Filters · N active" variant so a
  // member never wonders why a collapsed rail is shortening the list.
  const activeProjectFilterCount =
    (projectCategoryFilter !== "" ? 1 : 0) +
    (projectStatusFilter !== "" ? 1 : 0) +
    (onlyWithOpenTasks ? 1 : 0) +
    (onlyNeedsMoreHands ? 1 : 0) +
    (onlyHourSized ? 1 : 0);

  // Whether the member is carrying any task claims across projects —
  // gates the quiet "Tasks you're carrying" jump-off below the
  // archive link. Uses the same helper as the My work tab so the
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
  // Same helper as the My work tab so the link only shows when the page
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
    // Was missing before the board-calm pass: "Clear filters" left
    // the hour-sized toggle narrowing the list invisibly.
    setOnlyHourSized(false);
  };

  // Chips describing every applied filter (board-calm pass): with the
  // rail collapsed behind the Filters button at every width, these
  // keep the applied state VISIBLE and one-tap removable. Labels
  // reuse exactly the translations the rail's own controls render.
  const postFilterChips = [
    ...(categoryFilter !== ""
      ? [
          {
            id: "category",
            label: `${CATEGORY_META[categoryFilter].emoji} ${t(`categories.${categoryFilter}`)}`,
            onRemove: () => setCategoryFilter(""),
          },
        ]
      : []),
    ...(urgencyFilter !== ""
      ? [
          {
            id: "urgency",
            label: t(`urgency.${urgencyFilter}`),
            onRemove: () => setUrgencyFilter(""),
          },
        ]
      : []),
    ...(zoneFilter !== ""
      ? [{ id: "zone", label: zoneFilter, onRemove: () => setZoneFilter("") }]
      : []),
    ...(showClaimed
      ? [
          {
            id: "claimed",
            label: t("board.filters.claimedShown"),
            onRemove: () => setShowClaimed(() => false),
          },
        ]
      : []),
  ];
  const projectFilterChips = [
    ...(projectCategoryFilter !== ""
      ? [
          {
            id: "projectCategory",
            // The three project-only extension categories mirror the
            // inline <option> labels in ProjectFilterRail (they have
            // no categories.* keys — see the note there).
            label:
              PROJECT_EXTENSION_CATEGORY_LABELS[projectCategoryFilter] ??
              `${CATEGORY_META[projectCategoryFilter as Category].emoji} ${t(`categories.${projectCategoryFilter}`)}`,
            onRemove: () => setProjectCategoryFilter(""),
          },
        ]
      : []),
    ...(projectStatusFilter !== ""
      ? [
          {
            id: "projectStatus",
            label: t(`board.projectFilters.status.${projectStatusFilter}`),
            onRemove: () => setProjectStatusFilter(""),
          },
        ]
      : []),
    ...(onlyWithOpenTasks
      ? [
          {
            id: "openTasks",
            label: t("board.projectFilters.openTasks.toggle"),
            onRemove: () => setOnlyWithOpenTasks(() => false),
          },
        ]
      : []),
    ...(onlyNeedsMoreHands
      ? [
          {
            id: "needsMoreHands",
            label: t("board.projectFilters.needsMoreHands.toggle"),
            onRemove: () => setOnlyNeedsMoreHands(() => false),
          },
        ]
      : []),
    ...(onlyHourSized
      ? [
          {
            id: "hourSized",
            label: t("board.projectFilters.hourSized.toggle"),
            onRemove: () => setOnlyHourSized(() => false),
          },
        ]
      : []),
  ];

  // pb-fab-clear (page wrapper, shared with Calendar — see index.css)
  // reserves clearance under the fixed FAB — which sits at 5rem + the
  // safe-area inset (the home-indicator band also heightens the
  // BottomNav, so a plain 5rem let the nav swallow the pill's bottom
  // edge) with ≈3.25rem of its own height — so every card, chip, and
  // suggestion in the scroll can always scroll clear of the floating
  // button on any tab.
  return (
    <div className="px-4 pb-fab-clear pt-4">
      {/* At lg+ the page is a row: the board column flexes and the
          nested post panel (Outlet) docks on the right when open -
          the board stays mounted, so tab, filters, search, and
          scroll survive opening posts. Below lg the Outlet renders
          as a full-screen takeover and this wrapper is a plain
          block. Same shape as Calendar's event panel.

          landscape-short also rows up: DockedPanel docks itself
          whenever SPLIT_CAPABLE_QUERY holds (short landscape ≥700px
          wide), and this wrapper gives it a row to dock into. Below
          the width floor the panel stays a fixed full-screen
          takeover, so the flex row is inert there. */}
      <div className="lg:flex lg:items-start lg:gap-6 landscape-short:flex landscape-short:items-start landscape-short:gap-4">
      <div className="min-w-0 lg:flex-1 landscape-short:flex-1">
      <header className="mb-4 landscape-short:mb-2">
        <h1 className="page-title">{t("board.title")}</h1>
        <p className="page-subtitle text-sm text-moss-600 dark:text-moss-300">
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
            settingKey={SETTING_KEYS.boardHintDismissed}
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

          Filter rails (PostFilterRail / ProjectFilterRail) render
          ONCE, inside the middle wrapper between search and list, at
          every breakpoint. They used to render twice (a mobile copy
          here + a desktop copy in a dedicated 240px col-1 track);
          the desktop-waste follow-up retired the left rail: on the
          1024px-capped shell it spent ~26% of the width on three
          selects and forced the post list to a single column across
          the whole lg range. The rails now lay out as a compact
          wrap row of intrinsic-width controls above the list, the
          reading column keeps the full shell width, and the list
          holds two card columns from md upward.

          Retiring the desktop copy also retired two documented
          warts: the desktop tab order is now tablist → search →
          filter → list (filters used to tab-read AFTER the list
          because the col-1 copy was a later outer-grid sibling),
          and the duplicated #category-filter / #project-category-
          filter ids from the two render sites are gone.

          The right rail is reserved exclusively for AttentionSection.
          Do NOT dock additional informational components here —
          adding a "trending categories" / "active now" / unread-count
          panel by accretion would violate the no-notifications and
          no-leaderboards principles. AttentionSection itself remains
          curated, renders null when empty, and adds no badge count.

          The col-3 track is `auto`, NOT a fixed 280px: AttentionSection
          renders null when nothing needs attention (its common state),
          and a fixed track kept 280px + gap of permanently dead space
          on the right of every such visit — the desktop-waste pilot
          report. The rail wrapper carries the width instead
          (lg:w-[280px]) and hides itself when empty (lg:empty:hidden),
          so the reading column absorbs the space whenever there is no
          attention card, and the layout is byte-identical to before
          whenever there is one.

          While the docked post panel is open the ATTENTION rail
          still cedes (panel triage wants the width), but the filter
          row stays: it lives inside the reading column and costs no
          horizontal track, so members can keep narrowing the list
          while a post is docked — the old 240px rail had to hide
          because at exactly 1024px the panel + rail left ~290px for
          the tablist and cards (the pilot screenshots). */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-6">
        {/* Right rail. Single grid cell in col 2, sticky. With the
            outer grid on one row track + lg:items-start, its height is
            its own concern — a tall attention card no longer drags the
            middle column's rhythm.

            Capped at the viewport (minus the top-4 offset mirrored at
            the bottom) with its OWN scroll context: an unbounded
            sticky rail taller than the viewport pins its top and
            never scrolls itself — the wheel moves the page instead,
            and the rail's tail is unreachable until the document
            bottoms out (operator report: the accept-and-sign button
            hid below the fold until every project had scrolled
            past). overscroll-contain stops a finished rail scroll
            from chaining into the page. */}
        <div
          className={`lg:col-start-2 lg:row-start-1 lg:w-[280px] lg:self-start lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:overscroll-contain lg:empty:hidden ${
            // While the post panel is docked, cede the rail's width
            // to it — at exactly 1024px the panel + both rails can't
            // coexist beside a readable card column. The rail is
            // back the moment the panel closes; below lg the panel
            // is a full-screen takeover so nothing changes there.
            postPanelOpen ? "lg:hidden" : ""
          }`}
        >
          <AttentionSection />
        </div>

        {/* Middle reading column. At lg+ this is ONE col-2 grid cell
            laid out as a flex column so tablist → search → list stack
            tightly with no inter-rail height coupling. At mobile it is
            `contents`, dissolving into the outer single-column grid so
            DOM children flatten into the page stack. The filter rail's
            single render site is HERE between search and list, so DOM
            order matches visual order natively at every breakpoint —
            no `order-*` utilities required. */}
        <div className="contents min-w-0 lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col lg:gap-3">
        {/* Sticky command band: tablist + search stick TOGETHER at
            every width so a member can flip NEED↔OFFER or search from
            anywhere in a long scroll. ONE container carries the
            shared backdrop-blur band. The Filters disclosure below is
            deliberately OUTSIDE this group — only tablist + search
            stick.

            Phone portrait: the two stack (full-width tabs are the
            right thumb targets). At lg+ and landscape-short the band
            lays them out as ONE ROW — the tablist shrinks to content
            width (a segmented control instead of three pills
            stretched across a ~990px column, the desktop-waste
            report) and the search sits beside it. This also upgrades
            desktop: the tabs used to scroll away while only search
            stuck (mobile solved that in PR #199; the row brings the
            same fix to lg). DOM order inside the band is tablist →
            search, matching visual order at every breakpoint
            (WCAG 2.4.3). z-10 keeps the band under the FAB (z-20)
            and modal layers. */}
        <div className="sticky top-0 z-10 -mx-4 bg-white/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-moss-950/95 dark:supports-[backdrop-filter]:bg-moss-950/70 band-hairline landscape-short:flex landscape-short:items-center landscape-short:gap-3 landscape-short:py-1.5 lg:top-4 lg:mx-0 lg:flex lg:flex-wrap lg:items-center lg:gap-x-5 lg:gap-y-2 lg:px-0">
        <div
          role="tablist"
          aria-label={t("board.tabs.ariaLabel")}
          className="grid grid-cols-3 rounded-full bg-moss-100 p-1 dark:bg-moss-900 landscape-short:flex landscape-short:w-fit landscape-short:shrink-0 lg:flex lg:w-fit lg:shrink-0"
        >
          {(["NEED", "OFFER", "PROJECTS"] as const).map((tt) => (
            <button
              key={tt}
              role="tab"
              aria-selected={tab === tt}
              onClick={() => setTab(tt)}
              className={`touch-target rounded-full text-sm font-semibold transition-colors landscape-short:px-4 lg:px-5 ${
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

        {/* Search. Inside (and sticking with) the command band at
            every width — the band's wrapper carries the sticky +
            backdrop treatment, so this element only needs its
            portrait stacking margin and, in the band's row modes
            (lg / landscape-short), to fill the width left beside
            the content-sized tablist. The input itself still caps
            at max-w-md — a km-wide search box reads as a form, not
            a tool. */}
        <div className="mt-2 landscape-short:mt-0 landscape-short:min-w-[10rem] landscape-short:flex-1 lg:mt-0 lg:min-w-[14rem] lg:flex-1">
          <label className="relative block md:max-w-md">
            <span className="sr-only">
              {t(
                tab === "PROJECTS"
                  ? "board.search.placeholderProjects"
                  : "board.search.placeholderPosts",
              )}
            </span>
            {/* Decorative magnifying glass, always visible (not in the
                placeholder, which vanishes once you type). aria-hidden
                because the field already carries its accessible name
                above; pl-9 on the input reserves its gutter. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-70"
            >
              🔍
            </span>
            <input
              ref={searchRef}
              type="search"
              className="input pl-9"
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

        {/* Desktop-visible discovery copy (DiscoveryLinks — see the
            component's two-render-site rationale). The search input
            caps at max-w-md, so at lg the band has free width to its
            right; the links live there instead of owning a whole row
            (field report). `hidden lg:flex` — on phones the band
            must stay minimal (only tabs + search stick; every sticky
            row is viewport lost), so the flow copy below serves
            portrait and landscape-short. lg:min-w-0 + the band's
            lg:flex-wrap let an expanded One-small-thing card wrap
            into a second band row and shrink its prose instead of
            clipping; the card stays pinned with the band while open
            — deliberate: your pick shouldn't scroll away while you
            read it. */}
        {currentMember && (
          <div className="hidden lg:flex lg:min-w-0 lg:flex-wrap lg:items-center lg:gap-x-5 lg:gap-y-2">
            <DiscoveryLinks
              memberKey={currentMember.publicKey}
              tasks={projectTasks}
              projects={projects}
              posts={posts}
              blockedKeys={blockedKeys}
            />
          </div>
        )}
        </div>
        {/* end sticky command band */}

        {/* Phone-visible DISCOVERY row (the lg copy lives in the
            command band above). The two links read as ONE action
            group, distinct from the navigation links below.

            On lg the wrapper is a justify-between flex, but only the
            filter block is visible there (the discovery copy is
            `lg:hidden`, its links live in the sticky band) — so the
            filter row spans the full width, Filters left / scope
            right. Below lg (portrait AND landscape) discovery and the
            filter row STACK: an earlier landscape pass shared them on
            one line, but once the Projects scope chips joined the
            filter row that share pushed Filters to the right half and
            wrapped the scope beneath it (field report). Stacking
            gives the filter row its own full width so Filters is
            left-aligned like desktop, at the cost of one short row.
            DOM order stays discovery → filters. */}
        <div className="lg:flex lg:flex-wrap lg:items-start lg:justify-between lg:gap-x-6 lg:gap-y-2">
        {currentMember && (
          <div className="mb-3 flex flex-wrap items-start gap-x-5 gap-y-2 lg:hidden">
            <DiscoveryLinks
              memberKey={currentMember.publicKey}
              tasks={projectTasks}
              projects={projects}
              posts={posts}
              blockedKeys={blockedKeys}
            />
          </div>
        )}

        {/* Filter rail — the single render site, every breakpoint.
            It sits between the search input and the list in DOM
            order, so the page reads attention → tablist → search →
            filters-toggle → filter → list and the list never
            tab-reads before the controls that filter it.

            Below sm the rail collapses behind the MobileFiltersToggle
            trigger (see the component's comment for the affordance
            rationale); the toggle is `sm:hidden` and the rail flips
            to `hidden sm:block` while collapsed, so at sm+ the rail
            renders as a compact wrap row with no trigger. Trigger
            precedes rail in DOM — DOM order equals visual order in
            every disclosure state (WCAG 2.4.3). This block is NOT
            part of the sticky command band above on purpose: only
            tablist + search stick. At lg+/landscape-short it shares
            a line with the discovery links (the wrapper above). */}
        {tab !== "PROJECTS" && (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <FiltersToggle
                open={mobileFiltersOpen}
                activeCount={activePostFilterCount}
                controlsId="board-post-filters"
                onToggle={() => setMobileFiltersOpen((v) => !v)}
                buttonRef={filtersToggleRef}
              />
              <ActiveFilterChips entries={postFilterChips} />
            </div>
            {/* Open drawer: a card panel (board-calm drawer pass) so
                the controls read as one contained object under the
                Filters pill instead of loose page rows, with a Done
                footer that closes + refocuses the trigger. */}
            <div
              id="board-post-filters"
              className={mobileFiltersOpen ? "card mt-2" : "hidden"}
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
              <FilterPanelDone onDone={closeFilters} />
            </div>
          </div>
        )}

        {tab === "PROJECTS" && (
          <div className="lg:flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <FiltersToggle
                open={mobileFiltersOpen}
                activeCount={activeProjectFilterCount}
                controlsId="board-project-filters"
                onToggle={() => setMobileFiltersOpen((v) => !v)}
                buttonRef={filtersToggleRef}
              />
              <ActiveFilterChips entries={projectFilterChips} />
              {/* Being built / Tended scope (docs/commons.md §5.1) —
                  filter-chip pattern, aria-pressed for a11y. Shares
                  the toggle's row (board-calm pass): it IS a kind of
                  filter, though fundamental enough to stay visible
                  rather than collapse into the disclosure. One line
                  with the Filters pill on phones; ml-auto pushes it
                  to the right edge at lg/landscape-short (the block
                  above is flex-1 there so the row spans the line). */}
              <div
                className="flex flex-wrap gap-2 landscape-short:ml-auto lg:ml-auto"
                role="group"
                aria-label={t("projects.commons.scopeLabel")}
              >
                {(["build", "tended"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={scope === s}
                    onClick={() => setScope(s)}
                    className={`chip transition-colors ${
                      scope === s
                        ? "bg-canopy-600 text-white dark:bg-canopy-500 dark:text-canopy-950"
                        : "bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
                    }`}
                  >
                    {t(s === "build" ? "projects.commons.scopeBuild" : "projects.commons.scopeTended")}
                  </button>
                ))}
              </div>
            </div>
            {/* Open drawer: card panel + Done footer — see the post-tab
                copy above for the rationale. */}
            <div
              id="board-project-filters"
              className={mobileFiltersOpen ? "card mt-2" : "hidden"}
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
                onlyHourSized={onlyHourSized}
                setOnlyHourSized={setOnlyHourSized}
              />
              <FilterPanelDone onDone={closeFilters} />
            </div>
          </div>
        )}
        </div>
        {/* end discovery + filters line */}

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
              /* Column math (shell capped at max-w-screen-lg, 1024px,
                 across the whole lg range): with the old 240px filter
                 rail gone, the reading column at lg is 1024 − 32
                 (page px-4) − 280 (attention rail, when present) − 24
                 (gap-6) = 688px → two ~338px cards, comfortably wider
                 than md's pair; with the attention rail empty (its
                 common state) the full 992px column holds two ~490px
                 cards. The old lg 1-col dip existed only to pay for
                 the 240px rail. */
              <>
                {/* While the panel is docked the viewport-based md:
                    breakpoint doesn't know the reading column shrank
                    (sideways split: ~55% of the viewport; lg dock:
                    the panel column), so the pair dials back to one
                    column for the panel's lifetime — the same
                    dial-back ProjectList does below. */}
                <ul
                  className={`grid grid-cols-1 gap-3 ${
                    postPanelOpen && splitCapable ? "" : "md:grid-cols-2"
                  } ${
                    postPanelOpen
                      ? "lg:grid-cols-1 xl:grid-cols-2"
                      : "2xl:grid-cols-3"
                  }`}
                >
                  {visiblePosts.map((p) => (
                    <li key={p.id}>
                      <PostCard
                        post={p}
                        posterName={memberName.get(p.postedBy) ?? ""}
                        isCurrentMember={p.postedBy === currentMember?.publicKey}
                        posterTrust={trustByKey.get(p.postedBy)}
                        isCrossNode={!isOurNode(p.nodeId, communityNodeIds)}
                        posterAvailabilityChips={availabilityByKey.get(p.postedBy)}
                        searchQuery={debouncedQuery}
                      />
                    </li>
                  ))}
                </ul>
                {/* Print surfaces (plan 5): the member's filters ARE
                    the print selection — this link carries the
                    current tab + filters to /print/board, which
                    re-derives exactly this list. Quiet register,
                    like the archive link. */}
                <Link
                  to={`/print/board?${boardPrintParams(
                    tabToParam(tab),
                    categoryFilter,
                    urgencyFilter,
                    zoneFilter,
                    debouncedQuery,
                    showClaimed,
                  )}`}
                  className="mt-3 block text-center text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300 lg:text-left"
                >
                  {t("board.printView")}
                </Link>
              </>
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
              panelOpen={postPanelOpen}
              tendedScope={scope === "tended"}
            />

            {/* Bottom jump-offs, grouped by JOB into two tiers so
                they don't read as a pile of identical links. They
                stack after the list in the reading column at every
                breakpoint (they used to land in the retired col-1
                rail track at lg+).

                Tier 1 — "In my care": the member's own cross-project
                commitments, both deep-linking into the /my-work
                page. Shown only when there's something to carry /
                steward — no count bubble, no empty destination
                (no-notifications; solidarity-not-shame). Grouped
                under one quiet heading so two links to the same page
                read as one doorway. */}
            {(carryingCount > 0 || organizingCount > 0) && (
              <div className="mt-3 text-center lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
                  {t("board.inMyCareHeading")}
                </p>
                <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm lg:justify-start">
                  {carryingCount > 0 && (
                    <Link
                      to="/my-work#tasks"
                      className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                    >
                      {t("myTasks.boardLink")}
                    </Link>
                  )}
                  {organizingCount > 0 && (
                    <Link
                      to="/my-work#projects"
                      className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                    >
                      {t("myProjects.boardLink")}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Tier 2 — the archive: navigation to a rarely-needed
                place, rendered as the QUIETEST footer link (muted,
                not a canopy action) so it's clearly the lowest tier
                and never competes with the controls or the care
                cluster. */}
            <Link
              to="/projects/archive"
              className="mt-3 block text-center text-xs text-moss-600 underline-offset-2 hover:text-moss-800 hover:underline dark:text-moss-300 dark:hover:text-moss-100 lg:text-left"
            >
              {t("projects.archive.viewArchive")}
            </Link>
          </div>
        )}
        </div>
        {/* end middle reading column */}

      </div>
      </div>
      {/* end board column */}
      <Outlet />
      </div>
      {/* end lg row (board column + docked post panel) */}

      {/* Hidden while the on-screen keyboard is up — the fixed anchor
          would float detached mid-screen (see useVirtualKeyboard.ts),
          and it sat directly over the Board search box's typing area.
          Centered on mobile (thumb reach over the bottom nav); pinned
          bottom-RIGHT at lg+ — centered on desktop it floated on top
          of the middle column's cards (the desktop-waste pilot
          report's screenshot), while the right edge is the one region
          the reading column never occupies.

          Also unmounted while the docked post panel is open: at lg+
          the panel occupies exactly the bottom-right region the FAB
          floats over, and below lg the panel is a full-screen
          takeover that covers it anyway. Closing the panel brings
          the FAB straight back.

          landscape-short pins the pill bottom-RIGHT for the same
          reason as lg: centered, it floated over the middle of an
          already short card list; the right edge is the one region
          the reading column and the left nav rail never occupy. The
          pr tracks the landscape safe-area inset. */}
      {!keyboardOpen && !postPanelOpen && (
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 flex justify-center px-4 print:hidden lg:bottom-6 lg:justify-end lg:px-8 landscape-short:bottom-[calc(1rem+env(safe-area-inset-bottom))] landscape-short:justify-end landscape-short:pr-[max(1rem,env(safe-area-inset-right))]">
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

/** Query string for /print/board — only filters that are actually
 *  set travel, so the print URL reads as sparse as the selection. */
function boardPrintParams(
  tabParam: string,
  category: string,
  urgency: string,
  zone: string,
  query: string,
  showClaimed: boolean,
): string {
  const params = new URLSearchParams();
  params.set("tab", tabParam);
  if (category) params.set("cat", category);
  if (urgency) params.set("urg", urgency);
  if (zone) params.set("zone", zone);
  if (query.trim()) params.set("q", query.trim());
  if (showClaimed) params.set("claimed", "1");
  return params.toString();
}

// FiltersToggle / ActiveFilterChips / FilterPanelDone moved to
// components/filters/FiltersDisclosure.tsx when the Calendar adopted
// the same collapsed-filters grammar — one shared trio, one house
// pattern. The board-calm reasoning (ONE pill disclosure at every
// width, chips keep applied state visible and one-tap removable,
// count as plain label text — no badge, no dot) travels with them.

// Project-only extension categories (no `categories.*` i18n keys —
// they mirror ProjectFilterRail's inline <option> labels).
const PROJECT_EXTENSION_CATEGORY_LABELS: Record<string, string> = {
  infrastructure: "\u{1F3D7}\uFE0F Infrastructure",
  organizing: "\u{1F4CB} Organizing",
  mutual_aid_drive: "\u{1F49B} Mutual aid drive",
};

function ProjectList({
  projects,
  projectTasks,
  memberName,
  searchQuery,
  filtersActive,
  onClearFilters,
  panelOpen,
  tendedScope,
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
  /** True while the docked post panel is open — the reading column
   *  is narrower, so the card grid dials its columns back. */
  panelOpen: boolean;
  /** True when the Tended scope is active — cards get their "next
   *  care" line (docs/commons.md §5.2). */
  tendedScope?: boolean;
}) {
  const { t } = useTranslation();
  // Same sideways dial-back as the post list: when the docked panel
  // is open in a split-capable short landscape, the md: column count
  // overstates the reading column's real width.
  const splitCapable = useMediaQuery(SPLIT_CAPABLE_QUERY);
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
  // "Next care" per tended commons: the first OPEN recurring task,
  // by orderIndex (rota order). Title + cadence, no due-date math —
  // care is invited, never counted down (docs/commons.md §8.3).
  const careByProject = useMemo(() => {
    if (!tendedScope) return new Map<string, string>();
    const map = new Map<string, string>();
    const sorted = [...projectTasks].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    for (const task of sorted) {
      if (task.status !== "open" || !task.recurringCadence) continue;
      if (map.has(task.projectId)) continue;
      map.set(
        task.projectId,
        `${task.title} · ${t(`projects.commons.cadence.${task.recurringCadence}`)}`,
      );
    }
    return map;
  }, [tendedScope, projectTasks, t]);

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
        illustration="raising"
        title={t("projects.emptyTitle")}
        message={t("projects.empty")}
      />
    );
  }

  return (
    <ul
      className={`grid grid-cols-1 gap-3 ${
        panelOpen && splitCapable ? "" : "md:grid-cols-2"
      } ${
        // Panel open: the viewport-based md: breakpoint doesn't know
        // the reading column shrank, so dial the columns back to
        // what the remaining width actually fits.
        panelOpen ? "lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3" : "xl:grid-cols-3"
      }`}
    >
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
              careLine={careByProject.get(p.id)}
            />
          </li>
        );
      })}
    </ul>
  );
}

