import { describe, expect, it } from "vitest";
import {
  assertWithinDailyLimit,
  DailyLimitExceededError,
  evaluateSafeguards,
} from "./safeguards";
import type { Exchange } from "@/types";

const NODE = "node_test";
const DAY = 24 * 60 * 60 * 1000;

function exchange(
  id: string,
  helper: string,
  helped: string,
  completedAt: number,
  hours = 1,
): Exchange {
  return {
    id,
    postId: `p_${id}`,
    helperKey: helper,
    helpedKey: helped,
    hoursExchanged: hours,
    helperSignature: "s",
    helpedSignature: "s",
    completedAt,
    category: "other",
    nodeId: NODE,
  };
}

describe("assertWithinDailyLimit", () => {
  const now = 100 * DAY + 12 * 60 * 60 * 1000; // mid-day

  it("passes when the helper has no exchanges today", () => {
    expect(() => assertWithinDailyLimit("a", [], now)).not.toThrow();
  });

  it("passes under the limit", () => {
    const existing = [
      exchange("1", "a", "b", now - 1 * 60 * 60 * 1000),
      exchange("2", "a", "c", now - 2 * 60 * 60 * 1000),
    ];
    expect(() => assertWithinDailyLimit("a", existing, now)).not.toThrow();
  });

  it("throws at the limit", () => {
    const existing = [
      exchange("1", "a", "b", now - 1 * 60 * 60 * 1000),
      exchange("2", "a", "c", now - 2 * 60 * 60 * 1000),
      exchange("3", "a", "d", now - 3 * 60 * 60 * 1000),
    ];
    expect(() => assertWithinDailyLimit("a", existing, now)).toThrow(
      DailyLimitExceededError,
    );
  });

  it("ignores exchanges from previous days", () => {
    const existing = [
      exchange("1", "a", "b", now - 2 * DAY),
      exchange("2", "a", "c", now - 2 * DAY),
      exchange("3", "a", "d", now - 2 * DAY),
    ];
    expect(() => assertWithinDailyLimit("a", existing, now)).not.toThrow();
  });

  it("only counts exchanges where the member was the helper", () => {
    const existing = [
      exchange("1", "b", "a", now - 1 * 60 * 60 * 1000),
      exchange("2", "c", "a", now - 2 * 60 * 60 * 1000),
      exchange("3", "d", "a", now - 3 * 60 * 60 * 1000),
    ];
    expect(() => assertWithinDailyLimit("a", existing, now)).not.toThrow();
  });
});

describe("evaluateSafeguards", () => {
  const now = 100 * DAY;

  it("flags a very short exchange for review", () => {
    const pending = {
      helperKey: "a",
      helpedKey: "b",
      hoursExchanged: 0.1,
      completedAt: now,
    };
    const result = evaluateSafeguards(pending, []);
    expect(result.flaggedForReview).toBe(true);
    expect(result.flagReason).toBe("short_duration");
  });

  it("does not flag an exchange that is just one hour long", () => {
    const result = evaluateSafeguards(
      { helperKey: "a", helpedKey: "b", hoursExchanged: 1, completedAt: now },
      [],
    );
    expect(result.flaggedForReview).toBe(false);
  });

  it("flags a tight reciprocal loop between the same two members", () => {
    const existing = [
      exchange("1", "a", "b", now - DAY),
      exchange("2", "b", "a", now - 2 * DAY),
    ];
    const pending = {
      helperKey: "a",
      helpedKey: "b",
      hoursExchanged: 1,
      completedAt: now,
    };
    const result = evaluateSafeguards(pending, existing);
    expect(result.flaggedForReview).toBe(true);
    expect(result.flagReason).toBe("reciprocal_pattern");
  });

  it("does not flag an exchange between members with a varied network", () => {
    const existing = [
      exchange("1", "a", "c", now - DAY),
      exchange("2", "a", "d", now - 2 * DAY),
      exchange("3", "b", "e", now - 3 * DAY),
    ];
    const pending = {
      helperKey: "a",
      helpedKey: "b",
      hoursExchanged: 1,
      completedAt: now,
    };
    const result = evaluateSafeguards(pending, existing);
    expect(result.flaggedForReview).toBe(false);
  });

  it("ignores reciprocal activity that is older than the 30-day window", () => {
    const existing = [
      exchange("1", "a", "b", now - 60 * DAY),
      exchange("2", "b", "a", now - 70 * DAY),
    ];
    const pending = {
      helperKey: "a",
      helpedKey: "b",
      hoursExchanged: 1,
      completedAt: now,
    };
    const result = evaluateSafeguards(pending, existing);
    expect(result.flaggedForReview).toBe(false);
  });
});
