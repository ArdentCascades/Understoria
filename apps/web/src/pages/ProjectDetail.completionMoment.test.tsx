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
// useLiveQuery backs AnnouncementSection / HistoryTimeline — return an
// empty array so those render nothing but the organizer's update form.
vi.mock("dexie-react-hooks", () => ({ useLiveQuery: () => [] }));
vi.mock("@/db/secrets", () => ({ getSecretKey: vi.fn(async () => "secret") }));
vi.mock("@/db/coorgInvitations", () => ({
  issueCoOrganizerInvitation: vi.fn(),
  revokeCoOrganizerInvitation: vi.fn(),
}));
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

// `@/db/database` is NOT mocked — the completion-moment hook reads and
// writes `celebratedProjectCompletions` through the real settings store,
// backed by fake-indexeddb (src/test/setup.ts). We clear it per test.
import "@/i18n";
import { db, getSetting, SETTING_KEYS } from "@/db/database";
import ProjectDetailPage from "./ProjectDetail";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Exchange,
  Member,
  Project,
  ProjectTask,
} from "@/types";

const nodeId = "node_test";
const organizerKey = "organizer-key";
const helperKey = "helper-key";
const helperName = "Cara Helper";

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

function completedProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj-1",
    title: "Community Fridge",
    description: "",
    category: "infrastructure",
    organizerKey,
    coOrganizerKeys: [],
    status: "completed",
    targetHours: 10,
    contributedHours: 3,
    deadline: null,
    createdAt: 0,
    completedAt: 1_000,
    pauseNote: null,
    locationZone: "",
    tags: [],
    nodeId,
    templateId: null,
    ...overrides,
  };
}

function projectExchange(): Exchange {
  return {
    id: "ex-1",
    postId: "project:proj-1/task:t1",
    helperKey,
    helpedKey: organizerKey,
    hoursExchanged: 3,
    helperSignature: "h",
    helpedSignature: "p",
    completedAt: 900,
    category: "other",
    nodeId,
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
  exchanges: Exchange[];
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
    projects: [completedProject()],
    projectTasks: [],
    members: [member(organizerKey, "Organizer"), member(helperKey, helperName)],
    currentMember: member(organizerKey, "Organizer"),
    nodeId,
    nodeConfig: {
      taskCheckInDays: 7,
      taskNeedsHelpDays: 14,
      taskCheckInGraceDays: 3,
    },
    exchanges: [projectExchange()],
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

beforeEach(async () => {
  mockState = freshState();
  await db.settings.clear();
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

// Let React effects and the fake-indexeddb read/write settle.
async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
}

function pop(): HTMLElement | null {
  return container.querySelector(".animate-milestone-pop");
}

describe("ProjectDetail — completion moment", () => {
  it("pops once with the aggregate sentence and records the project as celebrated", async () => {
    render();
    await flush();

    const card = pop();
    expect(card).not.toBeNull();
    expect(card!.textContent ?? "").toContain("Complete, together.");
    expect(card!.textContent ?? "").toContain("1 member moved");
    expect(card!.textContent ?? "").toContain("to carry this to the finish");

    const stored = await getSetting(SETTING_KEYS.celebratedProjectCompletions);
    expect(stored ? (JSON.parse(stored) as string[]) : []).toContain("proj-1");
  });

  it("on a later visit shows no pop but keeps the permanent banner line", async () => {
    render();
    await flush();
    expect(pop()).not.toBeNull();

    act(() => root.unmount());
    render();
    await flush();

    expect(pop()).toBeNull();
    // The quiet permanent line still states the aggregate.
    expect(container.textContent ?? "").toContain("to carry this to the finish");
  });

  it("never shows a contributor's name inside the moment card (aggregate-only)", async () => {
    render();
    await flush();
    const card = pop();
    expect(card).not.toBeNull();
    expect(card!.textContent ?? "").not.toContain(helperName);
  });

  it("shows the organizer a nudge into the announcement box", async () => {
    render();
    await flush();
    const card = pop();
    expect(card!.textContent ?? "").toContain("Write an update");
    // The CTA target exists for the scroll/focus to land on.
    expect(container.querySelector("#project-announcement-input")).not.toBeNull();
  });

  it("does not show the announcement nudge to a non-organizer viewer", async () => {
    mockState.currentMember = member("someone-else", "Random Member");
    render();
    await flush();
    const card = pop();
    // A regular member still sees the communal moment...
    expect(card).not.toBeNull();
    expect(card!.textContent ?? "").toContain("1 member moved");
    // ...but never the organizer-only thanks affordance.
    expect(card!.textContent ?? "").not.toContain("Write an update");
  });

  it("renders neither pop nor tally when no one moved hours", async () => {
    mockState.exchanges = [];
    render();
    await flush();
    expect(pop()).toBeNull();
    // No "0 members" shame-shaped sentence anywhere.
    expect(container.textContent ?? "").not.toContain("together");
    expect(container.textContent ?? "").not.toContain("moved");
  });

  it("on an archived project shows the permanent line but never pops", async () => {
    mockState.projects = [completedProject({ status: "archived" })];
    render();
    await flush();
    expect(pop()).toBeNull();
    expect(container.textContent ?? "").toContain("to carry this to the finish");
  });
});
