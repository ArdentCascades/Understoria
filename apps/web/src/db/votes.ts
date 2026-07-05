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
import { voteId } from "@/lib/votes";
import type { Vote, VoteChoice } from "@/types";
import { db } from "./database";

// DB-side helpers for the voting layer. Keep the surface tight:
// cast a vote (replaces any prior vote from the same member),
// list votes for a proposal (for tally + UI). Reading individual
// votes back out is cheap via `db.votes.get(voteId(...))` so we
// don't wrap that.

export interface CastVoteInput {
  proposalId: string;
  voterKey: string;
  choice: VoteChoice;
  reason?: string | null;
  nodeId: string;
}

export async function castVote(input: CastVoteInput): Promise<Vote> {
  const trimmed = input.reason?.trim() ?? "";
  const row: Vote = {
    id: voteId(input.proposalId, input.voterKey),
    proposalId: input.proposalId,
    voterKey: input.voterKey,
    choice: input.choice,
    reason: trimmed.length > 0 ? trimmed : null,
    createdAt: Date.now(),
    nodeId: input.nodeId,
  };
  // Reject a vote on a closed proposal (Round-4 review): read the
  // proposal in the same transaction and refuse if it is no longer
  // open, so a stale second tab can't amend a sealed decision with a
  // vote dated after `closedAt`.
  return db.transaction("rw", [db.votes, db.proposals], async () => {
    const proposal = await db.proposals.get(input.proposalId);
    if (proposal && proposal.status !== "open") {
      throw new Error("This proposal is closed — voting has ended.");
    }
    await db.votes.put(row);
    return row;
  });
}

export async function listVotesFor(proposalId: string): Promise<Vote[]> {
  return db.votes.where("proposalId").equals(proposalId).toArray();
}

/** Convenience for "did this member already vote on this proposal?"
 *  Returns the stored row or null. */
export async function getMemberVote(
  proposalId: string,
  voterKey: string,
): Promise<Vote | null> {
  return (await db.votes.get(voteId(proposalId, voterKey))) ?? null;
}
