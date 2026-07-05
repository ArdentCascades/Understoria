# Understoria — Node System Key for Auto-Confirmation (design note)

> **Status:** **shipped.** Design note + threat-model §7 entry
> landed in PR #150; the implementation (`apps/server/src/systemSigner.ts`,
> `NODE_SYSTEM_SECRET_KEY` env config, the 7-day sweep, the
> `scripts/generate-system-key.mjs` keygen, and the `/api/config`
> rotation-history advertisement) shipped in PR #152. Operator
> instructions for generating, rotating, and backing up the key
> live in [`deploy-linode.md`](./deploy-linode.md) §6 and §9; the
> rotation incident template is `incident-templates.md` §1. Pairs
> with the threat-model §7 entry "Node system key for auto-
> confirmation" and the existing safeguard-thresholds entry. Read
> alongside `GOVERNANCE.md` §3 (Node Operator role) and
> `docs/threat-model.md` §6 (no central ledger; signed-by-both-
> parties model).

---

## 1. Problem

Credit does not flow when one of the two parties stops responding. The
shipped `confirmExchange` (in `apps/web/src/db/actions.ts`, ~line 208)
requires both sides to confirm before an `Exchange` row is signed and
written. An unresponsive counterparty silently blocks the helper's
credit — indefinitely.

For project tasks the prohibition is sharper. `confirmProjectTaskCompletion`
in `apps/web/src/db/projects.ts` (~line 600) explicitly refuses
self-confirmation:

> `if (task.completedBy === organizerKey) throw new Error("An organizer
> who completes a task themselves needs a different project member to
> confirm.");`

This is the right rule — a member cannot attest credit to themselves —
but it has a corner case the existing code already flagged. The comment
at `apps/web/src/db/projects.ts:62` reads:

> `48-hour auto-confirm when organizer is the completer — still deferred`

When the project organizer is also the task completer and no co-organizer
acts, credit cannot flow at all. Today the helper either chases the
community for a confirmation or absorbs the loss. Both outcomes violate
`solidarity-not-shame` (a `design-principles.ts` principle), and the
second one quietly transfers cost from the system to the most generous
member.

Auto-confirmation is the hook the existing code anticipated. The
question this document answers is not whether to ship it but **what
signs the auto-confirmation record**, given that the helper cannot
sign it themselves and there may be no second member willing to act.

## 2. The values tension

Understoria's `design-principles.ts` entry `community-authority` is
explicit:

> "No admin role. Governance decisions go through community proposals,
> not individual power."

`GOVERNANCE.md` §3 names a **Node Operator** role — but its scope is
deliberately narrow: running the hosting, deploying updates, handling
the security posture. The operator is not a moderator, not a
treasurer, and has no standing authority over members' records. Every
authoritative artifact in the system today (exchange, vouch, invite,
proposal vote, task comment) is signed by a *member's* key. There is
no key in the system whose signature stands in for a community
decision.

A per-node system signing key that produces valid `Exchange`-shaped
records is the closest the codebase has ever come to admin
authority. We will not soften that. It is a new privileged role,
and the §8-style review questions in `docs/threat-model.md` apply
to it directly: it is a new privileged role; is it rotatable
(yes — §4 below); revocable (yes — operator can rotate or set the
threshold to 0); does it undermine a core mitigation (it changes
the "signed by both parties" framing of §6 and must be honest
about that). The honest case for accepting it rests on four
bounds, each of which must hold in code and be testable:

1. **The key only signs auto-confirm records.** It cannot sign a
   fresh exchange, a fresh vouch, a fresh invite, a vote, a
   proposal, or anything else. Its scope is one record shape,
   one purpose.
2. **It only signs after a community-configured human window.**
   Default 7 days; `autoConfirmHours = 0` disables the sweep
   entirely. The community owns this threshold through the
   existing per-node `NodeConfig` surface (Agent 11). A
   community that does not want auto-confirm never gets it.
3. **Every record it signs is publicly tagged as auto-confirmed.**
   `autoConfirmed: true` plus `confirmedBy: "system:<nodeId>"` (or
   equivalent — final shape decided at implementation time against
   `packages/shared/src/types.ts`). A verifier downstream can tell
   a system-signed auto-confirm from a member-signed mutual
   confirm without having to know anything about this node's keys.
