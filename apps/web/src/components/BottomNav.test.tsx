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
import { MemoryRouter } from "react-router";
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
    // A MATCHED pair, not a physical leftover: the rail sits at the
    // reading start, so it clears the LEFT device inset in LTR and the
    // RIGHT one in RTL (docs/rtl-plan.md R2). env() names a physical
    // edge, so this is the one place a logical property can't answer.
    expect(nav.className).toContain(
      "landscape-short:ltr:pl-[env(safe-area-inset-left)]",
    );
    expect(nav.className).toContain(
      "landscape-short:rtl:pr-[env(safe-area-inset-right)]",
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
      "landscape-short:ltr:w-[calc(3.5rem+env(safe-area-inset-left))]",
    );
    // …and by the mirrored inset when the rail moves to the other
    // edge, or an Arabic-speaking member gets the clipped strip back.
    expect(nav.className).toContain(
      "landscape-short:rtl:w-[calc(3.5rem+env(safe-area-inset-right))]",
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

// Roving arrow navigation, and the direction it roves in. An arrow key
// carries a PHYSICAL meaning, so unlike everything else in the RTL
// program CSS can't resolve it: in a right-to-left layout the item to
// the member's right is the one BEFORE them, and ArrowRight has to go
// back (WAI-ARIA authoring practices for menubars; docs/rtl-plan.md
// R2). Up/Down never mirror — the rail is vertical at lg+ and reads
// top-down in every language.
describe("BottomNav — arrow navigation follows the reading direction", () => {
  function links(): HTMLAnchorElement[] {
    return Array.from(container.querySelectorAll<HTMLAnchorElement>("ul a"));
  }

  function press(el: HTMLElement, key: string) {
    act(() => {
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
      );
    });
  }

  afterEach(() => {
    document.documentElement.removeAttribute("dir");
  });

  it("LTR: ArrowRight advances, ArrowLeft goes back", () => {
    document.documentElement.dir = "ltr";
    render();
    const [board, dashboard] = links();
    board.focus();
    press(board, "ArrowRight");
    expect(document.activeElement).toBe(dashboard);
    press(dashboard, "ArrowLeft");
    expect(document.activeElement).toBe(board);
  });

  it("RTL: ArrowRight goes back, ArrowLeft advances", () => {
    document.documentElement.dir = "rtl";
    render();
    const [board, dashboard] = links();
    board.focus();
    press(board, "ArrowLeft");
    expect(document.activeElement).toBe(dashboard);
    press(dashboard, "ArrowRight");
    expect(document.activeElement).toBe(board);
  });

  it("wraps around in whichever direction is forward", () => {
    document.documentElement.dir = "rtl";
    render();
    const all = links();
    const last = all[all.length - 1];
    last.focus();
    press(last, "ArrowLeft"); // forward under RTL
    expect(document.activeElement).toBe(all[0]);
  });

  it("Up/Down and Home/End do not mirror", () => {
    document.documentElement.dir = "rtl";
    render();
    const all = links();
    all[0].focus();
    press(all[0], "ArrowDown");
    expect(document.activeElement).toBe(all[1]);
    press(all[1], "End");
    expect(document.activeElement).toBe(all[all.length - 1]);
    press(all[all.length - 1], "Home");
    expect(document.activeElement).toBe(all[0]);
  });
});
