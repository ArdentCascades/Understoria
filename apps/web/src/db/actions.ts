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
import { db } from "./database";
import { BLOCKED_ACTION_MESSAGE, isMutuallyBlocked } from "./blocks";
import { buildDisputeProposal } from "./proposals";
import { diffAchievements } from "@/lib/achievements";
import { computeZoneReachForHelper } from "@/lib/flow";
import { getNodeConfig } from "./nodeConfig";
import { uuid } from "@/lib/id";
import { canonicalExchangePayload, sign } from "@/lib/crypto";
import { canonicalPostPayload } from "@understoria/shared/crypto";
import { enqueueClaimOutbox } from "@/lib/outbox";
import {
  assertWithinDailyLimit,
  evaluateSafeguards,
  exceedsDailyLimit,
} from "@/lib/safeguards";
import { getSecretKey } from "./secrets";
import {
  enqueueExchangeOutbox,
  enqueuePostOutbox,
  flushOutboxNow,
} from "@/lib/outbox";
import type { Achievement, AvailabilityChip, Category, Exchange, Member, Post, PostType, Urgency } from "@/types";

/**
 * Resolve the secret keys for the two parties that need to sign the
 * exchange tied to `postId`. Goes through the session-aware
 * getSecretKey() so a locked device refuses to sign. Called outside any
 * transaction so the signing table (and any passphrase unwrap) can
 * remain off the transaction scope.
 */
async function preloadSignerKeys(
  postId: string,
  memberKey: string,
): Promise<Map<string, string>> {
  const post = await db.posts.get(postId);
  if (!post) return new Map();
  const parties = new Set<string>();
  parties.add(post.postedBy);
  if (post.claimedBy) parties.add(post.claimedBy);
  parties.add(memberKey);
  const entries = await Promise.all(
    Array.from(parties).map(async (pk) => {
      try {
        return [pk, await getSecretKey(pk)] as const;
      } catch {
        return null;
      }
    }),
  );
  return new Map(entries.filter((e): e is readonly [string, string] => !!e));
}

export interface CreatePostInput {
  type: PostType;
  category: Category;
  title: string;
  description: string;
  estimatedHours: number;
  urgency: Urgency;
  expiresAt: number | null;
}

export async function createPost(
  memberKey: string,
  locationZone: string,
  input: CreatePostInput,
  nodeId: string,
): Promise<Post> {
  // Pre-load the poster's secret key BEFORE opening the write
  // transaction — same pattern as confirmExchange. A locked session
  // will throw from getSecretKey rather than producing an unsigned
  // post or a half-written row.
  const posterSecret = await getSecretKey(memberKey);
  const immutable = {
    id: uuid(),
    type: input.type,
    category: input.category,
    title: input.title.trim(),
    description: input.description.trim(),
    estimatedHours: input.estimatedHours,
    urgency: input.urgency,
    postedBy: memberKey,
    createdAt: Date.now(),
    expiresAt: input.expiresAt,
    locationZone,
    nodeId,
  };
  const signature = sign(canonicalPostPayload(immutable), posterSecret);
  const post: Post = {
    ...immutable,
    claimedBy: null,
    status: "open",
    confirmedBy: [],
    signature,
  };
  await db.transaction("rw", [db.posts, db.outbox, db.settings], async () => {
    await db.posts.put(post);
    await enqueuePostOutbox(post);
  });
  // Kick the outbox worker so a configured node sees this post right
  // away. Same pattern confirmExchange uses.
  void flushOutboxNow().catch((err) => {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[understoria] post flush kick crashed", err);
    }
  });
  return post;
}

