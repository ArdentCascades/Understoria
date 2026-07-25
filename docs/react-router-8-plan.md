# React Router 7 → 8 migration — implementation plan

> **Status: PLAN** (code-verified 2026-07-24 against the working
> tree, root lockfile, installed node_modules, and the live npm
> registry + advisory endpoints). Motivation:
> **GHSA-qwww-vcr4-c8h2** (high, CVSS 7.1, no CVE) against
> `react-router >=7.12.0 <8.3.0` — our installed 7.18.1 is in
> range, **no patched 7.x exists**, and the CI
> `npm audit --audit-level=high` job is red on main until we move.
> The vulnerable path (RSC-mode server-action CSRF) is dead code in
> this app — this is red-CI-hygiene + staying current, executed
> carefully. Discipline model: docs/react-router-7-plan.md and
> docs/react-19-plan.md.

## ⚠ OPERATOR DECISION (resolved: approved)

**`apps/web/src/pages/Conversation.tsx` cannot avoid a one-line
change.** The registry has **no react-router-dom 8.x** — the
package was removed in v8 (`latest` on react-router-dom is 7.18.1,
final; changelog: "Remove `react-router-dom` package").
Conversation.tsx line 29 is
`import { Link, useParams, useSearchParams } from "react-router-dom";`
and that specifier must become `"react-router"`.

- **Approved approach: change that one import line**, and do it in
  **Phase 1**, a codemod commit that runs *while still on v7* —
  where it is **provably a runtime no-op**: the installed
  `react-router-dom@7.18.1` is literally
  `export * from "react-router"` (plus `RouterProvider`/
  `HydratedRouter` from `react-router/dom`, which this app never
  imports — verified in `node_modules/react-router-dom/dist/
  index.mjs`). Same symbols, same module, same runtime. The scroll
  machinery (the actual subject of the freeze) is untouched; the
  8 Conversation suites gate the commit.
- **Rejected alternative (documented honestly):** keep all 202
  `"react-router-dom"` imports and add `resolve.alias:
  { "react-router-dom": "react-router" }` to vite.config.ts (covers
  dev/build/vitest) plus `compilerOptions.paths` in tsconfig.json
  (covers `tsc --noEmit`; no eslint import-resolver is in use, so
  lint survives). It works — but it leaves 202 files permanently
  importing a package that is not in package.json, adds
  load-bearing indirection to two config files forever, confuses
  every future tool and grep-driven plan, and makes the frozen
  file's runtime depend on alias correctness — *more* long-term
  risk than a one-line specifier swap whose v7 runtime effect is
  provably nil.
- Doing nothing = staying on 7.18.1 = permanently red audit job.
  Rejected.

## 0. Verified ground truth

- **Registry (queried live):** `react-router` dist-tag `latest` =
  **8.3.0** (line: 8.0.0, 8.0.1, 8.1.0, 8.2.0, 8.3.0).
  `react-router-dom` `latest` = **7.18.1** — **no 8.x exists and
  none will** (removed in v8). Target: **react-router@^8.3.0**.
- **v8.3.0 peers (exact, from registry):** `react: >=19.2.7`,
  `react-dom: >=19.2.7` (react-dom optional). We ship react/
  react-dom **19.2.8** (React-19 migration) ✓.
- **v8.3.0 engines:** `node >=22.22.0`. Local node 22.22.2 ✓; CI
  `setup-node: '22'` floats to latest 22.x ✓; both Dockerfiles
  (`apps/web/Dockerfile`, `apps/server/Dockerfile`) use
  `node:22-bookworm-slim` (floating) ✓. Root `.npmrc` has no
  `engine-strict` (only `install-strategy=hoisted` +
  `public-hoist-pattern[]=*`) — engines is advisory anyway.
- **v8.3.0 dependencies:** exactly `cookie-es ^3.1.1` (new). v7's
  `cookie`/`set-cookie-parser` leave react-router's subtree but
  **stay in the lockfile** via `fastify → light-my-request`
  (server) — do not expect them to disappear.
- **v8 is ESM-only** (`"type": "module"`, `sideEffects: false`),
  export map: `.`, `./dom`, `./internal`, `./package.json`. Fine
  for this toolchain: apps/web is `"type": "module"`, Vite 8.1.5
  (rolldown), vitest 4.1.10, TS 5.6.3 `moduleResolution:
  "bundler"`, tsconfig `target: ES2022` (matches v8's ES2022
  build). Zero `require()` of the router anywhere.
- **Declared ONCE:** `"react-router-dom": "^7.18.1"` in
  `apps/web/package.json`; zero router references anywhere else in
  the repo outside `apps/web/src` (+ lockfile/docs). Installed:
  one hoisted copy each, `react-router-dom@7.18.1 →
  react-router@7.18.1` (exact-pinned).
