/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import nacl from "tweetnacl";
import { b64encode } from "./bytes";
import { keyFingerprint } from "./keyFingerprint";

describe("keyFingerprint", () => {
  it("is deterministic for the same input", () => {
    const kp = nacl.sign.keyPair();
    const pk = b64encode(kp.publicKey);
    expect(keyFingerprint(pk)).toBe(keyFingerprint(pk));
  });

  it("produces distinct fingerprints for distinct keys", () => {
    // Two real keypairs. Collisions in the 32-bit space are
    // astronomically unlikely; if this ever fails it's a bug, not
    // bad luck.
    const a = b64encode(nacl.sign.keyPair().publicKey);
    const b = b64encode(nacl.sign.keyPair().publicKey);
    expect(keyFingerprint(a)).not.toBe(keyFingerprint(b));
  });

  it("matches the documented format: XXXX XXXX uppercase hex", () => {
    const kp = nacl.sign.keyPair();
    const fp = keyFingerprint(b64encode(kp.publicKey));
    expect(fp).toMatch(/^[0-9A-F]{4} [0-9A-F]{4}$/);
  });

  it("uses the first 4 bytes of the decoded key", () => {
    // Hand-picked bytes so the assertion is obvious.
    // 0xDE 0xAD 0xBE 0xEF -> "DEAD BEEF"
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x00, 0x00]);
    expect(keyFingerprint(b64encode(bytes))).toBe("DEAD BEEF");
  });

  it("throws on malformed base64", () => {
    expect(() => keyFingerprint("not!!!valid$$$base64")).toThrow();
  });

  it("throws on input shorter than 4 bytes after decode", () => {
    const shortBytes = new Uint8Array([0x01, 0x02, 0x03]);
    expect(() => keyFingerprint(b64encode(shortBytes))).toThrow(
      /at least 4 bytes/,
    );
  });

  it("throws on empty input", () => {
    expect(() => keyFingerprint("")).toThrow(/at least 4 bytes/);
  });
});
