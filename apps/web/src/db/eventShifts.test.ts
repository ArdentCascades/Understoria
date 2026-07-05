/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import * as eventShiftsModule from "./eventShifts";
import {
  ShiftError,
  addShift,
  deleteShift,
  listShiftsForEvent,
  listSignupsForMember,
  listSignupsForShift,
  removeSignup,
  setShiftCapacity,
  signUpForShift,
  signupCountForShift,
} from "./eventShifts";
import { createEvent, cancelEvent, rsvpToEvent } from "./events";
import { blockMember } from "./blocks";
import { db, SETTING_KEYS, setSetting } from "./database";
import { EXPORT_EXCLUDED_TABLES } from "@/lib/exportData";
import { generateKeyPair } from "@/lib/crypto";
import type { Event, EventShiftRow, ShiftSignupRow } from "@/types";

const NODE = "node_shift_test";
const NOW = 1_000_000;
const EVENT_STARTS = 5_000_000;

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
  ]);
  // enqueueEvent no-ops unless a community node is configured.
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
}

interface OrganizerFixture {
  organizerKey: string;
  organizerSecretKey: string;
}

function makeOrganizer(): OrganizerFixture {
  const kp = generateKeyPair();
  return { organizerKey: kp.publicKey, organizerSecretKey: kp.secretKey };
}

async function makeEvent(
  organizer: OrganizerFixture,
  over: Partial<Parameters<typeof createEvent>[0]> = {},
): Promise<Event> {
  return createEvent({
    title: "Saturday build day",
    description: "",
    category: "skills-exchange",
    startsAt: EVENT_STARTS,
    endsAt: null,
    location: "Community room",
    capacity: null,
    templateId: null,
    organizerKey: organizer.organizerKey,
    organizerSecretKey: organizer.organizerSecretKey,
    nodeId: NODE,
    now: NOW,
    ...over,
  });
}

function shiftInput(
  eventId: string,
  byKey: string,
  over: Partial<Parameters<typeof addShift>[0]> = {},
) {
  return {
    eventId,
    label: "Setup crew",
    startsAt: EVENT_STARTS - 30 * 60 * 1000,
    endsAt: EVENT_STARTS + 3 * 60 * 60 * 1000,
    capacity: 4,
    byKey,
    now: NOW,
    ...over,
  };
}

describe("shift rows are local-only (negative-space locks)", () => {
  it('rejects "event_shift" and "shift_signup" as OutboxRow kinds', () => {
    type OutboxKind = import("./database").OutboxRow["kind"];
    // @ts-expect-error — the discriminator must not be assignable to the union.
    const _badShift: OutboxKind = "event_shift";
    // @ts-expect-error — the discriminator must not be assignable to the union.
    const _badSignup: OutboxKind = "shift_signup";
    void _badShift;
    void _badSignup;
  });

  it("has no enqueue helpers exported from lib/outbox", async () => {
    const outbox = await import("@/lib/outbox");
    const mod = outbox as unknown as Record<string, unknown>;
    expect(mod.enqueueEventShift).toBeUndefined();
    expect(mod.enqueueShiftSignup).toBeUndefined();
  });

  it("has no pull helpers exported from lib/federationSync", async () => {
    const fed = await import("@/lib/federationSync");
    const mod = fed as unknown as Record<string, unknown>;
    expect(mod.pullFederatedEventShifts).toBeUndefined();
    expect(mod.pullFederatedShiftSignups).toBeUndefined();
  });

  it("shift and signup rows carry no signature and no nodeId", () => {
    const shift: EventShiftRow = {
      id: "s1",
      eventId: "e1",
      label: "Setup crew",
      startsAt: 1,
      endsAt: 2,
      capacity: null,
      createdBy: "k",
      createdAt: 0,
    };
    const signup: ShiftSignupRow = {
      id: "g1",
      shiftId: "s1",
      eventId: "e1",
      memberKey: "k",
      signedUpAt: 0,
    };
    // @ts-expect-error — local-only rows are never signed.
    void shift.signature;
    // @ts-expect-error — local-only rows carry no origin-node stamp.
    void shift.nodeId;
    // @ts-expect-error — local-only rows are never signed.
    void signup.signature;
    // @ts-expect-error — local-only rows carry no origin-node stamp.
    void signup.nodeId;
    expect(shift.id).toBe("s1");
    expect(signup.id).toBe("g1");
  });

  it("both tables are excluded from data export", () => {
    expect(EXPORT_EXCLUDED_TABLES).toContain("eventShifts");
    expect(EXPORT_EXCLUDED_TABLES).toContain("shiftSignups");
  });

  it("exports no roster-vs-exchange reconciliation helper (§9.3 — that comparison IS attendance tracking)", () => {
    const names = Object.keys(eventShiftsModule);
    for (const name of names) {
      expect(name.toLowerCase()).not.toMatch(
        /exchange|attendance|reconcil|noshow|no_show/,
      );
    }
  });
});

