/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  isKeyboardViewport,
  KEYBOARD_MIN_OVERLAP_PX,
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
