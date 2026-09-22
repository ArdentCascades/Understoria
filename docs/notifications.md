# Quiet by default — opt-in notifications

Status: DESIGNED (this document is the contract). PR ladder at the
end. Nothing here ships until its PR lands; every decision below
was settled with the project owner on 2026-09-22.

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

- **A (this doc):** `docs/notifications.md` + the threat-model
  section + CHANGELOG.
- **B (plumbing, dark):** node subscribe/renew/unsubscribe
  endpoints with VAPID + TTL + prune; the service-worker push
  handler (generateSW stays — the handler rides
  `workbox.importScripts` from a static script); client
  subscription lib; panic teardown; device-unlink pruning; the
  guard tests. No UI.
- **C (the switchboard):** the Settings section (master mute,
  categories, tier picker, neutral title, platform states,
  pre-permission disclosure) + the ~20–25 UI strings in all
  eighteen languages with the per-glossary term decisions.
- **D (the content pass):** the reworded `no-notifications`
  principle in all eighteen languages, the README "Why nothing
  buzzes" rewrite, and the opsec-guide additions on lock screens
  and the neutral title.
- **Follow-up (designed, unscheduled):** coalesced sender-blind
  message pings.
