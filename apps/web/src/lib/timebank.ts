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
import type { Exchange, Member, Post } from "@/types";

/**
 * Credits are computed from the exchange log (event sourcing) plus each
 * member's seed balance. Balances are never mutated directly — this keeps
 * the system auditable and is the foundation for federation (Agent 3).
 *
 * Every member starts with a seed balance (default 5 hours) so asking for
 * help is never gated on having "earned" credit first. This is a core
 * design principle — do not add skill-based multipliers or market pricing.
 */
export function balanceFor(
  member: Pick<Member, "publicKey" | "seedBalance">,
  exchanges: readonly Exchange[],
): number {
  let balance = member.seedBalance;
  for (const x of exchanges) {
    if (x.helperKey === member.publicKey) balance += x.hoursExchanged;
    if (x.helpedKey === member.publicKey) balance -= x.hoursExchanged;
  }
  return Math.round(balance * 100) / 100;
}

export interface TransactionEntry {
  exchange: Exchange;
  /** Positive if you gave help (earned credit), negative if you received. */
  delta: number;
  counterparty: string;
}

export function transactionHistory(
  memberKey: string,
  exchanges: readonly Exchange[],
): TransactionEntry[] {
  return exchanges
    .filter(
      (x) => x.helperKey === memberKey || x.helpedKey === memberKey,
    )
    .map((exchange) => {
      const gaveHelp = exchange.helperKey === memberKey;
      return {
        exchange,
        delta: gaveHelp ? exchange.hoursExchanged : -exchange.hoursExchanged,
        counterparty: gaveHelp ? exchange.helpedKey : exchange.helperKey,
      };
    })
    .sort((a, b) => b.exchange.completedAt - a.exchange.completedAt);
}

/**
 * Credit "in motion" — display honesty for the Profile balance.
 *
 * An Exchange row only exists once BOTH parties have signed (or the
 * node's system key auto-confirmed the helped side — see
 * `docs/auto-confirm-key.md`). So `balanceFor` never counts a
 * half-confirmed exchange; the waiting state lives on the Post:
 * status `awaiting_confirmation` with one party's key in
 * `confirmedBy`. This helper surfaces that state so the UI can
 * explain why credit hasn't landed yet. It does NOT change when
 * credit moves — that stays with the mutual-confirmation model.
 */
export interface PendingEntry {
  postId: string;
  /**
   * Positive if credit will land for the member once both sides have
   * confirmed; negative if it will move out. Same sign convention as
   * `TransactionEntry.delta`.
   */
  delta: number;
  counterparty: string;
  /**
   * Who still needs to confirm: `"you"` — the member themselves owe
   * their confirmation (they can act); `"partner"` — the other party
   * does (nothing for the member to do; the auto-confirm sweep
   * eventually covers it where the community has enabled one).
   */
  owedBy: "you" | "partner";
  category: Post["category"];
  createdAt: number;
}

export interface PendingBalance {
  /** Net signed hours across entries where the partner still owes a
   *  confirmation. */
  awaitingPartnerHours: number;
  /** Net signed hours across entries where the member still owes
   *  their own confirmation. */
  awaitingYouHours: number;
  /** Newest first, matching `transactionHistory` ordering. */
  entries: PendingEntry[];
}

export function pendingBalanceFor(
  memberKey: string,
  posts: readonly Post[],
): PendingBalance {
  const entries: PendingEntry[] = [];
  for (const post of posts) {
    if (post.status !== "awaiting_confirmation") continue;
    if (!post.claimedBy) continue;
    // Counterparty would be ambiguous if a member could claim their
    // own post; skip defensively rather than guess.
    if (post.postedBy === post.claimedBy) continue;
    if (post.postedBy !== memberKey && post.claimedBy !== memberKey) {
      continue;
    }
    // Who helped whom — same rule confirmExchange applies when it
    // eventually writes the Exchange row.
    const helperKey = post.type === "NEED" ? post.claimedBy : post.postedBy;
    const gaveHelp = helperKey === memberKey;
    entries.push({
      postId: post.id,
      delta: gaveHelp ? post.estimatedHours : -post.estimatedHours,
      counterparty:
        post.postedBy === memberKey ? post.claimedBy : post.postedBy,
      owedBy: post.confirmedBy.includes(memberKey) ? "partner" : "you",
      category: post.category,
      createdAt: post.createdAt,
    });
  }
  entries.sort((a, b) => b.createdAt - a.createdAt);

  let awaitingPartnerHours = 0;
  let awaitingYouHours = 0;
  for (const e of entries) {
    if (e.owedBy === "partner") awaitingPartnerHours += e.delta;
    else awaitingYouHours += e.delta;
  }
  return {
    awaitingPartnerHours: Math.round(awaitingPartnerHours * 100) / 100,
    awaitingYouHours: Math.round(awaitingYouHours * 100) / 100,
    entries,
  };
}
