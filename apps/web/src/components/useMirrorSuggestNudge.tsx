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
import { MirrorSuggestCard } from "@/components/MirrorSuggestCard";
import { pendingMirrorSuggestions } from "@/lib/nodeEndpoints";

// Board leg of mirror discovery (docs/community-resilience.md §B.2):
// each Board visit refreshes the announced-mirror list from the
// primary's `GET /config.mirrors`; a mirror the member has neither
// accepted nor declined gets the consent card. One mirror per card —
// a second announcement waits for the next visit rather than
// stacking. All the gating (no primary configured, node answered
// without the field, everything already answered) resolves to "no
// suggestion" inside `pendingMirrorSuggestions`, and a fetch failure
// is silent: an unreachable node is a normal state, not a problem to
// nag about.
export function useMirrorSuggestNudge(): BoardNudgeStatus {
  const { currentMember } = useApp();
  // undefined = still resolving; [] = nothing to ask.
  const [pending, setPending] = useState<string[] | undefined>(undefined);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void pendingMirrorSuggestions()
      .then((urls) => {
        if (!cancelled) setPending(urls);
      })
      .catch(() => {
        if (!cancelled) setPending([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = pending !== undefined;
  const candidate = pending?.[0];
  const visible =
    ready && !answered && candidate !== undefined && currentMember !== null;

  return {
    ready,
    visible,
    node:
      candidate !== undefined ? (
        <MirrorSuggestCard
          mirrorUrl={candidate}
          onDone={() => setAnswered(true)}
        />
      ) : null,
  };
}
