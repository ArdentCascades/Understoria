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
// Board command-band contract (desktop-waste report, round 4):
// the Needs/Offers/Projects tablist and the search input share ONE
// sticky band at every width. Phone portrait stacks them (full-width
// tabs are the right thumb targets); at lg+ and landscape-short the
// band is a single row — the tablist shrinks to content width
// instead of stretching three pills across a ~990px column, and the
// search fills the rest. The discovery links and the filter row
// likewise share one line at those widths. jsdom does no layout, so
// these pin the CLASS contract; DOM order invariants live in
// Board.readingOrder.test.tsx.
//
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));
vi.mock("@/components/AttentionSection", () => ({
  AttentionSection: () => null,
}));
vi.mock("@/components/BoardNudges", () => ({ BoardNudges: () => null }));
vi.mock("@/components/ContextualHint", () => ({
  ContextualHint: () => null,
}));

import "@/i18n";
import BoardPage from "./Board";
import type { Member } from "@/types";

const me: Member = {
  publicKey: "me-key",
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

const mockState = {
  posts: [],
  members: [me],
  currentMember: me,
  projects: [],
  projectTasks: [],
  vouches: [],
  invites: [],
  nodeId: "node-1",
  communityNodeIds: new Set(["node-1"]),
};

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root?.unmount());
  container.remove();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(<MemoryRouter initialEntries={["/?tab=needs"]}>{node}</MemoryRouter>);
  });
}

describe("Board command band", () => {
  it("tablist and search live in ONE sticky band that rows at lg and landscape-short", () => {
    render(<BoardPage />);
    const tablist = container.querySelector('[role="tablist"]')!;
    const band = tablist.parentElement!;
    // One band, sticky at every width — the old lg:contents dissolve
    // (which let the tabs scroll away on desktop) must not return.
    expect(band.className).toContain("sticky");
    expect(band.className).not.toContain("lg:contents");
    expect(band.className).toContain("lg:flex");
    expect(band.className).toContain("landscape-short:flex");
    expect(band.className).toContain("lg:top-4");
    // The search row is the band's other child — no independent
    // sticky treatment of its own anymore.
    const search = container.querySelector('input[type="search"]')!;
    const searchRow = search.closest("div")!.parentElement === band
      ? search.closest("div")!
      : (search.closest("label")!.parentElement as HTMLElement);
    expect(band.contains(search)).toBe(true);
    expect(searchRow.className).not.toContain("lg:sticky");
    expect(searchRow.className).toContain("lg:flex-1");
  });

  it("tablist shrinks to content width in row modes instead of stretching", () => {
    render(<BoardPage />);
    const tablist = container.querySelector('[role="tablist"]')!;
    // Portrait keeps the full-width 3-up grid (thumb targets)…
    expect(tablist.className).toContain("grid-cols-3");
    // …row modes become a content-sized segmented control.
    expect(tablist.className).toContain("lg:w-fit");
    expect(tablist.className).toContain("landscape-short:w-fit");
    // Row-mode tabs carry their own horizontal padding (the grid
    // stretch used to provide the hit area).
    const tab = tablist.querySelector("button")!;
    expect(tab.className).toContain("lg:px-5");
    expect(tab.className).toContain("landscape-short:px-4");
  });

  it("discovery links and the filter row share one line at lg/landscape-short", () => {
    render(<BoardPage />);
    const filters = container.querySelector("#board-post-filters")!;
    // The shared line wrapper sits above the per-tab filter block.
    const line = filters.parentElement!.parentElement as HTMLElement;
    expect(line.className).toContain("lg:flex");
    expect(line.className).toContain("lg:justify-between");
    expect(line.className).toContain("landscape-short:flex");
    // Discovery block is the line's first child (DOM order = visual
    // order, discovery left / filters right) and may grow when the
    // One-small-thing card expands.
    const discovery = line.firstElementChild as HTMLElement;
    expect(discovery.textContent).toContain("plug in");
    expect(discovery.className).toContain("lg:flex-auto");
    expect(discovery.className).toContain("lg:mb-0");
  });
});
