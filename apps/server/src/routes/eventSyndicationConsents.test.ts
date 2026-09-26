/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// Event syndication consents (docs/calendar.md §10.6 — the
// organizer-consented calendar feed). What these pin: only the
// stored event's organizer can sign one (nobody publishes someone
// else's event onto public calendars), a consent without its event
// is a retryable 409 (mirror ordering), retraction keeps winning
// LWW, and the record carries a boolean — never the event's fields,
// which stay on the event where they always were.
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
  type EventSyndicationConsent,
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

function makeConsent(
  signer: KeyPair,
  eventId: string,
  overrides: Partial<EventSyndicationConsent> = {},
): EventSyndicationConsent {
  const unsigned: Omit<EventSyndicationConsent, "signature"> = {
    id: `esc_${++seq}`,
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
      signStateRecord<EventSyndicationConsent>(unsigned, signer.secretKey),
  };
}

describe("POST /event-syndication-consents", () => {
  it("stores the organizer's own flag and serves it back — a boolean, never event fields", async () => {
    const organizer = generateKeyPair();
    const event = await seedEvent(organizer);
    const consent = makeConsent(organizer, event.id);
    const res = await app.inject({
      method: "POST",
      url: "/event-syndication-consents",
      payload: consent,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: consent.id });

    const feed = await app.inject({
      method: "GET",
      url: "/event-syndication-consents",
    });
    const body = feed.json() as {
      count: number;
      eventSyndicationConsents: EventSyndicationConsent[];
    };
    expect(body.count).toBe(1);
    expect(body.eventSyndicationConsents[0]).toEqual(consent);
    // The record's whole vocabulary: no event field ever rides it.
    expect(Object.keys(body.eventSyndicationConsents[0]).sort()).toEqual([
      "allow",
      "eventId",
      "id",
      "signature",
      "signerKey",
      "updatedAt",
    ]);
  });

  it("refuses anyone but the stored event's organizer — nobody publishes someone else's event", async () => {
    const organizer = generateKeyPair();
    const rando = generateKeyPair();
    const event = await seedEvent(organizer);
    const forged = makeConsent(rando, event.id);
    const res = await app.inject({
      method: "POST",
      url: "/event-syndication-consents",
      payload: forged,
    });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toMatchObject({
      error: "not_authorized",
      reason: "not_event_organizer",
    });
  });

  it("409s a consent for an event this node doesn't hold yet — the mirror's halt-and-retry ordering", async () => {
    const organizer = generateKeyPair();
    const res = await app.inject({
      method: "POST",
      url: "/event-syndication-consents",
      payload: makeConsent(organizer, "ev_never_seen"),
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
      url: "/event-syndication-consents",
      payload: makeConsent(organizer, event.id, { updatedAt: t }),
    });
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/event-syndication-consents",
          payload: makeConsent(organizer, event.id, {
            allow: false,
            updatedAt: t + 10,
          }),
        })
      ).statusCode,
    ).toBe(201);
    const stale = makeConsent(organizer, event.id, {
      allow: true,
      updatedAt: t - 10,
    });
    const staleRes = await app.inject({
      method: "POST",
      url: "/event-syndication-consents",
      payload: stale,
    });
    expect(staleRes.statusCode).toBe(200);
    expect(staleRes.json()).toEqual({ stored: false, id: stale.id });

    const feed = await app.inject({
      method: "GET",
      url: "/event-syndication-consents",
    });
    const body = feed.json() as {
      eventSyndicationConsents: EventSyndicationConsent[];
    };
    expect(body.eventSyndicationConsents).toHaveLength(1);
    expect(body.eventSyndicationConsents[0].allow).toBe(false);
  });

  it("refuses tampered and malformed bodies", async () => {
    const organizer = generateKeyPair();
    const event = await seedEvent(organizer);
    const consent = makeConsent(organizer, event.id);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/event-syndication-consents",
          payload: { ...consent, allow: false },
        })
      ).statusCode,
    ).toBe(422);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/event-syndication-consents",
          payload: { eventId: event.id },
        })
      ).statusCode,
    ).toBe(400);
  });
});
