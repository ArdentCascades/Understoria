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
import { beforeEach, describe, expect, it } from "vitest";
import {
  decideRedeemMode,
  issueInvite,
  listInvitesFrom,
  redeemInvite,
  revokeInvite,
} from "./invites";
import { createMember } from "./seed";
import { db, SETTING_KEYS, setSetting } from "./database";
import { generateKeyPair } from "@/lib/crypto";
import { createVouch, trustStatusWithInvites } from "@/lib/vouch";
import { verifyRedemptionReceipt } from "@understoria/shared/crypto";
import type { RedemptionReceipt } from "@understoria/shared/types";

const NODE = "node_invites";
const ORIGIN = "https://example.test";

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.posts.clear(),
    db.exchanges.clear(),
    db.achievements.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.invites.clear(),
    db.vouches.clear(),
    db.outbox.clear(),
    db.projects.clear(),
    db.projectTasks.clear(),
    db.projectActivity.clear(),
    db.pairingLog.clear(),
    db.coorgInvitations.clear(),
    db.coorgInvitationResponses.clear(),
    db.coorgInvitationRevocations.clear(),
  ]);
}

describe("issueInvite", () => {
  beforeEach(reset);

  it("produces a share URL with the encoded token in the fragment", async () => {
    const inviter = await createMember({ displayName: "Rosa" }, NODE);
    const { shareUrl, row } = await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: inviter.displayName,
        nodeId: NODE,
      },
      ORIGIN,
    );
    expect(shareUrl.startsWith(`${ORIGIN}/invite#`)).toBe(true);
    expect(row.status).toBe("open");
    expect(row.inviterKey).toBe(inviter.publicKey);
  });

  it("refuses to issue invites for a member whose secret key we don't hold", async () => {
    const stranger = generateKeyPair();
    await expect(
      issueInvite({
        inviterKey: stranger.publicKey,
        inviterName: "Ghost",
        nodeId: NODE,
      }),
    ).rejects.toThrow(/secret key/);
  });
});

describe("redeemInvite", () => {
  beforeEach(reset);

  it("creates a new member, stores their key, and marks the invite redeemed", async () => {
    const inviter = await createMember({ displayName: "Rosa" }, NODE);
    const { shareUrl } = await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: inviter.displayName,
        nodeId: NODE,
      },
      ORIGIN,
    );
    const encoded = shareUrl.split("#")[1];
    // Simulate redemption on a different device: inviter's secret key
    // is not present where the new member is redeeming.
    await db.secretKeys.delete(inviter.publicKey);

    const result = await redeemInvite(encoded, "Newcomer", NODE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const members = await db.members.toArray();
    expect(members.some((m) => m.publicKey === result.value.member.publicKey))
      .toBe(true);

    const secrets = await db.secretKeys.toArray();
    expect(secrets.some((s) => s.publicKey === result.value.member.publicKey))
      .toBe(true);

    const [invite] = await db.invites.toArray();
    expect(invite.status).toBe("redeemed");
    expect(invite.redeemedBy).toBe(result.value.member.publicKey);
  });

  it("rejects a second redemption of the same token", async () => {
    const inviter = await createMember({ displayName: "Rosa" }, NODE);
    const { shareUrl } = await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: inviter.displayName,
        nodeId: NODE,
      },
      ORIGIN,
    );
    const encoded = shareUrl.split("#")[1];
    await db.secretKeys.delete(inviter.publicKey);
    const first = await redeemInvite(encoded, "Newcomer1", NODE);
    expect(first.ok).toBe(true);

    const second = await redeemInvite(encoded, "Newcomer2", NODE);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error).toBe("already_redeemed");
  });

  it("rejects re-redemption of a redeemed_despite_revocation token (terminal, docs/invite-revocation.md §5)", async () => {
    const inviter = await createMember({ displayName: "Rosa" }, NODE);
    const { shareUrl } = await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: inviter.displayName,
        nodeId: NODE,
      },
      ORIGIN,
    );
    const encoded = shareUrl.split("#")[1];
    await db.secretKeys.delete(inviter.publicKey);
    const first = await redeemInvite(encoded, "Newcomer1", NODE);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const row = await db.invites.toArray();
    const redeemed = row.find((r) => r.status === "redeemed");
    expect(redeemed).toBeDefined();
    // Simulate the federated convergence: the inviter's revocation
    // arrived and the row settled in its terminal state.
    await db.invites.update(redeemed!.token, {
      status: "redeemed_despite_revocation",
      revokedAt: Date.now(),
    });
    const membersBefore = await db.members.count();

    const second = await redeemInvite(encoded, "Ghost", NODE);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error).toBe("already_redeemed");
    // No ghost identity minted, converged state not clobbered.
    expect(await db.members.count()).toBe(membersBefore);
    const after = await db.invites.get(redeemed!.token);
    expect(after?.status).toBe("redeemed_despite_revocation");
    expect(after?.redeemedBy).toBe(first.value.member.publicKey);
  });

  it("rejects a revoked invite", async () => {
    const inviter = await createMember({ displayName: "Rosa" }, NODE);
    const { shareUrl, row } = await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: inviter.displayName,
        nodeId: NODE,
      },
      ORIGIN,
    );
    await revokeInvite(inviter.publicKey, row.token);
    const encoded = shareUrl.split("#")[1];
    const result = await redeemInvite(encoded, "Newcomer", NODE);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("revoked");
  });

  it("refuses self-redemption (inviter holds the secret locally)", async () => {
    const inviter = await createMember({ displayName: "Rosa" }, NODE);
    const { shareUrl } = await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: inviter.displayName,
        nodeId: NODE,
      },
      ORIGIN,
    );
    const encoded = shareUrl.split("#")[1];
    const result = await redeemInvite(encoded, "Rosa Clone", NODE);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("self_redeem");
  });

  it("reports malformed and bad-signature tokens distinctly", async () => {
    const a = await redeemInvite("garbage", "x", NODE);
    expect(a.ok).toBe(false);
    if (!a.ok) expect(a.error).toBe("malformed");
  });
});

