# Member Guide

> **Audience:** anyone in a community that has decided to use Understoria.
> You do not need to know anything about apps, cryptography, or
> timebanking. If any of this is unclear, tell a member you trust —
> the guide is supposed to work for you.

Understoria is a way for our community to ask for help, offer help, and
keep track of what we do for each other. One hour of help equals one
hour of help — no matter what kind of work it is.

This guide walks through the main things you'll do.

---

## 1. First time you open the app

The first time you open Understoria on a device, you'll see a short
**welcome** — five screens that explain what the app is and isn't:

1. **"This is a timebank."** One hour of help equals one hour of help.
2. **"You start with credit."** New members begin with 5 hours of
   seed balance.
3. **"Your identity is a key, not an account."** No email, no password.
4. **"The community is the authority."** Decisions are made together,
   not by admins.
5. **"Some help takes more than one person."** Projects are collective
   efforts — shared goals with their own task lists. Starter
   templates exist for common projects, and if a template you'd pick
   is already running in your community, the app surfaces it before
   you start a new one.

Each concept screen carries a small illustration in the app's
forest-growth style, and near the end the tour offers an optional
**"Add it to your home screen"** step — installing the app so it
lives beside your other apps instead of getting lost in a browser
tab. It's genuinely optional (Next moves on, Skip finishes the
tour), and it doesn't appear at all if the app is already
installed. You can also install later — see §1a.

You can tap **Skip** at any point if someone has already
explained the basics in person. The welcome only shows once per
device — if you want to read it again later, **Profile → Learn →
Revisit the welcome** will bring it back.

## 1a. Putting the app on your home screen

Understoria works in an ordinary browser tab, but it's easier to
come back to as an icon on your home screen. Two places offer to
help:

- A small **install card** may appear on the Board after you've
  settled in. On most Android phones and desktop browsers it's a
  one-tap button; on an iPhone it walks you through Safari's
  **Share → Add to Home Screen** steps. Dismissing the card is
  fine — it won't nag.
- **Profile → Learn** has the same guide any time, organized by
  device (iPhone / Android / computer) rather than by browser.

Installing changes nothing about your data or identity — it's the
same app, just easier to find.

### Two banners you might see at the top of the screen

