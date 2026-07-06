/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import nacl from "tweetnacl";
import { b64decode, b64encode, randomBytes, utf8encode } from "@/lib/bytes";
import { DEFAULT_ITERATIONS, deriveMasterKey } from "@/lib/passphrase";
import {
  validateDecryptedPayload,
  type TransferPayload,
  type UnwrapResult,
} from "@/lib/devicePairing";
import { readSubmitConfig } from "@/lib/nodeSubmit";
import {
  deriveCandidateNodeUrl,
  isExcludedOrigin,
  probeNodeHealth,
} from "@/lib/nodeOriginSuggest";

// Node-relayed device linking — client half (docs/device-pairing.md
// §6.6). The community node is a dumb one-shot mailbox for the
// passphrase-wrapped TransferEnvelope; the 6 link-code words do
// double duty: they LOCATE the mailbox (channel id below) and
// DECRYPT the envelope (the existing wrap/unwrap path). Nothing the
// node stores can be read without the words, and deriving a channel
// id from a candidate code costs the same PBKDF2-600k as deriving
// the envelope key — a node DB snapshot has no cheap dictionary
// shortcut.

/** How long a relayed envelope stays claimable. Mirrors the server's
 *  DEVICE_LINK_TTL_MS (routes/deviceLink.ts); the same window rides
 *  INSIDE the encrypted payload via wrapForTransfer's expiresAt, so
 *  the bound holds end-to-end even against a misbehaving server. */
export const LINK_EXPIRY_MS = 15 * 60_000;

/** Fixed application salt for the channel-id derivation. Fixed (not
 *  per-transfer) because the destination holds nothing but the words;
 *  at 6 BIP39 words (~66 bits) a precomputed table over the code
 *  space is out of reach regardless of salt reuse. */
const CHANNEL_SALT = "understoria-device-link-v1";

/** The channel id: hex of the first 32 bytes of SHA-512 over the
 *  PBKDF2-derived master key for the code under the fixed channel
 *  salt. Independent of the envelope key (which uses the envelope's
 *  own random salt), so no key material is reused across purposes.
 *  `iterations` is injectable for tests only. */
export async function deriveLinkChannelId(
  code: string,
  iterations: number = DEFAULT_ITERATIONS,
): Promise<string> {
  const normalized = normalizeLinkCode(code);
  const master = await deriveMasterKey(
    normalized,
    utf8encode(CHANNEL_SALT),
    iterations,
  );
  const digest = nacl.hash(master);
  return toHex(digest.subarray(0, 32));
}

/** Lowercase + collapse runs of whitespace: both sides must derive
 *  the identical channel id from the same words no matter how they
 *  were typed. The same normalization is applied to the passphrase
 *  before wrap/unwrap by the callers. */
export function normalizeLinkCode(code: string): string {
  return code.trim().toLowerCase().split(/\s+/).join(" ");
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

/**
 * Where's my node's API? Preference order:
 *  1. the explicitly configured community-node URL (Settings) —
 *     source devices normally have one;
 *  2. `${location.origin}/api` when the origin is plausible and
 *     answers the health probe — fresh destination devices were
 *     served by the node itself (deploy/Caddyfile), so this is how
 *     a not-yet-onboarded device finds home.
 * Returns null when neither works; callers fall back to the QR flow.
 */
export async function resolveLinkApiBase(
  fetchImpl: typeof fetch | undefined = globalThis.fetch,
): Promise<string | null> {
  const cfg = await readSubmitConfig();
  const configured = cfg.url.trim().replace(/\/+$/, "");
  if (configured !== "") return configured;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  if (!origin || isExcludedOrigin(origin)) return null;
  const candidate = deriveCandidateNodeUrl(origin);
  const healthy = await probeNodeHealth(candidate, fetchImpl);
  return healthy ? candidate : null;
}

export type PublishResult =
  | { kind: "ok"; expiresAt: number }
  | { kind: "error" };

/** Source side: park the wrapped envelope in the node's mailbox. */
export async function publishLinkEnvelope(
  apiBase: string,
  channelId: string,
  envelope: string,
  fetchImpl: typeof fetch | undefined = globalThis.fetch,
): Promise<PublishResult> {
  if (!fetchImpl) return { kind: "error" };
  try {
    const res = await fetchImpl(`${apiBase}/device-link`, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId, envelope }),
    });
    if (!res.ok) return { kind: "error" };
    const body = (await res.json()) as { expiresAt?: unknown };
    return {
      kind: "ok",
      expiresAt:
        typeof body.expiresAt === "number"
          ? body.expiresAt
          : Date.now() + LINK_EXPIRY_MS,
    };
  } catch {
    return { kind: "error" };
  }
}

export type FetchLinkResult =
  | { kind: "found"; envelope: string }
  | { kind: "not_found" }
  | { kind: "error" };

/** Destination side: claim the envelope. One-shot on the server —
 *  a 200 here consumed the mailbox row. */
