/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import Fastify, { type FastifyInstance } from "fastify";
import {
  canonicalInvitePayload,
  canonicalProposalClosurePayload,
  canonicalProposalPayload,
  canonicalRedemptionPayload,
  canonicalVotePayload,
  canonicalVouchPayload,
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
import {
  createProposalClosureStore,
  createProposalStore,
  createVoteStore,
  openDatabase,
} from "../db.js";
import { createTrustResolver } from "../trustGate.js";
import { registerGovernanceRoutes } from "./proposals.governance.js";

let app: FastifyInstance;
let db: DatabaseType;
let internalToken = "";
let founder: KeyPair;
let founder2: KeyPair;

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

/** Second trusted voucher (the 32b2f93 second-founder pattern): the
 *  founder receipt from `admit` plus founder2's manual vouch put
 *  `member` in the rooted trusted set. */
async function entrust(member: KeyPair) {
  const vouchPayload = {
    voucherKey: founder2.publicKey,
    voucheeKey: member.publicKey,
    createdAt: Date.now(),
    kind: "manual" as const,
  };
  const res = await app.inject({
    method: "POST",
    url: "/vouches",
    payload: {
      id: `v_${++seq}`,
      ...vouchPayload,
      signature: sign(canonicalVouchPayload(vouchPayload), founder2.secretKey),
    },
  });
  expect(res.statusCode).toBe(201);
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
  // Two roots (32b2f93): closure-signing is a trusted-member power
  // now, and trust needs 2 distinct trusted vouchers — with a single
  // root no admitted member could ever be entrusted.
  founder2 = generateKeyPair();
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
    NODE_ID: "node_test",
    RATE_LIMIT_MAX: "10000",
    NODE_FOUNDER_KEYS: `${founder.publicKey},${founder2.publicKey}`,
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
    await entrust(closer);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);
    await post("/votes", makeVote(blocker, proposal.id, "block"));

    // A TRUSTED closer claiming passed over a standing block: refused
    // (the parameter-free half of the eligibility rule). The blocker
    // is a pending member — blocks bind regardless of trust.
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
    // The proposer is a PENDING member — this is the trust gate's one
    // exemption landing: withdrawing your own proposal needs no
    // trusted standing.
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

describe("trusted-only closures — the closer gate (threat-model §7)", () => {
  it("a pending closer cannot speak `passed` (403 closer_not_trusted)", async () => {
    const proposer = generateKeyPair();
    const closer = generateKeyPair();
    await admit(proposer);
    await admit(closer);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);

    const res = await post(
      "/proposal-closures",
      makeClosure(closer, proposal.id, "passed"),
    );
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "closer_not_trusted" });
  });

  it("a pending closer cannot speak `rejected` — first-writer-wins would make it a proposal-killing race primitive", async () => {
    const proposer = generateKeyPair();
    const closer = generateKeyPair();
    await admit(proposer);
    await admit(closer);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);

    const res = await post(
      "/proposal-closures",
      makeClosure(closer, proposal.id, "rejected"),
    );
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "closer_not_trusted" });
  });

  it("the withdrawal exemption is self-scoped: a pending NON-proposer cannot withdraw someone else's proposal", async () => {
    const proposer = generateKeyPair();
    const other = generateKeyPair();
    await admit(proposer);
    await admit(other);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);

    const res = await post(
      "/proposal-closures",
      makeClosure(other, proposal.id, "withdrawn"),
    );
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "closer_not_trusted" });
  });

  it("a trusted closer over pending-only affirms lands — the closure gate ALONE is the server's enforcement surface", async () => {
    // The server holds no proposalMinAffirms config and cannot count
    // affirms; this locks the decision that who-may-speak-the-outcome
    // is the entire server-side rule.
    const proposer = generateKeyPair();
    const closer = generateKeyPair();
    const [v1, v2] = [1, 2].map(() => generateKeyPair());
    for (const m of [proposer, closer, v1, v2]) await admit(m);
    await entrust(closer);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);
    await post("/votes", makeVote(v1, proposal.id, "affirm"));
    await post("/votes", makeVote(v2, proposal.id, "affirm"));

    expect(
      (
        await post(
          "/proposal-closures",
          makeClosure(closer, proposal.id, "passed"),
        )
      ).statusCode,
    ).toBe(201);
  });

  it("the idempotent 200 is never re-judged: a stored closure re-POSTed by a pending member settles, not 403s", async () => {
    const proposer = generateKeyPair();
    const trusted = generateKeyPair();
    const pending = generateKeyPair();
    for (const m of [proposer, trusted, pending]) await admit(m);
    await entrust(trusted);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);

    const winner = makeClosure(trusted, proposal.id, "rejected");
    expect((await post("/proposal-closures", winner)).statusCode).toBe(201);
    // Both an identical relay and a competing closure from a pending
    // member answer 200 — the gate sits after first-writer-wins, so
    // grandfathered records and settling outboxes are never re-judged.
    expect((await post("/proposal-closures", winner)).statusCode).toBe(200);
    const competing = await post(
      "/proposal-closures",
      makeClosure(pending, proposal.id, "passed"),
    );
    expect(competing.statusCode).toBe(200);
    expect(competing.json()).toEqual({ stored: false, id: winner.id });
  });

  it("mirror-internal replication bypasses the closer gate — the origin judged the closer", async () => {
    const proposer = generateKeyPair();
    const closer = generateKeyPair();
    await admit(proposer);
    await admit(closer);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);

    expect(
      (
        await post(
          "/proposal-closures",
          makeClosure(closer, proposal.id, "passed"),
          { "x-understoria-internal": internalToken },
        )
      ).statusCode,
    ).toBe(201);
  });

  it("the 403 is retryable by design: the SAME record lands once the closer's vouches arrive", async () => {
    const proposer = generateKeyPair();
    const closer = generateKeyPair();
    await admit(proposer);
    await admit(closer);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);

    const closure = makeClosure(closer, proposal.id, "passed");
    expect((await post("/proposal-closures", closure)).statusCode).toBe(403);
    // Trust data converges like membership data — the outbox re-POST
    // needs no re-signing.
    await entrust(closer);
    expect((await post("/proposal-closures", closure)).statusCode).toBe(201);
  });

  it("votes stay open to pending members: affirm AND block both land", async () => {
    const proposer = generateKeyPair();
    const pending = generateKeyPair();
    await admit(proposer);
    await admit(pending);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);

    expect(
      (await post("/votes", makeVote(pending, proposal.id, "affirm")))
        .statusCode,
    ).toBe(201);
    expect(
      (
        await post(
          "/votes",
          makeVote(pending, proposal.id, "block", Date.now() + 10),
        )
      ).statusCode,
    ).toBe(201);
  });

  it("a pending member's block still trips the standing-block 409 for a trusted closer", async () => {
    const proposer = generateKeyPair();
    const blocker = generateKeyPair();
    const closer = generateKeyPair();
    for (const m of [proposer, blocker, closer]) await admit(m);
    await entrust(closer);
    const proposal = makeProposal(proposer);
    await post("/proposals", proposal);
    await post("/votes", makeVote(blocker, proposal.id, "block"));

    const res = await post(
      "/proposal-closures",
      makeClosure(closer, proposal.id, "passed"),
    );
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "standing_block" });
  });
});

