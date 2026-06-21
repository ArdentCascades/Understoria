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
 * Post detail header overflow menu (`/post/:id`). Covers the kebab that
 * carries Copy link (always) plus the poster-only Repost / Post-again
 * actions that moved off the inline ActionPanel. Asserts: the trigger
 * exists with the right a11y contract, Copy link writes the canonical
 * `/post/<id>` URL and toasts, a poster on an OPEN post gets the repost
 * menuitem, and the old inline "Repost with changes" button is gone from
 * the action panel.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { showToastMock, writeTextMock } = vi.hoisted(() => ({
  showToastMock: vi.fn(),
  writeTextMock: vi.fn(async (_url: string) => undefined),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
    dismissToast: vi.fn(),
    toast: null,
  }),
}));
vi.mock("@/db/actions", () => ({
  cancelPost: vi.fn(),
  claimPost: vi.fn(),
  confirmExchange: vi.fn(),
  disputeExchange: vi.fn(),
  unclaimPost: vi.fn(),
}));

import "@/i18n";
import PostDetailPage from "./PostDetail";
import type { Member, Post } from "@/types";

const nodeId = "node_test";
const posterKey = "poster-key";
const viewerKey = "viewer-key";

function member(publicKey: string, displayName: string): Member {
  return {
    publicKey,
    displayName,
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId,
    locationZone: "",
  };
}

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-1",
    type: "NEED",
    category: "food",
    title: "Help carrying groceries",
    description: "",
    estimatedHours: 2,
    urgency: "low",
    postedBy: posterKey,
    claimedBy: null,
    status: "open",
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId,
    signature: "",
    ...overrides,
  };
}

interface MockState {
  posts: Post[];
  members: Member[];
  currentMember: Member | null;
  nodeId: string;
  nodeConfig: { autoConfirmHours: number };
  proposals: unknown[];
}

let mockState: MockState;

function freshState(): MockState {
  return {
    posts: [post()],
    members: [member(posterKey, "Pat Poster"), member(viewerKey, "Vic Viewer")],
    currentMember: member(viewerKey, "Vic Viewer"),
    nodeId,
    nodeConfig: { autoConfirmHours: 168 },
    proposals: [],
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = freshState();
  showToastMock.mockClear();
  writeTextMock.mockClear();
  writeTextMock.mockResolvedValue(undefined);
  // Copy link routes through @/lib/share. Force the clipboard path by
  // removing navigator.share (jsdom has no native share sheet anyway)
  // and stubbing navigator.clipboard.writeText so the URL is observable.
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: writeTextMock },
  });
  if ("share" in navigator) {
    delete (navigator as { share?: unknown }).share;
  }
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(initialPath = "/post/post-1") {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/post/:id" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

function menuTrigger(): HTMLButtonElement {
  const btn = container.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="menu"]',
  );
  if (!btn) throw new Error("post header menu trigger not found");
  return btn;
}

function openMenu() {
  act(() => {
    menuTrigger().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function menuItemByText(label: string): HTMLButtonElement | undefined {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'),
  ).find((b) => (b.textContent ?? "").trim() === label);
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("PostDetailPage — header overflow menu", () => {
  it("renders the kebab trigger with aria-haspopup=menu and the post-actions label", () => {
    render();
    const trigger = menuTrigger();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-label")).toBe("Post actions");
  });

  it("opening the menu always shows a Copy link item", () => {
    // Plain viewer (not the poster) still gets Copy link.
    render();
    openMenu();
    expect(menuItemByText("Copy link")).toBeDefined();
  });

  it("selecting Copy link writes the canonical /post/<id> URL and toasts the confirmation", async () => {
    render();
    openMenu();
    const item = menuItemByText("Copy link");
    expect(item).toBeDefined();
    act(() => {
      item!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();
    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock).toHaveBeenCalledWith(
      `${window.location.origin}/post/post-1`,
    );
    expect(showToastMock).toHaveBeenCalledWith("Link copied to your clipboard.");
  });

  it("a poster on an OPEN post sees the Repost menuitem; the old inline button is gone", () => {
    mockState.currentMember = member(posterKey, "Pat Poster");
    render();
    // The inline "Repost with changes" button is gone from the action
    // panel — it folded into the kebab.
    expect(
      Array.from(container.querySelectorAll("button")).some(
        (b) => (b.textContent ?? "").trim() === "Repost with changes",
      ),
    ).toBe(false);
    openMenu();
    expect(menuItemByText("Repost with changes")).toBeDefined();
    // Copy link is still present alongside it.
    expect(menuItemByText("Copy link")).toBeDefined();
  });

  it("does NOT offer Repost to a non-poster on an OPEN post", () => {
    mockState.currentMember = member(viewerKey, "Vic Viewer");
    render();
    openMenu();
    expect(menuItemByText("Repost with changes")).toBeUndefined();
  });

  it("a poster on a COMPLETED post sees Post-again in the menu (and no inline post-again button)", () => {
    mockState.posts = [
      post({ status: "completed", claimedBy: viewerKey }),
    ];
    mockState.currentMember = member(posterKey, "Pat Poster");
    render();
    expect(
      Array.from(container.querySelectorAll("button")).some(
        (b) => (b.textContent ?? "").trim() === "Post this again",
      ),
    ).toBe(false);
    openMenu();
    expect(menuItemByText("Post this again")).toBeDefined();
    // Repost-with-changes is an open-only action; it must NOT appear on
    // a completed post.
    expect(menuItemByText("Repost with changes")).toBeUndefined();
  });
});
