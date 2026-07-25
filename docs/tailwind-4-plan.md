# Tailwind CSS 3.4.19 → 4.3.3 migration — implementation plan

> **Status: PINS SHIPPED (Commit 1, PR #532); THE BUMP IS HELD on
> the operator browser-floor gate (§6) — Tailwind remains 3.4.19
> until the operator says go. Plan was code-verified 2026-07-24
> against the working
> tree, root lockfile, installed node_modules, the live npm
> registry, and the tailwindcss v4.3.3 sources/docs fetched from
> the tagged GitHub tree). Discipline model:
> docs/react-router-7-plan.md / docs/react-19-plan.md. No security
> dimension (docs/dependency-upgrade-plan.md Tier 3 §2: "purely
> when convenient"). Philosophy: **minimal diff — the app keeps
> speaking v3 utility names**, pinned to v3 behavior by a small,
> documented compat layer, because the one file we may never edit
> (Conversation.tsx) uses utilities whose meaning v4 changes.

## Verdict up front

**GO, behind one explicit operator gate (§6, browser floor).**
The floor Tailwind 4 requires (Safari 16.4+ / Chrome 111+ /
Firefox 128+) is — verified byte-for-byte from the installed Vite
8.1.5 — already this repo's *declared JS build target* minus one
notch of Firefox: Vite 8's default `build.target` is
`["chrome111","edge111","firefox114","safari16.4","ios16.4"]`
(extracted from `node_modules/vite/dist/node/chunks/node.js`,
`ESBUILD_BASELINE_WIDELY_AVAILABLE_TARGET`; neither vite.config
overrides `build.target`, and no browserslist exists anywhere in
the repo). So devices below iOS 16.4 are already outside the
shipped floor today. What v4 *changes* is the failure mode below
the floor: from "maybe a JS syntax error" to "certainly broken
styling" (v4 core depends on `@property` and `color-mix()`). The
operator must confirm the fleet (§6) before Commit 2 lands. Every
other blocker investigated (contrast-test coupling, rolldown
compat, palette identity) resolved to GO with evidence below.

## 0. Verified ground truth

- **Installed / declared.** `tailwindcss` **3.4.19** (one physical
  hoisted copy; `find apps -path '*node_modules/tailwindcss'` = 0
  nested), declared `^3.4.15` in exactly two workspaces:
  `apps/web/package.json` (devDeps, with `postcss ^8.4.49` →
  installed 8.5.22, `autoprefixer ^10.4.20` → installed 10.5.4)
  and `apps/site/package.json` (same trio). No other workspace
  (server/desktop/shared/root) declares any of the three. **No
  Tailwind plugins**: `@tailwindcss/forms`/`typography`/
  `line-clamp` absent from both package.jsons; `line-clamp-{1,2,3}`
  (10 uses) is core in 3.3+ and in v4. The only plugin is the
  inline `plugin(({ addVariant }) => …)` registering
  `landscape-short` in `apps/web/tailwind.config.js` (244 uses).
- **Registry (queried live 2026-07-24):** `tailwindcss` latest =
  **4.3.3** (published 2026-07-16; dist-tags also show
  `v3-lts: 3.4.19` — we are already on the v3 terminus, there is
  no newer v3 to step through). `@tailwindcss/vite` **4.3.3**,
  peers **`vite: ^5.2.0 || ^6 || ^7 || ^8`** → admits our Vite
  8.1.5 (rolldown) with no override. `@tailwindcss/postcss` 4.3.3
  exists but is **not needed** — both consumers are Vite apps;
  decision: `@tailwindcss/vite` for both, delete both
  postcss.config.js, drop `autoprefixer` + `postcss` from both
  manifests (v4 handles vendor prefixing and `@import` internally
  — upgrade guide, "Using PostCSS"). `tailwindcss@4` still exports
  the `tailwindcss/plugin` subpath (verified in its export map) —
  the config's `import plugin from "tailwindcss/plugin"` keeps
  resolving.
- **Consumers/config files (all read in full):**
  `apps/web/tailwind.config.js` (darkMode `"class"`, content
  `["./index.html","./src/**/*.{ts,tsx}"]`, theme.extend: colors
  canopy ×11 / moss ×11 / ember ×10 / bark ×10 (all literal hex),
  fontFamily sans+serif, fontSize display/title/heading/body/
  caption (tuple syntax with lineHeight/letterSpacing), spacing
  stack-{xs,sm,md,lg,xl}, boxShadow `leaf`, animation+keyframes
  milestone-pop/fade-in/slide-in, the landscape-short plugin;
  **no safelist, no presets, no corePlugins, no prefix, no
  separator** — i.e. none of the three options v4's `@config`
  drops). `apps/site/tailwind.config.js` is a deliberate
  standalone mirror (same palette hexes, fontFamily, boxShadow
  leaf + leaf-lg; no plugin, no fontSize/spacing/keyframes;
  content `["./index.html","./src/**/*.{ts,js}"]`). CSS entries:
  `apps/web/src/index.css` (263 lines, inventoried in §4.4) and
  `apps/site/src/styles.css` (57 lines). Only importers:
  `apps/web/src/main.tsx` and `apps/site/src/main.ts`.
- **No Tailwind CLI anywhere**: `rg -l tailwind .github deploy
  scripts apps/desktop` = 0; no npm script in any workspace
  invokes `tailwindcss`. CI (ci.yml) gates: workspace typecheck,
  web lint, server build, root `npm test`, PWA build, `npm audit
  --audit-level=high` (informational). **Audit baseline at execution
  time: see docs/maintenance.md — the standing brace-expansion
  advisory (GHSA-mh99-v99m-4gvg, dev/build tooling) is expected;
  the gate is "no NEW advisories", not zero.** Site's `npm run shots`
  (playwright) screenshots the **web dev server**, not the site
  build — unaffected. Desktop (Electron 43, Chromium far above
  the v4 floor) wraps the *built* web dist via `prepare:web` —
  inherits transparently.
- **Dark-mode ground truth (measured, not remembered):** v3.4.19
  with `darkMode: "class"` emits `&:is(.dark *)` — verified in a
  real site build artifact
  (`.dark\:bg-moss-950\/85:is(.dark *){background-color:#161f13d9}`).
  v4's `@config` compat layer for `darkMode: "class"` registers
  **exactly** `addVariant('dark', '&:is(.dark *)')` (read from
  `packages/tailwindcss/src/compat/dark-mode.ts` at v4.3.3). The
  dark selector shape is therefore **byte-identical across the
  migration**. No `@custom-variant dark` needed while `@config`
  is in place. (If the config is ever retired, the CSS-first
  incantation is `@custom-variant dark (&:where(.dark, .dark *));`
  — note it *additionally* matches the `.dark` element itself;
  irrelevant here since `.dark` sits on `<html>`/`:root` and every
  `dark:` class is on a descendant.)
- **`@config` capabilities (verified in v4.3.3 source,
  `compat/apply-compat-hooks.ts`):** loads legacy `theme`
  (incl. extend, tuple fontSize, keyframes), **`plugins`**
  (our addVariant plugin), **`darkMode`**, and **`content`**
  (config `content.files` are pushed into the source list —
  raw entries unsupported; we have none). Unsupported:
  `corePlugins`, `safelist`, `separator` — we use none.
  `theme()` with legacy dot paths still works
  (`css-functions.ts` → `legacyTheme`), **including the
  ` / 70%` opacity-modifier form** (`design-system.ts`
  `resolveThemeValue` splits on the last `/` and applies
  `withAlpha`) — our five `theme(…)` calls in index.css survive
  unchanged.
- **Scale parity (v4.3.3 `theme.css` vs installed v3
  `resolveConfig`):** `--shadow-md/lg/xl/2xl` are byte-identical
  to v3; a compat block (`theme.css` :504-508) keeps **bare**
  `shadow` (= v3 DEFAULT), `blur` (8px), `rounded`
  (`--radius: 0.25rem`), `shadow-inner` at their v3 values. The
  only changed meanings we're exposed to: `shadow-sm`
  (v3 `0 1px 2px 0 rgb(0 0 0 / 0.05)` → v4 = old DEFAULT) and
  `rounded-sm` (0.125rem → 0.25rem) — both pinned back in
  Commit 1 (§7).

## 1. The hard constraints, and what each one decided

1. **Palette byte-identity.** Literal-CSS byte identity is
   *provably impossible* under v4: the engine emits
   `background-color: var(--color-moss-900)` + a `:root/@theme`
   variable instead of v3's
   `rgb(44 58 40 / var(--tw-bg-opacity,1))`. The achievable —
   and, for the contrast guarantee, the *meaningful* — invariant
   is **token-value identity**: every `--color-{moss,canopy,
   ember,bark}-*` custom property in the built CSS must carry the
   config's hex **verbatim** (v4 passes custom values through
   untouched; only its *default* palette is oklch — which is why
   Commit 1 pins the four stock families we also use, §4.2), and
   every opacity-suffixed use must be computed-equivalent
   (§8). This is the fallback the constraint anticipated:
   **computed-value equivalence, checked per token, with the hex
   passthrough checked byte-wise.** The tripwire tests (§5) are
   engine-independent (hardcoded hex), so the emitted-CSS diff in
   §8 is the *real* gate — the tests alone cannot see engine
   drift.
