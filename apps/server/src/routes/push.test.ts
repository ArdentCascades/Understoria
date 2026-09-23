/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// Push-subscription lifecycle (docs/notifications.md — quiet by
// default), tested dark: rows are managed, nothing is ever sent by a
// trigger, and the send helper is exercised only with an injected
// transport. The contracts under test are the doc's safety plumbing:
// member-signed writes with a bounded timestamp, one row per device,
// the lost-phone delete path, the TTL dead-man, dead-endpoint
// pruning, and the category enum as a hard send-side gate.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  canonicalPushAuthMessage,
  generateKeyPair,
  sign,
  NOTIFICATION_CATEGORIES,
  type KeyPair,
} from "@understoria/shared";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import {
  createPushSubscriptionStore,
  openDatabase,
  PUSH_SUBSCRIPTION_TTL_MS,
} from "../db.js";
import { createPushSender, ensureVapidKeys } from "../push.js";
import { startRetentionSweep } from "../retentionSweep.js";

let app: FastifyInstance;
let db: DatabaseType;
let member: KeyPair;

async function freshServer() {
  db = openDatabase(":memory:");
  member = generateKeyPair();
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
    NODE_ID: "node_test",
    NODE_FOUNDER_KEYS: member.publicKey,
    RATE_LIMIT_MAX: "10000",
  } as unknown as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  await app.ready();
}

beforeEach(freshServer);
afterEach(async () => {
  await app.close();
  db.close();
});

const ENDPOINT = "https://push.example/sub/abc123";

function subscribeBody(over: Record<string, unknown> = {}) {
  const timestamp = Date.now();
  const categories = ["shift_reminder", "guardian_request"];
  const endpoint =
    (over.endpoint as string | undefined) ?? ENDPOINT;
  const deviceId = (over.deviceId as string | undefined) ?? "device-1";
  const memberKey =
    (over.memberKey as string | undefined) ?? member.publicKey;
  const cats = (over.categories as string[] | undefined) ?? categories;
  const body = {
    memberKey,
    deviceId,
    timestamp,
    subscription: {
      endpoint,
      keys: { p256dh: "BPk-p256dh-material", auth: "auth-material" },
    },
    categories: cats,
    signature: sign(
      canonicalPushAuthMessage(
        "push-subscribe",
        memberKey,
        deviceId,
        endpoint,
        cats,
        timestamp,
      ),
      (over.secretKey as string | undefined) ?? member.secretKey,
    ),
    ...(("timestampOverride" in over)
      ? { timestamp: over.timestampOverride as number }
      : {}),
  };
  return body;
}

async function subscribe(over: Record<string, unknown> = {}) {
  return app.inject({
    method: "POST",
    url: "/push/subscriptions",
    payload: subscribeBody(over),
  });
}

