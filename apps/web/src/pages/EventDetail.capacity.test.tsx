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
/**
 * Event detail capacity-fill display ("8 of 12 going"). Covers: the
 * fill line renders where capacity renders (using the same node-local
 * going count every local viewer already sees), an uncapped event keeps
 * the plain going-count rendering, and the §6 visibility tiers are
 * unchanged — a non-RSVP'd viewer sees the fill + count but never the
 * roster names.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event, EventRsvpRow, Member } from "@/types";

// Same positional useLiveQuery stub as EventDetail.menu.test.tsx —
// EventDetail's queries run in a fixed order (event, cancellation,
// myRsvp, rsvps, projectLink); each call reads its slot.
let liveSequence: unknown[] = [];
let liveCursor = 0;
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (querier: () => unknown) => {
    if (liveCursor >= liveSequence.length) liveCursor = 0;
    const value = liveSequence[liveCursor];
    liveCursor += 1;
    void querier;
    return value;
  },
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("@/db/events", () => ({
  cancelEvent: vi.fn(),
  getEvent: vi.fn(),
  getEventCancellation: vi.fn(),
  getMemberRsvp: vi.fn(),
  listRsvpsForEvent: vi.fn(),
}));
vi.mock("@/db/eventProjectLinks", () => ({ getLinkForEvent: vi.fn() }));
vi.mock("@/db/secrets", () => ({ getSecretKey: vi.fn(async () => "secret") }));
vi.mock("@/components/EventRsvpControl", () => ({
  EventRsvpControl: () => null,
}));

import "@/i18n";
import EventDetailPage from "./EventDetail";

const nodeId = "node_test";
const organizerKey = "organizer-key";
const viewerKey = "viewer-key";
const goerAKey = "goer-a-key";
const goerBKey = "goer-b-key";

function member(publicKey: string, displayName: string): Member {
  return {
    publicKey,
    displayName,
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId,
    locationZone: "",
  };
}

function event(overrides: Partial<Event> = {}): Event {
  return {
    id: "evt-1",
    kind: "event",
    title: "Community garden work day",
    description: "",
    category: "infrastructure",
    startsAt: 1_700_000_000_000,
    endsAt: null,
    location: "Community room",
    capacity: null,
    templateId: null,
    createdAt: 0,
    createdBy: organizerKey,
    nodeId,
    signature: "",
    ...overrides,
  };
}

function rsvp(
  id: string,
  memberKey: string,
  status: EventRsvpRow["status"],
): EventRsvpRow {
  return { id, eventId: "evt-1", memberKey, status, respondedAt: 1 };
}

interface MockState {
  currentMember: Member | null;
  members: Member[];
  nodeId: string;
  lockState: "unprotected" | "locked" | "unlocked";
  projects: unknown[];
  blockedKeys: ReadonlySet<string>;
}

let mockState: MockState;

function freshState(): MockState {
  return {
    currentMember: member(viewerKey, "Vic Viewer"),
    members: [
      member(organizerKey, "Olive Organizer"),
      member(viewerKey, "Vic Viewer"),
      member(goerAKey, "Gia Goer"),
      member(goerBKey, "Gus Goer"),
    ],
    nodeId,
    lockState: "unprotected",
    projects: [],
    blockedKeys: new Set<string>(),
  };
}

// Per-render live-query sequence: event, cancellation, viewer's own
// rsvp, full rsvp list, project link.
function setLiveQueries(
  evt: Event,
  rsvps: EventRsvpRow[],
  myRsvp: EventRsvpRow | null = null,
) {
  liveSequence = [evt, null, myRsvp, rsvps, null];
  liveCursor = 0;
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = freshState();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/events/evt-1"]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

describe("EventDetailPage — capacity fill", () => {
  it("renders '<going> of <capacity> going' where capacity renders", () => {
    setLiveQueries(event({ capacity: 12 }), [
      rsvp("r1", goerAKey, "going"),
      rsvp("r2", goerBKey, "going"),
      rsvp("r3", organizerKey, "maybe"),
    ]);
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("2 of 12 going");
    // The bare-number rendering is gone from the Capacity field.
    expect(text).toContain("Capacity");
  });

  it("keeps the plain going-count rendering for an uncapped event", () => {
    setLiveQueries(event({ capacity: null }), [
      rsvp("r1", goerAKey, "going"),
      rsvp("r2", goerBKey, "going"),
    ]);
    render();
    const text = container.textContent ?? "";
    // No capacity field, no fill line.
    expect(text).not.toContain("Capacity");
    expect(text).not.toMatch(/\d+ of \d+ going/);
    // The existing attendee count line is unchanged.
    expect(text).toContain("2 going · 0 maybe");
  });

  it("does not widen the §6 tiers: a non-RSVP'd viewer sees the fill but never roster names", () => {
    setLiveQueries(
      event({ capacity: 12 }),
      [rsvp("r1", goerAKey, "going"), rsvp("r2", goerBKey, "going")],
      null, // viewer has not RSVP'd
    );
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("2 of 12 going");
    // Count-tier viewer: hint shown, names hidden.
    expect(text).toContain("2 going · 0 maybe");
    expect(text).not.toContain("Gia Goer");
    expect(text).not.toContain("Gus Goer");
  });

  it("roster tier unchanged: a 'going' viewer still sees names alongside the fill", () => {
    const mine = rsvp("r-mine", viewerKey, "going");
    setLiveQueries(
      event({ capacity: 12 }),
      [rsvp("r1", goerAKey, "going"), mine],
      mine,
    );
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("2 of 12 going");
    expect(text).toContain("Gia Goer");
  });
});
