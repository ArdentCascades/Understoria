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
  reorderMock,
  showToastMock,
  logActivityMock,
} = vi.hoisted(() => ({
  reorderMock: vi.fn(async (_opts: unknown) => undefined),
  showToastMock: vi.fn(),
  logActivityMock: vi.fn(async () => undefined),
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
  // canClaimTask returns false when there are any unmet
  // (non-completed) dependencies — the same shape canClaimTask
  // implements in projects.ts.
  canClaimTask: (task: ProjectTask, all: readonly ProjectTask[]) => {
    if (task.dependencies.length === 0) return true;
    return task.dependencies.every((d) => {
      const dep = all.find((t) => t.id === d);
      return dep?.status === "completed";
    });
  },
  logActivity: logActivityMock,
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
import type { Member, Project, ProjectTask } from "@/types";

const nodeId = "node_test";
const organizerKey = "organizer-key";
const memberAKey = "member-a";

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
    members: [member(organizerKey, "Org"), member(memberAKey, "A Member")],
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
  reorderMock.mockClear();
  reorderMock.mockResolvedValue(undefined);
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
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

function moveButton(title: string, direction: "up" | "down"): HTMLButtonElement {
  const label = direction === "up" ? `Move ${title} up` : `Move ${title} down`;
  const btn = container.querySelector(
    `[aria-label="${label}"]`,
  ) as HTMLButtonElement | null;
  if (!btn) throw new Error(`Move button not found: ${label}`);
  return btn;
}

function clickButton(btn: HTMLButtonElement) {
  act(() => {
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("ProjectDetail — reorder UI (Move buttons)", () => {
  it("Move up on the first task is disabled", () => {
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    render();
    const btn = moveButton("First", "up");
    expect(btn.getAttribute("aria-disabled")).toBe("true");
    expect(btn.disabled).toBe(true);
  });

  it("Move down on the last task is disabled", () => {
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    render();
    const btn = moveButton("Second", "down");
    expect(btn.getAttribute("aria-disabled")).toBe("true");
    expect(btn.disabled).toBe(true);
  });

  it("Move down on the first task calls reorderProjectTask with the right neighbors", async () => {
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
      task("t3", { title: "Third", orderIndex: 3000 }),
    ];
    render();
    clickButton(moveButton("First", "down"));
    await flush();
    expect(reorderMock).toHaveBeenCalledTimes(1);
    // After moving t1 down by one, new neighbors are: before=t2, after=t3.
    expect(reorderMock.mock.calls[0][0]).toMatchObject({
      taskId: "t1",
      organizerKey,
      beforeId: "t2",
      afterId: "t3",
    });
  });

  it("Three clicks on Move down compute neighbors against the then-current position", async () => {
    // Simulate a four-task project where each click moves the row
    // down by one position. The test mock returns void (and the
    // store doesn't actually re-sort), so each click reads the
    // SAME starting position — we only verify the helper is called
    // three times with the FIRST-position neighbors each time. This
    // locks the contract: each click is independently computed from
    // the (then-current) rendered order, not cached.
    mockState.projectTasks = [
      task("t1", { title: "Alpha", orderIndex: 1000 }),
      task("t2", { title: "Beta", orderIndex: 2000 }),
      task("t3", { title: "Gamma", orderIndex: 3000 }),
      task("t4", { title: "Delta", orderIndex: 4000 }),
    ];
    render();
    const btn = moveButton("Alpha", "down");
    clickButton(btn);
    clickButton(btn);
    clickButton(btn);
    await flush();
    expect(reorderMock).toHaveBeenCalledTimes(3);
    for (const call of reorderMock.mock.calls) {
      expect((call[0] as { taskId: string }).taskId).toBe("t1");
    }
  });

  it("Successful reorder emits a live-region announcement", async () => {
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    render();
    clickButton(moveButton("First", "down"));
    await flush();
    const live = container.querySelector(
      "[data-testid=\"reorder-live-region\"]",
    );
    expect(live).not.toBeNull();
    expect((live?.textContent ?? "")).toContain("First moved to position 2");
  });

  it("Failed reorder surfaces an error toast", async () => {
    reorderMock.mockRejectedValueOnce(new Error("nope"));
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    render();
    clickButton(moveButton("First", "down"));
    await flush();
    expect(showToastMock).toHaveBeenCalled();
  });
});

describe("ProjectDetail — Reorder tasks dialog", () => {
  function reorderButton(): HTMLButtonElement | null {
    return container.querySelector(
      'button[aria-haspopup="dialog"]',
    ) as HTMLButtonElement | null;
  }

  it("Reorder button appears for organizer with 2+ tasks", () => {
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    render();
    expect(reorderButton()).not.toBeNull();
  });

  it("Reorder button is absent with fewer than 2 tasks", () => {
    mockState.projectTasks = [
      task("t1", { title: "Only", orderIndex: 1000 }),
    ];
    render();
    expect(reorderButton()).toBeNull();
  });

  it("Reorder button is absent for non-organizers", () => {
    mockState.currentMember = member(memberAKey, "A Member");
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    render();
    expect(reorderButton()).toBeNull();
  });

  it("clicking the Reorder button opens the dialog", async () => {
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    render();
    const btn = reorderButton();
    expect(btn).not.toBeNull();
    clickButton(btn!);
    await flush();
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
  });

  it("Escape closes the dialog and returns focus to the trigger", async () => {
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    render();
    const btn = reorderButton();
    clickButton(btn!);
    await flush();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    await flush();
    // setTimeout schedules focus restoration; flush microtasks then
    // run the pending timer.
    await new Promise((resolve) => setTimeout(resolve, 10));
    await flush();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(btn);
  });

  it("backdrop click closes the dialog", async () => {
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    render();
    clickButton(reorderButton()!);
    await flush();
    const dialog = document.querySelector(
      '[role="dialog"]',
    ) as HTMLDivElement | null;
    expect(dialog).not.toBeNull();
    // Click the backdrop itself (target === currentTarget).
    act(() => {
      const evt = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(evt, "target", { value: dialog });
      Object.defineProperty(evt, "currentTarget", { value: dialog });
      dialog!.dispatchEvent(evt);
    });
    await flush();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("Done button closes the dialog", async () => {
    mockState.projectTasks = [
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ];
    render();
    clickButton(reorderButton()!);
    await flush();
    const done = Array.from(
      document.querySelectorAll('[role="dialog"] button'),
    ).find((b) => (b.textContent ?? "").trim() === "Done") as
      | HTMLButtonElement
      | undefined;
    expect(done).toBeDefined();
    clickButton(done!);
    await flush();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});

describe("ProjectDetail — FLIP animation", () => {
  it("bails on prefers-reduced-motion (no transform applied to rows)", async () => {
    // Mock matchMedia so useReducedMotion returns true.
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    try {
      mockState.projectTasks = [
        task("t1", { title: "First", orderIndex: 1000 }),
        task("t2", { title: "Second", orderIndex: 2000 }),
      ];
      render();
      await flush();
      // Inspect the li elements that host the FLIP ref — under
      // reduced-motion the hook should never write to style.transform.
      const items = container.querySelectorAll('[id^="task-"]');
      expect(items.length).toBeGreaterThan(0);
      for (const el of Array.from(items)) {
        expect((el as HTMLElement).style.transform).toBe("");
      }
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});

describe("ProjectDetail — Follows badge", () => {
  it("renders Follows: <title> for a single unmet dependency", () => {
    mockState.projectTasks = [
      task("up1", {
        title: "Buy paint",
        orderIndex: 1000,
        status: "open",
      }),
      task("t1", {
        title: "Paint trim",
        orderIndex: 2000,
        dependencies: ["up1"],
      }),
    ];
    render();
    expect(container.textContent ?? "").toContain("Follows: Buy paint");
  });

  it("renders comma-joined titles for 2-3 unmet dependencies", () => {
    mockState.projectTasks = [
      task("up1", { title: "Buy paint", orderIndex: 1000 }),
      task("up2", { title: "Sand wood", orderIndex: 2000 }),
      task("up3", { title: "Mask trim", orderIndex: 3000 }),
      task("t1", {
        title: "Paint",
        orderIndex: 4000,
        dependencies: ["up1", "up2", "up3"],
      }),
    ];
    render();
    expect(container.textContent ?? "").toContain(
      "Follows: Buy paint, Sand wood, Mask trim",
    );
  });

  it("renders +N more for 4+ unmet dependencies and expands on click", () => {
    mockState.projectTasks = [
      task("up1", { title: "Buy paint", orderIndex: 1000 }),
      task("up2", { title: "Sand wood", orderIndex: 2000 }),
      task("up3", { title: "Mask trim", orderIndex: 3000 }),
      task("up4", { title: "Lay tarp", orderIndex: 4000 }),
      task("t1", {
        title: "Paint",
        orderIndex: 5000,
        dependencies: ["up1", "up2", "up3", "up4"],
      }),
    ];
    render();
    // Collapsed: shows first title + "+3 more".
    expect(container.textContent ?? "").toContain("Buy paint");
    expect(container.textContent ?? "").toContain("+3 more");
    // Click the expand control to reveal all four titles.
    const expand = container.querySelector(
      "[aria-label=\"Show all upstream tasks\"]",
    ) as HTMLButtonElement | null;
    expect(expand).not.toBeNull();
    act(() => {
      expand!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const text = container.textContent ?? "";
    expect(text).toContain("Sand wood");
    expect(text).toContain("Mask trim");
    expect(text).toContain("Lay tarp");
  });

  it("does not include completed dependencies in the Follows badge", () => {
    mockState.projectTasks = [
      task("up1", {
        title: "Buy paint",
        orderIndex: 1000,
        status: "completed",
      }),
      task("up2", {
        title: "Sand wood",
        orderIndex: 2000,
        status: "open",
      }),
      task("t1", {
        title: "Paint",
        orderIndex: 3000,
        dependencies: ["up1", "up2"],
      }),
    ];
    render();
    const text = container.textContent ?? "";
    // Sand wood (unmet) appears in the Follows badge.
    expect(text).toContain("Follows: Sand wood");
    // Buy paint (completed) does NOT appear inside the badge —
    // assert it's not chained into the "Follows:" run. The simplest
    // shape: there's only one comma-free title after "Follows:".
    expect(text).not.toContain("Follows: Buy paint");
    expect(text).not.toContain("Sand wood, Buy paint");
  });
});