- **"You're offline."** When the device loses connectivity, a
  small banner appears at the top so you know federation pulls
  and pushes are paused. Everything still works locally —
  posting, claiming, confirming all queue up. The banner also
  shows a small count of queued changes ("3 changes waiting to
  sync") so the outbox is never opaque. When you're back online
  the queue drains and the banner disappears.
- **"A new version is available."** When the operator deploys a
  new build, the app surfaces a one-line prompt so you can
  reload at a moment that's convenient for you instead of
  silently swapping under your feet. Tap **Reload** to pick up
  the new build, or dismiss the prompt and reload on your own
  later.

## 2. Getting in

Someone in the community sends you an **invite link**. It looks like
`https://our-community.example/invite#...` and is good for 14 days.

1. Open the link on your phone.
2. The app shows you the inviter's name and a short key fingerprint
   (a string like `xPfj…3kQ7`). The same screen also tells you when
   the invite expires (e.g. *"Expires in 6 days"*) so you know
   whether to redeem now or come back later. Ask the person who sent
   you the link whether that fingerprint matches what they see on
   their end — in person, over Signal, or over a phone call. A
   mismatch means something went wrong; don't accept the invite.
3. If the fingerprint matches, choose a **display name** (a nickname is
   fine, many people use them) and tap **Accept invite and join**.

That's it. You're a member. The app stores your identity locally on
this device. There is no username or password.

## 3. Your starting credits

Every new member starts with **5 hours** of time credits. This means
you can ask for help before you've given any. That's on purpose:
nobody should have to earn permission to need something.

Your balance shows on your **Profile** page. It can go below zero —
the app does not stop you from asking when you're low. The community
decides how far the collective should stretch, not the software.

## 4. The board

Tap **Board** at the bottom of the screen. You'll see three tabs:

- **Projects** — bigger collective efforts that take more than one
  person and more than one task. This is the tab you land on by
  default. The thinking: if you arrived needing help, there's a
  good chance a community project is already addressing it, and
  joining an ongoing effort is often more useful than posting a
  one-off Need. See §9.
- **Needs** — things people are asking for.
- **Offers** — things people are offering.

Each post card shows what the post is, who posted it, about how many
hours it'll take, and how urgent it is. Tap any card to see the full
details.

### Filters

On the **Needs** and **Offers** tabs, use the dropdowns at the top of
the board to narrow down by **category** (food, transport, childcare,
emotional support, and so on) or **urgency**. The search box searches
titles and descriptions.

The **Projects** tab has its own filter row above the project list:

- **Category** — same idea as for posts.
- **Status** — narrow to *Planning*, *Active*, *Paused*, or
  *Completed*. (Archived projects aren't here; they live on their own
  page behind the **View archive** link.)
- **Only with open tasks** — a toggle that hides projects where every
  task is already claimed or done. Useful when you're looking for
  something to pitch in on right now.
- **Could use more hands** — a toggle that narrows to projects with
  a task that's been waiting on extra help for a while. It points at
  the work, never at a person.

All three filters compose with the search box. Nothing is filtered by
default — you see every non-archived project until you start
narrowing. Filter selections don't persist between sessions.

### The calendar

There's a **Calendar** tab in the bottom row. It's a single place to
see what's happening in the community over time, instead of checking
each project and post one by one.

You don't have to maintain it. The calendar is built from things that
are already happening — it doesn't ask you to schedule anything new.
It shows three kinds of things:

- **Project deadlines** — the days projects are aiming to finish by.
- **Posts about to expire** — needs and offers nearing the end of
  their window, so they don't quietly lapse.
- **A quiet sense of activity** — a soft marker showing roughly how
  many exchanges happened each day. It never shows names or hours,
  and there's no ranking. It's the community's rhythm, not a
  scoreboard — the same reason the app has no leaderboards. A busy
  week means something good is happening, not that anyone is "ahead."

You can switch between three views:

- **Agenda** — a simple chronological list, grouped by day. The
  easiest to read on a phone. By default it shows today and the
  days ahead; a small **Show past** toggle lets you scroll back
  through older items when you actually want them.
- **Month** — the familiar grid, good for seeing a whole month at a
  glance. The current day gets a soft canopy highlight so you can
  find "now" without scanning the row. Prev / next arrows page
  through the months (up to a year each way), and a quiet **Today**
  button jumps you back whenever you've wandered.
- **Week** — a tighter seven-day view, handy if you're tracking a few
  deadlines in a busy stretch. It pages the same way the month view
  does.

Filters at the top let you narrow by **category**, by a single
**project**, or to **"Mine"** — just the projects, posts, events,
and exchanges you're part of (for events, "Mine" means ones you
organize or have RSVP'd going/maybe to). A small "Filters · N
active" summary shows when anything is narrowing the list, and your
view choice and filters are remembered on this device between
visits — the calendar always reopens on today, though. If a week is
empty, that's fine; it means the community is having a quiet
stretch, not that anyone's behind.

A few quiet touches worth knowing about:

- Things **you're part of** — an event you're going to, a deadline
  for a project you organize, your own expiring post — get a soft
  accent so your own commitments stand out from the community-wide
  picture. It's computed only from your own local data; nobody
  else's plans are marked.
- Events you've RSVP'd **"going"** to carry a small personal
  marker. Only you see it — RSVPs never show as counts or lists on
  the calendar.
- An event that **spans several days** (a weekend build, a
  multi-day drive) shows on every day it's happening, not just the
  first.
- An expiring **need** is marked with a small 🤲 glyph — open,
  asking hands — and framed as an invitation to help before the
  window closes, while an expiring offer gets a calm 🌱. A need
  about to lapse is the most useful thing the calendar can show
  you.

## 5. Posting a need

Near the bottom of the board, tap **Post a need**.

Fill in:

- **Title** — a short line, like "Ride to clinic Thursday afternoon."
- **Description** — details that will help someone decide whether they
  can help. Timing, accessibility, what to bring, anything you want
  the other person to know.
- **Category** — pick the closest fit. "Other" is fine if nothing
  matches.
- **Estimated hours** — your best guess. It doesn't have to be exact.
- **Urgency** — "When you can" is fine for most things. "Soon" and
  "Urgent" let the community know when timing matters.
- **Expires in (days)** — optional. Leave blank if there's no deadline.

Tap **Post to the board**. Your need is live.

### Formatting what you write

Longer text fields — post, event, and project descriptions, task
descriptions, and task comments — understand a small set of
formatting marks. A one-line hint under each of these editors shows
the basics: `**bold**`, `_italic_`, `-` at the start of a line for
a list, and web links, plus a bit more if you know Markdown
(headings, quotes, tables, `~~struck text~~`). You never have to
use any of it — plain text is always fine. Links you (or anyone
else) include open in a new tab, and nothing anyone types can ever
run as code or load a remote image; the worst a strange link can be
is a link, and you can see where it points before you tap.

## 6. Posting an offer

Same flow, but tap **Post an offer** instead. Use this when you have
something you can share — an afternoon to help with childcare, extra
soup you cooked, a skill you're willing to teach.

Don't over-promise. If your week fills up, you can cancel an offer
from the post detail page.

## 7. Claiming a post

When you see a need you can help with, tap the post to open it, then
tap **Offer to help**. A confirmation asks you to be sure.

When you see an offer you want to receive, tap **Claim this offer**.

Once you've claimed, you're **matched**. Now it's time to actually do
the thing. Figure out how you'll coordinate — many people use the
messaging app they already share with the other person (Signal is a
good choice).

## 8. Confirming an exchange

After the help has actually happened, both of you confirm it:

1. Open the post.
2. Tap **Confirm it's complete**.
3. The other person does the same.

Once both of you have confirmed, the hours move between your balances
and the exchange is recorded.

Before you tap confirm, the app shows a small dialog that **names the
debit out loud** — "Confirming credits Alex with 2 hours; the same
amount comes from your balance" — so the side effect on your balance
is never surprising. The confirm dialog is the same shape for project
tasks (§9) as it is for board posts.

If something went wrong — you didn't receive what was promised, or the
other person didn't show — tap **Something's wrong — flag it**
instead. That surfaces the exchange on the Disputes page, where the
whole community can see it and respond — there are no admins. You can
also request a mediated conversation under the
[Code of Conduct](../CODE_OF_CONDUCT.md) process.

If an exchange you're in has been marked disputed (by you or by the
other person), the post detail page shows a small **"This exchange is
in dispute"** pointer linking to the Disputes surface so you can see
where the conversation is happening and what the community process
looks like next. The exchange's state — claimed, awaiting confirm,
confirmed, disputed — is also narrated in plain language at the top
of the post so you don't have to infer it from buttons.

