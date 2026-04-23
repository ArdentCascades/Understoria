import type {
  Category,
  CommunityStats,
  Exchange,
  Member,
  Post,
} from "@/types";
import { reachedMilestones } from "./milestones";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeCommunityStats(
  exchanges: readonly Exchange[],
  members: readonly Member[],
  posts: readonly Post[],
  now: number = Date.now(),
): CommunityStats {
  const totalHoursExchanged =
    Math.round(
      exchanges.reduce((sum, x) => sum + x.hoursExchanged, 0) * 10,
    ) / 10;
  const totalExchanges = exchanges.length;

  const oneWeekAgo = now - 7 * MS_PER_DAY;
  const oneMonthAgo = now - 30 * MS_PER_DAY;

  const activeWeek = new Set<string>();
  const activeMonth = new Set<string>();
  for (const x of exchanges) {
    if (x.completedAt >= oneMonthAgo) {
      activeMonth.add(x.helperKey);
      activeMonth.add(x.helpedKey);
    }
    if (x.completedAt >= oneWeekAgo) {
      activeWeek.add(x.helperKey);
      activeWeek.add(x.helpedKey);
    }
  }

  const categoryBreakdown: Partial<Record<Category, number>> = {};
  for (const x of exchanges) {
    categoryBreakdown[x.category] =
      (categoryBreakdown[x.category] ?? 0) + x.hoursExchanged;
  }

  const needsFulfilledThisWeek = posts.filter(
    (p) =>
      p.type === "NEED" &&
      p.status === "completed" &&
      exchanges.some(
        (x) =>
          x.postId === p.id && x.completedAt >= oneWeekAgo,
      ),
  ).length;

  const hoursMilestones = reachedMilestones("hours", totalHoursExchanged);
  const exchangeMilestones = reachedMilestones("exchanges", totalExchanges);
  const memberMilestones = reachedMilestones("members", members.length);

  return {
    totalHoursExchanged,
    totalExchanges,
    activeMembersThisWeek: activeWeek.size,
    activeMembersThisMonth: activeMonth.size,
    solidarityStreakDays: computeSolidarityStreak(exchanges, now),
    needsFulfilledThisWeek,
    categoryBreakdown,
    milestonesReached: [
      ...hoursMilestones,
      ...exchangeMilestones,
      ...memberMilestones,
    ],
  };
}

/**
 * Consecutive days (ending at `now`) on which at least one exchange was
 * completed, anywhere in the community.
 */
export function computeSolidarityStreak(
  exchanges: readonly Exchange[],
  now: number = Date.now(),
): number {
  if (exchanges.length === 0) return 0;
  const days = new Set<number>();
  for (const x of exchanges) {
    const day = Math.floor(x.completedAt / MS_PER_DAY);
    days.add(day);
  }
  const today = Math.floor(now / MS_PER_DAY);
  let streak = 0;
  for (let d = today; d >= today - 365; d--) {
    if (days.has(d)) streak += 1;
    else if (d === today) continue; // today without exchanges doesn't yet break the streak
    else break;
  }
  return streak;
}
