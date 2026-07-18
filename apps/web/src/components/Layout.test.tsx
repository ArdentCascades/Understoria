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
// Shell geometry, class-presence only: jsdom applies no media queries,
// so these tests lock that the wrapper CARRIES the regime classes —
// portrait bottom bar (flex-col), lg desktop rail and landscape-short
// phone rail (both flex-row-reverse) — not how they compute.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({
  useApp: () => ({ ready: true, lockState: "unlocked" }),
}));
const onlineRef = { value: true };
vi.mock("@/lib/useOnlineStatus", () => ({
  useOnlineStatus: () => onlineRef.value,
}));
// The shell's children each carry their own dependency trees (Dexie,
// toasts, service worker); stub them — this suite is about the shell's
// own geometry classes, nothing inside the children.
vi.mock("./AppHeader", () => ({ AppHeader: () => <div /> }));
vi.mock("./BottomNav", () => ({ BottomNav: () => <div /> }));
vi.mock("./CommandPalette", () => ({ CommandPalette: () => null }));
vi.mock("./ToastContainer", () => ({ ToastContainer: () => null }));
vi.mock("./UpdatePrompt", () => ({ UpdatePrompt: () => null }));
vi.mock("./OfflineBanner", () => ({ OfflineBanner: () => null }));
vi.mock("./LockScreen", () => ({ LockScreen: () => null }));
vi.mock("./DemoBanner", () => ({ DemoBanner: () => null }));

import "@/i18n";
import { Layout } from "./Layout";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  onlineRef.value = true;
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
        <Layout />
      </MemoryRouter>,
    );
  });
}

function bodyWrapper(): HTMLElement {
  const main = container.querySelector("main");
  expect(main).not.toBeNull();
  return main!.parentElement as HTMLElement;
}

describe("Layout shell geometry", () => {
  it("the body wrapper flips to a reversed row at lg AND landscape-short", () => {
    render();
    const cls = bodyWrapper().className;
    expect(cls).toContain("flex-col");
    expect(cls).toContain("lg:flex-row-reverse");
    expect(cls).toContain("landscape-short:flex-row-reverse");
  });

  it("main's pad drops the bottom-bar reserve in landscape-short (online)", () => {
    render();
    const pad = container.querySelector("main > div")!.className;
    expect(pad).toContain("pb-[calc(5rem+env(safe-area-inset-bottom))]");
    expect(pad).toContain(
      "landscape-short:pb-[calc(1rem+env(safe-area-inset-bottom))]",
    );
  });

  it("the taller offline reserve also has a landscape-short variant", () => {
    onlineRef.value = false;
    render();
    const pad = container.querySelector("main > div")!.className;
    expect(pad).toContain("pb-[calc(9.5rem+env(safe-area-inset-bottom))]");
    expect(pad).toContain(
      "landscape-short:pb-[calc(5.5rem+env(safe-area-inset-bottom))]",
    );
  });
});