2. **Conversation.tsx frozen.** Verified exposure (read-only
   grep): `outline-none` ×8, `shadow-sm` ×1 (line 1146),
   `hover:` ×~14 including the **load-bearing
   `group-hover:opacity-100` reveal at line 1146** (the message
   action affordance: `opacity-0 … focus:opacity-100 …
   group-hover:opacity-100`), zero `space-y`, zero bare `ring`
   (its two "ring" hits are a local variable, lines 1057/1086).
   Consequence: we cannot run the class renames v4 wants
   (`outline-none→outline-hidden`, `shadow-sm→shadow-xs`) in this
   file — so **we run them nowhere** and instead pin v3 semantics
   globally (§7 Commit 2 compat block). This also means **we do
   NOT run `npx @tailwindcss/upgrade`** — it would rewrite
   Conversation.tsx.
3. **3441-test web suite from apps/web.** Tests never load the
   CSS engine: vitest `css` option unset (defaults off), no test
   imports a stylesheet, setup is fake-indexeddb only. Two suites
   read Tailwind *files as text* (§5) — they constrain the shape
   of the index.css/tailwind.config.js edits, and both survive
   this plan without modification. Zero tests assert
   `outline-none`/`shadow-sm` class strings (grep-verified), so
   the keep-v3-spellings strategy has zero test churn.