export async function fetchLinkEnvelope(
  apiBase: string,
  channelId: string,
  fetchImpl: typeof fetch | undefined = globalThis.fetch,
): Promise<FetchLinkResult> {
  if (!fetchImpl) return { kind: "error" };
  try {
    const res = await fetchImpl(`${apiBase}/device-link/${channelId}`, {
      method: "GET",
      credentials: "omit",
    });
    if (res.status === 404) return { kind: "not_found" };
    if (!res.ok) return { kind: "error" };
    const body = (await res.json()) as { envelope?: unknown };
    if (typeof body.envelope !== "string" || body.envelope === "") {
      return { kind: "error" };
    }
    return { kind: "found", envelope: body.envelope };
  } catch {
    return { kind: "error" };
  }
}

// --- Tap-to-link (docs/device-pairing.md §6.7) ------------------------
//
// The zero-typing default. The NEW device posts a one-time X25519
// public key as a "link request" bucketed by network address on the
// node; the member's SIGNED-IN device sees the request appear on its
// Add-device screen and approves with one tap, sealing the transfer
// payload to that one-time key through the same one-shot mailbox the
// word-relay uses. Nothing human-carried: the two-emoji badge below
// exists for recognition ("is this MY app asking?"), not as a secret.

/** How long a link request stays visible/answerable. Mirrors the
 *  server's LINK_REQUEST_TTL_MS (routes/linkRequests.ts). Long enough
 *  to flip apps at leisure; short enough that stale strangers'
 *  requests age out of shared-network buckets. */
export const LINK_REQUEST_TTL_MS = 10 * 60_000;

/** How often each side polls. Chosen well under the node's default
 *  60-req/min rate limit even with both ends polling from one
 *  address. */
export const LINK_POLL_INTERVAL_MS = 3000;

/** How long either side waits with nothing happening before naming
 *  the likely invisible cause: a VPN or iCloud Private Relay making
 *  the two apps look like different networks, which breaks the
 *  address rendezvous silently. Long enough that a normal app-flip
 *  never sees the hint; short enough to catch someone stuck. */
export const LINK_STALL_HINT_MS = 45_000;

const GRANT_CHANNEL_TAG = "understoria-link-grant-v2|";

/** 64 visually distinct emoji for the recognition badge. Curated to
 *  avoid near-twins (one canine, one feline, …) so two badges never
 *  differ by a squint. Order is part of the wire contract — append
 *  only, never reorder. */
export const BADGE_EMOJI: readonly string[] = [
  "🦊", "🐢", "🦉", "🐙", "🦔", "🐝", "🦋", "🐌",
  "🌵", "🌻", "🍄", "🌙", "⭐", "🌈", "🔥", "❄️",
  "🍎", "🍋", "🍇", "🥕", "🌽", "🍞", "🧀", "🥚",
  "⚓", "🪁", "🎈", "🧭", "🔔", "🎺", "🥁", "🪕",
  "🚲", "⛵", "🚀", "🛖", "🏔", "🌊", "🌋", "🏝",
  "🪴", "🍂", "🌾", "🍯", "🧵", "🧶", "🪡", "🧲",
  "🔑", "🛠", "⚙️", "🖌", "📦", "📯", "🎁", "🕯",
  "☂️", "🥾", "🎒", "🪣", "🧺", "🪞", "🕰", "🧊",
];

/** Two-emoji recognition badge derived from a link request's public
 *  key: the first 12 bits of SHA-512 pick two table entries. Shown on
 *  BOTH screens so the approving member can recognize their own app
 *  at a glance and tell simultaneous requests apart. */
export function badgeForPubkey(pubkeyB64: string): [string, string] {
  const digest = nacl.hash(utf8encode("understoria-link-badge-v2|" + pubkeyB64));
  const first = digest[0] >> 2; // top 6 bits
  const second = ((digest[0] & 0x03) << 4) | (digest[1] >> 4); // next 6
  return [BADGE_EMOJI[first], BADGE_EMOJI[second]];
}

/** One-time keypair for a link request. X25519 (nacl.box) — the
 *  request side never signs anything; it only needs to receive. */
export function generateLinkKeypair(): nacl.BoxKeyPair {
  return nacl.box.keyPair();
}

/** Mailbox channel for the grant addressed to `pubkeyB64`. Plain hash
 *  (no KDF): the public key is high-entropy, so the channel id is
 *  unguessable without it, and the key is not a secret to stretch. */
export function grantChannelIdForPubkey(pubkeyB64: string): string {
  const digest = nacl.hash(utf8encode(GRANT_CHANNEL_TAG + pubkeyB64));
  let out = "";
  for (const b of digest.subarray(0, 32)) out += b.toString(16).padStart(2, "0");
  return out;
}

interface GrantEnvelope {
  v: 2;
  senderPub: string;
  nonce: string;
  box: string;
}

/**
 * Seal a TransferPayload to a link request's public key. Fresh sender
 * keypair per grant (sealed-box construction): the sender's secret is
 * dropped on return, so only the request keypair's holder can open
 * it — including against us later.
 */
