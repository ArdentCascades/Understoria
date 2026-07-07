# Privacy Policy

> **Status:** template. The operator running this Understoria node fills
> in the bracketed values, reviews each section against the choices
> they've actually made (hosting provider, log retention, peer list),
> and publishes a copy at `/privacy` or links to it from the PWA's
> footer. Date the document.
>
> **Last reviewed:** YYYY-MM-DD by `[OPERATOR_NAME]`

---

## 1. Why this document exists

Understoria is built for mutual aid networks and labor-organizing
communities. The people using it often face real retaliation from
employers, landlords, and state actors. A privacy policy here is not
a compliance ritual; it is a description of what the software
actually does with your data so you can decide whether to trust it.

If something in this policy turns out to be untrue of the running
node, that is a bug. Tell us — `[OPERATOR_CONTACT]`.

## 2. Who this is between

Understoria has **no central operator**. The software is free, the
protocol is federated, and each community runs its own node. This
policy describes what happens at the node operated by:

- **Operator:** `[OPERATOR_NAME]`
- **Contact:** `[OPERATOR_CONTACT]`
- **Node URL:** `https://[DOMAIN]`
- **Hosting provider:** `[e.g. Linode, in [region]]`

If you joined Understoria through a different node, this policy does
not describe what that node does — ask its operator for theirs.

## 3. What stays on your device only

The Understoria PWA is **local-first**. The following data lives in
your browser's IndexedDB on your device and is never transmitted to
the community node or to any third party:

- Your **display name**, skills, availability, location zone, and
  any profile text you've entered.
- Your **private key**, encrypted under your passphrase. We never
  see it; we cannot recover it. If you lose your passphrase, the
  identity is gone.
  The single exception is the **device-pairing flow you initiate**
  (Profile → Add another device). When you choose to pair a second
  device, the key is wrapped under a fresh one-time passphrase the
  source device generates and displayed as a QR code on this
  device's screen for up to 5 minutes. It is not transmitted to
  the community node or any third party — the destination device
  reads the QR directly. Detail: [`docs/device-pairing.md`](
  ./device-pairing.md). The threat-model entry covering this surface
  is in [`docs/threat-model.md`](./threat-model.md) §7 under "Device
  pairing widens the identity-key surface."
- **Direct messages** with other members. These are end-to-end
  encrypted with NaCl `box` (X25519 + XSalsa20-Poly1305) using
  ephemeral keys derived from your Ed25519 identity. Even the
  node operator cannot read them. They are stored locally; they
  do **not** federate.
- Your **achievements**, settings, onboarding state, theme, and
  preference flags.
- Message search works by **decrypting and scanning on the spot**
  when you type a query — no search index is ever built or
  persisted, in plaintext or otherwise.
- **Member blocks.** A list of members you have chosen to block,
  along with any private notes you've written for your own
  reference, your governance-visibility choice per block, and the
  timestamps. This list never leaves your device, never federates
  to peer nodes, and is excluded from data export. Soft-purge
  clears it. See [`docs/blocking.md`](./blocking.md) and the
  threat-model §7 entry "Member blocking is a local-only
  personal-relief surface" for the values reasoning.

If you uninstall the PWA or clear your browser storage, all of this
is gone. There is no server-side copy.

## 4. What leaves your device

When you take certain actions, the PWA pushes a **signed, immutable
record** to the community node. Each record is a small JSON object
covered by an Ed25519 signature from your private key. The record
types are:

