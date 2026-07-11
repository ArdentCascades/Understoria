# Understoria — Next-cycle plans

> **Status:** **proposed** — six detailed plans for the next
> development cycle, drafted for operator review and annotation. No
> implementation PRs yet; each plan names its own first PR. Read
> alongside [`roadmap.md`](./roadmap.md) (whose stage E — "pilot
> deployment with real users" — is the moment these plans serve) and
> the design-principles ledger
> (`apps/web/src/content/design-principles.ts`).
>
> One candidate was deliberately deferred by operator request and is
> named here so it isn't lost: **a third interface language**, using
> the agent author→adversarial-review→mechanical-validation pipeline
> proven on the task tips and starter steps. It should be picked
> *with* a pilot community, not guessed at.

---

## How to read this document

Each plan states why it's here, what exists today (with file
references — every claim below was checked against the code, not
remembered), the design, the PR sequence, the verification bar, and
the open questions that need an operator ruling before code. Rulings
are collected in §8 at the end so they can be answered in one sitting.

Recommended overall order:

| Order | Plan | Type | Blocked on |
|-------|------|------|-----------|
| 1 | Plan 3 — pilot-readiness package | docs + small feature | nothing |
| 2 | Plan 1 — harvest the two ratified designs | feature | rulings R1–R4 |
| 3 | Plan 2 — credit-model decision (issue #6) | governance doc | nothing (decision), adoption (build) |
| 4 | Plan 5 — E2E smoke suite in CI | engineering health | nothing |
| 5 | Plan 4 — performance as accessibility | engineering health | Plan 5 (the safety net for it) |
| 6 | Plan 6 — photos, eyes open | design doc only | pilot demand signal |

Plans 3 and 5 can interleave with anything. Plan 4 deliberately waits
for Plan 5: route-splitting touches every page's load path, and the
smoke suite is what proves no route broke.

---

## Plan 1 — Harvest the two ratification-ready designs

> Builds: [`ways-to-plug-in.md`](./ways-to-plug-in.md) and
> [`direct-exchange-label.md`](./direct-exchange-label.md), both
> **proposed** design notes whose §9 phase lists are already written.
> This plan adds only what those notes deliberately left out: the
> rulings needed to start, the build order across BOTH designs, and
> the verification bar.

### 1.1 Why first among the features

Highest value per unit of new decision-making on the board: the
designs are drafted, argued, and phase-decomposed; every boundary
(§4 of each note) is already defended. What blocks implementation is
four rulings (each with a recommended default, §8 below) and a
ratification nod. Both designs serve the same member moment — "I
have hours and goodwill; where do they go?" — from opposite ends:
the shelf finds work *before* it happens; the direct label records
help *after* it happened outside every existing artifact.

### 1.2 Build order

**Direct-exchange first, shelf second.** The direct-exchange work is
mostly *locks on existing consumers* (`timebank.ts` no-ops,
auto-confirm refusal, dispute fallback) — it hardens the exchange
core before the shelf adds a new read surface linking into those same
flows. And the shelf's shift section reads better once the
plain-event credit affordance exists: every listed shift can honestly
end in recorded credit.

Sequenced PRs (names from the notes' own §9 lists):

1. **DX-B (shared):** `isDirectExchangeLabel` + namespace-grammar
   tests (`direct:` + 36-char uuid, nothing else); consumer no-op
   locks (`timebank.ts` `projectConfirmationOutflow` skip,
   `balanceFor` indifference); explicit `/auto-confirm`
   `post_not_found` test for a `direct:` label.
2. **DX-C (client):** the direct-exchange form + two-signature
   ceremony reusing the confirm-flow signing mechanics unchanged;
   `assertWithinDailyLimit` + `evaluateSafeguards` wiring; dispute
   and display "recorded directly — no post" fallbacks; i18n en/es.
3. **DX-E (entry points):** the passed-shift affordance on plain
   events + the profile "Record time together" affordance (per
   ruling R3); threat-model §7 paragraph extension naming `direct:`
   as the sanctioned no-correlator path.
4. **WP-B (matcher):** pure `lib/plugIn.ts` — token-overlap matcher
   + section builder over posts/tasks/shifts, unit-tested against
   fixture rows, no UI.
5. **WP-C (surface):** the page + Board entry link (per ruling R1),
   the four sections in the note's fixed order, unmatched remainder
   collapsed but present, i18n en/es, accessibility DOM order.

Both notes' "PR D — server: LOUDLY SKIPPED" stands: **zero server
changes in this whole plan.**

### 1.3 Verification bar

- Namespace grammar test-locked; a label like `direct:event-123`
  must FAIL the predicate (the §3 boundary as a test, not a comment).
- Auto-confirm can never finalize a `direct:` exchange — explicit
  test, not incidental behavior.
- Dispute flow renders a `direct:` exchange without a post — live
  browser pass, not just unit.
- Shelf: a fixture member with offer categories sees matched
  sections; a member with NO offers/skills still sees everything
  (matching is a lens, not a gate) — both locales.
- Negative-space tests in the house style: no rows written by
  browsing the shelf, no new outbox kinds from it, no rail items, no
  badges anywhere in either feature.

### 1.4 Effort

Direct-exchange ≈ 3 PRs (the middle one substantial — a new signing
ceremony surface). Shelf ≈ 2 PRs, mostly UI. Combined, roughly the
size of the ADHD round-3 arc.

---

## Plan 2 — The credit-model decision (issue #6)

### 2.1 Why now, and why a document rather than code

This is the single most load-bearing open question in
[`roadmap.md`](./roadmap.md) (open-design-questions table): it gates
the balance cap and community pool (Agent 19) and, transitively, the
federation mutual aid fund (Agent 21). It is also the kind of
decision that gets **harder after a pilot creates real balances** —
changing who is debited retroactively re-values every ledger row.
The deliverable this cycle is a decision document taken through
governance, not an implementation.

### 2.2 What the code does today (the facts the decision rests on)

- **Balance is a zero-sum fold, never stored**
  (`apps/web/src/lib/timebank.ts` `balanceFor`): seed balance + hours
  helped − hours received, over the signed exchange log. Every hour
  gained by one member is an hour lost by another. **This zero-sum
  property is the anti-gaming backbone**: two colluding members can
  shuffle hours between themselves but never create purchasing power
  from nothing.
- **Project tasks debit the confirming organizer**
  (`apps/web/src/db/projects.ts` `confirmProjectTaskCompletion`:
  `helpedKey = organizerKey`). The organizer personally funds every
  confirmed task. The UI already carries the display-honesty
  mitigation (`projectConfirmationOutflow` in `timebank.ts`): an
  organizer's outflow is shown as hours moved on the community's
  behalf, not personal consumption.
- **The only non-member signer is the node system key**
  (`apps/server/src/systemSigner.ts`), deliberately bounded to
  signing the confirmation half of an already-helper-signed record —
  it cannot synthesize records or invent hours, and extending it
  requires amending [`auto-confirm-key.md`](./auto-confirm-key.md).
- **No pool and no issuance exist.** Every exchange debits a real
  member key.
- The political-education notes
  (`docs/political-education/README.md`) already carry the Kasmir
  caution about balance caps and collective surplus — the reason
  Agent 19 isn't on the immediate roadmap.

### 2.3 The three models, analyzed

**Organizer-debit (status quo).** Honest, zero-sum, shipped, with
display mitigation. Its real cost: organizing is *personally
expensive* — a busy organizer drifts far below seed, their balance
stops meaning anything, and members may hesitate to claim tasks
because "it comes out of Rosa's hours."

**Issuance.** Task confirmation mints credit with no debit. Matches
the intuition "project work benefits the commons, so no individual
should pay" — but it **breaks the zero-sum backbone**: a pair of
colluding members with a fake project could mint unbounded credit
(today the same collusion is a harmless zero-sum shuffle). Every
anti-gaming safeguard would need redesign, and the money supply
becomes a governance problem on day one. High risk, and Kasmir's
caution applies squarely.

**Community pool.** A community-held balance that funds project
credit. The question issuance dodges — *where does the pool's
balance come from?* — is the whole design. A pool seeded from
nothing is issuance wearing a hat. A pool that must be **funded by
voluntary member contributions** stays zero-sum. But a pool needs an
identity that can sign the helped side of exchanges, and no such key
exists; extending the system key breaches its bounded design, and a
new quorum-held pool key is a heavy ceremony (member-removal-scale)
for an everyday flow.

### 2.4 Recommendation: organizer-debit + voluntary backing (a pool without a pool key)

Keep the organizer-debit *mechanism* — it is honest, shipped, and
zero-sum — and relieve its real cost with **backing transfers**: any
member can chip in hours to back a specific project, recorded as an
ordinary two-signature exchange (contributor → organizer) labeled
`project:<projectId>/backing`. The project page shows pooled backing
(sum of backing in, minus confirmation outflow) so the community can
see when a project is running on the organizer's personal hours and
top it up. Nothing new signs anything: contributions are normal
consensual exchanges; the organizer remains the steward;
`projectConfirmationOutflow` already computes the outflow half.

Why this shape wins: zero-sum is preserved (collusion still cannot
mint), no new signing authority exists (the `community-authority`
principle holds), the organizer's underwater-balance problem gets a
community-visible remedy instead of a monetary redesign, and the
whole thing is reversible — if a pilot shows it unused, removing it
strands no ledger semantics. Revisit issuance only if pilot evidence
shows voluntary backing structurally under-funds real organizing.

### 2.5 Deliverables and process

1. **`docs/proposals/project-credit-model.md`** in the house
   proposal structure (one question up front; explicitly a
   governance decision; recommendation; what changes / what does NOT
   change; alternatives considered and rejected — issuance and the
   keyed pool, per §2.3; rollback; open questions).
2. Taken through **modified consensus** (`GOVERNANCE.md` §2):
   proposal → ≥7-day discussion → decision → consent check.
3. On adoption: close issue #6, un-gate the Agent 19 roadmap row
   (re-scoped to whatever was decided), and implement backing
   transfers (~2 PRs: label + ledger display; contribution flow +
   project-page surface).

### 2.6 Open question for the operator (R5, §8)

Whether the recommendation in §2.4 is the position the proposal doc
should argue, or whether it should present the three models neutrally
and let the community pick. Recommended: **argue §2.4** — a proposal
with a defended recommendation and honest alternatives is how every
prior Understoria decision doc reads; neutral surveys stall.

---

## Plan 3 — Pilot-readiness package

### 3.1 Why

[`roadmap.md`](./roadmap.md) stage E — "pilot deployment with real
users" — is marked *now*, and a half-dozen deferred rows are gated on
"pilot signal." But "pilot" appears 115 times across 27 docs without
a single document saying **how to actually run one**, and a
no-telemetry app has no defined way to collect the signal everything
is waiting for. This plan turns "do a pilot" into a procedure. It is
docs-heavy, ships fast, and nothing else should wait on it.

### 3.2 Part A — `docs/pilot-playbook.md`

A single operational document for the founding operator + organizers:

- **Preflight (week −2 to 0):** the operator-guide §9 security
  posture checklist run once; backups verified restorable
  (`backup-db.sh` + a restore rehearsal); both Infrastructure-page
  drills (storm-hub, re-seed) run once with `lastDrilledAt` fresh;
  mirror pairing if a second host exists; every pilot member
  reachable through a non-Understoria channel (§9 already requires
  this); printed offline kit posted.
- **The knobs the pilot must ratify**, collected in one table with
  their defaults and where they live: `autoConfirmHours` (168),
  `proposalDeliberationDays` (3), `proposalMinAffirms` (2), the
  [`auto-confirm-key.md`](./auto-confirm-key.md) §7 open questions.
  The pilot's first proposal should be "adopt or adjust these
  defaults" — it exercises the Decisions surface on a real, low-stakes
  question.
- **Week-by-week attention list:** what to look at (not measure —
  look at) each week: are posts getting answers, are claims sitting
  unconfirmed past the window, did anyone hit the storage meter, has
  anyone needed the recovery path, is the safeguards flag firing.
  Each item names where in the UI or the operator's SQLite the answer
  lives, and names the roadmap row its answer un-gates.
- **Exit criteria for stage E:** the concrete observations that let
  the deferred rows move ("a dispute happened and the flow was/wasn't
  enough" → Agent 14 scope; "ceiling X was approached" → pruning
  policy design; "members asked for photos" → Plan 6 activation).
- **Incident pages:** short what-if entries reusing existing runbooks
  (node loss → re-seed; key loss → recovery kit / guardian shards;
  member conflict → dispute flow + `blocking.md`), so the operator is
  never improvising a procedure that already exists.

### 3.3 Part B — the pilot journal (feedback without telemetry)

There is no feedback mechanism in the app today (verified — no
route, form, or outbox kind), and the ethos forbids the usual fixes
(analytics, error reporting, server-side counters). The gap is real:
pilot signal currently depends on members remembering frustrations
until someone asks.

**Design: a local-only journal, exported by hand.**

- A "Pilot journal" card (Settings → or Help): free-text entries,
  timestamped, stored in a new Dexie table `journalEntries` —
  classified `WINDOW_LOCAL` in `storageWindow.ts`, **no outbox
  kind**, excluded from the pairing snapshot, cleared by soft purge —
  the `taskPlans` privacy pattern applied verbatim, each boundary
  test-locked the same way.
- Included in the member's own data export (it is their writing);
  a dedicated "Share my journal" button composes entries into a
  plain-text file download the member physically hands to the
  operator (or reads aloud at a check-in). **The hand-off is the
  consent ceremony** — there is deliberately no send button.
- One quiet doorway, pull-only: a line on the Help page ("Keeping a
  note of what's confusing helps the pilot"). No prompts, no
  nagging, no streaks, nothing on the rail.

Effort: one small PR (table + card + export inclusion + boundary
tests + i18n).

### 3.4 Part C — the auto-confirm enforcement flip, as a runbook

The `AUTO_CONFIRM_REQUIRE_TRANSITION` flip is currently one sentence
of intent in [`auto-confirm-key.md`](./auto-confirm-key.md) ("the
operator's rollout step") with no procedure. The runbook (a §6
addition to the operator guide, cross-linked from the playbook):

1. Confirm every pilot device runs an artifact-emitting build. The
   app displays no version today, so this runbook has one small code
   prerequisite: a build stamp (short commit hash injected at build
   time) shown quietly in Settings, so "read me your build stamp"
   works over any channel. With `registerType: "prompt"`, updates
   activate only on explicit refresh — the operator asks each member
   to tap Refresh when prompted, then verifies stamps.
2. Wait out one full auto-confirm window (default 7 days) so
   in-flight confirmations drain.
3. Spot-check `awaiting_transitions` rows exist for recent
   confirmations (one SQLite query, provided verbatim).
4. Set the env, restart, verify a synthetic no-artifact request is
   refused with `missing_transition` (curl provided verbatim).
5. Rollback is unsetting the env — state is untouched either way.

### 3.5 Part D — drill visibility (small, optional)

The Infrastructure page's `DRILLS` array is extensible. Add a third
card: **backup-restore drill** (take a backup, restore to a scratch
container, boot it, see real data) — the one recovery path with a
runbook but no tracked drill. Small PR; skippable if the cycle runs
long (ruling R6).

---

## Plan 4 — Performance as accessibility

### 4.1 Why this is an equity item, not a vanity metric

Mutual aid members are disproportionately on low-end Android phones.
Today `App.tsx` statically imports all 41 pages — there is **zero
`React.lazy` anywhere in the app** — so a member on a $50 phone
parses ~1.5 MB of main-chunk JS (plus the 0.8 MB content chunk) to
render a Board they could have seen for a fraction of that. The
service worker hides this after first install, but first visit — the
moment a curious neighbor taps an invite link on mobile data — pays
full price. That first visit is exactly the member the app most
wants to welcome. Same reasoning as the a11y arc: the cost falls on
the people with the least slack.

### 4.2 What exists (verified)

- Vite 8 (rolldown) with one `codeSplitting` group: `content`
  (`vite.config.ts`) — 0.8 MB of authored data already split.
- Workbox precaches every chunk (`globPatterns` includes `**/*.js`),
  so **split chunks stay fully offline-capable** — precache
  continues to download everything in the background; splitting
  changes what must be parsed *before first paint*, not what is
  available offline.
- `registerType: "prompt"` — updates activate on explicit refresh,
  which matters for §4.4's stale-chunk hazard.
- Heavy cold corners confirmed: 7 print pages + `Present` (kiosk) +
  `GrowRoot` all pull `qrcode`; `AddDevice` pulls the BIP39 wordlist;
  `PairDevice`/`AddDevice`/`RecoverIdentity` pull device-pairing
  crypto; `ProjectDetail` alone is 3,023 lines.

### 4.3 Phases

**P-A — measure and pin (first, small).** A `scripts/bundle-budget.mjs`
that runs after `vite build`, reads `dist/assets/*.js` sizes, and
compares against a checked-in `bundle-budget.json` (per-chunk gzip
ceilings). CI fails on exceed; raising a ceiling is a reviewed diff
with a stated reason. This makes bundle growth a *decision* — the
starter-steps content grew the main chunk 250 KB and nothing in the
process noticed until workbox refused it. Ship this before any
splitting so the wins get pinned as they land.

**P-B — split the cold corners.** `React.lazy` + one shared quiet
`Suspense` fallback (skeleton, no spinner flash) for the routes a
first-visit member never touches: all 7 `/print/*` pages, `/present`,
`/pair-device`, `/add-device`, `/recover`, `/grow-root`,
`/help/start-a-community`. This strands `qrcode`, the BIP39
wordlist, and the pairing crypto out of the main chunk. Low risk:
none of these are in the first-session path, and the pre-onboarding
routes (`/invite`, `/pair-device`, `/welcome`) get an explicit test
that they still render before onboarding.

**P-C — split the heavy interiors.** `/project/:id` (3,023 lines),
`/proposals`, `/profile`, `/events/new` + `/project/new` (template
pickers), `/desk`, `/infrastructure`, `/disputes`. Board, Dashboard,
Calendar, Messages, task pages stay eager — they ARE the first
session. Expect main chunk to land well under half its current size;
exact ceilings get pinned by P-A as measured, not promised here.

**P-D — the stale-chunk hazard.** With `prompt`-mode updates, a tab
running build N that lazy-loads a chunk after build N+1 deploys can
hit a missing-chunk error. Add a chunk-load-error boundary that shows
the existing UpdatePrompt refresh flow (reusing its copy), never a
crash. This must land in the same PR as the first split (P-B), not
after.

### 4.4 Verification bar

- Bundle budget in CI, ceilings tightened to post-split reality.
- The Plan 5 smoke suite green across every split route, including
  offline: with the dev server killed and only the service worker,
  print pages and pairing pages still render (precache covers them).
- A throttled-profile first-visit measurement (Chrome CPU 4×
  slowdown, Fast 3G) before/after, recorded in the PR body — one
  honest number, not a dashboard.
- jsx-a11y and the palette guards unaffected (no markup changes
  beyond Suspense wrappers).

---

## Plan 5 — An E2E smoke suite in CI

### 5.1 Why

CI today (single workflow, `.github/workflows/ci.yml`) runs
typecheck, lint, 2,569 unit tests, the PWA build, and the server
build — but **no browser ever starts**. Every live verification this
project has ever had (the claim flows, ICS downloads, consent cards,
locale passes) was a hand-run script, discarded after its PR. Two
consequences: regressions in flows no unit test can see (service
worker, real IndexedDB, chunk loading, downloads), and no safety net
for exactly the kind of change Plan 4 makes. The demo seed
(`seedDemoCommunityIfDev`, gated on `import.meta.env.DEV`) means a
fresh browser profile against the dev server lands in a fully
populated community with zero fixtures — the suite's fixture story
already shipped as a feature.

### 5.2 Design

- **`@playwright/test`** as a root devDependency; specs in
  `apps/web/e2e/`; config uses Playwright's `webServer` to start
  `vite --port 5199` (dev server → seeded). Chromium only — the
  suite is a smoke net, not a browser matrix.
- **The specs are ports of the proven manual passes** (~8, target
  <5 minutes total):
  1. First-run boot: Board renders, seeded project visible, no
     console errors.
  2. The claimer arc: one-small-thing → open → claim → tip +
     claim-moment block → suggested steps seed → step toggles →
     resume card on Dashboard.
  3. Shift signup: consent card (two-step "Sign up"), roster line,
     "You're on this shift".
  4. ICS downloads byte-checked: shift file (SUMMARY/LOCATION), and
     the no-VALARM/no-ATTENDEE ethos lock as an assertion.
  5. Post flow: NEED post → visible on Board → claim.
  6. Spanish pass: `understoria.language=es` init script, the same
     claimer arc's key strings.
  7. Production boot: one spec against `vite preview` (no seed):
     Welcome renders, zero page errors, service worker registers.
  8. Print page renders with a QR (canary for Plan 4's lazy qrcode).
- **CI:** a fourth job, parallel with `build-and-test`
  (`npx playwright install --with-deps chromium`, browser binaries
  cached on the Playwright version); trace + screenshots uploaded as
  artifacts on failure only; `retries: 1` in CI, 0 locally — a spec
  that needs its retry twice in a week gets fixed or deleted, not
  quarantined indefinitely.
- **Flake discipline is a stated policy in the config header:** every
  wait is condition-based (the house lesson: click-and-wait over
  `check()` on controlled checkboxes; drive downloads via the
  download event), no bare timeouts above 2s, and the suite stays
  under ten specs — a smoke net that is trusted beats a thorough one
  that is ignored.
- **Local gates addendum** (`developer-guide.md`): the pre-PR gate
  becomes typecheck + lint + unit + **build** + e2e — codifying the
  #427 lesson that tests-green ≠ CI-green when the PWA build is the
  thing that breaks.

### 5.3 Effort

Two PRs: harness + first three specs; then the remaining specs +
developer-guide addendum. The manual scripts already exist as
references, so this is porting, not inventing.

---

## Plan 6 — Photos, eyes open (design doc only)

### 6.1 Position

**Do not build photos this cycle.** [`storage-budget.md`](./storage-budget.md)
already carries the standing rule: *"media never enters the
replicated record set without its own values conversation and its
own budget design."* This plan prepares that conversation so that
when a pilot community asks for photos in week one — they will — the
answer is a considered document instead of an improvisation, and the
cheap safety work ships now.

### 6.2 What ships this cycle (small, no-regret)

1. **An opsec-guide section on photo metadata.** Today the guide has
   one sentence about recognizable backgrounds and nothing on
   EXIF/GPS. Members already share photos *about* mutual aid work on
   other channels; guidance on stripping location metadata (and on
   faces + consent in crowd shots) is due regardless of whether the
   app ever hosts an image.
2. **A "why no photos yet" FAQ entry** (Help page, en/es), honestly
   naming the three costs — storage on cheap phones, federation
   weight, and location/face safety — and pointing at the journal
   (Plan 3) as the place to say "I needed a photo here."
3. **The design skeleton below, ratified as the framework** so the
   eventual proposal argues inside agreed constraints.

### 6.3 The design landscape (for the eventual doc)

Three architectures, two of which can be pre-rejected:

- **(a) Local-only photos** — never leave the device. Cheap, but
  photos exist to be *shown*; a photo only its taker can see serves
  almost nothing. Rejected as the primary design (may return as a
  private-plan nicety).
- **(c) Replicated media** — photos as federated records. Rejected
  outright by the storage-budget arithmetic: one photo outweighs a
  thousand records, and every member's phone pays for every photo.
  Phase-3 hash-slices would be a prerequisite even to argue it.
- **(b) Node-hosted attachments** — the only viable shape. A photo
  is uploaded once to the community node (a new route with its own
  `bodyLimit` — the global 64 KB cap stands for everything else),
  stored outside the record set, and *referenced by content hash*
  from at most one optional image per post/project/event. Records
  stay small; the wire protocol is untouched; member-authenticated
  reads and at-rest encryption already cover the node.

Hard requirements the eventual proposal must satisfy, named now:

- **Client-side re-encode at attach time** (canvas → WebP, bounded
  dimensions, ≤200 KB) — which strips EXIF/GPS *structurally* rather
  than by policy.
- **The §2 asset list grows**: images of members, homes, and meeting
  places are a new asset class (faces are identity), with its own
  threat-model §7 entry answering the §8 reviewer checklist.
- **Every data-lifecycle surface enumerates the new store**: export
  (own photos included — the export's include-by-default pattern
  makes this automatic, so the *test* is that it round-trips),
  pairing snapshot (excluded; re-fetch by hash), panic purge (blobs
  deleted — test-locked), storage meter (photos counted separately),
  per-member byte quota on the node (the insert caps bound rows, not
  bytes — photos need the byte-side twin).
- **No image ever rides an `Exchange`, vouch, vote, or governance
  record** — attachments belong to descriptive surfaces only.

### 6.4 Activation gate

The proposal doc gets written when the pilot journal (Plan 3)
produces real photo asks — with the actual use cases quoted in its
"why now" section. Until then, §6.2 is the whole deliverable.

---

## §7 What this cycle deliberately does not plan

- **Third interface language** — deferred by operator request;
  pipeline named in the header note.
- **Anything gated in roadmap.md's deferred table** whose gate hasn't
  moved (community web graph, federation fund, receive-time key
  retirement, multi-hop key discovery, trusted-node allowlist).
  Plan 3's exit criteria are how those gates get their pilot signal.
- **Pruning/quota policy** for legitimately full tables — needs the
  pilot signal Plan 3 exists to collect.

## §8 Rulings needed (collected)

| # | Plan | Question | Recommended default |
|---|------|----------|---------------------|
| R1 | 1 | Shelf entry: Board link vs. fifth tab | **Link** — tabs are permanent geography; the surface should earn one in the pilot |
| R2 | 1 | Pre-build profile-skills editing before the shelf? | **Ship with what exists** — offer categories match usefully; the shelf itself motivates adding skills |
| R3 | 1 | Direct-exchange profile entry point in phase 1? | **Ship both entry points** — the consent floor (mutual signature) doesn't weaken with generality; narrowing later is a one-line UI removal |
| R4 | 1 | Does the shelf surface `direct:`-creditable moments? | **No** — the shelf reads open work; direct credit is retrospective. Coupling them buys nothing |
| R5 | 2 | Proposal argues §2.4, or presents three models neutrally? | **Argue §2.4** (organizer-debit + voluntary backing) with honest alternatives — neutral surveys stall |
| R6 | 3 | Include the backup-restore drill card? | **Yes** — smallest item in the package; the only recovery path without a tracked drill |
| R7 | 4 | Split the heavy interiors (P-C) this cycle or stop at cold corners (P-B)? | **Both, sequenced** — P-B alone strands the crypto/QR weight, but P-C is where the phone-parse win lives; P-C waits for the Plan 5 net |
| R8 | 6 | Ship the §6.2 no-regret items now? | **Yes** — the opsec gap exists independent of any app feature |
