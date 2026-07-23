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
// The full-public-key disclosure on the Profile header — the value
// operator runbooks send members here for (NODE_FOUNDER_KEYS
// bootstrap in .env.example, operator-guide §6 mirror trust
// settings). Before this panel existed the app showed the key ONLY
// truncated (shortKey), so the runbook step "copy your public key
// from your Profile page" was impossible to follow. Locks:
//   1. Closed by default — the header shows the short form only.
//   2. Toggling open reveals the FULL key as selectable text (the
//      clipboard fallback: navigator.clipboard may be unavailable
//      or denied, so visible selectable text must carry the value).
//   3. The Copy button puts the exact full key on the clipboard.
//
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
vi.mock("@/db/actions", () => ({ updateMemberProfile: vi.fn() }));
vi.mock("@/db/invites", () => ({ issueInvite: vi.fn() }));

import "@/i18n";
import ProfilePage from "./Profile";
import type { Member } from "@/types";

const nodeId = "node_test";
// Realistic shape: a full base64 Ed25519 public key is 44 chars —
// long enough that shortKey MUST truncate it, so "full key visible"
// and "short key visible" are genuinely distinct assertions.
const meKey = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

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

interface MockState {
  currentMember: Member | null;
  members: Member[];
  exchanges: unknown[];
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
  vi.restoreAllMocks();
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

function toggleButton(): HTMLButtonElement {
  const btn = Array.from(container.querySelectorAll("button")).find((el) =>
    /full key/i.test(el.textContent ?? ""),
  );
  if (!btn) throw new Error("Show/Hide full key button not found");
  return btn as HTMLButtonElement;
}

describe("ProfilePage — full-public-key disclosure", () => {
  it("is closed by default: full key absent, toggle collapsed", () => {
    render();
    expect(container.textContent).not.toContain(meKey);
    expect(toggleButton().getAttribute("aria-expanded")).toBe("false");
  });

  it("opens to the full key as selectable text, and closes again", () => {
    render();
    act(() => {
      toggleButton().click();
    });
    expect(toggleButton().getAttribute("aria-expanded")).toBe("true");
    const code = Array.from(container.querySelectorAll("code")).find(
      (el) => el.textContent === meKey,
    );
    expect(code).toBeTruthy();
    act(() => {
      toggleButton().click();
    });
    expect(container.textContent).not.toContain(meKey);
  });

  it("renders the key as a QR behind the disclosure, with the ceremony hint", async () => {
    // The co-founder ceremony's capture step scans THIS panel
    // (docs/cofounder-ceremony-plan.md P3) — the QR and its one-line
    // hint live behind the same disclosure as the text key.
    render();
    act(() => {
      toggleButton().click();
    });
    expect(container.textContent).toContain(
      "The QR code is the same public key",
    );
    // Lazy InviteQRCode: placeholder immediately, the rendered SVG
    // (role="img", labeled) once the dynamic import settles.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const qr = container.querySelector(
      '[role="img"][aria-label="Your full public key"]',
    );
    expect(qr).not.toBeNull();
  });

  it("copies the exact full key to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render();
    act(() => {
      toggleButton().click();
    });
    const copyBtn = Array.from(
      container.querySelectorAll("button"),
    ).find((el) => (el.textContent ?? "").trim() === "Copy");
    if (!copyBtn) throw new Error("Copy button not found");
    await act(async () => {
      (copyBtn as HTMLButtonElement).click();
    });
    expect(writeText).toHaveBeenCalledWith(meKey);
  });
});
