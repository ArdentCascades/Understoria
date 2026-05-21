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
| 11 | Node Configuration & Local Rules | 2 (rules fit local conditions) | Per-node config table replacing the hardcoded constants in `safeguards.ts`; operator-facing config UI |
| 12 | Moderation & Graduated Sanctions | 4, 5 (monitoring, graduated sanctions) | Moderation queue, action log, escalation policy. Requires real safeguard-flag telemetry first |
| 13 | In-App Governance & Proposals | 3 (collective-choice arenas) | Proposal lifecycle, voting / consensus signalling, decision archive |
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

## Ordering (staged delivery)

The Ostrom additions are accepted into the canonical plan but
*staged* — they do not all ship in parallel, and they do not jump
ahead of the unfinished Phase 3 work. The ordering below is the
recommended sequence, not a parallel work plan.

```
                 ┌─────────────────────────────────────────────┐
   now           │ A. Agent 11 (config) — minimal scope        │
                 │    replace constants in safeguards.ts only  │
                 │    grounding use case: issue #6             │
                 └────────────┬────────────────────────────────┘
                              │
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
The smallest of the five, and the only one that *replaces* existing
hardcoded values rather than adding net-new surface. Scope is limited
to: a `nodeConfig` table, three fields (`dailyHelperLimit`,
`shortExchangeHours`, `reciprocalPairThreshold`) that today live as
constants in `apps/web/src/lib/safeguards.ts`, and an operator-facing
config screen. Nothing else. The grounding use case is community
proposal issue #6 (the credit-model question) — that proposal's
resolution likely becomes a fourth config field, which validates the
abstraction against a real decision.

**B. Agent 3 before any new governance work.**
Federation governance (Agent 15) makes no sense without working
federation. End-to-end messaging (Agent 2 task 5) is also Phase 3
work that members are asking for. The Ostrom additions do not justify
deferring Phase 3.

**C. Agent 13 + 14 as one surface.**
A "Decisions" table with `kind: proposal | dispute` is closer to the
truth than two separate features. Build the shared lifecycle first;
specialise only when the data shows two distinct shapes.

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

These are out of scope for the Ostrom extension as currently
designed. If they become necessary later, they get their own agent.

- **Cross-node moderation.** A member sanctioned on node A is not
  automatically sanctioned on node B. Federation respects local
  autonomy; consequences travel by reputation, not by protocol.
- **Reputation scores or member ratings.** Achievements are roles,
  not rankings. We do not introduce a numeric trust score in the
  Ostrom work.
- **Mandatory mediation.** Agent 14 offers a dispute path; it does
  not require it. Members can still leave a node and take their keys
  with them at any time (Ostrom principle 1, low-cost exit).
- **Voting that overrides individual consent.** Proposals signal
  community direction. They do not bind individuals against their
  consent — that's a code-of-conduct line, not a feature.

## Open design questions

| Question | Tracking | Affects |
|----------|----------|---------|
| Credit model for community projects (organizer-debit vs. community pool vs. issuance) | [GitHub issue #6](https://github.com/ardentcascades/understoria/issues/6) | Agent 10, Agent 11 |
| Whether achievement progress should be private-by-default | not yet filed | Agent 1 maintenance |
| Whether the federation protocol should be ActivityPub-shaped or bespoke | not yet filed | Agent 3, Agent 15 |

## Phase mapping

The phase view in `README.md` maps onto these agents roughly as:

- **Phase 1 — Foundations:** Agents 1, 4 (threat model), 5 (governance draft)
- **Phase 2 — Hardening:** Agent 2, Agent 4 (panic + safeguards), Agent 10 Phase 1–2
- **Phase 3 — Federation:** Agent 3, Agent 9 (Spanish), Agent 7
- **Phase 4 — Launch:** pilot deployment, v1.0
- **Phase 5 — Commons governance:** Agents 11 → 15, staged as above

Phase 5 is new with this revision. It does not block Phase 4: a v1.0
pilot can ship with Agent 11 only.
