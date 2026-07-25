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
/**
 * Onion rate-limit lane (docs/tor-onion-plan.md §2 C2): requests the
 * Caddy onion vhost stamps with the mark secret get a dedicated
 * bucket; everything else — wrong secret, missing header, lane
 * disabled — behaves exactly as before. The mirror-internal bypass
 * must stay untouched by the lane.
 */
import { afterEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import { buildServer, ONION_MARK_HEADER, type BuiltServer } from "./server.js";
import { MIRROR_INTERNAL_HEADER } from "./mirrorPull.js";
import { readConfigFromEnv } from "./config.js";
import { openDatabase } from "./db.js";

let built: BuiltServer | null = null;
let db: DatabaseType | null = null;

async function serverWith(env: Record<string, string>) {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
    NODE_ID: "node_test",
    ...env,
  } as NodeJS.ProcessEnv);
  built = await buildServer({ config, database: db });
  await built.app.ready();
  return built;
}

afterEach(async () => {
  await built?.app.close();
  db?.close();
  built = null;
  db = null;
});

describe("onion rate-limit lane", () => {
  it("marked requests share the dedicated bucket and 429 at ITS budget, not the normal one", async () => {
    const { app } = await serverWith({
      RATE_LIMIT_MAX: "10000",
      ONION_RATE_LIMIT_MAX: "3",
      ONION_MARK_SECRET: "lane-secret",
    });
    const onionHeaders = { [ONION_MARK_HEADER]: "lane-secret" };
    for (let i = 0; i < 3; i++) {
      const res = await app.inject({
        method: "GET",
        url: "/health",
        headers: onionHeaders,
      });
      expect(res.statusCode).toBe(200);
    }
    const overflow = await app.inject({
      method: "GET",
      url: "/health",
      headers: onionHeaders,
    });
    expect(overflow.statusCode).toBe(429);
    // The normal (IP-bucket) path is unaffected by the lane's 429.
    const clearnet = await app.inject({ method: "GET", url: "/health" });
    expect(clearnet.statusCode).toBe(200);
  });

  it("a WRONG secret lands in the normal bucket — never an error, never the lane", async () => {
    const { app } = await serverWith({
      RATE_LIMIT_MAX: "10000",
      ONION_RATE_LIMIT_MAX: "1",
      ONION_MARK_SECRET: "lane-secret",
    });
    // Burn the lane budget with the real mark.
    await app.inject({
      method: "GET",
      url: "/health",
      headers: { [ONION_MARK_HEADER]: "lane-secret" },
    });
    // A spoof attempt with the wrong value: normal bucket, still 200.
    for (let i = 0; i < 5; i++) {
      const res = await app.inject({
        method: "GET",
        url: "/health",
        headers: { [ONION_MARK_HEADER]: "wrong-guess" },
      });
      expect(res.statusCode).toBe(200);
    }
  });

  it("lane off (default): the header is inert even with a configured secret-shaped value", async () => {
    const { app } = await serverWith({
      // Tight normal budget so we can SEE which bucket absorbs the
      // marked requests: with the lane off they must consume the
      // normal bucket.
      RATE_LIMIT_MAX: "2",
    });
    const headers = { [ONION_MARK_HEADER]: "anything" };
    expect(
      (await app.inject({ method: "GET", url: "/health", headers })).statusCode,
    ).toBe(200);
    expect(
      (await app.inject({ method: "GET", url: "/health", headers })).statusCode,
    ).toBe(200);
    expect(
      (await app.inject({ method: "GET", url: "/health", headers })).statusCode,
    ).toBe(429);
  });

  it("secret without a budget (ONION_RATE_LIMIT_MAX unset) keeps the lane off", async () => {
    const { app } = await serverWith({
      RATE_LIMIT_MAX: "2",
      ONION_MARK_SECRET: "lane-secret",
    });
    const headers = { [ONION_MARK_HEADER]: "lane-secret" };
    await app.inject({ method: "GET", url: "/health", headers });
    await app.inject({ method: "GET", url: "/health", headers });
    expect(
      (await app.inject({ method: "GET", url: "/health", headers })).statusCode,
    ).toBe(429);
  });

  it("the mirror-internal bypass is unaffected by the lane", async () => {
    const server = await serverWith({
      RATE_LIMIT_MAX: "1",
      ONION_RATE_LIMIT_MAX: "1",
      ONION_MARK_SECRET: "lane-secret",
    });
    // Exhaust BOTH buckets.
    await server.app.inject({ method: "GET", url: "/health" });
    await server.app.inject({
      method: "GET",
      url: "/health",
      headers: { [ONION_MARK_HEADER]: "lane-secret" },
    });
    // The internal bypass still sails through.
    for (let i = 0; i < 5; i++) {
      const res = await server.app.inject({
        method: "GET",
        url: "/health",
        headers: { [MIRROR_INTERNAL_HEADER]: server.internalBypassToken },
      });
      expect(res.statusCode).toBe(200);
    }
  });
});
