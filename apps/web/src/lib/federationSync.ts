/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { Exchange, Post, SignedVouch, TaskComment } from "@/types";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Event,
  EventCancellation,
} from "@understoria/shared/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { materializeAcceptedCoOrganizer } from "@/db/coorgInvitations";
import { createMember } from "@/db/seed";
import { verifyTaskComment } from "@/lib/crypto";
import { encodeInviteToken } from "@/lib/invite";
import {
  parseInviteRevocation,
  parseRedemption,
  verifyCoOrganizerInvitation,
  verifyCoOrganizerInvitationResponse,
  verifyCoOrganizerInvitationRevocation,
  verifyEvent,
  verifyEventCancellation,
  verifyExchange,
  verifyInviteRevocation,
  verifyPost,
  verifyRedemptionReceipt,
  verifyVouch,
} from "@understoria/shared/crypto";

const POST_CURSOR_KEY = "federationLastPostPull";
const CLAIM_CURSOR_KEY = "federationLastClaimPull";
const TASK_COMMENT_CURSOR_KEY = "federationLastTaskCommentPull";
const EXCHANGE_CURSOR_KEY = SETTING_KEYS.federationLastExchangePull;

export interface FederationSyncResult {
  inserted: number;
  skipped: number;
}

/**
 * A pulled row's CURSOR timestamp must be a plausible epoch-ms value:
 * a positive integer no further than a day in the future (the same
 * clock-skew grace the server-side validators and `parseInviteRevocation`
 * allow).
 *
 * This is the client half of the cursor-poisoning defense. The server
 * bounds these fields at ingestion (`validate.ts`), but a compromised
 * community node — or a plain-HTTP MITM on a pilot deployment — does
 * not need its store: it can serve fabricated rows directly, signed by
 * keypairs it invents (self-consistent signatures verify). One such
 * row with a far-future timestamp would jump the persisted high-water
 * mark past every legitimate later record, silently wedging that pull
 * forever. Rows failing this bound are skipped WITHOUT advancing the
 * cursor, exactly like a bad signature.
 */
const CURSOR_STAMP_MAX_FUTURE_MS = 24 * 60 * 60 * 1000;
function plausibleCursorStamp(v: unknown): v is number {
  return (
    typeof v === "number" &&
    Number.isInteger(v) &&
    v > 0 &&
    v <= Date.now() + CURSOR_STAMP_MAX_FUTURE_MS
  );
}

/**
 * Pull posts from the configured community node that originated from
 * peer nodes. Inserts them into the local posts table with lifecycle
 * defaults (open, unclaimed) so they appear on the Board alongside
 * local posts. Cross-node posts are distinguished by `nodeId !==
 * localNodeId`.
 *
 * Idempotent: uses `store.has(id)` dedup on the client side, and a
 * persisted cursor so repeated calls don't re-fetch the full history.
 *
 * Only runs when community-node mirroring is enabled and a URL is
 * configured. Returns null if sync is not applicable.
 */
export async function pullFederatedPosts(): Promise<FederationSyncResult | null> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const since = await getSetting(POST_CURSOR_KEY);
  const params = new URLSearchParams({ limit: "200" });
  if (since) params.set("since", since);

  const url = `${baseUrl.replace(/\/+$/, "")}/posts?${params.toString()}`;
  let body: { posts?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    body = (await res.json()) as { posts?: unknown[] };
  } catch {
    return null;
  }

  if (!Array.isArray(body.posts)) return null;

  let inserted = 0;
  let skipped = 0;
  let maxCreatedAt: number | null = since ? Number(since) : null;

  for (const raw of body.posts) {
    const r = raw as Record<string, unknown>;
    // Strict shape check — no defaulting. A row missing any signed
    // field can't verify, and patching fields with fallbacks would
    // store attacker-chosen content under a "repaired" shape. The
    // response body is UNTRUSTED (a compromised node, or a MITM on a
    // plain-HTTP pilot deployment, controls it): the signature check
    // below is the only thing that makes a row attributable.
    if (
      typeof r.id !== "string" ||
      !plausibleCursorStamp(r.createdAt) ||
      (r.type !== "NEED" && r.type !== "OFFER") ||
      typeof r.category !== "string" ||
      typeof r.title !== "string" ||
      typeof r.description !== "string" ||
      typeof r.estimatedHours !== "number" ||
      typeof r.urgency !== "string" ||
      typeof r.postedBy !== "string" ||
      (typeof r.expiresAt !== "number" && r.expiresAt !== null) ||
      typeof r.locationZone !== "string" ||
      typeof r.nodeId !== "string" ||
      typeof r.signature !== "string" ||
      r.signature === ""
    ) {
      skipped += 1;
      continue;
    }
    const existing = await db.posts.get(r.id);
    if (existing) {
      skipped += 1;
      if (maxCreatedAt === null || r.createdAt > maxCreatedAt) {
        maxCreatedAt = r.createdAt;
      }
      continue;
    }
    const post: Post = {
      id: r.id,
      type: r.type,
      category: r.category as Post["category"],
      title: r.title,
      description: r.description,
      estimatedHours: r.estimatedHours,
      urgency: r.urgency as Post["urgency"],
      postedBy: r.postedBy,
      claimedBy: null,
      status: "open",
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      locationZone: r.locationZone,
      confirmedBy: [],
      nodeId: r.nodeId,
      signature: r.signature,
    };
    // Same gate the server's POST /posts route and peer pull apply:
    // the poster's signature must verify over the canonical immutable
    // payload. A forged or tampered row is dropped WITHOUT advancing
    // the cursor (matching peerPull's rejected-row semantics).
    if (!verifyPost(post)) {
      skipped += 1;
      continue;
    }
    await db.posts.put(post);
    inserted += 1;
    if (maxCreatedAt === null || post.createdAt > maxCreatedAt) {
      maxCreatedAt = post.createdAt;
    }
  }

  if (maxCreatedAt !== null) {
    await setSetting(POST_CURSOR_KEY, String(maxCreatedAt));
  }

  return { inserted, skipped };
}

