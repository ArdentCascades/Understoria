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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import { InviteQRCode } from "@/components/InviteQRCode";
import { extractInviteToken } from "@/lib/invite";
import {
  canShareUrl,
  copyTextToClipboard,
  shareUrl,
  type ShareResult,
} from "@/lib/share";

// Modal sheet for sharing an invite.
//
// Three states, entered according to what the member actually asked
// for (2026-07 usability round: the camera warning used to fire the
// moment an invite was GENERATED, before anyone asked to show a QR —
// it now waits for the explicit "show" choice, its natural moment):
//
//  1. Menu (intent="share", the post-generation default). Plain
//     link-safety copy — anyone with the link can join — plus the
//     two paths in deliberate hierarchy: "send the link without
//     showing it" primary (routes through navigator.share /
//     clipboard so the URL never lands on the framebuffer at all),
//     "show the invite" secondary. No camera warning yet: nothing
//     is about to go on screen.
//
//  2. Camera check. Reached by tapping "Show the invite" from the
//     menu, or immediately when the sheet opens with intent="show"
//     (the "Show QR code" buttons — the member just asked to put
//     the QR on screen). Names the threat (cameras CAN read QR
//     codes from across a room) and asks for one confirming tap.
//
//  3. Revealed. QR + URL + Copy / Share / Done, same as before.
//
// The flow re-prompts every time the sheet opens (no persistent
// dismissal): the member's surroundings can change between
// sessions and the deliberate pause is per-show, not per-device.
//
// Autofocus tracks the safest available action: on the menu, the
// share-without-showing button when available (Enter ships safely),
// otherwise Cancel; on the camera check, Cancel (Enter closes,
// never reveals). The reveal always requires an explicit click.
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
  /**
   * What the member asked for. "share" (default) opens on the share
   * menu; "show" — the explicit Show-QR buttons — skips straight to
   * the camera check, because that IS the moment before the QR goes
   * on screen.
   */
  intent?: "share" | "show";
  onClose: () => void;
}

type Stage = "menu" | "camera" | "revealed";

