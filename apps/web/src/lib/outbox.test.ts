/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/database";
import { writeSubmitConfig } from "@/lib/nodeSubmit";
import {
  __resetOutboxWorkerForTests,
  enqueueExchangeOutbox,
  enqueueRedemptionReceiptOutbox,
  enqueueTaskCommentOutbox,
  flushOutboxOnce,
  isPoisonResult,
  nextBackoffMs,
  pruneDeliveredOutbox,
  readOutboxSummary,
} from "./outbox";
import type { Exchange, TaskComment } from "@/types";
import type { RedemptionReceipt } from "@understoria/shared/types";

const NODE = "node_test";

function fakeExchange(id = "ex_test"): Exchange {
  return {
    id,
    postId: "post_test",
    helperKey: "helper_pk",
    helpedKey: "helped_pk",
    hoursExchanged: 1,
    helperSignature: "sig_h",
    helpedSignature: "sig_d",
    completedAt: 1_700_000_000_000,
    category: "transport",
    nodeId: NODE,
  };
}

beforeEach(async () => {
  __resetOutboxWorkerForTests();
  await Promise.all([db.outbox.clear(), db.settings.clear()]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("nextBackoffMs", () => {
  it("doubles each attempt up to a 5-minute cap", () => {
    expect(nextBackoffMs(0)).toBe(4_000);
    expect(nextBackoffMs(1)).toBe(8_000);
    expect(nextBackoffMs(2)).toBe(16_000);
    expect(nextBackoffMs(6)).toBe(256_000);
    expect(nextBackoffMs(20)).toBe(300_000); // capped
  });
});

describe("isPoisonResult", () => {
  it("treats 422 as poison", () => {
    expect(
      isPoisonResult({ ok: false, status: 422, error: "bad_signature" }),
    ).toBe(true);
  });
  it("treats 400 as poison", () => {
    expect(isPoisonResult({ ok: false, status: 400, error: "x" })).toBe(true);
  });
  it("does NOT poison on 5xx", () => {
    expect(isPoisonResult({ ok: false, status: 503, error: "x" })).toBe(false);
  });
  it("does NOT poison on 408 / 429 (retryable)", () => {
    expect(isPoisonResult({ ok: false, status: 408, error: "x" })).toBe(false);
    expect(isPoisonResult({ ok: false, status: 429, error: "x" })).toBe(false);
  });
  it("does NOT poison on network errors (no status)", () => {
    expect(isPoisonResult({ ok: false, error: "ECONNREFUSED" })).toBe(false);
  });
  it("never poisons on success", () => {
    expect(isPoisonResult({ ok: true, status: 201 })).toBe(false);
  });
});

describe("enqueueExchangeOutbox", () => {
  it("no-ops when no community node URL is configured", async () => {
    const r = await enqueueExchangeOutbox(fakeExchange());
    expect(r).toBeNull();
    expect(await db.outbox.count()).toBe(0);
  });

  it("writes a pending row when a URL is configured (even if disabled)", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: false,
    });
    const r = await enqueueExchangeOutbox(fakeExchange("ex_1"));
    expect(r).not.toBeNull();
    expect(r!.status).toBe("pending");
    expect(r!.attempts).toBe(0);
    expect(r!.recordId).toBe("ex_1");
    expect(JSON.parse(r!.payload).id).toBe("ex_1");
    expect(await db.outbox.count()).toBe(1);
  });

  it("dedupes by recordId — identical re-enqueue is a no-op", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    await enqueueExchangeOutbox(fakeExchange("ex_dup"));
    await enqueueExchangeOutbox(fakeExchange("ex_dup"));
    expect(await db.outbox.count()).toBe(1);
  });

  it("identical re-enqueue preserves the pending row's retry state", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    const first = await enqueueExchangeOutbox(fakeExchange("ex_retry"));
    // Simulate the worker having backed off after failures.
    await db.outbox.update(first!.id, {
      attempts: 3,
      nextAttemptAt: Date.now() + 60_000,
    });
    const again = await enqueueExchangeOutbox(fakeExchange("ex_retry"));
    expect(again!.id).toBe(first!.id);
    const row = await db.outbox.get(first!.id);
    expect(row!.attempts).toBe(3);
    expect(row!.nextAttemptAt).toBeGreaterThan(Date.now());
  });
});

