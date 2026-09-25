/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));

import "@/i18n";
import { ResumeCard } from "./ResumeCard";
import { db, SETTING_KEYS, setSetting } from "@/db/database";
import type { Member, Project, ProjectTask } from "@/types";

function member(publicKey: string): Member {
  return {
    publicKey,
    displayName: "Me",
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 0,
    vouchedBy: [],
    createdAt: 0,
    nodeId: "node-1",
    locationZone: "",
  };
}

function project(over: Partial<Project> & { id: string }): Project {
  return {
    title: `Project ${over.id}`,
    description: "",
    category: "infrastructure",
    organizerKey: "org-key",
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
    nodeId: "node-1",
    templateId: null,
    ...over,
  };
}

function task(
  over: Partial<ProjectTask> & { id: string; projectId: string },
): ProjectTask {
  return {
    title: `Task ${over.id}`,
    description: "",
    category: "infrastructure",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 0,
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
  currentMember: Member | null;
  projects: Project[];
  projectTasks: ProjectTask[];
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  await db.settings.clear();
  mockState = {
    currentMember: member("me"),
    projects: [],
    projectTasks: [],
  };
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root?.unmount());
  container.remove();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

/** Let the settings live query settle. */
async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
}

async function pointTo(taskId: string, projectId: string) {
  await setSetting(
    SETTING_KEYS.lastTouchedTask,
    JSON.stringify({ taskId, projectId, at: Date.now() }),
  );
}

describe("ResumeCard", () => {
  it("renders nothing without a valid pointer (doorways contract)", async () => {
    render(<ResumeCard />);
    await flush();
    expect(container.textContent).toBe("");
  });

  it("links back to the member's own claimed task", async () => {
    mockState.projects = [project({ id: "p1", title: "Fix the fence" })];
    mockState.projectTasks = [
      task({ id: "t1", projectId: "p1", status: "claimed", assignedTo: "me" }),
    ];
    await pointTo("t1", "p1");
    render(<ResumeCard />);
    await flush();
    const text = container.textContent ?? "";
    expect(text).toContain("Task t1");
    expect(text).toContain("Fix the fence");
    expect(
      container.querySelector('a[href="/project/p1/task/t1"]'),
    ).not.toBeNull();
  });

  it("renders unedited template titles in the viewer's language (provenance)", async () => {
    // The Sep 25 zh field report in reverse (test i18n is en): the
    // project and its task were created from a template in Chinese
    // and never reworded — both scaffold titles display translated.
    mockState.projects = [
      project({
        id: "p1",
        title: "邻里照应网络",
        templateId: "neighborhood-care-network",
      }),
    ];
    mockState.projectTasks = [
      task({
        id: "t1",
        projectId: "p1",
        title: "招募并核实志愿者",
        status: "claimed",
        assignedTo: "me",
      }),
    ];
    await pointTo("t1", "p1");
    render(<ResumeCard />);
    await flush();
    const text = container.textContent ?? "";
    expect(text).toContain("Recruit and screen volunteers");
    expect(text).toContain("Neighborhood Care Network");
    expect(text).not.toContain("邻里照应网络");
  });
});
