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
  canonicalInviteRevocationPayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { InviteRevocation } from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { createInviteRevocationStore, openDatabase } from "../db.js";

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

function makeRevocation(opts: {
  inviter?: KeyPair;
  token?: string;
  revokedAt?: number;
} = {}): { revocation: InviteRevocation; inviter: KeyPair } {
  const inviter = opts.inviter ?? generateKeyPair();
  const payload = {
    token: opts.token ?? `tok_${Math.random().toString(36).slice(2)}`,
    inviterKey: inviter.publicKey,
    revokedAt: opts.revokedAt ?? Date.now(),
    nodeId: "node_test",
  };
  return {
    revocation: {
      ...payload,
      signature: sign(
        canonicalInviteRevocationPayload(payload),
        inviter.secretKey,
      ),
    },
    inviter,
  };
}

describe("POST /invite-revocations", () => {
  it("stores a valid revocation (201) and serves it back on GET", async () => {
    const { revocation } = makeRevocation();
    const res = await app.inject({
      method: "POST",
      url: "/invite-revocations",
      payload: revocation,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, token: revocation.token });

    const list = await app.inject({
      method: "GET",
      url: "/invite-revocations",
    });
    expect(list.statusCode).toBe(200);
    const body = list.json() as {
      count: number;
      inviteRevocations: Array<InviteRevocation & { receivedAt: number }>;
    };
    expect(body.count).toBe(1);
    expect(body.inviteRevocations[0].token).toBe(revocation.token);
    expect(body.inviteRevocations[0].inviterKey).toBe(revocation.inviterKey);
    // The server-assigned cursor rides on every row.
    expect(typeof body.inviteRevocations[0].receivedAt).toBe("number");
  });

  it("is idempotent for a replay by the same inviter (200)", async () => {
    const { revocation } = makeRevocation();
    const first = await app.inject({
      method: "POST",
      url: "/invite-revocations",
      payload: revocation,
    });
    expect(first.statusCode).toBe(201);
    const replay = await app.inject({
      method: "POST",
      url: "/invite-revocations",
      payload: revocation,
    });
    expect(replay.statusCode).toBe(200);
    expect(replay.json()).toEqual({ stored: false, token: revocation.token });
  });

  it("rejects a second revocation for the same token by a DIFFERENT inviter (409 first-writer-wins)", async () => {
    const token = "tok_shared";
    const winner = makeRevocation({ token });
    const loser = makeRevocation({ token });
    expect(winner.revocation.inviterKey).not.toBe(loser.revocation.inviterKey);

    const first = await app.inject({
      method: "POST",
      url: "/invite-revocations",
      payload: winner.revocation,
    });
    expect(first.statusCode).toBe(201);
    const second = await app.inject({
      method: "POST",
      url: "/invite-revocations",
      payload: loser.revocation,
    });
    expect(second.statusCode).toBe(409);
    expect(second.json()).toEqual({ error: "token_already_revoked" });

    // The winner's row is untouched.
    const list = await app.inject({
      method: "GET",
      url: "/invite-revocations",
    });
    const body = list.json() as {
      count: number;
      inviteRevocations: Array<{ inviterKey: string }>;
    };
    expect(body.count).toBe(1);
    expect(body.inviteRevocations[0].inviterKey).toBe(
      winner.revocation.inviterKey,
    );
  });

  it("rejects a malformed body (400)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/invite-revocations",
      payload: { hello: "world" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("invalid_body");
  });

  it("rejects a tampered signature (422)", async () => {
    const { revocation } = makeRevocation();
    const tampered = { ...revocation, token: "tok_impostor" };
    const res = await app.inject({
      method: "POST",
      url: "/invite-revocations",
      payload: tampered,
    });
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({ error: "invalid_revocation" });
  });

  it("rejects a revocation signed by a key other than inviterKey (422)", async () => {
    const { revocation } = makeRevocation();
    const stranger = generateKeyPair();
    const forged: InviteRevocation = {
      ...revocation,
      signature: sign(
        canonicalInviteRevocationPayload(revocation),
        stranger.secretKey,
      ),
    };
    const res = await app.inject({
      method: "POST",
      url: "/invite-revocations",
      payload: forged,
    });
    expect(res.statusCode).toBe(422);
  });
});

describe("GET /invite-revocations — receivedAt cursor", () => {
  it("pages ascending on the server-assigned receivedAt, inclusive at the boundary", async () => {
    const store = createInviteRevocationStore(db);
    const early = makeRevocation().revocation;
    const late = makeRevocation().revocation;
    store.insert(early, 1_000);
    store.insert(late, 2_000);

    const all = await app.inject({
      method: "GET",
      url: "/invite-revocations",
    });
    const body = all.json() as {
      inviteRevocations: Array<{ receivedAt: number }>;
    };
    expect(body.inviteRevocations.map((r) => r.receivedAt)).toEqual([
      1_000, 2_000,
    ]);

    // `since` is INCLUSIVE — a row sharing the cursor timestamp is
    // re-served so a tie at a page boundary is never lost; pullers merge
    // idempotently by token, so re-served rows are no-ops.
    const afterFirst = await app.inject({
      method: "GET",
      url: "/invite-revocations?since=1001",
    });
    const page = afterFirst.json() as {
      count: number;
      inviteRevocations: Array<{ token: string }>;
    };
    expect(page.count).toBe(1);
    expect(page.inviteRevocations[0].token).toBe(late.token);

    const atBoundary = await app.inject({
      method: "GET",
      url: "/invite-revocations?since=2000",
    });
    expect((atBoundary.json() as { count: number }).count).toBe(1);

    const afterAll = await app.inject({
      method: "GET",
      url: "/invite-revocations?since=2001",
    });
    expect((afterAll.json() as { count: number }).count).toBe(0);
  });

  it("honors limit", async () => {
    const store = createInviteRevocationStore(db);
    for (let i = 1; i <= 3; i++) {
      store.insert(makeRevocation().revocation, i * 100);
    }
    const res = await app.inject({
      method: "GET",
      url: "/invite-revocations?limit=2",
    });
    const body = res.json() as {
      count: number;
      inviteRevocations: Array<{ receivedAt: number }>;
    };
    expect(body.count).toBe(2);
    expect(body.inviteRevocations.map((r) => r.receivedAt)).toEqual([100, 200]);
  });
});

describe("invite_revocations schema migration", () => {
  it("creates the table with the received_at cursor index", () => {
    const cols = db
      .prepare("PRAGMA table_info(invite_revocations)")
      .all() as Array<{ name: string }>;
    const names = cols.map((c) => c.name);
    expect(names).toContain("token");
    expect(names).toContain("inviter_key");
    expect(names).toContain("revoked_at");
    expect(names).toContain("received_at");

    const indexes = db
      .prepare("PRAGMA index_list(invite_revocations)")
      .all() as Array<{ name: string }>;
    expect(indexes.map((i) => i.name)).toContain(
      "invite_revocations_received_at_idx",
    );
  });
});
