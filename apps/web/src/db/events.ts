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
import {
  db,
  type EventCancellationRow,
  type EventRow,
} from "./database";
import { uuid } from "@/lib/id";
import {
  canonicalEventCancellationPayload,
  canonicalEventPayload,
  sign,
  verifyEvent,
  verifyEventCancellation,
} from "@/lib/crypto";
import { enqueueEvent, enqueueEventCancellation } from "@/lib/outbox";
import { isAuthoritativeCancellation } from "@/lib/eventCancellation";
import { BLOCKED_ACTION_MESSAGE, isMutuallyBlocked } from "./blocks";
import {
  publishEventRsvpState,
  publishShiftSignupState,
} from "./participationPublish";
import type {
  Event,
  EventCancellation,
  EventRsvpRow,
  ShiftSignupRow,
} from "@/types";

/**
 * Community-events data layer — see `docs/community-events.md` for the
 * full design. Two signed record types and one local-only RSVP row:
 *
 *   - `createEvent` — organizer signs an event, persists locally,
 *     enqueues for federation. Mirrors `issueCoOrganizerInvitation`.
 *   - `cancelEvent` — organizer signs a cancellation; idempotent.
 *     Only the original organizer can cancel (single-signer authority
 *     per §4.3 + §11).
 *   - `rsvpToEvent` — local upsert, then federates as a single-owner
 *     LWW `EventRsvpState` record (participation Phase 2,
 *     docs/project-federation.md §6 — a deliberate reversal of the
 *     original local-only stance so organizers can actually see
 *     attendance from other members' phones).
 *
 * Read helpers:
 *   - `getEvent` / `listEvents` — calendar + detail-page surfaces
 *     consume these (PR F).
 *   - `getMemberRsvp` / `listRsvpsForEvent` / `attendeeCount` — the
 *     §6 visibility tiers + §8 attention-rail items read these.
 *
 * Phase 1 explicitly forbids edits (design doc §5): there is no
 * `updateEvent`. The organizer's path is `cancelEvent` then
 * `createEvent` with the new shape.
 */

export class EventActionError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Grace window for accepting an event whose `startsAt` is slightly in
 * the past — covers the case where a member picks "now-ish" and takes a
 * few seconds to hit submit. Shared by `createEvent` (the authoritative
 * gate) and `EventNew.tsx` (a UX nicety so the user gets the error
 * before submit instead of after). Five minutes is short enough to
 * preclude history-rewriting and long enough that the user never feels
 * the system is fighting them on click-timing.
 */
export const EVENT_START_GRACE_MS = 5 * 60 * 1000;

// -- Create -----------------------------------------------------------------

export interface CreateEventInput {
  /** Free text, 1..200 chars. */
  title: string;
  /** Free text, 0..2000 chars. */
  description: string;
  /** Free-text category identifier; matches the `EventPayload.category`
   *  contract — not constrained to the legacy `Post` `Category` enum. */
  category: string;
  /** Epoch ms, UTC. */
  startsAt: number;
  /** Epoch ms, UTC; `null` for a single-point event. */
  endsAt: number | null;
  /** Free text, 1..200 chars. NOT a GPS pin — see design doc §4.1. */
  location: string;
  /** Soft cap; `null` for uncapped. */
  capacity: number | null;
  /** `null` for a plain event, or a 1..50-char template identifier
   *  (e.g. "potluck"). See `docs/event-templates-plan.md`. */
  templateId: string | null;
  /** Base64-encoded Ed25519 public key of the organizer. */
  organizerKey: string;
  /** Base64-encoded Ed25519 secret key of the organizer. The codebase
   *  represents secret keys as base64 strings throughout (see
   *  `db/seed.ts`, `db/coorgInvitations.ts`, `@understoria/shared/crypto`
   *  `sign(message, secretKeyB64)`); the prompt's `Uint8Array` shape
   *  was reinterpreted to match the existing convention. */
  organizerSecretKey: string;
  /** Origin node id. */
  nodeId: string;
  /** Override the clock — tests inject a deterministic timestamp. */
  now?: number;
}

