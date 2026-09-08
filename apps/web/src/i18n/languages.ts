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
  /** Set when the locale's translated strings use Western digits but
   *  CLDR's default numbering system for the language is a native one
   *  — today only Bengali, whose bare "bn" makes Intl render ১,২৩৪
   *  and ৭/৯/২০২৬. Interpolated counts arrive as Western digits from
   *  the runtime, so an unpinned formatter would mix digit systems in
   *  one sentence. intlLocale() below appends the -u-nu-<system>
   *  Unicode extension wherever a language tag is handed to Intl
   *  (docs/i18n-glossary/bn.md, rule 8). */
  intlNumbering?: "latn";
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
  {
    code: "hi",
    endonym: "हिन्दी",
    dir: "ltr",
    speakLang: "hi",
    reviewStatus: "new",
    content: "full",
  },
  {
    code: "vi",
    endonym: "Tiếng Việt",
    dir: "ltr",
    speakLang: "vi",
    reviewStatus: "new",
    content: "full",
  },
  {
    code: "ru",
    endonym: "Русский",
    dir: "ltr",
    speakLang: "ru",
    reviewStatus: "new",
    content: "full",
  },
  // The app's first right-to-left language (docs/rtl-plan.md R4).
  // This entry ships only because the RTL program earned it: R1's
  // logical-property sweep, R2's semantic cases, and R3's mirrored-
  // surface verification all landed and are guarded before any dir:
  // "rtl" was allowed here (languages.test.ts holds that order).
  // The full authored corpus shipped on the Phase 2 rails
  // (content/bundles/ar.ts), so content is "full" like the others.
  {
    code: "ar",
    endonym: "العربية",
    dir: "rtl",
    speakLang: "ar",
    reviewStatus: "new",
    content: "full",
  },
  // Tibetan was expedited past the planned Wave-3 order in response to
  // the 2026 Tibet flood (bo is LTR, so it rides ahead of Urdu without
  // touching the RTL program's gates). The rendering spike and the
  // typography guards it demanded — a :lang(bo) font stack and a
  // line-height floor for the tall vowel signs — are recorded in
  // docs/i18n-glossary/bo.md and live in index.css. CLDR Tibetan has a
  // single plural category, so bo.json follows the zh precedent:
  // _one/_other both exist with identical strings. The authored corpus
  // (templates, tips, steps, FAQ, guides, principles) shipped on the
  // same rails as Arabic's, so content is "full".
  {
    code: "bo",
    endonym: "བོད་ཡིག",
    dir: "ltr",
    speakLang: "bo",
    reviewStatus: "new",
    content: "full",
  },
  // Urdu resumes the RTL program where it paused for the Tibetan
  // expedite: the second right-to-left language, riding the rails
  // Arabic proved (docs/rtl-plan.md R1-R3 + the ar fleet). What ur
  // adds is the Nastaliq script style — the R5 rendering spike's
  // font stack and 2.0 line-height floor live in index.css under
  // :lang(ur), and the glossary is docs/i18n-glossary/ur.md. CLDR
  // Urdu uses plain one/other plurals, so ur.json mirrors en's key
  // shape exactly.
  {
    code: "ur",
    endonym: "اردو",
    dir: "rtl",
    speakLang: "ur",
    reviewStatus: "new",
    content: "full",
  },
  // Indonesian opens the demand-driven wave (docs/i18n-expansion.md
  // "Which languages"): Latin script, single CLDR plural category
  // (id.json follows the zh/bo precedent — _one/_other both exist
  // with identical strings), no rendering spike needed. The full
  // authored corpus (templates, tips, steps, FAQ, guides,
  // principles) shipped on the Phase 2 rails
  // (content/bundles/id.ts), so content is "full" like the others.
  {
    code: "id",
    endonym: "Bahasa Indonesia",
    dir: "ltr",
    speakLang: "id",
    reviewStatus: "new",
    content: "full",
  },
  // Swahili continues the demand-driven wave: Latin script, no
  // rendering spike, genuine one/other plurals (unlike id/zh/bo the
  // _one/_other pairs really differ — noun-class concords). Until
  // this entry existed the test suite used "sw" as its
  // unknown-locale fallback probe; those probes moved to "xx" in
  // the same PR. Shipped UI-first; the full authored corpus
  // (templates, tips, steps, FAQ, guides, principles) has since
  // shipped on the Phase 2 rails (content/bundles/sw.ts), so
  // content is "full" like the others.
  {
    code: "sw",
    endonym: "Kiswahili",
    dir: "ltr",
    speakLang: "sw",
    reviewStatus: "new",
    content: "full",
  },
  // Filipino ships under "fil" — the code modern browsers, iOS,
  // Android, and CLDR use — following the zh precedent of picking
  // the tag browsers actually send. Legacy "tl"/"tl-PH" detections
  // are aliased to fil at the language detector
  // (convertDetectedLanguage in i18n/index.ts), so older systems
  // still land on Filipino rather than English. Latin script, no
  // rendering spike. CLDR Filipino's "one" plural category covers
  // every count NOT ending in 4/6/9, so fil _one strings always
  // interpolate {{count}} and never hard-code a singular. Shipped
  // UI-first; the full authored corpus (templates, tips, steps,
  // FAQ, guides, principles) has since shipped on the Phase 2
  // rails (content/bundles/fil.ts), so content is "full" like the
  // others.
  {
    code: "fil",
    endonym: "Filipino",
    dir: "ltr",
    speakLang: "fil",
    reviewStatus: "new",
    content: "full",
  },
  // Bengali closes the demand-driven wave. Its rendering spike lives
  // in index.css (:lang(bn) font stack + 1.5 line-height floor for
  // the matra/conjunct ink measured past the Latin line box) and its
  // glossary in docs/i18n-glossary/bn.md. Two grammar facts shape
  // the strings: CLDR bn's "one" covers 0 AND 1 (like hi), so every
  // _one form interpolates {{count}}; and bn is the first shipped
  // language whose CLDR default numbering system is not Western —
  // bare "bn" makes Intl render Bengali digits against the locale's
  // Western-digit text, so intlNumbering pins -u-nu-latn at every
  // Intl call site via intlLocale(). Shipped UI-first; the full
  // authored corpus (templates, tips, steps, FAQ, guides,
  // principles) has since shipped on the Phase 2 rails
  // (content/bundles/bn.ts), so content is "full" like the others.
  {
    code: "bn",
    endonym: "বাংলা",
    dir: "ltr",
    speakLang: "bn",
    reviewStatus: "new",
    content: "full",
    intlNumbering: "latn",
  },
  // Haitian Creole opens the wave after the demand-driven wave.
  // Latin script (Inter covers è/ò), no rendering spike, no digit
  // pin — but a first of its own: ICU/CLDR carries NO ht data, so
  // Intl.PluralRules("ht") silently resolves to the member's
  // browser-default locale and plural-category selection is
  // nondeterministic across devices. ht.json therefore ships
  // _one/_other pairs with IDENTICAL strings, every form
  // interpolating {{count}} — which costs Kreyòl nothing, since
  // nouns don't inflect for number (docs/i18n-glossary/ht.md,
  // rule 12). ht is also the one locale whose fallback chain is
  // ht → fr → en rather than straight to English: Haitian members
  // are far likelier to read French (i18n/index.ts fallbackLng).
  // Shipped UI-first; content is "ui-only" until the corpus lands
  // on the Phase 2 rails.
  {
    code: "ht",
    endonym: "Kreyòl Ayisyen",
    dir: "ltr",
    speakLang: "ht",
    reviewStatus: "new",
    content: "ui-only",
  },
] as const satisfies readonly LanguageInfo[];

