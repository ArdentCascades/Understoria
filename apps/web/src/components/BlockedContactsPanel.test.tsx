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
/**
 * Settings → Blocked contacts rows: the obscured-by-default posture
 * (docs/blocking.md §6.2 — privacy from over the shoulder) must not
 * make two blocked contacts indistinguishable. Honest-dialog round
 * finding: collapsed rows all read "? / Blocked contact", forcing
 * expand-and-check per row. The fix keeps the display NAME behind the
 * tap but shows the truncated pubkey collapsed — a short key
 * distinguishes rows without telling a shoulder-surfer who anyone is.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    toast: null,
  }),
}));

// The panel reads its two lists through useLiveQuery (blocks first,
// history second — stable hook order inside the component). Dispatch
// on call parity so each render gets the harness rows without a
// Dexie connection.
let liveQueryCall = 0;
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: () =>
    liveQueryCall++ % 2 === 0 ? mockBlocks : mockHistory,
}));

vi.mock("@/db/blocks", () => ({
  NEVER_UNBLOCKED: 0,
  listBlocks: vi.fn(async () => []),
  listPreviouslyBlocked: vi.fn(async () => []),
  clearPreviouslyBlocked: vi.fn(async () => undefined),
  updateBlockScope: vi.fn(async () => undefined),
  unblockMember: vi.fn(async () => undefined),
}));

import "@/i18n";
import { BlockedContactsPanel } from "./BlockedContactsPanel";
import type { BlockRow, Member, PreviouslyBlockedRow } from "@/types";

const meKey = "me-key";
// Long enough for shortKey() to truncate: first 4 … last 4.
const blockedKeyA = "AAAA-first-blocked-key-ZZZ1";
const blockedKeyB = "BBBB-second-blocked-key-ZZ2";

function member(publicKey: string, displayName: string): Member {
  return {
    publicKey,
    displayName,
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId: "node-1",
    locationZone: "",
  };
}

function blockRow(id: string, blockedKey: string): BlockRow {
  return {
    id,
    blockerKey: meKey,
    blockedKey,
    createdAt: 1700000000000,
    hideGovernance: false,
    note: null,
  };
}

interface MockState {
  currentMember: Member | null;
  members: Member[];
}

let mockState: MockState;
let mockBlocks: BlockRow[];
let mockHistory: PreviouslyBlockedRow[];

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  liveQueryCall = 0;
  mockState = {
    currentMember: member(meKey, "Me"),
    members: [
      member(meKey, "Me"),
      member(blockedKeyA, "Ana Blocked"),
      member(blockedKeyB, "Berto Blocked"),
    ],
  };
  mockBlocks = [blockRow("b1", blockedKeyA), blockRow("b2", blockedKeyB)];
  mockHistory = [];
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
      <MemoryRouter>
        <BlockedContactsPanel />
      </MemoryRouter>,
    );
  });
}

function shortOf(key: string): string {
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

describe("BlockedContactsPanel — collapsed rows are distinguishable, names stay hidden", () => {
  it("shows the short key while collapsed, so two blocked contacts differ at a glance", () => {
    render();
    const text = container.textContent ?? "";
    // Both rows carry the generic label…
    expect(text).toContain("Blocked contact");
    // …but each is distinguishable by its truncated key, collapsed.
    expect(text).toContain(`Key ${shortOf(blockedKeyA)}`);
    expect(text).toContain(`Key ${shortOf(blockedKeyB)}`);
    // The shoulder-surfing posture holds: no display names collapsed.
    expect(text).not.toContain("Ana Blocked");
    expect(text).not.toContain("Berto Blocked");
  });

  it("reveals the display name only after tapping the row, and re-obscures on a second tap", () => {
    render();
    const rowButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        'button[aria-expanded="false"]',
      ),
    ).find((b) => (b.textContent ?? "").includes(shortOf(blockedKeyA)));
    expect(rowButton).toBeDefined();
    act(() => {
      rowButton!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("Ana Blocked");
    // The other row stays obscured — reveal is per-row.
    expect(container.textContent).not.toContain("Berto Blocked");
    act(() => {
      rowButton!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).not.toContain("Ana Blocked");
    // The short key stays either way.
    expect(container.textContent).toContain(`Key ${shortOf(blockedKeyA)}`);
  });

  it("history rows show the short key collapsed too", () => {
    mockBlocks = [];
    mockHistory = [
      {
        id: "h1",
        blockerKey: meKey,
        blockedKey: blockedKeyA,
        firstBlockedAt: 1690000000000,
        lastUnblockedAt: 1700000000000,
      },
    ];
    render();
    const text = container.textContent ?? "";
    expect(text).toContain(`Key ${shortOf(blockedKeyA)}`);
    expect(text).not.toContain("Ana Blocked");
  });
});
