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
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { InstallEnvironment } from "@/lib/installGuide";

// In-memory settings store for the dismiss flag — mirrors the
// VouchDiscoveryNudge harness. Keeps this test independent of Dexie.
const settings = new Map<string, string>();
vi.mock("@/db/database", async () => {
  const actual =
    await vi.importActual<typeof import("@/db/database")>("@/db/database");
  return {
    ...actual,
    getSetting: async (key: string) => settings.get(key),
    setSetting: async (key: string, value: string) => {
      settings.set(key, value);
    },
  };
});

// Drive the install posture by mocking the detection + capture
// surface rather than fighting UA strings. The rest of installGuide
// (the dismiss helpers, DEVICE_INSTRUCTIONS, SELECTABLE_DEVICES) is
// kept real so the component renders genuine instruction keys.
const mockEnv: { current: InstallEnvironment } = {
  current: { kind: "manual", device: "desktop" },
};
const promptMock = vi.fn(async () => {});
const deferredPrompt: {
  current: {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  } | null;
} = {
  current: null,
};

vi.mock("@/lib/installGuide", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/installGuide")>(
      "@/lib/installGuide",
    );
  return {
    ...actual,
    currentInstallEnvironment: () => mockEnv.current,
    getDeferredPrompt: () => deferredPrompt.current,
    subscribeInstallPrompt: () => () => {},
    subscribeStandalone: () => () => {},
    clearDeferredPrompt: () => {
      deferredPrompt.current = null;
    },
  };
});

import "@/i18n";
import { InstallGuide } from "./InstallGuide";
import { SETTING_KEYS } from "@/db/database";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

async function flushAsync() {
  // Drain the microtask queue so the hook's awaited getSetting call
  // resolves before assertions.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

// jsdom has no matchMedia — the hook's subscribeStandalone is mocked
// out, but the live wrapper still reads it; stub it defensively.
function stubMatchMedia(matches = false) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => {
  settings.clear();
  mockEnv.current = { kind: "manual", device: "desktop" };
  deferredPrompt.current = null;
  promptMock.mockClear();
  stubMatchMedia(false);
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

function render(variant: "card" | "panel" = "card") {
  act(() => {
    root = createRoot(container);
    root.render(
      <MemoryRouter>
        <InstallGuide variant={variant} />
      </MemoryRouter>,
    );
  });
}

describe("InstallGuide", () => {
  it("renders nothing when already installed", async () => {
    mockEnv.current = { kind: "installed" };
    render();
    await flushAsync();
    expect(container.textContent).toBe("");
  });

  it("promptable → shows the one-tap button and replays the prompt on click", async () => {
    mockEnv.current = { kind: "promptable" };
    deferredPrompt.current = {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: "dismissed", platform: "" }),
    };
    render();
    await flushAsync();
    const button = container.querySelector("button.btn-primary");
    expect(button).not.toBeNull();
    expect(button?.textContent).toContain("Add to home screen");

    await act(async () => {
      (button as HTMLButtonElement).click();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(promptMock).toHaveBeenCalledOnce();
  });

  it("card ios-safari → the one-line Share hint and the Share glyph, no <ol>", async () => {
    mockEnv.current = { kind: "ios-safari" };
    render();
    await flushAsync();
    // Minimal card: a single hint line, never the full step list.
    expect(container.querySelector("ol")).toBeNull();
    expect(container.textContent).toContain('Tap Share, then "Add to Home Screen"');
    // The iOS Share glyph (an inline SVG) renders on the hint line.
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("card ios-other → the open-in-Safari sentence", async () => {
    mockEnv.current = { kind: "ios-other" };
    render();
    await flushAsync();
    expect(container.querySelector("ol")).toBeNull();
    expect(container.textContent).toContain("only Safari can add an app");
  });

  it("card in-app-browser → the open-in-browser sentence, no steps", async () => {
    mockEnv.current = { kind: "in-app-browser" };
    render();
    await flushAsync();
    expect(container.textContent).toContain(
      "You're viewing Understoria inside another app",
    );
    expect(container.querySelector("ol")).toBeNull();
  });

  it("card manual android → the android hint plus a 'More help' link", async () => {
    mockEnv.current = { kind: "manual", device: "android" };
    render();
    await flushAsync();
    // Minimal: one hint line, no step list.
    expect(container.querySelector("ol")).toBeNull();
    expect(container.textContent).toContain("Open your browser's menu");
    // The "More help" link points out to the Learn panel on Profile.
    const link = Array.from(container.querySelectorAll("a")).find((a) =>
      a.textContent?.includes("More help"),
    );
    expect(link).toBeDefined();
    expect(link?.getAttribute("href")).toBe("/profile");
  });

  it("card dismiss → writes the sentinel and stays hidden on re-render", async () => {
    mockEnv.current = { kind: "ios-safari" };
    render("card");
    await flushAsync();
    expect(container.textContent).toContain("Keep Understoria one tap away");

    const dismiss = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Not now"),
    );
    expect(dismiss).toBeDefined();
    await act(async () => {
      (dismiss as HTMLButtonElement).click();
      await Promise.resolve();
      await Promise.resolve();
    });

    // The permanent-dismiss sentinel was written...
    expect(settings.get(SETTING_KEYS.installGuideDismissed)).toBe("1");
    // ...and the card is gone.
    expect(container.textContent).toBe("");

    // A fresh render in a "second session" stays hidden.
    act(() => {
      root.unmount();
    });
    render("card");
    await flushAsync();
    expect(container.textContent).toBe("");
  });

  it("panel variant has no dismiss button", async () => {
    mockEnv.current = { kind: "ios-safari" };
    render("panel");
    await flushAsync();
    expect(container.textContent).toContain("Add Understoria to your phone");
    const dismiss = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Not now"),
    );
    expect(dismiss).toBeUndefined();
  });

  it("panel renders the detected device's steps and a three-device toggle", async () => {
    mockEnv.current = { kind: "ios-safari" };
    render("panel");
    await flushAsync();
    // The full pictured steps render in the panel (not the card).
    const items = container.querySelectorAll("ol li");
    expect(items.length).toBe(3);
    expect(container.textContent).toContain("Tap the Share button");
    // The three-device toggle is buttons, NEVER a <select>.
    expect(container.querySelector("select")).toBeNull();
    const labels = Array.from(container.querySelectorAll("button")).map(
      (b) => b.textContent,
    );
    expect(labels).toContain("iPhone or iPad");
    expect(labels).toContain("Android");
    expect(labels).toContain("Computer");
    // No browser-named options survive the rework.
    expect(container.textContent).not.toContain("Samsung");
    expect(container.textContent).not.toContain("Using a different browser?");
  });

  it("panel device toggle → selecting Android swaps in the Android steps", async () => {
    mockEnv.current = { kind: "ios-safari" };
    render("panel");
    await flushAsync();
    // Defaults to the detected device (iOS) — its Safari intro shows.
    expect(container.textContent).toContain("In Safari");

    const androidBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "Android",
    );
    expect(androidBtn).toBeDefined();
    await act(async () => {
      (androidBtn as HTMLButtonElement).click();
      await Promise.resolve();
    });

    // The Android steps replace the iOS ones (an Android-only step
    // line proves the swap), and the toggle marks Android active.
    expect(container.textContent).toContain("Open your browser's menu");
    expect(container.textContent).not.toContain("Tap the Share button");
    expect(androidBtn?.getAttribute("aria-pressed")).toBe("true");
    const items = container.querySelectorAll("ol li");
    expect(items.length).toBe(3);
  });
});
