# Member-authenticated reads, at-rest encryption, and operator powers

Status: **shipped** (all three pieces in one PR). This note is the
detailed plan the implementation followed, kept as the design record.

## 0. The problem, in the operator-power frame

Three related findings from the reader-power review:

1. **Anyone with the URL could read the community.** Every federation
   GET feed (`/posts`, `/exchanges`, `/event-rsvps`, …) was
   unauthenticated. Joining the community is invite-gated; *reading*
   it was not. That gave a non-member — an abusive ex, an employer, a
   scraper — the same view members earn by being invited.
2. **The threat model claimed at-rest encryption that didn't exist.**
   §6 lists "client-side encrypted storage via SQLCipher on nodes" as
   a core mitigation, but the server used plain `better-sqlite3`; a
   seized disk was readable.
3. **The operator's residual powers were undocumented.** Signatures
   already stop an operator from forging records, but metadata
   visibility, record-withholding, and service denial are real and
   were named nowhere an operator's community could read.

Explicitly rejected in the same review: encrypting community records
under a shared community key. Every member (operator included) holds
the key, so it removes no insider's bird's-eye view; it only protects
against a NON-member host, at the cost of key rotation on every
departure and a rewrite of the federation layer. The design stands on
a structural fact: in a local-first app every member's device
replicates the full community dataset, so "no one can see everything"
is not achievable by cryptography — the honest levers are read
gating (who counts as "in"), at-rest encryption (what a seized disk
yields), UI aggregation refusal (already shipped: no leaderboards, no
attendance surfaces), and social structure (documented in
`docs/operator-powers.md`).

## 1. Member-authenticated reads

### Who is a member (the resolver)

The node derives membership from artifacts it already stores and
verifies — no new registration surface, no member table to subpoena
beyond what the records already imply:

- **Founder keys** (`NODE_FOUNDER_KEYS`, comma-separated base64
  Ed25519 public keys) are the trust roots, configured at deploy.
  Every community has at least one member who joined without an
  invite; the operator names them.
- **The redemption-receipt chain** extends membership: a verified
  `RedemptionReceipt` proves `invite.inviterKey` invited
  `redeemedBy`. The member set is the transitive closure from the
  founder keys over stored receipts (inviter must already be a
  member for the receipt to add its redeemer — a pair of made-up
  keys vouching for each other reaches nothing).

The resolver caches the closure and rebuilds when the redemptions,
removals, or reinstatements tables grow, so a fresh member is
recognized on their first read after their receipt lands (the
receipt is pushed by the outbox even before node config is confirmed
— one of the two enqueues that don't require a configured URL,
invite revocations being the other — precisely so proof-of-joining
precedes everything else).

The former "membership is append-only" bound is CLOSED
(`docs/member-removal.md` M1). The closure definition gained a
subtraction and a chain rule:

    member = ( founders
             ∪ closure over receipts whose inviter was NOT removed
               at redeemedAt )
             ∖ keys currently removed by quorum record

A quorum-signed `MemberRemoval` ends read standing and write access
(403 `author_removed` on POSTs); `MemberReinstatement` reopens both;
standing at time T is the latest record with `decidedAt ≤ T` (ties
reinstate). Removal is non-retroactive and never cascades: a removed
member's pre-removal invitees remain members; their unredeemed
invites die with the removal. Blocking remains a per-member relief
surface, not a community membership verdict.

### The wire protocol

Reads carry three headers, produced by `lib/authorizedRead.ts` in the
PWA and verified by `readAuth.ts` on the node:

```
x-understoria-key:  <member's base64 Ed25519 public key>
x-understoria-ts:   <epoch ms>
x-understoria-sig:  sign("read|" + <path+query> + "|" + <ts>)
```

The canonical message builder (`canonicalReadAuthMessage`) lives in
`@understoria/shared/crypto` so both sides sign/verify identical
bytes. The timestamp must be within ±10 minutes of the node's clock —
a replay bound, not a nonce scheme: reads are idempotent, so
replaying one buys an attacker a copy of a response the key holder
could fetch anyway; the bound just expires captured headers.

### Rollout (`READ_AUTH`)

- `READ_AUTH=on` (**default**): GET feeds require a valid member
  signature, and the write half below applies. Booting with no
  founder configured is not an error — it is a fresh **unclaimed**
  node (next section), which refuses every gated surface and prints
  a one-time setup code for the founding member.
