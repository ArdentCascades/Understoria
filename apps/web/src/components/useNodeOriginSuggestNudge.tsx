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
import { useEffect, useState } from "react";
import { useApp } from "@/state/AppContext";
import type { BoardNudgeStatus } from "@/lib/boardNudge";
import { NodeOriginSuggestCard } from "@/components/NodeOriginSuggestCard";
import {
  isNodeSuggestDismissed,
  suggestNodeUrlFromOrigin,
} from "@/lib/nodeOriginSuggest";

// The "first run" leg of the §5.3 origin-derived community-node
// suggestion (`docs/invite-redemption.md`): a member whose device
// loaded the PWA from a community-node origin but has no node
// configured sees the informed-consent card on the Board. The
// invite-accept success path carries its own instance of the same
// card; whichever the member answers first settles it for the device
// (confirm writes the config → the gate closes; decline writes the
// permanent dismissal flag).
//
// All the §5.3 gating — dev builds, localhost, already-configured
// devices, the /api/health probe — lives in
// lib/nodeOriginSuggest.ts `suggestNodeUrlFromOrigin`. Probe failure
// is silent: an unconfigured node is a normal state, not a problem
// to nag about.

export function useNodeOriginSuggestNudge(): BoardNudgeStatus {
  const { currentMember } = useApp();
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  // null = probe resolved to "no suggestion"; string = candidate URL;
  // undefined = still resolving.
  const [candidate, setCandidate] = useState<string | null | undefined>(
    undefined,
  );
  // Once the member answers (either way) the card retires for good on
  // this mount; persistence of the answer is handled inside the card.
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void isNodeSuggestDismissed().then((v) => {
      if (!cancelled) setDismissed(v);
    });
    void suggestNodeUrlFromOrigin()
      .then((url) => {
        if (!cancelled) setCandidate(url);
      })
      .catch(() => {
        if (!cancelled) setCandidate(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = dismissed !== null && candidate !== undefined;
  const visible =
    ready &&
    !answered &&
    dismissed === false &&
    typeof candidate === "string" &&
    currentMember !== null;

  return {
    ready,
    visible,
    node:
      typeof candidate === "string" ? (
        <NodeOriginSuggestCard
          candidateUrl={candidate}
          onDone={() => setAnswered(true)}
        />
      ) : null,
  };
}