4. **Print / PWA / desktop.** `print:` ×141 — the `print` variant
   is unchanged in v4; `printChrome.guard.test.ts` source-scans
   for `print:hidden`/`print:h-auto`/`print:overflow-visible`
   (unchanged classes). PWA: workbox precache globs include
   `css`; manifest colors are static hex. Desktop consumes web
   dist. All inherit; gates re-verify.

## 2. v4 breaking surface × this repo (every count from real greps, §10)

| v4 change | Exposure here | Action |
|---|---|---|
| `@tailwind` directives removed | 2 CSS entries | `@import "tailwindcss"` + `@config` (§7) |
| PostCSS plugin split out | 2 postcss.config.js | delete; `@tailwindcss/vite` in both vite configs |
| `bg/text/border/divide/ring/placeholder-opacity-*` removed | **0** | none |
| `flex-shrink/grow-*`, `overflow-ellipsis`, `decoration-slice/clone` removed | **0** | none |
| `shadow-sm` → `shadow-xs` | **12** (11 files incl. Conversation.tsx:1146) | pin `boxShadow.sm` to v3 value (Commit 1) |
| bare `shadow`, `shadow-md/lg/xl/2xl` | 0 bare (10 grep hits all prose); md 7 / lg 7 / xl 4 / 2xl 1 | values identical v3↔v4 — none |
| `rounded-sm` → `rounded-xs` | **1** (HighlightedText.tsx) | pin `borderRadius.sm` (Commit 1) |
| bare `rounded` | 33 | v4 compat var keeps 0.25rem — none |
| `blur-sm`/`drop-shadow(-sm)`/`backdrop-blur-sm` | **0** (12 `backdrop-blur` all bare = 8px both versions) | none |
| `outline-none` → `outline-hidden` | **34 web + 1 site** (Conversation.tsx included) | `@utility outline-none` override restoring v3's invisible-outline (forced-colors-safe) declaration (§7) |
| bare `ring` 3px→1px, default ring color blue-500→currentColor | **0 bare ring** (9 hits audited: all prose/variables); ring-0 ×1, ring-1 ×3, ring-2 ×29, **every ring-1/2 with an explicit ring color** on the same class string | none |
| default border color gray-200→currentColor | all `border`/`divide` sites carry explicit colors (divide-y ×16 all `divide-moss-100 dark:divide-moss-800` or bark; the 2 suspicious multi-line strings in CalendarMonth/Week continue with `border-moss-200` on the next line) | belt-and-braces base rule pinning `#e5e7eb` anyway (§7) — zero-risk |
| preflight placeholder gray-400 → currentColor/50% | `.input` uses `placeholder-moss-400` (the `placeholder-{color}` utility **exists in v4** — `utilities.ts:4091`), `placeholder:` ×2 explicit; other inputs relied on preflight | base rule pinning `#9ca3af` (§7) |
| preflight button `cursor: pointer` → `default` | app-wide reliance (v3 preflight.css:345 verified) | base rule restoring pointer (§7) |
| preflight `<dialog>` margin reset | **0** `<dialog>` elements | none |
| `hidden` attribute now beats display classes | **0** `hidden` attributes (the `hidden lg:block` at ProjectDetail.tsx:1373 is the *class*, unaffected) | none |
| `space-x/y` & `divide` selector change (`> :not([hidden]) ~ :not([hidden])` → `> :not(:last-child)`, margin/border flips side) | space-y **46**, space-x 0, divide-y **16**, divide-x 0 | unavoidable engine change; children here are mounted/unmounted by JSX (no `[hidden]` attrs), so spacing between visible children is equivalent — visual QA item (§9 risk 5) |
| `hover:` gated behind `@media (hover: hover)` | **435 web + 32 site**, incl. the frozen Conversation.tsx:1146 touch reveal | `@custom-variant hover (&:hover);` restores v3 (documented override, upgrade guide "Hover styles on mobile"); gate greps built CSS to confirm `group-hover` composes it (§8) |
| important prefix `!x` → suffix `x!` | **0** | none |
| `bg-[--var]` → `bg-(--var)` | **0** | none |
| commas in `grid-cols-[…]`/`object-[…]` arbitraries | **0** (all 9 grid arbitraries already underscore-separated) | none |
| `transform-none` reset / `transition-[…transform…]` | **0 / 0** | none |
| variant stacking order (rtl→ltr) | **0** stacked order-sensitive variants found | none |
| `container` config options | **0** uses of the `container` utility (2200 word hits are test variables/prose; class-attr-scoped grep = 1, a JS variable) | none |
| gradients: `bg-gradient-to-*` kept as legacy alias (verified `compat/legacy-utilities.ts`) but interpolates **`in oklab`** (v3: sRGB) | **3** (`Present.tsx` ×2 `to-br from-canopy-900 to-moss-950`, site index.html ×1) | accept (endpoints identical, only midpoint blend shifts imperceptibly) or optionally `bg-linear-to-br/srgb` later — both files editable; not palette-token-relevant |
| `transition`/`transition-colors` now include `outline-color` | global `:focus-visible` rule sets outline color unconditionally | cosmetic-nil; noted |
| v4 default palette → oklch | app uses stock **amber ×251(+6 site), rose ×307, red ×19, indigo ×4** — and the contrast tests assert the v3 *hexes* of amber/rose | **pin all four families to v3 hex in both configs (Commit 1)** — keeps rendered colors equal to the tested values |
| `resolveConfig` removed | used only by our Phase-0 snapshot tooling (run *before* migrating) | none |
| `@layer components/utilities` → native layers; `@apply` of custom classes requires `@utility` | `@apply btn` ×3 (web) + ×2 (site); `@apply touch-target` ×1 | convert `touch-target` and `btn` to `@utility` in each entry CSS; everything else stays a plain `@layer components` rule (zero variant-usage of component classes — grep-verified) (§7) |
| JS config auto-detection removed | both apps | `@config` directive (§3) |
| content auto-detection scans cwd | monorepo: could pull classes from sibling files | `source(none)` + config `content` globs as the explicit source list (§3) |