| Action | Record | Visible fields |
|---|---|---|
| Post a NEED or OFFER | `Post` | Your public key, title, description, category, hours estimate, urgency, post time, your location zone |
| Confirm an exchange | `Exchange` | Both members' public keys, hours, category, completion time, signatures |
| Vouch for another member | `Vouch` | Your public key, their public key, timestamp |
| Claim a post | `Claim` | Your public key, the post id, claim time |
| Comment on a task | `TaskComment` | Your public key, project + task ids, the comment body |
| Someone redeems your invite | `RedemptionReceipt` | Signed by the **new member** at redemption: the invite id, inviter and new-member public keys, redemption time. The open invite itself never leaves your device — there is deliberately no invite endpoint on the node |
| Revoke an invite you issued | `InviteRevocation` | Your public key (as inviter), the invite id, revocation time, signature |
| Invite someone to co-organize a project | `CoOrganizerInvitation`, `CoOrganizerInvitationResponse`, `CoOrganizerInvitationRevocation` | Inviter and invitee public keys, project id, decision (accept / decline) or revocation, timestamps |
| Create a community event | `Event` | Title, description, category, location (free text — no GPS pin), start time, optional end time, optional capacity, organizer public key, signature |
| Cancel a community event you organized | `EventCancellation` | Event id, optional reason text, cancellation time, organizer public key, signature |
| Create or update a project | `ProjectState` | The full project row: title, description, category, status, target / contributed hours, deadline, location zone, tags, organizer and co-organizer public keys, timestamps, signer public key, signature. **Mutable:** each edit replaces the previous version on the node (last-writer-wins) |
| Add, claim, work, or edit a project task | `TaskState` | The full task row: title, description, category, hours (estimated and actual), urgency, status, who has claimed it (public key), dependencies, order, timestamps, signer public key, signature. Same last-writer-wins replacement |
| Link a new device (tap-to-link) | Link request + device-link mailbox row | **Neither federates and the node can read neither.** The new device stores one throwaway public key for up to 10 minutes, filed under a salted, deliberately lossy fold of its network address (4096 buckets shared by many households — never the address itself, which is not stored or logged). Your approval stores your identity bundle sealed to that key — ciphertext the node cannot open — for at most 15 minutes, deleted the instant the new device collects it |
| Link a new device (word-code fallback) | Device-link mailbox row | Same mailbox, encrypted under the 6-word code instead (which never crosses any wire). The QR pairing option stores nothing on the node at all |

**Public keys are not human identities by themselves.** A peer node
sees the keys but does not learn your display name unless you've
shared it with someone there separately.

**Projects and their tasks now live on the community node.** Until
project federation shipped (`docs/project-federation.md`), projects
were device-local; now the full project and task rows are visible to
the node and to every member who syncs from it — that is the point
(a helper claiming a task on their phone becomes visible to the
organizer). Unlike every other record above, these two are
**mutable**: a newer signed version from an authorized member
replaces the stored one. What did NOT change: proposals, votes,
disputes, RSVPs, shift signups, drafts, and the event⇄project
work-day link all remain local-only.

**Once a signed record reaches the node, it federates.** The
community node's job is to relay records to peer nodes that pull
from it (see §6). After that point, the operator cannot retract a
record from peers — see §9.

**Co-organizer invitations** introduce three new signed record types
but do not reveal any field the federation didn't already see. The
invitation names an inviter pubkey, an invitee pubkey, a project id,
and a timestamp — the same metadata shape as a signed vouch. The
acceptance or decline is signed by the invitee; the revocation is
signed by the inviter. No display names, no message body, no
free-text reason fields. The values shift this delivers is at the
trust-grant moment (the co-organizer role now requires a deliberate
signed acceptance from the invitee), not at the federation surface.
See [`docs/co-organizer-invitations.md`](./co-organizer-invitations.md)
and the threat-model §7 entry "Co-organizer role requires signed
invitation + signed acceptance" for the values reasoning.

