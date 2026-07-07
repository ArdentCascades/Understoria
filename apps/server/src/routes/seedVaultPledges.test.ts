/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  generateKeyPair,
  signStateRecord,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { SeedVaultPledge } from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

let app: FastifyInstance;
let db: DatabaseType;

async function freshServer() {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    NODE_ID: "node_test",
    RATE_LIMIT_MAX: "10000",
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

let seq = 0;

function makePledge(
  member: KeyPair,
  overrides: Partial<SeedVaultPledge> = {},
): SeedVaultPledge {
  const unsigned: Omit<SeedVaultPledge, "signature"> = {
    id: `svp_${++seq}`,
    memberKey: member.publicKey,
    active: true,
    updatedAt: Date.now(),
    signerKey: member.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature:
      overrides.signature ??
      signStateRecord<SeedVaultPledge>(unsigned, member.secretKey),
  };
}

describe("POST /seed-vault-pledges", () => {
  it("stores a member's own signed pledge and serves it back", async () => {
    const member = generateKeyPair();
    const pledge = makePledge(member);
    const res = await app.inject({
      method: "POST",
      url: "/seed-vault-pledges",
      payload: pledge,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: pledge.id });

    const feed = await app.inject({ method: "GET", url: "/seed-vault-pledges" });
    const body = feed.json() as { count: number; seedVaultPledges: SeedVaultPledge[] };
    expect(body.count).toBe(1);
    expect(body.seedVaultPledges[0]).toEqual(pledge);
  });

  it("LWW: strictly-newer replaces (retraction wins), stale is a 200 no-op", async () => {
    const member = generateKeyPair();
    const t = Date.now();
    const active = makePledge(member, { updatedAt: t });
    await app.inject({ method: "POST", url: "/seed-vault-pledges", payload: active });

    const retract = makePledge(member, { active: false, updatedAt: t + 10 });
    const res = await app.inject({
      method: "POST",
      url: "/seed-vault-pledges",
      payload: retract,
    });
    expect(res.statusCode).toBe(201);

    // A stale ACTIVE copy from another device can't resurrect it.
    const stale = makePledge(member, { active: true, updatedAt: t - 10 });
    const staleRes = await app.inject({
      method: "POST",
      url: "/seed-vault-pledges",
      payload: stale,
    });
    expect(staleRes.statusCode).toBe(200);
    expect(staleRes.json()).toEqual({ stored: false, id: stale.id });

    const feed = await app.inject({ method: "GET", url: "/seed-vault-pledges" });
    const body = feed.json() as { seedVaultPledges: SeedVaultPledge[] };
    expect(body.seedVaultPledges).toHaveLength(1);
    expect(body.seedVaultPledges[0].active).toBe(false);
  });

  it("refuses a pledge signed by anyone but the member it names", async () => {
    const member = generateKeyPair();
    const attacker = generateKeyPair();
    // Attacker signs a pledge NAMING the member: signature verifies
    // (signerKey is the attacker) but single-owner refuses it.
    const unsigned: Omit<SeedVaultPledge, "signature"> = {
      id: `svp_${++seq}`,
      memberKey: member.publicKey,
      active: true,
      updatedAt: Date.now(),
      signerKey: attacker.publicKey,
    };
    const forged: SeedVaultPledge = {
      ...unsigned,
      signature: signStateRecord<SeedVaultPledge>(unsigned, attacker.secretKey),
    };
    const res = await app.inject({
      method: "POST",
      url: "/seed-vault-pledges",
      payload: forged,
    });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toMatchObject({ error: "not_authorized" });
  });

  it("refuses tampered and malformed bodies", async () => {
    const member = generateKeyPair();
    const pledge = makePledge(member);
    const tampered = { ...pledge, active: false };
    const res = await app.inject({
      method: "POST",
      url: "/seed-vault-pledges",
      payload: tampered,
    });
    expect(res.statusCode).toBe(422);

    const malformed = await app.inject({
      method: "POST",
      url: "/seed-vault-pledges",
      payload: { memberKey: member.publicKey },
    });
    expect(malformed.statusCode).toBe(400);
  });

  it("pages the feed by the composite (updatedAt, id) cursor", async () => {
    const a = generateKeyPair();
    const b = generateKeyPair();
    const t = Date.now();
    const first = makePledge(a, { updatedAt: t });
    const second = makePledge(b, { updatedAt: t + 5 });
    await app.inject({ method: "POST", url: "/seed-vault-pledges", payload: first });
    await app.inject({ method: "POST", url: "/seed-vault-pledges", payload: second });

    const page1 = await app.inject({
      method: "GET",
      url: "/seed-vault-pledges?limit=1",
    });
    const b1 = page1.json() as { seedVaultPledges: SeedVaultPledge[] };
    expect(b1.seedVaultPledges).toHaveLength(1);
    const cursor = b1.seedVaultPledges[0];
    const page2 = await app.inject({
      method: "GET",
      url: `/seed-vault-pledges?since=${cursor.updatedAt}&sinceId=${cursor.id}&limit=10`,
    });
    const b2 = page2.json() as { seedVaultPledges: SeedVaultPledge[] };
    expect(b2.seedVaultPledges).toHaveLength(1);
    expect(b2.seedVaultPledges[0].id).not.toBe(cursor.id);
  });
});
