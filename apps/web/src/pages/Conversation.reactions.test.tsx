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

// Emoji reactions: long-press (or the hover/keyboard button) opens a
// picker; picking sends a sealed reaction envelope; chips render each
// party's current reaction. The data layer is mocked — these tests
// own the interaction contract only.

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
vi.mock("@/lib/syncLoop", () => ({
  SYNC_KICK_EVENT: "understoria:sync-kick",
}));

import "@/i18n";
import ConversationPage, { LONG_PRESS_MS } from "./Conversation";
import { sendReaction, type DecryptedMessage } from "@/db/messages";
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

let mockMessages: DecryptedMessage[] = [];

function makeMessage(
  overrides: Partial<DecryptedMessage> & { id: string },
): DecryptedMessage {
  return {
    conversationId: "me-key|them-key",
    senderKey: "them-key",
    recipientKey: "me-key",
    nonce: "n",
    ciphertext: "c",
    createdAt: Date.now(),
    plaintext: "hello",
    ...overrides,
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  vi.useFakeTimers();
  mockMessages = [];
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

async function render() {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/messages/them-key"]}>
        <Routes>
          <Route path="/messages/:memberKey" element={<ConversationPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await vi.advanceTimersByTimeAsync(0);
  });
}

function bubble(): HTMLElement {
  const el = Array.from(container.querySelectorAll("div")).find((d) =>
    d.className.includes("rounded-xl px-3 py-2"),
  );
  if (!el) throw new Error("Message bubble not found");
  return el as HTMLElement;
}

function pickerButtons(): HTMLButtonElement[] {
  return Array.from(
    container.querySelectorAll('button[role="menuitem"]'),
  ) as HTMLButtonElement[];
}

describe("ConversationPage — emoji reactions", () => {
  it("long-press opens the picker; a short tap does not", async () => {
    mockMessages = [makeMessage({ id: "m1" })];
    await render();

    // Short tap: press, release before the threshold.
    await act(async () => {
      bubble().dispatchEvent(
        new Event("pointerdown", { bubbles: true }),
      );
      await vi.advanceTimersByTimeAsync(LONG_PRESS_MS / 2);
      bubble().dispatchEvent(new Event("pointerup", { bubbles: true }));
      await vi.advanceTimersByTimeAsync(LONG_PRESS_MS);
    });
    expect(pickerButtons()).toHaveLength(0);

    // Long press: hold past the threshold.
    await act(async () => {
      bubble().dispatchEvent(
        new Event("pointerdown", { bubbles: true }),
      );
      await vi.advanceTimersByTimeAsync(LONG_PRESS_MS + 50);
    });
    expect(pickerButtons().length).toBeGreaterThan(0);
  });

  it("scroll-cancel (pointercancel) never opens the picker", async () => {
    mockMessages = [makeMessage({ id: "m1" })];
    await render();
    await act(async () => {
      bubble().dispatchEvent(
        new Event("pointerdown", { bubbles: true }),
      );
      bubble().dispatchEvent(
        new Event("pointercancel", { bubbles: true }),
      );
      await vi.advanceTimersByTimeAsync(LONG_PRESS_MS + 100);
    });
    expect(pickerButtons()).toHaveLength(0);
  });

  it("picking an emoji sends the reaction and closes the picker", async () => {
    mockMessages = [makeMessage({ id: "m1" })];
    await render();
    const openBtn = container.querySelector(
      'button[aria-label="React to this message"]',
    ) as HTMLButtonElement;
    expect(openBtn).not.toBeNull();
    await act(async () => {
      openBtn.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    const heart = pickerButtons().find((b) => b.textContent === "❤️");
    expect(heart).toBeDefined();
    await act(async () => {
      heart!.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(vi.mocked(sendReaction)).toHaveBeenCalledWith(
      "me-key",
      "them-key",
      "m1",
      "❤️",
    );
    expect(pickerButtons()).toHaveLength(0);
  });

  it("picking your CURRENT emoji sends a clear (empty emoji)", async () => {
    mockMessages = [
      makeMessage({
        id: "m1",
        reactions: [{ senderKey: "me-key", emoji: "❤️" }],
      }),
    ];
    await render();
    const openBtn = container.querySelector(
      'button[aria-label="React to this message"]',
    ) as HTMLButtonElement;
    await act(async () => {
      openBtn.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    const heart = pickerButtons().find((b) => b.textContent === "❤️");
    await act(async () => {
      heart!.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(vi.mocked(sendReaction)).toHaveBeenCalledWith(
      "me-key",
      "them-key",
      "m1",
      "",
    );
  });

  it("renders both parties' reaction chips, Escape closes the picker", async () => {
    mockMessages = [
      makeMessage({
        id: "m1",
        reactions: [
          { senderKey: "them-key", emoji: "🙏" },
          { senderKey: "me-key", emoji: "❤️" },
        ],
      }),
    ];
    await render();
    expect(bubble().textContent).toContain("🙏");
    expect(bubble().textContent).toContain("❤️");

    const openBtn = container.querySelector(
      'button[aria-label="React to this message"]',
    ) as HTMLButtonElement;
    await act(async () => {
      openBtn.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(pickerButtons().length).toBeGreaterThan(0);
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(pickerButtons()).toHaveLength(0);
  });
});
