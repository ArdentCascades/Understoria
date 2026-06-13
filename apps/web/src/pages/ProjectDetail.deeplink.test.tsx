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
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
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
import ProjectDetailPage from "./ProjectDetail";
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
    projectTasks: [
      task("t1", { title: "First task" }),
      task("t2", { title: "Second task" }),
      task("t3", { title: "Third task" }),
    ],
    // Viewer is a plain member (not the organizer) so the static,
    // non-drag task list renders — the simpler of the two <li> paths.
    members: [member(organizerKey, "Org"), member(viewerKey, "Viewer")],
    currentMember: member(viewerKey, "Viewer"),
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
let scrollSpy: ReturnType<typeof vi.fn>;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = freshState();
  container = document.createElement("div");
  document.body.appendChild(container);
  // jsdom doesn't implement scrollIntoView; stub it on the prototype so
  // the deep-link effect can call it and we can assert the behavior arg.
  scrollSpy = vi.fn();
  Element.prototype.scrollIntoView = scrollSpy as unknown as (
    arg?: boolean | ScrollIntoViewOptions,
  ) => void;
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
});

// A tiny in-tree navigator so a test can push a same-page hash change
// (the rail-tap-while-already-on-the-project case) without a remount.
function HashNavigator() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      data-testid="go-t2"
      onClick={() => navigate("/project/proj-1#task-t2")}
    >
      go
    </button>
  );
}

function render(initialPath: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialPath]}>
        <HashNavigator />
        <Routes>
          <Route path="/project/:id" element={<ProjectDetailPage />} />
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

describe("ProjectDetail — task deep-links", () => {
  it("scrolls, focuses, and highlights the linked task on initial entry", () => {
    render("/project/proj-1#task-t2");
    const li = container.querySelector<HTMLLIElement>("#task-t2");
    expect(li).not.toBeNull();
    expect(scrollSpy).toHaveBeenCalled();
    // The transient locator ring lands on the named row only.
    expect(li!.className).toContain("ring-2");
    expect(container.querySelector("#task-t1")!.className).not.toContain(
      "ring-2",
    );
    // Focus moves to the row so screen-reader / keyboard users land on it.
    expect(document.activeElement).toBe(li);
  });

  it("does nothing for a hash naming a task that isn't here", () => {
    render("/project/proj-1#task-nope");
    expect(scrollSpy).not.toHaveBeenCalled();
    // Page still renders normally.
    expect(container.textContent ?? "").toContain("Second task");
  });

  it("clears an active filter that hides the linked task, then scrolls", () => {
    render("/project/proj-1");
    // Narrow to Done; every fixture task is open, so the list empties
    // and t2 is no longer in `visibleTasks`.
    clickButtonByText("Done");
    const donePill = Array.from(container.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Done",
    )!;
    expect(donePill.getAttribute("aria-pressed")).toBe("true");

    act(() => {
      container
        .querySelector('[data-testid="go-t2"]')!
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Filter reset back to All so the linked task is reachable...
    const allPill = Array.from(container.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "All",
    )!;
    expect(allPill.getAttribute("aria-pressed")).toBe("true");
    expect(donePill.getAttribute("aria-pressed")).toBe("false");
    // ...the reset is announced for screen-reader users...
    expect(container.textContent ?? "").toContain(
      "Showing all tasks so the linked task is visible",
    );
    // ...and the row gets scrolled into view + highlighted.
    expect(scrollSpy).toHaveBeenCalled();
    expect(container.querySelector("#task-t2")!.className).toContain("ring-2");
  });

  it("honors prefers-reduced-motion with an instant scroll", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }),
    );
    render("/project/proj-1#task-t2");
    expect(scrollSpy).toHaveBeenCalled();
    const arg = scrollSpy.mock.calls[0][0] as ScrollIntoViewOptions;
    expect(arg.behavior).toBe("auto");
  });
});
