/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// FIPS-180 test vectors plus a Web Crypto cross-check — the history
// matcher and the index generator both depend on this exact output.
import { describe, expect, it } from "vitest";
import { sha256Hex } from "./sha256";

describe("sha256Hex", () => {
  it("matches the FIPS-180 vectors", () => {
    expect(sha256Hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(
      sha256Hex("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"),
    ).toBe(
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    );
  });

  it("agrees with Web Crypto on multi-byte UTF-8", async () => {
    const samples = [
      "ဘာသာပြန်ခြင်း — အချိန်ဘဏ်",
      "a".repeat(200),
      "Comunidad y confianza\n\nentre vecinos",
    ];
    for (const s of samples) {
      const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(s),
      );
      const hex = [...new Uint8Array(buf)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      expect(sha256Hex(s), JSON.stringify(s.slice(0, 20))).toBe(hex);
    }
  });
});
