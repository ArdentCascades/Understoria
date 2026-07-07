/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateKeyPair,
  signStateRecord,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  EventRsvpState,
  EventShiftState,
  ShiftSignupState,
} from "@understoria/shared/types";
import type { EventShiftRow } from "@/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import type { EventRow } from "@/db/database";
import { persistSecretKey } from "@/db/secrets";
import { rsvpToEvent } from "@/db/events";
import {
  addShift,
  deleteShift,
  removeSignup,
  signUpForShift,
} from "@/db/eventShifts";
import {
  pullFederatedEventRsvps,
  pullFederatedEventShifts,
  pullFederatedShiftSignups,
} from "./federationSync";

const SHIFT_CURSOR = "federationLastEventShiftPull";
const NOW = 1_700_000_000_000;

async function reset() {
  await Promise.all([
    db.events.clear(),
    db.eventCancellations.clear(),
    db.eventRsvps.clear(),
    db.eventShifts.clear(),
    db.shiftSignups.clear(),
    db.blocks.clear(),
    db.outbox.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
  ]);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
}

function seedEventRow(organizer: KeyPair, id: string): EventRow {
  return {
    id,
    kind: "event",
    title: "Potluck",
    description: "",
    category: "food",
    startsAt: Date.now() + 86_400_000,
    endsAt: null,
    location: "Park",
    capacity: null,
    templateId: null,
    createdAt: NOW,
    createdBy: organizer.publicKey,
    nodeId: "node_a",
    signature: "sentinel",
  };
}

function baseShift(eventId: string, organizer: KeyPair, id: string): EventShiftRow {
  return {
    id,
    eventId,
    label: "Setup crew",
    startsAt: Date.now() + 80_000_000,
    endsAt: Date.now() + 90_000_000,
    capacity: 4,
    createdBy: organizer.publicKey,
    createdAt: NOW,
  };
}

function signedShift(
  signer: KeyPair,
  base: EventShiftRow,
  updatedAt: number,
  overrides: Partial<EventShiftState> = {},
): EventShiftState {
  const unsigned = {
    ...base,
    deletedAt: null,
    ...overrides,
    updatedAt,
    signerKey: signer.publicKey,
  };
  delete (unsigned as Partial<EventShiftState>).signature;
  return {
    ...unsigned,
    signature: signStateRecord<EventShiftState>(unsigned, signer.secretKey),
  } as EventShiftState;
}

function signedRsvp(
  member: KeyPair,
  eventId: string,
  updatedAt: number,
  overrides: Partial<EventRsvpState> = {},
): EventRsvpState {
  const unsigned = {
    id: `rsvp_${updatedAt}`,
    eventId,
    memberKey: member.publicKey,
    status: "going" as const,
    respondedAt: updatedAt,
    ...overrides,
    updatedAt,
    signerKey: member.publicKey,
  };
  delete (unsigned as Partial<EventRsvpState>).signature;
  return {
    ...unsigned,
    signature: signStateRecord<EventRsvpState>(unsigned, member.secretKey),
  } as EventRsvpState;
}

function signedSignup(
  member: KeyPair,
  shift: EventShiftRow,
  updatedAt: number,
  overrides: Partial<ShiftSignupState> = {},
): ShiftSignupState {
  const unsigned = {
    id: `su_${updatedAt}`,
    shiftId: shift.id,
    eventId: shift.eventId,
    memberKey: member.publicKey,
    signedUpAt: updatedAt,
    deletedAt: null,
    ...overrides,
    updatedAt,
    signerKey: member.publicKey,
  };
  delete (unsigned as Partial<ShiftSignupState>).signature;
  return {
    ...unsigned,
    signature: signStateRecord<ShiftSignupState>(unsigned, member.secretKey),
  } as ShiftSignupState;
}

function stubFeed(bodies: {
  eventShifts?: unknown[];
  eventRsvps?: unknown[];
  shiftSignups?: unknown[];
}) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async (url: string) => ({
      ok: true,
      json: async () => {
        const u = String(url);
        if (u.includes("/event-shifts"))
          return { eventShifts: bodies.eventShifts ?? [] };
        if (u.includes("/event-rsvps"))
          return { eventRsvps: bodies.eventRsvps ?? [] };
        return { shiftSignups: bodies.shiftSignups ?? [] };
      },
    })),
  );
}

