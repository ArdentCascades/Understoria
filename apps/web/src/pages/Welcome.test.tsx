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
import { MemoryRouter, useLocation } from "react-router-dom";
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
import { db, getSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { DEFAULT_NODE_CONFIG } from "@/types";
import type { Member, NodeConfig } from "@/types";

interface MockState {
  currentMember: Member | null;
  nodeId: string;
  nodeConfig: NodeConfig;
  onboarded: boolean;
  setCurrentMember: ReturnType<typeof vi.fn>;
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
    onboarded: false,
    setCurrentMember: vi.fn(async () => {}),
    refreshOnboarded: async () => {},
  };
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(async () => {
  mockState = blankState();
  mockMemberCount = 0;
  // The minting tests below write through the REAL Dexie layer
  // (fake-indexeddb) — start each test from a clean store.
  await Promise.all([
    db.members.clear(),
    db.secretKeys.clear(),
    db.settings.clear(),
  ]);
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  // The install-skip test below installs a matchMedia stub so
  // currentInstallEnvironment() reports "installed". jsdom has none by
  // default, so other tests rely on its absence (→ not installed, the
  // install step present). Remove the stub so it can't leak across tests.
  delete (window as { matchMedia?: unknown }).matchMedia;
});

// jsdom has no matchMedia. Stub one that answers `matches` for the
// standalone display-mode query so currentInstallEnvironment() resolves
// to { kind: "installed" } and the install step auto-skips. Mirrors the
// stub pattern in InstallGuide.test.tsx / Conversation.test.tsx.
function stubStandaloneMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("display-mode: standalone"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// `initialEntries` lets the onboarded-guard tests below mount the page
// at `/welcome?revisit=1` — the guard reads the query string.
function render(node: ReactNode, initialEntries: string[] = ["/welcome"]) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={initialEntries}>{node}</MemoryRouter>,
    );
  });
}

// Records the router's current path+search so tests can assert on
// navigate() calls (the fork's bring-identity card). Rendered as a
// sibling of the page inside the same MemoryRouter.
let lastLocation = "";
function LocationProbe() {
  const location = useLocation();
  lastLocation = location.pathname + location.search;
  return null;
}

// Concept screens (5) render, then the optional install step, then
// profileSetup. In jsdom there's no `matchMedia`, so
// currentInstallEnvironment() is NOT "installed" and the install step
// is PRESENT — so reaching profileSetup takes SIX "Next" taps (5
// concept + 1 install), not five. The button label for every step up to
// profileSetup is "Next" (welcome.next); only profileSetup's primary
// button reads "Open the board" (welcome.start).
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
    clickNextNTimes(6);
    // The profileSetup step's title is "A little about you".
    expect(container.textContent).toContain("A little about you");
    expect(container.textContent).not.toContain("Understoria is invite-only");
  });

  it("inviteOnly:false + members populated → profileSetup renders (open mode)", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 3;
    render(<WelcomePage />);
    clickNextNTimes(6);
    expect(container.textContent).toContain("A little about you");
    expect(container.textContent).not.toContain("Understoria is invite-only");
  });

  it("inviteOnly:true + members empty → profileSetup renders (bootstrap exception)", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: true };
    mockMemberCount = 0;
    render(<WelcomePage />);
    clickNextNTimes(6);
    // The first member on a fresh node can still onboard.
    expect(container.textContent).toContain("A little about you");
    expect(container.textContent).not.toContain("Understoria is invite-only");
  });

  it("inviteOnly:true + members populated → InviteOnlyLanding replaces profileSetup", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: true };
    mockMemberCount = 2;
    render(<WelcomePage />);
    clickNextNTimes(6);
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
    clickNextNTimes(6);
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

