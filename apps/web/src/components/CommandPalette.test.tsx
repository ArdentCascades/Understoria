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
// The command palette's interaction contract. Locks:
//   1. Closed by default; Ctrl+K opens; Escape closes.
//   2. Ctrl+K fires EVEN while typing in a field (the chord
//      exception — contrast the bare-`/` shortcut) .
//   3. Typing filters; Enter on the active option navigates (probed
//      via a location spy route) and closes; query resets.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Post } from "@/types";

const mockState = {
  posts: [
    { id: "p1", title: "Childcare Friday night", type: "NEED" } as Post,
  ],
  projects: [],
  events: [],
  members: [],
  proposals: [],
};
vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));

import "@/i18n";
import { CommandPalette } from "./CommandPalette";

let container: HTMLDivElement;
let root: Root;
let lastPath = "";

function LocationProbe() {
  const loc = useLocation();
  lastPath = loc.pathname;
  return null;
}

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  lastPath = "";
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <LocationProbe />
        <Routes>
          <Route path="*" element={<CommandPalette />} />
        </Routes>
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function pressCtrlK(target: EventTarget = document.body) {
  act(() => {
    (target as HTMLElement).dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
}

function paletteInput(): HTMLInputElement {
  const el = container.querySelector('[role="combobox"]');
  if (!el) throw new Error("palette input not found");
  return el as HTMLInputElement;
}

function setInputValue(value: string) {
  const input = paletteInput();
  // React tracks the last value it set; assigning via the NATIVE
  // setter first makes the subsequent input event register as a
  // real change (the standard React-18 test workaround).
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function pressOnInput(key: string) {
  act(() => {
    paletteInput().dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
  });
}

describe("CommandPalette", () => {
  it("is closed by default and opens on Ctrl+K", () => {
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    pressCtrlK();
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    // Launcher state: route options are listed for the empty query.
    expect(
      container.querySelectorAll('[role="option"]').length,
    ).toBeGreaterThan(3);
  });

  it("opens on Ctrl+K even while typing in a field", () => {
    const field = document.createElement("input");
    document.body.appendChild(field);
    field.focus();
    pressCtrlK(field);
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    field.remove();
  });

  it("Escape closes and resets the query", () => {
    pressCtrlK();
    setInputValue("child");
    pressOnInput("Escape");
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    pressCtrlK();
    expect(paletteInput().value).toBe("");
  });

  it("typing filters to local records and Enter navigates", () => {
    pressCtrlK();
    setInputValue("childcare");
    const options = Array.from(container.querySelectorAll('[role="option"]'));
    expect(options.some((o) => o.textContent?.includes("Childcare Friday"))).toBe(
      true,
    );
    pressOnInput("Enter");
    expect(lastPath).toBe("/post/p1");
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});
