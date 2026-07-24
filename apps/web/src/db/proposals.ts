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
import { uuid } from "@/lib/id";
import {
  canonicalProposalClosurePayload,
  canonicalProposalPayload,
  sign,
} from "@understoria/shared/crypto";
import type { NodeConfig, ProposalClosure } from "@understoria/shared/types";
import { putNodeConfig } from "./nodeConfig";
import { getSecretKey } from "@/db/secrets";
import {
  enqueueProposalOutbox,
  enqueueProposalClosureOutbox,
  flushOutboxNow,
} from "@/lib/outbox";
import type {
  DisputePayload,
  CommentDisputePayload,
  Exchange,
  ImpactReflection,
  Post,
  ProposalCategory,
  ProposalStatus,
  Proposal,
  ReversibilityTier,
  TaskComment,
} from "@/types";
import Dexie from "dexie";
import { db, getSetting, SETTING_KEYS } from "./database";
import {
  readFounderHashCapture,
  resolveFounderRoots,
} from "@/lib/founderRoots";
import { trustStatusWithInvites } from "@/lib/vouch";

// Agent 13 task 1 — Proposals MVP. CRUD helpers + status queries.
// Voting + automatic close are deferred to a follow-up PR; for
// now a proposal stays in `open` state until someone manually
// records an outcome via `closeProposal` (out-of-band community
// decision, recorded back into the app for the historical
// record).
//
// All proposals are visible to every member of the node — per
// `GOVERNANCE.md`, governance is a community property, not an
// admin grant.

export interface CreateProposalInput {
  category: ProposalCategory;
  reversibilityTier: ReversibilityTier;
  title: string;
  description: string;
  /** Caller-serialized JSON payload — the proposals table is
   *  intentionally schema-agnostic about per-category shape so
   *  future kinds (recall, policy) can ride the same table. */
  payload: string;
  proposerKey: string;
  nodeId: string;
  impactReflection?: ImpactReflection | null;
}

export async function createProposal(
  input: CreateProposalInput,
): Promise<Proposal> {
  if (!input.title.trim()) throw new Error("Proposal title is required");
  const reflection =
    input.impactReflection != null
      ? JSON.stringify(input.impactReflection)
      : null;
  const proposal: Proposal = {
    id: uuid(),
    nodeId: input.nodeId,
    kind: "proposal",
    category: input.category,
    reversibilityTier: input.reversibilityTier,
    title: input.title.trim(),
    description: input.description.trim(),
    payload: input.payload,
    proposerKey: input.proposerKey,
    status: "open",
    createdAt: Date.now(),
    closedAt: null,
    closedReason: null,
    impactReflection: reflection,
    disputePostId: null,
  };
  // Proposal federation G1: sign the immutable core so the proposal
  // can cross the wire. Soft-degrade on a locked device / missing
  // key: the row stays LOCAL-ONLY (the legacy posture) rather than
  // failing creation — the same trade participation publishing makes.
  try {
    const secret = await getSecretKey(input.proposerKey);
    proposal.signerKey = input.proposerKey;
    proposal.signature = sign(canonicalProposalPayload(proposal), secret);
  } catch {
    /* unsigned = recorded on this device only */
  }
  await db.transaction("rw", [db.proposals, db.outbox, db.settings], async () => {
    await db.proposals.put(proposal);
    if (proposal.signature) {
      await enqueueProposalOutbox(proposal);
    }
  });
  if (proposal.signature) void flushOutboxNow().catch(() => {});
  return proposal;
}

/**
 * Build a `kind: "dispute"` Proposal row from a flagged post. The
 * proposal is the governance-layer view of the dispute; the post
 * remains the source of truth for the exchange lifecycle. Pure —
 * the DB write happens in `disputeExchange` (or the v11 backfill)
 * so this function is testable in isolation.
 *
 * Helper / recipient direction follows the same rule as the
 * disputes-page list: NEED → claimer helps poster; OFFER → poster
 * helps claimer.
 */
