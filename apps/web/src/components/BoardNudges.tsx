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
import type { ReactNode } from "react";
import { useFirstActionNudge } from "@/components/useFirstActionNudge";
import { useProfileNudge } from "@/components/useProfileNudge";
import { useKeepAccessNudge } from "@/components/useKeepAccessNudge";
import { useVouchDiscoveryNudge } from "@/components/useVouchDiscoveryNudge";
import { useInstallCardNudge } from "@/components/useInstallCardNudge";

// One Board prompt at a time, by priority. The Board used to mount all
// five calm prompts at once; each could stack independently, so a
// brand-new member could land on a wall of cards. This orchestrator
// shows AT MOST ONE — the highest-priority prompt that is both resolved
// and eligible — and shows none until it knows.
//
// Each prompt keeps its OWN eligibility / dismiss / self-retire rules
// (extracted verbatim into the per-prompt status hooks); we only decide
// WHICH one renders, never whether a given one would. No counts, no
// "N more" indicator — that's notification theater.
//
// Flash-free rule: we walk the fixed priority list and stop at the
// first prompt that is still loading (`!ready`) — rendering nothing
// rather than skipping ahead to a lower-priority prompt. Skipping ahead
// would briefly show a lower prompt, then yank it once the higher one's
// async gating resolves to "visible". Waiting for each higher prompt to
// settle first means whatever we show is final for this load.
//
// This resolves the old NUDGE-STACKING NOTE on Board: the priority
// policy flagged there as a follow-up now lives here.
//
// `fallback` extends the one-prompt-at-a-time discipline to banners
// that live OUTSIDE the nudge priority list (Board's ContextualHint):
// it renders only when every nudge has resolved to hidden. While any
// higher-priority nudge is still loading we render nothing — showing
// the fallback and then yanking it for a nudge would be exactly the
// flash this orchestrator exists to prevent. The fallback keeps its
// own eligibility/dismiss logic; only turn-taking is decided here.
export function BoardNudges({ fallback }: { fallback?: ReactNode } = {}) {
  // Rules of Hooks: all five hooks are called unconditionally, in a
  // fixed order, every render. Priority is the array order (index 0 =
  // highest). Do NOT make any of these calls conditional.
  const statuses = [
    useFirstActionNudge(), // 1 highest
    useProfileNudge(), // 2
    useKeepAccessNudge(), // 3
    useVouchDiscoveryNudge(), // 4
    useInstallCardNudge(), // 5 lowest
  ];

  for (const s of statuses) {
    if (!s.ready) return null; // higher-priority still loading → wait (no flash)
    if (s.visible) return <>{s.node}</>; // highest ready+visible wins
    // ready && !visible → this prompt decided not to show → try the next
  }
  // Every prompt resolved and none wants the slot → the fallback
  // banner (if any) gets its turn.
  return fallback ? <>{fallback}</> : null;
}
