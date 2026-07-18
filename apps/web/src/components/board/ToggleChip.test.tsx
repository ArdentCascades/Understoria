/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToggleChip } from "./ToggleChip";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});
afterEach(() => {
  act(() => root?.unmount());
  container.remove();
});

function render(pressed: boolean, onToggle = () => {}) {
  act(() => {
    root = createRoot(container);
    root.render(
      <ToggleChip pressed={pressed} onToggle={onToggle}>
        Fits in about an hour
      </ToggleChip>,
    );
  });
}

describe("ToggleChip", () => {
  it("carries aria-pressed and shows a ✓ only when on", () => {
    render(false);
    const btn = container.querySelector("button")!;
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(btn.textContent).not.toContain("✓");

    render(true);
    const on = container.querySelector("button")!;
    expect(on.getAttribute("aria-pressed")).toBe("true");
    // The ✓ is a sighted-only confirmation; aria-pressed carries the
    // state for assistive tech, so the glyph is aria-hidden.
    expect(on.textContent).toContain("✓");
    expect(
      on.querySelector('[aria-hidden="true"]')?.textContent,
    ).toBe("✓");
  });

  it("fires onToggle when clicked", () => {
    const onToggle = vi.fn();
    render(false, onToggle);
    act(() => {
      container
        .querySelector("button")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
