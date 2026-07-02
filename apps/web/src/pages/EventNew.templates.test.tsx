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
  isOrganizer: (p: Project, key: string) =>
    p.organizerKey === key || p.coOrganizerKeys.includes(key),
}));

// Real @/content/eventTemplates — the picker renders the actual set, so
// this is a faithful integration test of pick → seed → submit.
import "@/i18n";
import EventNewPage from "./EventNew";
import type { Member, Project } from "@/types";

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
  projects: Project[];
}

let mockState: MockState;

function freshState(): MockState {
  return {
    currentMember: member("me-key"),
    nodeId: "node-1",
    lockState: "unprotected",
    projects: [],
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = freshState();
  createEventMock.mockClear();
  scheduleMock.mockClear();
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

function clickCardContaining(text: string) {
  const btn = Array.from(container.querySelectorAll("button")).find((b) =>
    (b.textContent ?? "").includes(text),
  );
  if (!btn) throw new Error(`Card not found: ${text}`);
  act(() => {
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function formTextInputs(): HTMLInputElement[] {
  return Array.from(
    container.querySelectorAll<HTMLInputElement>("form input"),
  ).filter((i) => i.type === "text");
}

/** Set the start date/time inputs to a safely-future timestamp
 *  (tomorrow 10:00 local) so the past-start guard never trips. */
function fillFutureStart() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const dateInput = container.querySelector(
    'form input[type="date"]',
  ) as HTMLInputElement;
  const timeInput = container.querySelector(
    'form input[type="time"]',
  ) as HTMLInputElement;
  act(() => {
    setInput(dateInput, date);
    setInput(timeInput, "10:00");
  });
}

describe("EventNew — template prefill", () => {
  it("seeds the form from a picked template (title stem, category) but never location, and parks the duration until a start time exists", async () => {
    render();
    clickCardContaining("Potluck");
    await flush();

    const [titleInput, locationInput] = formTextInputs();
    expect(titleInput.value).toBe("Potluck — ");
    expect(locationInput.value).toBe(""); // location is never prefilled

    // The category carries the event-specific "social" string.
    const select = container.querySelector("select") as HTMLSelectElement;
    expect(select.value).toBe("social");

    // Start time begins EMPTY (honest-default rule, Part 4), so the
    // suggested duration is parked, not applied yet.
    let endCheckbox = container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(endCheckbox.checked).toBe(false);

    // The moment the member picks a start time, the parked duration
    // applies as an editable end time.
    fillFutureStart();
    await flush();
    endCheckbox = container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(endCheckbox.checked).toBe(true);
    const timeInputs = container.querySelectorAll<HTMLInputElement>(
      'form input[type="time"]',
    );
    // [start, end] — the end time was derived from start + duration.
    expect(timeInputs.length).toBe(2);
    expect(timeInputs[1].value).not.toBe("");
  });

  it("passes the templateId and category to createEvent on submit", async () => {
    render();
    clickCardContaining("Potluck");
    await flush();
    fillFutureStart();
    await flush();
    const [, locationInput] = formTextInputs();
    setInput(locationInput, "Community room");
    const form = container.querySelector("form") as HTMLFormElement;
    act(() => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await flush();
    expect(createEventMock).toHaveBeenCalledTimes(1);
    expect(createEventMock.mock.calls[0][0]).toMatchObject({
      templateId: "potluck",
      category: "social",
    });
    expect(scheduleMock).not.toHaveBeenCalled();
  });

  it("start-from-scratch leaves the form blank and submits templateId null", async () => {
    render();
    clickCardContaining("Start from scratch");
    await flush();
    const [titleInput, locationInput] = formTextInputs();
    expect(titleInput.value).toBe("");
    setInput(titleInput, "My own event");
    setInput(locationInput, "Somewhere");
    fillFutureStart();
    await flush();
    const form = container.querySelector("form") as HTMLFormElement;
    act(() => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await flush();
    expect(createEventMock).toHaveBeenCalledTimes(1);
    expect(createEventMock.mock.calls[0][0]).toMatchObject({ templateId: null });
  });

  it("collapses the gallery after a pick (mobile summary) and reopens it from the summary", async () => {
    render();
    // Gallery open: the wrapper is visible (no `hidden` class) and no
    // collapsed-summary button exists yet.
    const pickerWrapper = () =>
      container.querySelector("#event-template-picker") as HTMLElement;
    const summaryButton = () =>
      container.querySelector(
        'button[aria-controls="event-template-picker"]',
      ) as HTMLButtonElement | null;
    expect(pickerWrapper().className).not.toContain("hidden");
    expect(summaryButton()).toBeNull();

    clickCardContaining("Game night");
    await flush();
    // Collapsed on mobile: the wrapper is class-hidden below lg (it
    // stays `lg:block` for the desktop rail) and the summary names
    // the template.
    expect(pickerWrapper().className).toContain("hidden");
    expect(pickerWrapper().className).toContain("lg:block");
    expect(summaryButton()).not.toBeNull();
    expect(summaryButton()!.textContent ?? "").toContain("Game night");

    act(() => {
      summaryButton()!.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    // Reopened: wrapper visible again, summary gone.
    expect(pickerWrapper().className).not.toContain("hidden");
    expect(summaryButton()).toBeNull();
  });
});
