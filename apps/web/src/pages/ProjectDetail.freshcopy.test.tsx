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

const { showToastMock } = vi.hoisted(() => ({ showToastMock: vi.fn() }));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
    dismissToast: vi.fn(),
    toast: null,
  }),
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
  canClaimTask: () => true,
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
import { addProjectTask } from "@/db/projects";
import ProjectDetailPage from "./ProjectDetail";
import type { Member, Project, ProjectTask } from "@/types";

const nodeId = "node_test";
const organizerKey = "organizer-key";
const memberKey = "member-key";

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

function project(overrides: Partial<Project> = {}): Project {
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
    ...overrides,
  };
}

function completedTask(overrides: Partial<ProjectTask> = {}): ProjectTask {
  return {
    id: "t1",
    projectId: "proj-1",
    title: "Restock the fridge",
    description: "weekly run",
    category: "food",
    estimatedHours: 2,
    urgency: "low",
    requiredSkills: ["driving"],
    assignedTo: memberKey,
    status: "completed",
    dependencies: ["dep-x"],
    orderIndex: 1000,
    createdAt: 0,
    completedAt: 500,
    completedBy: memberKey,
    exchangeId: "ex-1",
    claimedAt: 100,
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
    projectTasks: [completedTask()],
    members: [member(organizerKey, "Org"), member(memberKey, "Mel")],
    currentMember: member(organizerKey, "Org"),
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
  vi.mocked(addProjectTask).mockReset();
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

function freshCopyButton(): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => (b.textContent ?? "").trim() === "Add a fresh copy",
  );
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("ProjectDetail — fresh copy of a completed task", () => {
  it("copies the task's fields (dropping dependencies) and toasts on success", async () => {
    vi.mocked(addProjectTask).mockResolvedValue(
      completedTask({ id: "new", status: "open" }),
    );
    render();
    const btn = freshCopyButton();
    expect(btn).toBeDefined();
    act(() => {
      btn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();
    expect(vi.mocked(addProjectTask)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(addProjectTask)).toHaveBeenCalledWith(
      "proj-1",
      organizerKey,
      {
        title: "Restock the fridge",
        description: "weekly run",
        category: "food",
        estimatedHours: 2,
        urgency: "low",
        requiredSkills: ["driving"],
        // Dependencies dropped — the original's upstream is done.
        dependencies: [],
      },
    );
    expect(showToastMock).toHaveBeenCalledTimes(1);
    expect(String(showToastMock.mock.calls[0]?.[0] ?? "")).toContain(
      "Restock the fridge",
    );
  });

  it("does not offer the button to a non-organizer", () => {
    mockState.currentMember = member(memberKey, "Mel");
    render();
    expect(freshCopyButton()).toBeUndefined();
  });

  it("does not offer the button on a completed or archived project", () => {
    mockState.projects = [project({ status: "completed", completedAt: 900 })];
    render();
    expect(freshCopyButton()).toBeUndefined();

    act(() => {
      root.unmount();
    });
    mockState.projects = [project({ status: "archived", completedAt: 900 })];
    render();
    expect(freshCopyButton()).toBeUndefined();
  });

  it("disables the button while the copy is in flight (guards double-add)", async () => {
    let resolveAdd: (value: ProjectTask) => void = () => {};
    vi.mocked(addProjectTask).mockReturnValue(
      new Promise<ProjectTask>((resolve) => {
        resolveAdd = resolve;
      }),
    );
    render();
    const btn = freshCopyButton();
    expect(btn).toBeDefined();
    expect(btn!.disabled).toBe(false);
    act(() => {
      btn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // In flight: the same node is now disabled, so a real second click
    // can't fire (the only thing standing between this and a double-add).
    expect(btn!.disabled).toBe(true);
    expect(vi.mocked(addProjectTask)).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveAdd(completedTask({ id: "new", status: "open" }));
      await Promise.resolve();
    });
    expect(btn!.disabled).toBe(false);
  });
});
