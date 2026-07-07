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
import ed2curve from "ed2curve";
import { b64decode, b64encode, utf8decode, utf8encode } from "./bytes.js";
import type {
  AwaitingTransition,
  AwaitingTransitionPayload,
  Category,
  CoOrganizerInvitation,
  CoOrganizerInvitationPayload,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationResponsePayload,
  CoOrganizerInvitationRevocation,
  CoOrganizerInvitationRevocationPayload,
  Event,
  EventCancellation,
  EventCancellationPayload,
  EventPayload,
  Exchange,
  InvitePayload,
  Post,
  PostPayload,
  InviteRevocation,
  InviteRevocationPayload,
  RedemptionPayload,
  RedemptionReceipt,
  SignedInvite,
  SignedVouch,
  TaskComment,
  VouchPayload,
  ProjectState,
  TaskState,
  SeedVaultPledge,
  MemberRemoval,
  MemberRemovalPayload,
  MemberReinstatement,
  MemberReinstatementPayload,
} from "./types.js";

/**
 * Identity primitives — Ed25519 key pairs, detached signatures.
 *
 * Framework-free. Browser realm and Node realm both work — `bytes.ts`
 * abstracts the small surface where they differ.
 */

export interface KeyPair {
  publicKey: string;
  secretKey: string;
}

export function generateKeyPair(): KeyPair {
  const kp = nacl.sign.keyPair();
  return {
    publicKey: b64encode(kp.publicKey),
    secretKey: b64encode(kp.secretKey),
  };
}

export function sign(message: string, secretKeyB64: string): string {
  const sig = nacl.sign.detached(
    utf8encode(message),
    b64decode(secretKeyB64),
  );
  return b64encode(sig);
}

export function verify(
  message: string,
  signatureB64: string,
  publicKeyB64: string,
): boolean {
  try {
    return nacl.sign.detached.verify(
      utf8encode(message),
      b64decode(signatureB64),
      b64decode(publicKeyB64),
    );
  } catch {
    return false;
  }
}

/**
 * The canonical, stable serialization of an exchange that both parties
 * sign. Anything that changes here changes the signatures, so it must be
 * kept in sync between signer and verifier — that's the whole point of a
 * canonical form.
 */
export interface ExchangePayload {
  postId: string;
  helperKey: string;
  helpedKey: string;
  hours: number;
  category: Category;
  completedAt: number;
}

export function canonicalExchangePayload(p: ExchangePayload): string {
  // Keys listed explicitly so field order is stable across JS engines.
  return JSON.stringify({
    postId: p.postId,
    helperKey: p.helperKey,
    helpedKey: p.helpedKey,
    hours: p.hours,
    category: p.category,
    completedAt: p.completedAt,
  });
}

/**
 * Independently verify an exchange record. Any node with the two public
 * keys can call this without contacting a central authority — the
 * foundation for trustless federation (Agent 3).
 *
 * For auto-confirmed records (see `docs/auto-confirm-key.md` §4) the
 * helped-side signature is produced by the node's system key, NOT by
 * the member identified in `helpedKey` — so this helper, which only
 * has the member pubkey on hand, cannot verify it. Auto-confirmed rows
 * therefore pass through this check on a verified helper signature
 * alone; callers that need full trust (peer-node ingestion, the
 * Decisions surface) should use `verifyExchangeLabel` below, which
 * takes a system-pubkey resolver and returns a distinct label per
 * §4's testable property.
 */
export function verifyExchange(exchange: Exchange): boolean {
  const payload = canonicalExchangePayload({
    postId: exchange.postId,
    helperKey: exchange.helperKey,
    helpedKey: exchange.helpedKey,
    hours: exchange.hoursExchanged,
    category: exchange.category,
    completedAt: exchange.completedAt,
  });
  if (!verify(payload, exchange.helperSignature, exchange.helperKey)) {
    return false;
  }
  if (exchange.autoConfirmed) {
    // System-signed helped-side signature; can't be verified without
    // the published system pubkey, which this helper doesn't know.
    // Helper-side signature was already verified above.
    return true;
  }
  return verify(payload, exchange.helpedSignature, exchange.helpedKey);
}

