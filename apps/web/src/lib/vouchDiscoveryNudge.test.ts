/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { generateKeyPair } from "./crypto";
import { createVouch } from "./vouch";
import {
  dismissVouchDiscoveryNudge,
  isVouchDiscoveryNudgeDismissed,
  memberHasVouchedForSomeone,
  memberIsTrusted,
} from "./vouchDiscoveryNudge";
import { db, SETTING_KEYS } from "@/db/database";
import type { InviteRow } from "@/db/database";

function makeManualVouch(voucherSk: {
  publicKey: string;
  secretKey: string;
}, voucheeKey: string) {
  return createVouch({
    voucherKey: voucherSk.publicKey,
    voucherSecretKey: voucherSk.secretKey,
    voucheeKey,
    kind: "manual",
  });
}

describe("memberIsTrusted", () => {
  it("is false for a null member key", () => {
    expect(memberIsTrusted(null, [], [])).toBe(false);
  });

  it("is false when the member has no vouches", () => {
    const me = generateKeyPair();
    expect(memberIsTrusted(me.publicKey, [], [])).toBe(false);
  });

  it("is false with only one distinct voucher (below the trust threshold)", () => {
    const me = generateKeyPair();
    const v1 = generateKeyPair();
    const vouches = [makeManualVouch(v1, me.publicKey)];
    expect(memberIsTrusted(me.publicKey, vouches, [])).toBe(false);
  });

  it("is true once two distinct vouchers have vouched for the member", () => {
    const me = generateKeyPair();
    const v1 = generateKeyPair();
    const v2 = generateKeyPair();
    const vouches = [
      makeManualVouch(v1, me.publicKey),
      makeManualVouch(v2, me.publicKey),
    ];
    expect(memberIsTrusted(me.publicKey, vouches, [])).toBe(true);
  });

  it("counts a redeemed invite + one manual vouch as trusted", () => {
    const me = generateKeyPair();
    const inviter = generateKeyPair();
    const buddy = generateKeyPair();
    const invites: InviteRow[] = [
      {
        token: "tok",
        inviterKey: inviter.publicKey,
        nodeId: "n",
        createdAt: 0,
        expiresAt: 0,
        status: "redeemed",
        redeemedBy: me.publicKey,
        redeemedAt: 1,
        encoded: "",
      },
    ];
    const vouches = [makeManualVouch(buddy, me.publicKey)];
    expect(memberIsTrusted(me.publicKey, vouches, invites)).toBe(true);
  });
});

describe("memberHasVouchedForSomeone", () => {
  it("is false when no vouches exist", () => {
    const me = generateKeyPair();
    expect(memberHasVouchedForSomeone(me.publicKey, [])).toBe(false);
  });

  it("is false when this member never authored a vouch", () => {
    const me = generateKeyPair();
    const other = generateKeyPair();
    const third = generateKeyPair();
    // `other` vouched for `third`; `me` has done nothing.
    expect(
      memberHasVouchedForSomeone(me.publicKey, [
        makeManualVouch(other, third.publicKey),
      ]),
    ).toBe(false);
  });

  it("is true when this member has authored at least one valid vouch", () => {
    const me = generateKeyPair();
    const them = generateKeyPair();
    expect(
      memberHasVouchedForSomeone(me.publicKey, [
        makeManualVouch(me, them.publicKey),
      ]),
    ).toBe(true);
  });

  it("ignores tampered vouches that fail signature verification", () => {
    const me = generateKeyPair();
    const them = generateKeyPair();
    const other = generateKeyPair();
    const valid = makeManualVouch(me, them.publicKey);
    // Forge a row that claims `me` authored it but the signature
    // is over the original `them` payload — verifyVouch must reject.
    const forged = { ...valid, voucherKey: other.publicKey };
    expect(memberHasVouchedForSomeone(other.publicKey, [forged])).toBe(false);
  });
});

describe("dismissVouchDiscoveryNudge / isVouchDiscoveryNudgeDismissed", () => {
  beforeEach(async () => {
    await db.settings.delete(SETTING_KEYS.vouchDiscoveryNudgeDismissed);
  });

  it("starts undismissed", async () => {
    expect(await isVouchDiscoveryNudgeDismissed()).toBe(false);
  });

  it("returns true after dismiss is called", async () => {
    await dismissVouchDiscoveryNudge();
    expect(await isVouchDiscoveryNudgeDismissed()).toBe(true);
  });

  it("persists the sentinel literally — non-'1' values do not count as dismissed", async () => {
    await db.settings.put({
      key: SETTING_KEYS.vouchDiscoveryNudgeDismissed,
      value: "yes",
    });
    expect(await isVouchDiscoveryNudgeDismissed()).toBe(false);
  });

  it("persists across reads — once dismissed, stays dismissed in the same session", async () => {
    await dismissVouchDiscoveryNudge();
    expect(await isVouchDiscoveryNudgeDismissed()).toBe(true);
    // Second read — still dismissed (the row was actually written,
    // not cached in memory).
    expect(await isVouchDiscoveryNudgeDismissed()).toBe(true);
  });
});
