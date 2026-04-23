import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/state/AppContext";
import { computeCommunityStats } from "@/lib/stats";
import { milestoneProgress } from "@/lib/milestones";
import { CATEGORY_META } from "@/lib/categories";
import { formatHours } from "@/lib/format";
import { getSetting, SETTING_KEYS, setSetting } from "@/db/database";
import type { Category, Milestone } from "@/types";

export default function DashboardPage() {
  const { exchanges, members, posts, achievements } = useApp();
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
        <h1 className="text-2xl font-bold tracking-tight">Community dashboard</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          The unit of progress is <em>us</em>, not me.
        </p>
      </header>

      {newlyReached.map((m) => (
        <MilestoneCelebration key={m.label} milestone={m} />
      ))}

      <section className="card mb-4 text-center">
        <div className="text-xs uppercase tracking-wide text-moss-500">
          Total hours exchanged
        </div>
        <div className="my-1 text-5xl font-extrabold text-canopy-700 dark:text-canopy-300">
          {formatHours(stats.totalHoursExchanged)}
        </div>
        <div className="text-sm text-moss-600 dark:text-moss-300">
          across {stats.totalExchanges} exchange
          {stats.totalExchanges === 1 ? "" : "s"}
        </div>
      </section>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard
          label="Active this week"
          value={stats.activeMembersThisWeek}
          sublabel={`of ${members.length} members`}
        />
        <StatCard
          label="Active this month"
          value={stats.activeMembersThisMonth}
          sublabel={`of ${members.length} members`}
        />
        <StatCard
          label="Solidarity streak"
          value={stats.solidarityStreakDays}
          sublabel={
            stats.solidarityStreakDays === 1 ? "day" : "days in a row"
          }
        />
        <StatCard
          label="Needs met this week"
          value={stats.needsFulfilledThisWeek}
          sublabel="and counting"
        />
      </div>

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
          Collective milestones
        </h2>
        <MilestoneBar
          icon="\u{23F3}"
          label="Hours of mutual aid"
          value={stats.totalHoursExchanged}
          valueDisplay={formatHours(stats.totalHoursExchanged)}
          current={hoursProgress.current}
          next={hoursProgress.next}
          progress={hoursProgress.progress}
        />
        <MilestoneBar
          icon="\u{1F91D}"
          label="Exchanges completed"
          value={stats.totalExchanges}
          valueDisplay={`${stats.totalExchanges}`}
          current={exchangeProgress.current}
          next={exchangeProgress.next}
          progress={exchangeProgress.progress}
        />
        <MilestoneBar
          icon="\u{1F331}"
          label="Members strong"
          value={members.length}
          valueDisplay={`${members.length}`}
          current={memberProgress.current}
          next={memberProgress.next}
          progress={memberProgress.progress}
        />
      </section>

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
          Where help is flowing
        </h2>
        {totalCategoryHours === 0 ? (
          <p className="text-sm text-moss-600 dark:text-moss-300">
            No exchanges yet. Once the first one happens, you'll see the mix of
            care, labor, and support flowing through the community.
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
                    {meta.label}
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
            Community roles earned this month
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            {Array.from(achievementsThisMonth.entries()).map(
              ([type, count]) => (
                <li key={type}>
                  <span className="font-medium">{count}</span> member
                  {count === 1 ? "" : "s"} earned{" "}
                  <span className="font-medium">
                    {labelForAchievement(type)}
                  </span>
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
          {valueDisplay}
          {next ? ` / ${next.threshold}` : " — top milestone reached"}
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
        Last reached: {current.label}
      </div>
    </div>
  );
}

function MilestoneCelebration({ milestone }: { milestone: Milestone }) {
  return (
    <div className="mb-3 flex animate-milestone-pop items-center gap-3 rounded-2xl bg-canopy-50 p-4 text-canopy-900 shadow-sm dark:bg-canopy-950/40 dark:text-canopy-100">
      <div aria-hidden="true" className="text-3xl">
        {"\u{1F389}"}
      </div>
      <div>
        <div className="text-sm font-semibold">We reached a milestone</div>
        <div className="text-base">{milestone.label}</div>
      </div>
    </div>
  );
}

function labelForAchievement(type: string): string {
  const map: Record<string, string> = {
    first_exchange: "First Exchange",
    connector_5: "Connector",
    regular_4weeks: "Regular",
    bridge_builder: "Bridge Builder",
    seed_planter: "Seed Planter",
    listener: "Listener",
  };
  return map[type] ?? type;
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
