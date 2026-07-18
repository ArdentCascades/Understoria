/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The board's docked post panel (the nested /post/:id route). Locks:
//   1. /post/:id renders the BOARD UNDERNEATH the panel — the board
//      stays mounted, on the tab named in the preserved ?tab= param.
//   2. Closing the panel returns to "/" WITH the query string intact
//      (Offers-tab triage lands back on Offers) and local board
//      state (the search box) survives the whole round trip — proof
//      the board never unmounted.
//   3. While the panel is open, the FAB unmounts (the panel docks
//      exactly where the FAB floats at lg+) and the AttentionSection
//      rail hides at lg (the panel needs its width).
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));
vi.mock("@/components/AttentionSection", () => ({
  AttentionSection: () => <div data-testid="attention-section" />,
}));
vi.mock("@/components/BoardNudges", () => ({
  BoardNudges: () => null,
}));
vi.mock("@/components/ContextualHint", () => ({
  ContextualHint: () => null,
}));
// The panel's content is the real PostDetailPage in production; its
// behavior has its own suites. Here a marker keeps the tree light —
// this suite is about the FRAME (route nesting, board coexistence).
vi.mock("@/pages/PostDetail", () => ({
  default: () => <div data-testid="post-detail" />,
}));

import "@/i18n";
import BoardPage from "./Board";
import { BoardPostPanel } from "@/components/BoardPostPanel";
import { SPLIT_CAPABLE_QUERY } from "@/lib/viewport";
import type { Member, Post } from "@/types";

const mockState = {
  posts: [] as Post[],
  members: [] as Member[],
  currentMember: null as Member | null,
  projects: [],
  projectTasks: [],
  vouches: [],
  invites: [],
  nodeId: "node-1",
  nodeConfig: null,
  blockedKeys: new Set<string>(),
  communityNodeIds: new Set(["node-1"]),
  founderRoots: new Set<string>(),
};

function makePost(id: string): Post {
  return {
    id,
    type: "NEED",
    category: "other",
    title: `Post ${id}`,
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "me-key",
    claimedBy: null,
    status: "open",
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId: "node-1",
    signature: "sig",
  } as Post;
}

function makeMember(publicKey: string): Member {
  return {
    publicKey,
    displayName: "Tester",
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

let container: HTMLDivElement;
let root: Root;
let lastLocation: { pathname: string; search: string } | null = null;

function LocationProbe() {
  lastLocation = useLocation();
  return null;
}

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState.currentMember = makeMember("me-key");
  mockState.members = [mockState.currentMember];
  mockState.posts = [];
  lastLocation = null;
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function renderAt(path: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<BoardPage />}>
            <Route path="post/:id" element={<BoardPostPanel />} />
          </Route>
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    );
  });
}

const panel = () => container.querySelector('aside[aria-label="Post details"]');
const fab = () => container.querySelector("div.pointer-events-none.fixed");

