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

// Modal sheet for sharing a freshly-generated invite.
//
// Two states:
//
//  1. Gate. The sheet opens with the QR + URL hidden behind a
//     prompt that names the camera-surveillance threat in plain
//     language. The member must explicitly tap "Show the invite"
//     to reveal — that deliberate pause is the actual mitigation.
//     A "send the link without showing it" path uses the share
//     helper directly so members in any camera context can still
//     hand off the link via Signal / Messages without putting it
//     on screen.
//
//  2. Revealed. QR + URL + Copy / Share / Done, same as before.
//
// The gate re-prompts every time the sheet opens (no persistent
// dismissal): the member's surroundings can change between
// sessions and the deliberate pause is per-share, not per-device.
//
// Autofocus on the gate sits on the Cancel button so a stray
// Enter does NOT reveal the invite — a safe-default that costs
// keyboard users one Tab to proceed.
//
// See docs/threat-model.md §7 — "QR codes are camera-surveillance
// targets."

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
  const cardRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useFocusTrap(cardRef, open);

  useEffect(() => {
    if (open) {
      // Fresh open → re-prompt the gate. A member's surroundings
      // can change between two share sessions on the same device.
      setRevealed(false);
      setStatus(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Autofocus depends on state: pre-reveal, focus the safe-
    // default (Cancel) so a stray Enter doesn't expose the QR;
    // post-reveal, focus Done so a stray Enter dismisses.
    if (revealed) doneRef.current?.focus();
    else cancelRef.current?.focus();
  }, [open, revealed]);

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
      <div ref={cardRef} className="card w-full max-w-md animate-fade-in">
        {revealed ? (
          <RevealedView
            url={url}
            status={status}
            onCopy={() => void handleCopy()}
            onShare={() => void handleShare()}
            onClose={onClose}
            doneRef={doneRef}
            t={t}
          />
        ) : (
          <GateView
            status={status}
            onReveal={() => setRevealed(true)}
            onShareWithoutShowing={() => void handleShare()}
            onCancel={onClose}
            cancelRef={cancelRef}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

// Pre-reveal state: names the camera threat in plain language and
// offers two paths — reveal the invite, or send the link directly
// (which never puts the URL on screen, just routes it through the
// OS share sheet or clipboard).
function GateView({
  status,
  onReveal,
  onShareWithoutShowing,
  onCancel,
  cancelRef,
  t,
}: {
  status: string | null;
  onReveal: () => void;
  onShareWithoutShowing: () => void;
  onCancel: () => void;
  cancelRef: React.RefObject<HTMLButtonElement>;
  t: (key: string) => string;
}) {
  return (
    <>
      <h2 id="share-sheet-title" className="text-lg font-semibold">
        {t("profile.invites.shareSheet.cameraGate.title")}
      </h2>
      <p className="mt-2 text-sm text-moss-700 dark:text-moss-200">
        {t("profile.invites.shareSheet.cameraGate.body")}
      </p>
      <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.invites.shareSheet.cameraGate.followup")}
      </p>

      {status && (
        <p
          role="status"
          className="mt-3 text-xs text-canopy-800 dark:text-canopy-200"
        >
          {status}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <button type="button" className="btn-primary" onClick={onReveal}>
          {t("profile.invites.shareSheet.cameraGate.reveal")}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onShareWithoutShowing}
        >
          {t("profile.invites.shareSheet.cameraGate.shareWithoutShowing")}
        </button>
        <button
          ref={cancelRef}
          type="button"
          className="btn-ghost"
          onClick={onCancel}
        >
          {t("profile.invites.shareSheet.cameraGate.cancel")}
        </button>
      </div>
    </>
  );
}

// Post-reveal state: the original share sheet content (QR + URL +
// Copy / Share / Done). Same shape it had pre-gate.
function RevealedView({
  url,
  status,
  onCopy,
  onShare,
  onClose,
  doneRef,
  t,
}: {
  url: string;
  status: string | null;
  onCopy: () => void;
  onShare: () => void;
  onClose: () => void;
  doneRef: React.RefObject<HTMLButtonElement>;
  t: (key: string) => string;
}) {
  return (
    <>
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
        <button type="button" className="btn-secondary" onClick={onCopy}>
          {t("common.copy")}
        </button>
        <button type="button" className="btn-secondary" onClick={onShare}>
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
    </>
  );
}
