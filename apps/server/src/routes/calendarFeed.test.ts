/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The organizer-consented public calendar feed (docs/calendar.md
// §10.6). What these pin, in threat-model order:
//
//   - OFF by default: no CALENDAR_FEED_TOKEN, no endpoint — and a
//     wrong token answers the identical 404, so a prober can't even
//     learn the feature exists. (The guard half of the design's
//     "quiet drift toward public-by-default" mitigation.)
//   - An event WITHOUT a consent record never enters the feed; a
//     retraction removes it on the next render.
//   - Only LOCAL-origin events syndicate — a mirrored peer event
//     with a valid consent stays out of THIS node's feed.
//   - A cancelled consented event stays listed as STATUS:CANCELLED
//     (subscribers see the cancellation, not a silent ghost).
//   - Member-controlled text cannot inject ICS properties (the
//     shared escaper is the boundary; this exercises it end to end).
//   - Past events age out; the body carries no RSVP, member, or
//     alarm properties; unchanged feeds 304 on If-None-Match.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  canonicalEventCancellationPayload,
  canonicalEventPayload,
  generateKeyPair,
  sign,
  signStateRecord,
  type Event,
  type EventCancellation,
  type EventPayload,
  type EventSyndicationConsent,
  type KeyPair,
} from "@understoria/shared";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase, createEventStore } from "../db.js";

const FEED_TOKEN = "feed-token-for-tests";
const DAY = 86_400_000;

let app: FastifyInstance;
let db: DatabaseType;

async function freshServer(env: Record<string, string> = {}) {
  db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    READ_AUTH: "off",
    NODE_ID: "node_test",
    RATE_LIMIT_MAX: "10000",
    CALENDAR_FEED_TOKEN: FEED_TOKEN,
    ...env,
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  app = built.app;
  await app.ready();
}

afterEach(async () => {
  await app.close();
  db.close();
});

let seq = 0;

function makeEvent(
  organizer: KeyPair,
  overrides: Partial<EventPayload> = {},
): Event {
  const createdAt = Date.now();
  const payload: EventPayload = {
    id: `ev_${++seq}`,
    kind: "event",
    title: "Community potluck",
    description: "Bring a dish",
    category: "food",
    startsAt: createdAt + DAY,
    endsAt: createdAt + DAY + 2 * 60 * 60 * 1000,
    location: "The park pavilion",
    capacity: null,
    templateId: null,
    createdAt,
    createdBy: organizer.publicKey,
    nodeId: "node_test",
    ...overrides,
  };
  return {
    ...payload,
    signature: sign(canonicalEventPayload(payload), organizer.secretKey),
  };
}

async function postEvent(event: Event): Promise<void> {
  const res = await app.inject({
    method: "POST",
    url: "/events",
    payload: event,
  });
  expect(res.statusCode).toBe(201);
}

async function postConsent(
  organizer: KeyPair,
  eventId: string,
  overrides: Partial<EventSyndicationConsent> = {},
): Promise<void> {
  const unsigned: Omit<EventSyndicationConsent, "signature"> = {
    id: `esc_${++seq}`,
    eventId,
    allow: true,
    updatedAt: Date.now(),
    signerKey: organizer.publicKey,
    ...overrides,
  };
  const consent: EventSyndicationConsent = {
    ...unsigned,
    signature: signStateRecord<EventSyndicationConsent>(
      unsigned,
      organizer.secretKey,
    ),
  };
  const res = await app.inject({
    method: "POST",
    url: "/event-syndication-consents",
    payload: consent,
  });
  expect([200, 201]).toContain(res.statusCode);
}

async function fetchFeed(token = FEED_TOKEN) {
  return app.inject({ method: "GET", url: `/calendar/${token}.ics` });
}

