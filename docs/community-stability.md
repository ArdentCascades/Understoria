# Community stability — the checklist, the fund, and when to connect communities

> **Status: DRAFT — for review. Nothing in this document is
> implemented.** It records a design conversation with the operator
> (2026-07) so the reasoning survives review and revision. Every
> section marked *proposed* is open; the **negative-space
> commitments** in §7 are the part we expect to keep even if every
> mechanism changes. Read alongside `community-resilience.md`
> (infrastructure resilience — shipped), `capacity-forecast.md`
> (node pressure — shipped), and `federated-node-allowlist.md`
> (why "ask the other node" fails — design note).

---

## 1. The architecture, precisely

This document uses four words that are easy to blur, and an earlier
draft of this conversation blurred one of them. So, definitions
first, checked against the code and operator guide:

- **Community** — one social unit: a single membership closure
  rooted at the same trust roots (`NODE_FOUNDER_KEYS` ∪ claimed
  founder; `docs/member-authenticated-reads.md`) with one removal
  quorum. A community is *not* one server.
- **Mirror** — another server of the SAME community
  (`MIRROR_NODE_URLS`; operator-guide §6). Mirrors carry distinct
  `NODE_ID`s but identical trust settings, replicate **every**
  durable kind (including project/RSVP/shift state and redemption
  receipts), and members' apps fail over between them automatically.
  The **grow-root wizard** (`/grow-root`, `add-a-node.md`) exists to
  add mirrors — its purpose is resilience for the community you are
  already in, not creating new communities. More mirrors is close to
  pure upside and **nothing in this document gates it**.
- **Peer** — a DIFFERENT, neighboring community
  (`PEER_NODE_URLS` + `PEER_READ_TOKENS`). The peer wire is
  deliberately narrower than the mirror wire: it carries exchanges,
  vouches, posts, and events (+ cancellations); redemption receipts,
  claims, invite revocations, and every participation kind
  (projects, RSVPs, shifts, signups) never cross it
  (operator-guide, "What federation does today").
- **New community** — formed independently: someone runs the setup
  wizard, claims their node, invites people. There is currently no
  in-app path that spawns a community from an existing one, and this
  document does not propose one (an optional "help friends start
  their own" guide is a fine future idea, but it is not load-bearing
  here).

Everything below is about the **peer** layer — the only layer where
"should we connect?" is a real question. `community-resilience.md`
explicitly deferred "cross-community resilience pooling" pending
"its own values conversation." This document is that conversation.

## 2. The questions this answers

Asked by the operator after the first production deployment:

1. Once a community reaches stability, should it be encouraged to
   start a strike fund?
2. Some projects contribute more to stability than others — can the
   app guide people toward a stable community?
3. Should communities be encouraged to connect with each other —
   and should connecting be *locked* until a community is stable, so
   the movement grows deep before it grows wide?
4. How would stability be determined?
5. Can a community opt out of the guide?

## 3. Principles this design inherits (not new — enforced elsewhere)

- **No comparable scores.** Vouch tallies are banned from other
  members' pages; the resilience card uses tier *wording*, never a
  number to rank (`no-leaderboards`, operator ruling in
  `MemberDetail.tsx`). A stability *score* would be the same disease
  at community scale.
- **Minimal public surface.** `GET /config` deliberately refuses
  member and exchange counts — "would leak community size to
  passive observers" (`threat-model.md` §6, noted in
  `routes/config.ts`). Any stability signal that crosses a wire
  re-leaks exactly this, to exactly the observers who care most
  about which organizing efforts are succeeding.
- **Self-attestation is not verification.** A trust list served by
  the node being checked is worthless — "asking the suspect whether
  they are guilty" (`federated-node-allowlist.md` §2). Any scheme
  where community A "verifies" community B's stability from B's own
  answers has the same shape.
- **Gates are ceremonies, not security boundaries.** The grow-root
  wizard's trusted-member gate is documented as "UI friction, not a
  security boundary" (`community-resilience.md`). This is AGPL
  software on operators' own machines; every gate below is a norm
  made tangible, and is designed to be honest about that.
- **Nudges ask once.** Dismissal is permanent (vouch-discovery,
  grow-root suggest). Nothing below re-nags.
- **The app guides; it does not hold.** Time credits are the only
  ledger in the data model. That stays true throughout §5.

## 4. Stability is a private, local self-assessment *(proposed)*

**Never a computed score, never transmitted.** The proposed shape is
a **stability checklist** on the Infrastructure page, sitting next
to the drill checklists that already live there
(`lib/infraStatus.ts` `parseDrillChecklists` — local settings rows,
never synced to any server, already the established pattern).

Two kinds of rows:

