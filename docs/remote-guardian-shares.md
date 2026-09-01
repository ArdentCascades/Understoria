# Remote guardian shares — design note (V5 #475, half B)

Status: **PROPOSAL — awaiting community/owner decision.** The issue
rules: "write the design note against `docs/threat-model.md` §7
before any code." This is that note. Nothing here is built; the only
code change shipped alongside it is correcting two stale comments
(below).

## 1. The stale premise this note starts from

The in-person-only shard ceremony was designed under a premise the
codebase has since outgrown. `lib/guardianShards.ts` said the DM
layer "has no transport (messages are written locally and
deliberately never relayed or federated)"; `identity-recovery.md`
repeated it. Both were true when written — and the message relay
then shipped (`docs/message-relay.md`): store-and-forward through
the community node, sender-signed sealed envelopes, recipient-proved
reads, 30-day retention. The threat model itself records the
correction (§7, the relay entry's parenthetical). The QR-only
ceremony now rests on a premise that no longer holds, so the
question the original plan deferred is live again: should shard
DISTRIBUTION ride the relay?

## 2. Proposal: remote-deliver the OFFER leg only

Split the ceremony's two legs and treat them differently:

- **Offer leg (owner → guardian), REMOTE**: a new v4 envelope kind
  (`kind: "guardian_share"`, the v3 voice-note pattern in
  `messageEnvelope.ts`) carrying the same `GuardianShardOffer` the
  QR carries today — a Shamir share of the owner's secret key,
  ~90 bytes, already NaCl-boxed to the guardian's key, now sealed a
  second time inside the DM envelope. The guardian's app surfaces it
  as an explicit ACCEPT prompt — never silently held (the issue
  wondered about silent holding; this note recommends against it:
  guardianship is a named relationship, and the accept step is where
  the guardian learns they hold something and for whom). Accepting
  stores the ciphertext row exactly as the QR path does and sends a
  small acknowledgment back (v4 sub-kind), so the owner's
  bookkeeping can honestly show held/not-yet-held — the relay has no
  read receipts, and a shard that silently dies in the 30-day
  retention window must be visible as "not held" and re-sendable.
- **Release leg (guardian → recovering device), STAYS IN-PERSON**:
  unchanged, deliberately, for two reasons. First, the threat model
  names the release friction as the load-bearing mitigation against
  the live attack (social engineering a guardian into releasing) —
  deliberate friction copy, in-person bias, releases sealed to one
  requesting session's throwaway key. Remote release would dissolve
  exactly that. Second, it can't ride the relay anyway: the
  recovering device holds no member identity yet, so it cannot pass
  the relay's recipient-proof read — the QR/paste path is not just
  safer but structurally necessary.

**Guardian candidates**: the picker should offer the member's
VOUCHERS first (`vouchesFor` — people who already staked trust on
them), not the whole roster. Vouchers are same-node by construction,
which exactly matches the relay's same-node-only scope — remote
offers to a cross-node guardian are impossible today and stay out.

## 3. What the node learns (the §7 delta, stated plainly)

Today the node appears nowhere in the ceremony. With remote offers:

- The node holds one sealed envelope per guardian, each BELOW
  threshold — information-theoretically mute about the key. The
  member-guide claim "no single guardian — and no server — ever
  holds enough to act as you" remains true, and should be argued
  explicitly rather than asserted: even ALL envelopes together are
  ciphertext to k different guardian keys; the node can decrypt
  none of them.
- **The shard-distribution signature**: N same-sized envelopes to N
  distinct recipients in one burst is recognizable on the node's
  disk — it says "this member just chose these N people as
  guardians," a relational disclosure the QR ceremony never made.
  Mitigation to specify at build time: stagger sends across the
  outbox (minutes apart, riding normal flush jitter) and accept
  that a patient operator can still correlate; the honest
  member-facing line is that the who-guards-whom relation becomes
  node-visible metadata, ciphertext or not. Members who want the
  relation invisible keep the documented out — the in-person
  ceremony remains fully available, one screen away.
- Retention: an unfetched offer dies with the 30-day message
  window. The ack loop (above) is what keeps this honest.

## 4. What does not change

Threshold semantics (k-of-n, collusion bound = k), no key rotation
on re-shard (a distrusted ex-guardian still holds a valid share —
fresh identity remains the remedy), ciphertext-at-rest on guardian
devices, purge posture (`guardianShards` cleared by soft purge),
export exclusion, and the recovery flow end to end.

## 5. Decision points

1. Proceed with remote OFFERS at all? (This note recommends yes —
   the gather-everyone friction is the documented reason guardian
   setup goes unfinished, and setup friction protects nothing the
   way release friction does.)
2. Accept-required on the guardian device (recommended) vs. silent
   holding (rejected above).
3. Whether the distribution-signature disclosure is acceptable with
   staggering, or whether offers should also ride only in person for
   communities under active surveillance — possibly a per-community
   setting alongside the existing governance knobs.

If the decision is yes, the build slots as: v4 envelope kind +
shape-check, offer/ack handlers in `guardianShards.ts`, the
voucher-first picker, threat-model §7 amendments (the guardian entry
sentence "the node, operator, and message channel appear NOWHERE"
must be rewritten), member-guide + `identity-recovery.md` updates,
and strings ×11 — with `security-review` before merge, per the
issue.
