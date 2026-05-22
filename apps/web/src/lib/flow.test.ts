/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { computeFlowStats, computeZoneReachForHelper } from "./flow";
import type { Exchange, Member } from "@/types";

const nodeId = "node_flow_test";

function member(key: string, zone = ""): Member {
  return {
    publicKey: key,
    displayName: key.toUpperCase(),
    skills: [],
    availability: "",
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId,
    locationZone: zone,
  };
}

function exchange(
  id: string,
  helperKey: string,
  helpedKey: string,
  at = 0,
): Exchange {
  return {
    id,
    postId: `p_${id}`,
    helperKey,
    helpedKey,
    hoursExchanged: 1,
    helperSignature: "s",
    helpedSignature: "s",
    completedAt: at,
    category: "other",
    nodeId,
  };
}

describe("computeFlowStats", () => {
  it("returns empty state with no exchanges", () => {
    const stats = computeFlowStats([], []);
    expect(stats.breadth).toEqual([]);
    expect(stats.reciprocityRate).toBe(0);
    expect(stats.totalPairs).toBe(0);
    expect(stats.reciprocalPairs).toBe(0);
  });

  it("counts unique helped and helpers per member", () => {
    const exchanges = [
      exchange("1", "a", "b"),
      exchange("2", "a", "c"),
      exchange("3", "a", "b"), // duplicate pair — still 2 unique helped for a
      exchange("4", "d", "a"),
    ];
    const stats = computeFlowStats(exchanges, [
      member("a"),
      member("b"),
      member("c"),
      member("d"),
    ]);
    const a = stats.breadth.find((e) => e.memberKey === "a")!;
    expect(a.uniqueHelpedCount).toBe(2);
    expect(a.uniqueHelperCount).toBe(1);
    const b = stats.breadth.find((e) => e.memberKey === "b")!;
    expect(b.uniqueHelpedCount).toBe(0);
    expect(b.uniqueHelperCount).toBe(1);
  });

  it("sorts breadth by uniqueHelpedCount descending", () => {
    const exchanges = [
      exchange("1", "a", "b"),
      exchange("2", "c", "d"),
      exchange("3", "c", "e"),
      exchange("4", "c", "f"),
    ];
    const stats = computeFlowStats(exchanges, [
      member("a"),
      member("b"),
      member("c"),
      member("d"),
      member("e"),
      member("f"),
    ]);
    expect(stats.breadth[0].memberKey).toBe("c");
    expect(stats.breadth[0].uniqueHelpedCount).toBe(3);
  });

  it("computes zone reach from counterparty locationZone", () => {
    const exchanges = [
      exchange("1", "a", "b"),
      exchange("2", "a", "c"),
      exchange("3", "a", "d"),
      exchange("4", "a", "e"), // same zone as b — should not bump reach
    ];
    const stats = computeFlowStats(exchanges, [
      member("a", "north"),
      member("b", "north"),
      member("c", "south"),
      member("d", "east"),
      member("e", "north"),
    ]);
    const a = stats.breadth.find((e) => e.memberKey === "a")!;
    expect(a.zoneReach).toBe(3);
  });

  it("ignores blank locationZone in zone reach", () => {
    const exchanges = [
      exchange("1", "a", "b"),
      exchange("2", "a", "c"),
    ];
    const stats = computeFlowStats(exchanges, [
      member("a"),
      member("b", ""),
      member("c", ""),
    ]);
    const a = stats.breadth.find((e) => e.memberKey === "a")!;
    expect(a.zoneReach).toBe(0);
  });

  it("ignores self-exchanges entirely", () => {
    const exchanges = [exchange("1", "a", "a")];
    const stats = computeFlowStats(exchanges, [member("a")]);
    expect(stats.breadth).toEqual([]);
  });

  it("computes reciprocity rate", () => {
    const exchanges = [
      exchange("1", "a", "b"),
      exchange("2", "b", "a"),
      exchange("3", "c", "d"),
      // pairs: {a,b} bidirectional, {c,d} one-way → 1/2 = 0.5
    ];
    const stats = computeFlowStats(exchanges, [
      member("a"),
      member("b"),
      member("c"),
      member("d"),
    ]);
    expect(stats.totalPairs).toBe(2);
    expect(stats.reciprocalPairs).toBe(1);
    expect(stats.reciprocityRate).toBe(0.5);
  });

  it("reports full reciprocity when every connection flows both ways", () => {
    const exchanges = [
      exchange("1", "a", "b"),
      exchange("2", "b", "a"),
    ];
    const stats = computeFlowStats(exchanges, [member("a"), member("b")]);
    expect(stats.reciprocityRate).toBe(1);
  });
});

describe("computeZoneReachForHelper", () => {
  it("returns 0 when the member has helped no one in a known zone", () => {
    const exchanges = [exchange("1", "a", "b")];
    const reach = computeZoneReachForHelper(
      "a",
      exchanges,
      [member("a", "north"), member("b", "")],
    );
    expect(reach).toBe(0);
  });

  it("counts distinct counterparty zones for one helper", () => {
    const exchanges = [
      exchange("1", "a", "b"),
      exchange("2", "a", "c"),
      exchange("3", "a", "d"),
    ];
    const reach = computeZoneReachForHelper(
      "a",
      exchanges,
      [
        member("a", "home"),
        member("b", "north"),
        member("c", "south"),
        member("d", "north"),
      ],
    );
    expect(reach).toBe(2);
  });

  it("does not count exchanges where the member was the helped party", () => {
    const exchanges = [
      exchange("1", "b", "a"), // a is helped, not helper
      exchange("2", "c", "a"),
    ];
    const reach = computeZoneReachForHelper(
      "a",
      exchanges,
      [member("a"), member("b", "north"), member("c", "south")],
    );
    expect(reach).toBe(0);
  });
});
