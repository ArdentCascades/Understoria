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
import type { InviteRow } from "@/db/database";
import type { SignedVouch } from "@/lib/vouch";
import { createVouch } from "@/lib/vouch";
import { generateKeyPair } from "@/lib/crypto";

// AppContext is the nudge's only read path into Dexie-derived state.
// Each test dials currentMember / vouches / invites without
// constructing a real provider.
const appState: {
  currentMember: Member | null;
  vouches: SignedVouch[];
  invites: InviteRow[];
} = {
  currentMember: null,
  vouches: [],
  invites: [],
};

vi.mock("@/state/AppContext", () => ({
  useApp: () => appState,
}));

// In-memory settings store for the dismiss flag — mirrors what
// useFirstActionNudge / useProfileNudge tests would do. Keeps this
// test independent of the real Dexie.
const settings = new Map<string, string>();
vi.mock("@/db/database", async () => {
  const actual =
    await vi.importActual<typeof import("@/db/database")>(
      "@/db/database",
    );
  return {
    ...actual,
    getSetting: async (key: string) => settings.get(key),
    setSetting: async (key: string, value: string) => {
      settings.set(key, value);
    },
  };
});

import "@/i18n";
import { useVouchDiscoveryNudge } from "./useVouchDiscoveryNudge";
import { SETTING_KEYS } from "@/db/database";

// Harness: renders the hook's node ONLY when ready && visible, exactly
// as the BoardNudges orchestrator does for the highest-priority prompt.
function Harness() {
  const { ready, visible, node } = useVouchDiscoveryNudge();
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

function trustingVouches(forKey: string): SignedVouch[] {
  // Two distinct vouchers — meets MINIMUM_VOUCHES_FOR_TRUST.
  const v1 = generateKeyPair();
  const v2 = generateKeyPair();
  return [
    createVouch({
      voucherKey: v1.publicKey,
      voucherSecretKey: v1.secretKey,
      voucheeKey: forKey,
      kind: "manual",
    }),
    createVouch({
      voucherKey: v2.publicKey,
      voucherSecretKey: v2.secretKey,
      voucheeKey: forKey,
      kind: "manual",
    }),
  ];
}

async function flushAsync() {
  // Drain the microtask queue so the hook's awaited
  // getSetting call resolves before assertions.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  appState.currentMember = null;
  appState.vouches = [];
  appState.invites = [];
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
    // The card carries a Link ("How vouching works" → /help), so the
    // harness needs a router context, same as useInstallCardNudge.
    root.render(
      <MemoryRouter>
        <Harness />
      </MemoryRouter>,
    );
  });
}

describe("useVouchDiscoveryNudge", () => {
  it("renders nothing for an untrusted member (no vouches received)", async () => {
    const me = generateKeyPair();
    appState.currentMember = buildMember(me.publicKey);
    appState.vouches = [];
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
  });

  it("renders for a trusted member who hasn't vouched yet", async () => {
    const me = generateKeyPair();
    appState.currentMember = buildMember(me.publicKey);
    appState.vouches = trustingVouches(me.publicKey);
    render();
    await flushAsync();
    expect(container.textContent).toContain("You can vouch now");
    // The CTA answers itself: "How vouching works" lands on the FAQ
    // entry rather than sending the member to hunt a Vouch button.
    const link = Array.from(container.querySelectorAll("a")).find((a) =>
      a.textContent?.includes("How vouching works"),
    );
    expect(link).toBeDefined();
    expect(link?.getAttribute("href")).toBe("/help#how-vouching-works");
  });

  it("self-retires when the member has already vouched for someone", async () => {
    const me = generateKeyPair();
    const them = generateKeyPair();
    appState.currentMember = buildMember(me.publicKey);
    const received = trustingVouches(me.publicKey);
    const authored = createVouch({
      voucherKey: me.publicKey,
      voucherSecretKey: me.secretKey,
      voucheeKey: them.publicKey,
      kind: "manual",
    });
    appState.vouches = [...received, authored];
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
    // And the self-retire write happened, so the nudge will not
    // resurface even if the authored vouch's evidence disappears.
    expect(settings.get(SETTING_KEYS.vouchDiscoveryNudgeDismissed)).toBe(
      "1",
    );
  });

  it("stays hidden permanently once dismissed (simulates a second session)", async () => {
    const me = generateKeyPair();
    appState.currentMember = buildMember(me.publicKey);
    appState.vouches = trustingVouches(me.publicKey);
    // Pre-seed the dismissed sentinel — same as if a previous
    // session wrote it.
    settings.set(SETTING_KEYS.vouchDiscoveryNudgeDismissed, "1");
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
  });
});
