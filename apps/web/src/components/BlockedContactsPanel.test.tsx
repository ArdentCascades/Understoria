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
  BLOCK_NOTE_MAX_LENGTH: 500,
  listBlocks: vi.fn(async () => []),
  listPreviouslyBlocked: vi.fn(async () => []),
  clearPreviouslyBlocked: vi.fn(async () => undefined),
  updateBlockScope: vi.fn(async () => undefined),
  unblockMember: vi.fn(async () => undefined),
}));

import "@/i18n";
import { BlockedContactsPanel } from "./BlockedContactsPanel";
import { updateBlockScope } from "@/db/blocks";
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

// Round-3 persona finding: the private note captured at block time was
// WRITE-ONLY — stored, never displayed. It now shows on the expanded
// row (same tap that reveals the name — §6.2 collapsed anonymity holds
// for the note too) with an edit affordance backed by updateBlockScope.
describe("BlockedContactsPanel — private note on the expanded row", () => {
  function expandRow(key: string): HTMLButtonElement {
    const rowButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        'button[aria-expanded="false"]',
      ),
    ).find((b) => (b.textContent ?? "").includes(shortOf(key)));
    if (!rowButton) throw new Error("row button not found");
    act(() => {
      rowButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    return rowButton;
  }

  function buttonByText(label: string): HTMLButtonElement | undefined {
    return Array.from(container.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === label,
    );
  }

  function setTextareaValue(value: string) {
    const ta = container.querySelector("textarea");
    if (!ta) throw new Error("note textarea not found");
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )!.set!;
    act(() => {
      setter.call(ta, value);
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  async function flush() {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  it("keeps the note hidden while collapsed and shows it after the tap", () => {
    mockBlocks = [
      { ...blockRow("b1", blockedKeyA), note: "borrowed my ladder, never returned" },
    ];
    render();
    // Collapsed: the shoulder-surfing posture covers the note too.
    expect(container.textContent).not.toContain("borrowed my ladder");
    expandRow(blockedKeyA);
    expect(container.textContent).toContain("Your private note");
    expect(container.textContent).toContain(
      "borrowed my ladder, never returned",
    );
    expect(buttonByText("Edit note")).toBeDefined();
  });

  it("saves an edited note through updateBlockScope, preserving hideGovernance", async () => {
    mockBlocks = [
      { ...blockRow("b1", blockedKeyA), note: "old note", hideGovernance: true },
    ];
    render();
    expandRow(blockedKeyA);
    act(() => {
      buttonByText("Edit note")!.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    const ta = container.querySelector("textarea");
    expect(ta).not.toBeNull();
    // The editor opens seeded with the current note…
    expect(ta!.value).toBe("old note");
    // …and enforces the 500-char note ceiling at the input level.
    expect(ta!.getAttribute("maxlength")).toBe("500");
    setTextareaValue("actually it was the drill");
    act(() => {
      buttonByText("Save note")!.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    await flush();
    expect(vi.mocked(updateBlockScope)).toHaveBeenCalledWith({
      blockerKey: meKey,
      blockedKey: blockedKeyA,
      hideGovernance: true,
      note: "actually it was the drill",
    });
  });

  it("offers to add a note when there is none, and saves empty text as null", async () => {
    render(); // default fixture rows have note: null
    expandRow(blockedKeyA);
    const add = buttonByText("Add a private note");
    expect(add).toBeDefined();
    act(() => {
      add!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    setTextareaValue("   ");
    act(() => {
      buttonByText("Save note")!.dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    await flush();
    expect(vi.mocked(updateBlockScope)).toHaveBeenCalledWith({
      blockerKey: meKey,
      blockedKey: blockedKeyA,
      hideGovernance: false,
      note: null,
    });
  });
});
