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
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import {
  canonicalExchangePayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import type { Exchange } from "@understoria/shared/types";
import { buildServer } from "./server.js";
import { readConfigFromEnv } from "./config.js";
import { createExchangeStore, openDatabase } from "./db.js";
import type { Database as DatabaseType } from "better-sqlite3";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;
let db: DatabaseType;

async function freshServer() {
  // Use a fresh shared in-memory DB so the migrations run and the same
  // connection is reused for the lifetime of the test.
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    NODE_ID: "node_test",
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  await app.ready();
}

beforeEach(freshServer);
afterEach(async () => {
  await app.close();
  db.close();
});

function makeSignedExchange(now = Date.now()): Exchange {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const base = {
    postId: `post_${now}`,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hours: 1.5,
    category: "transport" as const,
    completedAt: now,
  };
  const payload = canonicalExchangePayload(base);
  return {
    id: `ex_${now}`,
    postId: base.postId,
    helperKey: base.helperKey,
    helpedKey: base.helpedKey,
    hoursExchanged: base.hours,
    helperSignature: sign(payload, helper.secretKey),
    helpedSignature: sign(payload, helped.secretKey),
    completedAt: base.completedAt,
    category: base.category,
    nodeId: "node_test",
  };
}

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });
});

describe("POST /exchanges", () => {
  it("accepts and stores a properly-signed exchange (201)", async () => {
    const exchange = makeSignedExchange();
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: exchange,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ stored: true, id: exchange.id });
    expect(createExchangeStore(db).count()).toBe(1);
  });

  it("is idempotent — re-submitting the same exchange returns 200", async () => {
    const exchange = makeSignedExchange();
    const first = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: exchange,
    });
    expect(first.statusCode).toBe(201);
    const second = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: exchange,
    });
    expect(second.statusCode).toBe(200);
    expect(second.json()).toMatchObject({ stored: false, id: exchange.id });
  });

  it("rejects an exchange whose hours were forged after signing (422)", async () => {
    const exchange = makeSignedExchange();
    const tampered = { ...exchange, hoursExchanged: 999 };
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: tampered,
    });
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({ error: "bad_signature" });
  });

  it("rejects a malformed body (400) without touching the verifier", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: { id: "x" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ error: "invalid_body" });
  });

  it("rejects unknown categories at the validation layer", async () => {
    const exchange = makeSignedExchange();
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: { ...exchange, category: "not_a_category" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects completedAt far in the future", async () => {
    const farFuture = Date.now() + 365 * 24 * 60 * 60 * 1000;
    const exchange = makeSignedExchange(farFuture);
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: exchange,
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /exchanges", () => {
  it("returns an empty array on a fresh node", async () => {
    const res = await app.inject({ method: "GET", url: "/exchanges" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ count: 0, exchanges: [] });
  });

  it("returns stored exchanges newest first", async () => {
    const older = makeSignedExchange(Date.now() - 60_000);
    const newer = makeSignedExchange(Date.now());
    await app.inject({ method: "POST", url: "/exchanges", payload: older });
    await app.inject({ method: "POST", url: "/exchanges", payload: newer });
    const res = await app.inject({ method: "GET", url: "/exchanges" });
    const body = res.json() as { count: number; exchanges: Exchange[] };
    expect(body.count).toBe(2);
    expect(body.exchanges[0].id).toBe(newer.id);
    expect(body.exchanges[1].id).toBe(older.id);
  });

  it("supports ?since= for federation pull", async () => {
    const t1 = Date.now() - 60_000;
    const t2 = Date.now();
    const old = makeSignedExchange(t1);
    const fresh = makeSignedExchange(t2);
    await app.inject({ method: "POST", url: "/exchanges", payload: old });
    await app.inject({ method: "POST", url: "/exchanges", payload: fresh });
    const res = await app.inject({
      method: "GET",
      url: `/exchanges?since=${t1}`,
    });
    const body = res.json() as { count: number; exchanges: Exchange[] };
    expect(body.count).toBe(1);
    expect(body.exchanges[0].id).toBe(fresh.id);
  });

  it("returned rows are independently verifiable", async () => {
    const exchange = makeSignedExchange();
    await app.inject({ method: "POST", url: "/exchanges", payload: exchange });
    const res = await app.inject({ method: "GET", url: "/exchanges" });
    const body = res.json() as { exchanges: Exchange[] };
    const { verifyExchange } = await import("@understoria/shared/crypto");
    expect(verifyExchange(body.exchanges[0])).toBe(true);
  });
});

describe("Security headers", () => {
  it("attaches CSP and frame-deny on a successful response", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    const csp = res.headers["content-security-policy"];
    expect(csp).toBeTruthy();
    expect(String(csp)).toContain("frame-ancestors 'none'");
  });
});

