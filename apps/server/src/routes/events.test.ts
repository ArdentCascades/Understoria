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
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3";
import type { FastifyInstance } from "fastify";
import {
  canonicalEventCancellationPayload,
  canonicalEventPayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import type {
  Event,
  EventCancellation,
  EventCancellationPayload,
  EventPayload,
} from "@understoria/shared/types";
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

interface SignedPair {
  publicKey: string;
  secretKey: Uint8Array;
}

function makeSignedEvent(
  overrides: Partial<Event> = {},
  organizer?: SignedPair,
): Event {
  const org = organizer ?? generateKeyPair();
  const createdAt = overrides.createdAt ?? Date.now();
  const payload: EventPayload = {
    id:
      overrides.id ??
      `ev_${createdAt}_${Math.random().toString(36).slice(2)}`,
    kind: "event",
    title: overrides.title ?? "Skillshare: Bicycle repair",
    description: overrides.description ?? "Hands-on basic repairs.",
    category: overrides.category ?? "skills-exchange",
    startsAt: overrides.startsAt ?? createdAt + 86_400_000,
    endsAt: overrides.endsAt ?? null,
    location: overrides.location ?? "Community room, 3rd floor",
    capacity: overrides.capacity ?? null,
    templateId: overrides.templateId ?? null,
    createdAt,
    createdBy: overrides.createdBy ?? org.publicKey,
    nodeId: overrides.nodeId ?? "node_test",
  };
  const signature =
    overrides.signature ??
    sign(canonicalEventPayload(payload), org.secretKey);
  return { ...payload, signature };
}

function makeSignedCancellation(
  event: Event,
  organizerSecret: Uint8Array,
  overrides: Partial<EventCancellation> = {},
): EventCancellation {
  const cancelledAt = overrides.cancelledAt ?? Date.now();
  const payload: EventCancellationPayload = {
    id:
      overrides.id ??
      `ec_${cancelledAt}_${Math.random().toString(36).slice(2)}`,
    kind: "event_cancellation",
    eventId: overrides.eventId ?? event.id,
    reason: overrides.reason ?? "Venue unavailable.",
    cancelledAt,
    createdBy: overrides.createdBy ?? event.createdBy,
    nodeId: overrides.nodeId ?? "node_test",
  };
  const signature =
    overrides.signature ?? sign(canonicalEventCancellationPayload(payload), organizerSecret);
  return { ...payload, signature };
}

describe("POST /events", () => {
  it("accepts a well-signed event and returns 201", async () => {
    const ev = makeSignedEvent();
    const res = await app.inject({
      method: "POST",
      url: "/events",
      payload: ev,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: ev.id });
  });

  it("rejects an event whose signature does not verify (422)", async () => {
    const ev = { ...makeSignedEvent(), signature: "0" };
    const res = await app.inject({
      method: "POST",
      url: "/events",
      payload: ev,
    });
    expect(res.statusCode).toBe(422);
    // The GET endpoint should report nothing was persisted.
    const list = await app.inject({ method: "GET", url: "/events?since=0" });
    expect(list.json().count).toBe(0);
  });

  it("rejects a body whose kind is not 'event' (400)", async () => {
    const ev = makeSignedEvent();
    const res = await app.inject({
      method: "POST",
      url: "/events",
      payload: { ...ev, kind: "Event" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects an oversized title (400)", async () => {
    const ev = makeSignedEvent();
    const res = await app.inject({
      method: "POST",
      url: "/events",
      payload: { ...ev, title: "a".repeat(201) },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects an empty title (400)", async () => {
    const ev = makeSignedEvent();
    const res = await app.inject({
      method: "POST",
      url: "/events",
      payload: { ...ev, title: "" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects an oversized description (400)", async () => {
    const ev = makeSignedEvent();
    const res = await app.inject({
      method: "POST",
      url: "/events",
      payload: { ...ev, description: "a".repeat(2001) },
    });
    expect(res.statusCode).toBe(400);
  });

  it("accepts a templated, social-category event and round-trips both (201)", async () => {
    // Phase 2: a non-null templateId + a free-text category outside the
    // legacy nine both pass and are stored verbatim. The GET proves the
    // pass-through (not the old hardcoded null) and that the stored
    // payload re-verifies on the way back out.
    const ev = makeSignedEvent({ templateId: "game-night", category: "social" });
    const res = await app.inject({ method: "POST", url: "/events", payload: ev });
    expect(res.statusCode).toBe(201);
    const list = await app.inject({ method: "GET", url: "/events?since=0" });
    const stored = (list.json().events as Event[]).find((e) => e.id === ev.id);
    expect(stored?.templateId).toBe("game-night");
    expect(stored?.category).toBe("social");
  });

  it("rejects an over-length templateId (400)", async () => {
    const ev = makeSignedEvent({ templateId: "a".repeat(51) });
    const res = await app.inject({ method: "POST", url: "/events", payload: ev });
    expect(res.statusCode).toBe(400);
  });

  it("rejects an empty-string templateId (400)", async () => {
    const ev = makeSignedEvent({ templateId: "" });
    const res = await app.inject({ method: "POST", url: "/events", payload: ev });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a missing nodeId (400)", async () => {
    const ev = makeSignedEvent();
    const res = await app.inject({
      method: "POST",
      url: "/events",
      payload: { ...ev, nodeId: "" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a non-positive startsAt (400)", async () => {
    const ev = makeSignedEvent();
    const res = await app.inject({
      method: "POST",
      url: "/events",
      payload: { ...ev, startsAt: 0 },
    });
    expect(res.statusCode).toBe(400);
  });

  it("is idempotent on re-POST of the same event id", async () => {
    const ev = makeSignedEvent();
    await app.inject({
      method: "POST",
      url: "/events",
      payload: ev,
    });
    const second = await app.inject({
      method: "POST",
      url: "/events",
      payload: ev,
    });
    expect(second.statusCode).toBe(200);
    expect(second.json()).toEqual({ stored: false, id: ev.id });
    const list = await app.inject({ method: "GET", url: "/events?since=0" });
    expect(list.json().count).toBe(1);
  });
});

describe("GET /events", () => {
  it("returns rows ordered by createdAt ASC with since= respected", async () => {
    const earlier = makeSignedEvent({ createdAt: 1_000 });
    const later = makeSignedEvent({ createdAt: 2_000 });
    await app.inject({ method: "POST", url: "/events", payload: earlier });
    await app.inject({ method: "POST", url: "/events", payload: later });

    const all = await app.inject({ method: "GET", url: "/events?since=0" });
    expect(all.json().count).toBe(2);
    const ids = (all.json().events as Event[]).map((e) => e.id);
    expect(ids).toEqual([earlier.id, later.id]);

    const since = await app.inject({
      method: "GET",
      url: "/events?since=1500",
    });
    expect(since.json().count).toBe(1);
    expect((since.json().events as Event[])[0].id).toBe(later.id);
  });

  it("honors the limit query parameter", async () => {
    for (let i = 0; i < 3; i++) {
      await app.inject({
        method: "POST",
        url: "/events",
        payload: makeSignedEvent({ createdAt: 1000 + i }),
      });
    }
    const limited = await app.inject({
      method: "GET",
      url: "/events?limit=2",
    });
    expect(limited.json().count).toBe(2);
  });
});

describe("POST /event-cancellations", () => {
  it("accepts a well-signed cancellation and returns 201", async () => {
    const org = generateKeyPair();
    const ev = makeSignedEvent({}, org);
    await app.inject({ method: "POST", url: "/events", payload: ev });

    const cancel = makeSignedCancellation(ev, org.secretKey);
    const res = await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: cancel,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ stored: true, id: cancel.id });
  });

  it("rejects with 403 when createdBy does not match the cancelled event's createdBy", async () => {
    const organizer = generateKeyPair();
    const impostor = generateKeyPair();
    const ev = makeSignedEvent({}, organizer);
    await app.inject({ method: "POST", url: "/events", payload: ev });

    // Forge a cancellation signed by the impostor key. We can't reuse
    // makeSignedCancellation directly because we need both
    // `createdBy = impostor` AND the signature to verify under
    // `impostor.secretKey`. The cross-record check fires AFTER the
    // signature check, so we sign with the impostor too.
    const cancelledAt = Date.now();
    const payload: EventCancellationPayload = {
      id: "ec_impostor",
      kind: "event_cancellation",
      eventId: ev.id,
      reason: "Try to nuke this event.",
      cancelledAt,
      createdBy: impostor.publicKey,
      nodeId: "node_test",
    };
    const cancel: EventCancellation = {
      ...payload,
      signature: sign(
        canonicalEventCancellationPayload(payload),
        impostor.secretKey,
      ),
    };
    const res = await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: cancel,
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().error).toBe("organizer_mismatch");
  });

  it("rejects an unsigned/bad-signature cancellation with 422", async () => {
    const org = generateKeyPair();
    const ev = makeSignedEvent({}, org);
    await app.inject({ method: "POST", url: "/events", payload: ev });
    const cancel = {
      ...makeSignedCancellation(ev, org.secretKey),
      signature: "0",
    };
    const res = await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: cancel,
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects a body whose kind is not 'event_cancellation' (400)", async () => {
    const org = generateKeyPair();
    const ev = makeSignedEvent({}, org);
    await app.inject({ method: "POST", url: "/events", payload: ev });
    const cancel = makeSignedCancellation(ev, org.secretKey);
    const res = await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: { ...cancel, kind: "cancellation" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects an oversized reason (400)", async () => {
    const org = generateKeyPair();
    const ev = makeSignedEvent({}, org);
    await app.inject({ method: "POST", url: "/events", payload: ev });
    const cancel = makeSignedCancellation(ev, org.secretKey, {
      reason: "a".repeat(501),
    });
    const res = await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: cancel,
    });
    expect(res.statusCode).toBe(400);
  });

  it("accepts an empty reason (per design doc §4.3)", async () => {
    const org = generateKeyPair();
    const ev = makeSignedEvent({}, org);
    await app.inject({ method: "POST", url: "/events", payload: ev });
    const cancel = makeSignedCancellation(ev, org.secretKey, { reason: "" });
    const res = await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: cancel,
    });
    expect(res.statusCode).toBe(201);
  });

  it("is idempotent on existing eventId — first-write-wins, no overwrite", async () => {
    const org = generateKeyPair();
    const ev = makeSignedEvent({}, org);
    await app.inject({ method: "POST", url: "/events", payload: ev });

    const first = makeSignedCancellation(ev, org.secretKey, {
      reason: "first",
      cancelledAt: 1_000,
    });
    await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: first,
    });
    // A different cancellation row id but same eventId.
    const second = makeSignedCancellation(ev, org.secretKey, {
      reason: "trying to overwrite",
      cancelledAt: 2_000,
    });
    const res = await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: second,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      stored: false,
      id: first.id,
      firstWriteWins: true,
    });
    // The list shows only the first cancellation, with its original
    // reason intact.
    const list = await app.inject({
      method: "GET",
      url: "/event-cancellations?since=0",
    });
    expect(list.json().count).toBe(1);
    expect(
      (list.json().eventCancellations as EventCancellation[])[0].reason,
    ).toBe("first");
  });

  it("accepts a cancellation whose event has not yet been pulled (accept-and-reconcile)", async () => {
    // Per docs/community-events.md §7 the per-kind pull cursors mean
    // a cancellation can arrive before the event row reaches us.
    // Mirroring the co-org "revocation-before-invitation" posture,
    // we accept the cancellation and let the application layer
    // reconcile when the event lands.
    const org = generateKeyPair();
    const evRef = makeSignedEvent({}, org); // crafted but NEVER POSTed
    const cancel = makeSignedCancellation(evRef, org.secretKey);
    const res = await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: cancel,
    });
    expect(res.statusCode).toBe(201);
  });
});

