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
  flushOutboxOnce,
  isPoisonResult,
  nextBackoffMs,
  readOutboxSummary,
} from "./outbox";
import type { Exchange } from "@/types";

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

  it("dedupes by recordId — re-enqueue is a no-op", async () => {
    await writeSubmitConfig({
      url: "https://node.example/api",
      enabled: true,
    });
    await enqueueExchangeOutbox(fakeExchange("ex_dup"));
    await enqueueExchangeOutbox(fakeExchange("ex_dup"));
    expect(await db.outbox.count()).toBe(1);
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
