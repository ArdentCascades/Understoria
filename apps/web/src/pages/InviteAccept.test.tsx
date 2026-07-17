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
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock `useApp` BEFORE importing the page, matching Welcome.test.tsx —
// each test dials in `currentMember` to exercise the §5.2 attach path.
vi.mock("@/state/AppContext", () => ({
  useApp: () => mockState,
}));

// The origin-derived node probe: null (no reachable node) by default;
// the auto-connect test dials in a candidate URL.
const { suggestMock } = vi.hoisted(() => ({
  suggestMock: vi.fn<() => Promise<string | null>>(async () => null),
}));
vi.mock("@/lib/nodeOriginSuggest", () => ({
  suggestNodeUrlFromOrigin: suggestMock,
}));

// Pull in i18n side-effects so `t()` returns translated strings — the
// assertions below match on the English copy.
import "@/i18n";
import InviteAcceptPage from "./InviteAccept";
import { db } from "@/db/database";
import { createMember } from "@/db/seed";
import { generateKeyPair } from "@/lib/crypto";
import { createInvite, encodeInviteToken } from "@/lib/invite";
import type { Member } from "@/types";

interface MockState {
  nodeId: string;
  setNodeId: ReturnType<typeof vi.fn>;
  currentMember: Member | null;
  setCurrentMember: ReturnType<typeof vi.fn>;
  refreshOnboarded: ReturnType<typeof vi.fn>;
}

let mockState: MockState;

function blankState(): MockState {
  return {
    nodeId: "node-local",
    setNodeId: vi.fn(),
    currentMember: null,
    setCurrentMember: vi.fn(async () => {}),
    refreshOnboarded: vi.fn(async () => {}),
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  mockState = blankState();
  suggestMock.mockReset();
  suggestMock.mockResolvedValue(null);
  await Promise.all([
    db.members.clear(),
    db.secretKeys.clear(),
    db.settings.clear(),
    db.invites.clear(),
  ]);
  window.history.replaceState(null, "", "/invite");
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  window.history.replaceState(null, "", "/");
});

