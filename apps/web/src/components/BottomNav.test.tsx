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
// The nav rail's tiering. Settings is a DESKTOP-ONLY utility slot
// (paper over the "more room in the sidebar" question): it must
//   1. never join the mobile tab bar — the primary row stays exactly
//      the five items the phone-width ceiling was designed around;
//   2. be `hidden lg:flex`, so it appears only on the desktop rail;
//   3. sit OUTSIDE the primary <ul> (a plain Tab stop, not part of
//      the five-item arrow-key menubar);
//   4. link to /settings.
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
      "/profile",
    ]);
  });

  it("adds Settings as a desktop-only slot OUTSIDE the primary list", () => {
    render();
    const settings = container.querySelector('a[href="/settings"]')!;
    expect(settings).not.toBeNull();
    // Not inside the arrow-key <ul>.
    expect(settings.closest("ul")).toBeNull();
    // Desktop-only + pinned to the base.
    expect(settings.className).toContain("hidden");
    expect(settings.className).toContain("lg:flex");
    expect(settings.className).toContain("lg:mt-auto");
  });
});
