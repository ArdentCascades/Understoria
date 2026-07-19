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
// Calendar filters disclosure — the Board's collapsed-filters grammar
// adopted verbatim (field report: the always-open filter row pushed
// the actual calendar off a phone screen). Same contract as
// Board.filtersDisclosure.test.tsx: collapsed by default at every
// width behind the shared FiltersToggle pill, "Filters · N active"
// label, removable chips while collapsed, and a Done footer that
// closes the drawer and returns focus to the pill. jsdom applies no
// media queries — these pin the class/state mechanics.
//
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));

import "@/i18n";
import { db } from "@/db/database";
import CalendarPage from "./Calendar";
import type { Event, Member, Project } from "@/types";

const me: Member = {
  publicKey: "me-key",
  displayName: "Tester",
  skills: [],
  availability: "",
  availabilityChips: [],
  seedBalance: 0,
  vouchedBy: [],
  createdAt: 0,
  nodeId: "node-1",
  locationZone: "",
};

const project: Project = {
  id: "p1",
  title: "Tool library",
  description: "",
  category: "infrastructure",
  organizerKey: "someone-else",
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
};

const event: Event = {
  id: "e1",
  kind: "event",
  title: "Repair night",
  description: "",
  category: "skills",
  startsAt: Date.now() + 86_400_000,
  endsAt: null,
  location: "the bench",
  capacity: null,
  templateId: null,
  createdAt: 0,
  createdBy: "me-key",
  nodeId: "node-1",
  signature: "sig",
};

const mockState = {
  projects: [project],
  posts: [],
  exchanges: [],
  projectTasks: [],
  currentMember: me,
  events: [event],
  eventCancellations: [],
  eventProjectLinks: [],
  eventRsvps: [],
};

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  // The page persists filter state through the real settings store
  // (fake-indexeddb) — clear it so cases never leak into each other.
  await db.settings.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root?.unmount());
  container.remove();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/calendar"]}>{node}</MemoryRouter>,
    );
  });
}

function trigger(): HTMLButtonElement {
  const btn = container.querySelector<HTMLButtonElement>(
    'button[aria-controls="calendar-filters"]',
  );
  if (!btn) throw new Error("Filters disclosure trigger not found");
  return btn;
}

function drawer(): HTMLElement {
  const el = container.querySelector<HTMLElement>("#calendar-filters");
  if (!el) throw new Error("Filter drawer not found");
  return el;
}

/** Set a controlled <select> the way a user would — via the native
 *  value setter (bypassing React's value-tracking dedupe) plus a
 *  bubbling change event. */
function chooseOption(select: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(select, value);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function categorySelect(): HTMLSelectElement {
  const sel = Array.from(
    container.querySelectorAll<HTMLSelectElement>("#calendar-filters select"),
  )[0];
  if (!sel) throw new Error("Category select not found");
  return sel;
}

describe("Calendar filters disclosure", () => {
  it("defaults collapsed at every width: pill trigger, hidden drawer", () => {
    render(<CalendarPage />);
    const btn = trigger();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.textContent).toContain("Filters");
    expect(btn.textContent).not.toContain("active");
    expect(btn.className).toContain("rounded-full");
    expect(drawer().className).toContain("hidden");
  });

  it("expands into a card drawer and collapses again on a second tap", () => {
    render(<CalendarPage />);
    act(() => {
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(drawer().className).toContain("card");
    act(() => {
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(drawer().className).toContain("hidden");
  });

  it("shows the active-count label and a removable chip when a filter narrows", () => {
    render(<CalendarPage />);
    act(() => {
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    chooseOption(categorySelect(), "skills");
    expect(trigger().textContent).toContain("Filters · 1 active");
    // Close the drawer — the chip keeps the state visible and removes
    // it in one tap.
    act(() => {
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const chip = container.querySelector<HTMLButtonElement>(
      'button[aria-label^="Remove filter"]',
    );
    expect(chip).not.toBeNull();
    act(() => {
      chip!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(
      container.querySelector('button[aria-label^="Remove filter"]'),
    ).toBeNull();
    expect(trigger().textContent).not.toContain("active");
  });

  it("'Done' closes the drawer and returns focus to the trigger", () => {
    render(<CalendarPage />);
    act(() => {
      trigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const done = Array.from(drawer().querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Done",
    )!;
    expect(done).toBeTruthy();
    act(() => {
      done.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(drawer().className).toContain("hidden");
    expect(document.activeElement).toBe(trigger());
  });

  it("the view switcher stays OUTSIDE the drawer — a view mode is not a filter", () => {
    render(<CalendarPage />);
    const tablist = container.querySelector('[role="tablist"]')!;
    expect(drawer().contains(tablist)).toBe(false);
  });
});
