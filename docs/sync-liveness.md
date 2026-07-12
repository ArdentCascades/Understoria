# Sync liveness — making co-present use feel instant

> **Status:** shipped. `apps/web/src/lib/syncLoop.ts` (loop),
> `state/AppContext.tsx` (wiring), `lib/syncLoop.test.ts` (contract).

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

## Explicitly not done

Real server-push (SSE / WebSocket / long-poll) would make delivery
*truly* instant, but it is a genuine architectural change: a persistent
connection is a new surface and sharpens presence/online inference at
the node beyond what polling implies. The three layers above capture
most of the felt improvement for two co-present people at a fraction of
the risk. Revisit push only if a pilot still reports lag with the live
cadence on.
