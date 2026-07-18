/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isEditableElement,
  isKeyboardViewport,
  KEYBOARD_MIN_OVERLAP_PX,
  useVirtualKeyboardOpen,
} from "./useVirtualKeyboard";

// The decision function behind hiding fixed-bottom overlays
// (OfflineBanner, toasts, FABs) and unmounting the BottomNav while
// the on-screen keyboard is up. iOS/Android pan the VISUAL viewport
// for the keyboard but leave the LAYOUT viewport untouched. Note the
// nav's at-rest position is guaranteed STRUCTURALLY (in-flow footer
// of the non-scrolling 100dvh app shell — see Layout.tsx), not by
// this hook; this only governs the mid-typing hide.

const WINDOW_H = 844; // iPhone-ish logical height

describe("isKeyboardViewport", () => {
  it("reads a keyboard-sized viewport shrink as open", () => {
    // Real keyboards are ~40% of the screen.
    expect(
      isKeyboardViewport({ height: WINDOW_H - 336, scale: 1 }, WINDOW_H),
    ).toBe(true);
  });

  it("ignores small chrome shifts (URL bar collapse, accessory bars)", () => {
    expect(
      isKeyboardViewport(
        { height: WINDOW_H - KEYBOARD_MIN_OVERLAP_PX, scale: 1 },
        WINDOW_H,
      ),
    ).toBe(false);
    expect(isKeyboardViewport({ height: WINDOW_H, scale: 1 }, WINDOW_H)).toBe(
      false,
    );
  });

  it("does NOT read pinch-zoom as a keyboard (scale-corrected)", () => {
    // Zooming to 2x halves visualViewport.height, but height*scale
    // stays ≈ innerHeight — the nav must stay visible while zoomed.
    expect(
      isKeyboardViewport({ height: WINDOW_H / 2, scale: 2 }, WINDOW_H),
    ).toBe(false);
  });

  it("detects the keyboard even while pinch-zoomed", () => {
    // Zoomed 2x AND keyboard open: the scaled height falls short of
    // the window by the keyboard's height.
    expect(
      isKeyboardViewport({ height: (WINDOW_H - 336) / 2, scale: 2 }, WINDOW_H),
    ).toBe(true);
  });

  it("defaults closed when the VisualViewport API is absent", () => {
    expect(isKeyboardViewport(null, WINDOW_H)).toBe(false);
    expect(isKeyboardViewport(undefined, WINDOW_H)).toBe(false);
  });
});

describe("isEditableElement", () => {
  it("recognizes the elements whose focus can summon a keyboard", () => {
    for (const tag of ["input", "textarea", "select"]) {
      expect(isEditableElement(document.createElement(tag))).toBe(true);
    }
    const editable = document.createElement("div");
    Object.defineProperty(editable, "isContentEditable", { value: true });
    expect(isEditableElement(editable)).toBe(true);
  });

  it("rejects everything else (body, buttons, null)", () => {
    expect(isEditableElement(document.body)).toBe(false);
    expect(isEditableElement(document.createElement("button"))).toBe(false);
    expect(isEditableElement(null)).toBe(false);
    expect(isEditableElement(undefined)).toBe(false);
  });
});

// The hook itself, against the iOS rotation ordering quirk (field
// report: "no nav bar in landscape"). Safari fires the visualViewport
// `resize` BEFORE window.innerHeight updates on rotation, so the raw
// math transiently reads a portrait window height against a landscape
// visual height (844 − 390 > 150) with NO keyboard anywhere — and no
// later visualViewport event need ever correct it. The focus gate
// must swallow that; a real keyboard (editable focused + shrunk
// viewport) must still read as open; and a `window` resize event must
// re-run the math once innerHeight settles.
describe("useVirtualKeyboardOpen — rotation false-positive gate", () => {
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;
  let vvListeners: Array<() => void> = [];
  const fakeViewport = { height: 844, scale: 1 } as {
    height: number;
    scale: number;
    addEventListener?: unknown;
    removeEventListener?: unknown;
  };

  function installFakeViewport() {
    vvListeners = [];
    fakeViewport.addEventListener = (_: string, fn: () => void) => {
      vvListeners.push(fn);
    };
    fakeViewport.removeEventListener = (_: string, fn: () => void) => {
      vvListeners = vvListeners.filter((l) => l !== fn);
    };
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: fakeViewport,
    });
  }

  function setInnerHeight(h: number) {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: h,
    });
  }

  let latest = false;
  function Probe() {
    latest = useVirtualKeyboardOpen();
    return null;
  }

  function mount() {
    host = document.createElement("div");
    document.body.appendChild(host);
    act(() => {
      root = createRoot(host!);
      root.render(<Probe />);
    });
  }

  afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    root = null;
    host = null;
    delete (window as { visualViewport?: unknown }).visualViewport;
    vi.restoreAllMocks();
  });

  it("ignores a keyboard-sized mismatch when nothing editable is focused (rotation race)", () => {
    installFakeViewport();
    setInnerHeight(844);
    fakeViewport.height = 844;
    mount();
    expect(latest).toBe(false);

    // Rotation: visualViewport already landscape, innerHeight still
    // portrait — the exact stuck state from the field report.
    fakeViewport.height = 390;
    act(() => {
      vvListeners.forEach((l) => l());
    });
    expect(latest).toBe(false);

    // innerHeight settles; window resize re-runs the math. Still no
    // keyboard, still visible.
    setInnerHeight(390);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(latest).toBe(false);
  });

  it("still reports a real keyboard: editable focused + shrunk viewport", () => {
    installFakeViewport();
    setInnerHeight(844);
    fakeViewport.height = 844;
    mount();

    const input = document.createElement("input");
    document.body.appendChild(input);
    act(() => {
      input.focus();
    });
    // Keyboard opens: visual viewport loses ~40% of the screen.
    fakeViewport.height = 844 - 336;
    act(() => {
      vvListeners.forEach((l) => l());
    });
    expect(latest).toBe(true);

    // Blur (keyboard dismissed): focusout alone restores the chrome
    // even if no final visualViewport event arrives.
    fakeViewport.height = 844;
    act(() => {
      input.blur();
    });
    expect(latest).toBe(false);
    input.remove();
  });
});
