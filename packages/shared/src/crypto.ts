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
import { b64decode, b64encode, utf8encode } from "./bytes.js";
import type { Category, Exchange, SignedVouch, VouchPayload } from "./types.js";

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
