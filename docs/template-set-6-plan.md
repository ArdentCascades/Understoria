# Project template Set 6 — implementation plan

Status: **PLAN** — ten new community project templates (solar co-op,
worker co-op incubator, elder meal delivery, disaster relief hub,
recovery peer support, fitness groups, urban orchard, new-parent
support, foster/kinship support, weather survival outreach), from the
operator-provided Set 6 source document. This plan maps that source
onto the real content pipeline so implementation is mechanical.
Sets 1–5 (54 templates) shipped without a plan doc; Set 6 gets one
because the pipeline has since grown guards (tips/steps coverage
tests, context-field requirements, category map) that make the
append a four-file lockstep edit worth writing down.

## 0. What "adding a set" actually touches

The UI has no concept of sets — templates are one flat, filterable
gallery. Appending ten templates is a lockstep edit of four content
files plus two test files:

| File | Change |
|---|---|
| `apps/web/src/content/projectTemplates.ts` | +10 objects in `PROJECT_TEMPLATES_EN`, +10 in `PROJECT_TEMPLATES_ES` (same ids, same order, same cadence positions) |
| `apps/web/src/content/taskTips.ts` | +10 keys in `TASK_TIPS`, one `{en,es}` tip per task (70 tips), index-aligned |
| `apps/web/src/content/taskSteps.ts` | +10 keys in `TASK_STEPS`, 3–5 starter steps per task per locale (70 lists ×2) |
| `apps/web/src/content/projectTemplates.test.ts` | count `54→64` (two places), +10 rows in `EXPECTED_CATEGORY` |

The coverage tests are exact-set equality: `TASK_TIPS` and
`TASK_STEPS` keys must equal the template id set, one entry per task,
`es !== en` everywhere, tips ≤400 chars, steps ≤120 chars each.
Nothing else changes: all twelve categories already have display
meta, the picker derives its filters dynamically, and the plug-in
matcher reads live task rows, not templates.

## 1. Id and category assignments

Valid `ProjectCategory` values: transport, food, childcare,
skilled_labor, emotional_support, education, housing, tech, other,
infrastructure, organizing, mutual_aid_drive.

| # | Source project | id | defaultCategory |
|---|---|---|---|
| 1 | Community Solar & Energy Cooperative | `community-solar-coop` | infrastructure |
| 2 | Worker Cooperative & Job Skills Incubator | `worker-coop-incubator` | education |
| 3 | Elder Companionship & Meal Delivery | `elder-meal-delivery` | food |
| 4 | Disaster Relief Distribution Hub | `disaster-relief-hub` | organizing |
| 5 | Recovery & Sober Peer Support Network | `recovery-peer-support` | emotional_support |
| 6 | Community Fitness & Wellness Groups | `community-fitness` | other |
| 7 | Urban Orchard & Food Forest | `urban-orchard` | food |
| 8 | Postpartum & New Parent Support Network | `new-parent-support` | childcare |
| 9 | Foster & Kinship Care Support Network | `foster-kinship-support` | childcare |
| 10 | Cold & Hot Weather Survival Outreach | `weather-survival-outreach` | mutual_aid_drive |

Judgment calls, named: elder meal delivery files under **food** (the
deliverable) though companionship is half its soul; fitness lands in
**other** (no recreation/health category exists — same call as
health-navigation); weather outreach is a **mutual_aid_drive**
(supply distribution, like the wood/pet-food banks) while its cousin
cooling-warming-center stays `other` (a place, not a drive).

## 2. Hours honesty (verified against the source)

`setupHours` is an author-set headline number with no reconciling
test — so the plan reconciles it by hand. Every per-project total in
the source equals the sum of its one-time task hours, with exactly
one recurring exception:

- All ten totals check out (27/27/22/24/22/19/21/21/24/24).
- **Urban orchard task 5 ("Host planting days", ~5h per planting)**
  is recurring and excluded from the 21h total. It gets
  `recurringCadence: "cycle"` (the per-planting-cycle cadence) and
  its 5h stays out of `setupHours` — matching how the source and the
  existing convention both treat recurring work.

No other Set 6 task is marked recurring in the source; none gets a
cadence.

