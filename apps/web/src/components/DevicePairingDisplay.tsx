/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InviteQRCode } from "@/components/InviteQRCode";
import { keyFingerprint } from "@/lib/keyFingerprint";

interface DevicePairingDisplayProps {
  /** Base64-url-encoded envelope that the destination scans — or,
   *  via the gated hatch below, pastes. */
  encodedEnvelope: string;
  /** The 6-word transfer passphrase. Shown segmented for spoken
   *  delivery; NEVER copy-buttoned (design doc §5.3 — the passphrase
   *  is the second channel; the envelope hatch below deliberately
   *  excludes it so both halves can't travel the same route). */
  passphrase: string;
  /** The member's base64 Ed25519 public key. Rendered as a short
   *  fingerprint so the destination device can confirm it's looking
   *  at the right identity (catches mistaken-pairing and mid-flow
   *  QR swaps). The publicKey itself never leaves the source — the
   *  fingerprint is a one-way hash of its first bytes. */
  publicKey: string;
  /** ms epoch at which the QR auto-dismisses. */
  expiresAt: number;
  /** Fires when expiresAt is reached. The parent transitions to the
   *  expired stage and drops the envelope from its state. */
  onExpired: () => void;
}

/**
 * The "show the QR" stage of the AddDevice wizard. Renders the QR,
 * the 6-word passphrase, and a live mm:ss countdown.
 *
 * Lifetime invariants (per design doc §6.4):
 *   - Component state only. Never write the envelope or passphrase
 *     to localStorage, sessionStorage, or IndexedDB.
 *   - At T=0 the parent transitions away from this component; the
 *     envelope and passphrase drop with it.
 *   - The QR is the same `InviteQRCode` component used for invite
 *     sharing — black-on-white SVG, error correction level M, lazy-
 *     loaded `qrcode` chunk.
 *
 * Copy hatch (design doc §6.3, as revised): the ENVELOPE — never
 * the passphrase — can be copied to the clipboard behind a
 * disclosure with an honest warning about clipboard persistence
 * and cross-device clipboard sync. It exists because the
 * destination's paste fallback (§7.2) otherwise has no sanctioned
 * source, and phone→desktop pairing was camera-or-nothing. The
 * passphrase stays speak-or-type only, so the two halves cannot
 * travel the same channel by our hand. On expiry/unmount the
 * clipboard is cleared best-effort — only when it still holds this
 * envelope, so a member's later copy is never clobbered.
 */
export function DevicePairingDisplay({
  encodedEnvelope,
  passphrase,
  publicKey,
  expiresAt,
  onExpired,
}: DevicePairingDisplayProps) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());
  const [hatchOpen, setHatchOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  // Whether WE put the envelope on the clipboard this mount — the
  // predicate for the best-effort clear below. A ref (not state):
  // read inside the unmount cleanup.
  const copiedRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (now >= expiresAt) onExpired();
  }, [now, expiresAt, onExpired]);

  // Best-effort clipboard hygiene: when this screen goes away (T=0
  // auto-dismiss, Done, Cancel, route change — all unmount paths),
  // clear the envelope from the clipboard IF it is still there.
  // Read-then-compare keeps this non-destructive: whatever the
  // member copied since is left alone. Both calls can be denied by
  // the browser (focus/permission); that's fine — this is hygiene
  // on top of the expiry, not the security boundary (the envelope
  // is passphrase-wrapped either way).
  useEffect(() => {
    return () => {
      if (!copiedRef.current) return;
      void navigator.clipboard
        ?.readText()
        .then((text) =>
          text === encodedEnvelope
            ? navigator.clipboard.writeText("")
            : undefined,
        )
        .catch(() => undefined);
    };
  }, [encodedEnvelope]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(encodedEnvelope);
      copiedRef.current = true;
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  const remaining = Math.max(0, expiresAt - now);
  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  const mmss = `${minutes}:${String(seconds).padStart(2, "0")}`;

  // Split passphrase into individual word chips so the visual encourages
  // verbal delivery one word at a time, not whole-string read-aloud.
  const words = useMemo(() => passphrase.split(" "), [passphrase]);

  // Derived from the publicKey prop; the fingerprint helper is a pure
  // function so memoising on the input string is enough. Same lifetime
  // invariants as the rest of this component's state — drops with the
  // component on cancel / expiry / route change.
  const fingerprint = useMemo(() => keyFingerprint(publicKey), [publicKey]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Live region so the countdown is announced to screen readers
          at meaningful intervals — `polite` so it doesn't interrupt. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="text-sm uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("addDevice.display.countdown", { mmss })}
      </div>

      <div
        aria-label={t("addDevice.display.passphraseAriaLabel")}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {words.map((w, i) => (
          <span
            key={`${i}-${w}`}
            className="rounded-md bg-moss-100 px-3 py-2 font-mono text-base font-semibold text-moss-900 dark:bg-moss-800 dark:text-moss-100"
          >
            {w}
          </span>
        ))}
      </div>

      <p className="max-w-prose text-center text-sm text-moss-600 dark:text-moss-300">
        {t("addDevice.display.spokenInstructions")}
      </p>

      {/* Fingerprint of this device's public key, shown so the
          destination device's confirm step has something visible to
          compare against. Styled smaller and calmer than the
          passphrase chips because it's verification info, not the
          action — the member's hands are on the words, their eyes
          glance here. Wrapped in a labelled region so screen readers
          announce it as the "fingerprint to confirm". */}
      <div
        aria-label={t("addDevice.display.fingerprintAriaLabel")}
        className="flex flex-col items-center gap-1"
      >
        <span className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
          {t("addDevice.display.fingerprintLabel")}
        </span>
        <span className="font-mono text-sm tracking-widest text-moss-700 dark:text-moss-200">
          {fingerprint}
        </span>
      </div>

      <InviteQRCode
        value={encodedEnvelope}
        size={288}
        ariaLabel={t("addDevice.display.qrAriaLabel")}
      />

      {/* The copy hatch — envelope only, behind a disclosure so the
          warning is read before the affordance exists. Feeds the
          destination's paste capture (§7.2); the passphrase keeps
          its speak-or-type-only channel. */}
      <div className="w-full max-w-prose text-center">
        <button
          type="button"
          aria-expanded={hatchOpen}
          onClick={() => setHatchOpen((open) => !open)}
          className="text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        >
          {t("addDevice.display.copyHatchToggle")}
        </button>
        {hatchOpen && (
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-bark-200 bg-bark-100/60 p-4 text-left text-sm text-bark-800 dark:border-bark-700 dark:bg-bark-800/60 dark:text-bark-100">
            <p>{t("addDevice.display.copyHatchWarning")}</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => void handleCopy()}
              >
                {t("addDevice.display.copyButton")}
              </button>
              <span role="status" className="text-xs">
                {copyState === "copied" && t("addDevice.display.copied")}
                {copyState === "failed" && t("addDevice.display.copyFailed")}
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="max-w-prose text-center text-xs text-moss-600 dark:text-moss-300">
        {t("addDevice.display.afterImport")}
      </p>
    </div>
  );
}
