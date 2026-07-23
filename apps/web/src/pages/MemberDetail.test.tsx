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

/*
 * MemberDetail — no-comparable-stats guard.
 *
 * Operator ruling (2026-07): a member page viewed by OTHERS is fine
 * as long as it's not displaying stats or badges people can compare
 * themselves to. Backed by the `no-leaderboards` design principle
 * ("The unit of measurement is us, not me") and
 * `solidarity-not-shame`.
 *
 * These tests assert (a) the functional surface stays — name, skills,
 * availability, area, qualitative trust status, Vouch and Block
 * actions — and (b) the comparable surface stays gone: no vouch
 * counts, no "Vouched for by" roster, no achievement badges, and a
 * best-effort tripwire against any "N exchanges / N vouches / N
 * hours"-shaped copy sneaking back in.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), toast: null }),
}));
// MemberDetail's only live query is the blocked-state lookup; the
// block flow itself is covered elsewhere.
vi.mock("dexie-react-hooks", () => ({ useLiveQuery: () => false }));
vi.mock("@/db/blocks", () => ({
  BLOCK_NOTE_MAX_LENGTH: 500,
  BlockActionError: class BlockActionError extends Error {},
  blockMember: vi.fn(),
  unblockMember: vi.fn(),
  isBlocked: vi.fn(async () => false),
}));
vi.mock("@/db/vouches", () => ({
  VouchValidationError: class VouchValidationError extends Error {},
  addManualVouch: vi.fn(),
}));
vi.mock("@/lib/outbox", () => ({ flushOutboxNow: vi.fn(async () => {}) }));

import "@/i18n";
import MemberDetailPage from "./MemberDetail";
import { shortKey } from "@/lib/format";
import type { Member } from "@/types";
import type { RedeemedInviteLike } from "@/lib/vouch";

const nodeId = "node_test";

function member(publicKey: string, displayName: string): Member {
  return {
    publicKey,
    displayName,
    skills: ["carpentry", "spanish"],
    availability: "",
    availabilityChips: ["weekend_days"],
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId,
    locationZone: "North side",
  };
}

function redeemedInvite(
  inviterKey: string,
  redeemedBy: string,
): RedeemedInviteLike {
  return { status: "redeemed", inviterKey, redeemedBy };
}

interface MockState {
  members: Member[];
  currentMember: Member | null;
  vouches: unknown[];
  invites: RedeemedInviteLike[];
}

const viewerKey = "viewer-key";
const trustedKey = "trusted-member-key";
const pendingKey = "pending-member-key";

let mockState: MockState;

function freshState(): MockState {
  return {
    members: [
      member(viewerKey, "Viewer"),
      member(trustedKey, "Rosa"),
      member(pendingKey, "Newcomer Nia"),
    ],
    currentMember: member(viewerKey, "Viewer"),
    vouches: [],
    invites: [
      // Redeemed invites count as vouches without needing signature
      // verification: two distinct vouchers → Rosa is trusted; the
      // viewer is trusted too (so the Vouch button gating passes);
      // Nia has one → pending_trust.
      redeemedInvite("inviter-a", trustedKey),
      redeemedInvite("inviter-b", trustedKey),
      redeemedInvite("inviter-a", viewerKey),
      redeemedInvite("inviter-b", viewerKey),
      redeemedInvite("inviter-a", pendingKey),
    ],
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

function render(publicKey: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[`/member/${publicKey}`]}>
        <Routes>
          <Route path="/member/:publicKey" element={<MemberDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

describe("MemberDetail — functional surface (kept)", () => {
  it("shows name, skills, availability, and area", () => {
    render(trustedKey);
    expect(container.querySelector("h1")?.textContent).toBe("Rosa");
    const text = container.textContent ?? "";
    expect(text).toContain("carpentry, spanish");
    expect(text).toContain("North side");
    // AvailabilityChips renders the weekend_days chip label.
    expect(container.textContent).toMatch(/weekend/i);
  });

  it("offers the Vouch action to a trusted viewer on a pending member", () => {
    render(pendingKey);
    const buttons = Array.from(container.querySelectorAll("button")).map(
      (b) => b.textContent ?? "",
    );
    expect(buttons.some((b) => /vouch for this member/i.test(b))).toBe(true);
  });

  it("shows the trust gate card — not the Vouch button — to a pending-trust viewer", () => {
    // Drop one of the viewer's two implicit vouches → pending_trust.
    mockState.invites = mockState.invites.filter(
      (inv) =>
        !(inv.redeemedBy === viewerKey && inv.inviterKey === "inviter-b"),
    );
    render(pendingKey);
    const text = container.textContent ?? "";
    // The gate announces itself at the point of action (operator
    // ruling: "very clear as someone is trying to take an action,
    // they need to be vouched").
    expect(text).toContain("Vouching opens up with trust");
    const buttons = Array.from(container.querySelectorAll("button")).map(
      (b) => b.textContent ?? "",
    );
    expect(buttons.some((b) => /vouch for this member/i.test(b))).toBe(false);
    // No-leaderboards: the gate card on ANOTHER member's page must
    // not print numeric vouch progress ("1 of 2 vouches") — it would
    // read as that member's score. Own progress lives on Profile.
    expect(text).not.toMatch(/\d+\s*(of|de)\s*\d+\s*(vouch|aval)/i);
  });

  it("offers the Block action on another member's page", () => {
    render(trustedKey);
    const buttons = Array.from(container.querySelectorAll("button")).map(
      (b) => b.textContent ?? "",
    );
    expect(buttons.some((b) => /block/i.test(b))).toBe(true);
  });

  it("still shows the qualitative trust status", () => {
    render(trustedKey);
    expect(container.textContent).toContain("Trusted");
    act(() => root.unmount());
    container.innerHTML = "";
    render(pendingKey);
    expect(container.textContent).toContain("New here");
  });
});

describe("MemberDetail — canonical identity key (stays visible, explains itself)", () => {
  // Casual surfaces hide the key behind a tap (IdentityKey.tsx), but
  // the member page header is a canonical identity spot: the key
  // stays put, and tapping it finally says what the code is.
  it("keeps the short key visible in the header", () => {
    render(trustedKey);
    expect(container.textContent).toContain(shortKey(trustedKey));
  });

  it("tapping the key toggles the explainer sentence", () => {
    render(trustedKey);
    const btn = Array.from(container.querySelectorAll("button")).find((b) =>
      (b.textContent ?? "").includes(shortKey(trustedKey)),
    );
    expect(btn).toBeDefined();
    expect(btn!.getAttribute("aria-expanded")).toBe("false");
    act(() => {
      btn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(btn!.getAttribute("aria-expanded")).toBe("true");
    expect(container.textContent).toContain(
      "This code is Rosa's unique identity",
    );
  });
});

describe("MemberDetail — comparable stats stay gone (operator ruling + no-leaderboards)", () => {
  it("shows trust status without a vouch count", () => {
    render(trustedKey);
    const text = container.textContent ?? "";
    // The old chip read "Trusted (2 vouches)".
    expect(text).not.toMatch(/\(\s*\d+\s+vouch/i);
    expect(text).not.toMatch(/trusted\s*\(/i);
  });

  it("shows pending trust without a progress fraction", () => {
    render(pendingKey);
    const text = container.textContent ?? "";
    // The old chip read "New here (1/2 vouches)".
    expect(text).not.toMatch(/\d+\s*\/\s*\d+/);
  });

  it("renders no 'Vouched for by' roster", () => {
    render(trustedKey);
    expect(
      container.querySelector('[aria-labelledby="trusted-by-title"]'),
    ).toBeNull();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/vouched for by/i);
    // Voucher entries linked to each voucher's member page; the only
    // member links allowed here are none at all (the page is a leaf).
    expect(container.querySelector('a[href^="/member/"]')).toBeNull();
  });

  it("renders no achievement badges", () => {
    render(trustedKey);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(
      /first exchange|connector|bridge builder|seed planter/i,
    );
  });

  it("tripwire: no 'N <countable>' copy anywhere on the page", () => {
    for (const key of [trustedKey, pendingKey]) {
      render(key);
      const text = container.textContent ?? "";
      // Best-effort pattern: a number directly quantifying the
      // comparable units the ruling bans. If this fires, someone
      // reintroduced a personal stat — see the header comment in
      // MemberDetail.tsx before "fixing" the test.
      expect(text).not.toMatch(
        /\d+\s*(exchanges?|vouch(es)?|avales?|hours?|horas?|credits?|créditos?|streak|racha)/i,
      );
      act(() => root.unmount());
      container.innerHTML = "";
    }
  });
});