describe("closure gate skips — founderless node and the reseed grace window", () => {
  // Registered directly (not via buildServer): through the full
  // server a founderless node has no MEMBERS either, so 403
  // not_a_member fires before the gate and would mask the skip under
  // test. Membership is stubbed open; trust runs the real resolver.
  async function bareServer(opts: {
    envFounderKeys: string[];
    reseedGraceUntil?: number | null;
    now?: () => number;
  }) {
    const bareDb = openDatabase(":memory:");
    const bare = Fastify({ logger: false });
    await registerGovernanceRoutes(bare, {
      proposalStore: createProposalStore(bareDb),
      voteStore: createVoteStore(bareDb),
      closureStore: createProposalClosureStore(bareDb),
      resolver: {
        isMember: () => true,
        isRemoved: () => false,
        memberCount: () => 0,
      },
      internalHeader: "x-understoria-internal",
      internalToken: "tok_internal",
      trust: createTrustResolver(bareDb, { envFounderKeys: opts.envFounderKeys }),
      reseedGraceUntil: opts.reseedGraceUntil,
      now: opts.now,
    });
    await bare.ready();
    return {
      bare,
      bareDb,
      close: async () => {
        await bare.close();
        bareDb.close();
      },
    };
  }

  it("founderless node: the gate skips — governance is not welded shut before the community exists", async () => {
    const closer = generateKeyPair();
    const { bare, close } = await bareServer({ envFounderKeys: [] });
    try {
      const proposal = makeProposal(closer);
      await bare.inject({ method: "POST", url: "/proposals", payload: proposal });
      expect(
        (
          await bare.inject({
            method: "POST",
            url: "/proposal-closures",
            payload: makeClosure(closer, proposal.id, "passed"),
          })
        ).statusCode,
      ).toBe(201);
    } finally {
      await close();
    }
  });

  it("reseed grace window: skipped while open, enforced once it closes", async () => {
    const root = generateKeyPair();
    const closer = generateKeyPair(); // never vouched — untrusted
    let clock = 1_000_000;
    const { bare, close } = await bareServer({
      envFounderKeys: [root.publicKey],
      reseedGraceUntil: 2_000_000,
      now: () => clock,
    });
    try {
      // Open window: re-seeded history's closures land ahead of the
      // closers' vouch edges (the walker POSTs closures first).
      const p1 = makeProposal(closer);
      await bare.inject({ method: "POST", url: "/proposals", payload: p1 });
      expect(
        (
          await bare.inject({
            method: "POST",
            url: "/proposal-closures",
            payload: makeClosure(closer, p1.id, "passed"),
          })
        ).statusCode,
      ).toBe(201);

      // Window closed: the same untrusted closer is gated again.
      clock = 3_000_000;
      const p2 = makeProposal(closer);
      await bare.inject({ method: "POST", url: "/proposals", payload: p2 });
      const gated = await bare.inject({
        method: "POST",
        url: "/proposal-closures",
        payload: makeClosure(closer, p2.id, "passed"),
      });
      expect(gated.statusCode).toBe(403);
      expect(gated.json()).toEqual({ error: "closer_not_trusted" });
    } finally {
      await close();
    }
  });
});
