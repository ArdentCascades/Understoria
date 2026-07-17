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
import type { Member } from "@/types";

// Display-name collision detection for the identity-key chrome.
// Casual surfaces hide the short key behind a tap (IdentityKey.tsx);
// the one job the inline key does in a list — telling two members
// with the same name apart — comes back automatically when a
// collision actually exists. Case-insensitive + trimmed, matching
// how a human reads two names as "the same".

export function normalizeDisplayName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Returns the set of normalized display names carried by MORE than
 * one member. Membership checks must normalize with
 * `normalizeDisplayName` first.
 */
export function duplicatedNames(
  members: ReadonlyArray<Pick<Member, "displayName">>,
): Set<string> {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const m of members) {
    const name = normalizeDisplayName(m.displayName);
    if (!name) continue;
    if (seen.has(name)) dupes.add(name);
    else seen.add(name);
  }
  return dupes;
}