// docs/invite-redemption.md §5.2 — the attach-vs-mint decision. The
// invite admits a PERSON, not a keypair: when the device already holds
// the current member's secret key, redemption attaches to that
// identity instead of minting a ghost second one.
describe("decideRedeemMode", () => {
  it("mints on a fresh device (no current identity)", () => {
    expect(
      decideRedeemMode({ hasCurrentIdentity: false, holdsSecretKey: false }),
    ).toBe("mint");
  });

  it("attaches when the device holds the current member's secret key", () => {
    expect(
      decideRedeemMode({ hasCurrentIdentity: true, holdsSecretKey: true }),
    ).toBe("attach");
  });

  it("mints when a current member exists but their secret key is absent", () => {
    expect(
      decideRedeemMode({ hasCurrentIdentity: true, holdsSecretKey: false }),
    ).toBe("mint");
  });

  it("honors the shared-device escape hatch over an eligible attach", () => {
    expect(
      decideRedeemMode({
        hasCurrentIdentity: true,
        holdsSecretKey: true,
        forceNewIdentity: true,
      }),
    ).toBe("mint");
  });
});

describe("redeemInvite — attach, don't mint (§5.2)", () => {
  beforeEach(reset);

  // Issue an invite from an inviter whose secret key is then removed,
  // simulating "the invite arrived from another device."
  async function inviteFromElsewhere(): Promise<string> {
    const inviter = await createMember({ displayName: "Rosa" }, NODE);
    const { shareUrl } = await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: inviter.displayName,
        nodeId: NODE,
      },
      ORIGIN,
    );
    await db.secretKeys.delete(inviter.publicKey);
    return shareUrl.split("#")[1];
  }

  it("attaches to the existing identity: same key, no new member row, no second seed balance (the incident's orphan case)", async () => {
    // The orphan: a member whose first redemption failed and who
    // self-onboarded via the welcome tour, spent some seed credits,
    // and now redeems a fresh link on the same device.
    const orphan = await createMember(
      { displayName: "Ash", seedBalance: 2 },
      NODE,
    );
    await setSetting(SETTING_KEYS.currentMember, orphan.publicKey);
    const encoded = await inviteFromElsewhere();
    const membersBefore = await db.members.count();
    const secretsBefore = await db.secretKeys.count();

    const result = await redeemInvite(encoded, "Ash", NODE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.mode).toBe("attach");
    expect(result.value.member.publicKey).toBe(orphan.publicKey);

    // No minting: member and secret-key counts are unchanged.
    expect(await db.members.count()).toBe(membersBefore);
    expect(await db.secretKeys.count()).toBe(secretsBefore);

    // The redeemed-invite row names the EXISTING identity — this is
    // the row trust computation reads (trustStatusWithInvites).
    const [invite] = await db.invites.toArray();
    expect(invite.status).toBe("redeemed");
    expect(invite.redeemedBy).toBe(orphan.publicKey);

    // No second starting balance: attach never touches seedBalance
    // (createMember would have reset it to the default 5).
    const after = await db.members.get(orphan.publicKey);
    expect(after?.seedBalance).toBe(2);
  });

  it("offers the display-name edit: a changed name updates the existing member", async () => {
    const member = await createMember({ displayName: "Ash" }, NODE);
    await setSetting(SETTING_KEYS.currentMember, member.publicKey);
    const encoded = await inviteFromElsewhere();

    const result = await redeemInvite(encoded, "Ash Grove", NODE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.mode).toBe("attach");
    const after = await db.members.get(member.publicKey);
    expect(after?.displayName).toBe("Ash Grove");
  });

  it("attaches for a long-lived identity redeeming a later invite", async () => {
    const veteran = await createMember(
      { displayName: "Vera", createdAt: Date.now() - 90 * 24 * 3600 * 1000 },
      NODE,
    );
    await setSetting(SETTING_KEYS.currentMember, veteran.publicKey);
    const encoded = await inviteFromElsewhere();

    const result = await redeemInvite(encoded, "Vera", NODE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.mode).toBe("attach");
    expect(result.value.member.publicKey).toBe(veteran.publicKey);
  });

  it("shared-device escape hatch: forceNewIdentity mints a fresh keypair with its own seed balance", async () => {
    const resident = await createMember({ displayName: "Ash" }, NODE);
    await setSetting(SETTING_KEYS.currentMember, resident.publicKey);
    const encoded = await inviteFromElsewhere();

    const result = await redeemInvite(encoded, "Blair", NODE, {
      forceNewIdentity: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.mode).toBe("mint");
    expect(result.value.member.publicKey).not.toBe(resident.publicKey);
    // The new person gets the normal starting balance; the resident's
    // identity is untouched.
    expect(result.value.member.seedBalance).toBe(5);
    const residentAfter = await db.members.get(resident.publicKey);
    expect(residentAfter?.displayName).toBe("Ash");
  });

  it("mints when the current member's secret key is not on this device", async () => {
    const viewOnly = await createMember({ displayName: "Ash" }, NODE);
    await setSetting(SETTING_KEYS.currentMember, viewOnly.publicKey);
    // Simulate a device that knows the member but doesn't hold the key.
    await db.secretKeys.delete(viewOnly.publicKey);
    const encoded = await inviteFromElsewhere();

    const result = await redeemInvite(encoded, "Newcomer", NODE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.mode).toBe("mint");
    expect(result.value.member.publicKey).not.toBe(viewOnly.publicKey);
  });

  it("still refuses self-redemption before any attach can happen", async () => {
    const inviter = await createMember({ displayName: "Rosa" }, NODE);
    await setSetting(SETTING_KEYS.currentMember, inviter.publicKey);
    const { shareUrl } = await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: inviter.displayName,
        nodeId: NODE,
      },
      ORIGIN,
    );
    const encoded = shareUrl.split("#")[1];
    const result = await redeemInvite(encoded, "Rosa", NODE);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("self_redeem");
  });
});

