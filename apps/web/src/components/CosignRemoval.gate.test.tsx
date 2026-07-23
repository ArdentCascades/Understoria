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
 * CosignRemoval — trusted-member gate.
 *
 * Removal/reinstatement co-signing is a trusted-member power: the
 * node refuses quorums containing untrusted signers, and per the
 * operator ruling the gate announces itself at the point of action.
 * A pending-trust member must see the removals.gate card — never the
 * capture/sign flow. With NO founder capture the device can't judge,
 * so the old behavior stays (the node enforces).
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
// The camera capture is out of scope here; a stub marks its presence.
vi.mock("@/components/PairDeviceCapture", () => ({
  PairDeviceCapture: () => <div data-testid="pair-capture" />,
}));

import "@/i18n";
import { CosignRemoval } from "./CosignRemoval";
import type { Member } from "@/types";
import type { RedeemedInviteLike } from "@/lib/vouch";

const viewerKey = "viewer-key";
const founderA = "founder-a-key";
const founderB = "founder-b-key";

function member(publicKey: string): Member {
  return {
    publicKey,
    displayName: "Viewer",
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId: "node_test",
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
  currentMember: Member | null;
  vouches: unknown[];
  invites: RedeemedInviteLike[];
  founderRoots: ReadonlySet<string>;
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = {
    currentMember: member(viewerKey),
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

async function render(onDone: () => void = () => {}) {
  await act(async () => {
    root = createRoot(container);
    root.render(<CosignRemoval onDone={onDone} />);
  });
}

describe("CosignRemoval — trusted-member gate", () => {
  it("shows the gate card, not the capture/sign flow, to a pending-trust member", async () => {
    // One founder invite → pending under the rooted rule.
    mockState.invites = [redeemedInvite(founderA, viewerKey)];
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain("Removal signing opens up with trust");
    expect(container.querySelector('[data-testid="pair-capture"]')).toBeNull();
    const buttons = Array.from(container.querySelectorAll("button")).map(
      (b) => b.textContent ?? "",
    );
    expect(buttons.some((b) => /sign my name/i.test(b))).toBe(false);
    // No-leaderboards: the gate card carries no numeric vouch progress.
    expect(text).not.toMatch(/\d+\s*(of|de)\s*\d+\s*(vouch|aval)/i);
  });

  it("the gate's close button hands control back", async () => {
    mockState.invites = [redeemedInvite(founderA, viewerKey)];
    const onDone = vi.fn();
    await render(onDone);
    const close = Array.from(container.querySelectorAll("button")).find((b) =>
      /close/i.test(b.textContent ?? ""),
    );
    expect(close).toBeDefined();
    act(() => {
      close!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onDone).toHaveBeenCalled();
  });

  it("lets a trusted member into the capture flow", async () => {
    // Two founder invites → trusted under the rooted rule.
    mockState.invites = [
      redeemedInvite(founderA, viewerKey),
      redeemedInvite(founderB, viewerKey),
    ];
    await render();
    expect(container.textContent).not.toContain(
      "Removal signing opens up with trust",
    );
    expect(
      container.querySelector('[data-testid="pair-capture"]'),
    ).not.toBeNull();
  });

  it("keeps the old behavior when the device has no founder capture", async () => {
    // Pending by any count, but with no roots the rooted computation
    // has no anchor — the device stays quiet, the node enforces.
    mockState.founderRoots = new Set();
    mockState.invites = [redeemedInvite(founderA, viewerKey)];
    await render();
    expect(container.textContent).not.toContain(
      "Removal signing opens up with trust",
    );
    expect(
      container.querySelector('[data-testid="pair-capture"]'),
    ).not.toBeNull();
  });
});
