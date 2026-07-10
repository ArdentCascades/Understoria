# Organizer's Guide

> **Audience:** the person (or small group) who will decide whether
> Understoria is the right tool for a specific community and, if so,
> how to introduce it without wrecking the existing trust and rhythm.
>
> This guide assumes you already know your community. It is not a
> recruitment manual.

---

## 1. Is this the right tool right now?

Understoria is built for groups where **mutual aid already happens**
and people are held back by coordination costs: a shared spreadsheet
nobody updates, a group chat where needs scroll away, a few burnt-out
people holding it all in their heads.

It is **not** a tool for:

- Recruiting people into mutual aid from scratch. Relationships come
  first; software follows.
- Tracking labor where credits should not be equal (a workplace,
  a contractor). The whole point is one-hour-equals-one-hour.
- Replacing face-to-face conversations. The app supports coordination;
  it doesn't substitute for meeting each other.
- Communities that don't want another app. Don't force it.

If your community is in any of those situations, put the guide away.

A good signal that Understoria might help:

> "People keep offering to help me and I keep forgetting who. I feel
> guilty. I wish there were just a list."

A bad signal:

> "If we had an app for this, people would participate more."

## 2. Before you propose it

Talk to three or four people you trust in the community. Show them
this guide and the [Member Guide](member-guide.md). Ask:

- Would this solve a problem we actually have?
- What would make people not want to use it?
- Who in our community would we be making life harder for if we
  rolled this out tomorrow?

If the answer to the last question has names in it — elder members
without smartphones, undocumented members who don't want to be on
any list, anyone currently in a surveillance-heavy situation — you
have work to do before the app shows up. Offline-first means
"offline-compatible." The people who can't use the app have to be as
welcome as the people who can.

## 3. Introducing it to the group

A 60-minute first meeting is plenty. Agenda that has worked:

- **(10 min)** Story about a time mutual aid worked well — without
  the app. What made it work? What was hard?
- **(10 min)** What the app does, from the member guide. Show
  screens on one person's phone, not a projected slide deck.
- **(15 min)** Tradeoffs. Who's burdened if we adopt this? Who's
  burdened if we don't?
- **(15 min)** Questions, objections, concerns.
- **(10 min)** Decision. Either pilot it for 4 weeks, or don't.

If there's no consensus to pilot, don't pilot.

## 4. Handling resistance

### "I don't want another app."

Valid. Most new tools don't deserve a slot on anyone's phone. Offer:
"We'll pilot it for 4 weeks, then as a group decide whether to keep,
adjust, or drop it. Your phone is still yours."

### "This feels transactional. I help people for free."

The time credits aren't a price. One hour equals one hour regardless
of the kind of work. You can ignore your balance entirely — the app
won't refuse to let you receive help. The credits exist so we can
see the pattern over time: who's giving, who's receiving, whether
aid is reaching everyone. That data belongs to us collectively, not
to a platform.

### "My employer will see this."

They won't — not from outside the community. But you should not run
Understoria on an employer-owned device or network. That's a general
rule; it applies to Signal, to personal email, to anything sensitive.
The [Opsec Guide](opsec-guide.md) spells it out.

### "Isn't this just timebanking? Those never work."

Traditional timebanks often fail because they're standalone
communities that never reach critical mass. Understoria is designed
to **layer onto an existing community** — a workplace, a neighborhood,
a congregation — that already has trust and reciprocity. The app
gives the existing relationships a place to show up.

### "What if someone games the credits?"

There are soft safeguards (daily limits, flags for unusual patterns)
but the real answer is the same as for every other mutual aid
structure: when something seems off, the community talks about it.
The app won't catch exploitation; the community will.

### "Who runs the server?"

Whoever the community trusts to. Everyone's data lives first on
their own device; the community node is a relay the community can
run itself (a $5 VPS or a Raspberry Pi — see the operator guide)
or borrow from a neighboring community. It stores only the signed
records members already chose to publish, and nobody is obligated
to federate with anyone.

## 5. The first month

Recommend:

- Decide on a **node operator** (someone to host and publish the
  app) before any members are invited.
- Write down **two moderation volunteers** who rotate out after a
  month. They're the first responders for flags and disputes.
