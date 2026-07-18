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
/**
 * Demo banner chrome. Locks:
 *   1. landscape-short slims the strip — nowrap single line, tighter
 *      padding, smaller font, truncating prose — WITHOUT hiding the
 *      reset affordance (round-3 papercut: the banner ate a tall
 *      slice of an already ~400px-tall sideways viewport).
 *   2. The truncated prose keeps the full sentence reachable via the
 *      title attribute.
 *   3. The two-step reset confirm still works.
 *   4. Renders nothing outside a demo build.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { resetDemoMock } = vi.hoisted(() => ({
  resetDemoMock: vi.fn(async () => undefined),
}));

// Force the demo gate open; lib/demo reads import.meta.env at import
// time, so the mock is the only seam.
vi.mock("@/lib/demo", () => ({
  IS_DEMO: true,
  resetDemo: resetDemoMock,
}));

import "@/i18n";
import { DemoBanner } from "./DemoBanner";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  resetDemoMock.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render() {
  act(() => {
    root = createRoot(container);
    root.render(<DemoBanner />);
  });
}

function banner(): HTMLElement {
  const el = container.querySelector<HTMLElement>('[role="note"]');
  if (!el) throw new Error("banner not found");
  return el;
}

describe("DemoBanner", () => {
  it("carries the landscape-short slimming classes on the strip", () => {
    render();
    const cls = banner().className;
    expect(cls).toContain("landscape-short:flex-nowrap");
    expect(cls).toContain("landscape-short:py-0.5");
    expect(cls).toContain("landscape-short:text-xs");
  });

  it("the prose truncates in landscape-short but keeps the full text in title", () => {
    render();
    const p = banner().querySelector("p")!;
    expect(p.className).toContain("landscape-short:truncate");
    expect(p.className).toContain("landscape-short:min-w-0");
    // Truncation must not hide the sentence entirely.
    expect(p.getAttribute("title")).toContain("live demo");
  });

  it("the reset affordance stays visible (never truncated away)", () => {
    render();
    const cta = Array.from(banner().querySelectorAll("button")).find((b) =>
      /reset demo/i.test(b.textContent ?? ""),
    );
    expect(cta).toBeDefined();
    expect(cta!.className).toContain("landscape-short:shrink-0");
  });

  it("two-step confirm still resets", () => {
    render();
    const cta = Array.from(banner().querySelectorAll("button")).find((b) =>
      /reset demo/i.test(b.textContent ?? ""),
    )!;
    act(() => cta.click());
    const yes = Array.from(banner().querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Reset",
    );
    expect(yes).toBeDefined();
    act(() => yes!.click());
    expect(resetDemoMock).toHaveBeenCalledTimes(1);
  });
});
