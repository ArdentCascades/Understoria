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
import { getSetting, SETTING_KEYS } from "@/db/database";
import { getSecretKey } from "@/db/secrets";
import { canonicalReadAuthMessage, sign } from "@/lib/crypto";
import {
  clearMembershipRejection,
  recordMembershipRejection,
} from "@/lib/membershipStatus";
import { recordNodeSuccess } from "@/lib/nodeEndpoints";

/**
 * Member-authenticated reads, client half
 * (docs/member-authenticated-reads.md §1). Every federation pull goes
 * through here so the request carries the member's read signature
 * UNCONDITIONALLY when this device can produce one — harmless while
 * the node runs `READ_AUTH=off`, and already in place the day the
 * operator flips it on (the staged-rollout contract).
 *
 * The signed message covers the NODE-RELATIVE path+query — everything
 * after the configured base URL — because the canonical deploy shape
 * mounts the node under `/api` and the reverse proxy STRIPS that
 * prefix (`handle_path` in deploy/Caddyfile), so the server's view of
 * the path has no `/api`. Signing our absolute path would never
 * verify.
 *
 * Soft-degrade, same posture as every publish helper: no identity yet
 * (fresh device) or a passphrase-locked session → the request goes
 * out unsigned. Under enforcement the node answers 401, the pull's
 * existing `!res.ok → null` path skips silently, and the periodic
 * re-pull catches up after unlock.
 */
export async function authorizedFetch(
  url: string,
  baseUrl: string,
): Promise<Response> {
  const headers = await readAuthHeaders(url, baseUrl);
  const res = headers ? await fetch(url, { headers }) : await fetch(url);
  // Per-node reachability telemetry for failover + the resilience card
  // ("reachable" = a successful read in the last 24h, community-
  // resilience.md §B.2). Debounced and best-effort inside
  // recordNodeSuccess; never blocks or fails the pull.
  if (res.ok) {
    void recordNodeSuccess(baseUrl);
    void clearMembershipRejection();
  } else if (res.status === 403 && headers) {
    // The node REFUSED this member's SIGNED read — "not a member".
    // Every pull swallows !res.ok identically, so without this signal
    // a connected-but-unrecognized device is an unexplained empty app
    // forever (the 2026-07 "island account" reports). The Dashboard
    // turns the flag into a plain-language banner. Unsigned requests
    // don't count: those are the locked-session / fresh-device states.
    void recordMembershipRejection();
  }
  return res;
}

async function readAuthHeaders(
  url: string,
  baseUrl: string,
): Promise<Record<string, string> | null> {
  try {
    const key = await getSetting(SETTING_KEYS.currentMember);
    if (!key) return null;
    const secret = await getSecretKey(key); // throws while locked
    const trimmedBase = baseUrl.replace(/\/+$/, "");
    const pathWithQuery = url.startsWith(trimmedBase)
      ? url.slice(trimmedBase.length)
      : url;
    const ts = Date.now();
    return {
      "x-understoria-key": key,
      "x-understoria-ts": String(ts),
      "x-understoria-sig": sign(
        canonicalReadAuthMessage(pathWithQuery, ts),
        secret,
      ),
    };
  } catch {
    return null;
  }
}