Dynamic-class audit: **no clsx/classnames/cva anywhere**; no
template literal constructs a *partial* utility name (all
`-${…}` hits are ids/dates/routes); no safelist exists. The v3
content globs (`index.html` + `src/**/*.{ts,tsx|js}`) remain the
complete class universe — including class strings in
`db/seed.ts`/`content/taskSteps.ts` (matched by `src/**/*.ts`).

## 3. Config strategy: keep the JS configs via `@config` (decision)

CSS-first `@theme` is v4-idiomatic, but here `@config` wins on
every constraint:

- `apps/web/src/pages/pageHeaderCompact.test.tsx` **reads
  `tailwind.config.js` as text** (readFileSync, line 54) and
  asserts it still contains the exact landscape-short media query;
  it also regex-asserts `index.css` still has the `.page-title {
  @apply font-serif text-display text-canopy-900
  dark:text-canopy-50; }` base rule and the two landscape-short
  media blocks. `@config` keeps the config file byte-identical
  and this plan's index.css edit preserves those blocks verbatim
  → **test survives unchanged**.
- The palette stays single-sourced in the JS configs (the site's
  mirror stays a mirror, per its own comment).
- darkMode/plugin/content all carry over through the verified
  compat layer (§0) — the landscape-short variant needs no
  rewrite (a native alternative,
  `@custom-variant landscape-short (@media (orientation:
  landscape) and (max-height: 500px));`, is noted for the
  eventual idiomatic pass, which is **out of scope**).
- The contrast guard tests do **not** import the config (they
  hardcode hex — verified §5), so nothing forces CSS-first
  either.

