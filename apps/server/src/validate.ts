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
  type AwaitingTransition,
  type Category,
  type CoOrganizerInvitation,
  type CoOrganizerInvitationResponse,
  type CoOrganizerInvitationRevocation,
  type Event,
  type EventCancellation,
  type EventRsvpState,
  type EventShiftState,
  type Exchange,
  type FlagReason,
  type Post,
  type ProjectState,
  type ShiftSignupState,
  type SignedVouch,
  type TaskComment,
  type TaskState,
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

// NOTE: `parseInvite` was removed with the `POST/GET /invites` surface
// (invite-redemption Phase 1 — `docs/invite-redemption.md` §8). The
// redemption receipt's shape gate, `parseRedemption`, lives in
// `@understoria/shared/crypto` (design note §14 PR 1a) because the
// PWA pull applies the identical checks before the shared verifier.

export type ParseCoOrganizerInvitationResult =
  | { ok: true; value: CoOrganizerInvitation }
  | { ok: false; error: string };

export type ParseCoOrganizerInvitationResponseResult =
  | { ok: true; value: CoOrganizerInvitationResponse }
  | { ok: false; error: string };

export type ParseCoOrganizerInvitationRevocationResult =
  | { ok: true; value: CoOrganizerInvitationRevocation }
  | { ok: false; error: string };

export type ParseEventResult =
  | { ok: true; value: Event }
  | { ok: false; error: string };

export type ParseEventCancellationResult =
  | { ok: true; value: EventCancellation }
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
  // Optional auto-confirm fields. Shape-only here — the
  // exchanges route refuses autoConfirmed=true rows entirely
  // (those route through /auto-confirm), and the auto-confirm
  // route does its own deeper checks.
  let autoConfirmed: boolean | undefined;
  if (r.autoConfirmed !== undefined) {
    if (typeof r.autoConfirmed !== "boolean") {
      return { ok: false, error: "autoConfirmed must be a boolean if present" };
    }
    autoConfirmed = r.autoConfirmed;
  }
  let autoConfirmedBy: string | undefined;
  if (r.autoConfirmedBy !== undefined) {
    if (typeof r.autoConfirmedBy !== "string" || r.autoConfirmedBy.length === 0) {
      return { ok: false, error: "autoConfirmedBy must be a non-empty string if present" };
    }
    autoConfirmedBy = r.autoConfirmedBy;
  }
  let autoConfirmedAt: number | undefined;
  if (r.autoConfirmedAt !== undefined) {
    if (
      typeof r.autoConfirmedAt !== "number" ||
      !Number.isInteger(r.autoConfirmedAt) ||
      r.autoConfirmedAt <= 0
    ) {
      return { ok: false, error: "autoConfirmedAt must be a positive integer if present" };
    }
    autoConfirmedAt = r.autoConfirmedAt;
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
  if (autoConfirmed) value.autoConfirmed = true;
  if (autoConfirmedBy !== undefined) value.autoConfirmedBy = autoConfirmedBy;
  if (autoConfirmedAt !== undefined) value.autoConfirmedAt = autoConfirmedAt;
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

// Free-text length ceilings for posts (Round-4 review). Events and
// task comments already cap their free text; posts did not, so a
// signed post with a ~60 KB title/description sailed through (bounded
// only by the 64 KB body cap) and federated verbatim. Mirrors the
// event ceilings.
const POST_TITLE_MAX = 200;
const POST_DESCRIPTION_MAX = 2000;
const POST_LOCATION_MAX = 200;

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
  // Free-text length caps (Round-4 review).
  if ((r.title as string).length > POST_TITLE_MAX) {
    return { ok: false, error: `title exceeds ${POST_TITLE_MAX} characters` };
  }
  if ((r.description as string).length > POST_DESCRIPTION_MAX) {
    return {
      ok: false,
      error: `description exceeds ${POST_DESCRIPTION_MAX} characters`,
    };
  }
  if ((r.locationZone as string).length > POST_LOCATION_MAX) {
    return {
      ok: false,
      error: `locationZone exceeds ${POST_LOCATION_MAX} characters`,
    };
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
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
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
    // BOUND deletedAt the same way createdAt is bounded. deletedAt is
    // excluded from the signed canonical payload (so soft-delete
    // doesn't re-sign), which means a replayer can set it to anything
    // on an otherwise-valid signed row. Because the federation cursor
    // for task comments is max(created_at, deleted_at), an unbounded
    // deletedAt (e.g. Number.MAX_SAFE_INTEGER) would jump every
    // puller's high-water mark to the far future and filter out ALL
    // subsequent comments mesh-wide — one request wedges the whole
    // task-comment federation. It also cannot precede creation.
    if ((r.deletedAt as number) > oneDayFromNow) {
      return { ok: false, error: "deletedAt is too far in the future" };
    }
    if ((r.deletedAt as number) < (r.createdAt as number)) {
      return { ok: false, error: "deletedAt precedes createdAt" };
    }
  }
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

const COORG_INVITATION_STRING_FIELDS = [
  "id",
  "projectId",
  "inviterKey",
  "inviteeKey",
  "nodeId",
  "signature",
] as const;

export function parseCoOrganizerInvitation(
  input: unknown,
): ParseCoOrganizerInvitationResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of COORG_INVITATION_STRING_FIELDS) {
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
      id: r.id as string,
      projectId: r.projectId as string,
      inviterKey: r.inviterKey as string,
      inviteeKey: r.inviteeKey as string,
      createdAt: r.createdAt as number,
      expiresAt: r.expiresAt as number,
      nodeId: r.nodeId as string,
      signature: r.signature as string,
    },
  };
}

