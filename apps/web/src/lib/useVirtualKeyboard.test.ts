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
  visualViewportBottomGap,
  visualViewportGlueStyle,
} from "./useVirtualKeyboard";

// The decision function behind hiding fixed-bottom chrome (BottomNav,
// OfflineBanner, toasts, FABs) while the on-screen keyboard is up —
// the "detached menu floating mid-screen" fix. iOS/Android pan the
// VISUAL viewport for the keyboard but leave the LAYOUT viewport
// (which position:fixed pins to) untouched.

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

// The other half of the strategy: with the keyboard CLOSED, how far
// must fixed-bottom chrome translate to sit on the bottom the member
// actually sees? Non-zero exactly in iOS's post-keyboard stuck state
// — the layout viewport stays shrunken/panned after dismissal, the
// hide-while-typing hook correctly reports "closed", and the nav
// renders mid-screen with page content visible below it.
describe("visualViewportBottomGap", () => {
  it("is 0 when the viewports agree (the normal state)", () => {
    expect(
      visualViewportBottomGap(
        { height: WINDOW_H, offsetTop: 0, scale: 1 },
        WINDOW_H,
      ),
    ).toBe(0);
  });

  it("translates DOWN when iOS leaves the layout viewport shrunken after keyboard dismissal", () => {
    // Keyboard closed: visual viewport restored to full height, but
    // window.innerHeight is stuck at the keyboard-shrunken value.
    // isKeyboardViewport reads this as closed (overlap is negative),
    // so the nav is VISIBLE — and 336px adrift without the glue.
    const stuckInnerHeight = WINDOW_H - 336;
    expect(
      isKeyboardViewport(
        { height: WINDOW_H, scale: 1 },
        stuckInnerHeight,
      ),
    ).toBe(false);
    expect(
      visualViewportBottomGap(
        { height: WINDOW_H, offsetTop: 0, scale: 1 },
        stuckInnerHeight,
      ),
    ).toBe(336);
  });

  it("accounts for a panned visual viewport (offsetTop)", () => {
    expect(
      visualViewportBottomGap(
        { height: WINDOW_H - 100, offsetTop: 100, scale: 1 },
        WINDOW_H,
      ),
    ).toBe(0);
    expect(
      visualViewportBottomGap(
        { height: WINDOW_H - 100, offsetTop: 250, scale: 1 },
        WINDOW_H,
      ),
    ).toBe(150);
  });

  it("translates UP for small keyboard chrome under the hide threshold", () => {
    // A hardware-keyboard accessory bar (~80px) never trips the
    // 150px hide threshold, so the visible nav tucks above it.
    expect(
      visualViewportBottomGap(
        { height: WINDOW_H - 80, offsetTop: 0, scale: 1 },
        WINDOW_H,
      ),
    ).toBe(-80);
  });

  it("stays put while pinch-zoomed (classic fixed behavior)", () => {
    expect(
      visualViewportBottomGap(
        { height: WINDOW_H / 2, offsetTop: 120, scale: 2 },
        WINDOW_H,
      ),
    ).toBe(0);
  });

  it("ignores sub-pixel viewport noise", () => {
    expect(
      visualViewportBottomGap(
        { height: WINDOW_H - 0.4, offsetTop: 0, scale: 1 },
        WINDOW_H,
      ),
    ).toBe(0);
  });

  it("is 0 when the VisualViewport API is absent", () => {
    expect(visualViewportBottomGap(null, WINDOW_H)).toBe(0);
    expect(visualViewportBottomGap(undefined, WINDOW_H)).toBe(0);
  });
});

describe("visualViewportGlueStyle", () => {
  it("returns no style when aligned, a translate when adrift", () => {
    expect(visualViewportGlueStyle(0)).toBeUndefined();
    expect(visualViewportGlueStyle(336)).toEqual({
      transform: "translate3d(0, 336px, 0)",
    });
    expect(visualViewportGlueStyle(-80)).toEqual({
      transform: "translate3d(0, -80px, 0)",
    });
  });
});
