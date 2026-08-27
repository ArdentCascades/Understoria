# Phase 3 — Right-to-left support (code-verified plan)

Status: **R1 and R2 SHIPPED** (the logical-property sweep and its
guard; then the semantic cases); R3–R4 outstanding. This document began as the survey that had to
exist before the work started, in the same spirit as the router-8,
React-19 and eslint-10 plan docs: every number below was measured
against the tree at `d6d225e`, not estimated. It is now also the
running record of what shipped and what each step actually taught.

**Why now.** Eight languages ship with complete UI *and* complete
authored content (docs/i18n-expansion.md Phase 2; the registry in
`apps/web/src/i18n/languages.ts` is the count's source of truth). The only thing
standing between the app and Wave 3 — Arabic (`ar`) and Urdu (`ur`),
two of the ten most-spoken languages on earth — is that no surface has
ever been rendered right-to-left. The language registry refuses to
carry an `rtl` entry until this program lands, deliberately, so that
no translation ever ships into a broken layout.

## What the survey found

Two claims in `docs/i18n-expansion.md` are **stale** and are corrected
by this plan:

> "**No RTL support anywhere** (no `dir` handling, physical `ml-/mr-`
> Tailwind utilities throughout)."

Neither half still holds.

**1. `dir` handling already ships.** Phase 0 wired it and the note was
never updated. `src/i18n/index.ts:128` sets
`document.documentElement.dir = info.dir` on every language change,
driven by the registry's `dir` field. The plumbing is done; it has
simply never had an `rtl` value to carry.

**2. Physical utilities are a long tail, not "throughout."** A token
census over all 742 `.ts`/`.tsx` files finds **98 occurrences across
46 files** — a median of 1 per affected file and a maximum of 9.

| category | count | fix |
|---|---:|---|
| `text-left` / `text-right` | 45 | → `text-start` / `text-end` |
| `ml-` / `mr-` / `pl-` / `pr-` | 29 | → `ms-` / `me-` / `ps-` / `pe-` |
| `border-l` / `border-r` | 15 | → `border-s` / `border-e` |
| `left-` / `right-` (positional) | 9 | → `start-` / `end-` |
| **total** | **98** | across 46 files |

By directory: `components/` 50, `pages/` 46, `content/` 1, `lib/` 1.

**3. The stylesheet is already clean.** `index.css` is the only CSS
file in the app and contains **zero** physical directional properties.

**4. There is almost no directional JavaScript.** The usual RTL
landmines are simply absent: `scrollLeft`, `clientX`, `offsetLeft`,
`translateX`, `scrollBy` — **0 occurrences each**. Only two arrow-key
sites exist, and both need a dir-aware read rather than a rewrite:
`components/BottomNav.tsx` (roving tabindex) and `pages/Present.tsx`
(slide navigation).