describe("addShift", () => {
  beforeEach(reset);

  it("lets the organizer add a shift", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    const shift = await addShift(shiftInput(event.id, organizer.organizerKey));
    expect(shift).toMatchObject({
      eventId: event.id,
      label: "Setup crew",
      capacity: 4,
      createdBy: organizer.organizerKey,
    });
    expect(await db.eventShifts.count()).toBe(1);
  });

  it("refuses a non-organizer and writes zero rows", async () => {
    const organizer = makeOrganizer();
    const stranger = makeOrganizer();
    const event = await makeEvent(organizer);
    await expect(
      addShift(shiftInput(event.id, stranger.organizerKey)),
    ).rejects.toMatchObject({ code: "not_organizer" });
    expect(await db.eventShifts.count()).toBe(0);
  });

  it("refuses a missing event", async () => {
    const organizer = makeOrganizer();
    await expect(
      addShift(shiftInput("ev_ghost", organizer.organizerKey)),
    ).rejects.toMatchObject({ code: "event_not_found" });
  });

  it("refuses an organizer-cancelled event", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    await cancelEvent({
      eventId: event.id,
      reason: "",
      organizerKey: organizer.organizerKey,
      organizerSecretKey: organizer.organizerSecretKey,
      nodeId: NODE,
      now: NOW + 1,
    });
    await expect(
      addShift(shiftInput(event.id, organizer.organizerKey)),
    ).rejects.toMatchObject({ code: "event_cancelled" });
  });

  it("refuses once the event has passed", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    await expect(
      addShift(
        shiftInput(event.id, organizer.organizerKey, {
          now: EVENT_STARTS + 1,
        }),
      ),
    ).rejects.toMatchObject({ code: "event_passed" });
  });

  it("allows late-added shifts on a long event still in progress", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer, {
      endsAt: EVENT_STARTS + 8 * 60 * 60 * 1000,
    });
    const shift = await addShift(
      shiftInput(event.id, organizer.organizerKey, {
        label: "Cleanup",
        now: EVENT_STARTS + 60 * 60 * 1000,
        startsAt: EVENT_STARTS + 6 * 60 * 60 * 1000,
        endsAt: EVENT_STARTS + 8 * 60 * 60 * 1000,
      }),
    );
    expect(shift.label).toBe("Cleanup");
  });

  it("validates label, window, and capacity", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    const base = shiftInput(event.id, organizer.organizerKey);
    await expect(
      addShift({ ...base, label: "   " }),
    ).rejects.toMatchObject({ code: "invalid_label" });
    await expect(
      addShift({ ...base, label: "x".repeat(101) }),
    ).rejects.toMatchObject({ code: "invalid_label" });
    await expect(
      addShift({ ...base, endsAt: base.startsAt }),
    ).rejects.toMatchObject({ code: "invalid_window" });
    await expect(
      addShift({ ...base, capacity: 0 }),
    ).rejects.toMatchObject({ code: "invalid_capacity" });
    await expect(
      addShift({ ...base, capacity: 2.5 }),
    ).rejects.toMatchObject({ code: "invalid_capacity" });
    expect(await db.eventShifts.count()).toBe(0);
  });
});

