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

// The drafts module is deliberately NOT mocked — the regressions this
// file guards (a round-trip losing templateId / hasEnd, a deep-link
// visit clobbering a stored draft) live in what gets serialized to
// and parsed from the real drafts table, so the test goes through the
// real Dexie path on fake-indexeddb.
import "@/i18n";
import EventNewPage from "./EventNew";
import { clearDraft, loadDraft, saveDraft } from "@/db/drafts";
import type { Member, Project } from "@/types";

const DRAFT_KEY = "event-new";
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

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  await clearDraft(DRAFT_KEY);
  mockState = {
    currentMember: member(organizerKey),
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
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(initialEntry = "/events/new") {
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

/** Pump real timers/microtasks until `predicate` holds (Dexie I/O is
 *  genuinely async under fake-indexeddb). */
async function waitFor(predicate: () => boolean, timeoutMs = 2000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("waitFor timed out");
    }
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
  }
}

function buttonByText(text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent === text,
  );
  if (!button) throw new Error(`button not found: ${text}`);
  return button;
}

function draftPayload(over: Partial<Record<string, unknown>> = {}) {
  return {
    title: "Potluck — solstice",
    description: "Bring a dish",
    category: "social",
    startDate: "2099-06-21",
    startTime: "18:00",
    endDate: "2099-06-21",
    endTime: "21:00",
    hasEnd: true,
    location: "the library bench",
    capacity: "12",
    templateId: "potluck",
    ...over,
  };
}

describe("EventNew draft round-trip", () => {
  it("restores every field including template + hasEnd, collapses the picker, and keeps templateId through re-save", async () => {
    await saveDraft(DRAFT_KEY, draftPayload());

    render();
    await waitFor(() =>
      (container.textContent ?? "").includes("Continue draft"),
    );

    act(() => {
      buttonByText("Continue draft").click();
    });

    const titleInput = container.querySelector(
      "form input",
    ) as HTMLInputElement;
    expect(titleInput.value).toBe("Potluck — solstice");
    const checkbox = container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    const timeInputs = container.querySelectorAll<HTMLInputElement>(
      'form input[type="time"]',
    );
    expect(timeInputs[0].value).toBe("18:00");
    expect(timeInputs[1].value).toBe("21:00");
    const capacityInput = container.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement;
    expect(capacityInput.value).toBe("12");

    // The #233 rule: restoring a draft collapses the picker (mobile),
    // exactly like picking a template does.
    const pickerWrapper = container.querySelector(
      "#event-template-picker",
    ) as HTMLElement;
    expect(pickerWrapper.className).toContain("hidden");
    // The collapsed summary names the restored template.
    const summary = container.querySelector(
      'button[aria-controls="event-template-picker"]',
    );
    expect(summary?.textContent ?? "").toContain("Potluck");

    // The autosave that follows the restore (600 ms debounce) must
    // write templateId back — otherwise one restore cycle would strip
    // it for the next.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 700));
    });
    const resaved = await loadDraft<{ templateId?: string | null }>(DRAFT_KEY);
    expect(resaved?.payload.templateId).toBe("potluck");
  });

  it("legacy same-day draft (no endsOtherDay field) restores into same-day mode and re-saves the derived flag", async () => {
    // draftPayload's endDate equals its startDate and carries no
    // endsOtherDay — the exact shape drafts saved before the
    // same-day-end default existed have.
    await saveDraft(DRAFT_KEY, draftPayload());

    render();
    await waitFor(() =>
      (container.textContent ?? "").includes("Continue draft"),
    );
    act(() => {
      buttonByText("Continue draft").click();
    });

    // Same-day mode: only the start's date input renders.
    expect(
      container.querySelectorAll('form input[type="date"]').length,
    ).toBe(1);

    // The autosave after restore writes the derived flag explicitly.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 700));
    });
    const resaved = await loadDraft<{ endsOtherDay?: boolean }>(DRAFT_KEY);
    expect(resaved?.payload.endsOtherDay).toBe(false);
  });

  it("legacy cross-day draft restores into different-day mode with the end date intact", async () => {
    await saveDraft(DRAFT_KEY, draftPayload({ endDate: "2099-06-22" }));

    render();
    await waitFor(() =>
      (container.textContent ?? "").includes("Continue draft"),
    );
    act(() => {
      buttonByText("Continue draft").click();
    });

    const dates = Array.from(
      container.querySelectorAll<HTMLInputElement>('form input[type="date"]'),
    );
    expect(dates.length).toBe(2);
    expect(dates[1].value).toBe("2099-06-22");
  });

  it("discard clears the stored draft", async () => {
    await saveDraft(DRAFT_KEY, draftPayload());

    render();
    await waitFor(() =>
      (container.textContent ?? "").includes("Continue draft"),
    );

    act(() => {
      buttonByText("Start fresh").click();
    });
    await waitFor(
      () => !(container.textContent ?? "").includes("Continue draft"),
    );

    expect(await loadDraft(DRAFT_KEY)).toBeNull();
    // The form stayed at defaults.
    const titleInput = container.querySelector(
      "form input",
    ) as HTMLInputElement;
    expect(titleInput.value).toBe("");
  });

  it("deep-link visit (?projectId=): the seed wins, no banner, and the stored draft survives untouched", async () => {
    await saveDraft(DRAFT_KEY, draftPayload({ title: "Plain-visit draft" }));
    mockState.projects = [project()];

    render("/events/new?projectId=proj-1");
    // Give the draft-load + autosave windows time to (not) fire —
    // longer than both the loadDraft roundtrip and the 600 ms
    // autosave debounce.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 800));
    });

    // No DraftBanner; the work-day seed populated the form instead.
    expect(container.textContent ?? "").not.toContain("Continue draft");
    const titleInput = container.querySelector(
      "form input",
    ) as HTMLInputElement;
    expect(titleInput.value).toBe("Work day — Community Fridge");

    // The stored plain-visit draft is still there, byte-for-byte —
    // neither surfaced nor overwritten by the deep-link visit.
    const stored = await loadDraft<{ title: string }>(DRAFT_KEY);
    expect(stored?.payload.title).toBe("Plain-visit draft");
  });
});
