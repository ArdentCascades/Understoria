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
const appState: { currentMember: Member | null } = {
  currentMember: null,
};

vi.mock("@/state/AppContext", () => ({
  useApp: () => appState,
}));

// In-memory settings store for the dismiss flag — mirrors the
// useVouchDiscoveryNudge harness. The profileIsBare predicate stays
// real so the hook gates on a genuine bare/filled member.
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
import { useProfileNudge } from "./useProfileNudge";
import { SETTING_KEYS } from "@/db/database";

// Harness: renders the hook's node ONLY when ready && visible, exactly
// as the BoardNudges orchestrator does for the highest-priority prompt.
function Harness() {
  const { ready, visible, node } = useProfileNudge();
  if (!ready) return null;
  return visible ? <>{node}</> : null;
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function buildMember(overrides: Partial<Member> = {}): Member {
  return {
    publicKey: "pk-me",
    nodeId: "node-test",
    displayName: "Me",
    skills: [],
    availability: "",
    availabilityChips: [],
    locationZone: "",
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
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
    root.render(
      <MemoryRouter>
        <Harness />
      </MemoryRouter>,
    );
  });
}

describe("useProfileNudge", () => {
  it("shows (with the profile CTA) for a member with a bare profile", async () => {
    appState.currentMember = buildMember();
    render();
    await flushAsync();
    expect(container.textContent).toContain(
      "Members can find you for in-person help",
    );
    // `?edit=1` asks Profile to scroll to + focus the editor, so the
    // CTA lands on the details form rather than the top of the page.
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/profile?edit=1");
  });

  it("renders nothing when the profile already has a skill", async () => {
    appState.currentMember = buildMember({ skills: ["cooking"] });
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
  });

  it("self-retires (and writes the sentinel) when a filled profile is observed", async () => {
    // A filled profile that loads while the nudge was undismissed:
    // the self-retire effect should write the sentinel.
    appState.currentMember = buildMember({ locationZone: "North side" });
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
    expect(settings.get(SETTING_KEYS.profileNudgeDismissed)).toBe("1");
  });

  it("stays hidden permanently once dismissed", async () => {
    appState.currentMember = buildMember();
    settings.set(SETTING_KEYS.profileNudgeDismissed, "1");
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
  });
});
