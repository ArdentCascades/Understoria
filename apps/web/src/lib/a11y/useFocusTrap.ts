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
import { useEffect, type RefObject } from "react";
import { getFocusableElements, nextFocusable } from "./focusable";

// Traps Tab focus inside `containerRef.current` while `isOpen` is
// true. On open, moves focus to the first focusable element inside
// the container (or the container itself if it's tabindex'd).
// On close, restores focus to whatever was focused before the trap
// activated.
//
// Esc handling is intentionally NOT part of this hook — different
// modals dismiss differently, and conflating "close the modal"
// with "trap focus" produces hooks that callers have to fight
// against. Callers wire their own Esc handler if they want one.
//
// Mouse clicks outside the container are not blocked. WCAG only
// requires keyboard containment; click-outside-to-dismiss is a
// modal-design choice, not a focus-trap concern.

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
): void {
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Initial focus: first focusable child, else the container
    // itself if it's been given tabindex. preventScroll, because the
    // container may still be mid-entrance-transition (the MeMenu
    // drawer is focused while translated past the viewport edge) —
    // without it the browser scrolls an overflow-hidden ancestor
    // sideways to "reveal" the target and shoves the whole app shell
    // over. Every consumer is a fixed-position dialog; none needs a
    // scroll to become visible.
    const initial = getFocusableElements(container);
    if (initial.length > 0) {
      initial[0].focus({ preventScroll: true });
    } else if (container.tabIndex >= 0) {
      container.focus({ preventScroll: true });
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusables = getFocusableElements(container!);
      if (focusables.length === 0) {
        // Nothing to cycle through; prevent default so focus can't
        // escape into the background page.
        e.preventDefault();
        return;
      }
      const direction = e.shiftKey ? "backward" : "forward";
      const next = nextFocusable(document.activeElement, focusables, direction);
      // Only intercept when the trap actually has to wrap — for
      // mid-list Tab presses we let the browser do the work.
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const atBoundary =
        (direction === "forward" && document.activeElement === last) ||
        (direction === "backward" && document.activeElement === first) ||
        !container!.contains(document.activeElement);
      if (next && atBoundary) {
        e.preventDefault();
        next.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Restore focus, but only if our trap's element is still the
      // one with focus — don't yank focus away from whatever the
      // user has moved on to.
      if (
        previouslyFocused &&
        document.activeElement &&
        container.contains(document.activeElement)
      ) {
        previouslyFocused.focus?.();
      }
    };
  }, [containerRef, isOpen]);
}
