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
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/components/AttentionSection", () => ({
  AttentionSection: () => <div data-testid="attention-section" />,
}));
vi.mock("@/components/FirstActionNudge", () => ({ FirstActionNudge: () => null }));
vi.mock("@/components/ProfileNudge", () => ({ ProfileNudge: () => null }));
vi.mock("@/components/ContextualHint", () => ({ ContextualHint: () => null }));

import "@/i18n";
import BoardPage from "./Board";
import type {
  Member,
  Post,
  Project,
  ProjectTask,
  SignedVouch,
} from "@/types";
import type { InviteRow } from "@/db/database";

const DAY = 24 * 60 * 60 * 1000;

interface MockState {
  posts: Post[];
  members: Member[];
  currentMember: Member | null;
  projects: Project[];
  projectTasks: ProjectTask[];
  vouches: SignedVouch[];
  invites: InviteRow[];
  nodeId: string;
  nodeConfig: {
    taskCheckInDays: number;
    taskNeedsHelpDays: number;
    taskCheckInGraceDays: number;
  };
}

let mockState: MockState;

function blankState(): MockState {
  const me = makeMember("me-key");
  return {
    posts: [],
    members: [me],
    currentMember: me,
    projects: [],
    projectTasks: [],
    vouches: [],
    invites: [],
    nodeId: "node-1",
    nodeConfig: {
      taskCheckInDays: 7,
      taskNeedsHelpDays: 14,
      taskCheckInGraceDays: 3,
    },
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
  };
}

function makeProject(over: Partial<Project> & { id: string }): Project {
  const base: Project = {
    id: over.id,
    title: `Project ${over.id}`,
    description: "",
    category: "infrastructure",
    organizerKey: "me-key",
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

function task(over: Partial<ProjectTask> & { id: string; projectId: string }): ProjectTask {
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
    orderIndex: 0,
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

/** A claim that's gone long-silent — 20 days, no ack — so its project
 *  qualifies as `needs_more_hands` under the default config. */
function staleClaim(id: string, projectId: string): ProjectTask {
  return task({
    id,
    projectId,
    status: "claimed",
    assignedTo: "helper-key",
    claimedAt: Date.now() - 20 * DAY,
  });
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
    root.render(
      <MemoryRouter initialEntries={["/?tab=projects"]}>{node}</MemoryRouter>,
    );
  });
}

function moreHandsToggles(): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll("button")).filter(
    (b) => (b.textContent ?? "").trim() === "Could use more hands",
  );
}

describe("Board — 'could use more hands' project filter", () => {
  it("narrows the list to projects with a needs-more-hands task", () => {
    mockState.projects = [
      makeProject({ id: "p1", title: "Quiet fridge" }),
      makeProject({ id: "p2", title: "Busy garden" }),
    ];
    mockState.projectTasks = [
      staleClaim("t1", "p1"),
      // p2 has only an open task — not needs_more_hands.
      task({ id: "t2", projectId: "p2", status: "open" }),
    ];
    render(<BoardPage />);
    // Both visible before filtering.
    expect(container.textContent).toContain("Quiet fridge");
    expect(container.textContent).toContain("Busy garden");

    const toggles = moreHandsToggles();
    expect(toggles.length).toBeGreaterThan(0);
    act(() => {
      toggles[0]!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Quiet fridge");
    expect(container.textContent).not.toContain("Busy garden");
    // Toggle reflects pressed state (both rail copies update).
    expect(
      moreHandsToggles().every((b) => b.getAttribute("aria-pressed") === "true"),
    ).toBe(true);
  });

  it("offers Clear filters when the toggle empties the list, and restores", () => {
    mockState.projects = [makeProject({ id: "p1", title: "All open" })];
    // Only an open task — never qualifies as needs_more_hands.
    mockState.projectTasks = [task({ id: "t1", projectId: "p1", status: "open" })];
    render(<BoardPage />);
    expect(container.textContent).toContain("All open");

    act(() => {
      moreHandsToggles()[0]!.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    // Filtered to empty → filter-empty branch with the reset affordance.
    expect(container.textContent).toContain("Nothing matches these filters.");
    const clearButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Clear filters",
    );
    expect(clearButton).toBeTruthy();

    act(() => {
      clearButton!.click();
    });
    expect(container.textContent).toContain("All open");
    expect(
      moreHandsToggles().every(
        (b) => b.getAttribute("aria-pressed") === "false",
      ),
    ).toBe(true);
  });
});