describe("Body size cap", () => {
  it("refuses bodies over the configured limit", async () => {
    // bodyLimit is 64 KB.
    const huge = { id: "x".repeat(70_000) };
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: huge,
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

// Re-fix the `db` reference for the count assertion above. That assertion
// uses a *fresh* store to read the count out of the same in-memory DB
// the server is using. Verifies the row really hit the disk path rather
// than living solely in some JS map.
describe("Persistence sanity", () => {
  it("count() reflects rows inserted via POST", async () => {
    const exchange = makeSignedExchange();
    await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: exchange,
    });
    expect(createExchangeStore(db).count()).toBe(1);
  });
});

describe("GET /config", () => {
  it("returns an empty object when no operator info is configured", async () => {
    const res = await app.inject({ method: "GET", url: "/config" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({});
  });
});

describe("GET /peers", () => {
  it("returns an empty list when no peers are configured", async () => {
    const res = await app.inject({ method: "GET", url: "/peers" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ peers: [] });
  });
});

describe("GET /peers with configured peers", () => {
  let withPeers: FastifyInstance;
  let withPeersDb: DatabaseType;

  beforeEach(async () => {
    withPeersDb = openDatabase(":memory:");
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      NODE_ID: "node_test",
      PEER_NODE_URLS:
        "https://peer-a.example, https://peer-b.example/",
    } as NodeJS.ProcessEnv);
    const built = await buildServer({ config, database: withPeersDb });
    withPeers = built.app;
    await withPeers.ready();
  });

  afterEach(async () => {
    await withPeers.close();
    withPeersDb.close();
  });

  it("lists every configured peer with empty pull state", async () => {
    const res = await withPeers.inject({ method: "GET", url: "/peers" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      peers: Array<{ url: string; lastPulledAt: number | null }>;
    };
    expect(body.peers).toHaveLength(2);
    expect(body.peers.map((p) => p.url)).toEqual([
      "https://peer-a.example",
      "https://peer-b.example",
    ]);
    for (const p of body.peers) {
      expect(p.lastPulledAt).toBeNull();
    }
  });

  it("rejects invalid PEER_NODE_URLS at startup", () => {
    expect(() =>
      readConfigFromEnv({
        LOG_LEVEL: "fatal",
        PEER_NODE_URLS: "ftp://nope.example",
      } as NodeJS.ProcessEnv),
    ).toThrow(/http\(s\)/);
  });
});

describe("GET /config with operator info", () => {
  let withOperator: FastifyInstance;
  let withOperatorDb: DatabaseType;

  beforeEach(async () => {
    withOperatorDb = openDatabase(":memory:");
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      NODE_ID: "node_test",
      OPERATOR_NAME: "Marcus",
      OPERATOR_FUNDING_NOTE: "Hosting donated since 2026-01",
      OPERATOR_CONTACT: "#aid:matrix.example",
    } as NodeJS.ProcessEnv);
    const built = await buildServer({ config, database: withOperatorDb });
    withOperator = built.app;
    await withOperator.ready();
  });

  afterEach(async () => {
    await withOperator.close();
    withOperatorDb.close();
  });

  it("returns the operator block when env vars are set", async () => {
    const res = await withOperator.inject({ method: "GET", url: "/config" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      operator: {
        name: "Marcus",
        fundingNote: "Hosting donated since 2026-01",
        contact: "#aid:matrix.example",
      },
    });
  });
});