/**
 * Distinguishability label for the §4 hard contract in
 * `docs/auto-confirm-key.md`. Returns one of:
 *
 * - `"member-signed"` — both signatures verify against member keys
 *   (the shipped mutual-confirm path).
 * - `"system-signed"` — helper signature verifies against `helperKey`;
 *   helped-side signature verifies against a resolved system pubkey,
 *   and `autoConfirmed` is true with `autoConfirmedBy: "system:<nodeId>"`.
 * - `"invalid"` — anything else (signatures don't verify, fields
 *   contradict each other, system pubkey unavailable).
 *
 * The caller supplies a `resolveSystemPubkey(nodeId, signedAt)`
 * function so this remains a pure crypto helper — the shared package
 * does not fetch `GET /config`. Pass `null` from the resolver to
 * indicate "no key known for this node," which produces `"invalid"`:
 * a peer that cannot verify the system signature MUST NOT label it
 * as authentic.
 *
 * `signedAt` is the §4 rotation hook: the record's `autoConfirmedAt`
 * (falling back to `completedAt` for rows predating that field) —
 * the moment the system key produced the helped-side signature. A
 * rotation-aware resolver selects the pubkey that was CURRENT at
 * that moment from the node's published `systemKey.history`, so past
 * records stay verifiable after a rotation while a record claiming a
 * retired key for a post-retirement timestamp resolves to the newer
 * key and fails — which is the point of retiring a compromised key.
 * Resolvers that predate rotation support may ignore the argument.
 *
 * This is the §4 testable property the implementation PR ships with;
 * the labels are intentionally distinct strings so a downstream
 * auditor can fail a verification on a mismatch.
 */
export type ExchangeLabel = "member-signed" | "system-signed" | "invalid";

export function verifyExchangeLabel(
  exchange: Exchange,
  resolveSystemPubkey: (nodeId: string, signedAt: number) => string | null,
): ExchangeLabel {
  const payload = canonicalExchangePayload({
    postId: exchange.postId,
    helperKey: exchange.helperKey,
    helpedKey: exchange.helpedKey,
    hours: exchange.hoursExchanged,
    category: exchange.category,
    completedAt: exchange.completedAt,
  });
  if (!verify(payload, exchange.helperSignature, exchange.helperKey)) {
    return "invalid";
  }

  if (exchange.autoConfirmed) {
    // Auto-confirm must self-declare via both flags. A row that
    // claims autoConfirmed but lacks the marker is rejected —
    // refusing to fall back to the member-signed code path is the
    // §4 contract: distinct labels for distinct provenance.
    if (
      typeof exchange.autoConfirmedBy !== "string" ||
      !exchange.autoConfirmedBy.startsWith("system:")
    ) {
      return "invalid";
    }
    const expectedNodeId = exchange.autoConfirmedBy.slice("system:".length);
    if (expectedNodeId.length === 0) return "invalid";
    const pubkey = resolveSystemPubkey(
      expectedNodeId,
      exchange.autoConfirmedAt ?? exchange.completedAt,
    );
    if (pubkey === null) return "invalid";
    // The system key MUST NOT be a member's key. The label
    // distinction is only meaningful if the helped-side identity is
    // structurally not a member — a node operator cannot wave away
    // the audit by pointing the system pubkey at a member account.
    if (pubkey === exchange.helpedKey) return "invalid";
    if (!verify(payload, exchange.helpedSignature, pubkey)) return "invalid";
    return "system-signed";
  }

  // Member-confirmed path: helped-side signature must verify against
  // `helpedKey`. autoConfirmedBy must be absent (a row that sets it
  // without setting autoConfirmed is contradictory — reject).
  if (exchange.autoConfirmedBy !== undefined) return "invalid";
  if (!verify(payload, exchange.helpedSignature, exchange.helpedKey)) {
    return "invalid";
  }
  return "member-signed";
}

/**
 * Canonical, stable serialization of a vouch payload — the bytes the
 * voucher's secret key signs. Field order is fixed for cross-engine
 * stability, same reasoning as canonicalExchangePayload.
 */
export function canonicalVouchPayload(p: VouchPayload): string {
  return JSON.stringify({
    voucherKey: p.voucherKey,
    voucheeKey: p.voucheeKey,
    createdAt: p.createdAt,
    kind: p.kind,
  });
}

/**
 * Independently verify a vouch. Any node with the voucher's public key
 * can call this without contacting a central authority — same
 * trustless-federation principle as verifyExchange.
 */
export function verifyVouch(vouch: SignedVouch): boolean {
  const payload = canonicalVouchPayload({
    voucherKey: vouch.voucherKey,
    voucheeKey: vouch.voucheeKey,
    createdAt: vouch.createdAt,
    kind: vouch.kind,
  });
  return verify(payload, vouch.signature, vouch.voucherKey);
}

/**
 * Canonical, stable serialization of a post — the immutable subset
 * a poster's secret key signs at creation. Same field-order
 * discipline as canonicalExchangePayload / canonicalVouchPayload.
 *
 * Lifecycle fields (`status`, `claimedBy`, `confirmedBy`) are
 * deliberately excluded — they are local mutations that don't
 * federate. Including them in the signature would require re-signing
 * on every state change, which is the wrong model for this slice.
 */
export function canonicalPostPayload(p: PostPayload): string {
  return JSON.stringify({
    id: p.id,
    type: p.type,
    category: p.category,
    title: p.title,
    description: p.description,
    estimatedHours: p.estimatedHours,
    urgency: p.urgency,
    postedBy: p.postedBy,
    createdAt: p.createdAt,
    expiresAt: p.expiresAt,
    locationZone: p.locationZone,
    nodeId: p.nodeId,
  });
}

