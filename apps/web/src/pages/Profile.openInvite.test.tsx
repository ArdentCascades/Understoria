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
 * Profile invites section — the open-invite round trip (2026-07
 * usability finding). A member who generated an invite, left the
 * page, and came back used to see only a bare Generate button plus a
 * "1 open" counter — and, assuming the invite was lost, generated a
 * duplicate. Every invite row persists its `encoded` token, so the
 * full link is reconstructable: on return the section resurfaces the
 * most recent open invite with the same Reveal / Copy / Show QR
 * affordances, and the Generate button reads "Generate another".
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
import type { InviteRow } from "@/db/database";
import type { Member } from "@/types";

const nodeId = "node_test";
const meKey = "me-key";

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
  vouches: unknown[];
  nodeId: string;
  nodeConfig: { autoConfirmHours: number };
  blockedKeys: Set<string>;
  proposals: unknown[];
  setCurrentMember: (key: string) => void;
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = {
    currentMember: member(meKey, "Mira Member"),
    members: [member(meKey, "Mira Member")],
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

describe("Profile invites — open invite stays visible on return", () => {
  it("resurfaces the most recent open invite with Reveal / Copy / QR", () => {
    mockState.invites = [
      inviteRow(),
      inviteRow({
        token: "tok-old",
        createdAt: Date.now() - 6 * DAY,
        encoded: "encoded-old",
      }),
    ];
    render();
    const sec = section()!;
    expect(sec.textContent).toContain(
      "Your open invite — no one has used it yet",
    );
    // Generated + expiry meta, so the member knows it's the same one.
    expect(sec.textContent).toContain("Generated 2d ago");
    expect(sec.textContent).toContain("Expires");
    // Link starts redacted, with the full affordance row back.
    expect(sec.textContent).toContain("Hidden — pick Reveal to display");
    expect(sectionButtons("Reveal link").length).toBe(1);
    expect(sectionButtons("Copy").length).toBe(1);
    expect(sectionButtons("Show QR code").length).toBe(1);
    // And the generate button is honest about being a second one.
    expect(sectionButtons("Generate another invite link").length).toBe(1);
    expect(sectionButtons("Generate invite link").length).toBe(0);
  });

  it("reveal shows the link rebuilt from the newest open invite's stored token", () => {
    mockState.invites = [
      inviteRow(),
      inviteRow({
        token: "tok-old",
        createdAt: Date.now() - 6 * DAY,
        encoded: "encoded-old",
      }),
    ];
    render();
    act(() => {
      sectionButtons("Reveal link")[0].dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      );
    });
    // Newest open invite wins, and the URL comes from the persisted
    // encoded token — proof the link survives a page round trip.
    expect(section()!.textContent).toContain("/invite#encoded-abc");
    expect(section()!.textContent).not.toContain("encoded-old");
  });

  it("ignores non-open and lapsed invites — no box, plain Generate", () => {
    mockState.invites = [
      inviteRow({ token: "tok-r", status: "revoked" }),
      inviteRow({
        token: "tok-e",
        // Still status "open" in the row, but past its expiry — the
        // link no longer admits anyone, so nothing to resurface.
        expiresAt: Date.now() - DAY,
        encoded: "encoded-lapsed",
      }),
    ];
    render();
    const sec = section()!;
    expect(sec.textContent).not.toContain("Your open invite");
    expect(sectionButtons("Reveal link").length).toBe(0);
    expect(sectionButtons("Generate invite link").length).toBe(1);
  });

  it("shows the plain Generate button with no invites at all", () => {
    render();
    expect(sectionButtons("Generate invite link").length).toBe(1);
    expect(sectionButtons("Generate another invite link").length).toBe(0);
  });
});
