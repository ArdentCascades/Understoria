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
import nacl from "tweetnacl";
import { b64decode, b64encode, randomBytes, utf8decode, utf8encode } from "./bytes";
import { deriveMasterKey, DEFAULT_ITERATIONS } from "./passphrase";
import { db } from "@/db/database";
import type { BlockRow, PreviouslyBlockedRow } from "@/types";

/**
 * Device-pairing crypto helpers — wrap an Ed25519 identity for QR
 * transfer to a second device, and unwrap it on receipt.
 *
 * See `docs/device-pairing.md` for the full design — this file
 * implements §5 (envelope + crypto) and is consumed by the UI in
 * a follow-up PR.
 *
 * Reused from `lib/passphrase.ts` rather than introducing a second
 * KDF / cipher pair:
 *   - PBKDF2-SHA256 with 600k iterations (NIST current guidance).
 *   - NaCl secretbox (XSalsa20-Poly1305) for authenticated
 *     encryption of the envelope plaintext.
 *
 * Differences from the per-device session passphrase wrapping:
 *   - The wrap key derives from a FRESH transfer passphrase, not
 *     the member's session passphrase. The transfer passphrase is
 *     single-use, machine-generated, conveyed verbally or typed.
 *   - The plaintext is a JSON envelope (identity + profile +
 *     issuedAt + expiresAt) rather than a single base64 key.
 *   - `expiresAt` is enforced on unwrap. A captured QR is useless
 *     after the 5-minute window even with the passphrase.
 */

/** Envelope version. Bump when the wire format changes. The destination
 *  device's unwrap path checks this BEFORE attempting decryption so a
 *  version mismatch is a clean error rather than a `wrong_passphrase`. */
export const ENVELOPE_VERSION = 1;
/** Plaintext payload version. Bump independently of the envelope
 *  version when the JSON payload schema changes (e.g. new profile
 *  fields). The unwrap path checks this AFTER decryption. */
export const PAYLOAD_VERSION = 1;

/** Default transfer window. Long enough for a member to walk into the
 *  other room and type the passphrase; short enough that a captured
 *  QR is useless before the camera operator can act on it. The
 *  destination unwrap path enforces this against `Date.now()`. */
export const DEFAULT_EXPIRY_MS = 5 * 60 * 1000;

/** Default number of words in a generated transfer passphrase. With a
 *  2048-word BIP39 wordlist this is ~66 bits of entropy, which combined
 *  with PBKDF2's 600k-iteration cost is infeasible to brute-force
 *  inside the 5-minute window. */
export const DEFAULT_WORD_COUNT = 6;

/** Profile fields that ride along on a transfer so the destination
 *  device doesn't start with a half-empty member row. Matches the
 *  subset enumerated in `docs/device-pairing.md` §8. */
export interface TransferProfile {
  displayName: string;
  skills: string[];
  availability: string;
  availabilityChips: string[];
  locationZone: string;
}

/** The wrapped envelope — what's serialised into the QR. Every field
 *  is base64-encoded so the whole thing JSON-serialises cleanly. */
export interface TransferEnvelope {
  v: typeof ENVELOPE_VERSION;
  /** PBKDF2 salt (16 bytes), base64. */
  salt: string;
  /** XSalsa20 nonce (24 bytes), base64. */
  nonce: string;
  /** secretbox(plaintext) where plaintext is the UTF-8 JSON encoding
   *  of `TransferPayload`. */
  ciphertext: string;
}

/** The decrypted payload. Matches the shape committed to in
 *  `docs/device-pairing.md` §5.1 and (for the block-bundle fields)
 *  `docs/blocking.md` §14.1 — newly-paired devices receive the current
 *  block state at pairing time, the same way they receive the identity
 *  bundle and profile fields.
 *
 *  `blocks` and `previouslyBlocked` are OPTIONAL on the wire: an older
 *  source device that pre-dates this PR will simply omit them, and the
 *  destination handles their absence as an empty list. This keeps
 *  cross-version pairing working without bumping `PAYLOAD_VERSION`. */
