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
  // speak "succeeds" by default; tests reach the captured onDone via
  // vi.mocked(speak).mock.calls to end an utterance on demand.
  speak: vi.fn(() => true),
  stopSpeaking: vi.fn(),
  isSpeechAvailable: vi.fn(() => true),
}));

import "@/i18n";
import ConversationPage, {
  GROUP_WINDOW_MS,
  NEAR_BOTTOM_PX,
} from "./Conversation";
import { isSpeechAvailable, speak, stopSpeaking } from "@/lib/speak";
import { SHORT_LANDSCAPE_QUERY } from "@/lib/viewport";
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
  // clearAllMocks (afterEach) keeps implementations, so a test that
  // flips availability off must not leak into its neighbors.
  vi.mocked(isSpeechAvailable).mockReturnValue(true);
  vi.mocked(speak).mockReturnValue(true);
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
    expect(speak).toHaveBeenCalledWith(
      "soup at six",
      "en",
      expect.any(Function),
    );
  });

  it("Speak shows a speaking state and returns to Speak when the utterance ends", async () => {
    mockMessages = [makeMessage({ id: "m1", plaintext: "soup at six" })];
    await render();
    await openMenu();
    await act(async () => {
      menuButtonByText("Speak")!.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    // While speaking, the item reads "Stop speaking".
    expect(menuButtonByText("Stop speaking")).not.toBeNull();
    expect(menuButtonByText("Speak")).toBeNull();
    // The utterance finishing (or erroring — same callback) puts the
    // label back.
    const onDone = vi.mocked(speak).mock.calls.at(-1)![2]!;
    await act(async () => {
      onDone();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(menuButtonByText("Stop speaking")).toBeNull();
    expect(menuButtonByText("Speak")).not.toBeNull();
  });

  it("tapping Stop speaking cancels speech and restores the Speak label", async () => {
    mockMessages = [makeMessage({ id: "m1", plaintext: "soup at six" })];
    await render();
    await openMenu();
    await act(async () => {
      menuButtonByText("Speak")!.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    await act(async () => {
      menuButtonByText("Stop speaking")!.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(stopSpeaking).toHaveBeenCalled();
    expect(menuButtonByText("Stop speaking")).toBeNull();
    expect(menuButtonByText("Speak")).not.toBeNull();
  });

  it("where the device can't speak, the item says so and is disabled", async () => {
    vi.mocked(isSpeechAvailable).mockReturnValue(false);
    mockMessages = [makeMessage({ id: "m1", plaintext: "soup at six" })];
    await render();
    await openMenu();
    const item = menuButtonByText("This device can't read messages aloud");
    expect(item).not.toBeNull();
    expect(item!.disabled).toBe(true);
    expect(menuButtonByText("Speak")).toBeNull();
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

  it("the composer shows the mic when empty and Send once there's text", async () => {
    mockMessages = [makeMessage({ id: "m1" })];
    await render();
    // Empty box → mic occupies the slot, no Send button.
    expect(buttonByLabel("Record a voice note")).not.toBeNull();
    expect(
      Array.from(container.querySelectorAll('button[type="submit"]')),
    ).toHaveLength(0);

    const ta = container.querySelector("textarea")!;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )!.set!;
    setter.call(ta, "soup at six?");
    await act(async () => {
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      await vi.advanceTimersByTimeAsync(0);
    });
    // Text present → Send replaces the mic.
    expect(buttonByLabel("Record a voice note")).toBeNull();
    expect(
      Array.from(container.querySelectorAll('button[type="submit"]')),
    ).toHaveLength(1);
  });

  it("a new message while scrolled up shows the ↓ chip instead of yanking; tapping it jumps down", async () => {
    const now = Date.now();
    mockMessages = [makeMessage({ id: "m1", createdAt: now - 60_000 })];
    await render();

    // Simulate a reader far from the bottom: give the list real
    // geometry (jsdom defaults everything to 0 = "at the bottom").
    const list = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("overflow-y-auto"),
    )! as HTMLDivElement;
    Object.defineProperty(list, "scrollHeight", {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(list, "clientHeight", {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(list, "scrollTop", {
      configurable: true,
      writable: true,
      value: 0, // 1600px from the bottom — well past NEAR_BOTTOM_PX
    });
    expect(2000 - 0 - 400).toBeGreaterThan(NEAR_BOTTOM_PX);
    const scrollToSpy = vi.fn();
    (list as unknown as { scrollTo: typeof scrollToSpy }).scrollTo =
      scrollToSpy;

    // A new incoming message lands on the next poll.
    mockMessages = [
      ...mockMessages,
      makeMessage({ id: "m2", createdAt: now }),
    ];
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_500);
    });

    // Not yanked — the chip appears instead.
    expect(scrollToSpy).not.toHaveBeenCalled();
    const chip = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("new message"),
    );
    expect(chip).toBeDefined();

    // Tapping the chip jumps to the latest and clears it.
    await act(async () => {
      chip!.click();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(scrollToSpy).toHaveBeenCalled();
    expect(
      Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("new message"),
      ),
    ).toBeUndefined();
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

// Landscape pass 2b: the auto-grow ceiling is read imperatively from
// composerHeightCapPx() on each input — ~6 lines (144px) normally,
// ~4 lines (96px) when the short-landscape media query matches, so
// the composer stops eating half of a ~400px-tall viewport.
describe("composer auto-grow cap", () => {
  async function typeWithScrollHeight(
    value: string,
    scrollHeight: number,
  ): Promise<HTMLTextAreaElement> {
    const ta = container.querySelector("textarea")!;
    // jsdom reports scrollHeight 0 (the handler deliberately skips
    // then); give the box real-looking geometry.
    Object.defineProperty(ta, "scrollHeight", {
      configurable: true,
      value: scrollHeight,
    });
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )!.set!;
    setter.call(ta, value);
    await act(async () => {
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      await vi.advanceTimersByTimeAsync(0);
    });
    return ta;
  }

  it("follows the content below the cap", async () => {
    mockMessages = [makeMessage({ id: "m1" })];
    await render();
    const ta = await typeWithScrollHeight("soup at six?", 60);
    expect(ta.style.height).toBe("60px");
  });

  it("caps at 144px in the normal regime", async () => {
    mockMessages = [makeMessage({ id: "m1" })];
    await render();
    const ta = await typeWithScrollHeight("a very long draft", 500);
    expect(ta.style.height).toBe("144px");
  });

  it("caps at 96px when the short-landscape query matches", async () => {
    const original = window.matchMedia;
    (
      window as unknown as { matchMedia: (q: string) => MediaQueryList }
    ).matchMedia = (query: string) =>
      ({
        matches: query === SHORT_LANDSCAPE_QUERY,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
    try {
      mockMessages = [makeMessage({ id: "m1" })];
      await render();
      const ta = await typeWithScrollHeight("a very long draft", 500);
      expect(ta.style.height).toBe("96px");
    } finally {
      (
        window as unknown as { matchMedia: typeof window.matchMedia }
      ).matchMedia = original;
    }
  });
});
