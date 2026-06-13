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
    members: [
      member(organizerKey, "Org"),
      member("zoe-key", "Zoe"),
      member("amy-key", "Amy"),
      member("mona-key", "Mona"),
    ],
    currentMember: member("zoe-key", "Zoe"),
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

function rosterSection(): HTMLElement | null {
  return container.querySelector<HTMLElement>(
    'section[aria-labelledby="working-alongside-title"]',
  );
}

describe("ProjectDetail — working-alongside roster", () => {
  it("lists claimers and completers alphabetically, linking to each member", () => {
    const recent = Date.now() - 24 * 60 * 60 * 1000; // 1 day — 'fresh'
    mockState.projectTasks = [
      task("t1", { status: "claimed", assignedTo: "zoe-key", claimedAt: recent }),
      task("t2", {
        status: "completed",
        completedBy: "amy-key",
        completedAt: recent,
      }),
      task("t3", {
        status: "awaiting_confirmation",
        assignedTo: "mona-key",
        completedBy: "mona-key",
        claimedAt: recent,
      }),
    ];
    render();
    const section = rosterSection();
    expect(section).not.toBeNull();
    const names = Array.from(section!.querySelectorAll("a")).map((a) =>
      (a.textContent ?? "").trim(),
    );
    expect(names).toEqual(["Amy", "Mona", "Zoe"]);
    expect(
      section!.querySelector('a[href="/member/amy-key"]'),
    ).not.toBeNull();
  });

  it("renders no roster card when no task has hands on it", () => {
    mockState.projectTasks = [task("t1", { status: "open" })];
    render();
    expect(rosterSection()).toBeNull();
    expect(container.textContent ?? "").not.toContain("Working alongside");
  });

  it("does not list the organizer unless they hold a task", () => {
    const recent = Date.now() - 24 * 60 * 60 * 1000;
    mockState.projectTasks = [
      task("t1", { status: "claimed", assignedTo: "zoe-key", claimedAt: recent }),
    ];
    render();
    const section = rosterSection();
    expect(section).not.toBeNull();
    // "Org" appears in the overview ("Organized by"), but not in the roster.
    expect(section!.querySelector('a[href="/member/organizer-key"]')).toBeNull();

    // Now give the organizer a completed task — they join the roster.
    mockState.projectTasks = [
      task("t1", { status: "claimed", assignedTo: "zoe-key", claimedAt: recent }),
      task("t2", {
        status: "completed",
        completedBy: organizerKey,
        completedAt: recent,
      }),
    ];
    act(() => {
      root.render(
        <MemoryRouter initialEntries={["/project/proj-1"]}>
          <Routes>
            <Route path="/project/:id" element={<ProjectDetailPage />} />
          </Routes>
        </MemoryRouter>,
      );
    });
    expect(
      rosterSection()!.querySelector('a[href="/member/organizer-key"]'),
    ).not.toBeNull();
  });

  it("omits a blocked member from the roster", () => {
    const recent = Date.now() - 24 * 60 * 60 * 1000;
    mockState.projectTasks = [
      task("t1", { status: "claimed", assignedTo: "zoe-key", claimedAt: recent }),
      task("t2", {
        status: "completed",
        completedBy: "amy-key",
        completedAt: recent,
      }),
    ];
    mockState.blockedKeys = new Set(["amy-key"]);
    render();
    const section = rosterSection();
    expect(section).not.toBeNull();
    const names = Array.from(section!.querySelectorAll("a")).map((a) =>
      (a.textContent ?? "").trim(),
    );
    expect(names).toEqual(["Zoe"]);
  });
});
