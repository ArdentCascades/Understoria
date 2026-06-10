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
import { describe, expect, it } from "vitest";
import {
  balanceFor,
  pendingBalanceFor,
  transactionHistory,
} from "./timebank";
import type { Exchange, Member, Post } from "@/types";

const nodeId = "node_test";

function member(publicKey: string, seedBalance = 5): Member {
  return {
    publicKey,
    displayName: publicKey,
    skills: [],
    availability: "",
    availabilityChips: [],
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

function post(
  id: string,
  overrides: Partial<Post> & Pick<Post, "postedBy" | "claimedBy">,
): Post {
  return {
    id,
    type: "NEED",
    category: "other",
    title: `Post ${id}`,
    description: "",
    estimatedHours: 1,
    urgency: "low",
    status: "awaiting_confirmation",
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId,
    signature: "",
    ...overrides,
  };
}

describe("timebank.pendingBalanceFor", () => {
  it("returns zeros and no entries when nothing is awaiting confirmation", () => {
    const posts = [
      // Not yet at the confirmation stage.
      post("1", { postedBy: "a", claimedBy: "b", status: "claimed" }),
      // Already settled — credit moved when the Exchange row was written.
      post("2", { postedBy: "a", claimedBy: "b", status: "completed" }),
      // Awaiting, but not my exchange.
      post("3", { postedBy: "c", claimedBy: "d", confirmedBy: ["c"] }),
    ];
    expect(pendingBalanceFor("a", posts)).toEqual({
      awaitingPartnerHours: 0,
      awaitingYouHours: 0,
      entries: [],
    });
  });

  it("reports credit awaiting the partner when the member already confirmed", () => {
    // NEED post: "a" posted, "b" claimed → b is the helper. b has
    // confirmed; a (the helped party) still owes their signature.
    const posts = [
      post("1", {
        postedBy: "a",
        claimedBy: "b",
        estimatedHours: 2,
        confirmedBy: ["b"],
      }),
    ];
    const pending = pendingBalanceFor("b", posts);
    expect(pending.awaitingPartnerHours).toBe(2);
    expect(pending.awaitingYouHours).toBe(0);
    expect(pending.entries).toEqual([
      {
        postId: "1",
        delta: 2,
        counterparty: "a",
        owedBy: "partner",
        category: "other",
        createdAt: 0,
      },
    ]);
  });

  it("reports credit awaiting the member's own confirmation", () => {
    // Same post viewed from a's side: a hasn't signed yet, so the
    // exchange is waiting on a — and a will be debited once it lands.
    const posts = [
      post("1", {
        postedBy: "a",
        claimedBy: "b",
        estimatedHours: 2,
        confirmedBy: ["b"],
      }),
    ];
    const pending = pendingBalanceFor("a", posts);
    expect(pending.awaitingPartnerHours).toBe(0);
    expect(pending.awaitingYouHours).toBe(-2);
    expect(pending.entries[0].owedBy).toBe("you");
    expect(pending.entries[0].counterparty).toBe("b");
  });

  it("derives helper direction from the post type (OFFER inverts it)", () => {
    // OFFER post: the poster is the helper.
    const posts = [
      post("1", {
        type: "OFFER",
        postedBy: "a",
        claimedBy: "b",
        estimatedHours: 1.5,
        confirmedBy: ["a"],
      }),
    ];
    expect(pendingBalanceFor("a", posts).awaitingPartnerHours).toBe(1.5);
    expect(pendingBalanceFor("b", posts).awaitingYouHours).toBe(-1.5);
  });

  it("splits mixed pending across both buckets and sorts newest first", () => {
    const posts = [
      // I helped, partner owes the confirmation: +1.25 awaiting partner.
      post("1", {
        postedBy: "x",
        claimedBy: "me",
        estimatedHours: 1.25,
        confirmedBy: ["me"],
        createdAt: 100,
      }),
      // I received help and owe my own confirmation: -2 awaiting me.
      post("2", {
        postedBy: "me",
        claimedBy: "y",
        estimatedHours: 2,
        confirmedBy: ["y"],
        createdAt: 300,
      }),
      // I helped and ALSO still owe my own signature: +0.5 awaiting me.
      post("3", {
        postedBy: "z",
        claimedBy: "me",
        estimatedHours: 0.5,
        confirmedBy: ["z"],
        createdAt: 200,
      }),
    ];
    const pending = pendingBalanceFor("me", posts);
    expect(pending.awaitingPartnerHours).toBe(1.25);
    expect(pending.awaitingYouHours).toBe(-1.5);
    expect(pending.entries.map((e) => e.postId)).toEqual(["2", "3", "1"]);
  });

  it("ignores awaiting posts with no claimer or a self-claim", () => {
    const posts = [
      post("1", { postedBy: "a", claimedBy: null }),
      post("2", { postedBy: "a", claimedBy: "a" }),
    ];
    expect(pendingBalanceFor("a", posts).entries).toEqual([]);
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
