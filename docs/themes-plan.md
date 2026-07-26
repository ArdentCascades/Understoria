# Member-selectable themes — implementation plan

> **Status: COMPLETE — T1 + T2 + T3 SHIPPED** (T3: opt-in "Morning
> mist" — html.mist + .chrome-mist on the six chrome surfaces
> (AppHeader, BottomNav, Board/Proposals/Messages sticky bands,
> DockedPanel), blur(12px) saturate(1.1) with the certified tint
> floors moss-50/0.92 light + moss-950/0.85 dark, solid fallbacks
> under prefers-reduced-transparency and missing backdrop-filter,
> Settings toggle + Dexie/bootstrap plumbing + refreshed CSP hash
> on both Caddyfile vhosts.)
> **T1 + T2 SHIPPED** (T2: [data-palette] blocks for the
> three themes, pre-paint bootstrap attr + refreshed CSP hash on
> both Caddyfile vhosts, lib/palette.ts + Dexie/AppContext/Settings
> picker with swatch previews, runtime theme-color meta (D3), and
> the contrast suite parametrized to 201 assertions incl. the
> index.css drift lock). T3 (Morning mist) remains PROPOSED.
> T1: variable layer: brand families →
> `rgb(var() / <alpha-value>)` resolving from the `:root` triplet
> block in index.css; shadow-leaf follows the palette; InstallGuide
> pill AA fix; TW4-plan §1 contract amended; zero-visual-change
> proven by emitted-CSS inspection — all 42 triplets equal the
> baseline hexes, zero brand hexes remain in built CSS). T2
> (picker + three themes) and T3 (Morning mist) remain PROPOSED;
> D1–D7 approved as recommended.
> Original status: PROPOSED (code-verified 2026-07-26 against main at
> `c90526a` by two audit passes: a full variable-ization risk sweep
> of apps/web and a palette-design pass that computed WCAG contrast
> for every certified pairing under every proposed theme).
> Discipline model: docs/react-19-plan.md (verified ground truth →
> design → phased commits with gates → named risks → audit trail).
> Scope: a per-member **palette** preference in Settings →
> Appearance, orthogonal to light/dark — every theme ships both
> modes. Curated set, no free-form color picker (a picker cannot be
> contrast-certified and the certification suite is the project's
> stated merge gate for color changes).

## 0. Verified ground truth

### 0a. The mechanism's premise HOLDS

The proposal: redefine the four brand families (canopy, moss,
ember, bark) in `apps/web/tailwind.config.js` as
`rgb(var(--canopy-600) / <alpha-value>)`-style references so a
`data-palette` attribute on `<html>` swaps the whole palette with
zero call-site changes. Audited against the entire web app:

- **Zero arbitrary color values** in classNames (`[#…]`, `bg-[rgb…]`
  — none exist; every `text-[…]` arbitrary is a font size).
- **Zero color-bearing inline styles.** All 20 `style={{` sites are
  widths/heights/break rules; progress fills get color from sibling
  classes; `ErrorBoundary.tsx` deliberately uses `currentColor`.
