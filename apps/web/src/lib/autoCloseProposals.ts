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
import { tallyVotes } from "./votes";
import type { NodeConfig, Proposal, Vote } from "@/types";

// Agent 13 task 3 — auto-close on consensus. Pure decision logic;
// the DB write happens in the page handler so this module stays
// trivially testable.
//
// Auto-pass condition (modified consensus):
//   - Deliberation period satisfied (now - createdAt >= deliberation)
//   - No blocks remaining
//   - At least `proposalMinAffirms` affirm votes
//
// Auto-reject is intentionally NOT implemented. The roadmap leaves
// "supermajority fallback" for a future, more contentious mechanism;
// for v1 a stalled proposal stays open until someone manually
// withdraws it or the community agrees out-of-band that it's dead.

export type AutoCloseEligibility =
  | { kind: "passes" }
  | { kind: "wait_deliberation"; readyAt: number }
  | { kind: "wait_affirms"; have: number; need: number }
  | { kind: "blocked"; blockCount: number }
  | { kind: "not_open" };

export interface AutoCloseInput {
  proposal: Proposal;
  votes: readonly Vote[];
  config: Pick<
    NodeConfig,
    "proposalDeliberationDays" | "proposalMinAffirms"
  >;
  now?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function autoCloseEligibility(
  input: AutoCloseInput,
): AutoCloseEligibility {
  const { proposal, votes, config } = input;
  const now = input.now ?? Date.now();

  if (proposal.status !== "open") return { kind: "not_open" };

  const tally = tallyVotes(votes.filter((v) => v.proposalId === proposal.id));

  if (tally.blocks.length > 0) {
    return { kind: "blocked", blockCount: tally.blocks.length };
  }

  const deliberationMs = config.proposalDeliberationDays * DAY_MS;
  const readyAt = proposal.createdAt + deliberationMs;
  if (now < readyAt) {
    return { kind: "wait_deliberation", readyAt };
  }

  if (tally.affirms.length < config.proposalMinAffirms) {
    return {
      kind: "wait_affirms",
      have: tally.affirms.length,
      need: config.proposalMinAffirms,
    };
  }

  return { kind: "passes" };
}

