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
import DashboardPage from "./Dashboard";
import type { Exchange, Member, Proposal } from "@/types";

interface MockState {
  exchanges: Exchange[];
  members: Member[];
  posts: never[];
  achievements: never[];
  proposals: Proposal[];
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

function exchange(over: Partial<Exchange> & { id: string }): Exchange {
  return {
    postId: "post-1",
    helperKey: "helper",
    helpedKey: "helped",
    hoursExchanged: 2,
    helperSignature: "sig",
    helpedSignature: "sig",
    completedAt: Date.now(),
    category: "food",
    nodeId: "node-1",
    ...over,
  };
}

function proposal(over: Partial<Proposal> & { id: string }): Proposal {
  return {
    nodeId: "node-1",
    kind: "proposal",
    category: "config_change",
    reversibilityTier: "easy",
    title: `Proposal ${over.id}`,
    description: "",
    payload: "{}",
    proposerKey: "proposer",
    status: "open",
    createdAt: Date.now(),
    closedAt: null,
    closedReason: null,
    impactReflection: null,
    disputePostId: null,
    ...over,
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

describe("Dashboard — needs-answered doorway", () => {
  it("links the needs-answered card to the Board's Needs tab, copy unchanged", () => {
    render(<DashboardPage />);
    const link = container.querySelector('a[href="/?tab=needs"]');
    expect(link).not.toBeNull();
    expect(link!.getAttribute("aria-label")).toBe(
      "See open needs on the community board",
    );
    // The label names what the number counts: new needs someone has
    // stepped up for, composing with the "of N posted" sub-line.
    expect(container.textContent).toContain("New needs with a helper");
    expect(container.textContent).toContain("no needs posted this week");
  });
});

describe("Dashboard — streak zero-state", () => {
  it("renders the warm word instead of a zero", () => {
    render(<DashboardPage />);
    expect(container.textContent).toContain("Solidarity streak");
    expect(container.textContent).toContain("gathering");
    expect(container.textContent).not.toContain("days in a row");
  });

  it("keeps the numeric rendering once a streak exists", () => {
    mockState.exchanges = [exchange({ id: "x1" })];
    render(<DashboardPage />);
    expect(container.textContent).not.toContain("gathering");
    expect(container.textContent).toContain("day");
  });
});

describe("Dashboard — proposals doorway", () => {
  it("is absent when no proposals are open", () => {
    mockState.proposals = [
      proposal({ id: "closed", status: "passed", closedAt: Date.now() }),
    ];
    render(<DashboardPage />);
    expect(container.querySelector('a[href="/proposals"]')).toBeNull();
  });

  it("renders a singular line linking to /proposals", () => {
    mockState.proposals = [proposal({ id: "p1" })];
    render(<DashboardPage />);
    const link = container.querySelector('a[href="/proposals"]');
    expect(link).not.toBeNull();
    expect(link!.textContent).toContain("1 proposal open for discussion");
  });

  it("pluralizes when several are open", () => {
    mockState.proposals = [
      proposal({ id: "p1" }),
      proposal({ id: "p2" }),
      proposal({ id: "closed", status: "rejected", closedAt: Date.now() }),
    ];
    render(<DashboardPage />);
    const link = container.querySelector('a[href="/proposals"]');
    expect(link).not.toBeNull();
    expect(link!.textContent).toContain("2 proposals open for discussion");
  });
});

describe("Dashboard — landscape-short columns", () => {
  it("pins the stat tiles 3-across in short landscape", () => {
    render(<DashboardPage />);
    const tiles = container.querySelector('[class*="xl:grid-cols-5"]')!;
    expect(tiles.className).toContain("landscape-short:grid-cols-3");
  });

  it("pairs the lg two-column card wrappers sideways too, source order intact", () => {
    render(<DashboardPage />);
    // All three desktop pairs — the community rollups, milestones +
    // category breakdown, and the flow-of-help pair (BreadthBar with
    // the Reciprocity section beside it) — go two-up in short
    // landscape via the same wrappers, so DOM/reading order never
    // changes with the viewport (WCAG 2.4.3).
    const pairs = container.querySelectorAll(
      '[class*="lg:grid-cols-2"][class*="landscape-short:grid-cols-2"]',
    );
    expect(pairs.length).toBe(3);
    // The mobile-stack divider inside the second pair hides wherever
    // the pair goes two-up.
    const divider = container.querySelector('div[class*="my-2 lg:hidden"]');
    expect(divider).not.toBeNull();
    expect(divider!.className).toContain("landscape-short:hidden");
  });
});
