/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// Quick-pick chips on the Starts row:
//
//   1. The start time STILL begins empty — chips must never become a
//      silent default (the operator-approved trade-off documented at
//      todayDateString in EventNew.tsx: events are signed, append-only,
//      federated records; a value exists only because the member
//      consciously picked it).
//   2. Tapping a chip writes the same state as the native input, and
//      the chip reflects its active state via aria-pressed.
//   3. While the time is empty a visible hint says so (iOS renders an
//      empty time input as an unlabeled blank pill); it disappears
//      once a time exists.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), toast: null }),
}));
vi.mock("@/db/secrets", () => ({ getSecretKey: vi.fn(async () => "secret") }));
vi.mock("@/db/events", () => ({
  createEvent: vi.fn(async () => ({ id: "ev-new" })),
  EVENT_START_GRACE_MS: 5 * 60 * 1000,
}));
vi.mock("@/db/eventProjectLinks", () => ({
  scheduleProjectWorkDay: vi.fn(async () => ({ id: "ev-new" })),
}));
vi.mock("@/db/projects", () => ({
  isOrganizer: () => false,
}));

import "@/i18n";
import EventNewPage from "./EventNew";
import { quickDays } from "@/lib/eventQuickPick";
import type { Member } from "@/types";

function member(): Member {
  return {
    publicKey: "tester-key",
    displayName: "Tester",
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId: "node-1",
    locationZone: "",
  };
}

let mockState: {
  currentMember: Member | null;
  nodeId: string;
  lockState: "unprotected" | "locked" | "unlocked";
  projects: never[];
};
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = {
    currentMember: member(),
    nodeId: "node-1",
    lockState: "unprotected",
    projects: [],
  };
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
      <MemoryRouter initialEntries={["/events/new"]}>
        <Routes>
          <Route path="/events/new" element={<EventNewPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

function startTimeInput(): HTMLInputElement {
  return container.querySelector('input[type="time"]')!;
}

function chip(label: RegExp): HTMLButtonElement {
  const found = Array.from(
    container.querySelectorAll<HTMLButtonElement>(
      'button[type="button"][aria-pressed]',
    ),
  ).find((b) => label.test(b.textContent ?? ""));
  expect(found, `chip ${label}`).toBeDefined();
  return found!;
}

describe("EventNew quick picks", () => {
  it("keeps the start time empty until the member acts (no silent default)", () => {
    render();
    expect(startTimeInput().value).toBe("");
    // The blank-pill hint shows exactly while the time is empty.
    expect(container.textContent).toContain("No time yet");
  });

  it("a tapped time chip sets the input, aria-pressed, and clears the hint", () => {
    render();
    const evening = chip(/6:00\sPM/i);
    expect(evening.getAttribute("aria-pressed")).toBe("false");
    act(() => {
      evening.click();
    });
    expect(startTimeInput().value).toBe("18:00");
    expect(evening.getAttribute("aria-pressed")).toBe("true");
    expect(container.textContent).not.toContain("No time yet");
  });

  it("day chips set the start date; Today reflects the seeded date as pressed", () => {
    render();
    const days = quickDays();
    const today = chip(/^Today$/);
    // The date field is seeded with today, so its chip starts pressed.
    expect(today.getAttribute("aria-pressed")).toBe("true");

    const tomorrow = chip(/^Tomorrow$/);
    act(() => {
      tomorrow.click();
    });
    const dateInput = container.querySelector<HTMLInputElement>(
      'input[type="date"]',
    )!;
    expect(dateInput.value).toBe(days[1].date);
    expect(tomorrow.getAttribute("aria-pressed")).toBe("true");
    expect(today.getAttribute("aria-pressed")).toBe("false");
  });

  it("the required-start error replaces the hint after a blur leaves time empty", () => {
    render();
    const input = startTimeInput();
    act(() => {
      input.focus();
      input.blur();
      input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    });
    expect(container.textContent).not.toContain("No time yet");
    expect(container.querySelector("#event-start-error")).not.toBeNull();
  });
});
