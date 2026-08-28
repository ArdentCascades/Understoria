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
import { languageInfo, SELECTABLE_LANGUAGES } from "./languages";
import { ensureContent } from "@/content/registry";

export {
  LANGUAGES,
  languageInfo,
  RTL_PSEUDO,
  RTL_PSEUDO_AVAILABLE,
  SELECTABLE_LANGUAGES,
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
  fr: () => import("./locales/fr.json"),
  pt: () => import("./locales/pt.json"),
  zh: () => import("./locales/zh.json"),
  hi: () => import("./locales/hi.json"),
  vi: () => import("./locales/vi.json"),
  ru: () => import("./locales/ru.json"),
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
 * resources are loaded — including its authored-content bundle
 * (templates, tips, steps, FAQ; content/registry.ts). main.tsx gates
 * the first render on this, which is what keeps every content
 * selector synchronous: by the time anything renders in language X,
 * X's content is cached or English is the honest fallback.
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
    // Selectable, not just shipped: includes the dev-only "rtl"
    // preview when the build carries it (languages.ts). Its empty
    // locale bundle falls through to English per key.
    supportedLngs: SELECTABLE_LANGUAGES.map((l) => l.code),
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
  })
  // The detected language's authored-content bundle loads before the
  // gate opens (see the i18nReady doc comment above). ensureContent
  // never rejects on unknown locales — English is the fallback.
  .then(() => ensureContent(i18n.resolvedLanguage));

// <html lang> / <html dir> follow the active language — but each
// follows a different notion of "active", deliberately:
//
//   dir  follows the language the member ASKED for (i18n.language).
//        Layout mirrors even while strings fall back to English —
//        that asymmetry is what makes the dev-only "rtl" preview
//        pseudo-locale possible at all: its code never has resources,
//        so it never becomes the RESOLVED language, yet its whole
//        point is the mirrored layout (docs/rtl-plan.md R3).
//
//   lang follows what is actually rendering (i18n.resolvedLanguage):
//        it feeds screen readers and the read-aloud voice pick, so it
//        must name the language of the text on screen — English
//        during any fallback, the real code once its bundle lands.
//        Under the pseudo-locale this honestly reads lang="en".
function applyDocumentLanguage(): void {
  if (typeof document === "undefined") return;
  document.documentElement.dir = languageInfo(i18n.language).dir;
  document.documentElement.lang = languageInfo(
    i18n.resolvedLanguage ?? i18n.language,
  ).code;
}
i18n.on("languageChanged", (lng) => {
  applyDocumentLanguage();
  // Safety net for changeLanguage calls that bypass setLanguage
  // (tests, future callers): start the content load; the render that
  // races it falls back to English until the bundle lands.
  void ensureContent(lng);
});
void i18nReady.then(() => applyDocumentLanguage());

export function setLanguage(lang: string): void {
  // The content bundle loads BEFORE i18next switches, so the
  // re-render that follows changeLanguage sees translated templates
  // immediately — never an English flash that fixes itself. The UI
  // locale chunk itself still loads through the backend inside
  // changeLanguage. ensureContent never rejects (English fallback),
  // and changeLanguage failures were already fire-and-forget here.
  void ensureContent(lang).then(() => i18n.changeLanguage(lang));
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode etc. — fine */
  }
}

export default i18n;