const COORG_INVITATION_RESPONSE_STRING_FIELDS = [
  "id",
  "invitationId",
  "inviteeKey",
  "nodeId",
  "signature",
] as const;

const COORG_RESPONSE_DECISIONS: ReadonlySet<
  CoOrganizerInvitationResponse["decision"]
> = new Set(["accept", "decline"]);

export function parseCoOrganizerInvitationResponse(
  input: unknown,
): ParseCoOrganizerInvitationResponseResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of COORG_INVITATION_RESPONSE_STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (
    typeof r.decision !== "string" ||
    !COORG_RESPONSE_DECISIONS.has(
      r.decision as CoOrganizerInvitationResponse["decision"],
    )
  ) {
    return { ok: false, error: "decision must be 'accept' or 'decline'" };
  }
  if (
    typeof r.decidedAt !== "number" ||
    !Number.isInteger(r.decidedAt) ||
    r.decidedAt <= 0
  ) {
    return {
      ok: false,
      error: "decidedAt must be a positive integer (ms epoch)",
    };
  }
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if ((r.decidedAt as number) > oneDayFromNow) {
    return { ok: false, error: "decidedAt is too far in the future" };
  }
  return {
    ok: true,
    value: {
      id: r.id as string,
      invitationId: r.invitationId as string,
      inviteeKey: r.inviteeKey as string,
      decision: r.decision as CoOrganizerInvitationResponse["decision"],
      decidedAt: r.decidedAt as number,
      nodeId: r.nodeId as string,
      signature: r.signature as string,
    },
  };
}

const COORG_INVITATION_REVOCATION_STRING_FIELDS = [
  "id",
  "invitationId",
  "inviterKey",
  "nodeId",
  "signature",
] as const;

export function parseCoOrganizerInvitationRevocation(
  input: unknown,
): ParseCoOrganizerInvitationRevocationResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of COORG_INVITATION_REVOCATION_STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (
    typeof r.revokedAt !== "number" ||
    !Number.isInteger(r.revokedAt) ||
    r.revokedAt <= 0
  ) {
    return {
      ok: false,
      error: "revokedAt must be a positive integer (ms epoch)",
    };
  }
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if ((r.revokedAt as number) > oneDayFromNow) {
    return { ok: false, error: "revokedAt is too far in the future" };
  }
  return {
    ok: true,
    value: {
      id: r.id as string,
      invitationId: r.invitationId as string,
      inviterKey: r.inviterKey as string,
      revokedAt: r.revokedAt as number,
      nodeId: r.nodeId as string,
      signature: r.signature as string,
    },
  };
}

// Field length bounds for community events. Mirrors the per-field
// comments in `packages/shared/src/types.ts` (the wire contract) and
// the §4 design-doc rationale. Keep these in sync.
const EVENT_TITLE_MAX = 200;
const EVENT_DESCRIPTION_MAX = 2000;
const EVENT_CATEGORY_MAX = 50;
const EVENT_LOCATION_MAX = 200;
const EVENT_CANCELLATION_REASON_MAX = 500;

const EVENT_STRING_FIELDS = [
  "id",
  "nodeId",
  "createdBy",
  "signature",
] as const;

