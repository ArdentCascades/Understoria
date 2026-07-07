/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3-multiple-ciphers";
import {
  canonicalCoOrganizerInvitationPayload,
  canonicalCoOrganizerInvitationResponsePayload,
  canonicalCoOrganizerInvitationRevocationPayload,
  canonicalExchangePayload,
  canonicalPostPayload,
  canonicalTaskCommentPayload,
  canonicalVouchPayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Exchange,
  SignedVouch,
  TaskComment,
} from "@understoria/shared/types";
import type { PostRecord } from "./db.js";
import { buildServer } from "./server.js";
import { readConfigFromEnv } from "./config.js";
import { createExchangeStore, openDatabase } from "./db.js";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;
let db: DatabaseType;

async function freshServer() {
  // Use a fresh shared in-memory DB so the migrations run and the same
  // connection is reused for the lifetime of the test.
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
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

function makeSignedExchange(now = Date.now()): Exchange {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const base = {
    postId: `post_${now}`,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hours: 1.5,
    category: "transport" as const,
    completedAt: now,
  };
  const payload = canonicalExchangePayload(base);
  return {
    id: `ex_${now}`,
    postId: base.postId,
    helperKey: base.helperKey,
    helpedKey: base.helpedKey,
    hoursExchanged: base.hours,
    helperSignature: sign(payload, helper.secretKey),
    helpedSignature: sign(payload, helped.secretKey),
    completedAt: base.completedAt,
    category: base.category,
    nodeId: "node_test",
  };
}

function makeSignedVouch(now = Date.now()): SignedVouch {
  const voucher = generateKeyPair();
  const vouchee = generateKeyPair();
  const payload = {
    voucherKey: voucher.publicKey,
    voucheeKey: vouchee.publicKey,
    createdAt: now,
    kind: "manual" as const,
  };
  return {
    id: `v_${now}`,
    ...payload,
    signature: sign(canonicalVouchPayload(payload), voucher.secretKey),
  };
}

function makeSignedTaskComment(
  overrides: Partial<TaskComment> = {},
): TaskComment {
  const author = generateKeyPair();
  const now = overrides.createdAt ?? Date.now();
  const immutable = {
    id: overrides.id ?? `tc_${now}_${Math.random().toString(36).slice(2)}`,
    projectId: overrides.projectId ?? "proj_test",
    taskId: overrides.taskId ?? "task_test",
    authorKey: overrides.authorKey ?? author.publicKey,
    body: overrides.body ?? "Looks good!",
    createdAt: now,
    nodeId: overrides.nodeId ?? "node_test",
  };
  // When overriding authorKey, we still need the original keypair's
  // secret to produce a valid signature; tests that hand-pick an
  // authorKey are passing one whose secret they don't have, so this
  // helper isn't suitable for those — they should sign manually.
  return {
    ...immutable,
    deletedAt: overrides.deletedAt ?? null,
    signature:
      overrides.signature ??
      sign(canonicalTaskCommentPayload(immutable), author.secretKey),
  };
}

function makeSignedPost(now = Date.now()): PostRecord {
  const poster = generateKeyPair();
  const immutable = {
    id: `p_${now}_${Math.random().toString(36).slice(2)}`,
    type: "NEED" as const,
    category: "transport" as const,
    title: "Help getting to clinic",
    description: "Tuesday morning, downtown.",
    estimatedHours: 1.5,
    urgency: "medium" as const,
    postedBy: poster.publicKey,
    createdAt: now,
    expiresAt: null,
    locationZone: "north",
    nodeId: "node_test",
  };
  return {
    ...immutable,
    signature: sign(canonicalPostPayload(immutable), poster.secretKey),
  };
}

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });
});