export function buildDisputeProposal(input: {
  post: Post;
  flaggerKey: string;
  reason: string | null;
  now: number;
}): Proposal {
  const { post, flaggerKey, reason, now } = input;
  const helperKey = post.type === "NEED" ? post.claimedBy : post.postedBy;
  const recipientKey = post.type === "NEED" ? post.postedBy : post.claimedBy;
  const snapshot: DisputePayload = {
    postType: post.type,
    postTitle: post.title,
    category: post.category,
    hours: post.estimatedHours,
    helperKey,
    // claimedBy can be null on a malformed row but disputed posts
    // went through the claim flow, so this is "should not happen"
    // — empty string keeps the type happy if we ever hit it.
    recipientKey: recipientKey ?? "",
    postCreatedAt: post.createdAt,
  };
  return {
    id: uuid(),
    nodeId: post.nodeId,
    kind: "dispute",
    category: "dispute",
    // Disputes are always easy — reversal is "stop flagging it",
    // which any other proposal can do. Reversibility tier
    // surfaces consistently across kinds even when the choice
    // isn't very meaningful for disputes.
    reversibilityTier: "easy",
    title: post.title,
    description: reason?.trim() || "",
    payload: JSON.stringify(snapshot),
    proposerKey: flaggerKey,
    status: "open",
    createdAt: now,
    closedAt: null,
    closedReason: null,
    impactReflection: null,
    disputePostId: post.id,
  };
}

/**
 * Build a `kind: "dispute"` Proposal row from a flagged DIRECT
 * exchange (docs/direct-exchange-label.md §4) — an exchange with no
 * post behind it, so the snapshot renders from the exchange's own
 * signed fields. `disputePostId` carries the exchange's `direct:`
 * label: unique by construction, and the same idempotence key the
 * post flow uses, so one exchange can never grow two dispute rows.
 */
export function buildDirectDisputeProposal(input: {
  exchange: Exchange;
  flaggerKey: string;
  reason: string | null;
  now: number;
}): Proposal {
  const { exchange, flaggerKey, reason, now } = input;
  const snapshot: DisputePayload = {
    postType: "direct",
    postTitle: "",
    category: exchange.category,
    hours: exchange.hoursExchanged,
    helperKey: exchange.helperKey,
    recipientKey: exchange.helpedKey,
    postCreatedAt: exchange.completedAt,
  };
  return {
    id: uuid(),
    nodeId: exchange.nodeId,
    kind: "dispute",
    category: "dispute",
    reversibilityTier: "easy",
    // No post title exists; the Decisions surface falls back to the
    // recorded-directly copy when it sees the direct marker.
    title: "",
    description: reason?.trim() || "",
    payload: JSON.stringify(snapshot),
    proposerKey: flaggerKey,
    status: "open",
    createdAt: now,
    closedAt: null,
    closedReason: null,
    disputePostId: exchange.postId,
    impactReflection: null,
  };
}

/**
 * DB-side helper: writes a dispute Proposal row for a flagged
 * post. Idempotent — if a dispute proposal already exists for the
 * given post id, returns the existing row and writes nothing.
 * Used by `disputeExchange` (live flag flow) and the v11 backfill
 * (one-time migration of pre-existing disputed posts).
 */
export async function ensureDisputeProposal(input: {
  post: Post;
  flaggerKey: string;
  reason: string | null;
  now?: number;
}): Promise<Proposal> {
  const existing = await db.proposals
    .where("disputePostId")
    .equals(input.post.id)
    .first();
  if (existing) return existing;
  const proposal = buildDisputeProposal({
    post: input.post,
    flaggerKey: input.flaggerKey,
    reason: input.reason,
    now: input.now ?? Date.now(),
  });
  await db.proposals.put(proposal);
  return proposal;
}

/**
 * Build a Proposal row that flags a task comment. Mirrors
 * buildDisputeProposal but the subject is a comment, not a post.
 * The body / authorKey snapshot inside payload preserves what was
 * flagged in case the author later soft-deletes the comment.
 */
