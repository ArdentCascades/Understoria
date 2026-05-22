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
| 3 | Federation & Infra | partial | Fastify node, signed-exchange verification, Docker, outbox mirror. **Pending:** pull loop, posts/vouches/invites endpoints |
| 4 | Security & Opsec | partial | Threat model, opsec guide, panic button, anti-gaming safeguards. **Pending:** ongoing per-PR review |
| 5 | Governance & Coop | partial | Code of Conduct, GOVERNANCE.md, trademark policy |
| 6 | (reserved) | — | — |
| 7 | Organizing Integration | not started | Campaigns, power mapping, meeting tools |
| 8 | (reserved) | — | — |
| 9 | Documentation & i18n | partial | Member/operator/organizer/developer/quickstart guides, political-education, English + Spanish |
| 10 | Community Projects & Momentum | partial | Project + task lifecycle, signed task-completion exchanges, milestones. **Pending:** Phase 3 — momentum tracking, sparklines, four project achievements |

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

| # | Agent | Ostrom principle(s) | Owns |
|---|-------|---------------------|------|
| 11 | Node Configuration & Local Rules | 2 (rules fit local conditions) | Per-node config table replacing the hardcoded constants in `safeguards.ts`; operator-facing config UI. **Folds in:** operator-info / hosting transparency block from the original Agent 21 |
| 12 | Moderation & Graduated Sanctions | 4, 5 (monitoring, graduated sanctions) | Moderation queue, action log, escalation policy. Requires real safeguard-flag telemetry first |
| 13 | In-App Governance & Proposals | 3 (collective-choice arenas) | Proposal lifecycle, voting / consensus signalling, decision archive. **Folds in:** reversibility tiers + impact reflection + welfare flag (the structural pieces of the original Agent 20) |
| 14 | Dispute Resolution & Mediation | 6 (low-cost conflict resolution) | Two-party dispute lifecycle, mediator assignment, outcome log |
| 15 | Federation Governance & Nested Boundaries | 1, 8 (clear boundaries, nested enterprises) | Per-peer federation agreements, negotiable vs. protocol-invariant policy split |

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
  (1-year, 5-year, reversal path, vulnerable impact). Not enforced
  programmatically — structural pause, not gatekeeping.
- **Welfare flag** is *not* shipped with Agent 13. It's a governance
  policy choice (does the moderation committee get standing authority
  to delay decisions?) that belongs in `GOVERNANCE.md` first, as a
  §5 amendment. Once ratified, it becomes an Agent 12 + Agent 13
  integration task.

## Agents 16 – 18a (standalone additions from the "Beyond Ostrom" plan)

Two of the six agents in the "Beyond Ostrom" draft stand on their own
and have no cross-cutting dependencies. They're listed here as
first-class Phase 5 work rather than absorbed into existing agents.

| # | Agent | Source tradition | Owns |
|---|-------|-----------------|------|
| 16 | Onboarding & Political Literacy | Kerala model | Four-screen welcome flow, in-app member/opsec guides, contextual first-time hints. Activates the existing-but-unused `SETTING_KEYS.onboarded` |
| 18a | Breadth & Reciprocity Dashboard | Potlatch tradition (the safe half) | Breadth bar (members ranked by *unique* people helped, not hours) + reciprocity pulse (% of connections that flow both ways). New "Weaver" achievement for spanning 3+ zones |

**Agent 18 is intentionally split.** The original Agent 18 also
proposed a force-directed community web graph showing who-helps-whom.
That visualisation is the social graph the threat model is most
explicit about protecting — display names instead of public keys
don't help, the *structure* is the leak, and a rendered graph is
screenshottable. The graph is deferred to **18b** (gated below)
pending a threat-model entry and a governance vote on whether to
enable it by default.

## Absorbed into existing agents

Pieces of the "Beyond Ostrom" plan that fit cleanly inside an
already-planned agent, rather than warranting a new agent:

