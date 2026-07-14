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

// Node-canonical community identity (docs/invite-redemption.md §5.4).
//
// The community's ONE true id is the id its node publishes on
// `GET /config` (`NODE_ID` env, server-side). Historically every
// device minted its own random id at first launch, so a community's
// records ended up scattered across id namespaces: each pre-fix
// member's random id, the founder's random id propagated by invites,
// and the server's NODE_ID stamped on auto-confirmed exchanges. Every
// "is this record ours?" read (Dashboard stats, cross-node badges,
// claim federation) keyed on exact equality with the device id and
// silently misfiled everything else.
//
// Two-part remedy, both here:
//
// 1. ADOPT-FORWARD (`adoptCanonicalNodeId`): when the device learns
//    its consented primary's published id, it becomes the device id —
//    all NEW records are authored under the canonical id, and every
//    device converges (founder included).
// 2. ALIASES for the past (`communityNodeIdSet` / `isOurNode`): old
//    ids are inside signed payloads (posts, invites, events, state —
//    everything but exchanges and vouches signs its nodeId), so
//    history can never be rewritten. Instead, reads treat the whole
//    known set of the community's historical ids as "ours": the
//    current id, the ids this device previously used, and the ids
//    carried on the community's redeemed-invite rows (every member's
//    device materializes those, so the set covers OTHER members'
//    pre-fix ids too — invites never cross communities).
//
// Trust posture: the canonical id is only ever taken from the
// CONFIGURED, MEMBER-CONSENTED primary (`listNodeEndpoints` returns a
// primary only when the member confirmed the node URL and enabled
// sync). A node the member already trusts with every record they
// author gains nothing new by also naming the community — this adds
// no authority the consent didn't already grant.

import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";

/** Hard cap on stored aliases. A community accrues one alias per
 *  adoption (typically exactly one: random id → canonical id); the cap
 *  is a backstop against a misbehaving node publishing a new id every
 *  fetch, not a limit any healthy community approaches. Oldest are
 *  dropped first — they're also the least likely to appear on records
 *  anyone still reads. */
export const MAX_NODE_ID_ALIASES = 16;

/** Parse the stored alias list. Absent/corrupt → empty. */
export async function readNodeIdAliases(): Promise<string[]> {
  const raw = await getSetting(SETTING_KEYS.nodeIdAliases);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((a): a is string => typeof a === "string" && a !== "");
  } catch {
    return [];
  }
}

export interface AdoptResult {
  /** True iff the device id actually changed. */
  adopted: boolean;
  /** The id the device used before (present only when adopted). */
  previous?: string;
  /** The device id after the call — canonical on adoption, unchanged
   *  otherwise. Callers mirror this into live app state. */
  nodeId: string;
}

/**
 * Adopt the community node's published canonical id as this device's
 * `SETTING_KEYS.nodeId`, recording the previous id as an alias so
 * records authored under it keep reading as "ours".
 *
 * No-ops (adopted: false) when the id is empty or already current.
 * The settings writes are atomic (one transaction over `db.settings`):
 * the id flip and its alias must land together, or a crash would
 * orphan the old id's records out of the alias set.
 *
 * Callers MUST only pass an id learned from the consented primary's
 * `GET /config` (see the trust posture note above) — never from an
 * arbitrary probed URL.
 */
export async function adoptCanonicalNodeId(
  canonicalId: string,
): Promise<AdoptResult> {
  const id = canonicalId.trim();
  if (id === "") {
    const current = (await getSetting(SETTING_KEYS.nodeId)) ?? "";
    return { adopted: false, nodeId: current };
  }
  return db.transaction("rw", [db.settings], async () => {
    const current = (await getSetting(SETTING_KEYS.nodeId)) ?? "";
    if (current === id) {
      return { adopted: false, nodeId: id };
    }
    if (current !== "") {
      const aliases = await readNodeIdAliases();
      const next = [...aliases.filter((a) => a !== current && a !== id), current];
      await setSetting(
        SETTING_KEYS.nodeIdAliases,
        JSON.stringify(next.slice(-MAX_NODE_ID_ALIASES)),
      );
    }
    await setSetting(SETTING_KEYS.nodeId, id);
    return { adopted: true, previous: current || undefined, nodeId: id };
  });
}

/**
 * The set of ids that mean "this community" on a record. Pure — the
 * caller supplies the pieces (AppContext already holds all three
 * live). Includes:
 *  - the current device id,
 *  - this device's prior ids (aliases recorded at adoption),
 *  - the ids carried on the community's invite rows (each member's
 *    device materializes every redeemed invite, and invites never
 *    cross communities — so this covers OTHER members' pre-fix random
 *    ids, which this device never used itself).
 * Never includes "" — the legacy-empty allowance stays an explicit,
 * documented special case in `isOurNode`.
 */
export function communityNodeIdSet(
  currentNodeId: string,
  aliases: readonly string[],
  inviteNodeIds: Iterable<string>,
): ReadonlySet<string> {
  const ids = new Set<string>();
  if (currentNodeId !== "") ids.add(currentNodeId);
  for (const a of aliases) if (a !== "") ids.add(a);
  for (const i of inviteNodeIds) if (i !== "") ids.add(i);
  return ids;
}

/**
 * The one "is this record ours?" predicate. Replaces the inline
 * `record.nodeId === nodeId || record.nodeId === ""` comparisons that
 * were duplicated across the Dashboard, stats, Board/PostDetail
 * badges, claim federation, and the Welcome member count. `""` counts
 * as ours everywhere by long-standing convention: rows written before
 * nodeId existed carry it, and they are by construction local.
 */
export function isOurNode(
  recordNodeId: string,
  communityIds: ReadonlySet<string>,
): boolean {
  return recordNodeId === "" || communityIds.has(recordNodeId);
}
