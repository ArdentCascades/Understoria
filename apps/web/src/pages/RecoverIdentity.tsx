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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { BackLink } from "@/components/BackLink";
import {
  parseRecoveryKit,
  restoreFromRecoveryKit,
  type RecoveryKit,
} from "@/lib/recoveryKit";

// "I have a recovery kit" — docs/identity-recovery.md Phase K1's
// restore leg, linked from the Welcome tour beside the pairing path.
// Upload (or paste, for kits scanned by any QR app) → kit passphrase
// → the identity walks back in, the kit's community coordinates are
// adopted where this fresh device has none, and the first sync pulls
// the shared history home.
export default function RecoverIdentityPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCurrentMember, refreshOnboarded } = useApp();
  const [kit, setKit] = useState<RecoveryKit | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function adoptKitText(text: string) {
    const parsed = parseRecoveryKit(text);
    if (!parsed.ok) {
      setError(
        parsed.error === "unsupported_version"
          ? t("recover.errorVersion")
          : t("recover.errorNotAKit"),
      );
      return;
    }
    setError(null);
    setKit(parsed.kit);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    adoptKitText(await file.text());
  }

  async function handleRestore(e: React.FormEvent) {
    e.preventDefault();
    if (!kit) return;
    setBusy(true);
    setError(null);
    try {
      const result = await restoreFromRecoveryKit(kit, passphrase);
      if (!result.ok) {
        setError(
          result.error === "wrong_passphrase"
            ? t("recover.errorPassphrase")
            : result.error === "device_locked"
              ? t("recover.errorLocked")
              : t("recover.errorCorrupted"),
        );
        return;
      }
      await setCurrentMember(result.publicKey);
      await refreshOnboarded();
      navigate("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <BackLink to="/welcome" label={t("common.back")} />
      <h1 className="mb-2 mt-2 text-xl font-bold">{t("recover.title")}</h1>
      <p className="mb-4 text-sm text-moss-600 dark:text-moss-300">
        {t("recover.intro")}
      </p>

      {!kit && (
        <div className="flex flex-col gap-3">
          <label className="card flex cursor-pointer flex-col gap-1 border-canopy-300 hover:border-canopy-500 dark:border-canopy-700">
            <span className="font-semibold text-canopy-900 dark:text-canopy-100">
              {t("recover.uploadTitle")}
            </span>
            <span className="text-sm text-moss-600 dark:text-moss-300">
              {t("recover.uploadBody")}
            </span>
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(e) => void handleFile(e)}
            />
          </label>
          {!pasteOpen ? (
            <button
              type="button"
              className="text-left text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
              onClick={() => setPasteOpen(true)}
            >
              {t("recover.pasteLink")}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                className="input min-h-28 font-mono text-xs"
                placeholder='{"kind":"understoria-recovery-kit", …}'
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary self-end text-xs"
                disabled={pasted.trim() === ""}
                onClick={() => adoptKitText(pasted)}
              >
                {t("recover.pasteUse")}
              </button>
            </div>
          )}
        </div>
      )}

      {kit && (
        <form onSubmit={(e) => void handleRestore(e)} className="flex flex-col gap-3">
          <p className="rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100">
            {t("recover.kitFound", { name: kit.displayName })}
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("recover.passphraseLabel")}
            </span>
            <input
              className="input"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => {
                setKit(null);
                setPassphrase("");
                setError(null);
              }}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={busy || passphrase === ""}
            >
              {busy ? t("recover.restoring") : t("recover.restore")}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
