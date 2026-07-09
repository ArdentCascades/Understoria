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
// The fridge calendar (/print/calendar). Locks:
//   1. selectUpcoming: past, cancelled, and beyond-the-window
//      events are excluded; soonest first; the cap is counted, not
//      silent.
//   2. The rendered sheet: day-grouped rows, a canonical event QR
//      per row, the "+N more" line when the cap bites, the footer.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
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
import PrintCalendarPage, {
  CALENDAR_ROW_CAP,
  CALENDAR_WINDOW_MS,
  selectUpcoming,
} from "./PrintCalendar";

const mockState: {
  events: Event[];
  eventCancellations: { eventId: string }[];
} = { events: [], eventCancellations: [] };

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

function makeEvent(id: string, startsAt: number): Event {
  return {
    id,
    title: `Gathering ${id}`,
    location: "The lot",
    startsAt,
    endsAt: startsAt + 2 * 60 * 60 * 1000,
    createdBy: "k",
  } as Event;
}

let container: HTMLDivElement;
let root: Root | null = null;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState.events = [];
  mockState.eventCancellations = [];
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = null;
  container.remove();
});

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/print/calendar"]}>
        <PrintCalendarPage />
      </MemoryRouter>,
    );
  });
}

describe("selectUpcoming", () => {
  it("excludes past, cancelled, and beyond-window events; sorts soonest first; counts the cap", () => {
    const events = [
      makeEvent("later", NOW + 3 * DAY),
      makeEvent("sooner", NOW + 1 * DAY),
      makeEvent("past", NOW - 2 * DAY),
      makeEvent("cancelled", NOW + 2 * DAY),
      makeEvent("far", NOW + CALENDAR_WINDOW_MS + DAY),
    ];
    const { events: picked, overflow } = selectUpcoming({
      events,
      cancelledEventIds: new Set(["cancelled"]),
      now: NOW,
    });
    expect(picked.map((e) => e.id)).toEqual(["sooner", "later"]);
    expect(overflow).toBe(0);
  });

  it("caps at the row limit and reports the overflow", () => {
    const events = Array.from({ length: CALENDAR_ROW_CAP + 5 }, (_, i) =>
      makeEvent(`e${i}`, NOW + (i + 1) * 60 * 60 * 1000),
    );
    const { events: picked, overflow } = selectUpcoming({
      events,
      cancelledEventIds: new Set(),
      now: NOW,
    });
    expect(picked.length).toBe(CALENDAR_ROW_CAP);
    expect(overflow).toBe(5);
  });
});

describe("PrintCalendarPage", () => {
  it("renders day-grouped rows with a canonical QR each and the paper footer", () => {
    mockState.events = [
      makeEvent("a", NOW + 1 * DAY),
      makeEvent("b", NOW + 1 * DAY + 60 * 60 * 1000),
      makeEvent("c", NOW + 2 * DAY),
    ];
    render();

    // Two day groups (a+b share one), three rows total.
    expect(container.querySelectorAll("section").length).toBe(2);
    const qrs = [...container.querySelectorAll('[data-testid="qr"]')].map(
      (el) => el.getAttribute("data-value"),
    );
    expect(qrs).toEqual([
      `${window.location.origin}/events/a`,
      `${window.location.origin}/events/b`,
      `${window.location.origin}/events/c`,
    ]);
    expect(container.textContent).toContain("paper doesn't sync or purge");
    expect(container.textContent).not.toContain("more in the app");
  });

  it("names the overflow when the cap bites", () => {
    mockState.events = Array.from({ length: CALENDAR_ROW_CAP + 3 }, (_, i) =>
      makeEvent(`e${i}`, NOW + (i + 1) * 60 * 60 * 1000),
    );
    render();
    expect(container.textContent).toContain("3 more in the app");
  });

  it("an empty six weeks says so honestly", () => {
    render();
    expect(container.textContent).toContain(
      "Nothing on the calendar in the next six weeks",
    );
  });
});
