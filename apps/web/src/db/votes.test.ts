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
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./database";
import { castVote, getMemberVote, listVotesFor } from "./votes";

const NODE = "node_votes_test";

async function reset() {
  await db.votes.clear();
}

describe("castVote", () => {
  beforeEach(reset);

  it("stores the vote with the deterministic id", async () => {
    const v = await castVote({
      proposalId: "p1",
      voterKey: "alice",
      choice: "affirm",
      nodeId: NODE,
    });
    expect(v.id).toBe("p1|alice");
    expect(v.choice).toBe("affirm");
    expect(v.reason).toBeNull();
  });

  it("trims whitespace and treats whitespace-only reason as null", async () => {
    const v = await castVote({
      proposalId: "p1",
      voterKey: "alice",
      choice: "block",
      reason: "   ",
      nodeId: NODE,
    });
    expect(v.reason).toBeNull();
  });

  it("stores a trimmed reason when provided", async () => {
    const v = await castVote({
      proposalId: "p1",
      voterKey: "alice",
      choice: "block",
      reason: "  worried about edge case  ",
      nodeId: NODE,
    });
    expect(v.reason).toBe("worried about edge case");
  });

  it("re-casting overwrites the prior row in place", async () => {
    await castVote({
      proposalId: "p1",
      voterKey: "alice",
      choice: "block",
      reason: "first reaction",
      nodeId: NODE,
    });
    await castVote({
      proposalId: "p1",
      voterKey: "alice",
      choice: "affirm",
      nodeId: NODE,
    });
    const rows = await listVotesFor("p1");
    expect(rows).toHaveLength(1);
    expect(rows[0].choice).toBe("affirm");
    expect(rows[0].reason).toBeNull();
  });

  it("refuses to record a vote on a CLOSED proposal (Round-4 L4)", async () => {
    const { createProposal, closeProposal } = await import("./proposals");
    const p = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "T",
      description: "",
      payload: "{}",
      proposerKey: "proposer",
      nodeId: NODE,
    });
    await closeProposal(p.id, "rejected", "done");
    await expect(
      castVote({
        proposalId: p.id,
        voterKey: "latecomer",
        choice: "affirm",
        nodeId: NODE,
      }),
    ).rejects.toThrow(/closed/i);
    expect(await listVotesFor(p.id)).toHaveLength(0);
  });
});

describe("listVotesFor", () => {
  beforeEach(reset);

  it("returns only votes for the given proposal", async () => {
    await castVote({
      proposalId: "p1",
      voterKey: "alice",
      choice: "affirm",
      nodeId: NODE,
    });
    await castVote({
      proposalId: "p2",
      voterKey: "alice",
      choice: "block",
      nodeId: NODE,
    });
    await castVote({
      proposalId: "p1",
      voterKey: "bob",
      choice: "abstain",
      nodeId: NODE,
    });
    const rows = await listVotesFor("p1");
    expect(rows.map((r) => r.voterKey).sort()).toEqual(["alice", "bob"]);
  });

  it("returns empty array when no votes exist for the proposal", async () => {
    expect(await listVotesFor("p_nothing")).toEqual([]);
  });
});

describe("getMemberVote", () => {
  beforeEach(reset);

  it("returns null when no vote exists", async () => {
    expect(await getMemberVote("p1", "alice")).toBeNull();
  });

  it("returns the stored vote when one exists", async () => {
    await castVote({
      proposalId: "p1",
      voterKey: "alice",
      choice: "block",
      reason: "needs more discussion",
      nodeId: NODE,
    });
    const v = await getMemberVote("p1", "alice");
    expect(v?.choice).toBe("block");
    expect(v?.reason).toBe("needs more discussion");
  });
});
