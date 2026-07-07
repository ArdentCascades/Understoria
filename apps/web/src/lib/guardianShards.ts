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
  decryptMessage,
  encryptMessage,
  generateKeyPair,
} from "@understoria/shared/crypto";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { getSecretKey } from "@/db/secrets";
import { b64decode, b64encode } from "@/lib/bytes";
import {
  combineShares,
  splitSecret,
  SSS_MIN_THRESHOLD,
  type Share,
} from "@/lib/sss";
import {
  restoreIdentityCore,
  secretMatchesPublicKey,
} from "@/lib/recoveryKit";
import { uuid } from "@/lib/id";

/**
 * Guardian shards — docs/identity-recovery.md Phase K2 (social
 * recovery). For members who can't safely keep a paper kit: the
 * secret key is Shamir-split (`lib/sss.ts`, k-of-n) and each share is
 * handed to a trusted fellow member — a GUARDIAN — encrypted to that
 * guardian's key with the same NaCl box construction as E2E messages.
 * Recovery gathers any k releases and reconstructs.
 *
 * DELIVERY-LEG DELTA from the original plan, named: the plan said
 * distribution "rides the shipped E2E channel", but the DM layer has
 * no transport (messages are written locally and deliberately never
 * relayed or federated — threat-model §7). So every K2 hand-off is
 * DEVICE-TO-DEVICE: a QR shown on one screen and scanned by the other
 * (`PairDeviceCapture` — camera with paste fallback), or the text
 * pasted through any channel the two members already trust. The node
 * appears NOWHERE in this design — not even as a ciphertext mailbox —
 * which is strictly less metadata than the plan's mailbox option
 * leaked. The cost is that hand-offs are synchronous and usually
 * in-person; for a recovery ceremony the plan wanted in-person bias
 * anyway.
 *
 * Envelope hygiene: shares are ciphertext at rest on the guardian's
 * device (box to the guardian's key) and in every hand-off (offer:
 * box owner→guardian; release: box guardian→temporary recovery key).
 * Below the threshold, Shamir gives PERFECT secrecy — k-1 seized
 * guardian phones reveal nothing about the key itself. What a
 * guardian row DOES reveal is relational: whom this member guards.
 * Hence: cleared by soft purge, excluded from the shareable export,
 * excluded from the pairing snapshot (guardianship is a per-device
 * duty; re-run setup to cover a new device).
 *
 * RE-SHARDING, honestly: creating a new shard set (new random
 * polynomial, new setId) changes the guardian set GOING FORWARD and
 * releases can't mix across sets — but k shards of an OLD set still
 * reconstruct the same never-rotating secret key. Removing a
 * guardian's power fully requires the old guardians' cooperation in
 * deleting their shards (their devices, their data). The setup UI
 * says this; so does threat-model §7.
 */

export const GUARDIAN_OFFER_KIND = "understoria-guardian-shard";
export const SHARD_RELEASE_KIND = "understoria-shard-release";
export const RECOVERY_REQUEST_KIND = "understoria-recovery-request";

export const GUARDIANS_MIN = SSS_MIN_THRESHOLD; // k ≥ 2
export const GUARDIANS_MAX = 7; // n ≤ 7 — sane bounds per the plan

/** Settings key: the member's OWN active shard set, JSON
 *  `{setId, threshold, total, guardians: [{publicKey, displayName}],
 *  createdAt}` — display/bookkeeping so the card can show "you have
 *  guardians"; the shards themselves live only on guardians. */
export const GUARDIAN_SETUP_KEY = "guardianShardSetup";

interface Box {
  nonce: string;
  ciphertext: string;
}

export interface GuardianShardOffer {
  kind: typeof GUARDIAN_OFFER_KIND;
  version: 1;
  ownerKey: string;
  ownerName: string;
  guardianKey: string;
  setId: string;
  index: number;
  threshold: number;
  total: number;
  createdAt: number;
  /** b64(share bytes), boxed owner → guardian. */
  box: Box;
}

export interface ShardRelease {
  kind: typeof SHARD_RELEASE_KIND;
  version: 1;
  ownerKey: string;
  ownerName: string;
  guardianKey: string;
  setId: string;
  index: number;
  threshold: number;
  /** b64(share bytes), boxed guardian → temporary recovery key. */
  box: Box;
}

