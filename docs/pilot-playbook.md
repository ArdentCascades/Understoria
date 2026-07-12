# Pilot playbook — how to actually run a pilot

> **Status:** ready. The single operational document for the founding
> operator + organizers running Understoria with a real community for
> the first time. It turns "do a pilot" (`roadmap.md` stage E) into a
> procedure: what to do before, what to look at each week, when the
> pilot has answered the questions the deferred roadmap rows wait on,
> and what to do when something goes wrong.

"Pilot" appears across the docs as the gate on a half-dozen deferred
decisions, but a no-telemetry app has no built-in way to collect the
signal those decisions need. This playbook is that mechanism: **you
look, on a schedule, in named places, and you write down what you
see** (the pilot journal, `/pilot-journal`, is where members do the
same). Nothing here measures or phones home — the whole point is that
the operator and the members remain the instruments.

---

## §1 Preflight (week −2 to 0)

Do these once, before the first non-founder joins. Each is a runbook
that already exists — this is the checklist that says *now*.

- [ ] **Security posture.** Run the `operator-guide.md` §9 security
      checklist end to end on the live node.
- [ ] **Backups are restorable — proven, not assumed.** Take a backup
      (`backup-db.sh`) AND rehearse a restore into a scratch container
      (`operator-guide.md` §7). A backup you have never restored is a
      hope, not a backup.
- [ ] **Both drills run once, fresh.** On `/infrastructure`, complete
      the **storm-hub** drill (`offline-resilience.md` §4) and the
      **re-seed** drill (`community-reseed.md`) so `lastDrilledAt` is
      recent on both. You want the recovery muscle warm *before* you
      need it, not during the incident.
- [ ] **Mirror, if a second host exists.** Pair a mirror
      (`operator-guide.md` §6 "pairing two nodes as mirrors") so one
      server disappearing is a non-event.
- [ ] **Every pilot member is reachable off-Understoria.** A phone
      number, a Signal handle, an email — anything not inside the app
      (`operator-guide.md` §9 already requires this). The recovery and
      enforcement runbooks all assume you can reach a member out of
      band ("read me your build stamp", "tap Refresh").
- [ ] **The printed offline kit is posted** where members gather
      (`print/offline-kit` → the wall poster + wallet cards). A pilot
      that only works while the network does is not yet resilient.

---

## §2 The knobs the pilot must ratify

These three community-wide settings have sensible defaults, but they
are **governance decisions, not operator preferences**. Make the
**pilot's very first proposal** "adopt or adjust these" — it settles
them on the record *and* exercises the Decisions surface (`/proposals`)
on a real, low-stakes question before anything contentious arrives.

| Knob | Default | Where it lives | What it controls |
| --- | --- | --- | --- |
| `autoConfirmHours` | 168 (7 days) | NodeConfig → Community settings; `db/nodeConfig.ts` | How long a completed exchange waits before the node's system key may auto-confirm it. `0` disables auto-confirm entirely. |
| `proposalDeliberationDays` | 3 | NodeConfig → Community settings | Minimum days a proposal must stay open before it can be closed as passed. |
| `proposalMinAffirms` | 2 | NodeConfig → Community settings | Minimum affirmative votes (with no blocks) for a proposal to pass. |

Also on the table, from `auto-confirm-key.md` §7 ("Open questions /
pilot validation"): whether the community wants auto-confirm on at all,
and — once it does — the operator's rollout of enforcement (the
`operator-guide.md` §6 "turning on auto-confirm window enforcement"
runbook, which the build stamp in Settings was added to support).

Changing any of these later is the same `config_change` proposal flow —
so the first proposal doubles as the template for every knob change
after it.

---

## §3 Week-by-week attention list

