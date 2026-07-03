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
 * LearnSection as a "Community & account" index row: collapsed by
 * default behind a native <details>, and the long-standing
 * `/profile#design-principles` deep link (WhyTooltip's "Read more")
 * auto-opens both the disclosure and the principles panel — before
 * the fold that link silently depended on the panel already being
 * open.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@/i18n";
import { LearnSection } from "./LearnSection";

let container: HTMLDivElement;
let root: Root;
let scrollSpy: ReturnType<typeof vi.fn<typeof Element.prototype.scrollIntoView>>;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  // jsdom doesn't implement `scrollIntoView` — spy on it so the
  // hash-handling effect is observable.
  scrollSpy = vi.fn<typeof Element.prototype.scrollIntoView>();
  Element.prototype.scrollIntoView = scrollSpy;
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.restoreAllMocks();
});

function render(initialEntry: string) {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <LearnSection />
      </MemoryRouter>,
    );
  });
}

describe("LearnSection — collapsed index row", () => {
  it("renders a closed <details> with the row label and description", () => {
    render("/profile");
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details!.open).toBe(false);
    const summary = details!.querySelector("summary");
    expect(summary!.textContent).toContain("Learn");
    expect(summary!.textContent).toContain(
      "Guides, common questions, and design principles",
    );
    // No panel is pre-opened.
    expect(container.querySelector("#design-principles")).toBeNull();
  });

  it("keeps the panel toggles working inside the disclosure", () => {
    render("/profile");
    const details = container.querySelector("details")!;
    act(() => {
      details.open = true;
    });
    const principlesBtn = Array.from(
      container.querySelectorAll("button"),
    ).find((b) => (b.textContent ?? "").trim() === "Design principles");
    expect(principlesBtn).toBeDefined();
    act(() => {
      principlesBtn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("#design-principles")).not.toBeNull();
  });
});

describe("LearnSection — #design-principles deep link", () => {
  it("auto-opens the disclosure and the principles panel, then scrolls to the anchor", () => {
    render("/profile#design-principles");
    const details = container.querySelector("details")!;
    expect(details.open).toBe(true);
    expect(container.querySelector("#design-principles")).not.toBeNull();
    expect(scrollSpy).toHaveBeenCalled();
  });

  it("stays collapsed for other hashes", () => {
    render("/profile#something-else");
    expect(container.querySelector("details")!.open).toBe(false);
    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
