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

/**
 * Render-layer clamp for newest-first lists (the Profile exchange
 * history). `transactionHistory` deliberately stays unbounded — the
 * full signed ledger is the member's auditable record — so the clamp
 * lives at the render layer only, same posture as the announcements
 * list on ProjectDetail (`MAX_VISIBLE_ANNOUNCEMENTS`).
 */
export const HISTORY_CLAMP_VISIBLE = 10;

/**
 * Clamp a newest-first list to its newest `max` entries.
 *
 * `hiddenCount` is reported regardless of `showAll` — the caller's
 * toggle button needs it both collapsed ("Show N older…") and
 * expanded ("Show fewer…"), mirroring the ProjectDetail
 * announcements pattern.
 */
export function clampNewestFirst<T>(
  entries: readonly T[],
  showAll: boolean,
  max: number = HISTORY_CLAMP_VISIBLE,
): { visible: readonly T[]; hiddenCount: number } {
  const hiddenCount = Math.max(0, entries.length - max);
  return {
    // Newest-first input ⇒ slicing from the head keeps the newest
    // `max` entries visible.
    visible: showAll || hiddenCount === 0 ? entries : entries.slice(0, max),
    hiddenCount,
  };
}