export function sealGrant(
  payload: TransferPayload,
  recipientPubkeyB64: string,
): string {
  const recipientPub = b64decode(recipientPubkeyB64);
  if (recipientPub.length !== nacl.box.publicKeyLength) {
    throw new Error("sealGrant: bad recipient public key");
  }
  const sender = nacl.box.keyPair();
  const nonce = randomBytes(nacl.box.nonceLength);
  const boxed = nacl.box(
    utf8encode(JSON.stringify(payload)),
    nonce,
    recipientPub,
    sender.secretKey,
  );
  const envelope: GrantEnvelope = {
    v: 2,
    senderPub: b64encode(sender.publicKey),
    nonce: b64encode(nonce),
    box: b64encode(boxed),
  };
  return b64encode(utf8encode(JSON.stringify(envelope)));
}

/**
 * Open a grant with the request keypair. Returns the same
 * discriminated result as unwrapTransfer so error handling matches:
 * `malformed_envelope` doubles as "someone posted junk to our
 * channel" — the UI treats that as interference and re-asks with a
 * fresh key.
 */
export function openGrant(
  encoded: string,
  keypair: nacl.BoxKeyPair,
  now: number = Date.now(),
): UnwrapResult {
  let env: GrantEnvelope;
  try {
    env = JSON.parse(
      new TextDecoder().decode(b64decode(encoded)),
    ) as GrantEnvelope;
  } catch {
    return { ok: false, reason: "malformed_envelope" };
  }
  if (
    typeof env !== "object" ||
    env === null ||
    env.v !== 2 ||
    typeof env.senderPub !== "string" ||
    typeof env.nonce !== "string" ||
    typeof env.box !== "string"
  ) {
    return { ok: false, reason: "malformed_envelope" };
  }
  let senderPub: Uint8Array;
  let nonce: Uint8Array;
  let boxed: Uint8Array;
  try {
    senderPub = b64decode(env.senderPub);
    nonce = b64decode(env.nonce);
    boxed = b64decode(env.box);
  } catch {
    return { ok: false, reason: "malformed_envelope" };
  }
  if (
    senderPub.length !== nacl.box.publicKeyLength ||
    nonce.length !== nacl.box.nonceLength ||
    boxed.length === 0
  ) {
    return { ok: false, reason: "malformed_envelope" };
  }
  const plaintext = nacl.box.open(boxed, nonce, senderPub, keypair.secretKey);
  if (!plaintext) return { ok: false, reason: "malformed_envelope" };
  return validateDecryptedPayload(plaintext, now);
}

// --- Link-request HTTP client -----------------------------------------

export type PostLinkRequestResult =
  | { kind: "ok"; cancelToken: string; expiresAt: number }
  | { kind: "too_many" }
  | { kind: "error" };

export async function postLinkRequest(
  apiBase: string,
  pubkeyB64: string,
  fetchImpl: typeof fetch | undefined = globalThis.fetch,
): Promise<PostLinkRequestResult> {
  if (!fetchImpl) return { kind: "error" };
  try {
    const res = await fetchImpl(`${apiBase}/link-request`, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pubkey: pubkeyB64 }),
    });
    if (res.status === 429) return { kind: "too_many" };
    if (!res.ok) return { kind: "error" };
    const body = (await res.json()) as {
      cancelToken?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof body.cancelToken !== "string" ||
      typeof body.expiresAt !== "number"
    ) {
      return { kind: "error" };
    }
    return {
      kind: "ok",
      cancelToken: body.cancelToken,
      expiresAt: body.expiresAt,
    };
  } catch {
    return { kind: "error" };
  }
}

export interface PendingLinkRequest {
  pubkey: string;
  createdAt: number;
}

export type ListLinkRequestsResult =
  | { kind: "ok"; requests: PendingLinkRequest[] }
  | { kind: "error" };

/** The signed-in side's poll: "anything asking from my network?" */
export async function listLinkRequests(
  apiBase: string,
  fetchImpl: typeof fetch | undefined = globalThis.fetch,
): Promise<ListLinkRequestsResult> {
  if (!fetchImpl) return { kind: "error" };
  try {
    const res = await fetchImpl(`${apiBase}/link-request`, {
      method: "GET",
      credentials: "omit",
    });
    if (!res.ok) return { kind: "error" };
    const body = (await res.json()) as { requests?: unknown };
    if (!Array.isArray(body.requests)) return { kind: "error" };
    const requests: PendingLinkRequest[] = [];
    for (const r of body.requests as Array<{
      pubkey?: unknown;
      createdAt?: unknown;
    }>) {
      if (typeof r?.pubkey === "string" && typeof r?.createdAt === "number") {
        requests.push({ pubkey: r.pubkey, createdAt: r.createdAt });
      }
    }
    return { kind: "ok", requests };
  } catch {
    return { kind: "error" };
  }
}

/** Best-effort cleanup when the requesting screen is cancelled or the
 *  import completes — failures are ignored (TTL cleans up anyway). */
export async function cancelLinkRequest(
  apiBase: string,
  pubkeyB64: string,
  cancelToken: string,
  fetchImpl: typeof fetch | undefined = globalThis.fetch,
): Promise<void> {
  if (!fetchImpl) return;
  try {
    await fetchImpl(`${apiBase}/link-request/cancel`, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pubkey: pubkeyB64, cancelToken }),
    });
  } catch {
    // TTL is the real cleanup.
  }
}
