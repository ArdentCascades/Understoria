/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { isSoleFounder, singleFounderLocked } from "./singleFounder";

// The single-founder detector truth table
// (docs/cofounder-ceremony-plan.md P4). The load-bearing rows:
//   - the ROOT COUNT (published hashes) is authoritative, so two
//     roots with a shrunken circle is NOT locked (the reopening
//     attack must never re-open the ceremony gate);
//   - no capture is never locked (founderless nodes stay silent).

const one = { hashes: ["h1"] };
const two = { hashes: ["h1", "h2"] };
const none = { hashes: [] as string[] };

describe("singleFounderLocked", () => {
  it("no capture → false regardless of circle (founderless rule)", () => {
    expect(singleFounderLocked(null, null)).toBe(false);
    expect(singleFounderLocked(null, 0)).toBe(false);
    expect(singleFounderLocked(null, 5)).toBe(false);
  });

  it("capture with zero hashes → false (founderless publishes empty)", () => {
    expect(singleFounderLocked(none, null)).toBe(false);
    expect(singleFounderLocked(none, 1)).toBe(false);
  });

  it("exactly one hash + circle below 2 → locked", () => {
    expect(singleFounderLocked(one, 0)).toBe(true);
    expect(singleFounderLocked(one, 1)).toBe(true);
  });

  it("exactly one hash + unresolvable circle (null) → locked — one published root is still one root", () => {
    expect(singleFounderLocked(one, null)).toBe(true);
  });

  it("exactly one hash + circle of 2 → not locked (defensive honesty)", () => {
    expect(singleFounderLocked(one, 2)).toBe(false);
  });

  it("two hashes + shrunken circle → NOT locked: root count, never circle size, decides (reopening attack)", () => {
    expect(singleFounderLocked(two, 1)).toBe(false);
    expect(singleFounderLocked(two, 0)).toBe(false);
    expect(singleFounderLocked(two, null)).toBe(false);
  });
});

describe("isSoleFounder", () => {
  const me = "me-key";

  it("true only when locked AND the member resolves as a root", () => {
    expect(isSoleFounder(me, one, new Set([me]), 1)).toBe(true);
  });

  it("false for a non-root member in a locked community", () => {
    expect(isSoleFounder(me, one, new Set(["other"]), 1)).toBe(false);
  });

  it("false when the community is not locked, root or not", () => {
    expect(isSoleFounder(me, two, new Set([me]), 1)).toBe(false);
    expect(isSoleFounder(me, null, new Set([me]), 1)).toBe(false);
  });

  it("false with no resolved roots at all (missing set included)", () => {
    expect(isSoleFounder(me, one, new Set(), 1)).toBe(false);
    expect(isSoleFounder(me, one, undefined, 1)).toBe(false);
  });
});
