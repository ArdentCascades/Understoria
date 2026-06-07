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
import type { Exchange, Post, TaskComment } from "@/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { verifyTaskComment } from "@/lib/crypto";
import { verifyExchange } from "@understoria/shared/crypto";

const POST_CURSOR_KEY = "federationLastPostPull";
const CLAIM_CURSOR_KEY = "federationLastClaimPull";
const TASK_COMMENT_CURSOR_KEY = "federationLastTaskCommentPull";
const EXCHANGE_CURSOR_KEY = SETTING_KEYS.federationLastExchangePull;

export interface FederationSyncResult {
  inserted: number;
  skipped: number;
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
    if (typeof r.id !== "string" || typeof r.createdAt !== "number") {
      skipped += 1;
      continue;
    }
    const existing = await db.posts.get(r.id as string);
    if (existing) {
      skipped += 1;
      if (maxCreatedAt === null || r.createdAt > maxCreatedAt) {
        maxCreatedAt = r.createdAt;
      }
      continue;
    }
    const post: Post = {
      id: r.id as string,
      type: (r.type as Post["type"]) ?? "NEED",
      category: (r.category as Post["category"]) ?? "other",
      title: (r.title as string) ?? "",
      description: (r.description as string) ?? "",
      estimatedHours: (r.estimatedHours as number) ?? 1,
      urgency: (r.urgency as Post["urgency"]) ?? "low",
      postedBy: (r.postedBy as string) ?? "",
      claimedBy: null,
      status: "open",
      createdAt: r.createdAt,
      expiresAt: (r.expiresAt as number | null) ?? null,
      locationZone: (r.locationZone as string) ?? "",
      confirmedBy: [],
      nodeId: (r.nodeId as string) ?? "",
      signature: (r.signature as string) ?? "",
    };
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
      typeof r.claimedAt !== "number"
    )
      continue;

    const post = await db.posts.get(r.postId as string);
    if (!post) continue;
    if (post.status !== "open") continue;

    await db.posts.put({
      ...post,
      status: "claimed",
      claimedBy: r.claimerKey as string,
    });
    applied += 1;

    if (maxClaimedAt === null || r.claimedAt > maxClaimedAt) {
      maxClaimedAt = r.claimedAt;
    }
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
      typeof r.createdAt !== "number" ||
      typeof r.nodeId !== "string" ||
      typeof r.signature !== "string"
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
      deletedAt: (r.deletedAt as number | null | undefined) ?? null,
      nodeId: r.nodeId,
      signature: r.signature,
    };
    if (!verifyTaskComment(comment)) {
      skipped += 1;
      continue;
    }

    const advanceCursor = () => {
      if (maxCreatedAt === null || comment.createdAt > maxCreatedAt) {
        maxCreatedAt = comment.createdAt;
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
      typeof r.completedAt !== "number" ||
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
      skipped += 1;
      advanceCursor();
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
