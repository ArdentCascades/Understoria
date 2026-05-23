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
  status: "redeemed" | "open" | "revoked" | "expired";
  inviterKey: string;
  redeemedBy: string | null;
}

export interface TrustContext {
  vouches: readonly SignedVouch[];
  invites: readonly RedeemedInviteLike[];
}

/**
 * Full trust computation: sum the distinct-voucher set for `memberKey`
 * across both manual vouches and redeemed invites. Becomes `trusted`
 * once the set reaches `MINIMUM_VOUCHES_FOR_TRUST`.
 */
export function trustStatusWithInvites(
  memberKey: string,
  ctx: TrustContext,
): TrustStatus {
  const voucherKeys = new Set<string>();
  for (const v of ctx.vouches) {
    if (v.voucheeKey !== memberKey) continue;
    if (!verifyVouch(v)) continue;
    voucherKeys.add(v.voucherKey);
  }
  for (const inv of ctx.invites) {
    if (inv.status !== "redeemed") continue;
    if (inv.redeemedBy !== memberKey) continue;
    voucherKeys.add(inv.inviterKey);
  }
  return voucherKeys.size >= MINIMUM_VOUCHES_FOR_TRUST
    ? "trusted"
    : "pending_trust";
}
