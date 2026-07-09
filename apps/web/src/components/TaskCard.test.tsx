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
 * The slim project-list task card. Covers the affordances that are
 * card-specific (and thus NOT on the per-task page body): the whole card
 * being a link to the task page (stretched over the title), the
 * comment-count chip (driven by the live comment count, blocked-author
 * filtered), the one-line clamped description preview, and the one-tap
 * Claim.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { claimProjectTaskMock } = vi.hoisted(() => ({
  claimProjectTaskMock: vi.fn(),
}));

// useTaskCommentCount loads the thread via useLiveQuery; mock it to
// return a controllable comment array so the footer-link variants can
// be exercised without a Dexie connection.
let liveComments: { id: string; authorKey: string }[] = [];
vi.mock("dexie-react-hooks", () => ({ useLiveQuery: () => liveComments }));
vi.mock("@/state/AppContext", () => ({ useApp: () => mockApp }));
vi.mock("@/db/projects", () => ({
  claimProjectTask: claimProjectTaskMock,
}));

import "@/i18n";
import { TaskCard } from "./TaskCard";
import type { ProjectTask } from "@/types";

const viewerKey = "viewer-key";

let mockApp: { blockedKeys: Set<string> };

function task(overrides: Partial<ProjectTask> = {}): ProjectTask {
  return {
    id: "t1",
    projectId: "proj-1",
    title: "Install hinges",
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

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  liveComments = [];
  mockApp = { blockedKeys: new Set<string>() };
  claimProjectTaskMock.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function renderCard(props: Partial<Parameters<typeof TaskCard>[0]> = {}) {
  const merged = {
    task: task(),
    isOrganizer: false,
    acceptingClaims: true,
    projectStatus: "active" as const,
    currentKey: viewerKey,
    onRun: (async (action: () => Promise<unknown>) => action()) as <T>(
      a: () => Promise<T>,
    ) => Promise<T | null>,
    needsMoreHands: false,
    allTasks: [] as ProjectTask[],
    taskCheckInDays: 7,
    ...props,
  };
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter>
        <TaskCard {...merged} />
      </MemoryRouter>,
    );
  });
}

function cardLink(): HTMLAnchorElement | null {
  return container.querySelector<HTMLAnchorElement>(
    'a[href="/project/proj-1/task/t1"]',
  );
}

function commentChip(): HTMLElement | null {
  return Array.from(container.querySelectorAll<HTMLElement>("[aria-label]")).find(
    (el) => /\bcomments?\b/.test(el.getAttribute("aria-label") ?? ""),
  ) ?? null;
}

describe("TaskCard — whole-card link + comment-count chip", () => {
  it("makes the whole card a link to the task via the title's stretched link", () => {
    liveComments = [];
    renderCard({ allTasks: [task()] });
    const link = cardLink();
    expect(link).not.toBeNull();
    // The link IS the title (its accessible name), and it stretches over
    // the card via an ::after overlay (after:absolute after:inset-0).
    expect((link!.textContent ?? "").trim()).toBe("Install hinges");
    expect(link!.className).toContain("after:absolute");
    expect(link!.className).toContain("after:inset-0");
  });

  it("shows the comment count as a chip when the thread has comments", () => {
    liveComments = [
      { id: "c1", authorKey: "a" },
      { id: "c2", authorKey: "b" },
      { id: "c3", authorKey: "c" },
    ];
    renderCard({ allTasks: [task()] });
    const chip = commentChip();
    expect(chip).not.toBeNull();
    // Plural aria-label names the live count; the visible glyph is 💬 N.
    expect(chip!.getAttribute("aria-label")).toBe("3 comments");
    expect((chip!.textContent ?? "")).toContain("3");
  });

  it("uses the singular aria-label for exactly one comment", () => {
    liveComments = [{ id: "c1", authorKey: "a" }];
    renderCard({ allTasks: [task()] });
    expect(commentChip()!.getAttribute("aria-label")).toBe("1 comment");
  });

  it("renders no comment chip with zero comments", () => {
    liveComments = [];
    renderCard({ allTasks: [task()] });
    expect(commentChip()).toBeNull();
  });

  it("filters blocked authors out of the comment count", () => {
    // Two comments, one by a blocked author — the visible count is 1,
    // exactly what TaskComments' header would show.
    liveComments = [
      { id: "c1", authorKey: "ok-author" },
      { id: "c2", authorKey: "blocked-author" },
    ];
    mockApp = { blockedKeys: new Set<string>(["blocked-author"]) };
    renderCard({ allTasks: [task()] });
    expect(commentChip()!.getAttribute("aria-label")).toBe("1 comment");
  });

  it("exposes the open affordance as a Link, never a button", () => {
    liveComments = [{ id: "c1", authorKey: "a" }];
    renderCard({ allTasks: [task()] });
    // The card open path is the title anchor — the project-page suites
    // scan/click buttons by text and must not pick up an open control.
    expect(cardLink()).not.toBeNull();
    const openButtons = Array.from(
      container.querySelectorAll("button"),
    ).filter((b) => (b.textContent ?? "").toLowerCase().includes("open task"));
    expect(openButtons).toHaveLength(0);
  });
});

describe("TaskCard — one-line description preview", () => {
  it("clamps the description to a single line via line-clamp-1", () => {
    renderCard({
      task: task({ description: "Lay the irrigation line\nacross the bed" }),
      allTasks: [task()],
    });
    const preview = Array.from(container.querySelectorAll("p")).find((p) =>
      (p.textContent ?? "").includes("Lay the irrigation line"),
    );
    expect(preview).toBeDefined();
    expect(preview!.className).toContain("line-clamp-1");
    // The collapse-to-one-line preview must NOT carry whitespace-pre-wrap
    // (that's the full-description treatment on the page body).
    expect(preview!.className).not.toContain("whitespace-pre-wrap");
  });

  it("omits the preview entirely when there's no description", () => {
    renderCard({ task: task({ description: "" }), allTasks: [task()] });
    const preview = Array.from(container.querySelectorAll("p")).find((p) =>
      (p.className ?? "").includes("line-clamp-1"),
    );
    expect(preview).toBeUndefined();
  });
});

describe("TaskCard — claim affordance", () => {
  it("renders Claim for an open task and fires claimProjectTask on tap", () => {
    renderCard({ task: task({ status: "open" }), allTasks: [task()] });
    const claim = Array.from(container.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Claim this task",
    );
    expect(claim).toBeDefined();
    act(() => {
      claim!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(claimProjectTaskMock).toHaveBeenCalledTimes(1);
    expect(claimProjectTaskMock).toHaveBeenCalledWith("t1", viewerKey);
  });

  it("does not render Claim to the organizer", () => {
    renderCard({
      task: task({ status: "open" }),
      isOrganizer: true,
      allTasks: [task()],
    });
    const claim = Array.from(container.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Claim this task",
    );
    expect(claim).toBeUndefined();
  });
});
