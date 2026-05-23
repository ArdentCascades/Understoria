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

// Renders the current toast (if any) in a fixed position above the
// bottom nav. ARIA polite so screen readers hear it once without
// interrupting whatever they're doing. Tap or Esc to dismiss
// (Esc handler lives in ToastContext).

export function ToastContainer() {
  const { toast, dismissToast } = useToast();
  const { t } = useTranslation();
  if (!toast) return null;

  const tone =
    toast.tone === "success"
      ? "bg-canopy-700 text-canopy-50 dark:bg-canopy-600 dark:text-canopy-50"
      : "bg-moss-700 text-moss-50 dark:bg-moss-700 dark:text-moss-50";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4"
      aria-live="polite"
      role="status"
    >
      <button
        type="button"
        onClick={dismissToast}
        aria-label={t("toast.dismiss")}
        className={`pointer-events-auto max-w-md rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-opacity ${tone}`}
      >
        {toast.message}
      </button>
    </div>
  );
}