Import form, both apps: `@import "tailwindcss" source(none);`
followed by `@config "../tailwind.config.js";` — `source(none)`
(documented: "detecting-classes-in-source-files § Disabling
automatic detection") turns off cwd scanning so the source list
is exactly the config's `content` globs, matching v3's class
universe and keeping monorepo/docs files out of the scan.

## 4. Inventory details the executor needs

**4.1 Palette tokens (the byte-contract, from both configs —
identical):** canopy 50 `#f0fdf4`, 100 `#dcfce7`, 200 `#bbf7d0`,
300 `#86efac`, 400 `#4ade80`, 500 `#22c55e`, 600 `#16a34a`, 700
`#15803d`, 800 `#166534`, 900 `#14532d`, 950 `#052e16`; moss 50
`#f5f7f3`, 100 `#e7ede1`, 200 `#cfdbc4`, 300 `#adc09e`, 400
`#87a275`, 500 `#688657`, 600 `#506b43`, 700 `#3f5537`, 800
`#34452e`, 900 `#2c3a28`, 950 `#161f13`; ember 50–900 (`#fdf6ec
#fae8cf #f4d3a1 #e9b977 #dc9c4d #c97f1e #a96618 #8a5212 #65380c
#4a2c08`); bark 50–900 (`#f7f4ef #ede7dc #d9cfbe #bfb097 #9a886b
#7a6a52 #5e5040 #473d31 #3a3225 #241f18`).

**4.2 Stock shades in use** (to be pinned as full v3 families in
Commit 1, values copied verbatim at execution time from the still-
installed v3: `node -p "JSON.stringify(require('tailwindcss/colors').amber)"`
etc.): amber {50,100,200,300,400,500,700,800,900,950}, rose
{50,100,200,300,500,600,700,800,900,950}, red
{50,100,200,300,700,800,900,950}, indigo {50,200,800,950}.

**4.3 dark: blast radius:** 2145 (web) + 81 (site). Zero
migration churn — selector shape proven identical (§0); counted
to size the *verification* stakes, not the diff.

**4.4 index.css beyond the directives (all must survive):**
`@layer base` — color-scheme light/dark, `html.text-larger/
text-largest` font-size steps, the `.touch-target` 52px bump,
the iOS 16px `max(1em,16px)!important` input floor under
`(pointer: coarse)`, `overflow: clip` shell, global
`:focus-visible { outline: 2px solid theme("colors.canopy.600") }`,
prefers-reduced-motion floor, prefers-contrast decorative-SVG
suppression. `@layer components` — `.touch-target`, `.pb-fab-clear`
(+ landscape-short override), `.band-hairline` (×2 media blocks,
`theme("colors.moss.200 / 70%")` / `moss.800 / 70%` — the
theme()-with-modifier form verified working in v4, §0),
`.card` (+ `html.density-compact .card`), `.page-title`
(+ landscape-short compact block — **byte-frozen by
pageHeaderCompact.test**), `.page-subtitle` fold, `.section-title`,
`.btn`/`.btn-primary`/`.btn-secondary`/`.btn-ghost`, `.chip`,
`.input`, details/summary markers. Site styles.css — body @apply,
`.container-page`, `.btn`/`.btn-primary`/`.btn-ghost`, `.card`,
`.eyebrow`, `.shot-frame`. `@fontsource-variable/source-serif-4`
is imported in main.tsx (JS, not CSS) — untouched by the CSS
pipeline change.

## 5. The guard tests (named), and their coupling

- **`apps/web/src/lib/a11y/palette-contrast.test.ts`** — the
  contrast tripwire: 4 describe blocks (light pairings ×14, dark
  composited pairings ×16, secondary-on-dark ×9,
  secondary-on-light ×9, plus the moss-500 negative check and the
  **source-scan guard** that walks `src/` rejecting
  `text-moss-500`/`dark:text-moss-400`). **It hardcodes every hex
  inline** ("Project palette from tailwind.config.js" is a
  comment, not an import) — so it is decoupled from the engine:
  it keeps passing even if emitted colors drifted. That is
  precisely why §8's emitted-CSS diff is a mandatory gate, and
  why Commit 1 pins amber/rose (the test's AMBER/ROSE constants
  are v3 hexes; v4's oklch defaults would silently diverge from
  what the test certifies).
- **`apps/web/src/lib/a11y/contrast.test.ts`** — pure math unit
  tests (parseHex/composite/contrastRatio); engine-independent.
- **`apps/web/src/pages/pageHeaderCompact.test.tsx`** — reads
  `tailwind.config.js` AND `index.css` as text (§3); constrains
  both edits.
- **`apps/web/src/lib/printChrome.guard.test.ts`** — source-scans
  7 components for `print:hidden` + Layout for
  `print:h-auto`/`print:overflow-visible` ×2.
- Class-contract suites touching moss/canopy/landscape-short:
  `MyWork.landscape.test.tsx`, `BottomNav.test.tsx`,
  `Calendar.test.tsx` (landscape-short defaults),
  `Help.test.tsx`, `AppHeader.test.tsx`, `CommandPalette.test.tsx`,
  `Board.readingOrder.test.tsx` (scans class attrs for `order-` —
  the reason `.band-hairline` must stay a component class, not
  `border-*` utilities), `avatar.test.ts` +
  `conceptIllustrations.test.tsx`, `Markdown.test.tsx` (hardcoded
  hex/class assertions). All are source/class-string level: green
  as long as we rename nothing — and we rename nothing.
- Runbook: `docs/accessibility-test-runbook.md` references the
  contrast tests as the merge gate (lines 23, 319, 631, 662);
  `docs/accessibility.md` §8.3 points reviewers at "the Tailwind
  config has the palette". Neither doc needs changes under
  `@config`.

## 6. Browser floor — the operator go/no-go gate

- Tailwind 4 (upgrade guide, verbatim): "designed for Safari
  16.4+, Chrome 111+, and Firefox 128+ … will not work in older
  browsers" (hard deps: `@property`, `color-mix()`).
- This repo declares no browserslist and no build.target
  override; **Vite 8.1.5's default already targets
  chrome111/edge111/firefox114/safari16.4/ios16.4** (§Verdict).
  So the *marginal* fleet exposure from v4 is: (a) Firefox
  114–127 (auto-updating desktop/Android browser; ESR 128 has
  been the oldest supported line since Sept 2024) and (b) the
  failure-mode hardening below the existing floor.
- In device terms: iOS 16.4 ⇒ iPhone 8/X (2017) and later —
  iPhone 7 and older are already outside today's shipped JS
  target. Android: Chrome/WebView auto-update via Play on
  Android 8+; Chrome 111 shipped March 2023.
- **Gate:** because this is a mutual-aid app whose members may
  carry old phones, Commit 2 does not land until the operator
  confirms no known member device is below iOS 16.4 / un-updated
  Chrome <111. If the fleet fails this check, **hold on v3.4.19**
  (fully supported v3-lts; zero advisories; the upgrade is
  convenience-only) and add a browserslist/`build.target`
  documenting the real floor instead. This plan remains valid
  whenever the fleet allows.

## 7. Phases

**Phase 0 — baseline + snapshots (no commit).** From repo root:
`npm run typecheck`, `npm test` (record web count, expect 3441),
`npm run build`, `npm --workspace @understoria/site run build`,
`npm audit` (record the standing baseline — see
docs/maintenance.md). Then snapshot, from `apps/web` (and again from
`apps/site` with the same one-liner):

```sh
# palette snapshot via v3's own resolver (works only pre-migration)
node --input-type=module -e "
import resolveConfig from 'tailwindcss/resolveConfig.js';
const { default: cfg } = await import('./tailwind.config.js');
const t = resolveConfig(cfg).theme.colors;
for (const f of ['moss','canopy','ember','bark','amber','rose','red','indigo'])
  for (const [k,v] of Object.entries(t[f]))
    console.log(\`--color-\${f}-\${k}: \${String(v).toLowerCase()}\`);
" | sort > /tmp/tw-baseline-web-palette.txt
# keep the built CSS for rule-level comparison
cp dist/assets/*.css /tmp/tw-baseline-web.css
```

**Commit 1 — "tailwind: pin values v4 would change (no-op under
v3)"** — 2 files, no dependency change. In **both**
tailwind.config.js `theme.extend`:
1. `colors`: add full `amber`, `rose`, `red`, `indigo` families
   as literal hex, copied verbatim from the installed v3
   (`require('tailwindcss/colors')`). Under v3 these equal the
   defaults → emitted CSS unchanged; under v4 they defeat the
   oklch default palette and keep rendered chips equal to the
   hexes `palette-contrast.test.ts` certifies.
