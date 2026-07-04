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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  canonicalInvitePayload,
  canonicalRedemptionPayload,
  canonicalVouchPayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  RedemptionReceipt,
  SignedInvite,
  SignedVouch,
} from "@understoria/shared/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import {
  pullFederatedRedemptions,
  pullFederatedVouches,
} from "./federationSync";

// Phase 1 of docs/invite-redemption.md — the node→device leg for
// redemption receipts (§6 merge rules, §7 receivedAt cursor) and the
// §9 companion vouch pull.

async function reset() {
  await Promise.all([
    db.invites.clear(),
    db.members.clear(),
    db.vouches.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
  ]);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
}

function makeSignedInvite(opts: {
  inviter?: KeyPair;
  createdAt?: number;
} = {}): { invite: SignedInvite; inviter: KeyPair } {
  const inviter = opts.inviter ?? generateKeyPair();
  const createdAt = opts.createdAt ?? Date.now();
  const payload = {
    token: `tok_${Math.random().toString(36).slice(2)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Rosa",
    nodeId: "node_test",
    createdAt,
    expiresAt: createdAt + 14 * 24 * 60 * 60 * 1000,
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
  const payload = {
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

function stubRedemptions(
  rows: Array<RedemptionReceipt & { receivedAt: number }>,
) {
  const fetchSpy = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ count: rows.length, redemptions: rows }),
  });
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
}

describe("pullFederatedRedemptions", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("returns null when mirroring is disabled", async () => {
    await setSetting(SETTING_KEYS.communityNodeEnabled, "0");
    expect(await pullFederatedRedemptions()).toBeNull();
  });

  it("materializes the redeemed invite row AND a member row on a device that never saw the invite", async () => {
    const { receipt } = makeReceipt({ displayName: "Marisol" });
    stubRedemptions([{ ...receipt, receivedAt: 1000 }]);

    const result = await pullFederatedRedemptions();
    expect(result).toEqual({ inserted: 1, skipped: 0 });

    const invite = await db.invites.get(receipt.invite.token);
    expect(invite).toMatchObject({
      status: "redeemed",
      redeemedBy: receipt.redeemedBy,
      redeemedAt: receipt.redeemedAt,
      inviterKey: receipt.invite.inviterKey,
    });

    // Roster convergence: the member exists here now, with the
    // chosen name and the same starting-balance constants
    // createMember uses everywhere.
    const member = await db.members.get(receipt.redeemedBy);
    expect(member).toMatchObject({
      displayName: "Marisol",
      seedBalance: 5,
      nodeId: receipt.invite.nodeId,
      createdAt: receipt.redeemedAt,
    });
    // Materialization never mints keys — the skeleton row carries no
    // secret material.
    expect(await db.secretKeys.get(receipt.redeemedBy)).toBeUndefined();

    expect(
      await getSetting(SETTING_KEYS.federationLastRedemptionPull),
    ).toBe("1000");
  });

  it("flips the inviter's local 'open' row to redeemed (the incident's stuck row)", async () => {
    const { receipt } = makeReceipt();
    await db.invites.put({
      token: receipt.invite.token,
      inviterKey: receipt.invite.inviterKey,
      nodeId: receipt.invite.nodeId,
      createdAt: receipt.invite.createdAt,
      expiresAt: receipt.invite.expiresAt,
      status: "open",
      redeemedBy: null,
      redeemedAt: null,
      encoded: "local_encoded",
    });
    stubRedemptions([{ ...receipt, receivedAt: 42 }]);

    const result = await pullFederatedRedemptions();
    expect(result?.inserted).toBe(1);

    const invite = await db.invites.get(receipt.invite.token);
    expect(invite?.status).toBe("redeemed");
    expect(invite?.redeemedBy).toBe(receipt.redeemedBy);
    expect(invite?.redeemedAt).toBe(receipt.redeemedAt);
    // The local row's fields (e.g. the original encoded blob) are
    // preserved — this is an update, not a replace.
    expect(invite?.encoded).toBe("local_encoded");
  });

  it("keeps a revoked row revoked but records redemption-observed (§6 — a conversation, not an ejection)", async () => {
    const { receipt } = makeReceipt();
    await db.invites.put({
      token: receipt.invite.token,
      inviterKey: receipt.invite.inviterKey,
      nodeId: receipt.invite.nodeId,
      createdAt: receipt.invite.createdAt,
      expiresAt: receipt.invite.expiresAt,
      status: "revoked",
      redeemedBy: null,
      redeemedAt: null,
      encoded: "local_encoded",
    });
    stubRedemptions([{ ...receipt, receivedAt: 42 }]);

    await pullFederatedRedemptions();

    const invite = await db.invites.get(receipt.invite.token);
    expect(invite?.status).toBe("revoked");
    // Never a trust edge — vouchersFor only counts status="redeemed".
    expect(invite?.redeemedBy).toBeNull();
    expect(invite?.redemptionObservedAt).toBe(receipt.redeemedAt);
    expect(invite?.redemptionObservedBy).toBe(receipt.redeemedBy);
  });

  it("is idempotent: re-pulling the same receipt changes nothing", async () => {
    const { receipt } = makeReceipt();
    stubRedemptions([{ ...receipt, receivedAt: 1000 }]);
    const first = await pullFederatedRedemptions();
    expect(first).toEqual({ inserted: 1, skipped: 0 });

    // Same rows again (e.g. a cursor reset) — no duplicate members,
    // no row churn.
    vi.unstubAllGlobals();
    stubRedemptions([{ ...receipt, receivedAt: 1000 }]);
    const second = await pullFederatedRedemptions();
    expect(second).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.members.count()).toBe(1);
    expect(await db.invites.count()).toBe(1);
  });

  it("never clobbers a richer local member row with the receipt's skeleton", async () => {
    const redeemer = generateKeyPair();
    // The invitee's own device: her member row carries a later
    // profile edit and real activity.
    await db.members.put({
      publicKey: redeemer.publicKey,
      displayName: "Marisol Rivera",
      skills: ["childcare", "grant writing"],
      availability: "weekends",
      availabilityChips: [],
      seedBalance: 3,
      vouchedBy: [],
      createdAt: 111,
      nodeId: "node_test",
      locationZone: "East neighborhood",
    });
    const { receipt } = makeReceipt({
      redeemer,
      displayName: "Marisol",
    });
    stubRedemptions([{ ...receipt, receivedAt: 1000 }]);

    await pullFederatedRedemptions();

    const member = await db.members.get(redeemer.publicKey);
    expect(member?.displayName).toBe("Marisol Rivera");
    expect(member?.skills).toEqual(["childcare", "grant writing"]);
    expect(member?.seedBalance).toBe(3);
  });

  it("skips a tampered receipt without advancing the cursor past it", async () => {
    const good = makeReceipt().receipt;
    const bad = { ...makeReceipt().receipt, displayName: "Impostor" };
    stubRedemptions([
      { ...good, receivedAt: 100 },
      { ...bad, receivedAt: 200 },
    ]);

    const result = await pullFederatedRedemptions();
    expect(result).toEqual({ inserted: 1, skipped: 1 });
    expect(await db.invites.get(bad.invite.token)).toBeUndefined();
    // Cursor stops at the last GOOD row so a transient upstream bug
    // can't strand the rejected row forever.
    expect(
      await getSetting(SETTING_KEYS.federationLastRedemptionPull),
    ).toBe("100");
  });

  it("keeps the local row when a pulled receipt conflicts with a locally-redeemed one", async () => {
    const { receipt: local } = makeReceipt();
    await db.invites.put({
      token: local.invite.token,
      inviterKey: local.invite.inviterKey,
      nodeId: local.invite.nodeId,
      createdAt: local.invite.createdAt,
      expiresAt: local.invite.expiresAt,
      status: "redeemed",
      redeemedBy: local.redeemedBy,
      redeemedAt: local.redeemedAt,
      encoded: "local_encoded",
    });
    // A different member's receipt for the SAME token — unreachable
    // in practice (server first-writer-wins) but the merge rule is
    // explicit: keep local, log.
    const conflicting = makeReceipt({ invite: local.invite }).receipt;
    stubRedemptions([{ ...conflicting, receivedAt: 7 }]);

    await pullFederatedRedemptions();

    const invite = await db.invites.get(local.invite.token);
    expect(invite?.redeemedBy).toBe(local.redeemedBy);
  });

  it("sends the persisted receivedAt cursor as ?since", async () => {
    await setSetting(SETTING_KEYS.federationLastRedemptionPull, "888");
    const fetchSpy = stubRedemptions([]);
    await pullFederatedRedemptions();
    expect(String(fetchSpy.mock.calls[0][0])).toContain("since=888");
    expect(String(fetchSpy.mock.calls[0][0])).toContain("/redemptions?");
  });
});

describe("pullFederatedVouches", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  function makeVouch(opts: {
    voucher?: KeyPair;
    voucheeKey?: string;
    createdAt?: number;
  } = {}): SignedVouch {
    const voucher = opts.voucher ?? generateKeyPair();
    const payload = {
      voucherKey: voucher.publicKey,
      voucheeKey: opts.voucheeKey ?? generateKeyPair().publicKey,
      createdAt: opts.createdAt ?? Date.now(),
      kind: "manual" as const,
    };
    return {
      id: `v_${Math.random().toString(36).slice(2)}`,
      ...payload,
      signature: sign(canonicalVouchPayload(payload), voucher.secretKey),
    };
  }

  function stubVouches(rows: SignedVouch[]) {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: rows.length, vouches: rows }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    return fetchSpy;
  }

  it("returns null when mirroring is disabled", async () => {
    await setSetting(SETTING_KEYS.communityNodeEnabled, "0");
    expect(await pullFederatedVouches()).toBeNull();
  });

  it("inserts verified vouches and advances the createdAt cursor — trust converges across devices", async () => {
    const v1 = makeVouch({ createdAt: 100 });
    const v2 = makeVouch({ createdAt: 200 });
    stubVouches([v1, v2]);

    const result = await pullFederatedVouches();
    expect(result).toEqual({ inserted: 2, skipped: 0 });
    expect(await db.vouches.get(v1.id)).toMatchObject({
      voucheeKey: v1.voucheeKey,
    });
    expect(await getSetting(SETTING_KEYS.federationLastVouchPull)).toBe(
      "200",
    );
  });

  it("skips a vouch whose signature does not verify", async () => {
    const good = makeVouch({ createdAt: 100 });
    const bad: SignedVouch = { ...makeVouch({ createdAt: 300 }), signature: "0" };
    stubVouches([good, bad]);

    const result = await pullFederatedVouches();
    expect(result).toEqual({ inserted: 1, skipped: 1 });
    expect(await db.vouches.get(bad.id)).toBeUndefined();
    // Bad rows never advance the cursor past themselves.
    expect(await getSetting(SETTING_KEYS.federationLastVouchPull)).toBe(
      "100",
    );
  });

  it("dedups on id across repeated pulls (idempotent — the device's own authored vouches included)", async () => {
    const own = makeVouch({ createdAt: 500 });
    await db.vouches.put(own);
    stubVouches([own]);

    const result = await pullFederatedVouches();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.vouches.count()).toBe(1);
  });

  it("sends the persisted cursor as ?since on subsequent pulls", async () => {
    await setSetting(SETTING_KEYS.federationLastVouchPull, "777");
    const fetchSpy = stubVouches([]);
    await pullFederatedVouches();
    expect(String(fetchSpy.mock.calls[0][0])).toContain("since=777");
    expect(String(fetchSpy.mock.calls[0][0])).toContain("/vouches?");
  });
});
