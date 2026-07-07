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
import {
  canonicalMemberRemovalPayload,
  canonicalMemberReinstatementPayload,
  DEFAULT_REMOVAL_QUORUM,
  validRemovalSigners,
} from "@understoria/shared/crypto";
import type {
  MemberRemoval,
  MemberReinstatement,
} from "@understoria/shared/types";
import { getSetting } from "@/db/database";
import { LAST_SEEN_REMOVAL_QUORUM } from "@/lib/nodeEndpoints";

/*
 * Member removal, client side (docs/member-removal.md M1).
 *
 * The device's job is smaller than the node's, on purpose: only a
 * node can derive the founder-rooted membership closure (founder keys
 * are not public), so "each signer is a member" is enforced by every
 * node at ingestion — the origin when the record was submitted, and
 * each mirror again when replication re-POSTs it through the local
 * routes. The device re-verifies everything it CAN check —
 * signatures over the canonical payload, distinct signers, no
 * self-signing, quorum against the node's published rule — and
 * treats the node's closure check as authoritative, the same trust
 * posture as auto-confirm label verification.
 *
 * Standing is DERIVED, never stored on the member row: a key is
 * removed at time T iff the latest removal/reinstatement with
 * decidedAt ≤ T is a removal. At an exact timestamp tie a
 * reinstatement wins (the door reopening is the benign default) —
 * the same rule, byte for byte, as the server resolver.
 */

/** The community's quorum: captured from GET /config, else the
 *  shared default. */
export async function removalQuorum(): Promise<number> {
  const raw = await getSetting(LAST_SEEN_REMOVAL_QUORUM);
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_REMOVAL_QUORUM;
}

/** Structural verification of a pulled removal record. */
export function removalStructurallyValid(
  record: MemberRemoval,
  quorum: number,
): boolean {
  return (
    validRemovalSigners(
      canonicalMemberRemovalPayload(record),
      record.removedKey,
      record.signatures,
    ).size >= quorum
  );
}

export function reinstatementStructurallyValid(
  record: MemberReinstatement,
  quorum: number,
): boolean {
  return (
    validRemovalSigners(
      canonicalMemberReinstatementPayload(record),
      record.reinstatedKey,
      record.signatures,
    ).size >= quorum
  );
}

interface StandingEvent {
  decidedAt: number;
  removal: boolean;
}

/**
 * The set of currently-removed member keys, derived from the local
 * record tables. Pure function over the rows so AppContext (live
 * queries) and one-off callers share the exact rule.
 */
export function deriveRemovedKeys(
  removals: readonly Pick<MemberRemoval, "removedKey" | "decidedAt">[],
  reinstatements: readonly Pick<
    MemberReinstatement,
    "reinstatedKey" | "decidedAt"
  >[],
  now = Date.now(),
): Set<string> {
  const latest = new Map<string, StandingEvent>();
  const consider = (key: string, decidedAt: number, removal: boolean) => {
    if (decidedAt > now) return;
    const prev = latest.get(key);
    if (
      !prev ||
      decidedAt > prev.decidedAt ||
      (decidedAt === prev.decidedAt && prev.removal && !removal)
    ) {
      latest.set(key, { decidedAt, removal });
    }
  };
  for (const r of removals) consider(r.removedKey, r.decidedAt, true);
  for (const r of reinstatements)
    consider(r.reinstatedKey, r.decidedAt, false);
  const removed = new Set<string>();
  for (const [key, event] of latest) {
    if (event.removal) removed.add(key);
  }
  return removed;
}
