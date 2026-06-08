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
import { describe, expect, it } from "vitest";
import {
  canonicalEventCancellationPayload,
  canonicalEventPayload,
  generateKeyPair,
  sign,
  verifyEvent,
  verifyEventCancellation,
} from "./crypto";
import type {
  Event,
  EventCancellation,
  EventCancellationPayload,
  EventPayload,
} from "@understoria/shared/types";

// ---------------------------------------------------------------------------
// Community-event signature + canonical-payload tests. Mirrors the
// co-organizer crypto test discipline: round-trip verify, tampered-
// payload + tampered-signature + wrong-signer rejection, canonical
// determinism (incl. null-field edge cases), and a literal-string
// field-order assertion to catch accidental alphabetization.
// ---------------------------------------------------------------------------

// Deterministic epoch-ms constants so canonical-serialization tests
// don't depend on `Date.now()` clock state.
const STARTS_AT_FULL = Date.UTC(2026, 6, 4, 17, 0, 0); // 2026-07-04T17:00:00Z
const ENDS_AT_FULL = Date.UTC(2026, 6, 4, 19, 0, 0); // 2026-07-04T19:00:00Z
const STARTS_AT_MIN = Date.UTC(2026, 6, 5, 17, 0, 0); // 2026-07-05T17:00:00Z
const CREATED_AT = Date.UTC(2026, 5, 1, 9, 0, 0); // 2026-06-01T09:00:00Z
const CANCELLED_AT = Date.UTC(2026, 6, 3, 10, 0, 0); // 2026-07-03T10:00:00Z

function makeFullPayload(organizerKey: string): EventPayload {
  return {
    id: "evt_01",
    kind: "event",
    title: "Community fridge restock",
    description: "Bring shelf-stable goods; volunteers welcome.",
    category: "infrastructure",
    startsAt: STARTS_AT_FULL,
    endsAt: ENDS_AT_FULL,
    location: "Community room, 3rd floor",
    capacity: 30,
    templateId: null,
    createdAt: CREATED_AT,
    createdBy: organizerKey,
    nodeId: "test-node",
  };
}

function makeMinimalNullsPayload(organizerKey: string): EventPayload {
  return {
    id: "evt_02",
    kind: "event",
    title: "Quiet study circle",
    description: "",
    category: "social",
    startsAt: STARTS_AT_MIN,
    endsAt: null,
    location: "Library reading room",
    capacity: null,
    templateId: null,
    createdAt: CREATED_AT,
    createdBy: organizerKey,
    nodeId: "test-node",
  };
}

function makeCancellationPayload(
  organizerKey: string,
  reason: string,
): EventCancellationPayload {
  return {
    id: "evtc_01",
    kind: "event_cancellation",
    eventId: "evt_01",
    reason,
    cancelledAt: CANCELLED_AT,
    createdBy: organizerKey,
    nodeId: "test-node",
  };
}

