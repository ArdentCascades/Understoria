# The translation playbook — mechanical recipe per language

This is the as-practiced pipeline that shipped fr/pt/zh/hi/vi UI
strings and es/fr/pt/zh content (PRs #543–#550). It exists so ANY
future session — regardless of which model drives it — can add a
language or a content corpus without rediscovering the process. The
quality lives in the **gates and validators**, not in the driver:
every step below is checked by script, so a mechanical executor with
this recipe produces the same shippable result.

## Ground rules (apply to every step)

- One PR per language per layer (UI PR, then content PR later).
- The branch workflow, commit trailers, and PR body format follow
  the repo's standing conventions (see recent i18n PRs).
- The GLOSSARY IS BINDING. It is authored first, by the strongest
  available reasoning pass, and everything downstream obeys it.
  Bulk translation with a binding glossary + validators is
  well-specified work — it does not need the strongest model.
- Spanish (`es.json` / the es content modules) is the register
  reference: it encodes warmth, collective-vs-singular framing, US
  generalizations, and unit conversions that English can't show.
- Never invent process: reuse the scripts named below; adapt by
  copying the previous language's version and changing the
  language-specific scans.

## A. UI strings (~2,900 keys) — 8 steps

1. **Glossary** → `docs/i18n-glossary/<code>.md`. Model on hi.md and
   vi.md: stakes header, numbered global register decisions
   (address/pronoun strategy, script/typography rules, loanword
   tiers, banned officialese/e-commerce/debt/loaded vocabulary),
   ~40–60 term rows with rationale + DON'T lists, closing self-check.
   Every decision must be GREPPABLE (that's how validators enforce
   it).
2. **Chunk** `en.json` + `es.json` into 6 balanced pieces by
   top-level keys (greedy largest-first into 6 bins — see
   `scratchpad/*-ui` history; ~484 leaves each).
3. **SPEC** → `scratchpad/<code>-ui/SPEC.md`, copied from the
   previous language's and adapted: hard rules (key parity,
   interpolation verbatim, plural-suffix policy, no empty leaves,
   Trans tags), register rules distilled from the glossary, and the
   self-verification checklist (including the language-specific
   banned-word regexes).
4. **Fleet**: 6 agents, one per chunk, each told to read the
   glossary FIRST, use the es chunk as register reference, write
   `chunk-N.<code>.json`, and self-verify with python before
   finishing.
5. **Independent per-chunk validation** as each agent completes
   (key parity, interpolation multisets, script-specific checks —
   never trust self-reports alone).
6. **Cross-chunk reconciliation**: grep all six fragments for
   competing renderings of the same concept (each language so far
   had 1–3: fr étape/jalon, hi साइन/दस्तख़त, vi gắn cờ/nêu ra).
   Unify by majority + glossary principle + sibling-locale
   consistency, with grammar-aware replacements.
7. **Splice** via `scratchpad/<code>-ui/splice_<code>.py` (copy the
   previous one; swap the register scans): merges in en key order,
   re-validates everything, writes `locales/<code>.json` only when
   clean.
8. **Wire + verify**: registry entry in `languages.ts` (endonym,
   dir, speakLang, `reviewStatus: "new"`, `content: "ui-only"`),
   loader in `i18n/index.ts`, `locale-<code>` chunk group in
   `vite.config.ts`, imports + table rows in `parity.test.ts` and
   `plurals.test.ts`. Then: tsc, eslint, full vitest, `npm run
   build` (assert the locale chunk exists and the precache manifest
   has zero locale/lazy-content entries), `npm run build:demo` +
   Playwright smoke at 375px (switch language in Settings, assert
   only `locale-<code>` fetched, both honesty notes render, board
   tabs + bottom nav fit, no horizontal overflow). Update
   CHANGELOG + `docs/i18n-expansion.md`, commit, push, PR.

### Language-specific gotchas already learned

- Plural families: keys ending `_one`/`_other` must exist in every
  locale. Languages with MORE categories (ru: `_few`/`_many`) add
  them — the parity gate sanctions extra CLDR plural suffixes on
  en-declared families (see parity.test.ts). Languages with fewer
  (zh/vi) keep both en suffixes anyway.
- Board tab labels overflow first (375px 3-up pill) — pt needed
  "Pedidos". Check them explicitly in the smoke.
- Don't probe `/board` in smokes — the board lives at `/`.
- Fresh Playwright contexts reset the language (localStorage).
- Reserved-word collisions to check per language: UI "button" vs
  network "node" (vi's nút), legal guardianship vs shard guardian,
  bail/sponsorship vs vouch, storm's eye vs storm hub.

## B. Authored content (~64 templates + tips + steps + 14 events +
FAQ + guide) — per language, AFTER its UI ships

Follow Phase 2b as practiced (PRs #546–#548):

1. Inputs are language-neutral and already staged:
   `scratchpad/*-content/templates-{1..8}.json`, `events.json`,
   `faq.json`, `startCommunity.json` (copy the directory).
2. **SPEC** adapted from `pt-content/SPEC.md` / `zh-content/SPEC.md`:
   binding glossary + the SHIPPED UI locale file as terminology
   authority (quote UI labels verbatim in the FAQ), es as register
   reference, locale-invariant fields byte-identical (deep-copy
   `template_en`, overwrite only translatable strings), tips ≤400 /
   steps ≤120 with counts equal to en, first step stays tiny.
3. **Fleet**: 10 agents (8 template batches + events&guide + FAQ).
4. **Validate** each fragment independently
   (`validate_fragments.py`, copied + banned-word scans swapped;
   known benign flags: the seed-library "gift, not a debt" line,
   legal-aid's literal debts case type).
5. **Assemble** via `assemble_<code>.py` (copy `assemble_zh.py`;
   fix ALL import paths to the new code — the `.fr` → `.pt` sed
   miss is a known trap; the title-index merge must PRESERVE all
   existing locale tables).
6. **Wire**: bundle barrel + registry loader + `lazy-content-<code>`
   vite group + test-table rows (all content suites are
   generalized — one entry each) + `ensureContent("<code>")` in
   test setup + flip the registry to `content: "full"`.
7. Gates, build (lazy chunk out of precache), Playwright verify
   (translated gallery via a default-tab template like
   community-garden; sibling languages intact), docs, PR.

## C. Remaining roadmap (state as of this writing)

- **ru UI**: glossary in flight; then A.2–A.8. Completes Wave 2.
- **Content for hi, vi, ru**: B per language (three PRs), in that
  order, each after its UI merges. Flipping each to
  `content: "full"` removes its Settings English-content note.
- **Wave 3 (ar, ur)**: BLOCKED on the Phase 3 RTL program
  (docs/i18n-expansion.md) — engineering, not translation. Do not
  start these glossaries until RTL ships.
- **Demand-driven languages**: A then B, same recipe.
- **Native-speaker review cycles**: each language's
  `reviewStatus: "new"` comes off only after a human review — an
  operator/community action, not an agent one.

## D. Cost notes

- A UI language ≈ 1 glossary agent + 6 chunk agents + orchestration.
- A content language ≈ 10 agents + orchestration.
- The glossary is the only step that rewards maximum reasoning
  strength; fleets and assembly are validator-checked mechanical
  work and run well on a mid-tier model. Orchestration (validation,
  reconciliation, splicing, wiring, PR) is scripted and cheap.
