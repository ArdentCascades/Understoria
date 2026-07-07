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
import {
  applyWindow,
  collectWindowPlan,
  getWindowHorizonMs,
  planToPreview,
  undoWindowing,
  WINDOW_HORIZON_CHOICES,
  YEAR_MS,
  type WindowPreview,
} from "@/lib/storageWindow";
import { getMySeedVaultPledge, setSeedVaultPledge } from "@/lib/seedVault";

// Storage windowing (docs/storage-budget.md Phase 1) — lives inside
// Settings' Data card, next to the meter it exists to answer. Member-
// initiated, preview-before-delete, honest about coverage afterwards.
export function StorageWindowSection() {
  const { t } = useTranslation();
  const [horizonMs, setHorizonMs] = useState<number | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [chosen, setChosen] = useState<number>(WINDOW_HORIZON_CHOICES[1]);
  const [preview, setPreview] = useState<WindowPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  // Seed-vault role (docs/storage-budget.md Phase 2) — the visible
  // opposite of windowing; the two are mutually exclusive.
  const [vaultActive, setVaultActive] = useState(false);

  useEffect(() => {
    void getWindowHorizonMs().then(setHorizonMs);
    void getMySeedVaultPledge().then((p) => setVaultActive(p?.active === true));
  }, []);

  async function handleVault(active: boolean) {
    setBusy(true);
    setNote(null);
    try {
      const result = await setSeedVaultPledge(active);
      if (!result.ok) {
        setNote(t(`profile.data.vault.error.${result.error}`));
        return;
      }
      setVaultActive(active);
      if (active) {
        setHorizonMs(null);
        setChoosing(false);
        setPreview(null);
        setNote(t("profile.data.vault.enabled"));
      } else {
        setNote(t("profile.data.vault.disabled"));
      }
    } finally {
      setBusy(false);
    }
  }

  const years = (ms: number) => Math.round(ms / YEAR_MS);

  async function handlePreview(ms: number) {
    setBusy(true);
    try {
      setChosen(ms);
      const plan = await collectWindowPlan(ms);
      setPreview(planToPreview(plan));
    } finally {
      setBusy(false);
    }
  }

  async function handleApply() {
    setBusy(true);
    try {
      const removed = await applyWindow(chosen);
      setHorizonMs(chosen);
      setChoosing(false);
      setPreview(null);
      setNote(t("profile.data.window.done", { total: removed }));
    } finally {
      setBusy(false);
    }
  }

  async function handleUndo() {
    setBusy(true);
    try {
      await undoWindowing();
      setHorizonMs(null);
      setNote(t("profile.data.window.undoDone"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 border-t border-moss-200 pt-3 dark:border-moss-800">
      <p className="mb-2 text-xs text-moss-600 dark:text-moss-300">
        {vaultActive
          ? t("profile.data.vault.active")
          : horizonMs === null
            ? t("profile.data.window.full")
            : t("profile.data.window.windowed", { years: years(horizonMs) })}
      </p>

      {!choosing && horizonMs === null && !vaultActive && (
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() => {
            setNote(null);
            setChoosing(true);
            void handlePreview(chosen);
          }}
        >
          {t("profile.data.window.freeUp")}
        </button>
      )}

      {choosing && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium">
            {t("profile.data.window.chooseHorizon")}
          </p>
          <div className="flex gap-2">
            {WINDOW_HORIZON_CHOICES.map((ms) => (
              <button
                key={ms}
                type="button"
                disabled={busy}
                className={
                  chosen === ms ? "btn-primary text-xs" : "btn-secondary text-xs"
                }
                onClick={() => void handlePreview(ms)}
              >
                {t("profile.data.window.keepYears", { years: years(ms) })}
              </button>
            ))}
          </div>
          {preview && (
            <p className="text-xs text-moss-600 dark:text-moss-300">
              {t("profile.data.window.preview", {
                total: preview.total,
                posts: preview.posts,
                events: preview.events,
                projects: preview.projects,
              })}
            </p>
          )}
          <p className="text-xs text-moss-600 dark:text-moss-300">
            {t("profile.data.window.previewNote")}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => {
                setChoosing(false);
                setPreview(null);
              }}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="btn-primary text-xs"
              disabled={busy || preview === null}
              onClick={() => void handleApply()}
            >
              {t("profile.data.window.confirm")}
            </button>
          </div>
        </div>
      )}

      {!choosing && horizonMs !== null && (
        <button
          type="button"
          className="btn-secondary text-xs"
          disabled={busy}
          onClick={() => void handleUndo()}
        >
          {t("profile.data.window.undo")}
        </button>
      )}

      {!choosing && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-moss-600 dark:text-moss-300">
            {t("profile.data.vault.body")}
          </p>
          <button
            type="button"
            className="btn-secondary text-xs"
            disabled={busy}
            onClick={() => void handleVault(!vaultActive)}
          >
            {vaultActive
              ? t("profile.data.vault.disable")
              : t("profile.data.vault.enable")}
          </button>
        </div>
      )}

      {note && (
        <p role="status" className="mt-2 text-xs text-canopy-800 dark:text-canopy-200">
          {note}
        </p>
      )}
    </div>
  );
}
