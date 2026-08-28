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
import { useTranslation } from "react-i18next";
import { SELECTABLE_LANGUAGES, languageInfo, setLanguage } from "@/i18n";

export function LanguageSection() {
  const { t, i18n } = useTranslation();
  // language, not resolvedLanguage: the RTL preview pseudo-locale has
  // no resources of its own, so it never "resolves" — but it is still
  // the member's active pick, and its button should show selected.
  // For every real language the two agree once its bundle is loaded.
  const current = languageInfo(i18n.language);
  return (
    <section className="card mb-4" aria-labelledby="language-section-title">
      <h2
        id="language-section-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("profile.language.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.language.intro")}
      </p>
      <div
        role="radiogroup"
        aria-labelledby="language-section-title"
        className="flex flex-wrap gap-2"
      >
        {/* SELECTABLE, not LANGUAGES: dev builds append the RTL
            preview pseudo-locale (docs/rtl-plan.md R3); member builds
            render exactly the shipped registry. */}
        {SELECTABLE_LANGUAGES.map((lang) => {
          const selected = current.code === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={selected}
              // A language names itself in itself — a member looking
              // for theirs shouldn't need its English exonym.
              lang={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={selected ? "btn-primary" : "btn-secondary"}
            >
              {lang.endonym}
            </button>
          );
        })}
      </div>
      {current.reviewStatus === "new" && (
        // Translation-status honesty (docs/i18n-expansion.md Phase 0):
        // a freshly shipped locale says so — AI-assisted, human-
        // reviewed, corrections welcome — until a native-speaker
        // review cycle clears the registry flag. Same posture as the
        // beta disclosure.
        <p className="mt-3 text-xs text-moss-600 dark:text-moss-300">
          {t("profile.language.newTranslationNote")}
        </p>
      )}
      {current.content === "ui-only" && (
        // Content-coverage honesty (plan Phase 2): the UI is
        // translated but the authored corpus (FAQ, project templates,
        // task tips) still falls back to English until this
        // language's content phase ships. Said out loud — never a
        // silent mixed-language surprise.
        <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
          {t("profile.language.contentEnglishNote")}
        </p>
      )}
    </section>
  );
}
