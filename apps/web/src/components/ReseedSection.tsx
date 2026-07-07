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
import { getSetting, SETTING_KEYS } from "@/db/database";
import { LAST_SEEN_SYSTEM_KEY } from "@/lib/nodeEndpoints";
import { getWindowHorizonMs, YEAR_MS } from "@/lib/storageWindow";
import {
  runReseed,
  type ReseedKindResult,
} from "@/lib/reseed";

// "Restore this community onto a node" — re-seed Phase R1
// (docs/community-reseed.md §2). This is the disaster lever: every
// server is gone, a fresh one is standing, and any member's device
// can upload the whole shared history back. Deliberately a MEMBER
// capability (the lost node's operator may be the person who is
// gone), deliberately behind an explicit confirm (it uploads the
// community's shared history — the same data any node of this
// community holds — to whatever URL is entered), and deliberately
// resumable (an interrupted run continues where it stopped).
export function ReseedSection() {
  const { t } = useTranslation();
  const [targetUrl, setTargetUrl] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{
    path: string;
    done: number;
    total: number;
  } | null>(null);
  const [summary, setSummary] = useState<{
    results: ReseedKindResult[];
    complete: boolean;
  } | null>(null);
  const [systemKeyNote, setSystemKeyNote] = useState<string | null>(null);
  // Storage windowing (docs/storage-budget.md Phase 1): a windowed
  // device restores only what it holds — say so, and point at the
  // collective guarantee (other devices union their copies in).
  const [windowYears, setWindowYears] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getWindowHorizonMs().then((ms) => {
      if (!cancelled) setWindowYears(ms === null ? null : Math.round(ms / YEAR_MS));
    });
    void (async () => {
      const [url, keyRecord] = await Promise.all([
        getSetting(SETTING_KEYS.communityNodeUrl),
        getSetting(LAST_SEEN_SYSTEM_KEY),
      ]);
      if (cancelled) return;
      if (url) setTargetUrl(url);
      if (keyRecord) {
        try {
          const parsed = JSON.parse(keyRecord) as {
            nodeId?: string;
            current?: string;
          };
          if (parsed.nodeId && parsed.current) {
            setSystemKeyNote(
              JSON.stringify([
                {
                  nodeId: parsed.nodeId,
                  current: parsed.current,
                },
              ]),
            );
          }
        } catch {
          /* absent is a normal state */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRun() {
    setConfirming(false);
    setRunning(true);
    setSummary(null);
    try {
      const outcome = await runReseed({
        targetUrl,
        onProgress: (p) => setProgress(p),
      });
      setSummary(outcome);
    } finally {
      setRunning(false);
      setProgress(null);
    }
  }

  const totals = summary?.results.reduce(
    (acc, r) => ({
      restored: acc.restored + r.restored,
      alreadyPresent: acc.alreadyPresent + r.alreadyPresent,
      skipped: acc.skipped + r.skipped,
    }),
    { restored: 0, alreadyPresent: 0, skipped: 0 },
  );

  return (
    <section className="card mb-4" aria-labelledby="reseed-title">
      <h2
        id="reseed-title"
        className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("reseed.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("reseed.intro")}
      </p>

      {windowYears !== null && (
        <p className="mb-3 text-xs text-moss-600 dark:text-moss-300">
          {t("reseed.windowedNote", { years: windowYears })}
        </p>
      )}

      <label className="mb-3 flex flex-col gap-1">
        <span className="text-sm font-medium">{t("reseed.targetLabel")}</span>
        <input
          className="input"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="https://new-node.example/api"
          disabled={running}
        />
      </label>

      {systemKeyNote && (
        <p className="mb-3 break-all text-xs text-moss-600 dark:text-moss-300">
          {t("reseed.systemKeyNote")}{" "}
          <code className="rounded bg-moss-100 px-1 dark:bg-moss-900">
            {systemKeyNote}
          </code>
        </p>
      )}

      {!running && !confirming && (
        <button
          type="button"
          className="btn-secondary"
          disabled={!targetUrl.trim()}
          onClick={() => setConfirming(true)}
        >
          {t("reseed.start")}
        </button>
      )}

      {confirming && (
        <div
          role="region"
          aria-label={t("reseed.confirmTitle")}
          className="rounded-xl border border-canopy-200 bg-canopy-50 px-3 py-2 text-sm dark:border-canopy-900 dark:bg-canopy-950/40"
        >
          <p className="mb-2 font-medium text-canopy-900 dark:text-canopy-100">
            {t("reseed.confirmTitle")}
          </p>
          <p className="mb-2 text-canopy-900 dark:text-canopy-100">
            {t("reseed.confirmBody", { url: targetUrl.trim() })}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setConfirming(false)}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="btn-primary text-xs"
              onClick={() => void handleRun()}
            >
              {t("reseed.confirm")}
            </button>
          </div>
        </div>
      )}

      {running && (
        <p
          className="text-sm text-moss-700 dark:text-moss-200"
          role="status"
          aria-live="polite"
        >
          {progress
            ? t("reseed.progress", {
                kind: progress.path,
                done: progress.done,
                total: progress.total,
              })
            : t("reseed.starting")}
        </p>
      )}

      {summary && totals && (
        <div className="mt-2 text-sm text-moss-700 dark:text-moss-200">
          <p className="font-medium">
            {summary.complete
              ? t("reseed.doneComplete")
              : t("reseed.doneInterrupted")}
          </p>
          <p>
            {t("reseed.totals", {
              restored: totals.restored,
              present: totals.alreadyPresent,
              skipped: totals.skipped,
            })}
          </p>
          {totals.skipped > 0 && (
            <p className="mt-1 text-xs">{t("reseed.skippedHint")}</p>
          )}
        </div>
      )}
    </section>
  );
}
