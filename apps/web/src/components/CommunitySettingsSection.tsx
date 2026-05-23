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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import {
  InvalidNodeConfigError,
  putNodeConfig,
  resetNodeConfig,
} from "@/db/nodeConfig";
import type { NodeConfig } from "@/types";

// Per the roadmap (Agent 11 stage A), this UI is a bootstrap measure:
// any member can edit until Agent 13 (in-app governance) ships and
// changes route through a proposal. The yellow note below makes that
// posture explicit so a community doesn't mistake the affordance for
// the eventual norm.

export function CommunitySettingsSection() {
  const { t, i18n } = useTranslation();
  const { nodeId, nodeConfig, refreshNodeConfig } = useApp();
  const [draft, setDraft] = useState<NodeConfig>(nodeConfig);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep the form in sync if another tab or the welcome flow changes
  // the config underneath us.
  useEffect(() => {
    setDraft(nodeConfig);
  }, [nodeConfig]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await putNodeConfig(nodeId, {
        dailyHelperLimit: Math.round(draft.dailyHelperLimit),
        shortExchangeHours: draft.shortExchangeHours,
        reciprocalPairThreshold: Math.round(draft.reciprocalPairThreshold),
      });
      await refreshNodeConfig();
      setSavedAt(Date.now());
    } catch (err) {
      if (err instanceof InvalidNodeConfigError) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    setError(null);
    try {
      const fresh = await resetNodeConfig(nodeId);
      setDraft(fresh);
      await refreshNodeConfig();
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="card mb-4"
      aria-labelledby="community-settings-title"
    >
      <h2
        id="community-settings-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500"
      >
        {t("profile.communitySettings.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.communitySettings.intro")}
      </p>
      <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
        <p>{t("profile.communitySettings.bootstrapNote")}</p>
        <p className="mt-2">
          <Link
            to="/proposals/new"
            className="font-medium underline-offset-2 hover:underline"
          >
            {t("profile.communitySettings.proposeLink")}
          </Link>
        </p>
      </div>

      <form onSubmit={save} className="flex flex-col gap-4">
        <Field
          id="cfg-daily"
          label={t("profile.communitySettings.dailyLimit.label")}
          hint={t("profile.communitySettings.dailyLimit.hint")}
        >
          <input
            id="cfg-daily"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            step={1}
            value={draft.dailyHelperLimit}
            onChange={(e) =>
              setDraft({
                ...draft,
                dailyHelperLimit: Number(e.target.value),
              })
            }
            className="input"
          />
        </Field>
        <Field
          id="cfg-short"
          label={t("profile.communitySettings.shortExchange.label")}
          hint={t("profile.communitySettings.shortExchange.hint")}
        >
          <input
            id="cfg-short"
            type="number"
            inputMode="decimal"
            min={0}
            max={24}
            step={0.05}
            value={draft.shortExchangeHours}
            onChange={(e) =>
              setDraft({
                ...draft,
                shortExchangeHours: Number(e.target.value),
              })
            }
            className="input"
          />
        </Field>
        <Field
          id="cfg-reciprocal"
          label={t("profile.communitySettings.reciprocal.label")}
          hint={t("profile.communitySettings.reciprocal.hint")}
        >
          <input
            id="cfg-reciprocal"
            type="number"
            inputMode="numeric"
            min={2}
            max={50}
            step={1}
            value={draft.reciprocalPairThreshold}
            onChange={(e) =>
              setDraft({
                ...draft,
                reciprocalPairThreshold: Number(e.target.value),
              })
            }
            className="input"
          />
        </Field>

        {error && (
          <p className="text-sm text-red-700 dark:text-red-300" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving
              ? t("common.saving")
              : t("profile.communitySettings.save")}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleReset}
            disabled={saving}
          >
            {t("profile.communitySettings.reset")}
          </button>
          {savedAt && (
            <span className="text-xs text-moss-500">
              {t("common.savedAt", {
                when: new Date(savedAt).toLocaleTimeString(
                  i18n.resolvedLanguage,
                ),
              })}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <p className="text-xs text-moss-600 dark:text-moss-300">{hint}</p>
      {children}
    </div>
  );
}
