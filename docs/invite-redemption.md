# Understoria — Invite redemption propagation (design note)

> **Status:** design accepted for implementation; no code in this PR.
> This note responds to a live production incident (§2). Phase 0 (§5)
> is client-only and shippable immediately; Phase 1 (§6–§9) adds wire
> surface and ships only with the threat-model §7 entries that landed
> alongside this note in `docs/threat-model.md`.
>
> **Why a new file** rather than extending an existing invites doc:
> there is no invites design note. The invite system predates the
> design-note discipline (it ships as code comments in
> `apps/web/src/db/invites.ts` and `apps/web/src/lib/invite.ts`, an
> entry in threat-model §6, and FAQ copy). `co-organizer-invitations.md`
> is a different subsystem (project roles, not membership). This file
> becomes the invites system's design home; the register/structure
> follows `docs/blocking.md` and `docs/community-events.md`.
>
> Related reading: `docs/threat-model.md` §7 (wire-surface discipline),
> `apps/web/src/content/design-principles.ts` (ethos review in §12),
> `apps/web/src/lib/vouch.ts` (trust computation), `deploy/Caddyfile`
> (the origin topology §5.3 relies on).

---

## §1 Status

- **Phase 0** (client-only, no wire change): **shipped** (PR #303 —
  §5.1 honest exits + paste recovery, §5.2 attach-don't-mint, §5.3
  origin-derived node suggestion).
- **Phase 1** (redemption propagation, new wire surface):
  **shipped** — §14's PRs 1a–1d landed as one PR (shared
  `RedemptionReceipt` types/crypto, server `redemptions` table +
  `POST/GET /redemptions` + removal of the `/invites` surface, web
  outbox kind + `pullFederatedRedemptions` + §6 merge rules +
  Invites-page states, and the §9 `pullFederatedVouches` companion
  leg). The three §15 operator rulings resolved to their recommended
  defaults (displayName rides in the receipt; prefill + explicit
  confirm; node-lifetime retention with a 7-day delivery grace).
- Threat-model §7 entries: flipped to *Shipped* alongside the
  Phase 1 implementation, per the `auto-confirm-key.md` precedent.

## §2 The incident, and why now

The verified diagnosis, stated once so the rest of the note can build
on it:

1. **Invite links are self-contained.** An invite is
   `${origin}/invite#<base64url(signed JSON)>` — a `SignedInvite`
   blob signed by the inviter (`apps/web/src/db/invites.ts:63-85`,
   verification `apps/web/src/lib/invite.ts:128-157`). The server is
   never involved. At the time of writing,
   `apps/server/src/routes/invites.ts` had a `POST /invites` route
   with **no web-side caller** (§10.1 studies it; we replaced rather
   than adopted it — the file was removed when Phase 1 shipped, §8).
2. **Redemption is purely local.** `redeemInvite`
   (`apps/web/src/db/invites.ts:145-205`) mints the invitee's
   keypair, a member row, and a redeemed-invite row — in HER Dexie
   only. No vouch record is created, nothing is enqueued. The
   redeemed-invite row is the "implicit vouch"
   (`db/invites.ts:130-144`; the comment explicitly defers
   "redemption gossip").
3. **Membership does not propagate at all.** There are no server
   member routes. `apps/web/src/lib/federationSync.ts` pulls posts,
   claims, task comments, exchanges, co-organizer records, events,
   and event cancellations — and **no vouches and no invites**
   (verified; there is no `pullFederatedVouches`). `PostPayload`
   carries only a bare `postedBy` key; pulled posts do not
   materialize member rows. The operator's "member count" is her
   local `members.length`. The full vouch topology is mapped in §4.
4. **Fresh devices have no `communityNodeUrl`.** It is a manual
   Settings step, so even push-capable records cannot leave the
   invitee's device — `enqueueOutbox` no-ops without a URL
   (`apps/web/src/lib/outbox.ts:220-221`).
