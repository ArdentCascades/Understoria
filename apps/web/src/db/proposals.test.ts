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
import { founderKeyHash } from "@understoria/shared/crypto";
import { db, setSetting, SETTING_KEYS } from "./database";
import { LAST_SEEN_FOUNDER_HASHES } from "@/lib/founderRoots";
import { castVote } from "./votes";
import {
  buildDisputeProposal,
  closeProposal,
  createProposal,
  ensureDisputeProposal,
  getProposal,
  listProposals,
} from "./proposals";
import type { Post } from "@/types";

const NODE = "node_proposals_test";
const PROPOSER = "proposer_key";

async function reset() {
  await db.proposals.clear();
}

describe("createProposal", () => {
  beforeEach(reset);

  it("creates a proposal with status='open' and stamps createdAt", async () => {
    const before = Date.now();
    const proposal = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "Lower the daily helper limit",
      description: "Drop from 3 to 2 to encourage spread.",
      payload: JSON.stringify({ dailyHelperLimit: 2 }),
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    expect(proposal.status).toBe("open");
    expect(proposal.kind).toBe("proposal");
    expect(proposal.closedAt).toBeNull();
    expect(proposal.closedReason).toBeNull();
    expect(proposal.impactReflection).toBeNull();
    expect(proposal.createdAt).toBeGreaterThanOrEqual(before);
  });

  it("rejects an empty title", async () => {
    await expect(
      createProposal({
        category: "config_change",
        reversibilityTier: "easy",
        title: "   ",
        description: "",
        payload: "{}",
        proposerKey: PROPOSER,
        nodeId: NODE,
      }),
    ).rejects.toThrow(/title/i);
  });

  it("trims title and description before storing", async () => {
    const p = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "  Title  ",
      description: "  Body  ",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    expect(p.title).toBe("Title");
    expect(p.description).toBe("Body");
  });

  it("serializes impactReflection to JSON when provided", async () => {
    const p = await createProposal({
      category: "config_change",
      reversibilityTier: "hard",
      title: "Big change",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
      impactReflection: {
        yearOne: "y1",
        fiveYear: "5y",
        reversalPath: "rev",
        vulnerableImpact: "vi",
      },
    });
    expect(p.impactReflection).toBe(
      '{"yearOne":"y1","fiveYear":"5y","reversalPath":"rev","vulnerableImpact":"vi"}',
    );
  });
});

describe("listProposals", () => {
  beforeEach(reset);

  it("returns an empty array when no proposals exist", async () => {
    expect(await listProposals()).toEqual([]);
  });

  it("returns all proposals newest-first by createdAt", async () => {
    const a = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "A",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    // Manually space them so createdAt differs reliably.
    await db.proposals.update(a.id, { createdAt: 1000 });
    const b = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "B",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    await db.proposals.update(b.id, { createdAt: 3000 });
    const c = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "C",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    await db.proposals.update(c.id, { createdAt: 2000 });
    const result = await listProposals();
    expect(result.map((p) => p.title)).toEqual(["B", "C", "A"]);
  });

  it("filters by status when requested", async () => {
    const a = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "Open one",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    const b = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "Will be closed",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    await closeProposal(b.id, "passed", "Consensus on Tuesday call");
    const open = await listProposals({ status: "open" });
    expect(open.map((p) => p.id)).toEqual([a.id]);
    const passed = await listProposals({ status: "passed" });
    expect(passed.map((p) => p.id)).toEqual([b.id]);
  });
});

