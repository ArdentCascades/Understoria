/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  canonicalInviteRevocationPayload,
  generateKeyPair,
  parseInviteRevocation,
  sign,
  verifyInviteRevocation,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  InviteRevocation,
  InviteRevocationPayload,
} from "@understoria/shared/types";

// The InviteRevocation crypto surface — docs/invite-revocation.md §3.
// Single-signer: the inviter over {token, inviterKey, revokedAt,
// nodeId}. The authority binding (matching a redeemed invite) is a
// merge-layer concern, not part of the signature.

function makeRevocation(opts: {
  inviter?: KeyPair;
  token?: string;
  revokedAt?: number;
} = {}): { revocation: InviteRevocation; inviter: KeyPair } {
  const inviter = opts.inviter ?? generateKeyPair();
  const payload: InviteRevocationPayload = {
    token: opts.token ?? `tok_${Math.random().toString(36).slice(2)}`,
    inviterKey: inviter.publicKey,
    revokedAt: opts.revokedAt ?? Date.now(),
    nodeId: "node_test",
  };
  return {
    revocation: {
      ...payload,
      signature: sign(
        canonicalInviteRevocationPayload(payload),
        inviter.secretKey,
      ),
    },
    inviter,
  };
}

describe("canonicalInviteRevocationPayload", () => {
  it("is stable regardless of argument-object key order", () => {
    const inviter = generateKeyPair();
    const a: InviteRevocationPayload = {
      token: "tok_1",
      inviterKey: inviter.publicKey,
      revokedAt: 1_700_000_000_000,
      nodeId: "node_test",
    };
    const b = {
      nodeId: "node_test",
      revokedAt: 1_700_000_000_000,
      inviterKey: inviter.publicKey,
      token: "tok_1",
    } as InviteRevocationPayload;
    expect(canonicalInviteRevocationPayload(a)).toBe(
      canonicalInviteRevocationPayload(b),
    );
  });
});

describe("verifyInviteRevocation", () => {
  it("verifies a properly signed revocation", () => {
    const { revocation } = makeRevocation();
    expect(verifyInviteRevocation(revocation)).toBe(true);
  });

  it("rejects a tampered token (signature breaks)", () => {
    const { revocation } = makeRevocation();
    expect(
      verifyInviteRevocation({ ...revocation, token: "tok_other" }),
    ).toBe(false);
  });

  it("rejects a signature by a key other than inviterKey", () => {
    const { revocation } = makeRevocation();
    const stranger = generateKeyPair();
    expect(
      verifyInviteRevocation({
        ...revocation,
        signature: sign(
          canonicalInviteRevocationPayload(revocation),
          stranger.secretKey,
        ),
      }),
    ).toBe(false);
  });

  it("rejects an empty signature", () => {
    const { revocation } = makeRevocation();
    expect(verifyInviteRevocation({ ...revocation, signature: "" })).toBe(
      false,
    );
  });
});

describe("parseInviteRevocation", () => {
  it("accepts a well-shaped revocation", () => {
    const { revocation } = makeRevocation();
    const parsed = parseInviteRevocation(
      JSON.parse(JSON.stringify(revocation)),
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value).toEqual(revocation);
  });

  it("rejects a non-object body and missing fields", () => {
    expect(parseInviteRevocation("nope").ok).toBe(false);
    const { revocation } = makeRevocation();
    const { token: _t, ...rest } = revocation;
    expect(parseInviteRevocation(rest).ok).toBe(false);
  });

  it("rejects a non-integer or far-future revokedAt", () => {
    const { revocation } = makeRevocation();
    expect(parseInviteRevocation({ ...revocation, revokedAt: 1.5 }).ok).toBe(
      false,
    );
    expect(
      parseInviteRevocation({
        ...revocation,
        revokedAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
      }).ok,
    ).toBe(false);
  });
});
