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
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AppProvider } from "@/state/AppContext";
import { ToastProvider } from "@/state/ToastContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import App from "./App";
import { initInstallCapture } from "@/lib/installGuide";
import { installPrintThemeGuard } from "@/lib/theme";
import { isDesktopShell } from "@/lib/desktop";
import { primeShareOrigin } from "@/lib/appOrigin";
import { readSubmitConfig } from "@/lib/nodeSubmit";
import { i18nReady } from "./i18n";
// Variable serif used for page-level titles only. Browsers load
// only the unicode-range subsets they need via @font-face rules
// shipped by @fontsource-variable.
import "@fontsource-variable/source-serif-4";
import "./index.css";

// Capture `beforeinstallprompt` before React mounts — Chromium fires
// it early, so the listener must be installed at module load. See
// lib/installGuide.ts.
initInstallCapture();
// Paper is always light: strip the dark class while the print dialog
// is open so `dark:` rules can't outrank the sheets' print: styles.
installPrintThemeGuard();

// Desktop shell (app://): share links can't use this origin — prime
// the public origin from the configured node URL before first render
// needs it. Fire-and-forget: shareOrigin() falls back safely until
// the read lands, and writeSubmitConfig re-primes on every change.
if (isDesktopShell()) {
  void readSubmitConfig().then((cfg) => primeShareOrigin(cfg.url));
}

// First render waits for the detected language's resources (English
// is bundled and instant; any other locale is one same-origin,
// SW-cached chunk) so a returning Spanish speaker never sees an
// English flash. If that fetch fails — first visit, offline — we
// render anyway and i18next falls back to English honestly.
void i18nReady
  .catch(() => {
    /* fall back to the bundled English rather than never mounting */
  })
  .then(() => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <AppProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </AppProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>,
    );
  });