export type SupportedLanguage = (typeof LANGUAGES)[number]["code"];

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] =
  LANGUAGES.map((l) => l.code);

// The RTL preview pseudo-locale (docs/rtl-plan.md R3). English text,
// mirrored layout: it exists so every surface can be walked
// right-to-left and verified BEFORE any Arabic or Urdu string ships —
// the honest order, since a translation must never land in a layout
// nobody has seen mirrored. It deliberately lives OUTSIDE the LANGUAGES
// registry: that array is the shipped-languages source of truth that
// the parity gates, the plural gates and the README count all derive
// from, and this entry is a scaffold, not a language. The registry's
// own rule stands — no `dir: "rtl"` entry ships in LANGUAGES until R3
// verification passes and R4 brings real translations.
//
// The code "rtl" is registry-internal, not BCP-47; it needs no locale
// file (the i18n backend answers unknown codes with an empty bundle
// and every key falls through to English) and no content bundle
// (contentLocale("rtl") resolves to English). The one cosmetic cost:
// <html lang="rtl"> while previewing — acceptable for a surface that
// never reaches a member.
export const RTL_PSEUDO: LanguageInfo = {
  code: "rtl",
  endonym: "English (RTL preview)",
  dir: "rtl",
  speakLang: "en",
  content: "full",
};

/** Whether this build carries the RTL preview: dev servers always,
 *  plus builds made with VITE_RTL_PSEUDO=1 (the rtl-verify script's
 *  production-fidelity build). Never a shipped member build. */
export const RTL_PSEUDO_AVAILABLE: boolean =
  import.meta.env.DEV || Boolean(import.meta.env.VITE_RTL_PSEUDO);

/** What a member of THIS build can pick in Settings: the shipped
 *  registry, plus the RTL preview when the build carries it. */
export const SELECTABLE_LANGUAGES: readonly LanguageInfo[] =
  RTL_PSEUDO_AVAILABLE ? [...LANGUAGES, RTL_PSEUDO] : LANGUAGES;

/** Registry record for a resolved i18next language, tolerating
 *  regioned tags ("es-MX" → es). Unknown tags resolve to English —
 *  the same fallback i18next itself applies. */
export function languageInfo(lang: string | undefined): LanguageInfo {
  const base = (lang ?? "en").toLowerCase();
  return (
    SELECTABLE_LANGUAGES.find((l) => {
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

/** The tag to hand to Intl (NumberFormat, DateTimeFormat,
 *  toLocaleDateString…) for the active UI language. Usually the tag
 *  itself, but a language whose registry entry pins intlNumbering
 *  gets the -u-nu-<system> Unicode extension appended — Bengali UI
 *  text uses Western digits, so unpinned Intl output (১,২৩৪) would
 *  mix digit systems in one sentence. Callers pass
 *  `i18n.resolvedLanguage`; regioned tags ("bn-BD") keep their
 *  region, and unknown tags pass through untouched (Intl applies
 *  its own fallback, same as before this helper existed). */
export function intlLocale(lang: string | undefined): string {
  const base = lang ?? "en";
  const numbering = languageInfo(base).intlNumbering;
  return numbering ? `${base}-u-nu-${numbering}` : base;
}
