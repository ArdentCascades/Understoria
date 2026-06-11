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
import {
  LANGUAGE_LABELS,
  setLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/i18n";

export function LanguageSection() {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "en") as SupportedLanguage;
  return (
    <section className="card mb-4" aria-labelledby="language-section-title">
      <h2
        id="language-section-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300"
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
        {SUPPORTED_LANGUAGES.map((lang) => {
          const selected = current === lang;
          return (
            <button
              key={lang}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setLanguage(lang)}
              className={
                selected
                  ? "btn-primary"
                  : "btn-secondary"
              }
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