/**
 * Pull claim notifications from the community node and apply them
 * to local posts. When a cross-node member claims one of our posts,
 * the claim record arrives here and updates the local post's status
 * to "claimed" — which triggers the existing `post_claimed` attention
 * item for the poster.
 */
export async function pullFederatedClaims(): Promise<number> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return 0;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return 0;

  const since = await getSetting(CLAIM_CURSOR_KEY);
  const params = new URLSearchParams({ limit: "200" });
  if (since) params.set("since", since);

  const url = `${baseUrl.replace(/\/+$/, "")}/claims?${params.toString()}`;
  let body: { claims?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return 0;
    body = (await res.json()) as { claims?: unknown[] };
  } catch {
    return 0;
  }

  if (!Array.isArray(body.claims)) return 0;

  let applied = 0;
  let maxClaimedAt: number | null = since ? Number(since) : null;

  for (const raw of body.claims) {
    const r = raw as Record<string, unknown>;
    if (
      typeof r.postId !== "string" ||
      typeof r.claimerKey !== "string" ||
      // Claims are unsigned by design, so the timestamp bound is the
      // ONLY thing keeping a malicious node from wedging this cursor.
      !plausibleCursorStamp(r.claimedAt)
    )
      continue;

    // Advance the cursor for EVERY well-formed row, whether or not it
    // applies. Most claims legitimately don't apply on this device —
    // the post is unknown here, or already past "open" (including the
    // claimer's own post, which is already "claimed"). Advancing only
    // on applied rows meant that once a page filled with
    // non-applicable claims (server now serves oldest-first), the
    // cursor never moved and newer claims were never fetched — a
    // permanent stall. The claim record is immutable, so re-observing
    // a row we've already processed is a harmless no-op.
    if (maxClaimedAt === null || r.claimedAt > maxClaimedAt) {
      maxClaimedAt = r.claimedAt;
    }

    const post = await db.posts.get(r.postId as string);
    if (!post) continue;
    if (post.status !== "open") continue;

    await db.posts.put({
      ...post,
      status: "claimed",
      claimedBy: r.claimerKey as string,
    });
    applied += 1;
  }

  if (maxClaimedAt !== null) {
    await setSetting(CLAIM_CURSOR_KEY, String(maxClaimedAt));
  }

  return applied;
}

/**
 * Pull task comments from the configured community node. Stores
 * verified rows locally so cross-node task threads appear alongside
 * locally-authored ones.
 *
 * Tombstone-merge rule (matches the server's logic):
 *   - incoming row absent locally → insert as-is (with whatever
 *     `deletedAt` it carries)
 *   - incoming row present, alive locally, incoming has `deletedAt`
 *     → set local row's `deletedAt`
 *   - any other case → no-op (duplicate)
 *
 * Once a row is tombstoned locally it never reverts; an incoming row
 * with `deletedAt = null` against a tombstoned local row is ignored.
 */
export async function pullFederatedTaskComments(): Promise<FederationSyncResult | null> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const since = await getSetting(TASK_COMMENT_CURSOR_KEY);
  const params = new URLSearchParams({ limit: "200" });
  if (since) params.set("since", since);

  const url = `${baseUrl.replace(/\/+$/, "")}/task-comments?${params.toString()}`;
  let body: { taskComments?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    body = (await res.json()) as { taskComments?: unknown[] };
  } catch {
    return null;
  }

  if (!Array.isArray(body.taskComments)) return null;

  let inserted = 0;
  let skipped = 0;
  let maxCreatedAt: number | null = since ? Number(since) : null;

  for (const raw of body.taskComments) {
    const r = raw as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      typeof r.projectId !== "string" ||
      typeof r.taskId !== "string" ||
      typeof r.authorKey !== "string" ||
      typeof r.body !== "string" ||
      !plausibleCursorStamp(r.createdAt) ||
      typeof r.nodeId !== "string" ||
      typeof r.signature !== "string"
    ) {
      skipped += 1;
      continue;
    }
    const deletedAt = (r.deletedAt as number | null | undefined) ?? null;
    // Bound deletedAt defensively — it is NOT signature-covered, and
    // the cursor advances by max(createdAt, deletedAt), so an
    // unbounded value from a malicious/compromised node would jump
    // our high-water mark to the far future and hide every later
    // comment. Mirrors the server's parseTaskComment bound. A day of
    // clock slop matches the createdAt tolerance used elsewhere.
    const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
    if (
      deletedAt !== null &&
      (deletedAt > oneDayFromNow || deletedAt < r.createdAt)
    ) {
      skipped += 1;
      continue;
    }
    const comment: TaskComment = {
      id: r.id,
      projectId: r.projectId,
      taskId: r.taskId,
      authorKey: r.authorKey,
      body: r.body,
      createdAt: r.createdAt,
      deletedAt,
      nodeId: r.nodeId,
      signature: r.signature,
    };
    if (!verifyTaskComment(comment)) {
      skipped += 1;
      continue;
    }

    // Effective cursor position is max(createdAt, deletedAt): the
    // node windows and orders /task-comments by that value so late
    // tombstones re-enter the pull window. Advancing by createdAt
    // alone would jump the cursor past a tombstone in the same page.
    const effectiveCursorAt = Math.max(
      comment.createdAt,
      comment.deletedAt ?? 0,
    );
    const advanceCursor = () => {
      if (maxCreatedAt === null || effectiveCursorAt > maxCreatedAt) {
        maxCreatedAt = effectiveCursorAt;
      }
    };

    const existing = await db.taskComments.get(comment.id);
    if (!existing) {
      await db.taskComments.put(comment);
      inserted += 1;
      advanceCursor();
      continue;
    }
    // Already have it. If incoming carries a tombstone the local row
    // doesn't, apply the tombstone. Otherwise no-op.
    if (comment.deletedAt !== null && existing.deletedAt === null) {
      await db.taskComments.update(comment.id, {
        deletedAt: comment.deletedAt,
      });
      inserted += 1;
      advanceCursor();
      continue;
    }
    skipped += 1;
    advanceCursor();
  }

  if (maxCreatedAt !== null) {
    await setSetting(TASK_COMMENT_CURSOR_KEY, String(maxCreatedAt));
  }

  return { inserted, skipped };
}

