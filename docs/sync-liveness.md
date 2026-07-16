# Sync liveness — making co-present use feel instant

> **Status:** shipped. `apps/web/src/lib/syncLoop.ts` (loop),
> `state/AppContext.tsx` (wiring), `lib/syncLoop.test.ts` (contract).
> Server push + chat-mode polling (2026-07, pilot "messages feel
> slow" report): `apps/server/src/nudgeBus.ts` +
> `routes/nudges.ts` (SSE stream), `lib/nudgeStream.ts` (client),
> `pages/Conversation.tsx` (chat-mode poll).

## The problem

Two people sitting next to each other act, and the other screen takes
"too long" to reflect it. It doesn't feel instant.

The cause is one-sided. **Sending is already prompt:** every write
action calls `flushOutboxNow()` the moment it happens (`db/actions.ts`,
`db/projects.ts`, `db/taskComments.ts`, `db/votes.ts`,
`lib/directExchange.ts`, …), so a record reaches the node within a
network round-trip. **Receiving was slow:** the app pulled the full
federation fan-out once on startup, then only every **3 minutes**, with
no trigger on focus, tab-return, or activity. So person A's action hit
the node in ~1s, but person B's screen didn't reflect it until B's next
scheduled poll — up to 180s away. That gap was the entire "not instant"
feeling.

## The fix — poll *when*, never change *what* or *where*

The lever is timing only. Every read still goes to the node exactly as
before; nothing new leaves the device, no new endpoint, no peer channel,
no persistent connection. Three layers in `lib/syncLoop.ts`:

1. **Kick on foreground.** On `visibilitychange`→visible, window
   `focus`, and window `online` (reconnect/wake), pull the hot set
   immediately. Two people bringing the app forward to show each other
   something reconcile at once. Kicks are **coalesced** (focus +
   visibilitychange fire together — collapsed within
   `KICK_COALESCE_MS`) and **in-flight-guarded** (a trigger mid-cycle
   asks for one more run rather than stacking a concurrent fan-out).

2. **Activity-aware cadence.** While the tab is visible **and** the
   member interacted within `IDLE_MS` (60s), poll every `HOT_MS` (12s).
   Backgrounded or idle, fall back to `COLD_MS` (180s — the prior
   whole-loop cadence). A foreground-but-idle tab **quietly backs off**:
   after `QUIET_AFTER` (3) consecutive empty hot ticks the interval
   stretches (doubling, capped at `HOT_MAX_MS` = 60s) so a left-open tab
   doesn't poll at full rate forever; the moment a pull lands something
   or the member interacts, it snaps back to 12s. Every interval carries
   ±15% **jitter** so a roomful of devices that foreground together
   don't stampede the node on the same beat.

3. **Hot set vs cold set.** Only tables that change during live
   collaboration ride the fast tick; the rest stay on the slow beat,
   keeping a hot tick to ~10 cheap cursor GETs that usually return
   empty.
   - **Hot:** posts, claims, task-comments, exchanges, messages,
     project→task state, events→(rsvps ∥ shifts→signups).
   - **Cold:** redemptions, invite-revocations, vouches, seed-vault
     pledges, member removals/reinstatements, proposals→votes→closures,
     event cancellations, the co-org invitation triplet.

The dependency orderings the fan-out relied on are preserved inside each
set (events before rsvps/shifts before signups; projects before tasks;
proposals before votes before closures).

## Privacy

Faster polling exposes **no new information and no new surface** — the
node already serves every read, so it already observes this device's
activity; only the *timing* tightens. Backgrounded is **always** cold,
preserving the "device is asleep" signal — the node can't newly infer
awake-vs-asleep beyond what any single read already implies. There is no
peer-to-peer path, no persistent connection, and no presence beacon.
This is why the change is safe under the existing trust model
(`docs/operator-powers.md`, `docs/threat-model.md` §7).

## Cost and the knobs

A hot tick is a handful of `since=<cursor>` GETs that almost always
return empty arrays; foreground-only + quiet-backoff + jitter bound the
steady cost, and background never leaves the 3-minute cadence. The knobs
live as named constants in `lib/syncLoop.ts`
(`HOT_MS` / `COLD_MS` / `IDLE_MS` / `QUIET_AFTER` / `HOT_MAX_MS`) — a
natural candidate for a future `nodeConfig` override if an operator
wants to tune it for a low-power fleet.

## Chat-mode polling — an open conversation is special

The one place the 12s hot cadence still *felt* broken was an open
message thread: you're staring at the screen waiting for the reply.
`pages/Conversation.tsx` adds a chat-mode poll — while a conversation
is mounted **and the tab visible**, the page pulls the messages feed
(`pullFederatedMessages`, one cursor GET) every `CHAT_POLL_MS` (2.5s)
and refreshes the thread. Ticks are in-flight-guarded, skip while
hidden, run immediately on re-foregrounding or on a server nudge, and
tear down completely on leaving the page — the rest of the app never
pays for it.

## Server push — the nudge stream

The pilot did report lag (2026-07: "messages are working but they
feel slow"), so the deferred push layer is now shipped — in its
narrowest possible shape:

- **Server** (`nudgeBus.ts`, `routes/nudges.ts`): `GET /nudges` is a
  long-lived Server-Sent-Events response. An `onResponse` hook
  broadcasts one **content-free** `nudge` event to every subscriber
  after any *accepted* `POST` to a federation surface (the `SURFACES`
  map — so a future surface is covered the day it lands there). No
  record, no kind, no author ever rides the stream: E2E message
  envelopes stay exactly as private as before; the recipient still
  pulls them over the authenticated feed. The route is covered by the
  deny-by-default member-read guard the same as every other feed.
- **Client** (`lib/nudgeStream.ts`, wired in `AppContext`): one
  fetch-based SSE connection to the primary node while the app is
  open and foregrounded (fetch, not `EventSource`, because the read
  guard wants signed headers). Every nudge dispatches
  `SYNC_KICK_EVENT`, which `syncLoop` treats exactly like a focus
  kick — the same coalesced full pull. Hidden tab → stream closed;
  errors → exponential backoff 2s→60s. The poll cadence keeps running
  underneath, so a broken stream degrades to the polling behavior
  above — never worse.

Presence trade-off, acknowledged: a persistent connection does tell
the node "this device has the app open", which is sharper than the
awake-inference polling already gave it. The stream carries nothing
else, stops when hidden, and the node already sees every read this
device makes — the marginal disclosure was judged worth ~1s delivery
for a mutual-aid app whose members are coordinating in real time
(`docs/operator-powers.md`, `docs/threat-model.md` §7 unchanged in
substance: the operator learns timing, never content).
