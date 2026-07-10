# Member removal — governance for the one thing membership can't yet do

Status: **M1 shipped** (the record + the gates: shared
`MemberRemoval`/`MemberReinstatement` + canonical payloads +
structural verifier; server tables/routes/mirror kinds, closure
subtraction with the non-retroactive chain rule, `REMOVAL_QUORUM`
env + `/config.removalQuorum`, the `author_removed` write gate, the
last-founder guard; client pull/derived standing/central content
hiding/Decisions display; snapshot + re-seed + windowing postures).
**M2 and M3 shipped** (the in-app ceremony: "Propose removal" on
the member's profile beneath the block action, opening with the
graduated-tools interstitial; co-signing from the Decisions page;
"Start a reinstatement" on any currently-removed entry; the
removed member's own device shows a plain-words banner naming the
reinstatement path instead of an eternal failing sync). As-built
deltas from §4: signature fragments travel DEVICE-TO-DEVICE
(QR / paste — the proposer shows the draft, each co-signer's
device answers with a fragment, the proposer assembles at quorum),
the same delivery posture guardian shards established, because
direct messages have no transport in this codebase; and
`proposalId` now carries a real shared proposal id when the
proposer links the deliberation (proposal federation G1/G2 shipped
after this doc's v1, resolving the named dependency): the ceremony
intro offers the device's SIGNED proposals as linkable, every
co-signer's screen shows the linked deliberation before signing —
honestly noting when the proposal isn't on that device — and the
link is inside the canonical payload, so the quorum signatures
bind it. The link is provenance, not authority: a removal with
`proposalId: null` remains fully valid, because nothing forces
deliberation through the app. The assembled record is deliberately NOT written locally
on submit: the node's closure check is the authority
(last_founder / quorum_not_met can still refuse), and the record
flows back through the normal pull once accepted — one source of
truth, nothing optimistic to roll back. Other as-built note:
standing is DERIVED from the record tables everywhere (server
resolver and client), not stamped onto member rows — one rule, no
state to drift. This
document was the implementation plan for the residual named in
`docs/threat-model.md` §7: *"membership is append-only… not
revocable"* — that residual is now closed.

Companion docs: `docs/member-authenticated-reads.md` (the membership
closure this modifies), `docs/blocking.md` (the existing PERSONAL
boundary tool), `docs/invite-revocation.md` (the closest existing
shape — a signed record that subtracts), `docs/community-events.md`
and the Decisions surface (the deliberation venue).

## 0. Values first, mechanism second

Removal is the heaviest thing a community can do to a member, and
this design treats it that way:

- **It is a last resort.** The app already has graduated tools:
  personal blocks (each member's own boundary, no ceremony needed),
  dispute proposals for contested exchanges, and conversation. The
  removal UI must present these first — the ceremony equivalent of
  `solidarity-not-shame`.
- **No single person wields it.** Not the operator (who is
  explicitly NOT a moderator — `docs/operator-powers.md`), not an
  organizer. Removal requires a quorum of members co-signing, and
  the artifact permanently records who.
- **It is public inside the community.** A removal record is
  visible to every member — secret expulsions are how communities
  rot. The record carries an optional reason written for the
  community, not a case file.
- **It is not erasure.** The removed member's past records remain
  (history is history; their exchanges balance other members'
  ledgers). Their DEVICES retain their copy of everything they ever
  synced — stated plainly, because pretending otherwise would be a
  lie about how local-first works.
- **The door can reopen.** Reinstatement is a first-class record,
  not an afterthought.

## 1. What already exists to build on — and what's missing

- **Proposals + votes** (`proposals` / `votes` tables, the Decisions
  surface) are the deliberation venue: `kind: "proposal"`,
  categories already extensible (`config_change`, `dispute`,
  `project_adoption`). BUT: proposals and votes are **local-only
  today** (no outbox kind, no federation pull) and votes are
  **unsigned** rows. So deliberation can ride proposals, but the
  ENFORCEABLE artifact cannot be derived from vote rows — nothing
  cryptographic binds a vote to a voter.
- **Invite revocation** shows the right artifact shape: a small
  signed record that federates and subtracts from derived state.
- **The membership closure** (`readAuth.ts`) is derived on demand
  from founder keys + receipts; removal must plug into that
  derivation on the server AND its client-side mirror.
- **Blocks** (`blocks` table) already implement "this member's
  content stops reaching me" — removal reuses this rendering path
  rather than inventing a second hiding mechanism.

## 2. The artifact: `MemberRemoval`

A new shared record kind, multi-signed:

```ts
interface MemberRemoval {
  id: string;                    // uuid
  removedKey: string;            // the member being removed
  reason: string | null;         // written for the community; length-capped
  decidedAt: number;             // ms epoch
  nodeId: string;
  proposalId: string | null;     // link to the deliberation, when it exists
  signatures: {                  // ≥ REMOVAL_QUORUM entries
    signerKey: string;
    signature: string;           // over canonicalMemberRemovalPayload
  }[];
}
```

- `canonicalMemberRemovalPayload` covers everything EXCEPT
  `signatures` (fixed field order, same discipline as every other
  canonical payload). Every co-signer signs the SAME bytes, so
  signatures are independently collectible and order-free.
- **Validity rule, identical on server and clients:** at least
  `REMOVAL_QUORUM` entries where (a) the signature verifies, (b)
  `signerKey` is in the membership closure ignoring this record,
  (c) `signerKey !== removedKey`, (d) signers are distinct.
  Founder keys count as members. Invalid records are 422/skipped,
  never partially honored.
- **`REMOVAL_QUORUM`** is node config (env, default **3**), and — like
  `NODE_FOUNDER_KEYS` — must match across a mirror set. A
  membership-proportional threshold was considered and rejected for
  v1: membership size is time-varying and node-local, so a
  proportional rule can evaluate differently on two honest nodes and
  produce a record one accepts and the other refuses. A fixed,
  operator-visible number is auditable by everyone. Revisit when
  proposals federate.
- **`MemberReinstatement`** is the same shape (id, reinstatedKey,
  reason, decidedAt, signatures, same quorum). Removal/reinstatement
  compose by time: a key's standing at time T is decided by the
  latest record with `decidedAt ≤ T`.

## 3. What a removal changes

**Server:**

- **Read gate:** `createMembershipResolver` subtracts removed keys:
  a member is IN iff they are reachable through the closure AND not
  currently removed. Cache invalidation extends to the removals
  count. Removal-aware chain rule: a receipt extends the closure
  only if its inviter was not removed at `redeemedAt` — a removed
  member's PRE-removal invitees remain members (their joining was
  legitimate; removal is not retroactive and never cascades), but
  their unredeemed invites die with the removal.
- **Write gate:** a new shared preHandler check alongside the
  insert-cap guard: POSTs whose authenticated author key (the
  signer field each surface already validates) is currently removed
  are refused 403 `author_removed`. The removed member's history
  stands; their pen is out.
- **Storage + wire:** `member_removals` / `member_reinstatements`
  tables, POST/GET route pairs (feed cursor `decidedAt` + id, same
  composite shape as every feed), mirror-kind entries (replicated —
  ordering note: after redemptions, since validity reads the
  closure), and web pulls.

**Client (every member's device):**

- Verifies the record with the same shared verifier and quorum
  config (pulled from `/config`, which gains `removalQuorum` so
  devices don't hard-code it), then: marks the member row removed,
  applies the block-style content treatment (reuse the `blocks`
  rendering path with distinct copy — "removed by community
  decision", never the personal-block copy), and shows the record —
  who was removed, when, the reason, and WHO signed — on the
  Decisions surface.
- The community snapshot (device transfer) carries removals.

**The removed member's own device** keeps working locally (their
data is theirs); pulls start failing read-auth and pushes get 403.
The app detects this state and says it plainly — with the
reinstatement path named — rather than showing an eternal spinner.

## 4. Gathering signatures — the ceremony

Phase 1 keeps the flow simple and human:

1. A member opens "Propose removal" from the member's profile page
   (beneath the block action — the graduated-tools ordering). The
   app requires them to have blocked the member first? **No** —
   considered and rejected: it would conflate a personal boundary
   with a community decision. Instead the flow opens with the
   graduated-tools interstitial (block / dispute / conversation)
   and a hard-tier impact reflection, reusing the proposal
   machinery (`category: "member_removal"`, `reversibilityTier:
   "hard"`).
2. Deliberation happens where the community talks. The named
   dependency resolved: proposals federate since
   `docs/proposal-federation.md` G1, so the deliberation thread is
   now genuinely shared (the SIGNATURES remain what bind) — and
   the ceremony now LINKS it: the proposer can pick a signed
   proposal at the intro step, `proposalId` rides the canonical
   payload, and co-signers see the linked deliberation before
   signing.
3. Co-signing: the proposer's device produces the unsigned payload;
   each co-signer opens it (deep link / QR at a meeting — same
   in-person ceremony posture as tap-to-link) and their device
   signs and POSTs a `MemberRemovalSignature` fragment to the node
   (a small mailbox-style surface keyed by removal id), OR — v1
   simplest — signs and hands the fragment back via the existing
   E2E message channel to the proposer, whose device assembles the
   full record once quorum is reached and submits it. Assembly is
   mechanical; nothing is enforceable until the full record exists.
4. Submission → federation → every device applies it.

## 5. Abuse analysis

- **Quorum collusion:** any K members can remove anyone. This is by
  design the community governing itself, and the mitigations are
  social + structural: the record is public and permanently
  attributed; reinstatement needs only the same quorum; and a
  captured community's real remedy is the exit (fork the community
  from devices — which re-seed, `docs/community-reseed.md`, makes
  concrete). Set `REMOVAL_QUORUM` thoughtfully relative to community
  size.
- **Removal races** (record arrives while the removed member is
  mid-push): their in-flight records land or 403 — either is
  consistent; LWW state they authored stops updating.
- **Founder removal:** allowed (founders are members), EXCEPT a
  record removing the last non-removed founder is refused — the
  closure must keep at least one root. Named edge, tested.
- **Replay across communities:** `nodeId` is in the canonical
  payload, but nobody compares it against a local value — it is
  attribution, not the defense. The defense is the closure: a record
  signed for another community carries signers who are not members
  HERE, so it dies on the ingestion quorum check (409
  `quorum_not_met`).
- **Griefing via reason text:** length-capped, plain text, no
  markdown render, same sanitation as post descriptions.

## 6. Phases

1. **Phase M1 — the record + the gates.** Shared type + canonical
   payload + verifier; server tables/routes/mirror-kind/closure and
   write-gate integration; client pull/apply/display; `/config`
   quorum; snapshot transfer; en/es; tests (closure math, chain
   rule, quorum edges, last-founder guard).
2. **Phase M2 — the ceremony.** Proposal category, graduated-tools
   interstitial, co-sign collection via E2E messages, assembly +
   submit; Decisions surface rendering; the removed-state UX on the
   removed member's own device.
3. **Phase M3 — reinstatement** (record shipped in M1's schema;
   UI + closure re-add in M3).

## 7. Threat-model / docs obligations (owed at implementation)

§7 entry (closes the append-only residual and names the quorum
trust assumption + collusion bound); update
`member-authenticated-reads.md` (closure definition gains the
subtraction + chain rule); `operator-powers.md` (explicitly: the
operator STILL cannot remove anyone — quorum only);
`operator-guide.md` env row (`REMOVAL_QUORUM`, must match across
mirrors); member-facing `docs/member-removal.md` §0 values text
adapted into Help/FAQ copy.

## 8. Sizing

M1 ≈ one federation-PR unit (a record kind end to end, closure
integration, tests). M2 ≈ a UI-heavy medium PR. M3 small.
