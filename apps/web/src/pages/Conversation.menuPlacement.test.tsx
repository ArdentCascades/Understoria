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

// Long-press menu OPEN DIRECTION (round-3 landscape blocker): a
// bubble near the bottom of the visible thread used to unfold its
// menu entirely past the screen edge — the press looked like it did
// nothing. The menu now measures the bubble at open time
// (menuOpensUpward) and flips into an upward overlay when the room
// below is too small. jsdom has no layout, so these tests hand the
// helper real-looking rects and assert the class contract on the
// rendered menu.

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
import ConversationPage, {
  MENU_ESTIMATE_PX,
  menuOpensUpward,
} from "./Conversation";
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

/** A stand-in element whose only job is to answer
 *  getBoundingClientRect with the given box. */
function fakeEl(top: number, bottom: number): HTMLElement {
  return {
    getBoundingClientRect: () => ({
      top,
      bottom,
      height: bottom - top,
      left: 0,
      right: 100,
      width: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }),
  } as unknown as HTMLElement;
}

function setInnerHeight(px: number) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: px,
  });
}

let container: HTMLDivElement;
let root: Root;
const REAL_INNER_HEIGHT = window.innerHeight;

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
  setInnerHeight(REAL_INNER_HEIGHT);
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

function bubbles(): HTMLElement[] {
  return Array.from(container.querySelectorAll("div")).filter((d) =>
    d.className.includes("rounded-xl px-3 py-2"),
  ) as HTMLElement[];
}

function listEl(): HTMLElement {
  const el = Array.from(container.querySelectorAll("div")).find(
    (d) =>
      d.className.includes("overflow-y-auto") &&
      d.className.includes("rounded-xl"),
  );
  if (!el) throw new Error("Message list not found");
  return el as HTMLElement;
}

function menu(): HTMLElement | null {
  return container.querySelector('[role="menu"]');
}

/** Give a live DOM element a fixed viewport box. */
function setRect(el: HTMLElement, top: number, bottom: number) {
  Object.defineProperty(el, "getBoundingClientRect", {
    configurable: true,
    value: fakeEl(top, bottom).getBoundingClientRect,
  });
}

async function openViaContextMenu(el: HTMLElement) {
  await act(async () => {
    el.dispatchEvent(
      new MouseEvent("contextmenu", { bubbles: true, cancelable: true }),
    );
    await vi.advanceTimersByTimeAsync(0);
  });
}

describe("menuOpensUpward — the geometry decision", () => {
  // The reproduced landscape blocker: 390px-tall viewport, list
  // running past the bottom (page-level scrolling), bubble hugging
  // the bottom edge.
  it("flips upward for a bubble at the bottom of a landscape viewport", () => {
    setInnerHeight(390);
    const list = fakeEl(-174, 401); // taller than the screen — clips at it
    const bubble = fakeEl(320, 365); // last visible message
    expect(menuOpensUpward(bubble, list)).toBe(true);
  });

  it("stays downward when there is room below the bubble", () => {
    setInnerHeight(844); // portrait phone
    const list = fakeEl(150, 700);
    const bubble = fakeEl(180, 230); // near the top of the thread
    expect(menuOpensUpward(bubble, list)).toBe(false);
  });

  it("stays downward when above is even tighter than below (fresh short thread)", () => {
    // First message of a fresh landscape conversation: the bubble is
    // in the lower half of the SCREEN, but it is also the first list
    // content — an upward overlay would clip at the list's top edge
    // while downward still shows most of the menu.
    setInnerHeight(390);
    const list = fakeEl(185, 390);
    const bubble = fakeEl(190, 240);
    expect(menuOpensUpward(bubble, list)).toBe(false);
  });

  it("is false without geometry (jsdom zero-rects keep the in-flow menu)", () => {
    setInnerHeight(768);
    expect(menuOpensUpward(fakeEl(0, 0), fakeEl(0, 0))).toBe(false);
    expect(menuOpensUpward(null, fakeEl(0, 0))).toBe(false);
    expect(menuOpensUpward(fakeEl(0, 0), null)).toBe(false);
  });

  it("uses the estimate as the below-room threshold", () => {
    setInnerHeight(1000);
    const list = fakeEl(0, 1000);
    // Room below just over the estimate → stays down even deep in
    // the view; just under it → flips up (plenty of room above).
    expect(
      menuOpensUpward(fakeEl(600, 1000 - MENU_ESTIMATE_PX - 1), list),
    ).toBe(false);
    expect(
      menuOpensUpward(fakeEl(600, 1000 - MENU_ESTIMATE_PX + 1), list),
    ).toBe(true);
  });
});