### When the other person doesn't respond

If you've marked an exchange complete and the other person hasn't
confirmed within the community's auto-confirm window (default 7
days, set per community), the exchange auto-confirms on your
behalf so credit can flow. The record is audit-tagged so anyone
verifying it can see it was a system confirm rather than a mutual
one. The same auto-confirm sweep covers project tasks, not just
board posts.

## 9. Projects

A **project** is a collective effort with multiple tasks and (usually)
multiple contributors — building raised beds for a community garden,
running a winter coat drive, fixing up a member's porch. They live on
the third tab of the Board.

Open a project to see:

- **Target hours** and **contributed hours**, with a progress bar.
- A **momentum chip** beside the status — "Humming," "Active,"
  "Quiet," or one of the terminal states. It summarises the
  project's pace, not any single person's contribution.
- A **sparkline** under the progress bar showing the last 14 days of
  contributions. Useful for seeing whether the project is gathering
  steam or losing it.
- A list of **tasks** — each one with an estimated number of hours,
  an urgency, and who (if anyone) is currently working on it.
- A **"Working alongside"** card — a simple alphabetical list of
  the people currently carrying or completing the project's tasks,
  so the project feels like shared work and you can see who you'd
  be joining. Names only; no hours, no ranking.
- **Upcoming work days** — if the organizer has scheduled work-day
  events for the project (see §9a), the next ones are listed right
  on the project page.

### Every task has its own page

Tap **"Open task"** on any task card (the link also shows the
comment count) to open the task's own page. That's where the full
description, all the actions, and the **comment thread** live — the
place to ask a clarifying question, coordinate timing, or leave a
note for whoever picks the task up next. The task card back on the
project list stays slim on purpose: a one-line preview and the
Claim button, so a busy discussion never buries the rest of the
project. A "← Back to {project}" link at the top of the task page
takes you back to the list.

### Joining a project

Open the project, find a task with "Open" status, and tap **Claim
this task**. Coordinate with the organizer the same way you would
for a board post. When the task is done, you mark it complete — the
app asks **how long it actually took**, and that's what you're
credited for, not the organizer's estimate (a 2-hour guess that
took 6 hours credits 6). The organizer confirms; the hours move
into your balance just like any other exchange.

A task list can be **filtered**, **searched**, and (when there's
enough) reorganised by the organiser. Once a project has enough
tasks that scanning gets hard (the controls stay out of the way on
small projects), above the task list you'll find:

- A search box that narrows by title / description.
- Pills for **All / Open / In progress / Done** so you can hide
  the noise while you scan.
- A **"Mine"** filter that narrows the list to tasks you're
  carrying — the same affordance organisers use to find their
  own claims quickly.

If you're helping on several projects at once, **Tasks you're
carrying** (linked from your Profile and from the bottom of the
Projects tab) gathers every claim of yours in one place, grouped
by project.

### Task dependencies — "Follows:" framing

Some tasks structurally depend on others (you can't paint until
the wall is patched). When a task you've claimed *follows* an
upstream task that isn't finished yet, two things happen:

- A small **"Follows: <upstream task title>"** badge appears on
  the row so you can see what it's waiting on.
- The app **won't nudge you** while the upstream is still open
  — the attention rail and the project's public chip both stay
  quiet. You'll see a small line on your task ("You'll be
  reminded when it's ready") explaining the calm.

You can still claim a dependent task before the upstream is done
— claiming a "follows" task is not blocked. The system just
doesn't pretend the work is ready to start. The framing is
deliberately *soft block*, not enforcement: the dependency tells
the system when to *not bother you*, not when to *forbid you*.

### Stepping back from a task you've claimed

Plans change. If you claimed a task and can't get to it, you can
release it — the row gets a **Release this task** affordance with
copy that says *"step back, no judgment."* The task returns to
Open, the organizer sees an activity entry, and the community
keeps moving. There's no penalty surface, no flag, no public
record of who stepped back. Solidarity-not-shame applies inside
the project surface as much as it does on the board.

### Reordering — the organiser's tool, your context

Organisers can drag tasks to change their order, or use the
**Reorder** modal (handy for accessibility and for big task
lists). The order isn't a priority queue you're obliged to
follow; it's the project's reading order so a contributor
arriving fresh sees the work the way the organiser thinks about
it. The order you see on the page is what the organiser most
recently set.

