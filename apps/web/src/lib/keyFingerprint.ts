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

/**
 * Short human-readable fingerprint of an Ed25519 public key.
 *
 * Shape: 8 uppercase hex characters, grouped `XXXX XXXX` (one space).
 *
 * Why 4 bytes / 32 bits? This fingerprint is for human-eye verification
 * — "are these two devices the same identity" — not for cryptographic
 * identity matching. The cryptographic check already happens inside
 * `unwrapTransfer`'s `publickey_mismatch` path (see
 * `lib/devicePairing.ts`), which constant-time-compares the embedded
 * publicKey against the one derived from the secretKey.
 *
 * The threats this string mitigates are:
 *   - Mistaken pairing — at a workshop with several devices on tables,
 *     a member could scan the wrong QR. The numbers won't match.
 *   - Social-engineering swap — an attacker swaps a different QR in
 *     mid-flow. The numbers won't match what the source is showing.
 *
 * Both of those are caught reliably by 32 bits at human glance-speed:
 * collisions in the 4-billion space won't show up by accident, and an
 * attacker who needed to grind out a colliding identity to fool the
 * eyeball check would still fail the cryptographic check downstream
 * (publickey_mismatch). 32 bits is the smallest size that's both
 * short enough to read aloud in one breath AND large enough that
 * accidental collisions don't matter.
 *
 * Mirrors Signal's safety-number convention in shape (hex pairs,
 * monospace) but is much shorter — Signal's 60-digit number protects
 * against a network-MITM adversary on every conversation. Our threat
 * model is in-room (the QR is read locally) and the cryptographic
 * check is separate, so a glance-sized hint is the right tool.
 *
 * Throws on invalid base64 input or on a public key shorter than 4
 * bytes after decode. Callers should already have validated the
 * input (e.g. via `nacl.sign.publicKeyLength` checks) — the throws
 * are defence-in-depth, not the primary validation path.
 */
export function keyFingerprint(publicKeyBase64: string): string {
  const bytes = b64decode(publicKeyBase64);
  if (bytes.length < 4) {
    throw new Error(
      `keyFingerprint: public key must be at least 4 bytes, got ${bytes.length}`,
    );
  }
  let hex = "";
  for (let i = 0; i < 4; i++) {
    hex += bytes[i].toString(16).padStart(2, "0").toUpperCase();
  }
  return `${hex.slice(0, 4)} ${hex.slice(4, 8)}`;
}
