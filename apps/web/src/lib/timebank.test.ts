import { describe, expect, it } from "vitest";
import { balanceFor, transactionHistory } from "./timebank";
import type { Exchange, Member } from "@/types";

const nodeId = "node_test";

function member(publicKey: string, seedBalance = 5): Member {
  return {
    publicKey,
    displayName: publicKey,
    skills: [],
    availability: "",
    seedBalance,
    vouchedBy: [],
    createdAt: 0,
    nodeId,
    locationZone: "",
  };
}

function exchange(
  id: string,
  helper: string,
  helped: string,
  hours: number,
  completedAt: number,
): Exchange {
  return {
    id,
    postId: `post_${id}`,
    helperKey: helper,
    helpedKey: helped,
    hoursExchanged: hours,
    helperSignature: "sig1",
    helpedSignature: "sig2",
    completedAt,
    category: "other",
    nodeId,
  };
}

describe("timebank.balanceFor", () => {
  it("returns seed balance when there are no exchanges", () => {
    expect(balanceFor(member("a"), [])).toBe(5);
  });

  it("adds hours to the helper and deducts from the helped party", () => {
    const a = member("a");
    const b = member("b");
    const exchanges = [exchange("1", "a", "b", 2, 0)];
    expect(balanceFor(a, exchanges)).toBe(7);
    expect(balanceFor(b, exchanges)).toBe(3);
  });

  it("allows balances to go negative (philosophical, not gated)", () => {
    const a = member("a");
    const exchanges = [
      exchange("1", "b", "a", 3, 0),
      exchange("2", "c", "a", 4, 0),
    ];
    expect(balanceFor(a, exchanges)).toBe(-2);
  });

  it("ignores exchanges not involving the member", () => {
    const a = member("a");
    const exchanges = [exchange("1", "b", "c", 2, 0)];
    expect(balanceFor(a, exchanges)).toBe(5);
  });

  it("treats fractional hours correctly and rounds to 2 decimals", () => {
    const a = member("a", 0);
    const exchanges = [
      exchange("1", "a", "b", 0.5, 0),
      exchange("2", "a", "c", 0.25, 0),
    ];
    expect(balanceFor(a, exchanges)).toBe(0.75);
  });
});

describe("timebank.transactionHistory", () => {
  it("returns entries sorted newest first with correct deltas", () => {
    const exchanges = [
      exchange("1", "a", "b", 1, 100),
      exchange("2", "b", "a", 2, 200),
      exchange("3", "c", "d", 3, 300),
    ];
    const history = transactionHistory("a", exchanges);
    expect(history.map((h) => h.exchange.id)).toEqual(["2", "1"]);
    expect(history[0].delta).toBe(-2);
    expect(history[0].counterparty).toBe("b");
    expect(history[1].delta).toBe(1);
  });
});
