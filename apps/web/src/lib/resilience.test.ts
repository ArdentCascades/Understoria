/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  computeResilience,
  isRecentSuccess,
  NODE_REACHABLE_WINDOW_MS,
} from "./resilience";

describe("computeResilience", () => {
  it("is seedling with no node configured", () => {
    const s = computeResilience({
      nodesConfigured: 0,
      nodesReachable: 0,
      memberCount: 3,
    });
    expect(s.tier).toBe("seedling");
    expect(s.nodeQuiet).toBe(false);
  });

  it("is taking_root with one node — the honest Phase A ceiling", () => {
    const s = computeResilience({
      nodesConfigured: 1,
      nodesReachable: 1,
      memberCount: 12,
    });
    expect(s.tier).toBe("taking_root");
    expect(s.nodeQuiet).toBe(false);
  });

  it("marks a configured-but-silent node quiet, without dropping the tier to seedling", () => {
    const s = computeResilience({
      nodesConfigured: 1,
      nodesReachable: 0,
      memberCount: 12,
    });
    expect(s.tier).toBe("taking_root");
    expect(s.nodeQuiet).toBe(true);
  });

  it("future-proofs the Phase B tiers (2 → sturdy, 3+ → deep_rooted)", () => {
    expect(
      computeResilience({ nodesConfigured: 2, nodesReachable: 2, memberCount: 1 })
        .tier,
    ).toBe("sturdy");
    expect(
      computeResilience({ nodesConfigured: 4, nodesReachable: 3, memberCount: 1 })
        .tier,
    ).toBe("deep_rooted");
  });

  it("never counts more reachable than configured", () => {
    const s = computeResilience({
      nodesConfigured: 1,
      nodesReachable: 5,
      memberCount: 1,
    });
    expect(s.nodesReachable).toBe(1);
    expect(s.tier).toBe("taking_root");
  });
});

describe("isRecentSuccess", () => {
  const now = 1_700_000_000_000;
  it("accepts a success inside the window and rejects older/absent/garbage", () => {
    expect(
      isRecentSuccess(new Date(now - 60_000).toISOString(), now),
    ).toBe(true);
    expect(
      isRecentSuccess(
        new Date(now - NODE_REACHABLE_WINDOW_MS - 1).toISOString(),
        now,
      ),
    ).toBe(false);
    expect(isRecentSuccess(undefined, now)).toBe(false);
    expect(isRecentSuccess("", now)).toBe(false);
    expect(isRecentSuccess("not-a-date", now)).toBe(false);
  });
});

describe("nodeFreshness", () => {
  const now = 1_700_000_000_000;
  const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
  it("maps ages onto fresh / lagging / quiet", async () => {
    const { nodeFreshness, NODE_LAGGING_WINDOW_MS } = await import(
      "./resilience"
    );
    expect(nodeFreshness(iso(60_000), now)).toBe("fresh");
    expect(nodeFreshness(iso(NODE_REACHABLE_WINDOW_MS + 1), now)).toBe(
      "lagging",
    );
    expect(nodeFreshness(iso(NODE_LAGGING_WINDOW_MS + 1), now)).toBe("quiet");
    expect(nodeFreshness(undefined, now)).toBe("quiet");
    expect(nodeFreshness("garbage", now)).toBe("quiet");
  });
});
