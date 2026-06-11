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

interface DevicePairingFingerprintConfirmProps {
  /** Pre-formatted fingerprint string (XXXX XXXX). The page above
   *  computes it from the unwrapped payload's publicKey so this
   *  component stays display-only — no crypto here. */
  fingerprint: string;
  /** Fingerprints match → proceed to the session-passphrase step. */
  onConfirm: () => void;
  /** Member says they don't match → page aborts the import and
   *  bounces back to capture (see PairDevice.handleMismatch). */
  onMismatch: () => void;
}

/**
 * Destination-side fingerprint comparison stage. Slotted between
 * unwrap-success and session-passphrase: the cryptographic identity
 * check already passed (`unwrapTransfer` matched the embedded
 * publicKey against the one derived from the secretKey), but that
 * doesn't tell the human "this is the device I meant to scan."
 *
 * Two abuse vectors this catches:
 *   - Mistaken pairing — workshop with several phones on the table,
 *     scanned the wrong one. The fingerprint shown here won't match
 *     the one on the device the member meant to pair from.
 *   - Mid-flow QR swap — someone redirects the destination to a
 *     different envelope. The unwrap would already fail
 *     (publickey_mismatch) if the secretKey didn't match the embedded
 *     publicKey, but a human-visible signal is still the right
 *     anchor for "stop, something's off."
 *
 * "No" aborts. Letting the member retype the passphrase doesn't help
 * — if the fingerprints don't match, the envelope on the wire is the
 * wrong envelope. The safe default is to start over.
 */
export function DevicePairingFingerprintConfirm({
  fingerprint,
  onConfirm,
  onMismatch,
}: DevicePairingFingerprintConfirmProps) {
  const { t } = useTranslation();
  return (
    <section
      className="card flex flex-col gap-4"
      aria-labelledby="pairDevice-fingerprint-heading"
    >
      <h2
        id="pairDevice-fingerprint-heading"
        className="page-title text-base"
      >
        {t("pairDevice.fingerprintConfirm.title")}
      </h2>
      <p className="text-sm text-moss-700 dark:text-moss-200">
        {t("pairDevice.fingerprintConfirm.body")}
      </p>
      {/* The fingerprint itself. Bigger and more central than on the
          source side because here it's the focal element of the step,
          not an aside next to a QR. Same monospace tracking so the
          two devices look visually paired side-by-side. */}
      <div
        aria-label={t("pairDevice.fingerprintConfirm.fingerprintAriaLabel")}
        className="flex justify-center"
      >
        <span className="font-mono text-2xl font-semibold tracking-widest text-moss-900 dark:text-moss-100">
          {fingerprint}
        </span>
      </div>
      <p className="text-xs text-moss-500 dark:text-moss-300">
        {t("pairDevice.fingerprintConfirm.mismatchHint")}
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="btn-secondary"
          onClick={onMismatch}
        >
          {t("pairDevice.fingerprintConfirm.mismatch")}
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={onConfirm}
        >
          {t("pairDevice.fingerprintConfirm.confirm")}
        </button>
      </div>
    </section>
  );
}
