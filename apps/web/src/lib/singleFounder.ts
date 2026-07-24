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

// Single-founder detector (docs/cofounder-ceremony-plan.md P4).
// Under founder-rooted trust, promotion to "trusted" needs two
// distinct TRUSTED vouchers — so a one-root community can never
// promote anyone past the founder. The honest gate cards key off this
// detector instead of showing progress meters that can never
// complete.

/**
 * Is this community structurally unable to promote anyone to trusted?
 *
 * BOTH conditions, deliberately:
 *   - `capture.hashes.length === 1` — the node-published root COUNT,
 *     the only authoritative signal. Locally-resolved founderRoots
 *     only proves ≥1 (a root whose member row hasn't synced here
 *     resolves to nothing); the hash list counts every root.
 *   - `trustedCircle < 2` — with one root the rooted fixpoint can
 *     never exceed 1, so this is belt-and-braces against weird local
 *     state, and it keeps the detector honest the instant a second
 *     trusted member IS observed. A null circle (capture present but
 *     no locally-resolvable roots — `trustedCircleSize`'s no-anchor
 *     case) counts as short: one published root is still one root.
 *
 * No capture → false everywhere: a founderless node shows no
 * warnings and offers no ceremony (the plan's founderless rule).
 * Two roots with a shrunken circle → false: that is the reopening
 * attack shape, and root COUNT — never circle size — decides it.
 */
export function singleFounderLocked(
  capture: { hashes: readonly string[] } | null,
  trustedCircle: number | null,
): boolean {
  if (!capture || capture.hashes.length !== 1) return false;
  return trustedCircle === null || trustedCircle < 2;
}

/**
 * Is `memberKey` the community's one and only trust root? Drives the
 * SoleFounderCard (the warning + the Add-a-co-founder doorway) —
 * shown only to the person who can actually run the ceremony.
 */
export function isSoleFounder(
  memberKey: string,
  capture: { hashes: readonly string[] } | null,
  founderRoots: ReadonlySet<string> | undefined,
  trustedCircle: number | null,
): boolean {
  return (
    singleFounderLocked(capture, trustedCircle) &&
    (founderRoots?.has(memberKey) ?? false)
  );
}