- **All in-app SVGs and charts are `currentColor`/class-driven**
  (ProjectSparkline, BreadthBar, ReciprocityPulse, the visual/*
  line-art set) — they follow the swap for free.
- `darkMode: "class"` and the palette attribute ride the same
  `<html>` element, applied in the same two places (`index.html`
  bootstrap; `lib/theme.ts` at runtime) — they compose cleanly with
  `.dark`, `.text-larger/largest`, `.density-compact`.
- **~240 occurrences (37 distinct patterns, 95 files) of brand
  alpha-modifier classes** (`bg-canopy-950/40` ×55,
  `bg-canopy-900/60` ×17, …, incl. `.card`'s `border-bark-200/60`
  and `.input`'s `ring-canopy-600/30` inside `@apply` in
  index.css). ALL survive under the `<alpha-value>` form — that
  syntax is the one mandatory requirement of the conversion.
- The five build-time `theme()` calls in `src/index.css` (global
  focus ring :75, `.band-hairline` :143–154 with `/ 70%`
  modifiers) inline whatever the config holds — they follow the
  swap by construction; T1 verifies the emitted CSS.

### 0b. What does NOT follow the swap (each needs a decision or a line of work)

- **`shadow-leaf`** (`tailwind.config.js:184`): hardcodes
  canopy-900's RGB inside the boxShadow token — used by every
  `.card`. One-token rewrite to `rgb(var(--canopy-900) / 0.04)`.
- **Avatars** (`lib/avatar.ts:139-148`): brand hexes deliberately
  FROZEN, with a header comment saying palette changes must not
  move them (stable member recognition beats palette consistency)
  and that changing them needs a threat-model entry. → D1.
- **QR codes** (`InviteQRCode.tsx:66-75`): fixed black-on-white by
  design for scanner reliability. Theme-invariant, no change.
- **App-identity assets**: favicon.svg, icons/icon.svg, the
  generate-icons canvas green, 12 iOS splash PNGs, the PWA manifest
  `theme_color`/`background_color` (vite.config.ts:81,86), and the
  Electron `backgroundColor` (apps/desktop/src/main.ts:112) — all
  bake canopy greens at build time and are served before JS runs.
  They cannot follow a runtime palette. → D2.
- **`<meta name="theme-color">`** (`index.html:81`): one static
  canopy-700, no dark variant, nothing updates it at runtime.
  Browser-chrome match with a chosen palette needs a small new
  runtime mechanism. → D3.
- **Status colors** (amber ~251 uses, rose ~307, red 19, indigo 4):
  semantics are caution/error/safety, never brand
  (`design/README.md:25-27`: "No color carries rank or judgment").
  They stay pinned to their current hexes — but they sit on themed
  surfaces (their dark chips composite over moss-900), so their
  certified pairings must be re-run per theme. Done — see §2. → D4.
- **The contrast suite** (`lib/a11y/palette-contrast.test.ts`, read
  in full): hardcodes local hex copies (deliberately decoupled from
  the config), certifies **48 pairings** — 14 light chips, 16 dark
  chips composited over `DARK_BG_BASE = moss-900`, 9 secondary-dark,
  9 secondary-light, all at AA 4.5:1 — plus two NEGATIVE guards:
  `moss-500` must FAIL AA on light surfaces, and a filesystem scan
  banning `text-moss-500`/`dark:text-moss-400` from src. Per-theme
  parametrization is a first-class deliverable of this plan, not an
  afterthought (§4 T2).
- **Print**: already forced monochrome (`print:text-black` ×66,
  `print:bg-white`, `print:border-black/*`); printed output is
  palette-independent by existing convention. QR stays black.
- **Bootstrap script ↔ CSP**: the FOUC-defense inline script
  (`index.html:94-129`) is sha256-pinned in the CSP on TWO
  Caddyfile lines (deploy/Caddyfile:57 clearnet, :121 onion vhost).
  Any bootstrap edit requires `scripts/csp-hash.sh` + both lines
  updated in lockstep; a stale hash silently disables the script
  (flash of wrong palette). Named risk, §6.
- **Tailwind 4 plan conflict** (docs/tailwind-4-plan.md, held on
  the operator's browser-floor gate): its §8 verification harness
  asserts emitted `--color-*` tokens carry the config hexes
  BYTE-VERBATIM, and `pageHeaderCompact.test.tsx:54` reads
  tailwind.config.js as text. var() indirection changes both
  contracts. → D6 (sequencing).
- **apps/site** keeps a deliberate standalone hex mirror of the
  palette — the showcase site does not theme (it markets the
  default identity). No change.

### 0c. Settings-preference pattern (cookie-cutter ×3, verified)

theme / textSize / density each follow the identical shape: pure
lib module (type + guard + `apply*` on documentElement + localStorage
write-through cache) → Dexie `settings` table key (`SETTING_KEYS`,
database.ts:1246ff, "mirrored to localStorage for the inline
script") → AppContext load/apply/setter wiring → an
`AppearanceSection.tsx` radiogroup → i18n `profile.appearance.*`
(en/es, parity-gated) → the bootstrap script pre-paint. A fourth
"palette" preference is a mechanical copy of this pattern; the only
cross-repo coupling is the CSP hash.

### 0d. Pre-existing finding (fix riding T1)

`InstallGuide.tsx:290`: selected-step pill renders small
`font-medium` white text on `bg-canopy-600` — **3.30:1**, below AA
normal, and not in the certified pairing list. Baseline bug
independent of themes (every proposed theme reproduces ≈the same
ratio because step luminance is preserved; Field notes lifts it to
4.04:1, still short). Fix: `bg-canopy-700` (4.65:1+), one line.

## 1. Design

### 1.1 The preference model

`PalettePreference = "canopy" | "riverbed" | "harvest" | "fieldnotes"`
(default `"canopy"` = today's palette, zero visual change for
everyone who never opens the setting). Orthogonal to
light/dark/system — every palette defines both modes because the
`dark:` utilities keep operating on the same family steps. Applied
as `data-palette="…"` on `<html>` (omitted or `"canopy"` = base
`:root` variables). Persisted exactly like the three existing
appearance preferences (§0c), key `understoria.palette`.

### 1.2 The palette contract

Themes swap ONLY the four brand families' step values — same family
names, same step keys (canopy/moss 50–950, ember/bark 50–900).
Stock families (amber, rose, red, indigo) stay pinned and
theme-invariant (D4). Each theme's ember-analog stays a WARM hue —
the "reserved for reciprocity moments" rule
(tailwind.config.js:56-58) is a cross-theme invariant, and every
theme keeps its warm accent hue-separated from amber so reciprocity
never reads as warning.

**Design method that makes certification tractable:** every theme
step preserves its baseline step's WCAG relative luminance (contrast
ratios depend only on luminance), swapping hue/saturation per
family. `bg-x-100` stays "very light", every `dark:` pairing keeps
its role, and all 48 certified ratios land within ±0.1 of baseline
by construction. Field notes deliberately stretches the ramp for
HIGHER contrast (except moss-500, which keeps baseline luminance so
the negative guard still holds).

### 1.3 The three new palettes (computed, certified)

All hex tables below passed **48/48** certified pairings (the exact
list from palette-contrast.test.ts, dark chips composited over each
theme's own moss-900), plus the moss-500 negative guard, verified
by a scratch implementation of the suite's own contrast math.
Worst-case pairing per theme is the canopy-700-link-on-moss-50 pair
(baseline 4.65:1): Riverbed 4.63, Harvest 4.73, Field notes 5.77.

#### Riverbed — cool slate-blue / stone

Canopy → kingfisher/river blue (actions and links, hue 200°); moss
→ wet-stone blue-grey; ember → sunset copper (hue 24° — 14° from
amber vs baseline's 4°, so the reserved accent separates BETTER
from warnings than today); bark → near-neutral slate grey.

| step | canopy | moss | ember | bark |
|---|---|---|---|---|
| 50 | `#f5fbfd` | `#f5f7f8` | `#fdf6f0` | `#f3f4f6` |
| 100 | `#eaf7fd` | `#e7ecf0` | `#fbe7d9` | `#e4e8ec` |
| 200 | `#d6edf9` | `#d0d8e0` | `#f7d0b7` | `#ccd1d7` |
| 300 | `#b7dff4` | `#afbcc8` | `#edb590` | `#abb2bd` |
| 400 | `#92cce9` | `#8b9cac` | `#e19868` | `#838b98` |
| 500 | `#61b6e0` | `#698097` | `#df7229` | `#646d7a` |
| 600 | `#2197d1` | `#526579` | `#bb5b1a` | `#4c535c` |
| 700 | `#1f77a2` | `#42505f` | `#984814` | `#3b3f46` |
| 800 | `#1e5e7d` | `#36414d` | `#6c330d` | `#2f343a` |
| 900 | `#1b4d67` | `#2f3740` | `#532709` | `#1d2024` |
| 950 | `#082b3c` | `#171d24` | — | — |

#### Harvest — warm autumn

Canopy stays the action color but leans warm: olive-gold green
(hue 80°, Δ42° from amber-500 so the primary never reads as
caution); moss → khaki/wheat greys; ember → goldenrod (Δ≥35° from
canopy — the reserved accent never collapses into the primary);
bark → deeper warm browns. Guard: canopy hue ≥75°, ember ≤45°
across all steps.

| step | canopy | moss | ember | bark |
|---|---|---|---|---|
| 50 | `#f7fbee` | `#f7f7f4` | `#fdf7e8` | `#f8f3f0` |
| 100 | `#eef8d8` | `#ecece4` | `#f9e9c5` | `#f0e5de` |
| 200 | `#ddf1b6` | `#d9d7c8` | `#f2d590` | `#decec1` |
| 300 | `#c6e586` | `#bdbba5` | `#e5bc5c` | `#c6ae9b` |
| 400 | `#a8d254` | `#9e9b7d` | `#d3a12a` | `#a2856e` |
| 500 | `#8cba2f` | `#827f5e` | `#b6881b` | `#826652` |
| 600 | `#729a21` | `#676449` | `#967015` | `#634e3f` |
| 700 | `#5a781d` | `#52503b` | `#795a10` | `#4a3c30` |
| 800 | `#49601c` | `#434131` | `#563f0a` | `#3f3125` |
| 900 | `#3d4e19` | `#38362a` | `#413007` | `#271e18` |
| 950 | `#202b08` | `#1e1d15` | — | — |

#### Field notes — paper & ink, high contrast

One restrained ink-green as the only hue; near-neutral ink greys;
a single muted sepia warm; warm paper greys. Ramp stretched (lights
lighter, 600+ darker ~25-30%): every certified pairing lands ABOVE
baseline (body text moss-600/white 7.34:1 vs 5.96:1) — this is the
sunlight/accessibility theme. moss-500 keeps baseline luminance so
the negative guard holds (4.11/3.93, correctly below 4.5).

| step | canopy | moss | ember | bark |
|---|---|---|---|---|
| 50 | `#f9fcfb` | `#fafaf9` | `#fcf9f6` | `#f9f9f7` |
| 100 | `#f3fbf7` | `#f3f3f3` | `#f9f2ea` | `#f3f1ef` |
| 200 | `#e7f6ef` | `#e8e8e7` | `#f3e7d8` | `#e6e5e1` |
| 300 | `#c8e9db` | `#c9c9c6` | `#e2cbad` | `#c6c2bc` |
| 400 | `#97d1b9` | `#9b9a96` | `#c8a272` | `#8f8a7f` |
| 500 | `#66bc98` | `#7f7d79` | `#ba8641` | `#706c62` |
| 600 | `#3a8d6a` | `#5a5955` | `#88622f` | `#4c4942` |
| 700 | `#306e54` | `#464643` | `#6e4e25` | `#393732` |
| 800 | `#275240` | `#363534` | `#493418` | `#2c2a25` |
| 900 | `#214335` | `#2d2d2b` | `#372711` | `#1b1a17` |
| 950 | `#0e241a` | `#171616` | — | — |

### 1.4 "Morning mist" (T3 — a surface treatment, not a palette)

Frosted chrome for surfaces content scrolls UNDER — sticky page
header, Board tab band, bottom nav / landscape rail, docked
panels: `backdrop-filter: blur(12px) saturate(1.1)` plus the
theme's page color as a tint at a **computed opacity floor** —
`moss-50` at ≥0.92 alpha (light), `moss-950` at ≥0.85 (dark). The
floors make contrast statically certifiable: blur is a convex
average of underlying pixels, so the worst-case blurred backdrop is
bounded by the worst-case solid underlay; compositing the tint at
those alphas over that bound still yields ≥4.5:1 for the weakest
certified chrome text in every one of the four palettes. The mist
is an atmosphere cue at the surface's edges — not translucency you
read through. Content cards stay fully opaque in every theme (their
certified pairings assume solid backgrounds, and text-over-text
ghosting is exactly what the calm/no-alarm identity forbids).
Fallback: under `prefers-reduced-transparency`, when
`backdrop-filter` is unsupported, or when the device opts out, the
same surfaces render solid — visually near-identical since the
tint is ≥85-92% opaque anyway. Offered as an Appearance toggle
orthogonal to palette choice. Inspired by depth-and-light, built
from this app's own vocabulary (dew, not lens optics) — explicitly
NOT an imitation of any platform's glass material.

## 2. Certification evidence (summary)

| Palette | Pairings (AA 4.5) | Worst case | moss-500 guard | canopy-300 on moss-950 |
|---|---|---|---|---|
| Baseline (sanity) | 48/48 | 4.65:1 | holds | 12.07:1 |
| Riverbed | 48/48 | 4.63:1 | holds | 12.02:1 |
| Harvest | 48/48 | 4.73:1 | holds | 12.04:1 |
| Field notes | 48/48 | 5.77:1 | holds | 13.88:1 |

Amber-collision check: no theme family's 500 step within 14° of
amber-500's hue except each theme's ember (by design — the warm
family), and Riverbed widens ember↔amber separation vs baseline.
No family approaches rose (~350°). Composite bases (moss-900 card,
moss-950 page, white, moss-50) re-derived per theme.

## 3. Operator decisions (marked; recommendations stated)

- **D1 — avatars stay frozen.** Recommended: YES (the freeze is a
  documented recognition-stability decision with threat-model
  weight; a member's avatar color not matching their chosen theme
  is a minor, honest cost). If reversed later it is its own PR.
- **D2 — identity assets stay Canopy.** Favicon, PWA icons/splash,
  manifest colors, Electron pre-paint background. Recommended: YES
  — they are the app's identity, served before any preference can
  load; per-theme icon sets would multiply build assets for
  marginal gain.
- **D3 — runtime `<meta theme-color>` update.** Match browser
  chrome to palette+mode (~15 lines in applyTheme/applyPalette +
  a small map; also adds the missing dark-mode value today).
  Recommended: YES in T2 — a mismatched browser chrome bar is the
  one place the theme visibly "leaks".
- **D4 — status colors theme-invariant.** amber/rose/red/indigo
  keep pinned hexes in every theme; their on-theme-surface pairings
  are re-certified per theme (§2 already covers the certified
  ones). Recommended: YES — status must be recognizable across
  every community and theme.
- **D5 — negative-guard parametrization.** Each theme's moss-500
  analog was deliberately designed to keep FAILING light-surface AA
  so the guard stays meaningful; the parametrized suite asserts it
  per theme. If a future theme legitimately clears 4.5:1 there, the
  guard becomes theme-conditional — decide then, not now.
- **D6 — sequencing vs Tailwind 4 (task #179, held).** This plan
  rewrites the same config color lines the TW4 plan's byte-identity
  harness (§8) baselines. Recommended: land themes FIRST (TW4 is
  held anyway), then amend tailwind-4-plan.md in T1: restate the §8
  harness as comparing the RESOLVED variable values per palette,
  and re-check `pageHeaderCompact.test.tsx:54` (asserts config text
  content) against the edited config in T1's gates.
- **D7 — theme scope of kiosk/present + demo.** Gathering screen
  and demo build follow the device's palette (no pinning).
  Recommended: YES (no code either way).

## 4. Phased commits

### T1 — "web: palette variable layer (zero visual change)"

1. `tailwind.config.js`: the four brand families become
   `rgb(var(--canopy-50) / <alpha-value>)` … etc.; `shadow-leaf`
   → `rgb(var(--canopy-900) / 0.04)` form. Stock families
   untouched.
2. `src/index.css`: a `:root { --canopy-50: 240 253 244; … }` block
   defining the Canopy values (RGB triplets, all four families, 42
   variables) — the single source the config references.
3. Fix `InstallGuide.tsx:290` pill → `bg-canopy-700` (§0d).
4. Amend docs/tailwind-4-plan.md §8 harness contract (D6) and
   verify `pageHeaderCompact.test.tsx` still passes (it reads
   config text; update its assertion only if it pinned a color
   line verbatim).
5. **Zero-visual-change verification**: build; grep emitted CSS to
   confirm every `--canopy/moss/ember/bark` variable resolves to
   the baseline hex triplets; spot-check computed styles of
   `.card`, `.btn-primary`, `.input` focus ring, `.band-hairline`,
   a `/60` chip, and `shadow-leaf` in the built app (headless
   Chromium is available).

Gates: full web suite (contrast suite UNCHANGED this phase — its
local hex copies remain the canonical Canopy statement), typecheck,
lint, PWA build, the emitted-CSS grep, desktop+server suites
untouched. Rollback: revert — pure refactor.

### T2 — "web: palette preference + Riverbed/Harvest/Field notes"

1. `src/index.css`: three `[data-palette="…"]` variable blocks from
   the §1.3 tables (RGB triplets).
2. `src/lib/palette.ts` (+ tests): type, `PALETTE_PREFERENCES`,
   guard, `applyPalette` (sets/removes `data-palette` on
   documentElement), `cachePalette` (key `understoria.palette`) —
   cookie-cutter from lib/density.ts.
3. `db/database.ts`: `SETTING_KEYS.palette`; `AppContext.tsx`:
   load/apply/setter/context (6 small edits, same shape as
   density); `AppearanceSection.tsx`: fourth radiogroup with a
   four-swatch preview per option (tiny inline swatches using each
   theme's canopy-600/moss-300/ember-500/bark-400 — rendered from a
   literal map, not the live variables, so previews show the OTHER
   themes while one is active).
4. `index.html` bootstrap: +4 lines (read key, validate against
   allowlist, set attribute) → `scripts/csp-hash.sh` → update BOTH
   Caddyfile CSP lines (:57 clearnet, :121 onion) in the same
   commit.
5. D3 (if yes): theme-color meta runtime update in
   applyTheme/applyPalette from a palette+mode → hex map.
6. **Contrast suite parametrization**: palette-contrast.test.ts
   gains the three theme hex maps; all 48 pairings loop per
   palette with per-palette composite bases; moss-500 negative
   guard asserted per palette; the src class-scan stays global.
7. i18n: `profile.appearance.palette.*` labels en+es ("Canopy",
   "Riverbed", "Harvest", "Field notes" — proper names may stay
   untranslated per existing convention for theme names; es
   translator judgment, parity-gated).

Gates: full web suite (now including ~150 new contrast assertions),
typecheck, lint, parity, build, and a manual pass: switch all four
palettes in both modes on the running app (headless screenshot set
for the PR). Rollback: revert — default "canopy" means absent
preference rows render identically.

### T3 — "web: Morning mist chrome (opt-in)"

Per §1.4: a `mist` boolean appearance toggle (same persistence
pattern; bootstrap + CSP hash again), a `.mist` root class scoping
`backdrop-filter` + tint utilities to the named chrome surfaces,
`prefers-reduced-transparency` + `@supports` fallbacks, tint alphas
at/above the computed floors. Gates: full suite; manual check on a
low-power device profile (CPU-throttled) that scrolling stays
smooth; verify the fallback renders solid. Rollback: revert; the
toggle defaults off.

## 5. Verification matrix

Parametrized contrast suite (48 × 4 + guards) — the merge gate;
emitted-CSS variable grep (T1's zero-change proof); palette.ts unit
tests; AppearanceSection render test (four radiogroups); bootstrap
allowlist behavior (bad localStorage value → no attribute); en/es
parity; full web suite; screenshots of all palettes × modes in the
T2 PR body.

## 6. Named risks

1. **Stale CSP hash** (T2, T3): a bootstrap edit without the
   Caddyfile updates silently disables the FOUC script in
   production — palette/theme flash on every load, no console error
   on the operator's radar. Mitigation: hash change and both
   Caddyfile lines in the same commit; the csp-hash script's output
   pasted into the PR body; operator-guide already documents the
   redeploy step.
2. **TW4 contract drift** (D6): if the held TW4 migration lands
   later, its §8 harness must compare resolved values, not literal
   hexes — amended in T1 so the two plans can't silently disagree.
3. **Alpha-form regression**: a missed `<alpha-value>` conversion
   turns `/60` chips opaque. Mitigation: T1's emitted-CSS grep
   covers every `--brand` variable reference; the 37 distinct
   alpha patterns are enumerated in the audit.
4. **Theme-invariant surfaces read as bugs**: avatars/QR/icons
   staying green under Riverbed will get member questions.
   Mitigation: one Help FAQ line (T2, i18n'd) saying identity
   surfaces don't retheme and why.
5. **Perf of Morning mist on old hardware**: blur is GPU-costly on
   exactly the devices members have. Mitigation: opt-in, off by
   default, solid fallback, CPU-throttled manual gate before merge.

## 7. Explicitly out of scope

Free-form/custom palettes (uncertifiable); per-community themes
pushed from the node (a governance surface, not an appearance
setting — revisit only with a plan of its own); theming the
showcase site; per-theme icons/splash; Tailwind 4 itself.
