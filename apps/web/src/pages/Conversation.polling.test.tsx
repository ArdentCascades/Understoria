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

// Chat-mode polling (docs/sync-liveness.md): while a conversation is
// OPEN and the tab visible, the page pulls the messages feed every
// CHAT_POLL_MS and refreshes the thread — plus an immediate tick on a
// server nudge (SYNC_KICK_EVENT) or on re-foregrounding. These tests
// drive the interval with fake timers and count the federation pulls.

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
// The polling effect's collaborators — the pull is the thing under
// test, so it must be observable; the kick-event NAME must match the
// one the sync loop exports.
vi.mock("@/lib/federationSync", () => ({
  pullFederatedMessages: vi.fn(async () => null),
}));
vi.mock("@/lib/syncLoop", () => ({
  SYNC_KICK_EVENT: "understoria:sync-kick",
}));

import "@/i18n";
import ConversationPage, { CHAT_POLL_MS } from "./Conversation";
import { getConversation } from "@/db/messages";
import { pullFederatedMessages } from "@/lib/federationSync";
import { SYNC_KICK_EVENT } from "@/lib/syncLoop";
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
  members: [makeMember("me-key", "Me"), makeMember("them-key", "Riverbend")],
  posts: [],
  lockState: "unlocked" as const,
  blockedKeys: new Set<string>(),
};

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  setVisibility("visible");
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

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/messages/them-key"]}>
        <Routes>
          <Route path="/messages/:memberKey" element={<ConversationPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("ConversationPage — chat-mode polling", () => {
  it("pulls the messages feed every CHAT_POLL_MS and refreshes the thread", async () => {
    render();
    await advance(0);
    expect(pullFederatedMessages).not.toHaveBeenCalled();
    const loadsBefore = vi.mocked(getConversation).mock.calls.length;

    await advance(CHAT_POLL_MS);
    expect(pullFederatedMessages).toHaveBeenCalledTimes(1);
    // The pull is followed by a local reload so the new rows render.
    expect(vi.mocked(getConversation).mock.calls.length).toBe(
      loadsBefore + 1,
    );

    await advance(CHAT_POLL_MS * 2);
    expect(pullFederatedMessages).toHaveBeenCalledTimes(3);
  });

  it("skips ticks while the tab is hidden, resumes on visibilitychange", async () => {
    render();
    await advance(0);

    setVisibility("hidden");
    await advance(CHAT_POLL_MS * 3);
    expect(pullFederatedMessages).not.toHaveBeenCalled();

    setVisibility("visible");
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await vi.advanceTimersByTimeAsync(0);
    });
    // Re-foregrounding ticks immediately — no interval-remainder wait.
    expect(pullFederatedMessages).toHaveBeenCalledTimes(1);
  });

  it("a server nudge (SYNC_KICK_EVENT) ticks immediately", async () => {
    render();
    await advance(0);
    await act(async () => {
      window.dispatchEvent(new Event(SYNC_KICK_EVENT));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(pullFederatedMessages).toHaveBeenCalledTimes(1);
  });

  it("a poll tick that changes nothing does not re-scroll the thread (iOS keyboard lurch)", async () => {
    // The field report: with the composer focused on iOS, the screen
    // lurched every poll tick. Cause: the auto-scroll keyed on the
    // messages ARRAY (fresh identity every reload) instead of on the
    // last message, and used scrollIntoView (which iOS may answer by
    // panning the whole page). Now the list container scrolls, and
    // only when the last message actually changed.
    const msg = {
      id: "m1",
      senderKey: "them-key",
      recipientKey: "me-key",
      plaintext: "Hey there!",
      createdAt: 1,
      reactions: [],
    };
    vi.mocked(getConversation).mockResolvedValue([
      msg,
    ] as unknown as Awaited<ReturnType<typeof getConversation>>);
    const scrollToSpy = vi.fn();
    (
      Element.prototype as unknown as { scrollTo: typeof scrollToSpy }
    ).scrollTo = scrollToSpy;
    try {
      render();
      await advance(0);
      const scrollsAfterMount = scrollToSpy.mock.calls.length;

      // Three ticks, same single message every time.
      await advance(CHAT_POLL_MS * 3);
      expect(scrollToSpy.mock.calls.length).toBe(scrollsAfterMount);
    } finally {
      delete (Element.prototype as unknown as { scrollTo?: unknown }).scrollTo;
    }
  });

  it("leaving the conversation stops the polling", async () => {
    render();
    await advance(CHAT_POLL_MS);
    expect(pullFederatedMessages).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
    await advance(CHAT_POLL_MS * 3);
    expect(pullFederatedMessages).toHaveBeenCalledTimes(1);

    // The nudge listener is gone too — no zombie pulls after unmount.
    await act(async () => {
      window.dispatchEvent(new Event(SYNC_KICK_EVENT));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(pullFederatedMessages).toHaveBeenCalledTimes(1);
  });
});