If you finish three confirmed project tasks, the **Crew Member**
role shows up on your profile. If you organize a project that draws contributors,
that's **Groundbreaker**; halfway to the target is **Momentum
Maker**; finished is **Keystone**.

### When a project finishes

When a project you can see reaches Completed, the page shows a
one-time closure card — a quiet communal sentence about what the
community built together. It appears for any viewer, not just
contributors, because the unit of measurement is *us*, not *me*.
A low-key line stays in the completed banner afterward.

### When an organizer goes quiet

Life happens — organizers get sick, move, burn out. If a project's
primary organizer has been quiet for a long stretch, another member
can offer to **adopt** the project: they put themselves forward
(nobody can be volunteered by someone else), and the offer becomes
a community proposal that everyone can weigh in on, like any other
decision. If the community agrees, stewardship transfers; if the
original organizer comes back before then, a simple "I'm still
here" withdraws the whole thing, no questions asked. The framing is
always about keeping the *project* alive — never about judging the
person who stepped away.

### Starting a project

Tap **Start a project** from the Projects tab. The page opens with a
gallery of **starter templates** — community fridges, coat drives,
porch repairs, and so on. Each template pre-fills the project form and
stages a set of tasks so you don't start from a blank page. Templates
are friendly defaults, not prescriptions; everything is editable
before the project is created. If nothing fits, pick **Start from
scratch** at the end of the gallery.

A small filter row sits above the gallery to help you find a fit:

- **Search** matches template name, purpose, who it serves, and what
  you'll need.
- **Category** narrows to one focus area (only categories that
  templates currently use appear in the dropdown).
- **Setup time** narrows by how much total work the template's tasks
  add up to: *Quick* (≤10h), *Medium* (10–25h), or *Bigger* (25h+).

**Start from scratch** stays visible at the end of the gallery no
matter how you filter, so you can always bail out to a blank form.

If a template you're looking at is already running as a Planning- or
Active-status project in your community, a small green **"N already
in your community"** ribbon sits on top of that template's card, and
picking the template surfaces a **See them** button in the
selected-template banner. Both link to the most recent matching
project. Nothing blocks you from starting a new project with the same
template — the surface is purely informational, in case joining the
existing effort is a better fit than starting fresh.

After picking (or starting blank), fill in title, description, target
hours, area, and an optional deadline. Once the project is created,
you can add tasks and switch it from "Planning" to "Active" so others
can claim tasks.

### Co-organizers

Bigger projects often need more than one person coordinating. A
**co-organizer** can confirm task completions and signs their name
alongside the project's coordination. Nobody can be made a
co-organizer without saying yes — being asked is an invitation you
choose to accept, not a job you can be signed up for. This is a
deliberate change: a role that touches your balance and your name is
yours to agree to.

**If you organize a project** and want help running it, open the
project page and use **Invite a co-organizer** — pick a member and
tap **Send**. They'll see your invitation the next time their app
syncs. Pending invitations show on the project page, and you can
**Revoke** any of them right up until the moment the person accepts.

**If someone invites you**, an item appears on your home screen
saying who invited you and to which project. Before you decide, the
app spells out what accepting means:

- You'll be able to **confirm task completions** — and each time you
  confirm one, the hours come out of *your* balance, just like any
  other exchange.
- You're **signing your name** to the project's coordination, visible
  to the community on the project page.

Tap **Accept** to take on the role, or **Decline** if it's not for
you. Declining is completely fine and it's final — but you can be
invited again later if things change.

If you're already a co-organizer and need to step back, you can
**leave the role yourself** from the project — you don't have to wait
for the primary organizer to remove you.

## 9a. Community events

A **community event** is a thing happening at a specific time and
place — a skillshare, a potluck, a work day, a meeting, a care
circle. Events live on the calendar (see §4) alongside project
deadlines and post expiries; their markers are colored by category.

### Seeing what's coming up

Open **Calendar** from the bottom nav. Events show up as colored
chips on the day they're happening. An **Events only** filter at the
top hides project deadlines and post expiries when you just want to
see "what could I show up to?" If an event you've RSVP'd to is
today, it appears on your attention rail when you open the app —
pulled, never pushed. No browser notifications, no buzzing.

### RSVP'ing

Open an event to see the details. The **RSVP** control expands a
small card explaining what your RSVP means before you commit:

- If you RSVP **Going** or **Maybe**, the organizer sees your name
  on the attendee list, and other members on this node who also
  RSVP'd see your name. Everyone else on this node sees only the
  count, not names. Members on peer nodes see neither names nor
  counts.
- If you RSVP **Not going** (or change to it later), you're
  removed from the visible roster — no delta is shown to anyone.
- Either way you'll get a heads-up on your attention rail if the
  organizer cancels.

Your RSVP **stays on this node**. It is not a signed record, it
does not federate to peer nodes, and even on this device the
organizer cannot see RSVPs you made from a different node. If you
opened the PWA on another community's node, you'd have to RSVP
there separately.

### Shifts — signing up for a slice of the day

Some events are broken into **shifts**: "Setup crew 9–12, 4
spots," "Driver at 8:30, 1 spot." Shifts show what the day needs
so you can give the two hours you have instead of guessing whether
a whole day is expected of you.

