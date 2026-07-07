# Proposal federation — making the Decisions page tell one truth

Status: **G1 + G2 SHIPPED.** G1: the three record kinds end-to-end
(signed proposals/votes/closures, server tables + member-gated
routes + mirror + re-seed kinds, client signing at the mutators +
pulls + derived lifecycle + the local-only note on legacy rows).
G2: convergent effects — `applyClosureEffects` runs the SAME
idempotent path on the closing device and every pulling device
(dispute post-status restoration guarded on `status === "disputed"`;
passed `config_change` closures apply their payload via
`putNodeConfig`, soft-degrading on invalid JSON so a bad record
stands without moving knobs); dispute and comment-dispute proposal
creation now signs via `signProposalIfUnsigned` (post-commit, after
the dispute transaction — never inside it — and only the proposer's
own unsigned rows, so legacy rows stay local); a passed closure
whose merged vote set shows standing blocks renders a **contested**
banner on the Decisions page. As-built deltas from §2/§5/§6: the
server-side eligibility guard enforces the PARAMETER-FREE half only
(no standing blocks at POST; min-affirms and the deliberation window
are config-dependent and live client-side, where the contested
display names disagreement rather than suppressing the record);
`project_adoption` closures deliberately have NO pull-side effect —
the signed ProjectState LWW record already federates the organizer
handoff, and re-running `executeAdoptionProposal` on pull would race
it. Votes arriving after a closure are stored (timestamps order
them); the closure math counts what it sees at close time. This was the plan for the last
structural gap the governance work left open: proposals and votes
were per-device local, so the Decisions surface could show a
different reality on every member's phone. Named as the standing dependency in
`docs/member-removal.md` §4 ("deliberation happens where the
community talks… knowing proposals are per-device local") and
reserved in the types since v1 (`types.ts`: "Votes are unsigned for
v1 because they stay local to the node").

Companion docs: `docs/member-removal.md` (the shipped precedent for
federated governance records), `docs/blocking.md` §3.2/§11.10 (the
invariants this must preserve), `docs/threat-model.md`.

## 0. The gap, stated concretely

- `proposals` and `votes` are Dexie tables with **no outbox kind, no
  server table, no pull** — they cross devices only inside the
  device-pairing snapshot. Two members looking at "the community's
  decisions" see two different lists.
- **Votes are invisible to everyone but their caster.** A tally
  rendered today is the math of one device's rows. The "consensus
  reached" banner and the block-guard on `closeProposal` are honest
  about the data they can see — but the data is a slice.
- A passed `config_change` updates `nodeConfig` **on the device that
  clicked close** and nowhere else; communities converge their knobs
  by rumor.
- The removal ceremony ships with `proposalId: null` because there
  is no shared proposal to point at.
- Both record kinds are **unsigned** — nothing cryptographic binds a
  vote to a voter, which is exactly why the member-removal design
  refused to derive its artifact from vote rows.

## 1. Values first: open ballots

Federating votes makes them **visible inside the community for the
first time**, and that is a values decision before it is a schema:

- **Votes become public, attributed records** — same posture as
  removal signatures, and for the same reason: a governance act is
  the community's business. A `block` vote in particular is a
  conversation the community needs to have, not an anonymous veto.
  The blocking doc already commits to this frame: a block vote
  "still reaches every other member" (§3.2), and no-silent-
  disenfranchisement (§11.10) is only checkable when votes are
  inspectable.
- **What stays private:** nothing new becomes public OUTSIDE the
  community — the read gate (deny-by-default on every federation
  GET) covers the new feeds the day they exist. Drafts stay local.
  Legacy unsigned rows never leave the device they were written on.
- **Soft purge honesty:** today soft purge clears the local `votes`
  table. Once votes federate, the local clear still runs but the
  community's copy persists on nodes and other devices — the same
  honesty note every federated record carries, added to the panic
  copy. A member who cannot stand behind a past public vote can
  change it (votes are re-castable) — the newest version is what
  tallies.

## 2. The records (Phase G1)

Three kinds, every one on shipped machinery:

- **`Proposal` (signed, immutable core).** The existing fields minus
  the lifecycle trio (`status`, `closedAt`, `closedReason`), plus
  `signerKey`/`signature` over a canonical payload
  (`canonicalProposalPayload`, fixed field order). Signer must equal
  `proposerKey`. The lifecycle trio is DERIVED on every device:
  open unless a closure record exists. Local rows keep the columns
  for UI compatibility; pulls maintain them from closures.
- **`Vote` (signed, single-owner LWW).** Existing fields plus
  `signerKey`/`signature`; signer must equal `voterKey`; natural key
  stays `(proposalId, voterKey)` (the deterministic id already IS
  the dedup key); a re-cast vote is a strictly-newer `createdAt`
  replacing in place — byte-for-byte the RSVP discipline.
- **`ProposalClosure` (signed, first-writer-wins).** `{id,
  proposalId, outcome: passed|rejected|withdrawn, reason,
  closedAt, closerKey, nodeId, signerKey, signature}`. Any member
  may close (unchanged); the SERVER keys closures by `proposalId`
  and refuses a second one (`200 {stored:false}` — idempotent,
  convergent: the first accepted closure is the community's answer
  everywhere). Withdrawn-by-proposer keeps its existing UI meaning
  but is the same record kind.

**Validity, enforced at ingestion and re-checked on pull:**
signature verifies; signer is a MEMBER (the resolver from removal
M1 — governance writes become the second member-gated write surface,
deliberately: an invented key may post an offer, but it may not
vote); signer is not currently removed (the `author_removed` gate
covers this for free); `createdAt`/`closedAt` bounded against
far-future stamps. A closure claiming `passed` is additionally
guarded by the node's own merged vote set (zero standing blocks,
`proposalMinAffirms` met, deliberation window elapsed) — the same
`autoCloseEligibility` math, run server-side at POST with a
retryable 409 when votes may still be in flight, and re-run by every
client at render so a closure that slipped past a stale node
displays as contested rather than silently honored.

## 3. Server (greenfield, per the census)

- Schema v23: `proposals` (id PK, payload-JSON), `votes`
  (PK `(proposal_id, voter_key)`, LWW on `created_at`),
  `proposal_closures` (PK `proposal_id`). Feed cursors: composite
  `(createdAt, id)` / `(closedAt, proposalId)` via `pagedRows`.
- Routes `POST/GET /proposals`, `/votes`, `/proposal-closures`,
  registered AFTER the read-auth and removed-author guards like
  everything else; insert-cap SURFACES entries (`signerKey`).
- Mirror kinds ordered `proposals → votes → proposal-closures`,
  after redemptions (membership gating reads the closure) — same
  409-halt posture as removals for the referent races.
- Re-seed kinds for all three (`signedOrNull` drops legacy rows).

## 4. Client

- `createProposal` / `castVote` / `closeProposal` sign and enqueue
  (outbox kinds `proposal`, `vote`, `proposal_closure`; vote dedup
  key = natural key so both of a member's devices queue one live
  version; closure 409 non-retryable — someone else closed first,
  the pull reconciles).
- Three pulls with the house merge rules (insert-if-new + verify /
  LWW / apply-once). Applying a closure runs the SAME local effect
  path `closeProposal` runs today (dispute post-status restoration,
  adoption materialization), made idempotent — the closing device
  and every pulling device converge through one code path.
- **Legacy rows:** unsigned proposals/votes stay readable locally,
  render with a quiet "recorded on this device only" line, and
  never cross the wire. No migration mints signatures the member
  never made.
- Blocking invariants untouched: `hideGovernance` remains a
  display-time filter; eligibility and the close block-guard keep
  computing over the UNFILTERED (now community-wide) vote set —
  which finally makes §11.10 mean what it says.

## 5. Phase G2 — convergent effects (shipped)

- **Config convergence (shipped):** a valid passed `config_change`
  closure applies its payload to the local `nodeConfig` on EVERY
  device via the pull path — the first mechanism by which a
  community's knobs actually converge. (The payload remains a full
  NodeConfig snapshot; conflicting concurrent proposals resolve by
  closure-order, which is total. Invalid payloads soft-degrade: the
  closure record stands, the knobs don't move.)
- **Adoption across devices (shipped as a non-effect, by design):**
  the ProjectState LWW records already federate the organizer
  handoff, so `project_adoption` closures carry the DECISION but
  trigger no pull-side `executeAdoptionProposal` — re-running it on
  pulling devices would race the authoritative state record. The
  stale "projects never federate" comment on the payload type is
  corrected — it predated project federation Phase 1.
- **Dispute deliberation joins the wire (shipped):** dispute and
  comment-dispute proposals sign post-commit via
  `signProposalIfUnsigned` (outside the dispute transaction, only
  the proposer's own unsigned rows), and pulled closures restore
  the disputed post's status through the same idempotent path the
  closing device runs.
- **Removal linkage (open):** the removal ceremony's `proposalId`
  starts carrying real ids once its UI grows a proposal picker —
  the data dependency (shared deliberation) is now resolved.

## 6. Abuse analysis

- **Vote stuffing:** one vote per member per proposal by natural
  key; voters must be members (resolver) and not removed (gate);
  per-key insert caps bound volume; invented keys are refused at
  the door for the first time on a write surface — the census
  justification is that governance writes carry weight ordinary
  content does not.
- **Forged or premature closure:** signature + membership + the
  server-side eligibility guard + client-side re-check (contested
  display). A hostile node can still LIE by omission (hide votes
  before closing) — mirrors and re-seed bound how long that lie
  survives, and the contested flag names it when the merged set
  disagrees.
- **Back-dating:** `createdAt` bounds at ingestion (the standing
  pattern); deliberation windows measure against the proposal's
  accepted `createdAt`, not client claims made later.
- **Spam:** member gate + caps + the proposal UI's existing
  hard-tier friction.

## 7. Threat-model / docs obligations (owed at implementation)

§7 entry: votes become public-inside-the-community signed records —
the open-ballot trade named in §1, plus the member-gated-writes
first. `docs/blocking.md` §3.2/§6 table references updated to the
federated reality. Panic-copy honesty line for the votes clear.
`member-removal.md` §4 dependency note flipped. Decisions-page copy
drops the "recorded out-of-band" framing for signed rows.

## 8. Sizing

G1 ≈ one large federation-PR unit (three record kinds end-to-end;
the vote kind is RSVP-shaped, the proposal kind is post-shaped, the
closure kind is cancellation-shaped — all have shipped precedents).
G2 ≈ a medium follow-up (effect application on pull + config
convergence + doc corrections). Recommended order: G1, merge, G2.
