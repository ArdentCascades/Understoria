# Dependency upgrade plan — tiers, rationale, cadence

> **Status: Tier 1 SHIPPED; Tiers 2–4 planned.** Surveyed 2026-07-24
> (`npm outdated` across all workspaces; `npm audit` was already at
> 0 vulnerabilities after the react-router 7 migration —
> `docs/react-router-7-plan.md`). Node 22 runtime is LTS through
> 2027; CI actions are current.

## Tier 1 — semver-compatible + deliberate small bumps (SHIPPED)

One PR, mechanical, full gates. Contents:

- `npm update` across workspaces (the "Wanted" column): fastify
  5.10, vite 8.1.5, vitest 4.1.10, dexie 4.4.4, eslint 9.39.5,
  @typescript-eslint/parser, @vitejs/plugin-react, autoprefixer,
  postcss, sharp, tsx, @types/node 22.x, fontsource.
- **electron 43.1.1 → 43.2.0** (apps/desktop pins exact by
  electron-builder requirement, so patches never arrive on their
  own; the threat model's desktop entry commits us to tracking
  Chromium's CVE cadence — this is that commitment in practice).
- **dexie-react-hooks ^1.1.7 → ^4.x**: the hooks package adopted
  dexie's own major line; 1.x is the legacy line. `useLiveQuery`'s
  API is unchanged; the app's ~everything uses it, so the full web
  suite is the compat proof.

Gates: shared build, full web suite (from apps/web), server suite,
desktop tests (ELECTRON_SKIP_BINARY_DOWNLOAD=1 — the binary is
proxy-blocked in the dev sandbox and unneeded for unit tests), root
typecheck, eslint, PWA production build, `npm audit` still 0.

## Tier 2 — small deliberate majors (next convenient slot)

- `@fastify/helmet` 12 → 13, `@fastify/rate-limit` 10 → 11: verify
  Fastify-5 peer ranges, read both changelogs for option renames
  (helmet CSP options and rate-limit keyGenerator are the ones we
  configure), full server suite. Expected: small.
- `jsdom` 25 → 29: test-environment only; cannot affect production.
  Full web suite is the entire gate. Watch for stricter DOM APIs
  surfacing latent test assumptions.

## Tier 3 — real migrations (each gets its own plan doc first,
   react-router-7-plan.md discipline: verified API inventory,
   hard-constraint analysis, phased commits, rollback story)

1. **React 19** (+ @types 19) — the strategic one: prerequisite for
   react-router 8 and the ecosystem's settled target. The app is
   function-components/hooks throughout; the survey work is the
   deprecated-API sweep (defaultProps on function components,
   ReactDOM.render — none expected), the @types/react churn, and
   re-verifying the Conversation scroll constraint under React 19's
   render timing. Do NOT bundle with anything else.
2. **Tailwind 4** — the biggest lift: CSS-first configuration
   replaces tailwind.config across apps/web AND apps/site; the
   a11y-sensitive moss/canopy palette and dark-mode variants must
   survive byte-identically (the contrast guard tests are the
   tripwire). No security dimension; purely when convenient.
3. **i18next 26 + react-i18next 17** — moderate; plumbing-level
   (init options, types), locale JSON untouched. The i18n parity
   suites are the gate.
4. **eslint 10 + globals 17** — config-level; the repo is already
   flat-config, so this is mostly plugin-compat verification.

## Tier 4 — deliberately held, with reasons

- **TypeScript 7**: the next-generation compiler line; 5.9 is fully
  supported and the ecosystem (vitest/eslint/tsx plugin chain)
  needs to settle first. Revisit in a few months.
- **`@scure/bip39` 1 → 2**: touches RECOVERY PHRASES (identity
  kit + guardian shards). The BIP-39 wordlists are standardized so
  existing phrases remain decodable regardless, but this upgrade
  ships only with dedicated round-trip compat tests (old-version
  fixtures decoded by the new version) and never bundled with
  anything else. No urgency: no advisories against 1.x.
- **`@types/node`** stays on 22.x to match the runtime — types
  should track the engine, not the registry.

## Cadence note

`npm audit` runs in CI on every PR (informational job, gate at
high). The recurring pattern this repo has lived: advisories tend
to publish mid-PR and look like "our" failures — check the advisory
date before assuming. Electron patch bumps should ride any
convenient PR at least monthly (Chromium CVE cadence).