5. **The flow hole.** After a redemption error, "Continue to the
   board" / "Not now" (`apps/web/src/pages/InviteAccept.tsx:104-110,
   203`) funnel into the welcome tour, whose profileSetup step mints
   a standalone orphan identity (`apps/web/src/pages/Welcome.tsx:
   257-271`). A failed invite silently becomes self-onboarding that
   looks like success. The likeliest error in the incident is a URL
   fragment mangled by a messenger in-app browser
   (`invite.errors.malformed`).

Net effect: a member joins, participates locally, and from every
other device in the community — including the inviter's — she does
not exist. The inviter's invite row stays "open" forever. The
implicit first vouch is invisible to everyone's trust computation but
her own.

## §3 What redemption propagation commits to

1. **The inviter learns her invite was redeemed** — her invite row
   moves `open → redeemed` (with who and when) the next time her
   device pulls. Discovery happens on her Invites page
   (`apps/web/src/pages/Invites.tsx`); there is no push and no badge
   (`no-notifications`).
2. **All members of the node learn the new member exists** — a
   member row with the display name she chose, so the community
   roster reflects reality.
3. **The implicit first vouch becomes visible to trust computation
   on every device** — `trustStatusWithInvites`
   (`apps/web/src/lib/vouch.ts:119-126`) already treats a redeemed
   invite row as a trust edge; propagation gives every device that
   row (§9).
4. **A failed redemption is never silently converted into
   self-onboarding** (Phase 0, §5.1).
5. **No new gatekeeping.** Membership requires no server approval,
   no operator action, no waiting period. The server relays and
   deduplicates; it does not decide (`community-authority`).
6. **Open invites never cross the wire.** Only redemptions do. An
   invite that is never redeemed leaves no trace off the inviter's
   device (§10.1 is the rejection of the alternative).

Scope exclusions (unchanged from the task): full profile sync or
roster gossip beyond membership visibility; cross-node membership;
any notification mechanics.

## §4 Verified current topology (who pushes, who pulls, where it dead-ends)

Established by reading the code, current as of this note:

| Record | Device → node | Node → node (peer pull) | Node → device (PWA pull) |
|---|---|---|---|
| Post, claim, task comment, exchange, coorg ×3, event, cancellation | outbox push | yes (`peerPull.ts`) | yes (`federationSync.ts`) |
| **Vouch** (manual) | outbox push (`db/vouches.ts:96` → `POST /vouches`) | yes (`pullVouchesFromPeer`, `peerPull.ts:166`) | **NO — dead end** |
| **Invite** (`SignedInvite`) | **never** (no caller of `POST /invites`) | route exists (`pullInvitesFromPeer`, `peerPull.ts:282`) but replicates an always-empty store | no |
| Membership (member rows) | never | never | never |

So the 0.2.0 changelog claim is half-true: the server-to-server peer
pull *does* replicate vouches — between SQLite stores. No member
device ever pulls them back down. A manual vouch is visible only on
the device that authored it (plus every server it transited). Trust
status therefore diverges per device today, for manual vouches and
implicit invite-vouches alike. Phase 1 fixes both legs (§9).

The invite leg was doubly dead: the `POST /invites` route (then at
`apps/server/src/routes/invites.ts`) was a designed-but-never-wired
intention — §10.1 argues its shape is one we should *not* wire, and
Phase 1 deleted the file outright (§8); the path no longer exists.

---

## §5 Phase 0 — client-only fixes (no wire change)

Shippable independently of Phase 1 and of each other. Zero new bytes
cross any wire.

### §5.1 Honest exits from a failed redemption

Today `InviteAccept` renders the error and a single "Continue to the
board" button; `notNow` does the same from the form. Both land in the
welcome tour, which mints an orphan identity. Changes:

1. **Fragment-loss recovery: a paste-the-link input.** The dominant
   failure (`malformed`) is a messenger in-app browser stripping or
   mangling the `#fragment`. The error screen gains a text input:
   *"If you have the invite link, paste the whole thing here."* The
   client extracts the fragment from a pasted URL (or accepts a bare
   token) and re-runs `decodeAndVerifyInvite`. This turns the most
   common hard failure into a two-step success with no new link
   needed. The `/invite` route with no fragment at all renders the
   same input instead of an immediate `malformed` error.
2. **Per-error guidance.** `malformed` → "open the link in your real
   browser, or paste it below; if that fails, ask {inviterName} for
   a fresh link." `expired` / `revoked` / `already_redeemed` → "ask
   for a fresh link" (existing copy is already close). The framing
   blames the messenger app, never the member
   (`solidarity-not-shame`).
3. **The exit is renamed and de-emphasized:** "Continue without
   joining." Copy states plainly: *"You can look around, but you
   haven't joined {inviterName}'s community yet. Anything you post
   stays on this device until you join."*
4. **A persistent, dismissible not-joined affordance.** If the
   member proceeds and onboards standalone, the Board shows a quiet
   card: *"You haven't joined a community yet. Have an invite link?"*
   linking to `/invite` (which now has the paste input). It is an
   affordance, not a warning badge — no red, no countdown, no
   nagging cadence (`solidarity-not-shame`, `no-notifications`).
   Detection: no redeemed invite row naming the current member and
   no configured community node. Dismissal is per-identity and
   permanent; the `/invite` route remains reachable from Settings.

### §5.2 Redeeming on an already-identified device: attach, don't mint

`redeemInvite` currently mints a fresh keypair every time and
switches the app to it. Combined with the §5.1 hole, the common
sequence is: redemption fails → member self-onboards (orphan
identity, seed credits, maybe posts) → gets a fresh link → redeems →
**a second identity** appears and the app switches to it, stranding
everything the member did as a ghost member.

**Decision: when the device already holds the current member's
secret key, redemption attaches the invite to the existing
identity.** `redeemInvite` gains an explicit mode:

- **Attach (default when a current member with a local secret key
  exists):** no keypair minting, no member creation. The redeemed
  invite row is written with `redeemedBy = <existing key>`. The
  member is offered a chance to update their display name (prefilled
  with the current one) — the invite screen's name field becomes an
  edit, not a creation. In Phase 1 the redemption receipt (§6) is
  signed by the existing key.
- **Mint (default on a fresh device):** today's behavior, unchanged.
- **Shared-device escape hatch:** if a current member exists, the
  accept screen says *"Joining as {currentName}"* with a secondary
  action *"I'm someone else — create a new identity."* Attach is the
  primary path; mint-anew is one tap away, never buried. This covers
  the household-shared-tablet case without making the common case
  (same person, recovered from a failed first attempt) produce
  ghosts.

