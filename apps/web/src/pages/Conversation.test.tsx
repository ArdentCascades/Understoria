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
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock `useApp` BEFORE importing the page. The real provider needs a
// hydrated Dexie connection; for a header-menu smoke test we just
// supply the shape Conversation.tsx consumes.
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

// `useLiveQuery` backs the `blocked` lookup in the conversation
// header (and any other live read on the page). We return a single
// scalar value the tests dial up/down via `mockBlocked`.
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: () => mockBlocked,
}));

// `getConversation` is called inside an effect; resolve to the
// harness-controlled thread so the page mounts cleanly without
// touching Dexie.
vi.mock("@/db/messages", () => ({
  getConversation: vi.fn(async () => mockMessages),
  sendMessage: vi.fn(async () => undefined),
}));

// `isBlocked` is still imported for the live-query factory; the mock
// keeps it from reaching the real Dexie connection.
vi.mock("@/db/blocks", () => ({
  isBlocked: vi.fn(async () => false),
  BLOCK_NOTE_MAX_LENGTH: 500,
  BlockActionError: class BlockActionError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
  blockMember: vi.fn(async () => undefined),
  unblockMember: vi.fn(async () => undefined),
}));

// Pull in real i18n so `t()` returns translated copy (the assertions
// below match the English strings, not the raw keys).
import "@/i18n";
import ConversationPage from "./Conversation";
import { sendMessage, type DecryptedMessage } from "@/db/messages";
import type { Member, Post } from "@/types";

interface MockState {
  currentMember: Member | null;
  members: Member[];
  posts: Post[];
  lockState: "unlocked" | "locked" | "uninitialized";
  blockedKeys: ReadonlySet<string>;
}

let mockState: MockState = blankState();
let mockBlocked: boolean = false;
let mockMessages: DecryptedMessage[] = [];

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

function blankState(): MockState {
  return {
    currentMember: makeMember("me-key", "Me"),
    members: [
      makeMember("me-key", "Me"),
      makeMember("them-key", "Riverbend"),
    ],
    posts: [],
    lockState: "unlocked",
    blockedKeys: new Set<string>(),
  };
}

// The page only reads `id` and `title` off a post; a minimal cast
// keeps the fixture honest about what the chip actually consumes.
function makePost(id: string, title: string): Post {
  return { id, title } as Post;
}

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
  mockState = blankState();
  mockBlocked = false;
  mockMessages = [];
  container = document.createElement("div");
  document.body.appendChild(container);
  // jsdom doesn't implement `scrollIntoView`; the auto-scroll effect
  // calls it whenever the thread is non-empty.
  if (typeof Element.prototype.scrollIntoView !== "function") {
    Element.prototype.scrollIntoView = () => {};
  }
  // jsdom doesn't ship `matchMedia`; Conversation.tsx auto-focuses
  // the input on lg+ widths via this API. Stub to "no match" so the
  // narrow-viewport branch (no auto-focus) runs.
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
});

// Records the live location so tests can assert the ?about= param
// lifecycle (armed on arrival, stripped after the first send).
let lastSearch = "";
function LocationSpy() {
  const loc = useLocation();
  lastSearch = loc.search;
  return null;
}

