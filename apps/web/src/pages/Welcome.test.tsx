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
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock `useApp` BEFORE importing the page. Lets each test dial in
// `nodeConfig.inviteOnly` and `currentMember` independently.
vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));

// `useLiveQuery` is the only path Welcome.tsx uses to read the local
// members count for the bootstrap check. Mocking it lets us simulate
// the four states (loading, empty, populated, foreign-node-only)
// deterministically without spinning up Dexie.
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: () => mockMemberCount,
}));

// Pull in i18n side-effects so `t()` returns translated strings, not
// raw keys — the assertions below match on the English copy.
import "@/i18n";
import WelcomePage from "./Welcome";
import { DEFAULT_NODE_CONFIG } from "@/types";
import type { Member, NodeConfig } from "@/types";

interface MockState {
  currentMember: Member | null;
  nodeId: string;
  nodeConfig: NodeConfig;
  refreshOnboarded: () => Promise<void>;
}

// `useLiveQuery` here returns the local-member count. `undefined` ===
// "Dexie still resolving"; a number === resolved row count for the
// current nodeId.
let mockMemberCount: number | undefined = 0;
let mockState: MockState = blankState();

function blankState(): MockState {
  return {
    currentMember: null,
    nodeId: "node-local",
    nodeConfig: { ...DEFAULT_NODE_CONFIG },
    refreshOnboarded: async () => {},
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockState = blankState();
  mockMemberCount = 0;
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

// Concept screens render before profileSetup. To exercise the gate we
// click "Next" five times to land on the final step. The button label
// for non-last concept steps is "Next" (welcome.next); the last
// concept step's Next label is "Open the board" (welcome.start) only
// if the final step IS the concept screen, but here it's profileSetup,
// so the 5th concept's Next is still "Next".
function clickNextNTimes(n: number) {
  for (let i = 0; i < n; i++) {
    const next = container.querySelector(
      "button.btn-primary",
    ) as HTMLButtonElement | null;
    if (!next) throw new Error(`No primary button at step ${i}`);
    act(() => {
      next.click();
    });
  }
}

describe("WelcomePage — invite-only gate", () => {
  it("inviteOnly:false + members empty → profileSetup renders (open mode, existing behavior)", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    clickNextNTimes(5);
    // The profileSetup step's title is "A little about you".
    expect(container.textContent).toContain("A little about you");
    expect(container.textContent).not.toContain("Understoria is invite-only");
  });

  it("inviteOnly:false + members populated → profileSetup renders (open mode)", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 3;
    render(<WelcomePage />);
    clickNextNTimes(5);
    expect(container.textContent).toContain("A little about you");
    expect(container.textContent).not.toContain("Understoria is invite-only");
  });

  it("inviteOnly:true + members empty → profileSetup renders (bootstrap exception)", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: true };
    mockMemberCount = 0;
    render(<WelcomePage />);
    clickNextNTimes(5);
    // The first member on a fresh node can still onboard.
    expect(container.textContent).toContain("A little about you");
    expect(container.textContent).not.toContain("Understoria is invite-only");
  });

  it("inviteOnly:true + members populated → InviteOnlyLanding replaces profileSetup", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: true };
    mockMemberCount = 2;
    render(<WelcomePage />);
    clickNextNTimes(5);
    // The dead-end landing replaces profileSetup.
    expect(container.textContent).toContain("Understoria is invite-only");
    expect(container.textContent).not.toContain("A little about you");
    // No action buttons — the dead end is intentional. The only
    // buttons in the InviteOnlyLanding output should be ZERO (the
    // OnboardingScreen chrome — Skip / Back / Next — is not rendered
    // for this branch).
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(0);
  });

  it("inviteOnly:true + members still loading → renders a loading placeholder, not the landing", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: true };
    mockMemberCount = undefined;
    render(<WelcomePage />);
    clickNextNTimes(5);
    // Neither the landing copy nor the profileSetup copy yet — we
    // wait for the count to come back before deciding.
    expect(container.textContent).not.toContain("Understoria is invite-only");
    expect(container.textContent).not.toContain("A little about you");
  });

  it("concept screens render in invite-only mode (they're context, not gated)", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: true };
    mockMemberCount = 5;
    render(<WelcomePage />);
    // Step 1 — "This is a timebank" — should render even though
    // self-onboarding is gated. The visitor wondering whether to seek
    // an invite needs the context.
    expect(container.textContent).toContain("This is a timebank");
    // Lock the plain-language body rewrite — the hours-are-equal line
    // is the load-bearing sentence of the first concept screen.
    expect(container.textContent).toContain(
      "One hour of your help is worth one hour",
    );
  });
});
