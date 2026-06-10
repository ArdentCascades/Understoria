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

// `getConversation` is called inside an effect; resolve to an empty
// thread so the page mounts cleanly without touching Dexie.
vi.mock("@/db/messages", () => ({
  getConversation: vi.fn(async () => []),
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
import type { Member } from "@/types";

interface MockState {
  currentMember: Member | null;
  members: Member[];
  lockState: "unlocked" | "locked" | "uninitialized";
  blockedKeys: ReadonlySet<string>;
}

let mockState: MockState = blankState();
let mockBlocked: boolean = false;

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
    lockState: "unlocked",
    blockedKeys: new Set<string>(),
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = blankState();
  mockBlocked = false;
  container = document.createElement("div");
  document.body.appendChild(container);
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

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/messages/them-key"]}>
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
