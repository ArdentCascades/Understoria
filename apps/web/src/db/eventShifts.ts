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
import { db } from "./database";
import { uuid } from "@/lib/id";
import { rsvpToEvent } from "./events";
import { isAuthoritativeCancellation } from "@/lib/eventCancellation";
import type { EventShiftRow, ShiftSignupRow } from "@/types";

/**
 * Shift signups — the LOCAL-ONLY slot structure on a community event.
 * See `docs/shift-signups.md` for the full design; the load-bearing
 * decisions, restated where the code lives:
 *
 *   - Shifts and signups NEVER federate (§4 + §7). No enqueue helper,
 *     no pull helper, no route; the `OutboxRow.kind` union rejects
 *     both discriminators. `eventShifts.test.ts` locks the negatives.
 *   - A signup is INTENT, never attendance (§3, §9). Nothing in this
 *     module — or anywhere — may reconcile the signup roster against
 *     exchanges; that comparison is the permanently-rejected
 *     attendance tracking of `docs/community-events.md` §11.6.
 *   - A signup routes through `rsvpToEvent` (§6.1), inheriting the
 *     block gate, the ghost-event guard, and the
 *     organizer-authoritative cancellation guard, and upserting a
 *     "going" RSVP in the same transaction — which is what lets the
 *     existing `event_today` / `event_cancelled` attention items
 *     cover shift members with zero new rail machinery (§8).
 *   - Lifecycle rules (§5.2) exist so no `shift_changed` rail item is
 *     needed: no edits; delete only while empty; capacity never drops
 *     below the current roster.
 */

/** Free-text label ceiling — mirrors the §4.1 contract. */
export const SHIFT_LABEL_MAX = 100;

export class ShiftError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// -- Define -----------------------------------------------------------------

export interface AddShiftInput {
  eventId: string;
  /** Free text, 1..100 chars: "Setup crew", "Driver". */
  label: string;
  /** Epoch ms, UTC. May fall outside the event window (a driver
   *  shift before the event starts is normal). */
  startsAt: number;
  /** Epoch ms, UTC. Must be > startsAt. */
  endsAt: number;
  /** Soft cap; null = uncapped. */
  capacity: number | null;
  /** The caller's pubkey — must equal the event's `createdBy`. */
  byKey: string;
  /** Override the clock — tests inject a deterministic timestamp. */
  now?: number;
}

/**
 * Add a shift to an event. Organizer-only, re-validated here against
 * the event's `createdBy` — the UI affordance is a convenience, this
 * gate is the guarantee (§5.1). Shifts may be added until the event
 * has passed (its `endsAt`, or `startsAt` for single-point events);
 * late-added cleanup shifts on a long event are normal (§5.2).
 */
export async function addShift(input: AddShiftInput): Promise<EventShiftRow> {
  const now = input.now ?? Date.now();
  const label = input.label.trim();
  if (label.length === 0 || label.length > SHIFT_LABEL_MAX) {
    throw new ShiftError(
      "invalid_label",
      `Shift label must be 1..${SHIFT_LABEL_MAX} characters.`,
    );
  }
  if (
    !Number.isFinite(input.startsAt) ||
    !Number.isFinite(input.endsAt) ||
    input.endsAt <= input.startsAt
  ) {
    throw new ShiftError(
      "invalid_window",
      "Shift end time must be after its start time.",
    );
  }
  if (
    input.capacity !== null &&
    (!Number.isInteger(input.capacity) || input.capacity <= 0)
  ) {
    throw new ShiftError(
      "invalid_capacity",
      "Capacity must be empty or a positive whole number.",
    );
  }

  return db.transaction(
    "rw",
    [db.events, db.eventCancellations, db.eventShifts],
    async () => {
      const event = await db.events.get(input.eventId);
      if (!event) {
        throw new ShiftError(
          "event_not_found",
          "Event not found on this node.",
        );
      }
      if (event.createdBy !== input.byKey) {
        throw new ShiftError(
          "not_organizer",
          "Only the event's organizer can add shifts.",
        );
      }
      const cancellation = await db.eventCancellations
        .where("eventId")
        .equals(input.eventId)
        .first();
      if (cancellation && isAuthoritativeCancellation(cancellation, event)) {
        throw new ShiftError(
          "event_cancelled",
          "That event was cancelled.",
        );
      }
      const eventPassesAt = event.endsAt ?? event.startsAt;
      if (now >= eventPassesAt) {
        throw new ShiftError(
          "event_passed",
          "That event has already passed.",
        );
      }

      const row: EventShiftRow = {
        id: uuid(),
        eventId: input.eventId,
        label,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        capacity: input.capacity,
        createdBy: input.byKey,
        createdAt: now,
      };
      await db.eventShifts.put(row);
      return row;
    },
  );
}

