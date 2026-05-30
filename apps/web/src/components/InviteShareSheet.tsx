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
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import { InviteQRCode } from "@/components/InviteQRCode";
import { shareUrl, type ShareResult } from "@/lib/share";

// Modal sheet for sharing a freshly-generated invite. Shows a
// rendered QR code (for in-person scanning), the URL as
// selectable text (with Copy), and a Share button that opens
// the OS share sheet on mobile (clipboard fallback on desktop).
// Pattern mirrors ConfirmDialog — Escape closes, focus trapped
// inside the card, autofocus on Done so keyboard users land on
// the dismiss action rather than the Share button (Share opens
// a *new* surface; autofocusing it would risk a stray Enter
// triggering it). No backdrop click-to-close — keeps the
// jsx-a11y rules happy and matches the rest of the app's
// modal pattern.

export interface InviteShareSheetProps {
  open: boolean;
  url: string;
  /** Used as the title in the native share sheet, if shown. */
  shareTitle: string;
  /** Used as the text in the native share sheet, if shown. */
  shareText: string;
  onClose: () => void;
}

export function InviteShareSheet({
  open,
  url,
  shareTitle,
  shareText,
  onClose,
}: InviteShareSheetProps) {
  const { t } = useTranslation();
  const doneRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  useFocusTrap(cardRef, open);

  useEffect(() => {
    if (open) {
      setStatus(null);
      doneRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleShare() {
    const result: ShareResult = await shareUrl({
      url,
      title: shareTitle,
      text: shareText,
    });
    switch (result) {
      case "shared":
        setStatus(t("profile.invites.shareSheet.statusShared"));
        break;
      case "cancelled":
        // Silent — the user dismissed the share sheet on purpose.
        break;
      case "copied":
        setStatus(t("profile.invites.shareSheet.statusCopied"));
        break;
      case "failed":
        setStatus(t("profile.invites.shareSheet.statusFailed"));
        break;
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus(t("profile.invites.shareSheet.statusCopied"));
    } catch {
      setStatus(t("profile.invites.shareSheet.statusFailed"));
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-moss-950/40 p-4 sm:items-center"
    >
      <div
        ref={cardRef}
        className="card w-full max-w-md animate-fade-in"
      >
        <h2 id="share-sheet-title" className="text-lg font-semibold">
          {t("profile.invites.shareSheet.title")}
        </h2>
        <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
          {t("profile.invites.shareSheet.intro")}
        </p>

        <div className="mt-4 flex justify-center">
          <InviteQRCode
            value={url}
            ariaLabel={t("profile.invites.shareSheet.qrAriaLabel")}
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="share-sheet-url"
            className="text-xs font-semibold uppercase tracking-wide text-moss-500"
          >
            {t("profile.invites.shareSheet.urlLabel")}
          </label>
          <code
            id="share-sheet-url"
            className="mt-1 block break-all rounded bg-moss-50 px-2 py-1 text-xs dark:bg-moss-900"
          >
            {url}
          </code>
        </div>

        {status && (
          <p
            role="status"
            className="mt-3 text-xs text-canopy-800 dark:text-canopy-200"
          >
            {status}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void handleCopy()}
          >
            {t("common.copy")}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void handleShare()}
          >
            {t("profile.invites.shareSheet.shareButton")}
          </button>
          <button
            ref={doneRef}
            type="button"
            className="btn-primary"
            onClick={onClose}
          >
            {t("profile.invites.shareSheet.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
