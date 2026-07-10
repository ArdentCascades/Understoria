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
// The global header + me-menu drawer. What must hold:
//   1. the header carries the wordmark and ONE labeled menu button;
//   2. the button opens a focus-managed dialog listing exactly the
//      six me-tier destinations (Profile identity row, Settings,
//      Invite someone, Help, Search, Community infrastructure);
//   3. Escape and the scrim close it, focus returns to the button;
//   4. the Search row fires the palette's open event and closes;
//   5. selecting a link closes the drawer.
//
// The drawer PORTALS to <body> (the header's backdrop-filter would
// otherwise capture its fixed positioning), so dialog queries go
// through `document`, not the render container.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const currentMember = {
  publicKey: "member-key-abcdef123456",
  displayName: "Rosa Q",
  skills: [],
  availability: "",
  availabilityChips: [],
  seedBalance: 5,
  vouchedBy: [],
  createdAt: 0,
  nodeId: "node-1",
  locationZone: "",
};

vi.mock("@/state/AppContext", () => ({
  useApp: () => ({ currentMember }),
}));

import "@/i18n";
import { AppHeader } from "./AppHeader";
import { OPEN_PALETTE_EVENT } from "./CommandPalette";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    );
  });
}

function menuButton() {
  return container.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="dialog"]',
  )!;
}

function openMenu() {
  act(() => {
    // Real clicks focus the button; jsdom's synthetic ones don't, and
    // the focus trap restores to document.activeElement-at-open.
    menuButton().focus();
    menuButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("AppHeader + MeMenu", () => {
  it("renders the wordmark and a labeled menu button, no drawer yet", () => {
    render();
    expect(container.textContent).toContain("Understoria");
    const btn = menuButton();
    expect(btn).not.toBeNull();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("opens the drawer with exactly the six me-tier destinations", () => {
    render();
    openMenu();
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    expect(menuButton().getAttribute("aria-expanded")).toBe("true");
    const hrefs = [...dialog.querySelectorAll("a")].map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toEqual([
      "/profile",
      "/settings",
      "/profile#invites",
      "/help",
      "/infrastructure",
    ]);
    // Profile leads as an identity row — the member's own name.
    expect(dialog.textContent).toContain("Rosa Q");
    // Search is a button (opens the palette), not a link.
    expect(dialog.textContent).toContain("Search");
  });

  it("closes on Escape and returns focus to the menu button", () => {
    render();
    openMenu();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(menuButton());
  });

  it("mutes the button's hover styling on close until the pointer moves again", () => {
    render();
    expect(menuButton().className).toContain("hover:bg-moss-100");
    openMenu();
    // Close via the drawer's ✕ — it sits directly over the menu
    // button, so the cursor is left parked there; the hover tint must
    // not paint until the pointer actually does something.
    const close = document.querySelector<HTMLButtonElement>(
      '[role="dialog"] button[aria-label="Close menu"]',
    )!;
    act(() => {
      close.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(menuButton().className).not.toContain("hover:bg-moss-100");
    // Only actually leaving re-arms hover — enter/move re-fire
    // synthetically under a parked cursor the moment the drawer
    // unmounts, so they must not.
    act(() => {
      // React delegates onPointerLeave from bubbling pointerout
      // events whose relatedTarget is outside the element.
      menuButton().dispatchEvent(
        new MouseEvent("pointerout", {
          bubbles: true,
          relatedTarget: document.body,
        }),
      );
    });
    expect(menuButton().className).toContain("hover:bg-moss-100");
  });

  it("closes on a scrim tap", () => {
    render();
    openMenu();
    // The scrim is the aria-hidden sibling that carries the close
    // handler — a pointerdown anywhere on it must close the drawer
    // (regression: the handler once sat on the container with a
    // target check the scrim could never satisfy).
    const scrim = document.querySelector(
      '.fixed.inset-0 > [aria-hidden="true"]',
    )!;
    act(() => {
      scrim.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("Search row dispatches the palette open event and closes the drawer", () => {
    render();
    openMenu();
    const listener = vi.fn();
    window.addEventListener(OPEN_PALETTE_EVENT, listener);
    const searchBtn = [
      ...document.querySelectorAll<HTMLButtonElement>(
        '[role="dialog"] button',
      ),
    ].find((b) => (b.textContent ?? "").includes("Search"))!;
    act(() => {
      searchBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    window.removeEventListener(OPEN_PALETTE_EVENT, listener);
  });

  it("selecting a link closes the drawer", () => {
    render();
    openMenu();
    const settings = document.querySelector<HTMLAnchorElement>(
      '[role="dialog"] a[href="/settings"]',
    )!;
    act(() => {
      settings.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
