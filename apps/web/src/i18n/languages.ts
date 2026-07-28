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

// The language registry (docs/i18n-expansion.md Phase 0). One record
// per shipped language; everything language-shaped in the app derives
// from this table — the Settings list, i18next's supportedLngs, the
// <html lang>/<html dir> attributes, and the tag handed to on-device
// speech. Adding a language is: add a record here, add its locale
// loader in i18n/index.ts, add its file to the i18n test tables —
// the generalized parity/plural/interpolation gates then enforce
// completeness before it can ship.
export interface LanguageInfo {
  /** i18next/BCP-47 code, also the locale file name. */
  code: string;
  /** The language's name in itself ("Español", "中文") — a language
   *  should name itself; a member searching for theirs shouldn't
   *  need to know its English exonym. */
  endonym: string;
  /** Writing direction. Applied to <html dir> on language change.
   *  No "rtl" entry may ship before the plan's Phase 3 RTL program
   *  (logical-property sweep + mirrored-surface verification). */
  dir: "ltr" | "rtl";
  /** Tag passed to speechSynthesis (read-aloud, spoken panic
   *  confirm). Usually the bare code; a future locale may need a
   *  region ("pt-BR") where voices differ materially. */
  speakLang: string;
  /** Present while a translation is new: AI-assisted, human-reviewed,
   *  awaiting a native-speaker review cycle. Renders the honesty note
   *  in Settings → Language. Remove after the review completes. */
  reviewStatus?: "new";
  /** "full" when the authored content corpus (FAQ, templates, task
   *  steps/tips) exists in this language too; "ui-only" while only
   *  the UI strings are translated and content falls back to English
   *  (docs/i18n-expansion.md Phase 2 ships content per language).
   *  Renders the honest content-fallback note in Settings — never
   *  silent mixed-language surprises. */
  content: "full" | "ui-only";
}

export const LANGUAGES = [
  { code: "en", endonym: "English", dir: "ltr", speakLang: "en", content: "full" },
  { code: "es", endonym: "Español", dir: "ltr", speakLang: "es", content: "full" },
  {
    code: "fr",
    endonym: "Français",
    dir: "ltr",
    speakLang: "fr",
    reviewStatus: "new",
    content: "full",
  },
  {
    code: "pt",
    endonym: "Português",
    dir: "ltr",
    speakLang: "pt",
    reviewStatus: "new",
    content: "full",
  },
  // Simplified Chinese ships under the language-only code "zh" —
  // that's what browsers send (zh-CN, zh-SG) and what i18next's
  // language-only fallback resolves; a "zh-Hans" code would match
  // neither. zh-Hant (Traditional) is a possible future sibling.
  {
    code: "zh",
    endonym: "中文",
    dir: "ltr",
    speakLang: "zh-CN",
    reviewStatus: "new",
    content: "full",
  },
] as const satisfies readonly LanguageInfo[];

export type SupportedLanguage = (typeof LANGUAGES)[number]["code"];

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] =
  LANGUAGES.map((l) => l.code);

/** Registry record for a resolved i18next language, tolerating
 *  regioned tags ("es-MX" → es). Unknown tags resolve to English —
 *  the same fallback i18next itself applies. */
export function languageInfo(lang: string | undefined): LanguageInfo {
  const base = (lang ?? "en").toLowerCase();
  return (
    LANGUAGES.find((l) => {
      const code = l.code.toLowerCase();
      return base === code || base.startsWith(`${code}-`);
    }) ?? LANGUAGES[0]
  );
}

/** The speech-synthesis tag for the active UI language. Callers pass
 *  `i18n.resolvedLanguage`; this replaces the hand-rolled
 *  `startsWith("es") ? "es" : "en"` branches that silently pinned
 *  every future language to an English voice. */
export function speakLangFor(lang: string | undefined): string {
  return languageInfo(lang).speakLang;
}