- **Import inventory (re-counted today):** **202 files**, each
  with exactly one single-statement named import
  `from "react-router-dom"`; the string `react-router-dom` occurs
  **exactly 202 times in src** — no comments, subpaths,
  `import type`, namespace/default imports, or `vi.mock` of the
  router anywhere. Symbol tally (349 imports): MemoryRouter ×114
  (all in the 114 router-using test files), Link ×64, Routes ×48,
  Route ×48, useNavigate ×28, useLocation ×18, useParams ×10,
  useSearchParams ×8, Outlet ×4, useMatch ×3, BrowserRouter ×1
  (main.tsx, no props), Navigate ×1, NavLink ×1, useNavigationType
  ×1 (ScrollToTop). **All 14 symbols verified present in
  react-router@8.3.0's root export** (read the published
  `dist/production/index.d.ts` from the tarball). None of our
  imports are the two `/dom`-only exports (RouterProvider/
  HydratedRouter).
- Route shape unchanged since the v7 plan: flat absolute paths;
  nesting only Board `post/:id`, Calendar `event/:eventId`,
  Messages `:memberKey`; one `path="*"`; zero relative `to=`
  targets (re-audited: every template-literal target starts with
  `/`; the variable-fed sites are the same deepLink/href props the
  v7 plan audited as absolute). `generatePath`/`href()`/
  `matchPath`/`useRoutes`/`createRoutesFrom*`/`RouterProvider`:
  all still **zero** usage. No `future` prop anywhere (removed in
  v7 Phase 2 as planned).
- Working tree clean; baseline `npm audit`: **exactly 2 highs**
  (react-router + react-router-dom-via), nothing else. Full web
  suite last ran 3441 tests.

## 1. The advisory — honest exposure

- **GHSA-qwww-vcr4-c8h2** (confirmed against github.com/advisories
  and the live `npm audit` output): high, CVSS 7.1, CWE-352, no
  CVE. Affected `react-router >=7.12.0 <8.3.0`; **patched only in
  8.3.0** ("Harden RSC CSRF code paths"). CSRF bypass allowing
  server-action execution before the 400 response — RSC mode /
  experimental server-component APIs only.
- **Dead code here:** this app is a pure client-side declarative
  SPA — no SSR, no RSC, no server actions, no RouterProvider, no
  data router. The vulnerable code path is unreachable. The real
  motivation is the red `npm audit --audit-level=high` CI job +
  staying on a supported line.
- npm's `fixAvailable` suggestion (downgrade to
  react-router-dom@7.11.0) is **actively harmful** — 7.11.0
  reintroduces the two `<7.18.0` open-redirect advisories the v7
  migration cleared. Ignore it.
- **8.3.0 itself is clean:** the registry bulk advisory endpoint
  returns `{}` for `react-router@8.3.0` and `cookie-es@3.1.1` —
  no other advisory affects the target.

## 2. v8 breaking surface for THIS app

From the published v8.0.0 changelog (read from the 8.3.0 tarball),
every major change audited against our usage:

| v8.0.0 breaking change | Applies here? |
|---|---|
| **Remove `react-router-dom` package** | **YES — the whole migration.** All imports move to `react-router` (§3). |
| Min React 19.2.7 | Satisfied (19.2.8). |
| Min Node 22.22.0 | Satisfied everywhere (§0). |
| ESM-only packages | Satisfied (§0); no CJS consumers. |
| Build target ES2020→ES2022 | Satisfied (tsconfig/browsers already ES2022). |
| Remove `future.v8_trailingSlashAwareDataRequests` / `v8_passThroughRequests` / `v8_middleware` flags | Framework/data mode only — we set no flags (grep: 0). |
| `meta` `data`→`loaderData`, `hasErrorBoundary` removal, middleware always-on, `AppLoadContext` removal (8.0.1) | Data/framework mode — zero usage. |

