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
  canonicalInviteRevocationPayload,
  canonicalRedemptionPayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  InviteRevocation,
  RedemptionReceipt,
  SignedInvite,
} from "@understoria/shared/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { vouchersFor } from "./vouch";
import {
  pullFederatedInviteRevocations,
  pullFederatedRedemptions,
} from "./federationSync";

// Phase 1 of docs/invite-revocation.md — the convergence half. The
// terminal state of a revoked-then-redeemed invite must be the SAME on
// every device regardless of the order the receipt and the revocation
// arrive (§5, presence-based commutative merge), and the revocation may
// only act when it is authority-bound to the invite's real inviter
// (§3.1).

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
  token?: string;
} = {}): { invite: SignedInvite; inviter: KeyPair } {
  const inviter = opts.inviter ?? generateKeyPair();
  const createdAt = opts.createdAt ?? Date.now();
  const payload = {
    token: opts.token ?? `tok_${Math.random().toString(36).slice(2)}`,
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

function makeRevocation(opts: {
  inviter: KeyPair;
  token: string;
  nodeId?: string;
  revokedAt?: number;
}): InviteRevocation {
  const payload = {
    token: opts.token,
    inviterKey: opts.inviter.publicKey,
    revokedAt: opts.revokedAt ?? Date.now(),
    nodeId: opts.nodeId ?? "node_test",
  };
  return {
    ...payload,
    signature: sign(
      canonicalInviteRevocationPayload(payload),
      opts.inviter.secretKey,
    ),
  };
}

// Route each pull's fetch to the matching stubbed body by URL path.
function stubFeeds(feeds: {
  redemptions?: Array<RedemptionReceipt & { receivedAt: number }>;
  inviteRevocations?: Array<InviteRevocation & { receivedAt: number }>;
}) {
  const redemptions = feeds.redemptions ?? [];
  const inviteRevocations = feeds.inviteRevocations ?? [];
  const fetchSpy = vi.fn(async (input: unknown) => {
    const url = String(input);
    if (url.includes("/invite-revocations")) {
      return {
        ok: true,
        json: async () => ({
          count: inviteRevocations.length,
          inviteRevocations,
        }),
      };
    }
    return {
      ok: true,
      json: async () => ({ count: redemptions.length, redemptions }),
    };
  });
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
}

describe("pullFederatedInviteRevocations", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("returns null when mirroring is disabled", async () => {
    await setSetting(SETTING_KEYS.communityNodeEnabled, "0");
    expect(await pullFederatedInviteRevocations()).toBeNull();
  });

  it("marks the inviter's revoked row and advances the receivedAt cursor", async () => {
    const inviter = generateKeyPair();
    const { invite } = makeSignedInvite({ inviter });
    // The inviter's device already holds a locally-revoked row.
    await db.invites.put({
      token: invite.token,
      inviterKey: invite.inviterKey,
      nodeId: invite.nodeId,
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt,
      status: "revoked",
      redeemedBy: null,
      redeemedAt: null,
      encoded: "local_encoded",
    });
    const revocation = makeRevocation({
      inviter,
      token: invite.token,
      revokedAt: 5_000,
    });
    stubFeeds({ inviteRevocations: [{ ...revocation, receivedAt: 900 }] });

    const result = await pullFederatedInviteRevocations();
    expect(result).toEqual({ inserted: 1, skipped: 0 });

    const row = await db.invites.get(invite.token);
    expect(row?.status).toBe("revoked");
    expect(row?.revokedAt).toBe(5_000);
    expect(await getSetting(SETTING_KEYS.federationLastInviteRevocationPull)).toBe(
      "900",
    );
  });

  it("ignores a revocation whose inviterKey does not match the local invite (authority binding §3.1)", async () => {
    const realInviter = generateKeyPair();
    const { invite, receipt } = (() => {
      const made = makeSignedInvite({ inviter: realInviter });
      const r = makeReceipt({ invite: made.invite });
      return { invite: made.invite, receipt: r.receipt };
    })();
    // A genuine redemption is already on this device.
    stubFeeds({ redemptions: [{ ...receipt, receivedAt: 100 }] });
    await pullFederatedRedemptions();
    expect((await db.invites.get(invite.token))?.status).toBe("redeemed");

    // A stranger signs a revocation for the same token.
    const stranger = generateKeyPair();
    const forged = makeRevocation({ inviter: stranger, token: invite.token });
    vi.unstubAllGlobals();
    stubFeeds({ inviteRevocations: [{ ...forged, receivedAt: 200 }] });

    const result = await pullFederatedInviteRevocations();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    // The redemption stands; the forged revocation is inert.
    const row = await db.invites.get(invite.token);
    expect(row?.status).toBe("redeemed");
    expect(row?.revokedAt ?? null).toBeNull();
    // Cursor still advances past the (rejected-on-authority) row.
    expect(await getSetting(SETTING_KEYS.federationLastInviteRevocationPull)).toBe(
      "200",
    );
  });

  it("skips a revocation whose signature does not verify without advancing the cursor", async () => {
    const inviter = generateKeyPair();
    const { invite } = makeSignedInvite({ inviter });
    const good = makeRevocation({ inviter, token: invite.token });
    const badToken = `tok_${Math.random().toString(36).slice(2)}`;
    const bad: InviteRevocation = {
      ...makeRevocation({ inviter, token: badToken }),
      signature: "0",
    };
    await db.invites.put({
      token: invite.token,
      inviterKey: invite.inviterKey,
      nodeId: invite.nodeId,
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt,
      status: "revoked",
      redeemedBy: null,
      redeemedAt: null,
      encoded: "local_encoded",
    });
    stubFeeds({
      inviteRevocations: [
        { ...good, receivedAt: 100 },
        { ...bad, receivedAt: 200 },
      ],
    });

    const result = await pullFederatedInviteRevocations();
    expect(result).toEqual({ inserted: 1, skipped: 1 });
    // Cursor stops at the last GOOD row.
    expect(await getSetting(SETTING_KEYS.federationLastInviteRevocationPull)).toBe(
      "100",
    );
  });
});

describe("invite-revocation convergence — both arrival orders reach the same terminal state", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  async function terminalStateFor(order: "receipt-first" | "revocation-first") {
    const inviter = generateKeyPair();
    const { invite } = makeSignedInvite({ inviter });
    const { receipt } = makeReceipt({ invite, displayName: "Marisol" });
    const revocation = makeRevocation({
      inviter,
      token: invite.token,
      nodeId: invite.nodeId,
      revokedAt: 7_777,
    });

    if (order === "receipt-first") {
      stubFeeds({ redemptions: [{ ...receipt, receivedAt: 100 }] });
      await pullFederatedRedemptions();
      vi.unstubAllGlobals();
      stubFeeds({ inviteRevocations: [{ ...revocation, receivedAt: 200 }] });
      await pullFederatedInviteRevocations();
    } else {
      stubFeeds({ inviteRevocations: [{ ...revocation, receivedAt: 100 }] });
      await pullFederatedInviteRevocations();
      vi.unstubAllGlobals();
      stubFeeds({ redemptions: [{ ...receipt, receivedAt: 200 }] });
      await pullFederatedRedemptions();
    }
    return { token: invite.token, redeemer: receipt.redeemedBy };
  }

  it("receipt-first → redeemed_despite_revocation", async () => {
    const { token, redeemer } = await terminalStateFor("receipt-first");
    const row = await db.invites.get(token);
    expect(row?.status).toBe("redeemed_despite_revocation");
    expect(row?.redeemedBy).toBe(redeemer);
    expect(row?.revokedAt).toBe(7_777);
  });

  it("revocation-first → redeemed_despite_revocation (same state, records commute)", async () => {
    const { token, redeemer } = await terminalStateFor("revocation-first");
    const row = await db.invites.get(token);
    expect(row?.status).toBe("redeemed_despite_revocation");
    expect(row?.redeemedBy).toBe(redeemer);
    expect(row?.revokedAt).toBe(7_777);
    // The receipt corrected the placeholder's guessed invite fields.
    expect(row?.encoded).not.toBe("");
  });

  it("re-pulling either record after convergence is a no-op (idempotent)", async () => {
    const inviter = generateKeyPair();
    const { invite } = makeSignedInvite({ inviter });
    const { receipt } = makeReceipt({ invite });
    const revocation = makeRevocation({
      inviter,
      token: invite.token,
      revokedAt: 7_777,
    });
    stubFeeds({ redemptions: [{ ...receipt, receivedAt: 100 }] });
    await pullFederatedRedemptions();
    vi.unstubAllGlobals();
    stubFeeds({ inviteRevocations: [{ ...revocation, receivedAt: 200 }] });
    await pullFederatedInviteRevocations();

    // Reset cursor and replay the revocation — no churn.
    await setSetting(SETTING_KEYS.federationLastInviteRevocationPull, "0");
    vi.unstubAllGlobals();
    stubFeeds({ inviteRevocations: [{ ...revocation, receivedAt: 200 }] });
    const replay = await pullFederatedInviteRevocations();
    expect(replay).toEqual({ inserted: 0, skipped: 1 });
    expect((await db.invites.get(invite.token))?.status).toBe(
      "redeemed_despite_revocation",
    );
  });

  it("Phase 1: the implicit vouch still counts for a redeemed_despite_revocation invite", async () => {
    // Phase 1 behaves as today — trust withdrawal is gated behind a
    // governance ruling (docs/invite-revocation.md §9/§10). So the
    // inviter still counts as a voucher.
    const { token, redeemer } = await terminalStateFor("receipt-first");
    const row = await db.invites.get(token);
    expect(row?.status).toBe("redeemed_despite_revocation");

    const invites = await db.invites.toArray();
    const vouchers = vouchersFor(redeemer, { invites, vouches: [] });
    expect(vouchers.has(row?.inviterKey ?? "")).toBe(true);
  });
});
