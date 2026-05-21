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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { decodeAndVerifyInvite } from "@/lib/invite";
import { redeemInvite, type RedeemError } from "@/db/invites";
import { shortKey } from "@/lib/format";

export default function InviteAcceptPage() {
  const { nodeId, setCurrentMember } = useApp();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const encoded = useMemo(() => {
    const hash = window.location.hash.replace(/^#/, "");
    return hash || null;
  }, []);

  const [parseResult, setParseResult] = useState<
    ReturnType<typeof decodeAndVerifyInvite> | null
  >(null);
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "done"
  >("idle");
  const [error, setError] = useState<RedeemError | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!encoded) {
      setParseResult({ ok: false, error: "malformed" });
      return;
    }
    setParseResult(decodeAndVerifyInvite(encoded));
  }, [encoded]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!encoded) return;
    if (!displayName.trim()) {
      setSubmitError(t("invite.displayNameRequired"));
      return;
    }
    setStatus("submitting");
    setSubmitError(null);
    const result = await redeemInvite(encoded, displayName.trim(), nodeId);
    if (!result.ok) {
      setStatus("error");
      setError(result.error);
      return;
    }
    await setCurrentMember(result.value.member.publicKey);
    setStatus("done");
    setTimeout(() => navigate("/"), 1000);
  }

  if (!parseResult) {
    return (
      <div className="px-4 pt-6 text-sm text-moss-600 dark:text-moss-300">
        {t("invite.reading")}
      </div>
    );
  }

  if (!parseResult.ok) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold">{t("invite.cantUse")}</h1>
        <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
          {t(`invite.errors.${parseResult.error}`)}
        </p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => navigate("/")}
        >
          {t("invite.continueToBoard")}
        </button>
      </div>
    );
  }

  const { invite } = parseResult;

  return (
    <div className="px-4 pb-8 pt-6">
      <div className="card">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("invite.youInvited")}
        </h1>
        <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
          {t("invite.wantsYou", { name: invite.inviterName })}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-500">
              {t("invite.inviterKey")}
            </dt>
            <dd className="mt-0.5 font-mono text-xs">
              {shortKey(invite.inviterKey)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-500">
              {t("invite.expires")}
            </dt>
            <dd className="mt-0.5">
              {new Date(invite.expiresAt).toLocaleString(i18n.resolvedLanguage)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 rounded-xl bg-moss-50 p-3 text-xs text-moss-600 dark:bg-moss-900 dark:text-moss-300">
          {t("invite.fingerprintReminder", { name: invite.inviterName })}
        </p>

        {status === "done" ? (
          <p className="mt-4 rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100">
            {t("invite.welcome")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {t("invite.displayNameLabel")}
              </span>
              <input
                className="input"
                autoFocus
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                required
              />
            </label>
            {submitError && (
              <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
                {submitError}
              </p>
            )}
            {status === "error" && error && (
              <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
                {t(`invite.errors.${error}`)}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/")}
              >
                {t("invite.notNow")}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={status === "submitting"}
              >
                {status === "submitting"
                  ? t("invite.submitting")
                  : t("invite.submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