export function parseEvent(input: unknown): ParseEventResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;

  if (r.kind !== "event") {
    return { ok: false, error: "kind must be 'event'" };
  }
  for (const f of EVENT_STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (typeof r.title !== "string") {
    return { ok: false, error: "title must be a string" };
  }
  const title = r.title as string;
  if (title.length === 0 || title.length > EVENT_TITLE_MAX) {
    return {
      ok: false,
      error: `title must be 1..${EVENT_TITLE_MAX} characters`,
    };
  }
  if (typeof r.description !== "string") {
    return { ok: false, error: "description must be a string" };
  }
  if ((r.description as string).length > EVENT_DESCRIPTION_MAX) {
    return {
      ok: false,
      error: `description exceeds ${EVENT_DESCRIPTION_MAX} characters`,
    };
  }
  if (typeof r.category !== "string") {
    return { ok: false, error: "category must be a string" };
  }
  const category = r.category as string;
  if (category.length === 0 || category.length > EVENT_CATEGORY_MAX) {
    return {
      ok: false,
      error: `category must be 1..${EVENT_CATEGORY_MAX} characters`,
    };
  }
  if (typeof r.location !== "string") {
    return { ok: false, error: "location must be a string" };
  }
  const location = r.location as string;
  if (location.length === 0 || location.length > EVENT_LOCATION_MAX) {
    return {
      ok: false,
      error: `location must be 1..${EVENT_LOCATION_MAX} characters`,
    };
  }
  if (
    typeof r.startsAt !== "number" ||
    !Number.isInteger(r.startsAt) ||
    r.startsAt <= 0
  ) {
    return {
      ok: false,
      error: "startsAt must be a positive integer (ms epoch)",
    };
  }
  if (r.endsAt !== null) {
    if (
      typeof r.endsAt !== "number" ||
      !Number.isInteger(r.endsAt) ||
      r.endsAt <= 0
    ) {
      return {
        ok: false,
        error: "endsAt must be null or a positive integer (ms epoch)",
      };
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
  if (r.capacity !== null) {
    if (
      typeof r.capacity !== "number" ||
      !Number.isInteger(r.capacity) ||
      r.capacity <= 0
    ) {
      return {
        ok: false,
        error: "capacity must be null or a positive integer",
      };
    }
  }
  // Phase 2: a non-null templateId is a 1..50-char identifier, passed
  // through verbatim so the stored payload re-verifies against its
  // signature. Length-only, mirroring `category` — the server stays
  // content-agnostic about which template kinds exist. See
  // `docs/event-templates-plan.md`.
  if (r.templateId !== null) {
    if (typeof r.templateId !== "string") {
      return { ok: false, error: "templateId must be null or a string" };
    }
    if (
      (r.templateId as string).length === 0 ||
      (r.templateId as string).length > EVENT_CATEGORY_MAX
    ) {
      return {
        ok: false,
        error: `templateId must be 1..${EVENT_CATEGORY_MAX} characters`,
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
      kind: "event",
      title,
      description: r.description as string,
      category,
      startsAt: r.startsAt as number,
      endsAt: r.endsAt as number | null,
      location,
      capacity: r.capacity as number | null,
      templateId: r.templateId as string | null,
      createdAt: r.createdAt as number,
      createdBy: r.createdBy as string,
      nodeId: r.nodeId as string,
      signature: r.signature as string,
    },
  };
}

const EVENT_CANCELLATION_STRING_FIELDS = [
  "id",
  "eventId",
  "nodeId",
  "createdBy",
  "signature",
] as const;

export function parseEventCancellation(
  input: unknown,
): ParseEventCancellationResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;

  if (r.kind !== "event_cancellation") {
    return { ok: false, error: "kind must be 'event_cancellation'" };
  }
  for (const f of EVENT_CANCELLATION_STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (typeof r.reason !== "string") {
    return { ok: false, error: "reason must be a string" };
  }
  if ((r.reason as string).length > EVENT_CANCELLATION_REASON_MAX) {
    return {
      ok: false,
      error: `reason exceeds ${EVENT_CANCELLATION_REASON_MAX} characters`,
    };
  }
  if (
    typeof r.cancelledAt !== "number" ||
    !Number.isInteger(r.cancelledAt) ||
    r.cancelledAt <= 0
  ) {
    return {
      ok: false,
      error: "cancelledAt must be a positive integer (ms epoch)",
    };
  }
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if ((r.cancelledAt as number) > oneDayFromNow) {
    return { ok: false, error: "cancelledAt is too far in the future" };
  }
  return {
    ok: true,
    value: {
      id: r.id as string,
      kind: "event_cancellation",
      eventId: r.eventId as string,
      reason: r.reason as string,
      cancelledAt: r.cancelledAt as number,
      createdBy: r.createdBy as string,
      nodeId: r.nodeId as string,
      signature: r.signature as string,
    },
  };
}

export type ParseAwaitingTransitionResult =
  | { ok: true; value: AwaitingTransition }
  | { ok: false; error: string };

const AWAITING_TRANSITION_STRING_FIELDS = [
  "postId",
  "helperKey",
  "helpedKey",
  "signedBy",
  "nodeId",
  "signature",
] as const;

/** Post ids are UUIDs or `project:<id>/task:<id>` labels; a generous
 *  ceiling keeps a signed artifact from smuggling free text. */
const AWAITING_TRANSITION_POSTID_MAX = 300;

export function parseAwaitingTransition(
  input: unknown,
): ParseAwaitingTransitionResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  if (r.kind !== "awaiting_transition") {
    return { ok: false, error: "kind must be 'awaiting_transition'" };
  }
  for (const f of AWAITING_TRANSITION_STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if ((r.postId as string).length > AWAITING_TRANSITION_POSTID_MAX) {
    return {
      ok: false,
      error: `postId exceeds ${AWAITING_TRANSITION_POSTID_MAX} characters`,
    };
  }
  // Authority shape: the attesting party must be one of the two the
  // artifact names. The signature check against signedBy happens at
  // the route via verifyAwaitingTransition; this is the shape half.
  if (r.signedBy !== r.helperKey && r.signedBy !== r.helpedKey) {
    return {
      ok: false,
      error: "signedBy must be helperKey or helpedKey",
    };
  }
  if (
    typeof r.enteredAt !== "number" ||
    !Number.isInteger(r.enteredAt) ||
    r.enteredAt <= 0
  ) {
    return {
      ok: false,
      error: "enteredAt must be a positive integer (ms epoch)",
    };
  }
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if ((r.enteredAt as number) > oneDayFromNow) {
    return { ok: false, error: "enteredAt is too far in the future" };
  }
  return {
    ok: true,
    value: {
      kind: "awaiting_transition",
      postId: r.postId as string,
      helperKey: r.helperKey as string,
      helpedKey: r.helpedKey as string,
      signedBy: r.signedBy as string,
      enteredAt: r.enteredAt as number,
      nodeId: r.nodeId as string,
      signature: r.signature as string,
    },
  };
}

// --- Project & task state records (docs/project-federation.md) --------
//
// Unlike the reconstruct-known-fields parsers above, these two PASS THE
// BODY THROUGH VERBATIM after checking the fields the server relies on.
// The signature covers `stableStringify(record minus signature)` — every
// field, including ones this server version doesn't know about — so
// rebuilding the object from a field list would strip newer fields and
// break re-verification on every pulling client. Size is bounded by the
// global 64 KB body limit; row growth is bounded by the insert caps and
// by LWW replacing rows in place.

export type ParseProjectStateResult =
  | { ok: true; value: ProjectState }
  | { ok: false; error: string };

export type ParseTaskStateResult =
  | { ok: true; value: TaskState }
  | { ok: false; error: string };

const PROJECT_STATE_STRING_FIELDS = [
  "id",
  "organizerKey",
  "signerKey",
  "nodeId",
  "signature",
] as const;

const STATE_TITLE_MAX = 300;
const STATE_DESCRIPTION_MAX = 5000;
const MAX_CO_ORGANIZERS = 20;

function checkStateCommon(
  r: Record<string, unknown>,
): string | null {
  if (
    typeof r.updatedAt !== "number" ||
    !Number.isInteger(r.updatedAt) ||
    r.updatedAt <= 0
  ) {
    return "updatedAt must be a positive integer (ms epoch)";
  }
  if (r.updatedAt > Date.now() + 24 * 60 * 60 * 1000) {
    return "updatedAt is too far in the future";
  }
  if (typeof r.title !== "string" || r.title.length === 0) {
    return "title must be a non-empty string";
  }
  if (r.title.length > STATE_TITLE_MAX) {
    return `title exceeds ${STATE_TITLE_MAX} characters`;
  }
  if (typeof r.description !== "string") {
    return "description must be a string";
  }
  if (r.description.length > STATE_DESCRIPTION_MAX) {
    return `description exceeds ${STATE_DESCRIPTION_MAX} characters`;
  }
  return null;
}

export function parseProjectState(input: unknown): ParseProjectStateResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of PROJECT_STATE_STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (
    !Array.isArray(r.coOrganizerKeys) ||
    r.coOrganizerKeys.length > MAX_CO_ORGANIZERS ||
    r.coOrganizerKeys.some((k) => typeof k !== "string" || k.length === 0)
  ) {
    return {
      ok: false,
      error: `coOrganizerKeys must be an array of up to ${MAX_CO_ORGANIZERS} non-empty strings`,
    };
  }
  const common = checkStateCommon(r);
  if (common) return { ok: false, error: common };
  return { ok: true, value: r as unknown as ProjectState };
}

const TASK_STATE_STRING_FIELDS = [
  "id",
  "projectId",
  "signerKey",
  "signature",
] as const;

export function parseTaskState(input: unknown): ParseTaskStateResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of TASK_STATE_STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (
    r.assignedTo !== null &&
    (typeof r.assignedTo !== "string" || r.assignedTo.length === 0)
  ) {
    return {
      ok: false,
      error: "assignedTo must be null or a non-empty string",
    };
  }
  const common = checkStateCommon(r);
  if (common) return { ok: false, error: common };
  return { ok: true, value: r as unknown as TaskState };
}

// --- Phase 2 participation state records (docs/project-federation.md
// §6). Same pass-the-body-through-verbatim posture as the project /
// task parsers above: the signature covers every field via
// stableStringify, so rebuilding from a field list would break
// re-verification on every pulling client.

export type ParseEventRsvpStateResult =
  | { ok: true; value: EventRsvpState }
  | { ok: false; error: string };

export type ParseEventShiftStateResult =
  | { ok: true; value: EventShiftState }
  | { ok: false; error: string };

export type ParseShiftSignupStateResult =
  | { ok: true; value: ShiftSignupState }
  | { ok: false; error: string };

const RSVP_STATUSES = new Set(["going", "maybe", "not_going"]);
const SHIFT_LABEL_MAX = 100;

function checkLwwClock(r: Record<string, unknown>): string | null {
  if (
    typeof r.updatedAt !== "number" ||
    !Number.isInteger(r.updatedAt) ||
    r.updatedAt <= 0
  ) {
    return "updatedAt must be a positive integer (ms epoch)";
  }
  if (r.updatedAt > Date.now() + 24 * 60 * 60 * 1000) {
    return "updatedAt is too far in the future";
  }
  return null;
}

function checkTombstone(r: Record<string, unknown>): string | null {
  if (r.deletedAt !== null) {
    if (
      typeof r.deletedAt !== "number" ||
      !Number.isInteger(r.deletedAt) ||
      r.deletedAt <= 0
    ) {
      return "deletedAt must be null or a positive integer (ms epoch)";
    }
  }
  return null;
}

export function parseEventRsvpState(
  input: unknown,
): ParseEventRsvpStateResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of ["id", "eventId", "memberKey", "signerKey", "signature"]) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (typeof r.status !== "string" || !RSVP_STATUSES.has(r.status)) {
    return {
      ok: false,
      error: "status must be 'going', 'maybe', or 'not_going'",
    };
  }
  const clock = checkLwwClock(r);
  if (clock) return { ok: false, error: clock };
  return { ok: true, value: r as unknown as EventRsvpState };
}

