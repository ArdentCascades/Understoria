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
import { describe, expect, it } from "vitest";
import { getFocusableElements, nextFocusable } from "./focusable";

function build(html: string): HTMLDivElement {
  const div = document.createElement("div");
  div.innerHTML = html;
  document.body.appendChild(div);
  return div;
}

describe("getFocusableElements", () => {
  it("finds buttons, links, inputs, selects, textareas in document order", () => {
    const root = build(`
      <a href="/x">link</a>
      <button>btn</button>
      <input />
      <select><option>x</option></select>
      <textarea></textarea>
    `);
    const els = getFocusableElements(root);
    expect(els.map((e) => e.tagName.toLowerCase())).toEqual([
      "a",
      "button",
      "input",
      "select",
      "textarea",
    ]);
    root.remove();
  });

  it("skips disabled controls", () => {
    const root = build(`
      <button disabled>nope</button>
      <input disabled />
      <button>yes</button>
    `);
    const els = getFocusableElements(root);
    expect(els).toHaveLength(1);
    expect(els[0].textContent).toBe("yes");
    root.remove();
  });

  it("skips type=hidden inputs", () => {
    const root = build(`
      <input type="hidden" />
      <input type="text" />
    `);
    const els = getFocusableElements(root);
    expect(els).toHaveLength(1);
    expect(els[0].getAttribute("type")).toBe("text");
    root.remove();
  });

  it("includes tabindex=0 but excludes tabindex=-1", () => {
    const root = build(`
      <div tabindex="0">focusable</div>
      <div tabindex="-1">not focusable via tab</div>
    `);
    const els = getFocusableElements(root);
    expect(els).toHaveLength(1);
    expect(els[0].textContent).toBe("focusable");
    root.remove();
  });

  it("skips hidden elements", () => {
    const root = build(`
      <button hidden>hidden</button>
      <button>visible</button>
    `);
    const els = getFocusableElements(root);
    expect(els).toHaveLength(1);
    expect(els[0].textContent).toBe("visible");
    root.remove();
  });
});

describe("nextFocusable", () => {
  function setup() {
    const root = build(`
      <button id="a">A</button>
      <button id="b">B</button>
      <button id="c">C</button>
    `);
    const all = getFocusableElements(root);
    return { root, all };
  }

  it("returns the first element when nothing is currently focused (forward)", () => {
    const { root, all } = setup();
    expect(nextFocusable(null, all, "forward")?.id).toBe("a");
    root.remove();
  });

  it("returns the last element when nothing is currently focused (backward)", () => {
    const { root, all } = setup();
    expect(nextFocusable(null, all, "backward")?.id).toBe("c");
    root.remove();
  });

  it("wraps from last back to first on forward", () => {
    const { root, all } = setup();
    expect(nextFocusable(all[2], all, "forward")?.id).toBe("a");
    root.remove();
  });

  it("wraps from first to last on backward", () => {
    const { root, all } = setup();
    expect(nextFocusable(all[0], all, "backward")?.id).toBe("c");
    root.remove();
  });

  it("moves forward through the list normally", () => {
    const { root, all } = setup();
    expect(nextFocusable(all[0], all, "forward")?.id).toBe("b");
    expect(nextFocusable(all[1], all, "forward")?.id).toBe("c");
    root.remove();
  });

  it("moves backward through the list normally", () => {
    const { root, all } = setup();
    expect(nextFocusable(all[2], all, "backward")?.id).toBe("b");
    expect(nextFocusable(all[1], all, "backward")?.id).toBe("a");
    root.remove();
  });

  it("returns null when the list is empty", () => {
    expect(nextFocusable(null, [], "forward")).toBeNull();
  });

  it("returns the only element when the list has one item", () => {
    const root = build(`<button id="solo">A</button>`);
    const all = getFocusableElements(root);
    expect(nextFocusable(null, all, "forward")?.id).toBe("solo");
    expect(nextFocusable(all[0], all, "forward")?.id).toBe("solo");
    expect(nextFocusable(all[0], all, "backward")?.id).toBe("solo");
    root.remove();
  });
});
