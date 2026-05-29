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
import { useApp } from "@/state/AppContext";
import { THEME_PREFERENCES, type ThemePreference } from "@/lib/theme";

export function AppearanceSection() {
  const { t } = useTranslation();
  const { themePreference, setThemePreference } = useApp();
  return (
    <section className="card mb-4" aria-labelledby="appearance-section-title">
      <h2
        id="appearance-section-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500"
      >
        {t("profile.appearance.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.appearance.intro")}
      </p>
      <div
        role="radiogroup"
        aria-labelledby="appearance-section-title"
        className="flex flex-wrap gap-2"
      >
        {THEME_PREFERENCES.map((pref: ThemePreference) => {
          const selected = themePreference === pref;
          return (
            <button
              key={pref}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                void setThemePreference(pref);
              }}
              className={selected ? "btn-primary" : "btn-secondary"}
            >
              {t(`profile.appearance.${pref}`)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
