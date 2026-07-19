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
//
// Reply from the long-press menu (Telegram-menu field report): the
// menu's Reply item arms a "Replying to…" strip above the composer,
// and the sent message carries the quoted excerpt as leading "> "
// lines — quote-style, deliberately NOT a protocol feature, so every
// client (old and new) reads replies correctly with zero envelope
// changes. Harness cloned from Conversation.reactions.test.tsx: the
// data layer is mocked; these tests own the interaction contract.
//
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
import { sendMessage, type DecryptedMessage } from "@/db/messages";
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

async function openMenu() {
  await act(async () => {
    bubble().dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(LONG_PRESS_MS + 50);
  });
}

function replyItem(): HTMLButtonElement {
  const btn = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'),
  ).find((b) => (b.textContent ?? "").trim() === "Reply");
  if (!btn) throw new Error("Reply menu item not found");
  return btn;
}

describe("ConversationPage — Reply from the long-press menu", () => {
  it("Reply closes the menu and arms the 'Replying to…' strip; ✕ disarms it", async () => {
    mockMessages = [makeMessage({ id: "m1", plaintext: "meet at the bench?" })];
    await render();
    await openMenu();

    await act(async () => {
      replyItem().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // Menu closed…
    expect(
      container.querySelectorAll('button[role="menuitem"]'),
    ).toHaveLength(0);
    // …strip armed, naming the sender and quoting the excerpt.
    expect(container.textContent).toContain(
      "Replying to Riverbend: meet at the bench?",
    );

    const dismiss = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Reply without quoting this message"]',
    )!;
    expect(dismiss).toBeTruthy();
    await act(async () => {
      dismiss.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).not.toContain("Replying to");
  });

  it("send prefixes the quoted excerpt as '> ' lines and clears the strip", async () => {
    mockMessages = [makeMessage({ id: "m1", plaintext: "meet at the bench?" })];
    await render();
    await openMenu();
    await act(async () => {
      replyItem().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const textarea = container.querySelector("textarea")!;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )!.set!;
    await act(async () => {
      setter.call(textarea, "Yes, see you there");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      textarea.closest("form")!.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(sendMessage).toHaveBeenCalledTimes(1);
    const sentBody = vi.mocked(sendMessage).mock.calls[0][2];
    expect(sentBody).toBe(
      "> Riverbend: meet at the bench?\n\nYes, see you there",
    );
    // Strip cleared after send.
    expect(container.textContent).not.toContain("Replying to");
  });

  it("a long quoted message is excerpted, and my own message quotes as 'You'", async () => {
    const long = "a".repeat(300);
    mockMessages = [
      makeMessage({ id: "m1", senderKey: "me-key", recipientKey: "them-key", plaintext: long }),
    ];
    await render();
    await openMenu();
    await act(async () => {
      replyItem().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // Assert on the STRIP's own text — the message bubble in the
    // thread legitimately shows the full 300 chars.
    const strip = Array.from(container.querySelectorAll("p")).find((p) =>
      (p.textContent ?? "").startsWith("Replying to"),
    )!;
    expect(strip.textContent).toContain("Replying to You:");
    // 119 chars + ellipsis, not the whole 300.
    expect(strip.textContent).toContain(`${"a".repeat(119)}…`);
    expect(strip.textContent).not.toContain("a".repeat(150));
  });

  it("voice notes offer Reply too and quote as the voice label", async () => {
    mockMessages = [
      makeMessage({
        id: "v1",
        plaintext: null,
        voice: { mime: "audio/webm", durationMs: 1200, audio: "AAAA" },
      }),
    ];
    await render();
    await openMenu();
    await act(async () => {
      replyItem().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("Replying to Riverbend: Voice note");
  });
});
