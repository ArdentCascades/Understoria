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
import { useEffect, useState } from "react";

// Returns `true` if the user has expressed a preference for
// reduced motion at the OS level (Reduce Motion on iOS / macOS,
// "Show animations" off on Android / Windows, etc.). Components
// that animate consult this to skip or shorten transitions.
//
// Updates live: if the user toggles the OS setting while the app
// is open, the hook re-renders with the new value.
//
// Default during SSR or pre-mount is `false` (preserve the
// shipped animation behaviour). Components should still produce
// sensible output without animation if reduced-motion is true —
// don't use it to gate critical content, only to skip transitions.

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    // Older browsers used `addListener` / `removeListener`; modern
    // ones use addEventListener. Prefer the modern API; fall back
    // for the older one (Safari ≤ 13).
    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    const legacyMql = mql as MediaQueryList & {
      addListener: (h: (e: MediaQueryListEvent) => void) => void;
      removeListener: (h: (e: MediaQueryListEvent) => void) => void;
    };
    legacyMql.addListener(handler);
    return () => legacyMql.removeListener(handler);
  }, []);

  return reduced;
}
