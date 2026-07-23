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
//   - At least `proposalMinAffirms` COUNTED affirm votes (affirms
//     from trusted voters when `trustedKeys` is provided — see the
//     input's doc comment)
//
// Auto-reject is intentionally NOT implemented. The roadmap leaves
// "supermajority fallback" for a future, more contentious mechanism;
// for v1 a stalled proposal stays open until someone manually
// withdraws it or the community agrees out-of-band that it's dead.

export type AutoCloseEligibility =
  | { kind: "passes" }
  | { kind: "wait_deliberation"; readyAt: number }
  /** `have` counts only affirms that COUNT (trusted voters when
   *  `trustedKeys` is provided); `notYetCounted` is the honest
   *  remainder — affirms recorded from not-yet-vouched members,
   *  which start counting the moment their voter is trusted. */
  | { kind: "wait_affirms"; have: number; need: number; notYetCounted: number }
  | { kind: "blocked"; blockCount: number }
  | { kind: "not_open" };

export interface AutoCloseInput {
  proposal: Proposal;
  votes: readonly Vote[];
  config: Pick<
    NodeConfig,
    "proposalDeliberationDays" | "proposalMinAffirms"
  >;
  /**
   * The founder-rooted trusted set (lib/vouch.ts `trustedMemberSet`,
   * built from UNFILTERED db.vouches — decision math must never see
   * a viewer's block filter). When provided, only trusted voters'
   * affirms count toward auto-pass (threat-model §7); blocks always
   * count and are evaluated first. Omitted or null = legacy flat
   * counting (no founder capture — the device can't judge, the node
   * enforces closure signing regardless). Trust inputs are
   * append-only, so a lagging device under-counts but never shows a
   * premature "passes".
   */
  trustedKeys?: ReadonlySet<string> | null;
  now?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Plan 11 — a role transfer over an absent person's head must not be
// winnable in the 3-day default window. Adoption proposals get a
// 14-day notice floor (matching the invite / co-org-invitation horizon),
// applied as max(config.proposalDeliberationDays, this) so a community
// that has SET a longer deliberation window keeps it. The same floor is
// re-enforced inside `executeAdoptionProposal`, so even an out-of-band
// "record outcome: passed" can't shortcut the absent member's window.
export const ADOPTION_MIN_DELIBERATION_DAYS = 14;

export function autoCloseEligibility(
  input: AutoCloseInput,
): AutoCloseEligibility {
  const { proposal, votes, config } = input;
  const now = input.now ?? Date.now();
  const trusted = input.trustedKeys ?? null;

  if (proposal.status !== "open") return { kind: "not_open" };

  const tally = tallyVotes(votes.filter((v) => v.proposalId === proposal.id));

  // Blocks first, and NEVER trust-filtered: one standing block stops
  // passage whoever cast it (modified consensus, GOVERNANCE.md §2).
  if (tally.blocks.length > 0) {
    return { kind: "blocked", blockCount: tally.blocks.length };
  }

  const countedAffirms = trusted
    ? tally.affirms.filter((a) => trusted.has(a.voterKey))
    : tally.affirms;

  const deliberationDays =
    proposal.category === "project_adoption"
      ? Math.max(config.proposalDeliberationDays, ADOPTION_MIN_DELIBERATION_DAYS)
      : config.proposalDeliberationDays;
  const deliberationMs = deliberationDays * DAY_MS;
  const readyAt = proposal.createdAt + deliberationMs;
  if (now < readyAt) {
    return { kind: "wait_deliberation", readyAt };
  }

  if (countedAffirms.length < config.proposalMinAffirms) {
    return {
      kind: "wait_affirms",
      have: countedAffirms.length,
      need: config.proposalMinAffirms,
      notYetCounted: tally.affirms.length - countedAffirms.length,
    };
  }

  return { kind: "passes" };
}