- **Observed locally** — boxes the device can check from data it
  already holds, shown as facts, not scores:
  - a second node (mirror) exists and has been reachable recently
    (the resilience card's own inputs);
  - at least one seed vault pledge stands (`SeedVaultPledge`);
  - the community has ≥ `REMOVAL_QUORUM` + 1 trusted members — i.e.
    governance is *actually exercisable*: a removal ceremony could
    reach quorum without the subject signing;
  - exchanges have completed in the recent window (activity, not a
    leaderboard: shown as "yes, recently," never a count to compare);
  - an infrastructure drill has been run at least once.
- **Answered honestly** — boxes only humans can check, persisted
  like drill steps:
  - "Could we run a meeting and make a decision if the founder
    disappeared tomorrow?"
  - "Do at least two people hold operator knowledge (keys, backups,
    the runbooks)?"
  - "Have we resolved at least one real disagreement through the
    tools (dispute / proposal / removal deliberation)?"

The exact rows are **open for review** (§9). What is settled in this
draft: the checklist renders only to the community's own members,
produces no number, no tier ranking against other communities, and
**no bit of it ever crosses any wire**. If a community wants to say
"we are stable" out loud, that is a *human declaration* — a passed
governance proposal (§6), not a server emission.

Crossing the threshold unlocks nothing mechanical. It changes what
the app *invites* (§5, §6). Communities that ignore the page lose
nothing — that is the opt-out (§8's first bullet).

## 5. Strike funds and stability-building projects *(proposed)*

**Strike fund: encourage by template, never by ledger.** Money never
enters the data model — a mutual-aid app on a $5 server must not
become a custodian (seizure target, legal exposure, and a class of
bugs this project has zero appetite for). The right mechanism
already exists: **project templates** with `firstSteps`,
`commonPitfalls`, `pairsWith`, `learnMore`. A "Community fund /
strike fund" template teaches the *organizing work*: pick a
credit-union account with multiple signers OR a paper ledger with
two counters; decide disbursement rules *before* the first ask;
name how it's audited; what to do when someone needs money fast.
The project tracks the organizing labor in hours like any other
project. The fund itself lives entirely outside the app.

**Guiding toward stability: tag kinds, never rank instances.** A
qualitative **resilience facet** on templates (food infrastructure,
repair network, communication tree, childcare co-op, the fund
above, ...) lets the ways-to-plug-in shelf and the template picker
offer a heading like "projects that help the community weather hard
times." The line that must not be crossed: describing *kinds* of
projects is guidance; scoring *this community's* projects by
stability contribution is a leaderboard, and reshapes behavior
toward the metric. No per-project stability number, ever.

Surfacing *(proposed, mild)*: once the §4 checklist is largely
green, the fund template and the §6 peering invitation may appear —
as dismissable invitations under the one-ask rule, not as banners.

## 6. Connecting communities: gate the initiator, not the pair *(proposed)*

The operator's instinct: waiting to unlock inter-community
connection encourages the movement to grow **deep before wide** — a
federation of thin communities that each collapse when one organizer
burns out is weaker than three that hold. This design keeps that
pacing and rejects one specific version of it.

**Rejected: "stable may only connect to stable" (mutual gating).**
Three independent failures:

1. *Verification is the leak.* For A to verify B's stability, B's
   signal must cross the wire — the exact class of data `/config`
   refuses to publish, emitted on demand to a community that is, at
   first contact, a stranger.
2. *It cannot be verified anyway.* B's stability claim is served by
   B — self-attesting (`federated-node-allowlist.md` §2). A mutual
   gate is either theater (believe the claim) or surveillance
   (audit the claim); both are worse than not gating.
3. *It blocks established-helps-emerging.* The fragile community is
   precisely the one that most needs a peer during a disaster or a
   drawn-out fight. Mutual gating cuts the lifeline exactly when it
   matters.

**Proposed instead — the gate sits entirely on the initiating
community, where it is enforceable and honest:**

- **Initiating peering** requires (a) the initiating community's own
  §4 checklist — self-assessed, never transmitted — and (b) a
  **passed governance proposal** ("peer with <community>, operated
  by <who we talked to>"). The proposal is the real gate: the
  existing signed proposal → deliberation window → min-affirms →
  closure machinery (`proposal-federation.md`), so "we are ready to
  connect" is a decision the community deliberates, not a button an
  operator presses early. This delivers the wait-to-unlock pacing
  with zero wire bytes.
- **Accepting** a peering request requires a passed proposal too —
  peering is mutual data flow and consent must be deliberate — but
  **no stability bar**. So an established community can always
  extend a hand *to* a young or struggling one: the established side
  initiates and passes its own gate trivially; the young side only
  has to deliberately say yes. Strong-helps-weak stays open in the
  one direction that is safe.
- **Assess the other community the human way.** Peering already
  requires out-of-band token exchange between operators
  (`PEER_READ_TOKENS`) — there is necessarily a conversation. The
  peering flow should arm it: a short "questions to ask a community
  before federating" panel (Who runs your servers? How do you remove
  someone? What happens if your founder disappears? What do you
  expect from us?). Judgment where judgment belongs; the machine
  never pretends to answer these.
- **What connecting means stays exactly as narrow as today.** A new
  peer gets the existing peer wire (§1) — not the mirror wire, no
  participation kinds, no membership data. Widening the peer wire is
  out of scope here and would need its own values conversation (the
  resilience-pooling deferral stands).
- **Mechanics note** *(open, §9)*: whether the proposal rides the
  existing `config_change` category with a peering payload or a new
  category, and how a passed closure maps onto the env-configured
  `PEER_NODE_URLS` (operator action on a community decision, like
  the enforcement flip), is an implementation question for review.

**Honesty clause:** an operator can always hand-edit
`PEER_NODE_URLS` and skip all of this — same as every other gate in
the project. The design's value is that the *shipped path* makes
deliberation the norm, and a community whose operator bypasses its
own governance has a people problem no software fixes.

## 7. Negative-space commitments

The load-bearing part. Whatever changes in review, these are the
lines this feature must not cross — each one extends a commitment
the project already made elsewhere:

1. **No stability signal ever crosses any wire** — not on `/config`,
   not on the peer wire, not in a record kind. (Extends: no member /
   exchange counts on `/config`.)
2. **No mutual stability verification between communities.** No
   handshake where A checks B's readiness. (Extends: self-attestation
   is not verification.)
