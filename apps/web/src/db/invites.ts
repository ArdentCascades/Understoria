import { db, type InviteRow } from "./database";
import { createMember } from "./seed";
import { generateKeyPair } from "@/lib/crypto";
import {
  createInvite,
  decodeAndVerifyInvite,
  encodeInviteToken,
} from "@/lib/invite";
import type { Member } from "@/types";

export interface IssueInviteInput {
  inviterKey: string;
  inviterName: string;
  nodeId: string;
  expiresInMs?: number;
}

export interface IssuedInvite {
  row: InviteRow;
  /**
   * Convenience URL built against the current origin. Callers in tests
   * can ignore this; the UI uses it to populate a share dialog.
   */
  shareUrl: string;
}

export async function issueInvite(
  input: IssueInviteInput,
  origin: string = typeof window !== "undefined"
    ? window.location.origin
    : "",
): Promise<IssuedInvite> {
  const secret = await db.secretKeys.get(input.inviterKey);
  if (!secret) {
    throw new Error(
      "You can only issue invites from a device that holds your secret key.",
    );
  }
  const signed = createInvite({
    inviterKey: input.inviterKey,
    inviterSecretKey: secret.secretKey,
    inviterName: input.inviterName,
    nodeId: input.nodeId,
    expiresInMs: input.expiresInMs,
  });
  const encoded = encodeInviteToken(signed);
  const row: InviteRow = {
    token: signed.token,
    inviterKey: signed.inviterKey,
    nodeId: signed.nodeId,
    createdAt: signed.createdAt,
    expiresAt: signed.expiresAt,
    status: "open",
    redeemedBy: null,
    redeemedAt: null,
    encoded,
  };
  await db.invites.put(row);
  return {
    row,
    shareUrl: `${origin}/invite#${encoded}`,
  };
}

export async function listInvitesFrom(
  inviterKey: string,
): Promise<InviteRow[]> {
  return db.invites
    .where("inviterKey")
    .equals(inviterKey)
    .reverse()
    .sortBy("createdAt");
}

export async function revokeInvite(
  inviterKey: string,
  token: string,
): Promise<void> {
  const row = await db.invites.get(token);
  if (!row) throw new Error("Invite not found on this node.");
  if (row.inviterKey !== inviterKey)
    throw new Error("Only the issuing member can revoke this invite.");
  if (row.status === "redeemed")
    throw new Error("A redeemed invite cannot be revoked.");
  await db.invites.put({ ...row, status: "revoked" });
}

export type RedeemError =
  | "malformed"
  | "expired"
  | "bad_signature"
  | "already_redeemed"
  | "revoked"
  | "self_redeem";

export interface RedeemSuccess {
  member: Member;
  inviterKey: string;
  inviterName: string;
}

export type RedeemResult =
  | { ok: true; value: RedeemSuccess }
  | { ok: false; error: RedeemError };

/**
 * Redeem a signed invite token on this node.
 *
 * Trust model: a redeemed invite is itself the first implicit vouch for
 * the new member — the inviter's signed invite cryptographically attests
 * to their intent to admit a token-holder. The `invites` table row (with
 * status='redeemed') is the persisted proof. A second vouch, recorded in
 * the `vouches` table by a different trusted member, is what promotes a
 * member from `pending_trust` to `trusted` (see lib/vouch.ts).
 *
 * Redemption consumes the invite on *this* node only. In a federated
 * deployment, redemption status is gossiped between peers so a
 * compromised token shared twice fails the second time on any synced
 * node. That work lives with Agent 3.
 */
export async function redeemInvite(
  encoded: string,
  displayName: string,
  nodeId: string,
): Promise<RedeemResult> {
  const parsed = decodeAndVerifyInvite(encoded);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const { invite } = parsed;

  const existing = await db.invites.get(invite.token);
  if (existing) {
    if (existing.status === "redeemed") {
      return { ok: false, error: "already_redeemed" };
    }
    if (existing.status === "revoked") {
      return { ok: false, error: "revoked" };
    }
  }

  // The inviter must not redeem their own invite — this protects against
  // a compromised device being used to inflate a trust graph.
  const ownSecret = await db.secretKeys.get(invite.inviterKey);
  if (ownSecret) {
    return { ok: false, error: "self_redeem" };
  }

  const kp = generateKeyPair();
  const member = await createMember(
    { publicKey: kp.publicKey, displayName },
    nodeId,
  );
  // createMember skips secret-key generation when a publicKey is supplied,
  // so we persist it explicitly.
  await db.secretKeys.put({
    publicKey: kp.publicKey,
    secretKey: kp.secretKey,
  });

  await db.invites.put({
    token: invite.token,
    inviterKey: invite.inviterKey,
    nodeId: invite.nodeId,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
    status: "redeemed",
    redeemedBy: kp.publicKey,
    redeemedAt: Date.now(),
    encoded,
  });

  return {
    ok: true,
    value: {
      member,
      inviterKey: invite.inviterKey,
      inviterName: invite.inviterName,
    },
  };
}
