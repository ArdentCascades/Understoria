# Developer Guide

> **Audience:** someone who wants to read, modify, or extend the
> Understoria codebase. You should be comfortable with TypeScript,
> React, and the general shape of a client-side application.

---

## 1. Project layout

```
understoria/
├── apps/
│   └── web/                  # React PWA (only app so far)
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── index.css
│       │   ├── components/   # Shared UI (TrustChip, LockScreen, …)
│       │   ├── pages/        # Route screens (Board, Profile, …)
│       │   ├── state/        # React context / hooks
│       │   ├── db/           # Dexie schema, actions, secrets, seed
│       │   ├── lib/          # Pure modules: crypto, panic, invite…
│       │   ├── types/        # Shared type definitions
│       │   └── test/         # Vitest setup
│       ├── public/           # Static assets served as-is
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       └── vite.config.ts
├── docs/                     # Member / operator / organizer / threat
│                             #   model / opsec / political ed.
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── GOVERNANCE.md
├── LICENSE                   # AGPL-3.0-or-later
├── TRADEMARK.md
└── README.md
```

The root `package.json` is a thin npm workspace pointing at
`apps/web`. Root-level scripts (`npm run dev`, `npm test`) pass
through.

## 2. Tech stack, at a glance

| Layer | Choice | Why |
|------|--------|-----|
| UI | React 18 + TypeScript strict | Familiar, no magic, types catch a lot |
| Styling | Tailwind + a small design-token palette (`canopy`/`moss`) | Zero runtime cost, works offline |
| Storage | Dexie.js over IndexedDB | Offline-first, live queries, transactions |
| PWA | `vite-plugin-pwa` (Workbox) | Service worker for offline + installability |
| Crypto | `tweetnacl` (Ed25519 + NaCl secretbox) | Audited, small, sync API |
| KDF | Web Crypto PBKDF2-HMAC-SHA256 @ 600k | Browser-native, current NIST guidance |
| Routing | `react-router-dom` v6 | Standard |
| Tests | `vitest` + `fake-indexeddb` + `jsdom` | Fast, same transformer as the app |

No backend yet. Everything runs in the browser; all state is the
user's own.

## 3. Module map

### `lib/` — pure modules, no side effects

| Module | Responsibility |
|--------|---------------|
| `bytes.ts` | Base64 / UTF-8 / random-bytes helpers with realm-safe Uint8Array |
| `crypto.ts` | Ed25519 key generation, detached signatures, `canonicalExchangePayload`, `verifyExchange` |
| `passphrase.ts` | PBKDF2 master-key derivation, wrap/unwrap (secretbox), blob format |
| `invite.ts` | Signed invite tokens, `encodeInviteToken`/`decodeAndVerifyInvite` |
| `vouch.ts` | Signed vouches, `trustStatusWithInvites` (composes vouches + redeemed invites) |
| `timebank.ts` | `balanceFor`, `transactionHistory` — event-sourced credit logic |
| `achievements.ts` | `evaluateAchievements`, `diffAchievements` — pure from an exchange log |
| `safeguards.ts` | `assertWithinDailyLimit`, `evaluateSafeguards` (anti-gaming). The thresholds here are currently module-level constants; Phase 5 / Agent 11 moves them to per-node config — see [`docs/roadmap.md`](roadmap.md) |
| `panic.ts` | `softPurge`, `hardPurge` (Agent 4 emergency tooling) |
| `milestones.ts` | Threshold table + progress calculation |
| `stats.ts` | Community-level metrics from the exchange log |
| `format.ts` | Relative time, short-key, signed hours |
| `categories.ts` | Static category metadata |
| `id.ts` | UUID v4 |

Invariant: **nothing in `lib/` imports from `db/`.** If you need DB
access, stay in `db/` (or do the I/O in a page/component and pass
pure data to `lib/`).

### `db/` — persistence and transactions

| Module | Responsibility |
|--------|---------------|
| `database.ts` | Dexie schema (`members`, `posts`, `exchanges`, `achievements`, `settings`, `secretKeys`, `invites`, `vouches`) |
| `seed.ts` | First-launch demo community |
| `actions.ts` | Post lifecycle (`createPost`, `claimPost`, `confirmExchange`, …) |
| `secrets.ts` | Session-aware `getSecretKey`, enable / change / disable passphrase |
| `invites.ts` | `issueInvite`, `redeemInvite`, `revokeInvite`, `listInvitesFrom` |

All write paths go through `actions.ts`, `secrets.ts`, or
`invites.ts`. Components and pages should never call
`db.table.put()` directly — route it through an action.

### `state/AppContext.tsx`

Exposes live Dexie queries (members, posts, exchanges, achievements,
invites, vouches) plus lock state and setters via React context.
Pages subscribe through `useApp()`.

### `pages/` and `components/`

Pages are route-level: `Board`, `Dashboard`, `Profile`, `PostDetail`,
`PostForm`, `InviteAccept`. Components are reusable building blocks
(`PostCard`, `CategoryBadge`, `ConfirmDialog`, `TrustChip`,
`LockScreen`, `BottomNav`, `Layout`, `AchievementBadge`,
`UrgencyBadge`).