- **Signing up for a shift also RSVPs you "Going"** to the event —
  one tap does both, and the card tells you so before you commit.
- **Who sees your name:** the organizer, and members who RSVP'd
  going or maybe, see the roster of each shift. Everyone else in
  your community sees spot counts only ("2 spots open"), and other
  communities see nothing at all — shifts, like RSVPs, never leave
  this node.
- **Removing yourself is one tap, any time.** Your name comes off
  the roster immediately, nobody is notified, and your "Going"
  RSVP stays (you might still come by). Plans change; the app
  doesn't keep score. If you change your event RSVP to **Not
  going**, your shift signups clear with it.
- **A signup is an intention, not a contract.** There is no
  check-in, no attendance record, and no "no-show" anything —
  permanently. Whether you made it is between you and the people
  in the room.
- **A full shift isn't a locked door.** The cap is the organizer's
  planning number. If a shift shows Full and you can still help,
  just ask them.

### Adding an event to your device calendar

On an event's page, **Add to calendar** (in the event-actions menu)
downloads a small calendar file for that one event that you can
import into your device's own calendar app. The file carries only
what you already see on the event page — never your RSVP or anyone
else's. Reminders are yours to set in your calendar app;
Understoria never schedules them. One thing to know plainly: once
that copy is in your device's calendar it lives there — it is
**not** removed by Understoria's emergency purge, so if you ever
purge the app, clean up your calendar separately.

### Creating an event

