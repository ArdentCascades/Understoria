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
import type {
  ProjectCategory,
  CommunityStats,
  Exchange,
  Member,
  NodeConfig,
  Post,
} from "@/types";
import { reachedMilestones } from "./milestones";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeCommunityStats(
  exchanges: readonly Exchange[],
  members: readonly Member[],
  posts: readonly Post[],
  now: number = Date.now(),
  /** Optional — when provided, community-defined custom milestones are
   *  layered on top of the baseline. Omitted in older call sites and
   *  tests; baseline-only behaviour is preserved. */
  nodeConfig?: NodeConfig,
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

  const categoryBreakdown: Partial<Record<ProjectCategory, number>> = {};
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

  // Community-responsiveness signal: of the needs that came up
  // this week, how many already have someone stepping up. We use
  // post `createdAt` as the time window because there's no
  // `claimedAt` field on Post.
  const needsThisWeek = posts.filter(
    (p) => p.type === "NEED" && p.createdAt >= oneWeekAgo,
  );
  const needsPostedThisWeek = needsThisWeek.length;
  const needsAnsweredThisWeek = needsThisWeek.filter(
    (p) => p.claimedBy !== null,
  ).length;

  const hoursMilestones = reachedMilestones(
    "hours",
    totalHoursExchanged,
    nodeConfig,
  );
  const exchangeMilestones = reachedMilestones(
    "exchanges",
    totalExchanges,
    nodeConfig,
  );
  const memberMilestones = reachedMilestones(
    "members",
    members.length,
    nodeConfig,
  );

  return {
    totalHoursExchanged,
    totalExchanges,
    activeMembersThisWeek: activeWeek.size,
    activeMembersThisMonth: activeMonth.size,
    solidarityStreakDays: computeSolidarityStreak(exchanges, now),
    needsFulfilledThisWeek,
    needsAnsweredThisWeek,
    needsPostedThisWeek,
    categoryBreakdown,
    milestonesReached: [
      ...hoursMilestones,
      ...exchangeMilestones,
      ...memberMilestones,
    ],
  };
}

export interface FederationStats {
  /** Number of exchanges in the input set whose `nodeId` is NOT the
   *  local node. Zero if the input was already local-only. */
  totalExchanges: number;
  /** Hours summed across the same subset, rounded to 1dp. */
  totalHoursExchanged: number;
  /** Distinct peer node ids represented in the subset. The count
   *  alone is shown in the UI; the set itself is exposed for tests
   *  and for future per-peer breakdowns. */
  peerNodeIds: string[];
}

/**
 * Aggregates the subset of exchanges that originated on a node OTHER
 * than `localNodeId`. Used by the Dashboard to render an "Across
 * federation" rollup as a SEPARATE surface from the home-node
 * headline, rather than silently inflating the headline number.
 *
 * Splitting (rather than summing) follows `no-leaderboards` and
 * `community-authority`: a node's own metabolism stays legible
 * regardless of how active the federation is; the federation panel
 * surfaces flow without putting the home node in a contest.
 */
export function computeFederationStats(
  exchanges: readonly Exchange[],
  localNodeId: string,
): FederationStats {
  const peerSet = new Set<string>();
  let hours = 0;
  let count = 0;
  for (const x of exchanges) {
    if (x.nodeId === localNodeId || x.nodeId === "") continue;
    peerSet.add(x.nodeId);
    hours += x.hoursExchanged;
    count += 1;
  }
  return {
    totalExchanges: count,
    totalHoursExchanged: Math.round(hours * 10) / 10,
    peerNodeIds: Array.from(peerSet),
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
