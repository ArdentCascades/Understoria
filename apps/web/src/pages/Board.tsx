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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { PostCard } from "@/components/PostCard";
import { ProjectCard } from "@/components/ProjectCard";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import type { Category, PostType, Urgency } from "@/types";

type Tab = PostType | "PROJECTS";

const URGENCY_VALUES: Array<"" | Urgency> = ["", "high", "medium", "low"];

export default function BoardPage() {
  const { posts, members, currentMember, projects, projectTasks } = useApp();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("NEED");
  const [categoryFilter, setCategoryFilter] = useState<Category | "">("");
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | "">("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const memberName = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) map.set(m.publicKey, m.displayName);
    return map;
  }, [members]);

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (p.type !== tab) return false;
      if (p.status === "cancelled") return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (urgencyFilter && p.urgency !== urgencyFilter) return false;
      if (q) {
        const haystack = `${p.title} ${p.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [posts, tab, categoryFilter, urgencyFilter, query]);

  const openCount = useMemo(() => {
    return {
      NEED: posts.filter((p) => p.type === "NEED" && p.status === "open")
        .length,
      OFFER: posts.filter((p) => p.type === "OFFER" && p.status === "open")
        .length,
    };
  }, [posts]);

  return (
    <div className="px-4 pb-32 pt-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("board.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("board.tagline")}
        </p>
      </header>

      <div
        role="tablist"
        aria-label={t("board.tabs.ariaLabel")}
        className="mb-4 grid grid-cols-3 rounded-full bg-moss-100 p-1 dark:bg-moss-900"
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

      {tab !== "PROJECTS" && (
      <>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
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
      </div>

      <div className="mb-4">
        <label htmlFor="board-search" className="sr-only">
          {t("board.search.ariaLabel")}
        </label>
        <input
          id="board-search"
          type="search"
          className="input"
          placeholder={t("board.search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {visiblePosts.length === 0 ? (
        <EmptyState tab={tab as PostType} />
      ) : (
        <ul className="flex flex-col gap-3">
          {visiblePosts.map((p) => (
            <li key={p.id}>
              <PostCard
                post={p}
                posterName={memberName.get(p.postedBy) ?? ""}
                isCurrentMember={p.postedBy === currentMember?.publicKey}
              />
            </li>
          ))}
        </ul>
      )}
      </>
      )}

      {tab === "PROJECTS" && (
        <ProjectList
          projects={projects}
          projectTasks={projectTasks}
          memberName={memberName}
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-20 flex justify-center px-4">
        <div className="pointer-events-auto flex gap-2 rounded-full bg-white/90 p-1 shadow-lg backdrop-blur dark:bg-moss-900/95">
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
}: {
  projects: import("@/types").Project[];
  projectTasks: import("@/types").ProjectTask[];
  memberName: Map<string, string>;
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

  const visible = projects.filter((p) => p.status !== "archived");

  if (visible.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 py-10 text-center">
        <div className="text-4xl" aria-hidden="true">
          {"\u{1F331}"}
        </div>
        <p className="max-w-sm text-sm text-moss-600 dark:text-moss-300">
          {t("projects.empty")}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {visible.map((p) => {
        const counts = tasksByProject.get(p.id) ?? { total: 0, open: 0 };
        return (
          <li key={p.id}>
            <ProjectCard
              project={p}
              organizerName={memberName.get(p.organizerKey) ?? "Member"}
              taskCount={counts.total}
              openTaskCount={counts.open}
            />
          </li>
        );
      })}
    </ul>
  );
}

function EmptyState({ tab }: { tab: PostType }) {
  const { t } = useTranslation();
  const message =
    tab === "NEED" ? t("board.empty.needs") : t("board.empty.offers");
  return (
    <div className="card flex flex-col items-center gap-2 py-10 text-center">
      <div className="text-4xl" aria-hidden="true">
        {"\u{1F331}"}
      </div>
      <p className="max-w-sm text-sm text-moss-600 dark:text-moss-300">
        {message}
      </p>
    </div>
  );
}