/**
 * Verify a post's signature against the poster's public key. Returns
 * false for legacy posts with an empty signature — those exist on
 * pre-v7 schemas and are not federable.
 */
export function verifyPost(post: Post): boolean {
  if (!post.signature) return false;
  const payload = canonicalPostPayload({
    id: post.id,
    type: post.type,
    category: post.category,
    title: post.title,
    description: post.description,
    estimatedHours: post.estimatedHours,
    urgency: post.urgency,
    postedBy: post.postedBy,
    createdAt: post.createdAt,
    expiresAt: post.expiresAt,
    locationZone: post.locationZone,
    nodeId: post.nodeId,
  });
  return verify(payload, post.signature, post.postedBy);
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

export function verifyInvite(invite: SignedInvite): boolean {
  const payload = canonicalInvitePayload(invite);
  return verify(payload, invite.signature, invite.inviterKey);
}

// -- Redemption receipts (see docs/invite-redemption.md §6–§7) --------------

/**
 * Canonical, stable serialization of a redemption payload — the bytes
 * the NEW member's secret key signs at redemption time. Field order is
 * fixed for cross-engine JSON stability, same discipline as
 * `canonicalVouchPayload` / `canonicalEventPayload`. The embedded
 * invite is re-serialized field-by-field (never `JSON.stringify` of
 * the object as received) so signer and verifier byte-agree even when
 * the transport reordered keys. The outer `signature` is NOT part of
 * the canonical payload; the embedded invite's own `signature` IS —
 * the receipt attests to the exact signed invite that was redeemed.
 */
export function canonicalRedemptionPayload(p: RedemptionPayload): string {
  return JSON.stringify({
    invite: {
      token: p.invite.token,
      inviterKey: p.invite.inviterKey,
      inviterName: p.invite.inviterName,
      nodeId: p.invite.nodeId,
      createdAt: p.invite.createdAt,
      expiresAt: p.invite.expiresAt,
      signature: p.invite.signature,
    },
    redeemedBy: p.redeemedBy,
    displayName: p.displayName,
    redeemedAt: p.redeemedAt,
  });
}

/**
 * Verify a redemption receipt. Used identically by the server route
 * (`POST /redemptions`) and the PWA pull (`pullFederatedRedemptions`)
 * — design note §6. Four checks, all of which must pass:
 *
 * 1. The embedded invite verifies against `invite.inviterKey`
 *    (`verifyInvite`) — the inviter's intent to admit a token-holder.
 * 2. The outer signature verifies against `redeemedBy` — the new
 *    member's proof of key possession.
 * 3. `redeemedBy !== invite.inviterKey` — self-redeem, mirroring the
 *    local guard in `apps/web/src/db/invites.ts`.
 * 4. `redeemedAt <= invite.expiresAt` — client-claimed, so this only
 *    stops naive late redemption; §11 of the design note covers what
 *    back-dating can and cannot buy (the server additionally bounds
 *    arrival time with a delivery-grace window on `receivedAt`).
 */
export function verifyRedemptionReceipt(rec: RedemptionReceipt): boolean {
  if (!rec.signature) return false;
  if (!verifyInvite(rec.invite)) return false;
  if (rec.redeemedBy === rec.invite.inviterKey) return false;
  if (rec.redeemedAt > rec.invite.expiresAt) return false;
  const payload = canonicalRedemptionPayload(rec);
  return verify(payload, rec.signature, rec.redeemedBy);
}

export type ParseRedemptionResult =
  | { ok: true; value: RedemptionReceipt }
  | { ok: false; error: string };

/** Maximum permitted displayName length on the wire. Matches the
 *  InviteAccept input's maxLength (design note §6). */
export const MAX_REDEMPTION_DISPLAY_NAME = 60;

/**
 * Shape-level validation for a redemption receipt. Lives in the
 * shared package — unlike the sibling parsers in
 * `apps/server/src/validate.ts` — because the design note (§14 PR 1a)
 * places it here deliberately: the client-side effects of a pulled
 * receipt are heavier than for any sibling record (invite-row flip +
 * member materialization), so the server route and the PWA pull gate
 * on the exact same shape check before the shared verifier runs.
 * Cryptographic checks stay separate in `verifyRedemptionReceipt`.
 */
export function parseRedemption(input: unknown): ParseRedemptionResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;

  const inviteRaw = r.invite;
  if (typeof inviteRaw !== "object" || inviteRaw === null) {
    return { ok: false, error: "invite must be an embedded SignedInvite object" };
  }
  const inv = inviteRaw as Record<string, unknown>;
  for (const f of [
    "token",
    "inviterKey",
    "inviterName",
    "nodeId",
    "signature",
  ] as const) {
    if (typeof inv[f] !== "string" || (inv[f] as string).length === 0) {
      return { ok: false, error: `invite.${f} must be a non-empty string` };
    }
  }
  for (const f of ["createdAt", "expiresAt"] as const) {
    if (
      typeof inv[f] !== "number" ||
      !Number.isInteger(inv[f]) ||
      (inv[f] as number) <= 0
    ) {
      return {
        ok: false,
        error: `invite.${f} must be a positive integer (ms epoch)`,
      };
    }
  }

  for (const f of ["redeemedBy", "signature"] as const) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (typeof r.displayName !== "string") {
    return { ok: false, error: "displayName must be a string" };
  }
  const displayName = r.displayName as string;
  if (
    displayName.trim().length === 0 ||
    displayName.length > MAX_REDEMPTION_DISPLAY_NAME
  ) {
    return {
      ok: false,
      error: `displayName must be 1..${MAX_REDEMPTION_DISPLAY_NAME} characters`,
    };
  }
  if (
    typeof r.redeemedAt !== "number" ||
    !Number.isInteger(r.redeemedAt) ||
    r.redeemedAt <= 0
  ) {
    return {
      ok: false,
      error: "redeemedAt must be a positive integer (ms epoch)",
    };
  }
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if ((r.redeemedAt as number) > oneDayFromNow) {
    return { ok: false, error: "redeemedAt is too far in the future" };
  }
  return {
    ok: true,
    value: {
      invite: {
        token: inv.token as string,
        inviterKey: inv.inviterKey as string,
        inviterName: inv.inviterName as string,
        nodeId: inv.nodeId as string,
        createdAt: inv.createdAt as number,
        expiresAt: inv.expiresAt as number,
        signature: inv.signature as string,
      },
      redeemedBy: r.redeemedBy as string,
      displayName,
      redeemedAt: r.redeemedAt as number,
      signature: r.signature as string,
    },
  };
}

