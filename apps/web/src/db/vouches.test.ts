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
import { db, SETTING_KEYS, setSetting } from "./database";
import { createMember } from "./seed";
import { addManualVouch, VouchValidationError } from "./vouches";
import { verifyVouch } from "@/lib/vouch";

const NODE = "node_vouches_test";

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.vouches.clear(),
    db.outbox.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
  ]);
}

describe("addManualVouch", () => {
  beforeEach(reset);

  it("persists a signed vouch and returns it", async () => {
    const voucher = await createMember({ displayName: "V" }, NODE);
    const vouchee = await createMember({ displayName: "X" }, NODE);
    const vouch = await addManualVouch({
      voucherKey: voucher.publicKey,
      voucheeKey: vouchee.publicKey,
    });
    expect(vouch.voucherKey).toBe(voucher.publicKey);
    expect(vouch.voucheeKey).toBe(vouchee.publicKey);
    expect(vouch.kind).toBe("manual");
    expect(verifyVouch(vouch)).toBe(true);
    const stored = await db.vouches.toArray();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(vouch.id);
  });

  it("rejects self-vouching", async () => {
    const m = await createMember({ displayName: "M" }, NODE);
    await expect(
      addManualVouch({ voucherKey: m.publicKey, voucheeKey: m.publicKey }),
    ).rejects.toBeInstanceOf(VouchValidationError);
  });

  it("rejects a duplicate (same voucher + vouchee pair)", async () => {
    const voucher = await createMember({ displayName: "V" }, NODE);
    const vouchee = await createMember({ displayName: "X" }, NODE);
    await addManualVouch({
      voucherKey: voucher.publicKey,
      voucheeKey: vouchee.publicKey,
    });
    await expect(
      addManualVouch({
        voucherKey: voucher.publicKey,
        voucheeKey: vouchee.publicKey,
      }),
    ).rejects.toBeInstanceOf(VouchValidationError);
  });

  it("enqueues an outbox row when a community node is configured", async () => {
    const voucher = await createMember({ displayName: "V" }, NODE);
    const vouchee = await createMember({ displayName: "X" }, NODE);
    await setSetting(SETTING_KEYS.communityNodeUrl, "https://node.example");
    await addManualVouch({
      voucherKey: voucher.publicKey,
      voucheeKey: vouchee.publicKey,
    });
    const outbox = await db.outbox.toArray();
    expect(outbox).toHaveLength(1);
    expect(outbox[0].kind).toBe("vouch");
    expect(outbox[0].status).toBe("pending");
  });

  it("does NOT enqueue when no community node URL is set", async () => {
    const voucher = await createMember({ displayName: "V" }, NODE);
    const vouchee = await createMember({ displayName: "X" }, NODE);
    await addManualVouch({
      voucherKey: voucher.publicKey,
      voucheeKey: vouchee.publicKey,
    });
    expect(await db.outbox.count()).toBe(0);
  });
});
