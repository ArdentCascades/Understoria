# Translating Understoria into the most widely spoken languages

Status: PLAN (operator-requested). Nothing here is built yet; each
phase below is sized to land as one or a few reviewable PRs.

## Where we start from

- **2,767 UI strings** in `apps/web/src/i18n/locales/en.json` (~209KB),
  hard-lockstep with `es.json`, enforced by the i18n parity, duplicate-
  key, and `esPlurals` tests. Both locales load **eagerly** in the main
  bundle.
- **Authored content is the iceberg**: `projectTemplates.ts` (424KB),
  `taskSteps.ts` (248KB), `taskTips.ts` (158KB) carry English + Spanish
  **inline** — every device downloads both languages today. `faq` and
  `startCommunity` use the better pattern: a separate `.es.ts` module
  with a parity test.
- Dates/numbers already flow through `Intl` with the active language;
  `lib/speak.ts` (read-aloud, spoken panic confirm) already takes a
  language tag and honestly reports missing voices.
- **No RTL support anywhere** (no `dir` handling, physical `ml-/mr-`
  Tailwind utilities throughout).

## Which languages, and why these

Two forces pull the list: global speaker counts, and the languages of
communities likely to run a mutual-aid timebank near our pilots. The
waves below balance both and — deliberately — put every right-to-left
language after the RTL engineering phase, so no translation ever ships
into a broken layout.

| Wave | Languages | Rationale |
|---|---|---|
| shipped | English, Spanish | today's lockstep pair |
| **1** | Chinese (Simplified) `zh-Hans`, French `fr`, Portuguese `pt` | three of the largest global + diaspora reaches; LTR; simple plural rules; proves the pipeline |
| **2** | Hindi `hi`, Vietnamese `vi`, Russian `ru` | large communities; exercises Devanagari, Vietnamese diacritics, and Slavic 3-form plurals — the hardest LTR plural case |
| **3 (after RTL phase)** | Arabic `ar`, Urdu `ur` | top-ten languages that REQUIRE the RTL work first |
| demand-driven | Tagalog, Haitian Creole, Korean, Bengali, Indonesian, Swahili… | once Phase 0 lands, adding a language is cheap — communities can request or contribute their own |

## Phase 0 — Infrastructure (one PR, prerequisite for everything)

1. **Lazy locale loading.** English stays eagerly bundled (it is the
   fallback); every other locale becomes a dynamic import registered
   with i18next on demand (`partialBundledLanguages`). The service
   worker caches a locale chunk after first use so offline keeps
   working. First-load cost stays flat no matter how many languages we
   ship.
2. **Data-driven language registry.** `SUPPORTED_LANGUAGES` grows from
   a string pair into records: `{ code, endonym, dir, speakLang,
   pluralForms }`. `LanguageSection`'s two buttons become a list that
   renders endonyms ("中文", "Français") — a language should name
   itself in itself.
3. **Generalized quality gates.** The en/es parity test becomes
   en↔every-shipped-locale; add an interpolation-variable parity check
   (`{{count}}`, `{{name}}` must survive translation verbatim);
   generalize `esPlurals.test.ts` into a per-language CLDR plural-
   suffix completeness test (Russian needs `_one/_few/_many`, Chinese
   collapses to `_other`).
4. **Read-aloud + spoken-panic mapping.** The registry's `speakLang`
   feeds `speak()`; the existing zero-voices watchdog already handles
   devices without a voice for the language honestly.
5. **Translation-status honesty.** A new locale ships with a one-line
   note in `LanguageSection`: this translation is new, AI-assisted and
   human-reviewed, corrections welcome — the same posture as the beta
   disclosure. Removed per-language once a native-speaker review cycle
   completes.

## Phase 1 — UI strings, wave by wave (~2,800 strings per language)

Production method mirrors how es is maintained today, scaled with the
repo's disclosed AI-assisted posture:

1. **Glossary first.** ~40 load-bearing terms per language decided
   before any bulk translation: *vouch, seed balance, node, exchange,
   the commons, tended, hours, In my care, Grow another root…* These
   carry the app's register; getting them wrong 2,800 times is worse
   than getting them wrong once. Stored in
   `docs/i18n-glossary/<lang>.md` so future PRs reuse the decisions.
2. **Agent bulk pass** translating `en.json` with the glossary, the
   Spanish file as a second reference (it encodes register decisions
   English doesn't), and hard rules: interpolations verbatim, CLDR
   plural forms complete, warm plain language over formal register.
3. **Independent review pass** (a second agent adversarially checking
   meaning drift, then a native-speaker checklist for the community —
   published in CONTRIBUTING so members can correct us).
4. **Layout smoke.** French/Portuguese run ~25% longer than English:
   browser-verify the tight surfaces (bottom nav labels, pill rows,
   the command band, landscape rail) per language and fix overflows
   with wrapping, not truncation.
5. A language ships only when its UI file is **complete** — the
   lockstep policy extends to every shipped locale, and every future
   feature PR must add its keys to all of them (agents make this
   cheap; the parity test makes it mandatory).

## Phase 2 — Authored content (the 830KB corpus)

1. **Restructure first (no new languages yet):** move the inline
   `{ en, es }` fields of `projectTemplates` / `taskSteps` / `taskTips`
   into per-language modules loaded on demand, following the
   `faq.es.ts` pattern. This alone cuts today's bundle for every
   member, and is the precondition for languages 3…N not multiplying
   bundle size.
2. **Translate in member-impact order:** FAQ + start-a-community →
   event templates → the 64 project templates with their task steps
   and tips (agent fleet per template, review per template — the same
   process that authored them).
3. **Honest fallback while in flight:** a language may ship complete
   UI + FAQ while templates are still English, with a visible "not yet
   translated" line on English-fallback content — never silent mixed-
   language surprises. Content parity tests track the debt per locale.

## Phase 3 — RTL program (unlocks Arabic and Urdu)

Its own project, sequenced after waves 1–2 prove the pipeline:

1. Sweep physical Tailwind utilities (`ml-/mr-/pl-/pr-/left-/right-`,
   text alignment) to logical ones (`ms-/me-/ps-/pe-/start-/end-`),
   with a source guard test so they don't creep back.
2. `dir` on `<html>` driven by the language registry; audit direction-
   coded glyphs (BackLink arrows, disclosure chevrons, the ▸/▾ pills)
   and the landscape nav rail's safe-area math (the notch inset swaps
   sides in RTL).
3. Browser-verify every major surface mirrored before the first RTL
   locale ships.

## Phase 4 — Beyond the app shell

In priority order, after their language's in-app content exists:
member-guide/opsec content modules, the print/paper surfaces (already
`t()`-driven — mostly free), `docs/member-guide.md`, the showcase site.

## Ongoing governance

- Feature PRs add keys to **all** shipped locales (parity test blocks
  otherwise) — the standing es workflow, widened.
- Community correction path: a CONTRIBUTING section and issue template
  for translation fixes; corrections are one-line locale PRs anyone
  can make.
- Each wave is its own PR series: infrastructure → glossary →
  UI strings → content, per language, so review stays humanly sized.

## Rough sizing

| Unit | Size | Notes |
|---|---|---|
| Phase 0 | one focused PR | lazy loading + registry + tests |
| UI strings, per language | ~2,800 strings | agent bulk + review + layout smoke |
| Content, per language | ~1MB source | dominated by the 64 templates; ship UI-first |
| RTL program | one audit + sweep PR series | precondition for ar/ur only |
