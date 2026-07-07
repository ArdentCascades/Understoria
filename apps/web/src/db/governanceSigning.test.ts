/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  generateKeyPair,
  verifyProposal,
  verifyProposalClosure,
  verifyVote,
} from "@understoria/shared/crypto";
import { db, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { persistSecretKey } from "@/db/secrets";
import { createProposal, closeProposal } from "./proposals";
import { castVote } from "./votes";

async function wipe() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

async function beMember(name: string) {
  const kp = generateKeyPair();
  await createMember({ publicKey: kp.publicKey, displayName: name }, "node_t");
  await persistSecretKey(kp.publicKey, kp.secretKey);
  await setSetting(SETTING_KEYS.currentMember, kp.publicKey);
  await setSetting(SETTING_KEYS.communityNodeUrl, "https://node.test/api");
  return kp;
}

beforeEach(wipe);

describe("proposal federation G1 — signing at the mutators", () => {
  it("createProposal signs the core and queues it for the node", async () => {
    const me = await beMember("Rosa");
    const proposal = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "Raise the helper limit",
      description: "",
      payload: "{}",
      proposerKey: me.publicKey,
      nodeId: "node_t",
    });
    expect(proposal.signerKey).toBe(me.publicKey);
    expect(verifyProposal(proposal)).toBe(true);
    expect(
      await db.outbox.filter((r) => r.kind === "proposal").count(),
    ).toBe(1);
  });

  it("castVote signs (open ballots) and re-casting replaces the queued row", async () => {
    const me = await beMember("Rosa");
    const proposal = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "t",
      description: "",
      payload: "{}",
      proposerKey: me.publicKey,
      nodeId: "node_t",
    });
    const vote = await castVote({
      proposalId: proposal.id,
      voterKey: me.publicKey,
      choice: "affirm",
      nodeId: "node_t",
    });
    expect(verifyVote(vote)).toBe(true);
    const recast = await castVote({
      proposalId: proposal.id,
      voterKey: me.publicKey,
      choice: "block",
      reason: "wait",
      nodeId: "node_t",
    });
    expect(verifyVote(recast)).toBe(true);
    // One local row (natural key) and one queued row (natural dedup key).
    expect(await db.votes.where("proposalId").equals(proposal.id).count()).toBe(1);
    expect(await db.outbox.filter((r) => r.kind === "vote").count()).toBe(1);
  });

  it("closeProposal mints a signed first-writer closure record", async () => {
    const me = await beMember("Rosa");
    const proposal = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "t",
      description: "",
      payload: "{}",
      proposerKey: me.publicKey,
      nodeId: "node_t",
    });
    const closed = await closeProposal(proposal.id, "withdrawn", "changed my mind");
    expect(closed.status).toBe("withdrawn");
    const closure = await db.proposalClosures.get(proposal.id);
    expect(closure).toBeDefined();
    if (!closure) return;
    expect(closure.outcome).toBe("withdrawn");
    expect(closure.closerKey).toBe(me.publicKey);
    expect(verifyProposalClosure(closure)).toBe(true);
    expect(
      await db.outbox.filter((r) => r.kind === "proposal_closure").count(),
    ).toBe(1);

    // A second local close throws (unchanged local rule) and the
    // closure table keeps ONE record.
    await expect(
      closeProposal(proposal.id, "rejected", "again"),
    ).rejects.toThrow();
    expect(await db.proposalClosures.count()).toBe(1);
  });

  it("a device that cannot sign still records locally (legacy posture)", async () => {
    const kp = generateKeyPair();
    await createMember({ publicKey: kp.publicKey, displayName: "NoKey" }, "node_t");
    await setSetting(SETTING_KEYS.currentMember, kp.publicKey);
    // No persisted secret key — signing degrades, creation succeeds.
    const proposal = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "t",
      description: "",
      payload: "{}",
      proposerKey: kp.publicKey,
      nodeId: "node_t",
    });
    expect(proposal.signature).toBeUndefined();
    expect(await db.outbox.count()).toBe(0);
  });
});
