# Proposal: How community-project work is paid for (the credit model)

> **Type:** modified-consensus proposal (`GOVERNANCE.md` §2 — this
> decides how the credit unit works, the most load-bearing open
> question in [`roadmap.md`](../roadmap.md)'s open-design-questions
> table; it gates the balance-cap/community-pool row and,
> transitively, the federation mutual aid fund).
> **Status:** draft, awaiting discussion. Not yet scheduled for a
> decision meeting.
> **Settles:** [issue #6](https://github.com/ArdentCascades/Understoria/issues/6)
> ("credit model for community-project tasks") and the ruling its
> staged plan deferred; also the R5 ruling in
> [`next-cycle-plans.md`](../next-cycle-plans.md) §8, taken at its
> recommended default (argue a position; don't survey).
> **Depends on:** nothing unshipped. Every fact below is about code
> on `main` today.

---

## The one question

**When a community-project task is confirmed, whose hours pay for
it?**

Today the answer is: **the confirming organizer's, personally.** This
proposal asks the community to either ratify that answer — with a new
relief valve called *backing transfers* — or replace it.

## Why this is a governance decision, not an engineering one

Any of the three candidate models is implementable. What cannot be
delegated to code is the value judgment about what an hour *is*: a
claim on one specific person's time, or a claim on the community's.
This decision also gets **harder every month it waits** — changing
who is debited after a pilot has created real balances re-values
every existing ledger row, which is why it should be taken now,
before balances carry history that a rule change would rewrite.

## What the code does today (the facts the decision rests on)

- **Balance is a zero-sum fold, never stored.**
  `balanceFor` (`apps/web/src/lib/timebank.ts`) computes every
  balance from the signed exchange log: seed balance + hours helped −
  hours received. Every hour gained by one member is an hour lost by
  another. **This zero-sum property is the anti-gaming backbone**:
  two colluding members can shuffle hours between themselves forever
  and never create purchasing power from nothing.
- **Project tasks debit the confirming organizer.**
  `confirmProjectTaskCompletion` (`apps/web/src/db/projects.ts`)
  signs the exchange with `helpedKey = organizerKey`. The organizer
  personally funds every confirmed task.
- **The display-honesty half already shipped.**
  `projectConfirmationOutflow` (`timebank.ts`) separates an
  organizer's project outflow from personal consumption, and the
  Profile balance card renders it as hours moved *on the community's
  behalf* — this is issue #6's "Phase 1 framing" in spirit, already
  live.
- **The only non-member signer is the node's system key**
  (`apps/server/src/systemSigner.ts`), deliberately bounded to
  countersigning the confirmation half of an already-helper-signed
  record after the waiting window. It cannot originate records or
  invent hours, and extending its powers requires amending
  [`auto-confirm-key.md`](../auto-confirm-key.md).
- **No pool and no issuance exist.** Every exchange debits a real
  member key, and every peer node can verify that independently.
- The political-education notes
  (`docs/political-education/README.md`) carry the Kasmir caution
  about balance caps and collective surplus — the standing reason
  the community-pool roadmap row is gated on this decision.

## The three models

### 1. Organizer-debit (the status quo)

Honest, zero-sum, shipped, already display-mitigated. Its real cost
is also real: **organizing is personally expensive.** A busy
organizer drifts far below their seed balance, the number stops
meaning anything for them, and members may hesitate to claim tasks
because "it comes out of Rosa's hours." A pilot organizer named
exactly this (issue #6's origin), and it is the felt problem every
model here is trying to solve.

### 2. Issuance ("just create the hours")

Task confirmation mints credit with no debit. It matches a good
intuition — project work benefits the commons, so no individual
should pay — but it **breaks the zero-sum backbone**. A pair of
colluding members with a fake project could mint unbounded credit;
today the same collusion is a harmless shuffle. Every anti-gaming
safeguard (`lib/safeguards.ts`) assumes conservation and would need
redesign, the money supply becomes a governance problem on day one,
and the timebanking history (Cahn; the Kasmir caution) is a record
of exactly this failure. **Recommended against.**

### 3. Community pool (issue #6's Phase 2)

A community-held balance funds project credit, so the cost is
collective and *visible* — the pool's negative balance renders on
the Dashboard as the community's outstanding investment in itself.
The transparency instinct here is right, and this proposal keeps it.
What it rejects is the **pool key**: issue #6's design debits "a
designated community-pool pseudo-member key," and that key is the
whole problem —

- *Where does the pool's balance come from?* A pool seeded from
  nothing is issuance wearing a hat; the question doesn't go away,
  it just moves.
- *Who holds the key?* A new signing identity that can be the
  helped side of exchanges either extends the node system key
  (breaching its deliberately bounded design) or creates a
  quorum-held key whose ceremony weight is on the scale of member
  removal — for an **everyday** flow.
- Every peer node's trust calculus grows a new special case
  (issue #6's own Phase 3 acknowledges this).

## Recommendation: organizer-debit + voluntary backing (a pool without a pool key)

Keep the organizer-debit *mechanism* — it is honest, shipped, and
zero-sum — and relieve its real cost with **backing transfers**:

- Any member can chip in hours to back a specific project. A backing
  is an **ordinary two-signature consensual exchange** (contributor →
  organizer), labeled `project:<projectId>/backing` in the
  `Exchange.postId` namespace — the same pattern task confirmations
  (`project:<id>/task:<id>`) already use.
- The project page shows **pooled backing**: backing received minus
  confirmation outflow (`projectConfirmationOutflow` already computes
  the outflow half). When a project is running on the organizer's
  personal hours, everyone can see it — and top it up.
- The organizer remains the steward. Nothing new signs anything;
  no new key, no new trust surface, no federation special case.

This is issue #6's community pool with the transparency kept and the
pseudo-member key removed: the "pool" is the visible sum of real,
consensual, member-signed contributions, held where stewardship
already lives.

Why this shape wins:

- **Zero-sum is preserved.** Collusion still cannot mint. Every
  safeguard keeps working unchanged.
- **No new signing authority exists.** The `community-authority`
  principle holds; `auto-confirm-key.md`'s bounded-key contract is
  untouched; peer verification is unchanged.
- **The felt problem gets a community-visible remedy** instead of a
  monetary redesign: "Rosa is 12 hours under water for the fridge
  project" becomes something the project page shows and any member
  can fix with one consensual transfer.
- **It is reversible.** If a pilot shows backing unused, removing it
  strands no ledger semantics — backing rows remain ordinary valid
  exchanges forever. (Compare: unwinding a pool key or clawing back
  issued credit is not reversible in any honest sense.)

Revisit issuance **only** if pilot evidence shows voluntary backing
structurally under-funding real organizing — and then as its own
proposal, against this document's record of why it was rejected.

## What changes if this is adopted

1. **The rule is ratified**: project tasks debit the confirming
   organizer; the community backs organizers voluntarily.
2. **Backing transfers ship** (~2 small PRs, after adoption):
   - the `project:<projectId>/backing` label joins the exchange-label
     grammar (a consensual ceremony like the in-person/direct flows —
     both parties sign at recording; no waiting window, so the
     auto-confirm path never touches it), plus ledger display
     ("backed *Community fridge*");
   - the contribution flow (a "Back this project" doorway on the
     project page) and the pooled-backing figure (backing in −
     confirmation outflow) on the project page.
3. **Issue #6 closes** as settled-by-adoption, and the
   [`roadmap.md`](../roadmap.md) balance-cap/community-pool row is
   re-scoped to whatever was decided here.

## What does NOT change

- **Peer-to-peer exchanges.** Untouched, in any model.
- **Balance math.** `balanceFor` stays a zero-sum fold; no stored
  balances, no issuance, no multipliers.
- **The seed balance** keeps meaning exactly what it means today.
- **The system key's powers.** Still confirmation-countersigning
  only.
- **Anti-gaming safeguards.** Backing rows are ordinary exchanges
  and subject to all of them (daily limit, short-duration flag,
  reciprocal-pattern flag).
- **Nobody is obliged to back anything.** Backing is an offer, not
  a dues system — the same `asking-never-gated` posture as
  everything else. A project with zero backing works exactly like
  today.

## Alternatives considered and rejected

- **Issuance** — breaks conservation; see §"The three models" #2.
- **The keyed community pool** (issue #6 Phase 2/3) — right
  transparency instinct, wrong custody model; see #3. If the
  community adopts backing transfers and pilot evidence later shows
  a genuine need for a collectively-held balance, a pool proposal
  can return with this document's key-custody objections as its
  acceptance criteria.
- **A neutral three-way survey instead of this recommendation** —
  considered (next-cycle-plans §2.6 / R5) and rejected: every prior
  Understoria decision doc argues a position with honest
  alternatives, and neutral surveys stall.

## Rollback

Adoption changes a rule and adds an optional flow; it does not
migrate data. Rolling back means removing the backing doorway and
display — every backing row already recorded remains a valid,
verifiable, correctly-signed exchange between two consenting
members, requiring no unwind.

## Open questions for discussion

1. Should the project page's pooled-backing figure be visible to
   ALL members or only once nonzero? (Recommended: only once
   nonzero — a permanent ledger line on every project reads as
   fundraising pressure.)
2. Should backing be recordable toward a **completed** project
   (retroactive thanks), or only active ones? (Recommended: active
   and paused only — retroactive transfers are what the direct
   `record time together` flow is for.)
3. Does the organizer's Profile outflow line subtract backing
   received, or show both figures? (Recommended: show both — "moved
   14h for projects · backed with 9h" — netting hides the story.)

## How to engage

Per `GOVERNANCE.md` §2 (modified consensus):

- Discussion period: **at least 7 days** from the day this document
  lands on `main`, in the community channel and/or on issue #6.
- Then a decision meeting; then the consent check (consent / stand
  aside / block-with-reasoning).
- If adopted: the two implementation PRs above, issue #6 closes,
  and the roadmap row un-gates. If blocked: back to discussion, and
  the status quo (organizer-debit, no backing) simply continues —
  nothing ships from this document without the decision.
