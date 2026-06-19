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
/**
 * Per-task page (`/project/:id/task/:taskId`). Covers the page shell
 * (breadcrumb, not-found guards, header chips, back re-anchor) AND the
 * task BODY actions that moved off the project list when `TaskRow` split
 * into `TaskCard` (list) + `TaskDetailBody` (page): the organizer
 * confirm dialog, the claimer-side awaiting narrative, the release path
 * for awaiting_confirmation, mark-complete recording actual hours, the
 * actual-hours surfacing in narrative/dialog, the shame-free release
 * framing, the fresh-copy action, and the claimer "you'll be reminded"
 * note. (Migrated from ProjectDetail.taskHonesty / .freshcopy /
 * .claimerqol / .reorder when the body left the project page.)
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  claimProjectTaskMock,
  confirmMock,
  unclaimMock,
  markMock,
  showToastMock,
  writeTextMock,
} = vi.hoisted(() => ({
  claimProjectTaskMock: vi.fn(),
  confirmMock: vi.fn(async (_taskId: string) => ({})),
  unclaimMock: vi.fn(async (_taskId: string) => ({})),
  markMock: vi.fn(async (_taskId: string) => ({})),
  showToastMock: vi.fn(),
  writeTextMock: vi.fn(async (_url: string) => undefined),
}));

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
  confirmProjectTaskCompletion: confirmMock,
  editProjectTask: vi.fn(),
  handoffOrganizer: vi.fn(),
  launchProject: vi.fn(),
  listActivityForProject: vi.fn(async () => []),
  listAnnouncements: vi.fn(async () => []),
  markProjectTaskComplete: markMock,
  pauseProject: vi.fn(),
  postAnnouncement: vi.fn(),
  removeCoOrganizer: vi.fn(),
  reorderProjectTask: vi.fn(),
  resumeProject: vi.fn(),
  unarchiveProject: vi.fn(),
  unclaimProjectTask: unclaimMock,
}));

import "@/i18n";
import { addProjectTask } from "@/db/projects";
import TaskDetailPage from "./TaskDetail";
import type { Member, Project, ProjectTask } from "@/types";

const nodeId = "node_test";
const organizerKey = "organizer-key";
const viewerKey = "viewer-key";
const claimerKey = "claimer-key";
const thirdKey = "third-key";

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
    members: [
      member(organizerKey, "Org"),
      member(viewerKey, "Viewer"),
      member(claimerKey, "Cleo Claimer"),
      member(thirdKey, "Theo Third"),
    ],
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
  confirmMock.mockClear();
  unclaimMock.mockClear();
  markMock.mockClear();
  showToastMock.mockClear();
  writeTextMock.mockClear();
  writeTextMock.mockResolvedValue(undefined);
  vi.mocked(addProjectTask).mockReset();
  // Copy link routes through @/lib/share. Force the clipboard path by
  // removing navigator.share (jsdom has no native share sheet anyway)
  // and stubbing navigator.clipboard.writeText so the URL is observable.
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: writeTextMock },
  });
  if ("share" in navigator) {
    delete (navigator as { share?: unknown }).share;
  }
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

function taskMenuTrigger(): HTMLButtonElement {
  const btn = container.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="menu"]',
  );
  if (!btn) throw new Error("task header menu trigger not found");
  return btn;
}

function openTaskMenu() {
  act(() => {
    taskMenuTrigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function menuItemByText(label: string): HTMLButtonElement | undefined {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'),
  ).find((b) => (b.textContent ?? "").trim() === label);
}

function numberInput(): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>(
    'input[type="number"]',
  );
  if (!input) throw new Error("hours input not found");
  return input;
}

function setNumberInput(value: string) {
  const input = numberInput();
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("TaskDetailPage — per-task page", () => {
  it("renders the full task in its project context", () => {
    render("/project/proj-1/task/t2");
    const text = container.textContent ?? "";
    // Task title (in the heading and the row) + its description.
    expect(text).toContain("Second task");
    expect(text).toContain("Lay the irrigation line");
    // Status + hours chips are part of the page header.
    expect(text).toContain("Open");
    expect(text).toContain("2h");
    // The self-contained TaskComments toggle renders verbatim.
    expect(text).toContain("Start a comment thread");
  });

  it("keeps claiming frictionless for a non-organizer on an active project", () => {
    render("/project/proj-1/task/t2");
    // The OPEN task, viewed by a plain member while the project is
    // active, surfaces the one-tap Claim affordance — deep-linkers can
    // claim without bouncing back to the list.
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
    // ...and no task-row chrome leaked through (no claim affordance, no
    // comment thread).
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

describe("TaskDetailPage — confirm dialog (organizer side)", () => {
  function awaitingTask() {
    return task("t1", {
      title: "Haul the soil",
      status: "awaiting_confirmation",
      assignedTo: claimerKey,
      completedBy: claimerKey,
      claimedAt: 1000,
      completedAt: 2000,
    });
  }

  it("clicking Confirm completion opens the dialog without firing the action", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = member(organizerKey, "Olive Organizer");
    render("/project/proj-1/task/t1");
    clickButtonByText("Confirm completion");
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
    mockState.currentMember = member(organizerKey, "Olive Organizer");
    render("/project/proj-1/task/t1");
    clickButtonByText("Confirm completion");
    clickButtonByText("Cancel");
    await flush();
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it("Confirm and sign fires confirmProjectTaskCompletion exactly once", async () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = member(organizerKey, "Olive Organizer");
    render("/project/proj-1/task/t1");
    clickButtonByText("Confirm completion");
    clickButtonByText("Confirm and sign");
    await flush();
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(confirmMock.mock.calls[0]).toEqual([
      "t1",
      organizerKey,
      nodeId,
      "",
    ]);
  });
});

describe("TaskDetailPage — claimer-side awaiting narrative", () => {
  function awaitingTask() {
    return task("t1", {
      title: "Haul the soil",
      status: "awaiting_confirmation",
      assignedTo: claimerKey,
      completedBy: claimerKey,
      estimatedHours: 2,
    });
  }

  it("renders the plain-story intro to the claimer", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    render("/project/proj-1/task/t1");
    const text = container.textContent ?? "";
    expect(text).toContain("You've marked this done");
    expect(text).toContain("credit move then");
  });

  it("appends the auto-confirm safety-net line when autoConfirmHours > 0", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    // 72h → ceil(72/24) = 3 days.
    mockState.nodeConfig = { ...mockState.nodeConfig, autoConfirmHours: 72 };
    render("/project/proj-1/task/t1");
    const text = container.textContent ?? "";
    expect(text).toContain("If no one gets to it");
    expect(text).toContain("3 days");
  });

  it("omits the safety-net line when autoConfirmHours is 0", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    mockState.nodeConfig = { ...mockState.nodeConfig, autoConfirmHours: 0 };
    render("/project/proj-1/task/t1");
    const text = container.textContent ?? "";
    expect(text).toContain("You've marked this done");
    expect(text).not.toContain("If no one gets to it");
  });

  it("does NOT render the claimer narrative to the organizer", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = member(organizerKey, "Olive Organizer");
    render("/project/proj-1/task/t1");
    const text = container.textContent ?? "";
    expect(text).not.toContain("You've marked this done");
  });

  it("does NOT render the claimer narrative to a third party", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = member(thirdKey, "Theo Third");
    render("/project/proj-1/task/t1");
    const text = container.textContent ?? "";
    expect(text).not.toContain("You've marked this done");
    // Third parties still see the short non-organizer line.
    expect(text).toContain("Waiting on organizer to confirm");
  });
});

describe("TaskDetailPage — release path for awaiting_confirmation", () => {
  function awaitingTask() {
    return task("t1", {
      title: "Haul the soil",
      status: "awaiting_confirmation",
      assignedTo: claimerKey,
      completedBy: claimerKey,
    });
  }

  it("offers the completer a neutral 'step back' release affordance", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    render("/project/proj-1/task/t1");
    const text = container.textContent ?? "";
    // The button label uses the "step back" framing, not "abandon"
    // or "give up" — neutral by design.
    expect(text).toContain("Step back from this task");
    expect(text).not.toMatch(/abandon|gave up|give up/i);
  });

  it("clicking step-back fires unclaimProjectTask", async () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    render("/project/proj-1/task/t1");
    clickButtonByText("Step back from this task");
    await flush();
    expect(unclaimMock).toHaveBeenCalledTimes(1);
    expect(unclaimMock.mock.calls[0]).toEqual(["t1", claimerKey]);
  });

  it("does NOT offer step-back to non-completers (organizer or third party)", () => {
    mockState.projectTasks = [awaitingTask()];
    mockState.currentMember = member(organizerKey, "Olive Organizer");
    render("/project/proj-1/task/t1");
    let text = container.textContent ?? "";
    expect(text).not.toContain("Step back from this task");
    // third-party view — re-render
    act(() => {
      root?.unmount();
    });
    container.remove();
    container = document.createElement("div");
    document.body.appendChild(container);
    mockState.currentMember = member(thirdKey, "Theo Third");
    render("/project/proj-1/task/t1");
    text = container.textContent ?? "";
    expect(text).not.toContain("Step back from this task");
  });
});

describe("TaskDetailPage — mark-complete records actual hours", () => {
  function claimedTask() {
    return task("t1", {
      title: "Haul the soil",
      status: "claimed",
      assignedTo: claimerKey,
      claimedAt: 1000,
      estimatedHours: 2,
    });
  }

  it("tapping Mark complete reveals the prefilled hours input without firing the action", () => {
    mockState.projectTasks = [claimedTask()];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    render("/project/proj-1/task/t1");
    expect(container.querySelector('input[type="number"]')).toBeNull();
    clickButtonByText("Mark complete");
    // The action must NOT have fired — the disclosure just opened.
    expect(markMock).not.toHaveBeenCalled();
    // Input is prefilled with the estimate (2h).
    expect(numberInput().value).toBe("2");
    expect(container.textContent ?? "").toContain("Estimated: 2h");
  });

  it("confirming records the stated actual hours", async () => {
    mockState.projectTasks = [claimedTask()];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    render("/project/proj-1/task/t1");
    clickButtonByText("Mark complete");
    setNumberInput("6");
    clickButtonByText("Record 6h and mark complete");
    await flush();
    expect(markMock).toHaveBeenCalledTimes(1);
    expect(markMock.mock.calls[0]).toEqual(["t1", claimerKey, 6]);
  });

  it("keeps the release affordance one-tap (no disclosure)", async () => {
    mockState.projectTasks = [claimedTask()];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    render("/project/proj-1/task/t1");
    clickButtonByText("Release claim");
    await flush();
    expect(unclaimMock).toHaveBeenCalledTimes(1);
    expect(markMock).not.toHaveBeenCalled();
  });
});

describe("TaskDetailPage — actual hours surface in narrative and dialog", () => {
  it("claimer narrative names the actual hours and the estimate when they differ", () => {
    mockState.projectTasks = [
      task("t1", {
        title: "Haul the soil",
        status: "awaiting_confirmation",
        assignedTo: claimerKey,
        completedBy: claimerKey,
        estimatedHours: 2,
        actualHours: 6,
      }),
    ];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    render("/project/proj-1/task/t1");
    const text = container.textContent ?? "";
    expect(text).toContain("your 6h hours of credit move then");
    expect(text).toContain("You recorded 6h for this task (estimated 2h)");
  });

  it("organizer confirm dialog names the actual hours and the estimate note", () => {
    mockState.projectTasks = [
      task("t1", {
        title: "Haul the soil",
        status: "awaiting_confirmation",
        assignedTo: claimerKey,
        completedBy: claimerKey,
        estimatedHours: 2,
        actualHours: 6,
      }),
    ];
    mockState.currentMember = member(organizerKey, "Olive Organizer");
    render("/project/proj-1/task/t1");
    clickButtonByText("Confirm completion");
    const text = container.textContent ?? "";
    expect(text).toContain("6h hours move to Cleo Claimer");
    expect(text).toContain("recorded the actual time: 6h");
    expect(text).toContain("estimated at 2h");
  });
});

describe("TaskDetailPage — shame-free release framing", () => {
  it("renders the muted reassurance line adjacent to the Release button (no confirm dialog)", () => {
    mockState.projectTasks = [
      task("t1", {
        title: "Carry the bins",
        status: "claimed",
        assignedTo: claimerKey,
        claimedAt: Date.now(),
      }),
    ];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    render("/project/proj-1/task/t1");
    const text = container.textContent ?? "";
    // Button label stays short — the long-form reassurance lives
    // adjacent so the affordance stays one-tap.
    expect(text).toContain("Release claim");
    expect(text).toContain(
      "Releasing helps the organizer find another helper",
    );
    expect(text).toContain("no judgment");
  });
});

describe("TaskDetailPage — fresh copy of a completed task", () => {
  function completedTask(overrides: Partial<ProjectTask> = {}): ProjectTask {
    return task("t1", {
      title: "Restock the fridge",
      description: "weekly run",
      category: "food",
      estimatedHours: 2,
      requiredSkills: ["driving"],
      assignedTo: claimerKey,
      status: "completed",
      dependencies: ["dep-x"],
      completedAt: 500,
      completedBy: claimerKey,
      exchangeId: "ex-1",
      claimedAt: 100,
      ...overrides,
    });
  }

  // The fresh-copy affordance now lives inside the header overflow menu
  // (Part 3 migration). It only renders as a menuitem once the menu is
  // open, so each assertion opens the kebab first.
  function freshCopyItem(): HTMLButtonElement | undefined {
    return menuItemByText("Add a fresh copy");
  }

  it("copies the task's fields (dropping dependencies) and toasts on success", async () => {
    mockState.projectTasks = [completedTask()];
    mockState.currentMember = member(organizerKey, "Org");
    vi.mocked(addProjectTask).mockResolvedValue(
      completedTask({ id: "new", status: "open" }),
    );
    render("/project/proj-1/task/t1");
    openTaskMenu();
    const item = freshCopyItem();
    expect(item).toBeDefined();
    act(() => {
      item!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();
    expect(vi.mocked(addProjectTask)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(addProjectTask)).toHaveBeenCalledWith("proj-1", organizerKey, {
      title: "Restock the fridge",
      description: "weekly run",
      category: "food",
      estimatedHours: 2,
      urgency: "low",
      requiredSkills: ["driving"],
      // Dependencies dropped — the original's upstream is done.
      dependencies: [],
    });
    expect(showToastMock).toHaveBeenCalledTimes(1);
    expect(String(showToastMock.mock.calls[0]?.[0] ?? "")).toContain(
      "Restock the fridge",
    );
  });

  it("does not offer the menu item to a non-organizer", () => {
    mockState.projectTasks = [completedTask()];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    render("/project/proj-1/task/t1");
    openTaskMenu();
    expect(freshCopyItem()).toBeUndefined();
  });

  it("does not offer the menu item on a completed or archived project", () => {
    mockState.projectTasks = [completedTask()];
    mockState.currentMember = member(organizerKey, "Org");
    mockState.projects = [project({ status: "completed", completedAt: 900 })];
    render("/project/proj-1/task/t1");
    openTaskMenu();
    expect(freshCopyItem()).toBeUndefined();

    act(() => {
      root.unmount();
    });
    mockState.projects = [project({ status: "archived", completedAt: 900 })];
    render("/project/proj-1/task/t1");
    openTaskMenu();
    expect(freshCopyItem()).toBeUndefined();
  });

  it("fires addProjectTask exactly once and closes the menu on select (guards double-add)", async () => {
    let resolveAdd: (value: ProjectTask) => void = () => {};
    mockState.projectTasks = [completedTask()];
    mockState.currentMember = member(organizerKey, "Org");
    vi.mocked(addProjectTask).mockReturnValue(
      new Promise<ProjectTask>((resolve) => {
        resolveAdd = resolve;
      }),
    );
    render("/project/proj-1/task/t1");
    openTaskMenu();
    const item = freshCopyItem();
    expect(item).toBeDefined();
    act(() => {
      item!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // Selecting closes the menu (the menuitem is gone from the DOM), so a
    // real second click can't fire — the standing guard against a
    // double-add now that the action moved off an inline button.
    expect(freshCopyItem()).toBeUndefined();
    expect(vi.mocked(addProjectTask)).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveAdd(completedTask({ id: "new", status: "open" }));
      await Promise.resolve();
    });
  });
});

describe("TaskDetailPage — header overflow menu (Copy link / Edit)", () => {
  it("renders the kebab trigger with aria-haspopup=menu", () => {
    render("/project/proj-1/task/t2");
    const trigger = taskMenuTrigger();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-label")).toBe("Task actions");
  });

  it("opening the menu shows a Copy link item; an organizer on an OPEN task also sees Edit task", () => {
    mockState.currentMember = member(organizerKey, "Org");
    render("/project/proj-1/task/t2");
    // No inline Edit button outside the menu (it moved into the kebab).
    expect(
      Array.from(container.querySelectorAll("button")).some(
        (b) => (b.textContent ?? "").trim() === "Edit",
      ),
    ).toBe(false);
    openTaskMenu();
    expect(menuItemByText("Copy link")).toBeDefined();
    expect(menuItemByText("Edit")).toBeDefined();
  });

  it("a plain member sees Copy link but NOT Edit task", () => {
    mockState.currentMember = member(viewerKey, "Viewer");
    render("/project/proj-1/task/t2");
    openTaskMenu();
    expect(menuItemByText("Copy link")).toBeDefined();
    expect(menuItemByText("Edit")).toBeUndefined();
  });

  it("selecting Copy link writes the canonical task URL and toasts the confirmation", async () => {
    render("/project/proj-1/task/t2");
    openTaskMenu();
    const item = menuItemByText("Copy link");
    expect(item).toBeDefined();
    act(() => {
      item!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();
    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock).toHaveBeenCalledWith(
      `${window.location.origin}/project/proj-1/task/t2`,
    );
    expect(showToastMock).toHaveBeenCalledWith(
      "Link copied to your clipboard.",
    );
  });
});

describe("TaskDetailPage — claimer 'you'll be reminded' note", () => {
  function blockedClaimedTasks() {
    return [
      task("up1", { title: "Upstream", status: "open", orderIndex: 1000 }),
      task("t1", {
        title: "Downstream",
        orderIndex: 2000,
        dependencies: ["up1"],
        status: "claimed",
        assignedTo: claimerKey,
        claimedAt: 1,
      }),
    ];
  }

  it("renders for the claimant when blocked by an unmet dependency", () => {
    mockState.projectTasks = blockedClaimedTasks();
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    render("/project/proj-1/task/t1");
    expect(container.textContent ?? "").toContain(
      "You'll be reminded when it's ready.",
    );
  });

  it("does NOT render for non-claimants viewing the same task", () => {
    mockState.projectTasks = blockedClaimedTasks();
    mockState.currentMember = member(organizerKey, "Org");
    render("/project/proj-1/task/t1");
    expect(container.textContent ?? "").not.toContain(
      "You'll be reminded when it's ready.",
    );
  });

  it("does NOT render when all dependencies are complete", () => {
    mockState.projectTasks = [
      task("up1", { title: "Upstream", status: "completed", orderIndex: 1000 }),
      task("t1", {
        title: "Downstream",
        orderIndex: 2000,
        dependencies: ["up1"],
        status: "claimed",
        assignedTo: claimerKey,
        claimedAt: 1,
      }),
    ];
    mockState.currentMember = member(claimerKey, "Cleo Claimer");
    render("/project/proj-1/task/t1");
    expect(container.textContent ?? "").not.toContain(
      "You'll be reminded when it's ready.",
    );
  });
});
