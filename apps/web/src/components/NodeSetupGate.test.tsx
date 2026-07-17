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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Member } from "@/types";

// The unclaimed-node gate (operator ruling 2026-07): an app served
// from an unclaimed node must BLOCK — people were onboarding and
// creating content that could never save anywhere. Founder finishes
// setup right on the gate; everyone else is told plainly to wait.

vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));

const { fetchClaimStatusMock, claimFounderMock } = vi.hoisted(() => ({
  fetchClaimStatusMock: vi.fn<() => Promise<boolean | null>>(
    async () => null,
  ),
  claimFounderMock: vi.fn<
    () => Promise<{ ok: true } | { ok: false; reason: string }>
  >(async () => ({ ok: true })),
}));
vi.mock("@/lib/nodeClaim", () => ({
  fetchClaimStatus: fetchClaimStatusMock,
  claimFounder: claimFounderMock,
}));

import "@/i18n";
import { NodeSetupGate } from "./NodeSetupGate";
import { db } from "@/db/database";
import { isOnboarded } from "@/db/onboarding";
import { readSubmitConfig } from "@/lib/nodeSubmit";

interface MockState {
  ready: boolean;
  nodeId: string;
  currentMember: Member | null;
  setCurrentMember: ReturnType<typeof vi.fn>;
  refreshOnboarded: ReturnType<typeof vi.fn>;
}

let mockState: MockState;

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const ORIGIN = "https://community.example";

beforeEach(async () => {
  mockState = {
    ready: true,
    nodeId: "node_gate_test",
    currentMember: null,
    setCurrentMember: vi.fn(async () => {}),
    refreshOnboarded: vi.fn(async () => {}),
  };
  fetchClaimStatusMock.mockReset();
  fetchClaimStatusMock.mockResolvedValue(null);
  claimFounderMock.mockReset();
  claimFounderMock.mockResolvedValue({ ok: true });
  await Promise.all(db.tables.map((t) => t.clear()));
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(children: ReactNode = <div>THE APP</div>) {
  act(() => {
    root = createRoot(container);
    root.render(
      <NodeSetupGate originOverride={ORIGIN} isDevOverride={false}>
        {children}
      </NodeSetupGate>,
    );
  });
}

async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
}

/** The claim path does real crypto + Dexie writes; wait (bounded)
 *  until `predicate` holds instead of guessing a flush count. */
async function waitFor(predicate: () => boolean) {
  for (let i = 0; i < 100 && !predicate(); i++) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
  }
}

function buttonByText(text: string): HTMLButtonElement | null {
  return (
    Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes(text),
    ) ?? null
  );
}

