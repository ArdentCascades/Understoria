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
/**
 * Tests for the task-exchange-honesty work: pre-confirm dialog with
 * the consequence-naming body, claimer-side awaiting_confirmation
 * narrative (intro + optional auto-confirm safety-net line), and the
 * release path for completed-but-unconfirmed tasks. Mirrors the
 * harness in ProjectDetail.coorg.test.tsx so the mocks line up
 * one-for-one.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  confirmMock,
  unclaimMock,
  showToastMock,
} = vi.hoisted(() => ({
  confirmMock: vi.fn(async (_taskId: string) => ({})),
  unclaimMock: vi.fn(async (_taskId: string) => ({})),
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
  canClaimTask: () => true,
  logActivity: vi.fn(async () => undefined),
  addProjectTask: vi.fn(),
  archiveProject: vi.fn(),
  bulkAddTasks: vi.fn(),
  claimProjectTask: vi.fn(),
  cloneProject: vi.fn(),
  completeProject: vi.fn(),
  confirmProjectTaskCompletion: confirmMock,
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
  unclaimProjectTask: unclaimMock,
}));

import "@/i18n";
import ProjectDetailPage from "./ProjectDetail";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Member,
  Project,
  ProjectTask,
} from "@/types";

const nodeId = "node_test";
const organizerKey = "organizer-key";
const claimerKey = "claimer-key";
const thirdKey = "third-key";

function makeTask(overrides: Partial<ProjectTask> = {}): ProjectTask {
  return {
    id: "task-1",
    projectId: "proj-1",
    title: "Haul the soil",
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
    checkInAcknowledgedAt: null,
    ...overrides,
  };
}

function makeMember(publicKey: string, displayName: string): Member {
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

function makeProject(): Project {
  return {
    id: "proj-1",
    title: "Community Fridge",
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
  coorgInvitations: CoOrganizerInvitation[];
  coorgInvitationResponses: CoOrganizerInvitationResponse[];
  coorgInvitationRevocations: CoOrganizerInvitationRevocation[];
  blockedKeys: Set<string>;
  taskComments: unknown[];
}

let mockState: MockState;

function freshState(): MockState {
  return {
    projects: [makeProject()],
    projectTasks: [],
    members: [
      makeMember(organizerKey, "Olive Organizer"),
      makeMember(claimerKey, "Cleo Claimer"),
      makeMember(thirdKey, "Theo Third"),
    ],
    currentMember: makeMember(organizerKey, "Olive Organizer"),
    nodeId,
    nodeConfig: {
      taskCheckInDays: 7,
      taskNeedsHelpDays: 14,
      taskCheckInGraceDays: 2,
      autoConfirmHours: 0,
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
  confirmMock.mockClear();
  unclaimMock.mockClear();
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

function clickButton(label: string) {
  const btn = Array.from(container.querySelectorAll("button")).find(
    (b) => (b.textContent ?? "").trim() === label,
  );
  if (!btn) throw new Error(`Button not found: ${label}`);
  act(() => {
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("ProjectDetail — confirm dialog (organizer side)", () => {
  function awaitingTask() {
    return makeTask({
      status: "awaiting_confirmation",
      assignedTo: claimerKey,
      completedBy: claimerKey,
      claimedAt: 1000,
      completedAt: 2000,
    });
  }

  it("clicking Confirm completion opens the dialog without firing the action", () => {
    mockState.projectTasks = [awaitingTask()];
    render();
    clickButton("Confirm completion");
    const text = container.textContent ?? "";
    // Dialog title + the consequence-naming body line.
    expect(text).toContain("Confirm this task?");
    expect(text).toContain("hours move to Cleo Claimer");
    expect(text).toContain("move out of your balance");
    expect(text).toContain("signing as the helped party");
    // Action MUST NOT have fired yet — informed consent.
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it("cancelling the dialog does not fire confirmProjectTaskCompletion", async () => {
    mockState.projectTasks = [awaitingTask()];
    render();
    clickButton("Confirm completion");
    clickButton("Cancel");
    await flush();
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it("Confirm and sign fires confirmProjectTaskCompletion exactly once", async () => {
    mockState.projectTasks = [awaitingTask()];
    render();
    clickButton("Confirm completion");
    clickButton("Confirm and sign");
    await flush();
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(confirmMock.mock.calls[0]).toEqual([
      "task-1",
      organizerKey,
      nodeId,
      "",
    ]);
  });
});

describe("ProjectDetail — claimer-side awaiting narrative", () => {
  function awaitingTask() {
    return makeTask({
      status: "awaiting_confirmation",
      assignedTo: claimerKey,
      completedBy: claimerKey,
      estimatedHours: 2,
    });
  }

  it("renders the plain-story intro to the claimer", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = makeMember(claimerKey, "Cleo Claimer");
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("You've marked this done");
    expect(text).toContain("credit move then");
  });

  it("appends the auto-confirm safety-net line when autoConfirmHours > 0", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = makeMember(claimerKey, "Cleo Claimer");
    // 72h → ceil(72/24) = 3 days.
    mockState.nodeConfig = { ...mockState.nodeConfig, autoConfirmHours: 72 };
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("If no one gets to it");
    expect(text).toContain("3 days");
  });

  it("omits the safety-net line when autoConfirmHours is 0", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = makeMember(claimerKey, "Cleo Claimer");
    // Default mockState has autoConfirmHours: 0; assert that explicitly.
    mockState.nodeConfig = { ...mockState.nodeConfig, autoConfirmHours: 0 };
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("You've marked this done");
    expect(text).not.toContain("If no one gets to it");
  });

  it("does NOT render the claimer narrative to the organizer", () => {
    mockState.projectTasks = [awaitingTask()];
    // currentMember is organizer (default)
    render();
    const text = container.textContent ?? "";
    expect(text).not.toContain("You've marked this done");
  });

  it("does NOT render the claimer narrative to a third party", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = makeMember(thirdKey, "Theo Third");
    render();
    const text = container.textContent ?? "";
    expect(text).not.toContain("You've marked this done");
    // Third parties still see the short non-organizer line.
    expect(text).toContain("Waiting on organizer to confirm");
  });
});

describe("ProjectDetail — release path for awaiting_confirmation", () => {
  function awaitingTask() {
    return makeTask({
      status: "awaiting_confirmation",
      assignedTo: claimerKey,
      completedBy: claimerKey,
    });
  }

  it("offers the completer a neutral 'step back' release affordance", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = makeMember(claimerKey, "Cleo Claimer");
    render();
    const text = container.textContent ?? "";
    // The button label uses the "step back" framing, not "abandon"
    // or "give up" — neutral by design.
    expect(text).toContain("Step back from this task");
    expect(text).not.toMatch(/abandon|gave up|give up/i);
  });

  it("clicking step-back fires unclaimProjectTask", async () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = makeMember(claimerKey, "Cleo Claimer");
    render();
    clickButton("Step back from this task");
    await flush();
    expect(unclaimMock).toHaveBeenCalledTimes(1);
    expect(unclaimMock.mock.calls[0]).toEqual(["task-1", claimerKey]);
  });

  it("does NOT offer step-back to non-completers (organizer or third party)", () => {
    mockState.projectTasks = [awaitingTask()];
    // organizer view
    render();
    let text = container.textContent ?? "";
    expect(text).not.toContain("Step back from this task");
    // third-party view — re-render
    act(() => {
      root?.unmount();
    });
    container.remove();
    container = document.createElement("div");
    document.body.appendChild(container);
    mockState.currentMember = makeMember(thirdKey, "Theo Third");
    render();
    text = container.textContent ?? "";
    expect(text).not.toContain("Step back from this task");
  });
});