describe("enqueueTaskCommentOutbox — tombstone re-enqueue", () => {
  function fakeComment(deletedAt: number | null = null): TaskComment {
    return {
      id: "tc_1",
      projectId: "proj_1",
      taskId: "task_1",
      authorKey: "author_pk",
      body: "hello",
      createdAt: 1_700_000_000_000,
      deletedAt,
      nodeId: NODE,
      signature: "sig_tc",
    };
  }

  beforeEach(async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
  });

  it("replaces a still-pending insert's payload with the tombstone", async () => {
    const insert = await enqueueTaskCommentOutbox(fakeComment(null));
    const tombstone = await enqueueTaskCommentOutbox(fakeComment(123456));
    // Same row, updated in place — the newest state ships once.
    expect(tombstone!.id).toBe(insert!.id);
    expect(await db.outbox.count()).toBe(1);
    const row = await db.outbox.get(insert!.id);
    expect(row!.status).toBe("pending");
    expect(JSON.parse(row!.payload).deletedAt).toBe(123456);
  });

  it("enqueues a fresh row for the tombstone when the insert already delivered", async () => {
    const insert = await enqueueTaskCommentOutbox(fakeComment(null));
    await db.outbox.update(insert!.id, { status: "delivered" });

    // This was the bug: dedup keyed on recordId alone found the
    // delivered insert row and silently dropped the tombstone, so
    // peers kept rendering a comment the author deleted.
    const tombstone = await enqueueTaskCommentOutbox(fakeComment(999999));
    expect(tombstone).not.toBeNull();
    expect(tombstone!.id).not.toBe(insert!.id);
    expect(tombstone!.status).toBe("pending");
    expect(JSON.parse(tombstone!.payload).deletedAt).toBe(999999);
    expect(await db.outbox.count()).toBe(2);
  });

  it("re-enqueueing an already-delivered identical payload is a no-op", async () => {
    const insert = await enqueueTaskCommentOutbox(fakeComment(null));
    await db.outbox.update(insert!.id, { status: "delivered" });
    const again = await enqueueTaskCommentOutbox(fakeComment(null));
    expect(again!.id).toBe(insert!.id);
    expect(await db.outbox.count()).toBe(1);
  });
});

describe("pruneDeliveredOutbox", () => {
  beforeEach(async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
  });

  const WEEK = 7 * 24 * 60 * 60 * 1000;

  it("deletes delivered rows past the retention window, keeps recent ones", async () => {
    const now = Date.now();
    const old = await enqueueExchangeOutbox(fakeExchange("ex_old"));
    await db.outbox.update(old!.id, {
      status: "delivered",
      lastAttemptAt: now - WEEK - 60_000,
    });
    const recent = await enqueueExchangeOutbox(fakeExchange("ex_recent"));
    await db.outbox.update(recent!.id, {
      status: "delivered",
      lastAttemptAt: now - 60_000,
    });

    const deleted = await pruneDeliveredOutbox(now);
    expect(deleted).toBe(1);
    expect(await db.outbox.get(old!.id)).toBeUndefined();
    expect(await db.outbox.get(recent!.id)).toBeDefined();
  });

  it("never touches pending or poisoned rows, however old", async () => {
    const now = Date.now();
    const pending = await enqueueExchangeOutbox(fakeExchange("ex_pending"));
    await db.outbox.update(pending!.id, {
      lastAttemptAt: now - 10 * WEEK,
    });
    const poisoned = await enqueueExchangeOutbox(fakeExchange("ex_poisoned"));
    await db.outbox.update(poisoned!.id, {
      status: "poisoned",
      lastAttemptAt: now - 10 * WEEK,
    });

    expect(await pruneDeliveredOutbox(now)).toBe(0);
    expect(await db.outbox.get(pending!.id)).toBeDefined();
    expect(await db.outbox.get(poisoned!.id)).toBeDefined();
  });
});

