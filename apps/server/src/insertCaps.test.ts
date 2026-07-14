/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Insert-cap backstop (insertCaps.ts): the per-table and per-key
 * ceilings that make "disk full" an operator decision instead of an
 * attacker's. Runs against the real built server so the preHandler
 * ordering (guard before route handlers) is what's under test.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  canonicalPostPayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import { openDatabase } from "./db.js";
import { buildServer } from "./server.js";
import { readConfigFromEnv } from "./config.js";

let app: FastifyInstance;
let db: DatabaseType;

async function build(env: Record<string, string>) {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
    NODE_ID: "node_test",
    ...env,
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  await app.ready();
}

afterEach(async () => {
  await app.close();
  db.close();
});

function signedPost(poster: KeyPair, i: number) {
  const immutable = {
    id: `p_cap_${i}`,
    type: "NEED" as const,
    category: "transport" as const,
    title: "Help",
    description: "",
    estimatedHours: 1,
    urgency: "medium" as const,
    postedBy: poster.publicKey,
    createdAt: Date.now(),
    expiresAt: null,
    locationZone: "z",
    nodeId: "node_test",
  };
  return {
    ...immutable,
    signature: sign(canonicalPostPayload(immutable), poster.secretKey),
  };
}

async function postPost(payload: unknown) {
  return app.inject({ method: "POST", url: "/posts", payload });
}

describe("per-key ceiling", () => {
  beforeEach(() =>
    build({ PER_KEY_ROW_CEILING: "3", TABLE_ROW_CEILING: "0" }),
  );

  it("refuses the key's 4th row with 507 scope:key; another key still lands", async () => {
    const attacker = generateKeyPair();
    for (let i = 0; i < 3; i++) {
      const res = await postPost(signedPost(attacker, i));
      expect(res.statusCode).toBe(201);
    }
    const fourth = await postPost(signedPost(attacker, 3));
    expect(fourth.statusCode).toBe(507);
    expect(fourth.json()).toEqual({
      error: "capacity_reached",
      scope: "key",
    });

    // A different member is unaffected — the cap is per key.
    const honest = generateKeyPair();
    const ok = await postPost(signedPost(honest, 100));
    expect(ok.statusCode).toBe(201);
  });

  it("skips the key check for a malformed body (shape validation still rejects)", async () => {
    const res = await postPost({ postedBy: 42 });
    expect(res.statusCode).toBe(400);
  });
});

describe("per-table ceiling", () => {
  beforeEach(() =>
    build({ TABLE_ROW_CEILING: "2", PER_KEY_ROW_CEILING: "0" }),
  );

  it("refuses any writer once the table is at the ceiling — 507 scope:table", async () => {
    const a = generateKeyPair();
    const b = generateKeyPair();
    expect((await postPost(signedPost(a, 0))).statusCode).toBe(201);
    expect((await postPost(signedPost(b, 1))).statusCode).toBe(201);
    const res = await postPost(signedPost(generateKeyPair(), 2));
    expect(res.statusCode).toBe(507);
    expect(res.json()).toEqual({
      error: "capacity_reached",
      scope: "table",
    });
  });

  it("does not affect GET on the same path", async () => {
    const a = generateKeyPair();
    await postPost(signedPost(a, 0));
    await postPost(signedPost(a, 1));
    const res = await app.inject({ method: "GET", url: "/posts" });
    expect(res.statusCode).toBe(200);
    expect(res.json().count).toBe(2);
  });
});

describe("disabled checks", () => {
  beforeEach(() =>
    build({ TABLE_ROW_CEILING: "0", PER_KEY_ROW_CEILING: "0" }),
  );

  it("0 disables both ceilings entirely", async () => {
    const poster = generateKeyPair();
    for (let i = 0; i < 5; i++) {
      const res = await postPost(signedPost(poster, i));
      expect(res.statusCode).toBe(201);
    }
  });
});

describe("defaults", () => {
  beforeEach(() => build({}));

  it("ships with generous non-zero defaults that normal traffic never sees", async () => {
    const poster = generateKeyPair();
    const res = await postPost(signedPost(poster, 0));
    expect(res.statusCode).toBe(201);
  });
});
