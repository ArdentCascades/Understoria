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
//
// Pending-author link gate (operator safety ruling): links in content
// authored by a NOT-yet-vouched member render as non-tappable plain
// text — the REAL href always visible, an explanation one tap away —
// on every viewer's device. No authorKey, a trusted author, or no
// trust data at all keeps links byte-identical to before the gate.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));

import "@/i18n";
import { Markdown } from "./Markdown";
import type { SignedVouch } from "@/lib/vouch";

const FOUNDER_A = "founder-a-key";
const FOUNDER_B = "founder-b-key";
const PENDING_AUTHOR = "pending-author-key";
const TRUSTED_AUTHOR = "trusted-author-key";

// Trust edges via redeemed invites — the implicit-vouch path needs no
// signature machinery, and the fixpoint counts it exactly like a vouch.
function invite(inviterKey: string, redeemedBy: string) {
  return { status: "redeemed" as const, inviterKey, redeemedBy };
}

let mockState: {
  vouches: SignedVouch[];
  invites: ReturnType<typeof invite>[];
  founderRoots: ReadonlySet<string>;
};

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  // Default community: two founders; TRUSTED_AUTHOR was invited by
  // both (2 distinct trusted vouchers), PENDING_AUTHOR has no edges.
  mockState = {
    vouches: [],
    invites: [
      invite(FOUNDER_A, TRUSTED_AUTHOR),
      invite(FOUNDER_B, TRUSTED_AUTHOR),
    ],
    founderRoots: new Set([FOUNDER_A, FOUNDER_B]),
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

function render(props: Parameters<typeof Markdown>[0]) {
  act(() => {
    root = createRoot(container);
    root.render(<Markdown {...props} />);
  });
}

function whyButton(): HTMLButtonElement | null {
  return container.querySelector(
    'button[aria-label="Why isn\'t this link tappable?"]',
  );
}

describe("Markdown — pending-author link gate", () => {
  it("pending author: no <a> anywhere, href visible as text, why-affordance present", () => {
    render({
      text: "see https://example.com/place",
      authorKey: PENDING_AUTHOR,
    });
    expect(container.querySelector("a")).toBeNull();
    // The real destination stays readable.
    expect(container.textContent).toContain("https://example.com/place");
    const btn = whyButton();
    expect(btn).not.toBeNull();

    // Tapping the affordance reveals the no-shame explanation.
    act(() => {
      btn!.click();
    });
    const note = container.querySelector('[role="note"]');
    expect(note).not.toBeNull();
    expect(note!.textContent).toContain(
      "Links become tappable once the community has vouched",
    );
  });

  it("pending author, label ≠ href: the REAL href is shown, never the label alone", () => {
    render({
      text: "[totally-safe-site](https://evil.example/steal)",
      authorKey: PENDING_AUTHOR,
    });
    expect(container.querySelector("a")).toBeNull();
    // Label survives as context, but the destination cannot hide.
    expect(container.textContent).toContain("totally-safe-site");
    expect(container.textContent).toContain("https://evil.example/steal");
  });

  it("trusted author: a normal <a> with the exact href", () => {
    render({
      text: "[site](https://example.com/ok)",
      authorKey: TRUSTED_AUTHOR,
    });
    const a = container.querySelector("a");
    expect(a).not.toBeNull();
    expect(a!.getAttribute("href")).toBe("https://example.com/ok");
    expect(a!.getAttribute("rel")).toContain("noopener");
    expect(whyButton()).toBeNull();
  });

  it("no authorKey: clickable — the MarkdownHint / static-copy contract", () => {
    render({ text: "[docs](https://example.com/docs)" });
    expect(container.querySelector("a")).not.toBeNull();
    expect(whyButton()).toBeNull();
  });

  it("flat fallback (no founder capture) with enough vouchers: clickable", () => {
    // No founderRoots → the rooted fixpoint has no anchor; the flat
    // distinct-voucher count applies, and two redeemed invites from
    // distinct inviters clear MINIMUM_VOUCHES_FOR_TRUST.
    mockState.founderRoots = new Set();
    mockState.invites = [
      invite("inviter-one", PENDING_AUTHOR),
      invite("inviter-two", PENDING_AUTHOR),
    ];
    render({
      text: "https://example.com/flat",
      authorKey: PENDING_AUTHOR,
    });
    expect(container.querySelector("a")).not.toBeNull();
    expect(whyButton()).toBeNull();
  });
});
