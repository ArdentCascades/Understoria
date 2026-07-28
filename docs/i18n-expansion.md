# Translating Understoria into the most widely spoken languages

Status: PHASE 0 SHIPPED (infrastructure — lazy locale loading, the
language registry in `src/i18n/languages.ts`, generalized parity/
interpolation/plural gates, `<html lang>`/`<html dir>` wiring,
`speakLangFor()`, and the translation-status note mechanism).
PHASE 1 WAVE 1 COMPLETE: **French (fr), Portuguese (pt), and
Chinese (zh) SHIPPED** (UI strings complete — glossaries at
`docs/i18n-glossary/{fr,pt,zh}.md`, 6-agent bulk pass + splice
validation + cross-chunk consistency reconciliation + layout smoke
per language; registries carry `reviewStatus: "new"` +
`content: "ui-only"` with both honesty notes rendering in Settings).
Wave-1 field notes: pt's board tab shortened to "Pedidos" after the
smoke caught "Necessidades" overflowing the 3-up pill at 375px;
Chinese shipped under the language-only code `zh` rather than the
plan's `zh-Hans` label — browsers send zh-CN/zh-SG and i18next's
language-only fallback resolves those to `zh`, while a literal
zh-Hans code would match neither (zh-Hant stays open as a future
sibling). Wave 2 (hi, vi, ru) is next; ru will exercise the
_one/_few/_many plural gate. Baseline numbers below refreshed
2026-07-27.

## Where we start from

- **~2,900 UI strings** in `apps/web/src/i18n/locales/en.json`
  (~220KB), hard-lockstep with `es.json`, enforced by the i18n
  parity, interpolation-variable, duplicate-key, and plural-
  completeness tests (`src/i18n/*.test.ts`). English ships eagerly
  (it is the fallback); every other locale is a lazy chunk loaded on
  demand and runtime-cached by the service worker (Phase 0).
- **Authored content is the iceberg**: `projectTemplates.ts` (~514KB),
  `taskSteps.ts` (~287KB), `taskTips.ts` (~189KB) carry English +
  Spanish **inline** — every device downloads both languages today.
  `faq` and `startCommunity` use the better pattern: a separate
  `.es.ts` module with a parity test.
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

## Phase 0 — Infrastructure (SHIPPED)

As built (one PR, as planned):

1. **Lazy locale loading.** English stays eagerly bundled (it is the
   fallback); every other locale is a dynamic import served through a
   minimal i18next backend over a loader map
   (`partialBundledLanguages`), emitted as its own `locale-<code>`
   chunk (vite.config.ts codeSplitting group). Locale chunks are
   excluded from the service worker's install-time precache and
   runtime-cached (`CacheFirst`, hashed immutable URLs) after first
   use, so offline keeps working for chosen languages and first-load
   cost stays flat no matter how many languages we ship. `main.tsx`
   gates the first render on `i18nReady` so a returning non-English
   member never sees an English flash.
2. **Data-driven language registry.** `src/i18n/languages.ts`:
   `LANGUAGES` records `{ code, endonym, dir, speakLang,
   reviewStatus? }` (plural categories are DERIVED from
   `Intl.PluralRules` in the gates rather than declared — the
   registry can't drift from the engine). `LanguageSection` renders
   the registry as an endonym list ("Español", "中文") with
   `lang=` attributes — a language names itself in itself.
3. **Generalized quality gates.** `parity.test.ts` now runs
   en↔every-shipped-locale (with a registry-coverage guard so a new
   registry entry MUST be wired into the test table), plus an
   interpolation-variable parity check (`{{count}}`, `{{name}}`
   survive translation verbatim). `plurals.test.ts` replaces
   `esPlurals.test.ts`: per-language CLDR plural-suffix completeness
   (families = keys with an `_other` form; required categories from
   `Intl.PluralRules` over counts 0–200 — Russian will need
   `_one/_few/_many`, Chinese collapses to `_other`), keeping the
   original Spanish agreement regressions.
4. **Read-aloud + spoken-panic mapping.** `speakLangFor()` feeds
   `speak()` everywhere (Conversation, Profile panic confirm,
   ReadAloudSection, AppContext); the registry now also drives
   `<html lang>`/`<html dir>` on language change — fixing a real bug
   where nothing set `<html lang>` and the read-aloud callback always
   answered "en". The existing zero-voices watchdog already handles
   devices without a voice for the language honestly.
5. **Translation-status honesty.** `reviewStatus: "new"` on a registry
   entry renders a one-line note in `LanguageSection`
   (`profile.language.newTranslationNote`, en/es shipped): this
   translation is new, AI-assisted and human-reviewed, corrections
   welcome — the same posture as the beta disclosure. Removed
   per-language once a native-speaker review cycle completes.

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

## Phase 2 — Authored content (the ~990KB corpus)

1. **Restructure first (no new languages yet) — SHIPPED (Phase 2a).**
   As built: the inline `{ en, es }` corpus (projectTemplates,
   taskSteps, taskTips, eventTemplates, plus faq/startCommunity's
   statically-imported `.es.ts` files) split into per-language
   modules behind `src/content/registry.ts` — English eager (the
   fallback), Spanish a lazy `lazy-content-es` chunk excluded from
   the SW precache and runtime-cached like UI locale chunks. Every
   content selector KEPT its synchronous signature: boot chains
   `ensureContent()` into `i18nReady` and `setLanguage` awaits it
   before i18next switches, so a render in language X always finds
   X's bundle cached (or falls back to English honestly). Cross-
   language title→index recovery for tips/steps and the work-day
   hint moved to a compact GENERATED eager index
   (`content/taskTitleIndex.ts`, drift-locked by its test) so those
   render-path lookups never touch a bundle. Measured: the eager
   content chunk dropped from ~1MB to 494.6KB (170.7KB gzip) with
   Spanish's 513.8KB (167.2KB gzip) loading only when chosen —
   languages 3…N now add zero first-load bytes.
2. **Translate in member-impact order:** FAQ + start-a-community →
   event templates → the 64 project templates with their task steps
   and tips (agent fleet per template, review per template — the same
   process that authored them). **French SHIPPED (Phase 2b):** the
   full corpus (64 templates + aligned tips/steps, 14 event
   templates, FAQ, start-a-community guide) as `*.fr.ts` modules
   behind `content/bundles/fr.ts` (`lazy-content-fr` chunk), with
   the title index regenerated to carry fr task names and every
   content parity gate extended per-language. French's registry
   entry flipped to `content: "full"`, which removes the Settings
   English-content disclosure. Production method: 10-agent fleet,
   each template bundled WITH its tips+steps so index alignment is
   guaranteed per agent; the shipped `fr.json` UI file and
   `docs/i18n-glossary/fr.md` were the binding terminology
   authorities; independent script validation of every fragment
   (locale-invariant fields byte-identical, counts, lengths, French
   typography) before assembly. pt and zh follow on the same rails,
   each its own PR.
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
| Phase 0 | one focused PR (SHIPPED) | lazy loading + registry + tests |
| UI strings, per language | ~2,900 strings | agent bulk + review + layout smoke |
| Content, per language | ~1MB source | dominated by the 64 templates; ship UI-first |
| RTL program | one audit + sweep PR series | precondition for ar/ur only |
