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
// The "Reorder tasks" dialog is the SINGLE home for task reordering
// (the main task list carries no inline reorder handles — see
// docs/task-ordering-and-dependencies.md §3.2). So the dialog must be
// a strict superset of every reorder gesture: these tests lock the
// discrete Move up / Move down button path (the keyboard-canonical
// affordance) — neighbor computation, disabled ends, the live-region
// announcement, the error toast — plus the reduced-motion FLIP bail.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { reorderMock, showToastMock } = vi.hoisted(() => ({
  reorderMock: vi.fn(async (_opts: unknown) => undefined),
  showToastMock: vi.fn(),
}));

vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("@/db/projects", () => ({
  reorderProjectTask: reorderMock,
}));

import "@/i18n";
import { ReorderTasksDialog } from "./ReorderTasksDialog";
import type { ProjectTask } from "@/types";

const organizerKey = "organizer-key";

function task(id: string, overrides: Partial<ProjectTask> = {}): ProjectTask {
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

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
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

function render(tasks: readonly ProjectTask[]) {
  act(() => {
    root = createRoot(container);
    root.render(
      <ReorderTasksDialog
        open
        tasks={tasks}
        projectId="proj-1"
        organizerKey={organizerKey}
        onClose={() => {}}
      />,
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
  // The dialog renders into a portal-less fixed overlay under document.body
  // via React; query the whole document to be safe.
  const btn = document.querySelector(
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

describe("ReorderTasksDialog — Move buttons", () => {
  it("Move up on the first task is disabled", () => {
    render([
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ]);
    const btn = moveButton("First", "up");
    expect(btn.getAttribute("aria-disabled")).toBe("true");
    expect(btn.disabled).toBe(true);
  });

  it("Move down on the last task is disabled", () => {
    render([
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ]);
    const btn = moveButton("Second", "down");
    expect(btn.getAttribute("aria-disabled")).toBe("true");
    expect(btn.disabled).toBe(true);
  });

  it("Move down on the first task calls reorderProjectTask with the right neighbors", async () => {
    render([
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
      task("t3", { title: "Third", orderIndex: 3000 }),
    ]);
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

  it("Move up recomputes neighbors from the current order", async () => {
    render([
      task("t1", { title: "Alpha", orderIndex: 1000 }),
      task("t2", { title: "Beta", orderIndex: 2000 }),
      task("t3", { title: "Gamma", orderIndex: 3000 }),
    ]);
    // Moving Gamma up by one lands it between Alpha and Beta.
    clickButton(moveButton("Gamma", "up"));
    await flush();
    expect(reorderMock).toHaveBeenCalledTimes(1);
    expect(reorderMock.mock.calls[0][0]).toMatchObject({
      taskId: "t3",
      organizerKey,
      beforeId: "t1",
      afterId: "t2",
    });
  });

  it("Successful move emits a live-region announcement", async () => {
    render([
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ]);
    clickButton(moveButton("First", "down"));
    await flush();
    const live = document.querySelector(
      '[data-testid="reorder-dialog-live-region"]',
    );
    expect(live).not.toBeNull();
    expect(live?.textContent ?? "").toContain("First moved to position 2");
  });

  it("Failed move surfaces an error toast", async () => {
    reorderMock.mockRejectedValueOnce(new Error("nope"));
    render([
      task("t1", { title: "First", orderIndex: 1000 }),
      task("t2", { title: "Second", orderIndex: 2000 }),
    ]);
    clickButton(moveButton("First", "down"));
    await flush();
    expect(showToastMock).toHaveBeenCalled();
  });
});

describe("ReorderTasksDialog — FLIP animation", () => {
  it("bails on prefers-reduced-motion (no transform applied to rows)", async () => {
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
      render([
        task("t1", { title: "First", orderIndex: 1000 }),
        task("t2", { title: "Second", orderIndex: 2000 }),
      ]);
      await flush();
      const rows = document.querySelectorAll('[role="dialog"] li');
      expect(rows.length).toBeGreaterThan(0);
      for (const el of Array.from(rows)) {
        expect((el as HTMLElement).style.transform).toBe("");
      }
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
