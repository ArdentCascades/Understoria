import { describe, expect, it } from "vitest";
import { computeCommunityStats, computeSolidarityStreak } from "./stats";
import type { Exchange, Member, Post } from "@/types";

const nodeId = "node_test";
const DAY = 24 * 60 * 60 * 1000;

function exchange(id: string, at: number, hours = 1): Exchange {
  return {
    id,
    postId: `p_${id}`,
    helperKey: "a",
    helpedKey: "b",
    hoursExchanged: hours,
    helperSignature: "s",
    helpedSignature: "s",
    completedAt: at,
    category: "other",
    nodeId,
  };
}

function member(k: string): Member {
  return {
    publicKey: k,
    displayName: k,
    skills: [],
    availability: "",
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId,
    locationZone: "",
  };
}

describe("computeSolidarityStreak", () => {
  const now = 100 * DAY + 12 * 60 * 60 * 1000;

  it("returns 0 with no exchanges", () => {
    expect(computeSolidarityStreak([], now)).toBe(0);
  });

  it("does not break when today has no exchange yet", () => {
    const ex = [
      exchange("1", now - DAY),
      exchange("2", now - 2 * DAY),
      exchange("3", now - 3 * DAY),
    ];
    expect(computeSolidarityStreak(ex, now)).toBe(3);
  });

  it("counts multiple same-day exchanges as one day", () => {
    const ex = [
      exchange("1", now - 30 * 60 * 1000),
      exchange("2", now - 60 * 60 * 1000),
    ];
    expect(computeSolidarityStreak(ex, now)).toBe(1);
  });

  it("breaks on a missing day in the middle of the streak", () => {
    const ex = [
      exchange("1", now),
      exchange("2", now - DAY),
      // gap at now - 2d
      exchange("3", now - 3 * DAY),
    ];
    expect(computeSolidarityStreak(ex, now)).toBe(2);
  });
});

describe("computeCommunityStats", () => {
  const now = 100 * DAY;

  it("computes totals and category breakdown", () => {
    const exchanges = [
      exchange("1", now - 1 * DAY, 1.5),
      exchange("2", now - 2 * DAY, 2),
      { ...exchange("3", now - 3 * DAY, 0.5), category: "food" as const },
    ];
    const stats = computeCommunityStats(
      exchanges,
      [member("a"), member("b")],
      [],
      now,
    );
    expect(stats.totalExchanges).toBe(3);
    expect(stats.totalHoursExchanged).toBe(4);
    expect(stats.categoryBreakdown.food).toBe(0.5);
    expect(stats.categoryBreakdown.other).toBe(3.5);
  });

  it("counts active members within the last week", () => {
    const exchanges = [
      exchange("1", now - 2 * DAY),
      { ...exchange("2", now - 40 * DAY) },
    ];
    const stats = computeCommunityStats(
      exchanges,
      [member("a"), member("b")],
      [],
      now,
    );
    // exchange 1 covers a+b within the week
    expect(stats.activeMembersThisWeek).toBe(2);
    // month window covers everyone in both
    expect(stats.activeMembersThisMonth).toBe(2);
  });

  it("reports needs fulfilled this week", () => {
    const post: Post = {
      id: "p1",
      type: "NEED",
      category: "other",
      title: "Ride",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      postedBy: "a",
      claimedBy: "b",
      status: "completed",
      createdAt: now - 3 * DAY,
      expiresAt: null,
      locationZone: "",
      confirmedBy: ["a", "b"],
    };
    const exchanges: Exchange[] = [
      { ...exchange("1", now - 2 * DAY), postId: "p1" },
    ];
    const stats = computeCommunityStats(exchanges, [member("a")], [post], now);
    expect(stats.needsFulfilledThisWeek).toBe(1);
  });
});
