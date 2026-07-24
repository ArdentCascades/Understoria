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
 * MemberDetail — proposer-side removal gate.
 *
 * Proposing a removal is a trusted-member power (the node refuses
 * quorums containing untrusted signers). With a founder capture on
 * the device:
 *   - a pending-trust viewer sees the removals.gate card in place of
 *     the start affordance (operator ruling: the gate announces
 *     itself at the point of action);
 *   - a trusted viewer in a smaller-than-quorum circle sees the
 *     honest circle-short note — removal simply isn't available in a
 *     community that small, however many people agree.
 * Without a capture the device can't judge, so behavior is unchanged.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), toast: null }),
}));
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
import type { Member } from "@/types";
import type { RedeemedInviteLike } from "@/lib/vouch";

const nodeId = "node_test";
const viewerKey = "viewer-key";
const subjectKey = "subject-member-key";
const founderA = "founder-a-key";
const founderB = "founder-b-key";

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
  founderRoots?: ReadonlySet<string>;
  founderHashCapture?: { nodeId: string; hashes: string[] } | null;
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = {
    members: [member(viewerKey, "Viewer"), member(subjectKey, "Rosa")],
    currentMember: member(viewerKey, "Viewer"),
    vouches: [],
    invites: [],
    founderRoots: new Set([founderA, founderB]),
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

async function render() {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[`/member/${subjectKey}`]}>
        <Routes>
          <Route path="/member/:publicKey" element={<MemberDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

function buttonTexts(): string[] {
  return Array.from(container.querySelectorAll("button")).map(
    (b) => b.textContent ?? "",
  );
}

describe("MemberDetail — proposer-side removal gate", () => {
  it("shows the gate card, not the propose button, to a pending-trust viewer", async () => {
    // One founder invite → pending under the rooted rule.
    mockState.invites = [redeemedInvite(founderA, viewerKey)];
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain("Removal signing opens up with trust");
    expect(buttonTexts().some((b) => /propose removal/i.test(b))).toBe(false);
    // No-leaderboards tripwire (see MemberDetail.test.tsx): the gate
    // must not put digits next to vouch words on another member's page.
    expect(text).not.toMatch(
      /\d+\s*(exchanges?|vouch(es)?|avales?|hours?|horas?|credits?|créditos?|streak|racha)/i,
    );
  });

  it("shows the circle-short note to a trusted viewer in a smaller-than-quorum circle", async () => {
    // The viewer IS a founder root: trusted, but the whole rooted
    // circle is 2 (< default quorum 3).
    mockState.founderRoots = new Set([viewerKey, founderA]);
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain("removal isn't available yet");
    expect(text).toContain("takes 3 trusted members");
    expect(text).toContain("has 2 so far");
    expect(buttonTexts().some((b) => /propose removal/i.test(b))).toBe(false);
    // The community-level count is fine, but never digits-next-to-vouch.
    expect(text).not.toMatch(
      /\d+\s*(exchanges?|vouch(es)?|avales?|hours?|horas?|credits?|créditos?|streak|racha)/i,
    );
  });

  it("offers the propose button to a trusted viewer in a quorum-sized circle", async () => {
    // Two founder invites → viewer trusted; circle = both founders +
    // viewer = 3 ≥ quorum.
    mockState.invites = [
      redeemedInvite(founderA, viewerKey),
      redeemedInvite(founderB, viewerKey),
    ];
    await render();
    expect(container.textContent).not.toContain(
      "Removal signing opens up with trust",
    );
    expect(buttonTexts().some((b) => /propose removal/i.test(b))).toBe(true);
  });

  it("single-founder community: the sole founder sees the honest no-numbers note, never circle-short", async () => {
    // The viewer IS the one root of a one-hash capture: trusted, but
    // the circle can never reach any quorum — the locked state
    // (docs/cofounder-ceremony-plan.md P4) renders WITHOUT a
    // have/need meter.
    mockState.founderRoots = new Set([viewerKey]);
    mockState.founderHashCapture = { nodeId, hashes: ["hash-of-viewer"] };
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain("no removal is possible until a co-founder");
    expect(text).not.toContain("removal isn't available yet");
    expect(buttonTexts().some((b) => /propose removal/i.test(b))).toBe(false);
    // Digits tripwire: the locked state shows no progress numbers.
    expect(text).not.toMatch(/\d+\s*of\s*\d+/i);
    expect(text).not.toMatch(/takes\s*\d+/i);
    expect(text).not.toMatch(
      /\d+\s*(exchanges?|vouch(es)?|avales?|hours?|horas?|credits?|créditos?|streak|racha)/i,
    );
  });

  it("single-founder community: the pending-trust viewer's vouch gate is the locked variant", async () => {
    // Same one-root community, but the viewer is a plain member: the
    // vouch gate's "how to get there" story is impossible, so the
    // locked card renders in its place — with no meter anywhere.
    mockState.founderRoots = new Set([founderA]);
    mockState.founderHashCapture = { nodeId, hashes: ["hash-of-founder-a"] };
    mockState.invites = [redeemedInvite(founderA, viewerKey)];
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain("This community still has a single founder");
    expect(text).not.toContain("Vouching opens up with trust");
    expect(text).not.toMatch(/\d+\s*of\s*\d+/i);
    expect(text).not.toMatch(
      /\d+\s*(exchanges?|vouch(es)?|avales?|hours?|horas?|credits?|créditos?|streak|racha)/i,
    );
  });

  it("keeps the old behavior when the device has no founder capture", async () => {
    // Pending by any count, but with no roots the device can't judge
    // — the node enforces regardless.
    mockState.founderRoots = new Set();
    mockState.invites = [redeemedInvite(founderA, viewerKey)];
    await render();
    expect(container.textContent).not.toContain(
      "Removal signing opens up with trust",
    );
    expect(buttonTexts().some((b) => /propose removal/i.test(b))).toBe(true);
  });
});
