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
import {
  canonicalReadAuthMessage,
  canonicalRelayedMessagePayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { RelayedMessage } from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

let app: FastifyInstance;
let db: DatabaseType;

async function freshServer(env: Record<string, string> = {}) {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    NODE_ID: "node_test",
    ...env,
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  await app.ready();
}

beforeEach(() => freshServer());
afterEach(async () => {
  await app.close();
  db.close();
});

const sender: KeyPair = generateKeyPair();
const recipient: KeyPair = generateKeyPair();
const other: KeyPair = generateKeyPair();

let seq = 0;
function envelope(
  from: KeyPair,
  toPublicKey: string,
  overrides: Partial<RelayedMessage> = {},
): RelayedMessage {
  seq += 1;
  const base = {
    id: `msg_${seq}_${Math.random().toString(36).slice(2)}`,
    senderKey: from.publicKey,
    recipientKey: toPublicKey,
    nonce: "bm9uY2Vub25jZW5vbmNlbm9uY2U=",
    ciphertext: "Y2lwaGVydGV4dA==",
    createdAt: Date.now(),
    ...overrides,
  };
  return {
    ...base,
    signature:
      overrides.signature ??
      sign(
        canonicalRelayedMessagePayload({
          id: base.id,
          senderKey: base.senderKey,
          recipientKey: base.recipientKey,
          nonce: base.nonce,
          ciphertext: base.ciphertext,
          createdAt: base.createdAt,
        }),
        from.secretKey,
      ),
  };
}

/** The x-understoria read-signature trio for `url`, signed by `kp`. */
function readHeaders(kp: KeyPair, url: string, ts = Date.now()) {
  return {
    "x-understoria-key": kp.publicKey,
    "x-understoria-ts": String(ts),
    "x-understoria-sig": sign(canonicalReadAuthMessage(url, ts), kp.secretKey),
  };
}

describe("POST /messages", () => {
  it("accepts a signed envelope (201) and replays idempotently (200)", async () => {
    const body = envelope(sender, recipient.publicKey);
    const first = await app.inject({
      method: "POST",
      url: "/messages",
      payload: body,
    });
    expect(first.statusCode).toBe(201);
    const replay = await app.inject({
      method: "POST",
      url: "/messages",
      payload: body,
    });
    expect(replay.statusCode).toBe(200);
  });

  it("refuses a spoofed sender — signature by someone else (422)", async () => {
    const forged = envelope(other, recipient.publicKey, {
      senderKey: sender.publicKey,
    });
    const res = await app.inject({
      method: "POST",
      url: "/messages",
      payload: forged,
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects a missing field (400)", async () => {
    const { ciphertext: _drop, ...rest } = envelope(
      sender,
      recipient.publicKey,
    );
    const res = await app.inject({
      method: "POST",
      url: "/messages",
      payload: rest,
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a self-addressed envelope (400)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/messages",
      payload: envelope(sender, sender.publicKey),
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a far-future createdAt — the cursor-wedge guard (400)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/messages",
      payload: envelope(sender, recipient.publicKey, {
        createdAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
      }),
    });
    expect(res.statusCode).toBe(400);
  });

  it("prunes envelopes past the retention window on the write path", async () => {
    const stale = envelope(sender, recipient.publicKey, {
      createdAt: Date.now() - 40 * 24 * 60 * 60 * 1000, // default window is 30d
    });
    expect(
      (
        await app.inject({ method: "POST", url: "/messages", payload: stale })
      ).statusCode,
    ).toBe(201);
    const fresh = envelope(sender, recipient.publicKey);
    expect(
      (
        await app.inject({ method: "POST", url: "/messages", payload: fresh })
      ).statusCode,
    ).toBe(201);

    const url = "/messages";
    const res = await app.inject({
      method: "GET",
      url,
      headers: readHeaders(recipient, url),
    });
    const body = res.json() as { messages: RelayedMessage[] };
    expect(body.messages.map((m) => m.id)).toEqual([fresh.id]);
  });
});

describe("POST /messages — membership gate (READ_AUTH=on)", () => {
  beforeEach(async () => {
    await app.close();
    db.close();
    await freshServer({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: sender.publicKey,
    });
  });

  it("accepts a member sender and refuses a non-member (403)", async () => {
    const fromMember = await app.inject({
      method: "POST",
      url: "/messages",
      payload: envelope(sender, recipient.publicKey),
    });
    expect(fromMember.statusCode).toBe(201);

    const fromStranger = await app.inject({
      method: "POST",
      url: "/messages",
      payload: envelope(other, recipient.publicKey),
    });
    expect(fromStranger.statusCode).toBe(403);
    expect(fromStranger.json().error).toBe("not_a_member");
  });
});

describe("GET /messages — the recipient-scoped inbox", () => {
  it("refuses an unauthenticated read even with READ_AUTH off (401)", async () => {
    const res = await app.inject({ method: "GET", url: "/messages" });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe("recipient_proof_required");
  });

  it("refuses a peer bearer token — messages never peer-federate (403)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/messages",
      headers: { authorization: "Bearer some-peer-token" },
    });
    expect(res.statusCode).toBe(403);
  });

  it("refuses a stale read signature (401)", async () => {
    const url = "/messages";
    const res = await app.inject({
      method: "GET",
      url,
      headers: readHeaders(recipient, url, Date.now() - 11 * 60 * 1000),
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe("stale_read_signature");
  });

  it("refuses a signature that doesn't match the claimed key (401)", async () => {
    const url = "/messages";
    const headers = readHeaders(recipient, url);
    headers["x-understoria-key"] = other.publicKey; // claim someone else's inbox
    const res = await app.inject({ method: "GET", url, headers });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe("bad_read_signature");
  });

  it("serves ONLY the proven key's inbox", async () => {
    const mine = envelope(sender, recipient.publicKey);
    const theirs = envelope(sender, other.publicKey);
    for (const m of [mine, theirs]) {
      expect(
        (
          await app.inject({ method: "POST", url: "/messages", payload: m })
        ).statusCode,
      ).toBe(201);
    }

    const url = "/messages";
    const res = await app.inject({
      method: "GET",
      url,
      headers: readHeaders(recipient, url),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { count: number; messages: RelayedMessage[] };
    expect(body.count).toBe(1);
    expect(body.messages[0].id).toBe(mine.id);
    expect(body.messages[0].recipientKey).toBe(recipient.publicKey);
  });

  it("pages with the composite (since, sinceId) pair cursor", async () => {
    const t = Date.now() - 60_000;
    const a = envelope(sender, recipient.publicKey, {
      id: "msg_a",
      createdAt: t,
    });
    const b = envelope(sender, recipient.publicKey, {
      id: "msg_b",
      createdAt: t, // same millisecond — the tie the pair cursor exists for
    });
    for (const m of [a, b]) {
      expect(
        (
          await app.inject({ method: "POST", url: "/messages", payload: m })
        ).statusCode,
      ).toBe(201);
    }

    const url = `/messages?since=${t}&sinceId=msg_a&limit=10`;
    const res = await app.inject({
      method: "GET",
      url,
      headers: readHeaders(recipient, url),
    });
    const body = res.json() as { messages: RelayedMessage[] };
    expect(body.messages.map((m) => m.id)).toEqual(["msg_b"]);
  });
});
