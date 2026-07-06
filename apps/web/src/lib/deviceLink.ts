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
import { utf8encode } from "@/lib/bytes";
import { DEFAULT_ITERATIONS, deriveMasterKey } from "@/lib/passphrase";
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
