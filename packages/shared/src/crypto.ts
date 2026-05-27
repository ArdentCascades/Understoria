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
  Category,
  Exchange,
  InvitePayload,
  Post,
  PostPayload,
  SignedInvite,
  SignedVouch,
  VouchPayload,
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
  return (
    verify(payload, exchange.helperSignature, exchange.helperKey) &&
    verify(payload, exchange.helpedSignature, exchange.helpedKey)
  );
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