describe("POST /exchanges", () => {
  it("accepts and stores a properly-signed exchange (201)", async () => {
    const exchange = makeSignedExchange();
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: exchange,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ stored: true, id: exchange.id });
    expect(createExchangeStore(db).count()).toBe(1);
  });

  it("is idempotent — re-submitting the same exchange returns 200", async () => {
    const exchange = makeSignedExchange();
    const first = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: exchange,
    });
    expect(first.statusCode).toBe(201);
    const second = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: exchange,
    });
    expect(second.statusCode).toBe(200);
    expect(second.json()).toMatchObject({ stored: false, id: exchange.id });
  });

  it("rejects an exchange whose hours were forged after signing (422)", async () => {
    const exchange = makeSignedExchange();
    const tampered = { ...exchange, hoursExchanged: 999 };
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: tampered,
    });
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({ error: "bad_signature" });
  });

  it("rejects a malformed body (400) without touching the verifier", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: { id: "x" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ error: "invalid_body" });
  });

  it("rejects unknown categories at the validation layer", async () => {
    const exchange = makeSignedExchange();
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: { ...exchange, category: "not_a_category" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects completedAt far in the future", async () => {
    const farFuture = Date.now() + 365 * 24 * 60 * 60 * 1000;
    const exchange = makeSignedExchange(farFuture);
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: exchange,
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /exchanges", () => {
  it("returns an empty array on a fresh node", async () => {
    const res = await app.inject({ method: "GET", url: "/exchanges" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ count: 0, exchanges: [] });
  });

  it("returns stored exchanges oldest first (cursor pagination order)", async () => {
    const older = makeSignedExchange(Date.now() - 60_000);
    const newer = makeSignedExchange(Date.now());
    await app.inject({ method: "POST", url: "/exchanges", payload: newer });
    await app.inject({ method: "POST", url: "/exchanges", payload: older });
    const res = await app.inject({ method: "GET", url: "/exchanges" });
    const body = res.json() as { count: number; exchanges: Exchange[] };
    expect(body.count).toBe(2);
    // Oldest first: a cursor-advancing puller that pages through a
    // backlog must receive the backlog bottom-up, or rows past the
    // first page are skipped forever.
    expect(body.exchanges[0].id).toBe(older.id);
    expect(body.exchanges[1].id).toBe(newer.id);
  });

  it("supports ?since= for federation pull (inclusive of the cursor)", async () => {
    const t1 = Date.now() - 60_000;
    const t2 = Date.now();
    const old = makeSignedExchange(t1);
    const fresh = makeSignedExchange(t2);
    await app.inject({ method: "POST", url: "/exchanges", payload: old });
    await app.inject({ method: "POST", url: "/exchanges", payload: fresh });
    // `since` is inclusive: a row sharing the cursor timestamp is
    // re-served (pullers dedup by id) so a tie at a page boundary can
    // never be lost. Anything strictly newer is served as well.
    const res = await app.inject({
      method: "GET",
      url: `/exchanges?since=${t1}`,
    });
    const body = res.json() as { count: number; exchanges: Exchange[] };
    expect(body.count).toBe(2);
    expect(body.exchanges[0].id).toBe(old.id);
    expect(body.exchanges[1].id).toBe(fresh.id);
    const after = await app.inject({
      method: "GET",
      url: `/exchanges?since=${t1 + 1}`,
    });
    const afterBody = after.json() as { count: number; exchanges: Exchange[] };
    expect(afterBody.count).toBe(1);
    expect(afterBody.exchanges[0].id).toBe(fresh.id);
  });

  it("returned rows are independently verifiable", async () => {
    const exchange = makeSignedExchange();
    await app.inject({ method: "POST", url: "/exchanges", payload: exchange });
    const res = await app.inject({ method: "GET", url: "/exchanges" });
    const body = res.json() as { exchanges: Exchange[] };
    const { verifyExchange } = await import("@understoria/shared/crypto");
    expect(verifyExchange(body.exchanges[0])).toBe(true);
  });
});

describe("Security headers", () => {
  it("attaches CSP and frame-deny on a successful response", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    const csp = res.headers["content-security-policy"];
    expect(csp).toBeTruthy();
    expect(String(csp)).toContain("frame-ancestors 'none'");
  });
});