/**
 * Delete a shift — organizer-only, and ONLY while it has no signups
 * (§5.2). A shift someone committed to may only vanish via a channel
 * that already tells them: the event's signed, federated cancellation
 * (whose `event_cancelled` attention item reaches every RSVP'd
 * member). This rule is what lets the design ship with no
 * `shift_changed` rail item.
 */
export async function deleteShift(
  shiftId: string,
  byKey: string,
): Promise<void> {
  await db.transaction(
    "rw",
    [db.eventShifts, db.shiftSignups],
    async () => {
      const shift = await db.eventShifts.get(shiftId);
      if (!shift) {
        throw new ShiftError("shift_not_found", "Shift not found.");
      }
      if (shift.createdBy !== byKey) {
        throw new ShiftError(
          "not_organizer",
          "Only the event's organizer can remove shifts.",
        );
      }
      const signups = await db.shiftSignups
        .where("shiftId")
        .equals(shiftId)
        .count();
      if (signups > 0) {
        throw new ShiftError(
          "shift_has_signups",
          "People have signed up for this shift. Ask them to move, or cancel the event.",
        );
      }
      await db.eventShifts.delete(shiftId);
    },
  );
}

/**
 * Change a shift's soft capacity — organizer-only. May be raised or
 * uncapped freely; may never drop below the current roster (§5.2 —
 * lowering below the signups would manufacture an "overflow" framing
 * that `solidarity-not-shame` rules out). Lowering to a number that
 * still fits everyone signed up is allowed (the space shrank; nobody
 * is displaced).
 */
export async function setShiftCapacity(
  shiftId: string,
  capacity: number | null,
  byKey: string,
): Promise<EventShiftRow> {
  if (
    capacity !== null &&
    (!Number.isInteger(capacity) || capacity <= 0)
  ) {
    throw new ShiftError(
      "invalid_capacity",
      "Capacity must be empty or a positive whole number.",
    );
  }
  return db.transaction(
    "rw",
    [db.eventShifts, db.shiftSignups],
    async () => {
      const shift = await db.eventShifts.get(shiftId);
      if (!shift) {
        throw new ShiftError("shift_not_found", "Shift not found.");
      }
      if (shift.createdBy !== byKey) {
        throw new ShiftError(
          "not_organizer",
          "Only the event's organizer can change a shift's capacity.",
        );
      }
      if (capacity !== null) {
        const signups = await db.shiftSignups
          .where("shiftId")
          .equals(shiftId)
          .count();
        if (capacity < signups) {
          throw new ShiftError(
            "capacity_below_signups",
            `${signups} people have signed up — capacity can't go below that.`,
          );
        }
      }
      const updated: EventShiftRow = { ...shift, capacity };
      await db.eventShifts.put(updated);
      return updated;
    },
  );
}

// -- Sign up ----------------------------------------------------------------

export interface SignUpForShiftInput {
  shiftId: string;
  /** The signing-up member's own pubkey. */
  memberKey: string;
  /** Override the clock — tests inject a deterministic timestamp. */
  now?: number;
}

/**
 * Sign up for a shift. One transaction that (a) upserts a "going"
 * RSVP via `rsvpToEvent` — inheriting its ghost-event, cancelled-
 * event, and mutual-block guards verbatim — and (b) writes the signup
 * row, deduped on `[shiftId+memberKey]` so signing up twice is a
 * no-op returning the existing row (§6.1).
 *
 * Capacity is deliberately NOT checked here: the cap is soft (§11.5),
 * a planning aid rendered by the UI, never a write-layer bouncer.
 */
