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

const {
  issueMock,
  revokeMock,
  logActivityMock,
  getSecretKeyMock,
  showToastMock,
  reorderMock,
} = vi.hoisted(() => ({
  issueMock: vi.fn(async (_opts: unknown) => ({ id: "inv-new" })),
  revokeMock: vi.fn(async (_opts: unknown) => ({ id: "rev-1" })),
  logActivityMock: vi.fn(async () => undefined),
  getSecretKeyMock: vi.fn(async () => "secret"),
  showToastMock: vi.fn(),
  reorderMock: vi.fn(async (_opts: unknown) => undefined),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock, dismissToast: vi.fn(), toast: null }),
}));
// useLiveQuery backs AnnouncementSection / HistoryTimeline — return an
// empty array so those render nothing.
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: () => [],
}));
vi.mock("@/db/coorgInvitations", () => ({
  issueCoOrganizerInvitation: issueMock,
  revokeCoOrganizerInvitation: revokeMock,
}));
vi.mock("@/db/secrets", () => ({ getSecretKey: getSecretKeyMock }));
vi.mock("@/db/projects", () => ({
  isOrganizer: (p: Project, key: string) =>
    p.organizerKey === key || p.coOrganizerKeys.includes(key),
  canClaimTask: () => true,
  logActivity: logActivityMock,
  // Names referenced at module scope by ProjectDetail's imports.
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
  reorderProjectTask: reorderMock,
  resumeProject: vi.fn(),
  unarchiveProject: vi.fn(),
  unclaimProjectTask: vi.fn(),
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
    checkInAcknowledgedAt: null,
    ...overrides,
  };
}

const nodeId = "node_test";
const organizerKey = "organizer-key";
const inviteeKey = "invitee-key";

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

function pendingInvitation(): CoOrganizerInvitation {
  return {
    id: "inv-1",
    projectId: "proj-1",
    inviterKey: organizerKey,
    inviteeKey,
    createdAt: 1000,
    expiresAt: Date.now() + 1_000_000,
    nodeId,
    signature: "sig",
  };
}

interface MockState {
  projects: Project[];
  projectTasks: unknown[];
  members: Member[];
  currentMember: Member | null;
  nodeId: string;
  nodeConfig: undefined;
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
    projects: [project()],
    projectTasks: [],
    members: [member(organizerKey, "Organizer"), member(inviteeKey, "Bob Invitee")],
    currentMember: member(organizerKey, "Organizer"),
    nodeId,
    nodeConfig: undefined,
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
  issueMock.mockClear();
  revokeMock.mockClear();
  logActivityMock.mockClear();
  showToastMock.mockClear();
  reorderMock.mockClear();
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

describe("ProjectDetail — co-organizer invitations (organizer)", () => {
  it("shows the invite affordance and sends an invitation", async () => {
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("Send invitation");
    // The federation-timing copy is present.
    expect(text).toContain("next sync");

    const select = container.querySelector(
      "#coorg-invite-select",
    ) as HTMLSelectElement;
    act(() => {
      select.value = inviteeKey;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    clickButton("Send invitation");
    await flush();

    expect(issueMock).toHaveBeenCalledTimes(1);
    expect(issueMock.mock.calls[0][0]).toMatchObject({
      projectId: "proj-1",
      inviterKey: organizerKey,
      inviteeKey,
      nodeId,
    });
    expect(logActivityMock).toHaveBeenCalledWith(
      "proj-1",
      "coorganizer_invited",
      organizerKey,
      expect.any(Object),
      nodeId,
    );
  });

  it("lists a pending invitation and revokes it after confirm", async () => {
    mockState.coorgInvitations = [pendingInvitation()];
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("Pending invitations");
    expect(text).toContain("Bob Invitee");

    clickButton("Revoke");
    // ConfirmDialog opens; confirm with the Revoke confirm button.
    const revokeButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) => (b.textContent ?? "").trim() === "Revoke",
    );
    act(() => {
      revokeButtons[revokeButtons.length - 1].dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    await flush();

    expect(revokeMock).toHaveBeenCalledTimes(1);
    expect(revokeMock.mock.calls[0][0]).toMatchObject({
      invitationId: "inv-1",
      nodeId,
    });
    expect(logActivityMock).toHaveBeenCalledWith(
      "proj-1",
      "coorganizer_revoked",
      organizerKey,
      expect.any(Object),
      nodeId,
    );
  });

  it("shows a declined invitation under Past invitations", () => {
    const inv = pendingInvitation();
    mockState.coorgInvitations = [inv];
    mockState.coorgInvitationResponses = [
      {
        id: "resp-1",
        invitationId: "inv-1",
        inviteeKey,
        decision: "decline",
        decidedAt: Date.now() - 1000,
        nodeId,
        signature: "sig",
      },
    ];
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("Past invitations");
    expect(text).toContain("declined");
  });
});

describe("ProjectDetail — reorder authority (co-organizer)", () => {
  it("co-organizer can reorder tasks via Move buttons", async () => {
    const p = project();
    p.coOrganizerKeys = [inviteeKey];
    mockState.projects = [p];
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    // Current member is the co-organizer (not the primary).
    mockState.currentMember = member(inviteeKey, "Bob Invitee");
    render();

    const moveDown = container.querySelector(
      "[aria-label=\"Move First down\"]",
    ) as HTMLButtonElement | null;
    expect(moveDown).not.toBeNull();
    act(() => {
      moveDown!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();

    expect(reorderMock).toHaveBeenCalledTimes(1);
    expect(reorderMock.mock.calls[0][0]).toMatchObject({
      taskId: "t1",
      organizerKey: inviteeKey,
      beforeId: "t2",
      afterId: null,
    });
  });

  it("non-organizer non-co-organizer non-claimant sees no Move buttons", () => {
    const otherKey = "other-key";
    mockState.members = [
      member(organizerKey, "Organizer"),
      member(otherKey, "Random Member"),
    ];
    mockState.currentMember = member(otherKey, "Random Member");
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    render();

    const moveUps = container.querySelectorAll(
      "[aria-label^=\"Move \"]",
    );
    expect(moveUps.length).toBe(0);
  });
});
