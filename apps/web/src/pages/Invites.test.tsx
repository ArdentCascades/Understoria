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
 * Invites page — the 2026-07 usability findings:
 * (a) every row says when the invite was generated, so two open
 *     invites with the same expiry are tellable apart;
 * (b) Revoke asks first through the house ConfirmDialog instead of
 *     firing instantly, with the consequence in plain words.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/components/InviteShareSheet", () => ({
  InviteShareSheet: () => null,
}));
vi.mock("@/db/invites", () => ({
  revokeInvite: vi.fn(),
  setInviteNote: vi.fn(),
}));

import "@/i18n";
import { revokeInvite, setInviteNote } from "@/db/invites";
import InvitesPage from "./Invites";
import type { FounderHashCapture } from "@/lib/founderRoots";
import type { SignedVouch } from "@/lib/vouch";
import type { InviteRow } from "@/db/database";
import type { Member } from "@/types";

const nodeId = "node_test";
const meKey = "me-key";

const me: Member = {
  publicKey: meKey,
  displayName: "Mira Member",
  skills: [],
  availability: "",
  availabilityChips: [],
  seedBalance: 5,
  vouchedBy: [],
  createdAt: 0,
  nodeId,
  locationZone: "",
};

const DAY = 24 * 60 * 60 * 1000;

function openInvite(overrides: Partial<InviteRow> = {}): InviteRow {
  return {
    token: "tok-1",
    inviterKey: meKey,
    nodeId,
    createdAt: Date.now() - 2 * DAY,
    expiresAt: Date.now() + 12 * DAY,
    status: "open",
    redeemedBy: null,
    redeemedAt: null,
    encoded: "encoded-1",
    ...overrides,
  };
}

interface MockState {
  currentMember: Member | null;
  invites: InviteRow[];
  members: Member[];
  vouches: SignedVouch[];
  founderRoots: ReadonlySet<string>;
  founderHashCapture: FounderHashCapture | null;
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  vi.mocked(revokeInvite).mockReset().mockResolvedValue(undefined);
  vi.mocked(setInviteNote).mockReset().mockResolvedValue(undefined);
  mockState = {
    currentMember: me,
    invites: [
      openInvite(),
      openInvite({
        token: "tok-2",
        createdAt: Date.now() - 5 * DAY,
        encoded: "encoded-2",
      }),
    ],
    members: [me],
    vouches: [],
    // Default: no founder capture on this device → the invite gate
    // keeps the old behavior (allow), so the pre-gate tests below run
    // against unchanged surfaces.
    founderRoots: new Set<string>(),
    founderHashCapture: null,
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
      <MemoryRouter initialEntries={["/invites"]}>
        <InvitesPage />
      </MemoryRouter>,
    );
  });
}

function buttons(label: string): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll("button")).filter(
    (b) => (b.textContent ?? "").trim() === label,
  ) as HTMLButtonElement[];
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

const dialog = () => document.querySelector('[role="dialog"]');

describe("InvitesPage — rows say when each invite was generated", () => {
  it("shows a generated-relative-time line on every row", () => {
    render();
    const items = container.querySelectorAll("li");
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain("Generated 2d ago");
    expect(items[1].textContent).toContain("Generated 5d ago");
    // The expiry line stays too — generated complements it, not
    // replaces it.
    expect(items[0].textContent).toContain("Expires");
  });
});

describe("InvitesPage — Revoke asks before acting", () => {
  it("opens the confirm dialog instead of revoking immediately", () => {
    render();
    click(buttons("Revoke")[0]);
    expect(revokeInvite).not.toHaveBeenCalled();
    const dlg = dialog();
    expect(dlg).not.toBeNull();
    expect(dlg!.textContent).toContain("Revoke this invite?");
    // The consequence, in plain words.
    expect(dlg!.textContent).toContain("stop working");
    expect(dlg!.textContent).toContain("won't be able to join");
  });

  it("cancel closes the dialog without revoking", () => {
    render();
    click(buttons("Revoke")[0]);
    click(buttons("Cancel")[0]);
    expect(dialog()).toBeNull();
    expect(revokeInvite).not.toHaveBeenCalled();
  });

  it("confirm revokes the invite the row belongs to", async () => {
    render();
    // Second row = tok-2 (rows keep the sorted open list's order:
    // newest createdAt first, so tok-1 then tok-2).
    click(buttons("Revoke")[1]);
    click(buttons("Revoke invite")[0]);
    await act(async () => {
      await Promise.resolve();
    });
    expect(revokeInvite).toHaveBeenCalledTimes(1);
    expect(revokeInvite).toHaveBeenCalledWith(meKey, "tok-2");
    expect(dialog()).toBeNull();
  });
});

