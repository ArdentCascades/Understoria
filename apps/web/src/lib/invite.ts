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

export interface InvitePayload {
  /** Unique single-use token (UUID). */
  token: string;
  /** Inviter's Ed25519 public key (base64). */
  inviterKey: string;
  /** Human-readable inviter label (pseudonym). Not authoritative — the
   * redeeming node should also show the inviter's key hash. */
  inviterName: string;
  /** Node that issued the invite. Advisory only. */
  nodeId: string;
  createdAt: number;
  expiresAt: number;
}

export interface SignedInvite extends InvitePayload {
  signature: string;
}

const DEFAULT_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export interface CreateInviteInput {
  inviterKey: string;
  inviterSecretKey: string;
  inviterName: string;
  nodeId: string;
  expiresInMs?: number;
  now?: number;
}

export function canonicalInvitePayload(p: InvitePayload): string {
  return JSON.stringify({
    token: p.token,
    inviterKey: p.inviterKey,
    inviterName: p.inviterName,
    nodeId: p.nodeId,
    createdAt: p.createdAt,
    expiresAt: p.expiresAt,
  });
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
