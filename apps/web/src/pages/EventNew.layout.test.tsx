/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// Layout invariants for the EventNew two-pane reflow:
//
//   1. lg+ renders the template picker in a sticky left rail (grid
//      wrapper + rail-mode single-column picker grid).
//   2. Mobile DOM order is picker → form (WCAG 2.4.3: DOM order =
//      visual order, no CSS `order-*` reordering anywhere).
//   3. The §3 signing card stays IN-FLOW in the form column,
//      immediately above Cancel/Submit — docs/community-events.md §3
//      mandates it is seen before signing; never sticky, never
//      collapsed, never a tooltip. This test is the guardrail.
//
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
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = {
    currentMember: member(organizerKey),
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

/** Returns true iff `before` precedes `after` in document order. */
function precedes(before: Element, after: Element): boolean {
  return (
    (before.compareDocumentPosition(after) &
      Node.DOCUMENT_POSITION_FOLLOWING) !==
    0
  );
}

describe("EventNew layout", () => {
  it("renders the two-pane rail at lg+ (grid wrapper, sticky aside, single-column picker grid)", () => {
    render();

    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside!.className).toContain("lg:sticky");
    expect(aside!.className).toContain("lg:overflow-y-auto");
    expect(aside!.parentElement?.className).toContain(
      "lg:grid-cols-[380px_minmax(0,1fr)]",
    );

    // The picker runs in rail mode: single-column grid, no responsive
    // multi-column classes that would crush cards inside a 380px rail.
    const pickerGrid = container.querySelector("#event-template-picker ul");
    expect(pickerGrid).not.toBeNull();
    expect(pickerGrid!.className).toContain("grid-cols-1");
    expect(pickerGrid!.className).not.toContain("sm:grid-cols-2");
    expect(pickerGrid!.className).not.toContain("lg:grid-cols-3");
  });

  it("keeps mobile DOM order picker → form (WCAG 2.4.3) with no order-* utilities", () => {
    render();

    const aside = container.querySelector("aside");
    const form = container.querySelector("form");
    expect(aside).not.toBeNull();
    expect(form).not.toBeNull();
    expect(precedes(aside!, form!)).toBe(true);

    // No CSS `order-*` reordering anywhere in the tree. Token-based
    // scan (a substring match would false-positive on `border-*`).
    for (const el of Array.from(container.querySelectorAll("[class]"))) {
      for (const cls of (el.getAttribute("class") ?? "").split(/\s+/)) {
        expect(/^(?:[a-z0-9-]+:)*order-/.test(cls)).toBe(false);
      }
    }
  });

  it("keeps the §3 signing card in-flow, immediately above Cancel/Submit", () => {
    render();

    const form = container.querySelector("form")!;
    const signing = container.querySelector(
      '[aria-labelledby="events-signing-heading"]',
    );
    expect(signing).not.toBeNull();
    // In the form column, in-flow — never sticky, never hidden.
    expect(form.contains(signing)).toBe(true);
    expect(signing!.className).not.toContain("sticky");
    expect(signing!.className).not.toContain("hidden");

    // Immediately above the submit row: the card precedes the submit
    // button, and every form field (input/select/textarea) precedes
    // the card — nothing renders between the card and the buttons.
    const submit = form.querySelector('button[type="submit"]')!;
    expect(precedes(signing!, submit)).toBe(true);
    for (const field of Array.from(
      form.querySelectorAll("input, select, textarea"),
    )) {
      expect(precedes(field, signing!)).toBe(true);
    }
  });

  it("date/time rows use minmax(0,…) tracks, never bare fr (iOS overflow contract)", () => {
    // iOS Safari sizes bare-fr grid tracks from a date/time input's
    // UA-intrinsic width and ignores min-width:0 on form controls, so
    // a `grid-cols-[1.4fr_1fr]` row overflows the phone screen (the
    // IMG_8249 report: the Starts time field ran off the right edge).
    // The zero minimum must live on the TRACK. This pins the contract
    // for every grid row that contains a native date/time input.
    render();

    const dateTimeInputs = Array.from(
      container.querySelectorAll('input[type="date"], input[type="time"]'),
    );
    expect(dateTimeInputs.length).toBeGreaterThan(0);
    for (const input of dateTimeInputs) {
      const row = input.parentElement!;
      const gridClasses = (row.getAttribute("class") ?? "")
        .split(/\s+/)
        .filter((c) => c.includes("grid-cols-["));
      for (const cls of gridClasses) {
        // Every fr inside an arbitrary-value track list is wrapped:
        // no `[`- or `_`-adjacent bare `Nfr` allowed.
        expect(cls).not.toMatch(/[[_](?:\d+(?:\.\d+)?)fr/);
        expect(cls).toContain("minmax(0,");
      }
    }
  });

  it("work-day deep-link: the banner spans the top in place of the rail, before the form", async () => {
    mockState.projects = [project()];
    render("/events/new?projectId=proj-1");
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // No template rail in banner mode.
    expect(container.querySelector("aside")).toBeNull();
    expect(container.querySelector("#event-template-picker")).toBeNull();

    const banner = container.querySelector(
      '[aria-labelledby="workday-banner-heading"]',
    );
    const form = container.querySelector("form");
    expect(banner).not.toBeNull();
    expect(form).not.toBeNull();
    expect(precedes(banner!, form!)).toBe(true);

    // The §3 card is mandated in banner mode too.
    expect(
      form!.querySelector('[aria-labelledby="events-signing-heading"]'),
    ).not.toBeNull();
  });
});
