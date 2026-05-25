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
import type { Post } from "@/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";

const CURSOR_KEY = "federationLastPostPull";

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

  const since = await getSetting(CURSOR_KEY);
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
    await setSetting(CURSOR_KEY, String(maxCreatedAt));
  }

  return { inserted, skipped };
}
