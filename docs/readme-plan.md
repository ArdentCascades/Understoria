# The README, for three audiences (code-verified plan)

Status: **plan only — nothing changed yet.** Every number below was
measured against the tree at `0717f15`, not estimated, in the same
spirit as `docs/rtl-plan.md` and the router-8 / React-19 / eslint-10
plan docs. Where the README makes a factual claim, this document names
the file that decides whether the claim is true.

**Why now.** The README has three readers and serves one. An organizer
deciding whether to bring this to their group, a developer deciding
whether to contribute, and — increasingly — an AI agent asked to edit
the file later. The third is not a style preference. It is a drift
problem, and the drift is already here: **the README says the project
has a Spanish translation. It ships eight languages.**

## What the survey found

### 1. The structure is aimed at contributors; the prose is aimed at organizers

Measured over all 404 lines:

| audience | sections | lines | share |
|---|---|---:|---:|
| developers / operators | Quick Start, Architecture, Project Structure, Contributing, Roadmap | 230 | **57%** |
| organizers / members | What It Does, Why It Exists, Ethical Use | 75 | **19%** |
| everyone | header, status, docs table, community, licence | 99 | 24% |

The tell is what an organizer meets reading top-to-bottom. Four good
sections, and then the first *actionable* instruction in the document,
at line 133:

```bash
git clone https://github.com/ardentcascades/understoria.git
npm install && npm run dev
```

**The thing they need already exists and is never offered.**
`docs/organizer-guide.md` is 527 lines and opens: *"Audience: the
person who will decide whether Understoria is the right tool for a
specific community and, if so, how to introduce it without wrecking the
existing trust and rhythm."* That is exactly the reader the tagline
claims. The README does not route anyone there until **line 276**,
inside a table, on a row reading "People introducing the app to a
group". The top navigation (lines 12–21) has no organizer entry at all.

### 2. Three factual claims are false against the code

Not "might drift" — wrong today.

| README says | source of truth | actual |
|---|---|---|
| "Spanish translation" (L347); "translations (especially Spanish)" (L303) | `apps/web/src/i18n/languages.ts` | **8 languages**: en, es, fr, pt, zh, hi, vi, ru — every one `content: "full"` |
| Crypto: "tweetnacl / **libsodium.js**" (L245) | `apps/web/package.json`, `packages/shared/package.json` | **libsodium is not a dependency.** Only `tweetnacl@^1.0.3` |
| Acknowledgments credit **Automerge** among "projects that make this possible" (L388) | dependency manifests | **Automerge is not a dependency.** The convergent model is hand-rolled signed LWW records |

Automerge as *inspiration* is fair and worth keeping — but it is listed
beside Matrix, Mastodon and Signal under "projects that make this
possible", which reads as use.

Claims that were checked and are **correct**, so the plan must not
"fix" them: "two vouches" (`MINIMUM_VOUCHES_FOR_TRUST = 2` in
`apps/web/src/lib/vouch.ts:64`), the node port 8787
(`apps/server/src/config.ts:388`), "64 playbooks"
(`PROJECT_TEMPLATES_EN`), and all **19 relative links resolve**.

One soft case: the README says "Requires Node 20+" (L125) while CI
builds on Node 22 (`.github/workflows/ci.yml:25,73`). True but
untested below 22.

### 3. Two sections are duplicates, and the other copy is better

`docs/developer-guide.md` already carries **§1 Project layout** and
**§2 Tech stack, at a glance**. The developer-guide versions are more
accurate and more useful: the stack table there has a *Why* column and
names React 19, react-router v8, PBKDF2 @ 600k, and `tweetnacl` alone —
while the README's table says "React", "ActivityPub-inspired protocol,
CRDTs", and the libsodium claim above.

So these are not sections to *move*. They are a stale second copy to
**delete**, with the canonical one already written and linked.

### 4. The Roadmap says it is a summary and then is not one

Lines 317–319 promise "the phase view below is a public summary", then
run 61 lines — the single largest block in the file — including
`` `Follows:` framing + claimant ack line + chip suppression for
structurally-blocked tasks `` and "the earlier invites endpoint was
deliberately removed — open invites never cross any wire". That is the
internal decomposition pasted in, and it is where the stale Spanish
line lives. `docs/roadmap.md` (577 lines) is the real home.

### 5. "Agent N" is undefined vocabulary

The README uses **Agent 3, 7, 11, 12, 15, 16, 18a, and "Agents 13 + 14"**
— nine references — and never says what an Agent is. `docs/roadmap.md`
§"How the work is decomposed" defines it; the README does not link that
section. A human skims past it. A model is likelier to invent a meaning.

## The part that is not mechanical

Everything above is verifiable. What follows is judgement, and is the
reason this is a plan rather than a patch.

