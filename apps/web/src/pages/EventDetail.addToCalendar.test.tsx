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
 * "Add to calendar" on the event detail overflow menu — the §11.5a
 * single-event .ics export affordance. This suite covers the wiring
 * only: the item renders (with its reminders-are-yours hint), hides
 * when the event is cancelled (same treatment as the RSVP control),
 * and selecting it calls the generator with the event + origin and
 * hands the result to a Blob download named by `icsFilename`. The
 * generator's output is covered in `lib/eventIcs.test.ts` — jsdom
 * can't observe a real download, so we assert the calls, not the
 * bytes on disk.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event, EventCancellation, Member } from "@/types";

const { buildEventIcsMock, icsFilenameMock } = vi.hoisted(() => ({
  buildEventIcsMock: vi.fn(() => "BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n"),
  icsFilenameMock: vi.fn(() => "community-garden-work-day.ics"),
}));

vi.mock("@/lib/eventIcs", () => ({
  buildEventIcs: buildEventIcsMock,
  icsFilename: icsFilenameMock,
}));

// Same useLiveQuery stubbing scheme as EventDetail.menu.test.tsx: the
// page's queries run in a fixed order (event, cancellation, myRsvp,
// rsvps, projectLink); a shared cursor hands back canned values.
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
// Stubbed for the same reason as EventRsvpControl: the shifts section
// runs its own live queries, which would desync this suite's
// fixed-order useLiveQuery sequence. Covered in
// EventShiftsSection.test.tsx.
vi.mock("@/components/EventShiftsSection", () => ({
  EventShiftsSection: () => null,
}));

import "@/i18n";
import EventDetailPage from "./EventDetail";

const nodeId = "node_test";
const organizerKey = "organizer-key";
const viewerKey = "viewer-key";

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

function cancellation(): EventCancellation {
  return {
    id: "cxl-1",
    kind: "event_cancellation",
    eventId: "evt-1",
    reason: "Rain",
    cancelledAt: 1_700_000_100_000,
    createdBy: organizerKey,
    nodeId,
    signature: "",
  };
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

function setLiveQueries(evt: Event, cxl: EventCancellation | null) {
  liveSequence = [evt, cxl, null, [], [], null];
  liveCursor = 0;
}

let container: HTMLDivElement;
let root: Root;
let createObjectURLMock: ReturnType<typeof vi.fn>;
let revokeObjectURLMock: ReturnType<typeof vi.fn>;
let anchorClickSpy: ReturnType<typeof vi.spyOn>;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = {
    currentMember: member(viewerKey, "Vic Viewer"),
    members: [
      member(organizerKey, "Olive Organizer"),
      member(viewerKey, "Vic Viewer"),
    ],
    nodeId,
    lockState: "unprotected",
    projects: [],
    blockedKeys: new Set<string>(),
  };
  setLiveQueries(event(), null);
  buildEventIcsMock.mockClear();
  icsFilenameMock.mockClear();
  // jsdom implements neither object URLs nor real downloads; stub the
  // seam so the click path runs and the calls are observable.
  createObjectURLMock = vi.fn(() => "blob:understoria/ics");
  revokeObjectURLMock = vi.fn();
  (URL as unknown as { createObjectURL: unknown }).createObjectURL =
    createObjectURLMock;
  (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL =
    revokeObjectURLMock;
  anchorClickSpy = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => undefined);
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  anchorClickSpy.mockRestore();
});

function render(initialPath = "/events/evt-1") {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

function openMenu() {
  const trigger = container.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="menu"]',
  );
  if (!trigger) throw new Error("event header menu trigger not found");
  act(() => {
    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function addToCalendarItem(): HTMLButtonElement | undefined {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'),
  ).find((b) => (b.textContent ?? "").startsWith("Add to calendar"));
}

describe("EventDetailPage — Add to calendar (§11.5a export)", () => {
  it("shows the item with the reminders-are-yours hint for a visible event", () => {
    render();
    openMenu();
    const item = addToCalendarItem();
    expect(item).toBeDefined();
    // The hint carries the no-VALARM stance to the member.
    expect(item!.textContent).toContain(
      "Reminders are up to you and your calendar app.",
    );
  });

  it("hides the item when the event is cancelled (same as the RSVP control)", () => {
    setLiveQueries(event(), cancellation());
    render();
    openMenu();
    expect(addToCalendarItem()).toBeUndefined();
    // The rest of the menu (Copy link) is still there.
    expect(
      container.querySelectorAll('button[role="menuitem"]'),
    ).toHaveLength(1);
  });

  it("selecting it builds the .ics for this event with the app origin and downloads it", () => {
    render();
    openMenu();
    const item = addToCalendarItem();
    expect(item).toBeDefined();
    act(() => {
      item!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(buildEventIcsMock).toHaveBeenCalledTimes(1);
    expect(buildEventIcsMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "evt-1", nodeId }),
      { appUrl: window.location.origin },
    );
    expect(icsFilenameMock).toHaveBeenCalledWith("Community garden work day");
    // Blob → object URL → anchor click → revoke.
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    const blob = createObjectURLMock.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/calendar");
    expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:understoria/ics");
  });
});
