# eslint 9 → 10 + globals 15 → 17 — implementation plan (Tier 3.4)

> **Status: SHIPPED** (eslint 10.8.0 + globals 17.7.0 landed in
> PR #534; plan was code-verified 2026-07-25 against the working
> tree, root lockfile, installed node_modules, the live npm
> registry, and the official migrate-to-10 doc read from the
> eslint/eslint repo). Discipline model: docs/react-19-plan.md /
> docs/i18next-plan.md. Honest sizing up front: **this upgrade is
> trivial for this repo** — the entire lint surface is ONE flat
> config in ONE workspace enabling ONLY jsx-a11y rules, and every
> eslint 10 breaking change greps to zero applicable usage. The
> expected diff is 3 files (apps/web/package.json, root
> package.json, root lockfile) and **zero source or config lines**.
> The one real wrinkle — eslint-plugin-jsx-a11y's peer range caps
> at eslint ^9 — is solved with a root `overrides` entry whose
> resolution behavior was proven by an isolated `npm install
> --package-lock-only` experiment (§2). The headline is the audit:
> this upgrade clears **exactly 3 of the current 23 high findings**
> (quantified in §3), and NO override trick can clear the jsx-a11y
> finding itself — both candidate overrides were proven
> runtime-broken at the CJS-interop level (§3).

## 0. Verified ground truth

- **Lint exists in exactly ONE workspace.** `apps/web` is the only
  package with an eslint config (`apps/web/eslint.config.js`, flat,
  ESM), the only one with a `lint` script (`"lint": "eslint ."`),
  and the only one declaring eslint-family devDeps. server /
  desktop / site / shared / root: zero eslint config files, zero
  lint scripts, zero eslint devDeps. No `.eslintrc*` anywhere, no
  `.eslintignore` anywhere, no `/* eslint-env */` comments anywhere
  in apps/packages/scripts/deploy. CI runs lint once:
  `.github/workflows/ci.yml:50` → `npm run lint
  --workspace=@understoria/web`. No other eslint invocation exists
  in any package.json script, CI file, or scripts/ dir.
- **The config, read in full** (apps/web/eslint.config.js): two
  objects — a global-ignores block (dist, node_modules, `**/*.test.*`,
  src/test) and one block for `src/**/*.{ts,tsx,jsx}` with parser
  `@typescript-eslint/parser`, `globals.browser`, and rules =
  spread of `jsxA11y.configs.recommended.rules` **only**. No
  `@eslint/js`, no `eslint:recommended`, no core rules, no
  typescript-eslint rules, no custom rules, no FlatCompat, no
  `--ext`/`--flag`/`ESLINT_FLAGS` anywhere. This makes almost the
  entire v10 breaking surface structurally unreachable.
- **Installed (root lockfile is the only lockfile):** eslint
  9.39.5, globals 15.15.0 (spec ^15.12.0), eslint-plugin-jsx-a11y
  6.10.2, @typescript-eslint/parser 8.65.0 (spec ^8.15.0),
  @eslint/js 9.39.5 + @eslint/eslintrc 3.3.6 + @eslint/config-array
  0.21.2 (all transitive via eslint only — lockfile-verified: no
  other dependent).
- **Registry (queried live 2026-07-25):**
  - eslint dist-tags: `latest: 10.8.0`, `maintenance: 9.39.5`,
    `next: 10.0.0-rc.2` (stale tag — ignore). 10.0.0 published
    2026-02-06; 10.8.0 published 2026-07-24 — a mature line, 8
    minors in. **Target: eslint ^10.8.0.**
  - eslint@10.8.0 deps: `minimatch ^10.2.5`,
    `@eslint/config-array ^0.23.5` (which deps `minimatch
    ^10.2.4`), and — decisive for the audit — **no `@eslint/js` and
    no `@eslint/eslintrc` dependency at all** (eslintrc support
    removed). Engines: `node ^20.19.0 || ^22.13.0 || >=24`.
  - globals latest: **17.7.0** (installed 15.15.0; majors 16, 17 in
    between). Tarball unpacked and inspected: still CJS
    `module.exports = require('./globals.json')` (our default
    import works), `browser` key present with 1191 globals (15.15.0
    has 1128 — pure additions).
  - eslint-plugin-jsx-a11y latest: **still 6.10.2**, last publish
    2024-10-26, no v7 / no beta / no dist-tag beyond a v5-backport.
    Peer: `eslint ^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9` — does
    NOT admit 10. Dep: `minimatch ^3.1.2`. **No eslint-10-ready or
    minimatch-fixed release exists upstream. We keep 6.10.2.**
  - @typescript-eslint/parser: installed 8.65.0 IS registry latest;
    its peer (verified in BOTH registry metadata and the installed
    package.json) is `eslint ^8.57.0 || ^9.0.0 || ^10.0.0` —
    **already admits eslint 10; no bump, no typescript-eslint
    migration needed.** (typescript peer `>=4.8.4 <6.1.0`; TS 5.6.3 ✓.
    The typescript-eslint meta-package and eslint-plugin are not
    installed and not used.)
  - All lockfile peer-dependents of eslint enumerated: the parser
    (^10 ✓), @eslint-community/eslint-utils (`>=8.0.0` ✓), and
    jsx-a11y (^9 ✗ — the single blocker, handled in §2).
