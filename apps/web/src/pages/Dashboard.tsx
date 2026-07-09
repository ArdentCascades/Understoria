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
import { computeCommunityStats, computeFederationStats } from "@/lib/stats";
import { computeFlowStats } from "@/lib/flow";
import { CATEGORY_META } from "@/lib/categories";
import { formatHours } from "@/lib/format";
import { getSetting, SETTING_KEYS, setSetting } from "@/db/database";
import { BreadthBar } from "@/components/BreadthBar";
import { ReciprocityPulse } from "@/components/ReciprocityPulse";
import { EmptyState } from "@/components/EmptyState";
import { WhyTooltip } from "@/components/WhyTooltip";
import { LeafDivider, Sprig } from "@/components/visual";
import { CanopyMilestones } from "@/components/dashboard/CanopyMilestones";
import { ResilienceCard } from "@/components/dashboard/ResilienceCard";
import { UpcomingGatherings } from "@/components/dashboard/UpcomingGatherings";
import { WhereHandsAreWelcome } from "@/components/dashboard/WhereHandsAreWelcome";
import { DeskDoorway } from "@/components/dashboard/DeskDoorway";
import type { AchievementType, Category, Milestone } from "@/types";

export default function DashboardPage() {
  const {
    exchanges,
    members,
    posts,
    achievements,
    nodeConfig,
    nodeId,
    proposals,
    selfRemoved,
  } = useApp();
  const { t } = useTranslation();
  // Split BEFORE feeding the stats helpers so the headline + flow
  // reflect only this node's exchanges. The federation rollup
  // surfaces separately below.
  const localExchanges = useMemo(
    () => exchanges.filter((x) => x.nodeId === nodeId || x.nodeId === ""),
    [exchanges, nodeId],
  );
  const federationStats = useMemo(
    () => computeFederationStats(exchanges, nodeId),
    [exchanges, nodeId],
  );
  const stats = useMemo(
    () =>
      computeCommunityStats(
        localExchanges,
        members,
        posts,
        undefined,
        nodeConfig,
      ),
    [localExchanges, members, posts, nodeConfig],
  );
  const flow = useMemo(
    () => computeFlowStats(localExchanges, members),
    [localExchanges, members],
  );

  const achievementsThisMonth = useMemo(() => {
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const counts = new Map<string, number>();
    for (const a of achievements) {
      if (a.earnedAt >= monthAgo) {
        counts.set(a.achievementType, (counts.get(a.achievementType) ?? 0) + 1);
      }
    }
    return counts;
  }, [achievements]);

  const newlyReached = useNewlyReachedMilestones(stats.milestonesReached);

  const topCategories = useMemo(() => {
    const entries = Object.entries(stats.categoryBreakdown) as [
      Category,
      number,
    ][];
    entries.sort(([, a], [, b]) => b - a);
    return entries;
  }, [stats.categoryBreakdown]);

  const totalCategoryHours = topCategories.reduce(
    (sum, [, h]) => sum + h,
    0,
  );

  // Same "open" computation the Proposals page and ProposalsSection
  // use: `status === "open"` (equivalently `closedAt === null` —
  // closedAt is filled exactly when a proposal leaves the open
  // state; see packages/shared/src/types.ts).
  const openProposalCount = useMemo(
    () => proposals.filter((p) => p.status === "open").length,
    [proposals],
  );

  return (
    <div className="px-4 pb-8 pt-4">
      {/* docs/member-removal.md M2: if THIS member stands removed,
          say it plainly — their data is theirs and keeps working
          locally; syncing will fail until reinstatement. Never an
          eternal unexplained spinner. */}
      {selfRemoved && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
        >
          {t("removals.selfBanner")}
        </div>
      )}
      <header className="mb-4">
        <div className="flex items-center gap-2 text-canopy-700 dark:text-canopy-300">
          <Sprig size={20} />
          <h1 className="page-title min-w-0">{t("dashboard.title")}</h1>
          <Sprig size={20} className="-scale-x-100" />
        </div>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          <em>{t("dashboard.tagline")}</em>
          <WhyTooltip principleId="no-leaderboards" />
        </p>
      </header>

      {newlyReached.map((m) => (
        <MilestoneCelebration key={m.label} milestone={m} />
      ))}

      {/* Structural rail (the third round of the desktop real-estate
          reports): at lg+ the page becomes main-column + sticky right
          rail, the shape desktop dashboards are read in. The RAIL is
          the two act-now doorway cards — Coming up and Where hands
          are welcome — which are already first in DOM order, so both
          wrappers use the Board's `contents`-on-mobile pattern and
          the curated mobile stack is byte-identical. The rail column
          is `auto` + self-sized + empty:hidden (the #377 collapse):
          on a calm week both cards render null and the main column
          takes the full width instead of framing a dead rail. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-6">
      <div className="contents lg:col-start-2 lg:row-start-1 lg:block lg:w-[320px] lg:self-start lg:sticky lg:top-4 lg:empty:hidden">
      {/* Quiet "what's coming up" glance — leads the page only when there
          are upcoming events; renders nothing otherwise. */}
      <UpcomingGatherings />

      {/* "Where hands are welcome" sits BELOW Coming up: gatherings are
          time-anchored (they expire and were designed to lead the page);
          open invitations are open-ended and can wait a scroll-line.
          Same self-hiding contract — a calm week gets a calm page. */}
      <WhereHandsAreWelcome />

      {/* The organizer's-desk doorway: one line, only when something
          is actionable at the viewer's own desk (plan 2's doorways
          contract). */}
      <DeskDoorway />
      </div>

      <div className="contents min-w-0 lg:col-start-1 lg:row-start-1 lg:block">

      {/* Desktop pairing (the stretched-cards half of the desktop
          pilot reports): at lg+ the "community as a whole" cards —
          total hours, federation rollup, resilience, the proposals
          doorway — flow into two columns instead of each spanning
          ~1400px of card for a paragraph of content. Plain grid
          auto-placement, so DOM order (and the mobile stack, where
          this wrapper is display:block) is untouched; conditional
          cards simply pack tighter. items-start keeps a short card
          from being stretched to its row-mate's height. */}
      <div className="lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-x-4">
      <section className="card relative mb-4 overflow-hidden text-center lg:flex lg:flex-col lg:justify-center">
        <div
          aria-hidden="true"
          data-decorative="true"
          className="pointer-events-none absolute right-3 top-3 text-canopy-700 opacity-10 dark:text-canopy-300"
        >
          <Sprig size={48} />
        </div>
        <div className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
          {t("dashboard.totalHoursLabel")}
        </div>
        <div className="my-1 text-5xl font-extrabold text-canopy-700 dark:text-canopy-300">
          {formatHours(stats.totalHoursExchanged)}
        </div>
        <div className="text-sm text-moss-600 dark:text-moss-300">
          {t(
            stats.totalExchanges === 1
              ? "dashboard.totalExchangesOne"
              : "dashboard.totalExchangesOther",
            { count: stats.totalExchanges },
          )}
        </div>
      </section>

      {federationStats.totalExchanges > 0 && (
        <section
          className="card mb-4"
          aria-labelledby="federation-summary-title"
        >
          <h2
            id="federation-summary-title"
            className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
          >
            {t("dashboard.federation.title")}
            <WhyTooltip principleId="community-authority" />
          </h2>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t(
              federationStats.totalExchanges === 1
                ? "dashboard.federation.summaryOne"
                : "dashboard.federation.summaryOther",
              {
                count: federationStats.totalExchanges,
                hours: formatHours(federationStats.totalHoursExchanged),
                peers: federationStats.peerNodeIds.length,
              },
            )}
          </p>
        </section>
      )}

      {/* Community resilience (docs/community-resilience.md Phase A):
          clustered with the federation rollup — the other "community
          as a whole" infrastructure surface. */}
      <ResilienceCard />

      {/* Governance doorway, kept beside the federation rollup so the
          "community as a whole" surfaces cluster. One quiet line —
          "open for discussion", never "awaiting your vote"; no
          deadlines, no per-proposal detail, no urgency styling.
          Hidden entirely at zero (the Coming-up rule). */}
      {openProposalCount > 0 && (
        <section className="card mb-4 text-sm">
          <Link
            to="/proposals"
            className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("dashboard.proposalsOpen", { count: openProposalCount })}
          </Link>
        </section>
      )}
      </div>

      <div className="my-2">
        <LeafDivider variant="short" />
      </div>

      {/* 5 columns only from xl: the #382 rail narrows the main column
          at lg, where five tiles squeezed "gathering" out of its box
          (pilot report). */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label={t("dashboard.stats.activeWeek")}
          value={stats.activeMembersThisWeek}
          sublabel={t("dashboard.stats.ofMembers", { count: members.length })}
        />
        <StatCard
          label={t("dashboard.stats.activeMonth")}
          value={stats.activeMembersThisMonth}
          sublabel={t("dashboard.stats.ofMembers", { count: members.length })}
        />
        {/* Zero-state: a streak at 0 is an ebb, not a failure — render
            a warm word instead of "0 days in a row"
            (solidarity-not-shame). */}
        <StatCard
          label={t("dashboard.stats.streak")}
          value={
            stats.solidarityStreakDays === 0
              ? t("dashboard.stats.streakGathering")
              : stats.solidarityStreakDays
          }
          sublabel={
            stats.solidarityStreakDays === 0
              ? t("dashboard.stats.streakGatheringSub")
              : t(
                  stats.solidarityStreakDays === 1
                    ? "dashboard.stats.streakUnitOne"
                    : "dashboard.stats.streakUnitOther",
                )
          }
        />
        <StatCard
          label={t("dashboard.stats.needsMet")}
          value={stats.needsFulfilledThisWeek}
          sublabel={t("dashboard.stats.andCounting")}
        />
        {/* Doorway, not pressure: the stat copy is unchanged — the card
            just gains a quiet path to the Board's Needs tab
            (`/?tab=needs`, see lib/boardTab.ts). No "unmet"/"remaining"
            framing, no urgency styling. */}
        <StatCard
          label={t("dashboard.stats.needsAnswered")}
          value={stats.needsAnsweredThisWeek}
          sublabel={
            stats.needsPostedThisWeek > 0
              ? t("dashboard.stats.ofPosted", {
                  count: stats.needsPostedThisWeek,
                })
              : t("dashboard.stats.noNeedsPosted")
          }
          linkTo="/?tab=needs"
          linkLabel={t("dashboard.stats.seeOpenNeeds")}
          linkAriaLabel={t("dashboard.stats.seeOpenNeedsAria")}
        />
      </div>

      <div className="my-2">
        <LeafDivider variant="short" />
      </div>

      {/* Second desktop pair: milestones beside the category
          breakdown. The divider between them is a mobile-stack
          separator — side by side it would render as a stray leaf in
          a grid cell, so it hides at lg. */}
      <div className="lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-x-4">
      <CanopyMilestones
        totalHours={stats.totalHoursExchanged}
        totalExchanges={stats.totalExchanges}
        totalMembers={members.length}
        newlyReachedLabels={new Set(newlyReached.map((m) => m.label))}
        nodeConfig={nodeConfig}
      />

      <div className="my-2 lg:hidden">
        <LeafDivider variant="short" />
      </div>

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
          {t("dashboard.categoryBreakdown.title")}
        </h2>
        {totalCategoryHours === 0 ? (
          <EmptyState
            illustration="sapling"
            variant="inset"
            title={t("dashboard.categoryBreakdown.emptyTitle")}
            message={t("dashboard.categoryBreakdown.empty")}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {topCategories.map(([cat, h]) => {
              const pct = Math.round((h / totalCategoryHours) * 100);
              const meta = CATEGORY_META[cat];
              return (
                <li key={cat} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm">
                    <span aria-hidden="true" className="mr-1">
                      {meta.emoji}
                    </span>
                    {t(`categories.${cat}`)}
                  </span>
                  <div
                    className="h-2 flex-1 overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
                    aria-hidden="true"
                  >
                    <div
                      className={`h-full rounded-full ${meta.barColorClass}`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs text-moss-600 dark:text-moss-300">
                    {formatHours(h)} ({pct}%)
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      </div>

      <div className="my-2">
        <LeafDivider variant="short" />
      </div>

      {/* Third desktop pair: the two "flow of help" visualizations. */}
      <div className="lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-x-4">
      <div className="relative">
        <BreadthBar entries={flow.breadth} members={members} />
        <div className="-mt-3 mb-4 flex justify-end">
          <WhyTooltip principleId="no-activity-search" />
        </div>
      </div>

      <ReciprocityPulse
        reciprocalPairs={flow.reciprocalPairs}
        totalPairs={flow.totalPairs}
      />
      </div>

      {achievementsThisMonth.size > 0 && (
        <>
          <div className="my-2">
            <LeafDivider variant="short" />
          </div>
          <section className="card">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
            {t("dashboard.rolesThisMonth.title")}
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            {Array.from(achievementsThisMonth.entries()).map(
              ([type, count]) => (
                <li key={type}>
                  {t(
                    count === 1
                      ? "dashboard.rolesThisMonth.lineOne"
                      : "dashboard.rolesThisMonth.lineOther",
                    {
                      count,
                      role: t(`achievement.${type as AchievementType}.label`),
                    },
                  )}
                </li>
              ),
            )}
          </ul>
          </section>
        </>
      )}
      </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  linkTo,
  linkLabel,
  linkAriaLabel,
}: {
  label: string;
  value: number | string;
  sublabel: string;
  /** Optional doorway: when set (with `linkLabel`), the card gains a
   *  quiet trailing link in the house register (canopy text +
   *  hover-underline). The stat itself stays a plain reading — the
   *  link is an invitation the member may tap, never an alert. */
  linkTo?: string;
  linkLabel?: string;
  /** Names the destination for screen readers (the visible label is
   *  short; the aria-label says where the link goes). */
  linkAriaLabel?: string;
}) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {label}
      </div>
      {/* Word values ("gathering") get a size that fits a tile
          before break-words has to split them mid-word; numbers keep
          the big figure. */}
      <div
        className={`mt-1 break-words font-bold leading-tight ${
          typeof value === "string" ? "text-2xl" : "text-3xl"
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-moss-600 dark:text-moss-300">{sublabel}</div>
      {linkTo && linkLabel && (
        <Link
          to={linkTo}
          aria-label={linkAriaLabel}
          className="mt-1 inline-flex items-center gap-1 text-xs text-canopy-700 underline-offset-2 hover:underline focus-visible:underline dark:text-canopy-300"
        >
          {linkLabel}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

function MilestoneCelebration({ milestone }: { milestone: Milestone }) {
  const { t } = useTranslation();
  return (
    <div className="mb-3 flex animate-milestone-pop items-center gap-3 rounded-2xl bg-canopy-50 p-4 text-canopy-900 shadow-sm dark:bg-canopy-950/40 dark:text-canopy-100">
      <div aria-hidden="true" className="text-3xl">
        {"\u{1F389}"}
      </div>
      <div>
        <div className="text-sm font-semibold">
          {t("dashboard.milestones.celebration")}
        </div>
        <div className="text-base">{milestone.label}</div>
      </div>
    </div>
  );
}

function useNewlyReachedMilestones(reached: Milestone[]) {
  const [fresh, setFresh] = useState<Milestone[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getSetting(SETTING_KEYS.celebratedMilestones);
      const celebrated = new Set<string>(
        stored ? (JSON.parse(stored) as string[]) : [],
      );
      const fresh = reached.filter((m) => !celebrated.has(m.label));
      if (!cancelled) {
        setFresh(fresh);
        if (fresh.length > 0) {
          for (const m of fresh) celebrated.add(m.label);
          await setSetting(
            SETTING_KEYS.celebratedMilestones,
            JSON.stringify(Array.from(celebrated)),
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reached]);
  return fresh;
}