/**
 * Sign and persist a new community event. Generates the UUID, stamps
 * `createdAt`, produces an Ed25519 signature over the canonical
 * payload, verifies it locally before persisting (refusing to persist
 * a record whose signature doesn't verify is the same discipline as
 * `issueCoOrganizerInvitation`), then enqueues for federation.
 *
 * Phase 2: `templateId` is null for a plain event, or a 1..50-char
 * template identifier (e.g. "potluck"). The data layer is intentionally
 * permissive — it is the wire boundary and does not validate against the
 * local template content file; the UI picks from the known set. The
 * signature already covers this field (`canonicalEventPayload`), so this
 * is not a wire change.
 */
export async function createEvent(
  input: CreateEventInput,
): Promise<Event> {
  if (
    input.templateId !== null &&
    (input.templateId.length === 0 || input.templateId.length > 50)
  ) {
    throw new EventActionError(
      "invalid_template_id",
      "templateId must be null or a 1..50 character identifier.",
    );
  }

  const now = input.now ?? Date.now();
  if (input.startsAt < now - EVENT_START_GRACE_MS) {
    throw new EventActionError(
      "start_in_past",
      "Event start time must be in the future.",
    );
  }
  const id = uuid();
  const payload = {
    id,
    kind: "event" as const,
    title: input.title,
    description: input.description,
    category: input.category,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    location: input.location,
    capacity: input.capacity,
    templateId: input.templateId,
    createdAt: now,
    createdBy: input.organizerKey,
    nodeId: input.nodeId,
  };
  const signature = sign(
    canonicalEventPayload(payload),
    input.organizerSecretKey,
  );
  const event: Event = { ...payload, signature };

  if (!verifyEvent(event)) {
    throw new EventActionError(
      "signing_failed",
      "Event signature did not verify locally — refusing to persist.",
    );
  }

  await db.transaction(
    "rw",
    [db.events, db.outbox, db.settings],
    async () => {
      const row: EventRow = { ...event };
      await db.events.put(row);
      await enqueueEvent(event);
    },
  );

  return event;
}

// -- Read -------------------------------------------------------------------

/**
 * Straight Dexie read by id. Returns `null` (not `undefined`) when the
 * row is missing — same convention as the rest of the data layer.
 */
export async function getEvent(id: string): Promise<Event | null> {
  const row = await db.events.get(id);
  return row ?? null;
}

export interface ListEventsOptions {
  /** Inclusive lower bound on `startsAt` (epoch ms). */
  fromStartsAt?: number;
  /** Inclusive upper bound on `startsAt` (epoch ms). */
  toStartsAt?: number;
  /** When `false` (the default), events that have a matching
   *  `eventCancellations` row are filtered out. When `true`, the
   *  cancelled event still appears in the result — UI surfaces that
   *  render "Cancelled (reason)" lookup the cancellation separately. */
  includeCancelled?: boolean;
}

/**
 * List events in the local store, optionally filtered by start-time
 * window and cancellation status. The Calendar view in PR F is the
 * primary consumer; PR E's event-detail page consumes `getEvent`.
 *
 * Defaults: no window filter, cancelled events excluded.
 *
 * Cancellation filter is a per-row lookup in `db.eventCancellations`.
 * The cancellation table is expected to stay small (organizers do not
 * cancel often) so a per-row check is fine for phase 1; if it grows,
 * preloading the cancelled-id set is the obvious optimization.
 */
export async function listEvents(
  options: ListEventsOptions = {},
): Promise<Event[]> {
  const { fromStartsAt, toStartsAt, includeCancelled = false } = options;

  let collection = db.events.orderBy("startsAt");
  if (fromStartsAt !== undefined || toStartsAt !== undefined) {
    const lower = fromStartsAt ?? -Infinity;
    const upper = toStartsAt ?? Infinity;
    collection = db.events
      .where("startsAt")
      .between(lower, upper, true, true);
  }
  const rows = await collection.toArray();

  if (includeCancelled) return rows;

  const filtered: Event[] = [];
  for (const row of rows) {
    const cancellation = await db.eventCancellations
      .where("eventId")
      .equals(row.id)
      .first();
    if (cancellation) continue;
    filtered.push(row);
  }
  return filtered;
}

/**
 * Look up the signed cancellation row for an event, if any. Returns
 * `null` when the event is still confirmed (no cancellation row). The
 * event-detail page (PR E) consumes this to render the cancellation
 * banner and to hide the RSVP control once an event is cancelled.
 *
 * Read-only helper; does not mutate state, does not enqueue federation.
 * Mirrors the `getEvent` shape (single-row Dexie lookup, `null` for
 * missing, same convention as the rest of the data layer).
 */