3. **No algorithmic stability score and no cross-community
   comparison surface** — the checklist is facts + self-answers for
   the community's own eyes. (Extends: `no-leaderboards`.)
4. **Mirrors are never gated by stability.** Growing roots for your
   own community is always encouraged; only *inter-community*
   connection carries the ceremony. (Extends: the resilience card's
   whole purpose.)
5. **Money never enters the data model.** The strike fund is taught,
   not held; no balances, no pledges, no fund records. (Extends:
   time credits are the only ledger.)
6. **No per-project stability ranking.** The resilience facet
   describes template kinds; it never scores a community's actual
   projects. (Extends: the operator ruling on comparable display.)
7. **Invitations ask once.** Every card this introduces obeys the
   permanent-dismissal contract. (Extends: vouch-discovery /
   grow-root nudge behavior.)
8. **Everything outward-facing is proposal-gated.** Nothing about a
   community's readiness or intent to connect leaves the community
   without a passed governance proposal. Opt-out is therefore
   structural: a community that never proposes never emits.

## 8. Opt-out, answered

Mostly it dissolves, because the design is opt-in by construction:

- The checklist is a page; ignoring it costs nothing and gates
  nothing inward-facing.
- The invitations (fund template, peering card) are one-dismissal
  nudges.
- Peering — the only outward-facing act — happens only through a
  proposal the community itself passes.

The one **open question** (§9): whether a community should be able
to switch the checklist page off entirely via a `config_change`
proposal, for communities that find even a private readiness mirror
unwelcome. Cheap to add; the review should decide whether it's
wanted.

## 9. Open questions for review

1. **Checklist rows** (§4): are the proposed observed/honest rows
   the right ones? What's missing; what's presumptuous? (E.g. is
   "resolved one real disagreement" fair to small, harmonious
   communities?)
2. **The trusted-member threshold** in the observed rows: quorum+1
   is proposed as the *governance-exercisable* line — right frame?
3. **Proposal mechanics** for peering (§6): `config_change` payload
   vs. new category; how a passed closure maps to operator env
   action; whether the accept-side proposal should have a shorter
   deliberation window.
4. **The conversation panel** (§6): which questions, and does it
   render in the peering flow, the docs, or both?
5. **Checklist page kill-switch** (§8).
6. **Strike-fund template content** (§5): needs the same
   plain-language + honesty pass as the other 64 templates, and
   probably review by someone who has actually run a fund.
7. **Build order** *(suggested)*: strike-fund template + resilience
   facet (cheap, standalone) → stability checklist page → peering
   proposal + flow (largest; depends on decisions 3–4).

## 10. What this document deliberately does not propose

- Spawning new communities from existing ones (fine future idea;
  independent of everything here).
- Widening the peer wire (participation kinds stay mirror-only).
- Cross-community mirroring / resilience pooling (still deferred,
  still needs its own values conversation).
- Any federation-wide directory, map, or census of communities.
