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
import { useEffect, useState } from "react";
import { useApp } from "@/state/AppContext";
import type { BoardNudgeStatus } from "@/lib/boardNudge";
import { getSetting, SETTING_KEYS } from "@/db/database";
import { listNodeEndpoints, nodeSuccessKey } from "@/lib/nodeEndpoints";
import { isRecentSuccess } from "@/lib/resilience";
import { vouchCountFor, MINIMUM_VOUCHES_FOR_TRUST } from "@/lib/vouch";
import { GrowRootSuggestCard } from "@/components/GrowRootSuggestCard";

// Board leg of the capacity response (docs/capacity-forecast.md §5.2).
// The strong "grow another root" push, gated so it never nags:
//   - the community's node reports RED pressure AND growthRecommended
//     (the coarse node-signed CapacityPosture — worst across the set);
//   - the current member is TRUSTED (the same bar the grow-root wizard
//     gates its destination on) — which is also what keeps the capacity
//     signal from being a reconnaissance tool for locating the host;
//   - no healthy mirror has failed over yet (`nodesReachable < 2`), so
//     we don't nag a community that already grew horizontally;
//   - the member hasn't declined the card before.
// Everything is pull-only; the card just opens the existing wizard.
export function useGrowRootSuggestNudge(): BoardNudgeStatus {
  const { currentMember, vouches, invites, capacityPostures } = useApp();
  // undefined = still resolving the async gates.
  const [gates, setGates] = useState<
    { dismissed: boolean; nodesReachable: number } | undefined
  >(undefined);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const dismissed =
          (await getSetting(SETTING_KEYS.growRootSuggestDismissed)) === "1";
        const { primary, endpoints } = await listNodeEndpoints();
        let reachable = 0;
        for (const url of endpoints) {
          const last = await getSetting(nodeSuccessKey(url, primary ?? url));
          if (isRecentSuccess(last)) reachable += 1;
        }
        if (!cancelled) setGates({ dismissed, nodesReachable: reachable });
      } catch {
        // Treat an unresolved probe as "don't suggest" — an unreachable
        // node is a normal state, not a moment to push a card.
        if (!cancelled) setGates({ dismissed: true, nodesReachable: 2 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const trusted =
    currentMember !== null &&
    vouchCountFor(currentMember.publicKey, { vouches, invites }) >=
      MINIMUM_VOUCHES_FOR_TRUST;
  // Worst pressure across the (verified, tiny) posture set; the strong
  // push is red + growthRecommended only.
  const redAndGrowing = capacityPostures.some(
    (p) => p.pressure === "red" && p.growthRecommended,
  );

  const ready = gates !== undefined;
  const visible =
    ready &&
    !answered &&
    currentMember !== null &&
    trusted &&
    redAndGrowing &&
    !gates.dismissed &&
    gates.nodesReachable < 2;

  return {
    ready,
    visible,
    node: <GrowRootSuggestCard onDone={() => setAnswered(true)} />,
  };
}