describe("Body size cap", () => {
  it("refuses bodies over the configured limit", async () => {
    // bodyLimit is 64 KB.
    const huge = { id: "x".repeat(70_000) };
    const res = await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: huge,
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

// Re-fix the `db` reference for the count assertion above. That assertion
// uses a *fresh* store to read the count out of the same in-memory DB
// the server is using. Verifies the row really hit the disk path rather
// than living solely in some JS map.
describe("Persistence sanity", () => {
  it("count() reflects rows inserted via POST", async () => {
    const exchange = makeSignedExchange();
    await app.inject({
      method: "POST",
      url: "/exchanges",
      payload: exchange,
    });
    expect(createExchangeStore(db).count()).toBe(1);
  });
});

describe("GET /config", () => {
  it("returns an empty object when no operator info is configured", async () => {
    const res = await app.inject({ method: "GET", url: "/config" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({});
  });
});

describe("POST /vouches", () => {
  it("accepts a well-signed vouch and returns 201", async () => {
    const vouch = makeSignedVouch();
    const res = await app.inject({
      method: "POST",
      url: "/vouches",
      payload: vouch,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: vouch.id });
  });

  it("treats a re-POST of the same vouch id as idempotent", async () => {
    const vouch = makeSignedVouch();
    await app.inject({ method: "POST", url: "/vouches", payload: vouch });
    const res = await app.inject({
      method: "POST",
      url: "/vouches",
      payload: vouch,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ stored: false, id: vouch.id });
  });

  it("rejects a vouch whose signature does not verify", async () => {
    const vouch = { ...makeSignedVouch(), signature: "abc" };
    const res = await app.inject({
      method: "POST",
      url: "/vouches",
      payload: vouch,
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects a malformed body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/vouches",
      payload: { id: "" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects an unknown vouch kind", async () => {
    const v = makeSignedVouch();
    const res = await app.inject({
      method: "POST",
      url: "/vouches",
      payload: { ...v, kind: "automatic" },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /vouches", () => {
  it("returns stored vouches with since= filter respected", async () => {
    const earlier = makeSignedVouch(1_000);
    const later = makeSignedVouch(2_000);
    await app.inject({ method: "POST", url: "/vouches", payload: earlier });
    await app.inject({ method: "POST", url: "/vouches", payload: later });
    const all = await app.inject({ method: "GET", url: "/vouches" });
    expect(all.json().count).toBe(2);
    const since = await app.inject({
      method: "GET",
      url: "/vouches?since=1500",
    });
    expect(since.json().count).toBe(1);
    expect((since.json().vouches as SignedVouch[])[0].id).toBe(later.id);
  });
});

describe("POST /posts", () => {
  it("accepts a well-signed post and returns 201", async () => {
    const post = makeSignedPost();
    const res = await app.inject({
      method: "POST",
      url: "/posts",
      payload: post,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: post.id });
  });

  it("is idempotent on re-POST of the same post id", async () => {
    const post = makeSignedPost();
    await app.inject({ method: "POST", url: "/posts", payload: post });
    const res = await app.inject({
      method: "POST",
      url: "/posts",
      payload: post,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ stored: false, id: post.id });
  });

  it("rejects a post whose signature does not verify", async () => {
    const post = { ...makeSignedPost(), signature: "abc" };
    const res = await app.inject({
      method: "POST",
      url: "/posts",
      payload: post,
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects a malformed body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/posts",
      payload: { id: "" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects unknown post type", async () => {
    const p = makeSignedPost();
    const res = await app.inject({
      method: "POST",
      url: "/posts",
      payload: { ...p, type: "REQUEST" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a post whose title exceeds the length cap", async () => {
    // A properly-signed post with a ~60 KB title must be refused at the
    // shape gate (400) BEFORE signature verification (422) — the cap
    // exists so a valid signature can't smuggle unbounded free text
    // onto the wire and into federation (Round-4 review).
    const poster = generateKeyPair();
    const immutable = {
      id: `p_oversize_title_${Date.now()}`,
      type: "NEED" as const,
      category: "transport" as const,
      title: "x".repeat(60_000),
      description: "short",
      estimatedHours: 1,
      urgency: "medium" as const,
      postedBy: poster.publicKey,
      createdAt: Date.now(),
      expiresAt: null,
      locationZone: "north",
      nodeId: "node_test",
    };
    const res = await app.inject({
      method: "POST",
      url: "/posts",
      payload: {
        ...immutable,
        signature: sign(canonicalPostPayload(immutable), poster.secretKey),
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ error: "invalid_body" });
  });

  it("rejects a post whose description exceeds the length cap", async () => {
    const poster = generateKeyPair();
    const immutable = {
      id: `p_oversize_desc_${Date.now()}`,
      type: "NEED" as const,
      category: "transport" as const,
      title: "Help getting to clinic",
      description: "x".repeat(60_000),
      estimatedHours: 1,
      urgency: "medium" as const,
      postedBy: poster.publicKey,
      createdAt: Date.now(),
      expiresAt: null,
      locationZone: "north",
      nodeId: "node_test",
    };
    const res = await app.inject({
      method: "POST",
      url: "/posts",
      payload: {
        ...immutable,
        signature: sign(canonicalPostPayload(immutable), poster.secretKey),
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ error: "invalid_body" });
  });
});

describe("GET /posts", () => {
  it("returns stored posts with since= filter respected", async () => {
    const earlier = makeSignedPost(1_000);
    const later = makeSignedPost(2_000);
    await app.inject({ method: "POST", url: "/posts", payload: earlier });
    await app.inject({ method: "POST", url: "/posts", payload: later });
    const all = await app.inject({ method: "GET", url: "/posts" });
    expect(all.json().count).toBe(2);
    const since = await app.inject({
      method: "GET",
      url: "/posts?since=1500",
    });
    expect(since.json().count).toBe(1);
    expect((since.json().posts as PostRecord[])[0].id).toBe(later.id);
  });
});

describe("GET /peers", () => {
  it("returns an empty list when no peers are configured", async () => {
    const res = await app.inject({ method: "GET", url: "/peers" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ peers: [] });
  });
});

describe("GET /peers with configured peers", () => {
  let withPeers: FastifyInstance;
  let withPeersDb: DatabaseType;

  beforeEach(async () => {
    withPeersDb = openDatabase(":memory:");
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      NODE_ID: "node_test",
      PEER_NODE_URLS:
        "https://peer-a.example, https://peer-b.example/",
    } as NodeJS.ProcessEnv);
    const built = await buildServer({ config, database: withPeersDb });
    withPeers = built.app;
    await withPeers.ready();
  });

  afterEach(async () => {
    await withPeers.close();
    withPeersDb.close();
  });

  it("lists every configured peer with empty pull state", async () => {
    const res = await withPeers.inject({ method: "GET", url: "/peers" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      peers: Array<{ url: string; lastPulledAt: number | null }>;
    };
    expect(body.peers).toHaveLength(2);
    expect(body.peers.map((p) => p.url)).toEqual([
      "https://peer-a.example",
      "https://peer-b.example",
    ]);
    for (const p of body.peers) {
      expect(p.lastPulledAt).toBeNull();
    }
  });

  it("rejects invalid PEER_NODE_URLS at startup", () => {
    expect(() =>
      readConfigFromEnv({
        LOG_LEVEL: "fatal",
        PEER_NODE_URLS: "ftp://nope.example",
      } as NodeJS.ProcessEnv),
    ).toThrow(/http\(s\)/);
  });
});

describe("GET /config with operator info", () => {
  let withOperator: FastifyInstance;
  let withOperatorDb: DatabaseType;

  beforeEach(async () => {
    withOperatorDb = openDatabase(":memory:");
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      NODE_ID: "node_test",
      OPERATOR_NAME: "Marcus",
      OPERATOR_FUNDING_NOTE: "Hosting donated since 2026-01",
      OPERATOR_CONTACT: "#aid:matrix.example",
    } as NodeJS.ProcessEnv);
    const built = await buildServer({ config, database: withOperatorDb });
    withOperator = built.app;
    await withOperator.ready();
  });

  afterEach(async () => {
    await withOperator.close();
    withOperatorDb.close();
  });

  it("returns the operator block when env vars are set", async () => {
    const res = await withOperator.inject({ method: "GET", url: "/config" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      operator: {
        name: "Marcus",
        fundingNote: "Hosting donated since 2026-01",
        contact: "#aid:matrix.example",
      },
    });
  });
});

describe("GET /config with a system key", () => {
  let withKey: FastifyInstance;
  let withKeyDb: DatabaseType;

  beforeEach(async () => {
    withKeyDb = openDatabase(":memory:");
    const kp = generateKeyPair();
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      NODE_ID: "node_keyed",
      NODE_SYSTEM_SECRET_KEY: kp.secretKey,
    } as NodeJS.ProcessEnv);
    const built = await buildServer({ config, database: withKeyDb });
    withKey = built.app;
    await withKey.ready();
  });

  afterEach(async () => {
    await withKey.close();
    withKeyDb.close();
  });

  it("publishes nodeId alongside systemKey so peers can bind autoConfirmedBy claims", async () => {
    const res = await withKey.inject({ method: "GET", url: "/config" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      systemKey?: { current: string };
      nodeId?: string;
    };
    // A peer verifying `autoConfirmedBy: "system:<nodeId>"` needs the
    // authenticated nodeId↔pubkey binding this response provides.
    expect(body.systemKey?.current).toBeTruthy();
    expect(body.nodeId).toBe("node_keyed");
  });
});

describe("GET /config — rotation history (NODE_SYSTEM_KEY_HISTORY)", () => {
  it("serves the operator-published retired keys", async () => {
    const historyDb = openDatabase(":memory:");
    const kp = generateKeyPair();
    const retired = generateKeyPair();
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      NODE_ID: "node_rotated",
      NODE_SYSTEM_SECRET_KEY: kp.secretKey,
      NODE_SYSTEM_KEY_HISTORY: JSON.stringify([
        { pubkey: retired.publicKey, retiredAt: 1_700_000_000_000 },
      ]),
    } as NodeJS.ProcessEnv);
    const built = await buildServer({ config, database: historyDb });
    await built.app.ready();
    try {
      const res = await built.app.inject({ method: "GET", url: "/config" });
      const body = res.json() as {
        systemKey?: { current: string; history: unknown[] };
      };
      expect(body.systemKey?.history).toEqual([
        { pubkey: retired.publicKey, retiredAt: 1_700_000_000_000 },
      ]);
    } finally {
      await built.app.close();
      historyDb.close();
    }
  });

  it("refuses to boot on malformed history (silent drop would un-verify past records)", () => {
    expect(() =>
      readConfigFromEnv({
        LOG_LEVEL: "fatal",
        NODE_SYSTEM_KEY_HISTORY: "not json",
      } as NodeJS.ProcessEnv),
    ).toThrow(/NODE_SYSTEM_KEY_HISTORY/);
    expect(() =>
      readConfigFromEnv({
        LOG_LEVEL: "fatal",
        NODE_SYSTEM_KEY_HISTORY: JSON.stringify([{ pubkey: "", retiredAt: 1 }]),
      } as NodeJS.ProcessEnv),
    ).toThrow(/entry 0/);
    expect(() =>
      readConfigFromEnv({
        LOG_LEVEL: "fatal",
        NODE_SYSTEM_KEY_HISTORY: JSON.stringify([
          { pubkey: "abc", retiredAt: "yesterday" },
        ]),
      } as NodeJS.ProcessEnv),
    ).toThrow(/entry 0/);
  });

  it("sorts history ascending by retiredAt regardless of input order", () => {
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      NODE_SYSTEM_KEY_HISTORY: JSON.stringify([
        { pubkey: "newer_retiree", retiredAt: 2_000 },
        { pubkey: "older_retiree", retiredAt: 1_000 },
      ]),
    } as NodeJS.ProcessEnv);
    expect(config.systemKeyHistory.map((h) => h.pubkey)).toEqual([
      "older_retiree",
      "newer_retiree",
    ]);
  });
});

describe("POST /task-comments", () => {
  it("accepts a well-signed comment and returns 201", async () => {
    const c = makeSignedTaskComment();
    const res = await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: c,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: c.id });
  });

  it("is idempotent on re-POST of the same comment", async () => {
    const c = makeSignedTaskComment();
    await app.inject({ method: "POST", url: "/task-comments", payload: c });
    const res = await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: c,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ stored: false, id: c.id });
  });

  it("rejects a comment whose signature does not verify", async () => {
    const c = { ...makeSignedTaskComment(), signature: "abc" };
    const res = await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: c,
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects a malformed body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: { id: "" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a body over the max length", async () => {
    // Sign and submit a row with a 2001-char body. The signature
    // verifies (we signed the long body), so this must be rejected
    // by parseTaskComment, not by verify.
    const author = generateKeyPair();
    const now = Date.now();
    const immutable = {
      id: `tc_long_${Math.random().toString(36).slice(2)}`,
      projectId: "proj_test",
      taskId: "task_test",
      authorKey: author.publicKey,
      body: "x".repeat(2001),
      createdAt: now,
      nodeId: "node_test",
    };
    const c: TaskComment = {
      ...immutable,
      deletedAt: null,
      signature: sign(canonicalTaskCommentPayload(immutable), author.secretKey),
    };
    const res = await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: c,
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a far-future deletedAt (cursor-poisoning guard)", async () => {
    // deletedAt is NOT in the signed payload, and the federation
    // cursor is max(created_at, deleted_at). An unbounded deletedAt
    // would jump every puller's high-water mark to the far future and
    // hide all subsequent comments mesh-wide. The row's signature is
    // valid; parseTaskComment must reject it on the bound.
    const c = makeSignedTaskComment();
    const poison: TaskComment = {
      ...c,
      deletedAt: Number.MAX_SAFE_INTEGER,
    };
    const res = await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: poison,
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a deletedAt that precedes createdAt", async () => {
    const c = makeSignedTaskComment({ createdAt: 1_000_000 });
    const backwards: TaskComment = { ...c, deletedAt: 500_000 };
    const res = await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: backwards,
    });
    expect(res.statusCode).toBe(400);
  });

  it("applies a tombstone on second submission with deletedAt set", async () => {
    // Author signs the immutable subset, then re-posts the same row
    // later with deletedAt populated. The signature still verifies
    // (deletedAt isn't in the canonical payload). Server should
    // upsertTombstone on the existing row.
    const c = makeSignedTaskComment();
    await app.inject({ method: "POST", url: "/task-comments", payload: c });
    const tombstoned: TaskComment = { ...c, deletedAt: Date.now() };
    const res = await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: tombstoned,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({
      stored: true,
      id: c.id,
      tombstoned: true,
    });
    // A second tombstone request is a no-op (tombstone-wins keeps the
    // first deleted_at; from the client's perspective the row is
    // unchanged).
    const again = await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: { ...c, deletedAt: Date.now() + 1000 },
    });
    expect(again.statusCode).toBe(200);
  });
});

describe("GET /task-comments", () => {
  it("returns stored comments with since= filter respected", async () => {
    const earlier = makeSignedTaskComment({ createdAt: 1_000 });
    const later = makeSignedTaskComment({ createdAt: 2_000 });
    await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: earlier,
    });
    await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: later,
    });
    const all = await app.inject({ method: "GET", url: "/task-comments" });
    expect(all.json().count).toBe(2);
    const since = await app.inject({
      method: "GET",
      url: "/task-comments?since=1500",
    });
    expect(since.json().count).toBe(1);
    expect(
      (since.json().taskComments as TaskComment[])[0].id,
    ).toBe(later.id);
  });

  it("a late tombstone re-enters the since window (effective cursor = max(createdAt, deletedAt))", async () => {
    const comment = makeSignedTaskComment({ createdAt: 1_000 });
    await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: comment,
    });

    // A puller whose cursor is already past createdAt sees nothing…
    const before = await app.inject({
      method: "GET",
      url: "/task-comments?since=5000",
    });
    expect(before.json().count).toBe(0);

    // …then the author soft-deletes. The tombstoned row must be
    // served in the deletedAt window, or peers that already pulled
    // the live row keep rendering a comment the author deleted.
    await app.inject({
      method: "POST",
      url: "/task-comments",
      payload: { ...comment, deletedAt: 9_000 },
    });
    const after = await app.inject({
      method: "GET",
      url: "/task-comments?since=5000",
    });
    expect(after.json().count).toBe(1);
    const served = (after.json().taskComments as TaskComment[])[0];
    expect(served.id).toBe(comment.id);
    expect(served.deletedAt).toBe(9_000);
  });
});

