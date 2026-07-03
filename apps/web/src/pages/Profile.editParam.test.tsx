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
 * `/profile?edit=1` — the Board profile-nudge CTA ("Add some
 * details") — scrolls the ProfileEditor section into view, focuses
 * its first field (display name), and strips the param via a history
 * replace so back/refresh don't replay the scroll. A plain /profile
 * visit does none of that.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
// Sections with their own DB reads or heavy content — none of them is
// what this suite asserts (mirrors Profile.nav.test.tsx).
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

const mockState = {
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

// Records the router's live location so the test can observe the
// post-handling URL (the param strip happens via setSearchParams).
let lastSearch: string | null = null;
function LocationProbe() {
  lastSearch = useLocation().search;
  return null;
}

let container: HTMLDivElement;
let root: Root;
let scrollSpy: ReturnType<typeof vi.fn<typeof Element.prototype.scrollIntoView>>;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  lastSearch = null;
  // jsdom doesn't implement `scrollIntoView` (same stub pattern as
  // Conversation.test.tsx) — spy on it so the handler is observable.
  scrollSpy = vi.fn<typeof Element.prototype.scrollIntoView>();
  Element.prototype.scrollIntoView = scrollSpy;
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.restoreAllMocks();
});

function render(initialEntry: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <ProfilePage />
        <LocationProbe />
      </MemoryRouter>,
    );
  });
}

function nameInput(): HTMLInputElement | null {
  // ProfileEditor's first field — the display-name input, prefilled
  // with the member's name.
  return (
    Array.from(container.querySelectorAll("input")).find(
      (i) => i.value === "Mira Member",
    ) ?? null
  );
}

describe("ProfilePage — ?edit=1 lands on the editor", () => {
  it("scrolls the editor into view, focuses the first field, and strips the param", () => {
    render("/profile?edit=1");
    // The scroll handler ran against the editor section...
    expect(scrollSpy).toHaveBeenCalled();
    // ...focus landed on the display-name input...
    const input = nameInput();
    expect(input).not.toBeNull();
    expect(document.activeElement).toBe(input);
    // ...and the param is gone from the URL (replace, not push).
    expect(lastSearch).toBe("");
  });

  it("does nothing special on a plain /profile visit", () => {
    render("/profile");
    expect(scrollSpy).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(nameInput());
    expect(lastSearch).toBe("");
  });
});
