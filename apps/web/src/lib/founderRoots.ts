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
import { founderKeyHash } from "@understoria/shared/crypto";
import { getSetting } from "@/db/database";

/**
 * Founding trust roots on member devices — the client half of the
 * vouch bootstrap (docs/member-authenticated-reads.md, "Founders are
 * trust roots on member devices too").
 *
 * The node publishes `founderKeyHashes` on its open `GET /config`:
 * one salted one-way commitment `founderKeyHash(nodeId, key)` per
 * founder (env NODE_FOUNDER_KEYS ∪ in-band claimed founders). The
 * regular /config fetch (`pendingMirrorSuggestions` in
 * lib/nodeEndpoints.ts) captures the list into the settings row
 * below; this module resolves it against the member keys the device
 * already holds. A member whose key hashes to a published value is a
 * FOUNDER ROOT and computes as trusted with zero vouchers
 * (lib/vouch.ts `trustStatusWithInvites`) — which is what lets a
 * fresh community's first vouches ever happen.
 *
 * Trust posture: the capture inherits exactly the trust already
 * placed in the consented community node — the same node whose
 * mirrors, removal quorum, and system key are captured on this very
 * fetch. A malicious node could name any member a founder root, but
 * that node already controls the redemption feed and every pull this
 * device makes; no new power is created here.
 */

/** Last-seen `/config.founderKeyHashes`, JSON `{nodeId, hashes,
 *  capturedAt}` — nodeId rides along because it is the hash salt. */
export const LAST_SEEN_FOUNDER_HASHES = "communityFounderKeyHashes";

export interface FounderHashCapture {
  /** The publishing node's id — the salt the hashes were minted with. */
  nodeId: string;
  /** The published salted hashes, as-is. */
  hashes: string[];
}

/** Parse a persisted capture. Null for anything malformed — a device
 *  that never captured (old server, sync off) simply has no roots. */
export function parseFounderHashCapture(
  raw: unknown,
): FounderHashCapture | null {
  if (typeof raw !== "string" || raw === "") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    parsed === null ||
    typeof parsed !== "object" ||
    typeof (parsed as { nodeId?: unknown }).nodeId !== "string" ||
    (parsed as { nodeId: string }).nodeId === "" ||
    !Array.isArray((parsed as { hashes?: unknown }).hashes)
  ) {
    return null;
  }
  const hashes = (parsed as { hashes: unknown[] }).hashes.filter(
    (h): h is string => typeof h === "string" && h.length > 0,
  );
  return { nodeId: (parsed as { nodeId: string }).nodeId, hashes };
}

/** Read the persisted capture from settings. */
export async function readFounderHashCapture(): Promise<FounderHashCapture | null> {
  try {
    return parseFounderHashCapture(await getSetting(LAST_SEEN_FOUNDER_HASHES));
  } catch {
    return null;
  }
}

/**
 * Which of `memberKeys` are founding trust roots per `capture`?
 * Hashing runs member-side: each candidate key is salted with the
 * capture's nodeId and checked against the published set. SHA-512
 * over ~100 bytes per member — cheap enough to recompute whenever
 * the member list or the capture changes.
 */
export function resolveFounderRoots(
  capture: FounderHashCapture | null,
  memberKeys: readonly string[],
): Set<string> {
  const roots = new Set<string>();
  if (!capture || capture.hashes.length === 0) return roots;
  const published = new Set(capture.hashes);
  for (const key of memberKeys) {
    if (published.has(founderKeyHash(capture.nodeId, key))) {
      roots.add(key);
    }
  }
  return roots;
}
