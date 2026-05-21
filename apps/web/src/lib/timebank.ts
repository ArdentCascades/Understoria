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
import type { Exchange, Member } from "@/types";

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
