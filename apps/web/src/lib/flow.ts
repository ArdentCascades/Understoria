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
import type { Exchange, Member } from "@/types";

// Relational stats for the Dashboard. Kept separate from stats.ts
// because these answer a different question — not "how much was
// exchanged" but "how is help distributed across people and zones."
//
// The functions reward breadth, not volume. See docs/roadmap.md
// "Reputation-score creep" in the failure-modes section: any feature
// that ranks members by accumulation is one design discussion away
// from a leaderboard. Breadth is on the right side of that line; we
// count unique people helped, never hours.
//
// Complexity is O(exchanges) for the per-member counts and
// O(exchanges) for reciprocity. Fine for pilot scale. If a community
// outgrows it, cache on the server side per exchange completion.

export interface BreadthEntry {
  memberKey: string;
  /** Distinct people this member has helped. */
  uniqueHelpedCount: number;
  /** Distinct people who have helped this member. */
  uniqueHelperCount: number;
  /** Distinct location zones this member has reached, via the
   *  counterparties of the exchanges where they were the helper. */
  zoneReach: number;
}

export interface FlowStats {
  /** Per-member breadth, sorted by uniqueHelpedCount descending. */
  breadth: BreadthEntry[];
  /** Fraction of distinct (helper, helped) pairs that flow both ways.
   *  0 when there are no pairs at all. */
  reciprocityRate: number;
  /** Total number of distinct directed (helper → helped) pairs. */
  totalPairs: number;
  /** Number of pairs that are bidirectional (both A→B and B→A). */
  reciprocalPairs: number;
}

export function computeFlowStats(
  exchanges: readonly Exchange[],
  members: readonly Member[],
): FlowStats {
  const zonesByKey = new Map<string, string>();
  for (const m of members) zonesByKey.set(m.publicKey, m.locationZone);

  const helpedByHelper = new Map<string, Set<string>>();
  const helperByHelped = new Map<string, Set<string>>();
  const zoneReachByHelper = new Map<string, Set<string>>();
  const pairKeys = new Set<string>();

  for (const x of exchanges) {
    if (x.helperKey === x.helpedKey) continue;

    let helped = helpedByHelper.get(x.helperKey);
    if (!helped) {
      helped = new Set();
      helpedByHelper.set(x.helperKey, helped);
    }
    helped.add(x.helpedKey);

    let helpers = helperByHelped.get(x.helpedKey);
    if (!helpers) {
      helpers = new Set();
      helperByHelped.set(x.helpedKey, helpers);
    }
    helpers.add(x.helperKey);

    const zone = zonesByKey.get(x.helpedKey);
    if (zone) {
      let zones = zoneReachByHelper.get(x.helperKey);
      if (!zones) {
        zones = new Set();
        zoneReachByHelper.set(x.helperKey, zones);
      }
      zones.add(zone);
    }

    pairKeys.add(`${x.helperKey}>${x.helpedKey}`);
  }

  const memberKeys = new Set<string>([
    ...helpedByHelper.keys(),
    ...helperByHelped.keys(),
  ]);

  const breadth: BreadthEntry[] = [];
  for (const key of memberKeys) {
    breadth.push({
      memberKey: key,
      uniqueHelpedCount: helpedByHelper.get(key)?.size ?? 0,
      uniqueHelperCount: helperByHelped.get(key)?.size ?? 0,
      zoneReach: zoneReachByHelper.get(key)?.size ?? 0,
    });
  }
  breadth.sort((a, b) => b.uniqueHelpedCount - a.uniqueHelpedCount);

  let reciprocalPairs = 0;
  for (const pair of pairKeys) {
    const [a, b] = pair.split(">");
    if (pairKeys.has(`${b}>${a}`)) reciprocalPairs += 1;
  }
  // reciprocalPairs counts each bidirectional pair twice (once from
  // each direction), so divide before reporting.
  reciprocalPairs = Math.floor(reciprocalPairs / 2);

  // Distinct undirected pairs: a directed-pair set always counts
  // ordered pairs separately, so the undirected count is total / 2
  // for bidirectional + the asymmetric directed pairs as-is.
  const directedPairs = pairKeys.size;
  const undirectedPairs = directedPairs - reciprocalPairs;
  const reciprocityRate =
    undirectedPairs === 0 ? 0 : reciprocalPairs / undirectedPairs;

  return {
    breadth,
    reciprocityRate,
    totalPairs: undirectedPairs,
    reciprocalPairs,
  };
}

/** Standalone helper for the achievements pipeline, which evaluates
 *  one member at a time and doesn't need the full FlowStats shape. */
export function computeZoneReachForHelper(
  memberKey: string,
  exchanges: readonly Exchange[],
  members: readonly Member[],
): number {
  const zonesByKey = new Map<string, string>();
  for (const m of members) zonesByKey.set(m.publicKey, m.locationZone);
  const zones = new Set<string>();
  for (const x of exchanges) {
    if (x.helperKey !== memberKey) continue;
    if (x.helpedKey === memberKey) continue;
    const zone = zonesByKey.get(x.helpedKey);
    if (zone) zones.add(zone);
  }
  return zones.size;
}