describe("ConversationPage — long-press menu placement", () => {
  it("a bottom-of-screen bubble opens the menu as an upward overlay", async () => {
    setInnerHeight(390);
    mockMessages = [
      makeMessage({ id: "m1" }),
      makeMessage({ id: "m2", plaintext: "last one" }),
    ];
    await render();
    setRect(listEl(), -174, 401);
    const last = bubbles()[1];
    setRect(last, 320, 365);
    await openViaContextMenu(last);
    const m = menu();
    expect(m).not.toBeNull();
    expect(m!.className).toContain("bottom-full");
    expect(m!.className).toContain("absolute");
    // Their bubble anchors the overlay to its left edge.
    expect(m!.className).toContain("left-0");
    // The overlay is a readable card, not transparent over bubbles.
    expect(m!.className).toContain("bg-white");
  });

  it("my own bottom bubble anchors the overlay to the right edge", async () => {
    setInnerHeight(390);
    mockMessages = [
      makeMessage({ id: "m1" }),
      makeMessage({
        id: "m2",
        senderKey: "me-key",
        recipientKey: "them-key",
        plaintext: "mine",
      }),
    ];
    await render();
    setRect(listEl(), -174, 401);
    const last = bubbles()[1];
    setRect(last, 320, 365);
    await openViaContextMenu(last);
    expect(menu()!.className).toContain("bottom-full");
    expect(menu()!.className).toContain("right-0");
  });

  it("a bubble with room below keeps the in-flow downward menu", async () => {
    setInnerHeight(844);
    mockMessages = [makeMessage({ id: "m1" })];
    await render();
    setRect(listEl(), 150, 700);
    const first = bubbles()[0];
    setRect(first, 180, 230);
    await openViaContextMenu(first);
    const m = menu();
    expect(m).not.toBeNull();
    expect(m!.className).not.toContain("bottom-full");
    expect(m!.className).toContain("mt-1");
  });

  it("the direction is re-measured on every open, not remembered", async () => {
    setInnerHeight(390);
    mockMessages = [
      makeMessage({ id: "m1", plaintext: "top" }),
      makeMessage({ id: "m2", plaintext: "bottom" }),
    ];
    await render();
    setRect(listEl(), 0, 390);
    const [first, last] = bubbles();
    setRect(first, 10, 60);
    setRect(last, 330, 380);

    // Bottom bubble → upward…
    await openViaContextMenu(last);
    expect(menu()!.className).toContain("bottom-full");
    // …close, then the top bubble → back to the in-flow menu.
    await openViaContextMenu(last); // toggle closed
    expect(menu()).toBeNull();
    await openViaContextMenu(first);
    expect(menu()!.className).not.toContain("bottom-full");
    expect(menu()!.className).toContain("mt-1");
  });

  it("the upward overlay still carries the full menu (emoji row + actions)", async () => {
    setInnerHeight(390);
    mockMessages = [
      makeMessage({ id: "m1" }),
      makeMessage({ id: "m2", plaintext: "soup at six" }),
    ];
    await render();
    setRect(listEl(), -174, 401);
    const last = bubbles()[1];
    setRect(last, 320, 365);
    await openViaContextMenu(last);
    const items = Array.from(
      container.querySelectorAll('button[role="menuitem"]'),
    ) as HTMLButtonElement[];
    expect(items.find((b) => b.textContent === "❤️")).toBeDefined();
    expect(items.find((b) => b.textContent?.includes("Copy"))).toBeDefined();
    expect(items.find((b) => b.textContent?.includes("Info"))).toBeDefined();
  });
});
