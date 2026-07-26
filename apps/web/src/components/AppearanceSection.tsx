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
import {
  TEXT_SIZE_PREFERENCES,
  type TextSize,
  type TextSizePreference,
} from "@/lib/textSize";
import {
  DENSITY_PREFERENCES,
  type DensityPreference,
} from "@/lib/density";
import {
  PALETTE_PREFERENCES,
  type PalettePreference,
} from "@/lib/palette";
import { MIST_PREFERENCES, type MistPreference } from "@/lib/mist";

// Each text-size label renders at the size it represents so the
// choice is self-demonstrating. Auto borrows the currently-resolved
// size's class so its label visually matches what Auto is doing
// right now. The relative size order between the buttons is what
// makes the affordance work, not absolute pixels.
const RESOLVED_LABEL_CLASS: Record<TextSize, string> = {
  default: "text-base",
  larger: "text-lg",
  largest: "text-xl",
};

// Preview literals per docs/themes-plan.md T2: each palette's
// canopy-600 / moss-300 / ember-500 / bark-400, deliberately NOT the
// live CSS variables so every option previews its own palette while
// another one is active.
const PALETTE_SWATCHES: Record<PalettePreference, readonly string[]> = {
  canopy: ["#16a34a", "#adc09e", "#c97f1e", "#9a886b"],
  riverbed: ["#2197d1", "#afbcc8", "#df7229", "#838b98"],
  harvest: ["#729a21", "#bdbba5", "#b6881b", "#a2856e"],
  fieldnotes: ["#3a8d6a", "#c9c9c6", "#ba8641", "#8f8a7f"],
};

export function AppearanceSection() {
  const { t } = useTranslation();
  const {
    themePreference,
    setThemePreference,
    textSizePreference,
    textSize,
    setTextSizePreference,
    densityPreference,
    setDensityPreference,
    palettePreference,
    setPalettePreference,
    mistPreference,
    setMistPreference,
  } = useApp();
  return (
    <section className="card mb-4" aria-labelledby="appearance-section-title">
      <h2
        id="appearance-section-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
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

      <div
        className="my-4 border-t border-bark-200/60 dark:border-moss-800"
        aria-hidden="true"
      />

      <h3
        id="appearance-text-size-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("profile.appearance.textSizeTitle")}
      </h3>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.appearance.textSizeIntro")}
      </p>
      <div
        role="radiogroup"
        aria-labelledby="appearance-text-size-title"
        className="flex flex-wrap items-center gap-2"
      >
        {TEXT_SIZE_PREFERENCES.map((pref: TextSizePreference) => {
          const selected = textSizePreference === pref;
          // For Auto, mirror the resolved size's class so the label
          // visually matches what Auto is currently doing.
          const labelClass =
            pref === "auto"
              ? RESOLVED_LABEL_CLASS[textSize]
              : RESOLVED_LABEL_CLASS[pref as TextSize];
          return (
            <button
              key={pref}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                void setTextSizePreference(pref);
              }}
              className={`${
                selected ? "btn-primary" : "btn-secondary"
              } ${labelClass}`}
            >
              {t(`profile.appearance.${pref}`)}
            </button>
          );
        })}
      </div>
      {textSizePreference === "auto" && (
        <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
          {t("profile.appearance.autoSublabel", {
            resolved: t(`profile.appearance.${textSize}`),
          })}
        </p>
      )}

      <div
        className="my-4 border-t border-bark-200/60 dark:border-moss-800"
        aria-hidden="true"
      />

      <h3
        id="appearance-density-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("profile.appearance.densityTitle")}
      </h3>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.appearance.densityIntro")}
      </p>
      <div
        role="radiogroup"
        aria-labelledby="appearance-density-title"
        className="flex flex-wrap gap-2"
      >
        {DENSITY_PREFERENCES.map((pref: DensityPreference) => {
          const selected = densityPreference === pref;
          return (
            <button
              key={pref}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                void setDensityPreference(pref);
              }}
              className={selected ? "btn-primary" : "btn-secondary"}
            >
              {t(`profile.appearance.density.${pref}`)}
            </button>
          );
        })}
      </div>

      <div
        className="my-4 border-t border-bark-200/60 dark:border-moss-800"
        aria-hidden="true"
      />

      <h3
        id="appearance-palette-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("profile.appearance.paletteTitle")}
      </h3>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.appearance.paletteIntro")}
      </p>
      <div
        role="radiogroup"
        aria-labelledby="appearance-palette-title"
        className="flex flex-wrap gap-2"
      >
        {PALETTE_PREFERENCES.map((pref: PalettePreference) => {
          const selected = palettePreference === pref;
          return (
            <button
              key={pref}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                void setPalettePreference(pref);
              }}
              className={selected ? "btn-primary" : "btn-secondary"}
            >
              {/* Decorative four-dot preview; the label text carries
                  the meaning. */}
              <span className="inline-flex items-center gap-1" aria-hidden="true">
                {PALETTE_SWATCHES[pref].map((hex) => (
                  <span
                    key={hex}
                    className="h-2.5 w-2.5 rounded-full"
                    // Inline style on purpose: preview literals per
                    // docs/themes-plan.md T2, not the live variables.
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </span>
              {t(`profile.appearance.palette.${pref}`)}
            </button>
          );
        })}
      </div>

      <h3
        id="appearance-mist-title"
        className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("profile.appearance.mistTitle")}
      </h3>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.appearance.mistIntro")}
      </p>
      <div
        role="radiogroup"
        aria-labelledby="appearance-mist-title"
        className="flex flex-wrap gap-2"
      >
        {MIST_PREFERENCES.map((pref: MistPreference) => {
          const selected = mistPreference === pref;
          return (
            <button
              key={pref}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                void setMistPreference(pref);
              }}
              className={selected ? "btn-primary" : "btn-secondary"}
            >
              {t(`profile.appearance.mist.${pref}`)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
