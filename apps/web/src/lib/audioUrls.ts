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
 * Registry of every live audio object URL (accessible panic, #476).
 *
 * A voice note's plaintext exists in memory as a Blob behind an
 * object URL for as long as its player is mounted. Component unmount
 * revokes it — but a panic purge must not depend on React lifecycle
 * timing: the acceptance contract is "after purge, no lingering
 * object URLs", full stop. So audio URLs are minted only through
 * this registry, and both purges call `revokeAllAudioUrls()` —
 * whatever is still registered dies with the data.
 */

const live = new Set<string>();

/** Mint an object URL for an audio blob and register it for
 *  purge-time revocation. Returns null where the API is missing or
 *  throws (some test DOMs), matching the player's failed state. */
export function createAudioUrl(blob: Blob): string | null {
  try {
    const url = URL.createObjectURL(blob);
    live.add(url);
    return url;
  } catch {
    return null;
  }
}

/** Revoke one URL and forget it — the player-unmount path. */
export function releaseAudioUrl(url: string | null): void {
  if (url === null) return;
  live.delete(url);
  try {
    URL.revokeObjectURL(url);
  } catch {
    // Already dead (purge got there first) or no API — either way
    // there is nothing left to revoke.
  }
}

/** Revoke every registered audio URL — the purge path. Returns how
 *  many were revoked so the purge can report it happened. */
export function revokeAllAudioUrls(): number {
  const count = live.size;
  for (const url of live) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Keep going: one dead URL must not shield the rest.
    }
  }
  live.clear();
  return count;
}
