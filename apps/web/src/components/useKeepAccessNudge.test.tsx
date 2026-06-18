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
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Test fixtures — driven via the AppContext mock below.
import type { Member } from "@/types";

// AppContext is the nudge's only read path into Dexie-derived state.
// Each test dials currentMember without constructing a real provider.
const appState: { currentMember: Member | null } = {
  currentMember: null,
};

vi.mock("@/state/AppContext", () => ({
  useApp: () => appState,
}));

// The keep-access predicate + dismiss helpers are mocked so each test
// dials the dismissed flag and the paired-device check independently,
// without standing up the real Dexie pairingLog / settings tables.
// `dismissCalls` lets the dismiss-click test observe the write the
// hook performs. Everything the mock factory touches lives on
// this single object so nothing is referenced before initialization
// (the factory is hoisted above local `const`s — same shape as the
// useVouchDiscoveryNudge harness's `appState` / `settings`).
const nudgeState = {
  dismissed: false,
  hasPairedDevice: false,
  dismissCalls: 0,
};
vi.mock("@/lib/keepAccessNudge", () => ({
  isKeepAccessNudgeDismissed: async () => nudgeState.dismissed,
  memberHasPairedDevice: async () => nudgeState.hasPairedDevice,
  dismissKeepAccessNudge: async () => {
    nudgeState.dismissCalls += 1;
    nudgeState.dismissed = true;
  },
}));

import "@/i18n";
import { useKeepAccessNudge } from "./useKeepAccessNudge";

// Harness: renders the hook's node ONLY when ready && visible, exactly
// as the BoardNudges orchestrator does for the highest-priority prompt.
// Nothing reaches the DOM until the async gating resolves (ready), and
// an ineligible / dismissed / self-retired status renders null.
function Harness() {
  const { ready, visible, node } = useKeepAccessNudge();
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

async function flushAsync() {
  // Drain the microtask queue so the hook's awaited
  // isKeepAccessNudgeDismissed / memberHasPairedDevice calls resolve
  // before assertions.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  appState.currentMember = null;
  nudgeState.dismissed = false;
  nudgeState.hasPairedDevice = false;
  nudgeState.dismissCalls = 0;
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
    root.render(
      <MemoryRouter>
        <Harness />
      </MemoryRouter>,
    );
  });
}

describe("useKeepAccessNudge", () => {
  it("renders nothing before the async state resolves", async () => {
    appState.currentMember = buildMember("pk-me");
    render();
    // Asserted immediately after the synchronous render, before the
    // dismissed / paired checks resolve — the harness honors `ready`
    // and renders nothing. (We drain afterward so the trailing setState
    // settles inside act and doesn't leak into the next test.)
    expect(container.textContent).toBe("");
    await flushAsync();
  });

  it("renders title + body + CTA for a member with no paired device, not dismissed", async () => {
    appState.currentMember = buildMember("pk-me");
    render();
    await flushAsync();
    expect(container.textContent).toContain("Keep a spare copy of your account");
    expect(container.textContent).toContain("Your account lives on this device");
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/add-device");
  });

  it("self-retires (renders null) once a second device is paired", async () => {
    appState.currentMember = buildMember("pk-me");
    nudgeState.hasPairedDevice = true;
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
  });

  it("stays hidden permanently once dismissed", async () => {
    appState.currentMember = buildMember("pk-me");
    nudgeState.dismissed = true;
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
  });

  it("renders nothing when there is no current member", async () => {
    appState.currentMember = null;
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
  });

  it("clicking dismiss calls dismissKeepAccessNudge and hides the nudge", async () => {
    appState.currentMember = buildMember("pk-me");
    render();
    await flushAsync();
    const dismissButton = [...container.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Maybe later"),
    );
    expect(dismissButton).toBeTruthy();
    await act(async () => {
      dismissButton?.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
      await Promise.resolve();
    });
    expect(nudgeState.dismissCalls).toBe(1);
    expect(container.textContent).toBe("");
  });
});