/**
 * Canonical, stable serialization of an invite-revocation payload —
 * the bytes the inviter's secret key signs. Field order is fixed for
 * cross-engine JSON stability, same discipline as
 * `canonicalCoOrganizerInvitationRevocationPayload`. `signature` is
 * NOT part of the canonical payload. See `docs/invite-revocation.md`
 * §3.
 */
export function canonicalInviteRevocationPayload(
  p: InviteRevocationPayload,
): string {
  return JSON.stringify({
    token: p.token,
    inviterKey: p.inviterKey,
    revokedAt: p.revokedAt,
    nodeId: p.nodeId,
  });
}

/**
 * Verify an invite revocation's signature against the inviter's
 * public key. Single-signer discipline: the inviter is the only valid
 * signer.
 *
 * This proves the holder of `inviterKey`'s secret asked to revoke this
 * token while claiming to be its inviter. It does NOT prove
 * `inviterKey` actually issued the token — invites are not registered
 * server-side (`docs/invite-revocation.md` §3.1). The authority
 * binding (matching the redeemed invite's embedded, inviter-signed
 * `inviterKey`) lives in the merge layer, not here.
 */
export function verifyInviteRevocation(rec: InviteRevocation): boolean {
  if (!rec.signature) return false;
  const payload = canonicalInviteRevocationPayload(rec);
  return verify(payload, rec.signature, rec.inviterKey);
}

export type ParseInviteRevocationResult =
  | { ok: true; value: InviteRevocation }
  | { ok: false; error: string };

/**
 * Shape-level validation for an invite revocation, in the shared
 * package so the server route and the PWA pull gate on the identical
 * check (same rationale as `parseRedemption`).
 */
export function parseInviteRevocation(
  input: unknown,
): ParseInviteRevocationResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of ["token", "inviterKey", "nodeId", "signature"] as const) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (
    typeof r.revokedAt !== "number" ||
    !Number.isInteger(r.revokedAt) ||
    r.revokedAt <= 0
  ) {
    return {
      ok: false,
      error: "revokedAt must be a positive integer (ms epoch)",
    };
  }
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if ((r.revokedAt as number) > oneDayFromNow) {
    return { ok: false, error: "revokedAt is too far in the future" };
  }
  return {
    ok: true,
    value: {
      token: r.token as string,
      inviterKey: r.inviterKey as string,
      revokedAt: r.revokedAt as number,
      nodeId: r.nodeId as string,
      signature: r.signature as string,
    },
  };
}

// -- E2E messaging (Agent 2 task 5) ----------------------------------------

export interface EncryptedMessage {
  nonce: string;
  ciphertext: string;
}

export function deriveEncryptionKeyPair(ed25519SecretKeyB64: string): {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
} {
  const edSk = b64decode(ed25519SecretKeyB64);
  const x25519Sk = ed2curve.convertSecretKey(edSk);
  const edPk = edSk.subarray(32);
  const x25519Pk = ed2curve.convertPublicKey(edPk);
  if (!x25519Pk) throw new Error("Failed to convert Ed25519 public key to X25519");
  return { publicKey: x25519Pk, secretKey: x25519Sk };
}

