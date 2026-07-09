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
// The docked-panel frame shared by the calendar's event panel and
// the board's post panel. Locks:
//   1. Focus lands in the panel on open AND again when the member
//      swaps to another item in place (swapKey change).
//   2. Escape closes from anywhere on the page — EXCEPT while the
//      member is typing in a form field (a field's own Escape
//      semantics must win; no surprise closes mid-edit).
//   3. The close button closes.
//   4. The frame is full-screen below lg and a docked column at lg+
//      (the class contract both panels rely on).
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DockedPanel } from "./DockedPanel";

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

function renderPanel(onClose: () => void, swapKey: string) {
  const ui = (key: string) => (
    <DockedPanel
      ariaLabel="Details"
      closeLabel="Close panel"
      closeShortLabel="Close"
      onClose={onClose}
      swapKey={key}
    >
      <p>panel body</p>
      <input aria-label="field" />
    </DockedPanel>
  );
  act(() => {
    root = createRoot(container);
    root.render(ui(swapKey));
  });
  return (key: string) => act(() => root.render(ui(key)));
}

function pressEscape(target: Element | Document = document) {
  const node = target === document ? document.body : (target as HTMLElement);
  act(() => {
    node.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  });
}

describe("DockedPanel", () => {
  it("focuses the panel on open and again on swap", () => {
    const rerender = renderPanel(vi.fn(), "item-1");
    const aside = container.querySelector("aside")!;
    expect(document.activeElement).toBe(aside);

    // The member clicks back into the page behind the panel…
    act(() => aside.blur());
    expect(document.activeElement).not.toBe(aside);

    // …then opens a different item: the panel re-takes focus.
    rerender("item-2");
    expect(document.activeElement).toBe(aside);
  });

  it("Escape closes — from the page, not just inside the panel", () => {
    const onClose = vi.fn();
    renderPanel(onClose, "item-1");
    pressEscape();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape inside a form field does NOT close", () => {
    const onClose = vi.fn();
    renderPanel(onClose, "item-1");
    const input = container.querySelector("input")!;
    pressEscape(input);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("the close button closes", () => {
    const onClose = vi.fn();
    renderPanel(onClose, "item-1");
    const button = container.querySelector("button")!;
    expect(button.getAttribute("aria-label")).toBe("Close panel");
    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("is full-screen below lg and a docked sticky column at lg+", () => {
    renderPanel(vi.fn(), "item-1");
    const aside = container.querySelector("aside")!;
    expect(aside.className).toContain("fixed");
    expect(aside.className).toContain("inset-0");
    expect(aside.className).toContain("lg:static");
    expect(aside.className).toContain("lg:sticky");
    expect(aside.getAttribute("aria-label")).toBe("Details");
    expect(aside.getAttribute("tabindex")).toBe("-1");
  });

  it("removes its Escape listener on unmount", () => {
    const onClose = vi.fn();
    renderPanel(onClose, "item-1");
    act(() => root.unmount());
    // Re-create a root so afterEach's unmount stays valid.
    act(() => {
      root = createRoot(container);
      root.render(<div />);
    });
    pressEscape();
    expect(onClose).not.toHaveBeenCalled();
  });
});
