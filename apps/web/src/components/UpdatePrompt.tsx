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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useToast } from "@/state/ToastContext";
import { useVirtualKeyboardOpen } from "@/lib/useVirtualKeyboard";

// This is an infrastructure-reliability notice, not an engagement
// notification. It renders only while the member already has the app
// open, never buzzes or badges, and exists so members aren't silently
// running stale code after a deploy (which has caused real confusion
// on the live node). One tap, one reload, done. See no-notifications
// in content/design-principles.ts — the principle forbids urgency
// theater, not honesty about the software itself.
//
// Why not the toast system: ToastContext persists only error-tone
// toasts (rose, role="alert") and allows one toast at a time, so a
// long-lived update notice would either look like an alarm or get
// clobbered by the next "Posted." confirmation. Rather than contort
// that, this renders as its own calm fixed card above the bottom nav
// (bottom-right at lg+).
//
// Dismissal is session-scoped component state: tapping "Later" hides
// the notice until the next full app open — it never re-nags within
// the session. On the next open, if the update is still waiting,
// the prompt renders again: a fresh pull, not a repeat push.

export function UpdatePrompt() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const keyboardOpen = useVirtualKeyboardOpen();

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onOfflineReady() {
      // First successful precache: a brief auto-dismissing courtesy
      // via the existing toast system (info tone auto-dismisses).
      showToast(t("app.update.offlineReady"), "info");
    },
  });

  // Also unmount while the on-screen keyboard is up — the fixed
  // anchor floats detached mid-screen otherwise (see
  // useVirtualKeyboard.ts). This card already mounts conditionally,
  // so there is no stable live-region contract to preserve; it
  // re-renders (and politely re-announces) once the keyboard closes.
  if (!needRefresh || dismissed || keyboardOpen) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-20 flex
                 justify-center px-4 lg:inset-x-auto lg:right-6"
    >
      <div
        className="pointer-events-auto flex max-w-md flex-wrap items-center
                   gap-2 rounded-xl border border-canopy-200 bg-canopy-50
                   px-4 py-3 text-sm shadow-lg
                   dark:border-canopy-900 dark:bg-canopy-950/95"
      >
        <p className="flex-1 basis-40 text-canopy-900 dark:text-canopy-100">
          {t("app.update.available")}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => setDismissed(true)}
          >
            {t("app.update.later")}
          </button>
          <button
            type="button"
            className="btn-primary text-xs"
            onClick={() => void updateServiceWorker(true)}
          >
            {t("app.update.reload")}
          </button>
        </div>
      </div>
    </div>
  );
}
