import { describe, expect, it } from "vitest";
import { diffAchievements, evaluateAchievements } from "./achievements";
import type { Category, Exchange } from "@/types";

const nodeId = "node_test";
const WEEK = 7 * 24 * 60 * 60 * 1000;

function exchange(
  id: string,
  helper: string,
  helped: string,
  completedAt: number,
  category: Category = "other",
): Exchange {
  return {
    id,
    postId: `post_${id}`,
    helperKey: helper,
    helpedKey: helped,
    hoursExchanged: 1,
    helperSignature: "sig1",
    helpedSignature: "sig2",
    completedAt,
    category,
    nodeId,
  };
}

describe("evaluateAchievements", () => {
  const now = 100 * WEEK;

  it("returns no achievements for a member with no exchanges", () => {
    expect(evaluateAchievements("a", [], {}, now)).toEqual([]);
  });

  it("awards first_exchange on the first completed exchange", () => {
    const list = evaluateAchievements(
      "a",
      [exchange("1", "a", "b", now)],
      {},
      now,
    );
    expect(list).toContain("first_exchange");
  });

  it("awards connector_5 after helping 5 distinct recipients", () => {
    const exchanges = ["b", "c", "d", "e", "f"].map((k, i) =>
      exchange(`${i}`, "a", k, now),
    );
    const list = evaluateAchievements("a", exchanges, {}, now);
    expect(list).toContain("connector_5");
  });

  it("does not award connector_5 when helping the same person repeatedly", () => {
    const exchanges = Array.from({ length: 6 }, (_, i) =>
      exchange(`${i}`, "a", "b", now),
    );
    const list = evaluateAchievements("a", exchanges, {}, now);
    expect(list).not.toContain("connector_5");
  });

  it("awards listener after 3 emotional_support exchanges", () => {
    const exchanges = [
      exchange("1", "a", "b", now, "emotional_support"),
      exchange("2", "a", "c", now, "emotional_support"),
      exchange("3", "a", "d", now, "emotional_support"),
    ];
    const list = evaluateAchievements("a", exchanges, {}, now);
    expect(list).toContain("listener");
  });

  it("awards regular_4weeks for 4 consecutive active weeks", () => {
    const exchanges = [
      exchange("1", "a", "b", now),
      exchange("2", "a", "b", now - WEEK),
      exchange("3", "a", "b", now - 2 * WEEK),
      exchange("4", "a", "b", now - 3 * WEEK),
    ];
    const list = evaluateAchievements("a", exchanges, {}, now);
    expect(list).toContain("regular_4weeks");
  });

  it("does not award regular_4weeks if there is a gap week", () => {
    const exchanges = [
      exchange("1", "a", "b", now),
      exchange("2", "a", "b", now - WEEK),
      // gap at now - 2w
      exchange("3", "a", "b", now - 3 * WEEK),
      exchange("4", "a", "b", now - 4 * WEEK),
    ];
    const list = evaluateAchievements("a", exchanges, {}, now);
    expect(list).not.toContain("regular_4weeks");
  });

  it("awards bridge_builder when helper fills a new category", () => {
    const exchanges = [exchange("1", "a", "b", now, "housing")];
    const filled: Set<Category> = new Set(["food", "transport"]);
    const list = evaluateAchievements(
      "a",
      exchanges,
      { previouslyFilledCategories: filled },
      now,
    );
    expect(list).toContain("bridge_builder");
  });

  it("awards seed_planter when 3 invitees have an exchange", () => {
    const list = evaluateAchievements(
      "a",
      [],
      { activeInviteeKeys: ["x", "y", "z"] },
      now,
    );
    expect(list).toContain("seed_planter");
  });
});

describe("diffAchievements", () => {
  const now = 100 * WEEK;

  it("returns only newly-earned achievements", () => {
    const exchanges = [exchange("1", "a", "b", now)];
    const current = ["first_exchange"] as const;
    const diff = diffAchievements("a", current, exchanges, {}, now);
    expect(diff.map((d) => d.achievementType)).not.toContain("first_exchange");
  });

  it("produces Achievement records with the given memberKey", () => {
    const exchanges = [exchange("1", "a", "b", now)];
    const diff = diffAchievements("a", [], exchanges, {}, now);
    expect(diff.length).toBeGreaterThan(0);
    expect(diff[0].memberKey).toBe("a");
    expect(diff[0].earnedAt).toBe(now);
  });
});
