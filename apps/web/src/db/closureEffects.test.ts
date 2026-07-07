/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { generateKeyPair, verifyProposal } from "@understoria/shared/crypto";
import { DEFAULT_NODE_CONFIG, type NodeConfig, type Post } from "@/types";
import { db, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { persistSecretKey } from "@/db/secrets";
import { getNodeConfig } from "./nodeConfig";
import {
  applyClosureEffects,
  createProposal,
  signProposalIfUnsigned,
} from "./proposals";
import { disputeExchange } from "./actions";

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

describe("proposal federation G2 — convergent effects", () => {
  it("a passed config_change closure converges this device's knobs", async () => {
    const me = await beMember("Rosa");
    const nextConfig: NodeConfig = {
      ...DEFAULT_NODE_CONFIG,
      dailyHelperLimit: 7,
      proposalMinAffirms: 4,
    };
    const proposal = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "Raise limits",
      description: "",
      payload: JSON.stringify(nextConfig),
      proposerKey: me.publicKey,
      nodeId: "node_t",
    });

    await applyClosureEffects(proposal, "passed");
    const applied = await getNodeConfig("node_t");
    expect(applied.dailyHelperLimit).toBe(7);
    expect(applied.proposalMinAffirms).toBe(4);

    // A rejected closure moves nothing.
    const proposal2 = await createProposal({
      category: "config_change",
      reversibilityTier: "easy",
      title: "Lower limits",
      description: "",
      payload: JSON.stringify({ ...nextConfig, dailyHelperLimit: 1 }),
      proposerKey: me.publicKey,
      nodeId: "node_t",
    });
    await applyClosureEffects(proposal2, "rejected");
    expect((await getNodeConfig("node_t")).dailyHelperLimit).toBe(7);

    // An invalid payload degrades softly: record stands, knobs don't move.
    await applyClosureEffects(
      { ...proposal, payload: '{"dailyHelperLimit": -5}' },
      "passed",
    );
    expect((await getNodeConfig("node_t")).dailyHelperLimit).toBe(7);
  });

  it("a dispute closure applied on pull restores the post, idempotently", async () => {
    const me = await beMember("Rosa");
    const other = generateKeyPair();
    await createMember(
      { publicKey: other.publicKey, displayName: "Marcus" },
      "node_t",
    );
    const post: Post = {
      id: "p1",
      type: "OFFER",
      category: "food",
      title: "Soup",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      postedBy: me.publicKey,
      claimedBy: other.publicKey,
      status: "claimed",
      createdAt: Date.now(),
      expiresAt: null,
      locationZone: "z",
      confirmedBy: [],
      nodeId: "node_t",
      signature: "",
    };
    await db.posts.put(post);
    await disputeExchange("p1", me.publicKey, "never happened");
    expect((await db.posts.get("p1"))?.status).toBe("disputed");

    const proposal = await db.proposals
      .where("disputePostId")
      .equals("p1")
      .first();
    expect(proposal).toBeDefined();
    if (!proposal) return;
    // disputeExchange signed the proposal post-commit (G2), so the
    // deliberation itself federates.
    expect(verifyProposal(proposal)).toBe(true);

    // The pulling device applies the same effect path the closing
    // device ran: rejected → the flag did not stand.
    await applyClosureEffects(proposal, "rejected");
    expect((await db.posts.get("p1"))?.status).toBe("claimed");
    // Idempotent: re-applying does nothing once the post left
    // "disputed".
    await db.posts.update("p1", { status: "completed" });
    await applyClosureEffects(proposal, "rejected");
    expect((await db.posts.get("p1"))?.status).toBe("completed");
  });

  it("signProposalIfUnsigned only signs the proposer's own unsigned rows", async () => {
    const me = await beMember("Rosa");
    const stranger = generateKeyPair();
    await db.proposals.put({
      id: "legacy1",
      nodeId: "node_t",
      kind: "proposal",
      category: "config_change",
      reversibilityTier: "easy",
      title: "t",
      description: "",
      payload: "{}",
      proposerKey: stranger.publicKey,
      status: "open",
      createdAt: Date.now(),
      closedAt: null,
      closedReason: null,
      impactReflection: null,
      disputePostId: null,
    });
    await signProposalIfUnsigned("legacy1");
    expect((await db.proposals.get("legacy1"))?.signature).toBeUndefined();

    await db.proposals.put({
      id: "mine1",
      nodeId: "node_t",
      kind: "proposal",
      category: "config_change",
      reversibilityTier: "easy",
      title: "t",
      description: "",
      payload: "{}",
      proposerKey: me.publicKey,
      status: "open",
      createdAt: Date.now(),
      closedAt: null,
      closedReason: null,
      impactReflection: null,
      disputePostId: null,
    });
    await signProposalIfUnsigned("mine1");
    const signed = await db.proposals.get("mine1");
    expect(signed?.signature).toBeDefined();
    expect(verifyProposal(signed!)).toBe(true);
  });
});
