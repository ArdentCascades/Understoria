/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Post-submit landing tab. Posting a NEED must land the member on the
 * board's Needs tab (`/?tab=needs`), and an OFFER on Offers — seeing
 * your own post appear is the confirmation that matters. Before this
 * lock, `navigate("/")` dropped the member on the board's default
 * landing tab (Projects), hiding the post they just made.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createPostMock, showToastMock } = vi.hoisted(() => ({
  createPostMock: vi.fn(async () => ({}) as unknown),
  showToastMock: vi.fn(),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockApp }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("@/db/actions", () => ({
  createPost: createPostMock,
  cancelPost: vi.fn(async () => undefined),
}));
// Drafts touch Dexie; stub the seam — this suite is about navigation.
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
let lastLocation: { pathname: string; search: string } | null = null;

function LocationProbe() {
  lastLocation = useLocation();
  return null;
}

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
  showToastMock.mockClear();
  lastLocation = null;
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
        <LocationProbe />
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
}

// React 18 swallows direct `.value =` writes (its value tracker sees
// no change); go through the native setter so the input event counts.
function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function fillTitleAndSubmit(title: string) {
  const titleInput = container.querySelector<HTMLInputElement>(
    'input[maxlength="120"]',
  );
  expect(titleInput).not.toBeNull();
  setInputValue(titleInput!, title);
  const form = container.querySelector("form");
  expect(form).not.toBeNull();
  await act(async () => {
    form!.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    // Let createPost → clearDraft → toast → navigate settle.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("PostForm — post-submit landing tab", () => {
  it("posting a NEED lands on the board's Needs tab", async () => {
    await render("/post/new");
    await fillTitleAndSubmit("Help carrying groceries");
    expect(createPostMock).toHaveBeenCalledTimes(1);
    expect(showToastMock).toHaveBeenCalledWith(
      "Posted. Your need is live on the board.",
    );
    expect(lastLocation?.pathname).toBe("/");
    expect(lastLocation?.search).toBe("?tab=needs");
  });

  it("posting an OFFER lands on the board's Offers tab", async () => {
    await render("/post/new?type=OFFER");
    await fillTitleAndSubmit("Soup for anyone who wants it");
    expect(createPostMock).toHaveBeenCalledTimes(1);
    expect(showToastMock).toHaveBeenCalledWith(
      "Posted. Your offer is live on the board.",
    );
    expect(lastLocation?.pathname).toBe("/");
    expect(lastLocation?.search).toBe("?tab=offers");
  });
});
