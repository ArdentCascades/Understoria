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

// landscape-short (a phone held sideways) class contracts for the
// Dashboard: the doorway cards pair up two-across instead of framing
// a rail jsdom can't fit, the leaf dividers tighten, and the empty
// category-breakdown state compresses. jsdom can't evaluate the media
// query, so these pin the class strings (the BottomNav/Calendar idiom).

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));

import "@/i18n";
import DashboardPage from "./Dashboard";
import type { Member } from "@/types";

interface MockState {
  exchanges: never[];
  members: Member[];
  posts: never[];
  achievements: never[];
  proposals: never[];
  events: never[];
  eventCancellations: never[];
  eventRsvps: never[];
  projects: never[];
  projectTasks: never[];
  currentMember: Member | null;
  nodeId: string;
  communityNodeIds: ReadonlySet<string>;
  nodeConfig: {
    customMilestones: never[];
    taskCheckInDays: number;
    taskNeedsHelpDays: number;
    taskCheckInGraceDays: number;
  };
}

let mockState: MockState;

function makeMember(publicKey: string): Member {
  return {
    publicKey,
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
}

function blankState(): MockState {
  const me = makeMember("me-key");
  return {
    exchanges: [],
    members: [me],
    posts: [],
    achievements: [],
    proposals: [],
    events: [],
    eventCancellations: [],
    eventRsvps: [],
    projects: [],
    projectTasks: [],
    currentMember: me,
    nodeId: "node-1",
    communityNodeIds: new Set(["node-1"]),
    nodeConfig: {
      customMilestones: [],
      taskCheckInDays: 7,
      taskNeedsHelpDays: 14,
      taskCheckInGraceDays: 3,
    },
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

describe("Dashboard — landscape-short layout contracts", () => {
  it("the doorway block pairs its cards two-across sideways (DOM order untouched)", () => {
    render(<DashboardPage />);
    // The doorway wrapper is the lg rail; sideways it becomes a
    // 2-column grid instead — same children, same source order.
    const rail = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("lg:sticky"),
    );
    expect(rail).toBeDefined();
    for (const cls of [
      "landscape-short:grid",
      "landscape-short:grid-cols-2",
      "landscape-short:items-start",
      "landscape-short:gap-x-4",
    ]) {
      expect(rail!.className).toContain(cls);
    }
  });

  it("the leaf dividers tighten sideways", () => {
    render(<DashboardPage />);
    const dividers = Array.from(container.querySelectorAll("div")).filter(
      (d) => d.className === "my-2 landscape-short:my-1",
    );
    // Three always-rendered dividers separate the stacked bands.
    expect(dividers.length).toBeGreaterThanOrEqual(3);
  });

  it("the empty category breakdown compresses under the EmptyState landscape contract", () => {
    render(<DashboardPage />);
    // Zero exchanges → the inset EmptyState inside "Where help is
    // flowing". Sideways: tighter padding, illustration hidden.
    const inset = Array.from(container.querySelectorAll("div")).find(
      (d) =>
        d.textContent?.includes("A new understoria") &&
        d.className.includes("landscape-short:py-2"),
    );
    expect(inset).toBeDefined();
    expect(inset!.className).toContain("landscape-short:gap-1");
    const svg = inset!.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("class") ?? "").toContain(
      "landscape-short:hidden",
    );
  });
});
