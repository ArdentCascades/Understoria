/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { keyFingerprint } from "@/lib/keyFingerprint";

interface DeviceLinkCodeDisplayProps {
  /** The 6-word link code. Component state only — same lifetime
   *  invariants as the QR display (design doc §6.4). */
  code: string;
  /** The member's base64 Ed25519 public key, rendered as the short
   *  fingerprint the destination confirms after import. */
  publicKey: string;
  /** ms epoch at which the mailbox row dies. */
  expiresAt: number;
  onExpired: () => void;
}

/**
 * The "show the link code" stage of the AddDevice wizard — the
 * node-relayed sibling of DevicePairingDisplay (design doc §6.6).
 * No QR, no envelope on screen: the wrapped envelope is already
 * parked at the community node, so the ONLY thing the member
 * carries to the new device is these six words.
 *
 * The words are a bearer credential while the mailbox row lives —
 * whoever enters them first claims the envelope (one-shot). The
 * warning below says exactly that; the mm:ss countdown bounds it.
 */
export function DeviceLinkCodeDisplay({
  code,
  publicKey,
  expiresAt,
  onExpired,
}: DeviceLinkCodeDisplayProps) {
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

  const words = useMemo(() => code.split(" "), [code]);
  const fingerprint = useMemo(() => keyFingerprint(publicKey), [publicKey]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        aria-live="polite"
        aria-atomic="true"
        className="text-sm uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("addDevice.display.countdown", { mmss })}
      </div>

      <p className="max-w-prose text-center text-sm text-moss-700 dark:text-moss-200">
        {t("addDevice.link.intro")}
      </p>

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
        {t("addDevice.link.warning")}
      </p>

      {/* Same confirm affordance as the QR flow: the destination
          shows this fingerprint after import; matching strings close
          the loop that the right identity landed. */}
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

      <p className="max-w-prose text-center text-xs text-moss-600 dark:text-moss-300">
        {t("addDevice.link.afterImport")}
      </p>
    </div>
  );
}