function makeSignedCoOrgInvitation(
  overrides: Partial<CoOrganizerInvitation> = {},
): CoOrganizerInvitation {
  const inviter = generateKeyPair();
  const invitee = generateKeyPair();
  const createdAt = overrides.createdAt ?? Date.now();
  const payload = {
    projectId: overrides.projectId ?? "proj_test",
    inviterKey: overrides.inviterKey ?? inviter.publicKey,
    inviteeKey: overrides.inviteeKey ?? invitee.publicKey,
    createdAt,
    expiresAt: overrides.expiresAt ?? createdAt + 14 * 24 * 60 * 60 * 1000,
    nodeId: overrides.nodeId ?? "node_test",
  };
  const signature =
    overrides.signature ??
    sign(canonicalCoOrganizerInvitationPayload(payload), inviter.secretKey);
  return {
    id:
      overrides.id ??
      `ci_${createdAt}_${Math.random().toString(36).slice(2)}`,
    ...payload,
    signature,
  };
}

function makeSignedCoOrgResponse(
  overrides: Partial<CoOrganizerInvitationResponse> = {},
): CoOrganizerInvitationResponse {
  const invitee = generateKeyPair();
  const decidedAt = overrides.decidedAt ?? Date.now();
  const payload = {
    invitationId: overrides.invitationId ?? "inv_test",
    inviteeKey: overrides.inviteeKey ?? invitee.publicKey,
    decision: overrides.decision ?? ("accept" as const),
    decidedAt,
    nodeId: overrides.nodeId ?? "node_test",
  };
  const signature =
    overrides.signature ??
    sign(
      canonicalCoOrganizerInvitationResponsePayload(payload),
      invitee.secretKey,
    );
  return {
    id:
      overrides.id ??
      `cr_${decidedAt}_${Math.random().toString(36).slice(2)}`,
    ...payload,
    signature,
  };
}