2. `boxShadow: { sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)", … }` and
   `borderRadius: { sm: "0.125rem" }` (web config keeps `leaf`
   beside `sm`; site keeps `leaf`/`leaf-lg`). Equal to v3
   defaults → no-op now; under v4 they pin the renamed-scale
   utilities `shadow-sm` (12 sites incl. Conversation.tsx) and
   `rounded-sm` (1 site) to their v3 meaning.
Gates: rebuild web+site and **byte-diff the built CSS against
Phase 0** (identical modulo the content-hash filename); full web
suite from apps/web; web typecheck + lint; root `npm test`.
Rollback: revert; semantically inert under v3.

**Commit 2 — "web: tailwindcss 3.4.19 → 4.3.3
(@tailwindcss/vite)"** — apps/web/package.json, root lockfile,
vite.config.ts, index.css, minus postcss.config.js. From repo
root:
```sh
npm uninstall --workspace @understoria/web autoprefixer postcss tailwindcss
npm install  --workspace @understoria/web --save-dev tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3
git rm apps/web/postcss.config.js
```
`vite.config.ts`: `import tailwindcss from "@tailwindcss/vite";`
and prepend `tailwindcss()` to `plugins` (react/VitePWA/rolldown
options untouched; the plugin is inert for vitest — tests import
no CSS).
`index.css` head replaces the three `@tailwind` directives with:

```css
@import "tailwindcss" source(none);
@config "../tailwind.config.js";

/* ── Tailwind 4 compat: this codebase intentionally keeps v3
 *    semantics (Conversation.tsx is frozen; see
 *    docs/tailwind-4-plan.md). Do not remove pieces of this
 *    block without reading that plan. ── */

/* v3 hover: applies on tap/sticky-hover on touch devices — the
 * Conversation message-action reveal (group-hover) depends on it. */
@custom-variant hover (&:hover);

/* v3 outline-none: invisible outline, still visible in
 * forced-colors mode (v4 renamed this to outline-hidden and made
 * outline-none really remove the outline). */
@utility outline-none {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

@layer base {
  /* v3 preflight defaults v4 dropped: */
  *, ::after, ::before, ::backdrop, ::file-selector-button {
    border-color: #e5e7eb; /* v3 gray-200 */
  }
  input::placeholder, textarea::placeholder {
    color: #9ca3af; /* v3 gray-400 */
    opacity: 1;
  }
  button:not(:disabled), [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}
```

Then, inside the existing `@layer components`, convert **only the
two `@apply` targets** to utilities (v4 can no longer `@apply` a
plain component class): `.touch-target` → `@utility touch-target
{ min-height: 44px; min-width: 44px; }` and `.btn` →
`@utility btn { @apply touch-target inline-flex …; }` (same
declarations; if `@apply` inside `@utility` fails at build —
low-probability, it's what the official upgrade tool emits —
expand to plain declarations). Everything else in the file stays
**byte-identical**, in particular the `.page-title` base rule and
both landscape-short media blocks (pageHeaderCompact contract)
and the `theme("colors.…")` calls (legacy form verified working).
Lockfile expectation: + `@tailwindcss/vite`, `@tailwindcss/node`,
`@tailwindcss/oxide` (with per-platform optional binaries),
`tailwindcss@4.3.3` hoisted; `tailwindcss@3.4.19` and its postcss
chain move **nested under apps/site** (interim state, §9 risk 8);
`npm ls tailwindcss` must show exactly those two, `npm ls
autoprefixer` only under site.

Gates, in order (repo root unless noted):
1. `npm run shared:build`; `npm --workspace @understoria/web run typecheck`
2. Full suite from apps/web: `cd apps/web && npx vitest run` —
   same count as baseline; **pageHeaderCompact, palette-contrast,
   contrast, printChrome.guard, MyWork.landscape, BottomNav,
   Calendar, Help, Board.readingOrder, all 8 Conversation suites
   explicitly green**
3. `npm --workspace @understoria/web run lint`
4. PWA build: `npm --workspace @understoria/web run build`
5. **CSS-equivalence harness (§8)** against the Phase-0 snapshot
6. Root `npm test`; `npm audit` → unchanged from the Phase-0
   baseline (no new advisories)
7. Manual smoke (§9 matrix)
Rollback: `git revert` (single commit; restores v3 deps,
postcss.config.js, directives).

