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
  canRunTranscription,
  isTranscriptionEnabled,
  setTranscriptionEnabled,
} from "@/lib/transcription";
import {
  deleteAllModels,
  downloadModel,
  fetchModelManifest,
  isModelDownloaded,
  modelForLanguage,
  type ModelEntry,
} from "@/lib/transcriptionModels";
import { formatBytes } from "@/lib/storageBudget";
import { languageInfo } from "@/i18n";

/**
 * Settings card for on-device transcription (V7 #477, Phase 1 —
 * docs/transcription-plan.md). Every cost is stated BEFORE it is
 * paid: the model's size before the download, the battery reality in
 * the intro, and every way this device or deployment can't do it —
 * said plainly instead of a toggle that promises what can't happen.
 */

type ModelState =
  | { kind: "checking" }
  /** The node's static tier hosts no /models/ at all. */
  | { kind: "noModels" }
  /** Models exist, but none for the member's language. */
  | { kind: "noModelForLanguage" }
  | { kind: "available"; entry: ModelEntry }
  | { kind: "downloading"; entry: ModelEntry }
  | { kind: "downloaded"; entry: ModelEntry }
  | { kind: "verifyFailed"; entry: ModelEntry }
  | { kind: "downloadFailed"; entry: ModelEntry };

export function TranscriptionSection() {
  const { t, i18n } = useTranslation();
  const [enabled, setEnabled] = useState(isTranscriptionEnabled);
  const supported = canRunTranscription();
  const [model, setModel] = useState<ModelState>({ kind: "checking" });

  useEffect(() => {
    if (!supported) return;
    let alive = true;
    void (async () => {
      const manifest = await fetchModelManifest();
      if (!alive) return;
      if (manifest.kind !== "ok") {
        setModel({ kind: "noModels" });
        return;
      }
      const entry = modelForLanguage(manifest, i18n.resolvedLanguage);
      if (entry === null) {
        setModel({ kind: "noModelForLanguage" });
        return;
      }
      const downloaded = await isModelDownloaded(entry);
      if (!alive) return;
      setModel({ kind: downloaded ? "downloaded" : "available", entry });
    })();
    return () => {
      alive = false;
    };
  }, [supported, i18n.resolvedLanguage]);

  async function handleDownload(entry: ModelEntry) {
    setModel({ kind: "downloading", entry });
    const result = await downloadModel(entry, i18n.resolvedLanguage);
    setModel(
      result.kind === "ok"
        ? { kind: "downloaded", entry }
        : result.kind === "verify_failed"
          ? { kind: "verifyFailed", entry }
          : { kind: "downloadFailed", entry },
    );
  }

  async function handleRemove(entry: ModelEntry) {
    await deleteAllModels();
    setModel({ kind: "available", entry });
  }

  const endonym = languageInfo(i18n.resolvedLanguage).endonym;

  return (
    <section className="card mb-4" aria-labelledby="transcription-title">
      <h2
        id="transcription-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        <span aria-hidden="true" className="me-1">
          📝
        </span>
        {t("transcription.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("transcription.intro")}
      </p>
      {!supported ? (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("transcription.unsupported")}
        </p>
      ) : (
        <>
          <button
            type="button"
            aria-pressed={enabled}
            className={enabled ? "btn-primary" : "btn-secondary"}
            onClick={() => {
              const next = !enabled;
              setTranscriptionEnabled(next);
              setEnabled(next);
            }}
          >
            {enabled
              ? t("transcription.turnOff")
              : t("transcription.turnOn")}
          </button>
          {enabled && (
            <div className="mt-3 text-sm">
              {model.kind === "noModels" && (
                <p className="text-moss-600 dark:text-moss-300">
                  {t("transcription.noModels")}
                </p>
              )}
              {model.kind === "noModelForLanguage" && (
                <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                  {t("transcription.noModelForLanguage", {
                    language: endonym,
                  })}
                </p>
              )}
              {(model.kind === "available" ||
                model.kind === "verifyFailed" ||
                model.kind === "downloadFailed") && (
                <>
                  {model.kind === "verifyFailed" && (
                    <p
                      role="alert"
                      className="mb-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                    >
                      {t("transcription.verifyFailed")}
                    </p>
                  )}
                  {model.kind === "downloadFailed" && (
                    <p role="alert" className="mb-2 text-moss-600 dark:text-moss-300">
                      {t("transcription.downloadFailed")}
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => void handleDownload(model.entry)}
                  >
                    {t("transcription.download", {
                      language: endonym,
                      size: formatBytes(model.entry.bytes),
                    })}
                  </button>
                </>
              )}
              {model.kind === "downloading" && (
                <p role="status" className="text-moss-600 dark:text-moss-300">
                  {t("transcription.downloading", {
                    size: formatBytes(model.entry.bytes),
                  })}
                </p>
              )}
              {model.kind === "downloaded" && (
                <>
                  <p className="text-moss-600 dark:text-moss-300">
                    {t("transcription.downloaded", {
                      language: endonym,
                      size: formatBytes(model.entry.bytes),
                    })}
                  </p>
                  <button
                    type="button"
                    className="btn-secondary mt-2"
                    onClick={() => void handleRemove(model.entry)}
                  >
                    {t("transcription.removeModel")}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
