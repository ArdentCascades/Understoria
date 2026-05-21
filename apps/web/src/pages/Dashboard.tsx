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
import { computeCommunityStats } from "@/lib/stats";
import { milestoneProgress } from "@/lib/milestones";
import { CATEGORY_META } from "@/lib/categories";
import { formatHours } from "@/lib/format";
import { getSetting, SETTING_KEYS, setSetting } from "@/db/database";
import type { AchievementType, Category, Milestone } from "@/types";

export default function DashboardPage() {
  const { exchanges, members, posts, achievements } = useApp();
  const { t } = useTranslation();
  const stats = useMemo(
    () => computeCommunityStats(exchanges, members, posts),
    [exchanges, members, posts],
  );

  const hoursProgress = milestoneProgress("hours", stats.totalHoursExchanged);
  const exchangeProgress = milestoneProgress("exchanges", stats.totalExchanges);
  const memberProgress = milestoneProgress("members", members.length);

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
        <h1 className="text-2xl font-bold tracking-tight">
          {t("dashboard.title")}
        </h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          <em>{t("dashboard.tagline")}</em>
        </p>
      </header>

      {newlyReached.map((m) => (
        <MilestoneCelebration key={m.label} milestone={m} />
      ))}

      <section className="card mb-4 text-center">
        <div className="text-xs uppercase tracking-wide text-moss-500">
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

      <div className="mb-4 grid grid-cols-2 gap-3">
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
      </div>

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
          {t("dashboard.milestones.title")}
        </h2>
        <MilestoneBar
          icon={"\u{23F3}"}
          label={t("dashboard.milestones.hours")}
          value={stats.totalHoursExchanged}
          valueDisplay={formatHours(stats.totalHoursExchanged)}
          current={hoursProgress.current}
          next={hoursProgress.next}
          progress={hoursProgress.progress}
        />
        <MilestoneBar
          icon={"\u{1F91D}"}
          label={t("dashboard.milestones.exchanges")}
          value={stats.totalExchanges}
          valueDisplay={`${stats.totalExchanges}`}
          current={exchangeProgress.current}
          next={exchangeProgress.next}
          progress={exchangeProgress.progress}
        />
        <MilestoneBar
          icon={"\u{1F331}"}
          label={t("dashboard.milestones.members")}
          value={members.length}
          valueDisplay={`${members.length}`}
          current={memberProgress.current}
          next={memberProgress.next}
          progress={memberProgress.progress}
        />
      </section>

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
          {t("dashboard.categoryBreakdown.title")}
        </h2>
        {totalCategoryHours === 0 ? (
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("dashboard.categoryBreakdown.empty")}
          </p>
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
                      className="h-full rounded-full bg-canopy-600"
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

      {achievementsThisMonth.size > 0 && (
        <section className="card">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
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
      <div className="text-xs uppercase tracking-wide text-moss-500">
        {label}
      </div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
      <div className="text-xs text-moss-600 dark:text-moss-300">{sublabel}</div>
    </div>
  );
}

function MilestoneBar({
  icon,
  label,
  valueDisplay,
  current,
  next,
  progress,
}: {
  icon: string;
  label: string;
  value: number;
  valueDisplay: string;
  current: Milestone;
  next: Milestone | null;
  progress: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between text-sm">
        <span>
          <span aria-hidden="true" className="mr-1">
            {icon}
          </span>
          {label}
        </span>
        <span className="text-xs text-moss-500">
          {next
            ? t("dashboard.milestones.valueOf", {
                value: valueDisplay,
                next: next.threshold,
              })
            : `${valueDisplay}${t("dashboard.milestones.topReached")}`}
        </span>
      </div>
      <div
        className="mt-1 h-2 overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div
          className="h-full rounded-full bg-canopy-600 transition-[width] duration-500"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-moss-500">
        {t("dashboard.milestones.lastReached", { label: current.label })}
      </div>
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
