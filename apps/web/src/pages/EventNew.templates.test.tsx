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

describe("EventNew — template prefill", () => {
  it("seeds the form from a picked template (title stem, category, end time) but never location", async () => {
    render();
    clickCardContaining("Potluck");
    await flush();

    const [titleInput, locationInput] = formTextInputs();
    expect(titleInput.value).toBe("Potluck — ");
    expect(locationInput.value).toBe(""); // location is never prefilled

    // The category carries the event-specific "social" string.
    const select = container.querySelector("select") as HTMLSelectElement;
    expect(select.value).toBe("social");

    // The suggested duration auto-applied an end time.
    const endCheckbox = container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(endCheckbox.checked).toBe(true);
  });

  it("passes the templateId and category to createEvent on submit", async () => {
    render();
    clickCardContaining("Potluck");
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
    const form = container.querySelector("form") as HTMLFormElement;
    act(() => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await flush();
    expect(createEventMock).toHaveBeenCalledTimes(1);
    expect(createEventMock.mock.calls[0][0]).toMatchObject({ templateId: null });
  });

  it("collapses the gallery after a pick and reopens it on Change", async () => {
    render();
    // Gallery open: the search box is present.
    expect(
      container.querySelector('input[type="search"]'),
    ).not.toBeNull();
    clickCardContaining("Game night");
    await flush();
    // Collapsed: search gone, summary names the template.
    expect(container.querySelector('input[type="search"]')).toBeNull();
    expect(container.textContent ?? "").toContain("Game night");

    const change = Array.from(container.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Change",
    );
    expect(change).toBeDefined();
    act(() => {
      change!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // Reopened: the search box is back.
    expect(
      container.querySelector('input[type="search"]'),
    ).not.toBeNull();
  });
});
