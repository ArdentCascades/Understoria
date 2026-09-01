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
sibling). PHASE 1 WAVE 2 COMPLETE: **Hindi (hi), Vietnamese (vi), and Russian (ru) SHIPPED**
(UI strings complete — glossary at `docs/i18n-glossary/hi.md` with
the आप-register decision and Devanagari conventions; 6-agent bulk
pass + splice validation + cross-chunk reconciliation (sign →
दस्तख़त, public key → सार्वजनिक चाबी, बाकी nukta normalization) +
375px Devanagari layout smoke; registry carries
`reviewStatus: "new"` + `content: "ui-only"`). Vietnamese field
notes: glossary at `docs/i18n-glossary/vi.md` — bạn uniformly (the
kinship system is unusable with unknown age/gender), chúng tôi
banned as the app's voice, **node kept English** because the
Vietnamese calque nút is the word for a UI button, ngày chung tay
for work days, điểm trú bão for storm hubs; NFC-normalization is a
splice gate; cross-chunk reconciliation unified flag → gắn cờ.
Russian field notes: glossary at `docs/i18n-glossary/ru.md` — вы
uniformly and lowercase (ты forces gendered past tense), ё always
written, «день общих дел» coined over субботник, a ru-specific
war-marked-vocabulary ban; the parity gate gained its sanctioned
plural-suffix relaxation so ru.json carries FOUR keys per plural
family (_one/_few/_many/_other — 38 families, +76 keys), finally
exercising the Slavic branch of the plurals gate; cross-chunk
reconciliation unified device-lock to разблокировать (contacts keep
заблокировать unambiguously). Wave 2 surfaced an upstream en defect
worth a follow-up: several `_one` strings hardcode the digit 1
("1 open", "1 task waiting") with no {{count}}, which mis-renders at
21/101 in every _one-category language — **now fixed**: all nine
strings interpolate {{count}} in every locale, ru's three
number-dropped workarounds are restored with nominative-singular
agreement, and `plurals.test.ts` gained a gate requiring every form
of a count-driven family to carry {{count}} (the defect persisted
because en's variable-less `_one` made the interpolation-parity gate
FORBID translations from adding the count). **PHASE 2 COMPLETE: Hindi
(hi), Vietnamese (vi) and Russian (ru) content all SHIPPED** — every
one of the eight shipped languages now carries the full authored
corpus and no registry entry is `content: "ui-only"` (see Phase 2
below).
PHASE 3 (RTL) + WAVE 3 COMPLETE, plus one expedite: **Arabic (ar),
Tibetan (bo) and Urdu (ur) SHIPPED in full — eleven languages, all
`content: "full"`.** Arabic rode the RTL program (docs/rtl-plan.md:
R1–R3 rails, R4 the ar fleet + corpus) as the registry's first
`dir: "rtl"` entry; its six plural categories exercised the
Intl.PluralRules-derived gates, and the {{count}} amendment for
single-integer categories landed in the parity gate. Tibetan jumped
the Wave-3 queue for communities responding to the 2026 Tibet flood
(rendering spike first: tsheg-aware breaking is native but stacked
glyphs overflow the Latin line box — a Tibetan font stack and a
line-height floor now live under `:lang(bo)`); glossary at
docs/i18n-glossary/bo.md with its corvée/alms/debt register bans.
Urdu then resumed the RTL rails as the second `dir: "rtl"` language
(tracked as R5: Nastaliq rendering spike — the tallest script the
app ships, 2.5× line box, hence the `:lang(ur)` Nastaliq-first
stack and 2.0 leading floor — then glossary at
docs/i18n-glossary/ur.md, UI fleet, corpus). A vite chunking defect
found during the bo corpus (locale/corpus chunks for ar/bo unnamed,
so Arabic rode in everyone's first download) was fixed by teaching
the build every language's chunk names; each corpus loads as its
own lazy `lazy-content-<code>` chunk, precache-excluded.
**DEMAND-DRIVEN WAVE BEGUN — Indonesian (id) UI SHIPPED** (2026-09):
the first post-RTL language, riding the proven rails with no
rendering spike (Latin script, single CLDR plural category — id.json
follows the zh/bo precedent, _one/_other with identical strings).
Glossary at docs/i18n-glossary/id.md: kamu uniformly (Anda is the
1957 commerce coinage — bank-SMS register), kami banned as the app's
voice (kita's inclusivity is a structural gift), **kredit banned
everywhere** (in Indonesia it means installment loans; credits are
always jam), gotong royong spent concretely on work days and banned
as decoration, kerja bakti banned (New-Order compulsion register —
the corvée reasoning), node and passkey kept English (simpul is a
rope knot; "kunci sandi" is one consonant from kata sandi), Denyut
for the dashboard, "Yang kurawat" for In my care, "tempat berteduh"
for storm hubs. Registry entry carries `reviewStatus: "new"` +
`content: "ui-only"` — the Settings content-fallback disclosure is
live again for the first time since Phase 2 completed. The id corpus
is next on the Phase 2 rails; Swahili, Tagalog and Bengali (spike
first) follow per the wave plan.
Baseline numbers below refreshed 2026-07-27.

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
- **RTL is unimplemented but smaller than this line long claimed.**
  (Corrected 2026-07-29 by the survey in `docs/rtl-plan.md`: `dir`
  handling DOES ship — `i18n/index.ts` sets `<html dir>` from the
  registry — and physical utilities are 98 occurrences across 46
  files, not "throughout". Tailwind 3.4.19 already emits logical
  properties, so the work does not block on the Tailwind 4
  migration.)

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
| **3 (after RTL phase)** | Arabic `ar`, Urdu `ur` | top-ten languages that REQUIRE the RTL work first — see `docs/rtl-plan.md` |
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
   process that authored them). **Phase 2b COMPLETE — French,
   Portuguese, and Chinese all SHIPPED:** every shipped language now
   carries the full corpus (64 templates + aligned tips/steps, 14
   event templates, FAQ, start-a-community guide) as `*.<code>.ts`
   modules behind `content/bundles/<code>.ts`
   (`lazy-content-<code>` chunks), with the title index carrying all
   five languages' task names and every content parity gate running
   per-language. All registry entries are `content: "full"` — the
   Settings English-content disclosure no longer renders anywhere
   (the mechanism stays for future ui-only languages). Production
   method (per language): 10-agent fleet, each template bundled WITH
   its tips+steps so index alignment is guaranteed per agent; the
   shipped UI locale file and `docs/i18n-glossary/<code>.md` were
   the binding terminology authorities; independent script
   validation of every fragment (locale-invariant fields
   byte-identical, counts, lengths, language typography/register)
   before assembly. Field notes: pt reserved mutirão for work days
   and dodged the food-safety/food-security collision; zh shipped 你
   -register kitchen-table Chinese (never 您), 动手日 for work days,
   拾穗 for gleaning, and full-width punctuation throughout. The
   "unknown locale falls back to English" gates now probe `vi`
   (zh-CN resolves to real Chinese content). **Phase 2 Wave-2
   content underway — Hindi SHIPPED:** the full corpus in the hi
   glossary's Hindustani register (श्रमदान, साँचे, हामी; FAQ answers
   quote shipped hi.json button labels verbatim), by the same
   10-agent fleet + independent validation + assembly pipeline
   (docs/i18n-playbook.md §B). New reconciliation dimension learned:
   skills TAGS diverge across batch agents even when each is
   internally consistent (10 of 32 en skills had 2–4 renderings) —
   reconciliation now unifies them corpus-wide by majority, since
   the skills-match feature groups tasks by exact string. Prose
   reconciliations: विकलांग over दिव्यांग (the movement's own word,
   per the no-shame register), the community-center venue unified to
   सामुदायिक भवन. **Vietnamese content SHIPPED** by the same
   pipeline: NFC gate on every string, the nút/node collision held
   (mesh hardware became điểm phát, the reserved English `node`
   untouched), skills unified corpus-wide with an injectivity check
   (en "design" and "graphic design" must not share a Vietnamese
   tag), and the vi FAQ agent caught a real upstream defect — the
   Spanish FAQ's identity section had install-app three positions
   from its English slot, invisible to the parity gate because it
   compared entry ids sorted; both fixed (es reordered, gate now
   enforces order). **Russian content SHIPPED — Phase 2 is
   complete.** Register notes: вы stays lowercase throughout and
   the fleet's own validators caught the one slip (an idiomatic
   «плати сколько можешь» on a pay-what-you-can sign, rewritten to
   the вы-form); tax "credits" became **налоговые вычеты**, the
   native term, rather than a paraphrase around the banned кредит;
   "union" resolved to «объединение съёмщиков» after союз /
   профсоюз / товарищество / коллектив / община were each
   independently disqualified; disaster vocabulary avoided сводка
   and тревога-as-noun and left «огонёк в бурю» reserved for the
   storm-hub feature. Reconciliation unified 64 skill tags with an
   injectivity check, took a **shipped-UI tie-break over a clean
   in-fleet consensus** (carpentry → «столярное дело», because
   ru.json's skills placeholder teaches members that exact string
   and skills-matching compares exact strings), and repointed a
   cross-template reference that named the wrong sibling template.
   All nine registry entries are now `content: "full"`, so the
   English-fallback probes moved to `sw` — a code the registry does
   not know at all — and the Settings content-disclosure mechanism
   idles until a new ui-only language ships.
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

**In-app guide corpus SHIPPED**: the last English-only in-app
content — the condensed member guide, the condensed opsec guide, and
the study-group prompts — now ships in all eleven languages as
`member-guide.<code>.ts` / `opsec-guide.<code>.ts` /
`study-prompts.<code>.ts` modules riding each language's existing
`lazy-content-<code>` bundle, with structure parity (ids, order,
per-section paragraph counts, themes) enforced by
`guides.parity.test.ts` and the share-attribution line moved into
the UI locales (`profile.learn.promptShareAttribution`). Production
method: one agent per language with the language's glossary, its
shipped FAQ as register authority, and its locale JSON as the
verbatim source for every UI label the guides quote.

Still open, in priority order: the print/paper surfaces (already
`t()`-driven — mostly free), `docs/member-guide.md`, the showcase
site.

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