/**
 * Pull federated exchanges from the configured community node. The
 * server-side peer-pull loop already aggregates peer exchanges into
 * the local node's store; this loop drags them down into the PWA's
 * Dexie so the Dashboard's federation panel + per-member balance
 * displays reflect cross-node flow without each PWA having to peer
 * directly with every node.
 *
 * Verification: every row goes through `verifyExchange`. For
 * `autoConfirmed: true` rows the helped-side signature is produced by
 * a peer node's system key, which this PWA doesn't have on hand —
 * `verifyExchange` accepts on a verified helper signature in that
 * case (the §4 docs/auto-confirm-key.md contract). A peer doing
 * stricter auditing would use `verifyExchangeLabel` with a system-
 * pubkey resolver; that requires a federation-wide key directory
 * that doesn't ship yet.
 *
 * Idempotent: dedup on `id`. Cursor advances on `completedAt`.
 */
export async function pullFederatedExchanges(): Promise<FederationSyncResult | null> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const since = await getSetting(EXCHANGE_CURSOR_KEY);
  const params = new URLSearchParams({ limit: "200" });
  if (since) params.set("since", since);

  const url = `${baseUrl.replace(/\/+$/, "")}/exchanges?${params.toString()}`;
  let body: { exchanges?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    body = (await res.json()) as { exchanges?: unknown[] };
  } catch {
    return null;
  }

  if (!Array.isArray(body.exchanges)) return null;

  let inserted = 0;
  let skipped = 0;
  let maxCompletedAt: number | null = since ? Number(since) : null;

  for (const raw of body.exchanges) {
    const r = raw as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      typeof r.postId !== "string" ||
      typeof r.helperKey !== "string" ||
      typeof r.helpedKey !== "string" ||
      typeof r.hoursExchanged !== "number" ||
      typeof r.helperSignature !== "string" ||
      typeof r.helpedSignature !== "string" ||
      !plausibleCursorStamp(r.completedAt) ||
      typeof r.category !== "string" ||
      typeof r.nodeId !== "string"
    ) {
      skipped += 1;
      continue;
    }
    const exchange: Exchange = {
      id: r.id,
      postId: r.postId,
      helperKey: r.helperKey,
      helpedKey: r.helpedKey,
      hoursExchanged: r.hoursExchanged,
      helperSignature: r.helperSignature,
      helpedSignature: r.helpedSignature,
      completedAt: r.completedAt,
      category: r.category as Exchange["category"],
      nodeId: r.nodeId,
      flaggedForReview:
        (r.flaggedForReview as boolean | undefined) ?? undefined,
      flagReason: (r.flagReason as Exchange["flagReason"]) ?? undefined,
      autoConfirmed: (r.autoConfirmed as boolean | undefined) ?? undefined,
      autoConfirmedBy: (r.autoConfirmedBy as string | undefined) ?? undefined,
      autoConfirmedAt:
        (r.autoConfirmedAt as number | undefined) ?? undefined,
    };

    const advanceCursor = () => {
      if (maxCompletedAt === null || exchange.completedAt > maxCompletedAt) {
        maxCompletedAt = exchange.completedAt;
      }
    };

    if (!verifyExchange(exchange)) {
      // A row we refused must never move the high-water mark — its
      // completedAt is attacker-chosen and one forged row would strand
      // every legitimate later exchange behind the poisoned cursor.
      // Same posture as pullFederatedPosts.
      skipped += 1;
      continue;
    }

    const existing = await db.exchanges.get(exchange.id);
    if (existing) {
      skipped += 1;
      advanceCursor();
      continue;
    }

    await db.exchanges.put(exchange);
    inserted += 1;
    advanceCursor();
  }

  if (maxCompletedAt !== null) {
    await setSetting(EXCHANGE_CURSOR_KEY, String(maxCompletedAt));
  }

  return { inserted, skipped };
}

/**
 * Pull federated co-organizer invitations from the configured community
 * node. Same shape as `pullFederatedExchanges`/`pullFederatedPosts`.
 * Dedupes against `db.coorgInvitations` by `id`; advances cursor on
 * the highest `createdAt` seen. Skips rows that fail signature verify.
 * See `docs/co-organizer-invitations.md` §8.
 */
