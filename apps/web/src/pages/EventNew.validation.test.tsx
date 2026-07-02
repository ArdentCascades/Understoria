/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createEventMock, scheduleMock } = vi.hoisted(() => ({
  createEventMock: vi.fn(async (_input: unknown) => ({ id: "ev-new" })),
  scheduleMock: vi.fn(async (_input: unknown) => ({ id: "ev-new" })),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), toast: null }),
}));
vi.mock("@/db/secrets", () => ({ getSecretKey: vi.fn(async () => "secret") }));
vi.mock("@/db/events", () => ({
  createEvent: createEventMock,
  EVENT_START_GRACE_MS: 5 * 60 * 1000,
}));
vi.mock("@/db/eventProjectLinks", () => ({
  scheduleProjectWorkDay: scheduleMock,
}));
vi.mock("@/db/projects", () => ({
  isOrganizer: () => false,
}));

import "@/i18n";
import EventNewPage from "./EventNew";
import { clearDraft } from "@/db/drafts";
import type { Member } from "@/types";

const PAST_COPY = "Event start time is in the past";
const REQUIRED_COPY = "Pick a start date and time.";
const END_BEFORE_COPY = "End time has to be after the start time.";

function member(publicKey: string): Member {
  return {
    publicKey,
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

interface MockState {
  currentMember: Member | null;
  nodeId: string;
  lockState: "unprotected" | "locked" | "unlocked";
  projects: never[];
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  // Real drafts module on fake-indexeddb — keep the table empty so no
  // stray DraftBanner from a previous test's autosave joins a render.
  await clearDraft("event-new");
  mockState = {
    currentMember: member("me-key"),
    nodeId: "node-1",
    lockState: "unprotected",
    projects: [],
  };
  createEventMock.mockClear();
  scheduleMock.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  vi.useRealTimers();
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

async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
}

function setInput(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto =
    el instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function dateString(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startDateInput(): HTMLInputElement {
  return container.querySelector('form input[type="date"]') as HTMLInputElement;
}

function startTimeInput(): HTMLInputElement {
  return container.querySelector('form input[type="time"]') as HTMLInputElement;
}

function submitForm() {
  const form = container.querySelector("form") as HTMLFormElement;
  act(() => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

function textInputs(): HTMLInputElement[] {
  return Array.from(
    container.querySelectorAll<HTMLInputElement>("form input"),
  ).filter((i) => i.type === "text");
}

describe("EventNew — inline validation", () => {
  it("shows past-start at the field the moment both parts combine to the past, and clears when fixed", async () => {
    render();
    const yesterday = dateString(Date.now() - 24 * 60 * 60 * 1000);
    const tomorrow = dateString(Date.now() + 24 * 60 * 60 * 1000);

    act(() => {
      setInput(startDateInput(), yesterday);
      setInput(startTimeInput(), "10:00");
    });
    await flush();

    // Field-level error, no submit involved.
    const startError = container.querySelector("#event-start-error");
    expect(startError).not.toBeNull();
    expect(startError!.textContent ?? "").toContain(PAST_COPY);
    expect(startError!.getAttribute("role")).toBe("alert");
    expect(createEventMock).not.toHaveBeenCalled();

    // Fixing the date clears it.
    act(() => {
      setInput(startDateInput(), tomorrow);
    });
    await flush();
    expect(container.querySelector("#event-start-error")).toBeNull();
  });

  it("blocks submit with the seeded date + EMPTY time and shows errorStartRequired inline", async () => {
    render();
    const [titleInput, locationInput] = textInputs();
    setInput(titleInput, "My event");
    setInput(locationInput, "Somewhere");

    submitForm();
    await flush();

    expect(createEventMock).not.toHaveBeenCalled();
    const startError = container.querySelector("#event-start-error");
    expect(startError).not.toBeNull();
    expect(startError!.textContent ?? "").toContain(REQUIRED_COPY);
  });

  it("shows required errors inline on blur for title and location", async () => {
    render();
    const [titleInput, locationInput] = textInputs();
    act(() => {
      // React's onBlur is delegated via the bubbling `focusout` event.
      titleInput.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      locationInput.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true }),
      );
    });
    await flush();
    expect(container.querySelector("#event-title-error")).not.toBeNull();
    expect(container.querySelector("#event-location-error")).not.toBeNull();
    expect(titleInput.getAttribute("aria-describedby")).toBe(
      "event-title-error",
    );
  });

  it("shows end-before-start inline at the end group without submit", async () => {
    render();
    const tomorrow = dateString(Date.now() + 24 * 60 * 60 * 1000);
    act(() => {
      setInput(startDateInput(), tomorrow);
      setInput(startTimeInput(), "10:00");
    });
    await flush();

    const checkbox = container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    act(() => {
      checkbox.click();
    });
    await flush();

    const [, endTime] = Array.from(
      container.querySelectorAll<HTMLInputElement>('form input[type="time"]'),
    );
    const [, endDate] = Array.from(
      container.querySelectorAll<HTMLInputElement>('form input[type="date"]'),
    );
    act(() => {
      setInput(endDate, tomorrow);
      setInput(endTime, "09:00");
    });
    await flush();

    const endError = container.querySelector("#event-end-error");
    expect(endError).not.toBeNull();
    expect(endError!.textContent ?? "").toContain(END_BEFORE_COPY);
    expect(createEventMock).not.toHaveBeenCalled();
  });

  it("submit guard stays: a start that was valid at fill time but past at submit time is refused", async () => {
    // Fake ONLY Date (setTimeout stays real, so flush/act still work).
    // The inline layer computed its check when the fields were filled;
    // the submit-time guard re-checks against the live clock — this is
    // the defense-in-depth path that must never be removed.
    vi.useFakeTimers({ toFake: ["Date"] });
    const base = new Date("2026-07-02T12:00:00").getTime();
    vi.setSystemTime(base);

    render();
    const [titleInput, locationInput] = textInputs();
    setInput(titleInput, "My event");
    setInput(locationInput, "Somewhere");
    act(() => {
      setInput(startDateInput(), dateString(base));
      setInput(startTimeInput(), "13:00"); // one hour ahead — valid now
    });
    await flush();
    // No inline error at fill time.
    expect(container.querySelector("#event-start-error")).toBeNull();

    // The clock moves a day while the tab sits open.
    vi.setSystemTime(base + 24 * 60 * 60 * 1000);
    submitForm();
    await flush();

    expect(createEventMock).not.toHaveBeenCalled();
    expect(container.textContent ?? "").toContain(PAST_COPY);
  });
});
