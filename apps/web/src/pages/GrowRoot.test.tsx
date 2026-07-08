/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Member } from "@/types";
import type { InviteRow } from "@/db/database";
import type { SignedVouch } from "@/lib/vouch";

// The page reads only these three fields off AppContext. Trust is
// driven through redeemed invites (implicit vouches) — they count in
// vouchCountFor without needing real signatures, unlike SignedVouch
// rows, which are verified cryptographically.
const appState: {
  currentMember: Member | null;
  vouches: SignedVouch[];
  invites: InviteRow[];
} = {
  currentMember: null,
  vouches: [],
  invites: [],
};

vi.mock("@/state/AppContext", () => ({
  useApp: () => appState,
}));

// Keep Dexie out of the harness — the page only asks for the primary
// node URL, and neither of these tests reaches the step that does.
vi.mock("@/lib/nodeEndpoints", () => ({
  listNodeEndpoints: async () => ({
    primary: "https://origin.example",
    endpoints: ["https://origin.example"],
  }),
}));

import "@/i18n";
import GrowRootPage from "./GrowRoot";

function buildMember(): Member {
  return {
    publicKey: "pk-me",
    nodeId: "node-test",
    displayName: "Me",
    skills: [],
    availability: "",
    availabilityChips: [],
    locationZone: "",
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
  };
}

function redeemedInvite(inviterKey: string): InviteRow {
  return {
    status: "redeemed",
    inviterKey,
    redeemedBy: "pk-me",
  } as InviteRow;
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

async function flushAsync() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  appState.currentMember = buildMember();
  appState.vouches = [];
  appState.invites = [];
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
      <MemoryRouter initialEntries={["/grow-root"]}>
        <GrowRootPage />
      </MemoryRouter>,
    );
  });
}

describe("GrowRootPage", () => {
  it("member with 0 vouches sees the trust gate, not the wizard", async () => {
    render();
    await flushAsync();
    // The gate copy is present…
    expect(container.textContent).toContain("This guide opens with trust");
    expect(container.textContent).toContain("You have 0 of 2 vouches");
    // …with the always-open alternatives…
    expect(container.textContent).toContain(
      "Keep the complete archive on this device",
    );
    expect(container.textContent).toContain(
      "Reading the full guide is open to everyone too",
    );
    // …and NO wizard content behind it.
    expect(container.textContent).not.toContain(
      "I can run a computer that stays on",
    );
    expect(container.textContent).not.toContain("What you need");
  });

  it("member with 2 vouches sees the three path cards", async () => {
    appState.invites = [redeemedInvite("pk-a"), redeemedInvite("pk-b")];
    render();
    await flushAsync();
    expect(container.textContent).toContain(
      "I can run a computer that stays on",
    );
    expect(container.textContent).toContain("I want to ask someone");
    expect(container.textContent).toContain(
      "I can't run a server, but I can help",
    );
    // The gate is gone.
    expect(container.textContent).not.toContain(
      "This guide opens with trust",
    );
  });
});
