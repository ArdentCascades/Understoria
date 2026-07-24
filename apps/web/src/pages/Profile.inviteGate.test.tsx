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
 * Profile invites section — the "only fully-vouched members can
 * invite" gate. A pending-trust member (founder capture present,
 * fewer than 2 rooted vouches) sees the explanatory gate card with
 * have/need progress instead of the Generate control; a trusted
 * member keeps the exact Generate flow; a device with NO founder
 * capture keeps the old behavior (the node enforces regardless —
 * see db/invites.ts inviteIssuanceAllowed). Viewing existing open
 * invites is never gated.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
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
import type { FounderHashCapture } from "@/lib/founderRoots";
import type { SignedVouch } from "@/lib/vouch";
import type { InviteRow } from "@/db/database";
import type { Member } from "@/types";

const nodeId = "node_test";
const meKey = "me-key";
const founderKey = "founder-key";
const founderKeyB = "founder-key-b";

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

const DAY = 24 * 60 * 60 * 1000;

function inviteRow(overrides: Partial<InviteRow> = {}): InviteRow {
  return {
    token: "tok-1",
    inviterKey: meKey,
    nodeId,
    createdAt: Date.now() - 2 * DAY,
    expiresAt: Date.now() + 12 * DAY,
    status: "open",
    redeemedBy: null,
    redeemedAt: null,
    encoded: "encoded-abc",
    ...overrides,
  };
}

interface MockState {
  currentMember: Member | null;
  members: Member[];
  exchanges: unknown[];
  posts: unknown[];
  projects: unknown[];
  projectTasks: unknown[];
  achievements: unknown[];
  invites: InviteRow[];
  vouches: SignedVouch[];
  nodeId: string;
  nodeConfig: { autoConfirmHours: number };
  blockedKeys: Set<string>;
  proposals: unknown[];
  setCurrentMember: (key: string) => void;
  founderRoots: ReadonlySet<string>;
  founderHashCapture: FounderHashCapture | null;
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = {
    currentMember: member(meKey, "Mira Member"),
    members: [member(meKey, "Mira Member"), member(founderKey, "Fern")],
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
    // Default: a TWO-root capture whose founders are not me — the
    // rooted computation runs, I am pending with 0 vouches, and the
    // have/need meter is an honest promise. The one-root variant
    // (which must NOT show a meter) is tested separately.
    founderRoots: new Set([founderKey, founderKeyB]),
    founderHashCapture: {
      nodeId,
      hashes: ["hash-of-founder", "hash-of-founder-b"],
    },
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
      <MemoryRouter initialEntries={["/profile"]}>
        <ProfilePage />
      </MemoryRouter>,
    );
  });
}

function section(): HTMLElement | null {
  return container.querySelector("#invites");
}

function sectionButtons(label: string): HTMLButtonElement[] {
  return Array.from(section()!.querySelectorAll("button")).filter(
    (b) => (b.textContent ?? "").trim() === label,
  ) as HTMLButtonElement[];
}

describe("Profile invites — pending-trust gate", () => {
  it("pending member: gate card with have/need progress, no Generate control", () => {
    render();
    const sec = section()!;
    expect(sec.textContent).toContain("Inviting opens up with trust");
    expect(sec.textContent).toContain("You have 0 of 2 vouches so far.");
    expect(sec.textContent).toContain("fake accounts");
    expect(sec.textContent).toContain("vouch for you from your profile");
    expect(sectionButtons("Generate invite link").length).toBe(0);
    expect(sectionButtons("Generate another invite link").length).toBe(0);
  });

  it("pending member: existing open invites stay fully visible behind the gate", () => {
    mockState.invites = [inviteRow()];
    render();
    const sec = section()!;
    // Gated…
    expect(sec.textContent).toContain("Inviting opens up with trust");
    expect(sectionButtons("Generate another invite link").length).toBe(0);
    // …but the open-invite box and its affordances are untouched.
    expect(sec.textContent).toContain(
      "Your open invite — no one has used it yet",
    );
    expect(sectionButtons("Reveal link").length).toBe(1);
    expect(sectionButtons("Copy").length).toBe(1);
    expect(sectionButtons("Show QR code").length).toBe(1);
  });

  it("single-founder community: the locked card, and NO progress-meter digits", () => {
    // One published hash + a circle of one: two trusted vouchers can
    // never exist, so the meter would be a promise the community
    // cannot keep (docs/cofounder-ceremony-plan.md P4).
    mockState.founderRoots = new Set([founderKey]);
    mockState.founderHashCapture = { nodeId, hashes: ["hash-of-founder"] };
    render();
    const sec = section()!;
    expect(sec.textContent).toContain(
      "This community still has a single founder",
    );
    expect(sec.textContent).not.toContain("Inviting opens up with trust");
    expect(sectionButtons("Generate invite link").length).toBe(0);
    // Digits tripwire — the locked state renders no meter numbers.
    expect(sec.textContent).not.toMatch(/\d+\s*of\s*\d+/i);
    expect(sec.textContent).not.toMatch(/\d+\s*(vouch(es)?|avales?)/i);
  });

  it("trusted member (founder root): the Generate flow is exactly as before", () => {
    mockState.founderRoots = new Set([founderKey, meKey]);
    render();
    const sec = section()!;
    expect(sec.textContent).not.toContain("Inviting opens up with trust");
    expect(sectionButtons("Generate invite link").length).toBe(1);
    // The note field ("who is this for?") rides with the flow.
    expect(sec.querySelector("input")).not.toBeNull();
  });

  it("no founder capture on this device: old behavior, Generate stays (node enforces)", () => {
    mockState.founderRoots = new Set();
    mockState.founderHashCapture = null;
    render();
    const sec = section()!;
    expect(sec.textContent).not.toContain("Inviting opens up with trust");
    expect(sectionButtons("Generate invite link").length).toBe(1);
  });
});