- Agree on a **buddy system** for the first five members — each
  paired with an existing member for their first two weeks.
- Schedule a **check-in at week 2** and a **retrospective at week 4**.
- Don't try to enroll everyone at once. Five to ten founders is
  plenty. They set the tone.
- For the **first invite handoffs**, prefer in-person at a meeting,
  kitchen-table, or coffee shop. The app generates a QR code that
  the new member scans with their phone camera — no link to type,
  no Signal exchange. Glance around for cameras first; the share
  sheet's "Look around before you show this" prompt is exactly
  the pause that matters in workplaces, libraries, or anywhere a
  doorbell cam can see your screen.

## 6. The first conversations worth having

These are worth surfacing early, in person:

- **What counts as a category?** The defaults include emotional
  support, skilled labor, childcare, transport, food, housing,
  education, tech, and "other." Are any missing? Any you want
  de-emphasized?
- **What's our threshold for trust?** Members become "trusted" after
  two vouches. Should that threshold be higher for particular
  categories (e.g. childcare)?
- **What do we do with flagged exchanges?** The app flags short
  exchanges and repeat reciprocal pairs. You'll get a few false
  positives. Who looks at them? What's the response?
- **How do we include people without a smartphone?** Paper posts that
  a designated person enters into the app on their behalf is the
  most common approach. It requires a volunteer and a light touch.

## 7. When to walk it back

Retire the pilot — without shame — if:

- After four weeks, fewer than half of invited members have
  completed an exchange. Either the wrong people were invited or
  the tool isn't a fit.
- People start doing the mutual aid work and logging the app use
  separately, as busywork. That means the tool is adding friction,
  not removing it.
- The app is being treated as the organization, rather than a tool
  the organization uses. Governance, relationships, and mission
  live in the people; the software should be invisible most of the
  time.

## 7a. When to block, when to file a dispute, when to do both

A note for organizers about the member-blocking primitive.

**Block** is personal relief. Any member — including you, as an
organizer — can tap Block contact on another member's profile and
from that point on stop seeing their posts, projects, events,
vouches, task comments, and DMs in their view. The block is
private to the blocker. The other member is not told. No
moderator hears about it. No record federates anywhere. See
[`docs/blocking.md`](blocking.md) for the full design.

**Dispute** is community process. If the situation is something
the community needs to weigh in on — a Code of Conduct violation,
a pattern of behavior, a question of community-wide concern — the
right tool is a proposal in the dispute process per
[GOVERNANCE.md](../GOVERNANCE.md) §5. Disputes are deliberately
public to the community.

**Use both, in parallel, when both apply.** Block to stop the
unwanted contact right now; file a dispute so the community has
the chance to deliberate. The two are independent — block takes
effect immediately, the dispute follows community process at its
own pace, neither depends on the other.

### Your block does not carry organizer authority

An important thing to be clear with yourself about: **your block,
as an organizer, is purely personal.** It is the same primitive
every member has. It does not carry community authority. It does
not constitute a moderation decision. It does not signal anything
to other members. If you block a member as an organizer, you are
just choosing not to see them in your own view; you are not
making a community judgment about them, and the community should
not interpret your block as one.

This is the same posture as `community-authority` everywhere else
in the project: there is no admin role; organizers are members
who hold a community-defined role through a community-defined
process, and any decision that affects the community goes through
community process (proposals, disputes, lazy consensus per
`GOVERNANCE.md` §2 — not through unilateral organizer action).
Block is not an exception.

If a member is doing something that you think the community
needs to address, the path is the same as for any member: file a
proposal, raise it in a community meeting, bring it to a buddy
or to the moderation committee. Your block is not a substitute
for any of that, and the community should not be expected to
treat it as one.

### If you are on the receiving end of mass conscientious objection

It is possible — particularly if you hold a community role for a
while — that members will privately come to feel they would
rather not interact with you, and will use the block primitive
to put that into practice. Because blocks are local and never
federate, neither you nor anyone else will see this happen as a
system signal. You may, however, hear about it from the operator
if members have voluntarily disclosed their blocks to the
operator in numbers that suggest a wider pattern.