From the Calendar page, tap the **Create event** affordance. A
small gallery of **event templates** — potlucks, skillshares, and
other camaraderie gatherings — can pre-fill the form as a friendly
starting point, exactly like project templates; **start from
scratch** is always right there too. The form asks for title,
description, category, location (free text —
"Community room, 3rd floor" not GPS coordinates), start time,
optional end time, and an optional capacity cap. The form saves a
draft as you type (so an interruption doesn't lose your work) and
points out problems inline — a start in the past, an end before
the start — as soon as it can see them. One deliberate thing: the
**time doesn't pre-fill**. An event is a permanent signed record,
so the app asks you to consciously pick the time rather than
letting a default slip through. Before you sign,
a comparison card spells out exactly what publishing an event
commits you to: your public key is on the wire as the organizer,
the time and location are visible on every peer node, the record
is permanent (you can cancel, you can't edit or delete), and RSVPs
stay on the node where they happened.

If the time or location changes, the path is **cancel and
re-create** — there are no edits in phase 1, because an edit
silently moves the people who already said yes. The cancellation
is itself a signed record so anyone who RSVP'd sees what changed
and can decide again. Adding an optional reason to the cancellation
is kind; it shows on the RSVP'd members' attention rails.

If your local-node RSVP count hits the capacity you set, an
attention item lets you know — the cap is a planning aid for you,
not a "sold out" signal to other members.

Some events are **work days for a project** ("Saturday build day
for the community fridge"). Organizers schedule these from the
project page; on the calendar and the event page they look like any
other event, and the project's page lists its upcoming work days so
you know when to show up.

One more small thing: post, project, task, and event pages all have
a **⋮ menu** with a **Copy link** item, so you can hand someone a
direct link to the thing you're talking about (over Signal, say)
without copying it from the address bar.

The full design and the values reasoning live in
[`community-events.md`](./community-events.md).

## 10. The Dashboard

Tap **Dashboard** at the bottom of the screen. This is the
community-level view, not your personal stats. Highlights:

- **Total hours exchanged**, **active members this week**, and the
  **solidarity streak** (consecutive days with at least one exchange
  in the community).
- **Milestones** — community thresholds the group has crossed (first
  10 hours, first 25, etc.).
- **Where help is flowing** — a category breakdown showing the mix
  of care, labor, and support moving through the community.
- **Breadth, not depth** — a glimpse of how widely help spreads;
  each bar is one member's count of *distinct people* helped, not
  total hours. Generosity spread widely, not piled deep.
- **Reciprocity** — the percentage of community connections that
  flow both ways. High reciprocity means most relationships are
  mutual; low reciprocity is worth a community conversation, not an
  automated response.
- **Community roles this month** — a count of how many members
  stepped into each role recently.

Both the breadth bar and the reciprocity pulse are windows into the
shape of help, not scores. They're there so the community can see
itself, not so members can compete.

The Dashboard also offers a few quiet doorways into doing
something, never pressure to:

- **Coming up** — the next few community gatherings, in
  chronological order, each linking to its event page. No
  attendance counts; if you've RSVP'd going, only you see that
  marked.
- **Where hands are welcome** — a small mix of open needs and
  active projects that could use more help, capped at a few and
  hidden entirely when there's nothing. A doorway, not a to-do
  list.
- The needs stat card carries a small **"See open needs →"** link
  to the Board, and when proposals are open for discussion a
  one-line link points at them. Nothing counts down, nothing says
  "awaiting your vote."

## 11. Messages

Tap **Messages** to see private one-on-one conversations with
other members of your community. Messages are end-to-end
encrypted on your device — the community node never sees their
contents, and nobody else can read them even if they get a copy.

A few things worth knowing:

- **Conversations start from a post.** To message someone for the
  first time, open one of their posts and tap **Reach out**.
  There's no "search the member list and DM anyone" affordance —
  by design. Messaging is for coordinating on actual help, not
  for cold-DMing strangers.
- **The thread shows which post it's about.** When you tap Reach
  out on a post, a small "You're writing about: {title}" note sits
  above the composer, and the message you send carries that
  reference — so the *other* person's thread shows a quiet
  "about: {title} →" chip linking back to the offer or need the
  conversation concerns. The reference travels inside the
  encrypted message itself, so the community node never learns
  which post a conversation is about.
- **No read receipts, no typing indicators, no online/offline
  status.** These are metadata leaks the project explicitly does
  not collect.
- **Search.** The search box at the top of the Messages tab finds
  messages you've already received. Tap a result to open the
  conversation with the search term pre-filled — inside a thread,
  use the up / down arrows next to the search box to jump between
  matches. Each search result also shows the **conversation
  context** — who the thread is with, with the matched substring
  highlighted — so you can tell at a glance whether it's the
  conversation you meant. Search is local to your device; it never
  sees the community node and never sees anyone else's messages.
- **Block / unblock from the conversation header.** The header of
  any conversation has a small **⋮** menu — that's where you
  reach Block or Unblock for the person you're talking with,
  without having to navigate back to their profile. Blocking
  here behaves the same as blocking from anywhere else (§14a)
  and the action is silent: the other member is not told.
- **Locked sessions.** If you've set a passphrase and the session
  is locked, you can't read or search messages until you unlock —
  the secret key needed to decrypt them is sealed.
- **No recovery.** If you lose your secret key (no passphrase
  backup, device wiped, etc.) the messages are gone. This is the
  trade-off for end-to-end encryption with no central server.

## 12. Your Profile page

Tap **Profile** to see:

- **Your balance** and a note about what it means. If you have
  exchanges that are awaiting confirmation (yours or the other
  person's), the balance breaks them out below the headline
  number — for example, *"2 hours pending from Alex's task,
  1 hour pending from the porch repair post"* — so you can see
  exactly what's in flight and what's already settled. Pending
  hours from project tasks you've completed but the organiser
  hasn't confirmed yet are included in the breakdown.
- **About you** — display name, skills, availability, neighborhood
  area. You can edit any of these any time.
- **Your community roles** — things like "First Exchange,"
  "Connector," "Listener," "Weaver," "Groundbreaker," "Crew Member,"
  "Momentum Maker," "Keystone." These are ways of naming what you've
  done, not a ranking.
- **Your exchange history** — every give or receive, with who and
  when. Rows that came from a project task link straight to that
  task's page, and if an exchange of yours is in community review,
  the small amber chip on its row links to the conversation where
  the community is discussing it.
- **Tasks you're carrying** and **Projects you organize** — links
  to the two gather-it-in-one-place views: `/my-tasks` collects
  every task you've claimed across all projects, and
  `/my-projects` collects every project in your care (as organizer
  or co-organizer) with what's quietly waiting on you — tasks
  awaiting your confirmation, open slots, invitations you've
  issued. Both are read-only by design; the actions stay on the
  project pages.
- **Invites you've issued** — once you've been in the community a
  while, you can generate invite links for people you want to bring
  in. (See §13.)
- **Learn** — revisit the welcome flow any time, expand the in-app
  member guide (a shorter version of this document, available
  offline), open the study-group prompts and copy one to share
  in a meeting, or open the **install guide** (§1a) to put the app
  on your home screen.
- **Community settings** — three safeguard thresholds the community
  can tune to fit its own context: daily helper limit (a hard
  per-day cap), short-exchange threshold (exchanges shorter than
  this get flagged for community review, not blocked), and
  reciprocal-pattern threshold (after this many exchanges between
  the same two members in 30 days, the next one gets flagged). A
  yellow note explains these are bootstrap-mode — once in-app
  governance ships, changes here will route through a proposal.
- **Add another device** — set up Understoria on a second device
  (a laptop as well as your phone, say) under one identity. (See §12a.)
- **Paired devices** — a list of the devices you've added, so you can
  see what you've authorized.
- **Emergency** — panic buttons in case a device is at risk (§15).
  Stays on the Profile page (not under Settings) so it's reachable
  in a stress moment without an extra tap.

The Profile page also has a **gear icon in the top right** that opens
**Settings** — device-local preferences that only affect this device:

- **Language** — switch between English and Spanish.
- **Appearance** — comfort settings. Pick a theme (Match system /
  Light / Dark — Match system follows whatever your phone or browser
  is set to, useful if you've told your device to switch by time of
  day), a text size (Default / Larger / Largest — the larger options
  multiply on top of whatever text size you've set on your phone, so
  they stack rather than replace it; the three buttons render at the
  sizes they represent so you can see the difference before you
  pick), and a layout density (Comfortable / Compact — Compact trims
  card padding so denser screens fit more above the fold, useful on
  a desktop or tablet where you'd rather see more at once; touch
  targets stay the same size at either setting).
- **Community node** — optional mirror of your finalized exchanges
  to a community-wide ledger; off by default.
- **Security** — turn on a passphrase for your identity (§14).
- **Blocked contacts** — the list of members you've blocked and a
  separate "Previously blocked" history. Each row is **obscured
  by default** — generic avatar, the literal copy "Blocked
  contact," and the block date — so a glance over your shoulder
  doesn't read your block list. Tap a row to reveal the display
  name and the truncated pubkey; tap again to re-obscure. From
  each row you can flip the per-block hide-governance toggle,
  edit your private note, or Unblock (with a confirm dialog).
  A single **Clear unblocked history** button at the bottom of
  the Previously-blocked subsection clears the whole list. A
  fine-print note explains that blocks created on this device
  won't automatically reach devices you paired *before* the
  block — you'd need to re-pair the older device to bring the
  new block state across. See §14a for when to block, when to
  file a dispute, and when to do both.
- **Data export** — download a JSON snapshot of your local data.
  Private keys are deliberately excluded; key backup is a separate
  passphrase-wrapped flow. Your block list and previously-blocked
  history are also excluded — they're personal-relief data, not
  part of the export shape.

## 12a. Using Understoria on more than one device

If you do organizing work at a laptop but answer needs from your
phone, you don't have to choose. **Profile → Add another device** lets
you run Understoria on a second device as the *same member* — one
identity, one balance, one name on the Board — rather than two
separate identities the community can't tell apart.

### What follows you, and what starts fresh

Before anything else, the app shows a card laying out exactly what
moves and what doesn't, so there are no surprises:

- **Comes with you:** your identity (both devices count as the same
  member), your profile (name, skills, availability, area), and your
  balance and exchange history (these live in the community ledger,
  not on the device).
- **Starts fresh on the new device:** your direct message history
  (messages are tied to the device that received them), any drafts in
  progress (finish or copy anything you don't want to lose first), and
  your appearance settings like theme and text size (those are
  per-device on purpose). Your community roles rebuild on their own as
  the new device catches up.

### How to do it

On the device you already use:

1. **Profile → Add another device**, read the card, and continue.
2. The app warns you first: **the code it's about to show is your
   identity for the next 5 minutes.** Security cameras, doorbell cams,
   and webcams can read a code off your screen from across a room. Do
   this in a room you control — if you're not sure, cancel.
3. It then shows a **QR code** and **six words**, with a five-minute
   countdown. After five minutes they disappear on their own.

On the new device:

1. Open Understoria. On the welcome screen, choose **"I have another
   device."**
2. Scan the QR code (or paste it), then type in the six words.
3. Both devices show a short **fingerprint** — a few characters.
   Check that they match before you continue. A mismatch means
   something is wrong; stop.
4. Set a **passphrase** for this new device (it's separate from the
   one on your other device), and you'll land on the Board, signed in
   as you.

### A couple of things to know

- You can see everything you've set up under **Profile → Paired
  devices**.
- There's **no remote wipe**. If a device is lost or stolen, the only
  way to cut it off is to reset your identity entirely from **Profile
  → Emergency** (a hard purge), which starts you over with a new key.
  It's a real cost, so keep your devices close.

## 13. Inviting someone new

Two vouches turn a new member into a **trusted** member. Your invite
counts as the first; someone else will need to vouch for them after
they join.

1. Go to **Profile → Invites you've issued**.
2. Tap **Generate invite link**.
3. A **share sheet** opens. It will *not* show the QR code or the
   link right away — you'll see a "Look around before you show
   this" prompt first. That's deliberate: security cameras and
   webcams can read QR codes from across a room, and once the code
   is on screen anyone in camera view can save it. You get to
   decide when (and if) to reveal it.

You have three choices:

- **Show the invite** — reveals the QR code and the link. Use this
  when you're handing the invite off in person and you've checked
  that no cameras can see your screen. The other person scans
  the QR with their phone camera; they're in.
- **Send the link without showing it** — uses your phone's native
  share menu (Signal, Messages, Mail) or copies the link to your
  clipboard silently. The link never appears on screen. This is
  the right choice when you're sending the invite through an
  encrypted app, and works in any environment.
- **Not now** — closes the prompt. Generate again later if you
  change your mind. Generated invites stay in the list below and
  you can re-open the share sheet from "Show QR code" any time.

A few things worth knowing:

- The prompt **comes up every time** — there's no "don't show
  this again" option. Your surroundings can change between one
  share and the next.
- The link is **single-use** and **expires in 14 days**.
- The Invites card on Profile shows a one-line summary of how many
  invites you have in each state (e.g. "3 open · 2 redeemed").
  Tap **Manage all →** to open the dedicated invites page — that's
  where you'll find the full list with **Copy**, **Show QR code**
  (re-opens the look-around prompt + QR for any open invite), and
  **Revoke** on each row. If you've shared a link and want to
  undo, that's where to do it.
- Tell the person what your inviter-key fingerprint looks like
  (the app shows it) so they can verify when they open the link.
- Don't share invites over email, plain SMS, or group chats
  others can see. Use Signal, in person, or written down.

You can revoke an unredeemed invite from the same page if you
change your mind.

## 14. Setting a passphrase

If your phone has full-disk encryption on and a strong lock screen,
you're already in decent shape. Setting a passphrase on top of that
means that even if someone gets around your phone's lock, they can't
use your Understoria identity without your passphrase.

1. **Profile → Security → Enable passphrase protection.**
2. Type a passphrase. At least 8 characters. A four-word phrase from
   a password manager is ideal.
3. **Write it down somewhere safe.** There is no recovery. If you
   forget it, your identity on this device is gone.

From then on, the app asks for the passphrase every time you open it.

You can **Change** or **Disable** protection from the same page. There
is also a **Lock now** button if you need to hand the device to
someone briefly.

## 14a. When to block, when to file a dispute, when to do both

Sometimes another member is causing you a problem and you need a
way to stop the contact. Sometimes the situation is bigger than
that and the community needs to weigh in. These are two different
tools, and they don't replace each other.

**Block** is personal relief. You tap Block contact on a member's
profile (Member → Block contact), and from that point on you stop
seeing their posts, projects, events, vouches, task comments, and
DMs in your view. You can no longer be silently signed up to help
them or be vouched by them, and the same is true in reverse from
their side, silently. The block is private to you. The other
member is not told. No moderator hears about it. No record
federates anywhere. You can unblock at any time from
Settings → Blocked contacts.

When you block, you'll see a card explaining what blocking does
before you confirm. The card includes an optional checkbox to also
hide the blocked member's proposals, votes, and dispute comments
from your view — the default keeps them visible so the community
process surface stays whole for you, but if seeing their voice in
governance is the contact you're trying to escape, the checkbox is
there for you. You can flip it any time.

Blocking is private self-help. It is not a way to flag the other
member to moderators, and it is not a community judgment about
them.

**Dispute** is the community process. If what you've experienced
is something the community needs to weigh in on — a Code of
Conduct violation, a pattern of behavior others have also been
hurt by, a request for the community to take some shared action —
then the right tool is a proposal in the dispute process. The
proposal is public to the community by design (that's what makes
it community process); it does not become a community matter just
because you blocked someone, and it should not become a community
matter just because you wanted to stop seeing their posts.

**You can do both.** Block to stop the unwanted contact right now;
file a dispute so the community has the chance to deliberate. The
two run in parallel — the block takes effect the moment you
confirm it; the dispute follows community process at its own pace
(see [GOVERNANCE.md](../GOVERNANCE.md) §5). One does not depend on
the other, and neither one diminishes the other.

A short way to think about it:

- "I need quiet now." → Block.
- "The community needs to weigh in." → Dispute.
- "Both, at the same time." → Both.

Block is reversible — unblock from Settings → Blocked contacts.
Dispute outcomes follow the community process and may or may not
be reversible depending on what the proposal does.

If someone is causing you serious harm and you need help beyond
what these tools provide, reach out to members you trust and to the
Code of Conduct enforcement contact. The block and the dispute are
tools; community care is the response.

## 15. If the device is at risk

**Profile → Emergency** has two panic buttons.

- **Soft purge** — blanks out all the names, descriptions, and areas.
  Your signed exchange history stays intact. Use this if the device
  will briefly be in hostile hands.
- **Hard purge** — wipes everything on this device, including your
  identity. The page reloads as a fresh install. **Unrecoverable.**

Both happen entirely on this device. Neither contacts a server.

## 16. FAQ

**What if nobody responds to my post?** Bump it. Repost with more
detail. Say so out loud — in a meeting, a thread, wherever your
community talks. Nobody gets everything they need, but if you keep
being invisible, that's a community conversation.

**What if I don't want to give my real name?** Pseudonyms are fine
and common. The software was designed this way on purpose.

**Can my boss see my activity?** Not from outside the community.
Don't use Understoria on an employer-owned device or network —
that's a separate problem the software can't solve. See the
[Opsec Guide](opsec-guide.md).

**What if someone I don't like is in the community?** The
[Code of Conduct](../CODE_OF_CONDUCT.md) describes the
conflict-resolution process — direct conversation first, a mediated
one if that doesn't work. The block tool (above) is also there for
your own peace, no permission needed.

**What if I give a lot and never receive?** That's a community
conversation too. The dashboard is designed to surface whether aid is
really reaching everyone. If it isn't, we adjust.

**How do I see the welcome screens again?** Profile → Learn →
Revisit the welcome. The welcome only auto-shows once per device.

**Why does my project show "Quiet"?** A project the community has
launched but where no tasks have been completed in the last 7 days
gets a "Quiet" momentum chip. It's not a judgment — it's a signal
the community might want to bump it, regroup, or pause it.

**Where does my data live?** On your device, in the browser's
storage. Nothing leaves this device without you knowing — the only
thing that does is encrypted messages to people you explicitly
message, in a future release.

**Is it really free?** Yes. The software is AGPL-3.0-or-later. No
advertisements, no subscriptions, no data sale. If your community
runs a server, that may cost someone a few dollars a month to host —
ask whoever operates your community's node.

---

*If something in this guide is unclear, that's our fault. Tell a
member you trust what confused you so we can fix it.*