export async function pullFederatedCoOrgInvitations(): Promise<FederationSyncResult | null> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const since = await getSetting(SETTING_KEYS.federationLastCoOrgInvitationPull);
  const params = new URLSearchParams({ limit: "200" });
  if (since) params.set("since", since);

  const url = `${baseUrl.replace(/\/+$/, "")}/coorg-invitations?${params.toString()}`;
  let body: { coorgInvitations?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    body = (await res.json()) as { coorgInvitations?: unknown[] };
  } catch {
    return null;
  }

  if (!Array.isArray(body.coorgInvitations)) return null;

  let inserted = 0;
  let skipped = 0;
  let maxCreatedAt: number | null = since ? Number(since) : null;

  for (const raw of body.coorgInvitations) {
    const r = raw as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      typeof r.projectId !== "string" ||
      typeof r.inviterKey !== "string" ||
      typeof r.inviteeKey !== "string" ||
      !plausibleCursorStamp(r.createdAt) ||
      typeof r.expiresAt !== "number" ||
      typeof r.nodeId !== "string" ||
      typeof r.signature !== "string"
    ) {
      skipped += 1;
      continue;
    }
    const record: CoOrganizerInvitation = {
      id: r.id,
      projectId: r.projectId,
      inviterKey: r.inviterKey,
      inviteeKey: r.inviteeKey,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      nodeId: r.nodeId,
      signature: r.signature,
    };

    const advanceCursor = () => {
      if (maxCreatedAt === null || record.createdAt > maxCreatedAt) {
        maxCreatedAt = record.createdAt;
      }
    };

    if (!verifyCoOrganizerInvitation(record)) {
      // Never advance past a refused row — see pullFederatedExchanges.
      skipped += 1;
      continue;
    }

    const existing = await db.coorgInvitations.get(record.id);
    if (existing) {
      skipped += 1;
      advanceCursor();
      continue;
    }

    await db.coorgInvitations.put(record);
    // Federation can deliver the accept response before its
    // invitation; now that the invitation is here, complete any
    // materialization the response-side hook had to skip.
    await materializeAcceptedCoOrganizer(record.id);
    inserted += 1;
    advanceCursor();
  }

  if (maxCreatedAt !== null) {
    await setSetting(
      SETTING_KEYS.federationLastCoOrgInvitationPull,
      String(maxCreatedAt),
    );
  }

  return { inserted, skipped };
}

/**
 * Pull federated co-organizer invitation responses (accept/decline).
 * Cursor: `decidedAt`. Same merge / dedupe rules as
 * `pullFederatedCoOrgInvitations`.
 */
export async function pullFederatedCoOrgResponses(): Promise<FederationSyncResult | null> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const since = await getSetting(
    SETTING_KEYS.federationLastCoOrgInvitationResponsePull,
  );
  const params = new URLSearchParams({ limit: "200" });
  if (since) params.set("since", since);

  const url = `${baseUrl.replace(/\/+$/, "")}/coorg-invitation-responses?${params.toString()}`;
  let body: { coorgInvitationResponses?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    body = (await res.json()) as { coorgInvitationResponses?: unknown[] };
  } catch {
    return null;
  }

  if (!Array.isArray(body.coorgInvitationResponses)) return null;

  let inserted = 0;
  let skipped = 0;
  let maxDecidedAt: number | null = since ? Number(since) : null;

  for (const raw of body.coorgInvitationResponses) {
    const r = raw as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      typeof r.invitationId !== "string" ||
      typeof r.inviteeKey !== "string" ||
      (r.decision !== "accept" && r.decision !== "decline") ||
      !plausibleCursorStamp(r.decidedAt) ||
      typeof r.nodeId !== "string" ||
      typeof r.signature !== "string"
    ) {
      skipped += 1;
      continue;
    }
    const record: CoOrganizerInvitationResponse = {
      id: r.id,
      invitationId: r.invitationId,
      inviteeKey: r.inviteeKey,
      decision: r.decision,
      decidedAt: r.decidedAt,
      nodeId: r.nodeId,
      signature: r.signature,
    };

    const advanceCursor = () => {
      if (maxDecidedAt === null || record.decidedAt > maxDecidedAt) {
        maxDecidedAt = record.decidedAt;
      }
    };

    if (!verifyCoOrganizerInvitationResponse(record)) {
      // Never advance past a refused row — see pullFederatedExchanges.
      skipped += 1;
      continue;
    }

    const existing = await db.coorgInvitationResponses.get(record.id);
    if (existing) {
      skipped += 1;
      advanceCursor();
      continue;
    }

    await db.coorgInvitationResponses.put(record);
    // Keep the live authority list in step with the audit trail —
    // same materialization the local accept path performs. No-ops
    // for declines and for invitations not (yet) on this node.
    if (record.decision === "accept") {
      await materializeAcceptedCoOrganizer(record.invitationId);
    }
    inserted += 1;
    advanceCursor();
  }

  if (maxDecidedAt !== null) {
    await setSetting(
      SETTING_KEYS.federationLastCoOrgInvitationResponsePull,
      String(maxDecidedAt),
    );
  }

  return { inserted, skipped };
}

/**
 * Pull federated co-organizer invitation revocations. Cursor:
 * `revokedAt`. Same merge / dedupe rules as the other coorg pulls.
 */
