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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Test fixtures — driven via the AppContext mock below.
import type { Member, Post } from "@/types";

// AppContext is the nudge's only read path into Dexie-derived state.
const appState: { currentMember: Member | null; posts: Post[] } = {
  currentMember: null,
  posts: [],
};

vi.mock("@/state/AppContext", () => ({
  useApp: () => appState,
}));

// In-memory settings store for the dismiss flag — mirrors the
// useVouchDiscoveryNudge harness. Keeps this test independent of Dexie.
const settings = new Map<string, string>();
vi.mock("@/db/database", async () => {
  const actual =
    await vi.importActual<typeof import("@/db/database")>("@/db/database");
  return {
    ...actual,
    getSetting: async (key: string) => settings.get(key),
    setSetting: async (key: string, value: string) => {
      settings.set(key, value);
    },
  };
});

import "@/i18n";
import { useFirstActionNudge } from "./useFirstActionNudge";
import { SETTING_KEYS } from "@/db/database";

// Harness: renders the hook's node ONLY when ready && visible, exactly
// as the BoardNudges orchestrator does for the highest-priority prompt.
function Harness() {
  const { ready, visible, node } = useFirstActionNudge();
  if (!ready) return null;
  return visible ? <>{node}</> : null;
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function buildMember(publicKey: string): Member {
  return {
    publicKey,
    nodeId: "node-test",
    displayName: "Me",
    skills: [],
    availability: "",
    availabilityChips: [],
    locationZone: "",
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
  };
}

function buildPost(overrides: Partial<Post>): Post {
  return {
    id: "post-1",
    nodeId: "node-test",
    type: "NEED",
    category: "other",
    title: "Sample",
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "other-key",
    claimedBy: null,
    status: "open",
    confirmedBy: [],
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    signature: "",
    ...overrides,
  };
}

async function flushAsync() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  appState.currentMember = null;
  appState.posts = [];
  settings.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.restoreAllMocks();
});

function render() {
  act(() => {
    root = createRoot(container);
    root.render(<Harness />);
  });
}

describe("useFirstActionNudge", () => {
  it("shows for a brand-new member who hasn't posted or claimed", async () => {
    appState.currentMember = buildMember("pk-me");
    appState.posts = [];
    render();
    await flushAsync();
    expect(container.textContent).toContain("lurking is welcome too");
  });

  it("renders nothing when there is no current member", async () => {
    appState.currentMember = null;
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
  });

  it("self-retires (and writes the sentinel) once a first action is observed", async () => {
    appState.currentMember = buildMember("pk-me");
    appState.posts = [buildPost({ postedBy: "pk-me" })];
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
    // The self-retire write happened, so the nudge won't resurface even
    // if the action's evidence later disappears.
    expect(settings.get(SETTING_KEYS.firstActionNudgeDismissed)).toBe("1");
  });

  it("stays hidden permanently once dismissed", async () => {
    appState.currentMember = buildMember("pk-me");
    settings.set(SETTING_KEYS.firstActionNudgeDismissed, "1");
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
  });
});
