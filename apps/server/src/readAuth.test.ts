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
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3-multiple-ciphers";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  canonicalInvitePayload,
  canonicalReadAuthMessage,
  canonicalRedemptionPayload,
  generateKeyPair,
  sign,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { RedemptionReceipt } from "@understoria/shared/types";
import { buildServer } from "./server.js";
import { readConfigFromEnv } from "./config.js";
import { openDatabase } from "./db.js";

let app: FastifyInstance | null = null;
let db: DatabaseType | null = null;

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
    NODE_ID: "node_test",
    RATE_LIMIT_MAX: "10000",
    ...env,
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  await app.ready();
  return app;
}

function readHeaders(member: KeyPair, pathWithQuery: string, ts = Date.now()) {
  return {
    "x-understoria-key": member.publicKey,
    "x-understoria-ts": String(ts),
    "x-understoria-sig": sign(
      canonicalReadAuthMessage(pathWithQuery, ts),
      member.secretKey,
    ),
  };
}

/** A verified receipt admitting `redeemer`, invited by `inviter`. */
function makeReceipt(inviter: KeyPair, redeemer: KeyPair): RedemptionReceipt {
  const invitePayload = {
    token: `tok_${redeemer.publicKey.slice(0, 8)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Inviter",
    nodeId: "node_test",
    createdAt: Date.now() - 1000,
    expiresAt: Date.now() + 86_400_000,
  };
  const invite = {
    ...invitePayload,
    signature: sign(canonicalInvitePayload(invitePayload), inviter.secretKey),
  };
  const payload = {
    invite,
    redeemedBy: redeemer.publicKey,
    displayName: "New Member",
    redeemedAt: Date.now(),
  };
  return {
    ...payload,
    signature: sign(canonicalRedemptionPayload(payload), redeemer.secretKey),
  };
}

describe("READ_AUTH=off (default)", () => {
  it("leaves the feeds open, exactly as before", async () => {
    const a = await serverWith({});
    const res = await a.inject({ method: "GET", url: "/posts" });
    expect(res.statusCode).toBe(200);
  });
});

describe("READ_AUTH=on", () => {
  it("refuses to boot without founder keys", () => {
    expect(() =>
      readConfigFromEnv({
        READ_AUTH: "on",
      } as NodeJS.ProcessEnv),
    ).toThrow(/NODE_FOUNDER_KEYS/);
  });

  it("401s unsigned reads and 200s a founder-signed read", async () => {
    const founder = generateKeyPair();
    const a = await serverWith({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
    });

    const bare = await a.inject({ method: "GET", url: "/posts" });
    expect(bare.statusCode).toBe(401);
    expect(bare.json().error).toBe("member_read_required");

    const signed = await a.inject({
      method: "GET",
      url: "/posts?limit=10",
      headers: readHeaders(founder, "/posts?limit=10"),
    });
    expect(signed.statusCode).toBe(200);
  });

  it("admits a member via the redemption-receipt chain; refuses strangers", async () => {
    const founder = generateKeyPair();
    const invitee = generateKeyPair();
    const grandInvitee = generateKeyPair();
    const stranger = generateKeyPair();
    const a = await serverWith({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
    });

    // founder -> invitee -> grandInvitee, receipts landing via the
    // ordinary unauthenticated POST route (writes never needed auth;
    // the receipts themselves are the membership proof).
    for (const receipt of [
      makeReceipt(founder, invitee),
      makeReceipt(invitee, grandInvitee),
    ]) {
      const posted = await a.inject({
        method: "POST",
        url: "/redemptions",
        payload: receipt,
      });
      expect(posted.statusCode).toBe(201);
    }

    for (const member of [invitee, grandInvitee]) {
      const res = await a.inject({
        method: "GET",
        url: "/exchanges",
        headers: readHeaders(member, "/exchanges"),
      });
      expect(res.statusCode).toBe(200);
    }

    const refused = await a.inject({
      method: "GET",
      url: "/exchanges",
      headers: readHeaders(stranger, "/exchanges"),
    });
    expect(refused.statusCode).toBe(403);
    expect(refused.json().error).toBe("not_a_member");
  });

  it("a receipt chain with no path to a founder admits nobody", async () => {
    const founder = generateKeyPair();
    const fakeA = generateKeyPair();
    const fakeB = generateKeyPair();
    const a = await serverWith({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
    });
    // Two invented keys attesting each other — stored fine, but the
    // closure never reaches them.
    await a.inject({
      method: "POST",
      url: "/redemptions",
      payload: makeReceipt(fakeA, fakeB),
    });
    const res = await a.inject({
      method: "GET",
      url: "/posts",
      headers: readHeaders(fakeB, "/posts"),
    });
    expect(res.statusCode).toBe(403);
  });

  it("rejects stale timestamps and signatures over a different path", async () => {
    const founder = generateKeyPair();
    const a = await serverWith({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
    });

    const stale = await a.inject({
      method: "GET",
      url: "/posts",
      headers: readHeaders(founder, "/posts", Date.now() - 11 * 60 * 1000),
    });
    expect(stale.statusCode).toBe(401);
    expect(stale.json().error).toBe("stale_read_signature");

    // Signature captured for /posts must not open /exchanges.
    const replayed = await a.inject({
      method: "GET",
      url: "/exchanges",
      headers: readHeaders(founder, "/posts"),
    });
    expect(replayed.statusCode).toBe(401);
    expect(replayed.json().error).toBe("bad_read_signature");
  });

  it("keeps the pre-membership surfaces open", async () => {
    const founder = generateKeyPair();
    const a = await serverWith({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
    });
    for (const url of ["/health", "/config", "/link-request"]) {
      const res = await a.inject({ method: "GET", url });
      expect(res.statusCode).not.toBe(401);
      expect(res.statusCode).not.toBe(403);
    }
  });

  it("does not gate POSTs (writes carry their own signatures)", async () => {
    const founder = generateKeyPair();
    const a = await serverWith({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
    });
    const res = await a.inject({
      method: "POST",
      url: "/posts",
      payload: { nonsense: true },
    });
    expect(res.statusCode).toBe(400); // shape-rejected, not auth-rejected
  });

  it("accepts a configured peer bearer token and refuses others", async () => {
    const founder = generateKeyPair();
    const a = await serverWith({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
      PEER_READ_TOKENS: JSON.stringify({
        "https://peer.example": "sharedpeertoken123",
      }),
    });
    const ok = await a.inject({
      method: "GET",
      url: "/events",
      headers: { authorization: "Bearer sharedpeertoken123" },
    });
    expect(ok.statusCode).toBe(200);
    const bad = await a.inject({
      method: "GET",
      url: "/events",
      headers: { authorization: "Bearer wrongtoken1234567" },
    });
    expect(bad.statusCode).toBe(401);
  });
});

describe("DATABASE_KEY encryption at rest", () => {
  it("keyed database round-trips; the file is unreadable without the key", () => {
    const dir = mkdtempSync(join(tmpdir(), "understoria-enc-"));
    const path = join(dir, "enc.db");
    try {
      const keyed = openDatabase(path, "correct horse battery");
      keyed
        .prepare(
          "INSERT INTO meta (key, value) VALUES ('canary', 'plaintext-canary')",
        )
        .run();
      keyed.close();

      // Reopen WITH the key: readable.
      const reopened = openDatabase(path, "correct horse battery");
      expect(
        (
          reopened
            .prepare("SELECT value FROM meta WHERE key = 'canary'")
            .get() as { value: string }
        ).value,
      ).toBe("plaintext-canary");
      reopened.close();

      // Reopen WITHOUT the key: SQLITE_NOTADB before any row is read.
      expect(() => {
        const naked = new Database(path);
        try {
          naked.prepare("SELECT * FROM meta").get();
        } finally {
          naked.close();
        }
      }).toThrow();

      // And the raw bytes carry no plaintext.
      expect(readFileSync(path).includes("plaintext-canary")).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
