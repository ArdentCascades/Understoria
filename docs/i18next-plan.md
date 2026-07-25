# i18next 23 → 26 + react-i18next 15 → 17 — implementation plan

> **Status: PLAN** (code-verified 2026-07-24 against the working
> tree, root lockfile, installed node_modules, the live npm
> registry, and both upstream CHANGELOGs read from GitHub).
> Discipline model: docs/react-19-plan.md /
> docs/react-router-7-plan.md. Honest sizing up front: **this
> upgrade is trivial for this app** — every breaking change across
> all five intervening majors greps to zero usage; the expected
> diff is 2 files (apps/web/package.json + root lockfile) and zero
> source lines. The plan is short because the verified surface is
> small, not because verification was skipped.

## 0. Verified ground truth

- **Declared ONCE.** `"i18next": "^23.16.4"` and
  `"react-i18next": "^15.1.1"` appear only in
  `apps/web/package.json` (grep of all workspace package.jsons:
  server/desktop/site/shared/root have zero i18next declarations).
  Installed: i18next 23.16.8, react-i18next 15.7.4 — one physical
  hoisted copy each, react-i18next's i18next dep **deduped**
  (`npm ls i18next react-i18next` verified). Root lockfile is the
  only lockfile.
- **Registry (queried live): latest stable is i18next 26.3.6 and
  react-i18next 17.0.11** (react-i18next's `next` tag is a
  10.0.0-alpha legacy artifact — ignore). Majors in between:
  i18next **24, 25, 26**; react-i18next **16, 17**.
  docs/dependency-upgrade-plan.md's guess ("i18next 26 +
  react-i18next 17") was correct on majors; exact pins now
  verified.
- **Peer matrix (from registry metadata of the exact targets):**
  react-i18next 17.0.11 peers `i18next >= 26.2.0` (forces the
  pairing — 17 rejects our i18next 23), `react >= 16.8.0` (19.2.8
  ✓), optional `typescript ^5 || ^6 || ^7` (5.6.3 ✓). i18next
  26.3.6 has a single optional peer `typescript ^5 || ^6 || ^7` and
  one dep (`@babel/runtime`). Intermediate peers for the record:
  react-i18next 16.0.0 peered `i18next >= 25.5.2`; 17.0.0
  `>= 25.10.10`. (Note: 15.7.4's peer is `i18next >= 23.4.0`, so an
  i18next-only bump first would be peer-legal — a bisect fallback,
  not needed.)
- **`npm install --dry-run` of the exact pair resolves cleanly —
  no ERESOLVE, no peer warnings.** Real lockfile delta: i18next
  23.16.8 → 26.3.6, react-i18next 15.7.4 → 17.0.11,
  html-parse-stringify 3.1.0 → 4.0.1 (Trans's parser, now
  zero-dep), **void-elements 3.1.0 removed**,
  **use-sync-external-store 1.6.0 added** (new react-i18next 17
  dep; its react peer `^16.8||^17||^18||^19` admits our 19.2.8).
  Nothing else moves.
- **i18next-browser-languagedetector: NO bump.** Installed 8.2.1
  IS the registry latest; it has no peerDependencies at all and
  the languageDetector module contract is unchanged in i18next 26
  (`detection?: object` pass-through verified in the 26.3.6
  tarball, typescript/options.d.ts:278).
- Toolchain: TS 5.6.3 (`moduleResolution: "bundler"`,
  `resolveJsonModule: true` — the inline locale JSON imports),
  Vite 8.1.5 (rolldown), vitest 4.1.10, jsdom 29.1.1, CI Node 22.
  i18next 26 ships dual CJS/ESM with an exports map +
  `index.d.mts` — resolved fine under bundler resolution; jsdom
  29/Node 22 satisfy the "Intl mandatory" requirement.
