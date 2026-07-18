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
// WCAG 2.4.3 (Focus Order) regression suite for the Board page.
//
// PR #181 deferred a known violation: on mobile the visual stack put
// the filter rail BETWEEN search and list, but the DOM order put the
// list BEFORE the filter (the rail was reordered with `order-*`
// utilities, which are visual-only). Screen-reader and keyboard
// users read the list before the controls that filter it.
//
// The fix extracted PostFilterRail / ProjectFilterRail so mobile DOM
// order matches visual order natively, with every `order-*` Tailwind
// class stripped. Originally the rails rendered twice (a mobile copy
// + a desktop col-1 copy with the documented tab-after-list
// tradeoff); the desktop rail track is now retired and the single
// render site between search and list serves every breakpoint — so
// the invariant below now holds for desktop tab order too.
//
// These tests lock both invariants:
//   1. The DOM order at render time is tablist → search → filter →
//      list, on both NEED and PROJECTS tabs.
//   2. Zero `order-*` utility classes appear in the rendered tree.
//
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock `useApp` BEFORE importing the page. The real provider needs a
// hydrated Dexie connection; for an ordering test we just supply the
// shape `Board.tsx` (and its sub-components) consume.
vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));

// Stub the heavy sub-components that aren't relevant to ordering.
// AttentionSection pulls in a wide tree (toast / pending-action /
// every event-rsvp helper) and has its own focused tests; here we
// replace it with a marker that participates in DOM order but
// brings nothing else along. The Board-nudge orchestrator and the
// hint component likewise stub to nulls — they only crowd the
// snapshot and contribute nothing to synchronous DOM order.
vi.mock("@/components/AttentionSection", () => ({
  AttentionSection: () => <div data-testid="attention-section" />,
}));
vi.mock("@/components/BoardNudges", () => ({
  BoardNudges: () => null,
}));
vi.mock("@/components/ContextualHint", () => ({
  ContextualHint: () => null,
}));

import "@/i18n";
import BoardPage from "./Board";
import type {
  Member,
  Post,
  Project,
  ProjectTask,
  SignedVouch,
} from "@/types";
import type { InviteRow } from "@/db/database";

interface MockState {
  posts: Post[];
  members: Member[];
  currentMember: Member | null;
  projects: Project[];
  projectTasks: ProjectTask[];
  vouches: SignedVouch[];
  invites: InviteRow[];
  nodeId: string;
  communityNodeIds: ReadonlySet<string>;
}

let mockState: MockState = blankState();

function blankState(): MockState {
  return {
    posts: [],
    members: [],
    currentMember: null,
    projects: [],
    projectTasks: [],
    vouches: [],
    invites: [],
    nodeId: "node-1",
    communityNodeIds: new Set(["node-1"]),
  };
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

function makePost(over: Partial<Post> & { id: string }): Post {
  const base: Post = {
    id: over.id,
    type: "NEED",
    category: "food",
    title: `Post ${over.id}`,
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
    signature: "",
  };
  return { ...base, ...over };
}

function makeProject(over: Partial<Project> & { id: string }): Project {
  const base: Project = {
    id: over.id,
    title: `Project ${over.id}`,
    description: "",
    category: "infrastructure",
    organizerKey: "me-key",
    coOrganizerKeys: [],
    status: "active",
    targetHours: 10,
    contributedHours: 0,
    deadline: null,
    createdAt: 0,
    completedAt: null,
    pauseNote: null,
    locationZone: "",
    tags: [],
    nodeId: "node-1",
    templateId: null,
  };
  return { ...base, ...over };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = blankState();
  mockState.currentMember = makeMember("me-key");
  mockState.members = [mockState.currentMember];
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(node: ReactNode, initialEntry: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>{node}</MemoryRouter>,
    );
  });
}

