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

// landscape-short (a phone held sideways — the shared variant in
// tailwind.config.js) class contracts for the combined My work page:
// the two halves become columns, the one-side-empty sentences swap to
// a one-line short form, and the combined EmptyState compresses.
// jsdom can't evaluate the media query, so these tests pin the class
// strings the variant hangs on (the BottomNav/Calendar idiom).

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));

import "@/i18n";
import MyWorkPage from "./MyWork";
import type { Member, Project, ProjectTask } from "@/types";

interface MockState {
  currentMember: Member | null;
  projects: Project[];
  projectTasks: ProjectTask[];
  exchanges: never[];
  posts: never[];
  events: never[];
  eventCancellations: never[];
  coorgInvitations: never[];
  coorgInvitationResponses: never[];
  coorgInvitationRevocations: never[];
  blockedKeys: Set<string>;
  members: Member[];
}

let mockState: MockState = blankState();

function blankState(): MockState {
  return {
    currentMember: null,
    projects: [],
    projectTasks: [],
    exchanges: [],
    posts: [],
    events: [],
    eventCancellations: [],
    coorgInvitations: [],
    coorgInvitationResponses: [],
    coorgInvitationRevocations: [],
    blockedKeys: new Set<string>(),
    members: [],
  };
}

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
  } satisfies Member;
}

function makeProject(over: Partial<Project> & { id: string }): Project {
  const base: Project = {
    id: over.id,
    title: `Project ${over.id}`,
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
  return { ...base, ...over };
}

function makeTask(
  over: Partial<ProjectTask> & { id: string; projectId: string },
): ProjectTask {
  const base: ProjectTask = {
    id: over.id,
    projectId: over.projectId,
    title: `Task ${over.id}`,
    description: "",
    category: "infrastructure",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 1000,
    createdAt: 0,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
    actualHours: null,
    checkInAcknowledgedAt: null,
  };
  return { ...base, ...over };
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
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

function withCarriedTask() {
  mockState.currentMember = makeMember("me-key");
  mockState.projects = [makeProject({ id: "p1" })];
  mockState.projectTasks = [
    makeTask({
      id: "t1",
      projectId: "p1",
      assignedTo: "me-key",
      status: "claimed",
      claimedAt: 100,
    }),
  ];
}

describe("MyWorkPage — landscape-short columns", () => {
  it("the halves wrapper carries the two-column landscape classes", () => {
    withCarriedTask();
    render(<MyWorkPage />);
    const tasks = container.querySelector("#tasks");
    expect(tasks).not.toBeNull();
    const wrapper = tasks!.parentElement!;
    for (const cls of [
      "landscape-short:grid",
      "landscape-short:grid-cols-2",
      "landscape-short:items-start",
      "landscape-short:gap-x-6",
    ]) {
      expect(wrapper.className).toContain(cls);
    }
  });

  it("keeps DOM order tasks-then-projects (reading order = source order, WCAG 2.4.3)", () => {
    withCarriedTask();
    render(<MyWorkPage />);
    const tasks = container.querySelector("#tasks")!;
    const projects = container.querySelector("#projects")!;
    // #tasks (the commitments column) must precede #projects in the
    // document — the grid only changes placement, never order.
    expect(
      tasks.compareDocumentPosition(projects) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe("MyWorkPage — one-side-empty short form under landscape-short", () => {
  it("empty carrying half: prose hides sideways, the one-liner shows, one shared door", () => {
    // Organizer half populated, carrying half empty.
    mockState.currentMember = makeMember("me-key");
    mockState.projects = [
      makeProject({ id: "p1", organizerKey: "me-key" }),
    ];
    render(<MyWorkPage />);
    const spans = Array.from(container.querySelectorAll("span"));
    const prose = spans.find((s) =>
      s.textContent?.includes("When you claim a task"),
    );
    expect(prose).toBeDefined();
    expect(prose!.className).toContain("landscape-short:hidden");
    const short = spans.find((s) =>
      s.textContent?.includes("Nothing claimed yet"),
    );
    expect(short).toBeDefined();
    expect(short!.className).toContain("hidden");
    expect(short!.className).toContain("landscape-short:inline");
    // The action link is shared by both forms — exactly one door.
    expect(
      container.querySelectorAll('a[href="/?tab=projects"]'),
    ).toHaveLength(1);
  });

  it("empty organizer half: same contract with the start-a-project door", () => {
    withCarriedTask();
    render(<MyWorkPage />);
    const spans = Array.from(container.querySelectorAll("span"));
    const prose = spans.find((s) =>
      s.textContent?.includes("When you start a project"),
    );
    expect(prose).toBeDefined();
    expect(prose!.className).toContain("landscape-short:hidden");
    const short = spans.find((s) =>
      s.textContent?.includes("No projects in your care yet"),
    );
    expect(short).toBeDefined();
    expect(short!.className).toContain("hidden");
    expect(short!.className).toContain("landscape-short:inline");
    expect(container.querySelectorAll('a[href="/project/new"]')).toHaveLength(
      1,
    );
  });
});

describe("MyWorkPage — combined empty state compresses sideways", () => {
  it("keeps the single EmptyState, with the landscape compression contract", () => {
    mockState.currentMember = makeMember("me-key");
    render(<MyWorkPage />);
    const card = Array.from(container.querySelectorAll("div.card")).find(
      (d) => d.textContent?.includes("Nothing in your care"),
    );
    expect(card).toBeDefined();
    // EmptyState's landscape-short contract: tighter padding + stack
    // gap, illustration hidden — copy unchanged.
    expect(card!.className).toContain("landscape-short:py-3");
    expect(card!.className).toContain("landscape-short:gap-1");
    const svg = card!.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("class") ?? "").toContain(
      "landscape-short:hidden",
    );
    // Both doors still present (existing behavior).
    expect(container.querySelector('a[href="/?tab=projects"]')).not.toBeNull();
    expect(container.querySelector('a[href="/project/new"]')).not.toBeNull();
  });
});