describe("WelcomePage — onboarded guard vs. deliberate revisit", () => {
  // The page is rendered directly here (no <Route>), so the guard's
  // navigate() can't unmount it — assert the redirect through the
  // router's location instead of through content absence.
  it("onboarded device on plain /welcome → redirected to the board", () => {
    mockState.onboarded = true;
    lastLocation = "";
    render(
      <>
        <WelcomePage />
        <LocationProbe />
      </>,
      ["/welcome"],
    );
    expect(lastLocation).toBe("/");
  });

  it("onboarded device on /welcome?revisit=1 → the tour shows, no redirect", () => {
    mockState.onboarded = true;
    lastLocation = "";
    render(
      <>
        <WelcomePage />
        <LocationProbe />
      </>,
      ["/welcome?revisit=1"],
    );
    expect(lastLocation).toBe("/welcome?revisit=1");
    expect(container.textContent).toContain("This is a timebank");
  });
});

// React's controlled inputs ignore direct `.value =` writes; go through
// the native setter + input event, matching EventNew.validation.test.tsx.
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

async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
}

function nameInput(): HTMLInputElement {
  // The display-name field is the first input of the profileSetup form.
  return container.querySelector("input") as HTMLInputElement;
}

async function clickFinish() {
  const finishBtn = container.querySelector(
    "button.btn-primary",
  ) as HTMLButtonElement;
  await act(async () => {
    finishBtn.click();
  });
  await flush();
}

describe("WelcomePage — identity minting at profileSetup", () => {
  it("open node, no member: finishing with a typed name mints a real Ed25519 identity", async () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    clickNextNTimes(6);
    setInput(nameInput(), "Mara");
    await clickFinish();

    const members = await db.members.toArray();
    expect(members.length).toBe(1);
    expect(members[0].displayName).toBe("Mara");
    expect(members[0].nodeId).toBe("node-local");
    // A REAL keypair backs the identity — the secret key is stored
    // locally, exactly like redeemInvite / the dev seed do it.
    const secret = await db.secretKeys.get(members[0].publicKey);
    expect(secret?.secretKey).toBeTruthy();
    expect(mockState.setCurrentMember).toHaveBeenCalledWith(
      members[0].publicKey,
    );
    expect(await getSetting(SETTING_KEYS.onboarded)).toBe("1");
  });

  it("finishing without a name shows the required error and does NOT onboard", async () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    clickNextNTimes(6);
    await clickFinish();

    expect(container.textContent).toContain(
      "Pick a display name or pseudonym to continue.",
    );
    expect(await db.members.count()).toBe(0);
    expect(mockState.setCurrentMember).not.toHaveBeenCalled();
    // "Onboarded" must never be true without an identity behind it.
    expect(await getSetting(SETTING_KEYS.onboarded)).toBeUndefined();
  });

  it("invite-only bootstrap: the FIRST device on an empty node mints through profileSetup", async () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: true };
    mockMemberCount = 0;
    render(<WelcomePage />);
    clickNextNTimes(6);
    expect(container.textContent).toContain("A little about you");
    setInput(nameInput(), "Founding Operator");
    await clickFinish();

    const members = await db.members.toArray();
    expect(members.length).toBe(1);
    expect(members[0].displayName).toBe("Founding Operator");
    expect(await db.secretKeys.get(members[0].publicKey)).toBeTruthy();
    expect(await getSetting(SETTING_KEYS.onboarded)).toBe("1");
  });

  it("existing member: name prefills and finish UPDATES the profile, never a second identity", async () => {
    // The invite hand-off: a member minted at InviteAccept walks the
    // concept screens (R2) and lands here with their chosen name.
    const invited = await createMember({ displayName: "Nadia" }, "node-local");
    mockState.currentMember = invited;
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 1;
    render(<WelcomePage />);
    clickNextNTimes(6);
    // Greeted by the name chosen at the invite; field prefilled.
    expect(container.textContent).toContain("Good to see you, Nadia");
    expect(nameInput().value).toBe("Nadia");
    setInput(nameInput(), "Nadia R.");
    await clickFinish();

    const members = await db.members.toArray();
    expect(members.length).toBe(1);
    expect(members[0].publicKey).toBe(invited.publicKey);
    expect(members[0].displayName).toBe("Nadia R.");
    // No re-mint: the current member key never changes.
    expect(mockState.setCurrentMember).not.toHaveBeenCalled();
    expect(await getSetting(SETTING_KEYS.onboarded)).toBe("1");
  });

  it("hydrates the prefill when the member resolves AFTER mount (hard page load)", async () => {
    // /welcome renders outside Layout's `ready` gate, so a hard page
    // load can mount the page before AppContext has resolved the
    // current member. The late-hydration effect must still prefill.
    mockState.currentMember = null;
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 1;
    render(<WelcomePage />);
    // Member arrives after the first render…
    mockState.currentMember = await createMember(
      { displayName: "Late Larry" },
      "node-local",
    );
    // …and any subsequent re-render (stepping through the tour)
    // triggers the hydration effect.
    clickNextNTimes(6);
    expect(container.textContent).toContain("A little about you");
    expect(nameInput().value).toBe("Late Larry");
  });

  it("invited member on an invite-only node reaches profileSetup (no dead-end landing)", async () => {
    const invited = await createMember({ displayName: "Nadia" }, "node-local");
    mockState.currentMember = invited;
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: true };
    mockMemberCount = 3;
    render(<WelcomePage />);
    clickNextNTimes(6);
    // The gate stops strangers from MINTING on an invite-only node;
    // a member who already holds an identity is only updating it.
    expect(container.textContent).toContain("A little about you");
    expect(container.textContent).not.toContain("Understoria is invite-only");
  });
});