function render(node: ReactNode = <InviteAcceptPage />) {
  act(() => {
    root = createRoot(container);
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
}

// React's controlled inputs ignore direct `.value =` writes; go through
// the native setter + input event, matching Welcome.test.tsx.
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

function validInviteToken(inviterName = "Rosa"): string {
  const kp = generateKeyPair();
  return encodeInviteToken(
    createInvite({
      inviterKey: kp.publicKey,
      inviterSecretKey: kp.secretKey,
      inviterName,
      nodeId: "node_remote",
    }),
  );
}

function setFragment(token: string | null) {
  window.history.replaceState(
    null,
    "",
    token ? `/invite#${token}` : "/invite",
  );
}

function buttonByText(text: string): HTMLButtonElement | null {
  return (
    Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes(text),
    ) ?? null
  );
}

function pasteInput(): HTMLInputElement {
  // The paste-recovery input carries the invite-link placeholder.
  return container.querySelector(
    'input[placeholder*="/invite#"]',
  ) as HTMLInputElement;
}

describe("InviteAccept — mangled-link arrivals (§5.1.1)", () => {
  it("renders the paste-recovery input, not an error, when /invite has no fragment", async () => {
    setFragment(null);
    render();
    await flush();
    expect(container.textContent).toContain("Open your invite");
    expect(container.textContent).toContain(
      "If you have the invite link, paste the whole thing here.",
    );
    // Calm framing — no error headline, nothing failed yet.
    expect(container.textContent).not.toContain(
      "This invite can't be used.",
    );
  });

  it("recovers from a pasted full link and proceeds to the accept form", async () => {
    setFragment(null);
    render();
    await flush();
    const token = validInviteToken("Rosa");
    setInput(pasteInput(), `https://aid.example.org/invite#${token}`);
    act(() => {
      buttonByText("Use this link")!.click();
    });
    await flush();
    expect(container.textContent).toContain(
      "Rosa wants you in their mutual aid network.",
    );
  });

  it("shows the error screen WITH the paste input for a damaged fragment", async () => {
    setFragment("garbage-fragment");
    render();
    await flush();
    expect(container.textContent).toContain("This invite can't be used.");
    expect(container.textContent).toContain(
      "damaged or incomplete",
    );
    expect(pasteInput()).not.toBeNull();
    // Recovery from the error screen too.
    const token = validInviteToken("Rosa");
    setInput(pasteInput(), `#${token}`);
    act(() => {
      buttonByText("Use this link")!.click();
    });
    await flush();
    expect(container.textContent).toContain(
      "Rosa wants you in their mutual aid network.",
    );
  });

  it("rejects a paste with nothing token-shaped in it, inline", async () => {
    setFragment(null);
    render();
    await flush();
    setInput(pasteInput(), "see you saturday!");
    act(() => {
      buttonByText("Use this link")!.click();
    });
    await flush();
    expect(container.textContent).toContain(
      "That doesn't look like an invite link.",
    );
  });
});

describe("InviteAccept — honest exits (§5.1.3)", () => {
  it("the error exit says plainly that the member has NOT joined", async () => {
    setFragment("garbage-fragment");
    render();
    await flush();
    const exit = buttonByText("Continue without joining");
    expect(exit).not.toBeNull();
    expect(container.textContent).toContain(
      "you haven't joined a community yet",
    );
    expect(container.textContent).toContain(
      "you can join any time with a fresh invite link",
    );
    // The old silent-success exit label is gone.
    expect(buttonByText("Continue to the board")).toBeNull();
  });

  it("the decline exit on a VALID invite carries the same honesty, named", async () => {
    setFragment(validInviteToken("Rosa"));
    render();
    await flush();
    expect(buttonByText("Continue without joining")).not.toBeNull();
    expect(container.textContent).toContain(
      "you haven't joined Rosa's community yet",
    );
  });
});

describe("InviteAccept — attach, don't mint (§5.2)", () => {
  it("fresh device: no identity banner, empty name field", async () => {
    setFragment(validInviteToken());
    render();
    await flush();
    expect(container.textContent).not.toContain("Joining as");
    const nameField = container.querySelector(
      "input.input",
    ) as HTMLInputElement;
    expect(nameField.value).toBe("");
  });

  it("identified device: 'Joining as' banner, prefilled name edit, escape hatch one tap away", async () => {
    // A real member whose secret key is on this device — createMember
    // writes both rows, mirroring the orphan-identity incident case.
    const member = await createMember({ displayName: "Ash" }, "node-local");
    mockState.currentMember = member;
    setFragment(validInviteToken());
    render();
    await flush();

    expect(container.textContent).toContain("Joining as Ash");
    expect(container.textContent).toContain(
      "the invite will be added to it",
    );
    const nameField = container.querySelector(
      "input.input",
    ) as HTMLInputElement;
    expect(nameField.value).toBe("Ash");

    // The shared-device escape hatch: visible, and switches to the
    // mint framing with an empty name field for the new person.
    const hatch = buttonByText("I'm someone else");
    expect(hatch).not.toBeNull();
    act(() => {
      hatch!.click();
    });
    await flush();
    expect(container.textContent).toContain(
      "brand-new identity on this shared device",
    );
    expect(
      (container.querySelector("input.input") as HTMLInputElement).value,
    ).toBe("");

    // And the way back is equally one tap.
    act(() => {
      buttonByText("Actually, I'm Ash")!.click();
    });
    await flush();
    expect(container.textContent).toContain("Joining as Ash");
  });

  it("no banner when the current member's secret key is absent (attach impossible)", async () => {
    const member = await createMember({ displayName: "Ash" }, "node-local");
    await db.secretKeys.delete(member.publicKey);
    mockState.currentMember = member;
    setFragment(validInviteToken());
    render();
    await flush();
    expect(container.textContent).not.toContain("Joining as");
  });
});

describe("InviteAccept — redeeming JOINS the server (no extra card)", () => {
  it("connects to the origin-derived node on redemption, with no consent card and no extra tap", async () => {
    // Operator ruling (2026-07): accepting the invite IS joining the
    // community, server included. The old §5.3 consent card between
    // "Accept invite" and actually being connected is gone.
    suggestMock.mockResolvedValue("https://community.test/api");
    setFragment(validInviteToken("Rosa"));
    render();
    await flush();

    const name = container.querySelector(
      "input.input",
    ) as HTMLInputElement;
    setInput(name, "New Neighbor");
    const submit = buttonByText("Accept invite and join")!;
    await act(async () => {
      submit.form!.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    for (
      let i = 0;
      i < 100 && !container.textContent?.includes("Welcome in");
      i++
    ) {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
    }

    // The device IS connected — no card, no question, no notice.
    const { readSubmitConfig } = await import("@/lib/nodeSubmit");
    expect(await readSubmitConfig()).toMatchObject({
      url: "https://community.test/api",
      enabled: true,
    });
    expect(container.textContent).toContain("Redirecting");
    expect(container.textContent).not.toContain(
      "not connected to the community's server",
    );

    // And the device is ONBOARDED, in both the durable flag and the
    // live context: without this the OnboardingGate bounced the
    // freshly-invited member into the Welcome flow, whose profile
    // step could mint a SECOND identity — the "island account".
    const { isOnboarded } = await import("@/db/onboarding");
    expect(await isOnboarded()).toBe(true);
    expect(mockState.refreshOnboarded).toHaveBeenCalled();
  });
});

describe("InviteAccept — the unconnected-success notice", () => {
  it("says plainly when the redeemed device is NOT connected to the community's server", async () => {
    // In the test environment the §5.3 origin suggestion is null (dev
    // gate) and no node is configured — exactly the arrival that used
    // to redirect into a silently empty app: a real local redemption
    // that never reaches the community (the "island account" report).
    setFragment(validInviteToken("Rosa"));
    render();
    await flush();

    const name = container.querySelector(
      "input.input",
    ) as HTMLInputElement;
    setInput(name, "New Neighbor");
    const submit = buttonByText("Accept invite and join")!;
    await act(async () => {
      submit.form!.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    // Redemption does real signature verification + Dexie writes;
    // wait until the submitting state resolves (bounded).
    for (
      let i = 0;
      i < 100 && !container.textContent?.includes("Welcome in");
      i++
    ) {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
    }

    expect(container.textContent).toContain(
      "not connected to the community's server",
    );
    // Named guidance, not a generic shrug — Rosa can supply the URL.
    expect(container.textContent).toContain(
      "ask Rosa for the community's address",
    );
    expect(buttonByText("Open Profile settings")).not.toBeNull();
    expect(buttonByText("Continue anyway")).not.toBeNull();
    // The success copy must NOT claim we're redirecting — we aren't.
    expect(container.textContent).not.toContain("Redirecting");
  });
});

describe("InviteAccept — beta/AI disclosure on the doorstep", () => {
  it("the valid-invite screen carries the notice below the invite card", async () => {
    setFragment(validInviteToken("Rosa"));
    render();
    await flush();
    expect(container.textContent).toContain("Please know what you're using");
    expect(container.textContent).toContain("written with AI tools");
  });
});