export async function pullFederatedCoOrgRevocations(): Promise<FederationSyncResult | null> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const since = await getSetting(
    SETTING_KEYS.federationLastCoOrgInvitationRevocationPull,
  );
  const params = new URLSearchParams({ limit: "200" });
  if (since) params.set("since", since);

  const url = `${baseUrl.replace(/\/+$/, "")}/coorg-invitation-revocations?${params.toString()}`;
  let body: { coorgInvitationRevocations?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    body = (await res.json()) as { coorgInvitationRevocations?: unknown[] };
  } catch {
    return null;
  }

  if (!Array.isArray(body.coorgInvitationRevocations)) return null;

  let inserted = 0;
  let skipped = 0;
  let maxRevokedAt: number | null = since ? Number(since) : null;

  for (const raw of body.coorgInvitationRevocations) {
    const r = raw as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      typeof r.invitationId !== "string" ||
      typeof r.inviterKey !== "string" ||
      !plausibleCursorStamp(r.revokedAt) ||
      typeof r.nodeId !== "string" ||
      typeof r.signature !== "string"
    ) {
      skipped += 1;
      continue;
    }
    const record: CoOrganizerInvitationRevocation = {
      id: r.id,
      invitationId: r.invitationId,
      inviterKey: r.inviterKey,
      revokedAt: r.revokedAt,
      nodeId: r.nodeId,
      signature: r.signature,
    };

    const advanceCursor = () => {
      if (maxRevokedAt === null || record.revokedAt > maxRevokedAt) {
        maxRevokedAt = record.revokedAt;
      }
    };

    if (!verifyCoOrganizerInvitationRevocation(record)) {
      // Never advance past a refused row — see pullFederatedExchanges.
      skipped += 1;
      continue;
    }

    const existing = await db.coorgInvitationRevocations.get(record.id);
    if (existing) {
      skipped += 1;
      advanceCursor();
      continue;
    }

    await db.coorgInvitationRevocations.put(record);
    inserted += 1;
    advanceCursor();
  }

  if (maxRevokedAt !== null) {
    await setSetting(
      SETTING_KEYS.federationLastCoOrgInvitationRevocationPull,
      String(maxRevokedAt),
    );
  }

  return { inserted, skipped };
}

/**
 * Pull federated community events from the configured community node.
 * Same shape and merge / dedup rules as `pullFederatedCoOrgInvitations`.
 * Cursor: `createdAt` (matches `EventPayload.createdAt`); defaults to
 * epoch 0 when the cursor setting is absent.
 *
 * Signature verification is via `verifyEvent` (single-signer
 * discipline: organizer = `createdBy`). Bad-signature rows are
 * skipped with a console warning and the cursor does NOT advance past
 * the rejected row — same posture as the other federated record
 * types, so a transient peer-side bug doesn't strand the cursor.
 *
 * See `docs/community-events.md` §7. The peer-pull route on the server
 * side lands in PR D; until then this function will silently return
 * `null` (no body) on a 404 and the cursor stays where it is.
 */
export async function pullFederatedEvents(): Promise<FederationSyncResult | null> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const since =
    (await getSetting(SETTING_KEYS.federationLastEventPull)) ?? "0";
  const params = new URLSearchParams({ limit: "200", since });

  const url = `${baseUrl.replace(/\/+$/, "")}/events?${params.toString()}`;
  let body: { events?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    body = (await res.json()) as { events?: unknown[] };
  } catch {
    return null;
  }

  if (!Array.isArray(body.events)) return null;

  let inserted = 0;
  let skipped = 0;
  let maxCreatedAt: number | null = Number(since);

  for (const raw of body.events) {
    const r = raw as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      r.kind !== "event" ||
      typeof r.title !== "string" ||
      typeof r.description !== "string" ||
      typeof r.category !== "string" ||
      typeof r.startsAt !== "number" ||
      (r.endsAt !== null && typeof r.endsAt !== "number") ||
      typeof r.location !== "string" ||
      (r.capacity !== null && typeof r.capacity !== "number") ||
      (r.templateId !== null && typeof r.templateId !== "string") ||
      !plausibleCursorStamp(r.createdAt) ||
      typeof r.createdBy !== "string" ||
      typeof r.nodeId !== "string" ||
      typeof r.signature !== "string"
    ) {
      skipped += 1;
      continue;
    }
    const record: Event = {
      id: r.id,
      kind: "event",
      title: r.title,
      description: r.description,
      category: r.category,
      startsAt: r.startsAt,
      endsAt: r.endsAt as number | null,
      location: r.location,
      capacity: r.capacity as number | null,
      templateId: r.templateId as string | null,
      createdAt: r.createdAt,
      createdBy: r.createdBy,
      nodeId: r.nodeId,
      signature: r.signature,
    };

    if (!verifyEvent(record)) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "[understoria] dropped federated event with bad signature",
          { id: record.id, nodeId: record.nodeId },
        );
      }
      skipped += 1;
      // Do NOT advance the cursor past a rejected row — see function
      // doc.
      continue;
    }

    const advanceCursor = () => {
      if (maxCreatedAt === null || record.createdAt > maxCreatedAt) {
        maxCreatedAt = record.createdAt;
      }
    };

    const existing = await db.events.get(record.id);
    if (existing) {
      skipped += 1;
      advanceCursor();
      continue;
    }

    await db.events.put(record);
    inserted += 1;
    advanceCursor();
  }

  if (maxCreatedAt !== null) {
    await setSetting(
      SETTING_KEYS.federationLastEventPull,
      String(maxCreatedAt),
    );
  }

  return { inserted, skipped };
}

/**
 * Pull federated event cancellations. Cursor: `cancelledAt`. Same
 * merge / dedup rules as `pullFederatedEvents`. See
 * `docs/community-events.md` §7.
 *
 * NB: this client verifies the signature only. The cross-record check
 * that the cancellation's `createdBy` equals the cancelled event's
 * `createdBy` is the server route's job (PR D) and is re-asserted by
 * the application layer when a UI surface renders cancellation state.
 */