- **Node floor is already met everywhere eslint runs:** CI
  setup-node `'22'` (resolves current 22.x ≥ 22.13), dev sandbox
  v22.22.2, npm 10.9.7 (`overrides` needs npm ≥ 8.3 ✓). No engines
  fields to update. jiti irrelevant (config is .js, not .ts).
- **Audit baseline:** `npm audit` = **23 high, 0 everything else**,
  ALL 23 via one advisory — GHSA-mh99-v99m-4gvg, brace-expansion
  vulnerable `<=5.0.7` (i.e. every release before 5.0.8, including
  the whole 1.x line that minimatch@3 pins) — cascading through 9
  legacy minimatch instances. CI's audit job is informational
  (continue-on-error) but gates at high, so it is currently red
  and stays red-but-smaller after this (§3).

## 1. eslint 10 breaking surface vs THIS repo (migrate-to-10.0.0.md read verbatim; each item checked)

| v10 change | Exposure here |
|---|---|
| Node <20.19 / 21 / 23 dropped | CI + dev on 22.x ≥22.13 ✓ |
| `eslint:recommended` adds 3 rules | Not extended anywhere — zero impact |
| Config lookup now from linted file upward | `eslint .` in apps/web; nearest config from any linted file is apps/web/eslint.config.js — identical result. No root config to shadow, no `v10_config_lookup_from_file` flag anywhere |
| eslintrc format removed | Flat since inception; zero `.eslintrc*`, zero `ESLINT_USE_FLAT_CONFIG`, zero FlatCompat |
| JSX references now tracked (scope) | Affects only scope rules (no-unused-vars/no-undef); we enable ZERO core rules; jsx-a11y rules don't consume scope analysis |
| `eslint-env` comments error | grep across all workspaces: 0 |
| jiti <2.2 dropped | Config is plain .js |
| minimatch 10 / POSIX classes in globs | Our globs (`dist/**`, `src/**/*.{ts,tsx,jsx}`, `**/*.test.ts` …) contain no `[…:…]` bracket expressions — semantics unchanged |
| stylish formatter chalk→styleText | Cosmetic; no NO_COLOR/FORCE_COLOR conventions in CI |
| radix / func-names / no-invalid-regexp / no-shadow-restricted-names option changes | None of these rules configured |
| RuleTester / fixer / Program-range / ScopeManager / removed context+SourceCode members | Plugin-author surface. We author no rules. **eslint-plugin-jsx-a11y 6.10.2's shipped lib grep-verified clean**: zero uses of `context.getSourceCode/getFilename/getCwd/getPhysicalFilename/getScope/getAncestors/parserOptions/parserPath` and zero removed SourceCode methods (its two `parserOptions` hits are its own exported config objects, not context access). Same sweep on jsx-ast-utils: clean. Functional compat verified at source level — the peer cap is metadata-only conservatism |

**Conclusion: zero applicable breaking changes; expected new lint
violations: none.** The only rules that run are jsx-a11y's, from the
same plugin version, on the same parser, over the same file set.
Codemods (`@eslint/v9-to-v10`) are unnecessary — there is nothing
for them to rewrite.

## 2. The one wrinkle: jsx-a11y's peer cap — solved with a root override (empirically proven)

Plain `npm install` with eslint@10 fails ERESOLVE (reproduced in an
isolated experiment: `peer eslint@"^3 || … || ^9" from
eslint-plugin-jsx-a11y@6.10.2`). Fix: add to the **root**
package.json (overrides only apply from the root in a workspaces
monorepo):

```json
"overrides": {
  "eslint-plugin-jsx-a11y": { "eslint": "^10.8.0" }
}
```

