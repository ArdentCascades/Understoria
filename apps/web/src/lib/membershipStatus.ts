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
import { getSetting, setSetting } from "@/db/database";

/**
 * Membership-rejection signal — the fix for the silent "island
 * account" (2026-07 field reports): a device that is CONNECTED to a
 * community node but not recognized as a member gets 403 on every
 * signed read, and every pull swallowed that exactly like a network
 * blip. The member saw an empty app with a green "connected" chip and
 * no explanation, forever.
 *
 * `authorizedFetch` records a rejection when a SIGNED read comes back
 * 403 (an unsigned request is a different state — locked session or
 * fresh device) and clears it on any successful read. The Dashboard
 * surfaces the flag as a plain-language banner. `writeSubmitConfig`
 * clears it too: changing or disabling the node is a new context and
 * the old verdict no longer applies.
 */

const KEY = "membershipRejectedAt";

/** In-memory debounce so a 16-pull sync cycle writes once. */
let lastRecordedMs = 0;

export async function recordMembershipRejection(): Promise<void> {
  try {
    const now = Date.now();
    if (lastRecordedMs > now - 60_000) return;
    lastRecordedMs = now;
    await setSetting(KEY, new Date().toISOString());
  } catch {
    // Telemetry is best-effort.
  }
}

export async function clearMembershipRejection(): Promise<void> {
  try {
    lastRecordedMs = 0;
    const current = await getSetting(KEY);
    if (!current) return; // avoid a write per successful read
    await setSetting(KEY, "");
  } catch {
    // Best-effort.
  }
}

/** ISO timestamp of the last rejected signed read, or null when the
 *  node has never rejected this member (or has accepted one since). */
export async function readMembershipRejectedAt(): Promise<string | null> {
  const value = await getSetting(KEY);
  return value ? value : null;
}
