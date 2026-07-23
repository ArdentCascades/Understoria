/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/*
 * /add-cofounder — the founder's half of the ceremony
 * (docs/cofounder-ceremony-plan.md P3). Locks:
 *   1. Permanence is said FIRST, before any capture UI exists.
 *   2. A key that resolves to no member dead-ends honestly ("invite
 *      them first — your invites work"); the founder's own key is
 *      refused; there is never a roster to pick from.
 *   3. Confirm shows the RESOLVED member (name + avatar +
 *      fingerprint) and the "permanently" line naming them.
 *   4. Sign & send → the pending card (expiry, re-send, withdraw);
 *      pending state survives a reload via the settings key; withdraw
 *      clears it and says the server row just expires.
 *   5. Done keys off the CAPTURE's hash count reaching 2.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPair } from "@understoria/shared/crypto";

let capturedValue = "";
vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/components/PairDeviceCapture", () => ({
  PairDeviceCapture: ({
    onCaptured,
  }: {
    onCaptured: (v: string) => void;
  }) => (
    <button type="button" onClick={() => onCaptured(capturedValue)}>
      mock-capture
    </button>
  ),
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
import { db, setSetting } from "@/db/database";
import {
  createNomination,
  readPendingNomination,
  COFOUNDER_PENDING_NOMINATION,
} from "@/lib/cofounder";
import AddCoFounderPage from "./AddCoFounder";
import type { Member } from "@/types";

const nodeId = "node_test";
const me = generateKeyPair();
const nominee = generateKeyPair();
const strangerKey = generateKeyPair().publicKey; // plausible, not a member

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
  nodeId: string;
  founderHashCapture: { nodeId: string; hashes: string[] } | null;
  refreshNodeConfig: ReturnType<typeof vi.fn>;
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.secretKeys.put({ publicKey: me.publicKey, secretKey: me.secretKey });
  capturedValue = "";
  mockState = {
    currentMember: member(me.publicKey, "Fern Founder"),
    members: [
      member(me.publicKey, "Fern Founder"),
      member(nominee.publicKey, "Nia Nominee"),
    ],
    nodeId,
    founderHashCapture: { nodeId, hashes: ["hash-of-me"] },
    refreshNodeConfig: vi.fn(async () => {}),
  };
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
});

async function render() {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/add-cofounder"]}>
        <AddCoFounderPage />
      </MemoryRouter>,
    );
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
}

function button(label: string): HTMLButtonElement {
  const found = Array.from(container.querySelectorAll("button")).find(
    (b) => (b.textContent ?? "").trim() === label,
  );
  expect(found, `button "${label}"`).toBeTruthy();
  return found as HTMLButtonElement;
}

async function click(label: string) {
  await act(async () => {
    button(label).click();
  });
  // Handlers await Dexie + fetch — settle on a real task.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
}

async function captureKey(key: string) {
  await click("Choose a co-founder");
  capturedValue = key;
  await click("mock-capture");
}

function stubSubmit(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () => new Response(JSON.stringify(body), { status }),
    ),
  );
}

describe("/add-cofounder", () => {
  it("intro says permanence up front, before any capture UI", async () => {
    await render();
    expect(container.textContent).toContain(
      "Founding is permanent. A co-founder becomes a trust root of this community forever — there is no way to undo it in the app, ever.",
    );
    expect(container.textContent).not.toContain("mock-capture");
  });

  it("a plausible key that is no member dead-ends honestly — invite them first, your invites work", async () => {
    await render();
    await captureKey(strangerKey);
    expect(container.textContent).toContain(
      "That key doesn't belong to a member yet",
    );
    expect(container.textContent).toContain(
      "Invite them first — your invites work",
    );
    expect(container.textContent).not.toContain("permanently.");
  });

  it("the founder's own key is refused", async () => {
    await render();
    await captureKey(me.publicKey);
    expect(container.textContent).toContain("That's your own key");
  });

  it("implausible captured text never reaches confirm", async () => {
    await render();
    await captureKey("definitely-not-a-key");
    expect(container.textContent).toContain(
      "That doesn't look like a member's public key",
    );
  });

  it("confirm shows the resolved member — name, avatar, fingerprint, and the permanent line — then sign & send lands on pending", async () => {
    stubSubmit(201, { stored: true });
    await render();
    await captureKey(nominee.publicKey);
    expect(container.textContent).toContain(
      "You are making Nia Nominee a founder, permanently.",
    );
    expect(container.textContent).toContain("Key fingerprint:");
    expect(container.querySelector("svg")).not.toBeNull(); // MemberAvatar

    await click("Sign and send the nomination");
    expect(container.textContent).toContain("Nomination sent");
    expect(container.textContent).toContain("This nomination expires");
    // Withdraw honesty: local-only clear, the server row just expires.
    expect(container.textContent).toContain(
      "the nomination itself simply expires on its own",
    );
    // Persisted for resume — and signed by me, for the right nominee.
    const pending = await readPendingNomination();
    expect(pending?.nominatorKey).toBe(me.publicKey);
    expect(pending?.nomineeKey).toBe(nominee.publicKey);
  });

  it("maps a server refusal onto its copy (nominee_not_a_member)", async () => {
    stubSubmit(409, { error: "nominee_not_a_member" });
    await render();
    await captureKey(nominee.publicKey);
    await click("Sign and send the nomination");
    expect(container.textContent).toContain(
      "They're not a member of this community yet.",
    );
    expect(container.textContent).not.toContain("Nomination sent");
  });

  it("resumes the pending card from the settings key, and Withdraw clears it", async () => {
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
    expect(container.textContent).toContain("Nomination sent");
    await click("Withdraw");
    expect(await readPendingNomination()).toBeNull();
    expect(container.textContent).toContain(
      "Communities start with two founders",
    );
  });

  it("Done the moment the founder-hash capture reaches 2", async () => {
    mockState.founderHashCapture = { nodeId, hashes: ["h1", "h2"] };
    await render();
    expect(container.textContent).toContain(
      "Your community has two founders",
    );
  });
});