export async function pullFederatedEventCancellations(): Promise<FederationSyncResult | null> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const since =
    (await getSetting(SETTING_KEYS.federationLastEventCancellationPull)) ?? "0";
  const params = new URLSearchParams({ limit: "200", since });

  const url = `${baseUrl.replace(/\/+$/, "")}/event-cancellations?${params.toString()}`;
  let body: { eventCancellations?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    body = (await res.json()) as { eventCancellations?: unknown[] };
  } catch {
    return null;
  }

  if (!Array.isArray(body.eventCancellations)) return null;

  let inserted = 0;
  let skipped = 0;
  let maxCancelledAt: number | null = Number(since);

  for (const raw of body.eventCancellations) {
    const r = raw as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      r.kind !== "event_cancellation" ||
      typeof r.eventId !== "string" ||
      typeof r.reason !== "string" ||
      !plausibleCursorStamp(r.cancelledAt) ||
      typeof r.createdBy !== "string" ||
      typeof r.nodeId !== "string" ||
      typeof r.signature !== "string"
    ) {
      skipped += 1;
      continue;
    }
    const record: EventCancellation = {
      id: r.id,
      kind: "event_cancellation",
      eventId: r.eventId,
      reason: r.reason,
      cancelledAt: r.cancelledAt,
      createdBy: r.createdBy,
      nodeId: r.nodeId,
      signature: r.signature,
    };

    if (!verifyEventCancellation(record)) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "[understoria] dropped federated event cancellation with bad signature",
          { id: record.id, eventId: record.eventId, nodeId: record.nodeId },
        );
      }
      skipped += 1;
      continue;
    }

    const advanceCursor = () => {
      if (maxCancelledAt === null || record.cancelledAt > maxCancelledAt) {
        maxCancelledAt = record.cancelledAt;
      }
    };

    const existing = await db.eventCancellations.get(record.id);
    if (existing) {
      skipped += 1;
      advanceCursor();
      continue;
    }

    await db.eventCancellations.put(record);
    inserted += 1;
    advanceCursor();
  }

  if (maxCancelledAt !== null) {
    await setSetting(
      SETTING_KEYS.federationLastEventCancellationPull,
      String(maxCancelledAt),
    );
  }

  return { inserted, skipped };
}

/**
 * Pull redemption receipts from the community node — Phase 1 of
 * `docs/invite-redemption.md` (§6–§7). This is the leg that ends the
 * incident: the inviter's invite row flips open→redeemed on her next
 * pull, and the new member materializes on EVERY member device's
 * roster, not just her own.
 *
 * Cursor: the server-assigned `receivedAt` riding on each row — the
 * §7 deviation from the sibling pulls' client-timestamp cursors. A
 * skewed or back-dated `redeemedAt` must never strand a receipt
 * below the cursor forever ("inviter offline for a week must still
 * converge").
 *
 * Verification: `parseRedemption` + `verifyRedemptionReceipt` — the
 * exact shape-and-crypto gate the server route runs (both
 * signatures, self-redeem, redeemedAt-vs-expiry). Bad rows are
 * skipped WITHOUT advancing the cursor past them, same posture as
 * `pullFederatedEvents`.
 *
 * Merge rules (§6 — commutative and idempotent; every receipt is
 * self-contained so arrival order never matters):
 *   - no local row for the token → insert a redeemed InviteRow and
 *     materialize a member row for `redeemedBy` if none exists
 *   - local row "open" (the inviter's device) → flip to redeemed
 *   - local row "revoked" → keep revoked (never a trust edge), but
 *     record redemption-observed so the Invites page can surface
 *     "used after you revoked it" — a community conversation, not an
 *     automatic ejection (`community-authority`)
 *   - local row "redeemed", same redeemedBy → no-op
 *   - local row "redeemed", different redeemedBy → keep the local
 *     row and log; the server's first-writer-wins makes this
 *     unreachable in practice
 *
 * Member materialization deliberately NEVER clobbers an existing
 * member row: the invitee's own device (skills, availability, edited
 * name) and any later profile state must win over the receipt's
 * skeleton. New rows go through `createMember` so every device
 * computes identical starting balances from the same constants.
 */
