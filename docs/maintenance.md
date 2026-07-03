<!--
Understoria — Federated mutual aid timebank
Copyright (C) 2026 Understoria Contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Maintenance notes

Running log of deferred maintenance and the standing dependency policy.
Keep this honest: when an item here is done, move it to "Resolved" with
the date and the PR.

## Dependency policy

Keep dependencies as up to date as possible **without breaking
functionality**. Apply safe (patch/minor, in-range) updates regularly and
verify with the full gate before committing:

- `npm run typecheck` (web + server) — clean
- `npm run lint` (web) — clean
- `npm run build` (web vite build) — succeeds
- full `vitest` suites (web + server) — green

Breaking (major) upgrades are deliberate, separate efforts — see the open
items below — never bundled into unrelated work.

## Open

(nothing currently deferred)

## Resolved

### Dev-tooling security upgrade: vite 5 → 8, vitest 2 → 4

**Status:** resolved 2026-07-03 (deferred 2026-06-14; semver-safe
subset cleared earlier on 2026-07-03, see the entry below).

**What.** The 5 advisories left after the lockfile pass all sat on the
vite/vitest chain: nested `esbuild` ≤ 0.28.0 (GHSA-67mh-4wv8-2f99),
`vite` ≤ 6.4.2 dev-server advisories (GHSA-4w7w-66w2-5vf9,
GHSA-fx2h-pf6j-xcff, GHSA-v6wh-96g9-6wx3), their `@vitest/mocker` /
`vite-node` propagation, and the critical-rated vitest UI-server RCE
(GHSA-5xrq-8626-4rwp — unreachable here, nothing runs `--ui` or an
`api:` server). All dev/build tooling; the deployed app never runs
vite/esbuild/vitest.

**Fix.** Bumped the four packages together on their own branch:
`vite` 5.4.21 → **8.1.3**, `vitest` 2.1.9 → **4.1.9** (web + server),
`@vitejs/plugin-react` 4.7.0 → **6.0.3**, `vite-plugin-pwa` 0.21.2 →
**1.3.0** (workbox stayed ^7.4.1 — no workbox major taken). `npm audit`
now reports **0 advisories** (was 5: 3 moderate, 1 high, 1 critical).
Full gate green afterwards: typecheck, web lint, 1,858 web + 135 server
tests, `vite build`, server `tsc` build, and both Docker image builds.
Node floors are satisfied everywhere (vite 8 needs `^20.19 || >=22.12`;
CI pins `node-version: '22'` and both Dockerfiles use
`node:22-bookworm-slim`, which float to current 22.x).

**What the migration actually cost (for the next major bump).**
Far less churn than feared when this was deferred:

- `vite.config.ts` needed **zero changes** — `registerType: "prompt"`,
  the workbox `generateSW` options, and the `test:` block all carried
  over as-is. Only two test files changed: vitest 4's stricter `vi.fn`
  typing (`Mock<Procedure | Constructable>` no longer assignable to a
  concrete signature) required typing the `scrollIntoView` spies in
  `LearnSection.test.tsx` and `Profile.editParam.test.tsx` as
  `vi.fn<typeof Element.prototype.scrollIntoView>()`. All 1,993 tests
  passed under vitest 4 with no behavioral edits.
- **Surprise worth remembering:** `npm install` after the manifest bump
  left the lockfile in a hybrid state — stale `node_modules/vite@5.4.21`
  hoisted at root (still carrying vulnerable esbuild 0.21.5) with vite 8
  nested under `apps/web`, and `npm dedupe` refused to fix it
  (ERESOLVE). Deleting the stale `node_modules/vite*` entries from
  `package-lock.json` and re-running `npm install` produced the clean
  single-vite-8 tree. Check `npm ls vite` after any vite-chain bump.
- Vite 8 builds with rolldown/oxc instead of rollup/esbuild. Output is
  equivalent (precache 37 → 39 entries: rolldown emits its module
  runtime and the workbox-window helper as separate chunks). Rolldown
  surfaces a pre-existing pattern as an `INEFFECTIVE_DYNAMIC_IMPORT`
  warning for `src/lib/outbox.ts` (dynamically and statically imported)
  — informational, not new behavior.
- **Service-worker prompt flow re-verified in a real browser** (the
  0.x → 1.x plugin major was the biggest regression risk after the
  silent-update burn that led to PR #219): generated `sw.js` still gates
  `skipWaiting` on the `SKIP_WAITING` message only; live check confirmed
  deploy → "A new version is available." card (old build keeps running)
  → Refresh tap activates the new build. No silent swap.

### Dev-tooling advisory cleanup, semver-safe subset (2026-07-03)

**Status:** resolved 2026-07-03 (PR #299).

A lockfile-only pass cleared 5 of the then-10 advisories, including
both standalone highs:

- `npm audit fix` (no `--force`): `form-data` 4.0.5 → 4.0.6 (high, CRLF
  injection), `ws` 8.20.1 → 8.21.0 (high, fragment-flood DoS), `js-yaml`
  4.1.1 → 4.3.0 (moderate, merge-key DoS), `@babel/core` and its
  `@babel/*` sub-packages 7.29.0 → 7.29.7 (low, sourceMappingURL file
  read), plus `hasown` 2.0.3 → 2.0.4.
- `npm update tsx`: 4.21.0 → 4.23.0 within `^4.19.2`, which moves the
  tsx-owned `esbuild` node to 0.28.1 and clears that esbuild advisory.

No `package.json` manifest changed; full gate verified green. The
remaining 5 advisories were cleared the same day by the vite 8 /
vitest 4 migration above.

### Duplicate top-level `"community"` key in the locale files

**Status:** resolved 2026-07-03 (PR #297; noted 2026-07-02 during
docs sweep 2).

**What.** `apps/web/src/i18n/locales/en.json` and `es.json` each
declared the top-level `"community"` key **twice**. JSON parsing is
last-wins, so the first block — the one carrying
`community.autoConfirmHours.{label,help,unit}` — was silently dead;
only the second block (custom milestones etc.) was loaded, and the
Community-settings auto-confirm control rendered missing-key
fallbacks.

**Fix.** Merged the `autoConfirmHours` subtree into the surviving
second `"community"` block and deleted the first (both locales; no
keys dropped — everything in both blocks is referenced). Added
`apps/web/src/i18n/duplicateKeys.test.ts`, which scans the raw
locale JSON for duplicate keys at any nesting depth, so a future
merge can't reintroduce the shadowing. Verified in the running app
that the auto-confirm control shows its real label/help/unit text.
