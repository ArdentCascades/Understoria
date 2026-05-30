/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import nacl from "tweetnacl";
import {
  AVATAR_HEX,
  deriveAvatar,
  FALLBACK_SPEC,
  type AvatarFill,
} from "./avatar";

// Generate real Ed25519 public keys for the tests. Reusing the
// same crypto primitive the app uses means the test inputs match
// production reality (32-byte cryptographic-random bytes).
function realKey(): string {
  const { publicKey } = nacl.sign.keyPair();
  return Buffer.from(publicKey).toString("base64");
}

function keyFromBytes(bytes: number[]): string {
  // Pad to 32 bytes so we get a realistic Ed25519-shaped input.
  const padded = [...bytes];
  while (padded.length < 32) padded.push(0);
  return Buffer.from(padded).toString("base64");
}

describe("avatar — deriveAvatar", () => {
  it("is deterministic for the same key", () => {
    const k = realKey();
    expect(deriveAvatar(k)).toEqual(deriveAvatar(k));
    expect(deriveAvatar(k)).toEqual(deriveAvatar(k)); // and again
  });

  it("returns the fallback for empty input", () => {
    expect(deriveAvatar("")).toEqual(FALLBACK_SPEC);
  });

  it("returns the fallback for input that doesn't decode", () => {
    expect(deriveAvatar("@@@not-base64@@@")).toEqual(FALLBACK_SPEC);
  });

  it("returns the fallback for too-short input", () => {
    expect(deriveAvatar("AQID")).toEqual(FALLBACK_SPEC); // 3 bytes
  });

  it("produces different specs for different keys", () => {
    const specs = new Set<string>();
    for (let i = 0; i < 20; i++) {
      specs.add(JSON.stringify(deriveAvatar(realKey())));
    }
    // 20 random keys → expect at least 15 distinct specs (the
    // spec space is large enough that collisions should be rare
    // at this sample size). Loose bound to avoid flakiness.
    expect(specs.size).toBeGreaterThanOrEqual(15);
  });

  it("shape comes from byte 0", () => {
    const all = new Set<string>();
    // Try byte-0 values 0,1,2,3 — should hit all 4 shapes.
    for (const b0 of [0, 1, 2, 3]) {
      const spec = deriveAvatar(keyFromBytes([b0, 0, 0, 0, 0, 0, 0, 0]));
      all.add(spec.shape);
    }
    expect(all.size).toBe(4);
  });

  it("leafCount comes from byte 1, mapped into [3..7]", () => {
    for (let b1 = 0; b1 < 10; b1++) {
      const spec = deriveAvatar(keyFromBytes([0, b1, 0, 0, 0, 0, 0, 0]));
      expect(spec.leafCount).toBeGreaterThanOrEqual(3);
      expect(spec.leafCount).toBeLessThanOrEqual(7);
    }
  });

  it("rotationOffset stays in [-8..8]", () => {
    for (let b7 = 0; b7 < 256; b7++) {
      const spec = deriveAvatar(keyFromBytes([0, 0, 0, 0, 0, 0, 0, b7]));
      expect(spec.rotationOffset).toBeGreaterThanOrEqual(-8);
      expect(spec.rotationOffset).toBeLessThanOrEqual(8);
    }
  });

  it("all-zeros key produces the all-zeros spec, not the fallback", () => {
    // Edge case: a key that's structurally valid but happens to
    // be all zeros. The output should be the deterministic
    // derivation of zeros (canopy-500, sapling, leafCount=3,
    // etc.) rather than the FALLBACK_SPEC which is a different
    // hardcoded sentinel. This matters because if FALLBACK
    // collapsed to "zero-byte input" we'd have a collision
    // between malformed and zero-byte keys.
    const spec = deriveAvatar(keyFromBytes([0, 0, 0, 0, 0, 0, 0, 0]));
    expect(spec.shape).toBe("sapling");
    expect(spec.leafCount).toBe(3);
    expect(spec.branchAngle).toBe(-15);
    expect(spec.fillClass).toBe("canopy-500");
    // The fallback is canopy-600; the all-zeros derivation is
    // canopy-500. They're distinguishable.
    expect(spec).not.toEqual(FALLBACK_SPEC);
  });

  it("a one-bit flip in the input changes at least one spec field", () => {
    // Loose avalanche check. Not a crypto-strict property
    // (modulo arithmetic can hide some changes), but catches
    // regressions where the derivation accidentally only reads
    // one byte.
    const base = keyFromBytes([1, 2, 3, 4, 5, 6, 7, 8]);
    const flipped = keyFromBytes([1, 2, 3, 4, 5, 6, 7, 9]); // last byte +1
    expect(deriveAvatar(base)).not.toEqual(deriveAvatar(flipped));
  });
});

describe("avatar — AVATAR_HEX", () => {
  it("has a hex value for every AvatarFill token", () => {
    const tokens: AvatarFill[] = [
      "canopy-500",
      "canopy-600",
      "canopy-700",
      "moss-500",
      "moss-600",
      "moss-700",
      "bark-500",
      "bark-600",
    ];
    for (const tok of tokens) {
      expect(AVATAR_HEX[tok]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
