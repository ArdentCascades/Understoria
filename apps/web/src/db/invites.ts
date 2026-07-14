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
import {
  db,
  getSetting,
  setSetting,
  SETTING_KEYS,
  type InviteRow,
} from "./database";
import { createMember } from "./seed";
import { generateKeyPair, sign } from "@/lib/crypto";
import {
  createInvite,
  decodeAndVerifyInvite,
  encodeInviteToken,
} from "@/lib/invite";
import { getSecretKey, persistSecretKey } from "./secrets";
import {
  enqueueInviteRevocationOutbox,
  enqueueRedemptionReceiptOutbox,
  flushOutboxNow,
} from "@/lib/outbox";
import {
  canonicalInviteRevocationPayload,
  canonicalRedemptionPayload,
} from "@understoria/shared/crypto";
import type {
  InviteRevocation,
  RedemptionPayload,
  RedemptionReceipt,
} from "@understoria/shared/types";
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
  let secretKey: string;
  try {
    secretKey = await getSecretKey(input.inviterKey);
  } catch (err) {
    throw new Error(
      (err as Error).message ??
        "You can only issue invites from a device that holds your secret key.",
    );
  }
  const signed = createInvite({
    inviterKey: input.inviterKey,
    inviterSecretKey: secretKey,
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
  if (
    row.status === "redeemed" ||
    row.status === "redeemed_despite_revocation"
  )
    throw new Error("A redeemed invite cannot be revoked.");

  // Sign the revocation BEFORE the transaction — the inviter's key may
  // be passphrase-wrapped and getSecretKey may prompt/unwrap, which
  // must not run inside the Dexie write transaction.
  const secret = await getSecretKey(inviterKey);
  const revokedAt = Date.now();
  const payload = {
    token,
    inviterKey,
    revokedAt,
    nodeId: row.nodeId,
  };
  const revocation: InviteRevocation = {
    ...payload,
    signature: sign(canonicalInviteRevocationPayload(payload), secret),
  };

  // Flip the local row and enqueue the federated revocation atomically,
  // so the inviter's device never ends up "revoked locally but never
  // told anyone" — the exact per-device-divergence bug this closes.
  await db.transaction(
    "rw",
    [db.invites, db.outbox, db.settings, db.inviteRevocationRecords],
    async () => {
      await db.invites.put({ ...row, status: "revoked", revokedAt });
      await enqueueInviteRevocationOutbox(revocation);
      // Re-seed Phase R0: the signed revocation persists beside the
      // flipped row (docs/community-reseed.md §1b).
      await db.inviteRevocationRecords.put(revocation);
    },
  );
  void flushOutboxNow().catch(() => {
    // Errors surface via the outbox worker's own retry path.
  });
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
  /** How the redemption was recorded — attached to an existing
   *  identity, or minted as a fresh one. See decideRedeemMode. */
  mode: RedeemMode;
  /** The community `nodeId` this device adopted as part of the redeem,
   *  or `undefined` if nothing changed. Present only when a brand-new
   *  member minted on a fresh device took on the inviter's community id
   *  (see the adoption block in `redeemInvite`). The caller uses it to
   *  update the in-session nodeId so the Dashboard's node-scoped stats
   *  reflect the community immediately, without a reload. */
  nodeId?: string;
}

export type RedeemResult =
  | { ok: true; value: RedeemSuccess }
  | { ok: false; error: RedeemError };

export type RedeemMode = "attach" | "mint";

export interface RedeemOptions {
  /** Shared-device escape hatch (`docs/invite-redemption.md` §5.2):
   *  the accept screen's "I'm someone else — create a new identity"
   *  action. Forces a fresh keypair even when this device already
   *  holds an identity. */
  forceNewIdentity?: boolean;
}

/**
 * Attach or mint? (`docs/invite-redemption.md` §5.2.)
 *
 * The invite's semantics are "the inviter admits the token-holder" —
 * the token-holder is a PERSON, not a keypair. When the device already
 * holds the current member's secret key, redemption ATTACHES the
 * invite to that identity: no new keypair, no new member row, no
 * second seed-credit balance. This is what rescues the incident
 * sequence (failed redemption → orphan self-onboarded identity →
 * fresh link → redeem) from producing a ghost second identity, and it
 * closes the accumulate-identities-for-seed-credits path.
 *
 * Mint stays the default on a fresh device, and stays one tap away on
 * shared devices via `forceNewIdentity`. A current member whose secret
 * key is NOT on this device (e.g. a view-only oddity) cannot attach —
 * in Phase 1 the redemption receipt must be signed by the attached
 * key, and semantically the device doesn't hold that person.
 */
export function decideRedeemMode(input: {
  hasCurrentIdentity: boolean;
  holdsSecretKey: boolean;
  forceNewIdentity?: boolean;
}): RedeemMode {
  if (input.forceNewIdentity) return "mint";
  return input.hasCurrentIdentity && input.holdsSecretKey
    ? "attach"
    : "mint";
}

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
 * Identity: on a device that already holds the current member's secret
 * key the invite ATTACHES to that identity (see decideRedeemMode);
 * only fresh devices — or the explicit shared-device escape hatch —
 * mint a new keypair. `docs/invite-redemption.md` §5.2.
 *
 * Redemption consumes the invite on *this* node — and, since Phase 1
 * of `docs/invite-redemption.md` (§6–§7), signs a `RedemptionReceipt`
 * with the redeeming member's key (both modes) and enqueues it for
 * the community node in the same transaction that writes the invite
 * row. The receipt is what flips the inviter's row open→redeemed on
 * her next pull, materializes the member on every device's roster,
 * and lets the server enforce single-use across devices
 * (first-writer-wins on the token). The receipt is enqueued even
 * when no node URL is configured yet — see
 * `enqueueRedemptionReceiptOutbox` — but nothing crosses any wire
 * until the member explicitly confirms a node URL.
 */
export async function redeemInvite(
  encoded: string,
  displayName: string,
  nodeId: string,
  opts: RedeemOptions = {},
): Promise<RedeemResult> {
  const parsed = decodeAndVerifyInvite(encoded);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const { invite } = parsed;

  const existing = await db.invites.get(invite.token);
  if (existing) {
    if (
      existing.status === "redeemed" ||
      // Terminal too: the token was consumed (redeemed despite the
      // inviter's revocation, docs/invite-revocation.md §5). Without
      // this arm the row fell through the guard and a second redeem
      // on a shared device could mint a fresh identity + seed balance
      // and clobber the converged state back to plain "redeemed".
      existing.status === "redeemed_despite_revocation"
    ) {
      return { ok: false, error: "already_redeemed" };
    }
    if (existing.status === "revoked") {
      return { ok: false, error: "revoked" };
    }
  }

  // The inviter must not redeem their own invite — this protects against
  // a compromised device being used to inflate a trust graph. It is also
  // the one ATTACH we must never do (§5.2): the check runs before the
  // mode decision, so an inviter's own device can never attach either.
  const ownSecret = await db.secretKeys.get(invite.inviterKey);
  if (ownSecret) {
    return { ok: false, error: "self_redeem" };
  }

  const currentKey = await getSetting(SETTING_KEYS.currentMember);
  const currentMemberRow = currentKey
    ? await db.members.get(currentKey)
    : undefined;
  const currentSecret =
    currentKey && currentMemberRow
      ? await db.secretKeys.get(currentKey)
      : undefined;
  const mode = decideRedeemMode({
    hasCurrentIdentity: !!currentMemberRow,
    holdsSecretKey: !!currentSecret,
    forceNewIdentity: opts.forceNewIdentity,
  });

  // Adopt the community's nodeId. Every device mints a random nodeId on
  // first launch, and the Dashboard's headline stats + the local-vs-
  // federation split are scoped by nodeId (Dashboard.tsx, lib/stats.ts).
  // A new member who keeps their fresh random id files the community's
  // pulled exchanges under "another community" and sees zeroed stats —
  // the same hazard PairDevice already guards against for device linking
  // (its nodeId-adoption comment). The invite carries the inviter's
  // community id, so a brand-new member takes it on here.
  //
  // Guarded to a genuinely fresh device: we never clobber the device
  // nodeId out from under an existing member (attach, or a second
  // identity via forceNewIdentity — a shared device has one
  // device-global nodeId, and the incumbent's stats must not move).
  // "Fresh" is two checks, not one: no current identity, AND at most
  // one member row locally. The second check (PairDevice's guard for
  // the same adoption) covers a dangling/cleared currentMember setting
  // on a device that still holds a community's members and records —
  // re-scoping those out from under the data is exactly the clobber
  // this guard exists to prevent. (At most one, not zero: the redeeming
  // page may have materialized the inviter's member row.) A legacy
  // invite with an empty nodeId falls back to the device id, i.e. no
  // change from prior behaviour.
  const localMemberCount = await db.members.count();
  const adoptCommunityNode =
    !currentMemberRow && localMemberCount <= 1 && invite.nodeId !== "";
  const memberNodeId = adoptCommunityNode ? invite.nodeId : nodeId;

  let attachedMember: Member | null = null;
  let signingSecret: string | null = null;
  let mintKp: { publicKey: string; secretKey: string } | null = null;
  if (mode === "attach") {
    // Attach: no keypair minting, no member creation — and critically
    // no second starting balance (createMember would seed one). The
    // invite screen's name field is an EDIT of the existing display
    // name; an unchanged (or blank) name is a no-op.
    attachedMember = currentMemberRow as Member;
    const name = displayName.trim();
    if (name && name !== attachedMember.displayName) {
      await db.members.update(attachedMember.publicKey, {
        displayName: name,
      });
      attachedMember = { ...attachedMember, displayName: name };
    }
    // Phase 1: the receipt is signed by the ATTACHED key (§5.2). The
    // key may be passphrase-wrapped; getSecretKey handles unwrapping
    // and throws if the session is locked — in that edge case the
    // local redemption still lands and only the receipt is skipped
    // (best-effort, logged below). It stays OUTSIDE the transaction
    // below: Dexie commits on any non-DB await, and unwrapping is
    // WebCrypto work.
    try {
      signingSecret = await getSecretKey(attachedMember.publicKey);
    } catch (err) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "[understoria] could not load the secret key to sign the redemption receipt; redemption stays local-only",
          err,
        );
      }
    }
  } else {
    mintKp = generateKeyPair();
    signingSecret = mintKp.secretKey;
  }

  const redeemedAt = Date.now();

  // EVERYTHING lands atomically (§7): the minted member row + its
  // secret key (mint mode), the consumed invite row, and the enqueued
  // receipt. Before the member/key writes joined this transaction, a
  // crash after them but before the invite flip left a minted
  // identity (with a seed balance) beside a still-"open" invite; the
  // retry then minted a SECOND keypair — the exact orphan-identity
  // sequence §5.2 exists to prevent. Signing is synchronous tweetnacl,
  // so building the receipt inside the transaction is safe (no non-DB
  // await to trigger Dexie's premature commit).
  const member = await db.transaction(
    "rw",
    [
      db.invites,
      db.outbox,
      db.members,
      db.secretKeys,
      db.redemptionReceipts,
      // settings joins the transaction so the nodeId adoption below is
      // atomic with the mint: a crash must never commit a member row
      // carrying the community id while the device setting keeps the
      // old random one — the invite is consumed, so that split state
      // could not be repaired by redeeming again.
      db.settings,
    ],
    async () => {
      let m: Member;
      if (mintKp) {
        m = await createMember(
          { publicKey: mintKp.publicKey, displayName },
          memberNodeId,
        );
        // createMember skips secret-key generation when a publicKey
        // is supplied, so we persist it explicitly — through
        // persistSecretKey, which WRAPS it on a protected device
        // (Round-4 review).
        await persistSecretKey(mintKp.publicKey, mintKp.secretKey);
      } else {
        m = attachedMember as Member;
      }

      // Phase 1 (`docs/invite-redemption.md` §6): sign the redemption
      // receipt — the new member's attestation over the inviter's
      // original signed invite, embedded verbatim. Signed in BOTH
      // modes; the only difference is which key holds the pen.
      let receipt: RedemptionReceipt | null = null;
      if (signingSecret) {
        const payload: RedemptionPayload = {
          invite,
          redeemedBy: m.publicKey,
          displayName: m.displayName,
          redeemedAt,
        };
        receipt = {
          ...payload,
          signature: sign(canonicalRedemptionPayload(payload), signingSecret),
        };
      }

      await db.invites.put({
        token: invite.token,
        inviterKey: invite.inviterKey,
        nodeId: invite.nodeId,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
        status: "redeemed",
        redeemedBy: m.publicKey,
        redeemedAt,
        encoded,
      });
      if (receipt) {
        await enqueueRedemptionReceiptOutbox(receipt);
        // Re-seed Phase R0 (docs/community-reseed.md §1b): keep the
        // SIGNED artifact, not just the derived invite row — outbox
        // rows are pruned after delivery, and this receipt is what a
        // fresh node's membership closure would need re-uploaded.
        await db.redemptionReceipts.put(receipt);
      }

      // The device-global nodeId flips in the SAME transaction as the
      // mint (settings is in the table list above): member.nodeId and
      // SETTING_KEYS.nodeId must never diverge, because the consumed
      // invite makes a half-committed adoption unrepairable.
      if (adoptCommunityNode) {
        await setSetting(SETTING_KEYS.nodeId, invite.nodeId);
      }
      return m;
    },
  );

  return {
    ok: true,
    value: {
      member,
      inviterKey: invite.inviterKey,
      inviterName: invite.inviterName,
      mode,
      nodeId: adoptCommunityNode ? invite.nodeId : undefined,
    },
  };
}