export function ed25519PkToX25519(ed25519PublicKeyB64: string): Uint8Array {
  const edPk = b64decode(ed25519PublicKeyB64);
  const x25519Pk = ed2curve.convertPublicKey(edPk);
  if (!x25519Pk) throw new Error("Failed to convert Ed25519 public key to X25519");
  return x25519Pk;
}

export function encryptMessage(
  plaintext: string,
  senderEd25519SecretKeyB64: string,
  recipientEd25519PublicKeyB64: string,
): EncryptedMessage {
  const senderKp = deriveEncryptionKeyPair(senderEd25519SecretKeyB64);
  const recipientX25519Pk = ed25519PkToX25519(recipientEd25519PublicKeyB64);
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageBytes = utf8encode(plaintext);
  const ciphertext = nacl.box(messageBytes, nonce, recipientX25519Pk, senderKp.secretKey);
  if (!ciphertext) throw new Error("Encryption failed");
  return {
    nonce: b64encode(nonce),
    ciphertext: b64encode(ciphertext),
  };
}

export function decryptMessage(
  encrypted: EncryptedMessage,
  recipientEd25519SecretKeyB64: string,
  senderEd25519PublicKeyB64: string,
): string | null {
  const recipientKp = deriveEncryptionKeyPair(recipientEd25519SecretKeyB64);
  const senderX25519Pk = ed25519PkToX25519(senderEd25519PublicKeyB64);
  const nonce = b64decode(encrypted.nonce);
  const ciphertext = b64decode(encrypted.ciphertext);
  const plaintext = nacl.box.open(ciphertext, nonce, senderX25519Pk, recipientKp.secretKey);
  if (!plaintext) return null;
  return utf8decode(plaintext);
}

export function conversationId(keyA: string, keyB: string): string {
  return keyA < keyB ? `${keyA}|${keyB}` : `${keyB}|${keyA}`;
}

/**
 * Canonical serialization of a task comment — the immutable subset
 * signed at creation. The `deletedAt` field is a local mutation
 * (author may soft-delete later) and is excluded; including it
 * would require re-signing on delete, which doesn't fit the model.
 * Same field-order discipline as the other canonical helpers.
 */
export interface TaskCommentPayload {
  id: string;
  projectId: string;
  taskId: string;
  authorKey: string;
  body: string;
  createdAt: number;
  nodeId: string;
}

export function canonicalTaskCommentPayload(p: TaskCommentPayload): string {
  return JSON.stringify({
    id: p.id,
    projectId: p.projectId,
    taskId: p.taskId,
    authorKey: p.authorKey,
    body: p.body,
    createdAt: p.createdAt,
    nodeId: p.nodeId,
  });
}

/**
 * Verify a task comment's signature against the author's public
 * key. Returns false for unsigned (empty-signature) rows.
 */
export function verifyTaskComment(comment: TaskComment): boolean {
  if (!comment.signature) return false;
  const payload = canonicalTaskCommentPayload({
    id: comment.id,
    projectId: comment.projectId,
    taskId: comment.taskId,
    authorKey: comment.authorKey,
    body: comment.body,
    createdAt: comment.createdAt,
    nodeId: comment.nodeId,
  });
  return verify(payload, comment.signature, comment.authorKey);
}

// -- Co-organizer invitations (see docs/co-organizer-invitations.md) -------

/**
 * Canonical, stable serialization of a co-organizer invitation —
 * the bytes the inviter signs at issue time. Field order is fixed
 * for cross-engine JSON stability, same discipline as
 * `canonicalVouchPayload` / `canonicalExchangePayload`. `id` and
 * `signature` are deliberately NOT part of the canonical payload.
 */
export function canonicalCoOrganizerInvitationPayload(
  p: CoOrganizerInvitationPayload,
): string {
  return JSON.stringify({
    projectId: p.projectId,
    inviterKey: p.inviterKey,
    inviteeKey: p.inviteeKey,
    createdAt: p.createdAt,
    expiresAt: p.expiresAt,
    nodeId: p.nodeId,
  });
}

/**
 * Canonical, stable serialization of a co-organizer invitation
 * response — accept or decline, signed by the invitee. Revocation
 * has its own record type and its own canonical payload.
 */
export function canonicalCoOrganizerInvitationResponsePayload(
  p: CoOrganizerInvitationResponsePayload,
): string {
  return JSON.stringify({
    invitationId: p.invitationId,
    inviteeKey: p.inviteeKey,
    decision: p.decision,
    decidedAt: p.decidedAt,
    nodeId: p.nodeId,
  });
}

/**
 * Canonical, stable serialization of a co-organizer invitation
 * revocation — signed by the inviter to cancel an outstanding
 * invitation before the invitee has responded.
 */
