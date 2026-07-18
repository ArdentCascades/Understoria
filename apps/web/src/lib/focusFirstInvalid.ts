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

// Scroll-to-first-error on failed submit. The forms built on
// `useFieldValidation` (lib/validation.ts) surface inline errors by
// marking each errored field `aria-invalid="true"` — but on a short
// viewport (a phone held sideways especially) the errored field can
// sit scrolled off-screen, so tapping Submit looks like "nothing
// happened". This helper is the missing half of the pattern: call it
// right after `markAllTouched()` when `hasErrors` blocks the submit,
// and the first invalid field scrolls into view and takes focus (focus
// also makes screen readers announce the field and its error, which is
// wired via aria-describedby).
//
// Deferred one frame: `markAllTouched()` only queues the state update
// that renders the `aria-invalid` attributes — at call time the DOM
// may not carry them yet. React flushes the update synchronously at
// the end of the submit handler, before the next animation frame, so
// a rAF (setTimeout(0) where rAF is missing) is exactly late enough.
//
// jsdom guards: `scrollIntoView` doesn't exist there (feature-checked),
// and `requestAnimationFrame` falls back to a 0-timeout.

/**
 * Scroll the first `aria-invalid="true"` field within `root` (the
 * whole document when omitted) into view and move focus to it.
 * No-op when nothing is invalid.
 */
export function focusFirstInvalidField(root?: ParentNode | null): void {
  const scope: ParentNode | null =
    root ?? (typeof document !== "undefined" ? document : null);
  if (!scope) return;
  const schedule: (cb: () => void) => void =
    typeof requestAnimationFrame === "function"
      ? (cb) => requestAnimationFrame(() => cb())
      : (cb) => void setTimeout(cb, 0);
  schedule(() => {
    const el = scope.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!el) return;
    if (typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    // preventScroll: the smooth scroll above is the one scroll we
    // want; focus's own instant jump would cut it short.
    el.focus({ preventScroll: true });
  });
}