export interface TransferPayload {
  v: typeof PAYLOAD_VERSION;
  secretKey: string; // base64(NaCl Ed25519 64-byte secretKey)
  publicKey: string; // base64(Ed25519 32-byte publicKey) — sanity-check
  profile: TransferProfile;
  issuedAt: number;
  expiresAt: number;
  /** Active blocks held by the transferring member; absent on a payload
   *  built by a pre-block-feature source device. See
   *  `docs/blocking.md` §14.1 — these propagate to NEWLY-paired devices
   *  at pairing time. Already-paired devices that were paired BEFORE a
   *  block was created do NOT auto-sync; that is an explicit
   *  future-work gap (§14.1). */
  blocks?: BlockRow[];
  /** Block history rows. Same federation posture as `blocks` — local
   *  device-cluster-only, never crosses a peer-node wire. */
  previouslyBlocked?: PreviouslyBlockedRow[];
  /** The member's community-node connection, when configured on the
   *  source device. This is the member's OWN prior consent following
   *  their identity: without it a freshly linked device arrives to an
   *  empty community — no posts, projects, events, members, or stats —
   *  because every federation pull is gated on this setting. The
   *  destination adopts it only when it has no connection of its own,
   *  then runs an immediate first sync. Optional on the wire (older
   *  sources omit it) — no PAYLOAD_VERSION bump needed. */
  communityNode?: { url: string; enabled: boolean };
}

export type UnwrapResult =
  | { ok: true; payload: TransferPayload }
  | {
      ok: false;
      reason:
        | "malformed_envelope"
        | "wrong_passphrase"
        | "expired"
        | "version_mismatch_envelope"
        | "version_mismatch_payload"
        | "publickey_mismatch";
    };

/**
 * Generate a fresh transfer passphrase by picking `wordCount` random
 * words from `wordlist`. Uses `crypto.getRandomValues` via the existing
 * `randomBytes` helper.
 *
 * The wordlist is passed in so callers can pick the locale-matched
 * BIP39 list (`@scure/bip39/wordlists/<locale>`) — see
 * `docs/device-pairing.md` §12 for the locale-matching argument.
 *
 * Throws if the wordlist is empty (caller error). Returns a
 * space-separated string for display; the destination input field
 * accepts the same shape after the member types it back.
 */
