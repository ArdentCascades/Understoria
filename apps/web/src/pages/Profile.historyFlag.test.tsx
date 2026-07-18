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
 * Exchange-history flag doorway (round-3 papercut): a POST-BACKED
 * settled exchange in the Profile ledger had no way to be flagged —
 * only DIRECT exchanges carried the "something's wrong?" chip, and
 * the member had to rediscover the post page. The ledger row now
 * hosts the same doorway, calling the post flow's own
 * `disputeExchange` (no forked flag logic). Once the post moves to
 * `disputed`, the chip's slot becomes the amber in-review link.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/components/ContextualHint", () => ({
  ContextualHint: () => null,
}));
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
vi.mock("@/db/actions", () => ({
  updateMemberProfile: vi.fn(),
  disputeExchange: vi.fn(async () => undefined),
  disputeDirectExchange: vi.fn(async () => undefined),
}));
vi.mock("@/db/invites", () => ({ issueInvite: vi.fn() }));

import "@/i18n";
import ProfilePage from "./Profile";
import { disputeExchange } from "@/db/actions";
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

function exchange(
  id: string,
  postId: string,
  overrides: Partial<Exchange> = {},
): Exchange {
  return {
    id,
    postId,
    helperKey: meKey,
    helpedKey: otherKey,
    hoursExchanged: 1,
    helperSignature: "sig-a",
    helpedSignature: "sig-b",
    completedAt: 1700000000000,
    category: "food",
    nodeId,
    flaggedForReview: false,
    ...overrides,
  };
}

function post(id: string, status: Post["status"]): Post {
  return {
    id,
    type: "NEED",
    category: "food",
    title: `Post ${id}`,
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: otherKey,
    claimedBy: meKey,
    status,
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId,
    signature: "",
  } as Post;
}

interface MockState {
  currentMember: Member | null;
  members: Member[];
  exchanges: Exchange[];
  posts: Post[];
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
  founderRoots: ReadonlySet<string>;
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
    founderRoots: new Set<string>(),
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
  vi.clearAllMocks();
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

function flagChip(): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => (b.textContent ?? "").trim() === "something's wrong?",
  );
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("Profile exchange history — flag doorway on post-backed rows", () => {
  it("a settled post-backed exchange carries the flag chip; confirming calls disputeExchange", async () => {
    mockState.exchanges = [exchange("x1", "post-1")];
    mockState.posts = [post("post-1", "completed")];
    render();
    const chip = flagChip();
    expect(chip).toBeDefined();
    act(() => {
      chip!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // The post flow's own dialog copy, reused — not a fork.
    expect(document.body.textContent).toContain(
      "Flag this exchange for community review",
    );
    const confirm = Array.from(
      document.body.querySelectorAll("button"),
    ).find((b) => (b.textContent ?? "").trim() === "Flag it");
    expect(confirm).toBeDefined();
    await act(async () => {
      confirm!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();
    expect(vi.mocked(disputeExchange)).toHaveBeenCalledWith("post-1", meKey);
  });

  it("once the post is disputed, the chip's slot becomes the in-review link to the dispute card", () => {
    mockState.exchanges = [exchange("x1", "post-1")];
    mockState.posts = [post("post-1", "disputed")];
    mockState.proposals = [
      {
        id: "prop-1",
        kind: "dispute",
        disputePostId: "post-1",
        createdAt: 1,
      } as unknown as Proposal,
    ];
    render();
    expect(flagChip()).toBeUndefined();
    const link = container.querySelector<HTMLAnchorElement>(
      'a[href="/disputes#prop-1"]',
    );
    expect(link).not.toBeNull();
    expect(link!.textContent).toContain("in community review");
  });

  it("no flag chip when the post row isn't on this device (cross-node exchange)", () => {
    mockState.exchanges = [exchange("x1", "ghost-post")];
    mockState.posts = [];
    render();
    expect(flagChip()).toBeUndefined();
  });

  it("direct exchanges keep their flag doorway (regression guard for the shared component)", () => {
    mockState.exchanges = [
      exchange("x1", "direct:01234567-89ab-4cde-8f01-23456789abcd"),
    ];
    render();
    expect(flagChip()).toBeDefined();
  });
});