4. **It cannot invent records.** The helper's signature on the
   completion (already present when a task reaches
   `awaiting_confirmation`, or when a post-side exchange reaches
   the awaiting state) is the precondition. The system key signs
   only the *confirmation* half, never the underlying claim that
   work happened. Hours, category, postId, helperKey, helpedKey,
   completedAt — all already part of the canonical payload the
   helper signed. The system key cannot change any of them.

The bounded version is admin-shaped, not admin-strength. We are
adding the smallest privileged signature surface that solves the
problem in §1, and we are doing it visibly. The alternative —
leaving §1 unsolved — is itself a values failure (`solidarity-not-
shame`). This document exists so the trade is made in the open.

## 3. Alternatives considered (and why they're worse)

- **Completer self-signs with an `autoConfirmed: true` flag.** This
  is the path that requires the *least* new infrastructure: the
  helper, after N days, signs the confirmation half themselves and
  marks it auto-confirmed. It is also the path that directly
  bypasses `confirmProjectTaskCompletion`'s deliberate refusal to
  let the completer confirm their own work. The reason that rule
  exists — a member cannot attest credit to themselves — does not
  evaporate after 7 days. Worse: the on-the-wire artifact would
  carry a member signature attesting to the exact thing the
  existing code refuses. A future verifier reading the record has
  no easy way to tell legitimate self-signed correction work from
  fraudulent self-attribution. Rejected.

- **Exchanges-only auto-confirm; project tasks stay manual.**
  Narrowest scope. It would solve the post-side blocker (an
  unresponsive partner in a one-off help exchange) without touching
  the project-task case at all. The downside is that the cited
  problem — organizer-is-completer with no co-organizer to confirm
  — stays permanently unfixed; a helper who took on a task and
  whose organizer is now silent gets nothing. Acceptable as a
  fallback if the node-key plan is rejected later, but it does not
  solve §1 as stated.

- **Community-vouched co-organizers can confirm instead.** This is
  already what ships (Agent 10 Phase 3 broadened
  `confirmProjectTaskCompletion` from primary-only to `isOrganizer()`,
  PR #84). It is not an alternative to auto-confirm — it is the
  thing auto-confirm is the fallback for. Auto-confirm only fires
  when *no* organizer (primary or co-) has acted within the
  window.

## 4. Design

Concrete spec, high level. No code in this branch.

### Storage

A per-node Ed25519 key pair. The operator generates it at deploy
time and supplies the secret-key bytes through the existing config
surface in `apps/server/src/config.ts` (a new env var,
`NODE_SYSTEM_SECRET_KEY`, parsed by `readConfigFromEnv` and held in
the immutable `Config` object the server reads at startup —
matching the OPERATOR_* / PEER_NODE_URLS / NODE_ID pattern that
already lives there).

The server today has **no node-signing key** — `apps/server/src/server.ts`
and `apps/server/src/config.ts` carry hashed-IP buckets for rate
limiting and helmet middleware, but no signing material. The
implementation PR therefore introduces a new key; it is not
reusing an existing one. This is called out explicitly so a
future reviewer who finds two keys in the server later does not
assume one was forgotten.

The corresponding **public key is published in `GET /config`**
(`apps/server/src/routes/config.ts`) alongside the operator block,
under a new `systemKey` field. Members' PWAs and peer nodes need
the pubkey to verify the signature on auto-confirmed records;
publishing it on the same surface that already discloses the
operator identity is consistent with the existing transparency
posture (Agent 11 / former Agent 21).

If a future agent introduces a separate "node identity" signing
key (e.g. for federation-level attestations under Agent 3 / Agent
15), **the auto-confirm system key should be reused, not
duplicated.** Two operator-held signing keys would double the
surface for misuse and split the audit story. The implementation
PR must check whether such a key has landed and, if so, reuse it.

### Sweep

A worker — PWA-side on app start, or server-side cron, decided
during implementation (see §7) — walks the `awaiting_confirmation`
records whose oldest pending-confirm timestamp is older than
`autoConfirmHours`. For each, it calls a server endpoint
(working name `POST /auto-confirm`) that:

1. Re-verifies the helper's signature on the canonical completion
   payload (the same payload `confirmExchange` and
   `confirmProjectTaskCompletion` already build).
2. Signs the confirmation half with the node system secret key.
3. Writes the resulting `Exchange` row with `confirmedBy:
   "system:<nodeId>"` and `autoConfirmed: true`.
4. Emits the same downstream effects as a manual confirm — credit
   transfer, achievements diff, federation outbox enqueue. The
   record shape is the same Exchange shape that exists today; only
   the signer of the helped-side signature changes.

The mutation does **not** sign anything the helper has not already
signed. Hours, category, postId, helperKey, helpedKey, completedAt
are all part of the canonical payload signed by the helper. The
system key adds the helped-side signature only.

### Verifier distinguishability (testable property)

Any party — peer node, PWA, third-party auditor — verifying the
exchange ledger can tell a system-signed auto-confirm from a
member-signed mutual confirm by inspecting:

- `confirmedBy: "system:<nodeId>"` (vs. a member public key)
- `autoConfirmed: true` on the record
- The helped-side signature verifies against the node's published
  system pubkey, not against any known member's pubkey

This MUST be true and MUST be covered by a test in the
implementation PR: synthesize a system-signed exchange and a
member-signed exchange, assert that a `verifyExchange()` helper
returns distinct labels for them.

### Rotation

Operators can rotate the system key. The PWA / peer-node
verification path must accept signatures from any previously-
published system pubkey for records older than the rotation
timestamp. A minimal scheme:

- `GET /config` exposes a `systemKey.current` pubkey and a
  `systemKey.history: [{ pubkey, retiredAt }]` array.
- A verifier checks the record's `completedAt` (or `autoConfirmedAt`,
  if added to the record) against the rotation history and chooses
  the pubkey that was current at signing time.
