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
// The fix extracts PostFilterRail / ProjectFilterRail and renders
// each in two DOM positions — a mobile-visible copy between search
// and list, a desktop-visible copy as an outer-grid child in col-1
// — so mobile DOM order matches visual order natively. Every
// `order-*` Tailwind class is stripped.
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
// brings nothing else along. The nudge / hint components likewise
// stub to nulls — they only crowd the snapshot.
vi.mock("@/components/AttentionSection", () => ({
  AttentionSection: () => <div data-testid="attention-section" />,
}));
vi.mock("@/components/FirstActionNudge", () => ({
  FirstActionNudge: () => null,
}));
vi.mock("@/components/ProfileNudge", () => ({
  ProfileNudge: () => null,
}));
vi.mock("@/components/VouchDiscoveryNudge", () => ({
  VouchDiscoveryNudge: () => null,
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
    // Filter rail is identified by its category select. The desktop
    // copy is hidden via `hidden lg:block`; the mobile copy is the
    // one the screen reader reaches first on mobile and is what we
    // assert against here (jsdom has no viewport so both copies
    // render; the mobile copy is the one whose wrapper is NOT
    // `hidden`).
    const filterSelects = container.querySelectorAll('#category-filter');
    expect(tablist).not.toBeNull();
    expect(searchInput).not.toBeNull();
    expect(filterSelects.length).toBeGreaterThan(0);

    // The MOBILE filter copy is the first one in DOM order — it is
    // rendered inside the middle wrapper between search and list.
    // The DESKTOP copy is the outer-grid child later in the tree.
    const mobileFilter = filterSelects[0]!;
    const list = container.querySelector('ul');
    expect(list).not.toBeNull();

    expect(precedes(tablist!, searchInput!)).toBe(true);
    expect(precedes(searchInput!, mobileFilter)).toBe(true);
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
    // Mobile filter copy: the first `#project-category-filter` in
    // the rendered tree.
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

    expect(precedes(tablist!, searchInput!)).toBe(true);
    expect(precedes(searchInput!, mobileFilter)).toBe(true);
    expect(precedes(mobileFilter, list!)).toBe(true);
    expect(precedes(list!, archiveLink!)).toBe(true);
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
