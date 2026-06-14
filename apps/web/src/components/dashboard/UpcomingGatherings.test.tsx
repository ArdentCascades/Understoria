/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));

import "@/i18n";
import { UpcomingGatherings } from "./UpcomingGatherings";
import type { Event, EventRsvpRow, Member } from "@/types";

const HOUR = 60 * 60 * 1000;

function event(over: Partial<Event> & { id: string; startsAt: number }): Event {
  return {
    kind: "event",
    title: `Event ${over.id}`,
    description: "",
    category: "social",
    endsAt: null,
    location: "",
    capacity: null,
    templateId: null,
    createdAt: 0,
    createdBy: "org",
    nodeId: "node-1",
    signature: "sig",
    ...over,
  };
}

function member(publicKey: string): Member {
  return {
    publicKey,
    displayName: "Me",
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 0,
    vouchedBy: [],
    createdAt: 0,
    nodeId: "node-1",
    locationZone: "",
  };
}

interface MockState {
  events: Event[];
  eventCancellations: never[];
  eventRsvps: EventRsvpRow[];
  currentMember: Member | null;
}

let mockState: MockState = blankState();

function blankState(): MockState {
  return {
    events: [],
    eventCancellations: [],
    eventRsvps: [],
    currentMember: member("me"),
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = blankState();
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
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

describe("UpcomingGatherings", () => {
  it("renders nothing when there are no upcoming events", () => {
    render(<UpcomingGatherings />);
    expect(container.textContent).toBe("");
  });

  it("lists the soonest upcoming events with a link each", () => {
    mockState.events = [
      event({ id: "fridge", title: "Potluck night", startsAt: Date.now() + 2 * HOUR }),
      event({ id: "game", title: "Game night", startsAt: Date.now() + 1 * HOUR }),
    ];
    render(<UpcomingGatherings />);
    const text = container.textContent ?? "";
    expect(text).toContain("Coming up");
    expect(text).toContain("Potluck night");
    expect(text).toContain("Game night");
    expect(container.querySelector('a[href="/events/game"]')).not.toBeNull();
  });

  it("shows the viewer's own 'going' status", () => {
    mockState.events = [
      event({ id: "g", title: "Going one", startsAt: Date.now() + HOUR }),
    ];
    mockState.eventRsvps = [
      { id: "r", eventId: "g", memberKey: "me", status: "going", respondedAt: 1 },
    ];
    render(<UpcomingGatherings />);
    expect(container.textContent ?? "").toContain("you're going");
  });
});
