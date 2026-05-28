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
  type Post,
  type SignedInvite,
  type SignedVouch,
  type TaskComment,
} from "@understoria/shared/types";
import type { PostRecord } from "./db.js";

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

export type ParsePostResult =
  | { ok: true; value: PostRecord }
  | { ok: false; error: string };

export type ParseTaskCommentResult =
  | { ok: true; value: TaskComment }
  | { ok: false; error: string };

export type ParseInviteResult =
  | { ok: true; value: SignedInvite }
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

const POST_TYPES: ReadonlySet<Post["type"]> = new Set(["NEED", "OFFER"]);
const URGENCY_LEVELS: ReadonlySet<Post["urgency"]> = new Set([
  "low",
  "medium",
  "high",
]);

const POST_STRING_FIELDS = [
  "id",
  "title",
  "postedBy",
  "locationZone",
  "nodeId",
  "signature",
] as const;

export function parsePost(input: unknown): ParsePostResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;

  for (const f of POST_STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  // `description` is allowed to be the empty string — posts can be
  // just a title. Required to be a string, not non-empty.
  if (typeof r.description !== "string") {
    return { ok: false, error: "description must be a string" };
  }
  if (
    typeof r.estimatedHours !== "number" ||
    !Number.isFinite(r.estimatedHours) ||
    r.estimatedHours <= 0
  ) {
    return {
      ok: false,
      error: "estimatedHours must be a positive finite number",
    };
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
  if (r.expiresAt !== null) {
    if (
      typeof r.expiresAt !== "number" ||
      !Number.isInteger(r.expiresAt) ||
      r.expiresAt <= 0
    ) {
      return {
        ok: false,
        error: "expiresAt must be null or a positive integer (ms epoch)",
      };
    }
  }
  if (
    typeof r.type !== "string" ||
    !POST_TYPES.has(r.type as Post["type"])
  ) {
    return { ok: false, error: "type must be 'NEED' or 'OFFER'" };
  }
  if (
    typeof r.urgency !== "string" ||
    !URGENCY_LEVELS.has(r.urgency as Post["urgency"])
  ) {
    return { ok: false, error: "urgency must be low/medium/high" };
  }
  if (
    typeof r.category !== "string" ||
    !CATEGORY_SET.has(r.category as Category)
  ) {
    return { ok: false, error: "category is not a recognized category" };
  }
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if ((r.createdAt as number) > oneDayFromNow) {
    return { ok: false, error: "createdAt is too far in the future" };
  }
  return {
    ok: true,
    value: {
      id: r.id as string,
      type: r.type as Post["type"],
      category: r.category as Category,
      title: r.title as string,
      description: r.description as string,
      estimatedHours: r.estimatedHours as number,
      urgency: r.urgency as Post["urgency"],
      postedBy: r.postedBy as string,
      createdAt: r.createdAt as number,
      expiresAt: r.expiresAt as number | null,
      locationZone: r.locationZone as string,
      nodeId: r.nodeId as string,
      signature: r.signature as string,
    },
  };
}

const INVITE_STRING_FIELDS = [
  "token",
  "inviterKey",
  "inviterName",
  "nodeId",
  "signature",
] as const;

export function parseInvite(input: unknown): ParseInviteResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of INVITE_STRING_FIELDS) {
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
    typeof r.expiresAt !== "number" ||
    !Number.isInteger(r.expiresAt) ||
    r.expiresAt <= 0
  ) {
    return {
      ok: false,
      error: "expiresAt must be a positive integer (ms epoch)",
    };
  }
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if ((r.createdAt as number) > oneDayFromNow) {
    return { ok: false, error: "createdAt is too far in the future" };
  }
  return {
    ok: true,
    value: {
      token: r.token as string,
      inviterKey: r.inviterKey as string,
      inviterName: r.inviterName as string,
      nodeId: r.nodeId as string,
      createdAt: r.createdAt as number,
      expiresAt: r.expiresAt as number,
      signature: r.signature as string,
    },
  };
}

const TASK_COMMENT_STRING_FIELDS = [
  "id",
  "projectId",
  "taskId",
  "authorKey",
  "nodeId",
  "signature",
] as const;

/** Maximum permitted body length on the wire. Matches the local
 *  validation in apps/web/src/db/taskComments.ts. */
export const MAX_TASK_COMMENT_BODY = 2000;

export function parseTaskComment(input: unknown): ParseTaskCommentResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;

  for (const f of TASK_COMMENT_STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (typeof r.body !== "string") {
    return { ok: false, error: "body must be a string" };
  }
  const body = r.body as string;
  if (body.length === 0) {
    return { ok: false, error: "body must not be empty" };
  }
  if (body.length > MAX_TASK_COMMENT_BODY) {
    return {
      ok: false,
      error: `body exceeds ${MAX_TASK_COMMENT_BODY} characters`,
    };
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
  if (r.deletedAt !== null) {
    if (
      typeof r.deletedAt !== "number" ||
      !Number.isInteger(r.deletedAt) ||
      r.deletedAt <= 0
    ) {
      return {
        ok: false,
        error: "deletedAt must be null or a positive integer (ms epoch)",
      };
    }
  }
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if ((r.createdAt as number) > oneDayFromNow) {
    return { ok: false, error: "createdAt is too far in the future" };
  }
  return {
    ok: true,
    value: {
      id: r.id as string,
      projectId: r.projectId as string,
      taskId: r.taskId as string,
      authorKey: r.authorKey as string,
      body,
      createdAt: r.createdAt as number,
      deletedAt: r.deletedAt as number | null,
      nodeId: r.nodeId as string,
      signature: r.signature as string,
    },
  };
}