export function canonicalCoOrganizerInvitationRevocationPayload(
  p: CoOrganizerInvitationRevocationPayload,
): string {
  return JSON.stringify({
    invitationId: p.invitationId,
    inviterKey: p.inviterKey,
    revokedAt: p.revokedAt,
    nodeId: p.nodeId,
  });
}

/**
 * Verify a co-organizer invitation's signature against the
 * inviter's public key. Single-signer-per-record discipline: the
 * inviter is the only valid signer of this record type.
 *
 * Grandfathered rows (synthesized by the v21 Dexie migration for
 * pre-feature `coOrganizerKeys` entries) carry the sentinel
 * `signature: "grandfathered"` and will never verify here — that's
 * deliberate. Callers that distinguish real from grandfathered
 * acceptance do so via the row-level `grandfathered` flag in Dexie,
 * not via this verifier.
 */
export function verifyCoOrganizerInvitation(
  rec: CoOrganizerInvitation,
): boolean {
  if (!rec.signature) return false;
  const payload = canonicalCoOrganizerInvitationPayload(rec);
  return verify(payload, rec.signature, rec.inviterKey);
}

/**
 * Verify a co-organizer invitation response's signature against
 * the invitee's public key. Accept and decline are both signed by
 * the invitee — revocation is a different record type signed by
 * the inviter (see `verifyCoOrganizerInvitationRevocation`).
 */
export function verifyCoOrganizerInvitationResponse(
  rec: CoOrganizerInvitationResponse,
): boolean {
  if (!rec.signature) return false;
  const payload = canonicalCoOrganizerInvitationResponsePayload(rec);
  return verify(payload, rec.signature, rec.inviteeKey);
}

/**
 * Verify a co-organizer invitation revocation's signature against
 * the inviter's public key.
 */
export function verifyCoOrganizerInvitationRevocation(
  rec: CoOrganizerInvitationRevocation,
): boolean {
  if (!rec.signature) return false;
  const payload = canonicalCoOrganizerInvitationRevocationPayload(rec);
  return verify(payload, rec.signature, rec.inviterKey);
}

// -- Community events (see docs/community-events.md §3, §4, §11) -----------

/**
 * Canonical, stable serialization of a community-event payload — the
 * bytes the organizer's secret key signs at issue time. Field order
 * is fixed for cross-engine JSON stability, same discipline as
 * `canonicalCoOrganizerInvitationPayload`. `signature` is NOT part
 * of the canonical payload.
 *
 * The order below is the WIRE CONTRACT. It mirrors the declared
 * field order in `EventPayload`. Do NOT alphabetize. Adding a field
 * is a breaking change to the federation wire format.
 *
 * `null` values for `endsAt`, `capacity`, `templateId` serialize as
 * literal `null` — never omitted — so signers and verifiers byte-
 * agree on records that take the "no defined end" / "uncapped" /
 * "no template" path.
 *
 * Note on `templateId`: reserved for phase 2. The types layer
 * accepts any `string | null`; phase-1 enforcement (must be `null`)
 * lives at the application layer, NOT at the canonical-serialization
 * layer. A non-null `templateId` here is a perfectly well-formed
 * canonical payload — it's just that the app will refuse to ship it
 * until phase 2 lands.
 */
export function canonicalEventPayload(p: EventPayload): string {
  return JSON.stringify({
    id: p.id,
    kind: p.kind,
    title: p.title,
    description: p.description,
    category: p.category,
    startsAt: p.startsAt,
    endsAt: p.endsAt,
    location: p.location,
    capacity: p.capacity,
    templateId: p.templateId,
    createdAt: p.createdAt,
    createdBy: p.createdBy,
    nodeId: p.nodeId,
  });
}

/**
 * Verify a community event's signature against the organizer's
 * public key. Single-signer-per-record discipline: `createdBy` is
 * the only valid signer of this record type.
 *
 * This helper verifies the signature only. Cross-record consistency
 * (cancellation.createdBy === referenced-event.createdBy, phase-1
 * `templateId` must be null, etc.) is enforced at the application
 * layer — federation routes, Dexie actions — not here.
 */
export function verifyEvent(rec: Event): boolean {
  if (!rec.signature) return false;
  const payload = canonicalEventPayload(rec);
  return verify(payload, rec.signature, rec.createdBy);
}

/**
 * Canonical, stable serialization of an event-cancellation payload
 * — the bytes the organizer's secret key signs to cancel an event.
 * Field order is fixed, same discipline as `canonicalEventPayload`.
 * `signature` is NOT part of the canonical payload.
 */
export function canonicalEventCancellationPayload(
  p: EventCancellationPayload,
): string {
  return JSON.stringify({
    id: p.id,
    kind: p.kind,
    eventId: p.eventId,
    reason: p.reason,
    cancelledAt: p.cancelledAt,
    createdBy: p.createdBy,
    nodeId: p.nodeId,
  });
}