function clickSkip() {
  const skip = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent === "Skip",
  );
  if (!skip) throw new Error("No Skip button on this step");
  act(() => {
    skip.click();
  });
}

describe("WelcomePage — Skip lands on profile setup, not the board", () => {
  it("Skip from the first concept screen jumps to profileSetup and does NOT onboard", async () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    expect(container.textContent).toContain("This is a timebank");
    clickSkip();
    // The tour is skippable; identity creation is not — Skip lands on
    // the profileSetup step instead of finishing outright.
    expect(container.textContent).toContain("A little about you");
    expect(await getSetting(SETTING_KEYS.onboarded)).toBeUndefined();
    // And the name is still required to actually finish.
    await clickFinish();
    expect(container.textContent).toContain(
      "Pick a display name or pseudonym to continue.",
    );
    expect(await getSetting(SETTING_KEYS.onboarded)).toBeUndefined();
  });

  it("Skip from the install step also jumps to profileSetup", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    clickNextNTimes(5);
    expect(container.textContent).toContain("Optional, but handy");
    clickSkip();
    expect(container.textContent).toContain("A little about you");
  });

  it("profileSetup itself offers no Skip affordance", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    clickNextNTimes(6);
    expect(container.textContent).toContain("A little about you");
    const skip = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Skip",
    );
    expect(skip).toBeUndefined();
    // Back still works — nobody is trapped on the step.
    const back = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Back"),
    );
    expect(back).toBeDefined();
  });
});

describe("WelcomePage — optional install step", () => {
  it("renders the install step after the concept screens, and Next → profileSetup", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    // Five concept Nexts land on the install step (jsdom has no
    // matchMedia → not installed → the step is present).
    clickNextNTimes(5);
    expect(container.textContent).toContain("Add Understoria to your phone");
    // The step's own intro copy distinguishes it from the panel heading.
    expect(container.textContent).toContain("Optional, but handy");
    // It is NOT the finishing step — profileSetup follows.
    expect(container.textContent).not.toContain("A little about you");
    // One more Next advances to profileSetup.
    clickNextNTimes(1);
    expect(container.textContent).toContain("A little about you");
    expect(container.textContent).not.toContain("Optional, but handy");
  });

  it("skips the install step entirely when the app is already installed", () => {
    // Report standalone so currentInstallEnvironment() → installed; the
    // install step is filtered out of the visible tour (and the
    // installed-arrival fork is prepended — see the describe below).
    stubStandaloneMatchMedia();
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    // Step 0 is the installed-arrival fork — it has no Next button;
    // the "I'm new" card advances into the concept tour.
    clickNewHereCard();
    // Then 5 concept Nexts reach profileSetup (no install step between).
    clickNextNTimes(5);
    expect(container.textContent).toContain("A little about you");
    // The install step never appeared along the way.
    expect(container.textContent).not.toContain("Add Understoria to your phone");
    expect(container.textContent).not.toContain("Optional, but handy");
  });
});

