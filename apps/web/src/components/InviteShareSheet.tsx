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
import { canShareUrl, shareUrl, type ShareResult } from "@/lib/share";

// Modal sheet for sharing a freshly-generated invite.
//
// Two states:
//
//  1. Gate. The sheet opens with the QR + URL hidden behind a
//     prompt that names the threat (cameras CAN read QR codes;
//     device-level malware can ALSO read whatever the app
//     renders). The visually-primary action is the "send the
//     link without showing it" path — it routes through
//     navigator.share / clipboard so the URL never lands on
//     the framebuffer at all. The on-screen reveal is the
//     secondary path, the explicit "I trust this device and
//     this room" choice — not the default. When the share-
//     without-showing path is unavailable on the browser, the
//     button is disabled with an inline note and Show-the-
//     invite takes the primary slot by default (the member
//     still has to choose it, just from a smaller menu).
//
//  2. Revealed. QR + URL + Copy / Share / Done, same as before.
//
// The gate re-prompts every time the sheet opens (no persistent
// dismissal): the member's surroundings can change between
// sessions and the deliberate pause is per-share, not per-device.
//
// Autofocus tracks the safest available action: the share-
// without-showing button when available (Enter ships safely),
// otherwise Cancel (Enter closes, never reveals). The unsafe
// path always requires an explicit click.
//
// See docs/threat-model.md §7 — "QR codes are camera-surveillance
// targets" and "Device-level compromise is out of scope."

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
  const shareWithoutShowingRef = useRef<HTMLButtonElement>(null);
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
    // Autofocus tracks the safest available action so a stray
    // Enter never reveals the invite:
    //   - revealed: Done (closes the sheet)
    //   - gate, canShare: the share-without-showing button
    //     (Enter ships the link without putting it on screen)
    //   - gate, !canShare: Cancel (Enter closes; the unsafe
    //     reveal still needs an explicit click)
    if (revealed) {
      doneRef.current?.focus();
    } else if (canShareUrl()) {
      shareWithoutShowingRef.current?.focus();
    } else {
      cancelRef.current?.focus();
    }
  }, [open, revealed]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleShare(fromGate: boolean) {
    const result: ShareResult = await shareUrl({
      url,
      title: shareTitle,
      text: shareText,
    });
    switch (result) {
      case "shared":
        // Native share sheet succeeded — the member completed the
        // handoff outside the app. Close the sheet so they're not
        // stuck on a now-pointless dialog. (On the revealed view,
        // we also close, since the QR + URL have served their
        // purpose by now.)
        onClose();
        return;
      case "cancelled":
        break;
      case "copied":
        // Copy: keep the sheet open with a status. From the gate
        // we need different copy than the revealed view because
        // "the link" isn't visible — the message should tell
        // the member what to do next.
        setStatus(
          t(
            fromGate
              ? "profile.invites.shareSheet.cameraGate.statusCopied"
              : "profile.invites.shareSheet.statusCopied",
          ),
        );
        break;
      case "failed":
        // Failure from the gate: don't tell the member to "select
        // the link" — it isn't on screen. Suggest the revealed
        // path instead.
        setStatus(
          t(
            fromGate
              ? "profile.invites.shareSheet.cameraGate.statusFailed"
              : "profile.invites.shareSheet.statusFailed",
          ),
        );
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
            onShare={() => void handleShare(false)}
            onClose={onClose}
            doneRef={doneRef}
            t={t}
          />
        ) : (
          <GateView
            status={status}
            canShare={canShareUrl()}
            onReveal={() => setRevealed(true)}
            onShareWithoutShowing={() => void handleShare(true)}
            onCancel={onClose}
            cancelRef={cancelRef}
            shareWithoutShowingRef={shareWithoutShowingRef}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

// Pre-reveal state. Names the threat (cameras + on-device
// software) and offers two paths in deliberate hierarchy:
//
//   - Primary: send the link without showing it (canShare=true)
//     — URL never lands on the framebuffer, defends against
//     both camera surveillance and screen-reading malware.
//   - Secondary: show the invite — the explicit "I trust this
//     device and this room" choice, not the default.
//
// When canShare is false, the primary button is disabled (with
// an inline note explaining why) and "show the invite" takes
// over the primary visual slot. The visual order of the
// buttons stays the same so the *teaching* is consistent —
// the safer path is always listed first.
function GateView({
  status,
  canShare,
  onReveal,
  onShareWithoutShowing,
  onCancel,
  cancelRef,
  shareWithoutShowingRef,
  t,
}: {
  status: string | null;
  canShare: boolean;
  onReveal: () => void;
  onShareWithoutShowing: () => void;
  onCancel: () => void;
  cancelRef: React.RefObject<HTMLButtonElement>;
  shareWithoutShowingRef: React.RefObject<HTMLButtonElement>;
  t: (key: string) => string;
}) {
  return (
    <>
      {/* Visual reinforcement of the message. Decorative — the
       *  heading text already names the topic, so aria-hidden so
       *  screen readers don't double-announce. Large + centered
       *  for skim-reading. */}
      <div
        aria-hidden="true"
        className="mb-2 text-center text-4xl leading-none"
      >
        📷
      </div>
      <h2
        id="share-sheet-title"
        className="text-center text-lg font-semibold"
      >
        {t("profile.invites.shareSheet.cameraGate.title")}
      </h2>
      <p className="mt-3 text-sm text-moss-700 dark:text-moss-200">
        {t("profile.invites.shareSheet.cameraGate.body")}
      </p>
      <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.invites.shareSheet.cameraGate.followup")}
      </p>

      {status && (
        <p
          role="status"
          className="mt-3 rounded-xl bg-canopy-50 px-3 py-2 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100"
        >
          {status}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <button
          ref={shareWithoutShowingRef}
          type="button"
          className={canShare ? "btn-primary" : "btn-secondary"}
          onClick={onShareWithoutShowing}
          disabled={!canShare}
          aria-describedby={
            !canShare ? "share-without-showing-note" : undefined
          }
        >
          {t("profile.invites.shareSheet.cameraGate.shareWithoutShowing")}
        </button>
        {!canShare && (
          <p
            id="share-without-showing-note"
            className="text-xs text-moss-600 dark:text-moss-300"
          >
            {t("profile.invites.shareSheet.cameraGate.notAvailable")}
          </p>
        )}
        <button
          type="button"
          className={canShare ? "btn-secondary" : "btn-primary"}
          onClick={onReveal}
        >
          {t("profile.invites.shareSheet.cameraGate.reveal")}
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
          className="text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
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
