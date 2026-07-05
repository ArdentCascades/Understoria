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
import {
  b64decode,
  b64encode,
  freshBytes,
  randomBytes,
  utf8encode,
} from "./bytes";

/**
 * Passphrase-wrapped private key storage — the last big Phase-2
 * security deliverable for Agent 2.
 *
 * Threat model: a device falls into the wrong hands (theft, seizure,
 * shoulder-surf) between one use of the app and the next. Without this
 * wrapper, the adversary can pull the secret keys straight out of
 * IndexedDB and forge signed exchanges, vouches, and invites. With this
 * wrapper, they see only ciphertext until they can produce the member's
 * passphrase, which was never stored anywhere the attacker can read.
 *
 * Construction:
 *   - KDF: PBKDF2-HMAC-SHA256, default 600,000 iterations (current NIST
 *     guidance).
 *   - Wrapping cipher: NaCl secretbox (XSalsa20-Poly1305). 24-byte nonce,
 *     16-byte Poly1305 tag appended to ciphertext.
 *   - Blob is self-contained (salt, nonce, kdf params, version) so a
 *     future rotation to Argon2id can coexist with existing blobs.
 *
 * Non-goals (documented, deferred):
 *   - BIP39 mnemonic recovery. Pilots are expected to use a password
 *     manager; forgotten passphrases are unrecoverable by design.
 *   - Hardware-backed keys (WebAuthn). Worth revisiting once browser
 *     support for non-assertion ed25519 keys stabilizes.
 */

export interface WrappedBlob {
  v: 1;
  kdf: "pbkdf2-sha256";
  iterations: number;
  salt: string; // base64 (16 bytes)
  nonce: string; // base64 (24 bytes — nacl.secretbox.nonceLength)
  ciphertext: string; // base64
}

export const DEFAULT_ITERATIONS = 600_000;
const SALT_LENGTH = 16;
const MIN_PASSPHRASE_LENGTH = 8;

/** Returns a human-readable error if the passphrase is unacceptable, else null. */
export function validatePassphrase(passphrase: string): string | null {
  if (passphrase.length < MIN_PASSPHRASE_LENGTH)
    return `Passphrase must be at least ${MIN_PASSPHRASE_LENGTH} characters.`;
  if (/^\s+$/.test(passphrase))
    return "Passphrase cannot be only whitespace.";
  return null;
}

/**
 * Derive a 32-byte master key from a passphrase and salt using PBKDF2.
 * Async because Web Crypto's PBKDF2 is promise-based; it also uses
 * native implementations that are substantially faster than a JS fallback.
 */
export async function deriveMasterKey(
  passphrase: string,
  salt: Uint8Array,
  iterations: number = DEFAULT_ITERATIONS,
): Promise<Uint8Array> {
  const subtle = getSubtle();
  // Web Crypto's `BufferSource` param is typed as `ArrayBufferView<ArrayBuffer>`
  // in lib.dom.d.ts, but our helpers return Uint8Array<ArrayBufferLike>. The
  // casts are TS-only — the runtime bytes are identical.
  const baseKey = await subtle.importKey(
    "raw",
    utf8encode(passphrase) as BufferSource,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    nacl.secretbox.keyLength * 8,
  );
  const out = freshBytes(nacl.secretbox.keyLength);
  out.set(new Uint8Array(bits));
  return out;
}

/**
 * Wrap a plaintext base64-encoded key. The plaintext representation is
 * the same base64 string shape we use in the unwrapped `secretKey`
 * column, so callers don't need to know about byte-level details.
 */
export function wrap(
  plaintextB64: string,
  masterKey: Uint8Array,
  salt: Uint8Array,
  iterations: number = DEFAULT_ITERATIONS,
): WrappedBlob {
  const nonce = randomBytes(nacl.secretbox.nonceLength);
  const plaintextBytes = b64decode(plaintextB64);
  const box = nacl.secretbox(plaintextBytes, nonce, masterKey);
  return {
    v: 1,
    kdf: "pbkdf2-sha256",
    iterations,
    salt: b64encode(salt),
    nonce: b64encode(nonce),
    ciphertext: b64encode(box),
  };
}

/**
 * Unwrap a blob. Returns the plaintext base64 on success, or `null`
 * if authentication fails (wrong passphrase, truncation, corruption).
 */
export function unwrap(blob: WrappedBlob, masterKey: Uint8Array): string | null {
  // Corruption/truncation must surface as null, not a throw (Round-4
  // review): `b64decode` (atob) throws on invalid base64 and
  // `secretbox.open` throws on a wrong-length nonce/key. `unlockSession`
  // calls this with no try/catch, so an uncaught throw crashed the
  // whole unlock path instead of reading as `wrong_passphrase`. The
  // docstring already promises null on corruption — honor it.
  try {
    const nonce = b64decode(blob.nonce);
    const ct = b64decode(blob.ciphertext);
    const plaintext = nacl.secretbox.open(ct, nonce, masterKey);
    if (!plaintext) return null;
    return b64encode(plaintext);
  } catch {
    return null;
  }
}

export function newSalt(): Uint8Array {
  return randomBytes(SALT_LENGTH);
}

export function saltFromBlob(blob: WrappedBlob): Uint8Array {
  return b64decode(blob.salt);
}

function getSubtle(): SubtleCrypto {
  if (typeof crypto !== "undefined" && crypto.subtle) return crypto.subtle;
  throw new Error(
    "This runtime does not expose Web Crypto. Passphrase protection requires a modern browser.",
  );
}
