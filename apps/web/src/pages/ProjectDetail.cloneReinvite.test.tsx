/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cloneMock, issueForCloneMock, logActivityMock, showToastMock } =
  vi.hoisted(() => ({
    cloneMock: vi.fn(async () => ({ id: "clone-1", title: "Copy" })),
    issueForCloneMock: vi.fn(
      async (input: { inviteeKeys: readonly string[] }) => ({
        sent: [...input.inviteeKeys],
        failed: [] as string[],
      }),
    ),
    logActivityMock: vi.fn(async () => undefined),
    showToastMock: vi.fn(),
  }));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock, dismissToast: vi.fn(), toast: null }),
}));
vi.mock("dexie-react-hooks", () => ({ useLiveQuery: () => [] }));
vi.mock("@/db/secrets", () => ({ getSecretKey: vi.fn(async () => "secret") }));
vi.mock("@/db/coorgInvitations", () => ({
  issueCoOrganizerInvitation: vi.fn(),
  issueInvitationsForClone: issueForCloneMock,
  revokeCoOrganizerInvitation: vi.fn(),
}));
vi.mock("@/db/projects", () => ({
  isOrganizer: (p: Project, key: string) =>
    p.organizerKey === key || p.coOrganizerKeys.includes(key),
  canClaimTask: () => true,
  cloneProject: cloneMock,
  logActivity: logActivityMock,
  listActivityForProject: vi.fn(async () => []),
  listAnnouncements: vi.fn(async () => []),
  addProjectTask: vi.fn(),
  archiveProject: vi.fn(),
  bulkAddTasks: vi.fn(),
  claimProjectTask: vi.fn(),
  completeProject: vi.fn(),
  confirmProjectTaskCompletion: vi.fn(),
  editProjectTask: vi.fn(),
  handoffOrganizer: vi.fn(),
  launchProject: vi.fn(),
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
const PRIMARY = "primary-key";
const COORG_A = "coorg-a";
const COORG_B = "coorg-b";

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

function project(over: Partial<Project> = {}): Project {
  return {
    id: "proj-1",
    title: "Community Fridge",
    description: "",
    category: "infrastructure",
    organizerKey: PRIMARY,
    coOrganizerKeys: [COORG_A, COORG_B],
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
    ...over,
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
    adoptionQuietDays: number;
    proposalDeliberationDays: number;
  };
  exchanges: unknown[];
  proposals: unknown[];
  lockState: "unprotected" | "locked" | "unlocked";
  coorgInvitations: unknown[];
  coorgInvitationResponses: unknown[];
  coorgInvitationRevocations: unknown[];
  blockedKeys: Set<string>;
  taskComments: unknown[];
  events: unknown[];
  eventCancellations: unknown[];
}

let mockState: MockState;

function freshState(): MockState {
  return {
    // The clone target is present so the post-submit navigate(`/project/
    // clone-1`) lands on a real project rather than the not-found branch.
    projects: [project(), project({ id: "clone-1", title: "Copy", coOrganizerKeys: [] })],
    projectTasks: [],
    members: [
      member(PRIMARY, "Primary"),
      member(COORG_A, "Aya"),
      member(COORG_B, "Bo"),
    ],
    currentMember: member(PRIMARY, "Primary"),
    nodeId,
    nodeConfig: {
      taskCheckInDays: 7,
      taskNeedsHelpDays: 14,
      taskCheckInGraceDays: 3,
      adoptionQuietDays: 60,
      proposalDeliberationDays: 3,
    },
    exchanges: [],
    proposals: [],
    lockState: "unprotected",
    coorgInvitations: [],
    coorgInvitationResponses: [],
    coorgInvitationRevocations: [],
    blockedKeys: new Set<string>(),
    taskComments: [],
    events: [],
    eventCancellations: [],
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = freshState();
  cloneMock.mockClear();
  issueForCloneMock.mockClear();
  logActivityMock.mockClear();
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

async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
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

// Clone moved from an inline disclosure toggle to a header kebab
// item that opens a focused dialog. Open the kebab, then the item.
function openClone() {
  const trigger = container.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="menu"]',
  );
  if (!trigger) throw new Error("project header kebab not found");
  act(() => {
    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  clickButton("Clone project");
}

function checkbox(name: string): HTMLInputElement {
  const el = container.querySelector(
    `input[aria-label="Invite ${name} to co-organize the new project"]`,
  );
  if (!el) throw new Error(`Checkbox not found for ${name}`);
  return el as HTMLInputElement;
}

describe("ProjectDetail — clone re-invitations", () => {
  it("pre-checks every source co-organizer (self absent) and invites only the still-checked ones", async () => {
    render();
    openClone();
    // The checklist appears with both co-organizers, pre-checked; the
    // cloner (primary) is not a candidate to invite themselves.
    expect(container.textContent).toContain("Invite co-organizers again?");
    expect(checkbox("Aya").checked).toBe(true);
    expect(checkbox("Bo").checked).toBe(true);

    // Uncheck Bo (a real click toggles the controlled checkbox and
    // fires React's onChange), then create the clone.
    act(() => {
      checkbox("Bo").click();
    });
    expect(checkbox("Bo").checked).toBe(false);
    clickButton("Create clone");
    await flush();

    expect(cloneMock).toHaveBeenCalledTimes(1);
    expect(issueForCloneMock).toHaveBeenCalledTimes(1);
    expect(issueForCloneMock.mock.calls[0][0]).toMatchObject({
      projectId: "clone-1",
      inviterKey: PRIMARY,
      inviteeKeys: [COORG_A],
    });
    // One activity row per sent invitation, on the clone.
    expect(logActivityMock).toHaveBeenCalledWith(
      "clone-1",
      "coorganizer_invited",
      PRIMARY,
      { inviteeKey: COORG_A },
      nodeId,
    );
  });

  it("stops before cloning when the session is locked and boxes are checked", async () => {
    mockState.lockState = "locked";
    render();
    openClone();
    clickButton("Create clone");
    await flush();
    expect(cloneMock).not.toHaveBeenCalled();
    expect(issueForCloneMock).not.toHaveBeenCalled();
    expect(showToastMock).toHaveBeenCalled();
  });

  it("renders the plain form (no checklist) when the source has no co-organizers", () => {
    mockState.projects = [project({ coOrganizerKeys: [] })];
    render();
    openClone();
    expect(container.textContent).not.toContain("Invite co-organizers again?");
  });

  it("lists the source primary with the neutral chip when a co-organizer clones", () => {
    mockState.currentMember = member(COORG_A, "Aya");
    render();
    openClone();
    // The source primary is a candidate now, tagged as having organized
    // the original; Aya (the cloner) is absent.
    expect(checkbox("Primary").checked).toBe(true);
    expect(checkbox("Bo").checked).toBe(true);
    expect(container.textContent).toContain("organized the original");
  });
});
