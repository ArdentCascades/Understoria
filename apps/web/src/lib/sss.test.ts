/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { combineShares, splitSecret } from "./sss";

const secret = () =>
  Uint8Array.from({ length: 64 }, (_, i) => (i * 37 + 11) % 256);

describe("Shamir over GF(256)", () => {
  it("round-trips for the k/n shapes the guardian flow allows", () => {
    for (const [k, n] of [
      [2, 2],
      [2, 3],
      [3, 5],
      [4, 7],
    ] as const) {
      const shares = splitSecret(secret(), k, n);
      expect(shares).toHaveLength(n);
      expect(combineShares(shares.slice(0, k))).toEqual(secret());
    }
  });

  it("ANY k-subset reconstructs, not just the first", () => {
    const shares = splitSecret(secret(), 3, 5);
    // every 3-of-5 combination
    for (let a = 0; a < 5; a++)
      for (let b = a + 1; b < 5; b++)
        for (let c = b + 1; c < 5; c++) {
          expect(combineShares([shares[a], shares[b], shares[c]])).toEqual(
            secret(),
          );
        }
  });

  it("extra shares beyond k are harmless", () => {
    const shares = splitSecret(secret(), 3, 5);
    expect(combineShares(shares)).toEqual(secret());
  });

  it("k-1 shares reconstruct GARBAGE, never the secret (and never throw)", () => {
    // Shamir's promise is perfect secrecy below threshold; the
    // observable contract here is that an under-threshold combine
    // yields a wrong value (callers verify against the derived
    // public key).
    const shares = splitSecret(secret(), 3, 5);
    const under = combineShares([shares[0], shares[1]]);
    expect(under).not.toEqual(secret());
  });

  it("a tampered share yields a wrong secret — integrity is the CALLER's job", () => {
    const shares = splitSecret(secret(), 2, 3);
    const evil = {
      index: shares[0].index,
      data: Uint8Array.from(shares[0].data, (b) => b ^ 0xff),
    };
    expect(combineShares([evil, shares[1]])).not.toEqual(secret());
  });

  it("shares carry no plaintext bytes of a low-entropy secret", () => {
    // Not a proof of secrecy (that's the math) — a smoke test that
    // the implementation isn't accidentally embedding the secret.
    const flat = new Uint8Array(32); // all zeros
    const shares = splitSecret(flat, 3, 5);
    for (const s of shares.slice(0, 2)) {
      expect(s.data.every((b) => b === 0)).toBe(false);
    }
  });

  it("rejects invalid parameters and malformed share sets loudly", () => {
    expect(() => splitSecret(secret(), 1, 3)).toThrow(/k must be/);
    expect(() => splitSecret(secret(), 4, 3)).toThrow(/n must be/);
    expect(() => splitSecret(new Uint8Array(0), 2, 3)).toThrow(/non-empty/);
    const shares = splitSecret(secret(), 2, 3);
    expect(() => combineShares([shares[0]])).toThrow(/at least two/);
    expect(() => combineShares([shares[0], shares[0]])).toThrow(/duplicate/);
    expect(() =>
      combineShares([shares[0], { index: 0, data: shares[1].data }]),
    ).toThrow(/out of range/);
    expect(() =>
      combineShares([shares[0], { index: 2, data: new Uint8Array(3) }]),
    ).toThrow(/length mismatch/);
  });
});
