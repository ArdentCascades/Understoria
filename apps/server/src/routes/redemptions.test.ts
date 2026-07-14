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
  canonicalInvitePayload,
  canonicalRedemptionPayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  RedemptionReceipt,
  SignedInvite,
} from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { createRedemptionStore, openDatabase } from "../db.js";
import { REDEMPTION_DELIVERY_GRACE_MS } from "./redemptions.js";

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

function makeSignedInvite(opts: {
  inviter?: KeyPair;
  createdAt?: number;
  expiresAt?: number;
  token?: string;
} = {}): { invite: SignedInvite; inviter: KeyPair } {
  const inviter = opts.inviter ?? generateKeyPair();
  const createdAt = opts.createdAt ?? Date.now();
  const payload = {
    token:
      opts.token ?? `tok_${createdAt}_${Math.random().toString(36).slice(2)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Rosa",
    nodeId: "node_test",
    createdAt,
    expiresAt: opts.expiresAt ?? createdAt + 14 * 24 * 60 * 60 * 1000,
  };
  return {
    invite: {
      ...payload,
      signature: sign(canonicalInvitePayload(payload), inviter.secretKey),
    },
    inviter,
  };
}

function makeReceipt(opts: {
  invite?: SignedInvite;
  redeemer?: KeyPair;
  displayName?: string;
  redeemedAt?: number;
} = {}): { receipt: RedemptionReceipt; redeemer: KeyPair } {
  const invite = opts.invite ?? makeSignedInvite().invite;
  const redeemer = opts.redeemer ?? generateKeyPair();
  const payload = {
    invite,
    redeemedBy: redeemer.publicKey,
    displayName: opts.displayName ?? "Newcomer",
    redeemedAt: opts.redeemedAt ?? Date.now(),
  };
  return {
    receipt: {
      ...payload,
      signature: sign(canonicalRedemptionPayload(payload), redeemer.secretKey),
    },
    redeemer,
  };
}

describe("POST /redemptions", () => {
  it("stores a valid receipt (201) and serves it back on GET", async () => {
    const { receipt } = makeReceipt();
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, token: receipt.invite.token });

    const list = await app.inject({ method: "GET", url: "/redemptions" });
    expect(list.statusCode).toBe(200);
    const body = list.json() as {
      count: number;
      redemptions: Array<RedemptionReceipt & { receivedAt: number }>;
    };
    expect(body.count).toBe(1);
    expect(body.redemptions[0].invite.token).toBe(receipt.invite.token);
    expect(body.redemptions[0].redeemedBy).toBe(receipt.redeemedBy);
    expect(body.redemptions[0].displayName).toBe("Newcomer");
    // The server-assigned cursor rides on every row.
    expect(typeof body.redemptions[0].receivedAt).toBe("number");
  });

  it("is idempotent for a byte-identical replay (200, same redeemedBy)", async () => {
    const { receipt } = makeReceipt();
    const first = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(first.statusCode).toBe(201);
    const replay = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(replay.statusCode).toBe(200);
    expect(replay.json()).toEqual({
      stored: false,
      token: receipt.invite.token,
    });
  });

  it("rejects a second receipt for the same token by a DIFFERENT member (409 first-writer-wins — the single-use enforcement)", async () => {
    const { invite } = makeSignedInvite();
    const winner = makeReceipt({ invite, displayName: "First" });
    const loser = makeReceipt({ invite, displayName: "Second" });
    expect(winner.receipt.redeemedBy).not.toBe(loser.receipt.redeemedBy);

    const first = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: winner.receipt,
    });
    expect(first.statusCode).toBe(201);
    const second = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: loser.receipt,
    });
    expect(second.statusCode).toBe(409);
    expect(second.json()).toEqual({ error: "token_already_redeemed" });

    // The winner's row is untouched.
    const list = await app.inject({ method: "GET", url: "/redemptions" });
    const body = list.json() as {
      count: number;
      redemptions: Array<{ redeemedBy: string }>;
    };
    expect(body.count).toBe(1);
    expect(body.redemptions[0].redeemedBy).toBe(winner.receipt.redeemedBy);
  });

  it("rejects a malformed body (400)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: { hello: "world" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("invalid_body");
  });

  it("rejects a displayName over 60 characters (400)", async () => {
    const { receipt } = makeReceipt({ displayName: "x".repeat(61) });
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a tampered outer signature (422)", async () => {
    const { receipt } = makeReceipt();
    const tampered = { ...receipt, displayName: "Impostor" };
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: tampered,
    });
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({ error: "invalid_receipt" });
  });

  it("rejects a receipt whose embedded invite signature does not verify (422)", async () => {
    const { invite } = makeSignedInvite();
    const forgedInvite: SignedInvite = {
      ...invite,
      inviterName: "Someone Else",
    };
    const { receipt } = makeReceipt({ invite: forgedInvite });
    // The OUTER signature is honest (covers the forged invite), but
    // the embedded invite no longer verifies against inviterKey — a
    // fabricated admission must fail.
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects a self-redeem receipt (422)", async () => {
    const inviter = generateKeyPair();
    const { invite } = makeSignedInvite({ inviter });
    const { receipt } = makeReceipt({ invite, redeemer: inviter });
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects a receipt whose redeemedAt is past the invite's expiry (422)", async () => {
    const now = Date.now();
    const { invite } = makeSignedInvite({
      createdAt: now - 15 * 24 * 60 * 60 * 1000,
      expiresAt: now - 24 * 60 * 60 * 1000,
    });
    const { receipt } = makeReceipt({ invite, redeemedAt: now });
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(res.statusCode).toBe(422);
  });

  it("accepts a receipt arriving after expiry but within the delivery grace (offline redeemer)", async () => {
    // Redeemed on day 13 (before expiry), delivered on ~day 16 — the
    // "node configured later" case §7's grace window exists for.
    const now = Date.now();
    const createdAt = now - 16 * 24 * 60 * 60 * 1000;
    const expiresAt = now - 2 * 24 * 60 * 60 * 1000;
    const { invite } = makeSignedInvite({ createdAt, expiresAt });
    const { receipt } = makeReceipt({
      invite,
      redeemedAt: expiresAt - 60 * 60 * 1000,
    });
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(res.statusCode).toBe(201);
  });

  it("rejects a receipt arriving after expiry PLUS the grace window (409)", async () => {
    const now = Date.now();
    const expiresAt = now - REDEMPTION_DELIVERY_GRACE_MS - 60 * 60 * 1000;
    const { invite } = makeSignedInvite({
      createdAt: expiresAt - 14 * 24 * 60 * 60 * 1000,
      expiresAt,
    });
    const { receipt } = makeReceipt({
      invite,
      redeemedAt: expiresAt - 60 * 60 * 1000,
    });
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: "delivery_grace_expired" });
  });

  it("stays idempotent (200) for a stored receipt replayed after the grace window lapsed", async () => {
    // Store while inside the grace, then replay conceptually later:
    // the token-match check runs before the grace check, so the
    // replay is a 200, never a spurious 409.
    const now = Date.now();
    const expiresAt = now - REDEMPTION_DELIVERY_GRACE_MS + 60 * 60 * 1000;
    const { invite } = makeSignedInvite({
      createdAt: expiresAt - 14 * 24 * 60 * 60 * 1000,
      expiresAt,
    });
    const { receipt } = makeReceipt({
      invite,
      redeemedAt: expiresAt - 60 * 60 * 1000,
    });
    const first = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(first.statusCode).toBe(201);
    const replay = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(replay.statusCode).toBe(200);
  });
});

describe("GET /redemptions — receivedAt cursor", () => {
  it("pages ascending on the server-assigned receivedAt, not redeemedAt", async () => {
    const store = createRedemptionStore(db);
    // Deliberately inverted: the row that ARRIVED later carries the
    // EARLIER client-claimed redeemedAt. A redeemedAt cursor would
    // strand it (§7's rationale); the receivedAt cursor must not.
    const early = makeReceipt({ redeemedAt: Date.now() - 1000 }).receipt;
    const late = makeReceipt({ redeemedAt: Date.now() - 500_000 }).receipt;
    store.insert(early, 1_000);
    store.insert(late, 2_000);

    const all = await app.inject({ method: "GET", url: "/redemptions" });
    const body = all.json() as {
      redemptions: Array<{ receivedAt: number }>;
    };
    expect(body.redemptions.map((r) => r.receivedAt)).toEqual([1_000, 2_000]);

    // `since` is INCLUSIVE — a row sharing the cursor timestamp is
    // re-served so a tie at a page boundary can never be lost;
    // pullers merge idempotently by token, so re-served rows are
    // no-ops. Same contract as the exchanges GET.
    const afterFirst = await app.inject({
      method: "GET",
      url: "/redemptions?since=1001",
    });
    const page = afterFirst.json() as {
      count: number;
      redemptions: Array<RedemptionReceipt & { receivedAt: number }>;
    };
    expect(page.count).toBe(1);
    expect(page.redemptions[0].invite.token).toBe(late.invite.token);

    const atBoundary = await app.inject({
      method: "GET",
      url: "/redemptions?since=2000",
    });
    const boundaryPage = atBoundary.json() as { count: number };
    expect(boundaryPage.count).toBe(1);

    const afterAll = await app.inject({
      method: "GET",
      url: "/redemptions?since=2001",
    });
    expect((afterAll.json() as { count: number }).count).toBe(0);
  });

  it("honors limit", async () => {
    const store = createRedemptionStore(db);
    for (let i = 1; i <= 3; i++) {
      store.insert(makeReceipt().receipt, i * 100);
    }
    const res = await app.inject({
      method: "GET",
      url: "/redemptions?limit=2",
    });
    const body = res.json() as {
      count: number;
      redemptions: Array<{ receivedAt: number }>;
    };
    expect(body.count).toBe(2);
    // Ascending from the start — the client resumes from its cursor.
    expect(body.redemptions.map((r) => r.receivedAt)).toEqual([100, 200]);
  });
});

describe("schema v11 migration", () => {
  it("creates the redemptions table with the received_at cursor index", () => {
    const cols = db
      .prepare("PRAGMA table_info(redemptions)")
      .all() as Array<{ name: string }>;
    const names = cols.map((c) => c.name);
    expect(names).toContain("token");
    expect(names).toContain("inviter_name");
    expect(names).toContain("received_at");
  });

  it("drops the invites table and the peer invite cursor column (the removed live-credential surface leaves no schema remnant)", () => {
    const invitesTable = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='invites'",
      )
      .get();
    expect(invitesTable).toBeUndefined();
    const cols = db
      .prepare("PRAGMA table_info(peer_pull_state)")
      .all() as Array<{ name: string }>;
    expect(cols.map((c) => c.name)).not.toContain("last_invite_created_at");
  });
});

describe("removed /invites surface", () => {
  // Removal lock — docs/invite-redemption.md §8 / §10.1: GET /invites
  // returned full SignedInvite rows (token + signature) to any caller,
  // i.e. a live redeemable-link feed the moment anything registered
  // invites. Wire surface that serves live credentials gets removed,
  // not mothballed.
  it("POST /invites is gone (404)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/invites",
      payload: {},
    });
    expect(res.statusCode).toBe(404);
  });

  it("GET /invites is gone (404)", async () => {
    const res = await app.inject({ method: "GET", url: "/invites" });
    expect(res.statusCode).toBe(404);
  });
});