describe("flushOutboxOnce", () => {
  it("returns zero counts when no URL is configured", async () => {
    const r = await flushOutboxOnce();
    expect(r).toEqual({ attempted: 0, delivered: 0, poisoned: 0, retried: 0 });
  });

  it("returns zero counts when mirroring is disabled", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: false,
    });
    await enqueueExchangeOutbox(fakeExchange());
    const r = await flushOutboxOnce();
    expect(r.attempted).toBe(0);
  });

  it("delivers a pending row on 201 and marks status=delivered", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    await enqueueExchangeOutbox(fakeExchange("ex_ok"));
    const fetchImpl = vi.fn(async () =>
      new Response('{"stored":true}', { status: 201 }),
    );
    const r = await flushOutboxOnce({
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r).toEqual({ attempted: 1, delivered: 1, poisoned: 0, retried: 0 });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const row = (await db.outbox.toArray())[0];
    expect(row.status).toBe("delivered");
    expect(row.lastError).toBeUndefined();
  });

  it("retries on 5xx with bumped attempts and a future nextAttemptAt", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    await enqueueExchangeOutbox(fakeExchange("ex_5xx"));
    const fetchImpl = vi.fn(async () =>
      new Response("oops", { status: 503 }),
    );
    const before = Date.now();
    const r = await flushOutboxOnce({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: before,
    });
    expect(r).toEqual({ attempted: 1, delivered: 0, poisoned: 0, retried: 1 });
    const row = (await db.outbox.toArray())[0];
    expect(row.status).toBe("pending");
    expect(row.attempts).toBe(1);
    expect(row.nextAttemptAt).toBeGreaterThan(before);
    expect(row.lastError).toBeTruthy();
  });

  it("retries on network error", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    await enqueueExchangeOutbox(fakeExchange("ex_net"));
    const fetchImpl = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    });
    const r = await flushOutboxOnce({
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r.retried).toBe(1);
    const row = (await db.outbox.toArray())[0];
    expect(row.status).toBe("pending");
    expect(row.attempts).toBe(1);
    expect(row.lastError).toContain("ECONNREFUSED");
  });

  it("poisons on 422 (bad signature) and does not retry", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    await enqueueExchangeOutbox(fakeExchange("ex_bad"));
    const fetchImpl = vi.fn(async () =>
      new Response('{"error":"bad_signature"}', { status: 422 }),
    );
    const r = await flushOutboxOnce({
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r.poisoned).toBe(1);
    const row = (await db.outbox.toArray())[0];
    expect(row.status).toBe("poisoned");
    expect(row.lastError).toContain("bad_signature");
  });

  it("does not retry an already-delivered row", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    await enqueueExchangeOutbox(fakeExchange("ex_done"));
    const fetchImpl = vi.fn(async () =>
      new Response("{}", { status: 201 }),
    );
    await flushOutboxOnce({
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await flushOutboxOnce({
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(fetchImpl).toHaveBeenCalledOnce(); // not called the second flush
  });

  it("only flushes rows whose nextAttemptAt is in the past", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    const ex = fakeExchange("ex_future");
    await enqueueExchangeOutbox(ex);
    // Push the row into the future.
    const row = (await db.outbox.toArray())[0];
    await db.outbox.update(row.id, {
      nextAttemptAt: Date.now() + 10 * 60 * 1000,
    });
    const fetchImpl = vi.fn(async () =>
      new Response("{}", { status: 201 }),
    );
    const r = await flushOutboxOnce({
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r.attempted).toBe(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("handles a row with unparseable payload by poisoning it", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    // Inject a corrupt row directly.
    await db.outbox.put({
      id: "corrupt_row",
      kind: "exchange",
      payload: "{not json",
      recordId: "rec_corrupt",
      createdAt: 0,
      attempts: 0,
      nextAttemptAt: 0,
      status: "pending",
    });
    const fetchImpl = vi.fn();
    const r = await flushOutboxOnce({
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r.poisoned).toBe(1);
    expect(fetchImpl).not.toHaveBeenCalled();
    const row = await db.outbox.get("corrupt_row");
    expect(row?.status).toBe("poisoned");
    expect(row?.lastError).toContain("unparseable_payload");
  });
});

// docs/invite-redemption.md §7 — the redemption receipt is the one
// outbox kind enqueued even when no community-node URL is configured:
// a fresh device redeems FIRST and configures the node AFTERWARDS
// (the §5.3 suggestion fires on the accept success path). The queued
// row must then deliver retroactively once the member confirms a URL.
describe("redemption receipts — enqueue before configuration, deliver after", () => {
  function fakeReceipt(token = "tok_test"): RedemptionReceipt {
    return {
      invite: {
        token,
        inviterKey: "inviter_pk",
        inviterName: "Rosa",
        nodeId: NODE,
        createdAt: 1_700_000_000_000,
        expiresAt: 1_700_000_000_000 + 14 * 24 * 60 * 60 * 1000,
        signature: "sig_invite",
      },
      redeemedBy: "newcomer_pk",
      displayName: "Newcomer",
      redeemedAt: 1_700_000_100_000,
      signature: "sig_receipt",
    };
  }

  it("enqueues a pending row with NO node URL configured (unlike every other kind)", async () => {
    const row = await enqueueRedemptionReceiptOutbox(fakeReceipt());
    expect(row).not.toBeNull();
    expect(row!.kind).toBe("redemption_receipt");
    expect(row!.status).toBe("pending");
    expect(await db.outbox.count()).toBe(1);
  });

  it("dedupes on the invite token", async () => {
    await enqueueRedemptionReceiptOutbox(fakeReceipt("tok_dup"));
    await enqueueRedemptionReceiptOutbox(fakeReceipt("tok_dup"));
    expect(await db.outbox.count()).toBe(1);
  });

  it("does NOT flush while unconfigured, then delivers to /redemptions after the member confirms a node URL", async () => {
    await enqueueRedemptionReceiptOutbox(fakeReceipt("tok_retro"));

    // Unconfigured: nothing crosses any wire — the consent gate holds.
    const before = await flushOutboxOnce();
    expect(before.attempted).toBe(0);
    expect((await db.outbox.toArray())[0].status).toBe("pending");

    // The member confirms a node URL (the Phase 0 §5.3 card or
    // Settings). The already-queued receipt now delivers.
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    const fetchImpl = vi.fn(async () =>
      new Response('{"stored":true}', { status: 201 }),
    );
    const after = await flushOutboxOnce({
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(after).toEqual({
      attempted: 1,
      delivered: 1,
      poisoned: 0,
      retried: 0,
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const url = (fetchImpl.mock.calls[0] as unknown as [string])[0];
    expect(url).toBe("https://node.example/api/redemptions");
    expect((await db.outbox.toArray())[0].status).toBe("delivered");
  });

  it("poisons on 409 — a lost first-writer-wins race will never succeed on retry (the stolen-link tell)", async () => {
    await enqueueRedemptionReceiptOutbox(fakeReceipt("tok_race"));
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    const fetchImpl = vi.fn(async () =>
      new Response('{"error":"token_already_redeemed"}', { status: 409 }),
    );
    const r = await flushOutboxOnce({
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r.poisoned).toBe(1);
    expect((await db.outbox.toArray())[0].status).toBe("poisoned");
  });
});

describe("readOutboxSummary", () => {
  it("counts each status independently", async () => {
    await db.outbox.bulkPut([
      {
        id: "1",
        kind: "exchange",
        payload: "{}",
        recordId: "a",
        createdAt: 0,
        attempts: 0,
        nextAttemptAt: 0,
        status: "pending",
      },
      {
        id: "2",
        kind: "exchange",
        payload: "{}",
        recordId: "b",
        createdAt: 0,
        attempts: 0,
        nextAttemptAt: 0,
        status: "pending",
      },
      {
        id: "3",
        kind: "exchange",
        payload: "{}",
        recordId: "c",
        createdAt: 0,
        attempts: 0,
        nextAttemptAt: 0,
        status: "delivered",
      },
      {
        id: "4",
        kind: "exchange",
        payload: "{}",
        recordId: "d",
        createdAt: 0,
        attempts: 0,
        nextAttemptAt: 0,
        status: "poisoned",
      },
    ]);
    const s = await readOutboxSummary();
    expect(s).toEqual({ pending: 2, delivered: 1, poisoned: 1 });
  });
});