describe("canonicalEventPayload", () => {
  it("produces identical bytes across calls for the same input", () => {
    const kp = generateKeyPair();
    const p = makeFullPayload(kp.publicKey);
    expect(canonicalEventPayload(p)).toBe(canonicalEventPayload(p));
  });

  it("is independent of caller-supplied JS property order", () => {
    // Round-trip through JSON.parse(JSON.stringify(...)) so the
    // resulting object's insertion order is whatever the JSON
    // serializer chose, not the order we declared the literal in.
    // If the canonicalizer were trusting input key order, this
    // would diverge.
    const kp = generateKeyPair();
    const p = makeFullPayload(kp.publicKey);
    const reparsed = JSON.parse(JSON.stringify(p)) as EventPayload;
    expect(canonicalEventPayload(p)).toBe(canonicalEventPayload(reparsed));
  });

  it("treats null endsAt / capacity / templateId as literal null bytes", () => {
    // The all-nulls payload must serialize with the null keys
    // present, not omitted — otherwise signers and verifiers
    // disagree on records that take the "uncapped" / "no end" path.
    const kp = generateKeyPair();
    const p = makeMinimalNullsPayload(kp.publicKey);
    const s = canonicalEventPayload(p);
    expect(s).toContain('"endsAt":null');
    expect(s).toContain('"capacity":null');
    expect(s).toContain('"templateId":null');
    // And it must be deterministic across re-stringify, same as
    // the full payload.
    const reparsed = JSON.parse(JSON.stringify(p)) as EventPayload;
    expect(canonicalEventPayload(p)).toBe(canonicalEventPayload(reparsed));
  });

  it("emits fields in the wire-contract order declared in EventPayload", () => {
    // Field order IS the wire contract. If someone alphabetizes,
    // every existing signature stops verifying — that's a silent
    // federation break. Pin the order with a literal-string check.
    const kp = generateKeyPair();
    const p = makeFullPayload(kp.publicKey);
    const s = canonicalEventPayload(p);
    expect(s.startsWith('{"id":')).toBe(true);
    const order = [
      "id",
      "kind",
      "title",
      "description",
      "category",
      "startsAt",
      "endsAt",
      "location",
      "capacity",
      "templateId",
      "createdAt",
      "createdBy",
      "nodeId",
    ];
    let cursor = 0;
    for (const key of order) {
      const at = s.indexOf(`"${key}":`, cursor);
      expect(at).toBeGreaterThanOrEqual(cursor);
      cursor = at + key.length;
    }
    // nodeId must appear last in the serialized JSON — the wire
    // contract puts the origin-node identifier at the tail to match
    // every other federated record type (e.g. Post, Exchange,
    // CoOrganizerInvitationPayload).
    const nodeIdAt = s.indexOf('"nodeId":');
    expect(nodeIdAt).toBeGreaterThan(0);
    // The substring after `"nodeId":"..."` should be just the
    // closing brace — no further fields.
    expect(s.endsWith(`"nodeId":"${"test-node"}"}`)).toBe(true);
  });

  it("remains deterministic when nodeId is present", () => {
    // Regression guard for the contract change that added nodeId to
    // EventPayload. The canonicalizer must include nodeId in the
    // serialized bytes (otherwise federated peers can't attribute
    // the record) AND must do so deterministically across re-
    // stringify, matching the discipline used for every other field.
    const kp = generateKeyPair();
    const p = makeFullPayload(kp.publicKey);
    const s = canonicalEventPayload(p);
    expect(s).toContain('"nodeId":"test-node"');
    const reparsed = JSON.parse(JSON.stringify(p)) as EventPayload;
    expect(canonicalEventPayload(p)).toBe(canonicalEventPayload(reparsed));
    // And mutating just nodeId must change the canonical bytes —
    // i.e. nodeId is signed-over, not silently dropped.
    const otherNode: EventPayload = { ...p, nodeId: "other-node" };
    expect(canonicalEventPayload(otherNode)).not.toBe(s);
  });
});

describe("verifyEvent", () => {
  it("returns true for a freshly-signed payload (round-trip)", () => {
    const kp = generateKeyPair();
    const payload = makeFullPayload(kp.publicKey);
    const signature = sign(canonicalEventPayload(payload), kp.secretKey);
    const event: Event = { ...payload, signature };
    expect(verifyEvent(event)).toBe(true);
  });

  it("returns false when the title has been tampered with", () => {
    const kp = generateKeyPair();
    const payload = makeFullPayload(kp.publicKey);
    const signature = sign(canonicalEventPayload(payload), kp.secretKey);
    const tampered: Event = {
      ...payload,
      title: "Free yacht raffle — show up early!",
      signature,
    };
    expect(verifyEvent(tampered)).toBe(false);
  });

  it("returns false when the signature bytes have been tampered with", () => {
    const kp = generateKeyPair();
    const payload = makeFullPayload(kp.publicKey);
    const signature = sign(canonicalEventPayload(payload), kp.secretKey);
    // Flip the first base64 character to a known-different one;
    // any single-char delta in base64 produces invalid sig bytes.
    const flipped =
      (signature[0] === "A" ? "B" : "A") + signature.slice(1);
    const tampered: Event = { ...payload, signature: flipped };
    expect(verifyEvent(tampered)).toBe(false);
  });

  it("returns false when the signature came from a different key than createdBy", () => {
    // Key A signs a payload that claims `createdBy: B`. The
    // signature is well-formed but verifies against A, not B —
    // so a verifier holding only the record sees a key mismatch.
    const organizer = generateKeyPair();
    const stranger = generateKeyPair();
    const payload = makeFullPayload(organizer.publicKey);
    const signature = sign(
      canonicalEventPayload(payload),
      stranger.secretKey,
    );
    const wrongSigner: Event = { ...payload, signature };
    expect(verifyEvent(wrongSigner)).toBe(false);
  });

  it("returns false for an empty signature string", () => {
    const kp = generateKeyPair();
    const payload = makeFullPayload(kp.publicKey);
    const event: Event = { ...payload, signature: "" };
    expect(verifyEvent(event)).toBe(false);
  });
});

