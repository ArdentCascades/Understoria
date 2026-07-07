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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import { useApp } from "@/state/AppContext";
import { validatePassphrase } from "@/lib/passphrase";
import {
  buildRecoveryKit,
  recoveryKitFilename,
  type RecoveryKit,
} from "@/lib/recoveryKit";

// Recovery kit export — docs/identity-recovery.md Phase K1. The
// self-custody layer between "paired second device" (best) and
// "nothing": a downloadable/printable file holding the member's
// secret key under an independent recovery passphrase. The copy is
// blunt about the two failure modes at creation time: whoever holds
// kit + passphrase IS you, and a forgotten kit passphrase makes the
// kit inert — there is no one who can reset it, which is the trade
// for there being no one who can lock you out.
export function RecoveryKitCard() {
  const { t } = useTranslation();
  const { currentMember, lockState } = useApp();
  const [open, setOpen] = useState(false);
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kit, setKit] = useState<RecoveryKit | null>(null);

  if (!currentMember) return null;
  const locked = lockState === "locked";

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const invalid = validatePassphrase(pass1);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (pass1 !== pass2) {
      setError(t("recoveryKit.errorMismatch"));
      return;
    }
    setBusy(true);
    try {
      const result = await buildRecoveryKit(pass1);
      if (!result.ok) {
        setError(
          result.error === "locked"
            ? t("recoveryKit.errorLocked")
            : t("recoveryKit.errorNoIdentity"),
        );
        return;
      }
      setKit(result.kit);
      setPass1("");
      setPass2("");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!kit) return;
    const blob = new Blob([JSON.stringify(kit, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = recoveryKitFilename(kit);
    a.click();
    URL.revokeObjectURL(url);
  }

  async function print() {
    if (!kit) return;
    // The whole kit rides one QR (the payload is well under a KB);
    // the human-readable lines beneath are for finding the right
    // piece of paper years later, not for retyping.
    const dataUrl = await QRCode.toDataURL(JSON.stringify(kit), {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 480,
    });
    const win = window.open("", "_blank");
    if (!win) return;
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    win.document.write(`<!doctype html><html><head><title>${esc(
      t("recoveryKit.printTitle"),
    )}</title><style>
      body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; }
      img { display: block; margin: 1rem auto; width: 320px; height: 320px; }
      p { font-size: 0.9rem; line-height: 1.4; }
      code { word-break: break-all; font-size: 0.75rem; }
    </style></head><body>
      <h1>${esc(t("recoveryKit.printTitle"))}</h1>
      <p>${esc(t("recoveryKit.printIntro", { name: kit.displayName }))}</p>
      <img src="${dataUrl}" alt="QR" />
      <p><strong>${esc(t("recoveryKit.printKeyLabel"))}</strong><br/><code>${esc(kit.publicKey)}</code></p>
      ${kit.communityNodeUrl ? `<p><strong>${esc(t("recoveryKit.printNodeLabel"))}</strong><br/><code>${esc(kit.communityNodeUrl)}</code></p>` : ""}
      <p>${esc(t("recoveryKit.printFooter"))}</p>
    </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <section className="card mb-4" aria-labelledby="recovery-kit-title">
      <h2
        id="recovery-kit-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("recoveryKit.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("recoveryKit.intro")}
      </p>

      {!open && !kit && (
        <>
          {locked && (
            <p className="mb-2 text-xs text-moss-600 dark:text-moss-300">
              {t("recoveryKit.errorLocked")}
            </p>
          )}
          <button
            type="button"
            className="btn-secondary"
            disabled={locked}
            onClick={() => setOpen(true)}
          >
            {t("recoveryKit.create")}
          </button>
        </>
      )}

      {open && !kit && (
        <form onSubmit={(e) => void handleCreate(e)} className="flex flex-col gap-2">
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t("recoveryKit.passphraseIntro")}
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("recoveryKit.passphraseLabel")}
            </span>
            <input
              className="input"
              type="password"
              value={pass1}
              onChange={(e) => setPass1(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("recoveryKit.passphraseRepeatLabel")}
            </span>
            <input
              className="input"
              type="password"
              value={pass2}
              onChange={(e) => setPass2(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          {error && (
            <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
            >
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn-primary text-xs" disabled={busy}>
              {t("recoveryKit.confirmCreate")}
            </button>
          </div>
        </form>
      )}

      {kit && (
        <div className="flex flex-col gap-2">
          <p
            role="status"
            className="rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100"
          >
            {t("recoveryKit.created")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={download}>
              {t("recoveryKit.download")}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void print()}
            >
              {t("recoveryKit.print")}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setKit(null)}
            >
              {t("recoveryKit.done")}
            </button>
          </div>
          <p className="text-xs text-moss-600 dark:text-moss-300">
            {t("recoveryKit.storageHint")}
          </p>
        </div>
      )}
    </section>
  );
}
