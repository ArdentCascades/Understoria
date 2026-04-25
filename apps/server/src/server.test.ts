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