- **Audit baseline — stale assumption corrected:** `npm audit`
  today is NOT 0; it reports **2 high** against react-router
  7.18.1 (GHSA-qwww-vcr4-c8h2, RSC-mode CSRF, vulnerable
  7.12.0–8.2.0, fix only in v8.3.0). Dead code for this app (100 %
  declarative mode, no RSC/actions — see
  docs/react-router-7-plan.md) and **out of scope here** (v8 is
  unblocked by React 19.2.8; separate plan). The i18next chain has
  zero advisories. **Gate for this migration: `npm audit` output
  byte-identical before/after — no new advisories.**

## 1. Major-by-major breaking surface vs THIS app (all changelog
   entries read verbatim from GitHub; every claim grep-verified)

- **i18next 24.0.0** ("major breaking release"):
  - *Old JSON formats (v1–v3) removed* → we are pure v4: plural
    suffixes are `_one` ×39 / `_other` ×38 in BOTH locales;
    `_plural` 0, `_interval` 0, `$t(` nesting 0. (The one
    numbered-suffix-looking key, `achievements.connector_5`, is an
    achievement id object accessed by literal key, never with
    `count` — plural resolution never touches it.)
  - *v1 API compat removed* → 0 uses.
  - *Intl API mandatory, no fallback* → Node 22 / jsdom 29 /
    evergreen-browser PWA all ship full Intl. ✓
  - *`initImmediate` renamed `initAsync`* → 0 uses of either.
  - *Plural rule falls back to `dev` language if not found* →
    en/es both have standard CLDR rules; unreachable.
  - *TS4 support dropped, TS5 optional peer* → TS 5.6.3 ✓.
  - `returnNull` (our init sets it `false` explicitly): the
    type-default flip happened back in **v23.0.0**, not 24; the
    option still exists in 26 (verified in the 26.3.6 tarball,
    typescript/options.d.ts:681). No change needed.
- **i18next 25.0.0** ("potentially breaking"): changeLanguage
  ordering fix + `changeLanguage` now always resolves through
  `getBestMatchFromCodes` (with same-script fallback). Exposure:
  exactly one app call site (`setLanguage` in src/i18n/index.ts:61,
  fire-and-forget with exact codes "en"/"es" constrained by
  `supportedLngs`) + 17 awaited test calls. Resolution for exact
  supported codes is identical. Named risk #1. (25.8.0's
  console.info support notice is moot — removed again in 26.)
- **i18next 26.0.0** ("major breaking release"), each removal
  grepped to zero in apps/web/src: `initImmediate` (0), legacy
  `interpolation.format` function (0 — our interpolation block is
  `escapeValue: false` only; no `services.formatter`, no
  `addCached`), `showSupportNotice` (0), `simplifyPluralSuffix`
  (0). 26.1's `enableSelector: 'strict'` is opt-in — untouched.
- **react-i18next 16.0.0**: changelog verbatim: "major upgrade
  i18next dep" — a peer bump, **no API changes**.
- **react-i18next 17.0.0** ("potentially breaking"):
  `transKeepBasicHtmlNodesFor` now preserves HTML tag names in
  **auto-generated** Trans keys with interpolation children —
  applies only to `<Trans>` WITHOUT an explicit `i18nKey`. Our
  single Trans (§2) has an explicit `i18nKey` → unaffected.
  17.0.11's html-parse-stringify 4 swap states "rendered output is
  unchanged"; our one Trans string is plain named-tag markup
  (`<taskLink>{{task}}</taskLink>`, en/es.json:1412, identical
  shape both locales). `initReactI18next`, `Trans`,
  `useTranslation`, `UseTranslationResponse` all verified present
  in the 17.0.11 d.ts.

**Conclusion: zero applicable breaking changes. No prep commit is
warranted — single-commit bump (react-i18next's peer forces the
pairing anyway).**

## 2. App i18next surface inventory (grep-counted)