**5. Tailwind already emits real logical properties — so this work
does NOT block on the held Tailwind 4 migration (#179).** This was
the single biggest sequencing question, and it is settled empirically
rather than from memory. Compiling against the installed
**tailwindcss 3.4.19**:

```
.ms-4       { margin-inline-start: 1rem }
.start-0    { inset-inline-start: 0px }
.border-s-4 { border-inline-start-width: 4px }
.text-start { text-align: start }
```

`ms-/me-/ps-/pe-/start-/end-/text-start/text-end/rounded-s/rounded-e/
border-s/border-e/float-start/float-end` all compile today. Tailwind 4
can land before or after this program without changing it.

## The parts that are not mechanical

Most of the 98 are find-and-replace. Three groups are not, and they
are where the actual design thinking lives.

### a. Sender mirroring in the conversation

`pages/Conversation.tsx` positions message affordances by *author*,
not by layout:

```tsx
isMine ? "-left-2" : "-right-2"     // reaction button on the bubble
isMine ? "right-0" : "left-0"       // message menu alignment
```

In an RTL layout "mine" moves to the other side, so this reads at
first like it needs the operands **swapped** rather than substituted.

> **Correction (R2, from the code).** It does not. The survey got this
> wrong, and the wrong version is the one that breaks. Both affordances
> are placed relative to the bubble, and the bubble's own alignment
> already mirrors: `isMine` bubbles carry `self-end` inside a
> `flex-col` container, and a column flex container's cross axis *is*
> the inline axis, so "end" is the right edge in English and the left
> edge in Arabic without anyone's help. The reaction button hangs off
> the bubble's INWARD side so it never overhangs the screen; for a
> bubble at the inline end, inward is `start`. Substituting in place —
> `isMine ? "-start-2" : "-end-2"` and `isMine ? "end-0" : "start-0"`
> — is therefore correct in both directions, and *swapping* is what
> would have pushed the button off the edge in Arabic. Shipped as the
> substitution, with the derivation written into the code beside it.

> **Constraint.** The scroll/anchoring machinery in
> `pages/Conversation.tsx` is off-limits and stays that way. This work
> touches `className` strings in that file and nothing else. The
> survey confirms the two are separable: every directional token in
> the file is a class name, and none of the scroll code reads a
> horizontal coordinate.

One centering idiom in the same file (`left-1/2` with
`-translate-x-1/2`, line 1370) is symmetric and correct as written —
leave it.

### b. Markdown table alignment

`components/Markdown.tsx` maps GFM's per-column alignment:

```ts
const ALIGN_CLASS = { left: "text-left", center: "text-center", right: "text-right" };
function alignClass(a) { return a ? ALIGN_CLASS[a] : "text-left"; }
```

The **default** (`null` → `text-left`) is a bug for RTL and becomes
`text-start`. The *explicit* cases are a real question: GFM's `:---`
is visual, so an author who wrote "right" arguably means the right
edge of the page in any direction.

**Settled in R2 as recommended:** explicit `left`/`right` stay
physical, only the default flips. An author who marked a column
`---:` was lining up numbers at an edge of the page, and that reading
holds in Arabic; an *unmarked* column carries no intent at all, so it
follows the reading direction like every other block of prose. One
line, and reversible if a community says otherwise.

R2 also found a latent bug the survey had only flagged as fragility:
the `<th>` carried a hardcoded left-aligning utility *alongside*
`alignClass()`, so two text-align classes of equal specificity landed
on one element and Tailwind's emission order decided. It happened to
render correctly. The base class is gone and a test now asserts each
header cell carries exactly one alignment.

### c. Paper surfaces

`PrintChrome`, `PrintBoard`, `PrintCalendar`, `PrintEventFlyer`,
`RecoveryKitCard`, the wallet cards and the storm-hub poster all
render to paper. Paper for an Arabic-speaking community should mirror
like anything else, so they are in scope — but they are verified by
print preview, not by the app smoke, and the existing
`lib/printChrome.guard.test.ts` shows the shape that guard should
take.

## Implementation order

**R1 — mechanical sweep + regression gate. ✅ SHIPPED.** 166 lines
across 74 files converted to logical utilities, plus
`lib/logicalProperties.guard.test.ts` — a source scanner that fails
when a physical directional utility reappears, with an allowlist
that requires a written reason per entry and fails on stale
exemptions.

Verified, rather than assumed:
- **LTR is unchanged by construction**, and the built bundle proves
  it: all ten logical properties are present, and a runtime `dir`
  flip shows every one mirroring (`ms-1` → margin-right, `pe-1` →
  padding-left, `border-e` → border-left, `start-0` → right, …).
- Six routes at 375px show no horizontal overflow in LTR *or* with
  `dir="rtl"` forced.
- Full suite green (3,826), tsc + eslint clean.

Two things the survey had classed as mechanical turned out to be R2,
found by the guard rather than by reading:
- **The landscape rail's safe-area padding** (`BottomNav`, `Board`,
  `Calendar`) pairs padding with `env(safe-area-inset-left/right)` —
  a *physical device notch*. Making the padding logical while the
  inset stays physical is wrong in RTL; the rail's side and the edge
  it clears have to flip together.
- **The me-menu drawer** pairs `right-0`/`border-l` with
  `translate-x-full` for its slide-in, and Tailwind has no logical
  translate. Flip one without the other and the panel slides in from
  offscreen.

**R2 — the semantic cases. ✅ SHIPPED.** Every allowlist entry R1
deferred is now either resolved or reasoned about in its final form:

- **Sender mirroring** — substitution, not a swap (see the correction
  in §a above).
- **The two pairs Tailwind can't express logically.** The landscape
  rail's notch padding and the me-menu drawer's slide both needed a
  *physical* value chosen by direction. Tailwind 3.4.19's `ltr:`/`rtl:`
  variants do exist (verified by compiling, same as the logical
  utilities above) and emit `:where([dir="rtl"], [dir="rtl"] *)` — zero
  added specificity. The rail and the two floating action pills use
  them directly: exactly one of the pair ever matches, so there is no
  cascade to reason about. The **drawer could not**: every transform
  utility compiles to the same `--tw-translate-x` declaration, so a
  dir-variant transform would have outranked the plain
  `motion-reduce:translate-x-0` override on source order alone and
  quietly given reduced-motion members the slide back. It sets a custom
  property instead (`ltr:[--slide-out:100%] rtl:[--slide-out:-100%]`
  with `translate-x-[var(--slide-out)]`), which is a different property
  and competes with nothing. That ordering hazard was found by reading
  the compiled CSS, not by reasoning about it.
