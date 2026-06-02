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

// Resets window scroll to the top on every forward route change so a
// member who's scrolled mid-page on (say) Profile and taps a link to
// another route lands at the top of the destination page instead of
// at whatever Y-offset the browser was holding.
//
// Skips POP navigations (browser back/forward) so the browser's
// native scroll restoration wins — pressing Back should return to
// the previous scroll position, not jump to the top. REPLACE
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
      window.scrollTo(0, 0);
      document.getElementById("main")?.focus();
    }
  }, [pathname, navType]);
  return null;
}
