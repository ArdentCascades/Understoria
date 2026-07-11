# Body doubling — company invitations on claimed tasks

**Status: shipped.** The claimer-side doorway lives on the task page
(`TaskDetailBody`), the composition target is the ordinary post form
(`PostForm`, `?company=<taskId>`), and the strings live under
`bodyDoubling.*` and `projects.task.company.*`.

## What it is

Working alongside another person — even on completely unrelated work —
is one of the best-evidenced everyday strategies for getting started
and staying with a task, especially for people with ADHD. The practice
is commonly called *body doubling*. Mutual aid communities are unusually
well-placed to offer it: the people are already there, the trust
fabric is already built, and an hour of company is exactly the kind of
help a timebank already knows how to value (`emotional_support` has
been a first-class category from day one).

## The design decision: a post, not a record

The obvious design — a `companyWelcome` flag on `ProjectTask` — was
considered and rejected:

- **It would touch the wire.** `ProjectTask` federates as signed LWW
  `TaskState` records (docs/project-federation.md). A new field means
  touching the canonical signing payload, server validation, and every
  verifier — heavy machinery for a social nudge, and a signature-
  compatibility hazard.
- **It would be ambient rather than consensual.** A flag renders
  wherever the task renders, forever, until someone remembers to turn
  it off. An *invitation the member writes* is scoped, worded, and
  retired by its author.
- **We already have the right primitive.** A company request is a
  NEED: "keep me company while I work on X." Posts federate, appear
  on the board, carry the claim/message flows, respect block filters,
  expire, and can be cancelled — every lifecycle and safety property
  the feature needs, already built and already audited.

So the feature is a **doorway plus a prefill**:

1. On a task you've claimed, the task page shows a small block —
   *"Company makes starting easier"* — explaining body doubling in one
   sentence and linking to the post form with `?company=<taskId>`.
2. The post form seeds an ordinary NEED post: category
   `emotional_support`, hours from the task's estimate, a title and
   description that explain body doubling to whoever reads the board
   ("no skills needed — bring your own task or just keep me company"),
   and a link back to the task. A banner says plainly that the text is
   editable and nothing is public until posted.
3. The member edits (or doesn't) and posts. From there it is a post
   like any other: claimable, messageable, cancellable, expirable.

The prefill only fires for the task's own claimer — a shared link with
someone else's task id falls through to a blank form.

## Privacy posture

Nothing here changes any privacy boundary. The task page block renders
only to the claimer; the seeded text becomes public **only** when the
member taps post, exactly like any other post they might write by
hand. The private plan (`docs`: taskPlans, `db/taskPlans.ts`) remains
invisible to everyone, including whoever answers the invitation.

## Non-goals

- No "looking for company" badge on task rows or member profiles —
  ambient status invites ambient judgment.
- No matching, scheduling, or suggestion engine. Two people who both
  said yes can pick a time in Messages like adults.
- No reminder or follow-up machinery (`no-notifications`).
