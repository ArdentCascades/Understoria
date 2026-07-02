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

### Dev-tooling security upgrade: vite 5 → 8, vitest 2 → 4 (deferred)

**Status:** deferred (2026-06-14). Low urgency while no one depends on the
software yet; **revisit before a real deployment / real users**, or when
vitest 4 has settled enough to migrate cleanly.

**What.** `npm audit` reports 6 advisories (GitHub Dependabot counts ~14
on the default branch). **All are dev/build tooling**, none touch the
production PWA or the runtime:

- `esbuild` ≤ 0.28.0 (pulled in by `vite` and `tsx`) — dev-server can be
  asked to return arbitrary responses (GHSA-67mh-4wv8-2f99), a Deno-install
  RCE via `NPM_CONFIG_REGISTRY` (GHSA-gv7w-rqvm-qjhr), and a Windows
  dev-server file read (GHSA-g7r4-m6w7-qqqr). Fixed in esbuild 0.28.1.
- `vite` ≤ 6.4.1 — dev-server path traversal in optimized-deps `.map`
  handling (GHSA-4w7w-66w2-5vf9). Propagates to `@vitest/mocker`,
  `vitest`, `vite-node`.

These are exploitable only against a developer running the local dev
server who is then specifically targeted. The deployed app does not run
vite/esbuild/vitest.

**Why deferred (the surgical fix doesn't work).** The only esbuild that
fixes the advisories is 0.28.1, and the only vite that bundles it (and
fixes the vite path-traversal) is **vite 8**. An npm `overrides` forcing
`esbuild@0.28.1` under the current vite 5.4 **breaks `vite build`**
(verified 2026-06-14 — esbuild 0.21→0.28 is incompatible with vite 5.4).
So clearing these requires the full chain:

- `vite` 5 → 8
- `vitest` 2 → 4 (to match vite 8; has breaking config/API changes)
- `@vitejs/plugin-react` and `vite-plugin-pwa` → versions compatible with
  vite 8

That is a real migration touching the build/test config and possibly test
APIs — breaking and behavior-visible, so it's its own deliberate effort,
not an auto-patch.

**When picked up:** do it on its own branch; bump the four packages
together; expect to update `vite.config.ts`, the vitest config/setup, and
any vitest APIs that changed in v4; then run the full gate above. If it
can't be made green without large churn, stop and reassess rather than
forcing it.

### Duplicate top-level `"community"` key in the locale files

**Status:** open (noted 2026-07-02 during docs sweep 2). Small,
code-side fix; needs a locales PR, not a docs one.

**What.** `apps/web/src/i18n/locales/en.json` and `es.json` each
declare the top-level `"community"` key **twice** (around lines
169 and 2007). JSON parsing is last-wins, so the first block — the
one carrying `community.autoConfirmHours.{label,help,unit}` — is
silently dead; only the second block (custom milestones etc.) is
loaded. Any UI reading `community.autoConfirmHours.*` gets a
missing-key fallback.

**Fix when picked up.** Merge the `autoConfirmHours` subtree into
the surviving second `"community"` block (in both locales), delete
the first block, and add a guard (the parity test, or a small
duplicate-top-level-key check) so a future merge can't reintroduce
the shadowing. Verify the Community-settings auto-confirm control
renders its real label/help text afterward.

## Resolved

_(none yet)_
