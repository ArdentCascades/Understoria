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

// Co-founder ceremony, client half (docs/cofounder-ceremony-plan.md
// P3) — the in-band path from one founder root to two. The founder
// signs a NOMINATION (bounded by a signed expiry); the nominee must
// ACCEPT with their own signature on their own device; the node
// verifies both layers and republishes two founder hashes on
// GET /config. Founding is permanent — every surface built on this
// module says so before a signature happens.
//
// Server counterpart: apps/server/src/routes/cofounder.ts. Error
// tables here mirror that module's refusal codes exactly (the
// lib/nodeClaim.ts ClaimResult pattern: every wire code the route can
// return maps to an i18n key under cofounder.errors).

import {
  canonicalFounderAccessionPayload,
  canonicalFounderNominationPayload,
  FOUNDER_NOMINATION_TTL_MS,
  parseFounderNomination,
  verifyFounderNomination,
} from "@understoria/shared/crypto";
import type {
  FounderAccession,
  FounderAccessionPayload,
  FounderNomination,
  FounderNominationPayload,
} from "@understoria/shared/types";
import { db, getSetting, setSetting } from "@/db/database";
import { getSecretKey } from "@/db/secrets";
import { authorizedFetch } from "@/lib/authorizedRead";
import { b64decode } from "@/lib/bytes";
import { sign } from "@/lib/crypto";
import { normalizeNodeUrl } from "@/lib/nodeEndpoints";

// --- pending-state persistence (settings keys) ------------------------

/** Founder side: the signed nomination this device sent and is
 *  waiting on — drives the pending/re-send/withdraw card. Cleared by
 *  Withdraw, by Done (capture reached two hashes), or by a re-send
 *  overwriting it. */
export const COFOUNDER_PENDING_NOMINATION = "cofounderPendingNomination";

/** Nominee side: the nomination addressed to this member, as last
 *  pulled from GET /founder-nomination/pending. Cleared by "Not now",
 *  by a pull that finds the shelf empty (accepted or withdrawn-by-
 *  expiry server-side), or overwritten by a founder re-send. */
export const COFOUNDER_INCOMING_NOMINATION = "cofounderIncomingNomination";

/** Parse a settings-persisted nomination. Null for anything that
 *  doesn't parse as the exact wire shape — a malformed row is
 *  indistinguishable from no row. */
export function parseStoredNomination(
  raw: string | null | undefined,
): FounderNomination | null {
  if (!raw) return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = parseFounderNomination(json);
  return parsed.ok ? parsed.value : null;
}

export async function readPendingNomination(): Promise<FounderNomination | null> {
  return parseStoredNomination(await getSetting(COFOUNDER_PENDING_NOMINATION));
}

export async function clearPendingNomination(): Promise<void> {
  await setSetting(COFOUNDER_PENDING_NOMINATION, "");
}

export async function readIncomingNomination(): Promise<FounderNomination | null> {
  return parseStoredNomination(await getSetting(COFOUNDER_INCOMING_NOMINATION));
}

export async function writeIncomingNomination(
  n: FounderNomination,
): Promise<void> {
  await setSetting(COFOUNDER_INCOMING_NOMINATION, JSON.stringify(n));
}

export async function clearIncomingNomination(): Promise<void> {
  await setSetting(COFOUNDER_INCOMING_NOMINATION, "");
}

/** Past its signed expiry on this device's clock. */
export function nominationExpired(
  n: FounderNomination,
  now: number = Date.now(),
): boolean {
  return now > n.expiresAt;
}

// --- capture validation -----------------------------------------------

/**
 * Shape check for a pasted/scanned co-founder public key: base64 that
 * decodes to exactly the Ed25519 public-key length. A shape check,
 * not a crypto check — resolution against the member roster (and the
 * node's own verification) decides everything that matters; this only
 * keeps garbage from advancing to the confirm step.
 */