function makeSignedCoOrgRevocation(
  overrides: Partial<CoOrganizerInvitationRevocation> = {},
): CoOrganizerInvitationRevocation {
  const inviter = generateKeyPair();
  const revokedAt = overrides.revokedAt ?? Date.now();
  const payload = {
    invitationId: overrides.invitationId ?? "inv_test",
    inviterKey: overrides.inviterKey ?? inviter.publicKey,
    revokedAt,
    nodeId: overrides.nodeId ?? "node_test",
  };
  const signature =
    overrides.signature ??
    sign(
      canonicalCoOrganizerInvitationRevocationPayload(payload),
      inviter.secretKey,
    );
  return {
    id:
      overrides.id ??
      `cv_${revokedAt}_${Math.random().toString(36).slice(2)}`,
    ...payload,
    signature,
  };
}

describe("POST /coorg-invitations", () => {
  it("accepts a well-signed invitation and returns 201", async () => {
    const rec = makeSignedCoOrgInvitation();
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitations",
      payload: rec,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: rec.id });
  });

  it("is idempotent on re-POST of the same invitation id", async () => {
    const rec = makeSignedCoOrgInvitation();
    await app.inject({
      method: "POST",
      url: "/coorg-invitations",
      payload: rec,
    });
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitations",
      payload: rec,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ stored: false, id: rec.id });
  });

  it("rejects an invitation whose signature does not verify", async () => {
    const rec = { ...makeSignedCoOrgInvitation(), signature: "abc" };
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitations",
      payload: rec,
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects a malformed body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitations",
      payload: { id: "" },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /coorg-invitations", () => {
  it("returns stored invitations with since= filter respected", async () => {
    const earlier = makeSignedCoOrgInvitation({ createdAt: 1_000 });
    const later = makeSignedCoOrgInvitation({ createdAt: 2_000 });
    await app.inject({
      method: "POST",
      url: "/coorg-invitations",
      payload: earlier,
    });
    await app.inject({
      method: "POST",
      url: "/coorg-invitations",
      payload: later,
    });
    const all = await app.inject({
      method: "GET",
      url: "/coorg-invitations",
    });
    expect(all.json().count).toBe(2);
    const since = await app.inject({
      method: "GET",
      url: "/coorg-invitations?since=1500",
    });
    expect(since.json().count).toBe(1);
    expect(
      (since.json().coorgInvitations as CoOrganizerInvitation[])[0].id,
    ).toBe(later.id);
  });

  it("honors the limit query parameter (default + ceiling)", async () => {
    for (let i = 0; i < 3; i++) {
      await app.inject({
        method: "POST",
        url: "/coorg-invitations",
        payload: makeSignedCoOrgInvitation({ createdAt: 1000 + i }),
      });
    }
    const limited = await app.inject({
      method: "GET",
      url: "/coorg-invitations?limit=2",
    });
    expect(limited.json().count).toBe(2);
  });
});

