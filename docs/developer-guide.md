# Developer Guide

> **Audience:** someone who wants to read, modify, or extend the
> Understoria codebase. You should be comfortable with TypeScript,
> React, and the general shape of a client-side application.

---

## 1. Project layout

```
understoria/
├── apps/
│   ├── web/                  # React PWA
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── index.css
│   │   │   ├── components/   # Shared UI (TrustChip, LockScreen, …)
│   │   │   ├── pages/        # Route screens (Board, Profile, …)
│   │   │   ├── state/        # React context / hooks
│   │   │   ├── db/           # Dexie schema, actions, secrets, seed
│   │   │   ├── lib/          # Computation + orchestration modules
│   │   │   ├── types/        # Re-export shim over packages/shared
│   │   │   └── test/         # Vitest setup
│   │   ├── public/           # Static assets served as-is
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.js
│   │   └── vite.config.ts
│   └── server/               # Fastify community node (federation relay)
├── packages/
│   └── shared/               # Types + crypto shared by PWA and server
├── docs/                     # Member / operator / organizer / threat
│                             #   model / opsec / political ed.
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── GOVERNANCE.md
├── LICENSE                   # AGPL-3.0-or-later
├── TRADEMARK.md
└── README.md
```

The root `package.json` is an npm workspace over `apps/*` and
`packages/*` — currently `apps/web`, `apps/server`, and
`packages/shared`. Root-level scripts (`npm run dev`, `npm test`,
`npm run typecheck`) build the shared package first, then fan out
across the workspaces.

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

The PWA is local-first: everything a member does runs in the
browser and all state is the member's own. A Fastify community node
(`apps/server/`) now exists as the federation relay — it accepts
signed records, verifies them with the shared crypto, and serves
them to peers — but it holds no authority over member state; see
`operator-guide.md`.

The PWA is also a **non-scrolling app shell** (`Layout.tsx`): a
100dvh flex column whose document never scrolls (`overflow: clip`
on the root), with all scrolling inside `<main>` and the bottom nav
as an in-flow flex footer. Never reintroduce `position: fixed;
bottom: 0` chrome or a document scroll range — the iOS keyboard
corrupts exactly that state (see `lib/useVirtualKeyboard.ts` for
the history).

## 3. Module map

### `lib/` — computation and orchestration

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
| `boardTab.ts` | `parseTabParam` / `tabToParam` — the Board's three tabs encoded in the `?tab=` URL param. Default is `"PROJECTS"` so members see existing community efforts before posting a one-off Need |
| `density.ts` | Opt-in compact layout density preference. Apply / cache / preference guard, mirroring `textSize.ts` |
| `templateUsage.ts` | `getActiveProjectsForTemplate` — pure filter that finds Planning- or Active-status projects sharing a given `templateId`. Used by the Start-a-project picker to route members toward existing community efforts |

The rule here is about **purity, not the import graph**. `lib/`
holds two kinds of module:

- **Pure computation** (everything in the table above — crypto,
  timebank, achievements, formatting, filters). These stay DB-free,
  take plain data in, return plain data out, and are tested without
  a DOM or a database.
- **Orchestration** — the modules that coordinate I/O across many
  tables: federation sync (`federationSync.ts`), the outbox
  (`outbox.ts`), purge (`panic.ts`), export (`exportData.ts`),
  device pairing (`devicePairing.ts`), the attention and
  auto-confirm sweeps (`attention.ts`, `autoConfirmSweep.ts`),
  snapshots and authorized reads. These live in `lib/` and DO
  import from `db/`.

When you add code: keep new computation pure, and if it needs the
database, either put the write path in a `db/` module or put the
coordination in an orchestration module. Don't add DB reads to a
module that is currently pure — split the pure core out instead.

### `db/` — persistence and transactions

| Module | Responsibility |
|--------|---------------|
| `database.ts` | Dexie schema — 33 versions deep. Core stores (`members`, `posts`, `exchanges`, `invites`, `vouches`, `secretKeys`, `settings`, `achievements`) plus the later families: projects (`projects`, `projectTasks`, `projectActivity`), events (`events`, `eventRsvps`, `eventShifts`, `shiftSignups`, `eventProjectLinks`), governance (`proposals`, `votes`), messaging (`messages`), federation (`outbox`, `nodeConfig`), and safety (`blocks`, `previouslyBlocked`, `pairingLog`, `drafts`, `coorgInvitations` + responses/revocations). The schema comments in the file are the canonical ledger; `docs/roadmap.md` "Migration strategy" tracks version reservations |
| `seed.ts` | First-launch demo community (dev builds only) |
| `actions.ts` | Post lifecycle (`createPost`, `claimPost`, `confirmExchange`, …) |
| `secrets.ts` | Session-aware `getSecretKey`, enable / change / disable passphrase |
| `invites.ts` | `issueInvite`, `redeemInvite`, `revokeInvite`, `listInvitesFrom` |
| `projects.ts`, `events.ts`, `eventShifts.ts`, `messages.ts`, `proposals.ts`, `blocks.ts`, `adoption.ts`, `coorgInvitations.ts`, … | Each later feature family carries its own write path in its own module, same transaction discipline |

Every write path lives in a `db/` module. Components and pages
should never call `db.table.put()` directly — route it through the
feature's action module.

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

Every write path lives in a `db/` module — components and pages
never call `db.table.put()` directly. Network lives in the `lib/`
orchestration layer (`outbox.ts` pushes, `federationSync.ts` pulls).
React lives in `components/`, `pages/`, `state/`. Pure computation
stays DB-free and is tested without a DOM (see the `lib/` note in
§3 for the pure-vs-orchestration split).

### Lock state is a first-class app state

Anywhere that signs has to call `getSecretKey()` rather than reading
`db.secretKeys` directly. A locked session refuses to sign; callers
present that to the user as a re-authentication prompt (the
`LockScreen`).

## 5. Running the tests

```sh
npm test                                   # one-shot, all workspaces
npm run test:watch --workspace apps/web    # file-watching, develop-friendly
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

Federation is live (the server's peer pull loop syncs nine record
kinds between configured peers: exchanges, vouches, posts, task
comments, co-organizer invitations + responses + revocations,
events, and event cancellations), and the same discipline that made
that possible still applies to every new record type:

- Exchanges are signed and verifiable by `verifyExchange()` without
  DB access.
- Vouches are signed and verifiable by `verifyVouch()`.
- Invites are signed and verifiable by `decodeAndVerifyInvite()`.
- Everything carries a `nodeId` so peers can resolve "who said
  this" — node identity is advertised via `GET /config` and bound
  to the peer URL on pull.

When you add a new record type, ask: "If I federate two nodes' copies
of this table, what does the merged state look like?" If the answer
is "it depends on which came first," you need a CRDT strategy.

## 8. Performance targets

- Cold load on a mid-range 3G connection: **< 3 seconds.**
- Bundle size after gzip: **< 200 KB** main + a small PWA shell —
  **currently violated**: the main chunk is ~433 KB gzip (~1.5 MB
  raw) as of v0.3.0, with no route-level code splitting and the
  full bilingual template content (~111 KB gzip) statically
  imported. Lazy-loading the template content and splitting the
  heaviest routes (`ProjectDetail` is 3,200+ lines) is the tracked
  follow-up; until that lands, treat the 200 KB line as the target
  to climb back down to, not a passing check.
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
