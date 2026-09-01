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
  isReadAloudEnabled,
  setReadAloudEnabled,
} from "@/lib/readAloud";
import {
  onVoicesChanged,
  speak,
  voiceAvailabilityFor,
  type VoiceAvailability,
} from "@/lib/speak";
import { languageInfo, speakLangFor } from "@/i18n";

/** Settings card for read-aloud mode (#473). The toggle itself
 *  speaks its new state — the one control a non-reader must be able
 *  to operate before the mode exists. */
export function ReadAloudSection() {
  const { t, i18n } = useTranslation();
  const [enabled, setEnabled] = useState(isReadAloudEnabled);
  const supported = typeof window.speechSynthesis !== "undefined";
  const lang = speakLangFor(i18n.resolvedLanguage);

  // Same honesty pattern as the content-fallback note in Language:
  // when this device's engine has voices but none for the member's
  // language (everyday reality for Tibetan, patchy for Urdu), say so
  // — never let the toggle sit there promising speech that stays
  // silent. Voice lists load late on many phones, so re-check on
  // voiceschanged; while the list is empty we say nothing rather
  // than warn falsely.
  const [voiceState, setVoiceState] = useState<VoiceAvailability>(() =>
    voiceAvailabilityFor(lang),
  );
  useEffect(() => {
    setVoiceState(voiceAvailabilityFor(lang));
    return onVoicesChanged(() => setVoiceState(voiceAvailabilityFor(lang)));
  }, [lang]);

  return (
    <section className="card mb-4" aria-labelledby="read-aloud-title">
      <h2
        id="read-aloud-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        <span aria-hidden="true" className="me-1">
          🔊
        </span>
        {t("profile.readAloud.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.readAloud.intro")}
      </p>
      {supported ? (
        <>
          <button
            type="button"
            aria-pressed={enabled}
            className={enabled ? "btn-primary" : "btn-secondary"}
            onClick={() => {
              const next = !enabled;
              setReadAloudEnabled(next);
              setEnabled(next);
              speak(
                next
                  ? t("profile.readAloud.spokenOn")
                  : t("profile.readAloud.spokenOff"),
                lang,
              );
            }}
          >
            {enabled
              ? t("profile.readAloud.turnOff")
              : t("profile.readAloud.turnOn")}
          </button>
          {voiceState === "missing" && (
            <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              {t("profile.readAloud.noVoice", {
                language: languageInfo(i18n.resolvedLanguage).endonym,
              })}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("profile.readAloud.unsupported")}
        </p>
      )}
    </section>
  );
}
