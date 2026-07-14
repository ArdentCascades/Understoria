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

// The projects-you-organize half of the combined My work page; the
// carrying half and page-level shapes live in MyWork.tasks.test.tsx.

// Mock `useApp` BEFORE importing the page — the real provider needs a
// hydrated Dexie connection; the page only reads the arrays below.
vi.mock("@/state/AppContext", () => {
  return {
    useApp: () => mockState,
  };
});

import "@/i18n";
import MyWorkPage from "./MyWork";
import type {
  CoOrganizerInvitation,
  Exchange,
  Member,
  Project,
  ProjectTask,
} from "@/types";

interface MockState {
  currentMember: Member | null;
  projects: Project[];
  projectTasks: ProjectTask[];
  exchanges: Exchange[];
  posts: never[];
  events: never[];
  eventCancellations: never[];
  coorgInvitations: CoOrganizerInvitation[];
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

describe("MyWorkPage (organizing half)", () => {
  it("renders a quiet sentence (not a second EmptyState) when only the organizer half is empty", () => {
    mockState.currentMember = makeMember("me-key");
    // A claim keeps the carrying half populated, so the page renders
    // its sections rather than the combined empty state.
    mockState.projects = [
      makeProject({ id: "p1", title: "Someone else's project", organizerKey: "other-key" }),
    ];
    mockState.projectTasks = [
      makeTask({
        id: "t1",
        projectId: "p1",
        assignedTo: "me-key",
        status: "claimed",
        claimedAt: 100,
      }),
    ];
    render(<MyWorkPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("When you start a project");
    // The full-page empty title stays out of a half-populated page.
    expect(text).not.toContain("Nothing in your care");
    // The quiet line still carries the new-project door.
    expect(container.querySelector('a[href="/project/new"]')).not.toBeNull();
  });

  it("lists projects the member organizes, with the co-organizer chip and waiting counts", () => {
    mockState.currentMember = makeMember("me-key");
    mockState.projects = [
      makeProject({ id: "p1", title: "Community fridge", organizerKey: "me-key" }),
      makeProject({
        id: "p2",
        title: "Tool library",
        organizerKey: "other-key",
        coOrganizerKeys: ["me-key"],
      }),
      makeProject({ id: "p3", title: "Not mine", organizerKey: "other-key" }),
    ];
    mockState.projectTasks = [
      makeTask({ id: "open1", projectId: "p1", status: "open" }),
      makeTask({
        id: "wait1",
        projectId: "p1",
        status: "awaiting_confirmation",
        completedBy: "helper-key",
        completedAt: 500,
      }),
    ];
    render(<MyWorkPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("Community fridge");
    expect(text).toContain("Tool library");
    expect(text).not.toContain("Not mine");
    // Co-organizer chip only on the project where the viewer is co.
    expect(text).toContain("Co-organizer");
    // Summary counts projects, not output.
    expect(text).toContain("2 projects are in your care");
    // Waiting and open lines for the fridge.
    expect(text).toContain("1 task waiting for your confirmation");
    expect(text).toContain("1 open task");
    // Headings link to the project pages.
    expect(container.querySelector('a[href="/project/p1"]')).not.toBeNull();
    expect(container.querySelector('a[href="/project/p2"]')).not.toBeNull();
  });

  it("keeps a completed project on the workbench only while a confirmation waits", () => {
    mockState.currentMember = makeMember("me-key");
    mockState.projects = [
      makeProject({ id: "clean", title: "Wrapped up", status: "completed" }),
      makeProject({ id: "loose", title: "Last signature", status: "completed" }),
    ];
    mockState.projectTasks = [
      makeTask({
        id: "w",
        projectId: "loose",
        status: "awaiting_confirmation",
        completedBy: "helper-key",
        completedAt: 500,
      }),
    ];
    render(<MyWorkPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("Last signature");
    expect(text).not.toContain("Wrapped up");
  });
});
