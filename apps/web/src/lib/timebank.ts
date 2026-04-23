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