export async function claimPost(
  postId: string,
  memberKey: string,
  localNodeId?: string,
): Promise<Post> {
  // PR F: Posts (claiming) is a (c) bidirectional gate per
  // docs/blocking.md §6. Pre-load the post outside the transaction
  // so we can run the block check; generic-error discipline (§6.1) —
  // same copy as the "post no longer available" branch a withdrawn
  // post would return.
  const preflightPost = await db.posts.get(postId);
  if (
    preflightPost &&
    (await isMutuallyBlocked(memberKey, preflightPost.postedBy))
  ) {
    throw new Error(BLOCKED_ACTION_MESSAGE);
  }
  return db.transaction("rw", [db.posts, db.outbox, db.settings], async () => {
    const post = await db.posts.get(postId);
    if (!post) throw new Error("Post not found");
    if (post.status !== "open") throw new Error("Post is no longer open");
    if (post.postedBy === memberKey)
      throw new Error("You can't claim your own post");
    const updated: Post = {
      ...post,
      claimedBy: memberKey,
      status: "claimed",
    };
    await db.posts.put(updated);
    if (localNodeId && post.nodeId !== localNodeId && post.nodeId !== "") {
      await enqueueClaimOutbox({
        postId: post.id,
        claimerKey: memberKey,
        claimedAt: Date.now(),
        nodeId: localNodeId,
      });
    }
    return updated;
  });
}

export async function unclaimPost(
  postId: string,
  memberKey: string,
): Promise<Post> {
  return db.transaction("rw", db.posts, async () => {
    const post = await db.posts.get(postId);
    if (!post) throw new Error("Post not found");
    if (post.claimedBy !== memberKey)
      throw new Error("Only the claimer can release this post");
    if (post.status !== "claimed")
      throw new Error("Post cannot be unclaimed from its current state");
    const updated: Post = {
      ...post,
      claimedBy: null,
      status: "open",
      confirmedBy: [],
    };
    await db.posts.put(updated);
    return updated;
  });
}

export async function cancelPost(
  postId: string,
  memberKey: string,
): Promise<Post> {
  return db.transaction("rw", db.posts, async () => {
    const post = await db.posts.get(postId);
    if (!post) throw new Error("Post not found");
    if (post.postedBy !== memberKey)
      throw new Error("Only the poster can cancel a post");
    if (post.status === "completed")
      throw new Error("A completed exchange cannot be cancelled");
    const updated: Post = { ...post, status: "cancelled" };
    await db.posts.put(updated);
    return updated;
  });
}

export interface ConfirmResult {
  post: Post;
  exchange: Exchange | null;
  newAchievements: Achievement[];
}

/**
 * Records a member's confirmation that an exchange is complete. Once both
 * the helper and the helped party confirm, an Exchange record is signed and
 * credits transfer. This follows the "signed by both parties" model so the
 * record can be federated and independently verified (Agent 2/3).
 */
