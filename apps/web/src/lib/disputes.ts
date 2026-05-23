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
import type { Member, Post } from "@/types";

// Pure listing for the community-visible disputes surface. Pairs
// with `db/actions.ts:disputeExchange` which sets a post's status
// to "disputed"; this function just makes those visible to the
// whole community in one place. No resolution lifecycle yet — view
// only is intentional for the first slice, so we can see what real
// disputes look like before designing the resolution flow (Agent 12
// in docs/roadmap.md).
//
// Helper / recipient direction depends on post type:
//   NEED: postedBy = recipient, claimedBy = helper
//   OFFER: postedBy = helper, claimedBy = recipient
// Same convention as PostDetail.

export interface DisputeListing {
  postId: string;
  postTitle: string;
  postType: Post["type"];
  category: Post["category"];
  hours: number;
  helperKey: string | null;
  helperName: string | null;
  recipientKey: string;
  recipientName: string;
  /** Post creation timestamp. We don't currently persist a separate
   *  "flagged at" timestamp; adding one would be a small follow-up
   *  if the cadence of disputes makes recency-of-flag useful. */
  createdAt: number;
}

export function listDisputes(
  posts: readonly Post[],
  members: readonly Member[],
): DisputeListing[] {
  const nameByKey = new Map<string, string>();
  for (const m of members) nameByKey.set(m.publicKey, m.displayName);

  const out: DisputeListing[] = [];
  for (const p of posts) {
    if (p.status !== "disputed") continue;
    const helperKey = p.type === "NEED" ? p.claimedBy : p.postedBy;
    const recipientKey = p.type === "NEED" ? p.postedBy : p.claimedBy;
    // Skip malformed rows where the recipient isn't set — disputed
    // posts always went through the claim flow, so both parties
    // should be present, but the type is `claimedBy: string | null`
    // so we guard.
    if (recipientKey === null) continue;
    out.push({
      postId: p.id,
      postTitle: p.title,
      postType: p.type,
      category: p.category,
      hours: p.estimatedHours,
      helperKey,
      helperName: helperKey ? (nameByKey.get(helperKey) ?? null) : null,
      recipientKey,
      recipientName: nameByKey.get(recipientKey) ?? "—",
      createdAt: p.createdAt,
    });
  }
  // Newest disputes first. Once "flaggedAt" is persisted, sort by
  // that instead.
  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}