Why attach is right: the invite's semantics are "the inviter admits
the token-holder" — the token-holder is a *person*, not a keypair.
Identity continuity preserves seed-credit history, drafts, messages,
and any exchanges already signed. Minting anew would also let one
person accumulate identities (each with seed credits) from repeated
invites — attach removes that accumulation path. The existing
`self_redeem` check (`db/invites.ts:168-171`) already prevents the
one attach we must never do (inviter attaching her own invite).

Interaction with `Welcome.tsx`: the profileSetup comment
("never a second identity for the same person",
`Welcome.tsx:227-233`) becomes true instead of aspirational — the
orphan minted after a failed redemption is the identity the eventual
successful redemption attaches to.

### §5.3 Auto-configuring `communityNodeUrl` from the serving origin

The canonical deployment (`deploy/Caddyfile`, `docs/deploy-linode.md`)
serves the PWA and the Fastify node from one origin: the dist at
`https://DOMAIN/`, the API under `https://DOMAIN/api`. A member who
loaded the PWA *from a community node* is holding the node URL in
`location.origin` already. The manual Settings step is why incident
finding #4 exists.

**Behavior:** the app derives a candidate `${location.origin}/api`
and probes `GET /api/health` (same-origin fetch, no third-party
request). What happens with a healthy candidate depends on how the
member arrived:

- **Invite redemption** (operator ruling, 2026-07, superseding the
  earlier card here): accepting the invite **is** the consent — the
  member just chose to join this community, and joining means
  joining its server. On redemption success the device connects to
  the candidate automatically and pushes the join receipt
  immediately; no card, no extra tap. If no candidate resolves and
  no node is configured, the success screen says plainly that the
  community's content will not appear until the device is connected
  (never a silent looks-like-success redirect).
- **First run without an invite** (the Board suggestion): the app
  **prefills** the community-node settings and shows the existing
  informed-consent card (`mirrorConsent.ts` posture) naming the
  origin and what will be sent. One tap confirms. Here nothing was
  accepted yet, so the threat-model §7 entry "Configurable node URL
  can leak counterparty public keys" keeps explicit consent
  load-bearing.

When derivation is safe vs. wrong:

| Situation | Origin-derived URL | Outcome |
|---|---|---|
| PWA served by a community node (canonical deploy) | correct | prefill + confirm |
| Second self-hosted node serving its own PWA | correct **for that node's members** — the origin *is* the node the member onboarded through | prefill + confirm |
| PWA-only static hosting (no node) | wrong | health probe fails → no suggestion |
| `localhost` / `127.0.0.1` / vite dev | wrong | excluded before probing |
| Member intends a *different* node than the serving origin | wrong | the consent card names the origin; member declines and configures manually |

Failure is silent (no error surface) — an unconfigured node is a
normal state, not a problem to nag about.

### §5.4 Adopting the community `nodeId` on redemption

Every device mints a random `nodeId` on first launch
(`ensureNodeId`). The Dashboard scopes its headline stats — total
hours, active members, solidarity streak — and the local-vs-federation
split by `nodeId` (`pages/Dashboard.tsx`, `lib/stats.ts`): an exchange
counts as "ours" only when `exchange.nodeId === ours`. A newly-invited
member who keeps their fresh random id therefore files every pulled
community exchange under "another community" and sees **zeroed stats**,
even though the records synced fine. This is the same hazard
`PairDevice` already guards against for device linking (it adopts the
source device's `nodeId`).

**Behavior:** on a mint redemption on a **fresh device** (no prior
identity), the new member adopts `invite.nodeId` — the inviter's
community id, already carried in the signed invite — as both their
`Member.nodeId` and the device-global `SETTING_KEYS.nodeId`. Because
the invite chain roots at the founder, the whole community converges on
the founder's id and every member's node-scoped view agrees.

**Guards.** Adoption is skipped when the device already holds an
identity — **attach** mode, or a second identity via
`forceNewIdentity` — because the one device-global `nodeId` must not
move out from under the incumbent member. It is also skipped when the
device holds more than one member row even without a current identity
(a dangling/cleared `currentMember` beside a community's synced data —
rewriting the id would silently re-scope every existing record), the
same member-count guard `PairDevice` uses. A legacy invite carrying an
empty `nodeId` falls back to the device id (no change from prior
behavior). The write is atomic with the mint: `db.settings` is inside
the redemption transaction, so `Member.nodeId` and the device setting
can never half-commit (the consumed invite would make that divergence
unrepairable).

**Node-canonical identity (`lib/nodeIdentity.ts`).** The invite-side
adoption above is only the fresh-device fast path. The community's ONE
true id is the id its node publishes on `GET /config` (`NODE_ID` env),
and every device — founder included — converges on it:

- **Adopt-forward.** `pendingMirrorSuggestions` (the `/config` fetch
  that already runs against the member's consented, enabled primary on
  every Board visit) calls `adoptCanonicalNodeId(body.nodeId)`. The
  device id flips to the canonical id; the previous id is recorded in
  `SETTING_KEYS.nodeIdAliases`. This one hook covers every hole the
  invite-side adoption could not reach: founders whose random device
  id never matched the server's `NODE_ID`, members who onboarded via
  Welcome before tapping an invite (attach mode never adopts), members
  invited by a pre-fix member (the invite carried a mismatched id),
  and pre-fix members healing automatically on their next visit. Trust
  posture: the id is only ever taken from the consented primary — a
  node the member already trusts with every record they author gains
  nothing by also naming the community.
- **Aliases for the past.** Old ids are inside signed payloads (posts,
  invites, events, state — everything but exchanges and vouches signs
  its `nodeId`), so history is never rewritten. Instead, every "is
  this record ours?" read uses `isOurNode(record.nodeId,
  communityNodeIds)` where `communityNodeIds` (AppContext) is the
  union of the current id, this device's prior ids, and the ids on the
  community's redeemed-invite rows (which every member's device
  materializes — covering OTHER members' pre-fix ids). Consumers:
  Dashboard headline + federation rollup, Board cross-node badge,
  PostDetail availability, claim federation, the Welcome bootstrap
  member count, and the Infrastructure page's nodeId-mismatch probe.
  Server-authored auto-confirmed exchanges (stamped with the server's
  `NODE_ID`) match by construction once the device has adopted.

---

## §6 Phase 1 — data model: the `RedemptionReceipt`

One new record type. Signed by the **new member**, embedding the
**original signed invite**, so it carries two independently
verifiable attestations: the inviter's intent to admit a
token-holder, and the token-holder's proof of key possession plus
consent to appear on the roster under a chosen name.

```ts
// packages/shared/src/types.ts
export interface RedemptionPayload {
  invite: SignedInvite;   // embedded verbatim: token, inviterKey,
                          // inviterName, nodeId, createdAt,
                          // expiresAt, signature
  redeemedBy: string;     // new member's Ed25519 public key
  displayName: string;    // ≤ 60 chars (matches InviteAccept input)
  redeemedAt: number;     // epoch ms, redeeming device's clock
}

