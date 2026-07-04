# Understoria — Invite Revocation Propagation (design note)

> **Status:** design note, decision pending (one operator ruling in
> §9). Extends [`invite-redemption.md`](./invite-redemption.md) — read
> its §6 (the `RedemptionReceipt` and its merge rules) and §16.1 (this
> note is the "future note if pilots hit the race" it anticipates)
> first. Mirrors the federation shape of the co-organizer invitation
> revocation (`CoOrganizerInvitationRevocation` in
> `@understoria/shared`) and the receipt-cursor discipline of the
> redemptions store. Pairs with the round-2 review finding "invite
> revocation never federates → per-device trust divergence."

---

## §1 The problem

`revokeInvite` (`apps/web/src/db/invites.ts`) writes only the local
Dexie row: it flips the inviter's own copy to `status: "revoked"` and
stops. Nothing signs the revocation and nothing enqueues it. So a
revocation is invisible to every other device.

That is fine as long as the token is never used. It is not fine when
the token is redeemed anyway — the exact race
[`invite-redemption.md`](./invite-redemption.md) §6 named and left
open:

1. Inviter issues token `T`, then revokes it (local only).
2. A token-holder redeems `T` before the revocation matters (it never
   left the inviter's device, so nothing could stop it, and nothing
   is trying to — redemption is a fact, not a permission check).
3. The signed `RedemptionReceipt` federates normally. Every **other**
   member's device takes the receipt's `no local row` merge branch and
   inserts the invite as `status: "redeemed"` — which
   `vouchersFor` / `trustStatusWithInvites`
   (`apps/web/src/lib/vouch.ts`) count as the inviter's implicit first
   vouch. The new member shows `pending_trust` (1 vouch) everywhere.
4. Only the inviter's device still shows `revoked`.

The newcomer's trust state therefore **differs per device**,
permanently, contradicting the receipt design's own "commutative,
every receipt self-contained, arrival order never matters" contract.
The inviter has said "I don't stand behind this admission" and every
device except theirs silently disagrees.

## §2 The constraint that shapes everything: revocation is not ejection

This is settled ethos, not a fresh choice
([`invite-redemption.md`](./invite-redemption.md) §6 row 3, §12,
§16.1; `GOVERNANCE.md` community-authority): a redemption that
happened **happened**. Revocation must never silently eject a member,
delete their account, or reverse credit they have already earned. A
member admitted through a later-revoked invite keeps their identity,
balance, and history. What revocation legitimately does is:

- record, on **every** device, that the inviter withdrew the
  admission — so the roster shows one honest "redeemed despite
  revocation" state instead of two contradictory ones; and
- (operator ruling, §9) withdraw the inviter's **implicit vouch** —
  because a vouch the voucher has explicitly retracted should not keep
  counting — **without** touching the member's standing otherwise.

Everything below is built to do exactly that much and no more.
Anything stronger (auto-ejection, credit reversal) is out of scope by
principle, not by phase.

## §3 The record: a signed `InviteRevocation`

One new signed record type, following the
`CoOrganizerInvitationRevocation` shape (single signer, names one
subject, carries its own timestamp) — **not** the rejected
"register every open invite" alternative
([`invite-redemption.md`](./invite-redemption.md) §10.1). A revocation
names one token, and only ever after the inviter has chosen to kill
it, so it leaks nothing about unused invites.

```ts
// packages/shared/src/types.ts
export interface InviteRevocationPayload {
  token: string;      // the invite being revoked (dedup / identity key)
  inviterKey: string; // the original inviter's Ed25519 public key
  revokedAt: number;  // epoch ms, inviter's device clock
  nodeId: string;     // the invite's node (mirrors the receipt)
}

export interface InviteRevocation extends InviteRevocationPayload {
  signature: string;  // Ed25519 by inviterKey over
                      // canonicalInviteRevocationPayload(payload)
}
```

Identity/dedup key: `token` (one revocation per token, like one
redemption per token). `canonicalInviteRevocationPayload` follows the
existing canonical-JSON discipline.

### §3.1 Verification — and the authority binding

`verifyInviteRevocation(rec)` checks the outer signature against
`rec.inviterKey`. That proves the holder of `inviterKey`'s secret
asked to revoke token `T` while claiming to be its inviter. It does
**not**, by itself, prove `inviterKey` actually issued `T` — invites
are not registered server-side (that was the rejected §10.1
alternative).