export function plausibleCofounderKey(raw: string): boolean {
  const value = raw.trim();
  if (!/^[A-Za-z0-9+/]{43}=$/.test(value)) return false;
  try {
    return b64decode(value).length === 32;
  } catch {
    return false;
  }
}

// --- founder side: nominate ------------------------------------------

/**
 * Mint and sign a nomination with the client-default 72 h TTL.
 * Throws if the signing key is unavailable (locked session) — callers
 * surface that as the bad_signature copy, the nodeClaim precedent.
 */
export async function createNomination(args: {
  nominatorKey: string;
  nomineeKey: string;
  nodeId: string;
  now?: () => number;
}): Promise<FounderNomination> {
  const nominatedAt = (args.now ?? Date.now)();
  const payload: FounderNominationPayload = {
    nominatorKey: args.nominatorKey,
    nomineeKey: args.nomineeKey,
    nodeId: args.nodeId,
    nominatedAt,
    expiresAt: nominatedAt + FOUNDER_NOMINATION_TTL_MS,
  };
  const secret = await getSecretKey(args.nominatorKey);
  return {
    ...payload,
    signature: sign(canonicalFounderNominationPayload(payload), secret),
  };
}

/** Every refusal POST /founder-nomination can answer, plus the two
 *  client-side outcomes (`unreachable`, `rejected` = an unrecognized
 *  code). Each maps to `cofounder.errors.<reason>`. */
export type NominationErrorReason =
  | "invalid_body"
  | "invalid_expiry"
  | "wrong_node"
  | "stale_nomination"
  | "node_unclaimed"
  | "root_count_not_one"
  | "nominator_not_founder"
  | "nominee_not_a_member"
  | "nominee_already_founder"
  | "bad_signature"
  | "unreachable"
  | "rejected";

const NOMINATION_ERROR_REASONS = new Set<NominationErrorReason>([
  "invalid_body",
  "invalid_expiry",
  "wrong_node",
  "stale_nomination",
  "node_unclaimed",
  "root_count_not_one",
  "nominator_not_founder",
  "nominee_not_a_member",
  "nominee_already_founder",
  "bad_signature",
]);

export type NominationSubmitResult =
  | { ok: true }
  | { ok: false; reason: NominationErrorReason };

/**
 * Submit a signed nomination. On 201 the nomination is persisted as
 * this device's pending state (the card's source of truth); a re-send
 * simply overwrites — mirroring the server's per-nominee
 * INSERT OR REPLACE.
 */
export async function submitNomination(args: {
  url: string;
  nomination: FounderNomination;
  fetchImpl?: typeof fetch;
}): Promise<NominationSubmitResult> {
  const fetchImpl = args.fetchImpl ?? fetch;
  try {
    const res = await fetchImpl(
      `${normalizeNodeUrl(args.url)}/founder-nomination`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args.nomination),
      },
    );
    if (res.ok) {
      await setSetting(
        COFOUNDER_PENDING_NOMINATION,
        JSON.stringify(args.nomination),
      );
      return { ok: true };
    }
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    const reason = body?.error as NominationErrorReason | undefined;
    if (reason && NOMINATION_ERROR_REASONS.has(reason)) {
      return { ok: false, reason };
    }
    return { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}

// --- nominee side: poll + accept -------------------------------------

export type PollNominationResult =
  | { ok: true; nomination: FounderNomination | null }
  | { ok: false };

/**
 * Fetch the nomination addressed to `myKey` from the node's pending
 * shelf. The recipient-proof trio rides in via `authorizedFetch` —
 * the SAME signer every federation pull uses (and the one the
 * messages inbox already leans on as recipient proof); this module
 * deliberately does not build a second header path.
 *
 * `{ok: true, nomination: null}` is an authoritative "nothing for
 * you" (accepted elsewhere, expired off the shelf, or never
 * nominated) and lets the caller clear stale local state; `{ok:
 * false}` is a transport failure and means "leave local state
 * alone". A row that fails verification, is addressed to someone
 * else, or is already expired resolves to null — a dishonest node
 * ignoring the scope gets nothing persisted.
 */
