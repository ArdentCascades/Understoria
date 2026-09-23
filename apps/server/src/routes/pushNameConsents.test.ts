/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// Push name consents (docs/notifications.md v2 — messages named by
// mutual consent). What these pin: only the member a record names
// can sign it, retraction (allow:false) keeps winning LWW over
// stale allowing copies, and the record carries a boolean — the
// server never sees, stores or serves a display name through this
// surface.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  generateKeyPair,
  signStateRecord,
  type KeyPair,
} from "@understoria/shared/crypto";
import type { PushNameConsent } from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";

let app: FastifyInstance;
let db: DatabaseType;

async function freshServer() {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
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

function makeConsent(
  member: KeyPair,
  overrides: Partial<PushNameConsent> = {},
): PushNameConsent {
  const unsigned: Omit<PushNameConsent, "signature"> = {
    id: `pnc_${++seq}`,
    memberKey: member.publicKey,
    allow: true,
    updatedAt: Date.now(),
    signerKey: member.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature:
      overrides.signature ??
      signStateRecord<PushNameConsent>(unsigned, member.secretKey),
  };
}

describe("POST /push-name-consents", () => {
  it("stores a member's own signed consent and serves it back — a boolean, never a name", async () => {
    const member = generateKeyPair();
    const consent = makeConsent(member);
    const res = await app.inject({
      method: "POST",
      url: "/push-name-consents",
      payload: consent,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: consent.id });

    const feed = await app.inject({
      method: "GET",
      url: "/push-name-consents",
    });
    const body = feed.json() as {
      count: number;
      pushNameConsents: PushNameConsent[];
    };
    expect(body.count).toBe(1);
    expect(body.pushNameConsents[0]).toEqual(consent);
    // The record's whole vocabulary: no display-name field exists.
    expect(Object.keys(body.pushNameConsents[0]).sort()).toEqual([
      "allow",
      "id",
      "memberKey",
      "signature",
      "signerKey",
      "updatedAt",
    ]);
  });

  it("LWW: a retraction (allow:false) wins and a stale allowing copy cannot resurrect it", async () => {
    const member = generateKeyPair();
    const t = Date.now();
    await app.inject({
      method: "POST",
      url: "/push-name-consents",
      payload: makeConsent(member, { updatedAt: t }),
    });

    const retract = makeConsent(member, { allow: false, updatedAt: t + 10 });
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/push-name-consents",
          payload: retract,
        })
      ).statusCode,
    ).toBe(201);

    const stale = makeConsent(member, { allow: true, updatedAt: t - 10 });
    const staleRes = await app.inject({
      method: "POST",
      url: "/push-name-consents",
      payload: stale,
    });
    expect(staleRes.statusCode).toBe(200);
    expect(staleRes.json()).toEqual({ stored: false, id: stale.id });

    const feed = await app.inject({
      method: "GET",
      url: "/push-name-consents",
    });
    const body = feed.json() as { pushNameConsents: PushNameConsent[] };
    expect(body.pushNameConsents).toHaveLength(1);
    expect(body.pushNameConsents[0].allow).toBe(false);
  });

  it("refuses a consent signed by anyone but the member it names — nobody opts in someone else's name", async () => {
    const member = generateKeyPair();
    const attacker = generateKeyPair();
    const unsigned: Omit<PushNameConsent, "signature"> = {
      id: `pnc_${++seq}`,
      memberKey: member.publicKey,
      allow: true,
      updatedAt: Date.now(),
      signerKey: attacker.publicKey,
    };
    const forged: PushNameConsent = {
      ...unsigned,
      signature: signStateRecord<PushNameConsent>(
        unsigned,
        attacker.secretKey,
      ),
    };
    const res = await app.inject({
      method: "POST",
      url: "/push-name-consents",
      payload: forged,
    });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toMatchObject({ error: "not_authorized" });
  });

  it("refuses tampered and malformed bodies", async () => {
    const member = generateKeyPair();
    const consent = makeConsent(member);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/push-name-consents",
          payload: { ...consent, allow: false },
        })
      ).statusCode,
    ).toBe(422);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/push-name-consents",
          payload: { memberKey: member.publicKey },
        })
      ).statusCode,
    ).toBe(400);
  });
});