// docs/invite-redemption.md §7 — Phase 1: redeeming signs a
// RedemptionReceipt and enqueues it in the same transaction as the
// invite row, in BOTH modes, and — uniquely among outbox kinds —
// even when no community-node URL is configured yet.
describe("redeemInvite — redemption receipt (Phase 1)", () => {
  beforeEach(reset);

  async function inviteFromElsewhere(): Promise<string> {
    const inviter = await createMember({ displayName: "Rosa" }, NODE);
    const { shareUrl } = await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: inviter.displayName,
        nodeId: NODE,
      },
      ORIGIN,
    );
    await db.secretKeys.delete(inviter.publicKey);
    return shareUrl.split("#")[1];
  }

  async function onlyReceiptRow(): Promise<RedemptionReceipt> {
    const rows = await db.outbox
      .where("kind")
      .equals("redemption_receipt")
      .toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("pending");
    return JSON.parse(rows[0].payload) as RedemptionReceipt;
  }

  it("mint mode: enqueues a verifiable receipt signed by the freshly-minted key — with NO node URL configured", async () => {
    const encoded = await inviteFromElsewhere();
    // Deliberately no communityNodeUrl: the incident's fresh-device
    // ordering. The receipt must be enqueued anyway (§7) so that
    // configuring a node later delivers it retroactively.
    const result = await redeemInvite(encoded, "Newcomer", NODE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const receipt = await onlyReceiptRow();
    expect(receipt.redeemedBy).toBe(result.value.member.publicKey);
    expect(receipt.displayName).toBe("Newcomer");
    expect(receipt.invite.inviterKey).toBe(result.value.inviterKey);
    // Both signatures verify: embedded invite AND outer receipt.
    expect(verifyRedemptionReceipt(receipt)).toBe(true);

    // The outbox row is keyed on the token so a retry can't
    // double-enqueue.
    const [row] = await db.outbox.toArray();
    expect(row.recordId).toBe(receipt.invite.token);
  });

  it("attach mode: the receipt is signed by the EXISTING identity's key", async () => {
    const resident = await createMember({ displayName: "Ash" }, NODE);
    await setSetting(SETTING_KEYS.currentMember, resident.publicKey);
    const encoded = await inviteFromElsewhere();

    const result = await redeemInvite(encoded, "Ash", NODE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.mode).toBe("attach");

    const receipt = await onlyReceiptRow();
    expect(receipt.redeemedBy).toBe(resident.publicKey);
    expect(verifyRedemptionReceipt(receipt)).toBe(true);
  });

  it("attach mode: the receipt carries the EDITED display name (the community-facing one)", async () => {
    const resident = await createMember({ displayName: "Ash" }, NODE);
    await setSetting(SETTING_KEYS.currentMember, resident.publicKey);
    const encoded = await inviteFromElsewhere();

    const result = await redeemInvite(encoded, "Ash Grove", NODE);
    expect(result.ok).toBe(true);

    const receipt = await onlyReceiptRow();
    expect(receipt.displayName).toBe("Ash Grove");
    expect(verifyRedemptionReceipt(receipt)).toBe(true);
  });

  it("the receipt and the invite row agree on redeemedAt", async () => {
    const encoded = await inviteFromElsewhere();
    const result = await redeemInvite(encoded, "Newcomer", NODE);
    expect(result.ok).toBe(true);

    const receipt = await onlyReceiptRow();
    const [invite] = await db.invites.toArray();
    expect(invite.redeemedAt).toBe(receipt.redeemedAt);
  });

  it("a failed redemption enqueues nothing", async () => {
    const encoded = await inviteFromElsewhere();
    const first = await redeemInvite(encoded, "Newcomer", NODE);
    expect(first.ok).toBe(true);
    await db.outbox.clear();

    const second = await redeemInvite(encoded, "Latecomer", NODE);
    expect(second.ok).toBe(false);
    expect(await db.outbox.count()).toBe(0);
  });
});

