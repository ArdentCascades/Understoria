/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// Event reminder disclosures (docs/notifications.md v2 — named
// event reminders). What these pin: only the stored event's
// organizer can sign one (nobody flags someone else's event onto
// lock screens), a disclosure without its event is a retryable 409
// (mirror ordering), retraction keeps winning LWW, and the record
// carries a boolean — never the title, which stays on the event
// where it always was.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  canonicalEventPayload,
  generateKeyPair,
  sign,
  signStateRecord,
  type Event,
  type EventPayload,
  type EventReminderDisclosure,
  type KeyPair,
} from "@understoria/shared";
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

async function seedEvent(organizer: KeyPair): Promise<Event> {
  const createdAt = Date.now();
  const payload: EventPayload = {
    id: `ev_${++seq}`,
    kind: "event",
    title: "Community potluck",
    description: "",
    category: "food",
    startsAt: createdAt + 86_400_000,
    endsAt: null,
    location: "The park pavilion",
    capacity: null,
    templateId: null,
    createdAt,
    createdBy: organizer.publicKey,
    nodeId: "node_test",
  };
  const event: Event = {
    ...payload,
    signature: sign(canonicalEventPayload(payload), organizer.secretKey),
  };
  const res = await app.inject({
    method: "POST",
    url: "/events",
    payload: event,
  });
  expect(res.statusCode).toBe(201);
  return event;
}

function makeDisclosure(
  signer: KeyPair,
  eventId: string,
  overrides: Partial<EventReminderDisclosure> = {},
): EventReminderDisclosure {
  const unsigned: Omit<EventReminderDisclosure, "signature"> = {
    id: `erd_${++seq}`,
    eventId,
    allow: true,
    updatedAt: Date.now(),
    signerKey: signer.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature:
      overrides.signature ??
      signStateRecord<EventReminderDisclosure>(unsigned, signer.secretKey),
  };
}

describe("POST /event-reminder-disclosures", () => {
  it("stores the organizer's own flag and serves it back — a boolean, never the title", async () => {
    const organizer = generateKeyPair();
    const event = await seedEvent(organizer);
    const disclosure = makeDisclosure(organizer, event.id);
    const res = await app.inject({
      method: "POST",
      url: "/event-reminder-disclosures",
      payload: disclosure,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: disclosure.id });

    const feed = await app.inject({
      method: "GET",
      url: "/event-reminder-disclosures",
    });
    const body = feed.json() as {
      count: number;
      eventReminderDisclosures: EventReminderDisclosure[];
    };
    expect(body.count).toBe(1);
    expect(body.eventReminderDisclosures[0]).toEqual(disclosure);
    // The record's whole vocabulary: the title never rides it.
    expect(Object.keys(body.eventReminderDisclosures[0]).sort()).toEqual([
      "allow",
      "eventId",
      "id",
      "signature",
      "signerKey",
      "updatedAt",
    ]);
  });

  it("refuses anyone but the stored event's organizer — nobody names someone else's event", async () => {
    const organizer = generateKeyPair();
    const rando = generateKeyPair();
    const event = await seedEvent(organizer);
    const forged = makeDisclosure(rando, event.id);
    const res = await app.inject({
      method: "POST",
      url: "/event-reminder-disclosures",
      payload: forged,
    });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toMatchObject({
      error: "not_authorized",
      reason: "not_event_organizer",
    });
  });

  it("409s a disclosure for an event this node doesn't hold yet — the mirror's halt-and-retry ordering", async () => {
    const organizer = generateKeyPair();
    const res = await app.inject({
      method: "POST",
      url: "/event-reminder-disclosures",
      payload: makeDisclosure(organizer, "ev_never_seen"),
    });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toMatchObject({ error: "unknown_event" });
  });

  it("LWW: retraction (allow:false) wins and a stale allowing copy cannot resurrect it", async () => {
    const organizer = generateKeyPair();
    const event = await seedEvent(organizer);
    const t = Date.now();
    await app.inject({
      method: "POST",
      url: "/event-reminder-disclosures",
      payload: makeDisclosure(organizer, event.id, { updatedAt: t }),
    });
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/event-reminder-disclosures",
          payload: makeDisclosure(organizer, event.id, {
            allow: false,
            updatedAt: t + 10,
          }),
        })
      ).statusCode,
    ).toBe(201);
    const stale = makeDisclosure(organizer, event.id, {
      allow: true,
      updatedAt: t - 10,
    });
    const staleRes = await app.inject({
      method: "POST",
      url: "/event-reminder-disclosures",
      payload: stale,
    });
    expect(staleRes.statusCode).toBe(200);
    expect(staleRes.json()).toEqual({ stored: false, id: stale.id });

    const feed = await app.inject({
      method: "GET",
      url: "/event-reminder-disclosures",
    });
    const body = feed.json() as {
      eventReminderDisclosures: EventReminderDisclosure[];
    };
    expect(body.eventReminderDisclosures).toHaveLength(1);
    expect(body.eventReminderDisclosures[0].allow).toBe(false);
  });

  it("refuses tampered and malformed bodies", async () => {
    const organizer = generateKeyPair();
    const event = await seedEvent(organizer);
    const disclosure = makeDisclosure(organizer, event.id);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/event-reminder-disclosures",
          payload: { ...disclosure, allow: false },
        })
      ).statusCode,
    ).toBe(422);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/event-reminder-disclosures",
          payload: { eventId: event.id },
        })
      ).statusCode,
    ).toBe(400);
  });
});
