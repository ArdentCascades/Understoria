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
// The work-day sign-in sheet (/print/event/:eventId/roster). Locks:
//   1. blankLineCount: remaining capacity, floored at zero; a
//      capacity-less shift gets the fixed clipboard default.
//   2. The rendered sheet: one section per shift (soonest first),
//      the right number of ruled lines, "full" when the app already
//      filled it, and the honesty footer.
//   3. The same cancelled/ended refusals as the flyer.
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
import { db } from "@/db/database";
import PrintShiftRosterPage, { blankLineCount } from "./PrintShiftRoster";

const mockState: {
  events: Event[];
  eventCancellations: { eventId: string; createdBy: string }[];
} = { events: [], eventCancellations: [] };

const FUTURE = Date.now() + 7 * 24 * 60 * 60 * 1000;

function makeEvent(id: string): Event {
  return {
    id,
    title: `Work day ${id}`,
    location: "The lot",
    startsAt: FUTURE,
    endsAt: FUTURE + 4 * 60 * 60 * 1000,
    createdBy: "organizer-key",
  } as Event;
}

let container: HTMLDivElement;
let root: Root | null = null;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  mockState.events = [];
  mockState.eventCancellations = [];
  await db.eventShifts.clear();
  await db.shiftSignups.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = null;
  container.remove();
});

async function renderAt(eventId: string, waitForText?: string) {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[`/print/event/${eventId}/roster`]}>
        <Routes>
          <Route
            path="/print/event/:eventId/roster"
            element={<PrintShiftRosterPage />}
          />
        </Routes>
      </MemoryRouter>,
    );
  });
  // Let the Dexie live queries resolve — poll rather than guess a
  // delay (fake-indexeddb resolves fast, but not synchronously).
  for (let i = 0; i < 40; i++) {
    if (!waitForText || container.textContent!.includes(waitForText)) break;
    await act(async () => {
      await new Promise((r) => setTimeout(r, 25));
    });
  }
}

describe("blankLineCount", () => {
  it("is remaining capacity, floored at zero; uncapped gets the clipboard default", () => {
    expect(blankLineCount(5, 2)).toBe(3);
    expect(blankLineCount(2, 2)).toBe(0);
    expect(blankLineCount(2, 4)).toBe(0);
    expect(blankLineCount(null, 99)).toBe(8);
  });
});

describe("PrintShiftRosterPage", () => {
  it("renders one section per shift with ruled lines and app-side counts", async () => {
    mockState.events = [makeEvent("e1")];
    await db.eventShifts.bulkPut([
      {
        id: "s-morning",
        eventId: "e1",
        label: "Morning crew",
        startsAt: FUTURE,
        endsAt: FUTURE + 2 * 60 * 60 * 1000,
        capacity: 4,
        createdBy: "organizer-key",
        createdAt: 1,
      },
      {
        id: "s-full",
        eventId: "e1",
        label: "Kitchen",
        startsAt: FUTURE + 60 * 60 * 1000,
        endsAt: FUTURE + 3 * 60 * 60 * 1000,
        capacity: 1,
        createdBy: "organizer-key",
        createdAt: 2,
      },
    ]);
    await db.shiftSignups.bulkPut([
      { id: "g1", shiftId: "s-morning", eventId: "e1", memberKey: "a", signedUpAt: 1 },
      { id: "g2", shiftId: "s-full", eventId: "e1", memberKey: "b", signedUpAt: 2 },
    ]);
    await renderAt("e1", "Morning crew");

    expect(container.textContent).toContain("Morning crew");
    expect(container.textContent).toContain("1 of 4 signed up in the app");
    // 4 capacity − 1 signup = 3 ruled lines for the morning crew.
    const sections = [...container.querySelectorAll("section")];
    const morning = sections.find((s) => s.textContent!.includes("Morning crew"))!;
    expect(morning.querySelectorAll("li").length).toBe(3);
    // Kitchen is full in the app: no lines, the check-first note.
    const kitchen = sections.find((s) => s.textContent!.includes("Kitchen"))!;
    expect(kitchen.querySelectorAll("li").length).toBe(0);
    expect(kitchen.textContent).toContain("Full in the app");
    // The one QR points at the event page.
    expect(
      container.querySelector('[data-testid="qr"]')!.getAttribute("data-value"),
    ).toBe(`${window.location.origin}/events/e1`);
    expect(container.textContent).toContain("paper doesn't sync or purge");
  });

  it("refuses cancelled gatherings like the flyer", async () => {
    mockState.events = [makeEvent("e1")];
    mockState.eventCancellations = [
      { eventId: "e1", createdBy: "organizer-key" },
    ];
    await renderAt("e1");
    expect(container.textContent).toContain("cancelled");
    expect(container.querySelector("section")).toBeNull();
  });

  it("says so when there are no shifts yet", async () => {
    mockState.events = [makeEvent("e1")];
    await renderAt("e1");
    expect(container.textContent).toContain("no shifts yet");
  });
});
