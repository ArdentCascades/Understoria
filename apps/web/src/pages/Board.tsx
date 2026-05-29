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
import { Link, useNavigate } from "react-router-dom";
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
import type { Category, PostType, Urgency } from "@/types";

type Tab = PostType | "PROJECTS";

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
  const [tab, setTab] = useState<Tab>("NEED");
  const [categoryFilter, setCategoryFilter] = useState<Category | "">("");
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | "">("");
  const [query, setQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  // Hide claimed posts by default — the Board is action-oriented
  // ("what can I help with now?") and a claimed post isn't
  // actionable for a new helper. Toggle persists for the session
  // (not across reloads); a member who wants always-on can flip
  // it each session.
  const [showClaimed, setShowClaimed] = useState(false);
  const navigate = useNavigate();

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
  const matchingPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (p.type !== tab) return false;
      if (p.status === "cancelled") return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (urgencyFilter && p.urgency !== urgencyFilter) return false;
      if (zoneFilter && p.locationZone !== zoneFilter) return false;
      if (q) {
        const haystack = `${p.title} ${p.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [posts, tab, categoryFilter, urgencyFilter, zoneFilter, query]);

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

      <AttentionSection />

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
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
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

      {claimedInScope > 0 && (
        <div className="mb-3 flex justify-end">
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

      {visiblePosts.length === 0 ? (
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
      ) : (
        <ul className="flex flex-col gap-3">
          {visiblePosts.map((p) => (
            <li key={p.id}>
              <PostCard
                post={p}
                posterName={memberName.get(p.postedBy) ?? ""}
                isCurrentMember={p.postedBy === currentMember?.publicKey}
                posterTrust={trustByKey.get(p.postedBy)}
                isCrossNode={p.nodeId !== nodeId && p.nodeId !== ""}
                posterAvailabilityChips={availabilityByKey.get(p.postedBy)}
              />
            </li>
          ))}
        </ul>
      )}
      </>
      )}

      {tab === "PROJECTS" && (
        <>
          <ProjectList
            projects={projects}
            projectTasks={projectTasks}
            memberName={memberName}
          />
          <Link
            to="/projects/archive"
            className="mt-3 block text-center text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("projects.archive.viewArchive")}
          </Link>
        </>
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
      <EmptyState
        illustration="book"
        title={t("projects.emptyTitle")}
        message={t("projects.empty")}
      />
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