export interface RecoveryRequest {
  kind: typeof RECOVERY_REQUEST_KIND;
  version: 1;
  /** Temporary Ed25519 PUBLIC key minted on the recovering device. */
  tempKey: string;
}

/** Dexie row on the GUARDIAN's device — one active shard per owner. */
export interface GuardianShardRow {
  /** `${ownerKey}` — accepting a NEWER set for the same owner
   *  replaces the older row (forward rotation; see module comment). */
  ownerKey: string;
  ownerName: string;
  guardianKey: string;
  setId: string;
  index: number;
  threshold: number;
  total: number;
  acceptedAt: number;
  box: Box;
}

// ---------------------------------------------------------------------
// Owner side: create offers

export type CreateOffersResult =
  | {
      ok: true;
      setId: string;
      offers: { guardianKey: string; guardianName: string; text: string }[];
    }
  | { ok: false; error: "no_identity" | "locked" | "bad_params" };

export async function createGuardianOffers(opts: {
  threshold: number;
  guardians: { publicKey: string; displayName: string }[];
}): Promise<CreateOffersResult> {
  const { threshold, guardians } = opts;
  const total = guardians.length;
  const distinct = new Set(guardians.map((g) => g.publicKey));
  const ownerKey = await getSetting(SETTING_KEYS.currentMember);
  if (!ownerKey) return { ok: false, error: "no_identity" };
  if (
    !Number.isInteger(threshold) ||
    threshold < GUARDIANS_MIN ||
    total < threshold ||
    total > GUARDIANS_MAX ||
    distinct.size !== total ||
    distinct.has(ownerKey) // you cannot guard yourself
  ) {
    return { ok: false, error: "bad_params" };
  }
  const owner = await db.members.get(ownerKey);
  if (!owner) return { ok: false, error: "no_identity" };

  let secretB64: string;
  try {
    secretB64 = await getSecretKey(ownerKey);
  } catch {
    return { ok: false, error: "locked" };
  }

  const setId = uuid();
  const createdAt = Date.now();
  const shares = splitSecret(b64decode(secretB64), threshold, total);
  const offers = guardians.map((g, i) => {
    const offer: GuardianShardOffer = {
      kind: GUARDIAN_OFFER_KIND,
      version: 1,
      ownerKey,
      ownerName: owner.displayName,
      guardianKey: g.publicKey,
      setId,
      index: shares[i].index,
      threshold,
      total,
      createdAt,
      box: encryptMessage(b64encode(shares[i].data), secretB64, g.publicKey),
    };
    return {
      guardianKey: g.publicKey,
      guardianName: g.displayName,
      text: JSON.stringify(offer),
    };
  });

  await setSetting(
    GUARDIAN_SETUP_KEY,
    JSON.stringify({
      setId,
      threshold,
      total,
      guardians: guardians.map((g) => ({
        publicKey: g.publicKey,
        displayName: g.displayName,
      })),
      createdAt,
    }),
  );

  return { ok: true, setId, offers };
}

// ---------------------------------------------------------------------
// Guardian side: accept + list + release

