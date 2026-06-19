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
import { Markdown, COLLAPSE_THRESHOLD } from "./Markdown";

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

function render(props: Parameters<typeof Markdown>[0]) {
  act(() => {
    root = createRoot(container);
    root.render(<Markdown {...props} />);
  });
}

function toggleButton(): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent === "Show more" || b.textContent === "Show less",
  );
}

describe("Markdown — inline rendering", () => {
  it("produces <strong>, <em>, and <code> elements", () => {
    render({ text: "**b** _i_ `c`" });
    expect(container.querySelector("strong")?.textContent).toBe("b");
    expect(container.querySelector("em")?.textContent).toBe("i");
    const code = container.querySelector("code");
    expect(code?.textContent).toBe("c");
    expect(code?.className).toContain("font-mono");
  });

  it("renders a safe link as an <a> with target/rel and the exact href", () => {
    render({ text: "[site](https://example.com/path)" });
    const a = container.querySelector("a");
    expect(a).not.toBeNull();
    expect(a!.getAttribute("href")).toBe("https://example.com/path");
    expect(a!.getAttribute("target")).toBe("_blank");
    const rel = a!.getAttribute("rel") ?? "";
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");
    expect(rel).toContain("nofollow");
    expect(a!.textContent).toBe("site");
  });

  it("renders NO <a> for a javascript: link — just the label text", () => {
    render({ text: "[x](javascript:alert(1))" });
    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toContain("x");
    // The dangerous scheme never reaches the DOM as an href.
    expect(container.innerHTML).not.toContain("javascript:");
  });

  it("renders a literal <script> payload as inert text, not an element", () => {
    render({ text: "<script>alert(1)</script>" });
    // No actual script element is created; the angle brackets are escaped
    // text content.
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toBe("<script>alert(1)</script>");
  });
});

describe("Markdown — block rendering", () => {
  it("produces <ul><li> for a bullet list", () => {
    render({ text: "- a\n- b" });
    const ul = container.querySelector("ul");
    expect(ul).not.toBeNull();
    expect(ul!.className).toContain("list-disc");
    expect(ul!.querySelectorAll("li")).toHaveLength(2);
  });

  it("produces <ol><li> for an ordered list", () => {
    render({ text: "1. a\n2. b" });
    const ol = container.querySelector("ol");
    expect(ol).not.toBeNull();
    expect(ol!.className).toContain("list-decimal");
    expect(ol!.querySelectorAll("li")).toHaveLength(2);
  });

  it("applies the className to the wrapper div", () => {
    render({ text: "hi", className: "text-sm text-moss-700" });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.tagName).toBe("DIV");
    expect(wrapper.className).toContain("text-sm");
    expect(wrapper.className).toContain("text-moss-700");
    // Block-spacing class is always present.
    expect(wrapper.className).toContain("space-y-2");
  });
});

// Migrated from the deleted ExpandableText.test.tsx — collapse threshold,
// Show more / Show less toggle, and full-text-in-DOM guarantee.
describe("Markdown — collapsible behavior", () => {
  it("short text renders with no toggle", () => {
    render({ text: "A short description.", collapsible: true });
    expect(container.textContent).toContain("A short description.");
    expect(toggleButton()).toBeUndefined();
  });

  it("exposes the shared threshold and renders plainly at the boundary", () => {
    expect(COLLAPSE_THRESHOLD).toBe(280);
    // Exactly at the threshold → no toggle (<=).
    render({ text: "x".repeat(COLLAPSE_THRESHOLD), collapsible: true });
    expect(toggleButton()).toBeUndefined();
  });

  it("long text keeps the full text in the DOM, clamps, and toggles", () => {
    const text = "x".repeat(400);
    render({ text, collapsible: true });

    // The paragraph carrying the text is always fully present in the DOM
    // (CSS-only clamp), independent of expansion.
    expect(container.querySelector("p")?.textContent).toBe(text);

    // Collapsed by default → clamp class + "Show more".
    const clamp = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("max-h-32"),
    );
    expect(clamp).toBeDefined();
    expect(clamp!.className).toContain("overflow-hidden");
    const btn = toggleButton();
    expect(btn?.textContent).toBe("Show more");
    expect(btn?.getAttribute("aria-expanded")).toBe("false");

    // Expand → drop the clamp, flip to "Show less", text still all present.
    act(() => {
      btn?.click();
    });
    const stillClamped = Array.from(container.querySelectorAll("div")).find(
      (d) => d.className.includes("max-h-32"),
    );
    expect(stillClamped).toBeUndefined();
    const expandedBtn = toggleButton();
    expect(expandedBtn?.textContent).toBe("Show less");
    expect(expandedBtn?.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector("p")?.textContent).toBe(text);

    // Collapse again → clamp restored.
    act(() => {
      expandedBtn?.click();
    });
    expect(
      Array.from(container.querySelectorAll("div")).some((d) =>
        d.className.includes("max-h-32"),
      ),
    ).toBe(true);
    expect(toggleButton()?.textContent).toBe("Show more");
  });

  it("does not clamp or toggle when collapsible is false even for long text", () => {
    const text = "y".repeat(400);
    render({ text, collapsible: false });
    expect(toggleButton()).toBeUndefined();
    expect(
      Array.from(container.querySelectorAll("div")).some((d) =>
        d.className.includes("max-h-32"),
      ),
    ).toBe(false);
    expect(container.textContent).toBe(text);
  });
});
