# @-Mentions — derived, not delivered

Status: shipped (task comments).
Code: `apps/web/src/lib/mentions.ts` (lifecycle + autocomplete),
`apps/web/src/lib/markdown.ts` (token grammar),
`apps/web/src/components/Markdown.tsx` (rendering + resolver),
`apps/web/src/components/TaskComments.tsx` (composer),
`apps/web/src/pages/MyWork.tsx` ("Asked of you").

A member writing a task comment can @-mention another member of
their community: "Can someone who knows plumbing look at this?
@Marcus". The mentioned member sees an **Asked of you** section on
their *In my care* page the next time they open the app.

That is the entire feature. There is no push notification, no badge
count, no unread state, no server-side mention machinery, and no way
to mention (or search for) anyone outside your own community. Every
one of those absences is deliberate, and this document records why —
the choices are unusual enough that a future contributor will
reasonably ask "wait, where's the notifications table?" The answer
is: there isn't one, on purpose, and most of the design's value lives
in that absence.

## 1. The mental model

A mention is a **raised hand**, not a tap on the shoulder. It says
"this could use you, whenever you next have capacity" — it does not
interrupt, does not accumulate guilt, and does not demand to be
cleared. The composer says so out loud at write time: *"Rosa will see
this next time she opens Understoria — mentions never buzz anyone."*
If something is genuinely urgent, the answer is an urgent-tagged need
or a direct message, not a louder mention.

## 2. The decisions, and why

### D1 — Derived, not delivered (no notification rows anywhere)

"Someone asked for me" is computed fresh, on the member's own device,
every time they visit a surface that shows it. It is a pure function
of data that already exists:

    askedOfYou(my key, comments, tasks, projects, my blocks)

Nothing is *delivered*: no notification row is written when a mention
is posted, no unread flag is set, no read receipt is recorded, and
therefore nothing needs to be synced, migrated, exported, purged, or
cleaned up. When the query's predicates stop matching (§3), the item
vanishes by itself.

Why this way:

- **It's what the architecture can honestly promise.** Understoria is
  local-first; the "recipient" may be offline for days and there is no
  server that reads comment bodies (D5). A push pipeline would be a
  pretense of immediacy the system cannot deliver. Pull-based is not a
  compromise here — it is the truthful design.
- **It's the `no-notifications` design principle applied, not
  bent.** The principle (see `design-principles.ts`) exists because
  notification-driven platforms burn out the most active organizers
  first. Mentions are precisely the feature that would have smuggled
  engagement mechanics back in; deriving them keeps the app's one
  temperament: *we show what needs your attention when you open the
  app.*
- **No read-state chores.** An inbox of mentions would need
  mark-as-read, bulk-clear, and would sit there accusing the member
  who took a low-capacity week. A derived list has no state to manage
  — solidarity, not shame.
- **Blocking works for free and can't drift.** The list is filtered
  through the viewer's local blocks at query time (D6). Stored
  notification rows would be a second copy of "who reached me" that
  every future blocking change would have to remember to re-filter.

Cost accepted: computing the list is a scan over the local task
comments table on each visit. Community-scale comment volume makes
this trivial, and keeping it a scan preserves the property that
mention state lives *nowhere* except the comments themselves.

### D2 — The mention rides INSIDE the signed body (zero wire change)

A mention is a token in the comment text:

    @[Rosa](mention:BASE64_PUBLIC_KEY)

There is no `mentions` array on the `TaskComment` payload, no schema
bump, no server change. The token format deliberately reuses the
markdown link shape with a non-URL pseudo-scheme, which buys a
property that would otherwise take real engineering: **graceful
degradation everywhere, retroactively**. Any renderer that does not
know about mentions — a peer community running an older build, an
export, any surface that doesn't opt into resolution — hits the
existing security rule "a link whose URL fails the http(s)/mailto
allow-list is dropped, its label kept as plain text" and renders
exactly `@Rosa`. The right fallback rendering was already deployed
on every client before the feature existed.

Why this way:

- Task comments are **signed records**; adding a payload field means a
  canonical-payload change, dual-verification during rollout, and a
  server that validates a field it should have no interest in.
  Comments already federate byte-for-word — the mention goes along for
  the ride.
- The embedded label ("Rosa") is the **compose-time name snapshot**,
  which doubles as the fallback for viewers who don't have that member
  in their local table (peers, post-purge devices). It is cosmetic
  only — see D3.

Cost accepted: tokens consume some of the 2000-char comment budget
(~60 chars each), and the raw token is visible while composing.
Both acceptable for v1; a prettier composer can come later without
touching the wire.

