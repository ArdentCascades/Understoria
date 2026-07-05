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
import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Resets scroll to the top on every forward route change so a
// member who's scrolled mid-page on (say) Profile and taps a link to
// another route lands at the top of the destination page instead of
// at whatever Y-offset the browser was holding.
//
// The app shell scrolls INSIDE `<main id="main">` (the document
// itself never scrolls — see Layout.tsx), so this resets the main
// scroller; the window call stays as a belt-and-braces no-op for any
// environment where the document somehow scrolled.
//
// Skips POP navigations (browser back/forward). NOTE: with an inner
// scroller the browser no longer restores scroll on Back natively —
// Back simply keeps the current scroll position of the container,
// which for same-container navigation reads as "don't jump". REPLACE
// navigations stay at the current pathname (e.g. Board's `?tab=`
// toggle) and don't trigger the effect because pathname is the
// dependency.
//
// Hash-only changes (anchor links like `#section`) also don't fire
// because pathname doesn't change. ScrollRestoration from the
// react-router data-router API would handle this more elaborately,
// but the app uses the declarative `<BrowserRouter>` + `<Routes>`
// setup, where a small effect like this is the right tool.
//
// On forward navigation it also moves focus to `<main>` so
// screen-reader and keyboard users get a page-change cue instead of
// landing on stale focus (WCAG 2.4.3). The `<main id="main"
// tabIndex={-1}>` in Layout.tsx already exists as the skip-link
// target; the negative tabindex lets it take programmatic focus
// without becoming a Tab stop. POP/REPLACE are left alone so Back
// preserves both scroll position and focus.
//
// Renders nothing.
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    if (navType === "PUSH") {
      const main = document.getElementById("main");
      main?.scrollTo(0, 0);
      window.scrollTo(0, 0);
      main?.focus();
    }
  }, [pathname, navType]);
  return null;
}
