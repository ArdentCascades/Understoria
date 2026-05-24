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
import type { Vote, VoteChoice } from "@/types";

// Pure helpers for the voting layer. The DB-side `castVote` /
// `listVotesFor` live in `db/votes.ts`; this module owns the tally
// logic, which is the part worth testing in isolation.
//
// Latest-per-voter wins. If a member votes "block" and later
// changes their mind, only the most recent vote counts. The voting
// UI uses a deterministic `${proposalId}|${voterKey}` id so the
// underlying `put` overwrites in place, but `tallyVotes` ALSO
// dedups at compute time — defensive against any path that might
// have produced multiple rows.

export interface TallyEntry {
  voterKey: string;
  reason: string | null;
  createdAt: number;
}

export interface Tally {
  affirms: TallyEntry[];
  blocks: TallyEntry[];
  abstains: TallyEntry[];
  /** Total distinct voters who have weighed in (any choice). */
  totalVoters: number;
}

export function tallyVotes(votes: readonly Vote[]): Tally {
  // Pick the latest vote per voter.
  const latest = new Map<string, Vote>();
  for (const v of votes) {
    const prior = latest.get(v.voterKey);
    if (!prior || v.createdAt > prior.createdAt) {
      latest.set(v.voterKey, v);
    }
  }
  const affirms: TallyEntry[] = [];
  const blocks: TallyEntry[] = [];
  const abstains: TallyEntry[] = [];
  for (const v of latest.values()) {
    const entry: TallyEntry = {
      voterKey: v.voterKey,
      reason: v.reason,
      createdAt: v.createdAt,
    };
    if (v.choice === "affirm") affirms.push(entry);
    else if (v.choice === "block") blocks.push(entry);
    else abstains.push(entry);
  }
  // Newest-first within each bucket so the UI can render in
  // recency order.
  const sortNewest = (a: TallyEntry, b: TallyEntry) => b.createdAt - a.createdAt;
  affirms.sort(sortNewest);
  blocks.sort(sortNewest);
  abstains.sort(sortNewest);
  return {
    affirms,
    blocks,
    abstains,
    totalVoters: latest.size,
  };
}

/**
 * What's the current member's vote on a proposal, if any? Useful
 * for highlighting their current choice in the voting UI so they
 * can change it without confusion.
 */
export function currentMemberVote(
  voterKey: string,
  votes: readonly Vote[],
): VoteChoice | null {
  let latest: Vote | null = null;
  for (const v of votes) {
    if (v.voterKey !== voterKey) continue;
    if (!latest || v.createdAt > latest.createdAt) {
      latest = v;
    }
  }
  return latest?.choice ?? null;
}

/** Deterministic id helper — keeps the DB write and the UI in
 *  sync about which row a vote belongs to. */
export function voteId(proposalId: string, voterKey: string): string {
  return `${proposalId}|${voterKey}`;
}
