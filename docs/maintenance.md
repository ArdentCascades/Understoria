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

**Status:** deferred (2026-06-14; decision still pending as of
2026-07-03). Low urgency while no one depends on the software yet;
**revisit before a real deployment / real users**, or when vitest 4 has
settled enough to migrate cleanly.

**What.** Before the 2026-07-03 cleanup below, `npm audit` reported 10
advisories across 9 packages (GitHub Dependabot counted 25 alerts on the
default branch). **All are dev/build tooling**, none touch the production
PWA or the runtime.

**2026-07-03 cleanup (semver-safe subset).** A lockfile-only pass cleared
5 of the 10 advisories, including both standalone highs:

- `npm audit fix` (no `--force`): `form-data` 4.0.5 → 4.0.6 (high, CRLF
  injection), `ws` 8.20.1 → 8.21.0 (high, fragment-flood DoS), `js-yaml`
  4.1.1 → 4.3.0 (moderate, merge-key DoS), `@babel/core` and its
  `@babel/*` sub-packages 7.29.0 → 7.29.7 (low, sourceMappingURL file
  read), plus `hasown` 2.0.3 → 2.0.4.
- `npm update tsx`: 4.21.0 → 4.23.0 within `^4.19.2`, which moves the
  tsx-owned `esbuild` node to 0.28.1 and clears that esbuild advisory.

No `package.json` manifest changed; full gate verified green.

**What remains.** 5 advisories, all on the vite/vitest chain (`esbuild`
nested under vite, `vite`, `@vitest/mocker`, `vitest`, `vite-node`):

- `esbuild` ≤ 0.28.0 (vite's bundled copy) — dev-server can be asked to
  return arbitrary responses (GHSA-67mh-4wv8-2f99). Fixed in esbuild
  0.28.1.
- `vite` ≤ 6.4.2 — dev-server path traversal in optimized-deps `.map`
  handling (GHSA-4w7w-66w2-5vf9) and related dev-server advisories
  (GHSA-fx2h-pf6j-xcff, GHSA-v6wh-96g9-6wx3). Propagates to
  `@vitest/mocker` and `vite-node`.
- `vitest` ≤ 3.2.5 — UI-mode API server RCE (GHSA-5xrq-8626-4rwp).
  Rated critical, but **unreachable here**: it requires running vitest
  with `--ui` or an `api:` server config, and neither appears anywhere in
  our configs or CI.

These are exploitable only against a developer running the local dev
server who is then specifically targeted. The deployed app does not run
vite/esbuild/vitest. All five clear only with the vite 8 / vitest 4
migration below.

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

## Resolved

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