export async function confirmExchange(
  postId: string,
  memberKey: string,
  nodeId: string,
): Promise<ConfirmResult> {
  // Pre-load both secret keys before opening the transaction so the
  // signing step can happen synchronously inside it. The secretKeys table
  // is intentionally excluded from the write transaction — secrets are
  // device-local and never participate in the exchange record.
  const preflight = await preloadSignerKeys(postId, memberKey);
  // Read node config before opening the rw transaction so the safeguard
  // thresholds match the values an operator most recently configured.
  // Reading inside the transaction would also work but adds nodeConfig
  // to the rw scope unnecessarily.
  const nodeConfig = await getNodeConfig(nodeId);

  const result = await db.transaction(
    "rw",
    [
      db.posts,
      db.exchanges,
      db.achievements,
      db.outbox,
      db.settings,
      db.members,
    ],
    async () => {
      const post = await db.posts.get(postId);
      if (!post) throw new Error("Post not found");
      if (post.status === "completed")
        throw new Error("Already completed");
      if (post.status !== "claimed" && post.status !== "awaiting_confirmation")
        throw new Error("Post is not ready for completion");
      if (!post.claimedBy)
        throw new Error("Post must be claimed before confirming completion");
      if (memberKey !== post.postedBy && memberKey !== post.claimedBy)
        throw new Error("Only the two parties can confirm this exchange");

      const confirmedBy = Array.from(
        new Set([...post.confirmedBy, memberKey]),
      );
      const bothConfirmed =
        confirmedBy.includes(post.postedBy) &&
        confirmedBy.includes(post.claimedBy);

      if (!bothConfirmed) {
        const updated: Post = {
          ...post,
          status: "awaiting_confirmation",
          confirmedBy,
          // Stamp the transition moment (first confirmation only — a
          // repeat confirm by the same party must not slide the
          // window). The auto-confirm sweep measures its waiting
          // period from this, NOT from createdAt: an old post claimed
          // and completed today has been "awaiting" for hours, not
          // weeks, and the helped party's dispute window starts now.
          awaitingSince: post.awaitingSince ?? Date.now(),
        };
        await db.posts.put(updated);
        return { post: updated, exchange: null, newAchievements: [] };
      }

      // Determine who helped whom based on post type.
      const helperKey =
        post.type === "NEED" ? post.claimedBy : post.postedBy;
      const helpedKey =
        post.type === "NEED" ? post.postedBy : post.claimedBy;

      const now = Date.now();

      // Anti-gaming safeguards. Thresholds come from per-node config
      // (Agent 11); falls back to shipped defaults when nothing's set.
      const existingExchanges = await db.exchanges.toArray();
      assertWithinDailyLimit(helperKey, existingExchanges, now, nodeConfig);
      const flag = evaluateSafeguards(
        {
          helperKey,
          helpedKey,
          hoursExchanged: post.estimatedHours,
          completedAt: now,
        },
        existingExchanges,
        nodeConfig,
      );

      const payload = canonicalExchangePayload({
        postId: post.id,
        helperKey,
        helpedKey,
        hours: post.estimatedHours,
        category: post.category,
        completedAt: now,
      });

      const helperSecret = preflight.get(helperKey);
      const helpedSecret = preflight.get(helpedKey);
      if (!helperSecret || !helpedSecret)
        throw new Error(
          "Missing a secret key on this device — cannot sign the exchange.",
        );

      const exchange: Exchange = {
        id: uuid(),
        postId: post.id,
        helperKey,
        helpedKey,
        hoursExchanged: post.estimatedHours,
        helperSignature: sign(payload, helperSecret),
        helpedSignature: sign(payload, helpedSecret),
        completedAt: now,
        category: post.category,
        nodeId,
        ...(flag.flaggedForReview
          ? {
              flaggedForReview: true,
              flagReason: flag.flagReason,
            }
          : {}),
      };
      await db.exchanges.put(exchange);

      // Atomic enqueue: the outbox row and the exchange land in the
      // same transaction, so we can never have an exchange recorded
      // without its mirror enqueued (or vice versa) on a crash.
      await enqueueExchangeOutbox(exchange);

      const updatedPost: Post = {
        ...post,
        status: "completed",
        confirmedBy,
      };
      await db.posts.put(updatedPost);

      // Award new achievements for both parties.
      const allExchanges = await db.exchanges.toArray();
      const allMembers = await db.members.toArray();
      const newAchievements: Achievement[] = [];
      for (const key of [helperKey, helpedKey]) {
        const existing = await db.achievements
          .where("memberKey")
          .equals(key)
          .toArray();
        const previouslyFilledCategories = new Set(
          allExchanges
            .filter((x) => x.id !== exchange.id)
            .map((x) => x.category),
        );
        const zoneReach = computeZoneReachForHelper(
          key,
          allExchanges,
          allMembers,
        );
        const diff = diffAchievements(
          key,
          existing.map((a) => a.achievementType),
          allExchanges,
          { previouslyFilledCategories, zoneReach },
          now,
        );
        if (diff.length > 0) {
          await db.achievements.bulkPut(diff);
          newAchievements.push(...diff);
        }
      }

      return { post: updatedPost, exchange, newAchievements };
    },
  );

  // Kick the outbox worker to flush the row we just enqueued. The
  // worker handles retries with backoff (see lib/outbox.ts); this
  // call only triggers an immediate attempt for the common case
  // where the node is reachable and the user can see the row deliver
  // before they leave Profile.
  if (result.exchange) {
    void flushOutboxNow().catch((err) => {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[understoria] outbox flush kick crashed", err);
      }
    });
  }

  return result;
}

