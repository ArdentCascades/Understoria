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
import { act, useContext } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DockedPanel, DockedPanelDockContext } from "./DockedPanel";
import { DESKTOP_DOCK_QUERY, SPLIT_CAPABLE_QUERY } from "@/lib/viewport";

let container: HTMLDivElement;
let root: Root;

// Stub matchMedia so the split-capable query resolves; every other
// query stays false. Returns a handle whose `matches`/`fire()` let a
// test simulate rotation mid-view.
function stubSplitMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  const handle = {
    matches,
    listeners,
    fire: () => {
      for (const cb of [...listeners]) cb();
    },
  };
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) =>
      ({
        get matches() {
          return query === SPLIT_CAPABLE_QUERY ? handle.matches : false;
        },
        media: query,
        onchange: null,
        addEventListener: (_t: string, cb: () => void) => {
          if (query === SPLIT_CAPABLE_QUERY) listeners.add(cb);
        },
        removeEventListener: (_t: string, cb: () => void) => {
          listeners.delete(cb);
        },
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
  return handle;
}

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  // Restore jsdom's native matchMedia-less window.
  delete (window as { matchMedia?: unknown }).matchMedia;
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

  it("docks as a sticky column when the viewport is split-capable (sideways)", () => {
    // Short landscape ≥700px wide: the panel docks beside the page
    // instead of taking over the viewport — the same posture lg+
    // gets, at ~45% width with a tap-target floor.
    const mql = stubSplitMatchMedia(true);
    renderPanel(vi.fn(), "item-1");
    const aside = container.querySelector("aside")!;
    expect(aside.className).not.toContain("fixed");
    expect(aside.className).toContain("sticky");
    expect(aside.className).toContain("w-[45%]");
    expect(aside.className).toContain("min-w-[280px]");

    // Rotate to portrait mid-view: back to the full-screen takeover.
    act(() => {
      mql.matches = false;
      mql.fire();
    });
    expect(container.querySelector("aside")!.className).toContain("fixed");
  });

  it("keeps the full-screen takeover when sideways but below the width floor", () => {
    stubSplitMatchMedia(false);
    renderPanel(vi.fn(), "item-1");
    const aside = container.querySelector("aside")!;
    expect(aside.className).toContain("fixed");
    expect(aside.className).toContain("inset-0");
    expect(aside.className).not.toContain("w-[45%]");
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

// ─── Dock context (round-3 papercut: double Close/Back) ─────────────
//
// The panel tells its content whether it is actually DOCKED (side
// column at lg+ / split-capable short landscape) via
// DockedPanelDockContext, so detail pages can hide their own Back
// affordance there — the frame's × Close already does the same thing.
// In the full-screen takeover the context stays false and the page
// keeps its Back (mobile unchanged).

function stubMatchMediaMatching(matchingQuery: string) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) =>
      ({
        matches: query === matchingQuery,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
}

function DockProbe() {
  const docked = useContext(DockedPanelDockContext);
  return <p>{docked ? "probe-docked" : "probe-overlay"}</p>;
}

function renderWithProbe() {
  act(() => {
    root = createRoot(container);
    root.render(
      <DockedPanel
        ariaLabel="Details"
        closeLabel="Close panel"
        closeShortLabel="Close"
        onClose={vi.fn()}
        swapKey="item-1"
      >
        <DockProbe />
      </DockedPanel>,
    );
  });
}

describe("DockedPanel dock context", () => {
  it("full-screen takeover (no docking query matches) → false", () => {
    renderWithProbe();
    expect(container.textContent).toContain("probe-overlay");
  });

  it("split-capable short landscape → true", () => {
    stubMatchMediaMatching(SPLIT_CAPABLE_QUERY);
    renderWithProbe();
    expect(container.textContent).toContain("probe-docked");
  });

  it("desktop width (lg dock) → true", () => {
    stubMatchMediaMatching(DESKTOP_DOCK_QUERY);
    renderWithProbe();
    expect(container.textContent).toContain("probe-docked");
  });

  it("outside any DockedPanel the context defaults to false", () => {
    act(() => {
      root = createRoot(container);
      root.render(<DockProbe />);
    });
    expect(container.textContent).toContain("probe-overlay");
  });
});
