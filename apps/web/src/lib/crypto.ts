import nacl from "tweetnacl";
import type { Category, Exchange } from "@/types";

/**
 * Identity primitives — Ed25519 key pairs, detached signatures.
 *
 * This module is intentionally thin and framework-free. Agent 2 will layer
 * on passphrase-encrypted private-key storage, key backup/recovery, and
 * invite/vouching flows. The data shapes here (base64 public keys, base64
 * detached signatures over a canonicalized JSON payload) are the long-term
 * shapes — additional key material will be opaque to consumers.
 */

export interface KeyPair {
  publicKey: string;
  secretKey: string;
}

const b64encode = (bytes: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  if (typeof btoa !== "undefined") return btoa(binary);
  // Node fallback for tests.
  return Buffer.from(bytes).toString("base64");
};

/**
 * Return a freshly-allocated Uint8Array from this realm so tweetnacl's
 * strict `instanceof Uint8Array` check passes reliably across jsdom / Node
 * realm boundaries.
 */
const freshBytes = (length: number): Uint8Array => new Uint8Array(length);

const b64decode = (s: string): Uint8Array => {
  let binary: string;
  if (typeof atob !== "undefined") {
    binary = atob(s);
  } else {
    binary = Buffer.from(s, "base64").toString("binary");
  }
  const out = freshBytes(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
};

const utf8encode = (s: string): Uint8Array => {
  let source: ArrayLike<number>;
  if (typeof TextEncoder !== "undefined") {
    source = new TextEncoder().encode(s);
  } else {
    source = Buffer.from(s, "utf8");
  }
  const out = freshBytes(source.length);
  for (let i = 0; i < source.length; i++) out[i] = source[i];
  return out;
};

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