describe("POST /coorg-invitation-responses", () => {
  it("accepts a well-signed response and returns 201", async () => {
    const rec = makeSignedCoOrgResponse();
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitation-responses",
      payload: rec,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: rec.id });
  });

  it("is idempotent on re-POST", async () => {
    const rec = makeSignedCoOrgResponse();
    await app.inject({
      method: "POST",
      url: "/coorg-invitation-responses",
      payload: rec,
    });
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitation-responses",
      payload: rec,
    });
    expect(res.statusCode).toBe(200);
  });

  it("rejects a response whose signature does not verify", async () => {
    const rec = { ...makeSignedCoOrgResponse(), signature: "abc" };
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitation-responses",
      payload: rec,
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects a malformed body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitation-responses",
      payload: { id: "" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects an unknown decision", async () => {
    const r = makeSignedCoOrgResponse();
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitation-responses",
      payload: { ...r, decision: "maybe" },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /coorg-invitation-responses", () => {
  it("returns stored responses with since= filter respected", async () => {
    const earlier = makeSignedCoOrgResponse({ decidedAt: 1_000 });
    const later = makeSignedCoOrgResponse({ decidedAt: 2_000 });
    await app.inject({
      method: "POST",
      url: "/coorg-invitation-responses",
      payload: earlier,
    });
    await app.inject({
      method: "POST",
      url: "/coorg-invitation-responses",
      payload: later,
    });
    const all = await app.inject({
      method: "GET",
      url: "/coorg-invitation-responses",
    });
    expect(all.json().count).toBe(2);
    const since = await app.inject({
      method: "GET",
      url: "/coorg-invitation-responses?since=1500",
    });
    expect(since.json().count).toBe(1);
    expect(
      (since.json()
        .coorgInvitationResponses as CoOrganizerInvitationResponse[])[0].id,
    ).toBe(later.id);
  });
});

describe("POST /coorg-invitation-revocations", () => {
  it("accepts a well-signed revocation and returns 201", async () => {
    const rec = makeSignedCoOrgRevocation();
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitation-revocations",
      payload: rec,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: rec.id });
  });

  it("is idempotent on re-POST", async () => {
    const rec = makeSignedCoOrgRevocation();
    await app.inject({
      method: "POST",
      url: "/coorg-invitation-revocations",
      payload: rec,
    });
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitation-revocations",
      payload: rec,
    });
    expect(res.statusCode).toBe(200);
  });

  it("rejects a revocation whose signature does not verify", async () => {
    const rec = { ...makeSignedCoOrgRevocation(), signature: "abc" };
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitation-revocations",
      payload: rec,
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects a malformed body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/coorg-invitation-revocations",
      payload: { id: "" },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /coorg-invitation-revocations", () => {
  it("returns stored revocations with since= filter respected", async () => {
    const earlier = makeSignedCoOrgRevocation({ revokedAt: 1_000 });
    const later = makeSignedCoOrgRevocation({ revokedAt: 2_000 });
    await app.inject({
      method: "POST",
      url: "/coorg-invitation-revocations",
      payload: earlier,
    });
    await app.inject({
      method: "POST",
      url: "/coorg-invitation-revocations",
      payload: later,
    });
    const all = await app.inject({
      method: "GET",
      url: "/coorg-invitation-revocations",
    });
    expect(all.json().count).toBe(2);
    const since = await app.inject({
      method: "GET",
      url: "/coorg-invitation-revocations?since=1500",
    });
    expect(since.json().count).toBe(1);
    expect(
      (since.json()
        .coorgInvitationRevocations as CoOrganizerInvitationRevocation[])[0]
        .id,
    ).toBe(later.id);
  });
});
