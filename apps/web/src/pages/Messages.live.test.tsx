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

// The conversation-list pane is LIVE (round-3 persona fix): during an
// active split-pane conversation the list used to show "No
// conversations yet" — or a stale last-message preview — until a full
// reload, because it was a one-shot load keyed on mount. It now rides
// a Dexie liveQuery over the real listConversations, so this test
// deliberately uses the REAL data layer (fake-indexeddb + real
// crypto), not mocks: what's under test is exactly the re-emission
// path a mock would fake away.

import { generateKeyPair, type KeyPair } from "@understoria/shared/crypto";

vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));

let mockState: {
  currentMember: Member;
  members: Member[];
  posts: never[];
  lockState: "unlocked";
  blockedKeys: Set<string>;
};

import "@/i18n";
import MessagesShell, { MessagesEmptyPane } from "./Messages";
import { db } from "@/db/database";
import { sendMessage } from "@/db/messages";
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

let me: KeyPair;
let them: KeyPair;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  await Promise.all([
    db.messages.clear(),
    db.secretKeys.clear(),
    db.blocks.clear(),
    db.outbox.clear(),
    db.settings.clear(),
  ]);
  me = generateKeyPair();
  them = generateKeyPair();
  await db.secretKeys.bulkPut([
    { publicKey: me.publicKey, secretKey: me.secretKey },
    { publicKey: them.publicKey, secretKey: them.secretKey },
  ]);
  mockState = {
    currentMember: makeMember(me.publicKey, "Me"),
    members: [
      makeMember(me.publicKey, "Me"),
      makeMember(them.publicKey, "Riverbend"),
    ],
    posts: [],
    lockState: "unlocked",
    blockedKeys: new Set<string>(),
  };
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/messages"]}>
        <Routes>
          <Route path="/messages" element={<MessagesShell />}>
            <Route index element={<MessagesEmptyPane />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  });
}

/** Real-timer poll: liveQuery re-emits asynchronously after a write,
 *  so wait (bounded) for the DOM to catch up. */
async function waitForText(text: string, timeoutMs = 4000) {
  const start = Date.now();
  for (;;) {
    if (container.textContent?.includes(text)) return;
    if (Date.now() - start > timeoutMs) {
      throw new Error(
        `Timed out waiting for "${text}" — got: ${container.textContent}`,
      );
    }
    await act(async () => {
      await new Promise((r) => setTimeout(r, 25));
    });
  }
}

describe("MessagesShell — the list pane is live", () => {
  it("a first message makes the conversation appear without a reload", async () => {
    render();
    await waitForText("No conversations yet");

    // The detail pane sends the first message of a brand-new
    // conversation while the shell stays mounted.
    await act(async () => {
      await sendMessage(me.publicKey, them.publicKey, "see you at the tool library");
    });

    await waitForText("Riverbend");
    await waitForText("see you at the tool library");
    expect(container.textContent).not.toContain("No conversations yet");
  });

  it("the last-message preview follows new messages in an existing thread", async () => {
    await sendMessage(me.publicKey, them.publicKey, "first hello");
    render();
    await waitForText("first hello");

    await act(async () => {
      await sendMessage(me.publicKey, them.publicKey, "second follow-up");
    });

    await waitForText("second follow-up");
    expect(container.textContent).not.toContain("first hello");
  });
});
