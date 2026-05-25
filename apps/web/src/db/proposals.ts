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
import type {
  DisputePayload,
  ImpactReflection,
  Post,
  ProposalCategory,
  ProposalStatus,
  Proposal,
  ReversibilityTier,
} from "@/types";
import { db } from "./database";

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
  await db.proposals.put(proposal);
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
  return db.transaction("rw", db.proposals, async () => {
    const proposal = await db.proposals.get(proposalId);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "open") {
      throw new Error("Proposal is already closed");
    }
    const updated: Proposal = {
      ...proposal,
      status: outcome,
      closedAt: Date.now(),
      closedReason: reason.trim() || null,
    };
    await db.proposals.put(updated);
    return updated;
  });
}
