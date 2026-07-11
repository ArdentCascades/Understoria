/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import type { DisputePayload, Exchange } from "@/types";
import { db } from "@/db/database";
import { disputeDirectExchange } from "@/db/actions";

async function wipe() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

function directExchange(id: string): Exchange {
  return {
    id,
    postId: "direct:8a6e0804-2bd0-4672-b79d-d97027f9071a",
    helperKey: "gus",
    helpedKey: "rosa",
    hoursExchanged: 2,
    helperSignature: "s1",
    helpedSignature: "s2",
    completedAt: 1_700_000_000_000,
    category: "skilled_labor",
    nodeId: "node_t",
  };
}

beforeEach(wipe);

describe("disputeDirectExchange", () => {
  it("builds the dispute proposal from the exchange's own fields, idempotently", async () => {
    const x = directExchange("dx1");
    await db.exchanges.put(x);
    const proposal = await disputeDirectExchange("dx1", "rosa", "hours seem off");
    expect(proposal.kind).toBe("dispute");
    expect(proposal.disputePostId).toBe(x.postId);
    expect(proposal.description).toBe("hours seem off");
    const payload = JSON.parse(proposal.payload) as DisputePayload;
    expect(payload.postType).toBe("direct");
    expect(payload.postTitle).toBe("");
    expect(payload.helperKey).toBe("gus");
    expect(payload.recipientKey).toBe("rosa");
    expect(payload.hours).toBe(2);
    expect(payload.postCreatedAt).toBe(x.completedAt);

    // Flagging again (either party) returns the SAME row — one
    // exchange never grows two dispute proposals.
    const again = await disputeDirectExchange("dx1", "gus", "me too");
    expect(again.id).toBe(proposal.id);
    expect(await db.proposals.count()).toBe(1);
  });

  it("refuses non-parties and non-direct exchanges", async () => {
    const x = directExchange("dx2");
    await db.exchanges.put(x);
    await expect(
      disputeDirectExchange("dx2", "eve"),
    ).rejects.toThrow(/two parties/);

    await db.exchanges.put({
      ...directExchange("dx3"),
      postId: "post_ordinary",
    });
    await expect(
      disputeDirectExchange("dx3", "rosa"),
    ).rejects.toThrow(/post page/);
    expect(await db.proposals.count()).toBe(0);
  });
});