- **Init: `apps/web/src/i18n/index.ts`** (read in full): default
  `i18next` instance, `.use(LanguageDetector)`
  `.use(initReactI18next)` `.init({...})` as a module side effect
  (`void i18n.init()`); **inline resources** (static JSON imports
  of en/es under the single default `translation` namespace — no
  backend, no lazy loading, no suspense path), `fallbackLng: "en"`,
  `supportedLngs: ["en","es"]`, `interpolation.escapeValue: false`,
  detection order localStorage→navigator with storage key
  `understoria.language`, `returnNull: false`. Exports
  `SUPPORTED_LANGUAGES`, `LANGUAGE_LABELS`, `setLanguage`, default
  instance. Every option used exists unchanged in 26 (verified
  against the 26.3.6 typings tarball).
- **Hook usage: `useTranslation()` ×272 call sites in 160 files —
  ALL zero-argument** (no namespaces, no `keyPrefix` (grep 0), no
  options). Destructures: `const { t } =` ×237,
  `const { t, i18n } =` ×31. Entry: main.tsx:32 `import "./i18n"`;
  **127 test files** do side-effect `import "@/i18n"`.
- **Trans: exactly 1** — `apps/web/src/pages/ProjectDetail.tsx:3274`
  with explicit `i18nKey`, `values`, and a named `components`
  entry (`taskLink` → `<Link>`/`<span>`). The v17 Trans change
  cannot apply (explicit key).
- **Direct instance use** (all API-stable in 26): `i18n.t` ×3
  (db/seed.ts:160 behind an `i18n.isInitialized` guard;
  esPlurals.test.ts ×2), `i18n.changeLanguage` ×18 (1 app site =
  `setLanguage`; rest tests, awaited), `i18n.language` ×26,
  `i18n.resolvedLanguage` ×32 (display/Intl-locale plumbing, e.g.
  lib/format.ts). Zero `getFixedT`, `withTranslation`,
  `<Translation>`, `I18nextProvider`, `useSSR`, `returnObjects`,
  postProcess, custom formatters, `TFunction`/type imports from
  i18next (the only `from "i18next"` import in src is the init
  file).
- **t() options surface:** ~385 `t("key", {...})` sites; `count:`
  plurals on 131 lines; `defaultValue` only in the category-label
  fallbacks (Calendar.tsx:352/450/590, EventNew.tsx:593,
  EventDetail.tsx:383) — all still-supported shapes.
- **Locales:** `src/i18n/locales/{en,es}.json` — 3763 lines and
  **2877 leaf strings each** (exact lockstep), v4 plural format
  only (§1).
- **Conversation.tsx (hard constraint — no edits):** its entire
  i18next surface is `import { useTranslation } from
  "react-i18next"` (line 30) + 119 plain `t()` calls. No Trans, no
  instance methods, no plural/format edge cases beyond `count`.
  **API-stable across the whole upgrade; zero changes required or
  permitted.** The 8 Conversation suites are the guard.

## 3. TypeScript coupling — none

**No CustomTypeOptions augmentation exists anywhere** (grep of
`CustomTypeOptions` / `declare module "i18next"` /
`react-i18next.d.ts`: 0 hits; the only ambient file,
src/types/install.d.ts, is PWA-install typing). Keys are plain
strings end to end; the types-pipeline churn between 23→26 /
15→17 therefore has no purchase. One decorative cast at
ProjectDetail.tsx:~3290 (`t(\`projects.activityType.${a.type}\` as
"projects.activityType.project_created")`) compiles identically
under 17. `tsc --noEmit` is still a hard gate — any surprise types
regression fails the build step.

## 4. The i18n parity suites (named, with exposure)

- `src/i18n/parity.test.ts` — flattens both locale JSONs
  **directly** (no i18next import): key-set equality en↔es +
  non-empty leaves. **Zero exposure** to the upgrade; guards the
  lockstep invariant.
- `src/i18n/duplicateKeys.test.ts` — scans the RAW JSON source
  (`?raw` imports) for duplicate keys. **Zero exposure.**
- `src/i18n/esPlurals.test.ts` — imports the REAL initialized
  instance, awaits `changeLanguage("es")`, asserts exact rendered
  plural strings via `i18n.t(..., { count })`. **This is the
  runtime canary** for the v24 plural resolver and the v25
  changeLanguage changes — it must pass byte-identically.
