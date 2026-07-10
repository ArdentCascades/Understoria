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
// five links everywhere. The second test locks that removal.
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

  it("carries NO Settings slot — Settings lives in the me-menu now", () => {
    render();
    expect(container.querySelector('a[href="/settings"]')).toBeNull();
  });
});
