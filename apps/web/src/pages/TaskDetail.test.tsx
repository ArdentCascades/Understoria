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

const { claimProjectTaskMock } = vi.hoisted(() => ({
  claimProjectTaskMock: vi.fn(),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), toast: null }),
}));
vi.mock("dexie-react-hooks", () => ({ useLiveQuery: () => [] }));
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
  claimProjectTask: claimProjectTaskMock,
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
import TaskDetailPage from "./TaskDetail";
import type { Member, Project, ProjectTask } from "@/types";

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

function task(id: string, overrides: Partial<ProjectTask> = {}): ProjectTask {
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
    autoConfirmHours: number;
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
    // t1/t2 carry the named-row assertions; t2 is the task the page is
    // routed to. Both open so the Claim affordance is exercisable.
    projectTasks: [
      task("t1", { title: "First task" }),
      task("t2", {
        title: "Second task",
        description: "Lay the irrigation line",
      }),
    ],
    // Viewer is a plain member (not the organizer) so claiming is
    // frictionless and the static (non-drag) row renders.
    members: [member(organizerKey, "Org"), member(viewerKey, "Viewer")],
    currentMember: member(viewerKey, "Viewer"),
    nodeId,
    nodeConfig: {
      taskCheckInDays: 7,
      taskNeedsHelpDays: 14,
      taskCheckInGraceDays: 3,
      autoConfirmHours: 168,
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
  claimProjectTaskMock.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(initialPath: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/project/:id/task/:taskId"
            element={<TaskDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
    );
  });
}

function clickButtonByText(label: string) {
  const btn = Array.from(container.querySelectorAll("button")).find(
    (b) => (b.textContent ?? "").trim() === label,
  );
  if (!btn) throw new Error(`button "${label}" not found`);
  act(() => {
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("TaskDetailPage — per-task page", () => {
  it("renders the full task in its project context", () => {
    render("/project/proj-1/task/t2");
    const text = container.textContent ?? "";
    // Task title (in the heading and the row) + its description.
    expect(text).toContain("Second task");
    expect(text).toContain("Lay the irrigation line");
    // Status + hours chips are part of the full row.
    expect(text).toContain("Open");
    expect(text).toContain("2h");
    // The self-contained TaskComments toggle renders verbatim.
    expect(text).toContain("Start a comment thread");
  });

  it("keeps claiming frictionless for a non-organizer on an active project", () => {
    render("/project/proj-1/task/t2");
    // The OPEN task, viewed by a plain member while the project is
    // active, surfaces the one-tap Claim affordance.
    clickButtonByText("Claim this task");
    expect(claimProjectTaskMock).toHaveBeenCalledTimes(1);
    expect(claimProjectTaskMock).toHaveBeenCalledWith("t2", viewerKey);
  });

  it("shows the project-not-found guard for an unknown project", () => {
    render("/project/nope/task/x");
    const text = container.textContent ?? "";
    expect(text).toContain("This project couldn't be found.");
    // A back control is present...
    expect(text).toContain("← Back to projects");
    // ...and no task-row chrome leaked through (no status chip, no
    // claim affordance).
    expect(text).not.toContain("Claim this task");
    expect(text).not.toContain("Start a comment thread");
  });

  it("shows the task-not-found guard with a back link to the project", () => {
    render("/project/proj-1/task/ghost");
    const text = container.textContent ?? "";
    expect(text).toContain(
      "This task couldn't be found — it may have been removed.",
    );
    // Back link points at the project the task would have lived on.
    const back = container.querySelector<HTMLAnchorElement>(
      'a[href="/project/proj-1"]',
    );
    expect(back).not.toBeNull();
    expect((back!.textContent ?? "").trim()).toContain("Back to Garden Build");
  });

  it("offers a back affordance that re-anchors the project list to this row", () => {
    render("/project/proj-1/task/t2");
    const back = container.querySelector<HTMLAnchorElement>(
      'a[href="/project/proj-1#task-t2"]',
    );
    expect(back).not.toBeNull();
  });
});
