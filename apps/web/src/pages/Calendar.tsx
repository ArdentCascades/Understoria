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
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { buildCalendar } from "@/lib/calendar";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { EmptyState } from "@/components/EmptyState";
import { CalendarAgenda } from "@/components/CalendarAgenda";
import { CalendarMonth } from "@/components/CalendarMonth";
import { CalendarWeek } from "@/components/CalendarWeek";
import type { Category, Exchange, Post, Project } from "@/types";

// Window: 30 days back, 60 days forward. The back-window covers
// recently-completed exchange density (historical) and the forward
// window covers project deadlines and post expiries. Recomputed when
// filters change so the window stays anchored to "now" not stale.
const WINDOW_BACK_MS = 30 * 24 * 60 * 60 * 1000;
const WINDOW_FORWARD_MS = 60 * 24 * 60 * 60 * 1000;

type ViewMode = "agenda" | "month" | "week";

// `lg` breakpoint in default Tailwind is 1024px. Below that, agenda
// is the default; at or above, month is the default. The member's
// explicit override (a click on a view pill) sticks for the session.
function defaultViewForWidth(width: number): ViewMode {
  return width >= 1024 ? "month" : "agenda";
}

export default function CalendarPage() {
  const { projects, posts, exchanges, currentMember, projectTasks } = useApp();
  const { t, i18n } = useTranslation();

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

  const [category, setCategory] = useState<"" | Category>("");
  const [projectId, setProjectId] = useState<string>("");
  const [mine, setMine] = useState<boolean>(false);

  const now = Date.now();
  const windowStart = now - WINDOW_BACK_MS;
  const windowEnd = now + WINDOW_FORWARD_MS;

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
      for (const p of projects) {
        if (p.organizerKey === myKey) myProjectIds.add(p.id);
        else if (p.coOrganizerKeys.includes(myKey)) myProjectIds.add(p.id);
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

  const entries = useMemo(
    () =>
      buildCalendar({
        projects: filteredProjects,
        posts: filteredPosts,
        exchanges: filteredExchanges,
        windowStart,
        windowEnd,
      }),
    [
      filteredProjects,
      filteredPosts,
      filteredExchanges,
      windowStart,
      windowEnd,
    ],
  );

  const view = (mode: ViewMode) => () => {
    setOverrideView(true);
    setViewMode(mode);
  };

  return (
    <div className="px-4 py-stack-md">
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
            onChange={(e) => setCategory(e.target.value as "" | Category)}
            aria-label={t("calendar.filters.category")}
          >
            <option value="">{t("calendar.filters.allCategories")}</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].label}
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
        <label className="flex items-center gap-1 text-xs text-moss-700 dark:text-moss-200">
          <input
            type="checkbox"
            checked={mine}
            onChange={(e) => setMine(e.target.checked)}
            disabled={!myKey}
            className="h-4 w-4 rounded border-moss-300"
          />
          {t("calendar.filters.mine")}
        </label>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          illustration="sapling"
          title={t("calendar.empty.title")}
          message={t("calendar.empty.body")}
        />
      ) : viewMode === "agenda" ? (
        <CalendarAgenda entries={entries} locale={i18n.language} />
      ) : viewMode === "month" ? (
        <CalendarMonth
          entries={entries}
          currentMs={now}
          locale={i18n.language}
        />
      ) : (
        <CalendarWeek
          entries={entries}
          initialMs={now}
          locale={i18n.language}
        />
      )}
    </div>
  );
}