describe("push subscription lifecycle", () => {
  it("publishes the node's VAPID public key on the open surface", async () => {
    const res = await app.inject({ method: "GET", url: "/push/vapid-key" });
    expect(res.statusCode).toBe(200);
    const { publicKey } = res.json() as { publicKey: string };
    expect(publicKey.length).toBeGreaterThan(20);
    // Stable across calls — minted once, persisted in meta.
    const again = await app.inject({ method: "GET", url: "/push/vapid-key" });
    expect((again.json() as { publicKey: string }).publicKey).toBe(publicKey);
  });

  it("accepts a member-signed subscribe and stores one row per device", async () => {
    expect((await subscribe()).statusCode).toBe(200);
    const store = createPushSubscriptionStore(db);
    const rows = store.listForMember(member.publicKey);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      endpoint: ENDPOINT,
      deviceId: "device-1",
      categories: ["shift_reminder", "guardian_request"],
    });
    // Re-subscribing the SAME device with a fresh endpoint replaces
    // its row — no ghost endpoints accumulate.
    expect(
      (await subscribe({ endpoint: "https://push.example/sub/rotated" }))
        .statusCode,
    ).toBe(200);
    const after = store.listForMember(member.publicKey);
    expect(after).toHaveLength(1);
    expect(after[0].endpoint).toBe("https://push.example/sub/rotated");
  });

  it("rejects a non-member, a bad signature, a stale timestamp, and unknown categories", async () => {
    const stranger = generateKeyPair();
    expect(
      (
        await subscribe({
          memberKey: stranger.publicKey,
          secretKey: stranger.secretKey,
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (await subscribe({ secretKey: generateKeyPair().secretKey }))
        .statusCode,
    ).toBe(401);
    expect(
      (await subscribe({ timestampOverride: Date.now() - 11 * 60_000 }))
        .statusCode,
    ).toBe(401);
    expect(
      (await subscribe({ categories: ["engagement_digest"] })).statusCode,
    ).toBe(400);
    expect((await subscribe({ categories: [] })).statusCode).toBe(400);
  });

  it("renews the TTL clock, and 404s a pruned endpoint so the device re-subscribes", async () => {
    await subscribe();
    const timestamp = Date.now();
    const renew = () =>
      app.inject({
        method: "POST",
        url: "/push/subscriptions/renew",
        payload: {
          memberKey: member.publicKey,
          deviceId: "device-1",
          endpoint: ENDPOINT,
          timestamp,
          signature: sign(
            canonicalPushAuthMessage(
              "push-renew",
              member.publicKey,
              "device-1",
              ENDPOINT,
              [],
              timestamp,
            ),
            member.secretKey,
          ),
        },
      });
    expect((await renew()).statusCode).toBe(200);
    createPushSubscriptionStore(db).pruneDeadEndpoint(ENDPOINT);
    expect((await renew()).statusCode).toBe(404);
  });

  it("deletes by endpoint (self) and by device id (the lost phone, from another device)", async () => {
    await subscribe();
    await subscribe({
      deviceId: "device-2",
      endpoint: "https://push.example/sub/second",
    });
    const del = (payload: Record<string, unknown>) =>
      app.inject({
        method: "POST",
        url: "/push/subscriptions/delete",
        payload,
      });
    const ts = Date.now();
    // Lost phone: prune device-1's row, signed by the member from
    // anywhere — the pruned device never signs anything.
    const res = await del({
      memberKey: member.publicKey,
      deviceId: "device-1",
      timestamp: ts,
      signature: sign(
        canonicalPushAuthMessage(
          "push-delete",
          member.publicKey,
          "device-1",
          "",
          [],
          ts,
        ),
        member.secretKey,
      ),
    });
    expect(res.statusCode).toBe(200);
    expect((res.json() as { removed: number }).removed).toBe(1);
    const rows = createPushSubscriptionStore(db).listForMember(
      member.publicKey,
    );
    expect(rows.map((r) => r.deviceId)).toEqual(["device-2"]);
  });

  it("expires unrenewed rows via the retention sweep — the offline-purge dead-man", async () => {
    await subscribe();
    const store = createPushSubscriptionStore(db);
    expect(store.listForMember(member.publicKey)).toHaveLength(1);
    const future = Date.now() + PUSH_SUBSCRIPTION_TTL_MS + 60_000;
    const sweep = startRetentionSweep({
      db,
      claimRetentionDays: 0,
      announcementRetentionDays: 0,
      transitionRetentionDays: 0,
      newcomerCounterRetentionDays: 0,
      intervalMs: 0,
      log: app.log,
      now: () => future,
    });
    const result = sweep.sweepOnce();
    sweep.stop();
    expect(result.pushSubscriptions).toBe(1);
    expect(store.listForMember(member.publicKey)).toHaveLength(0);
  });
});

describe("under read-auth enforcement (the deployed posture)", () => {
  // Field bug: real communities run READ_AUTH=on, and the vapid-key
  // route was missing from the open-path list — so a fully updated
  // node answered member_read_required and Settings told members
  // their server "doesn't offer notifications yet". The key is open
  // by the notifications contract (public by nature, like /config);
  // everything else under /push stays deny-by-default, and the
  // member-signed writes need no read headers.
  it("serves the vapid key openly, keeps other push GETs guarded, and takes signed writes", async () => {
    await app.close();
    db.close();
    db = openDatabase(":memory:");
    member = generateKeyPair();
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      READ_AUTH: "on",
      NODE_ID: "node_test",
      NODE_FOUNDER_KEYS: member.publicKey,
      RATE_LIMIT_MAX: "10000",
    } as unknown as NodeJS.ProcessEnv);
    const built = await buildServer({ config, database: db });
    app = built.app;
    await app.ready();

    const key = await app.inject({ method: "GET", url: "/push/vapid-key" });
    expect(key.statusCode).toBe(200);
    expect(
      (key.json() as { publicKey: string }).publicKey.length,
    ).toBeGreaterThan(20);
    // The exemption is the exact key path, not a /push umbrella.
    const other = await app.inject({ method: "GET", url: "/push/anything" });
    expect(other.statusCode).toBe(401);
    expect((other.json() as { error: string }).error).toBe(
      "member_read_required",
    );
    // The signed lifecycle writes carry their own authentication.
    expect((await subscribe()).statusCode).toBe(200);
  });
});

