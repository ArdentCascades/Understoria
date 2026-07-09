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
//
// Screen-real-estate reflow suite for the project detail page.
//
// Locks the four ordering/disclosure invariants:
//   1. Mobile reading order (WCAG 2.4.3): the rail's primary group
//      (progress, state banners) precedes the task list in DOM order,
//      and the deferred meta (sparkline + created/area/deadline/
//      contributors dl + Working-alongside roster) FOLLOWS the main
//      column. Two render sites, never CSS `order` — same pattern
//      (and the same compareDocumentPosition assertions) as
//      Board.readingOrder.test.tsx.
//   2. AddTaskForm is collapsed behind a "+ Add task" disclosure;
//      expanding focuses the first field.
//   3. The announcement compose form is collapsed behind a "Write an
//      update" disclosure while existing announcement cards stay
//      visible; the Updates section renders after the task list.
//   4. Pause + Clone are header-kebab items that each open a focused
//      dialog; no standalone organizer-controls card, no disclosure.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { listAnnouncementsMock } = vi.hoisted(() => ({
  listAnnouncementsMock: vi.fn(async (): Promise<unknown[]> => []),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), toast: null }),
}));
vi.mock("@/db/secrets", () => ({ getSecretKey: vi.fn(async () => "secret") }));
vi.mock("@/db/coorgInvitations", () => ({
  issueCoOrganizerInvitation: vi.fn(),
  issueInvitationsForClone: vi.fn(),
  revokeCoOrganizerInvitation: vi.fn(),
}));
// NOTE: dexie-react-hooks is NOT mocked — the real useLiveQuery drives
// the mocked listAnnouncements below (same approach as the workDays
// suite), so announcement cards can be seeded per test.
vi.mock("@/db/projects", () => ({
  isOrganizer: (p: Project, key: string) =>
    p.organizerKey === key || p.coOrganizerKeys.includes(key),
  canClaimTask: () => true,
  logActivity: vi.fn(async () => undefined),
  listActivityForProject: vi.fn(async () => []),
  listAnnouncements: listAnnouncementsMock,
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
const viewerKey = "viewer-key";
const helperKey = "helper-key";

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
    title: "Garden Build",
    description: "A shared garden.",
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
    ...over,
  };
}

function task(id: string, over: Partial<ProjectTask> = {}): ProjectTask {
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

function freshState(over: Partial<MockState> = {}): MockState {
  return {
    projects: [project()],
    projectTasks: [task("t1"), task("t2"), task("t3")],
    members: [
      member(organizerKey, "Org"),
      member(viewerKey, "Viewer"),
      member(helperKey, "Helper"),
    ],
    currentMember: member(viewerKey, "Viewer"),
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
    ...over,
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = freshState();
  listAnnouncementsMock.mockClear();
  listAnnouncementsMock.mockImplementation(async () => []);
  container = document.createElement("div");
  document.body.appendChild(container);
  // jsdom doesn't implement scrollIntoView; some effects call it.
  Element.prototype.scrollIntoView = vi.fn() as unknown as (
    arg?: boolean | ScrollIntoViewOptions,
  ) => void;
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

/** Returns true iff `before` precedes `after` in document order. */
function precedes(before: Element, after: Element): boolean {
  // Node.DOCUMENT_POSITION_FOLLOWING === 4: `after` follows `before`.
  return (
    (before.compareDocumentPosition(after) &
      Node.DOCUMENT_POSITION_FOLLOWING) !==
    0
  );
}

describe("ProjectDetail — mobile reading order (WCAG 2.4.3)", () => {
  it("progress + state banner precede tasks; sparkline/dl meta and roster follow the main column", async () => {
    // Paused with a note so a state banner renders; one claimed task so
    // the Working-alongside roster renders.
    mockState.projects = [
      project({ status: "paused", pauseNote: "Back in two weeks" }),
    ];
    mockState.projectTasks = [
      task("t1", { status: "claimed", assignedTo: helperKey }),
      task("t2"),
      task("t3"),
    ];
    render();
    await flush();

    const progress = container.querySelector('[role="progressbar"]');
    const firstTask = container.querySelector("#task-t1");
    expect(progress).not.toBeNull();
    expect(firstTask).not.toBeNull();

    // The paused banner (a top-group state banner) precedes the tasks.
    const pausedBanner = Array.from(container.querySelectorAll("p")).find(
      (p) => (p.textContent ?? "").includes("Back in two weeks"),
    );
    expect(pausedBanner).not.toBeNull();
    expect(precedes(pausedBanner!, firstTask!)).toBe(true);
    expect(precedes(progress!, firstTask!)).toBe(true);

    // Both copies of the meta dl render in jsdom (no viewport): the
    // desktop copy inside the rail `aside`, the mobile copy after the
    // main column. The MOBILE copy must FOLLOW the task list.
    const dls = container.querySelectorAll("dl");
    expect(dls.length).toBe(2);
    const desktopDl = dls[0]!;
    const mobileDl = dls[1]!;
    expect(desktopDl.closest("aside")).not.toBeNull();
    expect(mobileDl.closest("aside")).toBeNull();
    expect(precedes(firstTask!, mobileDl)).toBe(true);
    // The desktop copy is hidden below lg; the mobile copy hidden at lg+.
    expect(desktopDl.closest(".hidden.lg\\:block")).not.toBeNull();
    expect(mobileDl.closest(".lg\\:hidden")).not.toBeNull();

    // Working-alongside roster: desktop copy in the rail, mobile copy
    // (distinct heading id — no duplicate ids) after the tasks.
    const mobileRoster = container.querySelector(
      'section[aria-labelledby="working-alongside-title-mobile"]',
    );
    expect(mobileRoster).not.toBeNull();
    expect(mobileRoster!.closest("aside")).toBeNull();
    expect(precedes(firstTask!, mobileRoster!)).toBe(true);
    expect(
      container.querySelector(
        'section[aria-labelledby="working-alongside-title"]',
      )!.closest("aside"),
    ).not.toBeNull();
  });

  it("tasks precede the Updates (announcements) section in DOM order", async () => {
    listAnnouncementsMock.mockImplementation(async () => [
      {
        id: "a1",
        projectId: "proj-1",
        type: "announcement",
        actorKey: organizerKey,
        createdAt: 0,
        data: { body: "Fridge is live" },
        nodeId,
      },
    ]);
    render();
    await flush();

    const firstTask = container.querySelector("#task-t1");
    const updatesHeading = Array.from(container.querySelectorAll("h2")).find(
      (h) => (h.textContent ?? "").trim() === "Updates",
    );
    expect(firstTask).not.toBeNull();
    expect(updatesHeading).not.toBeNull();
    expect(precedes(firstTask!, updatesHeading!)).toBe(true);
  });

  it("renders no `order-*` Tailwind classes anywhere in the tree", async () => {
    render();
    await flush();
    expect(container.querySelectorAll('[class*="order-"]').length).toBe(0);
  });
});

describe("ProjectDetail — AddTaskForm disclosure", () => {
  beforeEach(() => {
    mockState.currentMember = member(organizerKey, "Org");
  });

  it("hides the 6-field form until '+ Add task' is clicked, then focuses the first field", async () => {
    render();
    await flush();

    // Collapsed: the disclosure button renders, the form does not.
    expect(container.textContent).not.toContain("Add a task");
    expect(
      Array.from(container.querySelectorAll("button")).some(
        (b) => (b.textContent ?? "").trim() === "+ Add task",
      ),
    ).toBe(true);

    clickButton("+ Add task");

    // Expanded: the form heading renders and focus sits in the title
    // input (the form's first field).
    const heading = Array.from(container.querySelectorAll("h2")).find(
      (h) => (h.textContent ?? "").trim() === "Add a task",
    );
    expect(heading).not.toBeNull();
    const section = heading!.closest("section");
    const titleInput = section!.querySelector("input");
    expect(titleInput).not.toBeNull();
    expect(document.activeElement).toBe(titleInput);
  });
});

describe("ProjectDetail — announcement compose disclosure", () => {
  beforeEach(() => {
    mockState.currentMember = member(organizerKey, "Org");
  });

  it("collapses the compose form while existing announcement cards stay visible", async () => {
    listAnnouncementsMock.mockImplementation(async () => [
      {
        id: "a1",
        projectId: "proj-1",
        type: "announcement",
        actorKey: organizerKey,
        createdAt: 0,
        data: { body: "Fridge is live" },
        nodeId,
      },
    ]);
    render();
    await flush();

    // The card content is visible without touching the disclosure.
    expect(container.textContent).toContain("Fridge is live");

    // The compose textarea sits inside a CLOSED <details>.
    const textarea = container.querySelector("#project-announcement-input");
    expect(textarea).not.toBeNull();
    const disclosure = textarea!.closest("details");
    expect(disclosure).not.toBeNull();
    expect(disclosure!.open).toBe(false);
    const summary = disclosure!.querySelector("summary");
    expect((summary!.textContent ?? "").trim()).toBe("Write an update");

    // Opening the disclosure reveals the form.
    act(() => {
      disclosure!.open = true;
    });
    expect(disclosure!.open).toBe(true);
    expect(disclosure!.querySelector("button[type='submit']")).not.toBeNull();
  });
});

describe("ProjectDetail — Pause/Clone are header-kebab items", () => {
  beforeEach(() => {
    mockState.currentMember = member(organizerKey, "Org");
  });

  function openKebab() {
    const trigger = container.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="menu"]',
    );
    if (!trigger) throw new Error("project header kebab not found");
    act(() => {
      trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function menuItem(label: string): HTMLButtonElement | undefined {
    return Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'),
    ).find((b) => (b.textContent ?? "").trim() === label);
  }

  it("offers Pause project and Clone project in the kebab — no disclosure, no standalone card", async () => {
    render();
    await flush();

    // The former "Manage project" disclosure is gone entirely.
    expect(
      Array.from(container.querySelectorAll("details")).some(
        (d) =>
          (d.querySelector("summary")?.textContent ?? "").trim() ===
          "Manage project",
      ),
    ).toBe(false);
    // Nothing renders inline until the kebab is opened.
    expect(menuItem("Pause project")).toBeUndefined();

    openKebab();
    expect(menuItem("Pause project")).not.toBeUndefined();
    expect(menuItem("Clone project")).not.toBeUndefined();

    // Selecting Pause opens a focused dialog with the note input.
    clickButton("Pause project");
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.querySelector("input")).not.toBeNull();
  });

  it("offers Clone but not Pause on a completed project", async () => {
    mockState.projects = [
      project({ status: "completed", completedAt: 1000 }),
    ];
    render();
    await flush();

    openKebab();
    expect(menuItem("Clone project")).not.toBeUndefined();
    // Pause is only for active projects.
    expect(menuItem("Pause project")).toBeUndefined();
  });
});
