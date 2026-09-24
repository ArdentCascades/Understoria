# Quiet by default — opt-in notifications

Status: v1 SHIPPED, v2 IN FLIGHT (this document remains the
contract). Every v1 rung landed — #633 (this doc), #634 (dark
plumbing), #635 (the Settings switchboard), #636 (the content
pass) — and the send triggers followed (#641). The v2 amendment at
the end (2026-09-23) extends the ladder: more categories, deeper
member control, and messages named by mutual consent. Every
decision here was settled with the project owner, and changing any
of them starts with amending this file: the guard tests pin the
enum, the defaults, and the allowlisted API surfaces to what is
written here.

## Why this exists, and why it is not a betrayal

The app's founding posture is the attention rail: open the app and
the top of the board says what needs you. Nothing buzzes. That
principle (`no-notifications` in the twelve) was always about
ENGAGEMENT MECHANICS — an app that interrupts you for its own
benefit, burning out the most committed members first. It was
never about the member who wants to be woken when their shift
starts, or when a neighbor needs their guardian shard to get back
into their life. Those are things with a person or a clock on the
other end, and a member choosing to be interrupted for them is the
opposite of urgency theater.

So the principle is AMENDED, not repealed, and the amendment ships
in the same change as the first toggle: **quiet by default —
nothing ever buzzes to bring you back; a notification exists only
when you asked for it, only for things with a person or a clock on
the other end.** The app still encourages trying it without: the
attention rail remains the designed way to find what needs you,
onboarding never mentions notifications, and the Settings section
leads with that framing.

## The decisions (settled, not open)

1. **Everything off by default.** Every category, every device,
   forever. A guard test pins the defaults.
2. **The browser permission is requested only at the moment a
   member enables their first category in Settings.** Never at
   onboarding, never preemptively, never re-asked after a denial.
   A guard test asserts the onboarding flow cannot reach the
   permission API.
3. **v1 categories — and only these:**
   - *Shift reminders* — a shift the member signed up for starts
     soon.
   - *Guardian requests* — someone the member holds a key shard
     for is asking for help getting back in. The safety-critical
     category; the reason at-risk members need this feature at
     all.
   - *Awaiting your confirmation* — an exchange is waiting on the
     member to confirm someone's hours.
   All three are node-initiated from signed, node-visible records
   (RSVPs and shift rows, guardian requests, task state). None can
   be triggered at will by a chosen individual against a chosen
   target.
4. **No messages category in v1.** Message pings are
   delivery-triggered, and blocks live only on the member's
   device — so a blocked person could make their target's phone
   buzz on demand, content-free but unmistakable, and client-side
   filtering collapses under browsers' silent-push budgets. The
   designed follow-up is **coalesced, sender-blind message
   pings** (at most one per quiet period, "there are words
   waiting for you", never named), which neuters the harassment
   vector without teaching the node anything new. **Block lists
   never leave the device** — recorded as a never below.
5. **Lock-screen content tiers**, member-chosen: *silent* (no
   banner, app badge only where supported), *generic* ("Something
   needs you" — no category, no names), *named* ("Your shift at
   {event} starts in an hour"). The named tier's enable control
   carries the shoulder-surfing warning in the why-idiom.
6. **Message bodies never appear in a notification, at any tier,
   ever** — not an option anyone can enable, in v1 (where no
   message category exists) or any future phase. Guard-tested at
   the payload boundary.
7. **The neutral title.** A member may choose what notifications
   call themselves — the honest default ("Understoria") or a
   neutral word of their own ("Reminder", anything). This is a
   safety feature with the same moral geometry as pseudonyms: it
   deceives no one the app owes honesty to; it protects a member
   from an onlooker at a checkpoint, an abusive partner, a
   hostile workplace. Never silently defaulted; framed in
   Settings as exactly what it is; covered in the opsec guide
   with its limit stated plainly (someone who unlocks the phone
   and inspects notification settings still sees the app — this
   is mitigation, not invisibility).
8. **Web push from the community's own node.** Standard Web Push
   with per-node VAPID keys — no vendor SDK, the sender is the
   community's server. The unavoidable honesty item: PWA push
   transits the browser vendor's push service (Apple/Google/
   Mozilla). Payloads are encrypted to the subscription
   (RFC 8291), but the vendor learns THAT this device receives
   pings from this node, and when. Settings says this before the
   permission prompt; the threat model carries a section; the
   Electron desktop shell is the documented no-third-party path
   (it notifies locally).

## Lifecycle rules (the safety plumbing)

- **TTL dead-man.** Every subscription expires node-side unless
  renewed by an app open (renewal window ~7 days, expiry ~21).
  This is what makes an OFFLINE hard purge safe: the wiped device
  cannot unsubscribe, but its pings stop when the TTL lapses —
  and the threat model states that residual window honestly.
- **Panic teardown.** Soft and hard purge both unsubscribe from
  the push service and delete the node-side subscription when the
  network allows, and always delete the local subscription state.
  Covered by a required test.
- **Per-device subscriptions.** A subscription is keyed to the
  device that created it; unlinking a device prunes that device's
  subscription node-side. A lost-but-linked phone stops pinging
  the moment it is unlinked.
- **Stale-endpoint hygiene.** The node prunes on 404/410 from the
  push service; the client re-registers on `pushsubscriptionchange`
  and on every renewal open (the event alone is unreliable).
- **The node sends only what the device subscribed to.** Category
  filtering happens at send time from the stored subscription's
  category set — client-side filtering in the service worker is a
  last resort, not the mechanism, because browsers punish pushes
  that display nothing.
- **Cancelled things cancel their pings.** A cancelled event or a
  confirmed exchange withdraws any queued reminder; a tapped
  notification re-checks live state on open rather than trusting
  its own text.
- **Locked identity degrades gracefully.** A device whose
  identity is biometric/passphrase-locked renders whatever the
  payload carries under the member's tier and opens onto the
  unlock screen; nothing in any payload ever requires client
  decryption to be safe to show.

## What the node stores, and what that costs

A new node table: subscription endpoint + keys, device id, member
key, category set, tier, custom title (client-held only — the
title never needs to reach the node; payloads carry category data
and the SERVICE WORKER applies title and tier at display time),
created/renewed timestamps. This is a new seizure surface: a
seized node reveals which members enabled notifications and their
endpoints. Mitigations: the table lives in the node's encrypted
ledger, rows expire by TTL, and the threat model names it.
(Design refinement while building: keep tier AND categories
client-side too if send-time filtering can live with a coarser
node-side category set — store the minimum that send-time
filtering genuinely needs.)

## The nevers (guard-tested where testable)

- No category outside the documented list — the category enum is
  pinned to this document by a guard test; growing it is a
  reviewed act that must amend this file.
- No default on. No permission request outside the Settings
  enable flow. No re-prompt after denial. No onboarding mention.
- No message bodies in payloads, ever.
- No block lists, mute lists, or per-sender preferences leaving
  the device.
- No engagement notifications: no activity digests, no "your post
  got replies", no streaks, no re-engagement ("we miss you"), no
  badges on tabs, no counts chasing members from screen to
  screen. The reworded principle still bans all of this.
- No vendor push SDK; the sender is always the community's node.

## Platform honesty

iOS requires the PWA installed to the home screen (16.4+); some
browsers lack push entirely. Settings shows an honest "not
available in this browser" state — never a dead toggle. The
Electron shell notifies locally without any push service and the
Settings copy says so.

## i18n note (for the strings PR)

Several fleets translated "post" with their language's word for
notification/announcement — Farsi's اعلان and Burmese's
အသိပေးချက် literally occupy this feature's headline word. Each
glossary needs a deliberately distinct term for a push
notification before the Settings strings ship; the strings PR
records each choice as a glossary erratum.

## PR ladder

- **A (this doc) — SHIPPED, #633:** `docs/notifications.md` + the
  threat-model section + CHANGELOG.
- **B (plumbing, dark) — SHIPPED, #634:** node
  subscribe/renew/unsubscribe endpoints with VAPID + TTL + prune;
  the service-worker push handler (generateSW stays — the handler
  rides `workbox.importScripts` from `public/push-sw.js`); client
  subscription lib; panic teardown; device-unlink pruning; the
  guard tests. No UI.
- **C (the switchboard) — SHIPPED, #635:** the Settings section
  (categories, tier picker, neutral title, platform states,
  pre-permission disclosure, all-off teardown that keeps display
  choices) + 34 UI strings in all eighteen languages with the
  per-glossary term decisions (fa آگاه‌سازی, my သတိပေးချက် — both
  recorded in their glossaries, since each language's word for
  "notification" was already spent on the board post).
- **D (the content pass) — SHIPPED, #636:** the reworded
  `no-notifications` principle in all eighteen languages (ID kept
  stable — thirty-one screens look it up), the README "Why nothing
  buzzes" rewrite, and the opsec-guide additions on lock screens
  and the neutral title.
- **E (the send triggers) — SHIPPED:** the leg between the opt-in
  and a real ping. `awaiting_confirmation` is event-driven off the
  signed awaiting-transition artifact (posts AND tasks — the
  artifact's `project:<pid>/task:<tid>` label covers both), pinging
  only the party whose word is missing, deduped by the artifact's
  first-writer-wins insert. `shift_reminder` is a five-minute sweep
  pinging each signed-up member once, an hour before the shift
  starts (inside the 4-hour delivery TTL), with a durable send-once
  ledger (migration v36) and send-time checks that make cancelled
  events, tombstoned shifts and withdrawn signups ping no one.
  Every send is per-member (`sendToMember`) through the same
  category gate.
- **Follow-up (designed, unscheduled):** coalesced sender-blind
  message pings.

## Field notes (rules learned after shipping)

- **The server-state message must tell the true story.** The
  Settings section probes `GET /push/vapid-key` before offering
  the switches, and the first build collapsed every failure into
  "this device isn't connected to a community server" — which a
  connected member read minutes after receiving an app update from
  that very server, because their node was still running
  pre-notifications software and 404ed the route. The probe now
  distinguishes three states with three messages, and a component
  test pins the distinction: *unconfigured* (no node set up on the
  device — the only case "not connected" is true), *unsupported*
  (the node answered without the route/key: it predates push
  support, and the message says the operator can fix it with an
  update while everything else keeps working), and *unreachable*
  (no answer at all — a connection hiccup with a Try-again button,
  never a verdict about the node's software). A member already
  subscribed keeps their switchboard regardless of the probe: the
  key is only needed to create a subscription.
- **`guardian_request` has no node-visible signal yet.** Guardian
  recovery runs device-to-device and through end-to-end messages
  the node cannot (and must not) read, so there is nothing for the
  node to send on. The category stays in the switchboard and the
  enum — it gates what the node MAY send — and its trigger begins
  the day a node-visible recovery-request record is designed.
  Until then a member who enables it simply receives nothing,
  which is quiet, not broken.
- **Web and server deploy separately.** A member seeing the new
  Settings UI proves nothing about the node: the static bundle
  updates through the service worker, the API needs
  `npm install` (web-push is a new dependency),
  `npm run build:server`, and a process restart. The operator
  guide (§6, "Opt-in push notifications") carries the steps and
  the ten-second check.

## v2 — more to opt into (2026-09-23 amendment)

Settled with the project owner after a day of live use. The
principle is unchanged — a notification exists only when you asked
for it, only for things with a person or a clock on the other end —
and every addition below is one of those two things. The category
enum grows from three to six; every guard that pins it (the web
guard, the server suite, push-sw.js's hand copy, this file) moves
in the same change, as the contract requires.

### New categories

- **event_reminder** — an hour before an event the member RSVP'd
  **"going"** to. Same sweep, same send-once ledger, same
  cancelled-things-cancel-their-pings rule as shift reminders. A
  "maybe" never pings: the member kept their options open, and the
  app keeps their quiet.
- **message_waiting** — coalesced, named by mutual consent. The
  full design below.
- **test_ping** — self-requested only. A member-signed
  `POST /push/test` delivers one ping straight to the requesting
  device's own subscription (no category opt-in involved, no other
  member reachable), so a member can see exactly what their chosen
  levels put on their lock screen before a real shift depends on
  it. Never node-initiated; a test that arrives unrequested is a
  bug with the same severity as an engagement ping.

### Messages: coalesced, named by mutual consent

The v1 doc excluded messages because blocks never leave the device
and per-message pings hand a blocked person a doorbell. Both facts
stand. The design that respects them:

- **The cap is the safety mechanism.** One ping per recipient per
  QUIET PERIOD (4 hours), fired by the first message to arrive
  after the period lapses, silent for every further message and
  sender inside the period. Whatever a sender does, they cannot
  make a phone buzz more than once per period — naming rules ride
  ON TOP of this and never replace it.
- **Reading your messages resets the period** (2026-09-24
  amendment). Every recipient-PROVED `GET /messages` — the signed
  read proof only the recipient's own devices can produce — clears
  their coalescer window, so the NEXT message pings immediately
  instead of waiting out a window the member has already answered.
  The experience falls out of the sync loop with no client change:
  an app open on screen fetches mail every few seconds, so an
  active conversation pings reply by reply; a pocketed phone
  fetches nothing and keeps the full quiet period. The cap's
  guarantee, restated precisely: **a sender cannot buzz a
  recipient more than once per period WITHOUT the recipient's own
  participation** — the cadence follows the recipient's activity,
  never the sender's. Two accepted edges, stated honestly: the
  reset trusts the same bounded-timestamp read proof the messages
  GET already trusts (its replay window is the proof's, and the
  consequence is bounded to extra pings while the member was
  provably just active); and while the app is visibly open, a ping
  may arrive for words the member is watching land in-app —
  redundant, but never suppressed in the SW, because browsers
  revoke subscriptions that receive pushes without displaying.
- **The payload names no one.** `category`, `path: /messages`, and
  `detail.senderKey` — the public key of the triggering sender.
  Never a display name, never a body, never a count.
- **Naming is an AND of three consents.** A ping renders as
  "«Name» has words for you" only when: (1) the SENDER's federated
  "my name may appear in notifications" flag is on — default OFF,
  each member's control over their own name, the pseudonym moral
  geometry pointed at notifications; (2) the RECIPIENT chose the
  named level for messages — the recipient always owns their lock
  screen and can always say less; (3) the recipient's DEVICE
  resolves the key: the app snapshots a senderKey→name map into
  the service worker's prefs — consented AND unblocked members
  only — and the SW renders named only on a map hit, generic
  otherwise. A blocked sender's key finds no entry and can never
  put their name on their target's screen; the block list never
  left the device to make that true.
- **The consent flag is a record, not a profile hope.** Display
  names materialize from redemption receipts and live on devices;
  there is no live profile-field channel to ride. The flag is its
  own single-owner signed LWW record — the seed-vault-pledge
  pattern — `{memberKey, allow, updatedAt, signature}`: a node
  table, a signed POST, a pull feed. The record carries the
  boolean ONLY; the name a recipient's lock screen shows is the
  one their own device already holds for that member.
- **Nevers, extended:** the name map is written only by the app
  from its own member rows — never from payload content; an
  unknown, unconsented or blocked senderKey MUST render the
  generic wording; message bodies still exist in no payload, at
  no tier, ever.
- **Threat-model note (for §7):** the node gains one public
  per-member bit (the name-consent flag) and message pings reveal
  to the push vendor the same thing every other category does —
  that something small arrived, and when. The triggering sender's
  key rides inside the encrypted payload, visible only to the
  recipient's device, which knew it anyway.

### Named event reminders (organizer-consented)

The named tier's original example — "Your shift at {event} starts
in an hour" — becomes real, behind a TWO-CONSENT AND:

- **The ORGANIZER's per-event flag** — "reminders may name this
  event", default OFF for every event (absence of a record is a
  no). Their call because it is their event's name; the pseudonym
  moral geometry again, pointed at a gathering. Less sensitive
  events can opt their name in for clearer reminders; a support
  circle stays generic forever.
- **The RECIPIENT's named level**, chosen with the
  shoulder-surfing warning — they always own their lock screen,
  per category since v2's rung G.

The flag is its own single-owner signed LWW record
(`{id, eventId, allow, updatedAt, signerKey, signature}`) rather
than an event field, because `canonicalEventPayload`'s field order
is the wire contract — and deliberately so: the immutable event
can't change its mind, but the record can be flipped or retracted
at ANY time, and the sweep reads it at SEND time, so a retraction
takes effect on the very next pass. Authority is the event-shift
rule: the only legitimate signer is the stored event's
`createdBy`, checked by the node route and every puller.

With the flag on, reminder payloads carry `detail.title` — the
event's title, which is already a public signed record, so nothing
new becomes node-visible and the title travels only inside the
RFC 8291-encrypted body. One flag covers BOTH clocks (shift
reminders name the shift's event). The known vector — an organizer
renaming an event to something hostile before reminders fire — is
accepted as weak: it reaches only members who RSVP'd "going" to
that organizer's own event, it is a public signed record, and any
recipient can drop to generic.

### Deeper member control (device-only)

- **Per-category lock-screen levels.** The single tier becomes a
  per-category choice (the stored single tier remains the
  fallback for categories without one). Applied by the SW at
  display time, from prefs, per payload category — the node still
  never learns any of it.
- **Quiet hours.** A local window ("nothing buzzes 21:00–08:00")
  stored in the device prefs; inside it the SW downgrades every
  ping to the silent presentation. Delivery still happens —
  the member reads it when they wake — but nothing sounds, and
  the node never learns anyone's sleep schedule.

### Designed, scheduled behind v2

- **Lead-time choice** for shift/event reminders (15 min / 1 h /
  morning-of / day-before): one small integer per subscription —
  the single new node-visible number — honored by the sweeps.
- **Governance deadlines** (a proposal you haven't voted on closes
  soon): a real, community-owned clock; argued fully in this file
  when scheduled.
- **The guardian recovery-request record**, which makes the
  long-quiet guardian_request category fire at last; designed with
  the recovery flow it touches.

### Ladder v2

- **F (this amendment) — the contract. SHIPPED, #644.**
- **G — SHIPPED, #645:** event_reminder + test_ping + per-category
  levels + quiet hours; strings in all eighteen languages; every
  enum pin moved.
- **H — SHIPPED:** message_waiting end to end — the consent record
  (node table v37, `/push-name-consents` routes + feed, mirror
  kind, web pull + outbox + reseed/snapshot registries), the
  per-recipient coalescer on the message route's onNewMessage hook,
  the Settings toggle + consented∩unblocked name-map snapshot into
  the SW prefs, SW named rendering with generic on any map miss;
  strings ×18; the threat-model §7 rewrite (shipped status + the
  consent-flag disclosure).
- **Named event reminders — SHIPPED** (with the section above):
  the disclosure record end to end (node table v38,
  `/event-reminder-disclosures` routes + feed with the
  organizer-referent check, mirror kind, web pull + outbox +
  registries), `detail.title` from both sweeps behind the flag,
  the SW's with-title templates, the create-form checkbox and the
  event page's organizer toggle; strings ×18.
- **Read-resets — SHIPPED** (with the amendment above): the
  recipient-proved GET /messages clears the coalescer window
  server-side; strings' cap description reworded ×18; no client
  change, no schema, no new setting.
- **I (later):** lead-time choice (and, argued alongside it, a
  bounded member-chosen quiet period — 1h floor); then governance,
  guardian, per the section above.