Each week, **look** at these (don't measure — look). Every row names
where the answer lives and which deferred decision its answer moves.

| Look at | Where it lives | Why — what its answer un-gates |
| --- | --- | --- |
| Are posts getting answers? | Board (`/`) | The core "is this a community or an empty room" signal. Sustained silence means the pilot needs seeding help, not a feature. |
| Are claims sitting unconfirmed past the window? | In-my-care; operator SQLite (the `awaiting_transitions` / `exchanges` join from the §6 enforcement runbook, step 3) | Confirms the auto-confirm window is behaving before you flip enforcement on. Persistent stragglers → coach members, or the window is too short (a §2 proposal). |
| Did anyone hit the storage meter? | Settings storage line; `/infrastructure` | The insert-cap pruning/quota policy (roadmap stage E) is gated on "what a community wants when a table legitimately fills." Approaching a ceiling is the signal to start that design. |
| Did anyone need the recovery path? | `identity-recovery.md` flows (recovery kit / guardian shards) | Validates the recovery UX under real stress. A failed recovery is a stop-the-pilot event. |
| Is the safeguards flag firing? | `/disputes` (flagged exchanges — the `flagged_for_review` query, §6 runbook step 3's sibling) | Real flag rates tell you the false-positive rate the safeguards were guessing at, and feed Agent 14 (dispute mediation). |
| Did a real dispute happen? | `/disputes` (proposal `kind: "dispute"`) | The single biggest stage-E question. "A dispute happened and the flow was / wasn't enough" is what scopes Agent 14's mediation + credit-resolution lifecycle. |
| Are members asking for photos? | Pilot journal (`/pilot-journal`), check-ins | The photos framework (Plan 6) is design-only and deliberately unbuilt; real demand is its activation trigger. |
| Did the first governance proposal run cleanly? | `/proposals` | Validates the Decisions surface (deliberation window, affirm/block, consensus close) on the low-stakes §2 knob vote before a hard one. |

Read the pilot journal each week too — it is the members' side of this
same list, in their own words.

---

## §4 Exit criteria for stage E

Stage E ("pilot deployment with real users") is done not on a date but
when the pilot has produced the concrete observations the deferred
roadmap rows were waiting for. You are looking for these to *happen*,
and to write down what happened:

- **A dispute occurred, and you can say whether the current flow was
  enough.** → scopes Agent 14 (mediation flow, mediator assignment,
  credit resolution). No dispute yet ≠ failure — it means that row
  stays parked, honestly.
- **A table ceiling (`TABLE_ROW_CEILING` / `PER_KEY_ROW_CEILING`) was
  approached.** → starts the pruning / per-member-quota policy design
  (a governance question, not just a knob).
- **Members asked for photos.** → activates Plan 6.
- **The auto-confirm window behaved** (claims settled correctly; no
  premature or stuck confirmations). → GO for the §6 enforcement flip.
- **Safeguard flags fired at a tolerable false-positive rate.** →
  informs safeguards tuning and Agent 14's inputs.
- **The recovery path was exercised at least once** (a drill or a real
  loss) and worked. → recovery UX validated for the next community.

When you can write a sentence next to each of these, the pilot has done
its job — the deferred rows now have the signal they were gated on.

---

## §5 Incident pages

Short "when X happens, do Y" entries. None of these is improvised —
each points at a runbook that already exists, so a stressful moment is
a lookup, not invention.

- **A node is lost** (disk dead, machine seized, no mirror) →
  `operator-guide.md` §6 "recovering from total node loss (re-seed)" +
  `community-reseed.md`. Members' devices hold the whole signed
  history; any member can upload it back. Start with the seed vaults.
- **A member loses their only device or key** →
  `identity-recovery.md` (the recovery kit they exported, or guardian
  shards their vouched-for peers hold). If neither exists, the identity
  is gone — which is exactly why §1 posts the offline kit and why the
  recovery drill matters.
- **Two members are in conflict** → `/disputes` opens a proposal
  (`kind: "dispute"`) with named parties and a consensus close; for
  personal relief that needs no community process, `blocking.md` is the
  one-tap, local-only block. They compose — a block is not a verdict.
- **The community wants to change a default** → the `/proposals`
  `config_change` flow (the same one §2's first proposal used).
- **You are ready to enforce the auto-confirm window** →
  `operator-guide.md` §6 "turning on auto-confirm window enforcement"
  (verify build stamps, wait one window, GO/NO-GO query, flip, confirm
  the `missing_transition` refusal, roll back by unsetting the env).
- **A federated table fills (507s in the logs)** → the insert-cap
  backstop is working as designed: nothing is deleted, honest outboxes
  retry. Note it (§3 storage row) — it is the signal that starts the
  pruning-policy conversation, not an emergency.

---

## See also

- `operator-guide.md` — §6 node operation + runbooks, §7 backups, §9
  security posture.
- `auto-confirm-key.md` §7 — the auto-confirm open questions.
- `community-reseed.md`, `offline-resilience.md`, `identity-recovery.md`,
  `blocking.md` — the runbooks §5 points at.
- `/pilot-journal` (in-app) — the members' feedback channel that feeds
  §3 and §4.
- `next-cycle-plans.md` Plan 3 — the package this playbook completes.