If this happens, the operator response is named in the §8
incident template in
[`docs/incident-templates.md`](incident-templates.md). The
template explicitly routes this to the community-process surfaces
named in [GOVERNANCE.md](../GOVERNANCE.md) §3 (rotation) and §5
(appeals and the community-process for the substantive concern).
The operator will not depeer anyone, will not suspend or remove
you unilaterally, will not publish a count or a list of who has
blocked whom, and will not name you in any announcement. The
announcement is about the community process for the role, not
about social judgment on the person.

If you are reading this section because that announcement has
gone out: you have appeal rights through `GOVERNANCE.md` §5, you
are welcome to talk with the operator directly, and you may
choose — entirely separately from any community decision — to
step back from the role of your own initiative. Stepping back is
not a concession of fault; it can simply be a recognition that
the community would benefit from a fresh holder. That choice is
yours alone.

## 7b. Organizing community events

Events — skillshares, potlucks, work days, meetings, care circles —
are the lightest organizing affordance in the app. They sit
alongside posts and projects, with the same public-wire posture but
a tighter coordination shape: a single signed record commits you,
as the organizer, to a time and a location string visible on every
peer node.

A few things to be deliberate about when you create one:

- **Templates are a starting point, not a script.** The create
  form opens with a small gallery of camaraderie templates
  (potluck, skillshare, and friends) that pre-fill the form;
  everything stays editable and "start from scratch" is always
  available. The form autosaves a draft, flags problems inline
  (a start in the past, an end before the start), and
  deliberately does *not* pre-fill a start time — a signed,
  permanent record deserves a consciously chosen time, not a
  default that slipped through.

- **Read the comparison card.** Before you sign, the create-event
  surface enumerates what your signature publishes — your
  identity as organizer, the time and location as you typed
  them, and the fact that the record is permanent (cancellable,
  not editable, not deletable). The card also names what an
  event does NOT mean: there is no "members-only" event
  primitive in phase 1; if it shouldn't be on a public wire,
  coordinate via DM or an Offer post instead.

- **Location is free text, not a GPS pin.** You decide how
  specific to be. "Community room, 3rd floor" is the intended
  granularity for routine events. For higher-risk gatherings,
  "address sent on confirmation" is a legitimate choice — the
  field exists so the organizer can decide what level of
  specificity is right for the situation. A pattern of
  repeated events at the same venue does leak that venue, even
  with free-text — `community-events.md` §12 names this honestly
  and recommends rotating venue strings or using a generic
  locator for high-risk events.

- **Capacity is a planning aid for you.** If you set a cap and
  your community's "going" count reaches it, you'll see an
  attention item — supplies, space, whatever the cap is for.
  The cap is never enforced: the node won't bounce anyone for
  being one-too-many, and members of peer communities don't see
  a "sold out" signal — their copy of the event shows them the
  ordinary RSVP control and *their own* community's count, not
  yours.

- **RSVPs stay with each community.** A member of a peer
  community RSVPs to your event from their own app, through
  their own community's node — they never open yours. Each RSVP
  is a signed record that syncs only within the community whose
  member signed it, so the roster and count you see are your
  community's; theirs stay on their node, and no
  cross-community attendance list exists anywhere.

- **If something changes, cancel and re-create.** Phase 1 has no
  edit affordance — an edit would silently move the people who
  already said yes. The cancellation is a signed record, the
  optional reason text reaches the RSVP'd members' attention
  rails, and the re-created event is its own consent moment.

### Shifts — structuring the day

Once an event exists, you can break it into **shifts** on the
event page: a label ("Setup crew", "Driver"), a time window, and
an optional spot count. Members sign themselves up; signing up
also RSVPs them "Going," so your attendee list and the day-of
attention item stay coherent without extra bookkeeping. Shifts,
like RSVPs, live only on your node — a peer community sees a plain
event, and if you want cross-node readers to know the day has
structure, say so in the description (that free text is the one
channel you control, decided in front of the signing card).

Things to be deliberate about:

- **Spots are invitations, not scoreboards.** The app renders
  "2 spots open," never "only 2 of 4 filled." Match that register
  when you talk about it in the group — an unfilled shift is an
  open door, not a failure. Two people is still a work party.
