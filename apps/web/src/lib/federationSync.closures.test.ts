/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  canonicalProposalClosurePayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import { DEFAULT_NODE_CONFIG, type Proposal, type ProposalClosure } from "@/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { getNodeConfig } from "@/db/nodeConfig";
import { pullFederatedProposalClosures } from "./federationSync";

// The closure pull's convergence contract: the server keys closures
// first-writer-wins per proposalId, so a device whose OWN closure
// lost the race (its POST settled with stored:false) must ADOPT the
// pulled winner — replacing its local closure, re-stamping the
// proposal, and re-running the effects — instead of skipping the
// winner forever on the presence of its own row. Found by the
// full-repo sweep; the skip-forever path was a permanent-divergence
// bug.

const CLOSURE_CURSOR_KEY = "federationLastProposalClosurePull";

async function reset() {
  await Promise.all([
    db.proposals.clear(),
    db.proposalClosures.clear(),
    db.posts.clear(),
    db.nodeConfig.clear(),
    db.settings.clear(),
  ]);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
}

beforeEach(reset);

function seedProposal(over: Partial<Proposal> = {}): Proposal {
  const proposal: Proposal = {
    id: "prop_1",
    nodeId: "node_t",
    kind: "proposal",
    category: "config_change",
    reversibilityTier: "easy",
    title: "Raise the helper limit",
    description: "",
    payload: JSON.stringify({ ...DEFAULT_NODE_CONFIG, dailyHelperLimit: 7 }),
    proposerKey: generateKeyPair().publicKey,
    status: "open",
    createdAt: Date.now() - 60_000,
    closedAt: null,
    closedReason: null,
    impactReflection: null,
    disputePostId: null,
    ...over,
  };
  return proposal;
}

function signedClosure(
  over: Partial<ProposalClosure> & { id: string; outcome: ProposalClosure["outcome"] },
): ProposalClosure {
  const closer = generateKeyPair();
  const core = {
    id: over.id,
    proposalId: over.proposalId ?? "prop_1",
    outcome: over.outcome,
    reason: over.reason ?? null,
    closedAt: over.closedAt ?? Date.now() - 5_000,
    closerKey: closer.publicKey,
    nodeId: "node_t",
  };
  return {
    ...core,
    signerKey: closer.publicKey,
    signature: sign(canonicalProposalClosurePayload(core), closer.secretKey),
  };
}

function stubClosureFeed(closures: ProposalClosure[]) {
  const fetchSpy = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ count: closures.length, proposalClosures: closures }),
  });
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
}

describe("proposal-closure pull — first-writer-wins convergence", () => {
  it("a device whose closure lost the FWW race adopts the pulled winner", async () => {
    const proposal = seedProposal();
    // This device closed as "rejected" and lost the race: its local
    // closure row and lifecycle stamp reflect the losing outcome.
    const loser = signedClosure({ id: "close_loser", outcome: "rejected" });
    await db.proposals.put({
      ...proposal,
      status: "rejected",
      closedAt: loser.closedAt,
      closedReason: null,
    });
    await db.proposalClosures.put(loser);

    const winner = signedClosure({ id: "close_winner", outcome: "passed" });
    stubClosureFeed([winner]);
    const result = await pullFederatedProposalClosures();
    expect(result).not.toBeNull();

    // The server-arbitrated winner replaced the losing row…
    const stored = await db.proposalClosures.get("prop_1");
    expect(stored?.id).toBe("close_winner");
    expect(stored?.outcome).toBe("passed");
    // …the lifecycle re-stamped…
    const p = await db.proposals.get("prop_1");
    expect(p?.status).toBe("passed");
    // …the winner's effects ran (passed config_change moves the
    // knobs — the loser's "rejected" never applied them)…
    expect((await getNodeConfig("node_t")).dailyHelperLimit).toBe(7);
    // …and the cursor advanced past the winner.
    expect(await getSetting(CLOSURE_CURSOR_KEY)).toBe(
      `${winner.closedAt}:close_winner`,
    );
    vi.unstubAllGlobals();
  });

  it("re-serving the SAME closure is a duplicate: skip, advance, no re-apply", async () => {
    const proposal = seedProposal();
    await db.proposals.put(proposal);
    const closure = signedClosure({ id: "close_1", outcome: "passed" });

    stubClosureFeed([closure]);
    await pullFederatedProposalClosures();
    expect((await getNodeConfig("node_t")).dailyHelperLimit).toBe(7);

    // Move the knob out from under it, then re-serve the identical
    // record — a duplicate must NOT re-run the effects.
    await db.nodeConfig.update("node_t", { dailyHelperLimit: 4 });
    stubClosureFeed([closure]);
    const second = await pullFederatedProposalClosures();
    expect(second?.inserted).toBe(0);
    expect((await getNodeConfig("node_t")).dailyHelperLimit).toBe(4);
    expect(await db.proposalClosures.count()).toBe(1);
    expect(await getSetting(CLOSURE_CURSOR_KEY)).toBe(
      `${closure.closedAt}:close_1`,
    );
    vi.unstubAllGlobals();
  });

  it("the fresh-adopt path still stamps and applies in one transaction", async () => {
    await db.proposals.put(seedProposal());
    const closure = signedClosure({ id: "close_1", outcome: "passed" });
    stubClosureFeed([closure]);
    const result = await pullFederatedProposalClosures();
    expect(result?.inserted).toBe(1);
    expect((await db.proposals.get("prop_1"))?.status).toBe("passed");
    expect((await db.proposalClosures.get("prop_1"))?.id).toBe("close_1");
    expect((await getNodeConfig("node_t")).dailyHelperLimit).toBe(7);
    vi.unstubAllGlobals();
  });
});
