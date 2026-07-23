# Governance

> **Status:** founding draft. Per the Agent 5 plan, this document is
> ratified once the founding members have signed it and is amended by
> community process thereafter. It describes how decisions get made —
> not what decisions get made.
>
> The processes here are deliberately platform-agnostic — proposals,
> moderation reviews, and disputes can be run on any channel a
> community uses today (a meeting, a thread, a shared doc). Phase 5
> of the roadmap layers in-app surfaces over the same processes
> (per-node configuration, a moderation queue, a shared "Decisions"
> surface for proposals and disputes, per-peer federation agreements).
> The surfaces are tools for the process described here; they don't
> replace it. See [`docs/roadmap.md`](docs/roadmap.md) for the
> agent-by-agent plan.

---

## 1. First principles

1. **Horizontal structure.** No permanent positions of authority. Every
   coordinating role rotates. Power is distributed on purpose, not by
   accident.
2. **Decisions by those affected.** The people whose lives are shaped
   by a decision are the ones who make it. Visitors, observers, and
   outside parties inform but do not decide.
3. **Transparency by default.** Every decision is recorded and
   publicly readable by members. Closed-door conversations happen
   when there's a reason; the fact that they happened is still
   recorded.
4. **Reversibility over finality.** Small decisions should be easy to
   make and easy to undo. Only large, hard-to-reverse decisions
   require heavy process.

## 2. Decision modes

### Lazy consensus (default)

For everyday decisions: adding a new category, scheduling a meeting,
adjusting a copy change, merging a non-architectural PR.

**How it works:** anyone with the authority to make the change
proposes it on the community channel. If nobody objects within a
reasonable window (72 hours for most things, 24 hours for small
things), it happens. Objections trigger a conversation.

### Modified consensus

For anything that changes how the community works: the Code of
Conduct, this Governance document, the Threat Model, moderation
policy, major feature additions, external partnerships, legal
structure.

**How it works:**

1. **Proposal.** A member writes a short proposal: what, why, what
   changes, what doesn't.
2. **Discussion.** At least 7 days. Questions, concerns, and
   objections surface here. The proposer revises.
3. **Decision meeting.** Live gathering (in person or video). The
   facilitator walks through the proposal and remaining concerns.
4. **Consent check.** Every present member is asked whether they
   can live with the proposal. Not "do you love it" — "can you
   accept it." Three responses are valid:
   - **Consent** — yes.
   - **Stand aside** — I don't love it, but I won't block it.
   - **Block** — I believe this would harm the community and I
     can explain why.
   A single block stops the proposal. Blocks are expected to be
   rare and serious; they are not "I disagree."
5. **Revision or adoption.** If blocked, the proposal goes back to
   discussion. Otherwise, it's adopted and logged. In the app, any
   **trusted** member records the outcome (a member the community
   has fully vouched for — see the member guide); every member's
   block counts from day one, and a newcomer's affirms start
   counting the moment they're vouched.

### Supermajority (fallback)

If modified consensus deadlocks after two cycles, the proposal can
proceed to a **two-thirds vote** of active members. Used sparingly.
The existence of this fallback exists to prevent a single determined
blocker from halting everything; using it regularly means our
consensus process is broken and needs repair.

## 3. Roles

All roles rotate on a **3-month cycle**. Nobody holds the same role
two cycles in a row unless nobody else has volunteered and the
community explicitly extends the term.

### Node Operator (1–2 people)

Runs the hosting. Deploys updates. Handles the security posture.
See the [Operator Guide](docs/operator-guide.md).

### Facilitator (1 person per meeting)

Runs community meetings. Sets agendas collaboratively. Tracks
speaking stack (progressive stack preferred — those who speak less
get called on first when there are competing raised hands). Logs
decisions.

### Moderation Committee (3 people)

Reviews flags on posts and exchanges. Mediates disputes. Can issue
warnings, temporary suspensions, and (with unanimous committee
consensus plus a 48-hour community review) permanent removals.
Appeals go to a different set of three members.