Proven by a scratch `npm install --package-lock-only` with the exact
four devDeps: without overrides → ERESOLVE; with the entry above →
clean resolution to eslint 10.8.0 + jsx-a11y 6.10.2 + parser 8.65.0
+ globals 17.7.0, `@eslint/eslintrc` **gone from the tree**, and the
only minimatch@3 left in the eslint family being jsx-a11y's own.
(Literal `"^10.8.0"`, not `"$eslint"` — the `$`-reference form
requires eslint to be a dependency of the root package, and ours
lives in apps/web.) `--legacy-peer-deps` rejected: per-invocation,
undocumented-in-tree, and breaks future plain `npm install` runs.
**Maintenance note:** when jsx-a11y finally ships an
eslint-10-compatible release, bump it and delete the override in the
same commit.

## 3. Audit quantification (the headline, exact)

- **Cleared by this upgrade — exactly 3 of 23 high:** `eslint`
  (vulnerable range ends 10.0.0-rc.2; stable 10 deps minimatch
  ^10.2.5), `@eslint/config-array` (→0.23.5, minimatch ^10.2.4),
  `@eslint/eslintrc` (unfixable at ≥0.1.1 — cleared by **removal**:
  eslint 10 no longer depends on it, and the lockfile shows no other
  dependent). Expected post-upgrade: **20 high**.
- **Stays red — 20, none of them ours to fix here:**
  `eslint-plugin-jsx-a11y` + the shared `minimatch` /
  `brace-expansion` findings (jsx-a11y still pins minimatch ^3.1.2 →
  brace-expansion ^1.1.7), and the electron/workbox tooling chains:
  @electron/asar, @electron/universal, dir-compare, glob, rimraf,
  temp, electron-winstaller, app-builder-lib, dmg-builder,
  electron-builder, electron-builder-squirrel-windows, filelist,
  jake, ejs, @trickfilm400/rollup-plugin-off-main-thread,
  workbox-build, vite-plugin-pwa.
- **Why no override can clear the jsx-a11y finding — both routes
  empirically disproven** (do NOT let a future "quick fix" PR try
  them):
  1. *Override jsx-a11y's minimatch to ≥10.2.3:* jsx-a11y calls
     `_interopRequireDefault(require("minimatch"))["default"](…)`
     (lib/util/mayContainChildComponent.js:8,
     mayHaveAccessibleLabel.js:9). minimatch@10's CJS build sets
     `__esModule: true` with **no `default` export** (verified
     against the installed root copy: `typeof m.default ===
     'undefined'`), so the call site becomes `undefined(...)` —
     TypeError the moment `label-has-associated-control` runs.
  2. *Override nested brace-expansion to 5.0.8 under minimatch@3:*
     minimatch@3 does `var expand = require('brace-expansion');
     expand(...)`; brace-expansion@5's CJS build exports only named
     `{ EXPANSION_MAX, EXPANSION_MAX_LENGTH, expand }` with no
     callable module/default (verified against the installed 5.0.8
     copy) — same TypeError class.
  The finding clears only when upstream jsx-a11y modernizes its
  minimatch usage. Track it; don't force it.

## 4. Phases

**Phase 0 — baseline (no commit).** From root: `npm --workspace
@understoria/web run lint` (green), `npm run typecheck`, `npm test`,
`npm audit` recorded verbatim (23 high, the §3 list).

**Phase 1 — the ONLY commit: "eslint 9.39.5 → 10.8.0, globals
15.15.0 → 17.7.0 (jsx-a11y peer override)"**
1. Root package.json: add the `overrides` block from §2 (root
   currently has no overrides field).
2. apps/web/package.json devDeps: `"eslint": "^10.8.0"`,
   `"globals": "^17.7.0"`. Everything else untouched
   (@typescript-eslint/parser stays ^8.15.0 → resolves 8.65.0;
   eslint-plugin-jsx-a11y stays ^6.10.2).
3. `npm install` from root. **Expected source/config diff: zero
   lines.** apps/web/eslint.config.js is untouched.

Gates, in order, from root unless noted:
1. Lockfile shape: `node_modules/@eslint/eslintrc` absent;
   `node_modules/eslint/node_modules/minimatch` absent;
   `@eslint/config-array` ≥0.23.5; `npm ls eslint` shows a single
   10.8.0 with no invalid markers.
