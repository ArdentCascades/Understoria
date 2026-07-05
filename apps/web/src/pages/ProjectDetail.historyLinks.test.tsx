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
 * HistoryTimeline task rows are links (wayfinding audit): a task-typed
 * activity whose `data` carries the task's id links to
 * `/project/:id/task/:taskId` (absolute — the timeline also mounts on
 * the task page); rows without a stamped id stay plain text (never
 * title-matched); member names are never links.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ProjectActivity } from "@/types";

// HistoryTimeline's only data read is useLiveQuery(listActivityForProject).
// Feed it fixtures directly — the db layer is not under test here.
let mockActivities: ProjectActivity[] = [];
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: () => mockActivities,
}));

import "@/i18n";
import { HistoryTimeline } from "./ProjectDetail";

const projectId = "proj-1";
const actorKey = "actor-key";
const actorName = "Cara Helper";
const memberMap = new Map([[actorKey, actorName]]);

let seq = 0;
function activity(
  type: ProjectActivity["type"],
  data: Record<string, unknown> = {},
): ProjectActivity {
  seq += 1;
  return {
    id: `act-${seq}`,
    projectId,
    type,
    actorKey,
    data,
    createdAt: 1_000 + seq,
    nodeId: "node_test",
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockActivities = [];
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
      <MemoryRouter>
        <HistoryTimeline
          projectId={projectId}
          memberMap={memberMap}
          blockedKeys={new Set()}
        />
      </MemoryRouter>,
    );
  });
}

function links(): HTMLAnchorElement[] {
  return Array.from(container.querySelectorAll("a"));
}

describe("HistoryTimeline — task rows link to the task page", () => {
  it("links a task_claimed row to /project/:id/task/:taskId when data carries the id", () => {
    mockActivities = [activity("task_claimed", { taskId: "t1" })];
    render();
    const link = links().find((a) => a.textContent === "Task claimed");
    expect(link).toBeDefined();
    expect(link?.getAttribute("href")).toBe("/project/proj-1/task/t1");
  });

  it("links added / completed / confirmed rows too (each stamps taskId)", () => {
    mockActivities = [
      activity("task_added", { taskId: "t1", hours: 2 }),
      activity("task_completed", {
        taskId: "t2",
        estimatedHours: 2,
        actualHours: 3,
      }),
      activity("task_confirmed", { taskId: "t3", hours: 3 }),
    ];
    render();
    const hrefs = links().map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/project/proj-1/task/t1");
    expect(hrefs).toContain("/project/proj-1/task/t2");
    expect(hrefs).toContain("/project/proj-1/task/t3");
  });

  it("renders plain text when a task row's data has no taskId (no title-matching)", () => {
    mockActivities = [activity("task_claimed", {})];
    render();
    expect(container.textContent).toContain("Task claimed");
    expect(links()).toHaveLength(0);
  });

  it("links the task TITLE in a stepped-back row, leaving the member's name plain", () => {
    mockActivities = [
      activity("task_released_after_complete", {
        taskId: "t9",
        taskTitle: "Paint the fence",
      }),
    ];
    render();
    // The whole neutral sentence still reads inline...
    expect(container.textContent).toContain(
      "Cara Helper stepped back from Paint the fence",
    );
    // ...but only the title is the link.
    const link = links().find((a) => a.textContent === "Paint the fence");
    expect(link).toBeDefined();
    expect(link?.getAttribute("href")).toBe("/project/proj-1/task/t9");
    expect(link?.textContent).not.toContain("Cara Helper");
  });

  it("keeps a stepped-back row plain when its data has no taskId", () => {
    mockActivities = [
      activity("task_released_after_complete", { taskTitle: "Paint the fence" }),
    ];
    render();
    expect(container.textContent).toContain(
      "Cara Helper stepped back from Paint the fence",
    );
    expect(links()).toHaveLength(0);
  });

  it("never links member names, and never links non-task rows", () => {
    mockActivities = [
      activity("task_claimed", { taskId: "t1" }),
      activity("project_created", {}),
      activity("milestone_reached", { milestone: 50 }),
      activity("announcement", { body: "Fridge is live!" }),
    ];
    render();
    const anchors = links();
    // Exactly the one task link — nothing else in the list is a link.
    expect(anchors).toHaveLength(1);
    expect(anchors[0].getAttribute("href")).toBe("/project/proj-1/task/t1");
    // The actor's name renders (four rows) but never inside an anchor.
    expect(container.textContent).toContain(actorName);
    for (const a of anchors) {
      expect(a.textContent).not.toContain(actorName);
    }
  });
});
