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
import { sign, verify } from "./crypto";
import { uuid } from "./id";

/**
 * Cryptographic invite system — Agent 2 task 2.
 *
 * An invite is a small, self-contained, signed blob that encodes:
 *
 *   { token, inviterKey, nodeId, createdAt, expiresAt }
 *
 * …plus a detached Ed25519 signature made with the inviter's secret key
 * over the canonical JSON form. Invite links are shared out-of-band
 * (Signal, in-person, printed on paper). Any node can verify the invite
 * without contacting the issuer's node — the foundation for federated
 * onboarding.
 *
 * Single-use is enforced locally by the redeeming node (an `invites`
 * table tracks which tokens have been consumed). A compromised invite
 * chain can be revoked by marking the issued token's status, and
 * downstream vouches can be re-evaluated in follow-up work.
 */

import type {
  InvitePayload,
  SignedInvite,
} from "@understoria/shared/types";
import { canonicalInvitePayload } from "@understoria/shared/crypto";
export type { InvitePayload, SignedInvite };
export { canonicalInvitePayload };

const DEFAULT_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export interface CreateInviteInput {
  inviterKey: string;
  inviterSecretKey: string;
  inviterName: string;
  nodeId: string;
  expiresInMs?: number;
  now?: number;
}

export function createInvite(input: CreateInviteInput): SignedInvite {
  const now = input.now ?? Date.now();
  const payload: InvitePayload = {
    token: uuid(),
    inviterKey: input.inviterKey,
    inviterName: input.inviterName,
    nodeId: input.nodeId,
    createdAt: now,
    expiresAt: now + (input.expiresInMs ?? DEFAULT_EXPIRY_MS),
  };
  const signature = sign(canonicalInvitePayload(payload), input.inviterSecretKey);
  return { ...payload, signature };
}

const b64urlEncode = (s: string): string => {
  const bytes =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(s)
      : Buffer.from(s, "utf8");
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  const raw =
    typeof btoa !== "undefined"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64");
  return raw.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const b64urlDecode = (s: string): string => {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const raw = padded + pad;
  let binary: string;
  if (typeof atob !== "undefined") {
    binary = atob(raw);
  } else {
    binary = Buffer.from(raw, "base64").toString("binary");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(bytes).toString("utf8");
};

/**
 * Encode a signed invite as a URL-safe string suitable for a link fragment.
 * We use the fragment (`#`) rather than a query string because fragments
 * are not sent to servers — useful on pilot deployments that use plain
 * hosting while we don't yet have transport-level privacy guarantees.
 */
export function encodeInviteToken(invite: SignedInvite): string {
  return b64urlEncode(JSON.stringify(invite));
}

/**
 * Recover an invite token from whatever the member pasted — the
 * fragment-loss recovery input of `docs/invite-redemption.md` §5.1.
 *
 * The dominant redemption failure is a messenger in-app browser
 * stripping or mangling the `#fragment` of a tapped invite link
 * (fragments deliberately never reach servers, see encodeInviteToken
 * above — but that also means link-preview fetchers rebuild URLs
 * without them). Pasting the ORIGINAL message text restores the
 * fragment, so we accept, in order of preference:
 *
 *   1. anything containing `#<base64url>` — a full invite URL, or a
 *      whole message with the link somewhere inside it;
 *   2. a bare token (the part after `#`), with or without a leading
 *      `#`, surrounded by any amount of whitespace.
 *
 * Returns the token, or null when nothing token-shaped is present.
 * Validation of the token itself (signature, expiry) stays with
 * `decodeAndVerifyInvite` — this function only finds the candidate.
 */
export function extractInviteToken(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // A signed-invite blob is a few hundred base64url chars; 16 is a
  // generous lower bound that still rejects "#1" style fragments in
  // unrelated URLs the member might paste by accident.
  const MIN_TOKEN_LENGTH = 16;
  // Case 1: fragment marker present somewhere in the paste. Allow
  // whitespace right after `#` — some messengers wrap long links.
  const fragmentMatch = /#\s*([A-Za-z0-9_-]{16,})/.exec(trimmed);
  if (fragmentMatch) return fragmentMatch[1];
  // Case 2: a bare token, optionally with the `#` still attached.
  const bare = trimmed.replace(/^#/, "");
  if (
    bare.length >= MIN_TOKEN_LENGTH &&
    /^[A-Za-z0-9_-]+$/.test(bare)
  ) {
    return bare;
  }
  return null;
}

export type InviteParseError =
  | "malformed"
  | "expired"
  | "bad_signature";

export type InviteParseResult =
  | { ok: true; invite: SignedInvite }
  | { ok: false; error: InviteParseError };

export function decodeAndVerifyInvite(
  encoded: string,
  now: number = Date.now(),
): InviteParseResult {
  let parsed: SignedInvite;
  try {
    parsed = JSON.parse(b64urlDecode(encoded));
  } catch {
    return { ok: false, error: "malformed" };
  }
  if (
    typeof parsed.token !== "string" ||
    typeof parsed.inviterKey !== "string" ||
    typeof parsed.inviterName !== "string" ||
    typeof parsed.nodeId !== "string" ||
    typeof parsed.createdAt !== "number" ||
    typeof parsed.expiresAt !== "number" ||
    typeof parsed.signature !== "string"
  ) {
    return { ok: false, error: "malformed" };
  }
  if (parsed.expiresAt < now) {
    return { ok: false, error: "expired" };
  }
  const payload = canonicalInvitePayload(parsed);
  if (!verify(payload, parsed.signature, parsed.inviterKey)) {
    return { ok: false, error: "bad_signature" };
  }
  return { ok: true, invite: parsed };
}