export function buildCommentDisputeProposal(input: {
  comment: TaskComment;
  flaggerKey: string;
  reason: string | null;
  nodeId: string;
  now: number;
}): Proposal {
  const { comment, flaggerKey, reason, nodeId, now } = input;
  const snapshot: CommentDisputePayload = {
    subjectType: "task_comment",
    commentId: comment.id,
    projectId: comment.projectId,
    taskId: comment.taskId,
    body: comment.body,
    authorKey: comment.authorKey,
    createdAt: comment.createdAt,
  };
  return {
    id: uuid(),
    nodeId,
    kind: "dispute",
    category: "dispute",
    reversibilityTier: "easy",
    // Title surfaces in the Decisions list; "flagged comment" is the
    // generic stand-in since the comment body itself can be very
    // long and unsuitable as a title.
    title: "Flagged comment",
    description: reason?.trim() || "",
    payload: JSON.stringify(snapshot),
    proposerKey: flaggerKey,
    status: "open",
    createdAt: now,
    closedAt: null,
    closedReason: null,
    impactReflection: null,
    // Comments use payload.commentId for linkage instead of the
    // typed disputePostId column (which stays null here so the
    // existing post-dispute index queries don't return comment rows).
    disputePostId: null,
  };
}

/**
 * Idempotent comment-flag write. Returns the existing open proposal
 * if one already references this comment id, otherwise writes a new
 * one. Uses a scan over open dispute proposals + payload parsing
 * since the comment id lives inside the JSON payload, not in an
 * indexed column. Pilot-scale (small number of open disputes) — if
 * scale changes, denormalize commentId onto Proposal.
 */
export async function ensureCommentDisputeProposal(input: {
  comment: TaskComment;
  flaggerKey: string;
  reason: string | null;
  nodeId: string;
  now?: number;
}): Promise<Proposal> {
  const openDisputes = await db.proposals
    .where("[kind+status]")
    .equals(["dispute", "open"])
    .toArray();
  for (const p of openDisputes) {
    try {
      const parsed = JSON.parse(p.payload) as { subjectType?: string; commentId?: string };
      if (
        parsed.subjectType === "task_comment" &&
        parsed.commentId === input.comment.id
      ) {
        return p;
      }
    } catch {
      // Skip malformed payloads — they belong to a different shape
      // and aren't a match for the comment id anyway.
    }
  }
  const proposal = buildCommentDisputeProposal({
    comment: input.comment,
    flaggerKey: input.flaggerKey,
    reason: input.reason,
    nodeId: input.nodeId,
    now: input.now ?? Date.now(),
  });
  await db.proposals.put(proposal);
  return proposal;
}


/** Returns proposals newest-first. Status filter is optional — by
 *  default returns every proposal regardless of status. */