export function parseEventShiftState(
  input: unknown,
): ParseEventShiftStateResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of ["id", "eventId", "createdBy", "signerKey", "signature"]) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  if (
    typeof r.label !== "string" ||
    r.label.length === 0 ||
    r.label.length > SHIFT_LABEL_MAX
  ) {
    return {
      ok: false,
      error: `label must be 1..${SHIFT_LABEL_MAX} characters`,
    };
  }
  if (
    typeof r.startsAt !== "number" ||
    typeof r.endsAt !== "number" ||
    !Number.isFinite(r.startsAt) ||
    !Number.isFinite(r.endsAt) ||
    r.endsAt <= r.startsAt
  ) {
    return { ok: false, error: "shift end time must be after its start" };
  }
  if (
    r.capacity !== null &&
    (typeof r.capacity !== "number" ||
      !Number.isInteger(r.capacity) ||
      r.capacity <= 0)
  ) {
    return {
      ok: false,
      error: "capacity must be null or a positive integer",
    };
  }
  const tombstone = checkTombstone(r);
  if (tombstone) return { ok: false, error: tombstone };
  const clock = checkLwwClock(r);
  if (clock) return { ok: false, error: clock };
  return { ok: true, value: r as unknown as EventShiftState };
}

export function parseShiftSignupState(
  input: unknown,
): ParseShiftSignupStateResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;
  for (const f of [
    "id",
    "shiftId",
    "eventId",
    "memberKey",
    "signerKey",
    "signature",
  ]) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }
  const tombstone = checkTombstone(r);
  if (tombstone) return { ok: false, error: tombstone };
  const clock = checkLwwClock(r);
  if (clock) return { ok: false, error: clock };
  return { ok: true, value: r as unknown as ShiftSignupState };
}
