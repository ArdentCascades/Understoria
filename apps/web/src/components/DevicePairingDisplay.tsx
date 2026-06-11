/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { InviteQRCode } from "@/components/InviteQRCode";
import { keyFingerprint } from "@/lib/keyFingerprint";

interface DevicePairingDisplayProps {
  /** Base64-url-encoded envelope that the destination scans. */
  encodedEnvelope: string;
  /** The 6-word transfer passphrase. Shown segmented for spoken
   *  delivery; never copy-buttoned (per design doc §6.3 — clipboard
   *  managers persist). */
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
 * No clipboard / share-sheet hatch. The envelope is too large to
 * type and clipboard routing reintroduces persistence; the design
 * doc §6.3 names this as a deliberate non-feature.
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

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (now >= expiresAt) onExpired();
  }, [now, expiresAt, onExpired]);

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
        className="text-sm uppercase tracking-wide text-moss-500 dark:text-moss-300"
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
        <span className="text-xs uppercase tracking-wide text-moss-500 dark:text-moss-300">
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

      <p className="max-w-prose text-center text-xs text-moss-500 dark:text-moss-300">
        {t("addDevice.display.afterImport")}
      </p>
    </div>
  );
}
