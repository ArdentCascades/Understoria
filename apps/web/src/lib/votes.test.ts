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
import { describe, expect, it } from "vitest";
import { currentMemberVote, tallyVotes, voteId } from "./votes";
import type { Vote, VoteChoice } from "@/types";

function vote(overrides: Partial<Vote> & {
  voterKey: string;
  choice: VoteChoice;
}): Vote {
  return {
    id: voteId(overrides.proposalId ?? "p1", overrides.voterKey),
    proposalId: overrides.proposalId ?? "p1",
    reason: null,
    createdAt: 0,
    nodeId: "n1",
    ...overrides,
  };
}

describe("tallyVotes", () => {
  it("returns empty buckets when no votes exist", () => {
    const t = tallyVotes([]);
    expect(t.affirms).toEqual([]);
    expect(t.blocks).toEqual([]);
    expect(t.abstains).toEqual([]);
    expect(t.totalVoters).toBe(0);
  });

  it("groups by choice", () => {
    const t = tallyVotes([
      vote({ voterKey: "a", choice: "affirm" }),
      vote({ voterKey: "b", choice: "block", reason: "concerned" }),
      vote({ voterKey: "c", choice: "abstain" }),
    ]);
    expect(t.affirms.map((e) => e.voterKey)).toEqual(["a"]);
    expect(t.blocks.map((e) => e.voterKey)).toEqual(["b"]);
    expect(t.blocks[0].reason).toBe("concerned");
    expect(t.abstains.map((e) => e.voterKey)).toEqual(["c"]);
    expect(t.totalVoters).toBe(3);
  });

  it("uses the latest vote per voter (block changed to affirm)", () => {
    const t = tallyVotes([
      vote({ voterKey: "a", choice: "block", createdAt: 100 }),
      vote({ voterKey: "a", choice: "affirm", createdAt: 200 }),
    ]);
    expect(t.affirms.map((e) => e.voterKey)).toEqual(["a"]);
    expect(t.blocks).toEqual([]);
    expect(t.totalVoters).toBe(1);
  });

  it("handles out-of-order vote rows correctly", () => {
    const t = tallyVotes([
      vote({ voterKey: "a", choice: "affirm", createdAt: 200 }),
      vote({ voterKey: "a", choice: "block", createdAt: 100 }),
    ]);
    expect(t.affirms.map((e) => e.voterKey)).toEqual(["a"]);
    expect(t.blocks).toEqual([]);
  });

  it("sorts each bucket newest-first", () => {
    const t = tallyVotes([
      vote({ voterKey: "old", choice: "affirm", createdAt: 100 }),
      vote({ voterKey: "new", choice: "affirm", createdAt: 300 }),
      vote({ voterKey: "mid", choice: "affirm", createdAt: 200 }),
    ]);
    expect(t.affirms.map((e) => e.voterKey)).toEqual(["new", "mid", "old"]);
  });

  it("counts distinct voters in totalVoters", () => {
    const t = tallyVotes([
      vote({ voterKey: "a", choice: "affirm", createdAt: 1 }),
      vote({ voterKey: "a", choice: "block", createdAt: 2 }),
      vote({ voterKey: "b", choice: "affirm", createdAt: 1 }),
    ]);
    expect(t.totalVoters).toBe(2);
  });
});

describe("currentMemberVote", () => {
  it("returns null when the member has not voted", () => {
    expect(
      currentMemberVote("me", [vote({ voterKey: "other", choice: "affirm" })]),
    ).toBeNull();
  });

  it("returns the latest choice when the member has voted", () => {
    expect(
      currentMemberVote("me", [
        vote({ voterKey: "me", choice: "block", createdAt: 100 }),
        vote({ voterKey: "me", choice: "affirm", createdAt: 200 }),
      ]),
    ).toBe("affirm");
  });

  it("ignores votes from other members", () => {
    expect(
      currentMemberVote("me", [
        vote({ voterKey: "other", choice: "block", createdAt: 200 }),
        vote({ voterKey: "me", choice: "affirm", createdAt: 100 }),
      ]),
    ).toBe("affirm");
  });
});

describe("voteId", () => {
  it("composes a stable id from proposal + voter", () => {
    expect(voteId("prop_1", "alice")).toBe("prop_1|alice");
  });
});
