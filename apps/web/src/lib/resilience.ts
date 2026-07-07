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

/**
 * Community resilience — docs/community-resilience.md.
 *
 * Pure tier computation for the Dashboard card that makes the
 * structural difference from corporate centralization VISIBLE: seize
 * a corporate server and the community is gone; here, every member's
 * device carries the complete signed dataset, and each additional
 * node removes "pressure one host" as an attack entirely.
 *
 * The one hard rule (design doc §0): never say more than the code
 * delivers. With Phase B shipped (mirror replication + automatic
 * failover, `lib/nodeEndpoints.ts`), `sturdy` and `deep_rooted` are
 * now earnable for real: they count nodes with a successful signed
 * exchange in the reachability window, and the failover they imply
 * actually happens. Wording tiers, not a numeric score:
 * `no-leaderboards` applies to infrastructure too, and a small
 * community with one lovingly-run node is healthy, not failing.
 */

export type ResilienceTier =
  | "seedling" // no node connected — this device is the community
  | "taking_root" // one node — the honest pilot state, CTA visible
  | "sturdy" // two reachable nodes (Phase B)
  | "deep_rooted"; // three or more reachable nodes (Phase B)

export interface ResilienceInput {
  /** Nodes this device is configured to sync through. Phase A: 0 or 1
   *  (the single communityNodeUrl); Phase B: the mirror list. */
  nodesConfigured: number;
  /** Of those, how many answered a sync recently (Phase A: derived
   *  from communityNodeLastSuccess; Phase B: per-node telemetry). */
  nodesReachable: number;
  /** Members known locally — each one's device carries a complete
   *  copy of the community. MEMBER count, deliberately not devices:
   *  no device census exists and none should (design doc, Phase A). */
  memberCount: number;
}

export interface ResilienceSnapshot {
  tier: ResilienceTier;
  nodesConfigured: number;
  nodesReachable: number;
  memberCount: number;
  /** True when the single configured node hasn't answered recently —
   *  the card shows the calm "hasn't answered lately" hint instead of
   *  pretending the trunk is healthy. */
  nodeQuiet: boolean;
}

export function computeResilience(input: ResilienceInput): ResilienceSnapshot {
  const nodesConfigured = Math.max(0, Math.floor(input.nodesConfigured));
  const nodesReachable = Math.min(
    nodesConfigured,
    Math.max(0, Math.floor(input.nodesReachable)),
  );

  let tier: ResilienceTier;
  if (nodesConfigured === 0) tier = "seedling";
  else if (nodesReachable >= 3) tier = "deep_rooted";
  else if (nodesReachable >= 2) tier = "sturdy";
  else tier = "taking_root";

  return {
    tier,
    nodesConfigured,
    nodesReachable,
    memberCount: Math.max(0, input.memberCount),
    nodeQuiet: nodesConfigured > 0 && nodesReachable === 0,
  };
}

/**
 * "Recently reachable" for Phase A: the app's existing submit/pull
 * telemetry (`communityNodeLastSuccess`, an ISO string) within this
 * window. Generous on purpose — a phone that was offline all day
 * shouldn't paint the community's server grey.
 */
export const NODE_REACHABLE_WINDOW_MS = 24 * 60 * 60 * 1000;

export function isRecentSuccess(
  lastSuccessIso: string | undefined | null,
  now: number = Date.now(),
): boolean {
  if (!lastSuccessIso) return false;
  const ts = Date.parse(lastSuccessIso);
  return Number.isFinite(ts) && now - ts <= NODE_REACHABLE_WINDOW_MS;
}

/**
 * Per-node freshness for the Phase B trunk row's quiet leaf:
 * `fresh` = synced within the reachable window (green),
 * `lagging` = seen within a week but not today (amber),
 * `quiet` = longer than that, or never (grey).
 * Same calm register as `nodeQuiet` — information, not alarm.
 */
export type NodeFreshness = "fresh" | "lagging" | "quiet";

export const NODE_LAGGING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function nodeFreshness(
  lastSuccessIso: string | undefined | null,
  now: number = Date.now(),
): NodeFreshness {
  if (!lastSuccessIso) return "quiet";
  const ts = Date.parse(lastSuccessIso);
  if (!Number.isFinite(ts)) return "quiet";
  const age = now - ts;
  if (age <= NODE_REACHABLE_WINDOW_MS) return "fresh";
  if (age <= NODE_LAGGING_WINDOW_MS) return "lagging";
  return "quiet";
}
