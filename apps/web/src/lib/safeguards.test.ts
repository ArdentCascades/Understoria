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
import { describe, expect, it } from "vitest";
import {
  assertWithinDailyLimit,
  DailyLimitExceededError,
  evaluateSafeguards,
  exceedsDailyLimit,
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

  it("counts across a rolling 24h window, not a UTC calendar bucket", () => {
    // A UTC-bucket check reset at midnight, so a helper could do the
    // whole limit late one evening and the whole limit again just after
    // midnight — double the hard stop in minutes (Round-4 review, L5).
    // The rolling window still sees the earlier exchanges, so the cap
    // holds regardless of where the calendar day boundary falls.
    const midnight = 100 * DAY; // exactly a UTC day boundary
    const existing = [
      exchange("1", "a", "b", midnight - 20 * 60 * 1000), // 23:40 prev day
      exchange("2", "a", "c", midnight - 15 * 60 * 1000), // 23:45 prev day
      exchange("3", "a", "d", midnight - 10 * 60 * 1000), // 23:50 prev day
    ];
    // Ten minutes into the new UTC day — a bucket check would see zero.
    const justAfterMidnight = midnight + 10 * 60 * 1000;
    expect(() =>
      assertWithinDailyLimit("a", existing, justAfterMidnight),
    ).toThrow(DailyLimitExceededError);
  });

  it("drops an exchange that has just aged past the 24h window", () => {
    // Two still count (23h and 12h ago); the third is 24h + 1min old and
    // falls outside the rolling window, so the helper is back under the
    // limit of three.
    const existing = [
      exchange("1", "a", "b", now - (DAY + 60 * 1000)),
      exchange("2", "a", "c", now - 23 * 60 * 60 * 1000),
      exchange("3", "a", "d", now - 12 * 60 * 60 * 1000),
    ];
    expect(() => assertWithinDailyLimit("a", existing, now)).not.toThrow();
  });
});

describe("exceedsDailyLimit", () => {
  const now = 100 * DAY + 12 * 60 * 60 * 1000;

  it("is false under the limit", () => {
    const existing = [
      exchange("1", "a", "b", now - 1 * 60 * 60 * 1000),
      exchange("2", "a", "c", now - 2 * 60 * 60 * 1000),
    ];
    expect(exceedsDailyLimit("a", existing, now)).toBe(false);
  });

  it("is true at the limit — the non-throwing auto-confirm variant", () => {
    const existing = [
      exchange("1", "a", "b", now - 1 * 60 * 60 * 1000),
      exchange("2", "a", "c", now - 2 * 60 * 60 * 1000),
      exchange("3", "a", "d", now - 3 * 60 * 60 * 1000),
    ];
    // Same rolling-window arithmetic as the hard stop, but returns a
    // boolean instead of throwing so a system-signed exchange can be
    // flagged rather than stranded.
    expect(exceedsDailyLimit("a", existing, now)).toBe(true);
  });

  it("uses the rolling window, dropping exchanges older than 24h", () => {
    const existing = [
      exchange("1", "a", "b", now - (DAY + 60 * 1000)),
      exchange("2", "a", "c", now - 2 * 60 * 60 * 1000),
      exchange("3", "a", "d", now - 3 * 60 * 60 * 1000),
    ];
    expect(exceedsDailyLimit("a", existing, now)).toBe(false);
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