describe("GET /event-cancellations", () => {
  it("returns rows ordered by cancelledAt ASC with since= respected", async () => {
    const org = generateKeyPair();
    const e1 = makeSignedEvent({ createdAt: 100 }, org);
    const e2 = makeSignedEvent({ createdAt: 200 }, org);
    await app.inject({ method: "POST", url: "/events", payload: e1 });
    await app.inject({ method: "POST", url: "/events", payload: e2 });

    const c1 = makeSignedCancellation(e1, org.secretKey, {
      cancelledAt: 1_000,
    });
    const c2 = makeSignedCancellation(e2, org.secretKey, {
      cancelledAt: 2_000,
    });
    await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: c1,
    });
    await app.inject({
      method: "POST",
      url: "/event-cancellations",
      payload: c2,
    });

    const all = await app.inject({
      method: "GET",
      url: "/event-cancellations?since=0",
    });
    expect(all.json().count).toBe(2);
    const ids = (all.json().eventCancellations as EventCancellation[]).map(
      (c) => c.id,
    );
    expect(ids).toEqual([c1.id, c2.id]);

    const since = await app.inject({
      method: "GET",
      url: "/event-cancellations?since=1500",
    });
    expect(since.json().count).toBe(1);
    expect(
      (since.json().eventCancellations as EventCancellation[])[0].id,
    ).toBe(c2.id);
  });
});

// The former LOAD-BEARING NEGATIVE TESTS here ("RSVPs never federate —
// /event-rsvps is not a route") were retired by participation
// federation Phase 2 (docs/project-federation.md §6): the local-only
// stance they guarded was deliberately reversed after field use showed
// an organizer literally could not see attendance from anyone else's
// phone. The route now exists; its authority + LWW behavior is covered
// in routes/participationStates.test.ts, and the reversal's adversary
// analysis lives in threat-model §7 ("Federated participation
// records").