export interface RedemptionReceipt extends RedemptionPayload {
  signature: string;      // Ed25519 by redeemedBy over
                          // canonicalRedemptionPayload(payload)
}
```

Identity/dedup key: `invite.token` (an invite is single-use; the
receipt inherits that). `canonicalRedemptionPayload` follows the
existing canonical-JSON discipline in `@understoria/shared/crypto`.

**Verification (`verifyRedemptionReceipt`), used identically by the
server route and the PWA pull:**

1. `verifyInvite(receipt.invite)` — inviter's signature over the
   embedded invite verifies against `invite.inviterKey`.
2. Outer signature verifies against `redeemedBy`.
3. `redeemedBy !== invite.inviterKey` (self-redeem, mirroring
   `db/invites.ts:168-171`).
4. `redeemedAt <= invite.expiresAt` (client-claimed; see §11 for
   what back-dating can and cannot buy).

**What the receipt is NOT:** it is not a `SignedVouch`. A vouch is
signed by the *voucher*; the inviter is not present at redemption
and cannot sign one, and having the invitee mint a vouch "from" the
inviter would invert the signature semantics. The receipt is its own
artifact, and §9 shows it feeds trust computation through machinery
that already exists.

**Client-side effects of a verified pulled receipt** (merge rules,
tolerant of any arrival order — each receipt is self-contained, so
there are no cross-record dependencies):

| Local state for `invite.token` | Action |
|---|---|
| No row (every other member's device) | insert `InviteRow` with `status: "redeemed"`, `redeemedBy`, `redeemedAt`; upsert a member row for `redeemedBy` (`displayName`, `nodeId`, joined-at = `redeemedAt`) if none exists |
| Row `status: "open"` (the inviter's device) | flip to `redeemed` + `redeemedBy`/`redeemedAt`; Invites page now shows it |
| Row `status: "revoked"` (inviter revoked) | **SUPERSEDED** (revocations now federate — §16 item 1, [`invite-revocation.md`](./invite-revocation.md)): an authoritative revocation (its `inviterKey` matches the receipt's embedded, inviter-signed invite) converges to `redeemed_despite_revocation`, keeping the redemption-observed fields so the inviter's Invites page can say "this invite was used after you revoked it" — a community conversation, not an automatic ejection (`community-authority`); a non-authoritative local `revoked` corrects to plain `redeemed` |
| Row `status: "redeemed"`, same `redeemedBy` | no-op (idempotent) |
| Row `status: "redeemed"`, different `redeemedBy` | should be unreachable (server enforces first-wins, §7); keep the local row, log |

Member rows materialized from receipts use the same starting-balance
constants as `createMember`, so every device computes identical
balances from the (already-federated) exchange history.

## §7 Wire protocol

Two endpoints on the community node, in the exact shape of the
existing sibling routes (`vouches.ts`, `events.ts`):

**`POST /redemptions`** — body: one `RedemptionReceipt` JSON.
- `201` — verified and novel (stored).
- `200` — idempotent replay: same token, same `redeemedBy`.
- `400` — malformed body.
- `409` — token already redeemed by a **different** `redeemedBy`
  (first-writer-wins; this is the server-side single-use enforcement
  the local-only design never had), or receipt arrived later than
  `invite.expiresAt` plus the delivery-grace window (§15 ruling 3
  sets the grace; default 7 days — covers "redeemed offline on day
  13, node configured on day 18").
- `422` — either signature fails, or self-redeem.

The 409 is a poison status for the outbox (`isPoisonResult`), which
is correct: retrying a lost race will never succeed, and the UI
surfaces the poisoned row — which is exactly how the redeeming
member finds out her link was redeemed twice (a stolen-link tell).

**`GET /redemptions?since=<ms>&limit=<n>`** — returns receipts with
`receivedAt >= since` (INCLUSIVE, with a `token` tiebreak in the
ordering), ascending, capped at 200/1000 like the sibling routes. The
inclusive cursor is deliberate: two receipts sharing a `receivedAt`
millisecond could otherwise straddle a page boundary and the strict
`>` cursor skipped the un-served one forever. Pullers merge
idempotently by token, so a re-served boundary row is a no-op. **Deviation from the siblings, named deliberately:** the
cursor is the server-assigned `receivedAt`, not the client-claimed
`redeemedAt`. The convergence requirement ("inviter offline for a
week must still converge") makes client-clock cursors unacceptable
here: a receipt with a skewed or back-dated `redeemedAt` below the
inviter's cursor would be skipped forever. `receivedAt` is
monotonic at the only place ordering exists. (The server inherently
knows arrival time; storing it adds no new observation.)

**Client legs:**
- New `OutboxRow.kind: "redemption_receipt"`. `redeemInvite`
  (both mint and attach modes) creates and enqueues the receipt in
  the same Dexie transaction that writes the invite row. If no
  `communityNodeUrl` is configured at redemption time, this specific
  kind is **enqueued anyway** (relaxing `outbox.ts:220-221` for this
  kind only) so that configuring a node later — including via the
  §5.3 suggestion — delivers the receipt retroactively. Rationale:
  the receipt is the member's only proof-of-joining; dropping it at
  enqueue time re-creates incident finding #4 permanently.
- New `pullFederatedRedemptions()` in `federationSync.ts`, same
  shape as the sibling pulls: cursor setting, verify (both
  signatures) before insert, skip-don't-advance on bad signatures,
  then apply the §6 merge rules.

## §8 Server storage and retention

New SQLite table `redemptions` (schema-migration pattern of
`db.ts`):

```
token TEXT PRIMARY KEY,          -- dedup + single-use
inviter_key TEXT NOT NULL,
inviter_name TEXT NOT NULL,      -- needed to re-verify the embedded
                                 -- invite signature (canonical
                                 -- payload includes it)
