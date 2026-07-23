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
 * The Decisions page's enactment gate (threat-model §7): recording a
 * proposal's outcome — the consensus close and the manual
 * record-outcome buttons — is a trusted-member power. A pending
 * viewer keeps FULL sight (proposals, tallies, honest waiting
 * states) and keeps the Withdrawn affordance for their OWN proposal;
 * a device with no founder capture keeps legacy behavior (the node
 * enforces). Includes the see-vs-enact invariant: a viewer's
 * governance-hide block filters the display tally, never the
 * decision math.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock("@/db/proposals", () => ({ closeProposal: vi.fn() }));
vi.mock("@/db/adoption", () => ({
  executeAdoptionProposal: vi.fn(),
  withdrawAdoptionAsPresent: vi.fn(),
}));
vi.mock("@/db/votes", () => ({ castVote: vi.fn() }));
vi.mock("@/components/CosignRemoval", () => ({ CosignRemoval: () => null }));
vi.mock("@/components/RemovalCeremony", () => ({
  RemovalCeremony: () => null,
}));
vi.mock("@/components/useRemovalGate", () => ({
  useRemovalGate: () => ({ kind: "allowed" }),
  RemovalGateNotice: () => null,
}));
// The page's queries run in a fixed order (memberRemovals,
// memberReinstatements, decision vouches); a shared cursor hands back
// canned values — the EventDetail.menu stubbing scheme.
let liveSequence: unknown[] = [[], [], []];
let liveCursor = 0;
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (querier: () => unknown) => {
    if (liveCursor >= liveSequence.length) liveCursor = 0;
    const value = liveSequence[liveCursor];
    liveCursor += 1;
    void querier;
    return value;
  },
}));

import "@/i18n";
import ProposalsPage from "./Proposals";
import type { Member, Proposal, Vote } from "@/types";

const nodeId = "node_test";
const meKey = "me-key";
const founderKey = "founder-key";
const pendingVoterKey = "pending-voter-key";

const DAY = 24 * 60 * 60 * 1000;

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

function openProposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    id: "p1",
    nodeId,
    kind: "proposal",
    category: "config_change",
    reversibilityTier: "easy",
    title: "Raise the helper limit",
    description: "",
    payload: "{}",
    proposerKey: founderKey,
    status: "open",
    createdAt: Date.now() - 5 * DAY,
    closedAt: null,
    closedReason: null,
    impactReflection: null,
    disputePostId: null,
    ...overrides,
  };
}

function vote(voterKey: string, choice: Vote["choice"]): Vote {
  return {
    id: `p1|${voterKey}`,
    proposalId: "p1",
    voterKey,
    choice,
    reason: null,
    createdAt: Date.now() - DAY,
    nodeId,
  };
}

interface MockState {
  proposals: Proposal[];
  members: Member[];
  currentMember: Member | null;
  votes: Vote[];
  nodeId: string;
  nodeConfig: { proposalDeliberationDays: number; proposalMinAffirms: number };
  governanceHiddenKeys: Set<string>;
  invites: unknown[];
  founderRoots: ReadonlySet<string>;
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  liveSequence = [[], [], []];
  liveCursor = 0;
  mockState = {
    proposals: [openProposal()],
    members: [member(meKey, "Mira"), member(founderKey, "Fern")],
    currentMember: member(meKey, "Mira"),
    // One trusted affirm; minAffirms 1 and deliberation elapsed —
    // consensus conditions are met.
    votes: [vote(founderKey, "affirm")],
    nodeId,
    nodeConfig: { proposalDeliberationDays: 3, proposalMinAffirms: 1 },
    governanceHiddenKeys: new Set<string>(),
    invites: [],
    // Default: capture present, the founder is a root, and I am NOT —
    // the rooted computation runs and I am a pending viewer.
    founderRoots: new Set([founderKey]),
  };
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
      <MemoryRouter initialEntries={["/proposals"]}>
        <ProposalsPage />
      </MemoryRouter>,
    );
  });
}

/** Buttons inside the proposal card — the page's status-filter tabs
 *  reuse labels like "Passed", so queries must scope to the card. */