## 4. Core design patterns

### Event-sourced credits

Balances are **never** stored. `balanceFor(member, exchanges)` reads
the exchange log and derives the number on demand. This is what
lets federation work later — merging two nodes' logs yields the
right total without a reconciliation step.

**Corollary:** never add a mutable `balance` field to `Member`.
Never edit an existing exchange to "correct" a balance. Corrections
happen as new exchanges (a reversing one) so history stays honest.

### Canonical JSON for signed payloads

Any time data is signed (exchanges, vouches, invites), the signer
serializes a **canonical** JSON form with keys listed in an explicit
order. This is what makes verification stable across JS engines
and language implementations. The functions are colocated with
their modules: `canonicalExchangePayload`, `canonicalVouchPayload`,
`canonicalInvitePayload`.

**Corollary:** if you add a field to a signed structure, add it to
the canonical function too. Write a test that verifies the old and
new forms don't collide.

### Side effects at the edges

Dexie lives only in `db/`. Network (when it arrives) will live in
`net/`. React lives in `components/`, `pages/`, `state/`. Pure code
is all of `lib/`, tested without a DOM.

### Lock state is a first-class app state

Anywhere that signs has to call `getSecretKey()` rather than reading
`db.secretKeys` directly. A locked session refuses to sign; callers
present that to the user as a re-authentication prompt (the
`LockScreen`).

## 5. Running the tests

```sh
npm test            # one-shot
npm run test:watch  # file-watching, develop-friendly
```

The suite runs under `vitest` with `jsdom` and `fake-indexeddb`.
PBKDF2 tests use a reduced iteration count (1,000) for speed; the
production iteration count (600,000) is itself asserted by a test.

Adding a test:

- Pure module → colocate as `foo.test.ts` next to `foo.ts`.
- DB behavior → put it in `db/<feature>.test.ts`. Call the provided
  `reset()` helper in `beforeEach`.
- Anything that signs needs at least one **fresh-keypair** test
  rather than a hardcoded key; signatures won't match otherwise.

## 6. Extending the data model

1. Add the type to `packages/shared/src/types.ts` so the server and
   PWA share one source of truth. `apps/web/src/types/index.ts` is a
   re-export shim — don't add types there.
2. Add a new Dexie version in `database.ts` (never modify an
   existing version). If existing rows need new fields populated,
   include a Dexie `upgrade()` callback that backfills defaults —
   even for array-typed fields (`undefined` is not `[]`).
3. **Coordinate Dexie version numbers between parallel branches.**
   The next free version is reserved by the first PR to land; a
   second PR targeting the same version must rebase onto the next.
   See [Failure modes — data model & migrations](roadmap.md#data-model--migrations)
   in the roadmap.
4. Add an action in `db/actions.ts` — never write to a table from a
   component.
5. If the change is security-sensitive (signatures, trust,
   balances), add it to the canonical payload function and write a
   verification test. Also update the Threat Model.
6. Expose via `AppContext` if pages need reactive access.

## 7. Federation readiness

Although no server exists yet, code is written with federation in
mind:

- Exchanges are signed and verifiable by `verifyExchange()` without
  DB access.
- Vouches are signed and verifiable by `verifyVouch()`.
- Invites are signed and verifiable by `decodeAndVerifyInvite()`.
- Everything carries a `nodeId` so a future peer-to-peer gossip
  layer can resolve "who said this."
- The seed of `nodeId` is local to this install; when two nodes
  peer, they'll exchange node identities via a separate handshake.

When you add a new record type, ask: "If I federate two nodes' copies
of this table, what does the merged state look like?" If the answer
is "it depends on which came first," you need a CRDT strategy.

## 8. Performance targets

- Cold load on a mid-range 3G connection: **< 3 seconds.**
- Bundle size after gzip: **< 200 KB** main + a small PWA shell.
- Time-to-interactive on a 2020-era budget Android: **< 5 seconds.**
- Hard purge over a populated node (50 members, 200 posts): **< 60
  seconds** (measured: ~500 ms).

If a change pushes us past any of those, call it out in the PR.

## 9. What not to do

- Don't add analytics. Not even "anonymous" ones.
- Don't add a server round-trip for anything the client can compute.
- Don't add a UI affordance that treats credits as money (prices,
  markups, exchange rates).
- Don't add a ranking, badge-count, or contributor leaderboard.
- Don't suppress tests or the type checker to land a change.

## 10. Getting oriented in the codebase

Good entry points to start reading:

1. `src/types/index.ts` — the shape of every domain object.
2. `src/lib/timebank.ts` — the simplest core module (≈20 lines).
3. `src/db/actions.ts` — the post lifecycle, top to bottom.
4. `src/pages/PostDetail.tsx` — how a page consumes context, actions,
   and components.
5. `docs/threat-model.md` — why the code looks the way it does.

From there you can follow imports outward.

---

*If any of this is wrong or out of date, it's a bug. File it or fix
it.*
