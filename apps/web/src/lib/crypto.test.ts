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
import { describe, expect, it } from "vitest";
import {
  canonicalExchangePayload,
  conversationId,
  decryptMessage,
  deriveEncryptionKeyPair,
  encryptMessage,
  generateKeyPair,
  sign,
  verify,
  verifyExchange,
} from "./crypto";
import type { Exchange } from "@/types";

describe("generateKeyPair", () => {
  it("produces two distinct 32/64-byte base64 keys", () => {
    const a = generateKeyPair();
    const b = generateKeyPair();
    expect(a.publicKey).not.toEqual(b.publicKey);
    expect(a.secretKey).not.toEqual(b.secretKey);
    // base64 of 32-byte public key is 44 chars with padding.
    expect(a.publicKey).toHaveLength(44);
    // base64 of 64-byte Ed25519 secret key is 88 chars.
    expect(a.secretKey).toHaveLength(88);
  });
});

describe("sign / verify", () => {
  it("verifies a signature made with the matching key", () => {
    const kp = generateKeyPair();
    const sig = sign("hello world", kp.secretKey);
    expect(verify("hello world", sig, kp.publicKey)).toBe(true);
  });

  it("rejects a signature made with a different key", () => {
    const kp1 = generateKeyPair();
    const kp2 = generateKeyPair();
    const sig = sign("hello", kp1.secretKey);
    expect(verify("hello", sig, kp2.publicKey)).toBe(false);
  });

  it("rejects a signature over a tampered message", () => {
    const kp = generateKeyPair();
    const sig = sign("original", kp.secretKey);
    expect(verify("tampered", sig, kp.publicKey)).toBe(false);
  });

  it("returns false rather than throwing on malformed input", () => {
    expect(verify("m", "not-base64-!!!", "also-garbage-!!!")).toBe(false);
  });
});

describe("canonicalExchangePayload", () => {
  it("produces stable output regardless of argument-object key order", () => {
    const a = canonicalExchangePayload({
      postId: "p",
      helperKey: "h",
      helpedKey: "H",
      hours: 1,
      category: "other",
      completedAt: 100,
    });
    const b = canonicalExchangePayload({
      completedAt: 100,
      category: "other",
      hours: 1,
      helpedKey: "H",
      helperKey: "h",
      postId: "p",
    });
    expect(a).toBe(b);
  });
});

describe("verifyExchange", () => {
  it("verifies a properly-signed exchange independently", () => {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const payload = canonicalExchangePayload({
      postId: "p1",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hours: 2,
      category: "transport",
      completedAt: 12345,
    });
    const exchange: Exchange = {
      id: "e1",
      postId: "p1",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hoursExchanged: 2,
      helperSignature: sign(payload, helper.secretKey),
      helpedSignature: sign(payload, helped.secretKey),
      completedAt: 12345,
      category: "transport",
      nodeId: "node_x",
    };
    expect(verifyExchange(exchange)).toBe(true);
  });

  it("rejects an exchange whose hours were forged after signing", () => {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const payload = canonicalExchangePayload({
      postId: "p1",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hours: 2,
      category: "transport",
      completedAt: 12345,
    });
    const exchange: Exchange = {
      id: "e1",
      postId: "p1",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hoursExchanged: 200, // tampered
      helperSignature: sign(payload, helper.secretKey),
      helpedSignature: sign(payload, helped.secretKey),
      completedAt: 12345,
      category: "transport",
      nodeId: "node_x",
    };
    expect(verifyExchange(exchange)).toBe(false);
  });

  it("rejects when only one party's signature is valid", () => {
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const attacker = generateKeyPair();
    const payload = canonicalExchangePayload({
      postId: "p1",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hours: 1,
      category: "other",
      completedAt: 1,
    });
    const exchange: Exchange = {
      id: "e1",
      postId: "p1",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hoursExchanged: 1,
      helperSignature: sign(payload, helper.secretKey),
      helpedSignature: sign(payload, attacker.secretKey), // forged
      completedAt: 1,
      category: "other",
      nodeId: "node_x",
    };
    expect(verifyExchange(exchange)).toBe(false);
  });
});

describe("E2E messaging", () => {
  // Generate three keypairs for testing
  const alice = generateKeyPair();
  const bob = generateKeyPair();
  const carol = generateKeyPair();

  describe("encryptMessage / decryptMessage roundtrip", () => {
    it("encrypts and decrypts a message between two parties", () => {
      const encrypted = encryptMessage("hello bob", alice.secretKey, bob.publicKey);
      expect(encrypted.nonce).toBeTruthy();
      expect(encrypted.ciphertext).toBeTruthy();
      expect(encrypted.ciphertext).not.toBe("hello bob");
      const plain = decryptMessage(encrypted, bob.secretKey, alice.publicKey);
      expect(plain).toBe("hello bob");
    });

    it("sender can also decrypt their own message", () => {
      const encrypted = encryptMessage("hello bob", alice.secretKey, bob.publicKey);
      const plain = decryptMessage(encrypted, alice.secretKey, bob.publicKey);
      expect(plain).toBe("hello bob");
    });
  });

  it("returns null when decrypting with the wrong key", () => {
    const encrypted = encryptMessage("secret", alice.secretKey, bob.publicKey);
    const plain = decryptMessage(encrypted, carol.secretKey, alice.publicKey);
    expect(plain).toBeNull();
  });

  it("returns null when ciphertext is tampered", () => {
    const encrypted = encryptMessage("secret", alice.secretKey, bob.publicKey);
    // Flip one character in the base64 ciphertext
    const tampered = {
      ...encrypted,
      ciphertext: encrypted.ciphertext.slice(0, -2) + "AA",
    };
    const plain = decryptMessage(tampered, bob.secretKey, alice.publicKey);
    expect(plain).toBeNull();
  });

  it("returns null when nonce is tampered", () => {
    const encrypted = encryptMessage("secret", alice.secretKey, bob.publicKey);
    const tampered = {
      ...encrypted,
      nonce: encrypted.nonce.slice(0, -2) + "AA",
    };
    const plain = decryptMessage(tampered, bob.secretKey, alice.publicKey);
    expect(plain).toBeNull();
  });

  it("handles Unicode content (emoji, CJK)", () => {
    const text = "Solidarity forever! ✊🌿 互助";
    const encrypted = encryptMessage(text, alice.secretKey, bob.publicKey);
    const plain = decryptMessage(encrypted, bob.secretKey, alice.publicKey);
    expect(plain).toBe(text);
  });

  it("handles empty string", () => {
    const encrypted = encryptMessage("", alice.secretKey, bob.publicKey);
    const plain = decryptMessage(encrypted, bob.secretKey, alice.publicKey);
    expect(plain).toBe("");
  });

  describe("deriveEncryptionKeyPair", () => {
    it("returns 32-byte keys", () => {
      const kp = deriveEncryptionKeyPair(alice.secretKey);
      expect(kp.publicKey.length).toBe(32);
      expect(kp.secretKey.length).toBe(32);
    });
  });

  describe("conversationId", () => {
    it("is deterministic and order-independent", () => {
      const ab = conversationId(alice.publicKey, bob.publicKey);
      const ba = conversationId(bob.publicKey, alice.publicKey);
      expect(ab).toBe(ba);
      expect(ab).toContain("|");
    });

    it("differs for different pairs", () => {
      const ab = conversationId(alice.publicKey, bob.publicKey);
      const ac = conversationId(alice.publicKey, carol.publicKey);
      expect(ab).not.toBe(ac);
    });
  });
});