function cardButtons(label: string): HTMLButtonElement[] {
  const card = container.querySelector("article");
  if (!card) return [];
  return Array.from(card.querySelectorAll("button")).filter(
    (b) => (b.textContent ?? "").trim() === label,
  ) as HTMLButtonElement[];
}

describe("Proposals — enactment is a trusted-member power", () => {
  it("trusted viewer at consensus: the close button and record-outcome buttons render as before", () => {
    mockState.founderRoots = new Set([founderKey, meKey]);
    render();
    expect(cardButtons("Close as passed").length).toBe(1);
    expect(cardButtons("Passed").length).toBe(1);
    expect(cardButtons("Rejected").length).toBe(1);
    expect(cardButtons("Withdrawn").length).toBe(1);
    expect(container.textContent).not.toContain(
      "Recording outcomes opens up with trust",
    );
  });

  it("pending viewer at consensus: honest waiting state and the gate card — no enact buttons, no numeric progress", () => {
    render();
    // Consensus is VISIBLE (seeing is never gated)…
    expect(container.textContent).toContain("Consensus reached");
    // …but the close is a waiting hand, not a button.
    expect(cardButtons("Close as passed").length).toBe(0);
    expect(container.textContent).toContain(
      "waiting for a fully vouched member's hand",
    );
    // Manual record-outcome buttons are replaced by the shared gate
    // card, with no have/need progress (other members' page rule).
    expect(cardButtons("Passed").length).toBe(0);
    expect(cardButtons("Rejected").length).toBe(0);
    expect(cardButtons("Withdrawn").length).toBe(0);
    expect(container.textContent).toContain(
      "Recording outcomes opens up with trust",
    );
    expect(container.textContent).not.toMatch(/\d+ of \d+ vouches/);
  });

  it("pending PROPOSER: the Withdrawn affordance survives — and only that one", () => {
    mockState.proposals = [openProposal({ proposerKey: meKey })];
    render();
    expect(container.textContent).toContain(
      "Recording outcomes opens up with trust",
    );
    expect(cardButtons("Withdrawn").length).toBe(1);
    expect(cardButtons("Passed").length).toBe(0);
    expect(cardButtons("Rejected").length).toBe(0);
  });

  it("no founder capture: legacy behavior — every affordance stays (the node enforces)", () => {
    mockState.founderRoots = new Set();
    render();
    expect(cardButtons("Close as passed").length).toBe(1);
    expect(cardButtons("Passed").length).toBe(1);
    expect(container.textContent).not.toContain(
      "Recording outcomes opens up with trust",
    );
  });

  it("see-vs-enact invariant: governance-hiding the affirmer filters the display tally but not eligibility", () => {
    // A third trusted member casts the affirm; the viewer governance-
    // hides THEM (not the proposer, whose proposal would be display-
    // hidden entirely — a separate, documented filter).
    const otherKey = "other-trusted-key";
    mockState.founderRoots = new Set([founderKey, meKey, otherKey]);
    mockState.votes = [vote(otherKey, "affirm")];
    mockState.governanceHiddenKeys = new Set([otherKey]);
    render();
    // The blocker's DISPLAY tally no longer shows the affirm…
    expect(container.textContent).toContain("Affirm: 0");
    // …yet decision math still sees it: consensus stands and the
    // trusted viewer can still enact.
    expect(container.textContent).toContain("Consensus reached");
    expect(cardButtons("Close as passed").length).toBe(1);
  });

  it("dual-count tally + point-of-action note when a pending member's affirm is recorded", () => {
    mockState.votes = [
      vote(founderKey, "affirm"),
      vote(pendingVoterKey, "affirm"),
    ];
    render();
    // The tally is honest about what counts, without naming who is
    // pending.
    expect(container.textContent).toContain(
      "Affirm: 1 of 2 counting toward consensus",
    );
    // The pending viewer's own vote controls carry the honesty note.
    expect(container.textContent).toContain(
      "Your vote is recorded and visible right away.",
    );
  });

  it("the pending-affirm note does not render for a trusted viewer", () => {
    mockState.founderRoots = new Set([founderKey, meKey]);
    render();
    expect(container.textContent).not.toContain(
      "Your vote is recorded and visible right away.",
    );
  });
});
