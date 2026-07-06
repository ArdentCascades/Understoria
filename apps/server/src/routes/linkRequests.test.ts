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
 *
 * Tap-to-link rendezvous contract (docs/device-pairing.md §6.7):
 *   - requests are visible ONLY from the same address bucket
 *   - the response carries only pubkey + createdAt (no bucket, no
 *     cancel token)
 *   - per-bucket live cap, duplicate rejection, TTL exclusion
 *   - cancel requires the creator's token
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3";
import type { FastifyInstance } from "fastify";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { createLinkRequestStore, openDatabase } from "../db.js";
import { LINK_REQUEST_TTL_MS, linkBucketForIp } from "./linkRequests.js";

let app: FastifyInstance;
let db: DatabaseType;

async function freshServer() {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    NODE_ID: "node_test",
    // Per-bucket + validation tests fire many requests from one
    // fake address; keep the rate limiter out of the way.
    RATE_LIMIT_MAX: "10000",
  } as unknown as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  await app.ready();
}

beforeEach(freshServer);
afterEach(async () => {
  await app.close();
  db.close();
});

function pubkey(seed: string): string {
  // 32 deterministic bytes → valid base64 pubkey shape.
  const bytes = Buffer.alloc(32, seed);
  return bytes.toString("base64");
}

function post(pk: string, ip: string) {
  return app.inject({
    method: "POST",
    url: "/link-request",
    payload: { pubkey: pk },
    remoteAddress: ip,
  });
}

function list(ip: string) {
  return app.inject({
    method: "GET",
    url: "/link-request",
    remoteAddress: ip,
  });
}

describe("POST /link-request", () => {
  it("stores a request and returns a cancel token + expiry", async () => {
    const res = await post(pubkey("a"), "10.0.0.1");
    expect(res.statusCode).toBe(201);
    const body = res.json() as {
      ok: boolean;
      cancelToken: string;
      expiresAt: number;
    };
    expect(body.ok).toBe(true);
    expect(body.cancelToken.length).toBeGreaterThan(10);
    expect(body.expiresAt).toBeGreaterThan(Date.now());
  });

  it("rejects malformed pubkeys", async () => {
    for (const bad of ["", "short", "!".repeat(44), "a".repeat(100)]) {
      const res = await post(bad, "10.0.0.1");
      expect(res.statusCode, JSON.stringify(bad)).toBe(400);
    }
  });

  it("409s a duplicate pubkey", async () => {
    expect((await post(pubkey("a"), "10.0.0.1")).statusCode).toBe(201);
    expect((await post(pubkey("a"), "10.0.0.1")).statusCode).toBe(409);
  });

  it("caps live requests per bucket", async () => {
    expect((await post(pubkey("a"), "10.0.0.1")).statusCode).toBe(201);
    expect((await post(pubkey("b"), "10.0.0.1")).statusCode).toBe(201);
    expect((await post(pubkey("c"), "10.0.0.1")).statusCode).toBe(201);
    const fourth = await post(pubkey("d"), "10.0.0.1");
    expect(fourth.statusCode).toBe(429);
    // A different address (different bucket) is unaffected.
    expect((await post(pubkey("d"), "192.168.7.7")).statusCode).toBe(201);
  });
});

describe("GET /link-request — bucket scoping", () => {
  it("shows requests only to callers from the same bucket", async () => {
    await post(pubkey("a"), "10.0.0.1");
    // Sanity: the two test addresses actually fold to different
    // buckets (they do; guard the test's own assumption).
    expect(linkBucketForIp("10.0.0.1")).not.toBe(
      linkBucketForIp("192.168.7.7"),
    );

    const same = (await list("10.0.0.1")).json() as {
      requests: Array<{ pubkey: string; createdAt: number }>;
    };
    expect(same.requests.map((r) => r.pubkey)).toEqual([pubkey("a")]);

    const other = (await list("192.168.7.7")).json() as {
      requests: unknown[];
    };
    expect(other.requests).toEqual([]);
  });

  it("responses carry only pubkey + createdAt — never bucket or cancel token", async () => {
    await post(pubkey("a"), "10.0.0.1");
    const body = (await list("10.0.0.1")).json() as {
      requests: Array<Record<string, unknown>>;
    };
    expect(Object.keys(body.requests[0]).sort()).toEqual([
      "createdAt",
      "pubkey",
    ]);
  });

  it("expired requests never appear and are pruned by the next write", async () => {
    const store = createLinkRequestStore(db);
    store.insert({
      pubkey: pubkey("z"),
      bucket: linkBucketForIp("10.0.0.1"),
      cancelToken: "tok",
      createdAt: Date.now() - LINK_REQUEST_TTL_MS - 1000,
      expiresAt: Date.now() - 1000,
    });
    const body = (await list("10.0.0.1")).json() as { requests: unknown[] };
    expect(body.requests).toEqual([]);
    await post(pubkey("a"), "172.16.0.9");
    expect(store.count()).toBe(1); // stale row swept, fresh one remains
  });
});

describe("POST /link-request/cancel", () => {
  it("withdraws with the creator's token; wrong token is a 404", async () => {
    const created = (await post(pubkey("a"), "10.0.0.1")).json() as {
      cancelToken: string;
    };
    const wrong = await app.inject({
      method: "POST",
      url: "/link-request/cancel",
      payload: { pubkey: pubkey("a"), cancelToken: "nope" },
    });
    expect(wrong.statusCode).toBe(404);
    const right = await app.inject({
      method: "POST",
      url: "/link-request/cancel",
      payload: { pubkey: pubkey("a"), cancelToken: created.cancelToken },
    });
    expect(right.statusCode).toBe(200);
    const after = (await list("10.0.0.1")).json() as { requests: unknown[] };
    expect(after.requests).toEqual([]);
  });
});