export async function pollPendingNomination(
  baseUrl: string,
  myKey: string,
  now: number = Date.now(),
): Promise<PollNominationResult> {
  const url = `${normalizeNodeUrl(baseUrl)}/founder-nomination/pending`;
  let body: { nomination?: unknown };
  try {
    const res = await authorizedFetch(url, normalizeNodeUrl(baseUrl));
    if (!res.ok) return { ok: false };
    body = (await res.json()) as { nomination?: unknown };
  } catch {
    return { ok: false };
  }
  if (body.nomination === null || body.nomination === undefined) {
    return { ok: true, nomination: null };
  }
  const parsed = parseFounderNomination(body.nomination);
  if (!parsed.ok) return { ok: true, nomination: null };
  const nomination = parsed.value;
  if (
    nomination.nomineeKey !== myKey ||
    !verifyFounderNomination(nomination) ||
    nominationExpired(nomination, now)
  ) {
    return { ok: true, nomination: null };
  }
  return { ok: true, nomination };
}

/** POST /founder-accession refusals plus the client-side outcomes.
 *  `acceptance_out_of_window` is the nominee-clock-skew landing spot —
 *  its copy points at date/time settings (the stale_claim precedent). */
export type AccessionErrorReason =
  | "invalid_body"
  | "wrong_node"
  | "acceptance_out_of_window"
  | "bad_signature"
  | "nomination_expired"
  | "root_count_not_one"
  | "unreachable"
  | "rejected";

const ACCESSION_ERROR_REASONS = new Set<AccessionErrorReason>([
  "invalid_body",
  "wrong_node",
  "acceptance_out_of_window",
  "bad_signature",
  "nomination_expired",
  "root_count_not_one",
]);

export type AccessionResult =
  | { ok: true; alreadyFounder: boolean; accession: FounderAccession }
  | { ok: false; reason: AccessionErrorReason };

/**
 * Sign and submit the accession — the nominee's own consent to
 * PERMANENT founding. On success (201, or the idempotent 200 replay)
 * the dual-signed artifact is persisted to `db.founderAccessions`:
 * that row is the reseed recovery path for the community's second
 * root, carried in the community snapshot and re-POSTable during a
 * reseed grace window. The incoming-nomination key is NOT cleared
 * here — the accept card owns its own lifecycle (success state, then
 * the next poll finds the shelf empty and clears).
 */
export async function acceptNomination(args: {
  url: string;
  nomination: FounderNomination;
  fetchImpl?: typeof fetch;
  now?: () => number;
}): Promise<AccessionResult> {
  const fetchImpl = args.fetchImpl ?? fetch;
  const payload: FounderAccessionPayload = {
    nomination: args.nomination,
    acceptedAt: (args.now ?? Date.now)(),
  };
  let accession: FounderAccession;
  try {
    const secret = await getSecretKey(args.nomination.nomineeKey);
    accession = {
      ...payload,
      signature: sign(canonicalFounderAccessionPayload(payload), secret),
    };
  } catch {
    // No signing key on this device / locked session.
    return { ok: false, reason: "bad_signature" };
  }
  try {
    const res = await fetchImpl(
      `${normalizeNodeUrl(args.url)}/founder-accession`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(accession),
      },
    );
    if (res.ok) {
      const body = (await res.json().catch(() => null)) as {
        alreadyFounder?: unknown;
      } | null;
      await db.founderAccessions.put(accession);
      return {
        ok: true,
        alreadyFounder: body?.alreadyFounder === true,
        accession,
      };
    }
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    const reason = body?.error as AccessionErrorReason | undefined;
    if (reason && ACCESSION_ERROR_REASONS.has(reason)) {
      return { ok: false, reason };
    }
    return { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}