**v8 declarative mode has no renamed or removed APIs**: all 14
used symbols exist unchanged; `useSearchParams` still returns
`[URLSearchParams, SetURLSearchParams]` (verified in the shipped
d.ts); `NavigationType` is still the `"PUSH"|"POP"|"REPLACE"`
action enum (ScrollToTop's `navType === "PUSH"` unaffected);
`LinkProps`/`NavLinkProps`/`NavigateOptions`/`SetURLSearchParams`
types all still exported (we import no router types anyway — tsc
is the backstop). The shipped `docs/upgrading/future.md` in 8.3.0
states **v8 has no future flags and no planned breaking changes**
(v9 ~mid-2027, Node 24). 8.1.0–8.3.0 patch/minor deltas checked:
route-ranking fix for optional/static-suffix segments (we have
none), NavLink `pending` trailing-slash fix (declarative mode has
no pending state), `href`/`generatePath` RFC-3986 encoding change
(zero usage). **No behavioral delta reaches this app's declarative
surface.**

## 3. Import strategy — the codemod

Because the string `react-router-dom` appears in src exactly 202
times, all on import lines, the codemod is one mechanical, exact
substitution across 202 files (201 + Conversation.tsx):

```sh
cd apps/web
grep -rl 'from "react-router-dom"' src \
  | xargs sed -i 's/from "react-router-dom"/from "react-router"/'
```

No name collisions: nothing in src imports from a bare
`"react-router"` today (0 hits), and no local module named
react-router exists. Every imported symbol is exported from
react-router@8's root (§0). **Run the codemod in Phase 1, still on
v7**, where `react-router-dom` → `react-router` is runtime-
identical by construction (the -dom shim is `export * from
"react-router"`). This puts the only Conversation.tsx line-change
in a provably-inert commit, and makes the later version bump a
2-file diff.

## 4. Conversation.tsx + ScrollToTop / docked panels (freeze analysis)

Conversation.tsx's router surface is Link ×2, useParams (the
`key={memberKey}` remount), useSearchParams (`?q=`/`?about=`) —
line 29 only. Phase 1 changes that specifier and **nothing else in
the file**; under v7 both specifiers resolve to the same module
object, so no behavior can change in that commit. Phase 2 changes
the router version for every file equally; the v7 plan's scroll
analysis (Dexie-polled messages + ref-based guards, none of it
router state) carries over unchanged because v8 alters no
declarative navigation, hook, or commit-timing semantics (§2 —
v7's startTransition behavior is already the v8 behavior).
ScrollToTop (`useNavigationType`, effect-based, PUSH-only) and the
Board `post/:id` / Calendar `event/:eventId` docked-panel nested
routes: same declarative matching and post-commit effect ordering
in v8 — the v8 changelog contains zero changes to declarative
matching/relative-path/splat semantics (and we have zero relative
targets and one absolute-only splat regardless).

## 5. jsdom / vitest interaction

The 114 MemoryRouter test files render plain
`<MemoryRouter initialEntries=...>` trees through the hand-rolled
`createRoot`+`act` harness — no `vi.mock("react-router*")`
anywhere (0 hits), no data routers, no RouterProvider. The known
v7/v8-era test issues (RouterProvider-in-jsdom, loader
createClientSideRequest, module-mock undefined) all require APIs
this app doesn't use. v8 ESM-only is transparent under vitest 4's
vite pipeline. Expected test churn: **zero** beyond the import
specifier already handled in Phase 1.

## 6. Phases

**Phase 0 — baseline (no commit).** From repo root: `npm run
typecheck`, full web suite (`cd apps/web && npx vitest run` —
record count, expect 3441), `npm run build`, `npm audit` (record
the 2 highs), `npm ls react-router react-router-dom` (one copy
each).

**Phase 1 — commit "web: import react-router directly (v8 prep,
no-op under v7)"** — 203 files, still on v7:
1. The §3 sed across 202 src files (includes the one-line
   Conversation.tsx change — **operator-approved**).
2. Dependency swap, from repo root:
   `npm uninstall --workspace @understoria/web react-router-dom`
   then `npm install --workspace @understoria/web
   react-router@^7.18.1` (promotes the already-installed 7.18.1 to
   a direct dep; react-router-dom leaves the lockfile).
Gates: `npm --workspace @understoria/web run typecheck`; full web
suite from apps/web (same count as Phase 0); `npm --workspace
@understoria/web run lint`; `git diff --stat` shows exactly 202
one-line src changes + 2 manifests; `grep -r 'react-router-dom'
apps/web/src` → 0. Runtime risk: nil by construction (§3).
Rollback: `git revert` — fully independent of Phase 2.

**Phase 2 — commit "chore(deps): react-router 7.18.1 → 8.3.0"** —
2 files (`apps/web/package.json` + root `package-lock.json`):
```sh
npm install --workspace @understoria/web react-router@^8.3.0
```
Lockfile expectation: react-router 8.3.0, `cookie-es` 3.1.x added;
`cookie`/`set-cookie-parser` remain only under light-my-request;
no other movement. Zero source changes expected (Phase 1
pre-cleared everything; §2 found no API surface). Gates, in order,
from repo root unless noted:
1. `npm run shared:build`
2. `npm --workspace @understoria/web run typecheck`
3. Full web suite: `cd apps/web && npx vitest run` (Phase-0 count,
   0 unhandled rejections)
4. `npm --workspace @understoria/web run lint`
5. PWA build: `npm --workspace @understoria/web run build`
6. Root `npm test` (server + desktop + shared, incl. the
   invite-flow e2e)
7. `npm audit --audit-level=high` → **0 vulnerabilities** (the
   point of the exercise); `npm audit` → 0 total
