# Dependency upgrade plan — tiers, rationale, cadence

> **Status: Tiers 1–3 SHIPPED (Tailwind bump held on an operator
> gate; react-router 8 added unplanned); Tier 4 held.** Surveyed
> 2026-07-24
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

## Tier 2 — small deliberate majors (SHIPPED)

- `@fastify/helmet` 12 → 13, `@fastify/rate-limit` 10 → 11: peer
  ranges and our configured options (quoted CSP keywords,
  allowList/keyGenerator) all carried over unchanged; helmet 8's
  default HSTS max-age rose 180 → 365 days, now matching the
  Caddyfile. Full server suite green.
- `jsdom` 25 → 29: test-environment only; the full web suite was
  the gate. It surfaced two upstream selector-engine bugs (not
  latent test assumptions): attribute selectors silently match
  nothing when the quoted value contains a literal `&` or an
  astral-plane character (emoji). Two tests now compare
  getAttribute() instead; `src/test/jsdomSelectorQuirks.test.ts`
  pins the broken behavior so a future jsdom fix flips the
  tripwire and the workarounds can be reverted.

## Tier 3 — real migrations (each gets its own plan doc first,
   react-router-7-plan.md discipline: verified API inventory,
   hard-constraint analysis, phased commits, rollback story)

1. **React 19** (+ @types 19) — SHIPPED (docs/react-19-plan.md,
   PR #531). The sweep confirmed the app was already clean (zero
   removed-API usage, zero forwardRef, harness already 19-shaped);
   total source churn was 5 lines in 2 files. Conversation scroll
   constraint verified untouched.
2. **Tailwind 4** — PLANNED + PINS SHIPPED, BUMP HELD
   (docs/tailwind-4-plan.md; pins in PR #532). The no-op v3 pins
   (stock-palette hex families, shadow-sm/rounded-sm) are on main;
   the actual bump awaits the operator's browser-floor decision
   (Safari 16.4+/Chrome 111+/Firefox 128+ — the frozen-ESR-115
   cohort on old Windows/Mac laptops is the honest sticking
   point). Tailwind remains 3.4.19 (v3-lts) until then.
3. **i18next 26 + react-i18next 17** — SHIPPED
   (docs/i18next-plan.md, PR #533). Verified trivial: zero
   applicable breaking changes across all five intervening majors;
   zero source lines changed.
4. **eslint 10 + globals 17** — SHIPPED (docs/eslint-10-plan.md,
   PR #534). Zero source/config changes; a root `overrides` entry
   carries eslint-plugin-jsx-a11y past its stale peer cap until
   upstream ships eslint-10 support (delete the override then).

Unplanned addition to this tier, forced by an advisory:
**react-router 7.18.1 → 8.3.0** — SHIPPED
(docs/react-router-8-plan.md, PR #533), clearing
GHSA-qwww-vcr4-c8h2 (no patched 7.x existed). The
`react-router-dom` package was removed upstream in v8; all 202
import sites now import from `react-router` directly.

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
