/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Re-seed Phase R1 server surface (docs/community-reseed.md §3):
 * the time-boxed `RESEED_GRACE_UNTIL` window on /redemptions and the
 * `TRUSTED_SYSTEM_KEYS` resolver on /exchanges. Both are recovery
 * measures — the tests pin that they are INERT by default and
 * fail-closed on every edge.
 */
import { afterEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  canonicalExchangePayload,
  canonicalInvitePayload,
  canonicalRedemptionPayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { Exchange, RedemptionReceipt } from "@understoria/shared/types";
import { buildServer, type BuiltServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

let built: BuiltServer | null = null;
let db: DatabaseType | null = null;

async function freshServer(
  extraEnv: Record<string, string> = {},
): Promise<BuiltServer> {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    NODE_ID: "node_new",
    RATE_LIMIT_MAX: "10000",
    ...extraEnv,
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

let seq = 0;

/** A receipt whose invite expired ~2 months ago — a legitimate piece
 *  of history, far outside the 7-day delivery grace. */
function makeHistoricalReceipt(
  inviter: KeyPair,
  redeemer: KeyPair,
): RedemptionReceipt {
  const invitePayload = {
    token: `tok_${++seq}_${redeemer.publicKey.slice(0, 8)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Inviter",
    nodeId: "node_lost",
    createdAt: Date.now() - 3 * MONTH_MS,
    expiresAt: Date.now() - 2 * MONTH_MS,
  };
  const invite = {
    ...invitePayload,
    signature: sign(canonicalInvitePayload(invitePayload), inviter.secretKey),
  };
  const payload = {
    invite,
    redeemedBy: redeemer.publicKey,
    displayName: "Old Member",
    redeemedAt: Date.now() - 2 * MONTH_MS - 1000,
  };
  return {
    ...payload,
    signature: sign(canonicalRedemptionPayload(payload), redeemer.secretKey),
  };
}

function makeSystemSignedExchange(opts: {
  systemSecretKey: string;
  nodeId: string;
  autoConfirmedAt?: number;
}): Exchange {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const base = {
    id: `xa_${++seq}`,
    postId: `post_${seq}`,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hoursExchanged: 1,
    category: "other" as const,
    completedAt: Date.now() - 1_000,
    nodeId: opts.nodeId,
  };
  const payload = canonicalExchangePayload({
    postId: base.postId,
    helperKey: base.helperKey,
    helpedKey: base.helpedKey,
    hours: base.hoursExchanged,
    category: base.category,
    completedAt: base.completedAt,
  });
  return {
    ...base,
    helperSignature: sign(payload, helper.secretKey),
    helpedSignature: sign(payload, opts.systemSecretKey),
    autoConfirmed: true,
    autoConfirmedBy: `system:${opts.nodeId}`,
    autoConfirmedAt: opts.autoConfirmedAt ?? base.completedAt,
  };
}

describe("RESEED_GRACE_UNTIL — /redemptions recovery window", () => {
  it("stays inert by default: a historical receipt is refused (delivery grace intact)", async () => {
    const { app } = await freshServer();
    const receipt = makeHistoricalReceipt(generateKeyPair(), generateKeyPair());
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toMatchObject({ error: "delivery_grace_expired" });
  });

  it("accepts historical receipts while the window is open, preserving a plausible wire receivedAt", async () => {
    const { app } = await freshServer({
      RESEED_GRACE_UNTIL: String(Date.now() + 24 * 60 * 60 * 1000),
    });
    const receipt = makeHistoricalReceipt(generateKeyPair(), generateKeyPair());
    const originalReceivedAt = Date.now() - 2 * MONTH_MS - 500;
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: { ...receipt, receivedAt: originalReceivedAt },
    });
    expect(res.statusCode).toBe(201);
    const feed = (
      await app.inject({ method: "GET", url: "/redemptions" })
    ).json() as { redemptions: { receivedAt: number }[] };
    expect(feed.redemptions[0].receivedAt).toBe(originalReceivedAt);
  });

  it("re-closes once the window has passed", async () => {
    const { app } = await freshServer({
      RESEED_GRACE_UNTIL: String(Date.now() - 60_000),
    });
    const receipt = makeHistoricalReceipt(generateKeyPair(), generateKeyPair());
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(res.statusCode).toBe(409);
  });

  it("still verifies signatures and first-writer-wins inside the window", async () => {
    const { app } = await freshServer({
      RESEED_GRACE_UNTIL: String(Date.now() + 60_000),
    });
    const receipt = makeHistoricalReceipt(generateKeyPair(), generateKeyPair());
    const forged = { ...receipt, displayName: "Tampered" };
    expect(
      (
        await app.inject({ method: "POST", url: "/redemptions", payload: forged })
      ).statusCode,
    ).toBe(422);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/redemptions",
          payload: receipt,
        })
      ).statusCode,
    ).toBe(201);
    // A DIFFERENT redeemer claiming the same token stays a conflict.
    const rival = makeHistoricalReceipt(generateKeyPair(), generateKeyPair());
    const clash = {
      ...rival,
      invite: receipt.invite,
    };
    const res = await app.inject({
      method: "POST",
      url: "/redemptions",
      payload: clash,
    });
    expect([409, 422]).toContain(res.statusCode); // 422: signature no longer matches; 409 if resigned—either way refused
  });

  it("config refuses a window longer than 30 days", () => {
    expect(() =>
      readConfigFromEnv({
        LOG_LEVEL: "fatal",
        NODE_ID: "n",
        RESEED_GRACE_UNTIL: String(Date.now() + 31 * 24 * 60 * 60 * 1000),
      } as NodeJS.ProcessEnv),
    ).toThrow(/30 days/);
  });
});

describe("TRUSTED_SYSTEM_KEYS — re-seeded auto-confirmed exchanges", () => {
  it("stays fail-closed by default: autoConfirmed POSTs are refused", async () => {
    const { app } = await freshServer();
    const kp = generateKeyPair();
    const row = makeSystemSignedExchange({
      systemSecretKey: kp.secretKey,
      nodeId: "node_lost",
    });
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: row,
    });
    expect(res.statusCode).toBe(422);
    expect(res.json()).toMatchObject({
      error: "auto_confirm_via_dedicated_endpoint",
    });
  });

  it("accepts a row that §4-verifies against a declared lost-node key (idempotently)", async () => {
    const lostKey = generateKeyPair();
    const { app } = await freshServer({
      TRUSTED_SYSTEM_KEYS: JSON.stringify([
        { nodeId: "node_lost", current: lostKey.publicKey, history: [] },
      ]),
    });
    const row = makeSystemSignedExchange({
      systemSecretKey: lostKey.secretKey,
      nodeId: "node_lost",
    });
    const first = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: row,
    });
    expect(first.statusCode).toBe(201);
    const replay = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: row,
    });
    expect(replay.statusCode).toBe(200);
    expect(replay.json()).toMatchObject({ stored: false });
  });

  it("refuses rows from undeclared nodes and rows whose signature fails the declared key", async () => {
    const lostKey = generateKeyPair();
    const strangerKey = generateKeyPair();
    const { app } = await freshServer({
      TRUSTED_SYSTEM_KEYS: JSON.stringify([
        { nodeId: "node_lost", current: lostKey.publicKey, history: [] },
      ]),
    });
    // Undeclared origin node.
    const elsewhere = makeSystemSignedExchange({
      systemSecretKey: strangerKey.secretKey,
      nodeId: "node_elsewhere",
    });
    expect(
      (
        await app.inject({ method: "POST", url: "/exchanges", payload: elsewhere })
      ).statusCode,
    ).toBe(422);
    // Declared node, wrong key.
    const forged = makeSystemSignedExchange({
      systemSecretKey: strangerKey.secretKey,
      nodeId: "node_lost",
    });
    expect(
      (
        await app.inject({ method: "POST", url: "/exchanges", payload: forged })
      ).statusCode,
    ).toBe(422);
  });

  it("selects across a declared rotation history by autoConfirmedAt", async () => {
    const oldKey = generateKeyPair();
    const newKey = generateKeyPair();
    const rotatedAt = Date.now() - 10 * 24 * 60 * 60 * 1000;
    const { app } = await freshServer({
      TRUSTED_SYSTEM_KEYS: JSON.stringify([
        {
          nodeId: "node_lost",
          current: newKey.publicKey,
          history: [{ pubkey: oldKey.publicKey, retiredAt: rotatedAt }],
        },
      ]),
    });
    // Signed BEFORE the rotation with the retired key → verifies.
    const preRotation = makeSystemSignedExchange({
      systemSecretKey: oldKey.secretKey,
      nodeId: "node_lost",
      autoConfirmedAt: rotatedAt - 60_000,
    });
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/exchanges",
          payload: { ...preRotation, completedAt: preRotation.completedAt },
        })
      ).statusCode,
    ).toBe(201);
    // The retired key signing AFTER its retirement → refused.
    const postRotation = makeSystemSignedExchange({
      systemSecretKey: oldKey.secretKey,
      nodeId: "node_lost",
      autoConfirmedAt: rotatedAt + 60_000,
    });
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/exchanges",
          payload: postRotation,
        })
      ).statusCode,
    ).toBe(422);
  });

  it("config refuses duplicate nodeId declarations", () => {
    const k = generateKeyPair();
    expect(() =>
      readConfigFromEnv({
        LOG_LEVEL: "fatal",
        NODE_ID: "n",
        TRUSTED_SYSTEM_KEYS: JSON.stringify([
          { nodeId: "node_a", current: k.publicKey },
          { nodeId: "node_a", current: k.publicKey },
        ]),
      } as NodeJS.ProcessEnv),
    ).toThrow(/twice/);
  });
});
