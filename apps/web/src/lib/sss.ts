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
import { randomBytes } from "@/lib/bytes";

/**
 * Shamir secret sharing over GF(256) — docs/identity-recovery.md §2.
 *
 * Implemented IN-REPO on purpose (~150 readable lines beats an npm
 * subtree at the threat model's dependency-audit bar, §8.3). The
 * field is GF(2^8) with the AES reduction polynomial x^8+x^4+x^3+x+1
 * (0x11b); shares are computed byte-wise: for each secret byte, a
 * random degree-(k-1) polynomial with that byte as the constant term
 * is evaluated at x = share index (1..n), and reconstruction is
 * Lagrange interpolation at x = 0.
 *
 * Security properties, stated for reviewers:
 *  - PERFECT secrecy below the threshold: any k-1 shares are
 *    information-theoretically independent of the secret (every
 *    candidate secret is exactly as consistent with them). A seized
 *    guardian device leaks nothing about the key itself.
 *  - NO integrity: Shamir cannot detect a wrong or tampered share —
 *    reconstruction just yields a different secret. Callers MUST
 *    verify the reconstructed value against an out-of-band anchor;
 *    the guardian-shard flow checks the derived Ed25519 public key
 *    against the owner's known key, exactly like the recovery kit.
 *  - Coefficients come from the platform CSPRNG (`randomBytes`).
 */

const FIELD = 256;

// exp/log tables over the generator 3 (a primitive element of the
// AES field). exp is doubled so exp[a+b] never needs a mod.
const EXP = new Uint8Array(FIELD * 2);
const LOG = new Uint8Array(FIELD);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    // multiply x by the generator 3 = x * 2 ^ x, with 0x11b reduction
    const x2 = x << 1;
    x = (x2 >= FIELD ? x2 ^ 0x11b : x2) ^ x;
  }
  for (let i = 255; i < FIELD * 2; i++) EXP[i] = EXP[i - 255];
})();

function mul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

function div(a: number, b: number): number {
  if (b === 0) throw new Error("division by zero in GF(256)");
  if (a === 0) return 0;
  return EXP[(LOG[a] + 255 - LOG[b]) % 255];
}

/** Evaluate a polynomial (coefficients low→high) at x via Horner. */
function evalPoly(coeffs: Uint8Array, x: number): number {
  let y = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    y = mul(y, x) ^ coeffs[i];
  }
  return y;
}

export interface Share {
  /** Evaluation point, 1..255. Never 0 (x=0 IS the secret). */
  index: number;
  data: Uint8Array;
}

export const SSS_MIN_THRESHOLD = 2;
export const SSS_MAX_SHARES = 255;

/**
 * Split `secret` into `n` shares, any `k` of which reconstruct it.
 */
export function splitSecret(
  secret: Uint8Array,
  k: number,
  n: number,
): Share[] {
  if (!Number.isInteger(k) || !Number.isInteger(n)) {
    throw new Error("k and n must be integers");
  }
  if (k < SSS_MIN_THRESHOLD) throw new Error(`k must be ≥ ${SSS_MIN_THRESHOLD}`);
  if (n < k) throw new Error("n must be ≥ k");
  if (n > SSS_MAX_SHARES) throw new Error(`n must be ≤ ${SSS_MAX_SHARES}`);
  if (secret.length === 0) throw new Error("secret must be non-empty");

  const shares: Share[] = Array.from({ length: n }, (_, i) => ({
    index: i + 1,
    data: new Uint8Array(secret.length),
  }));

  const coeffs = new Uint8Array(k);
  for (let byte = 0; byte < secret.length; byte++) {
    coeffs[0] = secret[byte];
    // Fresh random coefficients PER BYTE — reusing them across bytes
    // would let two bytes' shares be correlated.
    const rnd = randomBytes(k - 1);
    coeffs.set(rnd, 1);
    for (const share of shares) {
      share.data[byte] = evalPoly(coeffs, share.index);
    }
  }
  return shares;
}

/**
 * Reconstruct the secret from ≥k shares (pass exactly the shares you
 * have; extras beyond the original k are fine and improve nothing).
 * Throws on structurally invalid input; CANNOT detect a wrong or
 * tampered share — verify the result (see module comment).
 */
export function combineShares(shares: readonly Share[]): Uint8Array {
  if (shares.length < SSS_MIN_THRESHOLD) {
    throw new Error("need at least two shares");
  }
  const length = shares[0].data.length;
  const seen = new Set<number>();
  for (const s of shares) {
    if (!Number.isInteger(s.index) || s.index < 1 || s.index > SSS_MAX_SHARES) {
      throw new Error("share index out of range");
    }
    if (seen.has(s.index)) throw new Error("duplicate share index");
    seen.add(s.index);
    if (s.data.length !== length) throw new Error("share length mismatch");
  }

  const secret = new Uint8Array(length);
  for (let byte = 0; byte < length; byte++) {
    let value = 0;
    for (let i = 0; i < shares.length; i++) {
      // Lagrange basis at x=0: Π_{j≠i} x_j / (x_j ⊕ x_i)
      // (subtraction is XOR in GF(2^8)).
      let basis = 1;
      for (let j = 0; j < shares.length; j++) {
        if (j === i) continue;
        basis = mul(
          basis,
          div(shares[j].index, shares[j].index ^ shares[i].index),
        );
      }
      value ^= mul(shares[i].data[byte], basis);
    }
    secret[byte] = value;
  }
  return secret;
}