- Past records remain valid; nothing in the federated outbox needs
  rewriting on rotation.

This mirrors how key rotation works in any signed-record system
and avoids ever invalidating audit history.

### Disabled state

`autoConfirmHours = 0` (the proposed default of a community that
has not deliberated yet) means the sweep is a no-op and the
endpoint refuses to sign. The community can launch with
auto-confirm OFF and turn it on after a `config_change` proposal
through the existing Agent 13 Decisions surface. This makes the
introduction of the system key a community decision in practice,
not just in theory — a community that never raises
`autoConfirmHours` above 0 never lets the key sign anything.

(Open question: whether the *default* in `DEFAULT_NODE_CONFIG`
should be 0 or 168 hours / 7 days. See §7.)

## 5. Abuse model

What a malicious or compromised node operator could do with this
key, and what they could NOT do. This is the security argument; do
not skip it on a re-read.

### What the key *can* be abused to do

- **Auto-confirm a single pending record earlier than the
  configured window.** By changing the system clock, the
  configured `autoConfirmHours`, or the sweep code itself, an
  operator can fire an auto-confirm sooner than the community
  expects. *Mitigation:* the auto-confirm timestamp
  (`autoConfirmedAt`, included in the signed payload) is in the
  signed record. A peer node or auditor can detect early-fire by
  comparing it to the original `awaiting_confirmation` transition
  time on the underlying post / task (which is also signed and
  federated). Detection is post-hoc, not preventative.

- **Refuse to run the sweep.** An operator can set
  `autoConfirmHours = 0`, or simply not deploy the sweep, leaving
  unresponsive-partner credit blocked forever. This is a
  denial-of-service against credit flow, but it is **equivalent to
  today's status quo** — the unresponsive-partner case is
  already a permanent block. The threshold being community-
  configurable (Agent 11) means the community can choose what
  "responsive enough" means, and the operator cannot silently
  raise the bar without that choice surfacing in
  `GET /config`.

