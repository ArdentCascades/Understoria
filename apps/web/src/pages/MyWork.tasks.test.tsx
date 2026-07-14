/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The tasks-you're-carrying half of the combined My work page, plus
// the page-level shapes (section anchors, combined empty state). The
// organizer half is covered in MyWork.projects.test.tsx.

// Mock `useApp` BEFORE importing the page. The real provider needs a
// hydrated Dexie connection; the page only consumes the arrays below
// plus `currentMember`.
vi.mock("@/state/AppContext", () => {
  return {
    useApp: () => mockState,
  };
});

// `i18n/index.ts` runs side-effects on import (the `void i18n.init()`).
// Importing it once here brings the locale resources in so
// `useTranslation()` returns real strings during render.
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

describe("MyWorkPage (carrying half)", () => {
  it("renders ONE combined empty state when nothing is in the member's care", () => {
    mockState.currentMember = makeMember("me-key");
    render(<MyWorkPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("Nothing in your care");
    // Not two stacked section shells — the section anchors only render
    // when at least one half has content.
    expect(container.querySelector("#tasks")).toBeNull();
    expect(container.querySelector("#projects")).toBeNull();
    // Browsing projects is the primary door; starting one the quiet
    // second link.
    expect(
      container.querySelector('a[href="/?tab=projects"]'),
    ).not.toBeNull();
    expect(container.querySelector('a[href="/project/new"]')).not.toBeNull();
  });

  it("shows only the viewing member's active commitments, grouped by project", () => {
    mockState.currentMember = makeMember("me-key");
    mockState.projects = [
      makeProject({ id: "p1", title: "Community fridge" }),
      makeProject({ id: "p2", title: "Tool library" }),
    ];
    mockState.projectTasks = [
      makeTask({
        id: "t1",
        projectId: "p1",
        title: "Paint the shelter",
        assignedTo: "me-key",
        status: "claimed",
        claimedAt: 100,
      }),
      makeTask({
        id: "t2",
        projectId: "p2",
        title: "Catalogue drills",
        assignedTo: "me-key",
        status: "awaiting_confirmation",
        claimedAt: 200,
        completedBy: "me-key",
      }),
      makeTask({
        id: "t3",
        projectId: "p1",
        title: "Someone else's task",
        assignedTo: "other-key",
        status: "claimed",
        claimedAt: 300,
      }),
      makeTask({
        id: "t4",
        projectId: "p1",
        title: "Already finished",
        assignedTo: "me-key",
        status: "completed",
        claimedAt: 50,
        completedAt: 400,
      }),
    ];
    render(<MyWorkPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("Community fridge");
    expect(text).toContain("Tool library");
    expect(text).toContain("Paint the shelter");
    expect(text).toContain("Catalogue drills");
    expect(text).not.toContain("Someone else's task");
    expect(text).not.toContain("Already finished");
    // Summary sentence covers both counts.
    expect(text).toContain("2 tasks across 2 projects");
    // Project headings link to the project page; task rows link to the
    // task's own page.
    expect(container.querySelector('a[href="/project/p1"]')).not.toBeNull();
    expect(container.querySelector('a[href="/project/p2"]')).not.toBeNull();
    expect(
      container.querySelector('a[href="/project/p1/task/t1"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('a[href="/project/p2/task/t2"]'),
    ).not.toBeNull();
    // Both section anchors exist (the /my-tasks and /my-projects
    // redirects land on them), and the empty organizer half is a quiet
    // sentence with the start-a-project door — not a second EmptyState.
    expect(container.querySelector("#tasks")).not.toBeNull();
    expect(container.querySelector("#projects")).not.toBeNull();
    expect(text).toContain("When you start a project");
    expect(container.querySelector('a[href="/project/new"]')).not.toBeNull();
  });

  it("labels submitted work as awaiting confirmation", () => {
    mockState.currentMember = makeMember("me-key");
    mockState.projects = [makeProject({ id: "p1" })];
    mockState.projectTasks = [
      makeTask({
        id: "t1",
        projectId: "p1",
        assignedTo: "me-key",
        status: "awaiting_confirmation",
        claimedAt: 100,
        completedBy: "me-key",
      }),
    ];
    render(<MyWorkPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("Awaiting confirmation");
  });

  it("names a paused project so the claim doesn't read as waiting on the claimer", () => {
    mockState.currentMember = makeMember("me-key");
    mockState.projects = [
      makeProject({ id: "p1", status: "paused", pauseNote: "winter break" }),
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
    expect(text).toContain("Paused");
  });
});