**Commit 3 — "site: tailwindcss 3.4.19 → 4.3.3"** — the mirror,
sized-small: same uninstall/install for `@understoria/site`,
delete `apps/site/postcss.config.js`, add `tailwindcss()` to
`apps/site/vite.config.ts` plugins, and in `styles.css` the same
head (`@import … source(none)` + `@config "../tailwind.config.js"`
+ the same compat block) with its one `@apply` target converted
(`.btn` → `@utility btn`; `.btn-primary`/`.btn-ghost` keep
`@apply btn …` as plain classes). Site-specific note: its `.btn`
uses `focus-visible:outline-none` — covered by the same
`@utility outline-none` override. Gates: site build; §8 harness
against the site snapshot; **`npm ls tailwindcss` → exactly one
copy, 4.3.3, v3 chain (postcss-import/postcss-js/
postcss-load-config) and autoprefixer/browserslist fully gone
from the lockfile**; root `npm test`; `npm audit` unchanged from baseline; open
`apps/site/dist/index.html` light+dark; `npm run shots` machinery
unaffected (it targets the web dev server).

**Out of scope (explicitly):** running `@tailwindcss/upgrade`;
renaming any utility to its v4 name; migrating the configs to
CSS-first `@theme`; removing the compat block; `bg-linear-*`
modernization. All deferred until/unless the Conversation.tsx
freeze lifts — at which point the compat block is the checklist.

## 8. CSS-equivalence harness (the palette gate, exact commands)

After each app's v4 build (`$CSS` = the built `dist/assets/*.css`):

```sh
# 1. Token byte-identity: every emitted palette var must be the
#    config hex verbatim (v4 passes custom values through; this
#    catches any oklch/format conversion).
grep -oE -- '--color-(moss|canopy|ember|bark|amber|rose|red|indigo)-[0-9]+:[^;}]+' "$CSS" \
  | sed 's/: */: /' | tr 'A-F' 'a-f' | sort -u > /tmp/tw-v4-palette.txt
# v4 emits only *used* tokens: require v4 ⊆ baseline with equal values
comm -23 /tmp/tw-v4-palette.txt /tmp/tw-baseline-web-palette.txt   # MUST be empty

# 2. Rule-shape spot checks (dark selector byte-parity, slash-
#    opacity computed parity, custom tokens, keyframes, variant):
grep -c ':is(.dark \*)' "$CSS"                       # > 0, same shape as v3
grep -o '\.dark\\:bg-moss-950\\/85[^}]*}' "$CSS"     # value must compute to #161f13 @ 85%
                                                     # (accept #161f13d9 or color-mix(... var(--color-moss-950) 85%, transparent))
grep -o -- '--shadow-leaf:[^;}]*' "$CSS"             # verbatim config value
grep -o '\.text-display[^}]*}' "$CSS"                # 2.25rem / 1.15 / -0.02em
grep -c 'milestone-pop' "$CSS"                       # keyframes present
grep -o '\.landscape-short\\:[a-z-]*' "$CSS" | head  # variant registered via @config plugin
# 3. hover restoration: group-hover must compose the custom variant —
#    the reveal selector must NOT sit inside @media (hover: hover)
grep -o '[^{}]*group-hover\\:opacity-100[^{]*{' "$CSS"
# 4. outline-none override took effect:
grep -o '\.outline-none[^}]*}' "$CSS"                # 2px solid transparent, offset 2px — NOT outline-style:none
# 5. Class-universe diff vs the Phase-0 copy (catches source-
#    detection drift): extract sorted selector lists from both
#    files and diff; investigate every asymmetry.
for f in /tmp/tw-baseline-web.css "$CSS"; do
  grep -oE '(^|[}{,])\.((\\.|[^ ,{:.])+)' "$f" | sed 's/^[}{,]//' | sort -u > "$f.classes"
done
diff /tmp/tw-baseline-web.css.classes "$CSS.classes" | head -50
```

If check 1 fails for any token, the migration halts (that is the
constraint tripping). If a slash-opacity form emits `color-mix`
rather than hex-alpha, the fallback standard applies:
**computed-value equivalence per token** — mixing a color with
`transparent` at N% in any rectangular space preserves the color
channels and sets alpha = N%, so `color-mix(in oklab,
var(--color-moss-950) 85%, transparent)` computes to the same
rendered pixel as v3's `#161f13d9`; for belt-and-braces, an
optional deep gate renders swatch divs from both dists with the
already-installed playwright (apps/site devDep) and diffs
`getComputedStyle(...).backgroundColor` per token/alpha pairing.

## 9. Verification matrix + named risks

Manual smoke (after Commit 2): light/dark toggle + `color-scheme`;
text-size larger/largest (touch-target bump); density-compact
card padding; landscape-short rail + compact page title;
Conversation on a TOUCH device: tap a message → action affordance
appears (the group-hover reveal), reaction long-press, `?q=`
search-match ring (`ring-2 ring-canopy-400`); `.input` focus ring
+ placeholder color; Board/Calendar FAB clearance; a print route
(print preview: chrome hidden, shell unclipped); a
forced-colors/Windows-High-Contrast spot check of a
`focus:outline-none focus:ring-2` control; PWA build served +
update prompt; site: hero gradient, theme toggle, skip link.

