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
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OverflowMenu, type OverflowMenuItem } from "./OverflowMenu";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(props: Parameters<typeof OverflowMenu>[0]) {
  act(() => {
    root = createRoot(container);
    root.render(<OverflowMenu {...props} />);
  });
}

function trigger(): HTMLButtonElement | null {
  return container.querySelector('button[aria-haspopup="menu"]');
}

function menuItems(): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button[role="menuitem"]'));
}

describe("OverflowMenu", () => {
  it("trigger exposes aria-haspopup=menu and aria-label; aria-expanded flips on open/close", () => {
    render({
      label: "More actions",
      items: [{ key: "a", label: "Alpha", onSelect: () => {} }],
    });
    const btn = trigger();
    expect(btn).not.toBeNull();
    expect(btn!.getAttribute("aria-haspopup")).toBe("menu");
    expect(btn!.getAttribute("aria-label")).toBe("More actions");
    expect(btn!.getAttribute("aria-expanded")).toBe("false");
    // Open → expanded true; the glyph is the vertical kebab ⋮.
    act(() => btn!.click());
    expect(btn!.getAttribute("aria-expanded")).toBe("true");
    expect(btn!.textContent).toContain("⋮");
    // Toggle closed → expanded false again.
    act(() => btn!.click());
    expect(btn!.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders each item as a button[role=menuitem] with the right labels", () => {
    render({
      label: "Actions",
      items: [
        { key: "one", label: "First", onSelect: () => {} },
        { key: "two", label: "Second", onSelect: () => {} },
      ],
    });
    act(() => trigger()!.click());
    const items = menuItems();
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe("First");
    expect(items[1].textContent).toBe("Second");
    expect(items.every((b) => b.tagName === "BUTTON")).toBe(true);
  });

  it("clicking an item calls its onSelect and closes the menu", () => {
    const onSelect = vi.fn();
    render({
      label: "Actions",
      items: [{ key: "a", label: "Do it", onSelect }],
    });
    const btn = trigger()!;
    act(() => btn.click());
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    act(() => menuItems()[0].click());
    expect(onSelect).toHaveBeenCalledTimes(1);
    // Menu closes after a selection.
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(menuItems()).toHaveLength(0);
  });

  it("a disabled item does NOT call onSelect", () => {
    const onSelect = vi.fn();
    render({
      label: "Actions",
      items: [{ key: "a", label: "Nope", onSelect, disabled: true }],
    });
    act(() => trigger()!.click());
    const item = menuItems()[0];
    expect(item.disabled).toBe(true);
    expect(item.className).toContain("opacity-50");
    expect(item.className).toContain("cursor-not-allowed");
    // Even forcing the handler, the guard keeps onSelect from firing.
    act(() => item.click());
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("a destructive item carries a rose class", () => {
    render({
      label: "Actions",
      items: [
        {
          key: "del",
          label: "Delete",
          onSelect: () => {},
          tone: "destructive",
        },
      ],
    });
    act(() => trigger()!.click());
    expect(menuItems()[0].className).toContain("text-rose-700");
  });

  it("Escape closes the menu", () => {
    render({
      label: "Actions",
      items: [{ key: "a", label: "Alpha", onSelect: () => {} }],
    });
    const btn = trigger()!;
    act(() => btn.click());
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders no trigger button when items is empty", () => {
    render({ label: "Actions", items: [] as OverflowMenuItem[] });
    expect(trigger()).toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });
});