export async function signUpForShift(
  input: SignUpForShiftInput,
): Promise<ShiftSignupRow> {
  const now = input.now ?? Date.now();
  return db.transaction(
    "rw",
    [
      db.eventShifts,
      db.shiftSignups,
      db.events,
      db.eventCancellations,
      db.eventRsvps,
      db.blocks,
    ],
    async () => {
      const shift = await db.eventShifts.get(input.shiftId);
      if (!shift) {
        throw new ShiftError("shift_not_found", "Shift not found.");
      }
      // Intent for a slot that already ended is meaningless — the UI
      // hides the control on passed shifts; this guard is the
      // guarantee behind it.
      if (now >= shift.endsAt) {
        throw new ShiftError(
          "shift_passed",
          "That shift has already passed.",
        );
      }

      // The RSVP upsert carries the guards: event exists, event not
      // authoritatively cancelled, no mutual block with the organizer.
      // Composed into this transaction, so a refusal aborts everything
      // and no signup row is written.
      await rsvpToEvent({
        eventId: shift.eventId,
        memberKey: input.memberKey,
        status: "going",
        now,
      });

      const existing = await db.shiftSignups
        .where("[shiftId+memberKey]")
        .equals([input.shiftId, input.memberKey])
        .first();
      if (existing) return existing;

      const row: ShiftSignupRow = {
        id: uuid(),
        shiftId: input.shiftId,
        eventId: shift.eventId,
        memberKey: input.memberKey,
        signedUpAt: now,
      };
      await db.shiftSignups.put(row);
      return row;
    },
  );
}

/**
 * Remove a signup. One tap, idempotent, no framing: the member's
 * name comes off the roster immediately, nobody is notified, and the
 * event RSVP deliberately stays "going" — they may still be attending
 * generally (§6.1). Plans change (`solidarity-not-shame`).
 */
export async function removeSignup(
  shiftId: string,
  memberKey: string,
): Promise<void> {
  await db.shiftSignups
    .where("[shiftId+memberKey]")
    .equals([shiftId, memberKey])
    .delete();
}

// -- Read -------------------------------------------------------------------

/** Shifts for an event, ordered by start time (ties by creation). */
export async function listShiftsForEvent(
  eventId: string,
): Promise<EventShiftRow[]> {
  const rows = await db.eventShifts
    .where("eventId")
    .equals(eventId)
    .toArray();
  return rows.sort(
    (a, b) => a.startsAt - b.startsAt || a.createdAt - b.createdAt,
  );
}

/** Roster for one shift, in signup order. */
export async function listSignupsForShift(
  shiftId: string,
): Promise<ShiftSignupRow[]> {
  const rows = await db.shiftSignups
    .where("shiftId")
    .equals(shiftId)
    .toArray();
  return rows.sort((a, b) => a.signedUpAt - b.signedUpAt);
}

/** All signups across an event's shifts, in signup order — one live
 *  query for the event page instead of one per shift. */
export async function listSignupsForEvent(
  eventId: string,
): Promise<ShiftSignupRow[]> {
  const rows = await db.shiftSignups
    .where("eventId")
    .equals(eventId)
    .toArray();
  return rows.sort((a, b) => a.signedUpAt - b.signedUpAt);
}

/** Spot-count helper for the §6.4 rendering ("2 spots open"). */
export async function signupCountForShift(shiftId: string): Promise<number> {
  return db.shiftSignups.where("shiftId").equals(shiftId).count();
}

/** The member's own signups — the "my shifts" surface (§11.3: a
 *  member's signup history is theirs alone; no other surface may
 *  query by memberKey). */
export async function listSignupsForMember(
  memberKey: string,
): Promise<ShiftSignupRow[]> {
  const rows = await db.shiftSignups
    .where("memberKey")
    .equals(memberKey)
    .toArray();
  return rows.sort((a, b) => a.signedUpAt - b.signedUpAt);
}