describe("signUpForShift", () => {
  beforeEach(reset);

  async function seed() {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    const shift = await addShift(shiftInput(event.id, organizer.organizerKey));
    return { organizer, event, shift };
  }

  it("writes the signup AND upserts a going RSVP in one transaction", async () => {
    const { event, shift } = await seed();
    const member = generateKeyPair().publicKey;
    const signup = await signUpForShift({
      shiftId: shift.id,
      memberKey: member,
      now: NOW + 10,
    });
    expect(signup).toMatchObject({
      shiftId: shift.id,
      eventId: event.id,
      memberKey: member,
    });
    const rsvp = await db.eventRsvps
      .where("[eventId+memberKey]")
      .equals([event.id, member])
      .first();
    expect(rsvp?.status).toBe("going");
  });

  it("is idempotent — signing up twice returns the same row", async () => {
    const { shift } = await seed();
    const member = generateKeyPair().publicKey;
    const first = await signUpForShift({
      shiftId: shift.id,
      memberKey: member,
      now: NOW + 10,
    });
    const second = await signUpForShift({
      shiftId: shift.id,
      memberKey: member,
      now: NOW + 20,
    });
    expect(second.id).toBe(first.id);
    expect(await db.shiftSignups.count()).toBe(1);
  });

  it("refuses a missing shift", async () => {
    await expect(
      signUpForShift({ shiftId: "ghost", memberKey: "k", now: NOW }),
    ).rejects.toMatchObject({ code: "shift_not_found" });
  });

  it("refuses a shift that already ended", async () => {
    const { shift } = await seed();
    await expect(
      signUpForShift({
        shiftId: shift.id,
        memberKey: "k",
        now: shift.endsAt + 1,
      }),
    ).rejects.toMatchObject({ code: "shift_passed" });
  });

  it("refuses on a cancelled event via the composed RSVP guard, writing nothing", async () => {
    const { organizer, event, shift } = await seed();
    await cancelEvent({
      eventId: event.id,
      reason: "",
      organizerKey: organizer.organizerKey,
      organizerSecretKey: organizer.organizerSecretKey,
      nodeId: NODE,
      now: NOW + 1,
    });
    const member = generateKeyPair().publicKey;
    await expect(
      signUpForShift({ shiftId: shift.id, memberKey: member, now: NOW + 10 }),
    ).rejects.toThrow(/cancelled/);
    expect(await db.shiftSignups.count()).toBe(0);
    expect(await db.eventRsvps.count()).toBe(0);
  });

  it("refuses on a mutual block with the organizer, writing nothing", async () => {
    const { organizer, shift } = await seed();
    const member = generateKeyPair().publicKey;
    await blockMember({
      blockerKey: member,
      blockedKey: organizer.organizerKey,
      hideGovernance: false,
      note: null,
      now: NOW,
    });
    await expect(
      signUpForShift({ shiftId: shift.id, memberKey: member, now: NOW + 10 }),
    ).rejects.toThrow();
    expect(await db.shiftSignups.count()).toBe(0);
    expect(await db.eventRsvps.count()).toBe(0);
  });

  it("capacity is soft — a signup past the cap still lands (§11.5)", async () => {
    const { organizer, event } = await seed();
    const tiny = await addShift(
      shiftInput(event.id, organizer.organizerKey, {
        label: "Driver",
        capacity: 1,
      }),
    );
    const a = generateKeyPair().publicKey;
    const b = generateKeyPair().publicKey;
    await signUpForShift({ shiftId: tiny.id, memberKey: a, now: NOW + 1 });
    await signUpForShift({ shiftId: tiny.id, memberKey: b, now: NOW + 2 });
    expect(await signupCountForShift(tiny.id)).toBe(2);
  });
});

describe("removeSignup + RSVP interplay (§6.1)", () => {
  beforeEach(reset);

  async function seedWithSignup() {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    const shift = await addShift(shiftInput(event.id, organizer.organizerKey));
    const member = generateKeyPair().publicKey;
    await signUpForShift({ shiftId: shift.id, memberKey: member, now: NOW + 1 });
    return { organizer, event, shift, member };
  }

  it("removeSignup drops the roster row but keeps the going RSVP", async () => {
    const { event, shift, member } = await seedWithSignup();
    await removeSignup(shift.id, member);
    expect(await signupCountForShift(shift.id)).toBe(0);
    const rsvp = await db.eventRsvps
      .where("[eventId+memberKey]")
      .equals([event.id, member])
      .first();
    expect(rsvp?.status).toBe("going");
  });

  it("removeSignup is idempotent", async () => {
    const { shift, member } = await seedWithSignup();
    await removeSignup(shift.id, member);
    await expect(removeSignup(shift.id, member)).resolves.toBeUndefined();
  });

  it("RSVP'ing not_going clears every signup the member holds on that event", async () => {
    const { organizer, event, shift, member } = await seedWithSignup();
    const second = await addShift(
      shiftInput(event.id, organizer.organizerKey, { label: "Cleanup" }),
    );
    await signUpForShift({ shiftId: second.id, memberKey: member, now: NOW + 2 });
    expect((await listSignupsForMember(member)).length).toBe(2);

    await rsvpToEvent({
      eventId: event.id,
      memberKey: member,
      status: "not_going",
      now: NOW + 3,
    });
    expect((await listSignupsForMember(member)).length).toBe(0);
    // Other members' signups are untouched.
    expect(await signupCountForShift(shift.id)).toBe(0);
  });

  it("a different member's not_going leaves the roster alone", async () => {
    const { event, shift, member } = await seedWithSignup();
    const other = generateKeyPair().publicKey;
    await rsvpToEvent({
      eventId: event.id,
      memberKey: other,
      status: "not_going",
      now: NOW + 3,
    });
    expect(await signupCountForShift(shift.id)).toBe(1);
    expect((await listSignupsForShift(shift.id))[0].memberKey).toBe(member);
  });
});