The authority binding comes from the merge, not the signature: a
revocation only *does* anything when its `(token, inviterKey)` matches
a `RedemptionReceipt` whose **embedded, inviter-signed invite** has
the same `token` and `inviterKey`. The receipt already carries
`verifyInvite(receipt.invite)` — the inviter's own signature over the
real token↔inviter binding. So:

- A revocation whose `inviterKey` matches the redeemed invite's
  `inviterKey` is authoritative (only the real inviter holds that
  secret).
- A revocation for a token that some **other** key claims to have
  issued can never match a genuine receipt's embedded invite, so it is
  inert — it can never revoke someone else's invite.

This is the same "authority proven by matching an independently-signed
record" pattern the receipt uses for redemption, applied in reverse.

## §4 Wire protocol

Mirrors the redemption receipt leg
([`invite-redemption.md`](./invite-redemption.md) §7) exactly, so
there is no new transport shape to reason about.

- **Push.** `revokeInvite` signs an `InviteRevocation` and enqueues it
  in the same transaction that flips the local row (new outbox kind
  `invite_revocation`; `submitInviteRevocationToNode` in
  `nodeSubmit.ts`). Like the receipt, it is enqueued even before a
  community-node URL is configured and delivers once one is — a fresh
  inviter's device must not lose the revocation.
- **Server.** `POST /invite-revocations` — 201 on first store, 200
  idempotent on replay, 400 malformed, 422 bad signature. A new
  `invite_revocations` store keyed by `token`, with a server-assigned
  `received_at` as the pull cursor (the same §7 deviation the
  redemptions store makes, for the same reason: a skewed client
  `revokedAt` must never strand a revocation below the cursor). GET
  `/invite-revocations?since=<receivedAt>` with the now-standard
  inclusive `>=` + `token` tiebreak.
- **Pull.** `pullFederatedInviteRevocations()` in `federationSync.ts`,
  and the server-side `pullInviteRevocationsFromPeer` sibling — both
  verify with `verifyInviteRevocation` and apply §5's merge.

## §5 Merge rules (commutative, arrival-order-independent)

The whole design is commutative because the terminal state for a
token is a pure function of **which records exist** for it, never of
their arrival order or a timestamp comparison. For a given `token`,
let `R` = "a verified redemption receipt exists" and `V` = "a verified,
authority-bound revocation exists" (§3.1):

| Records present | Terminal state | Trust effect |
|---|---|---|
| `R` only | `redeemed` | inviter's implicit vouch counts (unchanged) |
| `V` only | `revoked` | n/a — no member was admitted |
| `R` **and** `V` (authority-bound) | `redeemed_despite_revocation` | implicit vouch **withdrawn** (§9 ruling); member otherwise untouched |
| `V` present, `R` absent, `V` not yet authority-bound | hold `V`; apply when its `R` arrives | none until `R` arrives |

Because the state reads off set membership, the two federation legs
(receipts and revocations) can arrive in any order on any device and
every device lands on the same terminal state — the property the
per-device divergence violated. A revocation that arrives before its
receipt simply waits; a receipt that arrives before its revocation is
retroactively re-labeled when the revocation lands. No record is ever
mutated in place; the label is derived.

### §5.1 Local `InviteRow` changes

The `InviteRow.status` union gains `"redeemed_despite_revocation"`.
The §6 receipt merge and this note's revocation merge both resolve to
it when both records are present. The Invites page and the roster
render it as "redeemed — you had revoked this invite" (a neutral,
informational surface, per §2), never as a control that ejects anyone.

## §6 Trust computation

`vouchersFor` / `trustStatusWithInvites` already treat a redeemed
invite row as the inviter's implicit invite-kind vouch, deduped
against a later manual vouch from the same voucher. The only change is
that a row in the `redeemed_despite_revocation` state does **not**
contribute that implicit edge (per the §9 ruling). Concretely: a
member admitted via a revoked invite shows `0` invite-vouches and
reaches `pending_trust` / `trusted` exactly as if they had joined with
no inviter edge — one manual vouch from anyone brings them in. They
are never dropped below where an un-vouched-for member sits; they are
simply not carried by a vouch the inviter took back.

This is a pure filter on an existing computation; no synthetic vouch
is minted or destroyed, consistent with §6's "the receipt is not a
`SignedVouch`" reasoning.

## §7 Threat analysis

- **Revoking someone else's invite.** Prevented by §3.1: a revocation
  is authoritative only when its `inviterKey` matches the redeemed
  invite's embedded, inviter-signed `inviterKey`. A third party cannot
  produce that match.
- **Revocation replay / forgery.** The record is signed; replay is
  idempotent (dedup by `token`); a forged signature fails
  `verifyInviteRevocation`. Same posture as every other signed record.