export async function getEventCancellation(
  eventId: string,
): Promise<EventCancellation | null> {
  const row = await db.eventCancellations
    .where("eventId")
    .equals(eventId)
    .first();
  return row ?? null;
}

// -- RSVP (LOCAL-ONLY) ------------------------------------------------------

export interface RsvpToEventInput {
  eventId: string;
  memberKey: string;
  status: "going" | "maybe" | "not_going";
  /** Override the clock — tests inject a deterministic timestamp. */
  now?: number;
}

/**
 * Upsert a local RSVP row. First-time RSVP creates a new row; a
 * subsequent RSVP from the same `[eventId+memberKey]` pair updates the
 * existing row in place (keeping its `id`, updating `status` and
 * `respondedAt`).
 *
 * Federates since participation Phase 2 (docs/project-federation.md
 * §6): after the local transaction commits, the RSVP publishes as a
 * single-owner LWW `EventRsvpState` record, and any signups cleared
 * by a "not going" publish withdrawal tombstones. (The original
 * local-only stance and its negative tests were deliberately retired
 * — threat-model §7 "Federated participation records".)
 */
export async function rsvpToEvent(
  input: RsvpToEventInput,
): Promise<EventRsvpRow> {
  const now = input.now ?? Date.now();
  // One transaction so the RSVP write and the not_going signup clear
  // (below) are atomic — no render window may show a shift signup
  // without a live RSVP (docs/shift-signups.md §6.1). The scope is a
  // superset of what signUpForShift composes in, so Dexie nests it.
  const result = await db.transaction(
    "rw",
    [
      db.events,
      db.eventCancellations,
      db.eventRsvps,
      db.blocks,
      db.shiftSignups,
    ],
    async () => {
      // PR F: Events (RSVP) is a (c) bidirectional gate per
      // docs/blocking.md §6 — reject the RSVP write in either direction.
      // Generic-error discipline (§6.1): same not-available copy
      // cross-node RSVP uses (cited from community-events.md §7.3 in the
      // design doc). Look up the event's organizer for the block check;
      // if the event doesn't exist we let the existing flow handle it.
      const eventRow = await db.events.get(input.eventId);
      // The event must exist (Round-4 review): without this, a stray call
      // wrote a ghost RSVP row for an event that isn't here.
      if (!eventRow) {
        throw new Error("That event no longer exists.");
      }
      if (await isMutuallyBlocked(input.memberKey, eventRow.createdBy)) {
        throw new Error(BLOCKED_ACTION_MESSAGE);
      }
      // Don't RSVP to an organizer-cancelled event (Round-4 review): the
      // view gates this, but the two live queries update independently, so
      // a click in the window before re-render could still land. Bind to
      // organizer authority the same way the calendar does.
      const cancellation = await db.eventCancellations
        .where("eventId")
        .equals(input.eventId)
        .first();
      if (
        cancellation &&
        isAuthoritativeCancellation(cancellation, eventRow)
      ) {
        throw new Error("That event was cancelled.");
      }
      const existing = await db.eventRsvps
        .where("[eventId+memberKey]")
        .equals([input.eventId, input.memberKey])
        .first();

      const row: EventRsvpRow = existing
        ? {
            ...existing,
            status: input.status,
            respondedAt: now,
          }
        : {
            id: uuid(),
            eventId: input.eventId,
            memberKey: input.memberKey,
            status: input.status,
            respondedAt: now,
          };

      await db.eventRsvps.put(row);

      // "I'm not coming" must not leave the member's name on any slot
      // roster: going not_going clears their shift signups for this
      // event, atomically with the RSVP write
      // (docs/shift-signups.md §6.1). Removing a single SIGNUP does
      // NOT downgrade the RSVP — that asymmetry is deliberate. The
      // cleared rows are captured so their withdrawal TOMBSTONES can
      // publish after this transaction commits — the clear must reach
      // every other device's roster too.
      let clearedSignups: ShiftSignupRow[] = [];
      if (input.status === "not_going") {
        clearedSignups = await db.shiftSignups
          .where("[eventId+memberKey]")
          .equals([input.eventId, input.memberKey])
          .toArray();
        await db.shiftSignups
          .where("[eventId+memberKey]")
          .equals([input.eventId, input.memberKey])
          .delete();
      }

      return { row, clearedSignups };
    },
  );
  // Federate the RSVP and any signup tombstones. Both no-op inside
  // signUpForShift's ambient transaction — that mutator publishes
  // once after its own commit.
  await publishEventRsvpState(input.eventId, input.memberKey);
  for (const cleared of result.clearedSignups) {
    await publishShiftSignupState(cleared, input.memberKey, now);
  }
  return result.row;
}

