/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The send triggers (docs/notifications.md) — the leg between a
// member's opt-in and a real ping, tested with an injected transport
// so nothing real is ever sent. What these pin: the ping goes to the
// ONE person with something on the other end (the party whose word is
// missing; the member who signed up), exactly once, only inside the
// window, never for cancelled or withdrawn things, and never to
// anyone who didn't opt in.
import { afterEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  canonicalAwaitingTransitionPayload,
  generateKeyPair,
  sign,
  type EventShiftState,
  type ShiftSignupState,
} from "@understoria/shared";
import { buildServer } from "./server.js";
import { readConfigFromEnv } from "./config.js";
import {
  createEventShiftStateStore,
  createPushSubscriptionStore,
  createShiftSignupStateStore,
  openDatabase,
} from "./db.js";
import { createPushSender, ensureVapidKeys } from "./push.js";
import {
  awaitingConfirmationPath,
  awaitingConfirmationTarget,
  startShiftReminderSweep,
} from "./pushTriggers.js";

type Sent = { endpoint: string; payload: Record<string, unknown> };

function captureTransport(sent: Sent[]) {
  return async (
    subscription: { endpoint: string },
    payload: string,
  ): Promise<void> => {
    sent.push({
      endpoint: subscription.endpoint,
      payload: JSON.parse(payload) as Record<string, unknown>,
    });
  };
}

function subscribeRow(
  db: DatabaseType,
  memberKey: string,
  endpoint: string,
  categories: string[],
  now = Date.now(),
) {
  createPushSubscriptionStore(db).upsert({
    endpoint,
    memberKey,
    deviceId: `device-${endpoint}`,
    p256dh: "p",
    auth: "a",
    categories: categories as never,
    createdAt: now,
    renewedAt: now,
  });
}

describe("awaiting-confirmation targeting (pure)", () => {
  it("routes to the party whose word is missing, at the right path", () => {
    const record = { helperKey: "H", helpedKey: "R", signedBy: "H" };
    expect(awaitingConfirmationTarget(record)).toBe("R");
    expect(
      awaitingConfirmationTarget({ ...record, signedBy: "R" }),
    ).toBe("H");
    expect(awaitingConfirmationPath("post_1")).toBe("/post/post_1");
    expect(awaitingConfirmationPath("project:p1/task:t9")).toBe(
      "/project/p1/task/t9",
    );
  });
});

describe("awaiting-confirmation trigger (route hook, injected transport)", () => {
  let app: FastifyInstance;
  let db: DatabaseType;

  afterEach(async () => {
    await app.close();
    db.close();
  });

  it("pings the counterparty once, on first store only, and only if subscribed", async () => {
    db = openDatabase(":memory:");
    const member = generateKeyPair();
    const sent: Sent[] = [];
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
      pushTransport: captureTransport(sent),
    });
    app = built.app;
    await app.ready();

    // The member (helped side) opted into the category; the helper
    // who marks the work done has no subscription — and must never
    // be pinged anyway (they just acted).
    subscribeRow(db, member.publicKey, "https://push.example/helped", [
      "awaiting_confirmation",
    ]);

    const helper = generateKeyPair();
    const payload = {
      kind: "awaiting_transition" as const,
      postId: "post_9",
      helperKey: helper.publicKey,
      helpedKey: member.publicKey,
      signedBy: helper.publicKey,
      enteredAt: Date.now(),
      nodeId: "node_test",
    };
    const artifact = {
      ...payload,
      signature: sign(
        canonicalAwaitingTransitionPayload(payload),
        helper.secretKey,
      ),
    };
    const post = () =>
      app.inject({
        method: "POST",
        url: "/awaiting-transitions",
        payload: artifact,
      });

    expect((await post()).statusCode).toBe(201);
    // The hook is fire-and-forget; let its microtask land.
    await new Promise((r) => setImmediate(r));
    expect(sent).toHaveLength(1);
    expect(sent[0].endpoint).toBe("https://push.example/helped");
    expect(sent[0].payload).toEqual({
      category: "awaiting_confirmation",
      path: "/post/post_9",
    });

    // Idempotent re-push (200): first-writer-wins is the dedupe.
    expect((await post()).statusCode).toBe(200);
    await new Promise((r) => setImmediate(r));
    expect(sent).toHaveLength(1);
  });
});