describe("canonicalEventCancellationPayload", () => {
  it("produces identical bytes across calls for the same input", () => {
    const kp = generateKeyPair();
    const p = makeCancellationPayload(kp.publicKey, "Venue lost power.");
    expect(canonicalEventCancellationPayload(p)).toBe(
      canonicalEventCancellationPayload(p),
    );
  });

  it("is stable across re-stringify when reason is empty", () => {
    const kp = generateKeyPair();
    const p = makeCancellationPayload(kp.publicKey, "");
    const reparsed = JSON.parse(JSON.stringify(p)) as EventCancellationPayload;
    expect(canonicalEventCancellationPayload(p)).toBe(
      canonicalEventCancellationPayload(reparsed),
    );
    // And the empty reason serializes as a literal empty string,
    // not omitted.
    expect(canonicalEventCancellationPayload(p)).toContain('"reason":""');
  });

  it("emits fields in the wire-contract order declared in EventCancellationPayload", () => {
    const kp = generateKeyPair();
    const p = makeCancellationPayload(kp.publicKey, "Venue lost power.");
    const s = canonicalEventCancellationPayload(p);
    expect(s.startsWith('{"id":')).toBe(true);
    const order = [
      "id",
      "kind",
      "eventId",
      "reason",
      "cancelledAt",
      "createdBy",
      "nodeId",
    ];
    let cursor = 0;
    for (const key of order) {
      const at = s.indexOf(`"${key}":`, cursor);
      expect(at).toBeGreaterThanOrEqual(cursor);
      cursor = at + key.length;
    }
    // nodeId must appear last — same wire-contract discipline as
    // EventPayload above.
    expect(s.endsWith(`"nodeId":"${"test-node"}"}`)).toBe(true);
  });

  it("remains deterministic when nodeId is present", () => {
    const kp = generateKeyPair();
    const p = makeCancellationPayload(kp.publicKey, "Venue lost power.");
    const s = canonicalEventCancellationPayload(p);
    expect(s).toContain('"nodeId":"test-node"');
    const reparsed = JSON.parse(JSON.stringify(p)) as EventCancellationPayload;
    expect(canonicalEventCancellationPayload(p)).toBe(
      canonicalEventCancellationPayload(reparsed),
    );
    // Mutating just nodeId must change the canonical bytes — i.e.
    // nodeId is signed-over, not silently dropped.
    const otherNode: EventCancellationPayload = { ...p, nodeId: "other-node" };
    expect(canonicalEventCancellationPayload(otherNode)).not.toBe(s);
  });
});

describe("verifyEventCancellation", () => {
  it("returns true for a freshly-signed cancellation (round-trip)", () => {
    const kp = generateKeyPair();
    const payload = makeCancellationPayload(kp.publicKey, "Venue lost power.");
    const signature = sign(
      canonicalEventCancellationPayload(payload),
      kp.secretKey,
    );
    const cancellation: EventCancellation = { ...payload, signature };
    expect(verifyEventCancellation(cancellation)).toBe(true);
  });

  it("returns false when the reason has been tampered with", () => {
    const kp = generateKeyPair();
    const payload = makeCancellationPayload(kp.publicKey, "Venue lost power.");
    const signature = sign(
      canonicalEventCancellationPayload(payload),
      kp.secretKey,
    );
    const tampered: EventCancellation = {
      ...payload,
      reason: "Cancelled because the organizer is sick.",
      signature,
    };
    expect(verifyEventCancellation(tampered)).toBe(false);
  });

  it("returns false when the referenced eventId has been tampered with", () => {
    const kp = generateKeyPair();
    const payload = makeCancellationPayload(kp.publicKey, "Venue lost power.");
    const signature = sign(
      canonicalEventCancellationPayload(payload),
      kp.secretKey,
    );
    const tampered: EventCancellation = {
      ...payload,
      eventId: "evt_a_completely_different_one",
      signature,
    };
    expect(verifyEventCancellation(tampered)).toBe(false);
  });

  it("returns false for an empty signature string", () => {
    const kp = generateKeyPair();
    const payload = makeCancellationPayload(kp.publicKey, "");
    const cancellation: EventCancellation = { ...payload, signature: "" };
    expect(verifyEventCancellation(cancellation)).toBe(false);
  });
});
