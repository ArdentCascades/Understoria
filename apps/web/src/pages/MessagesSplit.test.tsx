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
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Landscape pass 2b: the sideways-phone split regime. With the
// SPLIT_CAPABLE media query matching, the MessagesShell renders the
// conversation list beside the open thread even though the viewport
// is far below lg; without it, the shell keeps today's single-pane
// collapse. The route tree here mirrors App.tsx exactly (shell with
// an index placeholder and the :memberKey conversation as nested
// children) so what these tests exercise is the real composition.

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
// One mock serves both panes: the shell reads listConversations /
// searchAllMessages, the thread reads getConversation (whose call
// count doubles as the remount detector below).
vi.mock("@/db/messages", () => ({
  listConversations: vi.fn(async () => mockConversations),
  searchAllMessages: vi.fn(async () => []),
  getConversation: vi.fn(async () => mockMessages),
  sendMessage: vi.fn(async () => undefined),
  sendReaction: vi.fn(async () => undefined),
}));
vi.mock("@/db/blocks", () => ({
  isBlocked: vi.fn(async () => false),
  BLOCK_NOTE_MAX_LENGTH: 500,
  BlockActionError: class BlockActionError extends Error {},
  blockMember: vi.fn(async () => undefined),
  unblockMember: vi.fn(async () => undefined),
}));
vi.mock("@/lib/federationSync", () => ({
  pullFederatedMessages: vi.fn(async () => null),
}));

import "@/i18n";
import MessagesShell, { MessagesEmptyPane } from "./Messages";
import ConversationPage from "./Conversation";
import { getConversation, type ConversationSummary, type DecryptedMessage } from "@/db/messages";
import { SPLIT_CAPABLE_QUERY } from "@/lib/viewport";
import type { Member } from "@/types";

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

const mockState = {
  currentMember: makeMember("me-key", "Me"),
  members: [
    makeMember("me-key", "Me"),
    makeMember("them-key", "Riverbend"),
    makeMember("other-key", "Maria"),
  ],
  posts: [],
  lockState: "unlocked" as const,
  blockedKeys: new Set<string>(),
};

let mockConversations: ConversationSummary[] = [];
let mockMessages: DecryptedMessage[] = [];

function makeConv(otherKey: string, plaintext: string): ConversationSummary {
  return {
    otherKey,
    lastMessage: {
      id: `${otherKey}-last`,
      conversationId: `${otherKey}-conv`,
      senderKey: otherKey,
      recipientKey: "me-key",
      nonce: "n",
      ciphertext: "c",
      createdAt: 1000,
      plaintext,
    },
  };
}

// --- Controllable matchMedia stub -----------------------------------
// `useMediaQuery` subscribes to "change" events; this stub keeps a
// per-query listener registry so a test can flip a query and notify,
// simulating a rotation without touching the React tree.
let mediaMatches: Record<string, boolean> = {};
const mediaListeners = new Map<string, Set<() => void>>();

function installMatchMedia() {
  (
    window as unknown as { matchMedia: (q: string) => MediaQueryList }
  ).matchMedia = (query: string) => {
    let listeners = mediaListeners.get(query);
    if (!listeners) {
      listeners = new Set();
      mediaListeners.set(query, listeners);
    }
    const captured = listeners;
    return {
      get matches() {
        return mediaMatches[query] === true;
      },
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_type: string, cb: () => void) => {
        captured.add(cb);
      },
      removeEventListener: (_type: string, cb: () => void) => {
        captured.delete(cb);
      },
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  };
}

/** Flip a media query and fire its change listeners — a rotation. */
function setMedia(query: string, matches: boolean) {
  mediaMatches[query] = matches;
  act(() => {
    for (const cb of mediaListeners.get(query) ?? []) cb();
  });
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockConversations = [];
  mockMessages = [];
  mediaMatches = {};
  mediaListeners.clear();
  installMatchMedia();
  container = document.createElement("div");
  document.body.appendChild(container);
  if (typeof Element.prototype.scrollIntoView !== "function") {
    Element.prototype.scrollIntoView = () => {};
  }
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.clearAllMocks();
});

