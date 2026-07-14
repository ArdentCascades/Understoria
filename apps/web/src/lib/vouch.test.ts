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
import { generateKeyPair } from "./crypto";
import {
  createVouch,
  isFounderRoot,
  trustStatus,
  trustStatusWithInvites,
  verifyVouch,
  vouchCountFor,
  vouchersFor,
  vouchesFor,
} from "./vouch";

describe("createVouch + verifyVouch", () => {
  it("creates a vouch that verifies with the voucher's public key", () => {
    const voucher = generateKeyPair();
    const vouchee = generateKeyPair();
    const v = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    expect(verifyVouch(v)).toBe(true);
  });

  it("rejects a tampered vouch", () => {
    const voucher = generateKeyPair();
    const vouchee = generateKeyPair();
    const attacker = generateKeyPair();
    const v = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    const tampered = { ...v, voucheeKey: attacker.publicKey };
    expect(verifyVouch(tampered)).toBe(false);
  });
});

describe("trustStatus", () => {
  const vouchee = generateKeyPair();
  function makeVouch() {
    const voucher = generateKeyPair();
    return createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "invite",
    });
  }

  it("starts as pending_trust with no vouches", () => {
    expect(trustStatus(vouchee.publicKey, [])).toBe("pending_trust");
  });

  it("is still pending_trust with a single vouch", () => {
    expect(trustStatus(vouchee.publicKey, [makeVouch()])).toBe(
      "pending_trust",
    );
  });

  it("becomes trusted with two vouches from distinct keys", () => {
    expect(
      trustStatus(vouchee.publicKey, [makeVouch(), makeVouch()]),
    ).toBe("trusted");
  });

  it("does not count duplicate vouches from the same voucher", () => {
    const voucher = generateKeyPair();
    const a = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
      now: 1,
    });
    const b = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
      now: 2,
    });
    expect(trustStatus(vouchee.publicKey, [a, b])).toBe("pending_trust");
  });

  it("ignores invalid vouches", () => {
    const good = makeVouch();
    const bad = { ...makeVouch(), signature: "x".repeat(88) };
    expect(trustStatus(vouchee.publicKey, [good, bad])).toBe("pending_trust");
  });
});

describe("trustStatusWithInvites", () => {
  const vouchee = generateKeyPair();

  it("treats a redeemed invite as an implicit vouch", () => {
    const inviter = generateKeyPair();
    const invites = [
      {
        status: "redeemed" as const,
        inviterKey: inviter.publicKey,
        redeemedBy: vouchee.publicKey,
      },
    ];
    expect(
      trustStatusWithInvites(vouchee.publicKey, { vouches: [], invites }),
    ).toBe("pending_trust");

    const secondVoucher = generateKeyPair();
    const v = createVouch({
      voucherKey: secondVoucher.publicKey,
      voucherSecretKey: secondVoucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    expect(
      trustStatusWithInvites(vouchee.publicKey, { vouches: [v], invites }),
    ).toBe("trusted");
  });

  it("does not double-count an invite from the same key as a manual vouch", () => {
    const voucher = generateKeyPair();
    const v = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    const invites = [
      {
        status: "redeemed" as const,
        inviterKey: voucher.publicKey,
        redeemedBy: vouchee.publicKey,
      },
    ];
    expect(
      trustStatusWithInvites(vouchee.publicKey, {
        vouches: [v],
        invites,
      }),
    ).toBe("pending_trust");
  });

  it("ignores non-redeemed invites", () => {
    const inviter1 = generateKeyPair();
    const inviter2 = generateKeyPair();
    expect(
      trustStatusWithInvites(vouchee.publicKey, {
        vouches: [],
        invites: [
          {
            status: "open",
            inviterKey: inviter1.publicKey,
            redeemedBy: null,
          },
          {
            status: "revoked",
            inviterKey: inviter2.publicKey,
            redeemedBy: null,
          },
        ],
      }),
    ).toBe("pending_trust");
  });

  it("a founder root is trusted with ZERO vouchers — the bootstrap fix", () => {
    // Without a root, a fresh community deadlocks: the founder has no
    // vouchers, only trusted members can meaningfully vouch, so
    // nobody ever reaches trusted. The node-published root breaks
    // the cycle.
    const founder = generateKeyPair();
    expect(
      trustStatusWithInvites(founder.publicKey, {
        vouches: [],
        invites: [],
        founderRoots: new Set([founder.publicKey]),
      }),
    ).toBe("trusted");
  });

  it("founder roots do not leak trust onto anyone else", () => {
    const founder = generateKeyPair();
    const stranger = generateKeyPair();
    const ctx = {
      vouches: [],
      invites: [],
      founderRoots: new Set([founder.publicKey]),
    };
    expect(trustStatusWithInvites(stranger.publicKey, ctx)).toBe(
      "pending_trust",
    );
    expect(isFounderRoot(founder.publicKey, ctx)).toBe(true);
    expect(isFounderRoot(stranger.publicKey, ctx)).toBe(false);
    // And an absent set behaves exactly as before the feature.
    expect(isFounderRoot(founder.publicKey, {})).toBe(false);
  });
});

describe("vouchesFor", () => {
  it("returns only valid vouches addressed to the given member", () => {
    const vouchee = generateKeyPair();
    const other = generateKeyPair();
    const voucher = generateKeyPair();
    const vouchForOther = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: other.publicKey,
      kind: "manual",
    });
    const vouchForMe = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    const list = vouchesFor(vouchee.publicKey, [vouchForOther, vouchForMe]);
    expect(list).toHaveLength(1);
    expect(list[0].voucheeKey).toBe(vouchee.publicKey);
  });
});

