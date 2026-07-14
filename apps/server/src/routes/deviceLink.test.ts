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
 * Device-link mailbox contract (docs/device-pairing.md §6.6):
 *   - opaque one-shot rows: first GET wins, second GET 404s
 *   - expired rows 404 AND are consumed, never guessable later
 *   - absent / expired / taken are indistinguishable (no oracle)
 *   - validation: channel id shape, envelope size, duplicate channel
 *   - the TTL prune runs on every write
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { createDeviceLinkStore, openDatabase } from "../db.js";
import { DEVICE_LINK_TTL_MS } from "./deviceLink.js";

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

const CHANNEL = "a".repeat(64);
const ENVELOPE = "eyJ2IjoxLCJzYWx0IjoiYWJjIiwibm9uY2UiOiJkZWYifQ";

describe("POST /device-link", () => {
  it("stores a valid mailbox row and returns its expiry", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/device-link",
      payload: { channelId: CHANNEL, envelope: ENVELOPE },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json() as { ok: boolean; expiresAt: number };
    expect(body.ok).toBe(true);
    expect(body.expiresAt).toBeGreaterThan(Date.now());
    expect(body.expiresAt).toBeLessThanOrEqual(
      Date.now() + DEVICE_LINK_TTL_MS + 1000,
    );
  });

  it("rejects malformed channel ids", async () => {
    for (const bad of [
      "short",
      "A".repeat(64), // uppercase — client always emits lowercase hex
      "z".repeat(64),
      "a".repeat(63),
      "",
    ]) {
      const res = await app.inject({
        method: "POST",
        url: "/device-link",
        payload: { channelId: bad, envelope: ENVELOPE },
      });
      expect(res.statusCode, `channelId ${JSON.stringify(bad)}`).toBe(400);
    }
  });

  it("rejects a missing, empty, or oversized envelope", async () => {
    for (const bad of [undefined, "", 42]) {
      const res = await app.inject({
        method: "POST",
        url: "/device-link",
        payload: { channelId: CHANNEL, envelope: bad },
      });
      expect(res.statusCode).toBe(400);
    }
    // A 500 KB envelope trips the route's own cap (480 KB — sized for
    // snapshot-bearing envelopes; the per-route 640 KB body limit
    // sits above it).
    const res = await app.inject({
      method: "POST",
      url: "/device-link",
      payload: { channelId: CHANNEL, envelope: "x".repeat(500 * 1024) },
    });
    expect(res.statusCode).toBe(400);
    // And a snapshot-sized envelope (well over the old 32 KB cap)
    // is accepted.
    const big = await app.inject({
      method: "POST",
      url: "/device-link",
      payload: { channelId: "f".repeat(64), envelope: "y".repeat(300 * 1024) },
    });
    expect(big.statusCode).toBe(201);
  });

  it("409s a duplicate channel id — never silently overwrites", async () => {
    const first = await app.inject({
      method: "POST",
      url: "/device-link",
      payload: { channelId: CHANNEL, envelope: ENVELOPE },
    });
    expect(first.statusCode).toBe(201);
    const second = await app.inject({
      method: "POST",
      url: "/device-link",
      payload: { channelId: CHANNEL, envelope: "another-blob" },
    });
    expect(second.statusCode).toBe(409);
    // The original blob survives the replay attempt.
    const got = await app.inject({
      method: "GET",
      url: `/device-link/${CHANNEL}`,
    });
    expect((got.json() as { envelope: string }).envelope).toBe(ENVELOPE);
  });
});

describe("GET /device-link/:channelId", () => {
  it("is one-shot: first GET returns the envelope, second 404s", async () => {
    await app.inject({
      method: "POST",
      url: "/device-link",
      payload: { channelId: CHANNEL, envelope: ENVELOPE },
    });
    const first = await app.inject({
      method: "GET",
      url: `/device-link/${CHANNEL}`,
    });
    expect(first.statusCode).toBe(200);
    expect((first.json() as { envelope: string }).envelope).toBe(ENVELOPE);
    const second = await app.inject({
      method: "GET",
      url: `/device-link/${CHANNEL}`,
    });
    expect(second.statusCode).toBe(404);
  });

  it("404s unknown and malformed channel ids with the same shape (no oracle)", async () => {
    const unknown = await app.inject({
      method: "GET",
      url: `/device-link/${"b".repeat(64)}`,
    });
    const malformed = await app.inject({
      method: "GET",
      url: "/device-link/nope",
    });
    expect(unknown.statusCode).toBe(404);
    expect(malformed.statusCode).toBe(404);
    expect(unknown.json()).toEqual(malformed.json());
  });

  it("an expired row 404s and is consumed", async () => {
    // Drive the store directly with a fake clock — the route's
    // injected `now` defaults to Date.now(), so plant a row that is
    // already past its expiry.
    const store = createDeviceLinkStore(db);
    store.insert({
      channelId: CHANNEL,
      envelope: ENVELOPE,
      createdAt: Date.now() - DEVICE_LINK_TTL_MS - 1000,
      expiresAt: Date.now() - 1000,
    });
    const res = await app.inject({
      method: "GET",
      url: `/device-link/${CHANNEL}`,
    });
    expect(res.statusCode).toBe(404);
    // Consumed: nothing left in the table for a later guess.
    expect(store.count()).toBe(0);
  });
});

describe("TTL prune", () => {
  it("each POST sweeps expired rows out of the table", async () => {
    const store = createDeviceLinkStore(db);
    store.insert({
      channelId: "c".repeat(64),
      envelope: ENVELOPE,
      createdAt: Date.now() - DEVICE_LINK_TTL_MS - 1000,
      expiresAt: Date.now() - 1000,
    });
    expect(store.count()).toBe(1);
    await app.inject({
      method: "POST",
      url: "/device-link",
      payload: { channelId: CHANNEL, envelope: ENVELOPE },
    });
    // The stale row is gone; only the fresh one remains.
    expect(store.count()).toBe(1);
    const stale = await app.inject({
      method: "GET",
      url: `/device-link/${"c".repeat(64)}`,
    });
    expect(stale.statusCode).toBe(404);
  });
});
