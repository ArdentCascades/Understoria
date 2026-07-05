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
    // Two real keypairs. Collisions in the 64-bit space are
    // astronomically unlikely; if this ever fails it's a bug, not
    // bad luck.
    const a = b64encode(nacl.sign.keyPair().publicKey);
    const b = b64encode(nacl.sign.keyPair().publicKey);
    expect(keyFingerprint(a)).not.toBe(keyFingerprint(b));
  });

  it("matches the documented format: XXXX XXXX XXXX XXXX uppercase hex (64-bit)", () => {
    const kp = nacl.sign.keyPair();
    const fp = keyFingerprint(b64encode(kp.publicKey));
    expect(fp).toMatch(/^[0-9A-F]{4} [0-9A-F]{4} [0-9A-F]{4} [0-9A-F]{4}$/);
  });

  it("uses the first 8 bytes of the decoded key", () => {
    // 0xDE 0xAD 0xBE 0xEF 0x01 0x23 0x45 0x67 -> "DEAD BEEF 0123 4567"
    const bytes = new Uint8Array([
      0xde, 0xad, 0xbe, 0xef, 0x01, 0x23, 0x45, 0x67, 0x00, 0x00,
    ]);
    expect(keyFingerprint(b64encode(bytes))).toBe("DEAD BEEF 0123 4567");
  });

  it("throws on malformed base64", () => {
    expect(() => keyFingerprint("not!!!valid$$$base64")).toThrow();
  });

  it("throws on input shorter than 8 bytes after decode", () => {
    const shortBytes = new Uint8Array([0x01, 0x02, 0x03]);
    expect(() => keyFingerprint(b64encode(shortBytes))).toThrow(
      /at least 8 bytes/,
    );
  });

  it("throws on empty input", () => {
    expect(() => keyFingerprint("")).toThrow(/at least 8 bytes/);
  });
});
