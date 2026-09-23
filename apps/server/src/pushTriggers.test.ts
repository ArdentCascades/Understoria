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
  canonicalRelayedMessagePayload,
  generateKeyPair,
  sign,
  type EventShiftState,
  type KeyPair,
  type RelayedMessage,
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
  createMessageWaitingNotifier,
  MESSAGE_QUIET_PERIOD_MS,
  startReminderSweep,
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
    return startReminderSweep({
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

describe("event-reminder sweep (v2 — same clock, one level up)", () => {
  let db: DatabaseType;

  afterEach(() => {
    db.close();
  });

  function seedEvent(id: string, startsAt: number, title = "") {
    db.prepare(
      `INSERT INTO events
        (id, node_id, created_by, starts_at, ends_at, created_at,
         payload, signature)
       VALUES (?, 'node_test', 'organizer', ?, NULL, 0, ?, 'sig')`,
    ).run(id, startsAt, JSON.stringify(title ? { title } : {}));
  }

  /** The organizer's per-event disclosure flag, as the route would
   *  store it (authority already checked at write time). */
  function seedDisclosure(eventId: string, allow: boolean) {
    const payload = {
      id: `erd-${eventId}-${allow}`,
      eventId,
      allow,
      updatedAt: Date.now(),
      signerKey: "organizer",
      signature: "sig",
    };
    db.prepare(
      `INSERT OR REPLACE INTO event_reminder_disclosures
        (event_id, id, signer_key, updated_at, payload, signature)
       VALUES (?, ?, 'organizer', 1, ?, 'sig')`,
    ).run(eventId, payload.id, JSON.stringify(payload));
  }

  function seedRsvp(
    eventId: string,
    memberKey: string,
    status: "going" | "maybe" | "not_going",
  ) {
    const payload = {
      id: `rsvp-${eventId}-${memberKey}`,
      eventId,
      memberKey,
      status,
      respondedAt: 0,
      updatedAt: 1,
      signerKey: memberKey,
      signature: "sig",
    };
    db.prepare(
      `INSERT OR REPLACE INTO event_rsvps
        (event_id, member_key, id, signer_key, updated_at, payload,
         signature)
       VALUES (?, ?, ?, ?, 1, ?, 'sig')`,
    ).run(eventId, memberKey, payload.id, memberKey, JSON.stringify(payload));
  }

  function makeSweep(sent: Sent[], at: number) {
    const sender = createPushSender(
      createPushSubscriptionStore(db),
      ensureVapidKeys(db),
      captureTransport(sent),
    );
    return startReminderSweep({
      db,
      sender,
      intervalMs: 0,
      now: () => at,
    });
  }

  it("reminds each going-RSVP subscriber once, inside the window, and never for maybe/not_going", async () => {
    db = openDatabase(":memory:");
    const T = 1_700_000_000_000;
    const sent: Sent[] = [];
    seedEvent("event-soon", T + 30 * 60_000);
    seedEvent("event-far", T + 3 * 60 * 60_000);
    seedRsvp("event-soon", "member-going", "going");
    seedRsvp("event-soon", "member-maybe", "maybe");
    seedRsvp("event-soon", "member-no", "not_going");
    seedRsvp("event-far", "member-going", "going");
    for (const m of ["member-going", "member-maybe", "member-no"]) {
      subscribeRow(db, m, `https://push.example/${m}`, ["event_reminder"]);
    }

    const sweep = makeSweep(sent, T);
    expect(await sweep.sweepOnce()).toBe(1);
    expect(sent).toHaveLength(1);
    expect(sent[0].endpoint).toBe("https://push.example/member-going");
    expect(sent[0].payload).toEqual({
      category: "event_reminder",
      path: "/events/event-soon",
    });
    // Once means once.
    expect(await sweep.sweepOnce()).toBe(0);
    expect(sent).toHaveLength(1);
    sweep.stop();
  });

  it("stays silent for cancelled events, catches a late opt-in, and an RSVP flipped away never pings", async () => {
    db = openDatabase(":memory:");
    const T = 1_700_000_000_000;
    const sent: Sent[] = [];
    seedEvent("event-1", T + 30 * 60_000);
    seedRsvp("event-1", "member-late", "going");
    seedRsvp("event-1", "member-flipped", "going");
    subscribeRow(db, "member-flipped", "https://push.example/flipped", [
      "event_reminder",
    ]);

    const sweep = makeSweep(sent, T);
    // member-flipped changes their answer BEFORE the first pass —
    // the LWW row now says maybe, so send-time checking is the
    // cancellation.
    seedRsvp("event-1", "member-flipped", "maybe");
    expect(await sweep.sweepOnce()).toBe(0);
    expect(sent).toHaveLength(0);

    // The zero-device claim was released: opting in while the
    // window is still open gets the reminder on the next pass.
    subscribeRow(db, "member-late", "https://push.example/late", [
      "event_reminder",
    ]);
    expect(await sweep.sweepOnce()).toBe(1);
    expect(sent.map((s) => s.endpoint)).toEqual([
      "https://push.example/late",
    ]);
    sweep.stop();

    // A cancelled event pings no one, whatever the RSVPs say.
    db.prepare(
      `INSERT INTO event_cancellations
        (id, node_id, event_id, created_by, cancelled_at, payload, signature)
       VALUES ('c1', 'node_test', 'event-1', 'organizer', ?, '{}', 'sig')`,
    ).run(T);
    const sent2: Sent[] = [];
    seedRsvp("event-1", "member-another", "going");
    subscribeRow(db, "member-another", "https://push.example/another", [
      "event_reminder",
    ]);
    const sweep2 = makeSweep(sent2, T);
    expect(await sweep2.sweepOnce()).toBe(0);
    expect(sent2).toHaveLength(0);
    sweep2.stop();
  });
});

describe("message-waiting coalescer (v2 — the cap is the safety mechanism)", () => {
  let db: DatabaseType;

  afterEach(() => {
    db.close();
  });

  function makeNotifier(sent: Sent[], clock: { at: number }) {
    const sender = createPushSender(
      createPushSubscriptionStore(db),
      ensureVapidKeys(db),
      captureTransport(sent),
    );
    return createMessageWaitingNotifier({
      db,
      sender,
      now: () => clock.at,
    });
  }

  async function settle() {
    await new Promise((r) => setImmediate(r));
  }

  it("pings once per quiet period whatever any sender does, then again after the lapse", async () => {
    db = openDatabase(":memory:");
    const T = 1_700_000_000_000;
    const clock = { at: T };
    const sent: Sent[] = [];
    subscribeRow(db, "recipient", "https://push.example/r", [
      "message_waiting",
    ]);
    const notify = makeNotifier(sent, clock);

    notify({ senderKey: "sender-a", recipientKey: "recipient" });
    await settle();
    expect(sent).toHaveLength(1);
    // The payload names no one: category, path, and the triggering
    // sender's KEY — never a display name, never a body, never a
    // count.
    expect(sent[0].payload).toEqual({
      category: "message_waiting",
      path: "/messages",
      detail: { senderKey: "sender-a" },
    });

    // A storm inside the period — same sender, different senders —
    // changes nothing. The blocked-abuser doorbell has no clapper.
    clock.at = T + 5 * 60_000;
    notify({ senderKey: "sender-a", recipientKey: "recipient" });
    notify({ senderKey: "sender-b", recipientKey: "recipient" });
    await settle();
    expect(sent).toHaveLength(1);

    // ANOTHER recipient's first message still pings them — the cap
    // is per recipient, not global.
    subscribeRow(db, "recipient-2", "https://push.example/r2", [
      "message_waiting",
    ]);
    notify({ senderKey: "sender-a", recipientKey: "recipient-2" });
    await settle();
    expect(sent).toHaveLength(2);
    expect(sent[1].endpoint).toBe("https://push.example/r2");

    // After the period lapses, the first message pings again.
    clock.at = T + MESSAGE_QUIET_PERIOD_MS + 1;
    notify({ senderKey: "sender-c", recipientKey: "recipient" });
    await settle();
    expect(sent).toHaveLength(3);
    expect(sent[2].payload).toMatchObject({
      detail: { senderKey: "sender-c" },
    });
  });

  it("releases a zero-device claim so a mid-period opt-in hears about the NEXT message", async () => {
    db = openDatabase(":memory:");
    const T = 1_700_000_000_000;
    const clock = { at: T };
    const sent: Sent[] = [];
    const notify = makeNotifier(sent, clock);

    // Not subscribed: nothing sent, and the period is NOT spent.
    notify({ senderKey: "sender-a", recipientKey: "late-joiner" });
    await settle();
    expect(sent).toHaveLength(0);

    subscribeRow(db, "late-joiner", "https://push.example/late", [
      "message_waiting",
    ]);
    clock.at = T + 60_000; // well inside what would have been the period
    notify({ senderKey: "sender-a", recipientKey: "late-joiner" });
    await settle();
    expect(sent).toHaveLength(1);
    expect(sent[0].endpoint).toBe("https://push.example/late");
  });
});

describe("message-waiting end to end (the relay hook)", () => {
  let app: FastifyInstance;
  let db: DatabaseType;

  afterEach(async () => {
    await app.close();
    db.close();
  });

  let seq = 0;
  function envelope(from: KeyPair, toPublicKey: string): RelayedMessage {
    seq += 1;
    const base = {
      id: `msg_hook_${seq}`,
      senderKey: from.publicKey,
      recipientKey: toPublicKey,
      nonce: "bm9uY2Vub25jZW5vbmNlbm9uY2U=",
      ciphertext: "Y2lwaGVydGV4dA==",
      createdAt: Date.now(),
    };
    return {
      ...base,
      signature: sign(canonicalRelayedMessagePayload(base), from.secretKey),
    };
  }

  it("fires on the 201 insert only — an idempotent re-post pings no one", async () => {
    db = openDatabase(":memory:");
    const sent: Sent[] = [];
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      READ_AUTH: "off",
      NODE_ID: "node_test",
      RATE_LIMIT_MAX: "10000",
    } as unknown as NodeJS.ProcessEnv);
    const built = await buildServer({
      config,
      database: db,
      pushTransport: captureTransport(sent),
    });
    app = built.app;
    await app.ready();

    const sender = generateKeyPair();
    const recipient = generateKeyPair();
    subscribeRow(db, recipient.publicKey, "https://push.example/dm", [
      "message_waiting",
    ]);

    const msg = envelope(sender, recipient.publicKey);
    const post = () =>
      app.inject({ method: "POST", url: "/messages", payload: msg });

    expect((await post()).statusCode).toBe(201);
    await new Promise((r) => setImmediate(r));
    expect(sent).toHaveLength(1);
    expect(sent[0].payload).toEqual({
      category: "message_waiting",
      path: "/messages",
      detail: { senderKey: sender.publicKey },
    });

    // Re-post of the same envelope: 200, no new ping (and even a
    // NEW envelope stays quiet inside the period).
    expect((await post()).statusCode).toBe(200);
    const second = envelope(sender, recipient.publicKey);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/messages",
          payload: second,
        })
      ).statusCode,
    ).toBe(201);
    await new Promise((r) => setImmediate(r));
    expect(sent).toHaveLength(1);
  });
});