describe("pullFederatedEventShifts", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("applies organizer-signed shifts; refuses others; waits for the event", async () => {
    const org = generateKeyPair();
    const rando = generateKeyPair();
    const shift = signedShift(org, baseShift("ev_1", org, "sh_1"), 5_000);

    // Event not local yet — held, cursor pinned.
    stubFeed({ eventShifts: [shift] });
    expect(await pullFederatedEventShifts()).toEqual({
      inserted: 0,
      skipped: 1,
    });
    expect(await getSetting(SHIFT_CURSOR)).toBeUndefined();

    await db.events.put(seedEventRow(org, "ev_1"));
    expect(await pullFederatedEventShifts()).toEqual({
      inserted: 1,
      skipped: 0,
    });
    expect(await db.eventShifts.get("sh_1")).toMatchObject({
      label: "Setup crew",
    });

    // A non-organizer's "shift" is refused against the LOCAL event.
    vi.unstubAllGlobals();
    const hostile = signedShift(
      rando,
      { ...baseShift("ev_1", org, "sh_1"), createdBy: rando.publicKey },
      9_000,
    );
    stubFeed({ eventShifts: [hostile] });
    expect(await pullFederatedEventShifts()).toEqual({
      inserted: 0,
      skipped: 1,
    });
    expect((await db.eventShifts.get("sh_1"))!.createdBy).toBe(org.publicKey);
  });

  it("a tombstone deletes the local shift and its roster", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    await db.events.put(seedEventRow(org, "ev_2"));
    const base = baseShift("ev_2", org, "sh_2");
    await db.eventShifts.put(base);
    await db.shiftSignups.put({
      id: "su_local",
      shiftId: "sh_2",
      eventId: "ev_2",
      memberKey: member.publicKey,
      signedUpAt: NOW,
    });

    stubFeed({
      eventShifts: [signedShift(org, base, 6_000, { deletedAt: NOW })],
    });
    expect(await pullFederatedEventShifts()).toEqual({
      inserted: 1,
      skipped: 0,
    });
    expect(await db.eventShifts.get("sh_2")).toBeUndefined();
    expect(await db.shiftSignups.count()).toBe(0);
  });
});

describe("pullFederatedEventRsvps", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("applies a member's own RSVP and collapses divergent row ids", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    await db.events.put(seedEventRow(org, "ev_3"));
    // Local row minted by THIS device with a different uuid.
    await db.eventRsvps.put({
      id: "local_uuid",
      eventId: "ev_3",
      memberKey: member.publicKey,
      status: "maybe",
      respondedAt: 1_000,
    });

    stubFeed({
      eventRsvps: [signedRsvp(member, "ev_3", 5_000, { id: "remote_uuid" })],
    });
    expect(await pullFederatedEventRsvps()).toEqual({
      inserted: 1,
      skipped: 0,
    });
    const rows = await db.eventRsvps
      .where("[eventId+memberKey]")
      .equals(["ev_3", member.publicKey])
      .toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("going");
  });

  it("refuses an RSVP signed by someone other than its member", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const impostor = generateKeyPair();
    await db.events.put(seedEventRow(org, "ev_4"));
    const forged = signedRsvp(impostor, "ev_4", 5_000, {
      memberKey: member.publicKey,
    });
    stubFeed({ eventRsvps: [forged] });
    expect(await pullFederatedEventRsvps()).toEqual({
      inserted: 0,
      skipped: 1,
    });
    expect(await db.eventRsvps.count()).toBe(0);
  });

  it("keeps a newer local RSVP (LWW)", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    await db.events.put(seedEventRow(org, "ev_5"));
    await db.eventRsvps.put({
      id: "local",
      eventId: "ev_5",
      memberKey: member.publicKey,
      status: "not_going",
      respondedAt: 9_000,
      ...({ updatedAt: 9_000 } as Partial<EventRsvpState>),
    });
    stubFeed({ eventRsvps: [signedRsvp(member, "ev_5", 5_000)] });
    expect(await pullFederatedEventRsvps()).toEqual({
      inserted: 0,
      skipped: 1,
    });
    expect(
      (await db.eventRsvps.get("local"))!.status,
    ).toBe("not_going");
  });
});

describe("pullFederatedShiftSignups", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("holds live signups until the shift arrives; applies then", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const base = baseShift("ev_6", org, "sh_6");
    const signup = signedSignup(member, base, 5_000);

    stubFeed({ shiftSignups: [signup] });
    expect(await pullFederatedShiftSignups()).toEqual({
      inserted: 0,
      skipped: 1,
    });

    await db.eventShifts.put(base);
    expect(await pullFederatedShiftSignups()).toEqual({
      inserted: 1,
      skipped: 0,
    });
    expect(await db.shiftSignups.count()).toBe(1);
  });

  it("a withdrawal tombstone removes the local roster entry", async () => {
    const org = generateKeyPair();
    const member = generateKeyPair();
    const base = baseShift("ev_7", org, "sh_7");
    await db.eventShifts.put(base);
    await db.shiftSignups.put({
      id: "su_here",
      shiftId: "sh_7",
      eventId: "ev_7",
      memberKey: member.publicKey,
      signedUpAt: 1_000,
    });
    stubFeed({
      shiftSignups: [signedSignup(member, base, 5_000, { deletedAt: NOW })],
    });
    expect(await pullFederatedShiftSignups()).toEqual({
      inserted: 1,
      skipped: 0,
    });
    expect(await db.shiftSignups.count()).toBe(0);
  });
});

