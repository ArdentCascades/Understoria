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

// The Signal-informed thread shape: search tucked behind a header
// toggle, one timestamp per same-sender burst with day separators,
// and the long-press menu grown from an emoji picker into
// emoji + Copy / Speak / Info.

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
vi.mock("@/lib/speak", () => ({
  speak: vi.fn(),
  stopSpeaking: vi.fn(),
}));

import "@/i18n";
import ConversationPage, { GROUP_WINDOW_MS } from "./Conversation";
import { speak } from "@/lib/speak";
import type { DecryptedMessage } from "@/db/messages";
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

async function render(initialEntry = "/messages/them-key") {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/messages/:memberKey" element={<ConversationPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await vi.advanceTimersByTimeAsync(0);
  });
}

function buttonByLabel(label: string): HTMLButtonElement | null {
  return (
    (Array.from(
      container.querySelectorAll("button"),
    ) as HTMLButtonElement[]).find(
      (b) => b.getAttribute("aria-label") === label,
    ) ?? null
  );
}

function menuButtonByText(text: string): HTMLButtonElement | null {
  return (
    (Array.from(
      container.querySelectorAll('button[role="menuitem"]'),
    ) as HTMLButtonElement[]).find((b) => b.textContent?.includes(text)) ??
    null
  );
}

async function openMenu() {
  const open = buttonByLabel("React to this message");
  expect(open).not.toBeNull();
  await act(async () => {
    open!.click();
    await vi.advanceTimersByTimeAsync(0);
  });
}

describe("search behind a toggle", () => {
  it("is hidden by default; the header toggle opens it; ✕ closes and clears", async () => {
    mockMessages = [makeMessage({ id: "m1" })];
    await render();
    expect(container.querySelector('input[type="search"]')).toBeNull();

    await act(async () => {
      buttonByLabel("Search this conversation")!.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(container.querySelector('input[type="search"]')).not.toBeNull();

    await act(async () => {
      buttonByLabel("Close search")!.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(container.querySelector('input[type="search"]')).toBeNull();
  });

  it("a ?q= deep link opens pre-expanded", async () => {
    mockMessages = [makeMessage({ id: "m1" })];
    await render("/messages/them-key?q=hello");
    const input = container.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input!.value).toBe("hello");
  });
});

describe("grouped timestamps + day separators", () => {
  it("one timestamp per same-sender burst, one Today chip", async () => {
    const now = Date.now();
    mockMessages = [
      makeMessage({ id: "m1", createdAt: now - 60_000 }),
      makeMessage({ id: "m2", createdAt: now - 30_000 }),
      makeMessage({
        id: "m3",
        senderKey: "me-key",
        recipientKey: "them-key",
        createdAt: now,
      }),
    ];
    await render();
    // Two bursts (their pair + my single) → exactly two "just now"
    // time lines for three messages.
    const times = container.textContent!.split("just now").length - 1;
    expect(times).toBe(2);
    expect(container.textContent).toContain("Today");
  });

  it("a gap longer than the group window splits the burst", async () => {
    const now = Date.now();
    mockMessages = [
      makeMessage({ id: "m1", createdAt: now - GROUP_WINDOW_MS - 60_000 }),
      makeMessage({ id: "m2", createdAt: now }),
    ];
    await render();
    // Same sender, but the gap exceeds the window → both keep a time.
    const timeLines = Array.from(container.querySelectorAll("p")).filter(
      (p) => p.className.includes("text-right"),
    );
    expect(timeLines).toHaveLength(2);
  });
});

describe("the long-press menu actions", () => {
  it("offers Copy / Speak / Info alongside the emoji row", async () => {
    mockMessages = [makeMessage({ id: "m1", plaintext: "soup at six" })];
    await render();
    await openMenu();
    expect(menuButtonByText("Copy")).not.toBeNull();
    expect(menuButtonByText("Speak")).not.toBeNull();
    expect(menuButtonByText("Info")).not.toBeNull();
    // The emoji row is still there.
    expect(menuButtonByText("❤️")).not.toBeNull();
  });

  it("Copy writes the message text to the clipboard and confirms inline", async () => {
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    mockMessages = [makeMessage({ id: "m1", plaintext: "soup at six" })];
    await render();
    await openMenu();
    await act(async () => {
      menuButtonByText("Copy")!.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(writeText).toHaveBeenCalledWith("soup at six");
    expect(container.textContent).toContain("Copied");
    delete (navigator as unknown as { clipboard?: unknown }).clipboard;
  });

  it("Speak reads the message with the on-device voice", async () => {
    mockMessages = [makeMessage({ id: "m1", plaintext: "soup at six" })];
    await render();
    await openMenu();
    await act(async () => {
      menuButtonByText("Speak")!.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(speak).toHaveBeenCalledWith("soup at six", "en");
  });

  it("Info shows the sent time and the sealed note", async () => {
    mockMessages = [makeMessage({ id: "m1", plaintext: "soup at six" })];
    await render();
    await openMenu();
    await act(async () => {
      menuButtonByText("Info")!.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(container.textContent).toContain("Sent ");
    expect(container.textContent).toContain("Sealed end to end");
  });

  it("voice messages get Info but not Copy/Speak", async () => {
    mockMessages = [
      makeMessage({
        id: "m1",
        plaintext: null,
        voice: { audio: "AAAA", mime: "audio/webm", durationMs: 3000 },
      }),
    ];
    await render();
    await openMenu();
    expect(menuButtonByText("Copy")).toBeNull();
    expect(menuButtonByText("Speak")).toBeNull();
    expect(menuButtonByText("Info")).not.toBeNull();
  });
});
