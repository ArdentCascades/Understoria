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
 * Composer-draft persistence (round-3 stretch: half-typed messages
 * vanished on an app restart). The composer text persists to the
 * shared drafts store, debounced, keyed by BOTH the viewer and the
 * counterparty; it restores into an empty composer on mount and is
 * cleared by a successful send. State-only — the page's scroll
 * machinery is untouched and untested here.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));

vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    toast: null,
  }),
}));

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: () => false,
}));

vi.mock("@/db/messages", () => ({
  getConversation: vi.fn(async () => []),
  sendMessage: vi.fn(async () => undefined),
}));

vi.mock("@/db/blocks", () => ({
  isBlocked: vi.fn(async () => false),
  BLOCK_NOTE_MAX_LENGTH: 500,
  BlockActionError: class BlockActionError extends Error {},
  blockMember: vi.fn(async () => undefined),
  unblockMember: vi.fn(async () => undefined),
}));

// In-memory draft store standing in for the Dexie-backed one — the
// component's contract with it (key shape, payload, debounce, clear
// on send) is what this suite pins.
const { draftStore } = vi.hoisted(() => ({
  draftStore: new Map<string, string>(),
}));
vi.mock("@/db/drafts", () => ({
  loadDraft: vi.fn(async (key: string) =>
    draftStore.has(key)
      ? { payload: draftStore.get(key), updatedAt: 1 }
      : null,
  ),
  saveDraft: vi.fn(async (key: string, payload: unknown) => {
    draftStore.set(key, payload as string);
  }),
  clearDraft: vi.fn(async (key: string) => {
    draftStore.delete(key);
  }),
}));

import "@/i18n";
import ConversationPage, {
  DRAFT_SAVE_DEBOUNCE_MS,
  messageDraftKey,
} from "./Conversation";
import { clearDraft, saveDraft } from "@/db/drafts";
import { sendMessage } from "@/db/messages";
import type { Member, Post } from "@/types";

interface MockState {
  currentMember: Member | null;
  members: Member[];
  posts: Post[];
  lockState: "unlocked" | "locked" | "uninitialized";
  blockedKeys: ReadonlySet<string>;
}

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

let mockState: MockState;

const DRAFT_KEY = messageDraftKey("me-key", "them-key");

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = {
    currentMember: makeMember("me-key", "Me"),
    members: [makeMember("me-key", "Me"), makeMember("them-key", "Riverbend")],
    posts: [],
    lockState: "unlocked",
    blockedKeys: new Set<string>(),
  };
  draftStore.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
  if (typeof Element.prototype.scrollIntoView !== "function") {
    Element.prototype.scrollIntoView = () => {};
  }
  if (typeof window.matchMedia !== "function") {
    (window as unknown as { matchMedia: (q: string) => MediaQueryList }).matchMedia =
      (query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList;
  }
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.clearAllMocks();
  vi.useRealTimers();
});

function render(initialEntry = "/messages/them-key") {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/messages/:memberKey" element={<ConversationPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function composer(): HTMLTextAreaElement {
  const ta = container.querySelector("textarea");
  if (!ta) throw new Error("Composer textarea not found");
  return ta;
}

function typeIntoComposer(value: string) {
  const ta = composer();
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(ta, value);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function submitComposer() {
  const form = container.querySelector("form");
  if (!form) throw new Error("Composer form not found");
  await act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
  });
}

describe("ConversationPage — composer drafts survive a restart", () => {
  it("restores a stored draft into an empty composer on mount", async () => {
    draftStore.set(DRAFT_KEY, "half-typed thought");
    render();
    await flushPromises();
    expect(composer().value).toBe("half-typed thought");
  });

  it("keys the draft to viewer AND counterparty (no cross-member or cross-thread bleed)", async () => {
    draftStore.set(messageDraftKey("someone-else", "them-key"), "not mine");
    draftStore.set(messageDraftKey("me-key", "other-thread"), "wrong thread");
    render();
    await flushPromises();
    expect(composer().value).toBe("");
  });

  it("persists typed text after the debounce window", async () => {
    vi.useFakeTimers();
    render();
    await flushPromises();
    typeIntoComposer("meet at the tool library?");
    // Nothing hits the store until the debounce elapses…
    expect(vi.mocked(saveDraft)).not.toHaveBeenCalled();
    await advance(DRAFT_SAVE_DEBOUNCE_MS);
    expect(vi.mocked(saveDraft)).toHaveBeenCalledWith(
      DRAFT_KEY,
      "meet at the tool library?",
    );
    expect(draftStore.get(DRAFT_KEY)).toBe("meet at the tool library?");
  });

  it("clearing the composer clears the stored draft instead of saving whitespace", async () => {
    vi.useFakeTimers();
    draftStore.set(DRAFT_KEY, "old draft");
    render();
    await flushPromises();
    typeIntoComposer("second thought…");
    await advance(DRAFT_SAVE_DEBOUNCE_MS);
    typeIntoComposer("");
    await advance(DRAFT_SAVE_DEBOUNCE_MS);
    expect(vi.mocked(clearDraft)).toHaveBeenCalledWith(DRAFT_KEY);
    expect(draftStore.has(DRAFT_KEY)).toBe(false);
  });

  it("an untouched composer never clears a stored draft (mount is not a write)", async () => {
    vi.useFakeTimers();
    draftStore.set(DRAFT_KEY, "precious draft");
    render();
    await advance(DRAFT_SAVE_DEBOUNCE_MS * 3);
    await flushPromises();
    expect(vi.mocked(clearDraft)).not.toHaveBeenCalled();
    expect(draftStore.get(DRAFT_KEY)).toBe("precious draft");
  });

  it("a pending edit younger than the debounce flushes on unmount instead of being lost", async () => {
    vi.useFakeTimers();
    render();
    await flushPromises();
    typeIntoComposer("wait, one more thing");
    // Unmount BEFORE the debounce elapses (thread switch / nav away).
    act(() => {
      root.unmount();
    });
    expect(vi.mocked(saveDraft)).toHaveBeenCalledWith(
      DRAFT_KEY,
      "wait, one more thing",
    );
    expect(draftStore.get(DRAFT_KEY)).toBe("wait, one more thing");
  });

  it("a successful send clears the draft immediately", async () => {
    render();
    await flushPromises();
    typeIntoComposer("on my way");
    await submitComposer();
    expect(vi.mocked(sendMessage)).toHaveBeenCalledWith(
      "me-key",
      "them-key",
      "on my way",
      { aboutPostId: undefined },
    );
    expect(vi.mocked(clearDraft)).toHaveBeenCalledWith(DRAFT_KEY);
    expect(draftStore.has(DRAFT_KEY)).toBe(false);
  });
});
