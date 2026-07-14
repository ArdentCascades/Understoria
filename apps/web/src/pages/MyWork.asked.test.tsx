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

// The "Asked of you" section on the combined In-my-care page: comments
// that @-mention the viewer, DERIVED live from Dexie — docs/mentions.md.
// The predicates themselves are exhaustively covered by
// lib/mentions.test.ts; this file locks the page wiring: the section
// renders (or is absent), resolves the asker's name, and links to the
// task page where the reply lowers the hand.

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));

import "@/i18n";
import MyWorkPage from "./MyWork";
import { db } from "@/db/database";
import { mentionToken } from "@/lib/mentions";
import type { Member, Project, ProjectTask } from "@/types";

const ME = "M".repeat(43) + "=";
const ROSA = "R".repeat(43) + "=";
const HOUR = 3_600_000;

interface MockState {
  currentMember: Member | null;
  projects: Project[];
  projectTasks: ProjectTask[];
  exchanges: never[];
  posts: never[];
  events: never[];
  eventCancellations: never[];
  coorgInvitations: never[];
  coorgInvitationResponses: never[];
  coorgInvitationRevocations: never[];
  blockedKeys: Set<string>;
  members: Member[];
}

let mockState: MockState;

function makeMember(publicKey: string, displayName: string): Member {
  return {
    publicKey,
    displayName,
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

function makeProject(): Project {
  return {
    id: "p1",
    title: "Community fridge",
    description: "",
    category: "food",
    organizerKey: ROSA,
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
  };
}

function makeTask(): ProjectTask {
  return {
    id: "t1",
    projectId: "p1",
    title: "Fix the fridge door",
    description: "",
    category: "food",
    estimatedHours: 1,
    urgency: "medium",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 0,
    createdAt: 0,
    completedAt: null,
    completedBy: null,
    actualHours: null,
    exchangeId: null,
    claimedAt: null,
    checkInAcknowledgedAt: null,
  };
}

async function putAskingComment(over: Partial<Parameters<typeof db.taskComments.put>[0]> = {}) {
  await db.taskComments.put({
    id: "c1",
    projectId: "p1",
    taskId: "t1",
    authorKey: ROSA,
    body: `could you take a look, ${mentionToken("Tester", ME)}?`,
    createdAt: Date.now() - HOUR,
    deletedAt: null,
    nodeId: "node-1",
    signature: "sig",
    ...over,
  });
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  mockState = {
    currentMember: makeMember(ME, "Tester"),
    projects: [makeProject()],
    projectTasks: [makeTask()],
    exchanges: [],
    posts: [],
    events: [],
    eventCancellations: [],
    coorgInvitations: [],
    coorgInvitationResponses: [],
    coorgInvitationRevocations: [],
    blockedKeys: new Set<string>(),
    members: [makeMember(ME, "Tester"), makeMember(ROSA, "Rosa")],
  };
  await db.taskComments.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(async () => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  await db.taskComments.clear();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

// useLiveQuery resolves async — flush a few microtask rounds.
async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe("MyWorkPage — Asked of you", () => {
  it("surfaces a mention of me with the asker's current name, linking to the task", async () => {
    await putAskingComment();
    render(<MyWorkPage />);
    await flush();
    const text = container.textContent ?? "";
    expect(text).toContain("Asked of you");
    expect(text).toContain("Rosa mentioned you");
    expect(text).toContain("Fix the fridge door");
    // The snippet strips the token to plain @Name — no raw syntax leaks.
    expect(text).toContain("could you take a look, @Tester?");
    expect(text).not.toContain("mention:");
    const link = Array.from(container.querySelectorAll("a")).find((a) =>
      (a.textContent ?? "").includes("Fix the fridge door"),
    );
    expect(link?.getAttribute("href")).toBe("/project/p1/task/t1");
  });

  it("renders NO section (not an empty shell) when no hands are raised", async () => {
    render(<MyWorkPage />);
    await flush();
    expect(container.textContent ?? "").not.toContain("Asked of you");
  });

  it("a blocked member's mention never surfaces — mentions cannot bypass blocking", async () => {
    await putAskingComment();
    mockState.blockedKeys = new Set([ROSA]);
    render(<MyWorkPage />);
    await flush();
    expect(container.textContent ?? "").not.toContain("Asked of you");
  });
});