**Community events** introduce two federated, signed record types
(`Event`, `EventCancellation`). The fields each carries are
enumerated in the table above; the location field is **free text,
not a GPS coordinate or structured address**, so the organizer
decides what level of specificity to publish on a public wire.
**Your RSVP to an event stays on the node where you RSVP'd.** It
is NOT a signed record, NOT pushed to the community node's outbox,
and NOT federated to peer nodes. The organizer of the event and
other members on this node who have also RSVP'd "going" or "maybe"
see your name on the local attendee list; non-attendees on this
node see the count only; peer-node viewers see neither names nor
counts. See [`docs/community-events.md`](./community-events.md)
and the threat-model §7 entry "Federated `Event` records widen the
public wire surface" for the values reasoning and the rejected
alternatives (federated RSVPs, public attendee roster, iCal
export — all out of scope or deferred with conditions).

**Member blocks** are NOT in the table above and never will be.
A `Block` row sits alongside `EventRSVP` as a deliberately
local-only personal-relief surface: the row records that you have
chosen to block a specific other member, your governance-visibility
choice for that block, and any private note to yourself. It is
NOT a signed record, NOT pushed to the community node's outbox,
NOT federated to peer nodes, and excluded from data export.
The other member is not notified that you have blocked them. There
is no community-facing surface (member-facing or operator-facing)
that aggregates block counts or exposes "who has blocked whom" in
any shape. See [`docs/blocking.md`](./blocking.md) for the full
values reasoning, and the threat-model §7 entry "Member blocking is
a local-only personal-relief surface" for the adversary mapping
that closes federated block graphs out at the architecture layer.

**Local aggregation views.** The PWA may show the same fields
above in aggregated surfaces — for example, a community calendar
that surfaces project deadlines, post expiry dates, and per-day
exchange counts in a single time view. These aggregations are
built on your device from data your PWA has already received via
federation pull. They do not produce new records, do not introduce
new server endpoints, and do not change what the community node
sees about you. See `docs/calendar.md` and the threat-model entry
"Calendar aggregation as a faster surveillance surface" for the
reasoning and the rejected alternatives (per-member calendar
URLs, iCal subscription feeds — both out of scope).

## 5. What the community node sees

Beyond the signed records you push, the node sees:

- **IP addresses** of incoming requests. The reverse proxy (Caddy)
  logs these in its access log; the application server's request
  log is off by default and does not include request paths or member
  identifiers. Logs are retained for `[N days]` and are not shared
  with third parties.
- **Approximate timing** of your activity — when your client posted,
  pulled, or confirmed. This is the unavoidable consequence of any
  client-server protocol.

The node does **not**:

- Run analytics (no Google Analytics, no Plausible, no anything).
- Set advertising cookies or tracking pixels.
- Embed third-party scripts or fonts.
- Share data with any third party for marketing or analysis.
- Sell, rent, or trade member data. The data model would not survive
  the attempt — see §4.

## 6. Federation: what other communities can see

If `[OPERATOR_NAME]` has federated this node with peers (listed at
`https://[DOMAIN]/api/peers`), then signed records pushed from this
node propagate to those peers. Specifically:

- Peer nodes can read every `Post`, `Exchange`, `Vouch`, `Claim`,
  `TaskComment`, `Event`, and `EventCancellation` that your client
  signed and pushed.
- Peers see public keys, not display names. They learn that "key
  X helped key Y" — not "Alice helped Bob" — unless someone on
  their node has separately associated those keys with names.
- Peers do **not** receive your direct messages, your profile, or
  any data that stayed on your device. In plain language: peers
  do **not** receive your `EventRSVP` rows. RSVPs are local-only
  state — they live in your PWA's Dexie database, never enter the
  outbox, and have no federation route. A peer node viewing an
  event you organized has zero knowledge of who RSVP'd on the
  node where the RSVP happened.

The current peer list is:

`[LIST OF PEER NODE URLS OR "none — this is a solo node"]`

Before adding a peer, the operator commits to: announce the change
in the community channel, give members a chance to object via the
governance process, and only peer with nodes whose privacy practices
they have read.

## 7. Direct messages

Direct messages are encrypted end-to-end on your device with a key
derived from the recipient's Ed25519 identity (via `ed2curve`). The
encrypted ciphertext is stored only on your device and your
correspondent's device. The community node does not relay or store
DMs. If you lose your device or run a hard purge (§9), your DM
history is gone — there is no backup.

