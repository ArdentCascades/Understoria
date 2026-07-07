/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  canonicalAwaitingTransitionPayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import type { AwaitingTransition } from "@understoria/shared/types";
import {
  createAwaitingTransitionStore,
  openDatabase,
  type AwaitingTransitionStore,
} from "../db.js";
import { registerAwaitingTransitionRoutes } from "./awaitingTransitions.js";

let app: FastifyInstance;
let db: DatabaseType;
let store: AwaitingTransitionStore;
let nowMs: number;

beforeEach(async () => {
  db = openDatabase(":memory:");
  store = createAwaitingTransitionStore(db);
  nowMs = 1_700_000_000_000;
  app = Fastify({ logger: false });
  await registerAwaitingTransitionRoutes(app, {
    store,
    now: () => nowMs,
  });
  await app.ready();
});

afterEach(async () => {
  await app.close();
  db.close();
});

function makeArtifact(
  overrides: Partial<AwaitingTransition> = {},
): AwaitingTransition {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const payload = {
    kind: "awaiting_transition" as const,
    postId: "post_1",
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    signedBy: helper.publicKey,
    enteredAt: nowMs - 1000,
    nodeId: "node_test",
    ...overrides,
  };
  return {
    ...payload,
    signature:
      overrides.signature ??
      sign(canonicalAwaitingTransitionPayload(payload), helper.secretKey),
  };
}

describe("POST /awaiting-transitions", () => {
  it("accepts a well-signed artifact and stamps the server clock (201)", async () => {
    const artifact = makeArtifact();
    const res = await app.inject({
      method: "POST",
      url: "/awaiting-transitions",
      payload: artifact,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, postId: "post_1" });
    const stored = store.getByPostId("post_1");
    expect(stored?.receivedAt).toBe(nowMs);
    expect(stored?.record.signature).toBe(artifact.signature);
  });

  it("is idempotent and first-writer-wins — a re-push never resets the anchor (200)", async () => {
    const artifact = makeArtifact();
    await app.inject({
      method: "POST",
      url: "/awaiting-transitions",
      payload: artifact,
    });
    nowMs += 5_000; // later re-push
    const res = await app.inject({
      method: "POST",
      url: "/awaiting-transitions",
      payload: artifact,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ stored: false, postId: "post_1" });
    // Anchor unchanged: still the FIRST receipt.
    expect(store.getByPostId("post_1")?.receivedAt).toBe(nowMs - 5_000);
  });

  it("rejects a corrupted signature (422)", async () => {
    const artifact = makeArtifact();
    const res = await app.inject({
      method: "POST",
      url: "/awaiting-transitions",
      payload: {
        ...artifact,
        signature: artifact.signature.slice(0, -2) + "AA",
      },
    });
    expect(res.statusCode).toBe(422);
    expect(store.count()).toBe(0);
  });

  it("rejects an artifact signed by a non-party (400 at the shape gate)", async () => {
    const stranger = generateKeyPair();
    const helper = generateKeyPair();
    const helped = generateKeyPair();
    const payload = {
      kind: "awaiting_transition" as const,
      postId: "post_np",
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      signedBy: stranger.publicKey,
      enteredAt: nowMs - 1000,
      nodeId: "node_test",
    };
    const res = await app.inject({
      method: "POST",
      url: "/awaiting-transitions",
      payload: {
        ...payload,
        signature: sign(
          canonicalAwaitingTransitionPayload(payload),
          stranger.secretKey,
        ),
      },
    });
    expect(res.statusCode).toBe(400);
    expect(store.count()).toBe(0);
  });

  it("rejects malformed bodies and future enteredAt (400)", async () => {
    const bad = await app.inject({
      method: "POST",
      url: "/awaiting-transitions",
      payload: { postId: "" },
    });
    expect(bad.statusCode).toBe(400);

    const future = makeArtifact({
      enteredAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
    });
    const res = await app.inject({
      method: "POST",
      url: "/awaiting-transitions",
      payload: future,
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects an oversize postId label (400)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/awaiting-transitions",
      payload: makeArtifact({ postId: "x".repeat(301) }),
    });
    expect(res.statusCode).toBe(400);
  });
});
