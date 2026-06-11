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
import type { AchievementType, Category, Milestone } from "@/types";

export default function DashboardPage() {
  const { exchanges, members, posts, achievements, nodeConfig, nodeId } =
    useApp();
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

  return (
    <div className="px-4 pb-8 pt-4">
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

      <section className="card relative mb-4 overflow-hidden text-center">
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

      <div className="my-2">
        <LeafDivider variant="short" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
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
        <StatCard
          label={t("dashboard.stats.streak")}
          value={stats.solidarityStreakDays}
          sublabel={t(
            stats.solidarityStreakDays === 1
              ? "dashboard.stats.streakUnitOne"
              : "dashboard.stats.streakUnitOther",
          )}
        />
        <StatCard
          label={t("dashboard.stats.needsMet")}
          value={stats.needsFulfilledThisWeek}
          sublabel={t("dashboard.stats.andCounting")}
        />
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
        />
      </div>

      <div className="my-2">
        <LeafDivider variant="short" />
      </div>

      <CanopyMilestones
        totalHours={stats.totalHoursExchanged}
        totalExchanges={stats.totalExchanges}
        totalMembers={members.length}
        newlyReachedLabels={new Set(newlyReached.map((m) => m.label))}
        nodeConfig={nodeConfig}
      />

      <div className="my-2">
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

      <div className="my-2">
        <LeafDivider variant="short" />
      </div>

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
  );
}

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: number | string;
  sublabel: string;
}) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {label}
      </div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
      <div className="text-xs text-moss-600 dark:text-moss-300">{sublabel}</div>
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
