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

describe("Markdown — SAFE block rendering", () => {
  it("renders a heading with role=heading + aria-level, NOT a raw <h1>", () => {
    render({ text: "# Big title" });
    // No real heading element leaks into the page outline.
    expect(container.querySelector("h1")).toBeNull();
    const heading = container.querySelector('[role="heading"]');
    expect(heading).not.toBeNull();
    expect(heading!.getAttribute("aria-level")).toBe("1");
    expect(heading!.textContent).toBe("Big title");
    // It is a calm <div>, not an h-tag.
    expect(heading!.tagName).toBe("DIV");
  });

  it("renders nested heading levels with the right aria-level", () => {
    render({ text: "### Smaller" });
    const heading = container.querySelector('[role="heading"]');
    expect(heading!.getAttribute("aria-level")).toBe("3");
    expect(container.querySelector("h3")).toBeNull();
  });

  it("renders a blockquote wrapping its child blocks", () => {
    render({ text: "> quoted text" });
    const bq = container.querySelector("blockquote");
    expect(bq).not.toBeNull();
    expect(bq!.className).toContain("border-l-2");
    expect(bq!.textContent).toContain("quoted text");
    // The recursively-rendered child is a paragraph.
    expect(bq!.querySelector("p")).not.toBeNull();
  });

  it("renders a fenced code block as <pre><code> with the verbatim value", () => {
    render({ text: "```\nline *one*\nline two\n```" });
    const pre = container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre!.className).toContain("overflow-x-auto");
    const code = pre!.querySelector("code");
    expect(code).not.toBeNull();
    expect(code!.className).toContain("font-mono");
    // The `*one*` is shown verbatim (not emphasized) — no <em> inside.
    expect(code!.textContent).toBe("line *one*\nline two");
    expect(pre!.querySelector("em")).toBeNull();
  });

  it("renders an <hr> for a horizontal rule", () => {
    render({ text: "---" });
    const hr = container.querySelector("hr");
    expect(hr).not.toBeNull();
    expect(hr!.className).toContain("border-moss-200");
  });

  it("renders <del> for strikethrough", () => {
    render({ text: "~~gone~~" });
    const del = container.querySelector("del");
    expect(del).not.toBeNull();
    expect(del!.textContent).toBe("gone");
  });

  it("renders a GFM table with thead/tbody, th/td, and alignment classes", () => {
    render({
      text: "| L | R |\n| :--- | ---: |\n| a | b |",
    });
    const wrapper = container.querySelector("div.overflow-x-auto");
    expect(wrapper).not.toBeNull();
    const table = container.querySelector("table");
    expect(table).not.toBeNull();
    expect(table!.className).toContain("w-full");
    const ths = table!.querySelectorAll("thead th");
    expect(ths).toHaveLength(2);
    expect(ths[0].className).toContain("font-semibold");
    expect(ths[0].className).toContain("text-left");
    expect(ths[1].className).toContain("text-right");
    const tds = table!.querySelectorAll("tbody td");
    expect(tds).toHaveLength(2);
    expect(tds[0].className).toContain("border");
    expect(tds[0].textContent).toBe("a");
    expect(tds[1].className).toContain("text-right");
  });

  it("renders a task list with a disabled, read-only checkbox per item", () => {
    render({ text: "- [x] done\n- [ ] todo" });
    const ul = container.querySelector("ul");
    expect(ul).not.toBeNull();
    // Task lists drop the bullet marker.
    expect(ul!.className).toContain("list-none");
    const boxes = container.querySelectorAll('input[type="checkbox"]');
    expect(boxes).toHaveLength(2);
    const first = boxes[0] as HTMLInputElement;
    const second = boxes[1] as HTMLInputElement;
    expect(first.checked).toBe(true);
    expect(second.checked).toBe(false);
    // Read-only: disabled so federated content can never be toggled.
    expect(first.disabled).toBe(true);
    expect(container.textContent).toContain("done");
    expect(container.textContent).toContain("todo");
  });

  it("renders a nested list as a nested <ul> inside an <li>", () => {
    render({ text: "- outer\n  - inner1\n  - inner2" });
    const outer = container.querySelector("ul");
    expect(outer).not.toBeNull();
    const nested = outer!.querySelector("li ul");
    expect(nested).not.toBeNull();
    expect(nested!.querySelectorAll("li")).toHaveLength(2);
    expect(nested!.textContent).toContain("inner1");
    expect(nested!.textContent).toContain("inner2");
  });

  it("renders a nested <ol> inside a bullet item", () => {
    render({ text: "- outer\n  1. one\n  2. two" });
    const nestedOl = container.querySelector("ul li ol");
    expect(nestedOl).not.toBeNull();
    expect(nestedOl!.className).toContain("list-decimal");
    expect(nestedOl!.querySelectorAll("li")).toHaveLength(2);
  });
});

describe("Markdown — image safety (never an <img>)", () => {
  it("renders image syntax as a safe <a>, never an <img>", () => {
    render({ text: "![a cat](https://example.com/cat.png)" });
    // The crucial invariant: no image element is ever produced.
    expect(container.querySelector("img")).toBeNull();
    const a = container.querySelector("a");
    expect(a).not.toBeNull();
    expect(a!.getAttribute("href")).toBe("https://example.com/cat.png");
    expect(a!.textContent).toBe("a cat");
    // No <img> tag string anywhere in the emitted HTML.
    expect(container.innerHTML.toLowerCase()).not.toContain("<img");
  });

  it("renders an unsafe image url as plain text, no <img>, no href", () => {
    render({ text: "![x](javascript:alert(1))" });
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("a")).toBeNull();
    expect(container.innerHTML.toLowerCase()).not.toContain("<img");
    expect(container.innerHTML).not.toContain("javascript:");
    expect(container.textContent).toContain("x");
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