describe("closeProposal", () => {
  beforeEach(reset);

  it("transitions status, stamps closedAt + closedReason", async () => {
    const p = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "T",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    const before = Date.now();
    const closed = await closeProposal(p.id, "passed", "Approved on call");
    expect(closed.status).toBe("passed");
    expect(closed.closedReason).toBe("Approved on call");
    expect(closed.closedAt).toBeGreaterThanOrEqual(before);
  });

  it("stores closedReason as null when only whitespace", async () => {
    const p = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "T",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    const closed = await closeProposal(p.id, "withdrawn", "  ");
    expect(closed.closedReason).toBeNull();
  });

  it("refuses to close an already-closed proposal", async () => {
    const p = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "T",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    await closeProposal(p.id, "passed", "Done");
    await expect(closeProposal(p.id, "rejected", "")).rejects.toThrow(
      /already closed/i,
    );
  });

  it("throws when the proposal doesn't exist", async () => {
    await expect(closeProposal("nope", "passed", "")).rejects.toThrow(
      /not found/i,
    );
  });

  it("refuses to close as PASSED while a standing block vote exists (Round-4 — decision math can't be censored by a viewer's block)", async () => {
    const p = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "T",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    await castVote({
      proposalId: p.id,
      voterKey: "blocker_key",
      choice: "block",
      nodeId: NODE,
    });
    await expect(closeProposal(p.id, "passed", "Consensus?")).rejects.toThrow(
      /standing block/i,
    );
    // Rejected/withdrawn are unaffected — a block doesn't force passage,
    // it only prevents it.
    const closed = await closeProposal(p.id, "rejected", "sent back");
    expect(closed.status).toBe("rejected");
  });
});

describe("getProposal", () => {
  beforeEach(reset);

  it("returns the proposal by id", async () => {
    const p = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "T",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    expect(await getProposal(p.id)).toEqual(p);
  });

  it("returns null for an unknown id", async () => {
    expect(await getProposal("missing")).toBeNull();
  });
});

function disputedPost(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-1",
    nodeId: NODE,
    type: "NEED",
    category: "other",
    title: "Help with bike",
    description: "broken chain",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "poster",
    claimedBy: "claimer",
    status: "disputed",
    confirmedBy: [],
    createdAt: 5000,
    expiresAt: null,
    locationZone: "",
    signature: "",
    ...overrides,
  };
}

describe("buildDisputeProposal", () => {
  it("maps NEED helper/recipient correctly", () => {
    // NEED: poster needs help, claimer helps.
    const proposal = buildDisputeProposal({
      post: disputedPost({ type: "NEED" }),
      flaggerKey: "claimer",
      reason: "Didn't show up",
      now: 12345,
    });
    expect(proposal.kind).toBe("dispute");
    expect(proposal.category).toBe("dispute");
    expect(proposal.disputePostId).toBe("post-1");
    expect(proposal.createdAt).toBe(12345);
    expect(proposal.description).toBe("Didn't show up");
    expect(proposal.proposerKey).toBe("claimer");
    const payload = JSON.parse(proposal.payload);
    expect(payload.helperKey).toBe("claimer");
    expect(payload.recipientKey).toBe("poster");
  });

  it("maps OFFER helper/recipient correctly", () => {
    // OFFER: poster is offering help, claimer accepts.
    const proposal = buildDisputeProposal({
      post: disputedPost({ type: "OFFER" }),
      flaggerKey: "poster",
      reason: null,
      now: 0,
    });
    const payload = JSON.parse(proposal.payload);
    expect(payload.helperKey).toBe("poster");
    expect(payload.recipientKey).toBe("claimer");
  });

  it("trims whitespace from the reason", () => {
    const proposal = buildDisputeProposal({
      post: disputedPost(),
      flaggerKey: "claimer",
      reason: "   ",
      now: 0,
    });
    expect(proposal.description).toBe("");
  });
});

describe("ensureDisputeProposal", () => {
  beforeEach(reset);

  it("creates a new dispute proposal when none exists", async () => {
    const proposal = await ensureDisputeProposal({
      post: disputedPost(),
      flaggerKey: "claimer",
      reason: "Issue",
      now: 7000,
    });
    expect(proposal.kind).toBe("dispute");
    const stored = await listProposals({ kind: "dispute" });
    expect(stored).toHaveLength(1);
  });

  it("is idempotent — returns the existing row on second call", async () => {
    const first = await ensureDisputeProposal({
      post: disputedPost({ id: "post-X" }),
      flaggerKey: "claimer",
      reason: "First",
      now: 7000,
    });
    const second = await ensureDisputeProposal({
      post: disputedPost({ id: "post-X" }),
      flaggerKey: "claimer",
      reason: "Different",
      now: 9000,
    });
    expect(second.id).toBe(first.id);
    const stored = await listProposals({ kind: "dispute" });
    expect(stored).toHaveLength(1);
    expect(stored[0].description).toBe("First");
  });
});