- `READ_AUTH=off`: the explicit dev/demo opt-out — feeds and writes
  behave as the pre-flip default did. The PWA ALWAYS sends the read
  headers when it has an unlocked identity, so no app-side step ever
  gates turning enforcement (back) on.

The default was `off` through the staged-rollout era and flipped to
`on` once every shipped app build signed its reads — a breaking
change for deployments whose env never set `READ_AUTH` (they gain
enforcement on upgrade; set `READ_AUTH=off` to keep the old posture,
or claim the node / set founder keys to adopt the new one).

### Claiming a fresh node (the setup code)

Enforcement needs a trust root, but the founder's key does not exist
until the founder has minted an identity in the app — the old flow
resolved this by having the operator copy their public key into
`NODE_FOUNDER_KEYS` and restart. The claim flow replaces that with
the first-run pattern self-hosted software already uses:

1. A node that boots with NO trust root (no `NODE_FOUNDER_KEYS`, no
   previously claimed founder) is **unclaimed**: every gated surface
   answers 401/403, `GET /config` reports `claimed: false`, and the
   boot log prints a one-time **setup code** (override it with
   `SETUP_TOKEN`; a restart mints a fresh random one).
2. The founding member creates their identity in the app, connects
   the node (Profile → Community node), and opens **Founder setup**
   — the card appears when the connected node reports itself
   unclaimed. They enter the setup code; the app signs
   `canonicalFounderClaimMessage(publicKey, code, ts)` and POSTs it
   to `/claim-founder`.
3. The server verifies the code (timing-safe), the timestamp window
   (same ±10 min bound as reads), and the signature — so an observer
   of the claim request cannot re-target it at a different key —
   then stores the key in `claimed_founders`. The membership
   resolver unions claimed founders with `NODE_FOUNDER_KEYS`, so
   the node is fully live immediately, no restart.

The claim is **one-shot**: it answers `409 already_claimed` the
moment any trust root exists, and everything after the first founder
uses the ordinary machinery — invites for members, quorum removal to
retire anyone (claimed founders included), `NODE_FOUNDER_KEYS` for
additional roots or recovery. `/claim-founder` is open by
construction, like `/redemptions`: it is the step that makes
membership exist. The unclaimed window between boot and claim is
strictly safer than the old open default — an unclaimed node refuses
reads AND writes, so there is nothing to scrape and no way to
pre-seed junk; the setup code only decides who gets to be founder,
and it lives in the operator's terminal.

Mirrors: a mirror of a claimed community should set
`NODE_FOUNDER_KEYS` to the founder's key (ask the founder — it's
public, shown on their Profile) rather than being claimed
separately; the resolver's trust roots MUST match across a mirror
set, like `NODE_ID`.

Exempt surfaces (open by design, each self-limiting):
`/health` (liveness; the origin-suggest probe), `GET /config`
(operator transparency + system-key discovery — needed BEFORE
membership is provable), the device-link mailbox and tap-to-link
rendezvous (`/device-link*`, `/link-request*` — a brand-new device
has no identity yet; those surfaces authenticate by unguessable
ids/ciphertext and carry their own TTLs+caps), and CORS preflights.

Locked devices: signing needs the unlocked identity, so a
passphrase-locked session sends no headers and, under enforcement,
pulls silently no-op (the existing `!res.ok → null` path) until the
member unlocks — then the periodic re-pull catches up. Named in the
operator runbook so "my app stopped syncing" has a findable answer.

### The write half (same switch)

Joining is invite-gated and, with `READ_AUTH=on`, reading is
member-gated — but until the write gate, WRITING was not: every
attributable federation POST (`/posts`, `/vouches`, `/exchanges`,
`/events`, `/claims`, `/task-comments`, …) accepted any well-formed
record self-signed by a key the sender generated for free. A
signature proves key possession, not membership; insert caps bound
the *volume* of abuse, not its existence — a stranger could still
seed a community's board with valid-looking posts and vouches that
would federate like anything else.