function parseBox(raw: unknown): Box | null {
  if (raw === null || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  if (typeof b.nonce !== "string" || typeof b.ciphertext !== "string") {
    return null;
  }
  return { nonce: b.nonce, ciphertext: b.ciphertext };
}

export function parseGuardianOffer(text: string): GuardianShardOffer | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (raw === null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const box = parseBox(o.box);
  if (
    o.kind !== GUARDIAN_OFFER_KIND ||
    o.version !== 1 ||
    typeof o.ownerKey !== "string" ||
    o.ownerKey === "" ||
    typeof o.ownerName !== "string" ||
    typeof o.guardianKey !== "string" ||
    typeof o.setId !== "string" ||
    o.setId === "" ||
    typeof o.index !== "number" ||
    typeof o.threshold !== "number" ||
    typeof o.total !== "number" ||
    typeof o.createdAt !== "number" ||
    box === null
  ) {
    return null;
  }
  return {
    kind: GUARDIAN_OFFER_KIND,
    version: 1,
    ownerKey: o.ownerKey,
    ownerName: o.ownerName,
    guardianKey: o.guardianKey,
    setId: o.setId,
    index: o.index,
    threshold: o.threshold,
    total: o.total,
    createdAt: o.createdAt,
    box,
  };
}

export type AcceptShardResult =
  | { ok: true; row: GuardianShardRow; replacedOlderSet: boolean }
  | {
      ok: false;
      error: "not_a_shard" | "not_addressed_to_me" | "locked" | "undecryptable";
    };

/**
 * Accept a shard offer on the guardian's device. Decrypts once to
 * prove the shard is genuinely addressed to this member (and intact),
 * then stores the CIPHERTEXT — the plaintext share never rests.
 */
export async function acceptGuardianShard(
  text: string,
): Promise<AcceptShardResult> {
  const offer = parseGuardianOffer(text);
  if (!offer) return { ok: false, error: "not_a_shard" };
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me || offer.guardianKey !== me) {
    return { ok: false, error: "not_addressed_to_me" };
  }
  let mySecret: string;
  try {
    mySecret = await getSecretKey(me);
  } catch {
    return { ok: false, error: "locked" };
  }
  const shareB64 = decryptMessage(offer.box, mySecret, offer.ownerKey);
  if (shareB64 === null) return { ok: false, error: "undecryptable" };

  const existing = await db.guardianShards.get(offer.ownerKey);
  const replacedOlderSet =
    existing !== undefined && existing.setId !== offer.setId;
  const row: GuardianShardRow = {
    ownerKey: offer.ownerKey,
    ownerName: offer.ownerName,
    guardianKey: offer.guardianKey,
    setId: offer.setId,
    index: offer.index,
    threshold: offer.threshold,
    total: offer.total,
    acceptedAt: Date.now(),
    box: offer.box,
  };
  await db.guardianShards.put(row);
  return { ok: true, row, replacedOlderSet };
}

export async function listGuardianDuties(): Promise<GuardianShardRow[]> {
  return db.guardianShards.toArray();
}

export async function dropGuardianDuty(ownerKey: string): Promise<void> {
  await db.guardianShards.delete(ownerKey);
}

export function parseRecoveryRequest(text: string): RecoveryRequest | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (raw === null || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (
    r.kind !== RECOVERY_REQUEST_KIND ||
    r.version !== 1 ||
    typeof r.tempKey !== "string" ||
    r.tempKey === ""
  ) {
    return null;
  }
  return { kind: RECOVERY_REQUEST_KIND, version: 1, tempKey: r.tempKey };
}

export type ReleaseResult =
  | { ok: true; text: string }
  | { ok: false; error: "no_duty" | "bad_request" | "locked" | "undecryptable" };

/**
 * The guardian's half of the recovery ceremony: decrypt the held
 * shard and re-encrypt it to the recovering device's TEMPORARY key.
 * The deliberate-friction copy around this call lives in the UI —
 * this function assumes the guardian already satisfied themselves
 * that the request is really their person, really asking.
 */
export async function releaseShard(
  ownerKey: string,
  recoveryRequestText: string,
): Promise<ReleaseResult> {
  const request = parseRecoveryRequest(recoveryRequestText);
  if (!request) return { ok: false, error: "bad_request" };
  const row = await db.guardianShards.get(ownerKey);
  if (!row) return { ok: false, error: "no_duty" };
  let mySecret: string;
  try {
    mySecret = await getSecretKey(row.guardianKey);
  } catch {
    return { ok: false, error: "locked" };
  }
  const shareB64 = decryptMessage(row.box, mySecret, row.ownerKey);
  if (shareB64 === null) return { ok: false, error: "undecryptable" };

  const release: ShardRelease = {
    kind: SHARD_RELEASE_KIND,
    version: 1,
    ownerKey: row.ownerKey,
    ownerName: row.ownerName,
    guardianKey: row.guardianKey,
    setId: row.setId,
    index: row.index,
    threshold: row.threshold,
    box: encryptMessage(shareB64, mySecret, request.tempKey),
  };
  return { ok: true, text: JSON.stringify(release) };
}

// ---------------------------------------------------------------------
// Recovering side: mint request, collect releases, finish

export interface RecoverySession {
  tempPublicKey: string;
  tempSecretKey: string;
  requestText: string;
}

