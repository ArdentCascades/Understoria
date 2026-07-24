# React 18.3.1 → 19 migration — implementation plan

> **Status: PLAN** (code-verified 2026-07-24 against the working
> tree, root lockfile, installed node_modules, and the live npm
> registry). Discipline model: docs/react-router-7-plan.md.
> Philosophy: minimal diff — the app must keep working with the
> smallest possible churn; forwardRef-style codemods do not apply
> here (there is nothing to codemod); type fixes only where
> @types/react 19 forces them.

## 0. Verified ground truth

- **Declared ONCE.** `react`/`react-dom` `^18.3.1` and
  `@types/react` `^18.3.12` / `@types/react-dom` `^18.3.1` appear
  only in `apps/web/package.json`. Verified zero react declarations
  in `apps/site` (static Vite+Tailwind, no React at all),
  `apps/desktop` (Electron 43.2.0, main-process only, no React),
  `packages/shared` (framework-free), `apps/server`, and the root
  package.json (no overrides/resolutions). No `apps/web`
  package-lock.json exists (removed in PR #389) — the root lockfile
  is the only one. `npm ls react react-dom`: **one physical hoisted
  copy each, everything deduped** (18.3.1 / 18.3.1; installed types
  18.3.31 / 18.3.7).
- **Registry (queried live): latest stable is react 19.2.8,
  react-dom 19.2.8, @types/react 19.2.17, @types/react-dom 19.2.3.**
  19.3 exists only as canaries. react-dom@19.2.8 peers
  `react: ^19.2.8` and depends on `scheduler ^0.27.0`; react@19.2.8
  has zero deps (18.3.1's `loose-envify` chain drops from the tree).
  @types/react-dom@19.2.3 peers `@types/react: ^19.2.0`.
- **Peer compatibility of every React-adjacent dep** (from INSTALLED
  package.json files): react-router-dom 7.18.1 + react-router 7.18.1
  (`react >=18` ✓), dexie-react-hooks 4.4.0 (`react >=16` ✓),
  react-i18next 15.7.4 (`react >= 16.8.0` ✓; i18next 23.16.8 has no
  react peer — the "majors 25/16" assumption was wrong, verified),
  @dnd-kit/core 6.3.1 / sortable 10.0.0 / utilities 3.2.2
  (`react >=16.8.0` ✓), @vitejs/plugin-react 6.0.4 (**no react peer
  at all** — peers are vite ^8 + optional babel plugins).
  **No peer conflict, no expected npm warning, no
  --legacy-peer-deps.** Grep of `SECRET_INTERNALS` across
  node_modules/react-router{,-dom}, dexie-react-hooks, react-i18next,
  @dnd-kit: **zero hits**; dexie-react-hooks dist also contains no
  `useSyncExternalStore` (it is plain useState/useEffect).
- Toolchain: Vite 8.1.5 (rolldown), vitest 4.1.10, jsdom 29.1.1,
  TypeScript 5.6.3, tsconfig `jsx: "react-jsx"` (automatic runtime
  already), `moduleResolution: "bundler"`. CI: Node 22; gates =
  workspace typecheck, web lint, server build, root `npm test`
  (includes the invite-flow e2e), PWA build, `npm audit
  --audit-level=high` (informational job). **Current `npm audit`:
  0 vulnerabilities — the migration must keep it at 0.**
- `apps/server` and `apps/desktop` tsconfigs pin
  `"types": ["node"]` — the hoisted @types/react bump cannot leak
  into their compiles. Lockfile change scope: react, react-dom,
  scheduler, @types/react, @types/react-dom (+ loose-envify/js-tokens
  removal) — nothing else.
- react-router v8 is now released (**8.3.0**, peer
  `react >=19.2.7`): satisfied by 19.2.8, so v8 becomes *unblocked
  after* this migration — **explicitly OUT OF SCOPE here**.

## 1. Removed/deprecated API sweep — this app is already clean

Every React-19-removed API greps to **zero** in `apps/web/src`
(commands in §8): `ReactDOM.render` 0, `hydrate`/`hydrateRoot` 0
(all "hydrate" hits are prose/local state names — verified
individually), `unmountComponentAtNode` 0, `findDOMNode` 0,
`react-dom/test-utils` 0 (act comes from `"react"` everywhere, see
§3), string refs 0 (every `ref=` site uses `ref={…}` — audited the
full list), `defaultProps` 0, `propTypes` 0, legacy context
(`contextTypes`/`getChildContext`) 0, `element.ref`/`.props.ref` 0,
`React.Children` 0, `flushSync` 0, `unstable_*` 0, module federation
of internals 0. **forwardRef: zero components use it** — the "keep
forwardRef" constraint is vacuously satisfied; no ref-as-prop work
exists. One class component (`ErrorBoundary`, uses
`getDerivedStateFromError`/`componentDidCatch` — both fine in 19).
Concurrent-feature surface: `useId` ×2 (PairDevicePassphraseEntry,
MemberAvatar — format of generated ids changes in 19 (`«r0»` style);
neither is asserted on in tests, verified), `useTransition`/
`useDeferredValue`/`useSyncExternalStore` 0, `Suspense`/`React.lazy`
0 (App.tsx routes are static imports — re-verified). `createPortal`
from `react-dom` ×2 (ConfirmDialog, MeMenu) — unchanged in 19.

## 2. @types/react 19 churn — verified against the actual 19.2.17 d.ts

Pulled the @types/react@19.2.17 tarball and read `index.d.ts`; each
claim below is from that file, cross-checked against our greps:

- **`useRef` now requires an argument** (all three overloads take
  `initialValue`). Our exposure: **0 of 119 `useRef` calls are
  argument-less** (`useRef()` and `useRef<T>()` both grep to 0).
  No churn.
- **`RefObject<T>` is now `{ current: T }`** (mutable, non-null) and
  `useRef<T>(null)` returns `RefObject<T | null>`. Exposure: the
  four prop declarations in
  `apps/web/src/components/InviteShareSheet.tsx` typed
  `React.RefObject<HTMLButtonElement>` (lines 291, 292, 370, 444)
  receive refs created as `useRef<HTMLButtonElement>(null)` → type
  error under 19. **Fix: add `| null`** (exactly what
  ReorderTasksDialog.tsx:318/353 and useFocusTrap/useSlashFocus
  already do). The `| null` form typechecks under BOTH 18 and 19
  types (18's RefObject has readonly covariant `current`).
- **`MutableRefObject` is deprecated but still present** (verified
  `@deprecated Use RefObject instead` at index.d.ts:1670). Our 3
  sites (`lib/useStepFocus.ts` ×2, the documented cast in
  `ReorderTasksDialog.tsx:370`) **still compile — leave them**;
  optional cleanup is out of scope.
- **The global `JSX` namespace is gone**; `JSX` lives only at
  `React.JSX`. Exposure: exactly **1** bare `JSX.Element`
  (`components/OverflowMenu.tsx:58`). Fix: `React.JSX.Element` —
  valid under 18 types too.
- Non-issues, verified as zero-usage: `React.FC`/`FunctionComponent`
  0, `useReducer` 0 (its 19-types generics rewrite can't bite),
  `cloneElement`/`isValidElement` 0, `ComponentProps` 0,
  `ReactElement` used only as local `ReactElement[]` accumulators in
  MemberAvatar (the props-default-`unknown` change only bites reads
  of `.props` — none exist), `ReactNode` in 116 files but only as
  children/prop types (the 19 widening is backward-compatible in
  that position), `createContext` ×9 all explicitly typed.
- `act` is exported and typed from `"react"` in 19 types (verified
  lines 1904–1905) — matches our imports exactly.

**Total forced source churn from the types bump: 5 lines in 2
files.**

## 3. The hand-rolled test harness under React 19

- 320 test files run FROM `apps/web` (`vitest run`, jsdom,
  `globals: true`, setup = `fake-indexeddb/auto` only; ~3441 tests
  per last full run). No @testing-library anywhere.
- **141 files** import `createRoot` (+`type Root`) from
  `react-dom/client` and **the same 141** import `act` from
  `"react"` — never from `react-dom/test-utils` (0 hits), so the
  19 removal of `ReactDOMTestUtils.act` (now a deprecated
  console-erroring shim that forwards to `React.act` — verified in
  the 19.2.8 tarball) **cannot fire**. **135 files** set
  `globalThis.IS_REACT_ACT_ENVIRONMENT = true` at module scope —
  React 19 still honors exactly this flag. Per-test pattern
  (verified in Conversation.polling.test.tsx and others):
  fake timers → `act(() => { root = createRoot(container);
  root.render(...) })` → `act`-wrapped interactions → `act(() =>
  root?.unmount())` in afterEach. All of this is
  API-identical in 19.
- What 19 actually changes here: **uncaught render errors are no
  longer re-thrown from the root**; they go to `onUncaughtError`
  (default: console.error) — no test asserts a throwing render and
  there are no ErrorBoundary tests (verified), so no expected
  breakage; if a component *does* start throwing under 19 the
  failure signature shifts from "test throws" to "assertions fail +
  console.error noise" — know this when debugging Phase 2.
  Duplicate-error-logging removal likewise touches nothing (no
  console.error assertions on renders).
- Unhandled-rejection CI posture: vitest fails runs on unhandled
  rejections; async effects here use cancellation guards (e.g. the
  `cancelled` flag in `useVouchDiscoveryNudge.tsx:42-47`). React 19
  does not change effect-promise semantics; `act` remains
  sync-or-thenable exactly as typed. No new rejection channel is
  introduced.

## 4. Conversation.tsx exposure (hard constraint: scroll machinery untouched)

Hooks inventory (verified): useState/useEffect/useMemo/useRef +
`useLiveQuery` only — **no useLayoutEffect, no flushSync, no
startTransition**. All 8 refs carry initial values (fine under the
19 useRef requirement). The scroll effect (lines 695–744) is a
plain passive effect keyed on `lastScrolledIdRef`/`prevLenRef` —
commit-count independent; React 19 changes neither passive-effect
timing nor batching for this shape.

**Ref-callback cleanup semantics (the one real 19 footgun):** a ref
callback that *returns a value* is now treated as returning a
cleanup, and React stops calling it with `null` on unmount. Swept
the whole app for arrow-body ref callbacks with implicit returns
(`ref={el => expr}` / `ref={el => (obj.x = el)}` — pattern in §8):
**zero exist**. There are exactly 3 function-ref sites in the app,
all block-bodied with no return statements:
`Conversation.tsx:1068` (`matchRefs` map set/delete — the scroll
machinery's match registry), `Help.tsx:292` (same map pattern), and
`ReorderTasksDialog.tsx:375` (`setRef`, statements only). All keep
identical 18 behavior under 19 (no value returned → null-call on
unmount preserved). **Conversation.tsx requires zero changes**; the
8 Conversation suites (Conversation, .drafts, .menuPlacement,
.polling, .reactions, .reply, .signalUi, .voice) are the guard.

StrictMode (main.tsx wraps `React.StrictMode`): 19 additionally
double-invokes ref callbacks and reuses useMemo/useCallback results
across the dev double-render. Dev-only (tests don't render under
StrictMode; production strips it). The three map-refs above handle
the attach/detach(null)/attach cycle correctly (else-branch
deletes). No app change needed.

## 5. Vite / PWA / desktop

- @vitejs/plugin-react 6.0.4 has no react peer and uses the
  automatic runtime we already compile with — **no vite.config.ts
  change**. vite-plugin-pwa 1.3.0 is react-agnostic; the precache
  manifest just fingerprints the new chunks. Bundle output: format
  unchanged; react-dom 19's prod bundle is marginally different in
  size — no action (one line, as promised).
- apps/desktop wraps the *built* web bundle (prepare:web copies
  dist) — it inherits React 19 transparently; its own
  main-process suite has no React exposure. apps/site: none.

## 6. Phases

**Phase 0 — baseline (no commit).** From repo root: `npm run
typecheck`, `npm test`, `npm run build`; record `npm audit` (0
vulns) and the web suite count. Confirms green before any change.

**Phase 1 — commit "types-forward fixes compatible with React 18
and 19"** — 2 files, 5 lines, no dependency change:
1. `apps/web/src/components/OverflowMenu.tsx:58`
   `JSX.Element` → `React.JSX.Element` (adjust the React import to
   include the namespace if needed — file currently has no default
   React import).
2. `apps/web/src/components/InviteShareSheet.tsx:291,292,370,444`
   `React.RefObject<HTMLButtonElement>` →
   `React.RefObject<HTMLButtonElement | null>`.
Gates: `npm --workspace @understoria/web run typecheck`, full web
suite from apps/web (`npm --workspace @understoria/web test`),
`npm --workspace @understoria/web run lint`. Rollback: revert the
commit — it is semantically inert under 18.

**Phase 2 — commit "react 18.3.1 → 19.2.8"** — 2 files
(apps/web/package.json + root package-lock.json), executed from
repo root:
```
npm install --workspace @understoria/web \
  react@^19.2.8 react-dom@^19.2.8
npm install --workspace @understoria/web --save-dev \
  @types/react@^19.2.17 @types/react-dom@^19.2.3
```
Lockfile expectation: react/react-dom 19.2.8, scheduler 0.27.x,
@types/react 19.2.17, @types/react-dom 19.2.3, loose-envify +
js-tokens gone, **no duplicate react** (`npm ls react @types/react`
must show a single deduped copy — hard gate). Expected source diff
beyond the two manifests: **none** (Phase 1 pre-cleared the known
type surface); if `tsc --noEmit` surfaces a straggler, fix it inside
this commit and record it in the commit message. Test-harness
adjustments: none expected (§3); if a suite fails, the likely shape
is an un-`act`ed async flush or a console.error-instead-of-throw
(§3) — fix the TEST, never app code, and **never Conversation.tsx**.
Gates, in order, all from repo root unless noted:
1. `npm run shared:build`
2. `npm --workspace @understoria/web run typecheck`
3. Full web suite from apps/web: `cd apps/web && npx vitest run`
   (same count as Phase 0 baseline, 0 unhandled rejections)
4. `npm --workspace @understoria/web run lint`
5. PWA production build: `npm --workspace @understoria/web run
   build` (includes tsc --noEmit)
6. `npm test` at root (server + desktop + shared suites
   untouched-but-run, incl. the invite-flow e2e)
7. `npm audit` → must remain 0
8. Manual smoke (§7)
Rollback: `git revert` of this single commit restores 18.3.1
exactly (lockfile included); Phase 1 needs no revert. No data /
storage / URL-format migration is involved anywhere.

**Out of scope (explicitly):** react-router 8.3.0 (unblocked by
this migration; separate plan), MutableRefObject→RefObject cleanup
(3 sites), i18next / react-i18next majors, any forwardRef /
ref-as-prop modernization (nothing to modernize).

## 7. Verification matrix

Highest-signal first: all 8 Conversation suites (esp.
Conversation.polling's no-re-scroll guard and Conversation.test's
search-match scroll), ReorderTasksDialog (the one setRef +
dnd-kit sortable path), Help (section-ref map), InviteShareSheet
(the four focus refs), CommandPalette, DockedPanel, Board.postPanel,
Calendar(+filtersDisclosure), MessagesSplit, ConfirmDialog + MeMenu
(portals), MemberAvatar + PairDevicePassphraseEntry (useId format
change), the print suites, then the full 320-file suite. Manual
smoke: cold load `/` (StrictMode dev pass, console clean of new
warnings), conversation deep link with `?q=` + bottom-follow vs
new-messages chip + reaction long-press, reorder-tasks drag,
invite share sheet focus order, palette nav, a print route, PWA
build servable + service-worker update. Dev-console check
specifically for: ref-cleanup warnings, act warnings,
`ReactDOMTestUtils` deprecation (must be absent).

## 8. Audit trail — exact inventory commands (run from apps/web)

- Removed APIs: `grep -rnE "ReactDOM\.render|unmountComponentAtNode|
  findDOMNode|hydrateRoot|ReactDOM\.hydrate" src` (0);
  `grep -rn "react-dom/test-utils" src` (0); `grep -rn "flushSync"
  src` (0); `grep -rn "defaultProps\|propTypes\|contextTypes\|
  getChildContext" src` (0); `grep -rnE "\.props\.ref|element\.ref"
  src` (0); string refs via full `ref={` site audit (rg
  `ref=\{`, every hit brace-form).
- Harness: `grep -rl "react-dom/client" src` (141);
  `grep -rlE "import \{[^}]*\bact\b[^}]*\} from \"react\"" src`
  (141); `grep -rl "IS_REACT_ACT_ENVIRONMENT" src` (135).
- Ref callbacks: rg
  `ref=\{(?:\([^)]*\)|[A-Za-z_]+)\s*=>\s*[^{\s]` on `*.tsx`
  (0 implicit-return sites); rg `ref=\{` full listing → 3
  function-ref sites, all block-bodied.
- Types churn: `grep -rn "useRef()" src` (0); rg
  `useRef<[^>]*>\(\)` (0); rg `(^|[^.])JSX\.Element` (1);
  `grep -rn "MutableRefObject" src` (3); `grep -rn "RefObject" src`
  (15, of which 4 lack `| null`); `grep -rnE "React\.FC|
  FunctionComponent" src` (0); `grep -rn "forwardRef" src` (0);
  `grep -rn "Suspense\|React.lazy" src` (0); `useId` (2).
- Deps: `node -e` over installed package.json peer fields (§0
  table); `grep -rl SECRET_INTERNALS node_modules/{react-router,
  react-router-dom,dexie-react-hooks,react-i18next,@dnd-kit}` (0);
  `npm view react/react-dom/@types/react/@types/react-dom` latest;
  @types/react@19.2.17 + react-dom@19.2.8 tarballs read directly.

## 9. Named risks

1. **Conversation.tsx render timing** — analyzed to zero exposure
   (no layout effects/flushSync/transitions; ref callback is
   block-bodied; scroll keyed on refs, not commit counts). The 8
   suites gate it; the constraint stands: no edits to the file.
2. **Ref-callback implicit returns** — the 19 cleanup-semantics
   trap. Grep-proven absent (0 expression-body ref arrows; 3
   function refs, all statement-bodied). Residual risk ~nil; a
   regression would surface as "ref callback no longer called with
   null" test failures in ReorderTasksDialog/Help/Conversation.
3. **act semantics in the hand-rolled harness** — imports are
   already 19-shaped (`act` from react, flag set, createRoot
   per-test). Residual risk: individual tests relying on 18's
   error-rethrow or console.error cadence — none found by
   inspection, but 3441 tests are the real check; fix stragglers
   test-side only.
4. **Peer warnings** — verified none will occur (every declared
   peer range admits 19; i18next stack included). If npm still
   prints one, it must be investigated, not silenced.
5. **useId format change** — 2 call sites, ids used only as
   `htmlFor`/aria wiring; no test asserts the literal. Cosmetic.
6. **Hoisting/dedupe drift** — single-copy verified pre-migration;
   the `npm ls react @types/react` gate makes a dual-React tree
   impossible to ship.
7. **Rollback** — Phase 2 is a 2-file diff; `git revert` restores
   the 18 tree byte-for-byte. Phase 1 is forward-compatible and can
   stay.