### Treasurer (1 person, optional)

If the community handles money (dues, donations, strike fund),
maintains the ledger. Publishes a summary quarterly. Two-signature
requirement for any disbursement over a threshold the community
sets.

### Buddy (many, informal)

Each new member is paired with an experienced member for their
first month. Not a formal role; just a volunteer commitment.

## 4. Elections and rotation

At the start of each cycle:

1. Current role-holders post a short reflection: what worked, what
   didn't, what they'd suggest for their successor.
2. Interested members self-nominate for available roles. No one
   nominates someone else without that person's consent.
3. If the number of candidates equals the number of slots,
   candidates are confirmed by lazy consensus.
4. If there are more candidates than slots, each candidate posts a
   short statement. Members vote. Ranked-choice preferred.
5. If there are fewer candidates than slots, the community
   discusses: is the role still needed? Can it be merged? Can
   someone extend their term?

No role is paid unless the community decides, via modified consensus,
that it should be.

## 5. Moderation process

### What moderators can do

- Review flagged posts and exchanges within 48 hours of the flag.
- Mediate disputes between members.
- Issue a **warning** unilaterally, with the warning itself posted
  publicly to the moderation log.
- Issue a **temporary suspension** (up to 14 days) with two-member
  agreement.
- Recommend **permanent removal** to the full community.

### What moderators cannot do

- Act unilaterally to remove someone.
- Delete member data on another member's behalf (members purge their
  own devices).
- Keep decisions private from the community log.

### Appeals

Any moderation action can be appealed by the affected member. Appeals
go to a rotating **Appeals Panel** of three members who were not
involved in the original decision. Panel review completes within 14
days. The appeal outcome is logged publicly (identifying details
redacted at the affected member's request).

## 6. Amendments

This document is amended by modified consensus (§2). A proposed
amendment goes through the full discussion → decision-meeting →
consent-check process.

The document is **reviewed** annually regardless. The annual review
is itself a community meeting where every section is read aloud and
anyone can raise "this doesn't match reality anymore." That becomes
an amendment proposal.

## 7. Inter-community federation

If our community federates with another community running
Understoria, **we do not import their governance**. Each community
runs its own process. Federation is technical peering of shared
needs and offers, not a shared political body.

A decision about whether to federate with a specific community is a
modified-consensus decision.

Roadmap note: Phase 5 / Agent 15 adds *federation agreements* — a
per-peer record of what each community has agreed to share with the
other (categories of posts, whether vouches cross, whether sanctions
on one node are advisory on the other). This does not change the
principle above; each agreement is itself a modified-consensus
decision on our side, and the other community decides for theirs.

## 8. Legal structure

(This section is expected to change once the community formally
organizes.)

Options worth considering, per the Agent 5 plan:

- **Worker cooperative** — if the community is a workplace group.
- **Mutual benefit corporation** — if the community is a
  neighborhood or affinity group.
- **Unincorporated association** — lowest-friction, useful for very
  small or short-lived groups.
- **Fiscal sponsorship** — if you need tax-exempt status but don't
  want to incorporate yet.

The right structure depends on jurisdiction, whether money is
changing hands, whether you want to hold assets collectively, and
your liability exposure. Seek local legal advice; the wrong
structure can be very annoying to unwind.

## 9. Dissolution

If the community decides to wind down, the dissolution itself is a
modified-consensus decision. The dissolution plan specifies:

- What happens to member data (members export; server-side data
  is purged).
- What happens to any funds.
- What happens to the software instance (kept live as a read-only
  archive, taken down, or handed to another community).
- Who holds the community's name and brand afterward.

Dissolution is not failure. Many things should end on purpose
rather than drift.

## 10. Founding signatures

| Name / pseudonym | Role | Date |
|------------------|------|------|
| _pending_ | | |

---

*This document is version 0.1. It is not expected to be the final
form — most governance documents aren't ever final. Redline,
amend, improve.*