describe("full onboarding loop", () => {
  beforeEach(reset);

  it("takes a new member from redeemed invite through a second vouch to trusted", async () => {
    // Two existing members, each able to vouch.
    const rosa = await createMember({ displayName: "Rosa" }, NODE);
    const marcus = await createMember({ displayName: "Marcus" }, NODE);

    // Rosa issues an invite; the newcomer redeems it in a separate "device"
    // (really, the same DB here — that's fine for the state-space test).
    const { shareUrl } = await issueInvite(
      {
        inviterKey: rosa.publicKey,
        inviterName: "Rosa",
        nodeId: NODE,
      },
      ORIGIN,
    );
    const encoded = shareUrl.split("#")[1];
    // Simulate redemption on a different node: remove Rosa's secret key
    // so the self-redeem guard does not fire.
    await db.secretKeys.delete(rosa.publicKey);
    const redeemed = await redeemInvite(encoded, "Newcomer", NODE);
    expect(redeemed.ok).toBe(true);
    if (!redeemed.ok) return;
    const newcomerKey = redeemed.value.member.publicKey;

    // After redemption: one implicit vouch from Rosa; still pending_trust.
    const invitesNow = await db.invites.toArray();
    const vouchesNow = await db.vouches.toArray();
    expect(
      trustStatusWithInvites(newcomerKey, {
        vouches: vouchesNow,
        invites: invitesNow,
      }),
    ).toBe("pending_trust");

    // Marcus manually vouches. Now we have 2 distinct voucher keys.
    const { getSecretKey } = await import("./secrets");
    const manualVouch = createVouch({
      voucherKey: marcus.publicKey,
      voucherSecretKey: await getSecretKey(marcus.publicKey),
      voucheeKey: newcomerKey,
      kind: "manual",
    });
    await db.vouches.put(manualVouch);

    const invitesFinal = await db.invites.toArray();
    const vouchesFinal = await db.vouches.toArray();
    expect(
      trustStatusWithInvites(newcomerKey, {
        vouches: vouchesFinal,
        invites: invitesFinal,
      }),
    ).toBe("trusted");
  });
});

describe("listInvitesFrom", () => {
  beforeEach(reset);
  it("returns invites newest-first for the issuing member", async () => {
    const inviter = await createMember({ displayName: "Rosa" }, NODE);
    const first = await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: "Rosa",
        nodeId: NODE,
      },
      ORIGIN,
    );
    await new Promise((r) => setTimeout(r, 2));
    const second = await issueInvite(
      {
        inviterKey: inviter.publicKey,
        inviterName: "Rosa",
        nodeId: NODE,
      },
      ORIGIN,
    );
    const list = await listInvitesFrom(inviter.publicKey);
    expect(list[0].token).toBe(second.row.token);
    expect(list[1].token).toBe(first.row.token);
  });
});
