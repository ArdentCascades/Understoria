/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import nacl from "tweetnacl";
import {
  decodeEnvelope,
  DEFAULT_EXPIRY_MS,
  encodeEnvelope,
  ENVELOPE_VERSION,
  generateTransferPassphrase,
  PAYLOAD_VERSION,
  unwrapTransfer,
  wrapForTransfer,
  type TransferEnvelope,
  type TransferProfile,
} from "./devicePairing";
import { b64decode, b64encode } from "./bytes";

// Deterministic small wordlist for tests. Production calls feed in
// `@scure/bip39/wordlists/<locale>`; the lib is wordlist-agnostic and
// what matters here is that the picker draws from whatever it's given.
const TEST_WORDLIST: readonly string[] = [
  "apple", "bread", "candle", "drum", "echo", "field",
  "grass", "horse", "ink", "jewel", "kite", "lamp",
  "moon", "nest", "ocean", "pear", "quilt", "river",
  "stone", "tiger", "umbra", "violet", "willow", "xenon",
  "yarn", "zebra", "amber", "basil", "cedar", "dawn",
  "ember",
];

const PROFILE: TransferProfile = {
  displayName: "Test Member",
  skills: ["carpentry", "childcare"],
  availability: "Evenings and weekends",
  availabilityChips: ["weekend_days", "weekday_evenings"],
  locationZone: "test-neighborhood",
};

function freshKeypair() {
  const kp = nacl.sign.keyPair();
  return { secretKey: kp.secretKey, publicKey: kp.publicKey };
}

describe("generateTransferPassphrase", () => {
  it("returns the requested number of space-separated words", () => {
    const p = generateTransferPassphrase(TEST_WORDLIST, 6);
    const words = p.split(" ");
    expect(words).toHaveLength(6);
    for (const w of words) expect(TEST_WORDLIST).toContain(w);
  });

  it("respects the wordCount argument", () => {
    expect(generateTransferPassphrase(TEST_WORDLIST, 1).split(" ")).toHaveLength(1);
    expect(generateTransferPassphrase(TEST_WORDLIST, 12).split(" ")).toHaveLength(12);
  });

  it("produces different passphrases on repeated calls (entropy sanity)", () => {
    const a = generateTransferPassphrase(TEST_WORDLIST, 6);
    const b = generateTransferPassphrase(TEST_WORDLIST, 6);
    // With a 31-word list and 6 words each, the collision probability
    // is ~31^-6 ≈ 1.2e-9. Effectively zero.
    expect(a).not.toBe(b);
  });

  it("throws on an empty wordlist", () => {
    expect(() => generateTransferPassphrase([], 6)).toThrow();
  });

  it("throws on wordCount < 1", () => {
    expect(() => generateTransferPassphrase(TEST_WORDLIST, 0)).toThrow();
  });
});

describe("wrapForTransfer + unwrapTransfer (roundtrip)", () => {
  it("succeeds with the correct passphrase", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const passphrase = generateTransferPassphrase(TEST_WORDLIST, 6);
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase,
    });
    const result = await unwrapTransfer(env, passphrase);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(b64decode(result.payload.secretKey)).toEqual(secretKey);
    expect(b64decode(result.payload.publicKey)).toEqual(publicKey);
    expect(result.payload.profile).toEqual(PROFILE);
    expect(result.payload.v).toBe(PAYLOAD_VERSION);
  });

  it("fails with reason 'wrong_passphrase' when the passphrase doesn't match", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase: "the right passphrase",
    });
    const result = await unwrapTransfer(env, "a completely different passphrase");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("wrong_passphrase");
  });

  it("fails with reason 'expired' when called after the window closes", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const passphrase = "good passphrase";
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase,
      now: 1_000_000,
    });
    // Step past the 5-minute window. expiresAt = 1_000_000 + 5*60*1000.
    const afterExpiry = 1_000_000 + DEFAULT_EXPIRY_MS + 1;
    const result = await unwrapTransfer(env, passphrase, afterExpiry);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("expired");
  });

  it("succeeds at exactly expiresAt and fails 1ms past", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const passphrase = "good passphrase";
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase,
      now: 0,
    });
    // At exactly expiresAt — allow (the > check is strict).
    const atDeadline = await unwrapTransfer(env, passphrase, DEFAULT_EXPIRY_MS);
    expect(atDeadline.ok).toBe(true);
    // One ms past — reject.
    const justAfter = await unwrapTransfer(env, passphrase, DEFAULT_EXPIRY_MS + 1);
    expect(justAfter.ok).toBe(false);
  });

  it("preserves multi-byte UTF-8 in profile fields", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const passphrase = "alpha bravo charlie delta echo foxtrot";
    const profile: TransferProfile = {
      displayName: "María José 🌿",
      skills: ["cocina con ñ", "中文"],
      availability: "Mañanas y fines de semana",
      availabilityChips: ["weekend_days"],
      locationZone: "Vallecas",
    };
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile,
      passphrase,
    });
    const result = await unwrapTransfer(env, passphrase);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.profile).toEqual(profile);
  });
});