export async function pullFederatedRedemptions(): Promise<FederationSyncResult | null> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const since =
    (await getSetting(SETTING_KEYS.federationLastRedemptionPull)) ?? "0";
  const params = new URLSearchParams({ limit: "200", since });

  const url = `${baseUrl.replace(/\/+$/, "")}/redemptions?${params.toString()}`;
  let body: { redemptions?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    body = (await res.json()) as { redemptions?: unknown[] };
  } catch {
    return null;
  }

  if (!Array.isArray(body.redemptions)) return null;

  let inserted = 0;
  let skipped = 0;
  let maxReceivedAt: number | null = Number(since);

  for (const raw of body.redemptions) {
    const r = raw as Record<string, unknown>;
    const receivedAt = r.receivedAt;
    const parsed = parseRedemption(raw);
    if (!parsed.ok || !plausibleCursorStamp(receivedAt)) {
      skipped += 1;
      continue;
    }
    const receipt = parsed.value;

    if (!verifyRedemptionReceipt(receipt)) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "[understoria] dropped federated redemption receipt that failed verification",
          { token: receipt.invite.token },
        );
      }
      skipped += 1;
      // Do NOT advance the cursor past a rejected row.
      continue;
    }

    const advanceCursor = () => {
      if (maxReceivedAt === null || receivedAt > maxReceivedAt) {
        maxReceivedAt = receivedAt;
      }
    };

    const existing = await db.invites.get(receipt.invite.token);
    let changed = false;

    if (!existing) {
      // Every other member's device: the invite was never seen here.
      await db.invites.put({
        token: receipt.invite.token,
        inviterKey: receipt.invite.inviterKey,
        nodeId: receipt.invite.nodeId,
        createdAt: receipt.invite.createdAt,
        expiresAt: receipt.invite.expiresAt,
        status: "redeemed",
        redeemedBy: receipt.redeemedBy,
        redeemedAt: receipt.redeemedAt,
        // Reconstructable from the embedded invite; the token is dead
        // post-redemption, so this is display/bookkeeping only.
        encoded: encodeInviteToken(receipt.invite),
      });
      changed = true;
    } else if (existing.status === "open") {
      // The inviter's device — the row that stayed "open" forever in
      // the incident.
      await db.invites.update(receipt.invite.token, {
        status: "redeemed",
        redeemedBy: receipt.redeemedBy,
        redeemedAt: receipt.redeemedAt,
      });
      changed = true;
    } else if (existing.status === "revoked") {
      // Revocation arrived first (locally revoked, or a federated
      // revocation converged here before the receipt). If the
      // revocation is AUTHORITATIVE — its inviterKey matches the
      // receipt's embedded, inviter-signed invite (docs/invite-
      // revocation.md §3.1) — the terminal state is
      // redeemed_despite_revocation on every device. If it does NOT
      // match, the local "revoked" was never a real inviter's
      // revocation, so the genuine redemption wins and we correct the
      // row to plain redeemed.
      const authoritative =
        existing.revokedAt != null &&
        existing.inviterKey === receipt.invite.inviterKey;
      await db.invites.update(receipt.invite.token, {
        status: authoritative ? "redeemed_despite_revocation" : "redeemed",
        redeemedBy: receipt.redeemedBy,
        redeemedAt: receipt.redeemedAt,
        // Keep the older §6 observation fields populated for the
        // Invites page's "used after you revoked it" line.
        redemptionObservedAt: authoritative
          ? existing.redemptionObservedAt ?? receipt.redeemedAt
          : existing.redemptionObservedAt,
        redemptionObservedBy: authoritative
          ? existing.redemptionObservedBy ?? receipt.redeemedBy
          : existing.redemptionObservedBy,
        revokedAt: authoritative ? existing.revokedAt : null,
        // Correct the authoritative invite fields from the receipt —
        // a revocation-only placeholder row carried only guesses for
        // these until the real embedded invite arrived.
        inviterKey: receipt.invite.inviterKey,
        nodeId: receipt.invite.nodeId,
        createdAt: receipt.invite.createdAt,
        expiresAt: receipt.invite.expiresAt,
        encoded: encodeInviteToken(receipt.invite),
      });
      changed = true;
    } else if (
      existing.status === "redeemed" &&
      existing.redeemedBy !== receipt.redeemedBy
    ) {
      // Should be unreachable — the server enforces first-writer-wins
      // on the token (§7). Keep the local row; log for triage.
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "[understoria] pulled redemption receipt conflicts with local redeemed row; keeping local",
          { token: receipt.invite.token },
        );
      }
    }

    // Roster materialization — the §3 commitment 2. Skeleton row only
    // when the member is unknown here; an existing row (the invitee's
    // own device, or one enriched by later edits) always wins.
    const knownMember = await db.members.get(receipt.redeemedBy);
    if (!knownMember) {
      await createMember(
        {
          publicKey: receipt.redeemedBy,
          displayName: receipt.displayName,
          createdAt: receipt.redeemedAt,
        },
        receipt.invite.nodeId,
      );
      changed = true;
    }

    if (changed) {
      inserted += 1;
    } else {
      skipped += 1;
    }
    advanceCursor();
  }

  if (maxReceivedAt !== null) {
    await setSetting(
      SETTING_KEYS.federationLastRedemptionPull,
      String(maxReceivedAt),
    );
  }

  return { inserted, skipped };
}

/**
 * Pull invite revocations from the community node — Phase 1 of
 * `docs/invite-revocation.md`. Converges the newcomer's trust state
 * across devices: without this leg, a revoked-then-redeemed invite
 * showed `revoked` only on the inviter's device and `redeemed`
 * (counting the implicit vouch) everywhere else.
 *
 * Cursor: the server-assigned `receivedAt`, same skew-safe deviation
 * as the redemption pull. Verification: `verifyInviteRevocation` per
 * row; bad signatures skipped WITHOUT advancing the cursor.
 *
 * Merge — presence-based and commutative (§5). The revocation is
 * AUTHORITY-BOUND only when its `inviterKey` matches the local
 * redeemed row's inviterKey (which came from the receipt's embedded,
 * inviter-signed invite, §3.1); an unauthoritative revocation for a
 * redeemed token is ignored. A revocation with no local row is stored
 * as a placeholder so a later receipt converges to
 * `redeemed_despite_revocation`.
 */
