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
// Real isOrganizer — a pure function over the project's authority lists.
vi.mock("@/db/projects", () => ({
  isOrganizer: (p: Project, key: string) =>
    p.organizerKey === key || p.coOrganizerKeys.includes(key),
}));

import "@/i18n";
import EventNewPage from "./EventNew";
import type { Member, Project } from "@/types";

const organizerKey = "organizer-key";

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

function project(over: Partial<Project> = {}): Project {
  return {
    id: "proj-1",
    title: "Community Fridge",
    description: "",
    category: "food",
    organizerKey,
    coOrganizerKeys: [],
    status: "active",
    targetHours: 10,
    contributedHours: 0,
    deadline: null,
    createdAt: 0,
    completedAt: null,
    pauseNote: null,
    locationZone: "",
    tags: [],
    nodeId: "node-1",
    templateId: null,
    ...over,
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
    currentMember: member(organizerKey),
    nodeId: "node-1",
    lockState: "unprotected",
    projects: [project()],
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

function render(initialEntry: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
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

describe("EventNew — work-day prefill", () => {
  it("prefills the banner, title, and category for an organizer with ?projectId", async () => {
    render("/events/new?projectId=proj-1");
    await flush();
    const text = container.textContent ?? "";
    expect(text).toContain("Scheduling a work day for Community Fridge");

    const titleInput = container.querySelector("input") as HTMLInputElement;
    expect(titleInput.value).toBe("Work day — Community Fridge");

    const select = container.querySelector("select") as HTMLSelectElement;
    // "food" is a legacy category, so it carries through unchanged.
    expect(select.value).toBe("food");
  });

  it("links the event to the project on submit", async () => {
    render("/events/new?projectId=proj-1");
    await flush();
    // Title is prefilled; the two text inputs are [title, location].
    // Supply the location (never prefilled) and submit.
    const textInputs = Array.from(container.querySelectorAll("input")).filter(
      (i) => i.type === "text",
    );
    setInput(textInputs[1], "Community room");
    const form = container.querySelector("form") as HTMLFormElement;
    act(() => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await flush();
    expect(scheduleMock).toHaveBeenCalledTimes(1);
    expect(scheduleMock.mock.calls[0][0]).toMatchObject({ projectId: "proj-1" });
    expect(createEventMock).not.toHaveBeenCalled();
  });

  it("gives a non-organizer the plain form and a plain event on submit", async () => {
    mockState.currentMember = member("rando");
    render("/events/new?projectId=proj-1");
    await flush();
    const text = container.textContent ?? "";
    expect(text).not.toContain("Scheduling a work day");

    const titleInput = container.querySelector("input") as HTMLInputElement;
    expect(titleInput.value).toBe("");
    setInput(titleInput, "My own event");
    const locInput = Array.from(container.querySelectorAll("input")).find(
      (i) => i.type === "text" && i !== titleInput,
    ) as HTMLInputElement;
    setInput(locInput, "Somewhere");
    const form = container.querySelector("form") as HTMLFormElement;
    act(() => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await flush();
    // A plain event, never a work-day link.
    expect(createEventMock).toHaveBeenCalledTimes(1);
    expect(scheduleMock).not.toHaveBeenCalled();
  });

  it("degrades to the plain form when the projectId is unknown", async () => {
    render("/events/new?projectId=does-not-exist");
    await flush();
    expect(container.textContent ?? "").not.toContain("Scheduling a work day");
    const titleInput = container.querySelector("input") as HTMLInputElement;
    expect(titleInput.value).toBe("");
  });
});
