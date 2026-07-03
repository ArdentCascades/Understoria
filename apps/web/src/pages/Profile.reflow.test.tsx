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
//
// Screen-real-estate reflow suite for the Profile page (the
// Profile-side sibling of ProjectDetail.reflow.test.tsx).
//
// Locks the reorder invariants:
//   1. Mobile reading order (WCAG 2.4.3): balance (+ its hint) →
//      exchange history → participation (Invites + its hint) →
//      Roles earned → About editor → Emergency. Every-visit content
//      first; the rarely-touched editor no longer separates the
//      balance from the history that itemizes it.
//   2. The invite hint sits adjacent to the Invites card (it used to
//      float above the whole participation cluster).
//   3. Emergency is top-level: never inside a <details> disclosure —
//      the panic path must stay findable under stress
//      (privacy-as-precondition).
//   4. Zero `order-*` Tailwind utilities in the rendered tree — DOM
//      order IS the visual order at every breakpoint (same invariant
//      as Board.readingOrder.test.tsx).
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
// ContextualHint normally gates on a Dexie-stored dismissal flag —
// stub it to an always-rendered labeled region so the suite can
// assert hint PLACEMENT without a database.
vi.mock("@/components/ContextualHint", () => ({
  ContextualHint: ({ ariaLabel }: { ariaLabel: string }) => (
    <div role="region" aria-label={ariaLabel} />
  ),
}));
// Sections with their own DB reads or heavy content — none of them is
// what this suite asserts (mirrors Profile.nav.test.tsx).
vi.mock("@/components/PairingLogSection", () => ({
  PairingLogSection: () => null,
}));
vi.mock("@/components/LearnSection", () => ({ LearnSection: () => null }));
vi.mock("@/components/DisputesSection", () => ({
  DisputesSection: () => null,
}));
vi.mock("@/components/ProposalsSection", () => ({
  ProposalsSection: () => null,
}));
vi.mock("@/components/CommunitySettingsSection", () => ({
  CommunitySettingsSection: () => null,
}));
vi.mock("@/components/InviteShareSheet", () => ({
  InviteShareSheet: () => null,
}));
vi.mock("@/components/MemberAvatar", () => ({ MemberAvatar: () => null }));
vi.mock("@/db/actions", () => ({ updateMemberProfile: vi.fn() }));
vi.mock("@/db/invites", () => ({ issueInvite: vi.fn() }));

import "@/i18n";
import ProfilePage from "./Profile";
import type { Exchange, Member } from "@/types";

const nodeId = "node_test";
const meKey = "me-key";
const otherKey = "other-key";

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
    nodeId,
    locationZone: "",
  };
}

function exchange(id: string, completedAt: number): Exchange {
  return {
    id,
    postId: `post-${id}`,
    helperKey: meKey,
    helpedKey: otherKey,
    hoursExchanged: 1,
    helperSignature: "sig-a",
    helpedSignature: "sig-b",
    completedAt,
    category: "food",
    nodeId,
    flaggedForReview: false,
  };
}

interface MockState {
  currentMember: Member | null;
  members: Member[];
  exchanges: Exchange[];
  posts: unknown[];
  projects: unknown[];
  projectTasks: unknown[];
  achievements: unknown[];
  invites: unknown[];
  vouches: unknown[];
  nodeId: string;
  nodeConfig: { autoConfirmHours: number };
  blockedKeys: Set<string>;
  proposals: unknown[];
  setCurrentMember: (key: string) => void;
}

let mockState: MockState;

function freshState(): MockState {
  return {
    currentMember: member(meKey, "Mira Member"),
    members: [member(meKey, "Mira Member"), member(otherKey, "Oli Other")],
    exchanges: [],
    posts: [],
    projects: [],
    projectTasks: [],
    achievements: [],
    invites: [],
    vouches: [],
    nodeId,
    nodeConfig: { autoConfirmHours: 168 },
    blockedKeys: new Set<string>(),
    proposals: [],
    setCurrentMember: vi.fn(),
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = freshState();
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
      <MemoryRouter initialEntries={["/profile"]}>
        <ProfilePage />
      </MemoryRouter>,
    );
  });
}

/** Returns true iff `before` precedes `after` in document order. */
function precedes(before: Element, after: Element): boolean {
  // Node.DOCUMENT_POSITION_FOLLOWING === 4: `after` follows `before`.
  return (
    (before.compareDocumentPosition(after) &
      Node.DOCUMENT_POSITION_FOLLOWING) !==
    0
  );
}

function headingByText(text: string): Element {
  const h = Array.from(container.querySelectorAll("h2, h3")).find(
    (el) => (el.textContent ?? "").includes(text),
  );
  if (!h) throw new Error(`Heading not found: ${text}`);
  return h;
}

function hintByLabel(label: string): Element {
  const el = container.querySelector(`[aria-label="${label}"]`);
  if (!el) throw new Error(`Hint not found: ${label}`);
  return el;
}

describe("ProfilePage — mobile reading order (WCAG 2.4.3)", () => {
  it("orders balance → history → invites (+hint) → roles → editor → emergency", () => {
    mockState.exchanges = [exchange("e1", 1000)];
    render();

    const balance = Array.from(container.querySelectorAll("div")).find(
      (el) => (el.textContent ?? "").trim().startsWith("Your balance"),
    );
    expect(balance).toBeDefined();
    const history = headingByText("Your exchange history");
    const invites = headingByText("Invites you've issued");
    const roles = headingByText("Your community roles");
    const editor = headingByText("About you");
    const emergency = headingByText("Emergency");

    expect(precedes(balance!, history)).toBe(true);
    expect(precedes(history, invites)).toBe(true);
    expect(precedes(invites, roles)).toBe(true);
    expect(precedes(roles, editor)).toBe(true);
    expect(precedes(editor, emergency)).toBe(true);
  });

  it("keeps the balance hint with the balance card, before the history", () => {
    render();
    const balanceHint = hintByLabel("Understanding your balance");
    const history = headingByText("Your exchange history");
    expect(precedes(balanceHint, history)).toBe(true);
  });

  it("moves the invite hint adjacent to the Invites card (after it, before roles)", () => {
    render();
    const invites = headingByText("Invites you've issued");
    const inviteHint = hintByLabel("Growing the community");
    const roles = headingByText("Your community roles");
    expect(precedes(invites, inviteHint)).toBe(true);
    expect(precedes(inviteHint, roles)).toBe(true);
  });

  it("keeps Emergency top-level — never inside a <details> disclosure", () => {
    render();
    const emergency = headingByText("Emergency");
    expect(emergency.closest("details")).toBeNull();
  });

  it("renders no `order-*` Tailwind utilities anywhere in the tree", () => {
    render();
    // Word-boundary scan (`^|space|:` before `order-`) rather than a
    // bare substring so `border-*` color utilities don't false-match.
    const offenders = Array.from(container.querySelectorAll("[class]")).filter(
      (el) => /(?:^|[\s:])order-/.test(el.getAttribute("class") ?? ""),
    );
    expect(offenders.length).toBe(0);
  });
});
