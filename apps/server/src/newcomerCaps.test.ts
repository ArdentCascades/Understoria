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
import { afterEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  canonicalEventPayload,
  canonicalInvitePayload,
  canonicalRedemptionPayload,
  canonicalVouchPayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  Event,
  EventPayload,
  RedemptionReceipt,
  SignedInvite,
  SignedVouch,
} from "@understoria/shared/types";
import { buildServer } from "./server.js";
import { readConfigFromEnv } from "./config.js";
import { openDatabase } from "./db.js";
import { MIRROR_INTERNAL_HEADER } from "./mirrorPull.js";
import { NEWCOMER_WINDOW_MS } from "./newcomerCaps.js";

// Newcomer daily creation caps (newcomerCaps.ts) — pending authors
// get a per-surface daily budget on the creation surfaces; trusted
// members, founders, mirror replication, founderless nodes and the
// re-seed grace window are all exempt. READ_AUTH stays off so the
// membership write guard never interferes — the cap binds on its own.

let app: FastifyInstance | null = null;
let db: DatabaseType | null = null;
let internalToken = "";

afterEach(async () => {
  if (app) await app.close();
  if (db) db.close();
  app = null;
  db = null;
});

async function serverWith(env: Record<string, string>) {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
    NODE_ID: "node_test",
    RATE_LIMIT_MAX: "10000",
    ...env,
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  internalToken = built.internalBypassToken;
  await app.ready();
  return app;
}

let seq = 0;