`registerMemberWriteGuard` (readAuth.ts) closes this with the same
resolver, over the same insert-cap `SURFACES` attribution the
removed-author guard already uses: when `READ_AUTH=on`, the
surface's attributed signing key must resolve as a member or the
POST is refused `403 not_a_member` — the identical posture the
governance routes and the `/messages` sender gate pioneered, now
uniform across every attributable surface. One switch, not two:
enabling read enforcement enables write enforcement, and the boot
guard that requires `NODE_FOUNDER_KEYS` covers both (the gate never
runs against an empty member universe).

Exemptions, each carrying its own authority:

- **`POST /redemptions`** — the joining ceremony itself. The
  redeemer is by definition not yet a member; the route's verified
  invite chain (inviter signature → receipt signature) IS the
  authority. Gating it would weld the front door shut.
- **Mirror-internal replication** (per-boot token) — re-POSTs of
  HISTORICAL records; membership standing is judged where a record
  first enters the community, not re-litigated per replica hop.
- **Key-field-null surfaces** (`/member-removals`,
  `/member-reinstatements`, `/auto-confirm`) — multi-signed or
  system-signed; their authority rules live in-route.

Coverage note (same as the removed-author guard): the gate checks
the SIGNING author each surface validates — `/exchanges` gates
`helperKey`; a record naming a non-member counterparty still lands,
because the ledger records what happened.

Ordering edge, named for the runbook: a freshly-redeemed member's
first records 403 until their redemption receipt lands at the node.
The client enqueues the receipt at redemption time, before anything
they could author, and the outbox flushes in `nextAttemptAt` order —
so the receipt ships ahead of their first records and this is a
non-event in practice. A member who somehow authored records before
their receipt arrived would see those rows poisoned (403 is
non-retryable), same as the governance surfaces since G1.

### Peer nodes (`PEER_READ_TOKENS`)

Cross-node `peerPull` is server-to-server; peers aren't members.
Peering already requires operator coordination (`PEER_NODE_URLS`), so
each peering pair exchanges a shared token out of band:
`PEER_READ_TOKENS` is a JSON map `{ "<peer base url>": "<token>" }`.
Outgoing pulls to a mapped URL send `authorization: Bearer <token>`;
inbound reads presenting any mapped token are accepted as peer reads.
An enforcement-on node with no tokens configured simply stops serving
peers — named in the operator guide.

## 2. Encryption at rest (`DATABASE_KEY`)

The server's SQLite driver is now `better-sqlite3-multiple-ciphers`
(API-compatible fork bundling SQLite3MultipleCiphers, SQLCipher
scheme). When `DATABASE_KEY` is set, `openDatabase` applies
`PRAGMA key` before migrations; the database file is then unreadable
without the key (verified: reopen-without-key fails `SQLITE_NOTADB`;
the raw file contains no plaintext). Unset keeps the previous
plaintext behavior — existing deployments don't break on upgrade.

Honest bounds:
- The key sits in the server's environment; an attacker with LIVE
  root access reads it. This protects the powered-off disk, the
  stolen backup file, the decommissioned SD card — the §3 seizure
  row, not the live-compromise row.
- Existing plaintext databases are not converted automatically;
  the operator runbook gives the one-time export/rekey procedure.
- Backups made by copying the file stay encrypted (good); the key
  must be escrowed separately or the backup is a brick (also good,
  and named).

This turns the threat model §6 SQLCipher line from aspiration into
fact; the line now points here.

## 3. Operator powers (`docs/operator-powers.md`)

A plain-language governance document enumerating what a node
operator can and cannot do — forgery impossible (signatures),
reading community data (yes, like any member; plus metadata),
withholding records, denying service, and the founder-key lever this
PR adds — with the social remedies (operator pairs/rotation, members
comparing notes, the export-and-move path). Written for members, not
engineers; linked from the operator guide and privacy policy.

## 4. What this deliberately does not do

- No community-key encryption of stored records (rejected above;
  revisit only if hosting is ever delegated to a non-member).
- ~~No member expulsion / read revocation~~ — shipped since
  (`docs/member-removal.md` M1); the closure section above carries
  the amended definition.
- ~~No authentication on POSTs beyond the signatures records already
  carry~~ — this claim did not survive review: a stranger's
  well-formed self-signed records landed and federated. Shipped
  since as the write half of `READ_AUTH=on` (§1, "The write half");
  insert caps remain the volume bound beneath it.
- No per-record read ACLs. The community reads as one audience;
  finer tiers remain a UI concern (roster visibility tiers etc.).