export async function pullFederatedInviteRevocations(): Promise<FederationSyncResult | null> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const since =
    (await getSetting(SETTING_KEYS.federationLastInviteRevocationPull)) ?? "0";
  const params = new URLSearchParams({ limit: "200", since });
  const url = `${baseUrl.replace(/\/+$/, "")}/invite-revocations?${params.toString()}`;

  let body: { inviteRevocations?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    body = (await res.json()) as { inviteRevocations?: unknown[] };
  } catch {
    return null;
  }
  if (!Array.isArray(body.inviteRevocations)) return null;

  let inserted = 0;
  let skipped = 0;
  let maxReceivedAt: number | null = Number(since);

  for (const raw of body.inviteRevocations) {
    const r = raw as Record<string, unknown>;
    const receivedAt = r.receivedAt;
    const parsed = parseInviteRevocation(raw);
    if (!parsed.ok || !plausibleCursorStamp(receivedAt)) {
      skipped += 1;
      continue;
    }
    const revocation = parsed.value;
    if (!verifyInviteRevocation(revocation)) {
      skipped += 1;
      // Do NOT advance the cursor past a rejected row.
      continue;
    }

    const advanceCursor = () => {
      if (maxReceivedAt === null || receivedAt > maxReceivedAt) {
        maxReceivedAt = receivedAt;
      }
    };

    const existing = await db.invites.get(revocation.token);
    let changed = false;

    if (!existing) {
      // Revocation arrived before any receipt on this device. Store a
      // placeholder revoked row so a later receipt converges to
      // redeemed_despite_revocation. createdAt/expiresAt/encoded are
      // unknown here (we never saw the invite) — corrected from the
      // receipt's embedded invite if one arrives.
      await db.invites.put({
        token: revocation.token,
        inviterKey: revocation.inviterKey,
        nodeId: revocation.nodeId,
        createdAt: revocation.revokedAt,
        expiresAt: revocation.revokedAt,
        status: "revoked",
        redeemedBy: null,
        redeemedAt: null,
        encoded: "",
        revokedAt: revocation.revokedAt,
      });
      changed = true;
    } else if (existing.inviterKey !== revocation.inviterKey) {
      // Authority binding (§3.1): a revocation can only act on a token
      // whose real inviter it names. A mismatch is a third party
      // trying to revoke someone else's invite — inert. Do NOT advance
      // the cursor past it (same posture as a bad signature): the
      // mismatch may be TRANSIENT — e.g. an attacker's revocation
      // landed first as the placeholder row, making the REAL inviter's
      // revocation mismatch until the receipt corrects inviterKey —
      // and an advanced cursor would strand the genuine revocation
      // forever. Left below the high-water mark, it is re-served and
      // re-evaluated on every pull, and applies as soon as the row's
      // inviterKey converges to the receipt's embedded truth.
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "[understoria] dropped invite revocation whose inviterKey does not match the local invite",
          { token: revocation.token },
        );
      }
      skipped += 1;
      continue;
    } else if (
      existing.status === "redeemed" ||
      existing.status === "redeemed_despite_revocation"
    ) {
      // Receipt already seen — the terminal state is
      // redeemed_despite_revocation. Idempotent once revokedAt is set.
      if (
        existing.status !== "redeemed_despite_revocation" ||
        existing.revokedAt == null
      ) {
        await db.invites.update(revocation.token, {
          status: "redeemed_despite_revocation",
          revokedAt: revocation.revokedAt,
        });
        changed = true;
      }
    } else if (existing.revokedAt == null) {
      // Open / already-revoked row without the marker — record the
      // revocation. (The inviter's own device already set this locally;
      // this is the idempotent / other-device path.)
      await db.invites.update(revocation.token, {
        status: "revoked",
        revokedAt: revocation.revokedAt,
      });
      changed = true;
    }

    if (changed) inserted += 1;
    else skipped += 1;
    advanceCursor();
  }

  if (maxReceivedAt !== null) {
    await setSetting(
      SETTING_KEYS.federationLastInviteRevocationPull,
      String(maxReceivedAt),
    );
  }

  return { inserted, skipped };
}

/**
 * Pull manual vouches from the community node — the §9 companion leg
 * of `docs/invite-redemption.md`. The server route
 * (`GET /vouches?since=`) has existed since vouch federation shipped
 * and already serves this data to any peer node; what never existed
 * was a device-side pull, so a manual vouch was visible only on the
 * device that authored it and trust status diverged per device.
 * Without this leg the receipt work would let everyone SEE the new
 * member but nobody see her become trusted.
 *
 * Same house shape as the sibling pulls: verify (`verifyVouch`)
 * before insert, dedup on `id`, cursor on `createdAt`, bad
 * signatures skipped without advancing the cursor.
 */
export async function pullFederatedVouches(): Promise<FederationSyncResult | null> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  if (enabled !== "1") return null;
  const baseUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (!baseUrl) return null;

  const since = await getSetting(SETTING_KEYS.federationLastVouchPull);
  const params = new URLSearchParams({ limit: "200" });
  if (since) params.set("since", since);

  const url = `${baseUrl.replace(/\/+$/, "")}/vouches?${params.toString()}`;
  let body: { vouches?: unknown[] };
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    body = (await res.json()) as { vouches?: unknown[] };
  } catch {
    return null;
  }

  if (!Array.isArray(body.vouches)) return null;

  let inserted = 0;
  let skipped = 0;
  let maxCreatedAt: number | null = since ? Number(since) : null;

  for (const raw of body.vouches) {
    const r = raw as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      typeof r.voucherKey !== "string" ||
      typeof r.voucheeKey !== "string" ||
      !plausibleCursorStamp(r.createdAt) ||
      (r.kind !== "invite" && r.kind !== "manual") ||
      typeof r.signature !== "string"
    ) {
      skipped += 1;
      continue;
    }
    const vouch: SignedVouch = {
      id: r.id,
      voucherKey: r.voucherKey,
      voucheeKey: r.voucheeKey,
      createdAt: r.createdAt,
      kind: r.kind,
      signature: r.signature,
    };

    if (!verifyVouch(vouch)) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "[understoria] dropped federated vouch with bad signature",
          { id: vouch.id },
        );
      }
      skipped += 1;
      continue;
    }

    const advanceCursor = () => {
      if (maxCreatedAt === null || vouch.createdAt > maxCreatedAt) {
        maxCreatedAt = vouch.createdAt;
      }
    };

    const existing = await db.vouches.get(vouch.id);
    if (existing) {
      skipped += 1;
      advanceCursor();
      continue;
    }

    await db.vouches.put(vouch);
    inserted += 1;
    advanceCursor();
  }

  if (maxCreatedAt !== null) {
    await setSetting(
      SETTING_KEYS.federationLastVouchPull,
      String(maxCreatedAt),
    );
  }

  return { inserted, skipped };
}

// NOTE: there is intentionally no `pullFederatedEventRsvps`. RSVPs
// never federate — see `docs/community-events.md` §7.2.