describe("InvitesPage — local-only 'who is this for?' notes", () => {
  it("renders the note on a labeled row; an unlabeled row shows nothing", () => {
    mockState.invites = [
      openInvite({ note: "Carol from the garden" }),
      openInvite({
        token: "tok-2",
        createdAt: Date.now() - 5 * DAY,
        encoded: "encoded-2",
      }),
    ];
    render();
    const items = container.querySelectorAll("li");
    expect(items[0].textContent).toContain("For: Carol from the garden");
    // Absent note → the label line simply isn't there.
    expect(items[1].textContent).not.toContain("For:");
  });

  it("offers Edit note on labeled rows and Add note on unlabeled ones", () => {
    mockState.invites = [
      openInvite({ note: "Carol from the garden" }),
      openInvite({
        token: "tok-2",
        createdAt: Date.now() - 5 * DAY,
        encoded: "encoded-2",
      }),
    ];
    render();
    expect(buttons("Edit note")).toHaveLength(1);
    expect(buttons("Add note")).toHaveLength(1);
  });

  it("Add note opens the inline editor and Save writes through setInviteNote", async () => {
    render();
    click(buttons("Add note")[0]);
    const input = container.querySelector(
      'input[aria-label="Who is this for? (only you see this)"]',
    ) as HTMLInputElement;
    expect(input).not.toBeNull();
    // The placeholder carries the privacy promise.
    expect(input.placeholder).toContain("never sent with the link");
    // Type into the controlled input the React way.
    const valueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )!.set!;
    act(() => {
      valueSetter.call(input, "Carol from the garden");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    click(buttons("Save")[0]);
    await act(async () => {
      await Promise.resolve();
    });
    expect(setInviteNote).toHaveBeenCalledTimes(1);
    expect(setInviteNote).toHaveBeenCalledWith(
      meKey,
      "tok-1",
      "Carol from the garden",
    );
    // Editor closes after a successful save.
    expect(
      container.querySelector(
        'input[aria-label="Who is this for? (only you see this)"]',
      ),
    ).toBeNull();
  });

  it("Cancel closes the editor without writing", () => {
    render();
    click(buttons("Add note")[0]);
    click(buttons("Cancel")[0]);
    expect(setInviteNote).not.toHaveBeenCalled();
    expect(
      container.querySelector(
        'input[aria-label="Who is this for? (only you see this)"]',
      ),
    ).toBeNull();
  });
});

describe("InvitesPage — pending-trust gate on the empty state", () => {
  const founderKey = "founder-key";

  beforeEach(() => {
    // A founder capture exists and the founder is NOT me: the rooted
    // trust computation runs and I am pending with 0 vouches.
    mockState.founderRoots = new Set([founderKey]);
    mockState.founderHashCapture = {
      nodeId,
      hashes: ["hash-of-founder"],
    };
  });

  it("pending member with no invites: gate card instead of the go-generate nudge", () => {
    mockState.invites = [];
    render();
    expect(container.textContent).toContain("Inviting opens up with trust");
    expect(container.textContent).toContain(
      "You have 0 of 2 vouches so far.",
    );
    // The empty state's "Go to Profile" CTA points at a Generate
    // control the Profile card has swapped for this same gate.
    expect(container.textContent).not.toContain("Go to Profile");
  });

  it("trusted member with no invites: the empty-state CTA is exactly as before", () => {
    mockState.founderRoots = new Set([founderKey, meKey]);
    mockState.invites = [];
    render();
    expect(container.textContent).not.toContain(
      "Inviting opens up with trust",
    );
    expect(container.textContent).toContain("Go to Profile");
  });

  it("pending member with existing invites: the list and its actions are untouched", () => {
    render();
    // Viewing/managing past invites is never gated.
    const items = container.querySelectorAll("li");
    expect(items.length).toBe(2);
    expect(buttons("Revoke").length).toBe(2);
    expect(buttons("Copy").length).toBe(2);
    expect(container.textContent).not.toContain(
      "Inviting opens up with trust",
    );
  });
});