- Locale-sensitive component tests additionally exercise the es
  path (e.g. ConfirmDialog.test.tsx:57 awaits
  `changeLanguage("es")` and asserts Spanish labels).

## 5. Phases

**Phase 0 — baseline (no commit).** From repo root: `npm run
typecheck`, `npm test`, `npm run build`; from apps/web:
`npx vitest run` and record the test count (expected ~3441 across
320 files). Record `npm audit` output verbatim (currently 2 high,
react-router — see §0).

**Phase 1 — the ONLY commit: "i18next 23.16.8 → 26.3.6,
react-i18next 15.7.4 → 17.0.11"** — 2 files, from repo root:
```
npm install --workspace @understoria/web \
  i18next@^26.3.6 react-i18next@^17.0.11
```
i18next-browser-languagedetector stays as-is (8.2.1 = latest).
Lockfile expectation (dry-run-verified): the five entries in §0,
nothing else; `npm ls i18next react-i18next` must show single
deduped copies (hard gate). **Expected source diff: none.** If
`tsc --noEmit` surfaces a straggler, fix it inside this commit and
record it in the commit message — and never in Conversation.tsx.
Gates, in order, from repo root unless noted:
1. `npm run shared:build`
2. `npm --workspace @understoria/web run typecheck`
3. Full web suite from apps/web: `cd apps/web && npx vitest run`
   (same count as Phase 0, 0 unhandled rejections; parity /
   duplicateKeys / esPlurals suites explicitly green)
4. `npm --workspace @understoria/web run lint`
5. PWA build: `npm --workspace @understoria/web run build`
   (includes tsc --noEmit)
6. `npm test` at root (server/desktop/shared untouched-but-run)
7. `npm audit` → byte-identical to Phase 0 (no new advisories)
8. Manual smoke (§6)
Rollback: `git revert` of this single commit restores 23.16.8 /
15.7.4 exactly (lockfile included). No data / storage / URL /
locale-file migration is involved — the localStorage language key
(`understoria.language`) format is unchanged.

**Out of scope (explicitly):** react-router v8 (owns the current
audit findings), i18next-cli/extraction tooling (none in repo),
any locale JSON edits, typed-key (CustomTypeOptions) adoption,
selector API adoption.

## 6. Verification matrix

Highest-signal first: `i18n/esPlurals` (runtime plural canary),
`i18n/parity` + `i18n/duplicateKeys` (lockstep), ConfirmDialog
(es-locale render), ProjectDetail suites (the single Trans +
activity feed), Calendar / EventNew / EventDetail (defaultValue
category fallbacks + attendee-count plurals), lib/format tests
(formatRelativeTime `count` plurals through `i18n.t`), db/seed
(`i18n.isInitialized` guard), Settings (language section), all 8
Conversation suites, then the full 320-file suite. Manual smoke:
Settings → switch en↔es (persists across reload via
localStorage), event detail attendee counts in es ("1 confirmada"
singular agreement), a project activity feed containing a
"stepped back from <task>" entry (the Trans link renders and
navigates), cold load with browser language es-* and no stored
key (detector → es), dev console clean of i18next
deprecation/support notices.

## 7. Audit trail — exact inventory commands (run from apps/web
   unless noted)

- Consumers: `grep -l i18next apps/*/package.json
  packages/*/package.json package.json` (root) → only
  apps/web/package.json. `npm ls i18next react-i18next` (root) →
  single copies, deduped.
- Registry: `npm view i18next dist-tags versions`;
  `npm view react-i18next dist-tags versions`;
  `npm view react-i18next@17.0.11 peerDependencies dependencies`;
  `npm view i18next@{24.0.0,25.0.0,26.0.0,26.3.6} peerDependencies`;
  `npm view i18next-browser-languagedetector dist-tags` (8.2.1 =
  installed); `npm install --workspace @understoria/web
  i18next@^26.3.6 react-i18next@^17.0.11 --dry-run` (root; clean).
  CHANGELOGs fetched raw from github.com/i18next/{i18next,
  react-i18next}; 26.3.6 + 17.0.11 tarballs unpacked and d.ts
  read (returnNull at options.d.ts:681, initAsync at :736,
  initImmediate absent).
