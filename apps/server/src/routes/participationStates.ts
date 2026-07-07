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
import type { FastifyInstance } from "fastify";
import { verifyStateRecord } from "@understoria/shared/crypto";
import type {
  EventRsvpStateStore,
  EventShiftStateStore,
  EventStore,
  ShiftSignupStateStore,
} from "../db.js";
import {
  parseEventRsvpState,
  parseEventShiftState,
  parseShiftSignupState,
} from "../validate.js";

interface Deps {
  rsvpStore: EventRsvpStateStore;
  shiftStore: EventShiftStateStore;
  signupStore: ShiftSignupStateStore;
  eventStore: EventStore;
}

/**
 * Participation federation Phase 2 (docs/project-federation.md §6):
 * RSVPs, shift definitions, and shift signups as signed
 * last-writer-wins state records, on the Phase 1 machinery.
 *
 * Authority, checked against STORED rows so a hostile write cannot
 * grant itself anything:
 *   - RSVP: single-owner — `signerKey === memberKey`, keyed by the
 *     natural key (eventId, memberKey) so two devices of one member
 *     can never double-count a roster.
 *   - Shift: only the stored EVENT's `createdBy` (the organizer).
 *     Deletion is a tombstone (`deletedAt`), which keeps winning LWW
 *     against stale live copies.
 *   - Signup: single-owner (`signerKey === memberKey`), natural key
 *     (shiftId, memberKey), withdrawal as tombstone.
 *
 * Status codes match the Phase 1 routes: 201 accepted, 200
 * `{stored:false}` for stale (idempotent for the outbox), 400
 * malformed, 403 unauthorized, 409 for a missing referent the outbox
 * should retry (event not here yet / shift not here yet), 422 bad
 * signature.
 *
 * Deliberately NOT here: capacity enforcement. The cap is a soft
 * planning aid (docs/shift-signups.md §11.5) and the server never
 * bounces a member for being one-too-many.
 */
export async function registerParticipationStateRoutes(
  app: FastifyInstance,
  { rsvpStore, shiftStore, signupStore, eventStore }: Deps,
): Promise<void> {
  app.post("/event-rsvps", async (req, reply) => {
    const parsed = parseEventRsvpState(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;

    if (!verifyStateRecord(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }
    if (record.signerKey !== record.memberKey) {
      reply.code(403);
      return { error: "not_authorized", reason: "not_own_rsvp" };
    }
    if (!eventStore.get(record.eventId)) {
      reply.code(409);
      return { error: "unknown_event", eventId: record.eventId };
    }

    const stored = rsvpStore.get(record.eventId, record.memberKey);
    if (stored && record.updatedAt <= stored.updatedAt) {
      reply.code(200);
      return { stored: false, id: record.id };
    }

    rsvpStore.upsert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  app.post("/event-shifts", async (req, reply) => {
    const parsed = parseEventShiftState(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;

    if (!verifyStateRecord(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }
    const event = eventStore.get(record.eventId);
    if (!event) {
      reply.code(409);
      return { error: "unknown_event", eventId: record.eventId };
    }
    // Shift authority derives from the EVENT, which is immutable and
    // organizer-signed — simpler than the project case: there is
    // exactly one legitimate signer and it never changes.
    if (record.signerKey !== event.createdBy) {
      reply.code(403);
      return { error: "not_authorized", reason: "not_event_organizer" };
    }

    const stored = shiftStore.get(record.id);
    if (stored && record.updatedAt <= stored.updatedAt) {
      reply.code(200);
      return { stored: false, id: record.id };
    }
    if (stored && stored.eventId !== record.eventId) {
      // A shift can't migrate between events; a mismatch is either a
      // bug or an id-squatting attempt.
      reply.code(403);
      return { error: "not_authorized", reason: "event_mismatch" };
    }

    shiftStore.upsert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  app.post("/shift-signups", async (req, reply) => {
    const parsed = parseShiftSignupState(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const record = parsed.value;

    if (!verifyStateRecord(record)) {
      reply.code(422);
      return { error: "bad_signature" };
    }
    if (record.signerKey !== record.memberKey) {
      reply.code(403);
      return { error: "not_authorized", reason: "not_own_signup" };
    }
    const shift = shiftStore.get(record.shiftId);
    if (!shift) {
      reply.code(409);
      return { error: "unknown_shift", shiftId: record.shiftId };
    }
    if (shift.eventId !== record.eventId) {
      // The denormalized event pointer must match the shift's — a
      // mismatch would park the signup under the wrong event roster.
      reply.code(400);
      return {
        error: "invalid_body",
        reason: "eventId does not match the shift's event",
      };
    }
    // A signup arriving for a tombstoned shift is stored as-is: the
    // signer's device just hadn't seen the deletion yet, and rosters
    // render nothing for a deleted shift anyway.

    const stored = signupStore.get(record.shiftId, record.memberKey);
    if (stored && record.updatedAt <= stored.updatedAt) {
      reply.code(200);
      return { stored: false, id: record.id };
    }

    signupStore.upsert(record);
    reply.code(201);
    return { stored: true, id: record.id };
  });

  const parseListQuery = (q: {
    since?: string;
    sinceId?: string;
    limit?: string;
  }) => {
    const since = q.since ? Number.parseInt(q.since, 10) : undefined;
    const limit = q.limit ? Number.parseInt(q.limit, 10) : undefined;
    return {
      since:
        since !== undefined && Number.isFinite(since) && since >= 0
          ? since
          : undefined,
      sinceId: q.sinceId && q.sinceId.length > 0 ? q.sinceId : undefined,
      limit:
        limit !== undefined && Number.isFinite(limit) && limit > 0
          ? limit
          : undefined,
    };
  };

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/event-rsvps", async (req) => {
    const eventRsvps = rsvpStore.list(parseListQuery(req.query));
    return { count: eventRsvps.length, eventRsvps };
  });

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/event-shifts", async (req) => {
    const eventShifts = shiftStore.list(parseListQuery(req.query));
    return { count: eventShifts.length, eventShifts };
  });

  app.get<{
    Querystring: { since?: string; sinceId?: string; limit?: string };
  }>("/shift-signups", async (req) => {
    const shiftSignups = signupStore.list(parseListQuery(req.query));
    return { count: shiftSignups.length, shiftSignups };
  });
}
