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
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BottomNav } from "./BottomNav";
import { CommandPalette } from "./CommandPalette";
import { LockScreen } from "./LockScreen";
import { OfflineBanner } from "./OfflineBanner";
import { ScrollToTop } from "./ScrollToTop";
import { SkipLink } from "./SkipLink";
import { ToastContainer } from "./ToastContainer";
import { UpdatePrompt } from "./UpdatePrompt";
import { useApp } from "@/state/AppContext";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { IllustrationSapling } from "@/components/visual";

export function Layout() {
  const { ready, lockState } = useApp();
  const locked = lockState === "locked";
  const online = useOnlineStatus();
  // While the offline banner is visible it hovers above the BottomNav,
  // so <main> reserves extra bottom clearance — content scrolled to the
  // very end must never hide behind the strip. Back online, the usual
  // clearance (floating FAB pills) returns.
  const mainPad =
    !locked && !online
      ? "pb-[calc(9.5rem+env(safe-area-inset-bottom))] lg:pb-36"
      : "pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-20";
  // App-shell layout: the shell is exactly one screen tall (100dvh)
  // and the DOCUMENT NEVER SCROLLS — all scrolling happens inside
  // <main>. The BottomNav is a plain flex footer in normal flow, so
  // it is at the bottom of the screen by construction, on every page,
  // with nothing measured and nothing to drift. This exists because
  // iOS pans/shrinks the layout viewport around the on-screen
  // keyboard and sometimes fails to restore it after dismissal, which
  // made `position: fixed; bottom: 0` chrome float mid-screen; and
  // the metric-based correction (measuring visualViewport divergence
  // and translating) trusted exactly the numbers iOS gets wrong, so
  // it could detach the nav in the OTHER direction. In-flow layout
  // consults no viewport metrics at all — and with the document
  // unscrollable, iOS has no document scroll state to corrupt in the
  // first place.
  // lg:flex-row-reverse: at desktop widths the same two flex children
  // (main, then BottomNav in DOM order) lay out as a row with the nav
  // on the LEFT — the "stretched phone app" pilot report. row-REVERSE
  // keeps the DOM order (and therefore tab order and the mobile
  // layout) byte-identical; only the visual axis changes. The nav
  // renders its vertical variant at lg (see BottomNav.tsx).
  // print:h-auto/print:overflow-visible (shell and <main> both): the
  // one-screen-tall clipped shell exists for iOS keyboard physics,
  // but paper has no keyboard — without these overrides everything
  // past the first viewport-height of any page is simply cut off in
  // print. Together with the print:hidden on nav/banner/toasts/FABs
  // this makes EVERY page print as its content, not its chrome.
  return (
    <div className="flex h-dvh flex-col overflow-hidden lg:flex-row-reverse print:block print:h-auto print:overflow-visible">
      <ScrollToTop />
      {!locked && <SkipLink targetId="main" />}
      <main
        id="main"
        // overscroll-contain: reaching the top/bottom of the inner
        // scroller must not chain into a document rubber-band that
        // drags the whole shell (nav included) off the screen edge.
        // relative: absolutely-positioned descendants (e.g. Tailwind
        // `sr-only`, which is position:absolute) must resolve their
        // containing block HERE, inside the scroller — anchored to
        // the document they escape the shell's clipping and quietly
        // re-open a document scroll range (found the hard way via an
        // sr-only <legend> deep in the Profile page).
        className="relative flex-1 overflow-y-auto overscroll-contain print:overflow-visible"
        tabIndex={-1}
      >
        <div
          className={`mx-auto max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-[1600px] ${mainPad}`}
        >
          {!ready ? (
            <Splash />
          ) : locked ? (
            <LockScreen />
          ) : (
            <Outlet />
          )}
        </div>
      </main>
      {!locked && <OfflineBanner />}
      {!locked && <BottomNav />}
      {!locked && <ToastContainer />}
      {!locked && <CommandPalette />}
      {/* Rendered even while locked: the notice is about the software
          itself, and a stale build on the lock screen is still stale. */}
      <UpdatePrompt />
    </div>
  );
}

function Splash() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-stack-sm px-6 text-center">
      <IllustrationSapling className="text-canopy-700 dark:text-canopy-300" />
      <p className="text-moss-600 dark:text-moss-300">{t("common.loading")}</p>
    </div>
  );
}
