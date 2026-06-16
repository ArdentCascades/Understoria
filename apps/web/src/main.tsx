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
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "@/state/AppContext";
import { ToastProvider } from "@/state/ToastContext";
import App from "./App";
import { initInstallCapture } from "@/lib/installGuide";
import "./i18n";
// Variable serif used for page-level titles only. Browsers load
// only the unicode-range subsets they need via @font-face rules
// shipped by @fontsource-variable.
import "@fontsource-variable/source-serif-4";
import "./index.css";

// Capture `beforeinstallprompt` before React mounts — Chromium fires
// it early, so the listener must be installed at module load. See
// lib/installGuide.ts.
initInstallCapture();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