describe("vouchersFor", () => {
  it("returns an empty map when no vouches and no invites", () => {
    const vouchee = generateKeyPair();
    const result = vouchersFor(vouchee.publicKey, { vouches: [], invites: [] });
    expect(result.size).toBe(0);
  });

  it("includes manual vouchers with their createdAt", () => {
    const vouchee = generateKeyPair();
    const voucher = generateKeyPair();
    const v = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
      now: 12345,
    });
    const result = vouchersFor(vouchee.publicKey, {
      vouches: [v],
      invites: [],
    });
    expect(result.size).toBe(1);
    const entry = result.get(voucher.publicKey);
    expect(entry).toEqual({
      voucherKey: voucher.publicKey,
      kind: "manual",
      createdAt: 12345,
    });
  });

  it("includes redeemed-invite vouchers", () => {
    const vouchee = generateKeyPair();
    const inviter = generateKeyPair();
    const result = vouchersFor(vouchee.publicKey, {
      vouches: [],
      invites: [
        {
          status: "redeemed",
          inviterKey: inviter.publicKey,
          redeemedBy: vouchee.publicKey,
        },
      ],
    });
    expect(result.size).toBe(1);
    expect(result.get(inviter.publicKey)?.kind).toBe("invite");
  });

  it("prefers a manual vouch over the same voucher's invite vouch", () => {
    // If A invited B and later signed a manual vouch for B too, the
    // manual one is the stronger signal so we keep that kind.
    const vouchee = generateKeyPair();
    const voucher = generateKeyPair();
    const v = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    const result = vouchersFor(vouchee.publicKey, {
      vouches: [v],
      invites: [
        {
          status: "redeemed",
          inviterKey: voucher.publicKey,
          redeemedBy: vouchee.publicKey,
        },
      ],
    });
    expect(result.size).toBe(1);
    expect(result.get(voucher.publicKey)?.kind).toBe("manual");
  });

  it("ignores invalid signatures, open invites, and other vouchees", () => {
    const vouchee = generateKeyPair();
    const other = generateKeyPair();
    const voucher = generateKeyPair();
    const goodForOther = createVouch({
      voucherKey: voucher.publicKey,
      voucherSecretKey: voucher.secretKey,
      voucheeKey: other.publicKey,
      kind: "manual",
    });
    const result = vouchersFor(vouchee.publicKey, {
      vouches: [goodForOther],
      invites: [
        {
          status: "open",
          inviterKey: voucher.publicKey,
          redeemedBy: null,
        },
      ],
    });
    expect(result.size).toBe(0);
  });
});

describe("vouchCountFor", () => {
  it("returns the distinct voucher count", () => {
    const vouchee = generateKeyPair();
    const voucher1 = generateKeyPair();
    const voucher2 = generateKeyPair();
    const v1 = createVouch({
      voucherKey: voucher1.publicKey,
      voucherSecretKey: voucher1.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    const v2 = createVouch({
      voucherKey: voucher2.publicKey,
      voucherSecretKey: voucher2.secretKey,
      voucheeKey: vouchee.publicKey,
      kind: "manual",
    });
    expect(
      vouchCountFor(vouchee.publicKey, { vouches: [v1, v2], invites: [] }),
    ).toBe(2);
  });
});
