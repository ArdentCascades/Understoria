/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * GET /capacity-postures feed (docs/capacity-forecast.md §6). Read-only:
 * the node emits its own posture; there is no POST to submit one. These
 * cases pin the feed's composite-cursor paging over a real server + a
 * store seeded directly (the emitter's write path is covered in
 * capacityEmitter.test.ts).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  generateKeyPair,
  signStateRecord,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { CapacityPosture } from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { createCapacityPostureStore, openDatabase } from "../db.js";

let app: FastifyInstance;
let db: DatabaseType;

async function freshServer() {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
    NODE_ID: "node_test",
    RATE_LIMIT_MAX: "10000",
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

function makePosture(
  signer: KeyPair,
  nodeId: string,
  updatedAt: number,
): CapacityPosture {
  const unsigned: Omit<CapacityPosture, "signature"> = {
    nodeId,
    pressure: "amber",
    horizon: "months",
    growthRecommended: false,
    updatedAt,
    signerKey: signer.publicKey,
  };
  return {
    ...unsigned,
    signature: signStateRecord<CapacityPosture>(unsigned, signer.secretKey),
  };
}

describe("GET /capacity-postures", () => {
  it("serves stored postures oldest-first, and there is no POST route", async () => {
    const signer = generateKeyPair();
    const store = createCapacityPostureStore(db);
    store.upsert(makePosture(signer, "node_a", 1000));
    store.upsert(makePosture(signer, "node_b", 2000));

    const res = await app.inject({ method: "GET", url: "/capacity-postures" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { count: number; capacityPostures: CapacityPosture[] };
    expect(body.count).toBe(2);
    expect(body.capacityPostures.map((p) => p.nodeId)).toEqual([
      "node_a",
      "node_b",
    ]);

    // Read-only surface: no member POST path exists.
    const post = await app.inject({
      method: "POST",
      url: "/capacity-postures",
      payload: makePosture(signer, "node_c", 3000),
    });
    expect(post.statusCode).toBe(404);
  });

  it("pages with the composite (updatedAt, nodeId) cursor", async () => {
    const signer = generateKeyPair();
    const store = createCapacityPostureStore(db);
    store.upsert(makePosture(signer, "node_a", 1000));
    store.upsert(makePosture(signer, "node_b", 2000));

    const page = await app.inject({
      method: "GET",
      url: "/capacity-postures?limit=1",
    });
    const first = (page.json() as { capacityPostures: CapacityPosture[] })
      .capacityPostures;
    expect(first).toHaveLength(1);
    expect(first[0].nodeId).toBe("node_a");

    const next = await app.inject({
      method: "GET",
      url: `/capacity-postures?since=${first[0].updatedAt}&sinceId=${first[0].nodeId}`,
    });
    const rest = (next.json() as { capacityPostures: CapacityPosture[] })
      .capacityPostures;
    expect(rest.map((p) => p.nodeId)).toEqual(["node_b"]);
  });
});
