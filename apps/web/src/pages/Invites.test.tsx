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
vi.mock("@/db/invites", () => ({ revokeInvite: vi.fn() }));

import "@/i18n";
import { revokeInvite } from "@/db/invites";
import InvitesPage from "./Invites";
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
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  vi.mocked(revokeInvite).mockReset().mockResolvedValue(undefined);
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
