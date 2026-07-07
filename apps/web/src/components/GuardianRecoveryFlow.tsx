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
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import { PairDeviceCapture } from "@/components/PairDeviceCapture";
import {
  collectRelease,
  finishRecovery,
  mintRecoverySession,
  type CollectedRelease,
} from "@/lib/guardianShards";

// The recovering member's side of the guardian ceremony
// (docs/identity-recovery.md §2): mint a temporary key, show it to
// each guardian, capture their releases, and once enough pieces are
// together the identity is reconstructed and restored. The temporary
// secret lives only in this component's memory — it exists to carry
// shares across one room and dies with the page.
export function GuardianRecoveryFlow({
  onRecovered,
  onCancel,
}: {
  onRecovered: (publicKey: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const session = useMemo(() => mintRecoverySession(), []);
  const [requestQr, setRequestQr] = useState<string | null>(null);
  const [collected, setCollected] = useState<CollectedRelease[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(session.requestText, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
    }).then((url) => {
      if (!cancelled) setRequestQr(url);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const threshold = collected[0]?.threshold ?? null;
  const enough = threshold !== null && collected.length >= threshold;

  function handleCapture(text: string) {
    setCapturing(false);
    const result = collectRelease(text, session, collected);
    if (!result.ok) {
      setError(t(`guardians.error.${result.error}`));
      return;
    }
    setError(null);
    setCollected((c) => [...c, result.release]);
  }

  async function handleFinish() {
    setBusy(true);
    setError(null);
    try {
      const result = await finishRecovery(collected);
      if (!result.ok) {
        setError(t(`guardians.error.${result.error}`));
        return;
      }
      await onRecovered(result.publicKey);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-moss-700 dark:text-moss-200">
        {t("recover.guardiansIntro")}
      </p>

      <div className="flex flex-col items-center gap-2">
        {requestQr && (
          <img
            src={requestQr}
            alt={t("recover.requestQrAlt")}
            className="h-56 w-56 rounded-lg"
          />
        )}
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() =>
            void navigator.clipboard?.writeText(session.requestText)
          }
        >
          {t("guardians.copyText")}
        </button>
      </div>

      <p role="status" className="text-sm font-medium">
        {threshold === null
          ? t("recover.piecesNone")
          : t("recover.piecesProgress", {
              have: collected.length,
              need: threshold,
              name: collected[0].ownerName,
            })}
      </p>

      {!capturing && !enough && (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setCapturing(true)}
        >
          {t("recover.captureRelease")}
        </button>
      )}
      {capturing && (
        <PairDeviceCapture
          onCaptured={handleCapture}
          onCancel={() => setCapturing(false)}
        />
      )}

      {enough && (
        <button
          type="button"
          className="btn-primary"
          disabled={busy}
          onClick={() => void handleFinish()}
        >
          {busy ? t("recover.restoring") : t("recover.finishGuardians")}
        </button>
      )}

      {error && (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      <button type="button" className="btn-ghost self-start text-xs" onClick={onCancel}>
        {t("common.back")}
      </button>
    </div>
  );
}
