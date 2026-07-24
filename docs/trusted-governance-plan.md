# Trusted-only proposal governance — implementation plan

> **Status: SHIPPED** (operator-decided direction closing the last
> tracked pending-member power; see `docs/threat-model.md` §7).
> Decision: affirm votes COUNT toward auto-pass only when the voter is
> trusted under the founder-rooted closure; outcome-closure signing
> requires trusted status; BLOCK votes stay open to every member;
> pending members keep proposing, voting, and deliberating — their
> affirms start counting the moment they become trusted.

## 0. Verified ground truth

- Auto-pass is purely client-side: `lib/autoCloseProposals.ts` is a
  pure function; its one production caller is `pages/Proposals.tsx`,
  and enactment is a deliberate member tap on the consensus banner
  (which then mints a closure record). The server holds no
  `proposalMinAffirms`/deliberation config (community `NodeConfig`
  lives client-side), so the server cannot count affirms — its entire
  enforcement surface for this decision is **who may speak the
  outcome** (the closure gate) plus the existing parameter-free
  standing-block guard.
- The PWA outbox treats 403 as retryable-pending, never poison, and
  `proposal_closure` is already in the retryable-409 set — a pending
  member's queued closure delivers itself the day they become trusted,
  or settles on the idempotent 200 when a trusted member closes first.
- `routes/memberRemovals.ts` is the exact server precedent (optional
  trust dep, mirror-internal bypass, founderless skip,
  idempotent-200-before-the-gate grandfathering, retryable posture).
- `useApp().vouches` is BLOCK-FILTERED — decision math must read
  `db.vouches` unfiltered (the `decisionVotesByProposal` discipline:
  a block changes what you SEE, never what anyone can ENACT).
- The reseed walker halts a kind on 403 and re-seeds
  `/proposal-closures` BEFORE `/vouches` — closures need the same
  declared reseed-grace exemption `/redemptions` has, or a closer
  whose vouches re-seed later wedges the kind.

## 1. Server

`routes/proposals.governance.ts`, POST `/proposal-closures`:
- New optional deps: `trust` (TrustResolver), `reseedGraceUntil`,
  injectable `now`.
- Gate placement: AFTER the first-writer-wins idempotent-200 check
  (grandfathering: stored/pre-gate closures are never re-judged),
  BEFORE the standing-block guard.
- Skip when: no resolver, mirror-internal header, `founderlessSkip()`,
  or inside the declared reseed grace window.
- Rule: 403 `{error:"closer_not_trusted"}` unless the closer is
  trusted — with ONE exemption: `withdrawn` signed by the proposal's
  own proposer. Pending members can propose (decided), so they must be
  able to take back their own proposal; withdrawal enacts nothing and
  is self-scoped. `passed` AND `rejected` are both gated (`rejected`
  is first-writer-wins-permanent — ungated it would be a
  proposal-killing race primitive).
- POST `/votes` deliberately unchanged (comment says why): blocks must
  flow from every member; affirms are stored regardless and judged at
  COUNT time on every device. POST `/proposals` unchanged (newcomer
  daily cap already bounds volume).
- Considered and rejected: a parameter-free "passed needs ≥1 trusted
  affirm" server guard — a trusted closer can self-affirm past it; it
  adds a vote-in-flight 409 flap for near-zero protection.

## 2. Client

- `lib/vouch.ts`: new `trustedMemberSet(ctx): ReadonlySet<string>|null`
  (null without founder capture — legacy fallback posture);
  `trustedCircleSize` delegates to it.
- `lib/autoCloseProposals.ts`: optional `trustedKeys` input; affirms
  filtered to trusted voters when provided; blocks unchanged and
  evaluated first; `wait_affirms` gains `notYetCounted` for honest
  copy. Existing tests pass verbatim (input optional).
