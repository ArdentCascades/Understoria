# React Router 6 → 7 migration — implementation plan

> **Status: PLAN** (code-verified 2026-07-24 against the working
> tree, lockfile, installed node_modules, and the live npm
> registry/audit endpoint). Motivation: three moderate advisories
> against react-router v6 with fixes only in 7.18.x.

## 0. Verified ground truth

- Declared ONCE: `"react-router-dom": "^6.30.4"` in
  `apps/web/package.json` — no other workspace declares it
  (`apps/site` has zero router usage; desktop/server none). One
  hoisted physical copy (`react-router-dom@6.30.4`,
  `react-router@6.30.4`, `@remix-run/router@1.23.3`) — one bump
  clears the advisories everywhere.
- **6.30.4 is the last v6 release** — there is no newer v6 to step
  through.
- v8 requires React ≥19.2 — not an option (we're React 18.3.1).
  **Target: 7.18.1** (React ≥18 ✓, Node ≥20 ✓; CI runs Node 22).
- Full API inventory (202 import sites, multi-line imports parsed):
  MemoryRouter ×114 (tests only), Link ×64, Routes/Route ×48,
  useNavigate ×28, useLocation ×18, useParams ×10, useSearchParams
  ×8, Outlet ×4, useMatch ×3, BrowserRouter ×1 (main.tsx, no
  basename/future), Navigate ×1, NavLink ×1, useNavigationType ×1
  (ScrollToTop). **Verified absent**: every data-router API
  (createBrowserRouter/loaders/actions/fetchers/Form/json/defer),
  HashRouter, generatePath/matchPath, useBlocker, unstable_*,
  custom history, `import type` from the router, bare
  `react-router` imports. **The app is 100 % declarative mode**,
  and all 14 used APIs exist unchanged in v7.
- Route shape: flat absolute paths; nesting only at Board
  (`post/:id`), Calendar (`event/:eventId`), Messages
  (`:memberKey`); one `path="*"` (NotFound). **Zero relative `to=`
  targets exist anywhere** (all 86 string literals absolute).

## 1. Honest pre-migration exposure (three advisories, not two)

- GHSA-wrjc-x8rr-h8h6 (open redirect via backslash, <7.18.0),
  GHSA-jjmj-jmhj-qwj2 (open redirect → XSS, ≥6.30.2 ≤6.30.4 —
  directly against our installed version), GHSA-337j-9hxr-rhxg
  (deserializeErrors constructor injection, <7.18.0).
- **deserializeErrors: dead code here** — SSR-hydration-only; this
  app has no SSR, no RouterProvider, no hydration.
- **The open-redirect pair: narrowly reachable.** Federated record
  IDs are validated only as `typeof id === "string"` at ingest
  (`lib/federationSync.ts`; the server doesn't enforce format
  either) and are interpolated UNENCODED into router links
  (PostCard, AttentionSection, Calendar surfaces, TaskCard,
  attention deepLinks). A member running a modified client can
  publish a signed record whose id contains `\` — a crafted id
  could make a card tap navigate off-origin. Requires an
  authenticated member as attacker plus a victim tap;
  phishing-grade. Verified NOT reachable via mentions
  (encodeURIComponent), markdown links (`<a>`, never router Link —
  incl. the pending-author gate), palette/nav constants, or the
  invite hash flow.
- **Follow-up independent of the migration (cheap
  defense-in-depth): enforce an id format check at federation
  ingest and server submit** — tracked separately.

## 2. v7 breaking surface for THIS app

- Package consolidation: `react-router-dom@7.18.1` is a compat
  shim over `react-router@7.18.1` (verified). **Keep the -dom
  imports in Phase 2** (zero churn across 202 files); an optional
  later codemod to `react-router` is v8-prep only.
- The installed v6 declarative `FutureConfig` is exactly
  `{ v7_startTransition, v7_relativeSplatPath }` (verified in
  node_modules types) — the other four future flags are
  data-router-only and cannot affect this app.
  - `v7_relativeSplatPath`: provably a no-op (one splat route, no
    relative targets anywhere).
  - `v7_startTransition`: **the only live behavioral change** —
    router state updates wrap in React.startTransition. No
    React.lazy routes exist (App.tsx imports statically), removing
    the classic suspense-flash failure mode.
- Removed exports (json/defer/etc.): none used. TypeScript:
  `moduleResolution: "bundler"` ✓; nothing consumes `navigate()`'s
  return value (v7 widens it). Vite/rolldown: no router plugin in
  use and none needed (the @react-router/dev plugin is framework
  mode only — do NOT add it).

## 3. Conversation.tsx risk analysis (hard constraint: scroll
   machinery untouched)

Its router surface is Link ×2, useParams (the `key={memberKey}`
remount), useSearchParams (`?q=`/`?about=`). No useNavigate/
useLocation/useNavigationType. The scroll machinery is driven by
Dexie-polled `messages` + local state — none of it router state, so
startTransition cannot retime it; the poll-tick no-re-scroll guard
is ref-based and commit-order independent. The one coupled path —
debounced `setSearchParams` (`?q=`, replace) beside an urgent
`setActiveMatchIdx(0)` — may split into two commits under v7;
`matchIds` derives from LOCAL query, not the URL, so the scroll
target cannot change (worst case the `about` chip disarm lags a
frame — cosmetic). The migration as planned **touches zero lines of
Conversation.tsx**; the 8 Conversation suites are the guard.
Board/Calendar docked panels and ScrollToTop analyzed: effect-based,
post-commit in both versions — unchanged ordering.

## 4. Phases

**Phase 0 — baseline (no commit)**: typecheck + full test + build;
record `npm audit` (3 moderates).

**Phase 1 — commit "enable v7 future flags"** — `main.tsx` only:
`<BrowserRouter future={{ v7_startTransition: true,
v7_relativeSplatPath: true }}>`. Full web suite + dev-console clean
of v7 warnings + manual smoke. Deliberately do NOT add flags to the
114 test MemoryRouters (Phase 2 would immediately revert them —
v7's `future` prop rejects v7_* flags as type errors). Any
startTransition regression now bisects to a dependency-free
two-line commit.

**Phase 2 — commit "react-router-dom 6 → 7.18.1"** — three files:
`apps/web/package.json`, root lockfile (`npm install --workspace
@understoria/web react-router-dom@^7.18.1` from repo root), and
`main.tsx` (REMOVE the Phase-1 future prop — it no longer
typechecks). Lockfile expectation: -dom 7.18.1 + react-router
7.18.1, `@remix-run/router` gone. All 202 import sites untouched.
Gates: typecheck, lint, full root `npm test` (incl. the invite-flow
e2e), build, `npm audit` → **0 vulnerabilities**, manual smoke.
Likely failure signature if any: a test asserting DOM synchronously
after navigation outside `act` — fix the TEST with `act`, never app
code, and never Conversation.tsx.

**Phase 3 — optional separate PR**: mechanical codemod
`"react-router-dom"` → `"react-router"` (v8-prep only; v8 is
blocked on React 19 anyway).

## 5. Verification matrix

Highest-signal suites first: all 8 Conversation.* (esp. polling's
no-re-scroll guard), Board.postPanel, Calendar(+filtersDisclosure),
EventDetail.back, pageHeaderCompact, CommandPalette (the splat
mount), BottomNav (NavLink active state), Layout, Messages +
MessagesSplit, ProjectDetail.deeplink, InviteAccept, Profile.nav,
the print suites. Then the full suites + CI gates. Manual smoke:
Board panel open/close with `?tab=` preserved; Calendar panel;
split-pane conversation switch (draft isolation) + `?q=` deep link
+ bottom-follow vs new-messages chip; palette + me-menu nav;
ScrollToTop (top + focus on `#main`, Back preserves position);
`/invite#token` cold load; `/my-tasks` redirect; a print route;
404; onboarding gate. Post-deploy: confirm the service worker
serves the new bundle (NetworkFirst documents — no special
handling).

## 6. Named risks

1. startTransition nav timing (panels/palette): no lazy routes,
   small trees — expected imperceptible; Phase-1 isolation is the
   mitigation; revert is two lines.
2. Test flakes from transition-wrapped navigation: the hand-rolled
   `createRoot`+`act` harness flushes transitions; fix stragglers
   in tests only.
3. A missing shim export: impossible past `tsc --noEmit` (hard
   Phase-2 gate).
4. Hoisting: single declaration/copy verified — no surprises.
5. Rollback: Phase 2 is a 3-file diff; `git revert` restores
   6.30.4 exactly; no data/storage/URL-format migration involved.
