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
/**
 * Event detail back behavior (`/events/:eventId`). The back affordance
 * used to hardcode navigate("/calendar"), which dead-ended the
 * project → work-day → event path: Back dumped members onto the
 * calendar and lost the project. Now it's the shared <BackLink> in
 * history-aware mode: navigate(-1) when in-app history exists
 * (`window.history.state.idx > 0`), /calendar on a cold entry. The
 * not-found branch's button gets the same guard via
 * useHistoryAwareBack. The "part of {project}" link stays untouched.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event } from "@/types";

// Same fixed-order live-query stub as EventDetail.menu.test.tsx:
// event, cancellation, myRsvp, rsvps, projectLink per render pass.
let liveSequence: unknown[] = [];
let liveCursor = 0;
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (querier: () => unknown) => {
    if (liveCursor >= liveSequence.length) liveCursor = 0;
    const value = liveSequence[liveCursor];
    liveCursor += 1;
    void querier;
    return value;
  },
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("@/db/events", () => ({
  cancelEvent: vi.fn(),
  getEvent: vi.fn(),
  getEventCancellation: vi.fn(),
  getMemberRsvp: vi.fn(),
  listRsvpsForEvent: vi.fn(),
}));
vi.mock("@/db/eventProjectLinks", () => ({ getLinkForEvent: vi.fn() }));
vi.mock("@/db/secrets", () => ({ getSecretKey: vi.fn(async () => "secret") }));
vi.mock("@/components/EventRsvpControl", () => ({
  EventRsvpControl: () => null,
}));
// Stubbed for the same reason as EventRsvpControl: the shifts section
// runs its own live queries, which would desync this suite's
// fixed-order useLiveQuery sequence. Covered in
// EventShiftsSection.test.tsx.
vi.mock("@/components/EventShiftsSection", () => ({
  EventShiftsSection: () => null,
}));

import "@/i18n";
import EventDetailPage from "./EventDetail";
import type { Member } from "@/types";

const nodeId = "node_test";
const organizerKey = "organizer-key";
const viewerKey = "viewer-key";

function member(publicKey: string, displayName: string): Member {
  return {
    publicKey,
    displayName,
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId,
    locationZone: "",
  };
}

function event(overrides: Partial<Event> = {}): Event {
  return {
    id: "evt-1",
    kind: "event",
    title: "Community garden work day",
    description: "",
    category: "infrastructure",
    startsAt: 1_700_000_000_000,
    endsAt: null,
    location: "Community room",
    capacity: null,
    templateId: null,
    createdAt: 0,
    createdBy: organizerKey,
    nodeId,
    signature: "",
    ...overrides,
  };
}

interface MockState {
  currentMember: Member | null;
  members: Member[];
  nodeId: string;
  lockState: "unprotected" | "locked" | "unlocked";
  projects: unknown[];
  blockedKeys: ReadonlySet<string>;
}

let mockState: MockState;

function setLiveQueries(evt: Event | null | undefined) {
  liveSequence = [evt, null, null, [], null];
  liveCursor = 0;
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = {
    currentMember: member(viewerKey, "Vic Viewer"),
    members: [
      member(organizerKey, "Olive Organizer"),
      member(viewerKey, "Vic Viewer"),
    ],
    nodeId,
    lockState: "unprotected",
    projects: [],
    blockedKeys: new Set<string>(),
  };
  setLiveQueries(event());
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  window.history.replaceState(null, "");
});

// Simulate the project → event path: the previous in-app entry is a
// project page (marker), the calendar is the cold-entry fallback.
function render(initialPath = "/events/evt-1") {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter
        initialEntries={["/project/proj-9", initialPath]}
        initialIndex={1}
      >
        <Routes>
          <Route path="/project/:id" element={<p>project-page-marker</p>} />
          <Route path="/calendar" element={<p>calendar-page-marker</p>} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

function backLink(): HTMLAnchorElement {
  const a = Array.from(container.querySelectorAll("a")).find((el) =>
    (el.textContent ?? "").includes("Back to calendar"),
  );
  if (!a) throw new Error("back affordance not found");
  return a as HTMLAnchorElement;
}

function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
    );
  });
}

describe("EventDetailPage — history-aware back", () => {
  it("renders the back affordance as a link whose href is the /calendar fallback", () => {
    render();
    expect(backLink().getAttribute("href")).toBe("/calendar");
    expect((backLink().textContent ?? "").trim()).toBe("← Back to calendar");
  });

  it("uses in-app history when present — project → event → back lands on the project", () => {
    render();
    window.history.replaceState({ idx: 1 }, "");
    click(backLink());
    expect(container.textContent).toContain("project-page-marker");
    expect(container.textContent).not.toContain("calendar-page-marker");
  });

  it("falls back to /calendar on a cold entry (no in-app history)", () => {
    render();
    window.history.replaceState({ idx: 0 }, "");
    click(backLink());
    expect(container.textContent).toContain("calendar-page-marker");
  });

  it("not-found branch: the back button falls back to /calendar on a cold entry", () => {
    setLiveQueries(null);
    render("/events/ghost");
    window.history.replaceState({ idx: 0 }, "");
    const btn = Array.from(container.querySelectorAll("button")).find((b) =>
      (b.textContent ?? "").includes("Back to calendar"),
    );
    expect(btn).toBeDefined();
    act(() => {
      btn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("calendar-page-marker");
  });

  it("not-found branch: the back button uses history when present", () => {
    setLiveQueries(null);
    render("/events/ghost");
    window.history.replaceState({ idx: 1 }, "");
    const btn = Array.from(container.querySelectorAll("button")).find((b) =>
      (b.textContent ?? "").includes("Back to calendar"),
    );
    act(() => {
      btn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("project-page-marker");
  });
});
