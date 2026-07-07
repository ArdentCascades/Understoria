/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/database";
import {
  RESEED_KINDS,
  resetReseedCursors,
  runReseed,
} from "./reseed";

const TARGET = "https://fresh-node.example/api";

async function reset() {
  await Promise.all(db.tables.map((t) => t.clear()));
  await resetReseedCursors(TARGET);
}

function seedPost(id: string, signature: string) {
  return db.posts.put({
    id,
    type: "NEED",
    category: "food",
    title: "t",
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "pk_author",
    claimedBy: null,
    status: "open",
    createdAt: 1,
    expiresAt: null,
    locationZone: "z",
    confirmedBy: [],
    nodeId: "node_old",
    signature,
  } as never);
}

function seedReceipt(token: string) {
  return db.redemptionReceipts.put({
    invite: {
      token,
      inviterKey: "pk_inviter",
      inviterName: "Rosa",
      nodeId: "node_old",
      createdAt: 1,
      expiresAt: 2,
      signature: "sig_i",
    },
    redeemedBy: "pk_new",
    displayName: "New",
    redeemedAt: 2,
    signature: "sig_r",
  } as never);
}

/** fetch stub answering per-status by URL predicate; records calls. */
function stubFetch(
  decide: (url: string, body: Record<string, unknown>) => number,
) {
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  const impl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    calls.push({ url, body });
    return new Response("{}", { status: decide(url, body) });
  });
  return { impl: impl as unknown as typeof fetch, calls };
}

beforeEach(reset);

describe("runReseed", () => {
  it("uploads every kind in order, counts outcomes, and skips what cannot federate", async () => {
    await seedReceipt("tok_1");
    await seedPost("post_signed", "sig");
    await seedPost("post_legacy", ""); // pre-federation row — not re-seedable
    const { impl, calls } = stubFetch(() => 201);

    const { results, complete } = await runReseed({
      targetUrl: TARGET,
      fetchImpl: impl,
      paceMs: 0,
    });
    expect(complete).toBe(true);

    const byPath = Object.fromEntries(results.map((r) => [r.path, r]));
    expect(byPath["/redemptions"].restored).toBe(1);
    expect(byPath["/posts"].restored).toBe(1);
    expect(byPath["/posts"].skipped).toBe(1); // the unsigned legacy post
    // Membership artifacts go FIRST (READ_AUTH derives from them).
    expect(calls[0].url).toBe(`${TARGET}/redemptions`);
    // The post wire shape carries no local lifecycle fields.
    const postCall = calls.find((c) => c.url.endsWith("/posts"));
    expect(postCall?.body.status).toBeUndefined();
    expect(postCall?.body.claimedBy).toBeUndefined();
    expect(postCall?.body.signature).toBe("sig");
  });

  it("counts 200s as already-present (another member re-seeded first)", async () => {
    await seedReceipt("tok_1");
    const { impl } = stubFetch(() => 200);
    const { results } = await runReseed({
      targetUrl: TARGET,
      fetchImpl: impl,
      paceMs: 0,
    });
    const r = results.find((x) => x.path === "/redemptions");
    expect(r?.alreadyPresent).toBe(1);
    expect(r?.restored).toBe(0);
  });

  it("treats a redemption 409 as a permanent conflict (skip) but a referent 409 as a halt", async () => {
    await seedReceipt("tok_1");
    await db.events.put({ id: "ev_1", createdAt: 1 } as never);
    const { impl } = stubFetch((url) => (url.includes("/") ? 409 : 409));
    const { results, complete } = await runReseed({
      targetUrl: TARGET,
      fetchImpl: impl,
      paceMs: 0,
    });
    const receipts = results.find((x) => x.path === "/redemptions");
    expect(receipts?.skipped).toBe(1);
    expect(receipts?.halted).toBe(false);
    const events = results.find((x) => x.path === "/events");
    expect(events?.halted).toBe(true);
    expect(events?.haltReason).toBe("http_409");
    expect(complete).toBe(false);
  });

  it("RESUMES after an interruption without re-sending delivered rows", async () => {
    await seedPost("post_a", "sig_a");
    await seedPost("post_b", "sig_b");
    // First run: the second /posts POST dies on the network.
    let postCount = 0;
    const first = stubFetch((url) => {
      if (url.endsWith("/posts")) {
        postCount += 1;
        if (postCount === 2) throw new Error("connrefused");
      }
      return 201;
    });
    const run1 = await runReseed({
      targetUrl: TARGET,
      fetchImpl: first.impl,
      paceMs: 0,
    });
    const posts1 = run1.results.find((r) => r.path === "/posts");
    expect(posts1?.halted).toBe(true);
    expect(posts1?.restored).toBe(1);

    // Second run: only the undelivered post goes out.
    const second = stubFetch(() => 201);
    const run2 = await runReseed({
      targetUrl: TARGET,
      fetchImpl: second.impl,
      paceMs: 0,
    });
    expect(run2.complete).toBe(true);
    const postBodies = second.calls
      .filter((c) => c.url.endsWith("/posts"))
      .map((c) => c.body.id);
    expect(postBodies).toHaveLength(1);
    // Dexie iterates posts by primary key; post_a was delivered in
    // run 1, so run 2 carries exactly the other one.
    const delivered1 = first.calls
      .filter((c) => c.url.endsWith("/posts"))
      .map((c) => c.body.id)[0];
    expect(postBodies[0]).not.toBe(delivered1);
  });

  it("a second complete run is a no-op (cursors at end)", async () => {
    await seedReceipt("tok_1");
    const a = stubFetch(() => 201);
    await runReseed({ targetUrl: TARGET, fetchImpl: a.impl, paceMs: 0 });
    const b = stubFetch(() => 201);
    const run2 = await runReseed({
      targetUrl: TARGET,
      fetchImpl: b.impl,
      paceMs: 0,
    });
    expect(run2.complete).toBe(true);
    expect(b.calls).toHaveLength(0);
    // …until the cursors are reset ("start over").
    await resetReseedCursors(TARGET);
    const c = stubFetch(() => 201);
    await runReseed({ targetUrl: TARGET, fetchImpl: c.impl, paceMs: 0 });
    expect(c.calls).toHaveLength(1);
  });

  it("covers every Dexie table the re-seed design names (drift guard)", () => {
    const tables = new Set(RESEED_KINDS.map((k) => k.table));
    for (const expected of [
      "redemptionReceipts",
      "inviteRevocationRecords",
      "events",
      "eventCancellations",
      "projects",
      "projectTasks",
      "eventShifts",
      "eventRsvps",
      "shiftSignups",
      "posts",
      "exchanges",
      "vouches",
      "taskComments",
      "coorgInvitations",
      "coorgInvitationResponses",
      "coorgInvitationRevocations",
      "seedVaultPledges",
    ]) {
      expect(tables.has(expected), expected).toBe(true);
    }
  });
});
