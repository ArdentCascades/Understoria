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
 * Event detail header overflow menu (`/events/:eventId`). Covers the
 * kebab that carries Copy link and Add to calendar (RSVP stays a
 * primary control, Cancel Event stays inline + destructive). Asserts
 * the trigger exists with the right a11y contract and that Copy link
 * writes the canonical `/events/<id>` URL and toasts the confirmation.
 * The Add to calendar item's behavior lives in
 * `EventDetail.addToCalendar.test.tsx`.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event } from "@/types";

const { showToastMock, writeTextMock } = vi.hoisted(() => ({
  showToastMock: vi.fn(),
  writeTextMock: vi.fn(async (_url: string) => undefined),
}));

// EventDetail drives all of its reads through useLiveQuery in a fixed
// order: event, cancellation, myRsvp, rsvps, projectLink. We stub the
// hook to hand back the per-call value from `liveSequence`, reset to the
// head of the sequence on each React render via a module-level cursor
// that the mock advances. Because the cursor is shared across renders,
// each call site reads its slot by position; we re-point the cursor to 0
// whenever the component re-renders by keying off the first query (the
// event one always runs first).
let liveSequence: unknown[] = [];
let liveCursor = 0;
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (querier: () => unknown) => {
    // The event query is always the first useLiveQuery call in a render
    // pass; detect it to reset the per-render cursor. We can't introspect
    // the closure, so we rely on call ordering: when the cursor has run
    // off the end of the sequence, wrap back to the front (next render).
    if (liveCursor >= liveSequence.length) liveCursor = 0;
    const value = liveSequence[liveCursor];
    liveCursor += 1;
    // Keep the querier referenced so its captured deps don't read as
    // unused; it's never invoked (we return canned values instead).
    void querier;
    return value;
  },
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
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
// EventRsvpControl reads from its own dexie queries; stub it to a marker
// so the page renders without touching the DB. (Its presence/absence is
// not what this suite asserts.)
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
import type { Member } from "@/types";

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
    ],
    nodeId,
    lockState: "unprotected",
    projects: [],
    blockedKeys: new Set<string>(),
  };
}

// Set the per-render live-query sequence for the standard happy path:
// event present, no cancellation, no rsvp, empty roster, no project link.
function setLiveQueries(evt: Event | null | undefined) {
  liveSequence = [
    evt, // getEvent
    null, // getEventCancellation
    null, // getMemberRsvp
    [], // listRsvpsForEvent
    [], // listShiftsForEvent (print roster menu gate)
    null, // getLinkForEvent
  ];
  liveCursor = 0;
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = freshState();
  setLiveQueries(event());
  showToastMock.mockClear();
  writeTextMock.mockClear();
  writeTextMock.mockResolvedValue(undefined);
  // Copy link routes through @/lib/share. Force the clipboard path by
  // removing navigator.share and stubbing clipboard.writeText so the URL
  // is observable.
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: writeTextMock },
  });
  if ("share" in navigator) {
    delete (navigator as { share?: unknown }).share;
  }
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
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

function menuTrigger(): HTMLButtonElement {
  const btn = container.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="menu"]',
  );
  if (!btn) throw new Error("event header menu trigger not found");
  return btn;
}

function openMenu() {
  act(() => {
    menuTrigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function menuItemByText(label: string): HTMLButtonElement | undefined {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'),
  ).find((b) => (b.textContent ?? "").trim() === label);
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("EventDetailPage — header overflow menu", () => {
  it("renders the kebab trigger with aria-haspopup=menu and the event-actions label", () => {
    render();
    const trigger = menuTrigger();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-label")).toBe("Event actions");
  });

  it("opening the menu shows Copy link, Add to calendar, and Print flyer (the only three items)", () => {
    render();
    openMenu();
    expect(menuItemByText("Copy link")).toBeDefined();
    // Add to calendar carries a description line inside the same
    // menuitem, so match on the label prefix rather than full text.
    const items = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'),
    );
    expect(
      items.some((b) => (b.textContent ?? "").startsWith("Add to calendar")),
    ).toBe(true);
    // Paper systems P1. The sign-in-sheet item is NOT here: this
    // event has no shifts (the live sequence's shifts slot is []),
    // and the roster item only appears once shifts exist.
    expect(menuItemByText("Print flyer")).toBeDefined();
    expect(items).toHaveLength(3);
  });

  it("selecting Copy link writes the canonical /events/<id> URL and toasts the confirmation", async () => {
    render();
    openMenu();
    const item = menuItemByText("Copy link");
    expect(item).toBeDefined();
    act(() => {
      item!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();
    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock).toHaveBeenCalledWith(
      `${window.location.origin}/events/evt-1`,
    );
    expect(showToastMock).toHaveBeenCalledWith("Link copied to your clipboard.");
  });
});
