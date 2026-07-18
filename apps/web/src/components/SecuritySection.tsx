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
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import {
  changePassphrase,
  disablePassphrase,
  enablePassphrase,
  enrollPasskeyWrapper,
  passkeyEnrollment,
  removePasskeyWrapper,
} from "@/db/secrets";
import {
  enrollPasskey,
  supportsPasskeys,
  type PasskeyEnrollmentMeta,
} from "@/lib/passkeyUnlock";
import { humanizeError } from "@/lib/humanizeError";

// Passphrase-protection controls. Extracted from Profile.tsx when
// the dedicated Settings page landed — Security is now in Settings
// alongside the other device-local preferences (Language, Appearance,
// Community Node, Data export).
export function SecuritySection() {
  const { lockState, lock, refreshLockState, currentMember } = useApp();
  const { t } = useTranslation();
  const [mode, setMode] = useState<"idle" | "enable" | "change" | "disable">(
    "idle",
  );
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [current, setCurrent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Passkey state. `passkeySupported` is a plain capability check;
  // `enrollment` is this device's stored enrollment metadata (never
  // the wrapped key material).
  const passkeySupported = supportsPasskeys();
  const [enrollment, setEnrollment] = useState<PasskeyEnrollmentMeta | null>(
    null,
  );
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  const reloadEnrollment = useCallback(async () => {
    setEnrollment(await passkeyEnrollment());
  }, []);

  useEffect(() => {
    void reloadEnrollment();
  }, [reloadEnrollment]);

  async function handleAddPasskey() {
    setPasskeyError(null);
    setSuccess(null);
    setPasskeyBusy(true);
    try {
      const result = await enrollPasskey({
        displayName: currentMember?.displayName ?? "Understoria member",
      });
      if (!result.ok) {
        if (result.error === "cancelled") return; // their call, no scolding
        setPasskeyError(
          result.error === "prf_unsupported"
            ? t("profile.security.passkey.prfUnsupported")
            : t("profile.security.passkey.failed"),
        );
        return;
      }
      await enrollPasskeyWrapper(result.kek, {
        credentialId: result.credentialId,
        prfSalt: result.prfSalt,
        createdAt: Date.now(),
      });
      await reloadEnrollment();
      await refreshLockState();
      setSuccess(t("profile.security.passkey.successAdd"));
    } catch (err) {
      setPasskeyError(humanizeError(err));
    } finally {
      setPasskeyBusy(false);
    }
  }

  async function handleRemovePasskey() {
    setPasskeyError(null);
    setSuccess(null);
    setPasskeyBusy(true);
    try {
      await removePasskeyWrapper();
      await reloadEnrollment();
      setSuccess(t("profile.security.passkey.successRemove"));
    } catch (err) {
      setPasskeyError(humanizeError(err));
    } finally {
      setPasskeyBusy(false);
    }
  }

  function reset() {
    setMode("idle");
    setPass1("");
    setPass2("");
    setCurrent("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      if (mode === "enable") {
        if (pass1 !== pass2)
          throw new Error(t("profile.security.errorMismatch"));
        await enablePassphrase(pass1);
        setSuccess(t("profile.security.successEnable"));
      } else if (mode === "change") {
        if (pass1 !== pass2)
          throw new Error(t("profile.security.errorMismatchNew"));
        await changePassphrase(current, pass1);
        setSuccess(t("profile.security.successChange"));
      } else if (mode === "disable") {
        await disablePassphrase();
        setSuccess(t("profile.security.successDisable"));
      }
      await refreshLockState();
      reset();
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setBusy(false);
    }
  }

  const protectionOn = lockState !== "unprotected";

  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("profile.security.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {protectionOn
          ? t("profile.security.summaryProtected")
          : t("profile.security.summaryUnprotected")}
      </p>
      {/* WHEN the passphrase gets asked for — printed from what the
          code actually does: the unlocked session lives in module
          memory only (db/secrets.ts), so the lock screen appears
          right after "Lock now" and on every launch after the app
          was closed or reloaded. There is no idle timeout. */}
      {protectionOn && (
        <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
          {t("profile.security.whenAsked")}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="mb-3 rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100"
        >
          {success}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!protectionOn && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              reset();
              setMode("enable");
              setSuccess(null);
            }}
          >
            {t("profile.security.enable")}
          </button>
        )}
        {protectionOn && (
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                reset();
                setMode("change");
                setSuccess(null);
              }}
            >
              {t("profile.security.change")}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                reset();
                setMode("disable");
                setSuccess(null);
              }}
            >
              {t("profile.security.disable")}
            </button>
            <button
              type="button"
              className="btn bg-rose-600 text-white hover:bg-rose-700"
              onClick={() => lock()}
            >
              {t("profile.security.lockNow")}
            </button>
          </>
        )}
      </div>

      {/* Passkey block. Visible when the browser can do WebAuthn (or
          an enrollment already exists — never hide a Remove button
          behind a capability check). The passphrase-first invariant
          is stated, not implied: without protection on, this is a
          one-line teaser; with it, the add/remove controls. */}
      {(passkeySupported || enrollment) && (
        <div className="mt-4 border-t border-moss-100 pt-4 dark:border-moss-800">
          <h3 className="text-sm font-semibold">
            {t("profile.security.passkey.title")}
          </h3>
          {!protectionOn ? (
            <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
              {t("profile.security.passkey.enableFirst")}
            </p>
          ) : enrollment ? (
            <>
              <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
                {t("profile.security.passkey.addedOn", {
                  date: new Date(enrollment.createdAt).toLocaleDateString(),
                })}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleRemovePasskey}
                  disabled={passkeyBusy || lockState === "locked"}
                >
                  {t("profile.security.passkey.remove")}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
                {t("profile.security.passkey.intro")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddPasskey}
                  disabled={passkeyBusy || lockState === "locked"}
                >
                  {passkeyBusy
                    ? t("profile.security.passkey.adding")
                    : t("profile.security.passkey.add")}
                </button>
              </div>
              <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
                {t("profile.security.passkey.promptNote")}
              </p>
            </>
          )}
          {protectionOn && lockState === "locked" && (
            <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
              {t("profile.security.passkey.needUnlock")}
            </p>
          )}
          {passkeyError && (
            <p
              role="alert"
              className="mt-2 text-sm text-rose-700 dark:text-rose-300"
            >
              {passkeyError}
            </p>
          )}
        </div>
      )}

      {mode !== "idle" && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          {mode === "change" && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">
                {t("profile.security.currentPassphrase")}
              </span>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </label>
          )}
          {mode !== "disable" && (
            <>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">
                  {mode === "change"
                    ? t("profile.security.newPassphrase")
                    : t("profile.security.passphrase")}
                </span>
                <input
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  value={pass1}
                  onChange={(e) => setPass1(e.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">
                  {t("profile.security.repeat")}
                </span>
                <input
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  value={pass2}
                  onChange={(e) => setPass2(e.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <p className="text-xs text-moss-600 dark:text-moss-300">
                {t("profile.security.passphraseHint")}
              </p>
              {/* Someone turning protection ON deserves to know when
                  the passphrase will actually be demanded, before
                  they commit. */}
              {mode === "enable" && (
                <p className="text-xs text-moss-600 dark:text-moss-300">
                  {t("profile.security.whenAsked")}
                </p>
              )}
            </>
          )}
          {mode === "disable" && (
            <p className="text-sm text-moss-600 dark:text-moss-300">
              {t("profile.security.disableWarn")}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={reset}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy
                ? t("profile.security.working")
                : mode === "enable"
                  ? t("profile.security.submitEnable")
                  : mode === "change"
                    ? t("profile.security.submitChange")
                    : t("profile.security.submitDisable")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
