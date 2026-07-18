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
 * Failed-submit scroll-to-error (round-3 papercut). On a short
 * viewport (landscape phone) the title field can be scrolled
 * off-screen when the member taps Post — the inline error rendered,
 * but out of sight, so the tap looked like "nothing happened". Locks:
 *   1. Submitting with a missing required title marks the field
 *      aria-invalid AND moves focus to it (focusFirstInvalidField —
 *      the focus is what drags the field on-screen and makes screen
 *      readers announce the error).
 *   2. Nothing is posted on the failed submit.
 *   3. A valid submit still goes through and does NOT steal focus
 *      into a field.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createPostMock } = vi.hoisted(() => ({
  createPostMock: vi.fn(async () => ({}) as unknown),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockApp }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("@/db/actions", () => ({
  createPost: createPostMock,
  cancelPost: vi.fn(async () => undefined),
}));
vi.mock("@/db/drafts", () => ({
  clearDraft: vi.fn(async () => undefined),
  loadDraft: vi.fn(async () => null),
}));
vi.mock("@/lib/useDraftAutosave", () => ({
  useDraftAutosave: () => undefined,
}));

import "@/i18n";
import PostFormPage from "./PostForm";
import type { Member, Post } from "@/types";

let mockApp: {
  currentMember: Pick<Member, "publicKey" | "locationZone"> | null;
  posts: Post[];
  nodeId: string;
  projects: unknown[];
  projectTasks: unknown[];
};

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockApp = {
    currentMember: { publicKey: "me-key", locationZone: "" },
    posts: [],
    nodeId: "node-1",
    projects: [],
    projectTasks: [],
  };
  createPostMock.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  delete (Element.prototype as unknown as { scrollIntoView?: unknown })
    .scrollIntoView;
});

async function render() {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/post/new?type=NEED"]}>
        <PostFormPage />
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
}

function submitForm() {
  const form = container.querySelector("form")!;
  act(() => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });
}

// focusFirstInvalidField defers one animation frame (jsdom rAF runs
// on a real ~16ms timer) — wait it out.
async function flushDeferred() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 50));
  });
}

function titleInput(): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>(
    'input[maxlength="120"]',
  );
  if (!input) throw new Error("title input not found");
  return input;
}

describe("PostForm — scroll/focus to first invalid field on submit", () => {
  it("moves focus to the errored title field and blocks the post", async () => {
    const scrollSpy = vi.fn();
    (
      Element.prototype as unknown as { scrollIntoView: unknown }
    ).scrollIntoView = scrollSpy;
    await render();
    submitForm();
    // Inline error renders…
    expect(titleInput().getAttribute("aria-invalid")).toBe("true");
    // …and after the deferred frame, the field is scrolled into view
    // and holds focus.
    await flushDeferred();
    expect(document.activeElement).toBe(titleInput());
    expect(scrollSpy).toHaveBeenCalledWith({
      block: "center",
      behavior: "smooth",
    });
    expect(createPostMock).not.toHaveBeenCalled();
  });

  it("a valid submit posts and does not steal focus into a field", async () => {
    await render();
    act(() => {
      const input = titleInput();
      // React reads the value through its onChange plumbing.
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(input, "Need a hand moving compost");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    submitForm();
    await flushDeferred();
    expect(createPostMock).toHaveBeenCalledTimes(1);
    expect(document.activeElement).not.toBe(titleInput());
  });
});
