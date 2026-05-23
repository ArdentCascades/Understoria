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
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Tiny toast system: ephemeral feedback for actions that previously
// navigated away silently (post, claim, confirm), and persistent
// error feedback with a Retry affordance when an action fails.
//
// Design constraints, per the project's anti-engagement guidelines:
// - One toast at a time. New toasts replace older ones (no queue,
//   no stacking pile-up).
// - Success / info toasts auto-dismiss after a short window
//   (default 4s) — the action they acknowledge already happened.
// - Error toasts persist until dismissed. Missing the message
//   could leave a user wondering why nothing changed; the dismiss
//   is one tap away (Esc, the X, or the Retry button).
// - Click / Esc to dismiss. No close-button-only patterns.
// - Polite live region for success/info; alert for errors —
//   screen readers prioritize error announcements over polite
//   updates without being interrupting.
// - No badges, no counters, no "you've seen N toasts" telemetry.

export type ToastTone = "success" | "info" | "error";

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
  action: ToastAction | null;
}

export interface ShowToastOptions {
  tone?: ToastTone;
  action?: ToastAction;
}

interface ToastContextValue {
  toast: ToastState | null;
  /** Backward-compatible: `showToast("msg")` defaults to a success
   *  toast that auto-dismisses. For error toasts with retry, pass
   *  `{ tone: "error", action: { label, onAction } }`. */
  showToast: (
    message: string,
    optionsOrTone?: ShowToastOptions | ToastTone,
  ) => void;
  dismissToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DISMISS_MS = 4_000;

export function ToastProvider({
  children,
  dismissMs = DEFAULT_DISMISS_MS,
}: {
  children: ReactNode;
  dismissMs?: number;
}) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counterRef = useRef(0);

  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (
      message: string,
      optionsOrTone: ShowToastOptions | ToastTone = "success",
    ) => {
      const options: ShowToastOptions =
        typeof optionsOrTone === "string"
          ? { tone: optionsOrTone }
          : optionsOrTone;
      const tone = options.tone ?? "success";
      const action = options.action ?? null;
      counterRef.current += 1;
      setToast({ id: counterRef.current, message, tone, action });
      if (timerRef.current) clearTimeout(timerRef.current);
      // Errors persist until dismissed or the Retry button is
      // tapped. Success / info auto-dismiss after dismissMs.
      if (tone === "error") {
        timerRef.current = null;
      } else {
        timerRef.current = setTimeout(() => {
          setToast(null);
          timerRef.current = null;
        }, dismissMs);
      }
    },
    [dismissMs],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismissToast();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismissToast]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const value = useMemo(
    () => ({ toast, showToast, dismissToast }),
    [toast, showToast, dismissToast],
  );
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // In tests or storybook-style usage without a provider, return
    // a no-op shape rather than throwing — toasts are a UX nicety,
    // not an invariant.
    return {
      toast: null,
      showToast: () => {},
      dismissToast: () => {},
    };
  }
  return ctx;
}
