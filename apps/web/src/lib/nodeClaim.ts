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

// First-run founder claim, client half — see the server's
// routes/claimFounder.ts and docs/member-authenticated-reads.md
// ("Claiming a fresh node"). A fresh node under the default
// READ_AUTH=on refuses everything until its founding member presents
// the one-time setup code from the server's boot log; this module is
// how the PWA turns that code into the node's first trust root.

import { canonicalFounderClaimMessage } from "@understoria/shared/crypto";
import { sign } from "@/lib/crypto";
import { getSecretKey } from "@/db/secrets";
import { normalizeNodeUrl } from "@/lib/nodeEndpoints";

export type ClaimResult =
  | { ok: true }
  | {
      ok: false;
      /** Maps to an i18n key under profile.node.claim.errors. */
      reason:
        | "already_claimed"
        | "bad_setup_token"
        | "stale_claim"
        | "bad_signature"
        | "unreachable"
        | "rejected";
    };

/** Whether the node at `url` reports itself unclaimed (fresh, waiting
 *  for its founder). Errors resolve to null — "unknown" must render
 *  differently from "claimed" (the card shouldn't vanish just because
 *  the probe raced a network blip). */
export async function fetchClaimStatus(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean | null> {
  try {
    const res = await fetchImpl(`${normalizeNodeUrl(url)}/config`, {
      headers: { accept: "application/json" },
      // A status probe must never be answered from cache: the founder
      // claims and the very next probe decides whether the setup
      // screen clears — a heuristically-cached "unclaimed" answer
      // left the founder staring at a stale gate (2026-07 relaunch
      // report: claim succeeded, screen stayed until a hard refresh).
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { claimed?: unknown };
    return typeof body.claimed === "boolean" ? !body.claimed : null;
  } catch {
    return null;
  }
}

/**
 * Sign and submit the founder claim. The signature binds the claim to
 * OUR key (an observer of the request body cannot re-target it), and
 * the timestamp keeps a captured body from staying valid.
 */
export async function claimFounder(args: {
  url: string;
  setupToken: string;
  publicKey: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
}): Promise<ClaimResult> {
  const fetchImpl = args.fetchImpl ?? fetch;
  const ts = (args.now ?? Date.now)();
  const setupToken = args.setupToken.trim();
  const secretKey = await getSecretKey(args.publicKey);
  const signature = sign(
    canonicalFounderClaimMessage(args.publicKey, setupToken, ts),
    secretKey,
  );
  try {
    const res = await fetchImpl(
      `${normalizeNodeUrl(args.url)}/claim-founder`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          publicKey: args.publicKey,
          setupToken,
          ts,
          signature,
        }),
      },
    );
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    const reason = body?.error;
    if (
      reason === "already_claimed" ||
      reason === "bad_setup_token" ||
      reason === "stale_claim" ||
      reason === "bad_signature"
    ) {
      return { ok: false, reason };
    }
    return { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}
