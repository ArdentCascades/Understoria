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
//
// The event flyer (/print/event/:eventId). Locks:
//   1. The QR encodes the event's canonical /events/:id URL.
//   2. Verify-before-render: cancelled and already-ended gatherings
//      get honest refusals — paper that misdirects is worse than
//      no paper (the invite poster's expired-invite precedent).
//   3. The "paper doesn't sync or purge" footer is present.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event } from "@/types";

vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));
vi.mock("@/components/InviteQRCode", () => ({
  InviteQRCode: ({ value }: { value: string }) => (
    <div data-testid="qr" data-value={value} />
  ),
}));

import "@/i18n";
import PrintEventFlyerPage from "./PrintEventFlyer";

interface CancellationLike {
  eventId: string;
  createdBy: string;
}

const mockState: {
  events: Event[];
  eventCancellations: CancellationLike[];
} = { events: [], eventCancellations: [] };

const FUTURE = Date.now() + 7 * 24 * 60 * 60 * 1000;

function makeEvent(over: Partial<Event> & { id: string }): Event {
  return {
    title: `Gathering ${over.id}`,
    description: "Bring gloves.",
    location: "Community room, 3rd floor",
    startsAt: FUTURE,
    endsAt: FUTURE + 2 * 60 * 60 * 1000,
    createdBy: "organizer-key",
    ...over,
  } as Event;
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState.events = [];
  mockState.eventCancellations = [];
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function renderAt(eventId: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[`/print/event/${eventId}`]}>
        <Routes>
          <Route
            path="/print/event/:eventId"
            element={<PrintEventFlyerPage />}
          />
        </Routes>
      </MemoryRouter>,
    );
  });
}

describe("PrintEventFlyerPage", () => {
  it("renders the flyer with the canonical event QR and the paper footer", () => {
    mockState.events = [makeEvent({ id: "e1" })];
    renderAt("e1");

    expect(
      container.querySelector('[data-testid="qr"]')!.getAttribute("data-value"),
    ).toBe(`${window.location.origin}/events/e1`);
    expect(container.textContent).toContain("Gathering e1");
    expect(container.textContent).toContain("Community room, 3rd floor");
    expect(container.textContent).toContain("Bring gloves.");
    expect(container.textContent).toContain("paper doesn't sync or purge");
  });

  it("refuses a flyer for a cancelled gathering", () => {
    mockState.events = [makeEvent({ id: "e1" })];
    mockState.eventCancellations = [
      { eventId: "e1", createdBy: "organizer-key" },
    ];
    renderAt("e1");
    expect(container.querySelector('[data-testid="qr"]')).toBeNull();
    expect(container.textContent).toContain("cancelled");
  });

  it("refuses a flyer for a gathering that already happened", () => {
    mockState.events = [
      makeEvent({ id: "e1", startsAt: 1000, endsAt: 2000 }),
    ];
    renderAt("e1");
    expect(container.querySelector('[data-testid="qr"]')).toBeNull();
    expect(container.textContent).toContain("already happened");
  });

  it("says so when the event isn't on this device", () => {
    renderAt("missing");
    expect(container.textContent).toContain("isn't on this device");
  });
});
