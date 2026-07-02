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
/**
 * The back-link primitive extracted from TaskDetail's breadcrumb.
 * Covers the anchor contract (label + href), the arrow-dedup for the
 * two catalog label conventions, TaskDetail's default styling, and
 * the history-aware mode: navigate(-1) when in-app history exists
 * (`window.history.state.idx > 0`, the react-router v6 idiom),
 * following the fallback `to` on a cold entry.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BackLink } from "./BackLink";

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
  // Reset the history index other tests may have planted.
  window.history.replaceState(null, "");
});

/** Render a BackLink at /here with markers for the previous in-app
 *  entry (/previous) and the fallback destination (/fallback). */
function renderHarness(props: {
  to: string;
  label: string;
  className?: string;
  preferHistory?: boolean;
}) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={["/previous", "/here"]} initialIndex={1}>
        <Routes>
          <Route path="/previous" element={<p>previous-page-marker</p>} />
          <Route path="/fallback" element={<p>fallback-page-marker</p>} />
          <Route path="/here" element={<BackLink {...props} />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

function link(): HTMLAnchorElement {
  const a = container.querySelector<HTMLAnchorElement>("a");
  if (!a) throw new Error("BackLink anchor not found");
  return a;
}

function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
    );
  });
}

describe("BackLink — anchor contract", () => {
  it("renders a real link with the destination href and the ← label", () => {
    renderHarness({ to: "/fallback", label: "Back to the garden" });
    expect(link().getAttribute("href")).toBe("/fallback");
    expect((link().textContent ?? "").trim()).toBe("← Back to the garden");
  });

  it("does not double the arrow when the translated label already carries one", () => {
    renderHarness({ to: "/fallback", label: "← Back" });
    expect((link().textContent ?? "").trim()).toBe("← Back");
  });

  it("defaults to TaskDetail's exact classes and accepts an override", () => {
    renderHarness({ to: "/fallback", label: "Back" });
    expect(link().className).toBe("btn-ghost -ml-2 mb-3 inline-block text-sm");
    act(() => {
      root.unmount();
    });
    renderHarness({
      to: "/fallback",
      label: "Back",
      className: "btn-ghost -ml-2 text-sm",
    });
    expect(link().className).toBe("btn-ghost -ml-2 text-sm");
  });

  it("a plain click follows `to` when preferHistory is off", () => {
    window.history.replaceState({ idx: 3 }, "");
    renderHarness({ to: "/fallback", label: "Back" });
    click(link());
    expect(container.textContent).toContain("fallback-page-marker");
  });
});

describe("BackLink — history-aware mode", () => {
  it("goes back through in-app history when there is any (idx > 0)", () => {
    renderHarness({ to: "/fallback", label: "Back", preferHistory: true });
    window.history.replaceState({ idx: 1 }, "");
    click(link());
    expect(container.textContent).toContain("previous-page-marker");
  });

  it("falls back to `to` on a cold entry (idx 0 / no idx)", () => {
    renderHarness({ to: "/fallback", label: "Back", preferHistory: true });
    window.history.replaceState({ idx: 0 }, "");
    click(link());
    expect(container.textContent).toContain("fallback-page-marker");
    expect(container.textContent).not.toContain("previous-page-marker");
  });

  it("leaves modified clicks (new-tab intent) to the browser", () => {
    renderHarness({ to: "/fallback", label: "Back", preferHistory: true });
    window.history.replaceState({ idx: 1 }, "");
    // Swallow the default at the document level AFTER the component's
    // handlers ran, so jsdom (which can't open tabs) doesn't try to
    // navigate — the assertion is only that no in-app route changed.
    const swallow = (e: Event) => e.preventDefault();
    document.addEventListener("click", swallow);
    act(() => {
      link().dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          button: 0,
          metaKey: true,
        }),
      );
    });
    document.removeEventListener("click", swallow);
    // Neither in-app navigation fired — the BackLink page is still up.
    expect(container.querySelector("a")).not.toBeNull();
  });
});
