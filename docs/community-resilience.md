# Community resilience — the score, the card, and mirror nodes

Status: **Phase A shipped** (the honest resilience card + the
add-a-node path). **Phase B designed in full below, not yet built**
(mirror nodes + automatic failover — the machinery that lets the
score rise). Companion docs: `docs/add-a-node.md` (the member-facing
guide the card's call-to-action opens onto),
`docs/operator-powers.md` (why distributing nodes also distributes
the pressure target), `docs/member-authenticated-reads.md` (the read
gate mirrors must speak).

## 0. What this is for

Corporate centralized services have a physical failure mode
communities have learned the hard way: seize one server — by raid,
by court order, by intimidation of one hosting person — and the
community's coordination is gone. Understoria's architecture is
fundamentally different, and this feature exists to make that
difference VISIBLE and to recruit members into strengthening it:

- Every member's device already carries the complete community
  dataset, every record signed. Taking the server takes **nothing**
  that isn't already on twenty phones.
- With more than one node (Phase B), taking a server doesn't even
  interrupt service — the other nodes carry the load and no member
  reconfigures anything.
- Distributing nodes across members' households also distributes the
  *target*: there is no longer one person an anti-mutual-aid or
  anti-union group can pressure to break the community
  (`operator-powers.md` names this as the strongest structural
  remedy).

The score's one hard rule, learned at design time: **it must never
say more than the code delivers.** The first draft ("more federation
nodes = higher resilience") failed that rule three ways — apps point
at ONE node with no failover; peer nodes are neighboring
*communities*, not replicas; and the participation kinds
(projects/RSVPs) deliberately never cross the peer wire. So the
score ships in two phases: Phase A displays only what is true today
(and its honesty about the single node IS the call to action);
Phase B builds the machinery that lets the number rise truthfully.

## Phase A — the resilience card (shipped)

### What it shows

A Dashboard card ("Community resilience") built from data every
device already has:

1. **Nodes: the trunk row.** One filled trunk per connected
   community node (Phase A: exactly 0 or 1 — `communityNodeEnabled`
   + `communityNodeUrl` from settings), then a dashed empty slot
   that is itself the call to action, linking to `/help#add-a-node`.
   Reachability is derived from the last-sync telemetry the app
   already records (`communityNodeLastSuccess` /
   `communityNodeLastError` — no new probe, no new wire bytes).
2. **The replica line.** "Every one of your N members carries a
   complete copy of this community" — `members.length`, the fact
   that is already true and already the strongest takedown-resistance
   claim. Deliberately MEMBER count, not device count: devices per
   member are unknowable by design (the pairing log is local to each
   member; no device census exists and none should).
3. **The tier.** Wording, not a number — `no-leaderboards` /
   `solidarity-not-shame` apply to infrastructure the same as to
   members. Computed by `lib/resilience.ts` (pure, tested):

   | tier | condition | display intent |
   |---|---|---|
   | `seedling` | no node connected | "your community lives on this device — connect or start a node" |
   | `taking_root` | 1 node | "one server, many copies — a second node would make it sturdy" |
   | `sturdy` | 2 nodes reachable | Phase B |
   | `deep_rooted` | 3+ nodes reachable | Phase B |

   Phase A can only ever show the first two tiers; the table is
   future-proofed so Phase B raises the ceiling without renaming
   anything.

4. **The call to action.** "Grow another root →" linking to the new
   Help entry (`/help#add-a-node`), which gives the plain-language
   pitch (an old laptop in a closet is enough) and points at
   `docs/add-a-node.md` for the step-by-step.

### What it deliberately does NOT do

- No numeric score, no percentages, no red warning styling at tier
  one — a small community with one lovingly-run node is healthy, not
  failing. The empty trunk slot invites; it does not shame.
- No cross-community comparison, ever.
- No new wire surface: everything renders from local settings and
  tables. Zero new bytes; no threat-model delta beyond a note.
- No device census (see above).

### Files (Phase A)

- `apps/web/src/lib/resilience.ts` (+ test) — tier computation.
- `apps/web/src/components/dashboard/ResilienceCard.tsx` — the card.
- `apps/web/src/pages/Dashboard.tsx` — mounted beside the federation
  rollup (the "community as a whole" cluster).
- `apps/web/src/content/faq.ts` / `faq.es.ts` — the `add-a-node`
  Help entry the CTA opens.
- `docs/add-a-node.md` — the member-facing node guide.
- i18n `dashboard.resilience.*` in en + es.

## Phase B — mirror nodes + failover (designed, not built)

The machinery that makes "one node goes down, nobody notices,
nothing is lost" literally true, and lets the card climb past
`taking_root` without lying.

### B.1 Mirror replication (server)

A **mirror** is another node OF THE SAME COMMUNITY. This is a
different relationship than a `PEER_NODE_URLS` peer (a neighboring
community), and it deliberately replicates MORE:

- New env: `MIRROR_NODE_URLS` (comma-separated), `MIRROR_READ_TOKENS`
  (JSON url→token, same shape as `PEER_READ_TOKENS` — mirrors of a
  read-gated community authenticate as peers do).
- A mirror-pull worker structured like `peerPull.ts` but covering
  **every durable kind**, including what peer federation excludes:
  the five LWW state kinds (`/project-states`, `/task-states`,
  `/event-rsvps`, `/event-shifts`, `/shift-signups`), plus
  `/redemptions`, `/invite-revocations`, `/awaiting-transitions`.
  The LWW kinds replicate with the same authority-checked upsert the
  routes already implement (mirrors are the same community, so the
  privacy boundary from participation Phase 2 — "never to other
  communities" — is not crossed; the data moves between the
  community's own servers).
  Excluded, correctly: the device-link mailbox and tap-to-link
  rendezvous (ephemeral, self-limiting, meaningful only on the node
  the two devices both talk to).
- Mirrors must agree on `NODE_FOUNDER_KEYS` (same community, same
  trust roots) and each derive the same membership closure from the
  replicated redemption receipts. `NODE_SYSTEM_SECRET_KEY` is NOT
  shared: exactly one node (the primary) runs the auto-confirm
  sweep signer; mirrors verify its records via the published
  `/config.systemKey` exactly as peers do today. Simplest honest
  rule, documented for operators: auto-confirm authority stays with
  one node; if that node is lost, the operator of a mirror registers
  a new system key (existing rotation runbook).
- `GET /config` gains a `mirrors: string[]` field (from a new
  `MIRROR_ANNOUNCE_URLS` env) — how member devices DISCOVER the
  mirror list without hand-typing (config is an open, pre-membership
  surface already).

### B.2 Failover (web)

- Settings gain `communityNodeUrls` (ordered list; the existing
  single `communityNodeUrl` becomes its first entry via a Dexie
  migration — no member re-configures anything).
- The app refreshes the list from `/config.mirrors` on each launch
  (adopt-new, never silently drop the member's explicit primary; a
  consent card names newly announced mirrors before they're used,
  same informed-consent discipline as the node-URL suggestion).
- **Pulls:** cursor keys become per-node
  (`federationLast<Kind>Pull::<urlHash>`) — this is load-bearing:
  mirrors lag each other, so carrying a high-water mark from node A
  to node B would silently skip records forever. First pull against
  a newly adopted mirror starts from zero and dedupes (every pull
  is already idempotent by id / natural key).
- **Pushes:** the outbox stays single-delivery per record but the
  flush walks the node list: try primary, on network failure or 5xx
  try the next, remember which node accepted. Replication between
  nodes (B.1) fans the record out server-side — the phone doesn't
  multi-post.
- **Health:** the app already records last-success per configured
  node URL; extend the telemetry keys per-node. "Reachable" for the
  card = a successful signed read in the last 24h.

### B.3 The score goes live

`computeResilience` gains real inputs: `nodesConfigured`,
`nodesReachable24h`, per-node freshness (newest record timestamp
seen from each). The card's trunk row shows each node with a quiet
freshness leaf (green = synced today, amber = lagging, grey =
unreachable), and the tier climbs: 2 reachable → `sturdy`,
3+ → `deep_rooted`. Copy for the takedown story becomes concrete:
"If one server disappears, your apps switch to the others on their
own. Nothing is lost."

### B.4 Threat-model / docs obligations (owed at Phase B time)

- §7 entry: mirrors widen the *count of hosts* holding the
  community's records (each mirror operator = one more
  operator-powers trust relationship; the member-facing guide must
  say "a mirror operator is an operator"); the read gate must be ON
  or mirrored data is as open as the primary's; `MIRROR_READ_TOKENS`
  hygiene.
- `operator-powers.md`: update the "two operators are better than
  one" section from aspiration to mechanism.
- `add-a-node.md`: graduate from "second node = warm standby +
  distributed target" honesty to "second node = automatic failover".
- E2E: two real node processes, kill the primary mid-run, assert the
  app converges via the mirror with zero member action.

### B.5 Sizing

Roughly one federation-PR unit of work: the mirror worker is
`peerPull.ts` extended over five more kinds (whose verify+upsert
logic already exists in the routes), the failover loop is contained
in `nodeSubmit`/`federationSync`/`authorizedRead`, and the per-node
cursor change is mechanical but touches every pull. The consent
card and Dexie migration are small. Ship as: B-1 server replication,
B-2 client failover, B-3 score, in one PR each if review size wants
it.

## Out of scope, named

- **Automatic node gossip / DHT-style discovery.** Mirrors are
  operator-configured and member-consented. This community's threat
  model prefers legible infrastructure over self-organizing meshes.
- **Counting devices.** See Phase A — no device census.
- **Cross-community resilience pooling** (a neighboring community
  mirroring yours): a real idea (mutual aid between communities'
  infrastructure!) but it re-crosses the participation-data privacy
  boundary and needs its own values conversation first.
