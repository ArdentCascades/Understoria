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
import { sign } from "./crypto";
import { uuid } from "./id";
import {
  canonicalVouchPayload,
  verifyVouch,
} from "@understoria/shared/crypto";
import type { SignedVouch, VouchPayload } from "@understoria/shared/types";

// Web-of-trust vouching — Agent 2 task 3.
//
// A vouch is a signed statement: "I, voucher, attest that vouchee is a
// member of our community." Stored locally on the redeeming node and
// federated to peers so any node can compute trust status without a
// central authority. The canonical-payload + verify pair live in
// @understoria/shared (so the server can verify too); this module
// keeps the higher-level helpers (trust computation, vouch list slicing).

export type { SignedVouch, VouchPayload };
export { canonicalVouchPayload, verifyVouch };

export interface CreateVouchInput {
  voucherKey: string;
  voucherSecretKey: string;
  voucheeKey: string;
  kind: "invite" | "manual";
  now?: number;
}

export function createVouch(input: CreateVouchInput): SignedVouch {
  const payload: VouchPayload = {
    voucherKey: input.voucherKey,
    voucheeKey: input.voucheeKey,
    createdAt: input.now ?? Date.now(),
    kind: input.kind,
  };
  return {
    id: uuid(),
    ...payload,
    signature: sign(canonicalVouchPayload(payload), input.voucherSecretKey),
  };
}

export const MINIMUM_VOUCHES_FOR_TRUST = 2;

/**
 * A member is "trusted" once they have at least `MINIMUM_VOUCHES_FOR_TRUST`
 * valid vouches from distinct voucher keys. Before that, they can still
 * post needs and offers (solidarity-first onboarding) but are flagged as
 * "pending trust" so the community can watch out for them.
 */
export type TrustStatus = "pending_trust" | "trusted";

export function trustStatus(
  memberKey: string,
  vouches: readonly SignedVouch[],
): TrustStatus {
  const distinct = new Set<string>();
  for (const v of vouches) {
    if (v.voucheeKey !== memberKey) continue;
    if (!verifyVouch(v)) continue;
    distinct.add(v.voucherKey);
  }
  return distinct.size >= MINIMUM_VOUCHES_FOR_TRUST
    ? "trusted"
    : "pending_trust";
}

export function vouchesFor(
  memberKey: string,
  vouches: readonly SignedVouch[],
): SignedVouch[] {
  return vouches.filter(
    (v) => v.voucheeKey === memberKey && verifyVouch(v),
  );
}

/**
 * Minimal shape of a redeemed invite record, sliced so this module can
 * remain DB-agnostic. Any record with these fields — typically an
 * `InviteRow` with status='redeemed' — counts as an implicit vouch from
 * `inviterKey` for `redeemedBy`.
 */
export interface RedeemedInviteLike {
  status:
    | "redeemed"
    | "open"
    | "revoked"
    | "expired"
    | "redeemed_despite_revocation";
  inviterKey: string;
  redeemedBy: string | null;
}

export interface TrustContext {
  vouches: readonly SignedVouch[];
  invites: readonly RedeemedInviteLike[];
  /**
   * Members recognized as the node's FOUNDING TRUST ROOTS — resolved
   * locally from the salted `founderKeyHashes` the node publishes on
   * `GET /config` (lib/founderRoots.ts). A founder is trusted by
   * construction, with zero vouchers: the whole web of trust is
   * rooted at them, exactly as the server's membership closure is
   * rooted at NODE_FOUNDER_KEYS ∪ claimed founders. Without this, a
   * fresh community deadlocks — the founder has no vouchers, only
   * trusted members can meaningfully vouch, so nobody can ever reach
   * trusted. Optional: callers that predate the capture (tests, old
   * paths) behave exactly as before.
   */
  founderRoots?: ReadonlySet<string>;
}

/**
 * Is `memberKey` one of the node-published founding trust roots?
 * Feeds both the trust short-circuit below and the "Founding member"
 * chip (the honest explanation for a trusted member with no
 * vouchers — the hashes are public, so the status is too).
 */
export function isFounderRoot(
  memberKey: string,
  ctx: Pick<TrustContext, "founderRoots">,
): boolean {
  return ctx.founderRoots?.has(memberKey) ?? false;
}

/**
 * Full trust computation: founding trust roots are trusted by
 * construction; everyone else needs a distinct-voucher set — across
 * both manual vouches and redeemed invites — of at least
 * `MINIMUM_VOUCHES_FOR_TRUST`.
 */
export function trustStatusWithInvites(
  memberKey: string,
  ctx: TrustContext,
): TrustStatus {
  if (isFounderRoot(memberKey, ctx)) return "trusted";
  return vouchersFor(memberKey, ctx).size >= MINIMUM_VOUCHES_FOR_TRUST
    ? "trusted"
    : "pending_trust";
}

export interface VoucherRef {
  voucherKey: string;
  /** `invite` when the vouch is implicit (the voucher invited this
   *  member and the invite was redeemed); `manual` when an existing
   *  trusted member vouched directly. */
  kind: "invite" | "manual";
  /** When the vouch was made. For invites, this is when redemption
   *  happened, not when the invite was issued. */
  createdAt: number;
}

/**
 * The distinct set of voucher keys for `memberKey`, plus what kind of
 * vouch each one was. Feeds trust computation and the own-Profile
 * trust-count display. (Per the operator ruling + `no-leaderboards`,
 * voucher sets/counts must NOT be displayed on OTHER members' pages —
 * MemberDetail shows only the qualitative trust status.)
 *
 * If a voucher both invited someone AND signed a manual vouch later,
 * we keep the manual one (it's stronger as a signal: "I still vouch
 * for them after working with them" beats "I sent them an invite").
 */
export function vouchersFor(
  memberKey: string,
  ctx: TrustContext,
): Map<string, VoucherRef> {
  const map = new Map<string, VoucherRef>();
  for (const inv of ctx.invites) {
    // Phase 1 of docs/invite-revocation.md: a redeemed_despite_revocation
    // row still counts the inviter's implicit vouch, exactly as a plain
    // redeemed row does — "behaves as today" (§10). Withdrawing the vouch
    // in that state is the Phase 2 behavior, gated behind a governance
    // ruling (§9); until then, counting it is what makes every device
    // agree on the newcomer's trust after the revocation converges.
    if (inv.status !== "redeemed" && inv.status !== "redeemed_despite_revocation")
      continue;
    if (inv.redeemedBy !== memberKey) continue;
    map.set(inv.inviterKey, {
      voucherKey: inv.inviterKey,
      kind: "invite",
      // RedeemedInviteLike is intentionally minimal and doesn't
      // carry the redemption timestamp, so we use 0 here. Callers
      // that care about ordering can sort manual-vouch dates and
      // append invite-vouchers in any order.
      createdAt: 0,
    });
  }
  for (const v of ctx.vouches) {
    if (v.voucheeKey !== memberKey) continue;
    if (!verifyVouch(v)) continue;
    map.set(v.voucherKey, {
      voucherKey: v.voucherKey,
      kind: "manual",
      createdAt: v.createdAt,
    });
  }
  return map;
}

/** Convenience: the distinct voucher count for `memberKey`. */
export function vouchCountFor(
  memberKey: string,
  ctx: TrustContext,
): number {
  return vouchersFor(memberKey, ctx).size;
}
