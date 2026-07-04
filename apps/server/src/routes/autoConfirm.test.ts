/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";
import {
  canonicalExchangePayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import type { Exchange } from "@understoria/shared/types";
import {
  createExchangeStore,
  openDatabase,
  type ExchangeStore,
} from "../db.js";
import { registerAutoConfirmRoutes } from "./autoConfirm.js";
import {
  createSystemSignerFromSecret,
  type SystemSigner,
} from "../systemSigner.js";

const HOUR = 60 * 60 * 1000;
const NODE_ID = "node_test";

let app: FastifyInstance;
let db: DatabaseType;
let store: ExchangeStore;
let signer: SystemSigner;
let nowMs: number;

beforeEach(async () => {
  db = openDatabase(":memory:");
  store = createExchangeStore(db);
  const sysKp = generateKeyPair();
  signer = createSystemSignerFromSecret(sysKp.secretKey)!;
  nowMs = 1_700_000_000_000;
  app = Fastify({ logger: false });
  await registerAutoConfirmRoutes(app, {
    store,
    signer,
    nodeId: NODE_ID,
    autoConfirmMinHours: 168,
    now: () => nowMs,
  });
  await app.ready();
});

afterEach(async () => {
  await app.close();
  db.close();
});

function makeRequest(overrides: Partial<{ awaitingSince: number }> = {}) {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const payload = {
    postId: "post_x",
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hours: 1.5,
    category: "transport" as const,
    completedAt: nowMs,
  };
  const helperSignature = sign(canonicalExchangePayload(payload), helper.secretKey);
  return {
    exchangeId: "ex_x",
    awaitingSince: overrides.awaitingSince ?? nowMs - 8 * 24 * HOUR,
    helperSignature,
    payload,
  };
}

describe("POST /auto-confirm — endpoint-level enforcement", () => {
  it("signs a well-formed request whose helper signature verifies and whose window has elapsed", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auto-confirm",
      payload: { requests: [makeRequest()] },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { results: Array<{ status: string; exchange?: { autoConfirmed?: boolean; autoConfirmedBy?: string } }> };
    expect(body.results[0].status).toBe("signed");
    expect(body.results[0].exchange?.autoConfirmed).toBe(true);
    expect(body.results[0].exchange?.autoConfirmedBy).toBe(`system:${NODE_ID}`);
  });

  it("re-submission returns the stored row even when it is not the newest exchange", async () => {
    const reqA = { ...makeRequest(), exchangeId: "ex_a" };
    const reqB = { ...makeRequest(), exchangeId: "ex_b" };
    const first = await app.inject({
      method: "POST",
      url: "/auto-confirm",
      payload: { requests: [reqA] },
    });
    const firstRow = (first.json() as {
      results: Array<{ exchange?: Exchange }>;
    }).results[0].exchange!;
    // A second, more recent exchange lands after ex_a. The old
    // list({limit:1}).find lookup only ever saw the newest row, so a
    // re-submission of ex_a came back with no exchange attached.
    await app.inject({
      method: "POST",
      url: "/auto-confirm",
      payload: { requests: [reqB] },
    });

    const again = await app.inject({
      method: "POST",
      url: "/auto-confirm",
      payload: { requests: [reqA] },
    });
    const body = again.json() as {
      results: Array<{ status: string; exchange?: Exchange }>;
    };
    expect(body.results[0].status).toBe("signed");
    // The stored row comes back — same signature, same
    // autoConfirmedAt: the server did NOT re-sign (that would mint a
    // fresh timestamp and amount to an audit lie).
    expect(body.results[0].exchange).toBeDefined();
    expect(body.results[0].exchange!.id).toBe("ex_a");
    expect(body.results[0].exchange!.helpedSignature).toBe(
      firstRow.helpedSignature,
    );
    expect(body.results[0].exchange!.autoConfirmedAt).toBe(
      firstRow.autoConfirmedAt,
    );
  });

  it("server independently rejects window-not-elapsed (client claim is not trusted)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auto-confirm",
      payload: {
        requests: [makeRequest({ awaitingSince: nowMs - 1 * HOUR })],
      },
    });
    const body = res.json() as { results: Array<{ status: string; reason?: string }> };
    expect(body.results[0].status).toBe("ineligible");
    expect(body.results[0].reason).toBe("window_not_elapsed");
  });

  it("server rejects bad helper signature (cannot invent records)", async () => {
    const req = makeRequest();
    const corrupted = {
      ...req,
      helperSignature: req.helperSignature.slice(0, -2) + "AA",
    };
    const res = await app.inject({
      method: "POST",
      url: "/auto-confirm",
      payload: { requests: [corrupted] },
    });
    const body = res.json() as { results: Array<{ status: string; reason?: string }> };
    expect(body.results[0].status).toBe("ineligible");
    expect(body.results[0].reason).toBe("bad_helper_signature");
  });

  it("payload bytes the helper signed survive byte-for-byte through signing", async () => {
    const req = makeRequest();
    const res = await app.inject({
      method: "POST",
      url: "/auto-confirm",
      payload: { requests: [req] },
    });
    const body = res.json() as {
      results: Array<{
        exchange?: {
          helperKey: string;
          helpedKey: string;
          hoursExchanged: number;
          category: string;
          completedAt: number;
          helperSignature: string;
        };
      }>;
    };
    const ex = body.results[0].exchange!;
    expect(ex.helperKey).toBe(req.payload.helperKey);
    expect(ex.helpedKey).toBe(req.payload.helpedKey);
    expect(ex.hoursExchanged).toBe(req.payload.hours);
    expect(ex.category).toBe(req.payload.category);
    expect(ex.completedAt).toBe(req.payload.completedAt);
    expect(ex.helperSignature).toBe(req.helperSignature);
  });
});
