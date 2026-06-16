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

// Ambient declarations for two browser surfaces that ship in real
// engines but are NOT in TypeScript's standard `lib: ["DOM"]` types:
//
//   - `BeforeInstallPromptEvent` — fired by Chromium browsers when the
//     PWA install criteria are met. We capture it (preventing the
//     default mini-infobar) so the in-app one-tap install button can
//     replay it on the member's terms. See `lib/installGuide.ts`.
//   - `navigator.standalone` — a non-standard iOS Safari boolean that
//     is `true` when the page is running as an installed home-screen
//     web app. Read via a narrowing cast so the rest of the code stays
//     strict-clean (see `isStandalone`).

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface NavigatorStandalone {
  standalone?: boolean;
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
}
