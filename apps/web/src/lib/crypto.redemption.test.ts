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
  canonicalInvitePayload,
  canonicalRedemptionPayload,
  generateKeyPair,
  parseRedemption,
  sign,
  verifyRedemptionReceipt,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  RedemptionPayload,
  RedemptionReceipt,
  SignedInvite,
} from "@understoria/shared/types";

// The RedemptionReceipt crypto surface — Phase 1 of
// docs/invite-redemption.md §6. Two independently verifiable
// attestations in one record: the inviter's signed invite (embedded
// verbatim) and the new member's outer signature over the whole
// payload.

function makeSignedInvite(opts: {
  inviter?: KeyPair;
  createdAt?: number;
  expiresAt?: number;
} = {}): { invite: SignedInvite; inviter: KeyPair } {
  const inviter = opts.inviter ?? generateKeyPair();
  const createdAt = opts.createdAt ?? Date.now();
  const payload = {
    token: `tok_${Math.random().toString(36).slice(2)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Rosa",
    nodeId: "node_test",
    createdAt,
    expiresAt: opts.expiresAt ?? createdAt + 14 * 24 * 60 * 60 * 1000,
  };
  return {
    invite: {
      ...payload,
      signature: sign(canonicalInvitePayload(payload), inviter.secretKey),
    },
    inviter,
  };
}

function makeReceipt(opts: {
  invite?: SignedInvite;
  redeemer?: KeyPair;
  displayName?: string;
  redeemedAt?: number;
} = {}): { receipt: RedemptionReceipt; redeemer: KeyPair } {
  const invite = opts.invite ?? makeSignedInvite().invite;
  const redeemer = opts.redeemer ?? generateKeyPair();
  const payload: RedemptionPayload = {
    invite,
    redeemedBy: redeemer.publicKey,
    displayName: opts.displayName ?? "Newcomer",
    redeemedAt: opts.redeemedAt ?? Date.now(),
  };
  return {
    receipt: {
      ...payload,
      signature: sign(canonicalRedemptionPayload(payload), redeemer.secretKey),
    },
    redeemer,
  };
}

describe("canonicalRedemptionPayload", () => {
  it("produces stable output regardless of argument-object key order", () => {
    const { invite } = makeSignedInvite();
    const redeemer = generateKeyPair();
    const a: RedemptionPayload = {
      invite,
      redeemedBy: redeemer.publicKey,
      displayName: "Newcomer",
      redeemedAt: 1_700_000_000_000,
    };
    // Same fields, deliberately scrambled declaration order — and a
    // scrambled embedded invite, which a transport is free to reorder.
    const scrambledInvite = JSON.parse(
      JSON.stringify({
        signature: invite.signature,
        expiresAt: invite.expiresAt,
        token: invite.token,
        createdAt: invite.createdAt,
        nodeId: invite.nodeId,
        inviterName: invite.inviterName,
        inviterKey: invite.inviterKey,
      }),
    ) as SignedInvite;
    const b = {
      redeemedAt: 1_700_000_000_000,
      displayName: "Newcomer",
      invite: scrambledInvite,
      redeemedBy: redeemer.publicKey,
    } as RedemptionPayload;
    expect(canonicalRedemptionPayload(a)).toBe(canonicalRedemptionPayload(b));
  });

  it("covers the embedded invite's signature (the receipt attests to the exact signed invite)", () => {
    const { invite } = makeSignedInvite();
    const redeemer = generateKeyPair();
    const base: RedemptionPayload = {
      invite,
      redeemedBy: redeemer.publicKey,
      displayName: "Newcomer",
      redeemedAt: 1_700_000_000_000,
    };
    const swapped: RedemptionPayload = {
      ...base,
      invite: { ...invite, signature: "different" },
    };
    expect(canonicalRedemptionPayload(base)).not.toBe(
      canonicalRedemptionPayload(swapped),
    );
  });
});

describe("verifyRedemptionReceipt", () => {
  it("verifies a properly double-signed receipt", () => {
    const { receipt } = makeReceipt();
    expect(verifyRedemptionReceipt(receipt)).toBe(true);
  });

  it("rejects a tampered displayName (outer signature breaks)", () => {
    const { receipt } = makeReceipt({ displayName: "Newcomer" });
    expect(
      verifyRedemptionReceipt({ ...receipt, displayName: "Impostor" }),
    ).toBe(false);
  });

  it("rejects a tampered embedded invite (inner signature breaks), even when the outer signature honestly covers the forgery", () => {
    const { invite } = makeSignedInvite();
    const forged: SignedInvite = { ...invite, inviterName: "Not Rosa" };
    const { receipt } = makeReceipt({ invite: forged });
    // Outer signature is genuine over the forged payload…
    expect(verifyRedemptionReceipt(receipt)).toBe(false);
  });

  it("rejects an outer signature made by a key other than redeemedBy", () => {
    const { receipt } = makeReceipt();
    const stranger = generateKeyPair();
    const resigned: RedemptionReceipt = {
      ...receipt,
      signature: sign(canonicalRedemptionPayload(receipt), stranger.secretKey),
    };
    expect(verifyRedemptionReceipt(resigned)).toBe(false);
  });

  it("rejects a self-redeem receipt (redeemedBy === inviterKey)", () => {
    const inviter = generateKeyPair();
    const { invite } = makeSignedInvite({ inviter });
    const { receipt } = makeReceipt({ invite, redeemer: inviter });
    expect(verifyRedemptionReceipt(receipt)).toBe(false);
  });

  it("rejects a redeemedAt past the invite's expiry", () => {
    const now = Date.now();
    const { invite } = makeSignedInvite({
      createdAt: now - 15 * 24 * 60 * 60 * 1000,
      expiresAt: now - 60 * 60 * 1000,
    });
    const { receipt } = makeReceipt({ invite, redeemedAt: now });
    expect(verifyRedemptionReceipt(receipt)).toBe(false);
  });

  it("rejects an empty signature", () => {
    const { receipt } = makeReceipt();
    expect(verifyRedemptionReceipt({ ...receipt, signature: "" })).toBe(false);
  });
});

describe("parseRedemption", () => {
  it("accepts a well-shaped receipt", () => {
    const { receipt } = makeReceipt();
    const parsed = parseRedemption(JSON.parse(JSON.stringify(receipt)));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value).toEqual(receipt);
    }
  });

  it("rejects a non-object body", () => {
    expect(parseRedemption("nope").ok).toBe(false);
    expect(parseRedemption(null).ok).toBe(false);
  });

  it("rejects a missing embedded invite", () => {
    const { receipt } = makeReceipt();
    const { invite: _invite, ...rest } = receipt;
    const parsed = parseRedemption(rest);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toMatch(/invite/);
  });

  it("rejects an invite missing its signature", () => {
    const { receipt } = makeReceipt();
    const parsed = parseRedemption({
      ...receipt,
      invite: { ...receipt.invite, signature: "" },
    });
    expect(parsed.ok).toBe(false);
  });

  it("rejects a displayName over 60 characters or blank", () => {
    const { receipt } = makeReceipt();
    expect(
      parseRedemption({ ...receipt, displayName: "x".repeat(61) }).ok,
    ).toBe(false);
    expect(parseRedemption({ ...receipt, displayName: "   " }).ok).toBe(
      false,
    );
  });

  it("rejects a non-integer or future redeemedAt", () => {
    const { receipt } = makeReceipt();
    expect(parseRedemption({ ...receipt, redeemedAt: 1.5 }).ok).toBe(false);
    expect(
      parseRedemption({
        ...receipt,
        redeemedAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
      }).ok,
    ).toBe(false);
  });
});