// The exact nesting from App.tsx — shell, index placeholder,
// conversation child.
function render(initialEntry: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/messages" element={<MessagesShell />}>
            <Route index element={<MessagesEmptyPane />} />
            <Route path=":memberKey" element={<ConversationPage />} />
          </Route>
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

function listPane(): HTMLDivElement {
  return container.firstElementChild!.children[0] as HTMLDivElement;
}
function threadPane(): HTMLDivElement {
  return container.firstElementChild!.children[1] as HTMLDivElement;
}
function backLink(): HTMLAnchorElement | null {
  return container.querySelector('a[href="/messages"]');
}

describe("MessagesShell — sideways split regime", () => {
  it("renders list and thread side by side, marks the open row, hides the back link", async () => {
    mediaMatches[SPLIT_CAPABLE_QUERY] = true;
    mockConversations = [
      makeConv("them-key", "see you at the tool library"),
      makeConv("other-key", "compost drop-off?"),
    ];
    render("/messages/them-key");
    await flushPromises();

    // Both panes at once: the list (search box + rows) and the
    // thread (composer textarea).
    expect(container.querySelector('input[type="search"]')).not.toBeNull();
    expect(container.querySelector("textarea")).not.toBeNull();
    expect(listPane().className).not.toContain("hidden");
    expect(listPane().className).toContain("border-r");
    expect(container.firstElementChild!.className).toContain("grid-cols-");

    // The open conversation's row carries the selected state.
    const selected = container.querySelector('a[aria-current="page"]');
    expect(selected).not.toBeNull();
    expect(selected!.getAttribute("href")).toBe(
      `/messages/${encodeURIComponent("them-key")}`,
    );

    // The thread's back-to-Messages link is redundant beside the
    // visible list — gone in split mode.
    expect(backLink()).toBeNull();
  });

  it("on /messages with nothing open, shows the list beside the placeholder pane", async () => {
    mediaMatches[SPLIT_CAPABLE_QUERY] = true;
    mockConversations = [makeConv("them-key", "see you at the tool library")];
    render("/messages");
    await flushPromises();

    expect(container.querySelector('input[type="search"]')).not.toBeNull();
    expect(threadPane().className).not.toContain("hidden");
    expect(threadPane().textContent).toContain(
      "Pick a conversation from the list.",
    );
  });

  it("without the split query, a thread route keeps today's single-pane collapse", async () => {
    mockConversations = [makeConv("them-key", "see you at the tool library")];
    render("/messages/them-key");
    await flushPromises();

    // List hidden below lg, thread full-screen with its back link.
    expect(listPane().className).toContain("hidden");
    expect(container.querySelector("textarea")).not.toBeNull();
    expect(backLink()).not.toBeNull();
  });

  it("without the split query, /messages keeps the full-width list and hides the placeholder below lg", async () => {
    mockConversations = [makeConv("them-key", "see you at the tool library")];
    render("/messages");
    await flushPromises();

    expect(listPane().className).not.toContain("hidden");
    expect(threadPane().className).toContain("hidden");
    expect(threadPane().className).toContain("lg:block");
  });

  it("rotating in and out of split mode never remounts the thread or drops its state", async () => {
    mediaMatches[SPLIT_CAPABLE_QUERY] = true;
    mockConversations = [makeConv("them-key", "see you at the tool library")];
    render("/messages/them-key");
    await flushPromises();

    // A half-typed draft is the state a remount would destroy.
    const ta = container.querySelector("textarea")!;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )!.set!;
    act(() => {
      setter.call(ta, "half-typed draft");
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(ta.value).toBe("half-typed draft");
    // getConversation runs once per ConversationView mount (the
    // load effect) — the cheapest honest remount detector.
    const callsAfterMount = vi.mocked(getConversation).mock.calls.length;

    // Rotate back to portrait: split off.
    setMedia(SPLIT_CAPABLE_QUERY, false);
    await flushPromises();
    // The layout really switched (back link returned, list hidden)…
    expect(backLink()).not.toBeNull();
    expect(listPane().className).toContain("hidden");
    // …but the SAME textarea node still holds the draft, and no
    // fresh mount re-fetched the thread.
    expect(container.querySelector("textarea")).toBe(ta);
    expect(ta.value).toBe("half-typed draft");
    expect(vi.mocked(getConversation).mock.calls.length).toBe(callsAfterMount);

    // And back to landscape: split on again, still the same mount.
    setMedia(SPLIT_CAPABLE_QUERY, true);
    await flushPromises();
    expect(backLink()).toBeNull();
    expect(listPane().className).not.toContain("hidden");
    expect(container.querySelector("textarea")).toBe(ta);
    expect(ta.value).toBe("half-typed draft");
    expect(vi.mocked(getConversation).mock.calls.length).toBe(callsAfterMount);
  });
});