// React 18 swallows direct `.value =` writes (its value tracker sees
// no change); go through the native setter so the input event counts.
function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("Board docked post panel", () => {
  it("renders the board (on the preserved tab) beneath the open panel", () => {
    renderAt("/post/p1?tab=offers");

    expect(panel()).not.toBeNull();
    expect(container.querySelector('[data-testid="post-detail"]')).not.toBeNull();

    // The board is alive behind it, on the tab from the query string.
    const tabs = [...container.querySelectorAll('[role="tab"]')];
    expect(tabs.length).toBe(3);
    const selected = tabs.find((t) => t.getAttribute("aria-selected") === "true");
    expect(selected?.textContent).toContain("Offers");
  });

  it("close returns to the board with the tab intact; board state survives", () => {
    renderAt("/post/p1?tab=offers");

    // Local (non-URL) board state set while the panel is open…
    const search = container.querySelector<HTMLInputElement>(
      'input[type="search"]',
    )!;
    setInputValue(search, "soup");

    const close = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Close post panel"]',
    )!;
    act(() => {
      close.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(panel()).toBeNull();
    expect(lastLocation?.pathname).toBe("/");
    expect(lastLocation?.search).toBe("?tab=offers");
    // …survives the close: the board never unmounted.
    expect(
      container.querySelector<HTMLInputElement>('input[type="search"]')!.value,
    ).toBe("soup");
  });

  it("hides the FAB and the attention rail while the panel is open", () => {
    renderAt("/post/p1?tab=offers");
    expect(fab()).toBeNull();
    const rail = container.querySelector('[data-testid="attention-section"]')!
      .parentElement!;
    expect(rail.className).toContain("lg:hidden");

    // Close → FAB back, rail no longer suppressed.
    const close = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Close post panel"]',
    )!;
    act(() => {
      close.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(fab()).not.toBeNull();
    expect(
      container.querySelector('[data-testid="attention-section"]')!
        .parentElement!.className,
    ).not.toContain("lg:hidden");
  });

  it("cedes the filter rail's grid track while the panel is open", () => {
    // At exactly 1024px the panel + the 240px rail left ~290px for
    // the reading column — colliding tab pills, one-word-wide cards
    // (the pilot screenshots). While open: two grid tracks, no
    // desktop filter-rail copy. On close: the rail and its track
    // come straight back.
    renderAt("/post/p1?tab=offers");
    const grid = () =>
      container.querySelector('[class*="grid grid-cols-1 gap-4"]')!;
    const desktopRail = () =>
      container.querySelector('[class*="lg:sticky"][class*="lg:col-start-1"]');
    expect(grid().className).toContain("lg:grid-cols-[minmax(0,1fr)_auto]");
    expect(desktopRail()).toBeNull();

    const close = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Close post panel"]',
    )!;
    act(() => {
      close.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(grid().className).toContain(
      "lg:grid-cols-[240px_minmax(0,1fr)_auto]",
    );
    expect(desktopRail()).not.toBeNull();
  });
});

// Sideways split (SPLIT_CAPABLE_QUERY, lib/viewport.ts): a phone held
// landscape with ≥700px of width docks the panel beside the board —
// same two-pane posture as lg+, gated by the live media-query hook so
// rotation mid-view switches layouts without a remount.
describe("Board docked post panel — sideways split gate", () => {
  function stubMatchMedia(matches: boolean) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string) =>
        ({
          matches: query === SPLIT_CAPABLE_QUERY ? matches : false,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList,
    });
  }

  afterEach(() => {
    // Restore jsdom's native matchMedia-less window.
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  const postList = () =>
    container.querySelector('ul[class*="grid grid-cols-1 gap-3"]');

  it("docks the panel and dials the post list to one column while open", () => {
    stubMatchMedia(true);
    mockState.posts = [makePost("p1"), makePost("p2")];
    renderAt("/post/p1?tab=needs");

    // The panel is a docked column, not a full-screen takeover…
    expect(panel()).not.toBeNull();
    expect(panel()!.className).toContain("w-[45%]");
    expect(panel()!.className).not.toContain("fixed");

    // …and the board's list gives up the md: pair for its lifetime
    // (the reading column is ~55% of the viewport).
    expect(postList()!.className).not.toContain("md:grid-cols-2");

    const close = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Close post panel"]',
    )!;
    act(() => {
      close.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(panel()).toBeNull();
    expect(postList()!.className).toContain("md:grid-cols-2");
  });

  it("keeps today's full-screen takeover below the width floor", () => {
    stubMatchMedia(false);
    mockState.posts = [makePost("p1"), makePost("p2")];
    renderAt("/post/p1?tab=needs");

    expect(panel()).not.toBeNull();
    expect(panel()!.className).toContain("fixed");
    expect(panel()!.className).not.toContain("w-[45%]");
    // The list keeps its normal responsive columns.
    expect(postList()!.className).toContain("md:grid-cols-2");
  });
});

// ─── FAB placement (round-3 papercut) ───────────────────────────────
//
// landscape-short pins the post/offer pill bottom-right: centered, it
// floated over the middle of an already-short card list (the left nav
// rail and the reading column never occupy the right edge).

describe("Board FAB placement", () => {
  it("carries the landscape-short bottom-right classes", () => {
    renderAt("/?tab=offers");
    const el = fab();
    expect(el).not.toBeNull();
    expect(el!.className).toContain("landscape-short:justify-end");
    expect(el!.className).toContain(
      "landscape-short:bottom-[calc(1rem+env(safe-area-inset-bottom))]",
    );
  });
});