- **Auto-confirm a record whose underlying completion claim is
  socially questionable.** The system key signs the *confirmation*
  side; it cannot vouch for whether work actually happened. An
  operator colluding with a member who files bogus completions
  could let the bogus completions auto-confirm. *Mitigation:* the
  helper's signature is still on the record, so the bogus claim is
  publicly attributable to that member; the existing safeguards
  module (`apps/web/src/lib/safeguards.ts`) still applies and can
  flag short-duration or reciprocal-pair patterns; community
  moderation (Agent 12, pending) is the eventual response. This
  case is not new — a member can file bogus claims today and find
  a friendly co-organizer to confirm them. Auto-confirm shifts the
  collusion partner from "a co-organizer" to "the operator," which
  is a smaller surface but a more concentrated one. Worth naming.

### What the key *cannot* do

> **Round-4 correction — read this first.** The guarantees below were
> originally argued from the *honest sweep's* behavior, but the
> `POST /auto-confirm` endpoint is unauthenticated and takes the
> confirmation's fields (`helpedKey`, `hours`, `category`, and the age
> via `awaitingSince`) from the request body. As first shipped it did
> not consult any signed artifact, so a caller could mint a
> node-signed exchange debiting an arbitrary victim for arbitrary
> hours. That hole is now closed by **authority binding**
> (`routes/autoConfirm.ts` `bindToPost`): for a real post the endpoint
> requires the poster-signed post to exist and the confirmed-for party
> (helped side of a NEED, helper side of an OFFER), the hours, and the
> category to MATCH what the poster signed. The claims below hold
> *given that binding*. Two residuals remain, named honestly:
>
> - **The time window is now enforceable via the signed
>   awaiting-transition artifact** (this closes the residual as
>   originally filed). When an exchange enters `awaiting_confirmation`,
>   the acting party signs an `AwaitingTransition` record and the
>   client pushes it to `POST /awaiting-transitions`, where the node
>   stamps its OWN clock (`received_at`, first-writer-wins per
>   postId). `/auto-confirm` substitutes that stamp for the
>   client-claimed `awaitingSince` before the window check — so the
>   window is wall-clock waiting on the node's clock, which no client
>   can backdate; a fabricated artifact still has to SIT on the node
>   for the full window. What remains client-shaped: with
>   `AUTO_CONFIRM_REQUIRE_TRANSITION` unset (the rollout default), a
>   request with NO artifact falls back to the old advisory
>   `awaitingSince` so legacy clients keep working — the flip to
>   `missing_transition` refusal is the operator's rollout step, and
>   until it is flipped an attacker can simply omit the artifact. The
>   binding gates (below) hold either way.
> - **Project-task auto-confirms are covered by the artifact too.**
>   Projects are local-only and don't federate (`threat-model.md` §7),
>   so `bindToPost` still can't check hours/parties against a signed
>   post for a `project:<id>/task:<id>` request — that path keeps the
>   generous hours cap as its bound. But the artifact is keyed on the
>   LABEL, so the waiting window is now enforceable for tasks exactly
>   as for posts (and in enforced mode a task confirmation with no
>   artifact is refused outright).

- **Invent exchanges against an arbitrary victim.** With `bindToPost`,
  a post-based confirmation can only name as the confirmed-for party
  the actual poster of a real, poster-signed post — the system key
  cannot fabricate a debit against someone who never posted. (The
  claimer side stays unverifiable — claims are unsigned — so a bogus
  *claim* of a real post is still possible; that is the attributable,
  disputable, safeguard-flagged residual, not a silent forgery.)

- **Change category, hours, parties, or completion time.** All
  five fields are inside the canonical payload signed by the
  helper. Any modification breaks signature verification and the
  record is rejected by peers.

- **Reverse or redirect credit.** Once an exchange is signed and
  written, credit flow is deterministic from
  (helperKey, helpedKey, hoursExchanged). The system key cannot
  redirect a confirmation to a different `helpedKey`; that field
  is signed by the helper.

- **Confirm on a member's behalf without a poster-signed post.** With
  `bindToPost`, the confirmed-for party must be the poster of a real
  signed post; a member who never posted cannot be debited by the
  system key. (Before the Round-4 binding this was NOT true for the
  raw endpoint — it is now.)

- **Act on records older than what an honest sweep would touch.**
  The sweep operates on `awaiting_confirmation` records. An
  exchange in `completed` is already done; one in `cancelled`
  or `disputed` is out of scope. The state machine bounds the
  sweep's reach.

