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
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type { FastifyInstance } from "fastify";
import {
  canonicalEventPayload,
  generateKeyPair,
  sign,
  signStateRecord,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  Event,
  EventPayload,
  EventRsvpState,
  EventShiftState,
  ShiftSignupState,
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
  const res = await app.inject({ method: "POST", url: "/events", payload: event });
  expect(res.statusCode).toBe(201);
  return event;
}

function makeRsvp(
  member: KeyPair,
  eventId: string,
  overrides: Partial<EventRsvpState> = {},
): EventRsvpState {
  const unsigned: Omit<EventRsvpState, "signature"> = {
    id: `rsvp_${++seq}`,
    eventId,
    memberKey: member.publicKey,
    status: "going",
    respondedAt: Date.now(),
    updatedAt: Date.now(),
    signerKey: member.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature:
      overrides.signature ??
      signStateRecord<EventRsvpState>(unsigned, member.secretKey),
  };
}

function makeShift(
  signer: KeyPair,
  eventId: string,
  overrides: Partial<EventShiftState> = {},
): EventShiftState {
  const now = Date.now();
  const unsigned: Omit<EventShiftState, "signature"> = {
    id: `shift_${++seq}`,
    eventId,
    label: "Setup crew",
    startsAt: now + 80_000_000,
    endsAt: now + 90_000_000,
    capacity: 4,
    createdBy: signer.publicKey,
    createdAt: now,
    deletedAt: null,
    updatedAt: now,
    signerKey: signer.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature:
      overrides.signature ??
      signStateRecord<EventShiftState>(unsigned, signer.secretKey),
  };
}

function makeSignup(
  member: KeyPair,
  shift: EventShiftState,
  overrides: Partial<ShiftSignupState> = {},
): ShiftSignupState {
  const unsigned: Omit<ShiftSignupState, "signature"> = {
    id: `signup_${++seq}`,
    shiftId: shift.id,
    eventId: shift.eventId,
    memberKey: member.publicKey,
    signedUpAt: Date.now(),
    deletedAt: null,
    updatedAt: Date.now(),
    signerKey: member.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature:
      overrides.signature ??
      signStateRecord<ShiftSignupState>(unsigned, member.secretKey),
  };
}

async function post(url: string, payload: unknown) {
  return app.inject({ method: "POST", url, payload: payload as object });
}

describe("POST /event-rsvps", () => {
  it("accepts a member's own RSVP (201) and serves it back", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const event = await seedEvent(org);
    const rsvp = makeRsvp(member, event.id);
    const res = await post("/event-rsvps", rsvp);
    expect(res.statusCode).toBe(201);

    const listed = await app.inject({ method: "GET", url: "/event-rsvps" });
    const body = listed.json() as { count: number; eventRsvps: EventRsvpState[] };
    expect(body.count).toBe(1);
    expect(body.eventRsvps[0]).toEqual(rsvp);
  });

  it("rejects an RSVP signed by someone other than its member (403)", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const impostor = generateKeyPair();
    const event = await seedEvent(org);
    const forged = makeRsvp(impostor, event.id, {
      memberKey: member.publicKey,
      signerKey: impostor.publicKey,
    });
    const res = await post("/event-rsvps", forged);
    expect(res.statusCode).toBe(403);
    expect(res.json().reason).toBe("not_own_rsvp");
  });

  it("answers 409 for an event the node hasn't seen (retryable)", async () => {
    const member = generateKeyPair();
    const res = await post("/event-rsvps", makeRsvp(member, "ev_never"));
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe("unknown_event");
  });

  it("collapses two device-minted ids onto the natural key (LWW)", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const event = await seedEvent(org);
    // Phone and browser mint DIFFERENT row uuids for the same RSVP.
    await post("/event-rsvps", makeRsvp(member, event.id, {
      id: "rsvp_phone",
      status: "maybe",
      updatedAt: 1_000,
    }));
    await post("/event-rsvps", makeRsvp(member, event.id, {
      id: "rsvp_browser",
      status: "going",
      updatedAt: 2_000,
    }));
    const listed = await app.inject({ method: "GET", url: "/event-rsvps" });
    const rows = (listed.json() as { eventRsvps: EventRsvpState[] }).eventRsvps;
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("going");
  });

  it("answers 200 {stored:false} for a stale RSVP version", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const event = await seedEvent(org);
    await post("/event-rsvps", makeRsvp(member, event.id, { updatedAt: 5_000 }));
    const stale = makeRsvp(member, event.id, {
      status: "not_going",
      updatedAt: 4_000,
    });
    const res = await post("/event-rsvps", stale);
    expect(res.statusCode).toBe(200);
    expect(res.json().stored).toBe(false);
  });

  it("rejects tampered payloads (422) and malformed bodies (400)", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const event = await seedEvent(org);
    const rsvp = makeRsvp(member, event.id);
    expect(
      (await post("/event-rsvps", { ...rsvp, status: "maybe" })).statusCode,
    ).toBe(422);
    expect((await post("/event-rsvps", { id: "x" })).statusCode).toBe(400);
  });
});