describe("shift-reminder sweep (injected transport, fake clock)", () => {
  let db: DatabaseType;

  afterEach(() => {
    db.close();
  });

  function seedShift(
    over: Partial<EventShiftState> = {},
  ): EventShiftState {
    const shift: EventShiftState = {
      id: "shift-1",
      eventId: "event-1",
      label: "Door greeter",
      startsAt: 0,
      endsAt: 0,
      capacity: null,
      createdBy: "organizer",
      createdAt: 0,
      deletedAt: null,
      updatedAt: 1,
      signerKey: "organizer",
      signature: "sig",
      ...over,
    };
    createEventShiftStateStore(db).upsert(shift);
    return shift;
  }

  function seedSignup(
    shift: EventShiftState,
    memberKey: string,
    over: Partial<ShiftSignupState> = {},
  ) {
    createShiftSignupStateStore(db).upsert({
      id: `signup-${memberKey}`,
      shiftId: shift.id,
      eventId: shift.eventId,
      memberKey,
      signedUpAt: 0,
      deletedAt: null,
      updatedAt: 1,
      signerKey: memberKey,
      signature: "sig",
      ...over,
    });
  }

  function makeSweep(sent: Sent[], at: number) {
    const sender = createPushSender(
      createPushSubscriptionStore(db),
      ensureVapidKeys(db),
      captureTransport(sent),
    );
    return startShiftReminderSweep({
      db,
      sender,
      intervalMs: 0,
      now: () => at,
    });
  }

  it("reminds each signed-up subscriber once, inside the lead window only", async () => {
    db = openDatabase(":memory:");
    const T = 1_700_000_000_000;
    const sent: Sent[] = [];
    const inWindow = seedShift({ startsAt: T + 30 * 60_000 });
    // A second shift too far out: nothing fires for it this pass.
    seedShift({ id: "shift-far", startsAt: T + 3 * 60 * 60_000 });
    seedSignup(inWindow, "member-a");
    seedSignup({ ...inWindow, id: "shift-far" } as EventShiftState, "member-a");
    subscribeRow(db, "member-a", "https://push.example/a", [
      "shift_reminder",
    ]);

    const sweep = makeSweep(sent, T);
    expect(await sweep.sweepOnce()).toBe(1);
    expect(sent).toHaveLength(1);
    expect(sent[0].payload).toEqual({
      category: "shift_reminder",
      path: "/events/event-1",
    });
    // Once means once — the ledger survives another pass.
    expect(await sweep.sweepOnce()).toBe(0);
    expect(sent).toHaveLength(1);
    sweep.stop();
  });

  it("stays silent for cancelled events, withdrawn signups, and members who never opted in — but catches a late opt-in", async () => {
    db = openDatabase(":memory:");
    const T = 1_700_000_000_000;
    const sent: Sent[] = [];
    const shift = seedShift({ startsAt: T + 30 * 60_000 });
    seedSignup(shift, "member-quiet"); // never subscribes
    seedSignup(shift, "member-gone", { deletedAt: T - 1000 }); // withdrew
    seedSignup(shift, "member-late"); // subscribes between passes

    const sweep = makeSweep(sent, T);
    expect(await sweep.sweepOnce()).toBe(0);
    expect(sent).toHaveLength(0);

    // The default member stays untouched, but the claim was released
    // — so flipping the category on while the window is open still
    // gets the reminder on the next pass.
    subscribeRow(db, "member-late", "https://push.example/late", [
      "shift_reminder",
    ]);
    expect(await sweep.sweepOnce()).toBe(1);
    expect(sent.map((s) => s.endpoint)).toEqual([
      "https://push.example/late",
    ]);
    sweep.stop();

    // Cancelled event: its shifts ping no one, whatever the window.
    db.prepare(
      `INSERT INTO event_cancellations
        (id, node_id, event_id, created_by, cancelled_at, payload, signature)
       VALUES ('c1', 'node_test', 'event-1', 'organizer', ?, '{}', 'sig')`,
    ).run(T);
    const sent2: Sent[] = [];
    subscribeRow(db, "member-quiet", "https://push.example/quiet", [
      "shift_reminder",
    ]);
    const sweep2 = makeSweep(sent2, T);
    expect(await sweep2.sweepOnce()).toBe(0);
    expect(sent2).toHaveLength(0);
    sweep2.stop();
  });

  it("never pings a tombstoned shift", async () => {
    db = openDatabase(":memory:");
    const T = 1_700_000_000_000;
    const sent: Sent[] = [];
    const shift = seedShift({
      startsAt: T + 30 * 60_000,
      deletedAt: T - 1000,
    });
    seedSignup(shift, "member-a");
    subscribeRow(db, "member-a", "https://push.example/a", [
      "shift_reminder",
    ]);
    const sweep = makeSweep(sent, T);
    expect(await sweep.sweepOnce()).toBe(0);
    expect(sent).toHaveLength(0);
    sweep.stop();
  });
});