export function generateTransferPassphrase(
  wordlist: readonly string[],
  wordCount: number = DEFAULT_WORD_COUNT,
): string {
  if (wordlist.length === 0) {
    throw new Error("generateTransferPassphrase: wordlist is empty");
  }
  if (wordCount < 1) {
    throw new Error("generateTransferPassphrase: wordCount must be >= 1");
  }
  const out: string[] = [];
  // Rejection sampling so the modulo doesn't bias toward earlier words
  // when the wordlist length isn't a power of two. We sample 4 random
  // bytes per word and reject any value above the largest multiple of
  // wordlist.length that fits in 2^32. This stays unbiased for any
  // wordlist length up to 2^32 - 1, which BIP39's 2048-word list is
  // comfortably below.
  const max = Math.floor(0xffffffff / wordlist.length) * wordlist.length;
  while (out.length < wordCount) {
    const bytes = randomBytes(4);
    const n =
      (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    // Force to unsigned — JavaScript's bit ops produce signed 32-bit ints.
    const u = n >>> 0;
    if (u >= max) continue;
    out.push(wordlist[u % wordlist.length]);
  }
  return out.join(" ");
}

/**
 * Wrap an identity keypair + profile under a transfer passphrase.
 * Caller passes the bytes directly; the helper doesn't read from
 * IndexedDB or any global state.
 *
 * `blocks` and `previouslyBlocked` are OPTIONAL inputs — callers that
 * want to propagate the blocker's current block state to the
 * newly-paired device pass them in; callers that don't omit them.
 * The destination's unwrap path handles their absence as "no block
 * state to import." Both are included verbatim in the encrypted
 * envelope per `docs/blocking.md` §14.1.
 *
 * The convenience function `assembleBlocksForTransfer(blockerKey)`
 * below reads the two tables from Dexie scoped to one blocker; UI
 * callers typically use it rather than passing rows directly.
 */
/**
 * Assemble the plaintext TransferPayload — shared by BOTH transports:
 * wrapForTransfer secretboxes it under the passphrase (QR / word-relay
 * paths), sealGrant in deviceLink.ts boxes it to a link request's
 * one-time public key (tap-to-link). Callers validate key lengths
 * before calling (wrapForTransfer does; tap-to-link reads the same
 * stored keys).
 */
export function buildTransferPayload(opts: {
  secretKey: Uint8Array;
  publicKey: Uint8Array;
  profile: TransferProfile;
  now?: number;
  expiryMs?: number;
  blocks?: BlockRow[];
  previouslyBlocked?: PreviouslyBlockedRow[];
  communityNode?: { url: string; enabled: boolean };
}): TransferPayload {
  const now = opts.now ?? Date.now();
  const expiryMs = opts.expiryMs ?? DEFAULT_EXPIRY_MS;
  return {
    v: PAYLOAD_VERSION,
    secretKey: b64encode(opts.secretKey),
    publicKey: b64encode(opts.publicKey),
    profile: opts.profile,
    issuedAt: now,
    expiresAt: now + expiryMs,
    ...(opts.blocks !== undefined ? { blocks: opts.blocks } : {}),
    ...(opts.previouslyBlocked !== undefined
      ? { previouslyBlocked: opts.previouslyBlocked }
      : {}),
    ...(opts.communityNode !== undefined
      ? { communityNode: opts.communityNode }
      : {}),
  };
}

export async function wrapForTransfer(opts: {
  secretKey: Uint8Array; // 64-byte NaCl Ed25519 secretKey
  publicKey: Uint8Array; // 32-byte Ed25519 publicKey
  profile: TransferProfile;
  passphrase: string;
  now?: number;
  expiryMs?: number;
  /** Optional: active blocks held by the transferring member. See
   *  `docs/blocking.md` §14.1 — these propagate to NEWLY-paired devices
   *  at pairing time. Already-paired devices that were paired BEFORE a
   *  block was created do NOT auto-sync; that is an explicit
   *  future-work gap (§14.1). */
  blocks?: BlockRow[];
  /** Optional: block history rows. Same federation posture as
   *  `blocks` — local device-cluster-only, never crosses a peer-node
   *  wire. */
  previouslyBlocked?: PreviouslyBlockedRow[];
  /** Optional: the source's community-node connection (see
   *  TransferPayload.communityNode). */
  communityNode?: { url: string; enabled: boolean };
}): Promise<TransferEnvelope> {
  const now = opts.now ?? Date.now();
  const expiryMs = opts.expiryMs ?? DEFAULT_EXPIRY_MS;
  if (opts.secretKey.length !== nacl.sign.secretKeyLength) {
    throw new Error(
      `wrapForTransfer: secretKey must be ${nacl.sign.secretKeyLength} bytes, got ${opts.secretKey.length}`,
    );
  }
  if (opts.publicKey.length !== nacl.sign.publicKeyLength) {
    throw new Error(
      `wrapForTransfer: publicKey must be ${nacl.sign.publicKeyLength} bytes, got ${opts.publicKey.length}`,
    );
  }

  const payload = buildTransferPayload({ ...opts, now, expiryMs });

  const salt = randomBytes(16);
  const nonce = randomBytes(nacl.secretbox.nonceLength);
  const masterKey = await deriveMasterKey(opts.passphrase, salt, DEFAULT_ITERATIONS);
  const plaintextBytes = utf8encode(JSON.stringify(payload));
  const ciphertext = nacl.secretbox(plaintextBytes, nonce, masterKey);

  return {
    v: ENVELOPE_VERSION,
    salt: b64encode(salt),
    nonce: b64encode(nonce),
    ciphertext: b64encode(ciphertext),
  };
}

/**
 * Unwrap a transfer envelope with a candidate passphrase. Returns a
 * discriminated `UnwrapResult` so callers can show specific error
 * messages without leaking timing details (every failure path runs
 * the KDF — fast-failing on `version_mismatch` is the only branch
 * that can short-circuit, and only because the envelope version is
 * outside the cryptographic envelope anyway).
 *
 * `now` is a parameter for testability. Production calls leave it
 * defaulted to `Date.now()`.
 */
export async function unwrapTransfer(
  envelope: TransferEnvelope,
  passphrase: string,
  now: number = Date.now(),
): Promise<UnwrapResult> {
  // Envelope version check FIRST. The envelope is not encrypted; this
  // saves the cost of a KDF call on something we already can't read.
  if (envelope.v !== ENVELOPE_VERSION) {
    return { ok: false, reason: "version_mismatch_envelope" };
  }

  let saltBytes: Uint8Array;
  let nonceBytes: Uint8Array;
  let ciphertextBytes: Uint8Array;
  try {
    saltBytes = b64decode(envelope.salt);
    nonceBytes = b64decode(envelope.nonce);
    ciphertextBytes = b64decode(envelope.ciphertext);
  } catch {
    return { ok: false, reason: "malformed_envelope" };
  }

  if (
    saltBytes.length === 0 ||
    nonceBytes.length !== nacl.secretbox.nonceLength ||
    ciphertextBytes.length === 0
  ) {
    return { ok: false, reason: "malformed_envelope" };
  }

  const masterKey = await deriveMasterKey(
    passphrase,
    saltBytes,
    DEFAULT_ITERATIONS,
  );
  const plaintextBytes = nacl.secretbox.open(
    ciphertextBytes,
    nonceBytes,
    masterKey,
  );
  if (!plaintextBytes) {
    // secretbox.open returns null on EITHER wrong key OR tampering;
    // we can't distinguish them without extra metadata and we don't
    // want to. "Check the words" is the right user-facing prompt
    // either way.
    return { ok: false, reason: "wrong_passphrase" };
  }

  return validateDecryptedPayload(plaintextBytes, now);
}

/**
 * Validate decrypted payload bytes into a TransferPayload — shared by
 * both transports (passphrase secretbox above; the tap-to-link sealed
 * box in deviceLink.ts). Checks shape, version, expiry, and that the
 * embedded publicKey matches what the secretKey derives to (guards
 * against a corrupt or hostile payload that survived decryption).
 */
export function validateDecryptedPayload(
  plaintextBytes: Uint8Array,
  now: number = Date.now(),
): UnwrapResult {
  let payload: TransferPayload;
  try {
    payload = JSON.parse(utf8decode(plaintextBytes)) as TransferPayload;
  } catch {
    return { ok: false, reason: "malformed_envelope" };
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.secretKey !== "string" ||
    typeof payload.publicKey !== "string" ||
    typeof payload.issuedAt !== "number" ||
    typeof payload.expiresAt !== "number"
  ) {
    return { ok: false, reason: "malformed_envelope" };
  }

  if (payload.v !== PAYLOAD_VERSION) {
    return { ok: false, reason: "version_mismatch_payload" };
  }

  if (now > payload.expiresAt) {
    return { ok: false, reason: "expired" };
  }

  let secretKeyBytes: Uint8Array;
  let claimedPublicBytes: Uint8Array;
  try {
    secretKeyBytes = b64decode(payload.secretKey);
    claimedPublicBytes = b64decode(payload.publicKey);
  } catch {
    return { ok: false, reason: "malformed_envelope" };
  }
  if (
    secretKeyBytes.length !== nacl.sign.secretKeyLength ||
    claimedPublicBytes.length !== nacl.sign.publicKeyLength
  ) {
    return { ok: false, reason: "malformed_envelope" };
  }
  const derived = nacl.sign.keyPair.fromSecretKey(secretKeyBytes);
  if (!constantTimeEqual(derived.publicKey, claimedPublicBytes)) {
    return { ok: false, reason: "publickey_mismatch" };
  }

  return { ok: true, payload };
}

/**
 * Encode an envelope as a single base64url string suitable for a QR
 * code. Wrapping the JSON shape in another base64 layer is cheap and
 * means the QR is alphanumeric-friendly (denser encoding).
 */
export function encodeEnvelope(envelope: TransferEnvelope): string {
  return b64encode(utf8encode(JSON.stringify(envelope)));
}

/**
 * Decode the string a destination device captured (via camera or
 * paste) back into an envelope. Returns null on malformed input —
 * unwrap's normal `malformed_envelope` path treats this the same.
 */
export function decodeEnvelope(s: string): TransferEnvelope | null {
  try {
    const bytes = b64decode(s.trim());
    const obj = JSON.parse(utf8decode(bytes)) as unknown;
    if (
      typeof obj !== "object" ||
      obj === null ||
      typeof (obj as TransferEnvelope).v !== "number" ||
      typeof (obj as TransferEnvelope).salt !== "string" ||
      typeof (obj as TransferEnvelope).nonce !== "string" ||
      typeof (obj as TransferEnvelope).ciphertext !== "string"
    ) {
      return null;
    }
    return obj as TransferEnvelope;
  } catch {
    return null;
  }
}

// Constant-time comparison so an attacker who can observe timing
// can't probe the publicKey check. Both inputs are short, fixed-
// length, and not secret per se — but the discipline is cheap.
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Read the transferring member's `blocks` and `previouslyBlocked` rows
 * from Dexie, scoped to the blocker's own pubkey. Convenience helper
 * for callers that want to populate the `wrapForTransfer` payload from
 * the live local state.
 *
 * `docs/blocking.md` §14.1: blocks + history propagate to NEWLY-paired
 * devices through the device-pairing transfer envelope (the same
 * envelope as the identity bundle + profile fields), NEVER over a
 * peer-node wire. Already-paired devices that were paired BEFORE a
 * block was created do not auto-sync; that is an explicit future-work
 * gap (§14.1) — the Settings panel surfaces this in fine print (PR E).
 *
 * Scoped to `blockerKey` so a shared-device cluster (e.g., a household
 * sharing one laptop) doesn't leak one member's blocks to another
 * member's paired device.
 */
export async function assembleBlocksForTransfer(
  blockerKey: string,
): Promise<{
  blocks: BlockRow[];
  previouslyBlocked: PreviouslyBlockedRow[];
}> {
  const [blocks, previouslyBlocked] = await Promise.all([
    db.blocks.where("blockerKey").equals(blockerKey).toArray(),
    db.previouslyBlocked
      .where("blockerKey")
      .equals(blockerKey)
      .toArray(),
  ]);
  return { blocks, previouslyBlocked };
}
