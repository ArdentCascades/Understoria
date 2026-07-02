/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));

import "@/i18n";
import { WhereHandsAreWelcome } from "./WhereHandsAreWelcome";
import type { Post, Project, ProjectTask } from "@/types";

const DAY = 24 * 60 * 60 * 1000;

function post(over: Partial<Post> & { id: string }): Post {
  return {
    type: "NEED",
    category: "food",
    title: `Post ${over.id}`,
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "poster-key",
    claimedBy: null,
    status: "open",
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId: "node-1",
    signature: "sig",
    ...over,
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

/** A claim that's gone long-silent — 20 days, no ack — so its project
 *  qualifies as `needs_more_hands` under the default test config. */
function staleClaim(id: string, projectId: string): ProjectTask {
  return task({
    id,
    projectId,
    status: "claimed",
    assignedTo: "helper-key",
    claimedAt: Date.now() - 20 * DAY,
  });
}

interface MockState {
  posts: Post[];
  projects: Project[];
  projectTasks: ProjectTask[];
  nodeConfig: {
    taskCheckInDays: number;
    taskNeedsHelpDays: number;
    taskCheckInGraceDays: number;
  };
}

let mockState: MockState;

function blankState(): MockState {
  return {
    posts: [],
    projects: [],
    projectTasks: [],
    nodeConfig: {
      taskCheckInDays: 7,
      taskNeedsHelpDays: 14,
      taskCheckInGraceDays: 3,
    },
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = blankState();
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

describe("WhereHandsAreWelcome", () => {
  it("hides entirely when there is nothing to offer (the Coming-up rule)", () => {
    render(<WhereHandsAreWelcome />);
    expect(container.textContent).toBe("");
  });

  it("stays hidden for offers, non-open needs, and quiet projects", () => {
    mockState.posts = [
      post({ id: "offer", type: "OFFER", title: "Free rides" }),
      post({ id: "done", status: "completed", title: "Old need" }),
    ];
    // Active project with only an open task — never needs_more_hands.
    mockState.projects = [project({ id: "quiet" })];
    mockState.projectTasks = [
      task({ id: "t1", projectId: "quiet", status: "open" }),
    ];
    render(<WhereHandsAreWelcome />);
    expect(container.textContent).toBe("");
  });

  it("renders open needs and welcoming projects mixed, with correct links", () => {
    mockState.posts = [
      post({ id: "n1", title: "Grocery run", createdAt: 2000 }),
    ];
    mockState.projects = [
      project({ id: "p1", title: "Community fridge", createdAt: 1000 }),
    ];
    mockState.projectTasks = [staleClaim("t1", "p1")];
    render(<WhereHandsAreWelcome />);
    const text = container.textContent ?? "";
    expect(text).toContain("Where hands are welcome");
    expect(text).toContain("Grocery run");
    expect(text).toContain("Community fridge");
    // Quiet type words, one each.
    expect(text).toContain("need");
    expect(text).toContain("project");
    expect(container.querySelector('a[href="/post/n1"]')).not.toBeNull();
    expect(container.querySelector('a[href="/project/p1"]')).not.toBeNull();
  });

  it("caps at 3 items, newest first — the oldest item drops off", () => {
    mockState.posts = [
      post({ id: "n1", title: "Oldest need", createdAt: 1000 }),
      post({ id: "n2", title: "Old need", createdAt: 2000 }),
      post({ id: "n3", title: "Newer need", createdAt: 3000 }),
    ];
    mockState.projects = [
      project({ id: "p1", title: "Newest project", createdAt: 4000 }),
    ];
    mockState.projectTasks = [staleClaim("t1", "p1")];
    render(<WhereHandsAreWelcome />);
    const text = container.textContent ?? "";
    expect(container.querySelectorAll("li").length).toBe(3);
    expect(text).toContain("Newest project");
    expect(text).toContain("Newer need");
    expect(text).toContain("Old need");
    expect(text).not.toContain("Oldest need");
  });

  it("ignores paused projects even when their tasks would qualify", () => {
    mockState.projects = [
      project({ id: "p1", title: "Paused project", status: "paused" }),
    ];
    mockState.projectTasks = [staleClaim("t1", "p1")];
    render(<WhereHandsAreWelcome />);
    expect(container.textContent).toBe("");
  });
});