// The fork's "I'm new" card. Card buttons are not btn-primary on
// purpose (neither choice is "the default"), so clickNextNTimes can't
// reach them.
function clickNewHereCard() {
  const card = Array.from(container.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("I'm new — set me up fresh"),
  );
  if (!card) throw new Error("No 'I'm new' card on the fork screen");
  act(() => {
    card.click();
  });
}

describe("WelcomePage — installed-arrival fork", () => {
  it("running installed → first screen is the fork with both cards and no Next/Skip", () => {
    stubStandaloneMatchMedia();
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    expect(container.textContent).toContain("The app is on your home screen");
    expect(container.textContent).toContain(
      "I already use Understoria in this phone's browser",
    );
    expect(container.textContent).toContain("I'm new — set me up fresh");
    // The two cards ARE the navigation: no Next, no Skip.
    expect(container.querySelector("button.btn-primary")).toBeNull();
    const skip = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Skip",
    );
    expect(skip).toBeUndefined();
  });

  it("'I'm new' advances into the concept tour; Back returns to the fork", () => {
    stubStandaloneMatchMedia();
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    clickNewHereCard();
    expect(container.textContent).toContain("This is a timebank");
    const back = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Back"),
    );
    expect(back).toBeDefined();
    act(() => {
      back!.click();
    });
    expect(container.textContent).toContain("The app is on your home screen");
  });

  it("'bring my identity' navigates to /pair-device?samePhone=1", () => {
    stubStandaloneMatchMedia();
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(
      <>
        <WelcomePage />
        <LocationProbe />
      </>,
    );
    const card = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes(
        "I already use Understoria in this phone's browser",
      ),
    );
    expect(card).toBeDefined();
    act(() => {
      card!.click();
    });
    expect(lastLocation).toBe("/pair-device?samePhone=1");
  });

  it("browser (not installed) → no fork; the tour starts at the first concept screen", () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    expect(container.textContent).toContain("This is a timebank");
    expect(container.textContent).not.toContain(
      "The app is on your home screen",
    );
  });
});

describe("WelcomePage — beta/AI disclosure on the first screen", () => {
  // The card reads its dismissed flag from the settings table before
  // rendering (render-nothing-until-known), so presence assertions
  // need the microtask/timer queue drained first.
  async function flushNotice() {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
      await new Promise((r) => setTimeout(r, 0));
    });
  }

  it("the first concept screen carries the notice; later screens don't repeat it", async () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    await flushNotice();
    // Step 0 — where a brand-new person starts reading.
    expect(container.textContent).toContain("Please know what you're using");
    expect(container.textContent).toContain("written with AI tools");
    // The disclosure is a doorstep card, not a nag: step 1 is clean.
    clickNextNTimes(1);
    expect(container.textContent).not.toContain(
      "Please know what you're using",
    );
  });

  it("'Got it' dismisses the notice permanently on this device", async () => {
    mockState.nodeConfig = { ...DEFAULT_NODE_CONFIG, inviteOnly: false };
    mockMemberCount = 0;
    render(<WelcomePage />);
    await flushNotice();
    const gotIt = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Got it",
    );
    expect(gotIt).toBeDefined();
    act(() => {
      gotIt!.click();
    });
    await flushNotice();
    expect(container.textContent).not.toContain(
      "Please know what you're using",
    );
    // Permanent: a fresh mount reads the flag and stays clean.
    act(() => {
      root.unmount();
    });
    render(<WelcomePage />);
    await flushNotice();
    expect(container.textContent).toContain("This is a timebank");
    expect(container.textContent).not.toContain(
      "Please know what you're using",
    );
  });
});
