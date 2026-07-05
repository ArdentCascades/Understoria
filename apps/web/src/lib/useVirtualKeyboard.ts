/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useEffect, useState, type CSSProperties } from "react";

// Keeps fixed-bottom chrome attached to the bottom the member SEES.
//
// Why this exists: `position: fixed; bottom: 0` pins to the LAYOUT
// viewport, and iOS Safari (browser tab and installed PWA alike)
// refuses to resize the layout viewport when the keyboard opens — it
// only pans the VISUAL viewport. Every fixed-bottom element (the
// BottomNav, the OfflineBanner strip) therefore "detaches" and floats
// mid-screen above the keyboard while a member types. Android Chrome
// has defaulted to the same resizes-visual behavior since 108. There
// is no CSS that glues a fixed element to the visual viewport, so the
// strategy has two parts:
//
// 1. While the keyboard is OPEN (`useVirtualKeyboardOpen`): hide the
//    chrome. Navigation is useless mid-typing, and no transform can
//    make a bar hovering above the keyboard look intentional.
//
// 2. While the keyboard is CLOSED (`useVisualViewportBottomGap`):
//    correct for any remaining divergence between the two viewports.
//    iOS sometimes leaves the layout viewport shrunken or panned
//    AFTER the keyboard dismisses (until the next scroll settles it),
//    so `bottom: 0` chrome renders mid-screen with page content
//    visible BELOW it, even though no keyboard is up. The hook
//    measures how far the layout viewport's bottom edge sits from the
//    visual viewport's bottom edge and the chrome translates by that
//    amount — re-gluing itself to the visible bottom.
//
// Keyboard detection: the visual viewport is substantially shorter
// than the window. `height * scale` normalizes pinch-zoom — zooming
// in shrinks `visualViewport.height` by exactly the zoom factor, so
// the product stays ≈ `innerHeight` and zoom alone never reads as a
// keyboard. The 150px floor ignores small chrome (URL-bar collapse,
// keyboard accessory bars) while every real phone keyboard is
// ≥ ~40% of the screen. External/hardware keyboards never shrink the
// viewport, so the nav correctly stays put for those members.
//
// SSR / pre-mount / no-VisualViewport-API default is `false` (nav
// visible) / gap 0 — the API is universal on the mobile browsers that
// have the bug, and desktop browsers without it don't show an
// on-screen keyboard.

export const KEYBOARD_MIN_OVERLAP_PX = 150;

export function isKeyboardViewport(
  viewport: { height: number; scale: number } | null | undefined,
  windowInnerHeight: number,
): boolean {
  if (!viewport) return false;
  return (
    windowInnerHeight - viewport.height * viewport.scale >
    KEYBOARD_MIN_OVERLAP_PX
  );
}

export function useVirtualKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () =>
      setOpen(isKeyboardViewport(viewport, window.innerHeight));
    update();
    // `resize` fires on keyboard open/close and on pinch-zoom; the
    // scale correction in isKeyboardViewport keeps zoom from hiding
    // the nav.
    viewport.addEventListener("resize", update);
    return () => viewport.removeEventListener("resize", update);
  }, []);

  return open;
}

/**
 * How many CSS px the visual viewport's bottom edge sits BELOW the
 * layout viewport's bottom edge — i.e. how far a `fixed; bottom: 0`
 * element must translate DOWN to reach the bottom the member sees.
 *
 * Normally 0. Positive in the post-keyboard stuck state (iOS left the
 * layout viewport shrunken/panned after dismissal, so fixed chrome
 * floats mid-screen with content visible below it). Negative for
 * small keyboard chrome under the 150px hide threshold (an accessory
 * bar with a hardware keyboard), where translating UP keeps the
 * chrome visible above it.
 *
 * Pinch-zoom (scale ≠ 1) returns 0: zoomed in, fixed elements
 * classically magnify and pan with the page, and chasing the visual
 * viewport during a pinch would make the nav swim over the content.
 */
export function visualViewportBottomGap(
  viewport:
    | { height: number; offsetTop: number; scale: number }
    | null
    | undefined,
  windowInnerHeight: number,
): number {
  if (!viewport) return 0;
  if (Math.abs(viewport.scale - 1) > 0.01) return 0;
  const gap = viewport.offsetTop + viewport.height - windowInnerHeight;
  // Sub-pixel noise (fractional viewport heights) must not churn
  // re-renders or leave hairline transforms behind.
  return Math.abs(gap) < 1 ? 0 : gap;
}

export function useVisualViewportBottomGap(): number {
  const [gap, setGap] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const viewport = window.visualViewport;
    if (!viewport) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setGap(visualViewportBottomGap(viewport, window.innerHeight));
    };
    // rAF-batched: `scroll` fires continuously while iOS settles the
    // viewport and during keyboard pans; one measurement per frame is
    // plenty and keeps the glue from janking the scroll.
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    update();
    viewport.addEventListener("resize", schedule);
    // `scroll` (not just `resize`): panning changes `offsetTop`
    // without a resize, and the post-keyboard stuck state often
    // resolves through a scroll — both must re-measure.
    viewport.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", schedule);
      viewport.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return gap;
}

/** Inline style re-gluing a `fixed; bottom: *` element to the visual
 *  viewport's bottom. `undefined` when aligned, so elements keep
 *  their stock stacking/containing-block behavior except while a
 *  correction is actually needed. */
export function visualViewportGlueStyle(
  gap: number,
): CSSProperties | undefined {
  if (gap === 0) return undefined;
  return { transform: `translate3d(0, ${gap}px, 0)` };
}
