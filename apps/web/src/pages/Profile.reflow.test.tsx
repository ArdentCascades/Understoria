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

/** The two Roles-earned render sites (rail + mobile), in DOM order:
 *  [0] the desktop copy inside the rail `aside` (`hidden lg:block`),
 *  [1] the mobile copy in the main column (`lg:hidden`). */
function rolesHeadings(): Element[] {
  return Array.from(container.querySelectorAll("h2, h3")).filter((el) =>
    (el.textContent ?? "").includes("Your community roles"),
  );
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
    // Both roles copies render in jsdom (no viewport); the MOBILE
    // copy is the one whose position the phone stack reads.
    const mobileRoles = rolesHeadings()[1]!;
    const editor = headingByText("About you");
    const emergency = headingByText("Emergency");

    expect(precedes(balance!, history)).toBe(true);
    expect(precedes(history, invites)).toBe(true);
    expect(precedes(invites, mobileRoles)).toBe(true);
    expect(precedes(mobileRoles, editor)).toBe(true);
    expect(precedes(editor, emergency)).toBe(true);
  });

  it("renders Roles earned at two sites: rail copy hidden below lg, mobile copy hidden at lg+", () => {
    render();
    const [railRoles, mobileRoles] = rolesHeadings();
    expect(railRoles).toBeDefined();
    expect(mobileRoles).toBeDefined();
    // Rail copy: inside the sidebar, desktop-only.
    expect(railRoles!.closest("aside")).not.toBeNull();
    expect(railRoles!.closest(".hidden.lg\\:block")).not.toBeNull();
    // Mobile copy: in the main column, mobile-only.
    expect(mobileRoles!.closest("aside")).toBeNull();
    expect(mobileRoles!.closest(".lg\\:hidden")).not.toBeNull();
  });

  it("docks header, balance (+hint), and roles in the rail aside; history in the main column", () => {
    render();
    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();
    // Header identity + balance live in the rail...
    expect(aside!.querySelector("h1")).not.toBeNull();
    expect(aside!.textContent).toContain("Your balance");
    expect(
      aside!.querySelector('[aria-label="Understanding your balance"]'),
    ).not.toBeNull();
    // ...the ledger does not.
    expect(headingByText("Your exchange history").closest("aside")).toBeNull();
  });

  it("uses no lg:columns-2 CSS-column clusters (superseded by the rail grid)", () => {
    render();
    expect(container.querySelector('[class*="columns-2"]')).toBeNull();
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
    const mobileRoles = rolesHeadings()[1]!;
    expect(precedes(invites, inviteHint)).toBe(true);
    expect(precedes(inviteHint, mobileRoles)).toBe(true);
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

describe("ProfilePage — 'Community & account' index", () => {
  it("renders one index section between the editor and Emergency", () => {
    render();
    const index = headingByText("Community & account");
    const editor = headingByText("About you");
    const emergency = headingByText("Emergency");
    expect(precedes(editor, index)).toBe(true);
    expect(precedes(index, emergency)).toBe(true);
  });

  it("hosts the Settings row inside the index", () => {
    render();
    const index = headingByText("Community & account").closest("section")!;
    const settingsRow = Array.from(
      index.querySelectorAll<HTMLAnchorElement>('a[href="/settings"]'),
    ).find((a) => (a.textContent ?? "").includes("Settings"));
    expect(settingsRow).toBeDefined();
  });

  it("no longer hosts the Add-device entry — it moved to Settings", () => {
    render();
    // "Add another device" left the Profile index for Settings' "On
    // this device" zone (beside Recovery Kit / Guardians). Guard the
    // move: the entry heading and its "Start pairing" CTA must not
    // render on Profile anymore. (The paired-device inventory stays on
    // Profile by Emergency — that's a different surface with a
    // different heading.)
    expect(
      Array.from(container.querySelectorAll("h1,h2,h3,h4")).some(
        (h) => (h.textContent ?? "").trim() === "Add another device",
      ),
    ).toBe(false);
    expect(
      Array.from(container.querySelectorAll("button")).some(
        (b) => (b.textContent ?? "").trim() === "Start pairing",
      ),
    ).toBe(false);
  });
});

describe("ProfilePage — exchange history clamp", () => {
  function historyRows(): Element[] {
    const heading = headingByText("Your exchange history");
    const section = heading.closest("section")!;
    return Array.from(section.querySelectorAll("li"));
  }

  function toggleButton(): HTMLButtonElement | undefined {
    const section = headingByText("Your exchange history").closest("section")!;
    return Array.from(section.querySelectorAll("button")).find((b) =>
      /older exchange|fewer exchanges/i.test(b.textContent ?? ""),
    );
  }

  it("renders every settled row (and no toggle) at or below the limit", () => {
    mockState.exchanges = Array.from({ length: 10 }, (_, i) =>
      exchange(`e${i}`, 1000 + i),
    );
    render();
    expect(historyRows().length).toBe(10);
    expect(toggleButton()).toBeUndefined();
  });

  it("clamps to the newest 10 rows with a 'Show N older exchanges' toggle", () => {
    mockState.exchanges = Array.from({ length: 13 }, (_, i) =>
      exchange(`e${i}`, 1000 + i),
    );
    render();
    const rows = historyRows();
    expect(rows.length).toBe(10);
    // Newest first: the top row is the most recent exchange (e12).
    expect(rows[0]!.textContent).toContain("Oli Other");
    const btn = toggleButton();
    expect(btn).toBeDefined();
    expect(btn!.textContent).toBe("Show 3 older exchanges");

    act(() => {
      btn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(historyRows().length).toBe(13);
    expect(toggleButton()!.textContent).toBe("Show fewer exchanges");
  });
});
