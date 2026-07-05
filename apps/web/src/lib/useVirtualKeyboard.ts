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
import { useEffect, useState } from "react";

// Tracks whether the on-screen (virtual) keyboard is open.
//
// Why this exists: `position: fixed; bottom: 0` pins to the LAYOUT
// viewport, and iOS Safari (browser tab and installed PWA alike)
// refuses to resize the layout viewport when the keyboard opens — it
// only pans the VISUAL viewport. Every fixed-bottom element (the
// BottomNav, the OfflineBanner strip) therefore "detaches" and floats
// mid-screen above the keyboard while a member types. Android Chrome
// has defaulted to the same resizes-visual behavior since 108. There
// is no CSS that glues a fixed element to the visual viewport, so the
// honest fix is to hide chrome that is useless mid-typing anyway and
// restore it when the keyboard closes.
//
// Detection: the visual viewport is substantially shorter than the
// window. `height * scale` normalizes pinch-zoom — zooming in shrinks
// `visualViewport.height` by exactly the zoom factor, so the product
// stays ≈ `innerHeight` and zoom alone never reads as a keyboard.
// The 150px floor ignores small chrome (URL-bar collapse, keyboard
// accessory bars) while every real phone keyboard is ≥ ~40% of the
// screen. External/hardware keyboards never shrink the viewport, so
// the nav correctly stays put for those members.
//
// SSR / pre-mount / no-VisualViewport-API default is `false` (nav
// visible) — the API is universal on the mobile browsers that have
// the bug, and desktop browsers without it don't show an on-screen
// keyboard.

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
