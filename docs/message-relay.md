# Message relay — how a direct message actually reaches the other person

## 1. Status

**Adopted and implemented** (this PR). Written after a pilot report —
"messages aren't going through" — exposed that direct messages had
**no delivery mechanism at all**: `sendMessage` encrypted the text and
wrote it to the sender's own IndexedDB, and that was the end of the
line. No outbox kind, no server table, no route, no federation pull.
The dev environment masked the gap completely, because every demo
member lives in one shared browser database — "delivery" was just
reading the same table back.

The docs contradicted each other about it, which is how the gap
survived multiple audits: the in-app FAQ and the member guide promised
"the community node passes them along but can't see inside," while the
threat model recorded "no server relay, no federation" as the design.
This document replaces both stories with one true one.

## 2. The design in one paragraph

The community node becomes a **relay shelf for sealed envelopes**. A
message is still encrypted end-to-end on the sender's device (NaCl
box, exactly as before — the crypto is unchanged); what's new is that
the ciphertext record, signed by the sender's identity key, rides the
existing outbox to `POST /messages`, waits on the node, and is fetched
by the recipient's device via the existing federation pull loop —
scoped so that **a device can only ever fetch its own member's
inbox**. The node can verify who is writing to whom and when; it can
never read what, and it never learns which post a thread is about
(that reference rides inside the ciphertext — `lib/messageEnvelope.ts`).

## 3. The wire record

```
RelayedMessage {
  id           uuid — same id as the local DirectMessage row
  senderKey    base64 Ed25519 public key
  recipientKey base64 Ed25519 public key
  nonce        base64, 24 bytes (NaCl box nonce)
  ciphertext   base64 NaCl box output (E2E sealed)
  createdAt    ms epoch, sender's clock
  signature    Ed25519 over canonicalRelayedMessagePayload(...)
}
```

- `canonicalRelayedMessagePayload` follows the same field-order
  discipline as every other canonical helper in
  `packages/shared/src/crypto.ts`: a stable `JSON.stringify` of
  `{id, senderKey, recipientKey, nonce, ciphertext, createdAt}`.
- The **sender signs the envelope** so the node can refuse spoofed
  senders at ingestion (422), and so the recipient's device can
  re-verify independently — the response body is untrusted, same
  posture as every other pull.
- `conversationId` deliberately does NOT travel: it's deterministic
  from the two keys, so the recipient's device recomputes it on merge.
  Nothing on the wire that can be derived is sent.

## 4. Server surface

### 4.1 `POST /messages`

Standard federated-write shape (`routes/messages.ts`):

- `parseRelayedMessage` (validate.ts): field presence/types, base64
  shape, `senderKey !== recipientKey`, `createdAt` a positive integer
  no more than 24 h in the future (the standard clock-skew bound),
  ciphertext capped at 16 384 base64 chars (the composer caps
  plaintext at 5 000 chars; the cap leaves room for the envelope JSON
  and base64 expansion while keeping a lid on abuse).
- `verifyRelayedMessage` — 422 on signature mismatch.
- Idempotent on `id` (200 duplicate / 201 stored).
- **Membership gate, matching the node's read-auth posture**: when
  `READ_AUTH=on`, the sender must be a member per the membership
  resolver (403 `not_a_member` otherwise). When read auth is off the
  gate is off too — a node with no founder keys configured must not
  lose messaging. Two guards apply regardless: the removed-author
  guard (`/messages` joins the `SURFACES` map with
  `keyField: "senderKey"`) and the per-key insert caps (disk-fill
  backstop).

### 4.2 `GET /messages` — the inbox pull

This is the one place the relay differs from every other feed, and
the difference is the point:

- **Recipient proof is required UNCONDITIONALLY**, independent of the
  node's `READ_AUTH` setting. The route itself verifies the
  `x-understoria-key/-ts/-sig` header trio (the same
  `canonicalReadAuthMessage(path+query, ts)` scheme, same ±10 min
  replay bound) and then serves **only rows where
  `recipient_key = the proven key`**. Every other feed is
  community-public data guarded at the door; this feed is personal
  correspondence metadata, so the scoping lives in the query itself.
  With read auth ON, the global guard additionally requires the
  proven key to be a member — the headers are already there.
- **Peer bearer tokens are refused** on this route. Messages never
  peer-federate and never mirror-replicate (§7).