export function InviteShareSheet({
  open,
  url,
  shareTitle,
  shareText,
  intent = "share",
  onClose,
}: InviteShareSheetProps) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const shareWithoutShowingRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const [stage, setStage] = useState<Stage>("menu");
  const [status, setStatus] = useState<string | null>(null);

  useFocusTrap(cardRef, open);

  useEffect(() => {
    if (open) {
      // Fresh open → restart the flow at the intent's first screen.
      // A member's surroundings can change between two sessions on
      // the same device, so the camera check never stays dismissed.
      setStage(intent === "show" ? "camera" : "menu");
      setStatus(null);
    }
  }, [open, intent]);

  useEffect(() => {
    if (!open) return;
    // Autofocus tracks the safest available action so a stray
    // Enter never reveals the invite:
    //   - revealed: Done (closes the sheet)
    //   - menu, canShare: the share-without-showing button
    //     (Enter ships the link without putting it on screen)
    //   - menu, !canShare: Cancel (Enter closes; the unsafe
    //     reveal still needs an explicit click)
    //   - camera check: Cancel (Enter closes, never reveals)
    if (stage === "revealed") {
      doneRef.current?.focus();
    } else if (stage === "menu" && canShareUrl()) {
      shareWithoutShowingRef.current?.focus();
    } else {
      cancelRef.current?.focus();
    }
  }, [open, stage]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleShare(fromGate: boolean) {
    // From the pre-reveal stages, share the BARE url — no message
    // text. The gate's whole job is moving the link off-device
    // intact, and `text` is what platforms trip over: several share
    // sheets' "Copy" action copies the text (or a text+url
    // concatenation) instead of a clean link, so a member who taps
    // Copy pastes a prose blob — or worse, a message whose link a
    // URL bar can't use. Url-only payloads survive every target's
    // Copy as a clean, pasteable link (2026-07 field report). The
    // revealed view keeps the friendly message: there the member
    // SEES what's being shared.
    const result: ShareResult = await shareUrl({
      url,
      title: shareTitle,
      ...(fromGate ? {} : { text: shareText }),
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
        // Copy: keep the sheet open with a status. Pre-reveal we
        // need different copy than the revealed view because
        // "the link" isn't visible — the message should tell
        // the member what to do next.
        setStatus(
          t(
            fromGate
              ? "profile.invites.shareSheet.gate.statusCopied"
              : "profile.invites.shareSheet.statusCopied",
          ),
        );
        break;
      case "failed":
        // Failure pre-reveal: don't tell the member to "select
        // the link" — it isn't on screen. Suggest the revealed
        // path instead.
        setStatus(
          t(
            fromGate
              ? "profile.invites.shareSheet.gate.statusFailed"
              : "profile.invites.shareSheet.statusFailed",
          ),
        );
        break;
    }
  }

  async function handleCopy() {
    const result = await copyTextToClipboard(url);
    setStatus(
      t(
        result === "copied"
          ? "profile.invites.shareSheet.statusCopied"
          : "profile.invites.shareSheet.statusFailed",
      ),
    );
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-moss-950/40 p-4 sm:items-center"
    >
      {/* Capped at the backdrop's padded height with internal scroll
          (same pattern as ConfirmDialog) so neither the gate's prose
          nor the revealed QR view can push its buttons off a short
          viewport. */}
      <div
        ref={cardRef}
        className="card max-h-full w-full max-w-md animate-fade-in overflow-y-auto overscroll-contain landscape-short:max-w-2xl"
      >
        {stage === "revealed" ? (
          <RevealedView
            url={url}
            status={status}
            onCopy={() => void handleCopy()}
            onShare={() => void handleShare(false)}
            onClose={onClose}
            doneRef={doneRef}
            t={t}
          />
        ) : stage === "camera" ? (
          <CameraCheckView
            status={status}
            onConfirm={() => setStage("revealed")}
            onCancel={onClose}
            cancelRef={cancelRef}
            t={t}
          />
        ) : (
          <MenuView
            status={status}
            canShare={canShareUrl()}
            onShowRequested={() => setStage("camera")}
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

// Post-generation menu. Plain link-safety framing and two paths in
// deliberate hierarchy:
//
//   - Primary: send the link without showing it (canShare=true)
//     — URL never lands on the framebuffer, defends against
//     both camera surveillance and screen-reading malware.
//   - Secondary: show the invite — which routes through the
//     camera check before anything appears on screen.
//
// When canShare is false, the primary button is disabled (with
// an inline note explaining why) and "show the invite" takes
// over the primary visual slot. The visual order of the
// buttons stays the same so the *teaching* is consistent —
// the safer path is always listed first.
function MenuView({
  status,
  canShare,
  onShowRequested,
  onShareWithoutShowing,
  onCancel,
  cancelRef,
  shareWithoutShowingRef,
  t,
}: {
  status: string | null;
  canShare: boolean;
  onShowRequested: () => void;
  onShareWithoutShowing: () => void;
  onCancel: () => void;
  cancelRef: React.RefObject<HTMLButtonElement>;
  shareWithoutShowingRef: React.RefObject<HTMLButtonElement>;
  t: (key: string) => string;
}) {
  return (
    <>
      <h2
        id="share-sheet-title"
        className="text-center text-lg font-semibold"
      >
        {t("profile.invites.shareSheet.gate.title")}
      </h2>
      <p className="mt-3 text-sm text-moss-700 dark:text-moss-200">
        {t("profile.invites.shareSheet.gate.body")}
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
          {t("profile.invites.shareSheet.gate.shareWithoutShowing")}
        </button>
        {!canShare && (
          <p
            id="share-without-showing-note"
            className="text-xs text-moss-600 dark:text-moss-300"
          >
            {t("profile.invites.shareSheet.gate.notAvailable")}
          </p>
        )}
        <button
          type="button"
          className={canShare ? "btn-secondary" : "btn-primary"}
          onClick={onShowRequested}
        >
          {t("profile.invites.shareSheet.gate.reveal")}
        </button>
        <button
          ref={cancelRef}
          type="button"
          className="btn-ghost"
          onClick={onCancel}
        >
          {t("profile.invites.shareSheet.gate.cancel")}
        </button>
      </div>
    </>
  );
}

// The look-around moment — shown only once the member has asked to
// put the QR/link on screen (never at generation). Names the threat
// (cameras + on-device software) and takes one confirming tap.
function CameraCheckView({
  status,
  onConfirm,
  onCancel,
  cancelRef,
  t,
}: {
  status: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  cancelRef: React.RefObject<HTMLButtonElement>;
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
          type="button"
          className="btn-primary"
          onClick={onConfirm}
        >
          {t("profile.invites.shareSheet.cameraGate.confirm")}
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

      {/* Portrait: QR stacked above the URL (unchanged). Phone held
          sideways: the two sit side by side and the QR square is
          clamped to the viewport height, so code + URL + buttons all
          fit a ~320px-tall screen. */}
      <div className="landscape-short:flex landscape-short:items-center landscape-short:gap-4">
        <div className="mt-4 flex justify-center landscape-short:shrink-0">
          <InviteQRCode
            value={url}
            ariaLabel={t("profile.invites.shareSheet.qrAriaLabel")}
            className="landscape-short:max-h-[min(60vh,16rem)] landscape-short:max-w-[min(60vh,16rem)]"
          />
        </div>

        <div className="mt-4 landscape-short:min-w-0 landscape-short:flex-1">
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
      </div>

      {status && (
        <p
          role="status"
          className="mt-3 text-xs text-canopy-800 dark:text-canopy-200"
        >
          {status}
        </p>
      )}

      {/* Print surfaces (desktop-power-tools plan 5): the poster
          page for the shelter-lobby bulletin board. Post-gate only
          — printing is the most deliberate physical reveal there
          is, and the poster page's footer says so ("paper doesn't
          sync or purge"). The invite token travels in the fragment,
          exactly like the share link itself. */}
      {extractInviteToken(url) && (
        <Link
          to={`/print/invite#${extractInviteToken(url)}`}
          className="mt-3 inline-block text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        >
          {t("profile.invites.shareSheet.printPoster")} →
        </Link>
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