### What the key cannot defend against

- **An operator who already controls the server** can do many
  worse things than this key permits — modify the SQLite ledger
  directly, tamper with PWA bundle delivery, exfiltrate the
  database. The auto-confirm key is not the limiting factor in
  operator-trust modeling; the operator is already inside the
  trust boundary by virtue of running the node. What the key adds
  is a *new auditable artifact* of operator action — every
  auto-confirm record is tagged and traceable. That is a small
  but real improvement over a silent ledger edit.

## 6. What ships in code (PR-A)

The next PR (referred to in conversation as PR-A) implements §4
with the following surface:

- New env var `NODE_SYSTEM_SECRET_KEY` in
  `apps/server/src/config.ts`; new field on the `Config` type.
- New `systemKey: { current, history }` block in
  `GET /config` response.
- New `autoConfirmHours: number` field on `NodeConfig` in
  `packages/shared/src/types.ts`, default 0 (community opts in
  via Agent 13 proposal — see §7 open question).
- New `POST /auto-confirm` endpoint on the server that verifies
  the helper signature, signs the helped-side signature with the
  system key, and writes the record.
- PWA-side sweep on app start (or server-side cron — see §7).
- `Exchange` type gains `autoConfirmed?: boolean` and
  `confirmedBy?: string` (or equivalent — see §7) in
  `packages/shared/src/types.ts`. Existing rows without the
  fields read as `false`/null.
- Tests covering: verifier distinguishability (§4); rotation
  (a record signed by a now-retired key still verifies);
  disabled-state (sweep is a no-op when `autoConfirmHours === 0`);
  refusal to sign when the helper signature does not verify.

The threat-model entry added in this branch is the predicate; the
implementation PR must cite it in its description.

## 7. Open questions / pilot validation

Items the design is guessing about. Flagged so a pilot tunes them
against real use:

- **Default `autoConfirmHours`.** This doc proposes 0 (off by
  default, community opts in via proposal). The alternative is
  168 (7 days, on by default with the community able to set 0).
  Arguments either way:
  - **0 (off, opt-in):** maximally conservative; the system key
    signs nothing until the community has had the conversation;
    matches the "every privileged role goes through governance"
    posture.
  - **168 (on, opt-out):** matches the stated problem better — the
    helper does not have to wait for a community proposal to get
    credit when their partner is unresponsive; the value is
    delivered at install time.

  Recommend pilot decides. The implementation PR ships whichever
  default the pilot community ratifies first.

- **Sweep location: server cron vs. PWA on app start.** A
  server-side cron sweep guarantees the auto-confirm fires whether
  or not any member's PWA is open. A PWA-on-boot sweep keeps the
  signing decision close to a human action (a member opens the
  app, sees their pending exchange, the sweep runs). Server-cron
  is more reliable; PWA-on-boot keeps the operator's signing
  surface narrower (the key is only used when a member is
  actively engaging). Recommend pilot picks the one that matches
  their operational comfort and revisit.

- **`confirmedBy` field shape.** The current `Exchange` type uses
  `confirmedBy: string[]` on the *post* but not on the exchange
  itself; the exchange has `helperSignature` / `helpedSignature`
  and infers identity from the signatures verifying. The
  implementation must decide whether to add an explicit
  `confirmedBy` discriminator to `Exchange` (clearest, but a new
  field) or rely on "the helped-side signature verifies against
  the system pubkey, not any member pubkey" as the implicit
  signal. Recommend explicit — verifiers should not have to scan
  pubkeys to detect the case.

- **`autoConfirmedAt` placement.** Either a new top-level field
  on `Exchange`, or carried inside an extended canonical payload.
  Top-level is simpler; extended payload is signed and therefore
  tamper-evident. Recommend extended payload.

- **Disabling at the helper's request.** Whether a helper should
  be able to mark a specific pending exchange "do not auto-confirm
  this one" before the window elapses. The argument for: a helper
  may want to wait the partner out. The argument against: complexity,
  and the helper can always cancel the post / task and re-issue.
  Default no, revisit in pilot.

The aim is to launch with a small, honest set of guesses and tune
them once a community has lived with the result. This document
will be amended in the same PR that tunes them.
