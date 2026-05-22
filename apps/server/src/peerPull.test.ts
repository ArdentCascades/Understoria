/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  canonicalExchangePayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import type { Exchange } from "@understoria/shared/types";
import type { Database as DatabaseType } from "better-sqlite3";
import {
  createExchangeStore,
  createPeerPullStore,
  openDatabase,
} from "./db.js";
import {
  pullFromPeer,
  startPeerPullWorker,
  type Fetcher,
} from "./peerPull.js";

let db: DatabaseType;

beforeEach(() => {
  db = openDatabase(":memory:");
});
afterEach(() => {
  db.close();
});

function makeSignedExchange(overrides: Partial<Exchange> = {}): Exchange {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const base = {
    id: overrides.id ?? `x_${Math.random().toString(36).slice(2)}`,
    postId: "p_x",
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hoursExchanged: 1,
    category: "other" as const,
    completedAt: overrides.completedAt ?? Date.now(),
    nodeId: overrides.nodeId ?? "node_peer",
  };
  const payload = canonicalExchangePayload({
    postId: base.postId,
    helperKey: base.helperKey,
    helpedKey: base.helpedKey,
    hours: base.hoursExchanged,
    category: base.category,
    completedAt: base.completedAt,
  });
  return {
    ...base,
    helperSignature: sign(payload, helper.secretKey),
    helpedSignature: sign(payload, helped.secretKey),
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): ReturnType<Fetcher> {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("pullFromPeer", () => {
  it("inserts every well-signed exchange the peer returns", async () => {
    const store = createExchangeStore(db);
    const exchanges = [
      makeSignedExchange({ completedAt: 100 }),
      makeSignedExchange({ completedAt: 200 }),
    ];
    const fetcher: Fetcher = () => jsonResponse({ count: 2, exchanges });
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(2);
    expect(result.duplicateCount).toBe(0);
    expect(result.rejectedCount).toBe(0);
    expect(result.latestCompletedAt).toBe(200);
    expect(store.count()).toBe(2);
  });

  it("skips an exchange whose signatures do not verify", async () => {
    const store = createExchangeStore(db);
    const good = makeSignedExchange();
    const bad: Exchange = { ...good, id: "x_bad", helperSignature: "0" };
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 2, exchanges: [good, bad] });
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(1);
    expect(result.rejectedCount).toBe(1);
    expect(store.count()).toBe(1);
  });

  it("treats already-stored rows as duplicates without re-inserting", async () => {
    const store = createExchangeStore(db);
    const exchange = makeSignedExchange();
    store.insert(exchange);
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 1, exchanges: [exchange] });
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: null,
      fetcher,
      store,
    });
    expect(result.insertedCount).toBe(0);
    expect(result.duplicateCount).toBe(1);
    expect(store.count()).toBe(1);
  });

  it("passes since= to the peer when supplied", async () => {
    const store = createExchangeStore(db);
    const seen: string[] = [];
    const fetcher: Fetcher = (url) => {
      seen.push(url);
      return jsonResponse({ count: 0, exchanges: [] });
    };
    await pullFromPeer({
      peerUrl: "https://peer.example",
      since: 12345,
      fetcher,
      store,
    });
    expect(seen[0]).toContain("since=12345");
    expect(seen[0]).toContain("limit=");
  });

  it("strips trailing slashes from the peer URL", async () => {
    const store = createExchangeStore(db);
    const seen: string[] = [];
    const fetcher: Fetcher = (url) => {
      seen.push(url);
      return jsonResponse({ count: 0, exchanges: [] });
    };
    await pullFromPeer({
      peerUrl: "https://peer.example//",
      since: null,
      fetcher,
      store,
    });
    expect(seen[0]).toMatch(/^https:\/\/peer\.example\/exchanges\?/);
  });

  it("throws when the peer returns a non-2xx status", async () => {
    const store = createExchangeStore(db);
    const fetcher: Fetcher = () => jsonResponse({ error: "nope" }, 503);
    await expect(
      pullFromPeer({
        peerUrl: "https://peer.example",
        since: null,
        fetcher,
        store,
      }),
    ).rejects.toThrow(/503/);
  });

  it("throws when the response body is the wrong shape", async () => {
    const store = createExchangeStore(db);
    const fetcher: Fetcher = () => jsonResponse({ wat: "this is not it" });
    await expect(
      pullFromPeer({
        peerUrl: "https://peer.example",
        since: null,
        fetcher,
        store,
      }),
    ).rejects.toThrow(/unexpected response/);
  });

  it("returns null latestCompletedAt when the peer had nothing new", async () => {
    const store = createExchangeStore(db);
    const fetcher: Fetcher = () => jsonResponse({ count: 0, exchanges: [] });
    const result = await pullFromPeer({
      peerUrl: "https://peer.example",
      since: 0,
      fetcher,
      store,
    });
    expect(result.latestCompletedAt).toBeNull();
    expect(result.insertedCount).toBe(0);
  });
});

describe("startPeerPullWorker", () => {
  it("does nothing when no peers are configured", async () => {
    const store = createExchangeStore(db);
    const pullStore = createPeerPullStore(db);
    const fetcher = vi.fn<Fetcher>();
    const worker = startPeerPullWorker({
      peerUrls: [],
      intervalMs: 1000,
      store,
      pullStore,
      fetcher,
    });
    const results = await worker.pullAllOnce();
    worker.stop();
    expect(results).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("records success state per peer after a successful pull", async () => {
    const store = createExchangeStore(db);
    const pullStore = createPeerPullStore(db);
    const exchange = makeSignedExchange({ completedAt: 555 });
    const fetcher: Fetcher = () =>
      jsonResponse({ count: 1, exchanges: [exchange] });
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      pullStore,
      fetcher,
    });
    const results = await worker.pullAllOnce();
    worker.stop();
    expect(results[0].insertedCount).toBe(1);
    const state = pullStore.get("https://peer.example");
    expect(state).not.toBeNull();
    expect(state!.lastCompletedAt).toBe(555);
    expect(state!.lastError).toBeNull();
    expect(state!.lastPulledCount).toBe(1);
  });

  it("records failure state and keeps the loop alive when a peer errors", async () => {
    const store = createExchangeStore(db);
    const pullStore = createPeerPullStore(db);
    const fetcher: Fetcher = () => jsonResponse({ error: "x" }, 500);
    const errors: Array<{ url: string; msg: string }> = [];
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      pullStore,
      fetcher,
      onError: (url, err) => errors.push({ url, msg: err.message }),
    });
    await worker.pullAllOnce();
    worker.stop();
    expect(errors).toHaveLength(1);
    const state = pullStore.get("https://peer.example");
    expect(state!.lastError).toMatch(/500/);
    expect(state!.lastSuccessAt).toBeNull();
  });

  it("uses each peer's stored since for the next call", async () => {
    const store = createExchangeStore(db);
    const pullStore = createPeerPullStore(db);
    const exchange = makeSignedExchange({ completedAt: 999 });
    let callCount = 0;
    const urls: string[] = [];
    const fetcher: Fetcher = (url) => {
      urls.push(url);
      if (callCount++ === 0) {
        return jsonResponse({ count: 1, exchanges: [exchange] });
      }
      return jsonResponse({ count: 0, exchanges: [] });
    };
    const worker = startPeerPullWorker({
      peerUrls: ["https://peer.example"],
      intervalMs: 60_000,
      store,
      pullStore,
      fetcher,
    });
    await worker.pullAllOnce();
    await worker.pullAllOnce();
    worker.stop();
    expect(urls[0]).not.toContain("since=");
    expect(urls[1]).toContain("since=999");
  });
});
