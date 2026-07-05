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
import { b64decode } from "./bytes";

/** Bytes of the public key rendered into the fingerprint. */
const FINGERPRINT_BYTES = 8;

/**
 * Short human-readable fingerprint of an Ed25519 public key.
 *
 * Shape: 16 uppercase hex characters, grouped `XXXX XXXX XXXX XXXX`.
 *
 * Why 8 bytes / 64 bits (Round-4 review)? This is the member's eyeball
 * check that the device they just paired holds the intended identity —
 * "do these two numbers match?". It is the ONLY defense against a
 * mid-flow QR swap: the downstream `publickey_mismatch` check in
 * `unwrapTransfer` only confirms the envelope's secretKey and publicKey
 * are a consistent PAIR — an attacker who supplies their OWN valid
 * keypair passes it trivially, so it does NOT catch a swap. That makes
 * the fingerprint load-bearing, and a 32-bit prefix was grindable
 * offline (~2^32 keygens to forge a matching prefix given the victim's
 * public key). 64 bits pushes a pre-grinding attack out of practical
 * reach while still reading aloud in one breath.
 *
 * Threats mitigated:
 *   - Mistaken pairing — the wrong QR at a table full of devices. The
 *     numbers won't match.
 *   - Social-engineering / MITM swap — an attacker substitutes their
 *     own envelope. They cannot cheaply produce a key whose 64-bit
 *     fingerprint matches the one the source device is showing.
 *
 * Mirrors Signal's safety-number convention in shape (hex groups,
 * monospace), shorter because our threat model is in-room (the QR is
 * read locally, once) rather than a per-conversation network MITM.
 *
 * Throws on invalid base64 input or a public key shorter than
 * `FINGERPRINT_BYTES` after decode. Callers should already have
 * validated the input (e.g. via `nacl.sign.publicKeyLength`) — the
 * throws are defence-in-depth, not the primary validation path.
 */
export function keyFingerprint(publicKeyBase64: string): string {
  const bytes = b64decode(publicKeyBase64);
  if (bytes.length < FINGERPRINT_BYTES) {
    throw new Error(
      `keyFingerprint: public key must be at least ${FINGERPRINT_BYTES} bytes, got ${bytes.length}`,
    );
  }
  let hex = "";
  for (let i = 0; i < FINGERPRINT_BYTES; i++) {
    hex += bytes[i].toString(16).padStart(2, "0").toUpperCase();
  }
  // 16 hex chars → four groups of four.
  return hex.replace(/(.{4})(?=.)/g, "$1 ");
}
