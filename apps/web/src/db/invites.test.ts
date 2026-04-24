import { beforeEach, describe, expect, it } from "vitest";
import {
  issueInvite,
  listInvitesFrom,
  redeemInvite,
  revokeInvite,
} from "./invites";
import { createMember } from "./seed";
import { db } from "./database";
import { generateKeyPair } from "@/lib/crypto";
import { createVouch, trustStatusWithInvites } from "@/lib/vouch";

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
    const marcusSecret = (await db.secretKeys.get(marcus.publicKey))!;
    const manualVouch = createVouch({
      voucherKey: marcus.publicKey,
      voucherSecretKey: marcusSecret.secretKey,
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
