/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  authoritativeCancelledEventIds,
  isAuthoritativeCancellation,
} from "./eventCancellation";

// Round-4: a cancellation only hides an event when its author is the
// event's organizer. A non-organizer's forged (but validly-signed)
// cancellation must be inert everywhere it renders.

describe("isAuthoritativeCancellation", () => {
  it("accepts a cancellation by the event's organizer", () => {
    expect(
      isAuthoritativeCancellation(
        { eventId: "ev1", createdBy: "org" },
        { id: "ev1", createdBy: "org" },
      ),
    ).toBe(true);
  });

  it("rejects a cancellation whose author is NOT the organizer (forgery)", () => {
    expect(
      isAuthoritativeCancellation(
        { eventId: "ev1", createdBy: "attacker" },
        { id: "ev1", createdBy: "org" },
      ),
    ).toBe(false);
  });

  it("rejects when the event is missing (nothing to bind to)", () => {
    expect(
      isAuthoritativeCancellation({ eventId: "ev1", createdBy: "org" }, null),
    ).toBe(false);
    expect(isAuthoritativeCancellation(null, { id: "ev1", createdBy: "org" })).toBe(
      false,
    );
  });
});

describe("authoritativeCancelledEventIds", () => {
  it("includes only organizer-authored cancellations", () => {
    const events = [
      { id: "a", createdBy: "org_a" },
      { id: "b", createdBy: "org_b" },
    ];
    const cancellations = [
      { eventId: "a", createdBy: "org_a" }, // authoritative
      { eventId: "b", createdBy: "attacker" }, // forged
      { eventId: "ghost", createdBy: "anyone" }, // no such event
    ];
    const ids = authoritativeCancelledEventIds(events, cancellations);
    expect(ids.has("a")).toBe(true);
    expect(ids.has("b")).toBe(false);
    expect(ids.has("ghost")).toBe(false);
  });
});