describe("the send helper (injected transport — nothing real is sent)", () => {
  it("sends only to subscribers of the payload's category and prunes dead endpoints", async () => {
    await subscribe();
    await subscribe({
      deviceId: "device-2",
      endpoint: "https://push.example/sub/second",
      categories: ["awaiting_confirmation"],
    });
    const store = createPushSubscriptionStore(db);
    const sent: string[] = [];
    const sender = createPushSender(
      store,
      ensureVapidKeys(db),
      async (sub) => {
        sent.push(sub.endpoint);
        if (sub.endpoint === ENDPOINT) {
          const err = new Error("gone") as Error & { statusCode: number };
          err.statusCode = 410;
          throw err;
        }
      },
    );
    const n = await sender.sendCategoryPush({
      category: "shift_reminder",
      path: "/calendar",
    });
    // Only device-1 opted into shift_reminder…
    expect(n).toBe(1);
    expect(sent).toEqual([ENDPOINT]);
    // …and its 410 pruned the row.
    expect(
      store.listForMember(member.publicKey).map((r) => r.deviceId),
    ).toEqual(["device-2"]);
  });

  it("refuses any category outside the documented list — the enum is the contract", async () => {
    const sender = createPushSender(
      createPushSubscriptionStore(db),
      ensureVapidKeys(db),
      async () => {},
    );
    await expect(
      sender.sendCategoryPush({
        // A future caller trying to invent an engagement ping.
        category: "engagement_digest" as never,
        path: "/",
      }),
    ).rejects.toThrow(/documented list/);
    // And the documented list is exactly the doc's six (v2).
    expect([...NOTIFICATION_CATEGORIES]).toEqual([
      "shift_reminder",
      "guardian_request",
      "awaiting_confirmation",
      "event_reminder",
      "message_waiting",
      "test_ping",
    ]);
  });
});

describe("the self-requested test ping (v2)", () => {
  function testBody(over: Record<string, unknown> = {}) {
    const timestamp = Date.now();
    const endpoint = (over.endpoint as string | undefined) ?? ENDPOINT;
    const memberKey =
      (over.memberKey as string | undefined) ?? member.publicKey;
    return {
      memberKey,
      deviceId: "device-1",
      endpoint,
      timestamp,
      signature: sign(
        canonicalPushAuthMessage(
          "push-test",
          memberKey,
          "device-1",
          endpoint,
          [],
          timestamp,
        ),
        (over.secretKey as string | undefined) ?? member.secretKey,
      ),
    };
  }

  it("cannot be SUBSCRIBED to — test_ping in a category set is a 400", async () => {
    // In the enum (the send gate and the SW know it), but never a
    // preference: a subscription claiming it is a client bug.
    expect(
      (await subscribe({ categories: ["shift_reminder", "test_ping"] }))
        .statusCode,
    ).toBe(400);
  });

  it("delivers one ping to the signer's own subscription row, and only there", async () => {
    const sent: { endpoint: string; payload: string }[] = [];
    await app.close();
    db.close();
    db = openDatabase(":memory:");
    member = generateKeyPair();
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      READ_AUTH: "off",
      NODE_ID: "node_test",
      NODE_FOUNDER_KEYS: member.publicKey,
      RATE_LIMIT_MAX: "10000",
    } as unknown as NodeJS.ProcessEnv);
    const built = await buildServer({
      config,
      database: db,
      pushTransport: async (sub, payload) => {
        sent.push({ endpoint: sub.endpoint, payload });
      },
    });
    app = built.app;
    await app.ready();

    // No subscription yet: 404, nothing sent.
    const cold = await app.inject({
      method: "POST",
      url: "/push/test",
      payload: testBody(),
    });
    expect(cold.statusCode).toBe(404);
    expect(sent).toHaveLength(0);

    await subscribe(); // device-1 @ ENDPOINT — note: NOT subscribed to test_ping
    const res = await app.inject({
      method: "POST",
      url: "/push/test",
      payload: testBody(),
    });
    expect(res.statusCode).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0].endpoint).toBe(ENDPOINT);
    expect(JSON.parse(sent[0].payload)).toEqual({
      category: "test_ping",
      path: "/settings",
    });

    // Someone else's endpoint: their signature doesn't own that row.
    const stranger = generateKeyPair();
    const aimed = await app.inject({
      method: "POST",
      url: "/push/test",
      payload: testBody({
        memberKey: stranger.publicKey,
        secretKey: stranger.secretKey,
      }),
    });
    // Not a member here → 403; a member without that row would 404.
    expect(aimed.statusCode).toBe(403);
    expect(sent).toHaveLength(1);
  });

  it("rejects a bad signature and a stale timestamp like every push write", async () => {
    await subscribe();
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/push/test",
          payload: testBody({ secretKey: generateKeyPair().secretKey }),
        })
      ).statusCode,
    ).toBe(401);
    // Correctly signed, but over a timestamp outside the skew window.
    const staleTs = Date.now() - 11 * 60_000;
    const stale = {
      memberKey: member.publicKey,
      deviceId: "device-1",
      endpoint: ENDPOINT,
      timestamp: staleTs,
      signature: sign(
        canonicalPushAuthMessage(
          "push-test",
          member.publicKey,
          "device-1",
          ENDPOINT,
          [],
          staleTs,
        ),
        member.secretKey,
      ),
    };
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/push/test",
          payload: stale,
        })
      ).statusCode,
    ).toBe(401);
  });
});