function setInput(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )!.set!;
  setter.call(el, value);
  act(() => {
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("NodeSetupGate — when the gate must stay OPEN", () => {
  it("renders the app for a CLAIMED node", async () => {
    fetchClaimStatusMock.mockResolvedValue(false); // claimed
    render();
    await flush();
    expect(container.textContent).toContain("THE APP");
    expect(container.textContent).not.toContain("isn't set up yet");
  });

  it("renders the app when the probe can't answer (fail-open)", async () => {
    fetchClaimStatusMock.mockResolvedValue(null);
    render();
    await flush();
    expect(container.textContent).toContain("THE APP");
  });

  it("never gates dev builds", async () => {
    fetchClaimStatusMock.mockResolvedValue(true); // even 'unclaimed'
    act(() => {
      root = createRoot(container);
      root.render(
        <NodeSetupGate originOverride={ORIGIN} isDevOverride={true}>
          <div>THE APP</div>
        </NodeSetupGate>,
      );
    });
    await flush();
    expect(container.textContent).toContain("THE APP");
    expect(fetchClaimStatusMock).not.toHaveBeenCalled();
  });

  it("never gates loopback origins (local dev servers)", async () => {
    fetchClaimStatusMock.mockResolvedValue(true);
    act(() => {
      root = createRoot(container);
      root.render(
        <NodeSetupGate
          originOverride="http://127.0.0.1:8080"
          isDevOverride={false}
        >
          <div>THE APP</div>
        </NodeSetupGate>,
      );
    });
    await flush();
    expect(container.textContent).toContain("THE APP");
    expect(fetchClaimStatusMock).not.toHaveBeenCalled();
  });
});

describe("NodeSetupGate — the UNCLAIMED node blocks the app", () => {
  it("replaces the app with the setup screen and says why", async () => {
    fetchClaimStatusMock.mockResolvedValue(true); // unclaimed
    render();
    await flush();
    expect(container.textContent).not.toContain("THE APP");
    expect(container.textContent).toContain(
      "This community's server isn't set up yet",
    );
    // Says the consequence plainly — the operator ruling's core.
    expect(container.textContent).toContain(
      "nothing anyone creates here can be saved",
    );
    // Both audiences are addressed.
    expect(container.textContent).toContain("I'm setting up this community");
    expect(container.textContent).toContain("Just joining this community?");
  });

  it("the founder claims right on the gate: name + code → identity minted, node connected, claim sent, app opens", async () => {
    fetchClaimStatusMock.mockResolvedValue(true);
    render();
    await flush();

    const inputs = Array.from(
      container.querySelectorAll("input"),
    ) as HTMLInputElement[];
    setInput(inputs[0], "Seth"); // display name (fresh device)
    setInput(inputs[1], "my-setup-code");

    // The next status check (after the claim) reports CLAIMED.
    fetchClaimStatusMock.mockResolvedValue(false);
    const claimBtn = buttonByText("Claim this server")!;
    await act(async () => {
      claimBtn.form!.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    await waitFor(() => container.textContent?.includes("THE APP") ?? false);

    // A real identity was minted and became current.
    expect(mockState.setCurrentMember).toHaveBeenCalled();
    const members = await db.members.toArray();
    expect(members.map((m) => m.displayName)).toEqual(["Seth"]);
    // The device is CONNECTED to this origin's node…
    expect(await readSubmitConfig()).toMatchObject({
      url: `${ORIGIN}/api`,
      enabled: true,
    });
    // …the claim was sent with the entered code…
    expect(claimFounderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${ORIGIN}/api`,
        setupToken: "my-setup-code",
        publicKey: members[0].publicKey,
      }),
    );
    // …the device is onboarded (no Welcome bounce)…
    expect(await isOnboarded()).toBe(true);
    expect(mockState.refreshOnboarded).toHaveBeenCalled();
    // …and the gate opened onto the app.
    expect(container.textContent).toContain("THE APP");
  });

  it("shows the claim error in plain language when the code is wrong", async () => {
    fetchClaimStatusMock.mockResolvedValue(true);
    claimFounderMock.mockResolvedValue({
      ok: false,
      reason: "bad_setup_token",
    });
    render();
    await flush();

    const inputs = Array.from(
      container.querySelectorAll("input"),
    ) as HTMLInputElement[];
    setInput(inputs[0], "Seth");
    setInput(inputs[1], "wrong-code");
    const claimBtn = buttonByText("Claim this server")!;
    await act(async () => {
      claimBtn.form!.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    await waitFor(
      () => container.textContent?.includes("doesn't match") ?? false,
    );

    expect(container.textContent).toContain("That code doesn't match");
    expect(container.textContent).not.toContain("THE APP");
  });

  it("opens the app on claim success even when the status probe would still answer 'unclaimed' (stale cache)", async () => {
    // The 2026-07 relaunch report: the claim POST succeeded, but the
    // gate's follow-up /config probe answered from a stale cache and
    // the founder stayed on a dead setup screen until a hard refresh.
    // The gate now trusts the claim result directly.
    fetchClaimStatusMock.mockResolvedValue(true); // stays 'unclaimed' forever
    render();
    await flush();

    const inputs = Array.from(
      container.querySelectorAll("input"),
    ) as HTMLInputElement[];
    setInput(inputs[0], "Seth");
    setInput(inputs[1], "my-setup-code");
    const claimBtn = buttonByText("Claim this server")!;
    await act(async () => {
      claimBtn.form!.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    await waitFor(() => container.textContent?.includes("THE APP") ?? false);
    expect(container.textContent).toContain("THE APP");
  });

  it("an unexpected client-side throw shows a message instead of a dead button", async () => {
    fetchClaimStatusMock.mockResolvedValue(true);
    claimFounderMock.mockRejectedValue(new Error("identity locked"));
    render();
    await flush();

    const inputs = Array.from(
      container.querySelectorAll("input"),
    ) as HTMLInputElement[];
    setInput(inputs[0], "Seth");
    setInput(inputs[1], "my-setup-code");
    const claimBtn = buttonByText("Claim this server")!;
    await act(async () => {
      claimBtn.form!.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    await waitFor(
      () =>
        container.textContent?.includes("Something went wrong on this device") ??
        false,
    );
    expect(container.textContent).toContain(
      "Something went wrong on this device",
    );
    // The screen is alive: the button is enabled for another try.
    expect(buttonByText("Claim this server")!.disabled).toBe(false);
  });

  it("explains why there is no name field when the device carries a saved identity", async () => {
    mockState.currentMember = {
      publicKey: "existing-key",
      displayName: "Old Me",
    } as Member;
    fetchClaimStatusMock.mockResolvedValue(true);
    render();
    await flush();
    expect(container.textContent).toContain(
      "This device already has a saved identity",
    );
    // And indeed no name input — only the code field.
    expect(container.querySelectorAll("input")).toHaveLength(1);
  });
});
