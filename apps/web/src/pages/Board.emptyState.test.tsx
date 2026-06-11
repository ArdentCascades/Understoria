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
// Board empty-state distinction (PR: clarity copy batch).
//
// Before this batch, both "your search returned nothing" and "your
// filters returned nothing" rendered the same generic "no matches"
// copy — a member couldn't tell whether to clear their filter or
// rephrase their query. The fix splits the two: search-empty names
// the query back, filter-empty offers a one-tap Clear-filters reset.
//
// This suite locks the differentiation on the NEEDS tab (post path)
// and PROJECTS tab (project path), since both render paths got the
// same treatment.
//
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));
vi.mock("@/components/AttentionSection", () => ({
  AttentionSection: () => <div data-testid="attention-section" />,
}));
vi.mock("@/components/FirstActionNudge", () => ({
  FirstActionNudge: () => null,
}));
vi.mock("@/components/ProfileNudge", () => ({
  ProfileNudge: () => null,
}));
vi.mock("@/components/ContextualHint", () => ({
  ContextualHint: () => null,
}));

import "@/i18n";
import BoardPage from "./Board";
import type {
  Member,
  Post,
  Project,
  ProjectTask,
  SignedVouch,
} from "@/types";
import type { InviteRow } from "@/db/database";

interface MockState {
  posts: Post[];
  members: Member[];
  currentMember: Member | null;
  projects: Project[];
  projectTasks: ProjectTask[];
  vouches: SignedVouch[];
  invites: InviteRow[];
  nodeId: string;
}

let mockState: MockState = blankState();

function blankState(): MockState {
  return {
    posts: [],
    members: [],
    currentMember: null,
    projects: [],
    projectTasks: [],
    vouches: [],
    invites: [],
    nodeId: "node-1",
  };
}

function makeMember(publicKey: string): Member {
  return {
    publicKey,
    displayName: "Tester",
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

function makePost(over: Partial<Post> & { id: string }): Post {
  const base: Post = {
    id: over.id,
    type: "NEED",
    category: "food",
    title: `Post ${over.id}`,
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "me-key",
    claimedBy: null,
    status: "open",
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId: "node-1",
    signature: "",
  };
  return { ...base, ...over };
}

function makeProject(over: Partial<Project> & { id: string }): Project {
  const base: Project = {
    id: over.id,
    title: `Project ${over.id}`,
    description: "",
    category: "infrastructure",
    organizerKey: "me-key",
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
  return { ...base, ...over };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = blankState();
  mockState.currentMember = makeMember("me-key");
  mockState.members = [mockState.currentMember];
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(node: ReactNode, initialEntry: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>{node}</MemoryRouter>,
    );
  });
}

/** Type a value into the Board's search input — fires the same
 *  input event the live component uses to update query state. The
 *  visible→filtered transition is debounced 250 ms; we drive the
 *  debounce timer forward with `vi.advanceTimersByTime`. */
function typeSearch(value: string) {
  const input = container.querySelector<HTMLInputElement>(
    'input[type="search"]',
  );
  expect(input).not.toBeNull();
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, value);
    input!.dispatchEvent(new Event("input", { bubbles: true }));
  });
  act(() => {
    vi.advanceTimersByTime(300);
  });
}

describe("Board empty-state differentiation (clarity-copy batch)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("NEEDS tab + active search → names the query in the empty state", () => {
    // One in-scope post on the NEEDS tab, but the query won't match.
    mockState.posts = [
      makePost({ id: "n1", type: "NEED", title: "Garden tools" }),
    ];
    render(<BoardPage />, "/?tab=needs");
    typeSearch("xyzzy-no-such-thing");

    expect(container.textContent).toContain('No results for "xyzzy-no-such-thing".');
    // The filter-empty branch should NOT also fire — search wins.
    expect(container.textContent).not.toContain("Clear filters");
  });

  it("NEEDS tab + active filter (no search) → renders Clear filters reset", () => {
    mockState.posts = [
      makePost({
        id: "n1",
        type: "NEED",
        title: "Garden tools",
        category: "food",
      }),
    ];
    render(<BoardPage />, "/?tab=needs");

    // Push the category filter to a value that doesn't match the
    // post. There are two filter copies in the rendered tree
    // (mobile + desktop, both rendered in jsdom); the first one
    // drives state, which is enough.
    const categorySelects = container.querySelectorAll<HTMLSelectElement>(
      "#category-filter",
    );
    expect(categorySelects.length).toBeGreaterThan(0);
    // The seed post is `food`; pick any non-empty option that's
    // not food. `pickFirstNonEmptyOption` returns the first; if
    // it happens to be food, advance to the next.
    const select = categorySelects[0]!;
    let chosen = "";
    for (const opt of Array.from(select.options)) {
      if (opt.value !== "" && opt.value !== "food") {
        chosen = opt.value;
        break;
      }
    }
    expect(chosen).not.toBe("");
    act(() => {
      select.value = chosen;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(container.textContent).toContain("Nothing matches these filters.");
    const clearButton = Array.from(
      container.querySelectorAll("button"),
    ).find((b) => b.textContent === "Clear filters");
    expect(clearButton).toBeTruthy();

    // Tapping Clear filters resets the filter; the post comes back.
    act(() => {
      clearButton!.click();
    });
    expect(container.querySelectorAll("li").length).toBeGreaterThan(0);
  });

  it("PROJECTS tab + active search → names the query in the empty state", () => {
    mockState.projects = [
      makeProject({ id: "p1", title: "Tool library" }),
    ];
    render(<BoardPage />, "/?tab=projects");
    typeSearch("xyzzy-no-such-thing");

    expect(container.textContent).toContain('No results for "xyzzy-no-such-thing".');
    expect(container.textContent).not.toContain("Clear filters");
  });

  it("PROJECTS tab + active filter (no search) → renders Clear filters reset", () => {
    mockState.projects = [
      makeProject({
        id: "p1",
        title: "Tool library",
        category: "infrastructure",
      }),
    ];
    render(<BoardPage />, "/?tab=projects");

    const categorySelects = container.querySelectorAll<HTMLSelectElement>(
      "#project-category-filter",
    );
    expect(categorySelects.length).toBeGreaterThan(0);
    const select = categorySelects[0]!;
    let chosen = "";
    for (const opt of Array.from(select.options)) {
      if (opt.value !== "" && opt.value !== "infrastructure") {
        chosen = opt.value;
        break;
      }
    }
    expect(chosen).not.toBe("");
    act(() => {
      select.value = chosen;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(container.textContent).toContain("Nothing matches these filters.");
    const clearButton = Array.from(
      container.querySelectorAll("button"),
    ).find((b) => b.textContent === "Clear filters");
    expect(clearButton).toBeTruthy();

    act(() => {
      clearButton!.click();
    });
    expect(container.querySelectorAll("li").length).toBeGreaterThan(0);
  });
});
