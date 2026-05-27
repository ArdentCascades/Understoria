# Understoria Roadmap

This document is the canonical work-tracking view of the project. The
[`README.md`](../README.md#roadmap) carries a public phase summary;
[`CHANGELOG.md`](../CHANGELOG.md) records what has actually shipped.
This file is where the two meet — the agent-by-agent decomposition,
what each agent owns, what's done, what's next, and *in what order*.

Treat this document as living. When an agent ships its last task, move
its bullets into `CHANGELOG.md`. When the ordering changes, edit this
file in the same PR that changes the work — don't let the plan and the
code drift.

## How the work is decomposed

The project is organised into numbered **agents** — work units sized so
a single contributor (or pairing) can own one end-to-end without
stepping on another agent's surface. Agents are not people; an agent
is a slice of the system with a coherent boundary, an owner, and a
short list of tasks.

The decomposition is deliberately uneven. Some agents (Agent 1, the
core PWA) are large by necessity. Others (Agent 4, opsec tooling) are
small and focused. New agents are added when a new surface emerges
that doesn't fit cleanly inside an existing one. Agents are *not*
retired; once an agent has shipped its scope, it stays in the table as
a maintenance owner.

## Agents 1 – 10 (existing)

| # | Agent | Status | Owns |
|---|-------|--------|------|
| 1 | Core PWA | shipped | Board, exchange flow, credits, dashboard, achievements, profile, PWA shell |
| 2 | Crypto & Identity | partial | Ed25519 identity, signed exchanges, invites, vouching, passphrase wrapping. **Pending:** E2E messaging (task 5) |
| 3 | Federation & Infra | partial | Fastify node, signed-exchange verification, Docker, outbox mirror, federation pull loop for exchanges + vouches + **posts** (posts now sign on createPost + push via outbox), `GET /peers`, `GET /config`, invites endpoint, invite pull loop, PWA-side cross-node post surfacing on the Board. **Pending:** cross-node exchange notification lifecycle sync, Dashboard cross-node stat aggregation |
| 4 | Security & Opsec | partial | Threat model, opsec guide, panic button, anti-gaming safeguards. **Pending:** ongoing per-PR review |
| 5 | Governance & Coop | partial | Code of Conduct, GOVERNANCE.md, trademark policy |
| 6 | (reserved) | — | — |
| 7 | Organizing Integration | not started | Campaigns, power mapping, meeting tools |
| 8 | (reserved) | — | — |
| 9 | Documentation & i18n | partial | Member/operator/organizer/developer/quickstart guides, political-education, English + Spanish |
| 10 | Community Projects & Momentum | partial | Project + task lifecycle, signed task-completion exchanges, milestones, momentum tracking, project sparkline, four project achievements (Groundbreaker, Crew Member, Momentum Maker, Keystone). Co-organizer support shipped (Agent 10 Phase 3, schema v13): `coOrganizerKeys`, `isOrganizer()`, `addCoOrganizer()`/`removeCoOrganizer()`, co-organizer UI. Organizer handoff shipped: `handoffOrganizer()`, `HandoffSection`, `organizer_handoff` activity type. Project announcements shipped: `AnnouncementSection`, `"announcement"` type on `ProjectActivity`, max 2 000 chars. Bulk task quick-add shipped: `bulkAddTasks()`, `BulkTaskForm`, cap 50 tasks. Task editing shipped: `editProjectTask()`, inline edit form on `TaskRow` (unclaimed tasks only). Project attention items shipped: `project_deadline_approaching` (3 days before deadline) and `project_paused_long` (7 days paused) `AttentionItem` kinds for organizers + co-organizers. Contributor acknowledgment shipped: optional thank-you note on `confirmProjectTaskCompletion` (4th param), stored in `task_confirmed` activity data. Project cloning shipped: `cloneProject()` copies metadata + tasks into a new draft, "Clone project" button in `OrganizerControls`. Task dependencies shipped ("follows" framing — positive sequencing, no "blocked" language): `canClaimTask()`, `detectCycle()`, `setTaskDependencies()`, claim rejection on unmet deps, attention system skips `task_check_in` for unmet deps. Project archive shipped: `archiveProject()` / `unarchiveProject()`, `"project_archived"` / `"project_unarchived"` activity types, `/projects/archive` page, `HistoryTimeline` component with 13 activity type labels, "View archive" link on Board. **Still pending from the original Phase 3 plan:** custom milestones beyond auto-25/50/75/100, federation of cross-node task claims, 48-hour auto-confirm |

Agents 6 and 8 are intentional gaps — they were placeholders that
collapsed into adjacent agents during scoping. Numbering is preserved
so historical references stay valid.

## Agents 11 – 15 (Ostrom commons extension)

These five agents are a deliberate extension based on Elinor Ostrom's
eight design principles for governing the commons. The Ostrom audit
identified that Understoria's existing agents cover the *infrastructure*
of a commons (boundaries via vouching, monitoring via the signed
ledger, low-cost exit via panic + portable keys) but not its
*governance*. The five agents below close that gap.

Each is scoped to one principle cluster and one user-visible surface.
They are deliberately *not* a single "Governance" agent — the surfaces
(local config, moderation, proposals, disputes, federation) have
distinct trust models and shouldn't share code or UI prematurely.

| # | Agent | Ostrom principle(s) | Status | Owns |
|---|-------|---------------------|--------|------|
| 11 | Node Configuration & Local Rules | 2 (rules fit local conditions) | shipped | Per-node `NodeConfig` table (Dexie v6) with 8 fields: 3 safeguard thresholds (`dailyHelperLimit`, `shortExchangeHours`, `reciprocalPairThreshold`), 3 task-check-in thresholds (`taskCheckInDays`, `taskNeedsHelpDays`, `taskCheckInGraceDays`), 2 proposal-consensus thresholds (`proposalDeliberationDays`, `proposalMinAffirms`). "Community settings" section on Profile with validation, save, reset, and a bootstrap-mode note. Server-side `GET /config` returns the folded-in operator / hosting transparency block (`OPERATOR_*` env vars; empty object when unset) |
| 12 | Moderation & Graduated Sanctions | 4, 5 (monitoring, graduated sanctions) | not started | Moderation queue, action log, escalation policy. Requires real safeguard-flag telemetry first |
| 13 | In-App Governance & Proposals | 3 (collective-choice arenas) | shipped | Unified Decisions surface at `/proposals`: proposal lifecycle with `config_change` + `dispute` kinds, voting (affirm / block / abstain with latest-vote-wins), manual "Close as passed" button when consensus conditions are met (deliberation period + min affirms + no blocks), reversibility tiers (`easy` / `moderate` / `hard`), required impact-reflection form for hard-tier proposals, configurable `proposalDeliberationDays` + `proposalMinAffirms` in NodeConfig. Dispute migration (schema v12): every disputed post gets a governance-layer proposal row; `/disputes` page reads from proposals. **Folds in:** reversibility tiers + impact reflection (from original Agent 20). Welfare flag deferred to `GOVERNANCE.md` ratification |
| 14 | Dispute Resolution & Mediation | 6 (low-cost conflict resolution) | partial | Disputes live in the proposals table (`kind: "dispute"`) with voting and consensus close. **Pending:** structured mediation flow, mediator assignment, "what happens to the credits" resolution, outcome log beyond manual close |
| 15 | Federation Governance & Nested Boundaries | 1, 8 (clear boundaries, nested enterprises) | not started | Per-peer federation agreements, negotiable vs. protocol-invariant policy split |

### Why Agent 13 and Agent 14 ship as one surface

A dispute is structurally a proposal: a question, named parties, a
deliberation period, a binding outcome. The temptation is to model
them as two tables with two UIs because their *triggers* differ
(scheduled vs. incident-driven). Resist that. We'll build a single
"Decisions" surface with a `kind` discriminator (`proposal` |
`dispute`) and split only if operational experience shows the surfaces
must diverge.

### What Agent 13 absorbs from the "Beyond Ostrom" plan

The "Beyond Ostrom" draft proposed an Agent 20 (Haudenosaunee
governance) with reversibility tiers, structured impact reflection,
and a moderator welfare flag. Those are *not* a separate agent — they
are foundational decisions for Agent 13's state machine. Bolting them
on after Agent 13 ships would require rewriting the proposal
lifecycle. Therefore:

- **Reversibility tiers (`easy` / `moderate` / `hard`)** ship as part
  of Agent 13's `Proposal` type from day one. Each `ProposalCategory`
  has a default tier; proposers can override.
- **Impact reflection** is a required form for `hard` proposals
  (1-year, 5-year, reversal path, vulnerable impact). All four
  fields are enforced programmatically — submission is blocked until
  each is filled. The structural pause is the form's existence and
  the requirement to engage with each prompt.
- **Welfare flag** is *not* shipped with Agent 13. It's a governance
  policy choice (does the moderation committee get standing authority
  to delay decisions?) that belongs in `GOVERNANCE.md` first, as a
  §5 amendment. Once ratified, it becomes an Agent 12 + Agent 13
  integration task.

## Agents 16 – 18a (standalone additions from the "Beyond Ostrom" plan)

Two of the six agents in the "Beyond Ostrom" draft stand on their own
and have no cross-cutting dependencies. They're listed here as
first-class Phase 5 work rather than absorbed into existing agents.

| # | Agent | Source tradition | Status | Owns |
|---|-------|-----------------|--------|------|
| 16 | Onboarding & Political Literacy | Kerala model | shipped | Four-screen welcome flow, Learn section in Profile (member guide + study prompts + in-app opsec guide), contextual first-time hints on Board / balance / invite (generic `ContextualHint` component, setting-key based persistent dismissal) |
| 18a | Breadth & Reciprocity Dashboard | Potlatch tradition (the safe half) | shipped | Breadth bar (members ranked by *unique* people helped, not hours) + reciprocity pulse (% of connections that flow both ways). New "Weaver" achievement for spanning 3+ zones |

**Agent 18 is intentionally split.** The original Agent 18 also
proposed a force-directed community web graph showing who-helps-whom.
That visualisation is the social graph the threat model is most
explicit about protecting — display names instead of public keys
don't help, the *structure* is the leak, and a rendered graph is
screenshottable. The graph is deferred to **18b** (gated below)
pending a threat-model entry and a governance vote on whether to
enable it by default.

## Agent 22 — Accessibility & Inclusive Design

A sustained cross-cutting workstream modelled on Agent 4 (Security
& Opsec). Not a feature to ship and forget — every PR touches its
review surface, the same way every PR touches the threat-model
surface.

The full framing lives in [`docs/accessibility.md`](accessibility.md):
who the work serves (blind / low-vision, motor-impaired,
cognitive-disability, hearing-impaired members), the WCAG 2.1 AA
standards floor, current state inventory, known gaps, per-PR
reviewer questions, and review cadence. The political-education
docs already cite Mia Mingus and Leah Lakshmi
Piepzna-Samarasinha on interdependence as a precondition; this
agent is the engineering operationalisation of that.

Planned PR shape:

- **22.1 — Documentation foundation.** `docs/accessibility.md`,
  this roadmap update, CONTRIBUTING addition. No code. *(This is
  the PR adding this section to the roadmap.)*
- **22.2 — Lint + reusable patterns.** `eslint-plugin-jsx-a11y`
  in CI. New `lib/a11y/` with `useFocusTrap`, `useAnnouncer`,
  `useReducedMotion`, a `<SkipLink>` component, a global
  `:focus-visible` style layer. No surface changes yet — these
  are the primitives the later PRs use.
- **22.3 — First batch of surface fixes.** `ConfirmDialog` focus
  trap. `BottomNav` keyboard navigation. `AttentionSection`
  `aria-live`. Each demonstrates the pattern.
- **22.4+ — Continued surface fixes.** As small focused PRs.

Cadence-wise, Agent 22 doesn't "finish" — there's always
another surface, another assistive-tech pass, another regression
to catch. Like Agent 4, the "done" signal is reduced gap-count
in the doc, not a checkbox.

## Absorbed into existing agents

Pieces of the "Beyond Ostrom" plan that fit cleanly inside an
already-planned agent, rather than warranting a new agent:

| Original proposal | Lands in | Notes |
|-------------------|----------|-------|
| Agent 17 — co-organizer roles + rotation + handoff | **Agent 10 Phase 3** | Existing `requireOrganizer()` broadens to `isOrganizer()`; Project gains `coOrganizerKeys`, `lastRotatedAt`, `rotationIntervalMs`. Rotation reminders are advisory, matching GOVERNANCE.md §4. **Handoff shipped:** `handoffOrganizer()` transfers primary role to a co-organizer; old primary stays as co-organizer |
| Agent 17 — organizer recall | **Agent 13** | Recall is a `Proposal` with `kind: "recall"` scoped to project contributors. No parallel mini-proposal mechanism |
| Agent 19 — pool allocation flow | **Agent 13** | Allocation is a `Proposal` with `category: "config_change"`. No parallel "two members co-sign" bootstrap |
| Agent 20 — reversibility tiers + impact reflection | **Agent 13** | See "What Agent 13 absorbs" above |
| Agent 21 — operator/hosting transparency | **Agent 11** | One more section of node config + a `GET /config` response field. Tiny extension, not a new agent |

## Deferred / gated

Pieces that are intentionally not on the current roadmap because they
need a prior decision, prior infrastructure, or prior operational
experience. Each has a clear gate.

| Item | Gated on | Why |
|------|----------|-----|
| Agent 18b — community web graph | Threat-model §7 entry + governance proposal opting in | Force-directed who-helps-whom is the highest-value social-graph leak in the system. Default-off behind a governance gate, or not at all |
| Agent 19 — balance cap + community pool | Resolution of [issue #6](https://github.com/ardentcascades/understoria/issues/6) | Cap overflow and project organizing are two faces of the same credit-model question. Decide it once, build it once |
| Agent 21 — federation mutual aid fund | Agent 15 shipped + ≥1 federation pair operating in practice | Cross-node fund disbursement is a 4th nesting layer of governance and an attractive target for adversarial behaviour. Needs operational federation experience and a threat-model pass first |
| GOVERNANCE.md welfare-flag amendment | Modified-consensus ratification | The moderator welfare flag is a governance policy choice (do moderators get standing authority to delay decisions?) — must be ratified before it ships as a feature |

## Ordering (staged delivery)

The ordering below is the recommended sequence, not a parallel work
plan. Agents 16 and 18a are independent and can interleave with the
main Ostrom track.

```
                 ┌─────────────────────────────────────────────┐
   DONE          │ A. Agent 11 (config) — SHIPPED              │
                 │ B. Agent 13 + 14 unified Decisions — SHIPPED│
                 │    (proposals, voting, consensus close,     │
                 │     impact reflection, dispute migration)   │
                 │ C. Agent 16 (onboarding) — SHIPPED          │
                 │ D. Agent 18a (breadth + reciprocity) — DONE │
                 └────────────┬────────────────────────────────┘
                              │
                              ▼
                 ┌─────────────────────────────────────────────┐
   now           │ E. Pilot deployment with real users         │
                 │    validate governance defaults, surface    │
                 │    real disputes, measure safeguard flags   │
                 └────────────┬────────────────────────────────┘
                              │
                              ▼
                 ┌─────────────────────────────────────────────┐
   next          │ F. Agent 3 core scope DONE (pull loop,      │
                 │    invites endpoint, PWA surfacing).        │
                 │    Remaining: cross-node lifecycle sync +   │
                 │    dashboard aggregation.                   │
                 │    Agent 15 is meaningless without this     │
                 └────────────┬────────────────────────────────┘
                              │
                              ▼
                 ┌─────────────────────────────────────────────┐
   then          │ G. Agent 14 lifecycle (mediation, outcome)  │
                 │    + Agent 12 (moderation + sanctions)      │
                 │    both require pilot telemetry             │
                 └────────────┬────────────────────────────────┘
                              │
                              ▼
                 ┌─────────────────────────────────────────────┐
   last          │ H. Agent 15 (federation governance)         │
                 │    requires 2+ peers actually federating    │
                 └─────────────────────────────────────────────┘
```

### Rationale per stage

**A–D (DONE).** Agents 11, 13, 16, and 18a have shipped. NodeConfig
carries 8 fields (3 safeguard thresholds, 3 task-check-in thresholds,
2 proposal-consensus thresholds). The unified Decisions surface handles
both `proposal` and `dispute` kinds with voting, consensus close,
reversibility tiers, and required impact reflection for hard tier.
Onboarding is complete (welcome flow, opsec guide, contextual hints).
Schema is at v12; 441 tests pass.

**E. Pilot deployment next.**
Every remaining agent needs input that only real use provides:
governance defaults (3-day deliberation? 2 affirms? 7-day check-in?)
are guesses until a community uses them; moderation (Agent 12) needs
false-positive rates from real safeguard flags; dispute mediation
(Agent 14) needs to know what a real dispute looks like. The pilot is
now the critical path, not more code.

**F. Agent 3 before any new governance work.**
Federation governance (Agent 15) makes no sense without working
federation. End-to-end messaging (Agent 2 task 5) is also Phase 3
work that members are asking for. The Ostrom additions do not justify
deferring Phase 3.

**G. Agent 14 lifecycle + Agent 12 after pilot telemetry.**
Agent 14's remaining work (mediation flow, credit resolution) and
Agent 12 (moderation queue + graduated sanctions) both presuppose
operational experience. The dispute migration is done (disputes live
in proposals), so Agent 14's lifecycle can build on that foundation
once real disputes surface patterns worth codifying. Agent 12's
sanction ladder needs measured false-positive rates, not guesses.

**H. Agent 15 last.**
Per-peer federation agreements are powerful and a great way to
fragment the network into incompatible dialects. We need the
discipline of having peered in practice — and surfacing real
disagreements about policy — before we encode a negotiation
mechanism for it.

## Non-goals

These are out of scope for the current Phase 5 design. If they
become necessary later, they get their own agent — and each requires
a prior decision (see "Deferred / gated" above).

- **Cross-node moderation.** A member sanctioned on node A is not
  automatically sanctioned on node B. Federation respects local
  autonomy; consequences travel by reputation, not by protocol.
- **Reputation scores or member ratings.** Achievements are roles,
  not rankings. We do not introduce a numeric trust score in the
  Phase 5 work.
- **Mandatory mediation.** Agent 14 offers a dispute path; it does
  not require it. Members can still leave a node and take their keys
  with them at any time (Ostrom principle 1, low-cost exit).
- **Voting that overrides individual consent.** Proposals signal
  community direction. They do not bind individuals against their
  consent — that's a code-of-conduct line, not a feature.
- **A community-wide social graph visible by default.** The
  who-helps-whom relational graph (Agent 18b) is the highest-value
  social-graph leak in the system. It does not ship without a
  threat-model entry, a governance proposal, and default-off
  semantics.
- **Mutually-binding federation funds.** The cross-node fund
  proposal (original Agent 21) is deferred until at least one
  federation pair operates in practice and the threat model has
  considered adversarial fund-drain scenarios.

## Open design questions

| Question | Tracking | Affects |
|----------|----------|---------|
| Credit model for community projects (organizer-debit vs. community pool vs. issuance) | [GitHub issue #6](https://github.com/ardentcascades/understoria/issues/6) | Agent 10, Agent 11, gates Agent 19 |
| Whether the moderator welfare flag is a governance norm we want | not yet filed; needs GOVERNANCE.md §5 amendment process | Agent 12 + Agent 13 integration |
| Whether the community web graph (Agent 18b) is worth its privacy cost in any deployment | not yet filed; needs threat-model §7 entry first | Agent 18b |
| Whether achievement progress should be private-by-default | not yet filed | Agent 1 maintenance |
| Whether the federation protocol should be ActivityPub-shaped or bespoke | not yet filed | Agent 3, Agent 15 |

## Failure modes to watch for

The planning work so far has surfaced a set of recurring antipatterns
worth capturing explicitly. Each one is named so it can be cited in
review (e.g. "this is a parallel-mini-implementation"); each has a
concrete check that catches it before it ships.

### Planning & scoping

- **Plan growth outpacing shipping.** Every accepted proposal adds
  agents to the queue; what closes them is code landing on `main`.
  *Check:* before accepting a new agent, identify which existing
  agent it blocks or which currently-open agent it fits inside.
  Prefer "fold into" over "add to queue."

- **Parallel mini-implementation.** Building a stub of a mechanism
  (mini-vote, two-member co-sign, ad-hoc recall) "to ship now, merge
  with Agent 13 later." The merge cost is real and usually larger
  than waiting. *Check:* if a proposal includes the phrase "if
  Agent X isn't done, use a simpler flow," that's the antipattern.
  Either wait for Agent X or rescope the proposal to not need it.

- **Bolting structural decisions onto already-shipped agents.**
  Reversibility tiers tacked onto Agent 13 after it ships means
  rewriting the state machine. *Check:* if a change modifies a core
  type's required fields or a state-machine transition, it belongs
  in the agent that owns that type — not in a follow-up agent.

- **Bundling unrelated work under one agent.** Original Agent 21
  bundled small infra-transparency (low risk, no deps) with a large
  federation fund (high risk, many deps). Hides the effort
  asymmetry and blocks the easy piece on the hard one. *Check:* an
  agent should have one user-facing surface and one trust model.
  If it has two, split it.

- **Treating governance norms as code design choices.** The
  moderator welfare flag changes who has standing authority to
  delay decisions — that's a `GOVERNANCE.md` amendment, not a
  feature flag. *Check:* if a feature would change "who can do what
  to whom," ratify the norm before writing the code.

### Privacy & threat surface

- **New exposure surface without a `docs/threat-model.md` §7
  entry.** Every feature that exposes who-helps-whom, who-operates-
  this-node, who-talked-to-whom, or who-flagged-what is a new
  surface. *Check:* the §7 entry comes *before* the implementation
  PR, not after.

- **Default-on social-graph rendering.** Agent 18b's force-directed
  community web is the canonical example. Display names instead of
  public keys don't help — *structure* is the leak, and a rendered
  graph is screenshottable. *Check:* social-graph visualisations
  default off, behind a governance proposal, with an explicit
  opt-in. Never ship one whose default is "on for everyone."

- **Cross-node consequence transfer.** Sanctions, trust scores, or
  fund disbursements that travel across federation undermine local
  autonomy (Ostrom principle 1). *Check:* federation is technical
  peering, not political union. Consequences travel by reputation,
  not by protocol.

- **Skipping default-off thinking.** "Could be configured to be
  private" is not the same as "private by default." *Check:* for
  every new data exposure, the question to answer is "what does a
  fresh install show?" — not "what's the most restrictive setting?"

### Data model & migrations

- **Optional-then-required field creep.** "Ship the field as
  optional in agent A, make it required in agent B." Risky if
  agent A ships and the optional version ossifies, or if agent B
  is delayed indefinitely. *Check:* if a field will be required,
  introduce it as required with a backfill in the same Dexie
  migration. If it might be required, make that decision before
  the first agent ships.

- **Dexie migration ordering between parallel branches.** Two
  agents both targeting "version 9" merge-conflict on the schema.
  *Check:* the next free Dexie version is *reserved* by the first
  PR to land. The second PR rebases onto the next version.
  `docs/roadmap.md` "Migration strategy" tracks the reservation.
  Current state: PWA v10 = votes, v11 = task check-in, v12 = dispute
  migration, v13 = co-organizer support. Server is at v7. Next free
  PWA version: **14**. Next free server version: **8**.

- **Function signature changes without exhaustive call-site
  updates.** `balanceFor()` gaining two new parameters touches
  every page that displays a balance. *Check:* `grep -rn` the
  function name before merging; CI's typecheck catches most but
  not all (default parameters can mask missed updates).

- **Invariants broken by new record types.** Correction exchanges
  with negative hours break the `hoursExchanged > 0` assumption in
  `stats.ts` and `achievements.ts`. *Check:* introduce a
  discriminator (`correction: boolean`) and update every consumer
  in the same PR, not "in a follow-up."

- **New nullable fields on existing rows.** Adding
  `coOrganizerKeys` to `Project` leaves existing rows with
  `undefined`. *Check:* every schema-extending migration includes
  a Dexie `upgrade()` callback that backfills defaults on existing
  rows — even when the field is array-typed.

### Governance & values

- **Reputation-score creep.** Any feature that ranks members ("who
  has helped the most people," "who has the highest streak") is
  one design discussion away from a leaderboard. *Check:* the
  Phase 5 non-goals list `Reputation scores or member ratings` —
  cite it in review. The breadth bar (Agent 18a) is on the right
  side of this line because it rewards distribution, not volume,
  and shows reach without scoring.

- **Mandatory anything.** Mandatory mediation, mandatory governance
  participation, mandatory federation. *Check:* low-cost exit
  (Ostrom 1) must remain real. A member should always be able to
  decline the system and take their keys with them.

- **Veto mechanisms with soft framing.** "It doesn't block, it just
  delays until you respond" is still a power asymmetry. *Check:*
  if the mechanism gives a specific role standing authority to
  affect a process the rest of the community is in, it's a
  governance change. See "treating governance norms as code design
  choices" above.

- **Adversarial-actor blind spots.** The threat model contemplates
  surveillance, retaliation, infrastructure compromise. It does
  *not* yet contemplate adversarial federation actors draining a
  mutual aid fund or capturing a moderation queue. *Check:* every
  new shared resource (federation fund, mutual moderation,
  cross-node reputation) needs a §3 adversary entry before the
  implementation lands.

### Operational

- **i18n debt compounding.** Every new agent adds locale keys. The
  Spanish translation is already flagged for native-speaker review;
  shipping more keys before that review compounds the debt.
  *Check:* before any Phase 5 agent that adds >20 locale keys, a
  Spanish review pass on existing keys lands first.

- **Building enforcement on untested signal.** Graduated sanctions
  on top of safeguard flags that have no false-positive
  measurement risks codifying punishment for noise. *Check:*
  Agent 12 ships the queue first, gathers data from a real
  deployment, then designs the sanction ladder against measured
  rates.

- **Performance assumptions from pilot scale.** O(members ×
  exchanges) is fine at 200 members and 10k exchanges; not fine at
  10k members and 1M exchanges. *Check:* new computations on the
  exchange log declare their complexity in a comment and a test.
  Cache to the server only when the test demonstrates the need.

- **Federation features without federation experience.** Per-peer
  agreements, cross-node disputes, and cross-node funds all
  presuppose at least one peering operating in practice.
  *Check:* anything that touches `peerNodes` waits until Agent 3's
  pull loop has run between two distinct hosts for at least one
  week.

## Political-education additions (docs-only)

The "Beyond Ostrom" plan proposed six reading-list additions to
`docs/political-education/README.md` — one per tradition the agents
draw from (potlatch, Zapatista, Mondragon, Haudenosaunee, Kerala,
Cooperation Jackson). These additions are orthogonal to which agents
ship and can land any time as a docs-only PR. They document the *why*
behind the structural work and are valuable regardless of
implementation pace. Tracked as `Agent 9` (Documentation & i18n)
maintenance work.

## Phase mapping

The phase view in `README.md` maps onto these agents roughly as:

- **Phase 1 — Foundations:** Agents 1, 4 (threat model), 5 (governance draft)
- **Phase 2 — Hardening:** Agent 2, Agent 4 (panic + safeguards), Agent 10 Phase 1–2
- **Phase 3 — Federation:** Agent 3, Agent 9 (Spanish), Agent 7
- **Phase 4 — Launch:** pilot deployment, v1.0
- **Phase 5 — Commons governance:** Agents 11 → 15 (Ostrom core) + 16 + 18a, staged as above

Phase 5 does not block Phase 4. Agents 11, 13, 16, and 18a have
shipped — a v1.0 pilot can proceed now with the full governance
surface, onboarding, and breadth/reciprocity dashboard. Agents 12,
14 (lifecycle), and 15 are gated on pilot telemetry and federation
experience respectively.