## 8. Disputes, moderation, and governance records

When you flag an exchange or a comment, you create a **Proposal**
record visible to the community for deliberation. Proposals live
locally on the node where they're filed; they do not federate at
this time. The Code of Conduct's enforcement contact — `[COC_CONTACT]`
— sees flagged content; please read [`CODE_OF_CONDUCT.md`](
../CODE_OF_CONDUCT.md) before filing.

## 9. Leaving, deletion, and what cannot be unwritten

You can leave Understoria at any time. You have two tools:

- **Soft purge** (Profile → "Panic button" → Soft) strips every
  linkable text field from your local node while preserving the
  signed exchange ledger and your keypairs. The node continues to
  operate. A forensic examiner pulling your device would find the
  signed records but not the human-readable context.
- **Hard purge** (same menu → Hard) wipes every table on your
  device — including your private keys — and rotates to a fresh
  node identity. No local history remains.

If you've **paired** another device (see §3, the device-pairing
exception), hard-purging *this* device does not rotate the
identity on the *other* device — they hold independent copies of
the keypair. To fully rotate, hard-purge every paired device.
There is no remote-wipe path; the community node has no power to
revoke a key it never saw.

**What persists despite a purge:** any signed record you pushed
to the community node before the purge. That record is
cryptographically tied to the public key you used at signing time
and stays in the federated ledger. This is a fundamental design
property — not a bug, not something the operator can fix. If the
existence of a future ledger entry is dangerous for you, the only
real defense is not to sign it.

You may ask the operator to **suppress further republication** of
records that name your key from this node onward. The operator
will honor that request as far as their node is concerned, but
**cannot reach back to peer nodes that already pulled the records**.
We say this plainly because anything else would be a lie.

## 10. Children

Understoria is designed for adults doing mutual aid. The operator
does not knowingly admit members under the age of `[AGE THRESHOLD,
typically 16 or 18 depending on jurisdiction]`. There is no age
gate in the software; admission is a vouch decision.

## 11. Legal process

If `[OPERATOR_NAME]` receives a binding legal order naming this
node, the operator commits to:

- Notify affected members **before** complying, where notification
  is itself legal.
- Resist over-broad requests through counsel before producing data.
- Publish an annual transparency report counting all requests
  received and complied with (zero, ideally; honest, regardless).
- Not voluntarily produce data absent legal compulsion.

The operator cannot decrypt your direct messages. The operator
cannot reach into peer nodes. The operator can produce IP-address
logs and the federated record store.

## 12. Security

The operator commits to:

- Keeping the node software updated within `[N days]` of a security
  release.
- Maintaining the auto-confirm system key (see
  [`auto-confirm-key.md`](./auto-confirm-key.md)) as a secret on
  par with a TLS private key.
- Following the operator-side checklist in
  [`opsec-guide.md`](./opsec-guide.md) and
  [`deploy-linode.md`](./deploy-linode.md).
- Reporting any incident affecting member data within `[N days]`
  of discovery, via `[OPERATOR_CONTACT]` and the in-app
  announcement system.

Members are responsible for their own device security; the opsec
guide covers what we ask of you.

## 13. Changes to this policy

Material changes — new data flow, new peer, new logging — require
a 14-day notice period announced in-app and through the community
channel before they take effect. Editorial changes (typos,
clarifications that do not alter behaviour) take effect immediately
and are tracked in the document's git history.

The change history of this document is the **git log** of this
file in the repository at `[REPO URL]`.

## 14. Contact

- Privacy questions: `[OPERATOR_CONTACT]`
- Code-of-Conduct enforcement: `[COC_CONTACT]`
- Software security disclosure: `[SECURITY_CONTACT]` — see
  [`SECURITY.md`](../SECURITY.md) for the coordinated disclosure
  process.