- Composite `(createdAt, id)` pair cursor, same
  `docs/composite-federation-cursors.md` §2 contract as every feed.

### 4.3 Retention — the shelf, not an archive

Envelopes are held for `MESSAGE_RETENTION_DAYS` (default **30**,
env-configurable) and pruned opportunistically on writes. Why a
window and not delete-on-delivery: a member may have **linked
devices**, each pulling with its own cursor — deleting at first fetch
would starve the second device. Thirty days also covers the "phone
in a drawer for three weeks" case. After the window, an unfetched
message is gone from the node — the sender still holds their local
copy, and the thread simply shows what each side has. This matches
the storage-budget posture everywhere else: the node is a shelf, not
an archive.

## 5. Client flow

- **Send** (`db/messages.ts`): unchanged local write, then sign the
  envelope and enqueue outbox kind `"message"` — same dedup/retry/
  backoff semantics as every kind, delivered by
  `submitMessageToNode` → `POST /messages`, kicked immediately so a
  connected device delivers within a second. Soft-degrade: no node
  configured → the enqueue no-ops exactly like other kinds; the send
  still succeeds locally (and note honestly: it will not arrive —
  same posture as posts).
- **Receive** (`pullFederatedMessages` in `lib/federationSync.ts`):
  rides the existing 3-minute pull loop and the first-sync paths
  (device link, recovery). `authorizedFetch` already signs reads with
  the current member's key — that signature IS the recipient proof.
  Each row is dropped unless it verifies (`verifyRelayedMessage`),
  is addressed to the current member, and carries a plausible cursor
  stamp (the standard cursor-poisoning defense). Merge = `put` into
  `db.messages` with the recomputed `conversationId`; the Messages UI
  needs zero changes.
- **Cursor is namespaced per member as well as per node** — the one
  feed whose contents depend on who is asking. Without this, a
  device that switches members (dev; a shared household tablet)
  would skip messages for the second member.
- **Blocks stay client-side and silent** (`docs/blocking.md` §6): the
  node knows nothing about blocks. On pull, envelopes from a blocked
  sender are dropped on the recipient's device — cursor still
  advances; the block is prospective, not a queue.

## 6. What the node can and cannot see

Honest ledger (this supersedes the threat model's old "no relay"
entry):

| The node sees | The node can never see |
| --- | --- |
| who messaged whom (key pairs) | message contents |
| when, and how often | which post a thread is about |
| envelope sizes | read state (there is none, anywhere) |

Routing metadata is inherent to ANY store-and-forward relay —
including Signal's. The mitigations are: retention window (§4.3)
bounds how much history a seized node yields; minimal logging policy
(threat-model §6) keeps it out of logs; contents and post references
stay sealed; and the recipient-scoped GET means one member's proof
never fetches another member's correspondence records, so the
metadata is visible to the node operator's disk, not to other
members. Members who need to avoid even the routing metadata keep
the documented out: coordinate in person (the FAQ already points
there for high-sensitivity coordination).

## 7. Non-goals, stated so they stay decisions

- **No peer-node federation.** Messaging is same-node by design
  (both parties configured the same community node).
- **No mirror replication.** Mirrors replicate community-public
  records; personal correspondence envelopes don't belong on more
  disks than necessary. Cost, accepted: if the primary node dies
  before the recipient pulls, undelivered envelopes die with it.
- **No delivery receipts.** The sender's outbox row flipping to
  `delivered` means "the node took it," not "they read it." No
  read state exists anywhere, on purpose.
- **No server-side search/index** — rows are opaque ciphertext.
- **No sender-side multi-device backfill.** Sent messages remain on
  the device that wrote them (member guide §16 already says history
  is per-device). The relay carries a message to the RECIPIENT's
  devices, not to the sender's other devices.

## 8. Test plan (implemented alongside)

- Server: POST accept/duplicate/malformed/bad-signature/self-send;
  future `createdAt` refused; membership gate honored when read auth
  on; GET refused without headers, with stale ts, with a bad
  signature, and with a peer bearer token; GET returns only the
  proven key's inbox; pair-cursor paging; retention prune.
- Web: send enqueues a verifiable envelope; flush posts to
  `/messages`; pull merges a valid envelope into the right
  conversation, drops bad signatures and misaddressed rows without
  advancing past... (rows failing verification never advance the
  cursor), drops blocked senders while advancing, dedups by id, and
  namespaces the cursor per member.