describe("named event reminders (organizer-consented detail.title)", () => {
  let db: DatabaseType;

  afterEach(() => {
    db.close();
  });

  function seedEvent(id: string, startsAt: number, title: string) {
    db.prepare(
      `INSERT INTO events
        (id, node_id, created_by, starts_at, ends_at, created_at,
         payload, signature)
       VALUES (?, 'node_test', 'organizer', ?, NULL, 0, ?, 'sig')`,
    ).run(id, startsAt, JSON.stringify({ title }));
  }

  function seedDisclosure(eventId: string, allow: boolean, at = 1) {
    const payload = {
      id: `erd-${eventId}-${at}`,
      eventId,
      allow,
      updatedAt: at,
      signerKey: "organizer",
      signature: "sig",
    };
    db.prepare(
      `INSERT OR REPLACE INTO event_reminder_disclosures
        (event_id, id, signer_key, updated_at, payload, signature)
       VALUES (?, ?, 'organizer', ?, ?, 'sig')`,
    ).run(eventId, payload.id, at, JSON.stringify(payload));
  }

  function seedRsvp(eventId: string, memberKey: string) {
    const payload = {
      id: `rsvp-${eventId}-${memberKey}`,
      eventId,
      memberKey,
      status: "going",
      respondedAt: 0,
      updatedAt: 1,
      signerKey: memberKey,
      signature: "sig",
    };
    db.prepare(
      `INSERT OR REPLACE INTO event_rsvps
        (event_id, member_key, id, signer_key, updated_at, payload,
         signature)
       VALUES (?, ?, ?, ?, 1, ?, 'sig')`,
    ).run(eventId, memberKey, payload.id, memberKey, JSON.stringify(payload));
  }

  function makeSweep(sent: Sent[], at: number) {
    const sender = createPushSender(
      createPushSubscriptionStore(db),
      ensureVapidKeys(db),
      captureTransport(sent),
    );
    return startReminderSweep({
      db,
      sender,
      intervalMs: 0,
      now: () => at,
    });
  }

  it("carries the title ONLY where the organizer's flag allows it — absence stays generic", async () => {
    db = openDatabase(":memory:");
    const T = 1_700_000_000_000;
    const sent: Sent[] = [];
    seedEvent("ev-named", T + 30 * 60_000, "Seed swap at the pavilion");
    seedEvent("ev-quiet", T + 30 * 60_000, "Support circle");
    seedDisclosure("ev-named", true);
    // ev-quiet has NO disclosure record — every event's default.
    seedRsvp("ev-named", "member-a");
    seedRsvp("ev-quiet", "member-a");
    subscribeRow(db, "member-a", "https://push.example/a", [
      "event_reminder",
    ]);

    const sweep = makeSweep(sent, T);
    expect(await sweep.sweepOnce()).toBe(2);
    const named = sent.find((s) =>
      JSON.stringify(s.payload).includes("ev-named"),
    );
    const quiet = sent.find((s) =>
      JSON.stringify(s.payload).includes("ev-quiet"),
    );
    expect(named?.payload).toEqual({
      category: "event_reminder",
      path: "/events/ev-named",
      detail: { title: "Seed swap at the pavilion" },
    });
    // No disclosure → category data only, exactly as before v2.
    expect(quiet?.payload).toEqual({
      category: "event_reminder",
      path: "/events/ev-quiet",
    });
    sweep.stop();
  });

  it("a retraction strips the title at send time, and the shift clock honors the event's flag", async () => {
    db = openDatabase(":memory:");
    const T = 1_700_000_000_000;
    const sent: Sent[] = [];
    seedEvent("ev-1", T + 30 * 60_000, "Tool library open house");
    seedDisclosure("ev-1", true, 1);
    seedDisclosure("ev-1", false, 2); // organizer changed their mind
    seedRsvp("ev-1", "member-a");
    // A shift on a DISCLOSED event carries the title too.
    seedEvent("ev-2", T + 6 * 60 * 60_000, "River cleanup");
    seedDisclosure("ev-2", true);
    createEventShiftStateStore(db).upsert({
      id: "shift-1",
      eventId: "ev-2",
      label: "Morning crew",
      startsAt: T + 30 * 60_000,
      endsAt: T + 2 * 60 * 60_000,
      capacity: null,
      createdBy: "organizer",
      createdAt: 0,
      deletedAt: null,
      updatedAt: 1,
      signerKey: "organizer",
      signature: "sig",
    });
    createShiftSignupStateStore(db).upsert({
      id: "signup-1",
      shiftId: "shift-1",
      eventId: "ev-2",
      memberKey: "member-a",
      signedUpAt: 0,
      deletedAt: null,
      updatedAt: 1,
      signerKey: "member-a",
      signature: "sig",
    });
    subscribeRow(db, "member-a", "https://push.example/a", [
      "event_reminder",
      "shift_reminder",
    ]);

    const sweep = makeSweep(sent, T);
    expect(await sweep.sweepOnce()).toBe(2);
    const eventPing = sent.find(
      (s) => s.payload.category === "event_reminder",
    );
    const shiftPing = sent.find(
      (s) => s.payload.category === "shift_reminder",
    );
    // Retracted: back to category data only.
    expect(eventPing?.payload).toEqual({
      category: "event_reminder",
      path: "/events/ev-1",
    });
    // The shift ping names its (still-disclosed) event.
    expect(shiftPing?.payload).toEqual({
      category: "shift_reminder",
      path: "/events/ev-2",
      detail: { title: "River cleanup" },
    });
    sweep.stop();
  });
});
