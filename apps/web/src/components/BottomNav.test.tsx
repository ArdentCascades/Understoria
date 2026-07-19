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
// The nav is exactly the five primary items on every platform — the
// old desktop-only pinned Settings slot moved into the global
// me-menu (AppHeader), so the rail and the tab bar are now the same
// five links everywhere. The fifth slot is "My work" (the combined
// tasks + projects surface); Profile moved into the me-menu as the
// member's identity row. The later tests lock both removals.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The nav unmounts entirely while the virtual keyboard is up; keep it
// mounted for the test.
vi.mock("@/lib/useVirtualKeyboard", () => ({
  useVirtualKeyboardOpen: () => false,
}));

import "@/i18n";
import { BottomNav } from "./BottomNav";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>,
    );
  });
}

describe("BottomNav", () => {
  it("keeps the primary list at exactly the five phone-nav items", () => {
    render();
    const items = container.querySelectorAll("ul > li");
    expect(items.length).toBe(5);
    const hrefs = [...items].map((li) =>
      li.querySelector("a")?.getAttribute("href"),
    );
    expect(hrefs).toEqual([
      "/",
      "/dashboard",
      "/calendar",
      "/messages",
      "/my-work",
    ]);
  });

  it("carries NO Settings slot — Settings lives in the me-menu now", () => {
    render();
    expect(container.querySelector('a[href="/settings"]')).toBeNull();
  });

  it("carries NO Profile slot — Profile lives in the me-menu now", () => {
    render();
    expect(container.querySelector('a[href="/profile"]')).toBeNull();
  });

  // jsdom applies no media queries — class presence only. The
  // landscape-short variant (tailwind.config.js) turns the bottom bar
  // into a compact icons-only left rail on a phone held sideways.
  it("carries the landscape-short compact-rail classes", () => {
    render();
    const nav = container.querySelector("nav")!;
    expect(nav.className).toContain("landscape-short:flex-col");
    expect(nav.className).toContain("landscape-short:overflow-y-auto");
    expect(nav.className).toContain(
      "landscape-short:pl-[env(safe-area-inset-left)]",
    );
  });

  // Installed-PWA landscape regression (field report: "no navigation
  // on the home-screen app held sideways"). The rail pads left for the
  // notch (env(safe-area-inset-left) ≈ 47–59px, viewport-fit=cover) —
  // if its width is FIXED, border-box lets that padding eat the whole
  // content box and every icon gets clipped by the rail's own
  // overflow, leaving a blank strip. The width must GROW by the same
  // inset the padding consumes, keeping 3.5rem of content: mirror of
  // the portrait bar's pb-[env(safe-area-inset-bottom)] on an
  // auto-height bar.
  it("landscape rail width grows by the notch inset instead of being eaten by it", () => {
    render();
    const nav = container.querySelector("nav")!;
    expect(nav.className).toContain(
      "landscape-short:w-[calc(3.5rem+env(safe-area-inset-left))]",
    );
    // The fixed-width form must not return alongside the padding.
    expect(nav.className).not.toContain("landscape-short:w-14");
  });

  it("hides labels in landscape-short but keeps each link's accessible name", () => {
    render();
    const links = Array.from(container.querySelectorAll("ul a"));
    expect(links.length).toBe(5);
    for (const a of links) {
      // The label span goes display:none in the icons-only rail…
      const span = a.querySelector("span");
      expect(span?.className).toContain("landscape-short:hidden");
      // …so the accessible name must survive via aria-label, which
      // duplicates the visible label text exactly (label-in-name).
      const ariaLabel = a.getAttribute("aria-label") ?? "";
      expect(ariaLabel).not.toBe("");
      expect(ariaLabel).toBe(span?.textContent);
    }
  });
});