- `pages/Proposals.tsx`:
  - Decision trust context built from UNFILTERED `db.vouches`
    (blocking discipline), alongside the existing decision-votes set.
  - Enactment (`canEnact`): consensus banner shows the close button
    only for trusted viewers; a pending viewer at consensus sees the
    honest state — "consensus conditions are met… it isn't stuck,
    it's waiting for a vouched hand".
  - Manual record-outcome buttons gate behind the shared TrustGateCard
    (no numeric progress — other members' page rule); the Withdrawn
    button survives for the pending PROPOSER only (mirrors the server
    exemption exactly).
  - Tally shows a dual count when counted < total affirms ("N of M
    counting toward consensus — affirms start counting once the voter
    is fully vouched"). The contested chip stays BLOCK-based only —
    a trusted-affirm-shortfall contested state would flap during
    normal vouch-sync lag and retroactively brand grandfathered
    closures; the dual-count tally is the honesty surface instead.
  - Point-of-action note for a pending member affirming: recorded and
    visible now, counts once vouched, your block always counts.
- `db/proposals.ts` `closeProposal`: defense-in-depth throw
  (`closer_not_trusted`) before local effects apply (a passed
  config_change applies a full NodeConfig locally BEFORE the wire) —
  capture present + closer pending + not proposer-withdrawal. No
  capture ⇒ allow (node enforces).
- Outbox/pulls: verified no changes — pulled closures apply
  unconditionally because the NODE judged the closer at ingestion
  (do not "fix" this).
- humanizeError: `closer_not_trusted` (accurate to the retryable
  behavior: waiting, not rejected). i18n en/es keys per plan.

## 3. Convergence argument (summary)

Trust inputs are append-only ⇒ `computeTrustedSet` is monotone ⇒ a
lagging device's counted-affirms is a subset of the converged count —
it can show "wait" early but never a premature "passes"; all devices
evaluate the same pure function and agree at convergence. Enactment
disagreements heal through the server: client-trusted/server-behind ⇒
retryable 403 that delivers after the vouch lands; client-pending/
server-would-allow ⇒ over-caution that heals on the next pull. Stored
pending affirms need no migration (stateless re-evaluation).
**Named caveat**: Phase-2 vouch withdrawal (invite-revocation §9,
unratified) would break monotonicity and re-opens this analysis;
closures stand regardless (grandfathered), open-proposal eligibility
would need the withdrawal semantics decided there.

## 4. Named residuals

1. A modified client held by a TRUSTED member can close over
   pending-only affirms — the server cannot hold community config, so
   this is accepted, attributed by signature, and surfaced by the
   dual-count display. Identical in shape to the pre-existing "any
   member could record an outcome," now narrowed to trusted members.
2. Captureless devices keep legacy behavior until their first /config
   capture (transient).
3. Small circles: only founders can enact until the circle grows —
   same deliberate shape as the removal-quorum decision; the copy says
   so.
4. Pre-existing quirk found during planning, out of scope:
   `useRemovalGate` computes SELF-trust from block-filtered vouches (a
   member who blocks one of their own vouchers under-sees their own
   trust). Follow-up.
5. The proposer-withdrawal exemption deviates from the letter of
   "closure signing requires trust" — flagged to the operator;
   trivially removable (one condition + one test).

## 5. Tests (abridged — full matrix with the code)

Server: pending closer passed/rejected → 403; pending proposer
withdrawn-own → 201; pending non-proposer withdrawn-other → 403;
trusted closer over pending-only affirms → 201 (the explicit "closure
gate alone" lock); idempotent 200 never re-judged; mirror bypass;
founderless skip; reseed window open/closed; 403 → vouch lands →
identical re-POST 201; votes stay open (affirm AND block from pending
→ 201); pending member's block still trips the standing-block 409.
Fixtures re-rooted via the second-founder pattern; drill extended
with a pending early-affirm beat.
Client: eligibility with/without trustedKeys; enact-gate rendering
states incl. the see-vs-enact invariant (a viewer's block must not
change eligibility); db guard cases; humanize + i18n parity.

## 6. Docs obligations

threat-model §7 closes the tracked item (mechanics + convergence +
three residuals); proposal-federation §2/§4/§6 amendments;
member-guide plain-language governance passage; community-reseed one
sentence (closures ride the declared window); GOVERNANCE.md "any
member records the outcome" → "any trusted member"; CHANGELOG.
