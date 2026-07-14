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
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

let app: FastifyInstance;
let db: DatabaseType;

async function freshServer() {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
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

function claimBody(overrides: Record<string, unknown> = {}) {
  return {
    postId: `post_${Math.random().toString(36).slice(2)}`,
    claimerKey: "k_claimer",
    claimedAt: Date.now(),
    nodeId: "node_test",
    ...overrides,
  };
}

describe("POST /claims — claimedAt bounds", () => {
  it("accepts a valid claim (201) and replays idempotently (200)", async () => {
    const body = claimBody();
    const first = await app.inject({
      method: "POST",
      url: "/claims",
      payload: body,
    });
    expect(first.statusCode).toBe(201);
    const replay = await app.inject({
      method: "POST",
      url: "/claims",
      payload: body,
    });
    expect(replay.statusCode).toBe(200);
  });

  it("rejects a non-integer claimedAt (400)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/claims",
      payload: claimBody({ claimedAt: 1.5 }),
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects an Infinity claimedAt smuggled as 1e999 (400)", async () => {
    // JSON's number grammar allows 1e999, which parses to Infinity —
    // `Infinity <= 0` is false, so the old validator accepted it and
    // the stored row wedged every puller's claimedAt cursor.
    const res = await app.inject({
      method: "POST",
      url: "/claims",
      headers: { "content-type": "application/json" },
      payload:
        '{"postId":"p_inf","claimerKey":"k","claimedAt":1e999,"nodeId":"n"}',
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a claimedAt too far in the future (400) — the cursor-wedge guard", async () => {
    // Same bound validate.ts applies to deletedAt: claims are the
    // GET /claims cursor, so one far-future row would jump every
    // puller's high-water mark and hide all subsequent claims.
    const res = await app.inject({
      method: "POST",
      url: "/claims",
      payload: claimBody({ claimedAt: Date.now() + 3 * 24 * 60 * 60 * 1000 }),
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().reason).toBe("claimedAt is too far in the future");
  });

  it("accepts a claimedAt within the one-day clock-skew grace (201)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/claims",
      payload: claimBody({ claimedAt: Date.now() + 60 * 60 * 1000 }),
    });
    expect(res.statusCode).toBe(201);
  });
});
