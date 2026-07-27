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
import i18n from "i18next";
import type { BackendModule, ReadCallback } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import { languageInfo, SUPPORTED_LANGUAGES } from "./languages";

export {
  LANGUAGES,
  languageInfo,
  speakLangFor,
  SUPPORTED_LANGUAGES,
  type LanguageInfo,
  type SupportedLanguage,
} from "./languages";

// English ships in the main bundle: it is the fallback, and a device
// that has never picked a language must render without a network
// round-trip. Every OTHER locale is a dynamic import — its own chunk,
// fetched the first time i18next needs the language and cached by the
// service worker's locale route from then on (vite.config.ts). First
// load stays flat no matter how many languages the registry grows
// (docs/i18n-expansion.md Phase 0).
const LOCALE_LOADERS: Record<
  string,
  () => Promise<{ default: Record<string, unknown> }>
> = {
  en: () => Promise.resolve({ default: en }),
  es: () => import("./locales/es.json"),
};

// Minimal i18next backend over the loader map. `supportedLngs` below
// keeps i18next from ever requesting a language outside the registry,
// but read() still answers unknown codes with an empty bundle (never
// an error) so a stray request degrades to the en fallback silently.
const lazyLocaleBackend: BackendModule = {
  type: "backend",
  init() {
    /* nothing to configure */
  },
  read(lng: string, _ns: string, callback: ReadCallback) {
    const load = LOCALE_LOADERS[lng];
    if (!load) {
      callback(null, {});
      return;
    }
    load().then(
      (m) => callback(null, m.default),
      (err) => callback(err as Error, null),
    );
  },
};

const STORAGE_KEY = "understoria.language";

/**
 * Resolves once i18next is initialized AND the detected language's
 * resources are loaded. main.tsx gates the first render on this so a
 * returning Spanish-speaking member never sees an English flash while
 * the locale chunk arrives (it is one same-origin, SW-cached fetch).
 */
export const i18nReady: Promise<unknown> = i18n
  .use(lazyLocaleBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    // en above is bundled; everything else arrives via the backend.
    partialBundledLanguages: true,
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES as readonly string[],
    interpolation: {
      // React already escapes by default.
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
    returnNull: false,
  });

// <html lang> / <html dir> follow the active language. lang feeds
// screen readers and the read-aloud voice pick; dir is the RTL
// program's future hook (every registry entry is ltr until the
// Phase 3 logical-property sweep lands — see languages.ts).
function applyDocumentLanguage(lng: string | undefined): void {
  if (typeof document === "undefined") return;
  const info = languageInfo(lng);
  document.documentElement.lang = info.code;
  document.documentElement.dir = info.dir;
}
i18n.on("languageChanged", applyDocumentLanguage);
void i18nReady.then(() => applyDocumentLanguage(i18n.resolvedLanguage));

export function setLanguage(lang: string): void {
  // changeLanguage pulls the locale chunk through the backend if this
  // device has never used the language before.
  void i18n.changeLanguage(lang);
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode etc. — fine */
  }
}

export default i18n;
