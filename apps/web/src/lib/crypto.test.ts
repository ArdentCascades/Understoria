import { describe, expect, it } from "vitest";
import {
  canonicalExchangePayload,
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
