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
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { showToastMock } = vi.hoisted(() => ({
  showToastMock: vi.fn(),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: () => [],
}));
vi.mock("@/db/coorgInvitations", () => ({
  issueCoOrganizerInvitation: vi.fn(),
  revokeCoOrganizerInvitation: vi.fn(),
}));
vi.mock("@/db/secrets", () => ({ getSecretKey: vi.fn(async () => "secret") }));
vi.mock("@/db/projects", () => ({
  isOrganizer: (p: Project, key: string) =>
    p.organizerKey === key || p.coOrganizerKeys.includes(key),
  canClaimTask: (task: ProjectTask, all: readonly ProjectTask[]) => {
    if (task.dependencies.length === 0) return true;
    return task.dependencies.every((d) => {
      const dep = all.find((t) => t.id === d);
      return dep?.status === "completed";
    });
  },
  logActivity: vi.fn(),
  addProjectTask: vi.fn(),
  archiveProject: vi.fn(),
  bulkAddTasks: vi.fn(),
  claimProjectTask: vi.fn(),
  cloneProject: vi.fn(),
  completeProject: vi.fn(),
  confirmProjectTaskCompletion: vi.fn(),
  editProjectTask: vi.fn(),
  handoffOrganizer: vi.fn(),
  launchProject: vi.fn(),
  listActivityForProject: vi.fn(async () => []),
  listAnnouncements: vi.fn(async () => []),
  markProjectTaskComplete: vi.fn(),
  pauseProject: vi.fn(),
  postAnnouncement: vi.fn(),
  removeCoOrganizer: vi.fn(),
  reorderProjectTask: vi.fn(),
  resumeProject: vi.fn(),
  unarchiveProject: vi.fn(),
  unclaimProjectTask: vi.fn(),
}));

import "@/i18n";
import ProjectDetailPage from "./ProjectDetail";
import type { Member, Project, ProjectTask } from "@/types";

const nodeId = "node_test";
const organizerKey = "organizer-key";
const claimerKey = "claimer-key";

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

function project(): Project {
  return {
    id: "proj-1",
    title: "Garden Build",
    description: "",
    category: "infrastructure",
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
    nodeId,
    templateId: null,
  };
}

function task(
  id: string,
  overrides: Partial<ProjectTask> = {},
): ProjectTask {
  return {
    id,
    projectId: "proj-1",
    title: `Task ${id}`,
    description: "",
    category: "infrastructure",
    estimatedHours: 2,
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
    ...overrides,
  };
}

interface MockState {
  projects: Project[];
  projectTasks: ProjectTask[];
  members: Member[];
  currentMember: Member | null;
  nodeId: string;
  nodeConfig: {
    taskCheckInDays: number;
    taskNeedsHelpDays: number;
    taskCheckInGraceDays: number;
  };
  exchanges: unknown[];
  proposals: unknown[];
  lockState: "unprotected" | "locked" | "unlocked";
  coorgInvitations: unknown[];
  coorgInvitationResponses: unknown[];
  coorgInvitationRevocations: unknown[];
  blockedKeys: Set<string>;
  taskComments: unknown[];
}

let mockState: MockState;

function freshState(): MockState {
  return {
    projects: [project()],
    projectTasks: [],
    members: [member(organizerKey, "Org"), member(claimerKey, "Claimer")],
    currentMember: member(claimerKey, "Claimer"),
    nodeId,
    nodeConfig: {
      taskCheckInDays: 7,
      taskNeedsHelpDays: 14,
      taskCheckInGraceDays: 3,
    },
    exchanges: [],
    proposals: [],
    lockState: "unprotected",
    coorgInvitations: [],
    coorgInvitationResponses: [],
    coorgInvitationRevocations: [],
    blockedKeys: new Set<string>(),
    taskComments: [],
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = freshState();
  showToastMock.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/project/proj-1"]}>
        <Routes>
          <Route path="/project/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

describe("ProjectDetail — claim-time commitment summary", () => {
  it("renders hours + days adjacent to the Claim button on an open task with hours", () => {
    mockState.projectTasks = [
      task("t1", {
        title: "Install hinges",
        estimatedHours: 2,
        status: "open",
      }),
    ];
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("Claim this task");
    // The summary names BOTH the hours and the configured private
    // check-in window — proves the value is wired through from
    // nodeConfig and not a hardcoded fallback.
    expect(text).toContain("About 2 hours");
    expect(text).toContain("7 days");
    expect(text).toContain("privately");
  });

  it("uses the no-hours variant when estimatedHours is 0", () => {
    mockState.projectTasks = [
      task("t1", {
        title: "Open-ended",
        estimatedHours: 0,
        status: "open",
      }),
    ];
    render();
    const text = container.textContent ?? "";
    expect(text).not.toContain("About 0 hours");
    // The days/privacy framing still surfaces.
    expect(text).toContain("7 days");
    expect(text).toContain("privately");
  });
});

describe("ProjectDetail — 'Mine' filter pill", () => {
  it("does not render the pill when the current member has no claimed tasks here", () => {
    // Padded past MIN_TASKS_FOR_FILTERS (7) so the filter chrome renders;
    // this exercises the real branch where the "Mine" pill is suppressed
    // because nothing here is claimed — not the small-list shortcut.
    mockState.projectTasks = [
      task("t1", { title: "Open one", status: "open" }),
      task("t2", { status: "open" }),
      task("t3", { status: "open" }),
      task("t4", { status: "open" }),
      task("t5", { status: "open" }),
      task("t6", { status: "open" }),
      task("t7", { status: "open" }),
    ];
    render();
    const buttons = Array.from(container.querySelectorAll("button"));
    const labels = buttons.map((b) => (b.textContent ?? "").trim());
    expect(labels).not.toContain("Mine");
    // The baseline pills still render, confirming the chrome is present.
    expect(labels).toContain("All");
  });

  it("renders the pill when the current member has a claimed task here", () => {
    // ≥ MIN_TASKS_FOR_FILTERS (7) tasks so the filter pills render at all;
    // t1 is the claimer's claimed task that surfaces the "Mine" pill, the
    // rest are filler so the list clears the threshold.
    mockState.projectTasks = [
      task("t1", {
        title: "Mine",
        status: "claimed",
        assignedTo: claimerKey,
        claimedAt: Date.now(),
      }),
      task("t2", { title: "Theirs", status: "open" }),
      task("t3", { status: "open" }),
      task("t4", { status: "open" }),
      task("t5", { status: "open" }),
      task("t6", { status: "open" }),
      task("t7", { status: "open" }),
    ];
    render();
    const buttons = Array.from(container.querySelectorAll("button"));
    const labels = buttons.map((b) => (b.textContent ?? "").trim());
    expect(labels).toContain("Mine");
  });
});