export async function listProposals(
  filter?: { status?: ProposalStatus; kind?: Proposal["kind"] },
): Promise<Proposal[]> {
  let all = await db.proposals.toArray();
  if (filter?.status) all = all.filter((p) => p.status === filter.status);
  if (filter?.kind) all = all.filter((p) => p.kind === filter.kind);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getProposal(id: string): Promise<Proposal | null> {
  return (await db.proposals.get(id)) ?? null;
}

/**
 * Record an outcome on a proposal. v1 does this manually — when the
 * community has reached a decision out-of-band, anyone can record
 * the outcome here so the proposal closes. Voting + automatic close
 * is the next slice; for now this is the honest path.
 */
export async function closeProposal(
  proposalId: string,
  outcome: "passed" | "rejected" | "withdrawn",
  reason: string,
): Promise<Proposal> {
  // Trusted-closer guard, BEFORE any local effect: the node's 403 is
  // defense enough for the wire, but a passed config_change applies a
  // full NodeConfig locally below without waiting for it — so a
  // pending closer must be stopped here, not at delivery. Same
  // capture posture as issueInvite (no capture ⇒ allow, the node
  // enforces); the proposer withdrawing their own proposal is exempt,
  // mirroring the server rule exactly. Throws the server's own code
  // so humanizeError speaks one message for both layers.
  await assertCloserTrusted(proposalId, outcome);
  const closed = await closeProposalLocally(proposalId, outcome, reason);
  // Phase G2: config convergence — the closing device applies the
  // passed payload immediately; every other device applies it when
  // the closure record arrives (applyClosureEffects via the pull).
  if (closed.category === "config_change" && outcome === "passed") {
    await applyClosureEffects(closed, outcome).catch(() => {});
  }
  // Proposal federation G1: the terminal state federates as a signed
  // FIRST-WRITER-WINS closure record (docs/proposal-federation.md
  // §2). Soft-degrade when this device can't sign — the local close
  // stands (legacy posture) and the node's copy stays open until a
  // signing member records the outcome.
  try {
    const me = await getSetting(SETTING_KEYS.currentMember);
    if (me) {
      const secret = await getSecretKey(me);
      const core = {
        id: uuid(),
        proposalId,
        outcome,
        reason: reason.trim() || null,
        closedAt: closed.closedAt ?? Date.now(),
        closerKey: me,
        nodeId: closed.nodeId,
      };
      const record: ProposalClosure = {
        ...core,
        signerKey: me,
        signature: sign(canonicalProposalClosurePayload(core), secret),
      };
      await db.transaction(
        "rw",
        [db.proposalClosures, db.outbox, db.settings],
        async () => {
          const existing = await db.proposalClosures.get(proposalId);
          if (!existing) {
            await db.proposalClosures.put(record);
            await enqueueProposalClosureOutbox(record);
          }
        },
      );
      void flushOutboxNow().catch(() => {});
    }
  } catch {
    /* local close stands; no wire record from this device */
  }
  return closed;
}

/** The closeProposal trust check (see its call-site comment). Reads
 *  raw `db.vouches` — the decision discipline: a viewer's block
 *  filter changes what they SEE, never what anyone can ENACT. */
async function assertCloserTrusted(
  proposalId: string,
  outcome: "passed" | "rejected" | "withdrawn",
): Promise<void> {
  const capture = await readFounderHashCapture();
  if (!capture || capture.hashes.length === 0) return;
  const me = await getSetting(SETTING_KEYS.currentMember);
  // No signer on this device: the close stays local-only (legacy
  // posture) and mints no wire record — nothing to judge.
  if (!me) return;
  const proposal = await db.proposals.get(proposalId);
  if (outcome === "withdrawn" && proposal?.proposerKey === me) return;
  const [vouches, invites, members] = await Promise.all([
    db.vouches.toArray(),
    db.invites.toArray(),
    db.members.toArray(),
  ]);
  // Own key rides along in case the member row hasn't materialized —
  // widening the founder set can only allow more, never less.
  const founderRoots = resolveFounderRoots(capture, [
    ...members.map((m) => m.publicKey),
    me,
  ]);
  if (
    trustStatusWithInvites(me, { vouches, invites, founderRoots }) !==
    "trusted"
  ) {
    throw new Error("closer_not_trusted");
  }
}

async function closeProposalLocally(
  proposalId: string,
  outcome: "passed" | "rejected" | "withdrawn",
  reason: string,
): Promise<Proposal> {
  return db.transaction("rw", [db.proposals, db.votes, db.posts], async () => {
    const proposal = await db.proposals.get(proposalId);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "open") {
      throw new Error("Proposal is already closed");
    }
    // Server-of-record guard (Round-4 review): a proposal cannot be
    // recorded as PASSED while any standing block vote exists — one
    // block stops passage under modified consensus (GOVERNANCE.md §2).
    // This runs on the FULL vote set, so the close decision can never
    // depend on the closer's per-viewer governance filter — a block
    // must change what a blocker SEES, not what they can ENACT
    // (docs/blocking.md §6.3).
    if (outcome === "passed") {
      const blocked = await db.votes
        .where("proposalId")
        .equals(proposalId)
        .filter((v) => v.choice === "block")
        .count();
      if (blocked > 0) {
        throw new Error(
          "This proposal has a standing block and cannot be closed as passed.",
        );
      }
    }
    const updated: Proposal = {
      ...proposal,
      status: outcome,
      closedAt: Date.now(),
      closedReason: reason.trim() || null,
    };
    await db.proposals.put(updated);

    // Apply a dispute outcome back to the flagged post (Round-4 review).
    // Before this, closing a dispute proposal only stamped the proposal
    // row and the post stayed "disputed" forever — so a REJECTED
    // (baseless) dispute permanently denied the helper credit. Now:
    //   - rejected / withdrawn → the flag did not stand: restore the
    //     post to its pre-dispute status so the normal flow (and credit)
    //     resumes.
    //   - passed (upheld) → the exchange is repudiated. Credit is NEVER
    //     reversed (docs/invite-redemption.md §2 / the never-reverse-
    //     credit principle), so a post that had already COMPLETED stays
    //     completed (the dispute record is the accountability signal);
    //     a pre-completion post is cancelled so credit never flows.
    await applyDisputeOutcome(proposal, outcome);

    return updated;
  });
}