describe("deleteShift + setShiftCapacity (§5.2 lifecycle)", () => {
  beforeEach(reset);

  async function seed() {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    const shift = await addShift(shiftInput(event.id, organizer.organizerKey));
    return { organizer, event, shift };
  }

  it("deletes an empty shift", async () => {
    const { organizer, shift } = await seed();
    await deleteShift(shift.id, organizer.organizerKey);
    expect(await db.eventShifts.count()).toBe(0);
  });

  it("refuses to delete a shift with signups", async () => {
    const { organizer, shift } = await seed();
    await signUpForShift({
      shiftId: shift.id,
      memberKey: generateKeyPair().publicKey,
      now: NOW + 1,
    });
    await expect(
      deleteShift(shift.id, organizer.organizerKey),
    ).rejects.toMatchObject({ code: "shift_has_signups" });
    expect(await db.eventShifts.count()).toBe(1);
  });

  it("refuses delete and capacity change from a non-organizer", async () => {
    const { shift } = await seed();
    const stranger = generateKeyPair().publicKey;
    await expect(deleteShift(shift.id, stranger)).rejects.toMatchObject({
      code: "not_organizer",
    });
    await expect(
      setShiftCapacity(shift.id, 10, stranger),
    ).rejects.toMatchObject({ code: "not_organizer" });
  });

  it("raises capacity and uncaps freely; never drops below the roster", async () => {
    const { organizer, shift } = await seed();
    const a = generateKeyPair().publicKey;
    const b = generateKeyPair().publicKey;
    await signUpForShift({ shiftId: shift.id, memberKey: a, now: NOW + 1 });
    await signUpForShift({ shiftId: shift.id, memberKey: b, now: NOW + 2 });

    const raised = await setShiftCapacity(shift.id, 8, organizer.organizerKey);
    expect(raised.capacity).toBe(8);

    const uncapped = await setShiftCapacity(
      shift.id,
      null,
      organizer.organizerKey,
    );
    expect(uncapped.capacity).toBeNull();

    // Lowering to exactly the roster size is allowed — nobody displaced.
    const snug = await setShiftCapacity(shift.id, 2, organizer.organizerKey);
    expect(snug.capacity).toBe(2);

    await expect(
      setShiftCapacity(shift.id, 1, organizer.organizerKey),
    ).rejects.toMatchObject({ code: "capacity_below_signups" });
  });
});

describe("read helpers", () => {
  beforeEach(reset);

  it("listShiftsForEvent orders by start time", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    const late = await addShift(
      shiftInput(event.id, organizer.organizerKey, {
        label: "Cleanup",
        startsAt: EVENT_STARTS + 2_000,
        endsAt: EVENT_STARTS + 3_000,
      }),
    );
    const early = await addShift(
      shiftInput(event.id, organizer.organizerKey, {
        label: "Driver",
        startsAt: EVENT_STARTS - 2_000,
        endsAt: EVENT_STARTS - 1_000,
      }),
    );
    const shifts = await listShiftsForEvent(event.id);
    expect(shifts.map((s) => s.id)).toEqual([early.id, late.id]);
  });

  it("rosters and member views read back in signup order", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    const shift = await addShift(shiftInput(event.id, organizer.organizerKey));
    const a = generateKeyPair().publicKey;
    const b = generateKeyPair().publicKey;
    await signUpForShift({ shiftId: shift.id, memberKey: b, now: NOW + 5 });
    await signUpForShift({ shiftId: shift.id, memberKey: a, now: NOW + 1 });

    const roster = await listSignupsForShift(shift.id);
    expect(roster.map((r) => r.memberKey)).toEqual([a, b]);
    expect(await signupCountForShift(shift.id)).toBe(2);
    expect((await listSignupsForMember(a)).map((r) => r.shiftId)).toEqual([
      shift.id,
    ]);
  });

  it("exposes a typed error class", () => {
    const err = new ShiftError("x", "y");
    expect(err.code).toBe("x");
    expect(err.message).toBe("y");
  });
});