/**
 * Find a single member's RSVP for an event, or `null` if they haven't
 * RSVP'd. Uses the `[eventId+memberKey]` compound index for an O(1)
 * lookup.
 */
export async function getMemberRsvp(
  eventId: string,
  memberKey: string,
): Promise<EventRsvpRow | null> {
  const row = await db.eventRsvps
    .where("[eventId+memberKey]")
    .equals([eventId, memberKey])
    .first();
  return row ?? null;
}

/**
 * List RSVPs for an event, optionally filtered to a subset of statuses.
 * The default (no `statusFilter`) returns every RSVP. The attention-rail
 * computations in PR F use the status-filtered form to find
 * `going`/`maybe` rosters per design-doc §8.
 */
export async function listRsvpsForEvent(
  eventId: string,
  statusFilter?: ("going" | "maybe" | "not_going")[],
): Promise<EventRsvpRow[]> {
  const rows = await db.eventRsvps
    .where("eventId")
    .equals(eventId)
    .toArray();
  if (!statusFilter || statusFilter.length === 0) return rows;
  const allowed = new Set(statusFilter);
  return rows.filter((row) => allowed.has(row.status));
}

/**
 * Count attendees for a given status. Convenience wrapper around
 * `listRsvpsForEvent` for the §8.3 `event_capacity_reached` query and
 * the §6 tiered-visibility "X going" rendering.
 */
export async function attendeeCount(
  eventId: string,
  status: "going" | "maybe",
): Promise<number> {
  const rows = await listRsvpsForEvent(eventId, [status]);
  return rows.length;
}

// -- Cancel -----------------------------------------------------------------

export interface CancelEventInput {
  eventId: string;
  /** Free text, 0..500 chars; empty allowed. */
  reason: string;
  /** Base64-encoded Ed25519 public key of the organizer. MUST equal
   *  the cancelled event's `createdBy`. */
  organizerKey: string;
  /** Base64-encoded Ed25519 secret key of the organizer (see note on
   *  `CreateEventInput.organizerSecretKey` re: codebase convention). */
  organizerSecretKey: string;
  nodeId: string;
  now?: number;
}

/**
 * Sign and persist a cancellation. Verifies the caller is the
 * original organizer (`organizerKey === event.createdBy`); rejects
 * otherwise. Idempotent: if a cancellation already exists for this
 * `eventId`, returns it without re-signing or re-enqueueing.
 *
 * Cancellation is the only lifecycle transition phase 1 supports
 * (design doc §5). The §8.2 `event_cancelled` attention-item query
 * (PR F) reads this table.
 */
export async function cancelEvent(
  input: CancelEventInput,
): Promise<EventCancellation> {
  const event = await db.events.get(input.eventId);
  if (!event) {
    throw new EventActionError(
      "event_not_found",
      "Event not found on this node.",
    );
  }
  if (event.createdBy !== input.organizerKey) {
    throw new EventActionError(
      "not_organizer",
      "Only the original organizer can cancel this event.",
    );
  }

  const existing = await db.eventCancellations
    .where("eventId")
    .equals(input.eventId)
    .first();
  if (existing) return existing;

  const now = input.now ?? Date.now();
  const payload = {
    id: uuid(),
    kind: "event_cancellation" as const,
    eventId: input.eventId,
    reason: input.reason,
    cancelledAt: now,
    createdBy: input.organizerKey,
    nodeId: input.nodeId,
  };
  const signature = sign(
    canonicalEventCancellationPayload(payload),
    input.organizerSecretKey,
  );
  const cancellation: EventCancellation = { ...payload, signature };

  if (!verifyEventCancellation(cancellation)) {
    throw new EventActionError(
      "signing_failed",
      "Cancellation signature did not verify locally — refusing to persist.",
    );
  }

  await db.transaction(
    "rw",
    [db.eventCancellations, db.outbox, db.settings],
    async () => {
      const row: EventCancellationRow = { ...cancellation };
      await db.eventCancellations.put(row);
      await enqueueEventCancellation(cancellation);
    },
  );

  return cancellation;
}