8. `npm ls react-router` → single 8.3.0 copy;
   `npm ls react-router-dom` → empty
9. Manual smoke (§7)
Likely failure signature if any: none predicted; if a test fails
the shape would be an un-`act`ed async flush — fix the TEST, never
app code, and **never Conversation.tsx**.
Rollback: revert Phase 2 alone → v7.18.1 with direct react-router
imports (valid, tests green, audit red again); revert both commits
→ exact pre-migration tree.

## 7. Verification matrix

Highest-signal suites first: all 8 Conversation.* (esp. polling's
no-re-scroll guard and search-match scroll), Board.postPanel,
Calendar(+filtersDisclosure), EventDetail.back, pageHeaderCompact,
CommandPalette (splat mount), BottomNav (NavLink active state),
Layout, Messages + MessagesSplit + Messages.live,
ProjectDetail.deeplink, InviteAccept, Profile.nav, the print
suites; then the full 320-file suite + CI gates. Manual smoke:
Board panel open/close with `?tab=` preserved; Calendar panel;
split-pane conversation switch + `?q=` deep link + bottom-follow
vs new-messages chip; palette + me-menu nav; ScrollToTop (top +
`#main` focus on PUSH, Back preserves position); `/invite#token`
cold load; `/my-tasks` redirect; a print route; 404 splat;
onboarding gate; dev console clean of router warnings. Post-deploy:
service worker serves the new bundle (NetworkFirst — no special
handling).

## 8. Audit trail — exact commands (all run for this plan, 2026-07-24)

- Registry: `npm view react-router versions dist-tags`
  (latest=8.3.0; -dom latest=7.18.1, no 8.x);
  `npm view react-router@8.3.0 peerDependencies
  peerDependenciesMeta dependencies engines type sideEffects
  exports` (§0 values).
- Advisory: `npm audit --json` (2 highs, range
  `>=7.12.0 <8.3.0`); GHSA-qwww-vcr4-c8h2 page (CVSS 7.1, patched
  8.3.0, RSC-only); registry bulk advisory endpoint
  with `{"react-router":["8.3.0"],"cookie-es":["3.1.1"]}` → `{}`.
- Export surface: streamed the 8.3.0 tarball
  (`curl -sL $(npm view react-router@8.3.0 dist.tarball) | tar
  -xzOf - package/dist/production/index.d.ts`) — all 14 symbols in
  the root export; `package/CHANGELOG.md` (v8.0.0 majors);
  `package/docs/upgrading/future.md` (no v8 future flags).
- Inventory (apps/web): `rg -c 'react-router-dom' src` summed =
  202; files with the import = 202; symbol tally via
  `rg -oU 'import\s*\{[^}]*\}\s*from "react-router-dom"'` split on
  commas (§0 counts); `rg 'import type .* "react-router-dom"|
  require\(.react-router|react-router-dom/|from "react-router"'`
  → 0; `rg 'vi\.mock\(.react-router'` → 0; `rg 'future=|future:'
  src` → 0; `rg 'generatePath|matchPath|href\(|useRoutes|
  RouterProvider' src` → 0; relative-target audit per §0.
- Shim proof: `node_modules/react-router-dom/dist/index.mjs` =
  `export * from "react-router"` + RouterProvider/HydratedRouter.
- Environment: `node -v` 22.22.2; ci.yml `node-version: '22'`;
  both Dockerfiles `node:22-bookworm-slim`; `.npmrc` no
  engine-strict; `npm ls cookie set-cookie-parser` (light-my-request
  keeps them).

## 9. Named risks

1. **Conversation.tsx freeze** — the unavoidable 1-line specifier
   change rides the provably-inert Phase-1 commit (§4); operator
   approved; the 8 Conversation suites are the guard.
2. **Hidden declarative behavior delta in v8** — changelog-audited
   to zero (§2); residual risk covered by 3441 tests + §7 smoke.
   Any regression bisects cleanly: Phase 1 is inert, so it's the
   bump.
3. **ESM-only breakage** — no CJS consumers exist; vite/vitest/TS
   config verified compatible. Would fail loudly at gate 2/3.
4. **Engines drift** (`node >=22.22.0`) — every environment floats
   on 22.x ≥ 22.22 today; a stale Docker cache or old local node
   would only warn (no engine-strict). Note for the flash-drive/
   offline installs: they consume the built bundle, not
   node_modules.
5. **Lockfile surprises** — expected delta is precisely:
   −react-router-dom, react-router 7.18.1→8.3.0, +cookie-es;
   anything else must be investigated, not shipped. `npm ls` gates
   make a dual-router tree impossible.
6. **Rollback** — Phase 2 is a 2-file revert (accepting the red
   audit job again); Phase 1+2 revert restores the pre-migration
   tree exactly. No data/storage/URL-format migration anywhere.