invite_node_id TEXT NOT NULL,
invite_created_at INTEGER NOT NULL,
invite_expires_at INTEGER NOT NULL,
invite_signature TEXT NOT NULL,
redeemed_by TEXT NOT NULL,
display_name TEXT NOT NULL,
redeemed_at INTEGER NOT NULL,
signature TEXT NOT NULL,
received_at INTEGER NOT NULL     -- cursor (§7)
```

Indexes: `received_at`, `inviter_key`, `redeemed_by`.

**What the server retains, said plainly:** one row per admitted
member: an inviter→invitee edge, a display name, timing, and a
*dead* token (post-redemption, replay yields 200/409 — the token
admits nobody). This is social-graph metadata — asset #1
(membership) and #2 (relationship graph) in threat-model §2 — held
on the community's own node, which already holds every member's
posts, exchanges, and the manual-vouch graph keyed by the same
public keys. The receipt adds one edge per member of the *same
class* as the already-federated `SignedVouch` wire shape
(`voucherKey`, `voucheeKey`, `createdAt`, in the clear), plus the
display name the member chose for the roster.

**Retention:** receipts are trust edges, needed for as long as
late-arriving and fresh devices must be able to compute trust and
materialize the roster — i.e., the life of the node (matching the
vouches table). Bounded alternatives all break convergence for the
next fresh device. Operator ruling 3 (§15) confirms this default.
**As-built honesty on deletion:** no server-side deletion path
exists — `RedemptionStore` has no delete, and the only shipped purge
tooling is the device-local panic flow (`apps/web/src/lib/panic.ts`);
the operator guide tracks server-side purge as *Pending*. Until that
tooling ships, receipts are retained on the node for its lifetime,
full stop. When it lands, the intended rule stands: receipts where a
hard-purged member appears as `redeemed_by` are deleted; receipts
where they appear as `inviter_key` are retained (they are the
*other* member's proof of admission) unless that member is purged
too. **No peer replication in Phase 1:** receipts
are deliberately excluded from `peerPull.ts` — cross-node membership
is out of scope, and keeping the roster off the inter-node wire
narrows exposure to the community's own operator (§11).

**Removal shipped in the same PR:** the unwired `POST /invites` /
`GET /invites` routes, `createInviteStore`, and
`pullInvitesFromPeer` are deleted. §10.1 explains why they must not
merely stay unwired: `GET /invites` returns full `SignedInvite`
rows to any unauthenticated caller — every field needed to
reconstruct a **live, redeemable invite link**. Today the store is
empty so the leak is theoretical; the first well-meaning PR that
wires invite registration turns it into a credential feed. Wire
surface that serves live credentials gets removed, not mothballed.
(Net: this design *adds* two endpoints and *removes* two.)

## §9 Making the implicit vouch visible to trust computation

The implicit vouch **stays implicit — and becomes visible**. No
synthetic `SignedVouch` is minted (§6 explains why it can't be
signed honestly). Instead:

1. `vouchersFor` / `trustStatusWithInvites`
   (`apps/web/src/lib/vouch.ts:103-178`) already consume
   `RedeemedInviteLike` rows — redeemed invite rows count as
   invite-kind trust edges, deduped against a later manual vouch
   from the same voucher. That machinery was built for exactly this
   and has been running on the only device that had the row.
2. The §6 merge rules materialize that row on **every** device via
   the receipt pull. Trust computation needs no changes at all: the
   new member shows `pending_trust` (1 vouch: the inviter's) on
   every device, `trusted` after one manual vouch from anyone else.
3. **Companion fix — the manual-vouch dead end.** Established in
   §4: manual vouches push up and replicate node-to-node but never
   reach other members' devices, so even the *second* vouch is
   invisible everywhere but the voucher's own device. Phase 1
   therefore includes `pullFederatedVouches()` in
   `federationSync.ts` — the server route (`GET /vouches?since=`)
   already exists and already serves this data to any peer;
   verification is `verifyVouch` per row. Without this leg, the
   receipt work would let everyone *see* the new member but nobody
   *see her become trusted*, and the incident's "roster doesn't
   reflect reality" complaint would recur one level up.

Display rules are unchanged: per the existing operator ruling and
`no-leaderboards` (`vouch.ts:139-145`), voucher sets/counts render
only on one's own profile; other members' pages show only the
qualitative trust status.

## §10 Alternatives weighed

### §10.1 Adopt the existing `POST /invites`: register invites at creation, then a redemption receipt

The unwired route's shape (historical — the file was deleted when
Phase 1 shipped, §8): `POST /invites` verified and stored a
full `SignedInvite`; `GET /invites?since=` returned full rows —
token and signature included — to any caller, "for federation"
(then `apps/server/src/routes/invites.ts:31-35`). Wiring it at invite
creation, plus a separate redemption record, would give the server
an open-invite registry and let it enforce single-use and even
revocation centrally.

Rejected, on four grounds:

1. **It's a live-credential feed.** A stored `SignedInvite` is
   sufficient to reconstruct the redeemable link
   (`encodeInviteToken` is just base64url(JSON) of those exact
   fields, `lib/invite.ts:115-117`). Any stranger polling
   `GET /invites` races legitimate invitees for every open invite
   on the node. Fixable with token-hash storage and auth — but that
   is a different, larger design, and grounds 2–4 still stand.
2. **Open invites are intent metadata.** An unredeemed invite
   reveals "the inviter tried to recruit someone" — recruitment
   activity, cadence, and volume per organizer. Threat-model rows 1
   and 2 pay for exactly this. The self-contained blob was designed
   so invites live out-of-band (`lib/invite.ts:27-41`);
   registration-at-creation surrenders that property for all
   invites to benefit the redeemed minority
   (`privacy-precondition`).
3. **It adds an availability coupling.** Invite creation would gain
   a server dependency (or a second outbox flow with its own
   failure states) where today it works fully offline.
4. **It doesn't even solve the incident alone** — a redemption
   record is still needed; registration is pure additional surface.

What we keep from its shape: the verify-then-idempotent-store
discipline and the `since`/`limit` pagination contract, both reused
by `/redemptions`.

### §10.2 Self-signed member announcement (no invite proof)

The new device pushes `{memberKey, displayName, nodeId, createdAt,
signature}` — membership derived from a signed hello. Minimal wire
bytes and no invite metadata at all. Rejected: it carries **no
admission proof**. Any keypair can announce itself onto the roster;
the server cannot distinguish an invited member from Sybil spam
without consulting invite state it doesn't have. It also flips
nothing on the inviter's Invites page and materializes no trust
edge, so commitments 1 and 3 of §3 fail. The receipt *is* this
announcement with the inviter's signed invite stapled on as the
anti-Sybil proof.

### §10.3 Inviter-signed redemption acknowledgment

The inviter's device, upon learning of the redemption, signs the
membership record (closest to a true vouch). Rejected as the
propagation primitive: it makes the new member's visibility hostage
to the inviter's device coming online ("inviter offline for a week"
fails commitment 2 for the whole roster, not just her own row), and
it can't be the *first* record because the inviter learns of the
redemption... from the propagation we're designing. Circular. An
inviter-side manual vouch remains available as the (already
shipped) second-vouch path.

**Recommendation: §6's `RedemptionReceipt`** — one record, pushed by
the only device guaranteed to be present at redemption, carrying
both attestations, verifiable by anyone, tolerant of any arrival
order.

## §11 Threat analysis

Wire fields crossing per receipt: the embedded invite (token,
inviterKey, inviterName, nodeId, createdAt, expiresAt, signature) +
redeemedBy, displayName, redeemedAt, signature.

**Adversary mapping (threat-model §3 rows):**

- **Row 5 (node operator) / Row 3 (breach) / Row 4 (legal
  compulsion):** the operator's SQLite now contains the roster and
  the invite graph explicitly (previously inferable only partially
  from vouches/posts/exchanges already on the node). This is the
  real cost of the design and it is priced deliberately: the node a
  community runs *for itself* holds its membership — asset #1 —
  under the same minimal-logging, compartmentalization, and purge
  posture as everything else it already holds. What does **not**
  happen: receipts do not peer-replicate (§8), so a *different*
  community's operator or a malicious peer node learns nothing new;
  open invites never appear anywhere (§10.1); no email/phone/IP is
  attached to any row (identity stays a bare key + chosen name).
- **Row 6 (infiltrator / bad-faith member):** any member-level
  actor can pull `GET /redemptions` and read the invite graph. This
  grants nothing beyond what row 6 already has: the manual-vouch
  graph is served by `GET /vouches` to the same audience, and a
  member sees the roster in-app by design. *(As written, both GETs
  were unauthenticated — one `curl` away for anyone. Member-
  authenticated reads have since shipped,
  `docs/member-authenticated-reads.md`: with `READ_AUTH=on`, opt-in
  and off by default, these GETs deny non-members. Row 6 holds a
  member key, so nothing in this row's analysis changes.)* The §9
  vouch pull likewise normalizes onto every device a graph the
  membership could already reach. Named honestly rather than
  mitigated:
  the trust graph is community-visible *by design of the
  web-of-trust*; what the threat model protects is its
  non-existence on wires the community doesn't control.
- **Rows 1–2 (employer / union-busters):** an adversary who can
  reach the node URL can enumerate the roster. Unchanged mitigation
  posture: nodes for at-risk communities sit behind the deployment
  guidance (TLS, no logging, and — shipped since this note —
  member-authenticated reads, `READ_AUTH=on`,
  `docs/member-authenticated-reads.md`; the allowlist note
  `docs/federated-node-allowlist.md` is about mirror-push trust, not
  reads); the PWA-only deployment mode
  (no node at all) remains fully functional — this design degrades
  gracefully to today's local-only behavior.
- **Row 7 (stalker):** displayName + joined-at is strictly less
  than what posts already expose (zone, availability, timing). No
  location, no availability, no activity in the receipt.

**Forgery:** requires forging Ed25519 — either the inviter's
signature (to fabricate an admission) or the invitee's (to
impersonate a redeemer). A receipt whose two signatures verify but
whose `displayName` is a lie is a member lying about their own
name — a social matter, surfaced by the inviter recognizing (or
not) who redeemed her invite on the Invites page.

**Replay:** byte-identical replay is idempotent (200, keyed on
token). A receipt replayed to a *different* node admits the member
to that node's roster — acceptable within Phase 1's single-node
scope; revisit at cross-node membership time (§16).

**Race / theft:** two receipts for one token → first `receivedAt`
wins, second poisons with 409 on the loser's device. A stolen link
redeemed by the thief was already an admission under the
self-contained design; the receipt makes the theft **visible** (the
inviter sees an unexpected name; the legitimate invitee sees the
409) — strictly better than today's silent divergence.

**Back-dating:** `redeemedAt` is client-claimed. Rejecting
`redeemedAt > expiresAt` stops naive late redemption; a determined
holder of an expired-but-unredeemed invite can back-date. The
delivery-grace bound on `receivedAt` (§7) caps how stale that play
can be, and the receipt stays signed and attributable — the
community can see exactly who did it. Equivalent residual to
today's client-side-only expiry check.

**Out-of-order / offline:** every receipt is self-contained (no
dependency records), merge rules are commutative and idempotent
(§6), the pull cursor is server-monotonic (§7), and the outbox
retries indefinitely with capped backoff. The inviter offline for a
week converges on her next pull; the invitee offline (or
unconfigured, §7) delivers on her next successful flush.

## §12 Ethos review (`apps/web/src/content/design-principles.ts`)

- **privacy-precondition:** open invites never leave the device;
  only consummated memberships propagate, only to the community's
  own node, with no peer replication; the live-token `GET /invites`
  surface is removed; no new identifier classes (no email/phone/IP)
  — identity remains a key plus a chosen name. The roster cost is
  named, bounded, and paid on the community's own infrastructure
  (§11).
- **asking-never-gated:** solidarity-first onboarding is untouched
  — `pending_trust` members still post needs and offers; seed
  credits unchanged; receipt delivery failure never blocks local
  participation; no server approval enters the join path.
- **no-notifications:** the inviter *discovers* the redemption on
  her Invites page; the new member appears on the roster when
  someone looks. No push, no badges, no urgency theater — the §5.1
  not-joined card is a quiet, dismissible affordance shown in-app
  only.
- **solidarity-not-shame:** error copy blames the transport, not
  the person ("ask for a fresh link", paste-recovery); "continue
  without joining" is a legitimate state, not a failure state; the
  redeemed-despite-revocation case surfaces as information for a
  conversation, not an automatic sanction.
- **community-authority:** the server relays, deduplicates, and
  verifies signatures — it never decides membership; no operator
  approval step, no admin role introduced; the revocation-race
  outcome is explicitly routed to community process.
- **deliberation-over-speed:** Phase 0 ships alone; Phase 1 waits
  on this note, its §7 entries, and the §15 rulings. The attach
  decision (§5.2) defaults to continuity with the alternative one
  tap away rather than optimizing for the fastest possible mint.

## §13 Threat-model §7 entries

Three entries ship in `docs/threat-model.md` §7 alongside this note,
in the section's existing format, marked *(design only; not yet
shipped)*:

1. **Federated `RedemptionReceipt` records** — the §6–§8 wire
   surface, adversary mapping, mitigations, residual.
2. **PWA vouch pull puts the vouch graph on every member device**
   — the §9 companion leg.
3. **Origin-derived community-node suggestion** — the §5.3
   amendment to the mirror-consent posture (client-only; no new
   bytes).

## §14 Phased rollout

**Phase 0 (each PR independent, no wire change):**
- **PR 0a** — honest error exits: paste-the-link recovery,
  per-error guidance, "continue without joining" copy, `/invite`
  no-fragment input, not-joined Board affordance (§5.1).
- **PR 0b** — attach-don't-mint redemption on identified devices,
  with the shared-device escape hatch (§5.2).
- **PR 0c** — origin-derived node suggestion behind the consent
  card (§5.3).

**Phase 1 (ordered; lands only after the §15 rulings):**
- **PR 1a** — `packages/shared`: `RedemptionPayload` /
  `RedemptionReceipt` types, `canonicalRedemptionPayload`,
  `verifyRedemptionReceipt`, `parseRedemption`.
- **PR 1b** — server: `redemptions` table + migration,
  `POST /redemptions`, `GET /redemptions`; **removal** of
  `routes/invites.ts`, `createInviteStore`, `pullInvitesFromPeer`.
- **PR 1c** — web: outbox kind `redemption_receipt` (enqueue even
  when unconfigured, §7), enqueue inside `redeemInvite`,
  `pullFederatedRedemptions` + §6 merge rules, Invites-page
  redeemed / redeemed-despite-revocation states, roster
  materialization.
- **PR 1d** — web: `pullFederatedVouches` + cross-device trust
  convergence tests (§9).

Phase 0 fixes the incident's silent-failure and unconfigured-node
legs immediately; a community running only Phase 0 is strictly
better off and no worse exposed. Phase 1 needs 0c (or manual
configuration) to deliver receipts from fresh devices — the note's
two phases are ordered but not interleaved.

## §15 Operator ruling needed (≤ 3, each with a recommended default)

1. **Does `displayName` ride in the receipt?** Including it makes
   the roster real (names, not bare keys) at the cost of putting the
   chosen name in the node's SQLite next to the invite edge.
   Excluding it means rosters show truncated keys until first post.
   **Recommended default: include it.** The member types the name on
   the accept screen knowing it is her community-facing name; a
   roster of bare keys fails the incident's actual complaint.
2. **Auto-configuration consent shape (§5.3):** silent enable when
   origin == node / prefill + explicit confirm / manual only.
   **Recommended default: prefill + explicit confirm** — preserves
   the mirror-consent §7 posture with one tap of friction.
3. **Server retention of receipts and the delivery-grace window
   (§7/§8):** retain-for-node-lifetime with purge-tooling deletion,
   grace 7 days / bounded retention N days / other.
   **Recommended default: node-lifetime retention, 7-day grace** —
   bounded retention breaks trust convergence for every future
   fresh device; revisit at pilot review with real roster sizes.

## §16 Open questions

1. **Revocation propagation.** Revocation is local-only today; the
   §6 revoked-vs-redeemed race is surfaced but not prevented. A
   signed `InviteRevocation` record propagates revocations without
   registering open invites (it names one token only, after the
   inviter chose to kill it). Designed in
   [`invite-revocation.md`](./invite-revocation.md): commutative merge
   to a `redeemed_despite_revocation` state, never ejection, with the
   trust-withdrawal half behind a governance ruling.
2. **Cross-node membership.** Receipts deliberately do not
   peer-replicate. When cross-node membership is designed, receipt
   replay across nodes (§11) must be re-examined — likely by
   binding receipts to `invite.nodeId` at admission time.
3. **Roster departure.** Propagating "member left" is the tombstone
   twin of this design (soft-purge currently anonymizes locally
   only). Needs its own note; the pending server-side purge tooling
   (§8 — no server deletion path exists yet) is the anchor point.
4. **`GET /redemptions` is unauthenticated,** like every sibling
   GET. **Answered since:** read-side auth shipped for all of these
   at once as member-authenticated reads
   (`docs/member-authenticated-reads.md`) — with `READ_AUTH=on`
   (opt-in; off by default) every federation GET is deny-by-default
   and requires a signed member read or a configured peer token. The
   pilot posture (§11 row 6) remains the default. This note
   originally pointed at `docs/federated-node-allowlist.md` as where
   read auth would land; that design turned out to be about
   mirror-push trust (where a member's device may *send* records),
   not read-side auth.