describe("wrapForTransfer — input validation", () => {
  it("throws when secretKey is the wrong length", async () => {
    const { publicKey } = freshKeypair();
    await expect(
      wrapForTransfer({
        secretKey: new Uint8Array(32), // should be 64
        publicKey,
        profile: PROFILE,
        passphrase: "test passphrase",
      }),
    ).rejects.toThrow(/secretKey must be/);
  });

  it("throws when publicKey is the wrong length", async () => {
    const { secretKey } = freshKeypair();
    await expect(
      wrapForTransfer({
        secretKey,
        publicKey: new Uint8Array(16), // should be 32
        profile: PROFILE,
        passphrase: "test passphrase",
      }),
    ).rejects.toThrow(/publicKey must be/);
  });
});

describe("unwrapTransfer — error paths", () => {
  it("fails with 'version_mismatch_envelope' when the envelope version is unknown", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase: "test",
    });
    const tampered = { ...env, v: 99 } as unknown as TransferEnvelope;
    const result = await unwrapTransfer(tampered, "test");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("version_mismatch_envelope");
  });

  it("fails with 'malformed_envelope' when base64 fields are invalid", async () => {
    const env: TransferEnvelope = {
      v: ENVELOPE_VERSION,
      salt: "!!!not valid base64!!!",
      nonce: "also bad",
      ciphertext: "bad",
    };
    const result = await unwrapTransfer(env, "test");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(["malformed_envelope", "wrong_passphrase"]).toContain(result.reason);
  });

  it("fails with 'malformed_envelope' when nonce is the wrong size", async () => {
    const env: TransferEnvelope = {
      v: ENVELOPE_VERSION,
      salt: b64encode(new Uint8Array(16)),
      nonce: b64encode(new Uint8Array(8)), // should be 24
      ciphertext: b64encode(new Uint8Array(48)),
    };
    const result = await unwrapTransfer(env, "test");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("malformed_envelope");
  });

  it("fails with 'wrong_passphrase' when the ciphertext is tampered", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase: "test",
    });
    // Flip a byte in the ciphertext.
    const ctBytes = b64decode(env.ciphertext);
    ctBytes[0] ^= 0x01;
    const tampered = { ...env, ciphertext: b64encode(ctBytes) };
    const result = await unwrapTransfer(tampered, "test");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    // The authenticator catches it; from unwrap's perspective the
    // resulting null from secretbox.open is indistinguishable from a
    // wrong passphrase, and that's the right user-facing message.
    expect(result.reason).toBe("wrong_passphrase");
  });

  it("captured envelope is still valid within the 5-minute window (replay sanity)", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const passphrase = "test passphrase";
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase,
      now: 0,
    });
    // A captured envelope CAN be re-unwrapped within the window — the
    // cipher doesn't know how many times it's been read. Replay defense
    // is the 5-min expiry, not the cipher. This test pins that property
    // so a future change that breaks it (e.g., one-time nonces stored
    // server-side) gets caught.
    const r1 = await unwrapTransfer(env, passphrase, 1000);
    const r2 = await unwrapTransfer(env, passphrase, 60_000);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    // But past the window, both fail with 'expired' regardless.
    const r3 = await unwrapTransfer(env, passphrase, DEFAULT_EXPIRY_MS + 1);
    expect(r3.ok).toBe(false);
    if (r3.ok) return;
    expect(r3.reason).toBe("expired");
  });
});

describe("encodeEnvelope + decodeEnvelope", () => {
  it("roundtrips an envelope through base64url", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase: "test",
    });
    const s = encodeEnvelope(env);
    const decoded = decodeEnvelope(s);
    expect(decoded).toEqual(env);
  });

  it("decodeEnvelope returns null for garbage input", () => {
    expect(decodeEnvelope("not base64 !@#")).toBeNull();
    expect(decodeEnvelope("")).toBeNull();
    // Valid base64 but not JSON.
    expect(decodeEnvelope(b64encode(new Uint8Array([1, 2, 3])))).toBeNull();
  });

  it("decodeEnvelope returns null when fields are missing", () => {
    const missingField = b64encode(
      new TextEncoder().encode(JSON.stringify({ v: 1, salt: "x" })),
    );
    expect(decodeEnvelope(missingField)).toBeNull();
  });

  it("decoded envelope is consumable by unwrapTransfer", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const passphrase = "test passphrase";
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase,
    });
    const decoded = decodeEnvelope(encodeEnvelope(env));
    expect(decoded).not.toBeNull();
    if (!decoded) return;
    const result = await unwrapTransfer(decoded, passphrase);
    expect(result.ok).toBe(true);
  });

  it("trims whitespace on decode (paste-from-clipboard tolerance)", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase: "test",
    });
    const s = encodeEnvelope(env);
    expect(decodeEnvelope(`  ${s}\n`)).toEqual(env);
  });
});

