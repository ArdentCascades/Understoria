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
  canonicalFounderClaimMessage,
  canonicalInvitePayload,
  canonicalPostPayload,
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

describe("READ_AUTH default", () => {
  it("defaults ON — a bare env gets enforcement, not open feeds", () => {
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
    } as NodeJS.ProcessEnv);
    expect(config.readAuth).toBe("on");
  });

  it("booting enforcement with no founder keys is UNCLAIMED, not a brick", async () => {
    // The old behavior threw at config parse; the claim flow replaces
    // the brick with a node that refuses gated surfaces and waits for
    // its founder (see the founder-claim describe below).
    const a = await serverWith({});
    const res = await a.inject({ method: "GET", url: "/posts" });
    expect(res.statusCode).toBe(401);
    const cfg = await a.inject({ method: "GET", url: "/config" });
    expect(cfg.statusCode).toBe(200);
    expect(cfg.json().claimed).toBe(false);
  });
});

describe("READ_AUTH=off (explicit opt-out)", () => {
  it("leaves the feeds open, exactly as the pre-flip default did", async () => {
    const a = await serverWith({ READ_AUTH: "off" });
    const res = await a.inject({ method: "GET", url: "/posts" });
    expect(res.statusCode).toBe(200);
  });
});

describe("READ_AUTH=on", () => {

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

  it("a malformed body (no attributable key) falls through to shape validation", async () => {
    // The write gate reads the surface's key field opportunistically —
    // a body without one is the route's own 400, never a second
    // body-shape contract enforced at the gate.
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

/** A fully valid, self-signed post — the exact artifact the write
 *  gate exists to stop when its author is not a member: it passes
 *  shape validation AND signature verification. */
function signedPost(poster: KeyPair, id: string) {
  const immutable = {
    id,
    type: "NEED" as const,
    category: "transport" as const,
    title: "Help wanted",
    description: "",
    estimatedHours: 1,
    urgency: "medium" as const,
    postedBy: poster.publicKey,
    createdAt: Date.now(),
    expiresAt: null,
    locationZone: "z",
    nodeId: "node_test",
  };
  return {
    ...immutable,
    signature: sign(canonicalPostPayload(immutable), poster.secretKey),
  };
}

describe("write-membership gate (the write half of READ_AUTH=on)", () => {
  it("READ_AUTH=off keeps the pre-gate behavior: a stranger's valid record lands", async () => {
    // The explicit opt-out posture: an operator who turned
    // enforcement off gets exactly the old open-writes node.
    const stranger = generateKeyPair();
    const a = await serverWith({ READ_AUTH: "off" });
    const res = await a.inject({
      method: "POST",
      url: "/posts",
      payload: signedPost(stranger, "p_off_1"),
    });
    expect(res.statusCode).toBe(201);
  });

  it("READ_AUTH=on refuses a stranger's VALID self-signed record with 403 not_a_member", async () => {
    // The core gap: signature validity proves key possession, not
    // membership. Before the gate this landed with 201 and federated.
    const founder = generateKeyPair();
    const stranger = generateKeyPair();
    const a = await serverWith({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
    });
    const res = await a.inject({
      method: "POST",
      url: "/posts",
      payload: signedPost(stranger, "p_gate_1"),
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().error).toBe("not_a_member");
  });

  it("a founder's and a receipt-chained member's writes land", async () => {
    const founder = generateKeyPair();
    const invitee = generateKeyPair();
    const a = await serverWith({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
    });

    const founderPost = await a.inject({
      method: "POST",
      url: "/posts",
      payload: signedPost(founder, "p_founder"),
    });
    expect(founderPost.statusCode).toBe(201);

    // Invitee is a stranger until their receipt lands…
    const early = await a.inject({
      method: "POST",
      url: "/posts",
      payload: signedPost(invitee, "p_early"),
    });
    expect(early.statusCode).toBe(403);

    // …and a member immediately after.
    const receipt = await a.inject({
      method: "POST",
      url: "/redemptions",
      payload: makeReceipt(founder, invitee),
    });
    expect(receipt.statusCode).toBe(201);
    const after = await a.inject({
      method: "POST",
      url: "/posts",
      payload: signedPost(invitee, "p_after"),
    });
    expect(after.statusCode).toBe(201);
  });

  it("/redemptions stays open under enforcement — it IS the joining ceremony", async () => {
    // Covered implicitly above (the receipt landed while the gate was
    // on), but locked in on its own: gating /redemptions on
    // membership would weld the front door shut, since the redeemer
    // is by definition not yet a member.
    const founder = generateKeyPair();
    const invitee = generateKeyPair();
    const a = await serverWith({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
    });
    const res = await a.inject({
      method: "POST",
      url: "/redemptions",
      payload: makeReceipt(founder, invitee),
    });
    expect(res.statusCode).toBe(201);
  });

  it("gates the other attributable surfaces too (vouches as the sample)", async () => {
    // The gate rides the shared SURFACES map, so /posts standing in
    // for the mechanism is fine — but pin one more surface so a
    // future refactor that narrows the map's coverage fails a test.
    const founder = generateKeyPair();
    const stranger = generateKeyPair();
    const a = await serverWith({
      READ_AUTH: "on",
      NODE_FOUNDER_KEYS: founder.publicKey,
    });
    const res = await a.inject({
      method: "POST",
      url: "/vouches",
      payload: { voucherKey: stranger.publicKey, nonsense: true },
    });
    // 403 from the gate — never reaches the route's shape validation.
    expect(res.statusCode).toBe(403);
    expect(res.json().error).toBe("not_a_member");
  });
});

describe("first-run founder claim (POST /claim-founder)", () => {
  function signedClaim(member: KeyPair, setupToken: string, ts = Date.now()) {
    return {
      publicKey: member.publicKey,
      setupToken,
      ts,
      signature: sign(
        canonicalFounderClaimMessage(member.publicKey, setupToken, ts),
        member.secretKey,
      ),
    };
  }

  it("full ceremony: unclaimed → claim with the setup code → founder reads and writes", async () => {
    const founder = generateKeyPair();
    const a = await serverWith({ SETUP_TOKEN: "test-setup-code-1234" });

    // Unclaimed: gated surfaces refuse even the future founder.
    const before = await a.inject({
      method: "GET",
      url: "/posts",
      headers: readHeaders(founder, "/posts"),
    });
    expect(before.statusCode).toBe(403); // signed fine, but nobody is a member yet

    const claim = await a.inject({
      method: "POST",
      url: "/claim-founder",
      payload: signedClaim(founder, "test-setup-code-1234"),
    });
    expect(claim.statusCode).toBe(201);
    expect(claim.json().claimed).toBe(true);

    // /config now reports the node claimed…
    const cfg = await a.inject({ method: "GET", url: "/config" });
    expect(cfg.json().claimed).toBe(true);

    // …and the founder is a member for reads AND writes, no restart.
    const read = await a.inject({
      method: "GET",
      url: "/posts",
      headers: readHeaders(founder, "/posts"),
    });
    expect(read.statusCode).toBe(200);
    const write = await a.inject({
      method: "POST",
      url: "/posts",
      payload: signedPost(founder, "p_claimed"),
    });
    expect(write.statusCode).toBe(201);
  });

  it("refuses a wrong setup code with 401, without leaking timing structure", async () => {
    const mallory = generateKeyPair();
    const a = await serverWith({ SETUP_TOKEN: "test-setup-code-1234" });
    const res = await a.inject({
      method: "POST",
      url: "/claim-founder",
      payload: signedClaim(mallory, "wrong-code-entirely"),
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe("bad_setup_token");
  });

  it("is one-shot: a second claim answers 409 even with the right code", async () => {
    const founder = generateKeyPair();
    const mallory = generateKeyPair();
    const a = await serverWith({ SETUP_TOKEN: "test-setup-code-1234" });
    await a.inject({
      method: "POST",
      url: "/claim-founder",
      payload: signedClaim(founder, "test-setup-code-1234"),
    });
    const second = await a.inject({
      method: "POST",
      url: "/claim-founder",
      payload: signedClaim(mallory, "test-setup-code-1234"),
    });
    expect(second.statusCode).toBe(409);
    expect(second.json().error).toBe("already_claimed");
  });

  it("a node with env founder keys was never claimable", async () => {
    const founder = generateKeyPair();
    const mallory = generateKeyPair();
    const a = await serverWith({
      NODE_FOUNDER_KEYS: founder.publicKey,
      SETUP_TOKEN: "test-setup-code-1234",
    });
    const res = await a.inject({
      method: "POST",
      url: "/claim-founder",
      payload: signedClaim(mallory, "test-setup-code-1234"),
    });
    expect(res.statusCode).toBe(409);
  });

  it("refuses a stale or forged claim (timestamp window, signature binding)", async () => {
    const founder = generateKeyPair();
    const mallory = generateKeyPair();
    const a = await serverWith({ SETUP_TOKEN: "test-setup-code-1234" });

    const stale = await a.inject({
      method: "POST",
      url: "/claim-founder",
      payload: signedClaim(
        founder,
        "test-setup-code-1234",
        Date.now() - 11 * 60 * 1000,
      ),
    });
    expect(stale.statusCode).toBe(401);
    expect(stale.json().error).toBe("stale_claim");

    // A captured claim body with the KEY swapped: mallory presents
    // founder's signature under their own key — the signature no
    // longer verifies, so possession of the code alone (e.g. a
    // network observer of the claim) cannot install a different key.
    const legit = signedClaim(founder, "test-setup-code-1234");
    const swapped = await a.inject({
      method: "POST",
      url: "/claim-founder",
      payload: { ...legit, publicKey: mallory.publicKey },
    });
    expect(swapped.statusCode).toBe(422);
    expect(swapped.json().error).toBe("bad_signature");
  });

  it("claiming admits the founder's invite chain — the community grows normally", async () => {
    const founder = generateKeyPair();
    const invitee = generateKeyPair();
    const a = await serverWith({ SETUP_TOKEN: "test-setup-code-1234" });
    await a.inject({
      method: "POST",
      url: "/claim-founder",
      payload: signedClaim(founder, "test-setup-code-1234"),
    });
    const receipt = await a.inject({
      method: "POST",
      url: "/redemptions",
      payload: makeReceipt(founder, invitee),
    });
    expect(receipt.statusCode).toBe(201);
    const read = await a.inject({
      method: "GET",
      url: "/exchanges",
      headers: readHeaders(invitee, "/exchanges"),
    });
    expect(read.statusCode).toBe(200);
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
