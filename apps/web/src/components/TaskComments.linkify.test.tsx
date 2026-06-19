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
 * Render-site coverage for the comment-body linkifier: a pasted URL in
 * a comment body should surface as a real <a> (new tab, noopener) and
 * the body container should carry the overflow-wrap guard so a long
 * URL wraps instead of blowing the card open. The linkify unit tests
 * cover the splitting logic; this asserts the wiring at the surface
 * the operator reported.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TaskComment } from "@/types";

// useLiveQuery feeds the thread; point it at a controllable array so we
// can render a single comment with a URL body without a Dexie session.
let liveComments: TaskComment[] = [];
vi.mock("dexie-react-hooks", () => ({ useLiveQuery: () => liveComments }));
vi.mock("@/state/AppContext", () => ({
  useApp: () => ({ blockedKeys: new Set<string>() }),
}));

import "@/i18n";
import { TaskComments } from "./TaskComments";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function comment(body: string): TaskComment {
  return {
    id: "c1",
    projectId: "proj-1",
    taskId: "task-1",
    authorKey: "author-key",
    body,
    createdAt: 0,
    deletedAt: null,
    nodeId: "node-1",
    signature: "sig",
  };
}

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <TaskComments
        projectId="proj-1"
        taskId="task-1"
        currentKey="viewer-key"
        memberMap={new Map([["author-key", "Rowan"]])}
        nodeId="node-1"
        flaggedCommentIds={new Set()}
      />,
    );
  });
  // The thread is collapsed by default — expand it to reach the bodies.
  const toggle = container.querySelector("button");
  act(() => {
    toggle?.click();
  });
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  liveComments = [];
});

describe("TaskComments URL linkification", () => {
  it("renders a pasted URL as a new-tab anchor", () => {
    liveComments = [comment("ref https://example.com/login?return_to=%2Fx")];
    render();

    const anchor = container.querySelector("a");
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("href")).toBe(
      "https://example.com/login?return_to=%2Fx",
    );
    expect(anchor?.getAttribute("target")).toBe("_blank");
    expect(anchor?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("guards the comment body against overflow from long unbreakable strings", () => {
    liveComments = [comment("plain body, no link")];
    render();

    const body = Array.from(container.querySelectorAll("p")).find((p) =>
      p.textContent?.includes("plain body"),
    );
    expect(body?.className).toContain("whitespace-pre-wrap");
    expect(body?.className).toContain("[overflow-wrap:anywhere]");
  });

  it("leaves a comment without a URL as plain text (no anchor)", () => {
    liveComments = [comment("just a note about the hinges")];
    render();

    expect(container.querySelector("a")).toBeNull();
  });
});