describe("POST /event-shifts", () => {
  it("accepts the event organizer's shift; rejects anyone else's (403)", async () => {
    const org = generateKeyPair();
    const rando = generateKeyPair();
    const event = await seedEvent(org);
    expect((await post("/event-shifts", makeShift(org, event.id))).statusCode).toBe(201);

    const hostile = makeShift(rando, event.id, {
      createdBy: rando.publicKey,
    });
    const res = await post("/event-shifts", hostile);
    expect(res.statusCode).toBe(403);
    expect(res.json().reason).toBe("not_event_organizer");
  });

  it("answers 409 for an unknown event", async () => {
    const org = generateKeyPair();
    const res = await post("/event-shifts", makeShift(org, "ev_never"));
    expect(res.statusCode).toBe(409);
  });

  it("applies newer versions (capacity change) and tombstones (LWW)", async () => {
    const org = generateKeyPair();
    const event = await seedEvent(org);
    const shift = makeShift(org, event.id, { updatedAt: 1_000 });
    await post("/event-shifts", shift);

    const recap = makeShift(org, event.id, {
      id: shift.id,
      capacity: 8,
      updatedAt: 2_000,
    });
    expect((await post("/event-shifts", recap)).statusCode).toBe(201);

    const tombstone = makeShift(org, event.id, {
      id: shift.id,
      capacity: 8,
      deletedAt: Date.now(),
      updatedAt: 3_000,
    });
    expect((await post("/event-shifts", tombstone)).statusCode).toBe(201);

    const listed = await app.inject({ method: "GET", url: "/event-shifts" });
    const rows = (listed.json() as { eventShifts: EventShiftState[] }).eventShifts;
    expect(rows).toHaveLength(1);
    expect(rows[0].deletedAt).not.toBeNull();

    // A stale LIVE copy can't resurrect the deleted shift.
    const staleLive = makeShift(org, event.id, {
      id: shift.id,
      updatedAt: 2_500,
    });
    const res = await post("/event-shifts", staleLive);
    expect(res.statusCode).toBe(200);
    expect(res.json().stored).toBe(false);
  });

  it("refuses moving a shift to a different event (403)", async () => {
    const org = generateKeyPair();
    const eventA = await seedEvent(org);
    const eventB = await seedEvent(org);
    const shift = makeShift(org, eventA.id, { updatedAt: 1_000 });
    await post("/event-shifts", shift);
    const moved = makeShift(org, eventB.id, {
      id: shift.id,
      updatedAt: 2_000,
    });
    const res = await post("/event-shifts", moved);
    expect(res.statusCode).toBe(403);
    expect(res.json().reason).toBe("event_mismatch");
  });
});

describe("POST /shift-signups", () => {
  async function seedShift(org: KeyPair, eventId: string) {
    const shift = makeShift(org, eventId, { updatedAt: 1_000 });
    expect((await post("/event-shifts", shift)).statusCode).toBe(201);
    return shift;
  }

  it("accepts a member's own signup and its later withdrawal tombstone", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const event = await seedEvent(org);
    const shift = await seedShift(org, event.id);

    const signup = makeSignup(member, shift, { updatedAt: 2_000 });
    expect((await post("/shift-signups", signup)).statusCode).toBe(201);

    const withdrawal = makeSignup(member, shift, {
      deletedAt: Date.now(),
      updatedAt: 3_000,
    });
    expect((await post("/shift-signups", withdrawal)).statusCode).toBe(201);

    const listed = await app.inject({ method: "GET", url: "/shift-signups" });
    const rows = (listed.json() as { shiftSignups: ShiftSignupState[] })
      .shiftSignups;
    expect(rows).toHaveLength(1);
    expect(rows[0].deletedAt).not.toBeNull();
  });

  it("rejects a signup signed by someone else (403)", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const impostor = generateKeyPair();
    const event = await seedEvent(org);
    const shift = await seedShift(org, event.id);
    const forged = makeSignup(impostor, shift, {
      memberKey: member.publicKey,
    });
    const res = await post("/shift-signups", forged);
    expect(res.statusCode).toBe(403);
    expect(res.json().reason).toBe("not_own_signup");
  });

  it("answers 409 for an unknown shift (retryable)", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const event = await seedEvent(org);
    const ghost = makeShift(org, event.id); // never posted
    const res = await post("/shift-signups", makeSignup(member, ghost));
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe("unknown_shift");
  });

  it("rejects a signup whose eventId contradicts the shift's (400)", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const eventA = await seedEvent(org);
    const eventB = await seedEvent(org);
    const shift = await seedShift(org, eventA.id);
    const mismatched = makeSignup(member, shift, { eventId: eventB.id });
    const res = await post("/shift-signups", mismatched);
    expect(res.statusCode).toBe(400);
  });

  it("keys by (shiftId, memberKey) so two devices can't double-roster", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const event = await seedEvent(org);
    const shift = await seedShift(org, event.id);
    await post("/shift-signups", makeSignup(member, shift, {
      id: "su_phone",
      updatedAt: 2_000,
    }));
    await post("/shift-signups", makeSignup(member, shift, {
      id: "su_browser",
      updatedAt: 3_000,
    }));
    const listed = await app.inject({ method: "GET", url: "/shift-signups" });
    expect(
      (listed.json() as { shiftSignups: ShiftSignupState[] }).shiftSignups,
    ).toHaveLength(1);
  });
});
