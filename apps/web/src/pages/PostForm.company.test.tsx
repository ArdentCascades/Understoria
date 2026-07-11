/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The body-doubling composition path (docs/body-doubling.md): the task
// page's "invite company" doorway lands on the post form with
// `?company=<taskId>`, which seeds an ordinary, fully-editable NEED
// post. Under test: the seed itself (type/category/title/description/
// hours), the claimer-only guard, and the explainer banner.

vi.mock("@/state/AppContext", () => ({ useApp: () => mockApp }));

import "@/i18n";
import PostFormPage from "./PostForm";
import type { Member, Post, Project, ProjectTask } from "@/types";

const ME = "viewer-key";

function makeTask(over: Partial<ProjectTask> = {}): ProjectTask {
  return {
    id: "t1",
    projectId: "p1",
    title: "Find a host site",
    description: "",
    category: "food",
    estimatedHours: 2,
    urgency: "low",
    requiredSkills: [],
    assignedTo: ME,
    status: "claimed",
    dependencies: [],
    orderIndex: 1000,
    createdAt: 0,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: 100,
    actualHours: null,
    checkInAcknowledgedAt: null,
    ...over,
  };
}

const project: Project = {
  id: "p1",
  title: "Community Fridge",
  description: "",
  category: "food",
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
};

let mockApp: {
  currentMember: Pick<Member, "publicKey" | "locationZone"> | null;
  posts: Post[];
  nodeId: string;
  projects: Project[];
  projectTasks: ProjectTask[];
};

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockApp = {
    currentMember: { publicKey: ME, locationZone: "" },
    posts: [],
    nodeId: "node-1",
    projects: [project],
    projectTasks: [makeTask()],
  };
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

async function render(url: string) {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[url]}>
        <PostFormPage />
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
  // Let the draft-load and seed effects settle.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
}

function field(selector: string): HTMLInputElement | HTMLTextAreaElement {
  const el = container.querySelector<HTMLInputElement>(selector);
  expect(el, selector).not.toBeNull();
  return el!;
}

describe("PostForm — body-doubling company seed", () => {
  it("seeds an editable NEED post from the claimer's task", async () => {
    await render("/post/new?company=t1");
    const text = container.textContent ?? "";
    // The explainer banner: what this is, and that nothing is public
    // until posted.
    expect(text).toContain("company invitation for a task you're carrying");
    expect(text).toContain("nothing is public until you post it");

    const inputs = Array.from(container.querySelectorAll("input"));
    const title = inputs.find((i) =>
      (i.value ?? "").includes("Keep me company"),
    );
    expect(title?.value).toBe("Keep me company while I work on: Find a host site");

    const description = field("textarea");
    expect(description.value).toContain("body doubling");
    expect(description.value).toContain("Find a host site");
    expect(description.value).toContain("Community Fridge");
    expect(description.value).toContain("/project/p1/task/t1");

    // Category is a radio group.
    const checkedCategory = container.querySelector<HTMLInputElement>(
      'input[name="category"]:checked',
    );
    expect(checkedCategory?.value).toBe("emotional_support");

    const hours = inputs.find((i) => i.type === "number");
    expect(hours?.value).toBe("2");
  });

  it("falls through to a blank form when the task isn't the viewer's claim", async () => {
    mockApp.projectTasks = [makeTask({ assignedTo: "someone-else" })];
    await render("/post/new?company=t1");
    expect(container.textContent ?? "").not.toContain(
      "company invitation for a task you're carrying",
    );
    const inputs = Array.from(container.querySelectorAll("input"));
    expect(
      inputs.some((i) => (i.value ?? "").includes("Keep me company")),
    ).toBe(false);
  });

  it("ignores an unknown task id", async () => {
    await render("/post/new?company=nope");
    const inputs = Array.from(container.querySelectorAll("input"));
    expect(
      inputs.some((i) => (i.value ?? "").includes("Keep me company")),
    ).toBe(false);
  });
});
