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

The resolver caches the closure and rebuilds when the redemptions
table grows, so a fresh member is recognized on their first read
after their receipt lands (the receipt is pushed by the outbox even
before node config is confirmed — the one enqueue that doesn't
require a configured URL — precisely so proof-of-joining precedes
everything else).

Known bound, stated plainly: membership is append-only. The app has
no member-expulsion record kind, so read access, once earned, is not
revocable by this mechanism. Blocking remains a per-member relief
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

- `READ_AUTH=off` (default): feeds behave exactly as before. The PWA
  ALWAYS sends the headers when it has an unlocked identity — they're
  harmless when off, and it means every member's app is ready before
  any operator flips.
- `READ_AUTH=on`: GET feeds require a valid member signature. Boot
  fails loudly if no `NODE_FOUNDER_KEYS` are set (an "on" node nobody
  can read is a misconfiguration, not a security posture).

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
- No member expulsion / read revocation (no such record kind exists
  app-wide; design plan: `docs/member-removal.md`).
- No authentication on POSTs beyond the signatures records already
  carry — writes were never the gap; insert caps bound abuse.
- No per-record read ACLs. The community reads as one audience;
  finer tiers remain a UI concern (roster visibility tiers etc.).
