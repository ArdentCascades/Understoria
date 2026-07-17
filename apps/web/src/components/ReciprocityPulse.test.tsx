/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import "@/i18n";
import { ReciprocityPulse } from "./ReciprocityPulse";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const roots: Root[] = [];
const containers: HTMLDivElement[] = [];

afterEach(() => {
  act(() => roots.splice(0).forEach((r) => r.unmount()));
  containers.splice(0).forEach((c) => c.remove());
});

function render(node: ReactNode): HTMLDivElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  containers.push(container);
  act(() => {
    const root = createRoot(container);
    roots.push(root);
    root.render(node);
  });
  return container;
}

// Three states, not two: a young community with real one-way help used
// to see "0% — 0 of 9 pairs" under its exchange totals, which a
// skimming reader took for a broken counter (usability report).
describe("ReciprocityPulse", () => {
  it("says help is flowing one way — with no percent — when pairs exist but none flow both ways", () => {
    const c = render(<ReciprocityPulse reciprocalPairs={0} totalPairs={9} />);
    expect(c.textContent).toContain(
      "Help is flowing one way so far — 9 connections started.",
    );
    expect(c.textContent).not.toContain("%");
    // Title and footnote stay.
    expect(c.textContent).toContain("Reciprocity");
    expect(c.textContent).toContain("Not a score.");
  });

  it("singularizes a lone one-way connection", () => {
    const c = render(<ReciprocityPulse reciprocalPairs={0} totalPairs={1} />);
    expect(c.textContent).toContain("1 connection started");
  });

  it("speaks in plain both-ways words (not pairs) once reciprocity exists", () => {
    const c = render(<ReciprocityPulse reciprocalPairs={1} totalPairs={9} />);
    expect(c.textContent).toContain("11%");
    expect(c.textContent).toContain("1 of 9 connections flow both ways");
    expect(c.textContent).not.toContain("pairs");
  });

  it("keeps the true empty state when there are no pairs at all", () => {
    const c = render(<ReciprocityPulse reciprocalPairs={0} totalPairs={0} />);
    expect(c.textContent).toContain("First exchange ahead");
    expect(c.textContent).not.toContain("%");
  });
});
