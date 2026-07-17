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
 * Profile navigation batch: (a) the amber flagged-exchange chip in
 * Exchange history is a Link to /disputes — anchored to the matching
 * dispute card (`/disputes#<proposalId>`, PR #232's anchor scheme)
 * when a dispute proposal is resolvable from the exchange's post,
 * plain /disputes otherwise; visually the same chip, no new alarm
 * styling. (b) The labeled Settings row is a peer of the governance
 * cards with a 44px whole-row link to /settings; the header gear
 * stays for muscle memory.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
// Sections with their own DB reads or heavy content — none of them is
// what this suite asserts.
vi.mock("@/components/ContextualHint", () => ({ ContextualHint: () => null }));
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
import type { Exchange, Member, Post, Proposal } from "@/types";

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

function flaggedExchange(overrides: Partial<Exchange> = {}): Exchange {
  return {
    id: "ex-1",
    postId: "post-9",
    helperKey: meKey,
    helpedKey: otherKey,
    hoursExchanged: 2,
    helperSignature: "sig-a",
    helpedSignature: "sig-b",
    completedAt: 1_700_000_000_000,
    category: "food",
    nodeId,
    flaggedForReview: true,
    flagReason: "short_duration",
    ...overrides,
  };
}

/** A post whose exchange is half-signed — what PendingHistoryRow renders.
 *  NEED posted by other, claimed by me ⇒ I'm the helper (delta > 0);
 *  `confirmedBy: [meKey]` ⇒ the partner owes the confirmation. */
function awaitingPost(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-p1",
    type: "NEED",
    category: "food",
    title: "Groceries run",
    description: "",
    estimatedHours: 2,
    urgency: "low",
    postedBy: otherKey,
    claimedBy: meKey,
    status: "awaiting_confirmation",
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [meKey],
    awaitingSince: Date.now() - 2 * 60 * 1000,
    nodeId,
    signature: "",
    ...overrides,
  };
}

function disputeProposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    id: "disp-1",
    nodeId,
    kind: "dispute",
    category: "dispute",
    reversibilityTier: "easy",
    title: "Dispute",
    description: "",
    payload: "{}",
    proposerKey: otherKey,
    status: "open",
    createdAt: 500,
    closedAt: null,
    closedReason: null,
    impactReflection: null,
    disputePostId: "post-9",
    ...overrides,
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
  proposals: Proposal[];
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

function flagChip(): HTMLAnchorElement | undefined {
  return Array.from(container.querySelectorAll("a")).find(
    (a) => (a.textContent ?? "").trim() === "in community review",
  ) as HTMLAnchorElement | undefined;
}

describe("ProfilePage — flagged-exchange chip links to disputes", () => {
  it("anchors to the matching dispute card when one is resolvable from the exchange", () => {
    mockState.exchanges = [flaggedExchange()];
    mockState.proposals = [disputeProposal()];
    render();
    const chip = flagChip();
    expect(chip).toBeDefined();
    expect(chip!.getAttribute("href")).toBe("/disputes#disp-1");
    // The reason tooltip and the chip styling are unchanged.
    expect(chip!.getAttribute("title")).toContain("Very short exchange");
    expect(chip!.className).toContain("chip");
    expect(chip!.className).toContain("bg-amber-100");
  });

  it("uses the most recent dispute proposal when several match the post", () => {
    mockState.exchanges = [flaggedExchange()];
    mockState.proposals = [
      disputeProposal({ id: "disp-old", createdAt: 100 }),
      disputeProposal({ id: "disp-new", createdAt: 900 }),
    ];
    render();
    expect(flagChip()!.getAttribute("href")).toBe("/disputes#disp-new");
  });

  it("falls back to plain /disputes when no dispute proposal matches", () => {
    mockState.exchanges = [flaggedExchange()];
    mockState.proposals = [
      disputeProposal({ id: "disp-x", disputePostId: "someone-elses-post" }),
    ];
    render();
    expect(flagChip()!.getAttribute("href")).toBe("/disputes");
  });

  it("renders no chip at all on unflagged exchanges", () => {
    mockState.exchanges = [
      flaggedExchange({ flaggedForReview: false, flagReason: undefined }),
    ];
    render();
    expect(flagChip()).toBeUndefined();
    expect(container.textContent).not.toContain("in community review");
  });
});

describe("ProfilePage — pending exchange rows tell the truth", () => {
  it("phrases an unconfirmed helper-side row as 'Helping', never 'Helped'", () => {
    mockState.posts = [awaitingPost()];
    render();
    expect(container.textContent).toContain("Helping Oli Other");
    expect(container.textContent).not.toContain("Helped Oli Other");
    expect(container.textContent).toContain("pending");
  });

  it("phrases the receiving direction as 'Receiving help from'", () => {
    mockState.posts = [
      awaitingPost({
        postedBy: meKey,
        claimedBy: otherKey,
        confirmedBy: [otherKey],
      }),
    ];
    render();
    expect(container.textContent).toContain("Receiving help from Oli Other");
    expect(container.textContent).not.toContain("Received help from Oli Other");
  });

  it("shows the waiting-state age (awaitingSince), not the post's age", () => {
    // Post created 3h ago; confirmation arrived 2 minutes ago.
    mockState.posts = [awaitingPost()];
    render();
    expect(container.textContent).toContain("2m ago");
    expect(container.textContent).not.toContain("3h ago");
  });

  it("shows no relative time at all on legacy rows without awaitingSince", () => {
    mockState.posts = [awaitingPost({ awaitingSince: undefined })];
    render();
    const row = Array.from(container.querySelectorAll("li")).find((li) =>
      (li.textContent ?? "").includes("Helping Oli Other"),
    );
    expect(row).toBeDefined();
    // The row keeps its pending badge but carries no timestamp — better
    // no time than the post's age masquerading as the exchange's.
    expect(row!.textContent).toContain("pending");
    expect(row!.textContent).not.toContain("ago");
  });

  it("keeps past-tense phrasing and the completion time on settled rows", () => {
    mockState.exchanges = [
      flaggedExchange({ flaggedForReview: false, flagReason: undefined }),
    ];
    render();
    expect(container.textContent).toContain("Helped Oli Other");
    expect(container.textContent).not.toContain("Helping Oli Other");
  });
});

describe("ProfilePage — labeled Settings doorway", () => {
  it("renders a Settings row linking to /settings with the one-line description", () => {
    render();
    const row = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[href="/settings"]'),
    ).find((a) => (a.textContent ?? "").includes("Settings"));
    expect(row).toBeDefined();
    expect(row!.textContent).toContain(
      "Language, appearance, blocked contacts, security.",
    );
    // Whole-row touch target ≥ 44px via min-h.
    expect(row!.className).toContain("min-h-[44px]");
  });

  it("keeps the header gear icon (muscle memory) alongside the labeled row", () => {
    render();
    const gear = container.querySelector('a[aria-label="Open settings"]');
    expect(gear).not.toBeNull();
    // Two doorways total: gear + labeled row.
    expect(
      container.querySelectorAll('a[href="/settings"]').length,
    ).toBe(2);
  });
});