## 3. Safety callouts

Four projects carry safety notes (solar legal/financial, recovery
scope-of-practice, foster mandatory-reporting, weather medical
emergencies) and the postpartum project a fifth. The schema has no
dedicated safety field — by the harm-reduction and oral-history
precedent, the caution goes into `whatYoullNeed` prose, stated
plainly and un-hedged (e.g. "…and clear boundaries: peer
facilitators are not medical providers and must never advise on
detox or medication"). Tips for the relevant tasks reinforce the
same line — the same double-carry used for harm-reduction-supplies.

## 4. Context fields

Required for every template: non-empty `firstSteps` and
`commonPitfalls` (both locales), `pairsWith` 1–3 existing ids,
`learnMore` ≤2 real FAQ ids (or omitted). Planned `pairsWith` — all
verified against the current 54 ids:

| Template | pairsWith |
|---|---|
| community-solar-coop | weatherization-brigade, bulk-buying-coop |
| worker-coop-incubator | skill-share, solidarity-fund, time-bank |
| elder-meal-delivery | community-meal, neighborhood-care-network, rides-transportation |
| disaster-relief-hub | emergency-preparedness, resource-hub-dispatch |
| recovery-peer-support | mental-health-peer-support, harm-reduction-supplies |
| community-fitness | disability-support-network, neighborhood-care-network |
| urban-orchard | community-garden, gleaning-network, seed-library |
| new-parent-support | diaper-hygiene-bank, childcare-collective, welcome-wagon |
| foster-kinship-support | diaper-hygiene-bank, free-store, childcare-collective |
| weather-survival-outreach | cooling-warming-center, harm-reduction-supplies, resource-hub-dispatch |

These encode the source's "connect the projects" guidance (the
disaster hub builds on the preparedness network; elder meals draw on
the people's kitchen — which is the existing `community-meal`
template; the postpartum and foster networks lean on the diaper bank
and free store). `learnMore` entries are added only where an existing
FAQ id genuinely fits — never invented.

Other optional fields: `suggestsWorkDays: true` for `urban-orchard`
and `disaster-relief-hub` (site prep, planting days, hub setup are
classic work-day material); conservative `follows` indexes where the
source implies order (e.g. orchard site prep follows design,
planting follows prep; hub distribution follows intake design);
per-task `skills` words where a real skill is named (electrical,
cooking, driving, childcare, first aid).

## 5. Authoring workflow (agents, four phases)

1. **EN templates** — two agents, five templates each, writing exact
   `ProjectTemplate` literals from the Set 6 source (voice: the
   existing templates' plain, direct register; safety prose per §3;
   ids/categories/pairsWith per §1/§4; hours per §2).
2. **ES templates** — two agents translating to neutral
   Latin-American Spanish (the established register), preserving
   ids, task order, cadence positions, pairsWith/learnMore
   verbatim; `es !== en` everywhere.
3. **Tips + starter steps** — two agents producing, per task, one
   {en, es} tip (14–38 words, ≤400 chars, per the Set 1–5 tips
   spec) and 3–5 starter steps (≤120 chars each, both locales).
   Spliced into the two committed files by hand — the scratchpad
   assembler scripts regenerate whole files from session-local
   batches and are NOT the durable path.
4. **Wire + verify** — splice all four files, update the two test
   counts and `EXPECTED_CATEGORY`, then gates: content suites
   (projectTemplates, taskTips, taskSteps, faq parity), full web
   suite, tsc, eslint; browser-check the picker gallery and one new
   template's full detail (context block, tips, steps) in both
   languages; CHANGELOG entry; PR.

Every agent's output is reviewed against the guards before splicing
— the tests are the contract, and they catch misalignment (task
counts, cadence positions, untranslated strings) mechanically.

## 6. Size and sequencing

One PR. The diff is large but uniform (~10 templates × 2 locales +
70 tips + 70 step lists ≈ several thousand lines of content), and
splitting it would leave the coverage tests red between PRs — the
exact-set-equality guards make partial appends unshippable by
design. Estimated agent fan-out: six authoring/translation agents +
the wiring pass.
