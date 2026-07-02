/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@/i18n";
import { CanopyMilestones } from "./CanopyMilestones";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root?.unmount());
  container.remove();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(node);
  });
}

describe("CanopyMilestones — next-leaf label", () => {
  it("names the next unreached leaf in its accessible name and a quiet caption", () => {
    render(
      <CanopyMilestones
        totalHours={12}
        totalExchanges={0}
        totalMembers={0}
        newlyReachedLabels={new Set()}
      />,
    );
    // Hours row: 10 reached, 50 is next.
    const nextLeaf = container.querySelector(
      'svg[aria-label="next: 50 hours of mutual aid"]',
    );
    expect(nextLeaf).not.toBeNull();
    // Visible quiet caption carries the same label.
    expect(container.textContent).toContain("next: 50 hours of mutual aid");
    // Reached leaf keeps its plain label — no "next:" prefix.
    expect(
      container.querySelector('svg[aria-label="10 hours of mutual aid"]'),
    ).not.toBeNull();
    // No quantified gap anywhere ("N hours to go" framing is banned).
    expect(container.textContent).not.toMatch(/to go/i);
  });

  it("labels each row's own next milestone", () => {
    render(
      <CanopyMilestones
        totalHours={0}
        totalExchanges={55}
        totalMembers={30}
        newlyReachedLabels={new Set()}
      />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("next: 10 hours of mutual aid");
    expect(text).toContain("next: 100 exchanges completed");
    expect(text).toContain("next: 50 members strong");
  });
});
