/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { DEFAULT_NODE_CONFIG } from "@/types";
import type { NodeConfig } from "@/types";
import {
  effectiveMilestones,
  MILESTONES,
  milestoneProgress,
  milestonesForType,
  reachedMilestones,
} from "./milestones";

function configWith(customMilestones: NodeConfig["customMilestones"]): NodeConfig {
  return { ...DEFAULT_NODE_CONFIG, customMilestones };
}

describe("effectiveMilestones", () => {
  it("returns the baseline when no custom milestones are configured", () => {
    const result = effectiveMilestones(configWith([]));
    expect(result).toEqual(MILESTONES);
  });

  it("appends custom milestones that don't collide with the baseline", () => {
    const result = effectiveMilestones(
      configWith([
        { type: "hours", threshold: 200, label: "200 community-fridge restocks" },
        { type: "exchanges", threshold: 42, label: "42 — answer to everything" },
      ]),
    );
    expect(result).toHaveLength(MILESTONES.length + 2);
    expect(result.some((m) => m.label === "200 community-fridge restocks")).toBe(
      true,
    );
    expect(result.some((m) => m.label === "42 — answer to everything")).toBe(
      true,
    );
  });

  // The contract from the brief: a community can't shadow a shipped
  // milestone by adding a custom one at the same (type, threshold).
  // Baseline wins — silently, not as an error — so adding the same
  // threshold with a different label is just a no-op at render time.
  it("dedups custom entries that duplicate a baseline (baseline wins)", () => {
    const result = effectiveMilestones(
      configWith([
        { type: "hours", threshold: 100, label: "ALTERNATE LABEL — should lose" },
      ]),
    );
    const matches = result.filter(
      (m) => m.type === "hours" && m.threshold === 100,
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].label).toBe("100 hours of mutual aid");
  });

  it("does not mutate the baseline MILESTONES array", () => {
    const before = MILESTONES.length;
    effectiveMilestones(
      configWith([{ type: "hours", threshold: 9999, label: "x" }]),
    );
    expect(MILESTONES.length).toBe(before);
  });
});

describe("reachedMilestones with config", () => {
  it("falls back to baseline-only when no config is passed (back-compat)", () => {
    const reached = reachedMilestones("hours", 100);
    expect(reached.some((m) => m.threshold === 100)).toBe(true);
  });

  it("includes custom milestones when a config is passed", () => {
    const config = configWith([
      { type: "hours", threshold: 75, label: "75 hours together" },
    ]);
    const reached = reachedMilestones("hours", 80, config);
    expect(reached.some((m) => m.label === "75 hours together")).toBe(true);
  });

  it("does not include unreached custom milestones", () => {
    const config = configWith([
      { type: "hours", threshold: 5000, label: "5000 hours" },
    ]);
    const reached = reachedMilestones("hours", 100, config);
    expect(reached.some((m) => m.label === "5000 hours")).toBe(false);
  });
});

describe("milestoneProgress", () => {
  it("reports current=null before the first milestone is reached", () => {
    // A community at 5 hours has NOT reached the 10-hour milestone.
    // The old implementation initialized current to the first
    // milestone, presenting an unreached milestone as achieved.
    const p = milestoneProgress("hours", 5);
    expect(p.current).toBeNull();
    expect(p.next?.threshold).toBe(10);
    expect(p.progress).toBeCloseTo(0.5);
  });

  it("reports the highest reached milestone as current", () => {
    const p = milestoneProgress("hours", 60);
    expect(p.current?.threshold).toBe(50);
    expect(p.next?.threshold).toBe(100);
    expect(p.progress).toBeCloseTo((60 - 50) / (100 - 50));
  });

  it("progress is 1 past the final milestone", () => {
    const p = milestoneProgress("hours", 2000);
    expect(p.current?.threshold).toBe(1000);
    expect(p.next).toBeNull();
    expect(p.progress).toBe(1);
  });

  it("exact threshold counts as reached", () => {
    const p = milestoneProgress("hours", 10);
    expect(p.current?.threshold).toBe(10);
    expect(p.next?.threshold).toBe(50);
    expect(p.progress).toBe(0);
  });
});

describe("milestonesForType with config", () => {
  it("threads custom milestones into the per-type row, sorted by threshold", () => {
    const config = configWith([
      { type: "hours", threshold: 75, label: "75 hours together" },
      { type: "hours", threshold: 250, label: "Quarter-thousand" },
    ]);
    const row = milestonesForType("hours", 100, config);
    const thresholds = row.map((s) => s.milestone.threshold);
    for (let i = 1; i < thresholds.length; i++) {
      expect(thresholds[i]).toBeGreaterThan(thresholds[i - 1]);
    }
    expect(thresholds).toContain(75);
    expect(thresholds).toContain(250);
  });
});