2. `cd apps/web && npx eslint --version` → v10.8.0.
3. `npm --workspace @understoria/web run lint` → **zero
   violations, zero new warnings** (§1 predicts none; if any rule
   newly fires it is a plan miss — stop and diagnose rather than
   blanket-disabling; the a11y error floor in the config header is
   policy).
4. `npm run shared:build` && `npm --workspace @understoria/web run
   typecheck` (lint config can't affect types; run anyway per
   tier discipline).
5. Full web suite from apps/web: `npx vitest run` (same counts as
   Phase 0).
6. `npm test` at root; `npm run build` (PWA production build).
7. `npm audit` → **20 high**, cleared entries exactly {eslint,
   @eslint/config-array, @eslint/eslintrc}, nothing new.

Rollback: `git revert` of the single commit restores eslint 9.39.5
/ globals 15.15.0 / the pre-existing lockfile exactly. No cache,
config, or state migration exists (delete any stray
`.eslintcache` — none is committed).

**Out of scope (explicitly):** the 20 remaining audit findings
(electron-builder/workbox chains — separate tiers), adopting
@eslint/js or core rules, typescript-eslint rule adoption, jsx-a11y
major-if-ever, `eslint-plugin-react-hooks`/`react-refresh`
(never used here), lint for other workspaces.

## 5. Named risks

1. **Override forces jsx-a11y beyond its declared peer.** Mitigated
   by source-level verification (§1: zero removed-API usage in its
   shipped lib) and by gate 3 actually executing every recommended
   rule over all 361 lintable source files. Residual: a runtime
   path grep can't see — the lint run is the proof; failure mode is
   a loud crash, not silent under-linting.
2. **globals 15→17.** Only consumed as `languageOptions.globals =
   globals.browser`, and since no scope-dependent rule (no-undef
   etc.) is enabled, the globals map cannot change any lint result
   — the only failure mode would be import/shape breakage, ruled
   out by tarball inspection (§0).
3. **Config-lookup algorithm change** — theoretical monorepo
   hazard; here every linted file sits under apps/web with the
   config at that root and no competing config above it (verified:
   the only non-node_modules eslint.config.* in the repo).
4. **Upstream drift**: jsx-a11y ships v7 with its own rule changes
   someday — that's a NEW migration (recommended-set diffs against
   our spread of `configs.recommended.rules`), not a silent
   follow-on. The override makes the pin explicit until then.
5. **Rollback** is a single-commit revert; nothing persists.

## 6. Audit trail — exact verification commands

- Inventory: `Glob **/eslint.config.*` (1 non-node_modules hit);
  `ls apps/*/.eslintrc* .eslintrc*` (none); `grep -rn eslint-env
  apps packages scripts deploy` (0); grep of all workspace
  package.jsons for lint scripts/eslint deps (apps/web only);
  ci.yml read in full (lint at line 50, audit job informational).
- Registry: `npm view eslint dist-tags` / `npm view eslint@latest
  version dependencies engines`; `npm view @eslint/config-array@latest
  dependencies`; `npm view @eslint/eslintrc@latest dependencies`
  (still minimatch ^3.1.5 — moot, it leaves the tree); `npm view
  eslint-plugin-jsx-a11y dist-tags versions time.modified peerDependencies
  dependencies`; `npm view @typescript-eslint/parser@latest
  peerDependencies`; `npm view globals versions`; globals@17.7.0
  tarball streamed and index.js + globals.json inspected;
  `npm view eslint@10.8.0 time` (10.0.0 = 2026-02-06).
- Migrate doc: raw.githubusercontent.com/eslint/eslint/main/docs/src/use/migrate-to-10.0.0.md, every listed change mapped in §1.
- Lockfile: node walk of package-lock.json for all `*/minimatch`
  instances (9 legacy@3/5/9 + root 10.2.5) and all
  dependents/peer-dependents of eslint, @eslint/eslintrc,
  @eslint/config-array, @eslint/js, globals.
- Interop proofs: `require()` of installed minimatch@10.2.5 and
  brace-expansion@5.0.8 inspected for `default`/callable shape
  against jsx-a11y's and minimatch@3's exact call sites (§3).
- Resolution proof: isolated scratch package.json (the four exact
  devDeps) + `npm install --package-lock-only` without overrides
  (ERESOLVE captured) and with the §2 override (clean; lock
  versions and minimatch layout confirmed). The repo tree was not
  touched.
- Audit: `npm audit --json` parsed — 23 high enumerated with
  ranges, via-chains, and fixAvailable per package.