describe("participation publish (mutator wiring)", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  async function seedActors() {
    const org = generateKeyPair();
    const member = generateKeyPair();
    await persistSecretKey(org.publicKey, org.secretKey);
    await persistSecretKey(member.publicKey, member.secretKey);
    await db.events.put(seedEventRow(org, "ev_p"));
    return { org, member };
  }

  it("rsvpToEvent publishes a signed single-owner record", async () => {
    const { member } = await seedActors();
    await rsvpToEvent({
      eventId: "ev_p",
      memberKey: member.publicKey,
      status: "going",
    });
    const rows = await db.outbox.where("kind").equals("event_rsvp").toArray();
    expect(rows).toHaveLength(1);
    const wire = JSON.parse(rows[0].payload) as EventRsvpState;
    expect(wire.signerKey).toBe(member.publicKey);
    expect(wire.status).toBe("going");
  });

  it("signUpForShift publishes the implied RSVP and the signup", async () => {
    const { org, member } = await seedActors();
    const shift = await addShift({
      eventId: "ev_p",
      label: "Setup",
      startsAt: Date.now() + 80_000_000,
      endsAt: Date.now() + 90_000_000,
      capacity: null,
      byKey: org.publicKey,
    });
    expect(
      await db.outbox.where("kind").equals("event_shift").count(),
    ).toBe(1);

    await signUpForShift({ shiftId: shift.id, memberKey: member.publicKey });
    expect(await db.outbox.where("kind").equals("event_rsvp").count()).toBe(1);
    const signups = await db.outbox
      .where("kind")
      .equals("shift_signup")
      .toArray();
    expect(signups).toHaveLength(1);
    expect(
      (JSON.parse(signups[0].payload) as ShiftSignupState).deletedAt,
    ).toBeNull();
  });

  it("removeSignup and deleteShift publish tombstones", async () => {
    const { org, member } = await seedActors();
    const shift = await addShift({
      eventId: "ev_p",
      label: "Cleanup",
      startsAt: Date.now() + 80_000_000,
      endsAt: Date.now() + 90_000_000,
      capacity: null,
      byKey: org.publicKey,
    });
    await signUpForShift({ shiftId: shift.id, memberKey: member.publicKey });

    await removeSignup(shift.id, member.publicKey);
    const signupRows = await db.outbox
      .where("kind")
      .equals("shift_signup")
      .toArray();
    // The pending live row was replaced in place by the tombstone —
    // exactly the LWW re-enqueue semantics.
    expect(signupRows).toHaveLength(1);
    expect(
      (JSON.parse(signupRows[0].payload) as ShiftSignupState).deletedAt,
    ).not.toBeNull();

    await deleteShift(shift.id, org.publicKey);
    const shiftRows = await db.outbox
      .where("kind")
      .equals("event_shift")
      .toArray();
    expect(shiftRows).toHaveLength(1);
    expect(
      (JSON.parse(shiftRows[0].payload) as EventShiftState).deletedAt,
    ).not.toBeNull();
    expect(await db.eventShifts.get(shift.id)).toBeUndefined();
  });

  it('"not going" publishes withdrawal tombstones for cleared signups', async () => {
    const { org, member } = await seedActors();
    const shift = await addShift({
      eventId: "ev_p",
      label: "Greeter",
      startsAt: Date.now() + 80_000_000,
      endsAt: Date.now() + 90_000_000,
      capacity: null,
      byKey: org.publicKey,
    });
    await signUpForShift({ shiftId: shift.id, memberKey: member.publicKey });

    await rsvpToEvent({
      eventId: "ev_p",
      memberKey: member.publicKey,
      status: "not_going",
    });
    const rsvpRows = await db.outbox.where("kind").equals("event_rsvp").toArray();
    expect(rsvpRows).toHaveLength(1);
    expect(
      (JSON.parse(rsvpRows[0].payload) as EventRsvpState).status,
    ).toBe("not_going");
    const signupRows = await db.outbox
      .where("kind")
      .equals("shift_signup")
      .toArray();
    expect(signupRows).toHaveLength(1);
    expect(
      (JSON.parse(signupRows[0].payload) as ShiftSignupState).deletedAt,
    ).not.toBeNull();
  });
});
