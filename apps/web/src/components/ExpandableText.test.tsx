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
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@/i18n";
import { ExpandableText } from "./ExpandableText";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const CLASS = "mt-2 whitespace-pre-wrap text-sm text-moss-700";

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

function render(text: string, clampLines = 4) {
  act(() => {
    root = createRoot(container);
    root.render(
      <ExpandableText text={text} className={CLASS} clampLines={clampLines} />,
    );
  });
}

function toggleButton(): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll("button")).find(
    (b) =>
      b.textContent === "Show more" || b.textContent === "Show less",
  );
}

describe("ExpandableText", () => {
  it("short text renders in full with no toggle and no clamp", () => {
    const text = "A short description.";
    render(text);

    expect(container.textContent).toBe(text);
    expect(toggleButton()).toBeUndefined();

    const p = container.querySelector("p");
    expect(p?.className).not.toContain("line-clamp");
  });

  it("long text keeps the full text in the DOM, clamps, and toggles", () => {
    const text = "x".repeat(400);
    render(text, 4);

    // The full text is always present (CSS-only clamp) — screen readers
    // and existing tests still see the whole description.
    const p = container.querySelector("p");
    expect(p?.textContent).toBe(text);

    // Collapsed by default → clamped + "Show more".
    expect(p?.className).toContain("line-clamp-4");
    const btn = toggleButton();
    expect(btn?.textContent).toBe("Show more");
    expect(btn?.getAttribute("aria-expanded")).toBe("false");

    // Expand → drops the clamp, flips to "Show less".
    act(() => {
      btn?.click();
    });
    const expanded = container.querySelector("p");
    expect(expanded?.className).not.toContain("line-clamp");
    const expandedBtn = toggleButton();
    expect(expandedBtn?.textContent).toBe("Show less");
    expect(expandedBtn?.getAttribute("aria-expanded")).toBe("true");
    expect(expanded?.textContent).toBe(text);

    // Collapse again → clamp restored.
    act(() => {
      expandedBtn?.click();
    });
    const recollapsed = container.querySelector("p");
    expect(recollapsed?.className).toContain("line-clamp-4");
    expect(toggleButton()?.textContent).toBe("Show more");
  });
});
