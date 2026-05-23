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
  CATEGORIES,
  type Category,
  type Exchange,
  type FlagReason,
  type SignedVouch,
} from "@understoria/shared/types";

/**
 * Shape-level validation for incoming POST bodies. Cryptographic
 * checks happen separately via `verifyExchange()` / `verifyVouch()`
 * from @understoria/shared/crypto — these guards only ensure we have
 * an object with the right shape before we hand it to the verifier.
 *
 * Returning a typed error rather than throwing keeps the route handler
 * pure and lets the response shape stay structured.
 */
export type ParseResult =
  | { ok: true; value: Exchange }
  | { ok: false; error: string };

export type ParseVouchResult =
  | { ok: true; value: SignedVouch }
  | { ok: false; error: string };

const VOUCH_KINDS: ReadonlySet<SignedVouch["kind"]> = new Set([
  "invite",
  "manual",
]);

const VOUCH_STRING_FIELDS = [
  "id",
  "voucherKey",
  "voucheeKey",
  "signature",
] as const;

export function parseVouch(input: unknown): ParseVouchResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of VOUCH_STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (
    typeof r.createdAt !== "number" ||
    !Number.isInteger(r.createdAt) ||
    r.createdAt <= 0
  ) {
    return {
      ok: false,
      error: "createdAt must be a positive integer (ms epoch)",
    };
  }
  if (
    typeof r.kind !== "string" ||
    !VOUCH_KINDS.has(r.kind as SignedVouch["kind"])
  ) {
    return { ok: false, error: "kind must be 'invite' or 'manual'" };
  }
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if ((r.createdAt as number) > oneDayFromNow) {
    return { ok: false, error: "createdAt is too far in the future" };
  }
  return {
    ok: true,
    value: {
      id: r.id as string,
      voucherKey: r.voucherKey as string,
      voucheeKey: r.voucheeKey as string,
      createdAt: r.createdAt as number,
      kind: r.kind as SignedVouch["kind"],
      signature: r.signature as string,
    },
  };
}

const FLAG_REASONS: ReadonlySet<FlagReason> = new Set([
  "short_duration",
  "reciprocal_pattern",
  "daily_limit_warning",
]);
const CATEGORY_SET: ReadonlySet<Category> = new Set(CATEGORIES);

const STRING_FIELDS = [
  "id",
  "postId",
  "helperKey",
  "helpedKey",
  "helperSignature",
  "helpedSignature",
  "nodeId",
] as const;

export function parseExchange(input: unknown): ParseResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;

  for (const f of STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }

  if (typeof r.hoursExchanged !== "number" || !Number.isFinite(r.hoursExchanged) || r.hoursExchanged <= 0) {
    return { ok: false, error: "hoursExchanged must be a positive finite number" };
  }
  if (typeof r.completedAt !== "number" || !Number.isInteger(r.completedAt) || r.completedAt <= 0) {
    return { ok: false, error: "completedAt must be a positive integer (ms epoch)" };
  }
  if (typeof r.category !== "string" || !CATEGORY_SET.has(r.category as Category)) {
    return { ok: false, error: "category is not a recognized category" };
  }

  // Optional flag fields.
  let flaggedForReview: boolean | undefined;
  if (r.flaggedForReview !== undefined) {
    if (typeof r.flaggedForReview !== "boolean") {
      return { ok: false, error: "flaggedForReview must be a boolean if present" };
    }
    flaggedForReview = r.flaggedForReview;
  }
  let flagReason: FlagReason | undefined;
  if (r.flagReason !== undefined) {
    if (typeof r.flagReason !== "string" || !FLAG_REASONS.has(r.flagReason as FlagReason)) {
      return { ok: false, error: "flagReason is not a recognized reason" };
    }
    flagReason = r.flagReason as FlagReason;
  }

  // Bound on completedAt: not absurdly far in the future. Keeps the
  // signature canonical-form predictable.
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if (r.completedAt > oneDayFromNow) {
    return { ok: false, error: "completedAt is too far in the future" };
  }

  const value: Exchange = {
    id: r.id as string,
    postId: r.postId as string,
    helperKey: r.helperKey as string,
    helpedKey: r.helpedKey as string,
    hoursExchanged: r.hoursExchanged as number,
    helperSignature: r.helperSignature as string,
    helpedSignature: r.helpedSignature as string,
    completedAt: r.completedAt as number,
    category: r.category as Category,
    nodeId: r.nodeId as string,
  };
  if (flaggedForReview) {
    value.flaggedForReview = true;
    if (flagReason) value.flagReason = flagReason;
  }
  return { ok: true, value };
}