- **You can't edit or delete a shift people have joined.** Times
  and labels are fixed at creation (an edit would silently move
  the people who said yes — same reasoning as events), and a
  shift with signups can't be deleted. If the plan changes, talk
  to the people on it (they can move themselves in one tap), or
  cancel and re-create the event, which notifies everyone who
  RSVP'd. Capacity can always be raised; it can never drop below
  the people already signed up.
- **Members place themselves.** There is no "add member to
  shift" — putting someone else's name on a slot is their tap to
  make, on their device. If someone asks you aloud, hand the
  moment back to them: "sign up on the event page so it's your
  choice on your device."
- **A signup is intent, not attendance.** There is no check-in
  and no reconciliation of who signed up versus who came or who
  recorded hours — permanently. After a work-day shift passes,
  the app offers the people on it (and you) a quiet link back to
  the project, where hours flow through the same task
  confirmation you already use, with the helper stating their own
  actual time. Nothing about that exchange references the event
  or the shift on the wire, and the app never compares the roster
  to the credit.

The full design and the values reasoning live in
[`community-events.md`](community-events.md) and
[`shift-signups.md`](shift-signups.md); the threat-model
entry covering the wire surface is in `threat-model.md` §7
("Federated `Event` records widen the public wire surface").

## 7c. Running a project as the organiser

Projects are where the app does its biggest organising work, so a
few affordances are aimed specifically at you (and at co-organisers
once they've accepted).

- **The "Mine" filter applies to you too.** Above the task list,
  alongside the All / Open / In progress / Done pills, a
  **Mine** filter narrows the list to tasks you've personally
  claimed — useful when a project has dozens of tasks and you
  want to see what's on your own plate without leaving the
  organiser view.
- **Reordering: the "Reorder tasks" dialog.** All reordering
  lives in one place — pick **Reorder tasks** from the **⋮ menu**
  in the project header and a focused dialog lays out the full
  task list as title-only rows. Inside it, drag works on a
  pointer device (keyboard drag too), and every row also carries
  discrete **Move up / Move down** buttons for keyboard and
  screen-reader parity. The
  order is the project's reading order — the way you want
  contributors to encounter the work — not a priority queue
  that suppresses anyone's claim. See
  [`task-ordering-and-dependencies.md`](./task-ordering-and-dependencies.md)
  for the full design.
- **Setting dependencies (Follows:).** Inside the task editor
  you can name what each task *follows* (its upstream tasks).
  This is a *soft* block: a member can still claim a "follows"
  task before the upstream is done, but the system won't nudge
  them about it and the public "needs more hands" chip stays
  suppressed until the upstream lands. Dependencies are a
  framing tool, not a gate.
- **The confirm-task dialog names the debit.** When you tap
  **Confirm** on a completed task, a small dialog spells out
  the side effect — *"Confirming credits Sasha with 3 hours;
  the same amount comes from your balance"* — so the cost to
  you, as the confirmer, is never surprising. This is the same
  shape as the post-confirmation dialog members already see.
- **The activity feed is honest about releases.** When a member
  releases a task they'd claimed (including a task that was in
  *awaiting confirmation*), the activity entry says so plainly
  — no synthetic completion, no quiet retraction. The
  release-of-awaiting-confirmation case in particular shows up
  as its own entry so the audit trail tracks the real shape of
  what happened.
- **`pausedAt` is honest.** When you pause a project the
  timestamp records *when you paused*, not the project's
  creation time. Reading the project page later, the paused
  banner reflects the actual pause moment.
- **Co-organiser capabilities, at a glance.** Co-organisers see
  a small capability card on the project page enumerating what
  the role covers (launch, pause, resume, complete, add / edit
  tasks, set dependencies, reorder, confirm completions, post
  announcements, step down). As the primary organiser you don't
  see the card yourself — it's addressed to the people holding
  the role. When you invite someone, the
  acceptance pointer in the invitation card directs them to
  the same enumeration so the role is consented-to rather than
  assumed. The full list is in
  [`co-organizer-invitations.md`](./co-organizer-invitations.md)
  §4.
