/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/*
 * SoleFounderCard (docs/cofounder-ceremony-plan.md P4): the standing
 * warning shown ONLY to a community's sole founder — the warning, the
 * "your own invites still work" line, and the Add-a-co-founder
 * doorway; swapped for the pending state while a nomination is out.
 * Everyone else (and every healthy or founderless community) renders
 * nothing.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPair } from "@understoria/shared/crypto";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));

import "@/i18n";
import { db, setSetting } from "@/db/database";
import {
  COFOUNDER_PENDING_NOMINATION,
  createNomination,
} from "@/lib/cofounder";
import { SoleFounderCard } from "./SoleFounderCard";
import type { Member } from "@/types";

const nodeId = "node_test";
const me = generateKeyPair();
const nominee = generateKeyPair();

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
  vouches: unknown[];
  invites: unknown[];
  founderRoots: ReadonlySet<string>;
  founderHashCapture: { nodeId: string; hashes: string[] } | null;
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
  mockState = {
    currentMember: member(me.publicKey, "Fern Founder"),
    members: [
      member(me.publicKey, "Fern Founder"),
      member(nominee.publicKey, "Nia Nominee"),
    ],
    vouches: [],
    invites: [],
    founderRoots: new Set([me.publicKey]),
    founderHashCapture: { nodeId, hashes: ["hash-of-me"] },
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
      <MemoryRouter>
        <SoleFounderCard />
      </MemoryRouter>,
    );
  });
  // Let the pending-nomination live query settle (Dexie resolves on a
  // real task, not a microtask).
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe("SoleFounderCard", () => {
  it("warns the sole founder, names the invites-still-work path, and links the ceremony", async () => {
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain(
      "You are this community's only trusted member — nobody else can ever invite or vouch until you add a co-founder.",
    );
    expect(text).toContain("Your own invites still work");
    const link = container.querySelector('a[href="/add-cofounder"]');
    expect(link).not.toBeNull();
    expect(link!.textContent).toContain("Add a co-founder");
  });

  it("renders nothing for a non-founder, a two-root community, or no capture", async () => {
    mockState.founderRoots = new Set(["someone-else"]);
    await render();
    expect(container.textContent).toBe("");

    mockState.founderRoots = new Set([me.publicKey, "other-root"]);
    mockState.founderHashCapture = { nodeId, hashes: ["h1", "h2"] };
    await render();
    expect(container.textContent).toBe("");

    mockState.founderRoots = new Set([me.publicKey]);
    mockState.founderHashCapture = null; // founderless: no warnings
    await render();
    expect(container.textContent).toBe("");
  });

  it("swaps to the pending state while a nomination is out, naming the nominee", async () => {
    await db.secretKeys.put({
      publicKey: me.publicKey,
      secretKey: me.secretKey,
    });
    const n = await createNomination({
      nominatorKey: me.publicKey,
      nomineeKey: nominee.publicKey,
      nodeId,
    });
    await setSetting(COFOUNDER_PENDING_NOMINATION, JSON.stringify(n));
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain("waiting for Nia Nominee to accept");
    expect(text).not.toContain("Your own invites still work");
    expect(container.querySelector('a[href="/add-cofounder"]')).not.toBeNull();
  });
});
