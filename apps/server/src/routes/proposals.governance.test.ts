/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  canonicalInvitePayload,
  canonicalProposalClosurePayload,
  canonicalProposalPayload,
  canonicalRedemptionPayload,
  canonicalVotePayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  Proposal,
  ProposalClosure,
  RedemptionReceipt,
  Vote,
} from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

let app: FastifyInstance;
let db: DatabaseType;
let internalToken = "";
let founder: KeyPair;

let seq = 0;

function makeReceipt(inviter: KeyPair, redeemer: KeyPair): RedemptionReceipt {
  const invitePayload = {
    token: `tok_${++seq}`,
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

async function admit(member: KeyPair) {
  const res = await app.inject({
    method: "POST",
    url: "/redemptions",
    payload: makeReceipt(founder, member),
  });
  expect([200, 201]).toContain(res.statusCode);
}

function makeProposal(
  proposer: KeyPair,
  over: Partial<Proposal> = {},
): Proposal {
  const core = {
    id: `prop_${++seq}`,
    nodeId: "node_test",
    kind: "proposal" as const,
    category: "config_change" as const,
    reversibilityTier: "easy" as const,
    title: "Raise the helper limit",
    description: "",
    payload: "{}",
    proposerKey: proposer.publicKey,
    createdAt: Date.now(),
    impactReflection: null,
    disputePostId: null,
    ...over,
  };
  return {
    ...core,
    status: "open",
    closedAt: null,
    closedReason: null,
    signerKey: proposer.publicKey,
    signature: sign(canonicalProposalPayload(core), proposer.secretKey),
  } as Proposal;
}

function makeVote(
  voter: KeyPair,
  proposalId: string,
  choice: Vote["choice"],
  createdAt = Date.now(),
): Vote {
  const core = {
    id: `${proposalId}|${voter.publicKey}`,
    proposalId,
    voterKey: voter.publicKey,
    choice,
    reason: null,
    createdAt,
    nodeId: "node_test",
  };
  return {
    ...core,
    signerKey: voter.publicKey,
    signature: sign(canonicalVotePayload(core), voter.secretKey),
  };
}

function makeClosure(
  closer: KeyPair,
  proposalId: string,
  outcome: ProposalClosure["outcome"],
): ProposalClosure {
  const core = {
    id: `close_${++seq}`,
    proposalId,
    outcome,
    reason: null,
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

beforeEach(async () => {
  db = openDatabase(":memory:");
  founder = generateKeyPair();
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    NODE_ID: "node_test",
    RATE_LIMIT_MAX: "10000",
    NODE_FOUNDER_KEYS: founder.publicKey,
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  internalToken = built.internalBypassToken;
  await app.ready();
});
afterEach(async () => {
  await app.close();
  db.close();
});

async function post(url: string, payload: unknown, headers = {}) {
  return app.inject({ method: "POST", url, payload, headers });
}

describe("proposal federation G1 — the member-gated governance surfaces", () => {
  it("stores a member's signed proposal; refuses strangers and forgeries", async () => {
    const member = generateKeyPair();
    const stranger = generateKeyPair();
    await admit(member);

    const proposal = makeProposal(member);
    expect((await post("/proposals", proposal)).statusCode).toBe(201);
    // Idempotent.
    expect((await post("/proposals", proposal)).statusCode).toBe(200);
    // A non-member's validly-signed proposal is refused at the door.
    expect(
      (await post("/proposals", makeProposal(stranger))).statusCode,
    ).toBe(403);
    // Tampered core fails signature.
    expect(
      (
        await post("/proposals", {
          ...makeProposal(member),
          title: "edited after signing",
        })
      ).statusCode,
    ).toBe(422);

    const feed = await app.inject({ method: "GET", url: "/proposals" });
    const body = feed.json() as { proposals: Proposal[] };
    expect(body.proposals).toHaveLength(1);
    // The stored wire form carries no lifecycle fields — status is
    // derived from closures everywhere.
    expect(body.proposals[0]).not.toHaveProperty("status");
  });

  it("votes: one per member per proposal, LWW re-cast, referent 409", async () => {
    const proposer = generateKeyPair();
    const voter = generateKeyPair();
    await admit(proposer);
    await admit(voter);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);

    // Vote for a proposal the node doesn't hold: retryable 409.
    expect(
      (await post("/votes", makeVote(voter, "prop_missing", "affirm")))
        .statusCode,
    ).toBe(409);

    const t = Date.now();
    expect(
      (await post("/votes", makeVote(voter, proposal.id, "affirm", t)))
        .statusCode,
    ).toBe(201);
    // Stale re-cast is a no-op; newer replaces (the natural key holds
    // one row per voter).
    expect(
      (await post("/votes", makeVote(voter, proposal.id, "block", t - 10)))
        .statusCode,
    ).toBe(200);
    expect(
      (await post("/votes", makeVote(voter, proposal.id, "block", t + 10)))
        .statusCode,
    ).toBe(201);
    const feed = await app.inject({ method: "GET", url: "/votes" });
    const votes = (feed.json() as { votes: Vote[] }).votes;
    expect(votes).toHaveLength(1);
    expect(votes[0].choice).toBe("block");
  });

  it("closures: first-writer-wins, standing-block guard, mirror exemption", async () => {
    const proposer = generateKeyPair();
    const blocker = generateKeyPair();
    const closer = generateKeyPair();
    await admit(proposer);
    await admit(blocker);
    await admit(closer);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);
    await post("/votes", makeVote(blocker, proposal.id, "block"));

    // A closure claiming passed over a standing block: refused (the
    // parameter-free half of the eligibility rule).
    expect(
      (await post("/proposal-closures", makeClosure(closer, proposal.id, "passed")))
        .statusCode,
    ).toBe(409);
    // Mirror replication is exempt — the origin's accepted decision
    // replicates verbatim.
    const mirrored = makeClosure(closer, proposal.id, "passed");
    expect(
      (
        await post("/proposal-closures", mirrored, {
          "x-understoria-internal": internalToken,
        })
      ).statusCode,
    ).toBe(201);
    // First-writer-wins: a competing closure answers 200 with the
    // winner's id.
    const competing = await post(
      "/proposal-closures",
      makeClosure(closer, proposal.id, "rejected"),
    );
    expect(competing.statusCode).toBe(200);
    expect(competing.json()).toEqual({ stored: false, id: mirrored.id });
  });

  it("a withdrawn closure needs no eligibility; non-members cannot close", async () => {
    const proposer = generateKeyPair();
    const stranger = generateKeyPair();
    await admit(proposer);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);

    expect(
      (
        await post(
          "/proposal-closures",
          makeClosure(stranger, proposal.id, "withdrawn"),
        )
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await post(
          "/proposal-closures",
          makeClosure(proposer, proposal.id, "withdrawn"),
        )
      ).statusCode,
    ).toBe(201);
  });
});
