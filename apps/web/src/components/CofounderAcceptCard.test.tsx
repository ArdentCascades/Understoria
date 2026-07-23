/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/*
 * CofounderAcceptCard (docs/cofounder-ceremony-plan.md P3): the
 * nominee's half of the ceremony. Locks:
 *   1. The PERMANENCE copy is load-bearing — asserted verbatim: the
 *      accept card is where "forever" gets said before the signature
 *      that makes it so.
 *   2. Accept → acceptNomination, then the config-refetch kick
 *      (pendingMirrorSuggestions + refreshNodeConfig) → success state.
 *   3. "Not now" clears the local key only; a later pull may
 *      re-surface until expiry — the honest, documented behavior.
 *   4. Errors map through cofounder.errors.*; clock skew names the
 *      device clock, never the person.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPair } from "@understoria/shared/crypto";
import type { FounderNomination } from "@understoria/shared/types";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/lib/cofounder", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/cofounder")>()),
  acceptNomination: vi.fn(),
}));
vi.mock("@/lib/nodeEndpoints", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/nodeEndpoints")>()),
  getActiveNodeUrl: vi.fn(async () => ({
    url: "http://node.test",
    isPrimary: true,
  })),
  pendingMirrorSuggestions: vi.fn(async () => []),
}));

import "@/i18n";
import { db, getSetting } from "@/db/database";
import {
  COFOUNDER_INCOMING_NOMINATION,
  acceptNomination,
  createNomination,
  writeIncomingNomination,
} from "@/lib/cofounder";
import { pendingMirrorSuggestions } from "@/lib/nodeEndpoints";
import { CofounderAcceptCard } from "./CofounderAcceptCard";
import type { Member } from "@/types";

const nodeId = "node_test";
const founder = generateKeyPair();
const me = generateKeyPair();

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
  members: Member[];
  founderRoots: ReadonlySet<string>;
  refreshNodeConfig: ReturnType<typeof vi.fn>;
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;
let nomination: FounderNomination;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.secretKeys.put({
    publicKey: founder.publicKey,
    secretKey: founder.secretKey,
  });
  nomination = await createNomination({
    nominatorKey: founder.publicKey,
    nomineeKey: me.publicKey,
    nodeId,
  });
  await writeIncomingNomination(nomination);
  mockState = {
    members: [
      member(founder.publicKey, "Fern Founder"),
      member(me.publicKey, "Nia Nominee"),
    ],
    founderRoots: new Set([founder.publicKey]),
    refreshNodeConfig: vi.fn(async () => {}),
  };
  vi.mocked(acceptNomination).mockReset();
  vi.mocked(pendingMirrorSuggestions).mockClear();
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
    root.render(<CofounderAcceptCard nomination={nomination} />);
  });
}

function button(label: string): HTMLButtonElement {
  const found = Array.from(container.querySelectorAll("button")).find(
    (b) => (b.textContent ?? "").trim() === label,
  );
  expect(found, `button "${label}"`).toBeTruthy();
  return found as HTMLButtonElement;
}

describe("CofounderAcceptCard", () => {
  it("names the nominator (with avatar), the expiry, and the LOAD-BEARING permanence copy", async () => {
    await render();
    const text = container.textContent ?? "";
    expect(text).toContain("Fern Founder asks you to co-found this community");
    // Verbatim permanence assertion — this string is the ceremony's
    // whole safety story; do not weaken it.
    expect(text).toContain(
      "Becoming a founder is permanent. You would be a trust root of this community forever — there is no way to undo it in the app, ever.",
    );
    expect(text).toContain("This invitation expires");
    expect(container.querySelector("svg")).not.toBeNull(); // MemberAvatar
  });

  it("Accept: acceptNomination → the config-refetch kick → success state; the key is NOT cleared here", async () => {
    vi.mocked(acceptNomination).mockResolvedValue({
      ok: true,
      alreadyFounder: false,
      accession: { nomination, acceptedAt: Date.now(), signature: "sig" },
    });
    await render();
    await act(async () => {
      button("Accept and sign").click();
    });
    expect(acceptNomination).toHaveBeenCalledWith(
      expect.objectContaining({ url: "http://node.test", nomination }),
    );
    // The kick that flips this device out of single-founder state in
    // the same interaction: a fresh /config capture + config re-read.
    expect(pendingMirrorSuggestions).toHaveBeenCalled();
    expect(mockState.refreshNodeConfig).toHaveBeenCalled();
    expect(container.textContent).toContain(
      "You are a founder of this community",
    );
    // The incoming key survives until Done / the next pull — the
    // success state must not unmount out from under the member.
    expect(await getSetting(COFOUNDER_INCOMING_NOMINATION)).not.toBe("");
  });

  it("Not now clears the local key only (re-poll may re-surface until expiry — said on the card)", async () => {
    await render();
    expect(container.textContent).toContain("the card may come back");
    await act(async () => {
      button("Not now").click();
    });
    expect(await getSetting(COFOUNDER_INCOMING_NOMINATION)).toBe("");
    expect(acceptNomination).not.toHaveBeenCalled();
  });

  it("maps a refusal to its copy — clock skew points at date/time settings, not the person", async () => {
    vi.mocked(acceptNomination).mockResolvedValue({
      ok: false,
      reason: "acceptance_out_of_window",
    });
    await render();
    await act(async () => {
      button("Accept and sign").click();
    });
    expect(container.textContent).toContain(
      "This device's clock looks off",
    );
    expect(container.textContent).not.toContain(
      "You are a founder of this community",
    );
  });

  it("renders the accepted state, never a second prompt, once the member already resolves as a root", async () => {
    mockState.founderRoots = new Set([founder.publicKey, me.publicKey]);
    await render();
    expect(container.textContent).toContain(
      "You are a founder of this community",
    );
    expect(
      Array.from(container.querySelectorAll("button")).some(
        (b) => (b.textContent ?? "").trim() === "Accept and sign",
      ),
    ).toBe(false);
  });
});
