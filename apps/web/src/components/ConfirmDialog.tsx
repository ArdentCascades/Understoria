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
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  /** Label shown on the confirm button while the action is in flight.
   *  Only used when `onConfirm` returns a Promise. */
  confirmingLabel?: string;
  cancelLabel?: string;
  tone?: "neutral" | "caution";
  /** May return a Promise. While the Promise is unresolved, both
   *  buttons are disabled and the confirm button shows
   *  `confirmingLabel` if provided. Return type is intentionally
   *  loose because existing callers return `me && run(...)`
   *  patterns that produce `false | Promise<…>`. */
  onConfirm: () => unknown;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmingLabel,
  cancelLabel,
  tone = "neutral",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  // Localized defaults — a hardcoded "Cancel"/"Confirm" fallback here
  // used to leak English into every dialog whose caller didn't pass
  // its own labels (the post-claim dialog showed "Cancel" next to
  // "Sí, tomarla" on Spanish screens).
  const resolvedConfirmLabel = confirmLabel ?? t("common.confirm");
  const resolvedCancelLabel = cancelLabel ?? t("common.cancel");
  const cardRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);

  // Trap Tab/Shift+Tab focus inside the card while open. The hook
  // moves focus to the first focusable element on mount; we override
  // that immediately below with the confirm button as the autofocus
  // target — matches the previous behaviour and keeps the destructive
  // action one keypress away.
  useFocusTrap(cardRef, open);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  // Wraps `onConfirm` so that if it returns a Promise, the dialog
  // surfaces in-flight state — both buttons disabled, confirm
  // label optionally swapped to `confirmingLabel`. Synchronous
  // confirmers (no Promise returned) pass through unchanged.
  async function handleConfirm() {
    const result = onConfirm();
    const isThenable =
      typeof result === "object" &&
      result !== null &&
      "then" in result &&
      typeof (result as { then: unknown }).then === "function";
    if (isThenable) {
      setPending(true);
      try {
        await result;
      } finally {
        setPending(false);
      }
    }
  }

  // Backdrop is intentionally non-interactive — visual scrim only.
  // The dismiss paths are Esc (keyboard) and the Cancel button
  // (everyone). Click-outside-to-close was removed in PR 22.3
  // because it had no keyboard equivalent.
  //
  // Portaled to the document root (same lesson as the me-menu
  // drawer): callers render this from arbitrary depths, and a
  // sticky/transformed/backdrop-filtered ancestor traps the z-50 in
  // its own stacking context — on the Board, the attention rail's
  // `sticky` let the search band's z-10 paint THROUGH the scrim.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-moss-950/40 p-4 sm:items-center"
    >
      {/* Capped at the backdrop's padded height with the DESCRIPTION as
          the scroll region — title and action buttons stay on screen at
          any viewport. Without this, a long description (the co-org
          accept comparison) pushed the confirm button below the fold on
          short viewports with no way to reach it. */}
      <div
        ref={cardRef}
        className="card flex max-h-full w-full max-w-md animate-fade-in flex-col"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        {description && (
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain text-sm text-moss-600 dark:text-moss-300">
            {description}
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={pending}
          >
            {resolvedCancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={
              tone === "caution"
                ? "btn bg-rose-600 text-white hover:bg-rose-700"
                : "btn-primary"
            }
            onClick={handleConfirm}
            disabled={pending}
            aria-busy={pending}
          >
            {pending && confirmingLabel ? confirmingLabel : resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
