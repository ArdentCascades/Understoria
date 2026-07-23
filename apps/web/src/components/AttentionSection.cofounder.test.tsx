/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/*
 * AttentionSection × co-founder nomination
 * (docs/cofounder-ceremony-plan.md P3): an incoming nomination
 * surfaces the accept card in the rail even when nothing else needs
 * attention, counts as blocking for the mobile default (a
 * permanent-founding decision never loads hidden), and an expired or
 * misaddressed row surfaces nothing.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPair } from "@understoria/shared/crypto";

const { computeAttentionItemsMock } = vi.hoisted(() => ({
  computeAttentionItemsMock: vi.fn(() => []),
}));

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn(), dismissToast: vi.fn(), toast: null }),
}));
vi.mock("@/lib/attention", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/attention")>()),
  computeAttentionItems: computeAttentionItemsMock,
}));
// The card's own behavior is covered by CofounderAcceptCard.test.tsx;
// here only the surfacing contract matters.
vi.mock("@/components/CofounderAcceptCard", () => ({
  CofounderAcceptCard: () => <div data-testid="cofounder-accept-card" />,
}));

import "@/i18n";
import { db } from "@/db/database";
import { createNomination, writeIncomingNomination } from "@/lib/cofounder";
import { AttentionSection } from "./AttentionSection";

const founder = generateKeyPair();
const me = generateKeyPair();

interface MockState {
  currentMember: { publicKey: string; displayName: string } | null;
  posts: unknown[];
  projects: unknown[];
  projectTasks: unknown[];
  members: unknown[];
  vouches: unknown[];
  nodeConfig: { taskCheckInDays: number };
  nodeId: string;
  lockState: string;
  coorgInvitations: unknown[];
  coorgInvitationResponses: unknown[];
  coorgInvitationRevocations: unknown[];
  events: unknown[];
  eventRsvps: unknown[];
  eventCancellations: unknown[];
  proposals: unknown[];
  capacityPostures: unknown[];
  invites: unknown[];
  founderRoots: ReadonlySet<string>;
  blockedKeys: Set<string>;
}

let mockState: MockState;
let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.secretKeys.put({
    publicKey: founder.publicKey,
    secretKey: founder.secretKey,
  });
  computeAttentionItemsMock.mockReturnValue([]);
  mockState = {
    currentMember: { publicKey: me.publicKey, displayName: "Nia" },
    posts: [],
    projects: [],
    projectTasks: [],
    members: [],
    vouches: [],
    nodeConfig: { taskCheckInDays: 7 },
    nodeId: "node_test",
    lockState: "unprotected",
    coorgInvitations: [],
    coorgInvitationResponses: [],
    coorgInvitationRevocations: [],
    events: [],
    eventRsvps: [],
    eventCancellations: [],
    proposals: [],
    capacityPostures: [],
    invites: [],
    founderRoots: new Set([founder.publicKey]),
    blockedKeys: new Set<string>(),
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
        <AttentionSection />
      </MemoryRouter>,
    );
  });
  // Let the incoming-nomination live query settle.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
}

async function seedNomination(nomineeKey: string, now?: () => number) {
  const n = await createNomination({
    nominatorKey: founder.publicKey,
    nomineeKey,
    nodeId: "node_test",
    now,
  });
  await writeIncomingNomination(n);
  return n;
}

describe("AttentionSection — incoming co-founder nomination", () => {
  it("surfaces the accept card even when nothing else needs attention, expanded on mobile", async () => {
    await seedNomination(me.publicKey);
    await render();
    expect(
      container.querySelector('[data-testid="cofounder-accept-card"]'),
    ).not.toBeNull();
    // Blocking default: the rail must not load collapsed on mobile.
    const trigger = container.querySelector("button[aria-expanded]");
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
  });

  it("renders nothing at all for an empty rail without a nomination", async () => {
    await render();
    expect(container.textContent).toBe("");
  });

  it("an expired nomination surfaces nothing (honest hide, no delete — re-poll owns the key)", async () => {
    const past = Date.now() - 80 * 60 * 60 * 1000; // beyond the 72 h TTL
    await seedNomination(me.publicKey, () => past);
    await render();
    expect(container.textContent).toBe("");
  });

  it("a nomination addressed to someone else surfaces nothing", async () => {
    await seedNomination(generateKeyPair().publicKey);
    await render();
    expect(container.textContent).toBe("");
  });
});