function makeInvite(inviter: KeyPair): SignedInvite {
  const payload = {
    token: `tok_${++seq}_${inviter.publicKey.slice(0, 6)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Inviter",
    nodeId: "node_test",
    createdAt: Date.now() - 1000,
    expiresAt: Date.now() + 86_400_000,
  };
  return {
    ...payload,
    signature: sign(canonicalInvitePayload(payload), inviter.secretKey),
  };
}

function makeReceipt(inviter: KeyPair, redeemer: KeyPair): RedemptionReceipt {
  const payload = {
    invite: makeInvite(inviter),
    redeemedBy: redeemer.publicKey,
    displayName: "New Member",
    redeemedAt: Date.now(),
  };
  return {
    ...payload,
    signature: sign(canonicalRedemptionPayload(payload), redeemer.secretKey),
  };
}

function makeVouch(voucher: KeyPair, vouchee: KeyPair): SignedVouch {
  const payload = {
    voucherKey: voucher.publicKey,
    voucheeKey: vouchee.publicKey,
    createdAt: Date.now(),
    kind: "manual" as const,
  };
  return {
    id: `v_${++seq}`,
    ...payload,
    signature: sign(canonicalVouchPayload(payload), voucher.secretKey),
  };
}

function makeSignedEvent(organizer: KeyPair): Event {
  const createdAt = Date.now();
  const payload: EventPayload = {
    id: `ev_${createdAt}_${++seq}_${Math.random().toString(36).slice(2)}`,
    kind: "event",
    title: "Skillshare: Bicycle repair",
    description: "Hands-on basic repairs.",
    category: "skills-exchange",
    startsAt: createdAt + 86_400_000,
    endsAt: null,
    location: "Community room, 3rd floor",
    capacity: null,
    templateId: null,
    createdAt,
    createdBy: organizer.publicKey,
    nodeId: "node_test",
  };
  return {
    ...payload,
    signature: sign(canonicalEventPayload(payload), organizer.secretKey),
  };
}

async function post(url: string, payload: unknown, headers = {}) {
  return app!.inject({ method: "POST", url, payload, headers });
}

/** Admit `redeemer` via `inviter`'s receipt, asserting acceptance. */
async function admit(inviter: KeyPair, redeemer: KeyPair) {
  const res = await post("/redemptions", makeReceipt(inviter, redeemer));
  expect(res.statusCode).toBe(201);
}

describe("newcomer daily caps — pending authors", () => {
  it("caps a pending member's 4th /events of the day at 429", async () => {
    const founder = generateKeyPair();
    const pending = generateKeyPair();
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    // A member (founder's invitee) with only ONE trusted voucher —
    // pending, so the daily budget applies.
    await admit(founder, pending);
    for (let i = 0; i < 3; i++) {
      const res = await post("/events", makeSignedEvent(pending));
      expect(res.statusCode).toBe(201);
    }
    const fourth = await post("/events", makeSignedEvent(pending));
    expect(fourth.statusCode).toBe(429);
    expect(fourth.json()).toEqual({
      error: "newcomer_daily_limit",
      scope: "events",
    });
  });

  it("never caps a trusted author (founder past the pending cap)", async () => {
    const founder = generateKeyPair();
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    for (let i = 0; i < 5; i++) {
      const res = await post("/events", makeSignedEvent(founder));
      expect(res.statusCode).toBe(201);
    }
  });

  it("lifts the cap the moment the same author becomes trusted", async () => {
    const f1 = generateKeyPair();
    const f2 = generateKeyPair();
    const member = generateKeyPair();
    await serverWith({
      NODE_FOUNDER_KEYS: `${f1.publicKey},${f2.publicKey}`,
    });
    await admit(f1, member); // one trusted voucher — still pending
    for (let i = 0; i < 3; i++) {
      expect((await post("/events", makeSignedEvent(member))).statusCode).toBe(
        201,
      );
    }
    expect((await post("/events", makeSignedEvent(member))).statusCode).toBe(
      429,
    );
    // Second trusted voucher lands → member is trusted → the very
    // next write passes, no waiting for the window to roll.
    expect((await post("/vouches", makeVouch(f2, member))).statusCode).toBe(
      201,
    );
    expect((await post("/events", makeSignedEvent(member))).statusCode).toBe(
      201,
    );
  });

  it("mirror-internal replication bypasses the cap", async () => {
    const founder = generateKeyPair();
    const pending = generateKeyPair();
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    await admit(founder, pending);
    for (let i = 0; i < 3; i++) {
      expect((await post("/events", makeSignedEvent(pending))).statusCode).toBe(
        201,
      );
    }
    // Over the budget, but the record was already accepted by
    // another node of this community — convergence wins.
    const res = await post("/events", makeSignedEvent(pending), {
      [MIRROR_INTERNAL_HEADER]: internalToken,
    });
    expect(res.statusCode).toBe(201);
  });

  it("skips entirely on a founderless node", async () => {
    const anyone = generateKeyPair();
    await serverWith({});
    // No trust root ⇒ no one could ever become trusted ⇒ the guard
    // skips (same tolerant posture as the trust gates).
    for (let i = 0; i < 4; i++) {
      const res = await post("/events", makeSignedEvent(anyone));
      expect(res.statusCode).toBe(201);
    }
  });

  it("resets a stale window (25 h old) on the next write", async () => {
    const founder = generateKeyPair();
    const pending = generateKeyPair();
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    await admit(founder, pending);
    // A budget fully spent 25 hours ago on the server clock.
    const staleStart = Date.now() - NEWCOMER_WINDOW_MS - 60 * 60 * 1000;
    db!
      .prepare(
        `INSERT INTO newcomer_daily_writes (author_key, tbl, window_start, count)
          VALUES (?, 'events', ?, 3)`,
      )
      .run(pending.publicKey, staleStart);
    const res = await post("/events", makeSignedEvent(pending));
    expect(res.statusCode).toBe(201);
    const row = db!
      .prepare(
        `SELECT window_start, count FROM newcomer_daily_writes
          WHERE author_key = ? AND tbl = 'events'`,
      )
      .get(pending.publicKey) as { window_start: number; count: number };
    expect(row.count).toBe(1);
    expect(row.window_start).toBeGreaterThan(staleStart);
  });

  it("leaves participation surfaces (/claims) uncapped for pending members", async () => {
    const founder = generateKeyPair();
    const pending = generateKeyPair();
    await serverWith({ NODE_FOUNDER_KEYS: founder.publicKey });
    await admit(founder, pending);
    for (let i = 0; i < 6; i++) {
      const res = await post("/claims", {
        postId: `post_${++seq}`,
        claimerKey: pending.publicKey,
        claimedAt: Date.now(),
        nodeId: "node_test",
      });
      expect(res.statusCode).toBe(201);
    }
  });

  it("NEWCOMER_DAILY_CAPS=off disables the whole guard", async () => {
    const founder = generateKeyPair();
    const pending = generateKeyPair();
    await serverWith({
      NODE_FOUNDER_KEYS: founder.publicKey,
      NEWCOMER_DAILY_CAPS: "off",
    });
    await admit(founder, pending);
    for (let i = 0; i < 4; i++) {
      const res = await post("/events", makeSignedEvent(pending));
      expect(res.statusCode).toBe(201);
    }
  });

  it("skips while the re-seed grace window is open (restores as pending authors)", async () => {
    // docs/community-reseed.md: a recovering node receives members'
    // HISTORY through the public routes without the internal token,
    // and the trust edges that would exempt an author may not have
    // re-arrived yet — the cap must not wedge the restore.
    const founder = generateKeyPair();
    const pending = generateKeyPair();
    await serverWith({
      NODE_FOUNDER_KEYS: founder.publicKey,
      RESEED_GRACE_UNTIL: String(Date.now() + 60 * 60 * 1000),
    });
    await admit(founder, pending);
    for (let i = 0; i < 4; i++) {
      const res = await post("/events", makeSignedEvent(pending));
      expect(res.statusCode).toBe(201);
    }
  });
});
