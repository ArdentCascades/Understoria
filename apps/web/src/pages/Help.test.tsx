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
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// jsdom has no scrollIntoView; the page calls it for deep links and
// section chips.
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// Pull in real i18n so the page's surrounding chrome (title,
// footer) renders translated copy and `i18n.changeLanguage` is a
// real switch. The locale-aware FAQ selection is the behavior
// under test.
import i18n from "@/i18n";
import HelpPage from "./Help";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(async () => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  // Reset language so tests don't leak into each other.
  await i18n.changeLanguage("en");
});

function render(node: ReactNode, wrap = true) {
  act(() => {
    root = createRoot(container);
    root.render(wrap ? <MemoryRouter>{node}</MemoryRouter> : node);
  });
}

describe("HelpPage — locale-aware FAQ", () => {
  it("renders English FAQ copy when i18n.language is 'en'", async () => {
    await i18n.changeLanguage("en");
    render(<HelpPage />);
    // Section title and an entry question that only exist in the
    // English source.
    expect(container.textContent).toContain("Posts and exchanges");
    expect(container.textContent).toContain(
      "How do I post a need or an offer?",
    );
    expect(container.textContent).not.toContain("Publicaciones e intercambios");
  });

  it("renders Spanish FAQ copy when i18n.language is 'es'", async () => {
    await i18n.changeLanguage("es");
    render(<HelpPage />);
    // Section title and an entry question that only exist in the
    // Spanish source — distinctive strings, not shared with English.
    expect(container.textContent).toContain("Publicaciones e intercambios");
    expect(container.textContent).toContain(
      "¿Cómo publico una necesidad o una oferta?",
    );
    expect(container.textContent).not.toContain("Posts and exchanges");
  });

  it("falls back to English for unsupported locales", async () => {
    // Force-set the language to a locale we don't have a FAQ for.
    // The selector should fall through to the English source
    // rather than render an empty page.
    await i18n.changeLanguage("fr");
    render(<HelpPage />);
    expect(container.textContent).toContain("Posts and exchanges");
  });

  it("uses the same entry ids in both languages (anchor links survive)", async () => {
    await i18n.changeLanguage("es");
    render(<HelpPage />);
    // A member who bookmarked /help#confirm-exchange in English
    // must still land on the right Spanish entry.
    expect(container.querySelector("#confirm-exchange")).not.toBeNull();
    expect(container.querySelector("#someone-bothering-me")).not.toBeNull();
  });
});

describe("HelpPage — accordion, filter, deep links", () => {
  function questionButton(text: string) {
    return [...container.querySelectorAll<HTMLButtonElement>("h3 button")].find(
      (b) => (b.textContent ?? "").includes(text),
    )!;
  }

  it("collapses answers by default and expands on tap", () => {
    render(<HelpPage />);
    // Answer prose is NOT in the DOM until its question is opened.
    expect(container.textContent).not.toContain(
      "The credit only moves once",
    );
    const btn = questionButton("How does confirming an exchange work?");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    act(() => {
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(container.textContent).toContain("The credit only moves once");
    // Tapping again collapses.
    act(() => {
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).not.toContain(
      "The credit only moves once",
    );
  });

  it("auto-expands the entry a deep link points at", () => {
    render(
      <MemoryRouter initialEntries={["/help#confirm-exchange"]}>
        <HelpPage />
      </MemoryRouter>,
      false,
    );
    expect(container.textContent).toContain("The credit only moves once");
  });

  it("filters questions, expands matches, and hides the rest", () => {
    render(<HelpPage />);
    const input = container.querySelector<HTMLInputElement>(
      'input[type="search"]',
    )!;
    act(() => {
      // React reads the value through the native setter.
      const set = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      set.call(input, "passphrase");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    // The matching entry is present AND expanded.
    expect(container.textContent).toContain(
      "What happens if I lose my passphrase?",
    );
    expect(container.textContent).toContain("Nobody can reset it for you");
    // A non-matching entry is gone entirely.
    expect(container.textContent).not.toContain(
      "How do I cancel a post I no longer need?",
    );
  });

  it("shows a no-matches state for a hopeless filter", () => {
    render(<HelpPage />);
    const input = container.querySelector<HTMLInputElement>(
      'input[type="search"]',
    )!;
    act(() => {
      const set = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      set.call(input, "zzzzxq");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(container.textContent).toContain("No questions match");
  });

  it("Expand all opens every answer; Collapse all closes them", () => {
    render(<HelpPage />);
    const expand = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === "Expand all",
    )!;
    act(() => {
      expand.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("The credit only moves once");
    expect(container.textContent).toContain("Nobody can reset it for you");
    const collapse = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === "Collapse all",
    )!;
    act(() => {
      collapse.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).not.toContain(
      "The credit only moves once",
    );
  });

  it("renders a jump chip per section", () => {
    render(<HelpPage />);
    const nav = container.querySelector('nav[aria-label="Jump to a section"]')!;
    expect(nav).not.toBeNull();
    expect(nav.querySelectorAll("button").length).toBe(7);
  });
});
