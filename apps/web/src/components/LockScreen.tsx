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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { shortKey } from "@/lib/format";
import { humanizeError } from "@/lib/humanizeError";
import { Sprig } from "@/components/visual";
import { passkeyEnrollment, unlockSessionWithKek } from "@/db/secrets";
import {
  assertPasskeyKek,
  supportsPasskeys,
  type PasskeyEnrollmentMeta,
} from "@/lib/passkeyUnlock";
import { b64decode } from "@/lib/bytes";

export function LockScreen() {
  const { currentMember, unlock, refreshLockState } = useApp();
  const { t } = useTranslation();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // The passkey enrollment on this device, if any. `null` while
  // loading AND when absent — the button appears only once metadata
  // exists, so an un-enrolled device sees the passphrase form alone,
  // exactly as before.
  const [enrollment, setEnrollment] = useState<PasskeyEnrollmentMeta | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    if (!supportsPasskeys()) return;
    void passkeyEnrollment().then((meta) => {
      if (!cancelled) setEnrollment(meta);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await unlock(passphrase);
      if (result === "wrong_passphrase") {
        setError(t("lockScreen.wrongPassphrase"));
      } else if (result === "nothing_to_unlock") {
        setError(t("lockScreen.nothingToUnlock"));
      } else {
        setPassphrase("");
      }
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasskey() {
    if (!enrollment) return;
    setError(null);
    setSubmitting(true);
    try {
      const asserted = await assertPasskeyKek({
        credentialId: enrollment.credentialId,
        prfSalt: b64decode(enrollment.prfSalt),
      });
      if (!asserted.ok) {
        // A dismissed platform prompt is a decision, not a failure —
        // stay quiet and leave the passphrase form ready.
        if (asserted.error !== "cancelled") {
          setError(t("lockScreen.passkeyFailed"));
        }
        return;
      }
      const result = await unlockSessionWithKek(asserted.kek);
      if (result !== "unlocked") {
        setError(t("lockScreen.passkeyFailed"));
        return;
      }
      await refreshLockState();
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-stack-md px-4">
      <div
        className="flex items-center gap-2 text-canopy-700 dark:text-canopy-300"
        aria-hidden="true"
      >
        <Sprig size={24} />
        <span className="font-serif text-title tracking-tight">
          Understoria
        </span>
        <Sprig size={24} className="-scale-x-100" />
      </div>
      <div className="card w-full max-w-md">
        <div className="mb-2 flex items-center gap-3">
          <span aria-hidden="true" className="text-3xl">
            {"\u{1F512}"}
          </span>
          <h1 className="text-title font-semibold tracking-tight">
            {t("lockScreen.title")}
          </h1>
        </div>
        <p className="mb-4 text-sm text-moss-600 dark:text-moss-300">
          {currentMember ? (
            <>
              {t("lockScreen.introWith", { name: currentMember.displayName })}
              <span className="block text-xs text-moss-600 dark:text-moss-300">
                {t("lockScreen.keyLine", {
                  key: shortKey(currentMember.publicKey),
                })}
              </span>
            </>
          ) : (
            t("lockScreen.introNone")
          )}
        </p>
        {enrollment && (
          <>
            <button
              type="button"
              className="btn-primary w-full"
              onClick={handlePasskey}
              disabled={submitting}
            >
              {t("lockScreen.passkeyButton")}
            </button>
            <div
              className="my-4 flex items-center gap-3 text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300"
              aria-hidden="true"
            >
              <span className="h-px flex-1 bg-moss-200 dark:bg-moss-700" />
              {t("lockScreen.or")}
              <span className="h-px flex-1 bg-moss-200 dark:bg-moss-700" />
            </div>
          </>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("lockScreen.passphraseLabel")}
            </span>
            <input
              type="password"
              // The entire lock-screen surface is "enter your
              // passphrase" — autofocus is the right default here
              // since there is nothing else to do on this view.
              // With a passkey enrolled the button above is the
              // primary path, so the field no longer grabs focus.
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={!enrollment}
              className="input"
              autoComplete="current-password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              required
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || passphrase.length === 0}
          >
            {submitting ? t("lockScreen.submitting") : t("lockScreen.submit")}
          </button>
        </form>
        <p className="mt-4 text-xs text-moss-600 dark:text-moss-300">
          {t("lockScreen.noRecoveryNote")}
        </p>
      </div>
    </div>
  );
}