| Original proposal | Lands in | Notes |
|-------------------|----------|-------|
| Agent 17 — co-organizer roles + rotation | **Agent 10 Phase 3** | Existing `requireOrganizer()` broadens to `isOrganizer()`; Project gains `coOrganizerKeys`, `lastRotatedAt`, `rotationIntervalMs`. Rotation reminders are advisory, matching GOVERNANCE.md §4 |
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
   now           │ A. Agent 11 (config) — minimal scope        │
                 │    replace constants in safeguards.ts only  │
                 │    folds in: operator-info transparency     │
                 │    grounding use case: issue #6             │
                 └────────────┬────────────────────────────────┘
                              │
   in parallel ◄──────────────┼──────────────►  Agent 16 (Kerala onboarding)
   any time                   │                  Agent 18a (Breadth + reciprocity)
                              │                  political-education docs additions
                              ▼
                 ┌─────────────────────────────────────────────┐
   next          │ B. Finish Agent 3 (federation pull loop)    │
                 │    and the missing server endpoints         │
                 │    Agent 15 is meaningless without this     │
                 └────────────┬────────────────────────────────┘
                              │
                              ▼
                 ┌─────────────────────────────────────────────┐
   then          │ C. Agent 13 + 14 as one "Decisions" surface │
                 │    proposal & dispute share a table         │
                 │    folds in: reversibility tiers, impact    │
                 │    reflection, recall (from Agent 17),      │
                 │    pool allocations (from Agent 19)         │
                 │    folds in: co-organizer support           │
                 │    via Agent 10 Phase 3 (parallel track)    │
                 └────────────┬────────────────────────────────┘
                              │
                              ▼
                 ┌─────────────────────────────────────────────┐
   later         │ D. Agent 12 (moderation + sanctions)        │
                 │    requires real telemetry from a deployed  │
                 │    node — false-positive rate, triage load  │
                 └────────────┬────────────────────────────────┘
                              │
                              ▼
                 ┌─────────────────────────────────────────────┐
   last          │ E. Agent 15 (federation governance)         │
                 │    requires 2+ peers actually federating    │
                 └─────────────────────────────────────────────┘
```

### Rationale per stage

**A. Agent 11 first, scoped tightly.**
The smallest of the structural agents, and the only one that
*replaces* existing hardcoded values rather than adding net-new
surface. Scope is limited to: a `nodeConfig` table, three fields
(`dailyHelperLimit`, `shortExchangeHours`, `reciprocalPairThreshold`)
that today live as constants in `apps/web/src/lib/safeguards.ts`, an
operator-facing config screen, and one extra block of operator/
hosting transparency on `GET /config` (folded in from the original
Agent 21). The grounding use case is community proposal issue #6 —
that proposal's resolution likely becomes a fourth config field,
which validates the abstraction against a real decision.

**Agents 16 and 18a can ship any time.**
Neither depends on the rest. Agent 16 (onboarding) replaces dead code
(`SETTING_KEYS.onboarded` already exists and is unused) and closes a
real gap (member-guide.md is unreachable from the PWA). Agent 18a
(breadth + reciprocity) is a small Dashboard addition that uses only
data already in the exchange ledger. Both are good "between bigger
agents" work.

**B. Agent 3 before any new governance work.**
Federation governance (Agent 15) makes no sense without working
federation. End-to-end messaging (Agent 2 task 5) is also Phase 3
work that members are asking for. The Ostrom additions do not justify
deferring Phase 3.

**C. Agent 13 + 14 as one surface, absorbing recall and allocation.**
A "Decisions" table with `kind: proposal | dispute | recall` is
closer to the truth than three separate features. Building it once
absorbs the parallel mini-proposal mechanisms that the "Beyond
Ostrom" plan otherwise would have spun up for organizer recall
(Agent 17) and pool allocation (Agent 19). Reversibility tiers and
impact reflection (Agent 20) ship as part of this state machine from
day one. Co-organizer support from Agent 17 can ship in parallel as
**Agent 10 Phase 3** — it doesn't need the Decisions surface, just
the broadened organizer check.

**D. Agent 12 after operational telemetry exists.**
Graduated sanctions presuppose detection that is accurate enough to
act on. Today we have safeguard flags but no moderation queue, no
false-positive measurement, no moderator workflow. Codifying
sanctions on top of an untested signal risks punishing noise. Ship
the queue first (probably as part of Agent 12 task 1), gather real
data, then design the sanction ladder against it.

**E. Agent 15 last.**
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

Phase 5 does not block Phase 4: a v1.0 pilot can ship with Agent 11
and Agent 16 only.
