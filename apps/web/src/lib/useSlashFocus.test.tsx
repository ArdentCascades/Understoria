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
// The `/`-focuses-search affordance. Locks:
//   1. A bare `/` anywhere on the page focuses the wired input and
//      never types a slash into it.
//   2. `/` pressed while ALREADY typing in a field does nothing —
//      writing "either/or" in any input stays uninterrupted.
//   3. Modified slashes (Ctrl//, Cmd//) are left to the browser.
//
import { act, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useSlashFocus } from "./useSlashFocus";

function Harness() {
  const ref = useRef<HTMLInputElement | null>(null);
  useSlashFocus(ref);
  return (
    <div>
      <input data-testid="search" ref={ref} />
      <input data-testid="other" />
    </div>
  );
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<Harness />);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function press(target: Element | Document, init: KeyboardEventInit) {
  const e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    ...init,
  });
  (target instanceof Document ? target.body : target).dispatchEvent(e);
  return e;
}

describe("useSlashFocus", () => {
  it("focuses the search input on a bare `/` and prevents the keystroke", () => {
    const search = container.querySelector<HTMLInputElement>(
      '[data-testid="search"]',
    )!;
    const e = press(document, { key: "/" });
    expect(document.activeElement).toBe(search);
    expect(e.defaultPrevented).toBe(true);
  });

  it("does nothing while typing in another field", () => {
    const other = container.querySelector<HTMLInputElement>(
      '[data-testid="other"]',
    )!;
    other.focus();
    const e = press(other, { key: "/" });
    expect(document.activeElement).toBe(other);
    expect(e.defaultPrevented).toBe(false);
  });

  it("leaves modified slashes to the browser", () => {
    const e = press(document, { key: "/", ctrlKey: true });
    expect(e.defaultPrevented).toBe(false);
    expect(
      document.activeElement ===
        container.querySelector('[data-testid="search"]'),
    ).toBe(false);
  });
});