describe("block-bundle transfer (docs/blocking.md §14.1)", () => {
  it("carries blocks and previouslyBlocked through the wrap → unwrap roundtrip", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const passphrase = "good passphrase six words alpha";
    const blocks = [
      {
        id: "block_1",
        blockerKey: "alice_key",
        blockedKey: "bob_key",
        createdAt: 1_000,
        hideGovernance: false,
        note: null,
      },
      {
        id: "block_2",
        blockerKey: "alice_key",
        blockedKey: "carol_key",
        createdAt: 2_000,
        hideGovernance: true,
        note: "private memory aid",
      },
    ];
    const previouslyBlocked = [
      {
        id: "history_1",
        blockerKey: "alice_key",
        blockedKey: "dave_key",
        firstBlockedAt: 500,
        lastUnblockedAt: 1_500,
      },
    ];

    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase,
      blocks,
      previouslyBlocked,
    });
    const result = await unwrapTransfer(env, passphrase);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.payload.blocks).toEqual(blocks);
    expect(result.payload.previouslyBlocked).toEqual(previouslyBlocked);
  });

  it("omits blocks / previouslyBlocked fields when callers do not pass them (backward compatibility with pre-PR-C source devices)", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const passphrase = "another good passphrase right here";
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: PROFILE,
      passphrase,
    });
    const result = await unwrapTransfer(env, passphrase);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.blocks).toBeUndefined();
    expect(result.payload.previouslyBlocked).toBeUndefined();
  });

  it("assembleBlocksForTransfer reads scoped rows from Dexie for the given blockerKey", async () => {
    const { db } = await import("@/db/database");
    const { blockMember, unblockMember } = await import("@/db/blocks");
    const { assembleBlocksForTransfer } = await import("./devicePairing");

    await Promise.all([
      db.blocks.clear(),
      db.previouslyBlocked.clear(),
    ]);

    // Alice (the transferring member) has two active blocks and one
    // unblocked-history row.
    await blockMember({
      blockerKey: "alice_key",
      blockedKey: "bob_key",
      hideGovernance: false,
      note: null,
      now: 1_000,
    });
    await blockMember({
      blockerKey: "alice_key",
      blockedKey: "carol_key",
      hideGovernance: true,
      note: "private",
      now: 2_000,
    });
    await blockMember({
      blockerKey: "alice_key",
      blockedKey: "dave_key",
      hideGovernance: false,
      note: null,
      now: 500,
    });
    await unblockMember({
      blockerKey: "alice_key",
      blockedKey: "dave_key",
      now: 1_500,
    });

    // A different member on the same device — their rows must NOT
    // leak into Alice's transfer bundle.
    await blockMember({
      blockerKey: "eve_key",
      blockedKey: "bob_key",
      hideGovernance: false,
      note: "eve's private",
      now: 3_000,
    });

    const bundle = await assembleBlocksForTransfer("alice_key");

    expect(bundle.blocks.map((r) => r.blockedKey).sort()).toEqual(
      ["bob_key", "carol_key"].sort(),
    );
    expect(bundle.blocks.every((r) => r.blockerKey === "alice_key")).toBe(
      true,
    );
    // History includes BOTH the still-active blocks (firstBlockedAt
    // recorded on create) AND the unblocked dave_key row.
    expect(
      bundle.previouslyBlocked.map((r) => r.blockedKey).sort(),
    ).toEqual(["bob_key", "carol_key", "dave_key"].sort());
    expect(
      bundle.previouslyBlocked.every((r) => r.blockerKey === "alice_key"),
    ).toBe(true);
  });
});

describe("envelope sizing (sanity check against design doc §5.4)", () => {
  it("fits in a medium-density QR (under 2900 base64 chars)", async () => {
    const { secretKey, publicKey } = freshKeypair();
    const env = await wrapForTransfer({
      secretKey,
      publicKey,
      profile: {
        displayName: "Longer Name For Realistic Sizing",
        skills: [
          "carpentry",
          "childcare",
          "tech support",
          "transportation",
          "language tutoring",
        ],
        availability: "Most evenings, weekends flexible",
        availabilityChips: [
          "weekday_evenings",
          "weekend_days",
          "weekend_evenings",
        ],
        locationZone: "north-side-near-the-park",
      },
      passphrase: "test passphrase six words long ok",
    });
    const s = encodeEnvelope(env);
    // Design doc §5.4 budgets ~620 chars envelope and notes the QR
    // alphanumeric-encoding ceiling is ~2900. Pin both ends so a
    // future change that bloats the envelope past the QR budget
    // surfaces here rather than at deploy time.
    expect(s.length).toBeLessThan(2900);
    // Some headroom — should comfortably be under 1200.
    expect(s.length).toBeLessThan(1200);
  });
});