### D3 — Keys are the identity; names are a render-time concern

The token's key is what a mention *is*; the label is decoration.
Rendering always prefers the key's **current display name from the
local members table** over the embedded label, and the `askedOfYou`
query matches on keys only.

This is the anti-impersonation rule: a hostile comment can write
`@[Rosa](mention:MALLORY_KEY)`, but on any device that knows
MALLORY_KEY the chip renders Mallory's real current name — the label
never gets to dress one key up as another member. A key the device
can't resolve renders as muted plain text with no link and no
implied trust. Renames also stop mattering: old mentions of a renamed
member show the new name wherever resolution is possible.

### D4 — Autocomplete is local-only; there is no people-search surface

Typing `@` suggests members from the device's **own members table**
(the same people already visible on the Members page for vouching and
blocking) — never from a network call, never across communities. The
server cannot see what was typed because nothing is sent; there is no
endpoint to scrape because none was added.

This is the answer to the "mentions become a way to search for
members" worry. Within one community, the member list is already
mutually visible by design — a small, invite-gated group of neighbors
is the trust unit. The versions that would genuinely be enumeration
hazards are **cross-node autocomplete** (turning federation into a
people directory) and **server-side mention search**; both are
non-features, and D1/D2 mean there is no infrastructure that could
quietly grow into them.

### D5 — The server never parses a mention

No mention index, no fan-out, no comment-body parsing on the node.
The node keeps treating a comment as an opaque signed record. This is
stated as its own decision because it is the one most likely to be
"helpfully" violated later (e.g. to add server-pushed mention
notifications for offline members). Doing so would require the server
to read message content it currently has no reason to read — a
privacy regression far bigger than the feature.

### D6 — Blocking swallows mentions

A mention by a blocked member never appears in the blocker's Asked of
you (the thread view already hides the comment itself per
`docs/blocking.md` §6). The derived list must never resurrect content
the blocker chose not to see — otherwise mentions become the
harassment channel that bypasses blocking. Because blocks are local
and the list is computed locally, this filter cannot be forgotten by
a sync path; it lives in the one query.

The asymmetry from `docs/blocking.md` §6.2 carries over: the blocked
member can still *write* mentions (project authority governs the
comment surface); they simply produce nothing on the blocker's
device.

### D7 — The hand lowers itself

There is no dismiss button and no mark-as-read. An item leaves the
list when the world changes:

- the asker deletes the comment (tombstone), or
- the task completes, or its project archives/completes, or
- **the mentioned member comments on that task** after the ask — any
  later comment of theirs on the task counts as having shown up
  (task-scoped on purpose: replying in the thread is the natural
  gesture, and requiring a reply *to the specific comment* would need
  threading the data model doesn't have).

A deliberate consequence: a mention the member never acts on stays
visible while the task is live. That is the honest state of the world
— someone asked, the task still wants attention — displayed without
urgency styling, in a section that is simply absent when no hands are
raised.

## 3. Lifecycle (the whole thing)

    appears   comment is live ∧ mentions my key ∧ author ≠ me
              ∧ author not blocked by me ∧ task not completed
              ∧ project not archived/completed
              ∧ no live comment of mine on that task after it
    ------------------------------------------------------------------
    leaves    any conjunct stops holding

There is no other mention state anywhere in the system.

## 4. Threat model notes

- **Member enumeration** — see D4. Suggestion pool = people you can
  already see; no network surface added.
- **Impersonation via label** — see D3. Resolver-name-wins; unknown
  keys render untrusted plain text.
- **Harassment** — see D6/D7. Blocking silences the channel entirely;
  no buzz means mention-spam costs the spammer visibility (comments in
  a thread the community reads) without granting them interruption
  power. Comment length caps bound per-comment mention volume; flag +
  dispute + removal remain the community's escalation path, as for any
  comment content.
- **Mention inside code spans** — extraction walks the same AST the
  renderer uses, so a token in `` `backticks` `` is code on screen and
  not a mention in the query. What you see is what is counted.

## 5. Non-goals / future

- **Mentions in proposals, disputes, messages** — wait until task
  comments prove the shape; governance surfaces have sharper
  harassment edges.
- **Cross-node mentions** — non-goal, per D4.
- **Opt-out ("don't let people mention me")** — deferred: with no
  buzz and blocking available, the remaining exposure is one muted
  list on the member's own device. Revisit if pilots surface a need.
- **Composer chips (hiding the raw token while writing)** — cosmetic,
  wire format already supports it.