describe("GET /calendar/<token>.ics", () => {
  it("does not exist without CALENDAR_FEED_TOKEN, and a wrong token answers the identical 404", async () => {
    await freshServer({ CALENDAR_FEED_TOKEN: "" });
    const disabled = await fetchFeed("anything");
    expect(disabled.statusCode).toBe(404);
    await app.close();
    db.close();

    await freshServer();
    const wrong = await fetchFeed("not-the-token");
    expect(wrong.statusCode).toBe(404);
    expect(wrong.body).toBe(disabled.body);
    const noSuffix = await app.inject({
      method: "GET",
      url: `/calendar/${FEED_TOKEN}`,
    });
    expect(noSuffix.statusCode).toBe(404);
    expect(noSuffix.body).toBe(disabled.body);
  });

  it("serves only consented events; no consent means absent, retraction removes on the next render", async () => {
    await freshServer();
    const organizer = generateKeyPair();
    const consented = makeEvent(organizer, { title: "Street cleanup" });
    const quiet = makeEvent(organizer, { title: "Support circle" });
    await postEvent(consented);
    await postEvent(quiet);
    const t = Date.now();
    await postConsent(organizer, consented.id, { updatedAt: t });

    let res = await fetchFeed();
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/calendar");
    expect(res.body).toContain("SUMMARY:Street cleanup");
    expect(res.body).toContain(`UID:${consented.id}@node_test`);
    expect(res.body).not.toContain("Support circle");
    // Never any member identity, RSVP, or app-scheduled alarm.
    expect(res.body).not.toContain("ATTENDEE");
    expect(res.body).not.toContain("ORGANIZER");
    expect(res.body).not.toContain("VALARM");
    expect(res.body).not.toContain(organizer.publicKey);

    await postConsent(organizer, consented.id, {
      allow: false,
      updatedAt: t + 10,
    });
    res = await fetchFeed();
    expect(res.body).not.toContain("Street cleanup");
  });

  it("keeps LOCAL-origin only: a mirrored peer event with a valid consent stays out", async () => {
    await freshServer();
    const organizer = generateKeyPair();
    const remote = makeEvent(organizer, {
      title: "Peer potluck",
      nodeId: "node_peer",
    });
    // Insert at the store layer, as the mirror worker would.
    createEventStore(db).insert(remote);
    const unsigned: Omit<EventSyndicationConsent, "signature"> = {
      id: `esc_${++seq}`,
      eventId: remote.id,
      allow: true,
      updatedAt: Date.now(),
      signerKey: organizer.publicKey,
    };
    const consent: EventSyndicationConsent = {
      ...unsigned,
      signature: signStateRecord<EventSyndicationConsent>(
        unsigned,
        organizer.secretKey,
      ),
    };
    const res = await app.inject({
      method: "POST",
      url: "/event-syndication-consents",
      payload: consent,
    });
    expect(res.statusCode).toBe(201);

    const feed = await fetchFeed();
    expect(feed.body).not.toContain("Peer potluck");
  });

  it("a cancelled consented event stays listed as STATUS:CANCELLED", async () => {
    await freshServer();
    const organizer = generateKeyPair();
    const event = makeEvent(organizer, { title: "Rainy-day picnic" });
    await postEvent(event);
    await postConsent(organizer, event.id);
    const cxlPayload = {
      id: `cxl_${++seq}`,
      kind: "event_cancellation" as const,
      eventId: event.id,
      reason: "storm",
      cancelledAt: Date.now(),
      createdBy: organizer.publicKey,
      nodeId: "node_test",
    };
    const cancellation: EventCancellation = {
      ...cxlPayload,
      signature: sign(
        canonicalEventCancellationPayload(cxlPayload),
        organizer.secretKey,
      ),
    };
    const res = await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: cancellation,
    });
    expect(res.statusCode).toBe(201);

    const feed = await fetchFeed();
    expect(feed.body).toContain("SUMMARY:Rainy-day picnic");
    expect(feed.body).toContain("STATUS:CANCELLED");
  });

  it("member-controlled text cannot inject ICS properties (the shared escaper holds)", async () => {
    await freshServer();
    const organizer = generateKeyPair();
    const hostile = makeEvent(organizer, {
      title: "Picnic\r\nATTENDEE:mailto:injected@example.org",
      description: "line one\nBEGIN:VALARM",
      location: "park; shelter, back",
    });
    await postEvent(hostile);
    await postConsent(organizer, hostile.id);

    const feed = await fetchFeed();
    expect(feed.statusCode).toBe(200);
    // The newline arrives escaped as the literal \n sequence — no
    // content line in the output starts with an injected property.
    for (const line of feed.body.split("\r\n")) {
      expect(line.startsWith("ATTENDEE")).toBe(false);
      expect(line.startsWith("BEGIN:VALARM")).toBe(false);
    }
    expect(feed.body).toContain("SUMMARY:Picnic\\nATTENDEE");
    expect(feed.body).toContain("LOCATION:park\\; shelter\\, back");
  });

  it("past events age out of the feed", async () => {
    await freshServer();
    const organizer = generateKeyPair();
    const past = makeEvent(organizer, {
      title: "Last month's swap meet",
      startsAt: Date.now() - 30 * DAY,
      endsAt: Date.now() - 30 * DAY + 60 * 60 * 1000,
    });
    await postEvent(past);
    await postConsent(organizer, past.id);
    const feed = await fetchFeed();
    expect(feed.statusCode).toBe(200);
    expect(feed.body).not.toContain("swap meet");
  });

  it("an unchanged feed answers 304 to If-None-Match", async () => {
    await freshServer();
    const organizer = generateKeyPair();
    const event = makeEvent(organizer, { title: "Repair café" });
    await postEvent(event);
    await postConsent(organizer, event.id);

    const first = await fetchFeed();
    const etag = first.headers.etag as string;
    expect(etag).toBeTruthy();
    const second = await app.inject({
      method: "GET",
      url: `/calendar/${FEED_TOKEN}.ics`,
      headers: { "if-none-match": etag },
    });
    expect(second.statusCode).toBe(304);
  });
});