/** Returns true iff `before` precedes `after` in document order. */
function precedes(before: Element, after: Element): boolean {
  // Node.DOCUMENT_POSITION_FOLLOWING === 4: `after` follows `before`.
  return (before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

describe("Board reading order (WCAG 2.4.3)", () => {
  it("NEEDS tab: tablist → search → filter → list in DOM order", () => {
    mockState.posts = [
      makePost({ id: "n1", type: "NEED", title: "Need one" }),
      makePost({ id: "n2", type: "NEED", title: "Need two" }),
    ];
    render(<BoardPage />, "/?tab=needs");

    const tablist = container.querySelector('[role="tablist"]');
    const searchInput = container.querySelector('input[type="search"]');
    // Filter rail is identified by its category select — the SINGLE
    // render site inside the reading column between search and list
    // (the desktop col-1 copy, and its duplicated id, are retired).
    const filterSelects = container.querySelectorAll('#category-filter');
    expect(tablist).not.toBeNull();
    expect(searchInput).not.toBeNull();
    expect(filterSelects.length).toBe(1);

    const mobileFilter = filterSelects[0]!;
    const list = container.querySelector('ul');
    expect(list).not.toBeNull();

    // The mobile Filters disclosure trigger sits between search and
    // the rail it controls — trigger precedes rail in DOM so DOM
    // order equals visual order in both disclosure states.
    const filtersToggle = container.querySelector(
      'button[aria-controls="board-post-filters"]',
    );
    expect(filtersToggle).not.toBeNull();

    expect(precedes(tablist!, searchInput!)).toBe(true);
    expect(precedes(searchInput!, filtersToggle!)).toBe(true);
    expect(precedes(filtersToggle!, mobileFilter)).toBe(true);
    expect(precedes(mobileFilter, list!)).toBe(true);
  });

  it("PROJECTS tab: tablist → search → filter → list → archive in DOM order", () => {
    mockState.projects = [
      makeProject({ id: "p1", title: "Project one" }),
      makeProject({ id: "p2", title: "Project two" }),
    ];
    render(<BoardPage />, "/?tab=projects");

    const tablist = container.querySelector('[role="tablist"]');
    const searchInput = container.querySelector('input[type="search"]');
    // The project filter rail's single render site.
    const projectCategorySelects = container.querySelectorAll(
      '#project-category-filter',
    );
    expect(projectCategorySelects.length).toBeGreaterThan(0);
    const mobileFilter = projectCategorySelects[0]!;
    const list = container.querySelector('ul');
    const archiveLink = container.querySelector(
      'a[href="/projects/archive"]',
    );

    expect(tablist).not.toBeNull();
    expect(searchInput).not.toBeNull();
    expect(list).not.toBeNull();
    expect(archiveLink).not.toBeNull();

    const filtersToggle = container.querySelector(
      'button[aria-controls="board-project-filters"]',
    );
    expect(filtersToggle).not.toBeNull();

    expect(precedes(tablist!, searchInput!)).toBe(true);
    expect(precedes(searchInput!, filtersToggle!)).toBe(true);
    expect(precedes(filtersToggle!, mobileFilter)).toBe(true);
    expect(precedes(mobileFilter, list!)).toBe(true);
    expect(precedes(list!, archiveLink!)).toBe(true);
  });

  it("attention rail slot stays first; the sticky header group holds tablist + search and NOT the filters disclosure", () => {
    // Part of the mobile-chrome polish: tablist + search stick
    // together inside one wrapper (shared backdrop band), while the
    // Filters disclosure stays OUTSIDE it — only tablist + search
    // stick. The attention rail's slot (here the stubbed marker)
    // still precedes everything in the reading order. The collapsed
    // attention summary occupying that same slot is asserted in
    // AttentionSection.mobileCollapse.test.tsx, where the real
    // component renders.
    mockState.posts = [makePost({ id: "n1", type: "NEED", title: "Need" })];
    render(<BoardPage />, "/?tab=needs");

    const attention = container.querySelector(
      '[data-testid="attention-section"]',
    );
    const tablist = container.querySelector('[role="tablist"]');
    const searchInput = container.querySelector('input[type="search"]');
    const filtersToggle = container.querySelector(
      'button[aria-controls="board-post-filters"]',
    );
    expect(attention).not.toBeNull();
    expect(precedes(attention!, tablist!)).toBe(true);

    // tablist and search share a sticky ancestor...
    const stickyGroup = tablist!.parentElement;
    expect(stickyGroup?.className).toContain("sticky");
    expect(stickyGroup?.contains(searchInput)).toBe(true);
    // ...which the filters disclosure is not part of.
    expect(stickyGroup?.contains(filtersToggle)).toBe(false);
  });

  it("renders no `order-*` Tailwind classes anywhere in the Board tree", () => {
    // Both copies (mobile + desktop) of every filter rail render in
    // jsdom regardless of viewport, so this scan covers the whole
    // rendered surface. Locking the no-`order-*` invariant prevents
    // a future regression that would silently re-introduce the
    // mobile DOM-order vs. visual-order divergence.
    mockState.posts = [makePost({ id: "n1", type: "NEED", title: "Need" })];
    render(<BoardPage />, "/?tab=needs");

    const orderClassed = container.querySelectorAll('[class*="order-"]');
    // Filter out any element whose `order-*` matches are only the
    // documentation noise from sub-component classnames — there
    // should be none. Hard-asserting zero matches catches both
    // `order-1` style positional utilities and `lg:order-none`
    // resets, which together formed the mobile reordering trick.
    expect(orderClassed.length).toBe(0);
  });
});

describe("Board desktop rail collapse (screen-real-estate pilot report)", () => {
  // jsdom does no layout, so these lock the CLASS contract the
  // collapse depends on: the outer grid must not reserve ANY fixed
  // side track — the attention column is `auto` (sizes to the rail
  // wrapper) and the old 240px filter-rail track is retired — and
  // the rail wrapper must carry its own width and hide itself when
  // AttentionSection renders nothing — otherwise 280px + gap of
  // permanently dead space returns to the right edge of every
  // no-attention visit.
  it("uses [reading, auto] tracks with no fixed side column, and the rail wrapper self-sizes and hides when empty", () => {
    render(<BoardPage />, "/");
    const gridEl = container.querySelector(
      '[class*="lg:grid-cols-"]',
    ) as HTMLElement;
    expect(gridEl).toBeTruthy();
    const gridClass = gridEl.className;
    expect(gridClass).toContain("lg:grid-cols-[minmax(0,1fr)_auto]");
    expect(gridClass).not.toContain("240px");
    expect(gridClass).not.toContain("280px]");

    const marker = container.querySelector(
      '[data-testid="attention-section"]',
    ) as HTMLElement;
    expect(marker).toBeTruthy();
    const rail = marker.parentElement as HTMLElement;
    expect(rail.className).toContain("lg:w-[280px]");
    expect(rail.className).toContain("lg:empty:hidden");
  });
});