- Hook/Trans surface: `grep -rh 'from "react-i18next"' src | sort
  | uniq -c` (159 useTranslation-only + 1 Trans,useTranslation +
  1 initReactI18next); `grep -rn "useTranslation(" src | wc -l`
  (272); `grep -rn "useTranslation(" src | grep -v
  "useTranslation()"` (0 — all bare); `grep -rn "<Trans" src` (1:
  ProjectDetail.tsx:3274); `grep -rn keyPrefix src` (0).
- Removed-API sweep: `grep -rn "initImmediate\|initAsync\|
  compatibilityJSON\|simplifyPluralSuffix\|showSupportNotice\|
  interpolation\.format\|saveMissing\|postProcess\|nsSeparator\|
  keySeparator\|getFixedT\|useSSR\|withTranslation\|
  I18nextProvider" src` (0); `grep -rn returnObjects src` (0);
  `grep -rn "TFunction\|ParseKeys\|from \"i18next\"" src` (init
  file only); `grep -rn CustomTypeOptions src` (0).
- Instance methods: `grep -rho "i18n\.[a-zA-Z]*" src | sort |
  uniq -c` → changeLanguage 18, isInitialized 1, language 26,
  resolvedLanguage 32, t 5 (of which app-code 1: seed.ts).
- Locales: `grep -o '_one"\|_other"\|_many"\|_few"\|_two"\|_zero"'
  src/i18n/locales/{en,es}.json | sort | uniq -c` (39/38 both);
  `grep -c '_plural"\|_interval' ...` (0); leaf count via node
  JSON walk (2877 both); `wc -l` (3763 both).
- Tests: `grep -rl 'import "@/i18n"' src | wc -l` (127);
  `find src -name "*.test.*" | wc -l` (320).
- Conversation.tsx: `grep -n i18next src/pages/Conversation.tsx`
  (one useTranslation import); `grep -c "t(" ` (119).

## 8. Named risks

1. **v25 changeLanguage/getBestMatchFromCodes resolution drift** —
   the only behavioral change in the whole span that touches live
   code. Exposure: exact codes "en"/"es" under `supportedLngs`
   resolve identically; a `navigator.language` like "es-MX" still
   best-matches "es" (same-script fallback can only widen, and
   supportedLngs constrains the result). The 32
   `i18n.resolvedLanguage` reads are display/Intl-locale only.
   Guards: esPlurals suite, ConfirmDialog es test, manual
   detector smoke. Residual risk ~nil.
2. **html-parse-stringify 3→4 under the single Trans** — upstream
   states rendered output unchanged (493 tests); our one
   translation string is plain named-tag markup in both locales.
   Guard: ProjectDetail suites + manual activity-feed check.
3. **use-sync-external-store entering the tree** — react peer
   admits 19; the hand-rolled `createRoot`+`act` harness flushes
   uSES updates; all language-change tests await `changeLanguage`
   BEFORE rendering, so no mid-render store transition exists. If
   a straggler flakes, fix the TEST, never app code, never
   Conversation.tsx.
4. **Module-side-effect init timing** (`void i18n.init()` +
   inline resources) — the store is populated synchronously at
   init in 26 exactly as in 23 (no backend, nothing async to
   wait for); 127 test files depend on this. The full suite is
   the check; a systemic break would fail hundreds of tests
   loudly, not subtly.
5. **Audit gate honesty** — the "must stay 0" assumption is
   stale (2 pre-existing high, react-router, out of scope). The
   enforceable gate is: audit output unchanged by this commit.
6. **Rollback** — single 2-file commit; `git revert` restores
   the 23/15 tree byte-for-byte. No migrations of any kind.
