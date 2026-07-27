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
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MeMenu } from "@/components/MeMenu";
import { IconMenu } from "@/components/visual";

// The global header band. Slim on purpose — it exists to (a) hold the
// me-menu button in the top-right corner every platform convention
// says "account stuff" lives in, and (b) put the app's name on screen,
// which no other chrome does (useful on a borrowed or kiosk-adjacent
// device). It is an in-flow flex child of the one-screen-tall app
// shell (Layout.tsx), the same no-position-fixed discipline as the
// BottomNav — nothing here consults viewport metrics, so iOS keyboard
// physics can't detach it.
//
// Chromeless surfaces never see it: /present and the welcome flow
// render outside <Layout>, print hides it (print:hidden), and the
// lock screen suppresses it in Layout (identity chrome on a locked
// app would be noise at best).
export function AppHeader() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  // The drawer's ✕ sits directly over this button, so a mouse-close
  // leaves the cursor parked here and the hover tint reads as "the
  // menu is still on". Mute hover styling when the drawer closes and
  // re-arm it only when the pointer actually LEAVES once — not on
  // enter/move, because Chromium re-fires those synthetically the
  // moment the drawer unmounts under a motionless cursor. Keyboard
  // users are untouched (focus-visible is separate).
  const [hoverMuted, setHoverMuted] = useState(false);
  const unmuteHover = useCallback(() => setHoverMuted(false), []);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  // Focus returns to the button explicitly: the drawer UNMOUNTS on
  // close, and by the time the focus trap's cleanup runs the panel is
  // already out of the DOM (focus has fallen to <body>), so its
  // restore-only-if-still-inside guard correctly declines.
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setHoverMuted(true);
    buttonRef.current?.focus();
  }, []);

  return (
    <header
      className="z-30 shrink-0 border-b border-moss-200 bg-white/95 pt-[env(safe-area-inset-top)]
                 backdrop-blur supports-[backdrop-filter]:bg-white/70
                 dark:border-moss-800 dark:bg-moss-950/95 print:hidden"
    >
      {/* landscape-short (phone held sideways — tailwind.config.js):
          the band compacts from 44px to 40px, one of the few places
          the 44px touch-target floor bends — vertical pixels are the
          scarce resource in this regime, the menu button stays ≥44px
          wide, and 40px still clears WCAG 2.2 AA's 24px minimum. */}
      <div className="flex h-11 items-center justify-between pl-4 pr-1 landscape-short:h-10">
        <span className="select-none text-sm font-semibold tracking-tight text-canopy-800 dark:text-canopy-200">
          {"Understoria"}
        </span>
        <button
          ref={buttonRef}
          type="button"
          className={`touch-target flex items-center justify-center rounded-xl px-3 py-2 text-moss-600 dark:text-moss-300 landscape-short:min-h-0 landscape-short:py-1.5 ${
            hoverMuted
              ? ""
              : "hover:bg-moss-100 hover:text-moss-900 dark:hover:bg-moss-800 dark:hover:text-moss-50"
          }`}
          aria-label={t("menu.open")}
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          onClick={() => setMenuOpen(true)}
          onPointerLeave={unmuteHover}
        >
          <IconMenu size={22} />
        </button>
      </div>
      <MeMenu open={menuOpen} onClose={closeMenu} />
    </header>
  );
}
