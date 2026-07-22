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

// Founder-rooted trust: the fix for trust self-amplification inside
// a sybil cluster. Under flat counting ("any 2 distinct vouchers"),
// two accounts invited by one careless member could vouch each OTHER
// into the trusted tier — each holding the inviter's implicit vouch
// plus the sibling's — and the tier that gates real powers (issuing
// invites, growing roots) could be manufactured entirely within the
// cluster. Rooting the computation at the founders closes that:
//
//   trusted(m) = m is a founder root
//                OR m has >= MINIMUM_TRUSTED_VOUCHERS distinct
//                   vouchers who are THEMSELVES trusted
//
// computed as a least fixpoint from the founder set — exactly the
// shape of the server's membership closure (founder-rooted redemption
// chains), applied to the vouch graph. A cluster with no path from a
// founder can never bootstrap itself in.
//
// This module is pure and shared so the PWA (lib/vouch.ts) and the
// node (trust gates on /vouches and /redemptions) compute the SAME
// answer from the same edges. Signature validity is the CALLER's
// job — pass only verified vouch edges and genuinely-redeemed invite
// edges.

/** One "X vouches for Y" edge, deduplicated by the caller or not —
 *  duplicates are harmless (distinct-voucher sets dedupe here). */
export interface TrustEdge {
  voucherKey: string;
  voucheeKey: string;
}

export const MINIMUM_TRUSTED_VOUCHERS = 2;

/**
 * The set of trusted member keys, as the least fixpoint of the
 * founder-rooted rule above. Terminates: the trusted set only grows
 * and is bounded by the vouchee population; each pass either promotes
 * at least one member or stops.
 *
 * Members with no edges and no founder role are simply absent —
 * callers treat absence as "pending trust".
 */
export function computeTrustedSet(
  founderRoots: ReadonlySet<string>,
  edges: readonly TrustEdge[],
): Set<string> {
  const trusted = new Set<string>(founderRoots);
  // vouchee -> distinct voucher keys
  const vouchersByVouchee = new Map<string, Set<string>>();
  for (const e of edges) {
    if (e.voucherKey === e.voucheeKey) continue; // self-vouch never counts
    let set = vouchersByVouchee.get(e.voucheeKey);
    if (!set) {
      set = new Set();
      vouchersByVouchee.set(e.voucheeKey, set);
    }
    set.add(e.voucherKey);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const [vouchee, vouchers] of vouchersByVouchee) {
      if (trusted.has(vouchee)) continue;
      let trustedVouchers = 0;
      for (const v of vouchers) {
        if (trusted.has(v)) trustedVouchers++;
        if (trustedVouchers >= MINIMUM_TRUSTED_VOUCHERS) break;
      }
      if (trustedVouchers >= MINIMUM_TRUSTED_VOUCHERS) {
        trusted.add(vouchee);
        changed = true;
      }
    }
  }
  return trusted;
}