/**
 * Verify an event cancellation's signature against the organizer's
 * public key. Same single-signer discipline as `verifyEvent` — the
 * application layer is responsible for asserting that this record's
 * `createdBy` matches the cancelled event's `createdBy` (the canon-
 * ical "only the organizer can cancel" rule).
 */
export function verifyEventCancellation(rec: EventCancellation): boolean {
  if (!rec.signature) return false;
  const payload = canonicalEventCancellationPayload(rec);
  return verify(payload, rec.signature, rec.createdBy);
}

/**
 * Canonical, stable serialization of an awaiting-transition payload —
 * the bytes the attesting party's secret key signs. Field order is
 * fixed for cross-engine JSON stability; `signature` is NOT part of
 * the canonical payload. See the `AwaitingTransitionPayload` doc in
 * types.ts for what this record is for.
 */
export function canonicalAwaitingTransitionPayload(
  p: AwaitingTransitionPayload,
): string {
  return JSON.stringify({
    kind: p.kind,
    postId: p.postId,
    helperKey: p.helperKey,
    helpedKey: p.helpedKey,
    signedBy: p.signedBy,
    enteredAt: p.enteredAt,
    nodeId: p.nodeId,
  });
}

/**
 * Verify an awaiting-transition artifact: the signature must verify
 * against `signedBy`, and `signedBy` must be one of the two parties
 * it attests for. The AGE of the transition is deliberately NOT part
 * of what this proves — the node's own `received_at` ingestion stamp
 * is the enforcement anchor (`docs/auto-confirm-key.md` §5).
 */
export function verifyAwaitingTransition(rec: AwaitingTransition): boolean {
  if (!rec.signature) return false;
  if (rec.kind !== "awaiting_transition") return false;
  if (rec.signedBy !== rec.helperKey && rec.signedBy !== rec.helpedKey) {
    return false;
  }
  const payload = canonicalAwaitingTransitionPayload(rec);
  return verify(payload, rec.signature, rec.signedBy);
}

// --- Project & participation federation (docs/project-federation.md) --

/**
 * Deterministic JSON with recursively sorted object keys. The
 * canonical form for SIGNED STATE records (ProjectState, TaskState),
 * which serialize the FULL row: an explicit field list — the style
 * the append-only kinds use — would break signature verification
 * every time the row type gains a field, because older and newer
 * devices would disagree about which fields exist. Sorting whatever
 * keys ARE present keeps signer and verifier in agreement across
 * schema evolution, at the cost that unknown fields ride along
 * verbatim (they are covered by the signature, which is what we
 * want).
 */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
      // undefined-valued keys are dropped, matching JSON.stringify.
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** Canonical payload of a signed state record: the whole record with
 *  the signature itself removed, in stable key order. `signerKey` and
 *  `updatedAt` remain INSIDE the signed bytes — the authority checks
 *  and the LWW clock are covered by the signature. */
export function canonicalStatePayload(
  rec: Record<string, unknown>,
): string {
  const { signature: _signature, ...rest } = rec;
  return stableStringify(rest);
}

export function signStateRecord<T extends object>(
  rec: Omit<T, "signature">,
  secretKeyB64: string,
): string {
  return sign(stableStringify(rec), secretKeyB64);
}

/** Generic verifier for any signed LWW state record: the signature
 *  must verify against `signerKey` over the canonical whole-record
 *  payload, and the LWW clock must be a positive number. AUTHORITY
 *  (who may sign which record) is deliberately not here — it depends
 *  on the STORED version and is checked by the server routes and the
 *  client pulls against their own stores. */
export function verifyStateRecord(rec: {
  updatedAt: number;
  signerKey: string;
  signature: string;
}): boolean {
  if (!rec.signature || !rec.signerKey) return false;
  if (typeof rec.updatedAt !== "number" || rec.updatedAt <= 0) return false;
  return verify(
    canonicalStatePayload(rec as unknown as Record<string, unknown>),
    rec.signature,
    rec.signerKey,
  );
}

export function verifyProjectState(rec: ProjectState): boolean {
  return verifyStateRecord(rec);
}

export function verifyTaskState(rec: TaskState): boolean {
  return verifyStateRecord(rec);
}

export function verifySeedVaultPledge(rec: SeedVaultPledge): boolean {
  return verifyStateRecord(rec);
}

// --- Member removal / reinstatement (docs/member-removal.md) ---------

/** Default quorum when a node hasn't configured REMOVAL_QUORUM and a
 *  client hasn't yet captured `/config.removalQuorum`. */
export const DEFAULT_REMOVAL_QUORUM = 3;

/** Length cap for the community-facing reason text. */
export const REMOVAL_REASON_MAX_LENGTH = 500;