- **`OverflowMenu`'s `align` prop** now speaks `start`/`end`. A
  physical vocabulary in front of logical classes would have undone
  them: `align="right"` placing a menu on the left in Arabic.
- **Dir-aware arrow keys**, via a new `lib/direction.ts`. This is the
  one place CSS cannot help — an arrow key means a physical direction,
  and in RTL the item to the member's right is the one *before* them
  (WAI-ARIA's rule for menubars). `BottomNav`'s roving tabindex and
  `Present`'s slides both go through it. Up/Down and Home/End
  deliberately do **not** mirror.
- **`dir="auto"`** on the two containers that carry member-authored
  text at length: the `Markdown` content root and the message bubble.
  So an Arabic note in an English community lays itself out
  right-to-left inside an otherwise left-to-right card.
- **Paper surfaces** needed no further change — R1's sweep already
  made them logical, and nothing in them pairs a physical value with a
  logical one. They remain to be *verified* by print preview in R3.

The guard grew a rule to match: a physical utility scoped to `ltr:` or
`rtl:` is exempt **by construction**, because it is already a
direction-aware decision — plus a new assertion that every `ltr:` has
an `rtl:` counterpart in the same file, since a lone half is worse
than the physical utility it replaced. Its allowlist went from 17
entries to 5.

Verified in a real browser rather than reasoned about — 33 checks over
the demo build, LTR and with `dir="rtl"` forced:

- The drawer anchors to the **right** edge in LTR with its border on
  the left, and to the **left** edge in RTL with its border on the
  right; `--slide-out` reads `100%` and `-100%` respectively, caught
  mid-transition.
- With `prefers-reduced-motion: reduce`, the drawer is at
  `matrix(1,0,0,1,0,0)` on the first frame in **both** directions —
  the custom-property route did keep the override working.
- `-start-2`, `-end-2`, `start-0`, `end-0` each land on the expected
  physical edge and swap when the direction flips.
- The landscape rail's notch padding reads `safe-area-inset-left` in
  LTR and `safe-area-inset-right` in RTL, and the floating pills on
  the board and the calendar mirror the same way. `env()` insets are
  zero in a headless browser, so these are read from which stylesheet
  rule actually matches the element rather than from the box.
- Six routes at 375px: zero horizontal overflow in either direction.

**R3 — mirrored-surface verification.** A pseudo-locale is the honest
way to test this before any Arabic string exists: add a dev-only
registry entry with `dir: "rtl"` (English text, mirrored layout) so
the whole app can be walked in RTL without waiting on translation.
Playwright pass at 375px over board, dashboard, conversation,
calendar, profile, settings, help and one print surface, asserting no
horizontal overflow and correct mirroring. Screenshots side by side
with LTR for review.

**R4 — Wave 3 translation.** Only now does `ar`/`ur` become a
translation problem, and it runs the ordinary playbook: glossary
first, then the UI fleet, then the content fleet. Arabic also brings
a plural system with **six** categories (`zero`/`one`/`two`/`few`/
`many`/`other`) — the parity gate's sanctioned plural-suffix
relaxation, added for Russian, already covers that case, and
`plurals.test.ts` derives required categories from `Intl.PluralRules`
rather than a hand-written list, so it needs no change.

## What this program does not include

- Bidirectional *text* handling inside member-authored content
  (mixed Arabic/Latin runs). The browser's UBA handles this; R2 added
  `dir="auto"` on the containers that hold member prose at length and
  stopped there. Short interpolated strings — a display name inside a
  translated sentence — are left to the UBA on purpose: wrapping each
  one would fight the surrounding sentence more often than it helped.
- Font work. Arabic and Urdu shaping is a system-font concern; the
  app ships no custom face for them and should not start.
- Any registry `rtl` entry before R3 verification passes. That gate
  stays exactly where the registry comment says it is.

## Estimated shape

R1 was a day of mechanical work with a gate; R2 the interesting
half-day, and it held to that. R3 is the real cost — building the
pseudo-locale and reading every mirrored surface honestly. R4 is two
ordinary translation runs at the playbook's known cost.

The headline for planning: **this is a much smaller program than the
docs implied.** 98 tokens, no CSS debt, no directional JavaScript, and
the tooling already in place.
