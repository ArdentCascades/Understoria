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
import { useTranslation } from "react-i18next";
import { useToast } from "@/state/ToastContext";
import {
  useVirtualKeyboardOpen,
  useVisualViewportBottomGap,
  visualViewportGlueStyle,
} from "@/lib/useVirtualKeyboard";

// Renders the current toast (if any) in a fixed position above the
// bottom nav.
//
// Success / info toasts use polite live region and a rounded-pill
// shape — single tap dismisses. Error toasts use role="alert" (so
// screen readers prioritize them), render with rose tone, persist
// until dismissed, and optionally show a Retry button next to the
// message + an explicit Dismiss control.

const TONE_CLASSES: Record<"success" | "info" | "error", string> = {
  success: "bg-canopy-700 text-canopy-50 dark:bg-canopy-700 dark:text-canopy-50",
  info: "bg-moss-700 text-moss-50 dark:bg-moss-700 dark:text-moss-50",
  error: "bg-rose-700 text-rose-50 dark:bg-rose-800 dark:text-rose-50",
};

export function ToastContainer() {
  const { toast, dismissToast } = useToast();
  const { t } = useTranslation();
  // While the on-screen keyboard is up, the fixed anchor floats
  // detached mid-screen (see useVirtualKeyboard.ts). Hide with
  // opacity — NOT unmount — so a toast firing mid-typing still
  // announces to screen readers immediately and is simply visible
  // once the keyboard closes (error toasts persist until dismissed).
  // Inner pointer-events are gated too so nothing invisible stays
  // tappable.
  const keyboardOpen = useVirtualKeyboardOpen();
  // Same visual-viewport correction as the BottomNav (see
  // useVirtualKeyboard.ts) so a toast never floats mid-screen in
  // iOS's post-keyboard stuck state.
  const bottomGap = useVisualViewportBottomGap();
  if (!toast) return null;

  const tone = TONE_CLASSES[toast.tone];
  const isError = toast.tone === "error";
  const wrapperVisibility = keyboardOpen ? "opacity-0" : "";
  const innerPointer = keyboardOpen
    ? "pointer-events-none"
    : "pointer-events-auto";

  // Error toasts use a richer layout (message + action + dismiss)
  // so plain-tap-to-dismiss isn't viable — they need explicit
  // buttons. Success/info keep the single-button-pill shape so a
  // mistaken touch still dismisses cleanly.
  if (isError || toast.action) {
    return (
      <div
        style={visualViewportGlueStyle(bottomGap)}
        className={`pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 ${wrapperVisibility}`}
        role={isError ? "alert" : "status"}
        aria-live={isError ? "assertive" : "polite"}
      >
        <div
          className={`${innerPointer} flex max-w-md items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium shadow-lg ${tone}`}
        >
          <span className="flex-1">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action!.onAction();
                dismissToast();
              }}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
            >
              {toast.action.label}
            </button>
          )}
          <button
            type="button"
            onClick={dismissToast}
            aria-label={t("toast.dismiss")}
            className="rounded-full bg-white/15 px-2 py-1 text-xs font-bold hover:bg-white/25"
          >
            {"×"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={visualViewportGlueStyle(bottomGap)}
      className={`pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 ${wrapperVisibility}`}
      aria-live="polite"
      role="status"
    >
      <button
        type="button"
        onClick={dismissToast}
        aria-label={t("toast.dismiss")}
        className={`${innerPointer} max-w-md rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-opacity ${tone}`}
      >
        {toast.message}
      </button>
    </div>
  );
}