- **Where the controls live.** The project page leads with the
  work — summary, updates, work days, task list — and tucks the
  organiser machinery where it doesn't crowd contributors out.
  Everything sits in the **⋮ menu** in the project header: the
  one-tap lifecycle verbs (Reorder tasks, Mark complete,
  Resume, Archive) plus **Copy link**, and alongside them
  **Pause** (with its note), **Clone**, co-organiser management,
  handoff, and step-down — each of those opening a focused
  dialog. **"+ Add task"** and the announcements' **"Write an
  update"** are small disclosures that expand into the forms.
  Nothing was removed — it's the same set of controls, arranged
  so a phone-sized screen reaches the task list first.
- **Confirmation credits the time actually given.** When a
  claimer marks a task complete they state how long it actually
  took, and that — not your estimate — is what the confirm
  dialog names and the signed exchange records. A task estimated
  at 2 hours that took 6 credits 6.
- **Recurring work: "Add a fresh copy."** On a completed task's
  own page, the **⋮ menu** offers a one-tap fresh copy — same
  title, description, hours, and skills, staged open at the
  bottom of the list — so
  next cycle's version of the same job doesn't mean retyping it.
- **Cloning re-invites your crew, it never copies it.** The
  clone form shows a pre-checked list of the source project's
  co-organisers; submitting sends each of them a fresh
  *invitation* to the new project. A clone is a new trust
  context — new debits to sign — so consent is re-performed,
  never inherited.
- **Work days connect events to the project.** A **"Schedule a
  work day"** button on the project page creates a community
  event pre-linked to the project; the project page lists its
  upcoming work days (and the desktop rail shows the next one at
  a glance), and the calendar's project filter narrows to them.
  The link is local to your node only — on the wire, and to
  every peer, a work day is indistinguishable from any other
  event, and the location field is never pre-filled for you;
  how specific to be stays your call (see §7b).
- **"Projects you organize" (the My work tab, `/my-work`).** If
  you steward several projects, the **My work** tab's projects
  section gathers them with what's quietly waiting on you — tasks
  awaiting your confirmation, open slots, invitations you've
  issued. (The old `/my-projects` address redirects there.) It's
  read-only on purpose: confirming and every other organiser
  action stays on the project page.
- **Completion gets a communal moment.** When a project reaches
  Completed, viewers see a one-time aggregate closure card (and
  a permanent quiet line in the completed banner). No individual
  tallies — the unit is the community.
- **If you go quiet, the community can keep the project alive.**
  After a long quiet stretch another member can self-nominate to
  adopt the project via a community proposal
  ([`project-adoption.md`](./project-adoption.md)). If you're
  back before it resolves, a one-tap **"I'm still here"**
  withdraws it — no explanation owed. The copy never frames the
  quiet organiser as negligent; capacity changes.
- **Descriptions, announcements, and comments take formatting.**
  A safe Markdown subset (`**bold**`, `_italic_`, lists, links,
  headings, tables) renders in project descriptions, task
  descriptions, task comments, and updates — useful for supply
  lists and sign-up links. Plain text is always fine; the hint
  under each editor shows the basics.
- **Recurring tasks re-open themselves.** A task marked with a
  cadence ("Recurs monthly" — set from a template's tagged tasks
  or the add-task form's "Recurs" field) mints a fresh open copy
  at the bottom of the list the moment a round is confirmed: the
  rota slot re-opens, credit for the finished round stays with
  whoever did it. The rhythm stops with the project — pausing or
  completing it stops the re-opening, and resuming doesn't
  backfill missed rounds. If you add next round by hand early,
  the app notices and won't double it up.

## 8. Bringing in the other workstreams

Things the app doesn't do (yet) that your organizing might need:

- **Campaign tracking, power maps, card counts** — planned for the
  Organizing Integration module (Agent 7). Out-of-scope for the
  current build.
- **Political education study groups** — we provide a starting
  reading list at [political-education/](political-education/). The
  app doesn't host the study group; your community does.
- **Legal structure** (cooperative, mutual benefit corp, unincorporated
  association) — [GOVERNANCE.md](../GOVERNANCE.md) outlines options
  but the decision is yours.

---

*Feedback from organizing-context pilots is genuinely valuable. If
something in this guide didn't match your experience, file an issue
or send a message so we can fix it.*