/** Mint the temporary keypair the ceremony runs against. The secret
 *  half lives only in the page's memory — it exists to move shares
 *  across one room and is discarded the moment recovery finishes. */
export function mintRecoverySession(): RecoverySession {
  const kp = generateKeyPair();
  const request: RecoveryRequest = {
    kind: RECOVERY_REQUEST_KIND,
    version: 1,
    tempKey: kp.publicKey,
  };
  return {
    tempPublicKey: kp.publicKey,
    tempSecretKey: kp.secretKey,
    requestText: JSON.stringify(request),
  };
}

export interface CollectedRelease {
  ownerKey: string;
  ownerName: string;
  setId: string;
  threshold: number;
  index: number;
  shareB64: string;
}

export type CollectResult =
  | { ok: true; release: CollectedRelease }
  | {
      ok: false;
      error:
        | "not_a_release"
        | "undecryptable"
        | "different_owner"
        | "different_set"
        | "duplicate_piece";
    };

/** Parse + decrypt one release against the session's temp key and
 *  check consistency with what has been collected so far. */
export function collectRelease(
  text: string,
  session: RecoverySession,
  already: readonly CollectedRelease[],
): CollectResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "not_a_release" };
  }
  if (raw === null || typeof raw !== "object") {
    return { ok: false, error: "not_a_release" };
  }
  const r = raw as Record<string, unknown>;
  const box = parseBox(r.box);
  if (
    r.kind !== SHARD_RELEASE_KIND ||
    r.version !== 1 ||
    typeof r.ownerKey !== "string" ||
    typeof r.ownerName !== "string" ||
    typeof r.guardianKey !== "string" ||
    typeof r.setId !== "string" ||
    typeof r.index !== "number" ||
    typeof r.threshold !== "number" ||
    box === null
  ) {
    return { ok: false, error: "not_a_release" };
  }
  const shareB64 = decryptMessage(
    box,
    session.tempSecretKey,
    r.guardianKey,
  );
  if (shareB64 === null) return { ok: false, error: "undecryptable" };
  if (already.length > 0) {
    if (already[0].ownerKey !== r.ownerKey) {
      return { ok: false, error: "different_owner" };
    }
    if (already[0].setId !== r.setId) {
      // Shares from different shardings CANNOT be mixed — a new
      // random polynomial per set (see module comment).
      return { ok: false, error: "different_set" };
    }
    if (already.some((c) => c.index === r.index)) {
      return { ok: false, error: "duplicate_piece" };
    }
  }
  return {
    ok: true,
    release: {
      ownerKey: r.ownerKey,
      ownerName: r.ownerName,
      setId: r.setId,
      threshold: r.threshold,
      index: r.index,
      shareB64,
    },
  };
}

export type FinishRecoveryResult =
  | { ok: true; publicKey: string }
  | { ok: false; error: "not_enough_pieces" | "corrupted" | "device_locked" };

/**
 * Combine the collected releases, verify the reconstructed key IS the
 * owner (Shamir has no integrity — this check is the integrity, same
 * anchor as the recovery kit), and restore through the shared core.
 */
export async function finishRecovery(
  releases: readonly CollectedRelease[],
): Promise<FinishRecoveryResult> {
  if (
    releases.length === 0 ||
    releases.length < releases[0].threshold
  ) {
    return { ok: false, error: "not_enough_pieces" };
  }
  const shares: Share[] = releases.map((r) => ({
    index: r.index,
    data: b64decode(r.shareB64),
  }));
  let secretB64: string;
  try {
    secretB64 = b64encode(combineShares(shares));
  } catch {
    return { ok: false, error: "corrupted" };
  }
  // Shamir has no integrity — THIS is it (see secretMatchesPublicKey
  // for why the naive fromSecretKey check is not enough).
  if (!secretMatchesPublicKey(secretB64, releases[0].ownerKey)) {
    return { ok: false, error: "corrupted" };
  }

  const core = await restoreIdentityCore({
    publicKey: releases[0].ownerKey,
    displayName: releases[0].ownerName,
    secretB64,
    nodeId: null,
    communityNodeUrl: null,
    mirrors: [],
  });
  if (!core.ok) return core;
  return { ok: true, publicKey: releases[0].ownerKey };
}