describe("closeProposal — trusted-closer guard (defense in depth)", () => {
  // The node answers 403 closer_not_trusted on the wire, but a passed
  // config_change applies its NodeConfig LOCALLY before any delivery —
  // so the same rule runs here, before local effects. Same capture
  // posture as issueInvite: no capture ⇒ allow, the node enforces.
  const ME = "me_closer_key";
  const OTHER = "other_proposer_key";
  const FOUNDER = "founder_root_key";

  beforeEach(async () => {
    await Promise.all([
      db.proposals.clear(),
      db.proposalClosures.clear(),
      db.votes.clear(),
      db.vouches.clear(),
      db.invites.clear(),
      db.members.clear(),
      db.settings.clear(),
    ]);
  });

  async function withCapture(rootKeys: string[]) {
    await setSetting(
      LAST_SEEN_FOUNDER_HASHES,
      JSON.stringify({
        nodeId: NODE,
        hashes: rootKeys.map((k) => founderKeyHash(NODE, k)),
      }),
    );
  }

  async function openProposal(proposerKey: string) {
    return createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "T",
      description: "",
      payload: "{}",
      proposerKey,
      nodeId: NODE,
    });
  }

  it("a pending closer cannot record passed or rejected — thrown BEFORE any local effect", async () => {
    await withCapture([FOUNDER]);
    await setSetting(SETTING_KEYS.currentMember, ME);
    const p = await openProposal(OTHER);
    await expect(closeProposal(p.id, "passed", "")).rejects.toThrow(
      "closer_not_trusted",
    );
    await expect(closeProposal(p.id, "rejected", "")).rejects.toThrow(
      "closer_not_trusted",
    );
    // The row is untouched and no closure record was minted.
    expect((await db.proposals.get(p.id))?.status).toBe("open");
    expect(await db.proposalClosures.count()).toBe(0);
  });

  it("the pending PROPOSER may withdraw their own proposal (the one exemption)", async () => {
    await withCapture([FOUNDER]);
    await setSetting(SETTING_KEYS.currentMember, ME);
    const p = await openProposal(ME);
    const closed = await closeProposal(p.id, "withdrawn", "changed my mind");
    expect(closed.status).toBe("withdrawn");
  });

  it("…but a pending non-proposer cannot withdraw someone else's", async () => {
    await withCapture([FOUNDER]);
    await setSetting(SETTING_KEYS.currentMember, ME);
    const p = await openProposal(OTHER);
    await expect(closeProposal(p.id, "withdrawn", "")).rejects.toThrow(
      "closer_not_trusted",
    );
  });

  it("a trusted closer records outcomes exactly as before", async () => {
    // ME resolves as a founder root — trusted by construction.
    await withCapture([FOUNDER, ME]);
    await setSetting(SETTING_KEYS.currentMember, ME);
    const p = await openProposal(OTHER);
    const closed = await closeProposal(p.id, "passed", "consensus");
    expect(closed.status).toBe("passed");
  });

  it("no founder capture: legacy behavior stands (the node enforces)", async () => {
    await setSetting(SETTING_KEYS.currentMember, ME);
    const p = await openProposal(OTHER);
    const closed = await closeProposal(p.id, "passed", "consensus");
    expect(closed.status).toBe("passed");
  });
});

describe("listProposals kind filter", () => {
  beforeEach(reset);

  it("filters by kind", async () => {
    await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "config",
      description: "",
      payload: "{}",
      proposerKey: PROPOSER,
      nodeId: NODE,
    });
    await ensureDisputeProposal({
      post: disputedPost(),
      flaggerKey: "claimer",
      reason: null,
      now: 0,
    });
    expect((await listProposals({ kind: "proposal" })).length).toBe(1);
    expect((await listProposals({ kind: "dispute" })).length).toBe(1);
    expect((await listProposals()).length).toBe(2);
  });
});