- **Revocation as a weapon.** The worst an inviter can do to a member
  they admitted is move them to `redeemed_despite_revocation` and
  withdraw the one implicit vouch — never eject, never reverse credit
  (§2). The member needs one ordinary vouch to be fully trusted again;
  the withdrawal is visible and is a community-accountability signal,
  not an enforcement action.
- **Backdated `revokedAt`.** The merge does not compare `revokedAt`
  against `redeemedAt` — presence, not ordering, decides the state —
  so backdating buys nothing. (`revokedAt` is retained only for
  display: "revoked on …".)
- **Unauthenticated `GET /invite-revocations`.** Same posture as every
  sibling GET; read-side auth lands for all of them together with
  `docs/federated-node-allowlist.md`.
- **Purge.** The `invite_revocations` store gets the same soft/hard
  purge hooks as the redemptions store; the local `invites` table is
  already cleared by both purges (round-2 fix).

## §8 What this does not do / alternatives weighed

- **Register open invites so the server can refuse a revoked
  redemption** ([`invite-redemption.md`](./invite-redemption.md)
  §10.1, rejected): serving open-invite state hands out live
  credentials and re-introduces a surveillance surface. Rejected there,
  rejected here. Revocation names a token only *after* the inviter
  killed it.
- **Make revocation prevent redemption (server refuses the receipt).**
  Would require the server to know the invite→revocation mapping before
  redemption — i.e., invite registration again — and would turn
  revocation into a hard gate, contradicting §2. The convergent-state
  model achieves honest rosters without a gate.
- **Auto-eject on revocation.** Out of scope by principle (§2), not by
  phase. Membership departure is its own design
  ([`invite-redemption.md`](./invite-redemption.md) §16.3), and it is
  member-initiated or governance-mediated, never an inviter's
  unilateral lever.

## §9 Operator ruling (one, with a recommended default)

**Does a revocation withdraw the inviter's implicit vouch?**

- **Recommended default: yes.** A vouch is a standing statement of
  trust; when the voucher explicitly retracts it, continuing to count
  it misrepresents the community's trust graph. The member is not
  ejected and loses no credit — they simply need one ordinary vouch,
  the same as anyone who arrived without an inviter edge. This keeps
  `redeemed_despite_revocation` meaningful (it changes trust, gently)
  while honoring "not ejection."
- **Alternative: no.** The implicit vouch stands because the token was
  validly issued and validly redeemed, and revocation is purely
  informational. Simpler, but it makes revocation a display-only event
  with no effect on the one thing it is about — whether the inviter
  vouches for this person — which reads as hollow.

This is a governance policy choice (does an inviter get a standing,
unilateral lever over a newcomer's trust edge?) and should be ratified
through `GOVERNANCE.md` modified-consensus before the trust-withdrawal
half ships. The federation/convergence half (§3–§5, §7) has no such
tension and can land first; until the ruling, the implicit vouch
behaves as today (counts) and the only visible change is the honest
`redeemed_despite_revocation` label converging across devices.

## §10 Phased rollout

1. **Record + convergence** (no trust change): the `InviteRevocation`
   type, canonical payload, verifier; the outbox kind, server route +
   store, both pullers; the merge to `redeemed_despite_revocation`.
   This alone fixes the per-device divergence — every device shows the
   same honest state. Ships behind no ruling.
2. **Trust withdrawal** (§9 ruling): the `vouchersFor` filter that
   drops the implicit vouch for `redeemed_despite_revocation`. Ships
   after modified-consensus ratification.

## §11 Threat-model / roadmap hooks

- Add a `docs/threat-model.md` §7 entry pairing with the redemption
  receipt entry: "Invite revocation propagation — signed, authority-
  bound, non-ejecting."
- The roadmap deferred-items table row "invite-revocation federation"
  (filed at the round-2 review) points here.

## §12 Open questions

1. **Un-redeemed revocations serve no other device.** A revocation for
   a token that is never redeemed is inert everywhere but the
   inviter's own device (which already flips locally). Federating it is
   harmless but arguably pointless; the alternative — enqueue a
   revocation only once a receipt for the token is known — trades a few
   dead rows for a cross-record dependency that breaks the "each record
   self-contained" property. Recommend federating unconditionally
   (simpler, convergent) and letting the dead rows purge with the
   store.
2. **Cross-node membership** re-opens the same replay question as the
   receipts ([`invite-redemption.md`](./invite-redemption.md) §16.2);
   bind revocations to `invite.nodeId` at the same time receipts are.
