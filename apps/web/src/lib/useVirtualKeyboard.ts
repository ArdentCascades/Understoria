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
// Why this exists: iOS Safari (browser tab and installed PWA alike)
// refuses to resize the LAYOUT viewport when the keyboard opens — it
// only pans the VISUAL viewport — and sometimes leaves the layout
// viewport shrunken or panned even after the keyboard dismisses.
// Android Chrome has defaulted to the same resizes-visual behavior
// since 108. Chrome (the BottomNav, banners, toasts, FABs) therefore
// can't be trusted to `position: fixed` its way to the visible
// bottom while a member types.
//
// The app's defenses, in order of importance:
//
// 1. STRUCTURAL (Layout.tsx): the app is a 100dvh flex shell whose
//    document never scrolls; all scrolling happens inside <main>, and
//    the BottomNav is an in-flow footer. It sits at the bottom of the
//    screen because flexbox puts it there — no viewport metric is
//    consulted, so there is nothing to drift. (An earlier approach
//    measured the visualViewport divergence and translated fixed
//    chrome to match; it trusted exactly the numbers iOS gets wrong
//    in its stuck states and could detach the nav in the OTHER
//    direction. Don't reintroduce it.)
//
// 2. THIS HOOK: while the keyboard is up, transient fixed overlays
//    (FAB pills, banners, toasts) hide, and the nav unmounts —
//    navigation is useless mid-typing, and iOS draws the keyboard
//    over the shell's bottom edge anyway.
//
// Detection: the visual viewport is substantially shorter than the
// window AND a text field actually has focus. `height * scale`
// normalizes pinch-zoom — zooming in shrinks `visualViewport.height`
// by exactly the zoom factor, so the product stays ≈ `innerHeight`
// and zoom alone never reads as a keyboard. The 150px floor ignores
// small chrome (URL-bar collapse, keyboard accessory bars) while
// every real phone keyboard is ≥ ~40% of the screen. External /
// hardware keyboards never shrink the viewport, so the nav correctly
// stays put for those members.
//
// The FOCUS gate exists for iOS rotation (field report: "no nav bar
// in landscape"). On rotation Safari fires the visualViewport
// `resize` BEFORE `window.innerHeight` has updated, so the math
// briefly compares landscape visual height against portrait window
// height (844 − 390 = 454 > 150 → "keyboard open") — and since no
// later visualViewport event need fire, the false positive could
// stick for the entire landscape session, unmounting the nav, FABs,
// and banners. A keyboard can only be up while an editable element
// has focus, so gating on focus makes every no-typing false positive
// structurally impossible; the hook also re-evaluates on `window`
// resize / orientationchange so the math itself heals once
// innerHeight settles.
//
// SSR / pre-mount / no-VisualViewport-API default is `false` (nav
// visible) — the API is universal on the mobile browsers that have
// the bug, and desktop browsers without it don't show an on-screen
// keyboard.

export const KEYBOARD_MIN_OVERLAP_PX = 150;

/** True for elements whose focus can summon an on-screen keyboard
 *  (or, for `<select>`, the picker panel some platforms size like
 *  one — included so its behavior matches the pre-gate hook). */
export function isEditableElement(el: Element | null | undefined): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return (el as HTMLElement).isContentEditable === true;
}

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
      setOpen(
        isEditableElement(document.activeElement) &&
          isKeyboardViewport(viewport, window.innerHeight),
      );
    update();
    // visualViewport `resize` fires on keyboard open/close and on
    // pinch-zoom (scale-corrected in isKeyboardViewport). `window`
    // resize + orientationchange re-run the math after rotation,
    // when innerHeight settles LATER than the visualViewport event
    // (the iOS ordering quirk documented above). focusin/focusout
    // keep the editable-focus gate current — blurring a field drops
    // the "open" state even if a final viewport event never comes.
    viewport.addEventListener("resize", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.addEventListener("focusin", update);
    window.addEventListener("focusout", update);
    return () => {
      viewport.removeEventListener("resize", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("focusin", update);
      window.removeEventListener("focusout", update);
    };
  }, []);

  return open;
}
