/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  canonicalInvitePayload,
  canonicalMemberRemovalPayload,
  canonicalProposalClosurePayload,
  canonicalProposalPayload,
  canonicalRedemptionPayload,
  canonicalVotePayload,
  generateKeyPair,
  sign,
  verifyProposal,
  verifyProposalClosure,
  verifyVote,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  MemberRemoval,
  Proposal,
  ProposalClosure,
  RedemptionReceipt,
  Vote,
} from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

/*
 * The federated-governance drill: one community, two member devices,
 * one decision, one consequence — the full G1+G2+M1 loop over the
 * REAL routes, exactly as two PWAs would drive it. Each step below is
 * what a device's outbox/pull would do; the assertions after each GET
 * are the verifications every pulling device applies before merging.
 * The web-side halves (signing mutators, merge rules, closure-effect
 * application) hold their own unit coverage; what this drill locks is
 * the WIRE: that the records the mutators mint are exactly the records
 * the routes accept, feed back, and gate on.
 */

let app: FastifyInstance | null = null;
let db: DatabaseType | null = null;

afterEach(async () => {
  if (app) await app.close();
  if (db) db.close();
  app = null;
  db = null;
});

let seq = 0;

function makeReceipt(inviter: KeyPair, redeemer: KeyPair): RedemptionReceipt {
  const invitePayload = {
    token: `tok_${++seq}_${redeemer.publicKey.slice(0, 6)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Inviter",
    nodeId: "node_test",
    createdAt: Date.now() - 1000,
    expiresAt: Date.now() + 86_400_000,
  };
  const invite = {
    ...invitePayload,
    signature: sign(canonicalInvitePayload(invitePayload), inviter.secretKey),
  };
  const payload = {
    invite,
    redeemedBy: redeemer.publicKey,
    displayName: "New Member",
    redeemedAt: Date.now(),
  };
  return {
    ...payload,
    signature: sign(canonicalRedemptionPayload(payload), redeemer.secretKey),
  };
}

function signedProposal(proposer: KeyPair, over: Partial<Proposal> = {}) {
  const core = {
    id: `prop_${++seq}`,
    nodeId: "node_test",
    kind: "proposal" as const,
    category: "config_change" as const,
    reversibilityTier: "hard" as const,
    title: "Should Mallory remain a member?",
    description: "Deliberation before a removal ceremony.",
    payload: "{}",
    proposerKey: proposer.publicKey,
    createdAt: Date.now(),
    impactReflection: null,
    disputePostId: null,
    ...over,
  };
  return {
    ...core,
    signerKey: proposer.publicKey,
    signature: sign(canonicalProposalPayload(core), proposer.secretKey),
  };
}

function signedVote(voter: KeyPair, proposalId: string, choice: Vote["choice"]) {
  const core = {
    id: `${proposalId}|${voter.publicKey}`,
    proposalId,
    voterKey: voter.publicKey,
    choice,
    reason: null,
    createdAt: Date.now(),
    nodeId: "node_test",
  };
  return {
    ...core,
    signerKey: voter.publicKey,
    signature: sign(canonicalVotePayload(core), voter.secretKey),
  };
}

function signedClosure(
  closer: KeyPair,
  proposalId: string,
  outcome: ProposalClosure["outcome"],
) {
  const core = {
    id: `close_${++seq}`,
    proposalId,
    outcome,
    reason: "consensus reached",
    closedAt: Date.now(),
    closerKey: closer.publicKey,
    nodeId: "node_test",
  };
  return {
    ...core,
    signerKey: closer.publicKey,
    signature: sign(canonicalProposalClosurePayload(core), closer.secretKey),
  };
}

describe("federated governance drill — two devices, one decision", () => {
  it("propose → cross-device vote → passed closure → linked removal → gate", async () => {
    const founder = generateKeyPair();
    const rosa = generateKeyPair(); // device A
    const gus = generateKeyPair(); // device B
    const mallory = generateKeyPair(); // the subject
    db = openDatabase(":memory:");
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      NODE_ID: "node_test",
      RATE_LIMIT_MAX: "10000",
      NODE_FOUNDER_KEYS: founder.publicKey,
      REMOVAL_QUORUM: "2",
    } as NodeJS.ProcessEnv);
    const built = await buildServer({ config, database: db });
    app = built.app;
    await app.ready();

    for (const member of [rosa, gus, mallory]) {
      const res = await app.inject({
        method: "POST",
        url: "/redemptions",
        payload: makeReceipt(founder, member),
      });
      expect([200, 201]).toContain(res.statusCode);
    }

    // Device A files the deliberation proposal.
    const proposal = signedProposal(rosa);
    expect(
      (
        await app.inject({ method: "POST", url: "/proposals", payload: proposal })
      ).statusCode,
    ).toBe(201);

    // Device B pulls the feed and verifies before merging — the same
    // check federationSync applies.
    const feed = (
      await app.inject({ method: "GET", url: "/proposals" })
    ).json() as { proposals: Proposal[] };
    expect(feed.proposals).toHaveLength(1);
    const pulled = feed.proposals[0];
    expect(verifyProposal(pulled)).toBe(true);
    expect(pulled).not.toHaveProperty("status");

    // Both devices cast open ballots.
    for (const voter of [rosa, gus]) {
      const res = await app.inject({
        method: "POST",
        url: "/votes",
        payload: signedVote(voter, proposal.id, "affirm"),
      });
      expect(res.statusCode).toBe(201);
    }
    const votes = (
      await app.inject({
        method: "GET",
        url: `/votes?proposalId=${proposal.id}`,
      })
    ).json() as { votes: Vote[] };
    expect(votes.votes).toHaveLength(2);
    for (const v of votes.votes) expect(verifyVote(v)).toBe(true);

    // Device B closes as passed — accepted because the node's merged
    // ballot shows no standing blocks.
    const closure = signedClosure(gus, proposal.id, "passed");
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/proposal-closures",
          payload: closure,
        })
      ).statusCode,
    ).toBe(201);

    // Device A pulls the closure and verifies it — from here the
    // web's applyClosureEffects converges both devices.
    const closures = (
      await app.inject({ method: "GET", url: "/proposal-closures" })
    ).json() as { proposalClosures: ProposalClosure[] };
    expect(closures.proposalClosures).toHaveLength(1);
    expect(verifyProposalClosure(closures.proposalClosures[0])).toBe(true);
    expect(closures.proposalClosures[0].outcome).toBe("passed");

    // The removal ceremony links the deliberation it grew from:
    // proposalId carries the REAL shared proposal id, inside the
    // canonical payload both signers signed.
    const removalPayload = {
      id: `rm_${++seq}`,
      removedKey: mallory.publicKey,
      reason: "community decision after deliberation",
      decidedAt: Date.now(),
      nodeId: "node_test",
      proposalId: proposal.id,
    };
    const canonical = canonicalMemberRemovalPayload(removalPayload);
    const removal: MemberRemoval = {
      ...removalPayload,
      signatures: [rosa, gus].map((s) => ({
        signerKey: s.publicKey,
        signature: sign(canonical, s.secretKey),
      })),
    };
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/member-removals",
          payload: removal,
        })
      ).statusCode,
    ).toBe(201);
    const removals = (
      await app.inject({ method: "GET", url: "/member-removals" })
    ).json() as { memberRemovals: MemberRemoval[] };
    expect(removals.memberRemovals).toHaveLength(1);
    expect(removals.memberRemovals[0].proposalId).toBe(proposal.id);

    // The consequence: the removed member's governance writes are
    // refused at the door.
    const late = await app.inject({
      method: "POST",
      url: "/votes",
      payload: signedVote(mallory, proposal.id, "block"),
    });
    expect(late.statusCode).toBe(403);
  });
});