/**
 * Post-commit signer for proposals minted INSIDE another write
 * transaction (dispute + comment-dispute rows — `getSecretKey` and
 * the outbox are out of those transactions' scope, the K2 lesson).
 * No-op unless this device holds the proposer's key and the row is
 * still unsigned; Phase G2 of docs/proposal-federation.md.
 */
export async function signProposalIfUnsigned(proposalId: string): Promise<void> {
  if (Dexie.currentTransaction) return;
  try {
    const row = await db.proposals.get(proposalId);
    if (!row || row.signature) return;
    const me = await getSetting(SETTING_KEYS.currentMember);
    if (!me || row.proposerKey !== me) return;
    const secret = await getSecretKey(me);
    const signerKey = me;
    const signature = sign(canonicalProposalPayload(row), secret);
    await db.transaction("rw", [db.proposals, db.outbox, db.settings], async () => {
      const fresh = await db.proposals.get(proposalId);
      if (!fresh || fresh.signature) return;
      const signed = { ...fresh, signerKey, signature };
      await db.proposals.put(signed);
      await enqueueProposalOutbox(signed);
    });
    void flushOutboxNow().catch(() => {});
  } catch {
    /* locked device / missing key — the row stays local-only */
  }
}

/** The dispute half of a closure's effects — idempotent: a post no
 *  longer in "disputed" is left alone, so the closing device and
 *  every pulling device converge through this one path. */
async function applyDisputeOutcome(
  proposal: Proposal,
  outcome: "passed" | "rejected" | "withdrawn",
): Promise<void> {
  if (proposal.kind !== "dispute" || !proposal.disputePostId) return;
  const post = await db.posts.get(proposal.disputePostId);
  if (!post || post.status !== "disputed") return;
  const prior = post.preDisputeStatus ?? "claimed";
  const nextStatus =
    outcome === "passed"
      ? prior === "completed"
        ? "completed"
        : "cancelled"
      : prior;
  await db.posts.put({
    ...post,
    status: nextStatus,
    preDisputeStatus: null,
  });
}

/**
 * Apply a proposal closure's EFFECTS on this device — Phase G2 of
 * docs/proposal-federation.md §5, called by the closure pull after
 * the lifecycle stamp (and equivalent to what the closing device ran
 * locally). Idempotent by construction:
 *
 *  - dispute outcomes restore/settle the flagged post only while it
 *    is still "disputed";
 *  - a passed `config_change` applies its full-NodeConfig payload
 *    through `putNodeConfig` (validation included — the caller this
 *    function's doc comment always promised). This is the first
 *    mechanism by which a community's knobs actually CONVERGE:
 *    closure order is total (first-writer-wins per proposal), so
 *    every device lands on the same config.
 *  - `project_adoption` needs NO pull-side effect: the organizer
 *    handoff federates as ProjectState LWW records from the
 *    executing device; re-running it here would race that authority
 *    transfer.
 *
 * Failures degrade softly (an invalid config payload is skipped —
 * the closure still stands as a record; the community can re-propose).
 */
export async function applyClosureEffects(
  proposal: Proposal,
  outcome: "passed" | "rejected" | "withdrawn",
): Promise<void> {
  await applyDisputeOutcome(proposal, outcome);
  if (proposal.category === "config_change" && outcome === "passed") {
    try {
      const parsed = JSON.parse(proposal.payload) as NodeConfig;
      await putNodeConfig(proposal.nodeId, parsed);
    } catch {
      /* invalid or legacy payload — the record stands, the knobs don't move */
    }
  }
}
