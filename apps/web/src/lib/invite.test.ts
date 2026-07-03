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
import { generateKeyPair, sign } from "./crypto";
import {
  canonicalInvitePayload,
  createInvite,
  decodeAndVerifyInvite,
  encodeInviteToken,
  extractInviteToken,
} from "./invite";

describe("createInvite + decodeAndVerifyInvite", () => {
  it("round-trips a valid invite", () => {
    const kp = generateKeyPair();
    const invite = createInvite({
      inviterKey: kp.publicKey,
      inviterSecretKey: kp.secretKey,
      inviterName: "Rosa",
      nodeId: "node_x",
    });
    const encoded = encodeInviteToken(invite);
    const result = decodeAndVerifyInvite(encoded);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.invite.inviterKey).toBe(kp.publicKey);
      expect(result.invite.inviterName).toBe("Rosa");
    }
  });

  it("rejects a malformed token", () => {
    const r = decodeAndVerifyInvite("not-a-valid-token");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("malformed");
  });

  it("rejects an expired invite", () => {
    const kp = generateKeyPair();
    const invite = createInvite({
      inviterKey: kp.publicKey,
      inviterSecretKey: kp.secretKey,
      inviterName: "R",
      nodeId: "node_x",
      now: 1000,
      expiresInMs: 10,
    });
    const encoded = encodeInviteToken(invite);
    const r = decodeAndVerifyInvite(encoded, 10_000);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("expired");
  });

  it("rejects a tampered invite (different inviterName)", () => {
    const kp = generateKeyPair();
    const invite = createInvite({
      inviterKey: kp.publicKey,
      inviterSecretKey: kp.secretKey,
      inviterName: "Rosa",
      nodeId: "node_x",
    });
    const tampered = { ...invite, inviterName: "Attacker" };
    const encoded = encodeInviteToken(tampered);
    const r = decodeAndVerifyInvite(encoded);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("bad_signature");
  });

  it("rejects an invite signed by the wrong key", () => {
    const kp1 = generateKeyPair();
    const kp2 = generateKeyPair();
    const base = createInvite({
      inviterKey: kp1.publicKey,
      inviterSecretKey: kp1.secretKey,
      inviterName: "Rosa",
      nodeId: "node_x",
    });
    // Re-sign with a different key while keeping inviterKey as kp1.
    const spoofed = {
      ...base,
      signature: sign(canonicalInvitePayload(base), kp2.secretKey),
    };
    const r = decodeAndVerifyInvite(encodeInviteToken(spoofed));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("bad_signature");
  });
});

// The paste-the-link recovery extractor (docs/invite-redemption.md
// §5.1.1). The incident vector: messenger in-app browsers strip or
// mangle the #fragment of a tapped invite link; pasting the original
// message restores it. The extractor must therefore cope with full
// URLs, whole messages, bare tokens, and whitespace — and reject
// pastes with nothing token-shaped in them.
describe("extractInviteToken", () => {
  // A realistic token: what encodeInviteToken actually produces.
  function realToken(): string {
    const kp = generateKeyPair();
    return encodeInviteToken(
      createInvite({
        inviterKey: kp.publicKey,
        inviterSecretKey: kp.secretKey,
        inviterName: "Rosa",
        nodeId: "node_x",
      }),
    );
  }

  it("extracts the fragment from a full invite URL", () => {
    const token = realToken();
    expect(
      extractInviteToken(`https://aid.example.org/invite#${token}`),
    ).toBe(token);
  });

  it("finds the link inside a whole pasted message", () => {
    const token = realToken();
    const message = `hey! join us here: https://aid.example.org/invite#${token} — see you Saturday`;
    expect(extractInviteToken(message)).toBe(token);
  });

  it("accepts a bare token, with or without the leading #", () => {
    const token = realToken();
    expect(extractInviteToken(token)).toBe(token);
    expect(extractInviteToken(`#${token}`)).toBe(token);
  });

  it("tolerates surrounding whitespace and a line break after the #", () => {
    const token = realToken();
    expect(extractInviteToken(`  ${token}\n`)).toBe(token);
    expect(
      extractInviteToken(`https://aid.example.org/invite#\n${token}`),
    ).toBe(token);
  });

  it("round-trips: an extracted token still decodes and verifies", () => {
    const kp = generateKeyPair();
    const invite = createInvite({
      inviterKey: kp.publicKey,
      inviterSecretKey: kp.secretKey,
      inviterName: "Rosa",
      nodeId: "node_x",
    });
    const url = `https://aid.example.org/invite#${encodeInviteToken(invite)}`;
    const token = extractInviteToken(`Invite: ${url}`);
    expect(token).not.toBeNull();
    const result = decodeAndVerifyInvite(token!);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.invite.token).toBe(invite.token);
  });

  it("returns null for empty, whitespace-only, and token-free pastes", () => {
    expect(extractInviteToken("")).toBeNull();
    expect(extractInviteToken("   \n ")).toBeNull();
    expect(extractInviteToken("see you saturday!")).toBeNull();
    // A URL whose fragment is too short to be an invite blob.
    expect(
      extractInviteToken("https://example.org/docs#s3"),
    ).toBeNull();
    // A URL with no fragment at all — the mangled-link case itself.
    expect(
      extractInviteToken("https://aid.example.org/invite"),
    ).toBeNull();
  });
});