function render(initialEntry = "/messages/them-key") {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <LocationSpy />
        <Routes>
          <Route
            path="/messages/:memberKey"
            element={<ConversationPage />}
          />
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

function setMessageText(value: string) {
  const ta = container.querySelector("textarea");
  if (!ta) throw new Error("Composer textarea not found");
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

function getMenuTrigger(): HTMLButtonElement {
  const btn = container.querySelector(
    'button[aria-haspopup="menu"]',
  ) as HTMLButtonElement | null;
  if (!btn) throw new Error("Header menu trigger not found");
  return btn;
}

describe("ConversationPage — header More-actions menu", () => {
  it("renders the kebab trigger with the correct aria attributes", () => {
    render();
    const trigger = getMenuTrigger();
    expect(trigger.getAttribute("aria-label")).toBe("More actions");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("trigger satisfies the 44x44 touch-target floor", () => {
    render();
    const trigger = getMenuTrigger();
    // Tailwind classes are the source of truth — assert that the
    // min-h / min-w classes are present (jsdom doesn't compute
    // layout, so we cannot read actual pixel dimensions).
    const cls = trigger.className;
    expect(cls).toContain("min-h-[44px]");
    expect(cls).toContain("min-w-[44px]");
  });

  it("opens the BlockConfirmCard when not blocked", () => {
    mockBlocked = false;
    render();
    const trigger = getMenuTrigger();
    act(() => trigger.click());
    // aria-expanded flips, the menu item is visible.
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const item = container.querySelector(
      'button[role="menuitem"]',
    ) as HTMLButtonElement | null;
    expect(item).not.toBeNull();
    expect(item?.textContent).toContain("Block contact");
    act(() => item!.click());
    // BlockConfirmCard renders a modal dialog with this title.
    expect(document.body.textContent).toContain(
      "Block this contact",
    );
  });

  it("opens the UnblockConfirmDialog when already blocked", () => {
    mockBlocked = true;
    render();
    const trigger = getMenuTrigger();
    act(() => trigger.click());
    const item = container.querySelector(
      'button[role="menuitem"]',
    ) as HTMLButtonElement | null;
    expect(item).not.toBeNull();
    expect(item?.textContent).toContain("Unblock Riverbend");
    act(() => item!.click());
    // UnblockConfirmDialog (ConfirmDialog) surfaces this title copy.
    expect(document.body.textContent).toContain(
      "Unblock Riverbend?",
    );
  });

  it("closes the menu on Esc", () => {
    render();
    const trigger = getMenuTrigger();
    act(() => trigger.click());
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape" }),
      );
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("ConversationPage — post-context send path (?about=)", () => {
  beforeEach(() => {
    mockState.posts = [makePost("post-1", "Fix the greenhouse door")];
  });

  it("shows the pre-send hint with the post title while armed", async () => {
    render("/messages/them-key?about=post-1");
    await flushPromises();
    expect(container.textContent).toContain(
      "You're writing about: Fix the greenhouse door",
    );
  });

  it("shows the generic hint when the post is not locally known", async () => {
    render("/messages/them-key?about=ghost-post");
    await flushPromises();
    expect(container.textContent).toContain("You're writing about a post");
  });

  it("attaches the reference to the first message only and strips the param", async () => {
    render("/messages/them-key?about=post-1");
    await flushPromises();
    expect(lastSearch).toContain("about=post-1");

    setMessageText("hi, still need help with that?");
    await submitComposer();
    expect(vi.mocked(sendMessage)).toHaveBeenCalledWith(
      "me-key",
      "them-key",
      "hi, still need help with that?",
      { aboutPostId: "post-1" },
    );
    // Param stripped after the send: refresh/back won't re-arm, and
    // the hint disappears.
    expect(lastSearch).not.toContain("about");
    expect(container.textContent).not.toContain("You're writing about");

    setMessageText("second message");
    await submitComposer();
    expect(vi.mocked(sendMessage)).toHaveBeenLastCalledWith(
      "me-key",
      "them-key",
      "second message",
      { aboutPostId: undefined },
    );
  });

  it("dismissing the hint detaches the reference", async () => {
    render("/messages/them-key?about=post-1");
    await flushPromises();
    const dismiss = container.querySelector(
      'button[aria-label="Don\'t attach this post"]',
    ) as HTMLButtonElement | null;
    expect(dismiss).not.toBeNull();
    // Member control: the X satisfies the 44px touch floor.
    expect(dismiss!.className).toContain("min-h-[44px]");
    expect(dismiss!.className).toContain("min-w-[44px]");
    act(() => dismiss!.click());
    expect(lastSearch).not.toContain("about");
    expect(container.textContent).not.toContain("You're writing about");

    setMessageText("actually, something else");
    await submitComposer();
    expect(vi.mocked(sendMessage)).toHaveBeenCalledWith(
      "me-key",
      "them-key",
      "actually, something else",
      { aboutPostId: undefined },
    );
  });
});

describe("ConversationPage — post-context chips on messages", () => {
  it("renders a chip with the local post title, linking to the post", async () => {
    mockState.posts = [makePost("post-1", "Fix the greenhouse door")];
    mockMessages = [
      makeMessage({ id: "m1", plaintext: "plain legacy message" }),
      makeMessage({
        id: "m2",
        plaintext: "is this still available?",
        aboutPostId: "post-1",
      }),
    ];
    render();
    await flushPromises();
    const chip = container.querySelector(
      'a[href="/post/post-1"]',
    ) as HTMLAnchorElement | null;
    expect(chip).not.toBeNull();
    expect(chip!.textContent).toContain("about: Fix the greenhouse door");
    // The legacy message renders text only — exactly one chip.
    expect(container.querySelectorAll('a[href^="/post/"]')).toHaveLength(1);
    expect(container.textContent).toContain("plain legacy message");
    expect(container.textContent).toContain("is this still available?");
  });

  it("falls back to a generic label when the post is not locally known", async () => {
    mockMessages = [
      makeMessage({
        id: "m1",
        plaintext: "hola",
        aboutPostId: "federated-post",
      }),
    ];
    render();
    await flushPromises();
    const chip = container.querySelector(
      'a[href="/post/federated-post"]',
    ) as HTMLAnchorElement | null;
    expect(chip).not.toBeNull();
    expect(chip!.textContent).toContain("about a post");
  });
});

describe("ConversationPage — blocked conversation (blocker's own view)", () => {
  // `blockedKeys` is derived only from the viewer's OWN local block
  // rows (blocks never federate), so this state renders exclusively on
  // the blocker's device — being honest here leaks nothing to the
  // blocked party, whose generic-error discipline lives in the action
  // layer (docs/blocking.md §6.1).
  it("names the block honestly and links to Settings → Blocked contacts", async () => {
    mockState.blockedKeys = new Set(["them-key"]);
    render();
    await flushPromises();
    expect(container.textContent).toContain("You've blocked this contact.");
    const link = container.querySelector(
      'a[href="/settings"]',
    ) as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link!.textContent).toContain(
      "You can unblock them in Settings → Blocked contacts.",
    );
    // The old evasive copy is gone from the blocker's own view…
    expect(container.textContent).not.toContain(
      "This isn't available right now.",
    );
    // …and the conversation itself does not render (no composer).
    expect(container.querySelector("textarea")).toBeNull();
  });

  it("keeps the counterparty's name and a Blocked chip in the header (round-3 papercut)", async () => {
    // The header used to drop the name entirely, leaving the member
    // unsure whose thread this was. The honest name stays — this
    // branch only ever renders on the blocker's own device, so
    // naming names leaks nothing to the blocked party.
    mockState.blockedKeys = new Set(["them-key"]);
    render();
    await flushPromises();
    const h1 = container.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1!.textContent).toContain("Riverbend");
    expect(container.textContent).toContain("Blocked");
  });

  it("renders ONLY for blocks — an unblocked conversation shows the thread, not the blocked state", async () => {
    mockState.blockedKeys = new Set(["someone-else"]);
    render();
    await flushPromises();
    expect(container.textContent).not.toContain("You've blocked this contact.");
    expect(container.querySelector("textarea")).not.toBeNull();
  });
});