1. **Palette drift (the constraint):** engine-level risk that v4
   reformats custom hex — mitigated to near-zero by verified
   passthrough design + gate §8.1; residual is slash-opacity
   formatting, covered by the documented computed-equivalence
   fallback. Severity if tripped: migration halts, revert.
2. **Browser floor (operator gate, §6):** the one honest reason
   to hold. Severity: total styling loss on sub-floor devices.
   Mitigation: explicit fleet confirmation before Commit 2;
   staying on v3-lts is a fully supported outcome.
3. **hover restoration semantics:** `@custom-variant hover`
   must propagate into `group-hover` (upgrade-guide-documented
   override; gate §8.3 verifies the emitted selector). Fallback:
   an explicit `@custom-variant group-hover` equivalent.
   Severity: medium (touch UX of the frozen file).
4. **`@utility` conversions (`btn`, `touch-target`,
   `outline-none` override):** build-time failure modes, caught
   at gate 4; fallback is expanding `@apply` to plain
   declarations. v4 sorts custom utilities by property count —
   `.btn-*` stay plain classes so component ordering is
   unchanged; utilities layer still beats components (the
   `.page-title`+`text-base` override contract).
5. **space-y/divide-y selector change (46+16 sites):** margin
   flips from top-of-followers to bottom-of-non-last; equivalent
   for JSX-mounted children (no `[hidden]` attrs — verified),
   but edge spacing can shift where a space-y parent's last child
   was special-cased. No test asserts margins; visual QA on
   MyWork/PlugIn/Profile/Invites/Help lists. Severity: low,
   cosmetic.
6. **Preflight beyond the pinned trio:** v4's remaining preflight
   deltas (dialog margins — no dialogs; hidden attr — unused) are
   grep-cleared; anything unforeseen surfaces in smoke. Low.
7. **Gradient interpolation (3 sites)** now `in oklab`: midpoint
   blend shifts subtly; endpoints (canopy-900→moss-950 etc.)
   identical. Cosmetic-low; optional `/srgb` pin later.
8. **Interim dual-tailwind tree between Commits 2 and 3:**
   verified-normal npm nesting (site resolves its own v3 via its
   postcss config); bounded by landing Commit 3 promptly; `npm ls
   tailwindcss` gates both states. Low.
9. **rolldown-vite × @tailwindcss/vite:** peer-admitted (`^8`),
   standard plugin hooks; failure would be loud at gate 4.
   Low.
10. **Audit:** new packages (`@tailwindcss/*`, oxide binaries)
    currently carry no advisories; gate re-runs `npm audit` (must
    introduce no new advisories) on both commits.
11. **Rollback:** every commit is an independent `git revert`;
    no data/storage/URL-format migration exists anywhere in this
    change; Commit 1 is forward-compatible and may stay under
    any rollback.

## 10. Audit trail — exact commands behind every count

From repo root (rg = ripgrep; `-P` = PCRE2 where lookarounds
needed): versions — `node -e "…require('…/node_modules/X/package.json').version"`,
`npm ls tailwindcss postcss autoprefixer`, `npm view
tailwindcss@4.3.3 / @tailwindcss/vite@4.3.3 / @tailwindcss/postcss@4.3.3
peerDependencies dependencies dist-tags time.modified exports`.
Docs/source verified from tags:
`raw.githubusercontent.com/tailwindlabs/tailwindcss.com/main/src/docs/{upgrade-guide,functions-and-directives,adding-custom-styles,detecting-classes-in-source-files}.mdx`
and `…/tailwindcss/v4.3.3/packages/tailwindcss/{theme.css,src/utilities.ts,src/css-functions.ts,src/design-system.ts,src/compat/{apply-compat-hooks.ts,dark-mode.ts,config/create-compat-config.ts,legacy-utilities.ts}}`.
Counts — `rg -o 'PATTERN' apps/{web,site}/src apps/{web,site}/index.html | wc -l`
per §2 row; bare-token forms via `rg -oP '(?<![\w-])TOKEN(?![-\w])'`
with every hit audited by hand (ring 9→0 real, shadow 10→0,
outline 18→0-bare-in-markup vs the `focus-visible:outline
outline-2` combos which are v4-fine, container 2200→0);
Conversation.tsx exposure via the same patterns scoped to the
file; ring-color coverage via class-attr-scoped
`rg -oP 'class(Name)?=["\`{][^"\`}]*'` piped through the ring
filters; dark-selector ground truth from
`apps/site/dist/assets/index-7xYLhL62.css` (untracked local v3
build artifact); v3 defaults from
`require('tailwindcss/resolveConfig')(require('tailwindcss/stubs/config.full.js'))`
and `node_modules/tailwindcss/src/css/preflight.css`; Vite target
from `grep -A8 'ESBUILD_BASELINE_WIDELY_AVAILABLE_TARGET'
node_modules/vite/dist/node/chunks/node.js`; test coupling via
`rg -ln 'readFileSync.*(css|tailwind)' apps/web/src` (exactly
pageHeaderCompact) and `rg -l 'moss|canopy|contrast'` over test
files (10 files, each classified in §5); `npm audit` → "found 0
vulnerabilities" (a dated observation from plan time — the
brace-expansion advisory later changed the baseline; see
docs/maintenance.md).
