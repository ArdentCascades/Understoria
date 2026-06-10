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
import { LockScreen } from "./LockScreen";
import { OfflineBanner } from "./OfflineBanner";
import { ScrollToTop } from "./ScrollToTop";
import { SkipLink } from "./SkipLink";
import { ToastContainer } from "./ToastContainer";
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
  // nav-only clearance returns.
  const mainPad =
    !locked && !online
      ? "flex-1 pb-[calc(9.5rem+env(safe-area-inset-bottom))] lg:pb-36"
      : "flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-20";
  return (
    <div className="mx-auto flex min-h-dvh max-w-screen-md flex-col lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-[1440px]">
      <ScrollToTop />
      {!locked && <SkipLink targetId="main" />}
      <main id="main" className={mainPad} tabIndex={-1}>
        {!ready ? (
          <Splash />
        ) : locked ? (
          <LockScreen />
        ) : (
          <Outlet />
        )}
      </main>
      {!locked && <OfflineBanner />}
      {!locked && <BottomNav />}
      {!locked && <ToastContainer />}
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