### a. One README, or a router?

GitHub renders exactly one README, so "an organizer README and a
developer README" is not available: whichever is not `README.md` goes
unread. The workable shape is **one file with an explicit router near
the top** — three lines, one per audience, before the reader has to
guess. It costs five lines and is the single highest-value change here.

### b. The privacy facts are in the wrong place

The strongest organizer material in the file is buried mid-bullet:
"no HTML injection path by construction", "nothing federates a
member-attendance graph", "Blocks never federate, never aggregate,
never signal anything to the blocked party", "The app server stores no
IP addresses". A core belief three sections later says *"Privacy is a
precondition for organizing. Workers face real retaliation."* The
protections that back that sentence deserve to be findable, not
parenthetical.

### c. Twelve flat bullets answer no question in order

An organizer asks: what does it do for my group, is it safe for us,
what does it cost me to run. The list gives "Community Board" and
"Invite-only mode" identical weight. Reordering is cheap; deciding the
order is not, and belongs to the operator of this repository.

## What "readable by an AI" means concretely

Not a tone. Four properties, each testable:

1. **One fact, one place.** Duplication is how the Spanish line
   survived: the roadmap exists twice and only one copy was maintained.
2. **Claims carry their source.** An HTML comment renders invisibly and
   is the first thing an editor sees:
   ```html
   <!-- 8 languages: apps/web/src/i18n/languages.ts.
        Guarded by README.guard.test.ts — update both. -->
   ```
3. **Stable, unique anchors.** Edits are made by matching an exact
   string and asserting it occurs once. Unique headings and unrepeated
   anchor phrases are what make that safe.
4. **A guard test, because that is this repo's idiom.** Alongside
   `lib/printChrome.guard.test.ts`, `lib/logicalProperties.guard.test.ts`,
   the i18n parity gates and the `ACTIVITY_TEXT_KEYS` drift guard, a
   `README.guard.test.ts` would assert: the language count matches
   `LANGUAGES`; the template count matches `PROJECT_TEMPLATES_EN`; the
   vouch threshold matches `MINIMUM_VOUCHES_FOR_TRUST`; the node port
   matches `config.ts`; every dependency the README names appears in a
   manifest; every relative link and image path resolves.

   That last pair is cheap and would have caught the libsodium and
   Automerge claims the day they stopped being true.

## Implementation order

**R1 — facts, cuts, guard.** No prose rewritten, nothing reordered.
- Correct the language claim; state the eight languages where an
  organizer will see them, including honestly that six carry
  `reviewStatus: "new"` (fr, pt, zh, hi, vi, ru) and have not yet had
  native-speaker review.
- Drop "libsodium.js"; move Automerge from "make this possible" to
  acknowledged inspiration.
- Delete the duplicated Project Structure (21 lines) and Tech Stack
  (part of Architecture's 47), linking `docs/developer-guide.md` §1–§2.
- Cut the Roadmap to a genuine ten-line phase summary over
  `docs/roadmap.md`.
- Replace each "Agent N" with plain words, or link the roadmap section
  that defines the term.
- Compress "Other ways in" (25 lines, six doc links) to two lines over
  `docs/desktop-appimage.md` and `docs/flash-drive-install.md`, both of
  which already carry the detail.
- `organisers` → `organizers` (L342 — the only British spelling).
- Add `README.guard.test.ts` and the source-of-truth comments.

Expected: roughly **115 lines out**, three false claims corrected, one
new test. Nothing an organizer or developer reads changes meaning.

**R2 — the reorder.** The router, a "What protects you" section built
from the facts already in the file, and Quick Start retitled so it is
plainly not the organizer's path. Prose work, reviewable as a diff, and
the part where the operator's judgement should overrule this document.

**R3 — optional.** Rank the twelve bullets (§c), and decide whether
"Achievements as Roles" needs a sentence defending it against the
belief that "collective progress matters more than individual scores".

## What this plan does not include

- Rewriting the Project Status beta notice. It is accurate, it is
  mirrored in-app, and it stays first.
- Touching `docs/organizer-guide.md`, `docs/developer-guide.md` or
  `docs/operator-guide.md`. They are the canonical copies; this work
  points at them rather than editing them.
- Adding further images. The README carries four (4.58 MB); the
  showcase site in `apps/site` is the home for more.
- Translating the README. Worth considering once it is stable, but a
  second language doubles the drift surface and the guard covers only
  the English file.

## Estimated shape

R1 is a mechanical afternoon with a test. R2 is the interesting hour and
needs a review pass. R3 is a conversation, not a task.

The headline for planning: **the README is not too long, it is
mis-addressed.** Fifty-seven per cent of it serves contributors, the
audience it names is routed nowhere, and three of its factual claims are
already false. The cuts are the smallest part of the fix.