/**
 * Apply an exchange that the server's system signer has just signed
 * for an `awaiting_confirmation` post (see docs/auto-confirm-key.md
 * §4 / `lib/autoConfirmSweep.ts`). The `exchange` argument carries
 * the system-signed helped-side signature and the audit flags
 * (`autoConfirmed`, `autoConfirmedBy`, `autoConfirmedAt`); this
 * function persists it, completes the post, kicks the outbox, and
 * recomputes achievements for the helper. Mirrors the credit-flow
 * tail of `confirmExchange` without duplicating the signing or
 * mutual-confirmation steps.
 *
 * Achievements: only the helper is recomputed. The helped party on
 * an auto-confirm path is structurally absent — credit still flows
 * to them, but earning a member achievement requires participation
 * we can't attest to here.
 */
export async function applyAutoConfirmedExchange(
  postId: string,
  exchange: Exchange,
): Promise<{ post: Post; exchange: Exchange; newAchievements: Achievement[] }> {
  if (!exchange.autoConfirmed || !exchange.autoConfirmedBy) {
    throw new Error(
      "applyAutoConfirmedExchange: exchange must carry autoConfirmed + autoConfirmedBy",
    );
  }
  // nodeConfig lives in `db.nodeConfig`, out of the transaction scope
  // below — read it first (a non-scoped await inside a Dexie
  // transaction commits it early).
  const nodeConfig = await getNodeConfig(exchange.nodeId);
  return db.transaction(
    "rw",
    [
      db.posts,
      db.exchanges,
      db.achievements,
      db.outbox,
      db.settings,
      db.members,
    ],
    async () => {
      const post = await db.posts.get(postId);
      if (!post) throw new Error("Post not found");
      if (post.status === "completed") {
        // Idempotent: the sweep can re-fire if the page reloads
        // mid-write. The exchange is already there.
        const existing = await db.exchanges.get(exchange.id);
        return {
          post,
          exchange: existing ?? exchange,
          newAchievements: [] as Achievement[],
        };
      }
      if (post.status !== "awaiting_confirmation") {
        throw new Error(
          "applyAutoConfirmedExchange: post must be awaiting_confirmation",
        );
      }
      // Anti-gaming safeguards apply to auto-confirmed exchanges too
      // (Round-4 review; docs/auto-confirm-key.md §5 claims the
      // safeguards module "still applies"). Unlike the manual path we
      // FLAG rather than throw — the row is already node-signed, so
      // discarding it would strand valid credit; the flag surfaces the
      // short-duration / reciprocal / over-limit pattern for review.
      // Flag fields sit OUTSIDE the canonical payload, so setting them
      // does not disturb the system signature.
      const priorExchanges = await db.exchanges.toArray();
      const evalNow = exchange.autoConfirmedAt ?? Date.now();
      const safeguard = evaluateSafeguards(
        {
          helperKey: exchange.helperKey,
          helpedKey: exchange.helpedKey,
          hoursExchanged: exchange.hoursExchanged,
          completedAt: exchange.completedAt,
        },
        priorExchanges,
        nodeConfig,
      );
      const overLimit = exceedsDailyLimit(
        exchange.helperKey,
        priorExchanges,
        evalNow,
        nodeConfig,
      );
      const flagged = exchange.flaggedForReview || safeguard.flaggedForReview || overLimit;
      const exchangeToStore: Exchange = flagged
        ? {
            ...exchange,
            flaggedForReview: true,
            flagReason:
              exchange.flagReason ??
              safeguard.flagReason ??
              (overLimit ? "daily_limit_warning" : undefined),
          }
        : exchange;
      await db.exchanges.put(exchangeToStore);
      await enqueueExchangeOutbox(exchangeToStore);
      const updatedPost: Post = {
        ...post,
        status: "completed",
        // Leave confirmedBy as-is: the post's `confirmedBy` array is
        // the set of MEMBERS who confirmed. The system identity is
        // not a member and does not belong in that list. Verifiers
        // distinguish auto-confirm by reading the exchange flags,
        // not by extending the post's confirmedBy.
      };
      await db.posts.put(updatedPost);

      const now = exchange.autoConfirmedAt ?? Date.now();
      const allExchanges = await db.exchanges.toArray();
      const allMembers = await db.members.toArray();
      const newAchievements: Achievement[] = [];
      // Helper only — see fn-level comment.
      const existing = await db.achievements
        .where("memberKey")
        .equals(exchange.helperKey)
        .toArray();
      const previouslyFilledCategories = new Set(
        allExchanges
          .filter((x) => x.id !== exchange.id)
          .map((x) => x.category),
      );
      const zoneReach = computeZoneReachForHelper(
        exchange.helperKey,
        allExchanges,
        allMembers,
      );
      const diff = diffAchievements(
        exchange.helperKey,
        existing.map((a) => a.achievementType),
        allExchanges,
        { previouslyFilledCategories, zoneReach },
        now,
      );
      if (diff.length > 0) {
        await db.achievements.bulkPut(diff);
        newAchievements.push(...diff);
      }

      return { post: updatedPost, exchange: exchangeToStore, newAchievements };
    },
  );
}

