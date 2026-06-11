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

// Mock `useApp` BEFORE importing the page — Messages.tsx reads
// `currentMember`, `members`, `lockState`, and `blockedKeys` from
// the app context. We supply just that shape so the page mounts
// without hydrating Dexie.
vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));

// Messages.tsx pulls these from @/db/messages on mount and on every
// debounced query change. The harness controls what they return.
vi.mock("@/db/messages", () => ({
  listConversations: vi.fn(async () => mockConversations),
  searchAllMessages: vi.fn(async () => mockSearchHits),
}));

// Pull in real i18n so `t()` returns the translated copy the
// assertions below match against.
import "@/i18n";
import MessagesShell from "./Messages";
import type {
  ConversationSummary,
  MessageSearchHit,
} from "@/db/messages";
import type { Member } from "@/types";

interface MockState {
  currentMember: Member | null;
  members: Member[];
  lockState: "unlocked" | "locked" | "uninitialized";
  blockedKeys: ReadonlySet<string>;
}

let mockState: MockState = blankState();
let mockConversations: ConversationSummary[] = [];
let mockSearchHits: MessageSearchHit[] = [];

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
      makeMember("other-key", "Maria"),
    ],
    lockState: "unlocked",
    blockedKeys: new Set<string>(),
  };
}

let container: HTMLDivElement;
let root: Root;
let lastLocation: { pathname: string; search: string } = {
  pathname: "",
  search: "",
};

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = blankState();
  mockConversations = [];
  mockSearchHits = [];
  lastLocation = { pathname: "", search: "" };
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.clearAllMocks();
});

// A tiny spy route that records the current location every render,
// so a test can assert that a click navigated to the expected route.
function LocationSpy() {
  const loc = useLocation();
  lastLocation = { pathname: loc.pathname, search: loc.search };
  return null;
}

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/messages"]}>
        <LocationSpy />
        <Routes>
          <Route path="/messages" element={<MessagesShell />} />
          <Route path="/messages/:memberKey" element={<MessagesShell />} />
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

function setQuery(value: string) {
  const input = container.querySelector(
    'input[type="search"]',
  ) as HTMLInputElement | null;
  if (!input) throw new Error("Search input not found");
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function runDebounce() {
  // The search effect debounces 250 ms; advance fake timers and
  // flush the resulting async work.
  await act(async () => {
    vi.advanceTimersByTime(300);
  });
  await flushPromises();
}

function makeHit(
  otherKey: string,
  id: string,
  plaintext: string,
  createdAt: number,
): MessageSearchHit {
  return {
    otherKey,
    message: {
      id,
      conversationId: `${otherKey}-conv`,
      senderKey: otherKey,
      recipientKey: "me-key",
      nonce: "n",
      ciphertext: "c",
      createdAt,
      plaintext,
    },
  };
}

function makeConv(
  otherKey: string,
  plaintext: string,
  createdAt: number,
): ConversationSummary {
  return {
    otherKey,
    lastMessage: {
      id: `${otherKey}-last`,
      conversationId: `${otherKey}-conv`,
      senderKey: otherKey,
      recipientKey: "me-key",
      nonce: "n",
      ciphertext: "c",
      createdAt,
      plaintext,
    },
  };
}

describe("MessagesShell — search result thread context", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a 'Conversation with {Name}' heading for each hit group", async () => {
    mockSearchHits = [
      makeHit("them-key", "msg-1", "let's swap zucchini bread", 1000),
    ];
    render();
    setQuery("zucchini");
    await runDebounce();

    expect(container.textContent).toContain("Conversation with Riverbend");
    // The body hit excerpt renders too.
    expect(container.textContent).toContain("zucchini bread");
  });

  it("tapping a search-result group navigates to the conversation route", async () => {
    mockSearchHits = [
      makeHit("them-key", "msg-1", "let's swap zucchini bread", 1000),
    ];
    render();
    setQuery("zucchini");
    await runDebounce();

    const link = container.querySelector("a[href]") as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link!.getAttribute("href")).toBe(
      `/messages/${encodeURIComponent("them-key")}?q=zucchini`,
    );

    act(() => {
      link!.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
      );
    });
    expect(lastLocation.pathname).toBe(`/messages/${encodeURIComponent("them-key")}`);
    expect(lastLocation.search).toBe("?q=zucchini");
  });

  it("renders a 'Matched their name' note when only the participant name matches", async () => {
    // No body hits; instead a conversation whose participant name
    // matches the query — the page synthesises a name-only group.
    mockSearchHits = [];
    mockConversations = [makeConv("other-key", "ping", 1000)];
    render();
    setQuery("Maria");
    await runDebounce();

    expect(container.textContent).toContain("Conversation with Maria");
    expect(container.textContent).toContain("Matched their name");
    // And the body should NOT show the actual last-message text —
    // a name-only match doesn't surface message bodies.
    expect(container.textContent).not.toContain("ping");
  });
});