/**
 * Canonical bytes every co-signer signs — everything EXCEPT
 * `signatures`, fixed field order (the wire contract; do NOT
 * alphabetize). Identical bytes for every signer, so signatures are
 * independently collectible and order-free.
 */
export function canonicalMemberRemovalPayload(
  p: MemberRemovalPayload,
): string {
  return JSON.stringify({
    id: p.id,
    removedKey: p.removedKey,
    reason: p.reason,
    decidedAt: p.decidedAt,
    nodeId: p.nodeId,
    proposalId: p.proposalId,
  });
}

export function canonicalMemberReinstatementPayload(
  p: MemberReinstatementPayload,
): string {
  return JSON.stringify({
    id: p.id,
    reinstatedKey: p.reinstatedKey,
    reason: p.reason,
    decidedAt: p.decidedAt,
    nodeId: p.nodeId,
    proposalId: p.proposalId,
  });
}

/**
 * The STRUCTURAL half of the validity rule, shared verbatim by the
 * server route and every pulling client: which signature entries
 * verify over the canonical payload, name distinct signers, and do
 * not name the removed/reinstated member signing for themselves.
 * Returns the distinct valid signer keys.
 *
 * The MEMBERSHIP half — "each signer is in the closure ignoring this
 * record" — deliberately lives with the caller: only a node can
 * derive the founder-rooted closure (founder keys are not public),
 * so nodes enforce it at ingestion and mirrors re-enforce it through
 * their own closure; clients verify structure + quorum and trust
 * their node's closure check, the same posture as auto-confirm
 * label verification (docs/member-removal.md §2).
 */
export function validRemovalSigners(
  canonicalPayload: string,
  subjectKey: string,
  signatures: readonly { signerKey: string; signature: string }[],
): Set<string> {
  const valid = new Set<string>();
  for (const entry of signatures) {
    if (!entry || typeof entry !== "object") continue;
    if (
      typeof entry.signerKey !== "string" ||
      entry.signerKey.length === 0 ||
      typeof entry.signature !== "string" ||
      entry.signature.length === 0
    )
      continue;
    if (entry.signerKey === subjectKey) continue; // never self-signed
    if (valid.has(entry.signerKey)) continue; // distinct signers only
    if (verify(canonicalPayload, entry.signature, entry.signerKey)) {
      valid.add(entry.signerKey);
    }
  }
  return valid;
}

export type ParseMemberRemovalResult =
  | { ok: true; value: MemberRemoval }
  | { ok: false; error: string };

/** Shape-level validation shared by the server route and the PWA
 *  pull (same rationale as `parseInviteRevocation`). Checks shape
 *  only — signatures and quorum are the caller's job. */
export function parseMemberRemoval(input: unknown): ParseMemberRemovalResult {
  const base = parseRemovalShape(input, "removedKey");
  if (!base.ok) return base;
  return { ok: true, value: base.value as unknown as MemberRemoval };
}

export type ParseMemberReinstatementResult =
  | { ok: true; value: MemberReinstatement }
  | { ok: false; error: string };

export function parseMemberReinstatement(
  input: unknown,
): ParseMemberReinstatementResult {
  const base = parseRemovalShape(input, "reinstatedKey");
  if (!base.ok) return base;
  return { ok: true, value: base.value as unknown as MemberReinstatement };
}

function parseRemovalShape(
  input: unknown,
  subjectField: "removedKey" | "reinstatedKey",
): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of ["id", subjectField, "nodeId"] as const) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (
    r.reason !== null &&
    (typeof r.reason !== "string" ||
      r.reason.length === 0 ||
      r.reason.length > REMOVAL_REASON_MAX_LENGTH)
  ) {
    return {
      ok: false,
      error: `reason must be null or a string of at most ${REMOVAL_REASON_MAX_LENGTH} chars`,
    };
  }
  if (
    typeof r.decidedAt !== "number" ||
    !Number.isInteger(r.decidedAt) ||
    r.decidedAt <= 0
  ) {
    return { ok: false, error: "decidedAt must be a positive integer (ms epoch)" };
  }
  if (r.proposalId !== null && typeof r.proposalId !== "string") {
    return { ok: false, error: "proposalId must be null or a string" };
  }
  if (!Array.isArray(r.signatures) || r.signatures.length === 0) {
    return { ok: false, error: "signatures must be a non-empty array" };
  }
  return { ok: true, value: r };
}

// --- Member-authenticated reads (docs/member-authenticated-reads.md) --

/**
 * Canonical bytes a member signs to authorize one read. Path INCLUDES
 * the query string, so a captured signature can't be replayed against
 * a different cursor window; the timestamp bounds how long captured
 * headers stay usable (reads are idempotent, so a nonce scheme buys
 * nothing further). Shared so the PWA signer and the node verifier
 * can never drift.
 */
export function canonicalReadAuthMessage(
  pathWithQuery: string,
  timestampMs: number,
): string {
  return `read|${pathWithQuery}|${timestampMs}`;
}
