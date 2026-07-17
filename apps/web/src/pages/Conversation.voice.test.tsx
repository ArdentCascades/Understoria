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

// Voice notes in the conversation page: the composer's mic button
// swaps in the recorder; a captured clip sends a sealed v3 envelope;
// voice rows render a player instead of a text bubble. Recorder and
// data layer are mocked — their own suites cover them.

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
  sendVoiceMessage: vi.fn(async () => undefined),
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
// Stub recorder: one button that "captures" a fixed clip.
vi.mock("@/components/VoiceRecorder", () => ({
  VoiceRecorder: ({
    onCapture,
  }: {
    onCapture: (c: {
      base64: string;
      mime: string;
      durationMs: number;
    }) => void;
  }) => (
    <button
      type="button"
      data-testid="fake-capture"
      onClick={() =>
        onCapture({ base64: "QUJD", mime: "audio/mp4", durationMs: 1500 })
      }
    >
      fake capture
    </button>
  ),
}));

import "@/i18n";
import ConversationPage from "./Conversation";
import { sendVoiceMessage, type DecryptedMessage } from "@/db/messages";
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

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
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
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:fake"),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
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
    await Promise.resolve();
  });
}

describe("ConversationPage — voice notes", () => {
  it("mic button opens the recorder; a captured clip sends via sendVoiceMessage", async () => {
    await render();
    const mic = container.querySelector(
      'button[aria-label="Record a voice note"]',
    ) as HTMLButtonElement;
    expect(mic).not.toBeNull();
    expect(container.querySelector('[data-testid="fake-capture"]')).toBeNull();

    await act(async () => {
      mic.click();
      await Promise.resolve();
    });
    const capture = container.querySelector(
      '[data-testid="fake-capture"]',
    ) as HTMLButtonElement;
    expect(capture).not.toBeNull();

    await act(async () => {
      capture.click();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(vi.mocked(sendVoiceMessage)).toHaveBeenCalledWith(
      "me-key",
      "them-key",
      { base64: "QUJD", mime: "audio/mp4", durationMs: 1500 },
    );
    // Recorder closes after a successful send.
    expect(container.querySelector('[data-testid="fake-capture"]')).toBeNull();
  });

  it("a voice row renders a player, not a text bubble", async () => {
    mockMessages = [
      {
        id: "m1",
        conversationId: "me-key|them-key",
        senderKey: "them-key",
        recipientKey: "me-key",
        nonce: "n",
        ciphertext: "c",
        createdAt: Date.now(),
        plaintext: "🎙️ Voice message — update the app to listen.",
        voice: { mime: "audio/mp4", durationMs: 4000, audio: "QUJD" },
      },
    ];
    await render();
    expect(container.querySelector("audio")).not.toBeNull();
    // The old-client fallback line never shows next to a working player.
    expect(container.textContent).not.toContain("update the app to listen");
  });
});