export async function disputeExchange(
  postId: string,
  memberKey: string,
  reason: string | null = null,
): Promise<Post> {
  return db.transaction("rw", db.posts, db.proposals, async () => {
    const post = await db.posts.get(postId);
    if (!post) throw new Error("Post not found");
    // A dispute is about an exchange, so the post must have entered
    // the claim flow: without a claimer there is no second party (the
    // proposal's recipientKey would be empty), and a cancelled or
    // already-disputed post has nothing new to flag. Same in-txn
    // lifecycle discipline as claimPost / confirmExchange.
    if (post.status === "open" || post.claimedBy === null)
      throw new Error("Only a claimed exchange can be disputed");
    if (post.status === "cancelled")
      throw new Error("A cancelled post has no exchange to dispute");
    if (post.status === "disputed")
      throw new Error("This exchange is already disputed");
    if (memberKey !== post.postedBy && memberKey !== post.claimedBy)
      throw new Error("Only the two parties can dispute this exchange");
    // Remember the pre-dispute status so resolveDispute can restore it
    // if the community finds the flag baseless (Round-4 review).
    const updated: Post = {
      ...post,
      status: "disputed",
      preDisputeStatus: post.status,
    };
    await db.posts.put(updated);
    // Agent 13 dispute migration — every flagged exchange gets a
    // matching governance-layer Proposal so the Decisions surface
    // can show it alongside config-change proposals. Idempotent:
    // if a tab racing with this one already wrote the proposal
    // row, we leave it alone.
    const existing = await db.proposals
      .where("disputePostId")
      .equals(updated.id)
      .first();
    if (!existing) {
      await db.proposals.put(
        buildDisputeProposal({
          post: updated,
          flaggerKey: memberKey,
          reason,
          now: Date.now(),
        }),
      );
    }
    return updated;
  });
}

export async function updateMemberProfile(
  memberKey: string,
  updates: {
    displayName?: string;
    skills?: string[];
    availability?: string;
    availabilityChips?: AvailabilityChip[];
    locationZone?: string;
  },
): Promise<void> {
  const member = await db.members.get(memberKey);
  if (!member) throw new Error("Member not found");
  // Treat `undefined` chips as "no change" (don't overwrite); the spread
  // below would copy `undefined` over the existing array otherwise.
  const next: Member = { ...member, ...updates };
  if (updates.availabilityChips === undefined) {
    next.availabilityChips = member.availabilityChips;
  }
  await db.members.put(next);
}
