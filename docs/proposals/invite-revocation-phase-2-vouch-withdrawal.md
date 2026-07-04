# Proposal: Invite revocation withdraws the inviter's implicit vouch (Phase 2)

> **Type:** modified-consensus proposal (`GOVERNANCE.md` §2, §6 — this
> changes a documented community behavior and the Threat Model).
> **Status:** draft, awaiting discussion. Not yet scheduled for a
> decision meeting.
> **Settles:** the one operator ruling left open in
> [`docs/invite-revocation.md`](../invite-revocation.md) §9.
> **Depends on:** invite-revocation Phase 1 (convergence), already
> shipped — every device already agrees on the
> `redeemed_despite_revocation` state; this proposal only decides what
> that state does to trust.

---

## The one question

**When an inviter revokes an invite that was redeemed anyway, does the
inviter's implicit vouch for that member stop counting?**

Today (after Phase 1) the answer is **no** — the vouch still counts,
and the only change a revocation makes is a converged, honest label
("redeemed — you had revoked this invite"). Phase 1 deliberately shipped
the convergence with no trust change so that this question could be
decided by the community rather than by a code default. This proposal
asks the community to decide it.

## Why this is a governance decision, not an engineering one

A vouch is a standing statement of trust. Whether an inviter gets a
**standing, unilateral lever** to withdraw that statement — with no
meeting, no moderator, no appeal — is a question about how power works
in the community, not about how the code works. Either answer is
implementable in a few lines; the code has been written to make the
switch a one-place change (see "What ships if adopted"). What cannot be
delegated to code is the value judgment. That is why Phase 1 stopped
here and why this goes through modified consensus (`GOVERNANCE.md` §2).

## Recommendation: yes, withdraw the vouch

- A vouch that its author has explicitly retracted should not keep
  representing them in the community's trust graph. Continuing to count
  it misstates who vouches for whom — the one thing a revocation is
  actually about.
- It keeps `redeemed_despite_revocation` **meaningful**. If revocation
  changes nothing about trust, it is a display-only event with no effect
  on the single relationship it concerns, which reads as hollow.
- It stays within "revocation is not ejection" (see "What does NOT
  change" — the member keeps everything except this one edge).

### The alternative (for the record)

**No — the vouch stands.** The token was validly issued and validly
redeemed; revocation is treated as purely informational. This is
simpler and removes any unilateral trust lever, but it makes revocation
hollow in the sense above. This proposal recommends against it, but a
member may bring it as the counter-position at the decision meeting.

## What changes if this is adopted

- **Trust computation** ([`docs/invite-revocation.md`](../invite-revocation.md)
  §6). A member whose admitting invite was revoked no longer receives
  the inviter's **implicit** first vouch. Concretely, they show **0
  invite-vouches** and reach `pending_trust` / `trusted` exactly as
  though they had joined with no inviter edge at all.
- **The bar to full trust is one ordinary vouch.** Any single manual
  vouch — from the same inviter or anyone else — brings the member in,
  the same as for anyone who arrived without an inviter. They are never
  pushed *below* where an un-vouched-for member sits; they are simply
  no longer *carried* by a vouch that was taken back.
- **The change is visible and accountable, not punitive.** A withdrawn
  vouch is a community-accountability signal ("this inviter no longer
  stands behind this admission"), not an enforcement action against the
  member.

## What does NOT change (the guardrails, `docs/invite-revocation.md` §2)

Revocation is **not ejection**, by settled principle — adopting this
proposal does not touch any of the following:

- The member keeps their **identity, balance, and full history**. No
  credit they earned is reversed.
- The member is **never removed** from the roster. Membership departure
  is its own member-initiated or governance-mediated process
  ([`invite-redemption.md`](../invite-redemption.md) §16.3), never an
  inviter's unilateral lever.
- No **new record, endpoint, or wire field** is added. Phase 1 already
  federates the `InviteRevocation`; this is purely a change to how the
  existing `redeemed_despite_revocation` state is read locally.
- A **manual** vouch the inviter separately made is unaffected — only
  the *implicit* invite-edge is dropped. (An inviter who both invited
  and manually vouched, then revoked only the invite, still counts via
  the manual vouch, as they should.)

## What ships if adopted (so the community knows the cost is small)

A single filter in `vouchersFor` / `trustStatusWithInvites`
(`apps/web/src/lib/vouch.ts`): stop treating a
`redeemed_despite_revocation` invite row as the inviter's implicit
invite-kind vouch. No synthetic vouch is minted or destroyed; it is a
pure filter on an existing computation. Accompanied by:

- a test flip: the Phase 1 test asserting "the implicit vouch still
  counts" becomes "the implicit vouch is withdrawn";
- a `CHANGELOG.md` entry noting the trust-behavior change and citing
  this ratified proposal;
- updates to [`docs/invite-revocation.md`](../invite-revocation.md) §9
  (mark the ruling settled) and §10 (Phase 2 shipped), and the
  member-facing copy so a member seeing the state understands the trust
  effect.

## Rollback

If the community later reverses the ruling, the filter is removed and
the vouch counts again — no data migration either way, because the
`InviteRevocation` records and the `redeemed_despite_revocation` labels
are unchanged by this decision. Only the *interpretation* of that state
moves. This makes the decision genuinely reversible, which should lower
the stakes of adopting it.

## Process (`GOVERNANCE.md` §2, modified consensus)

1. **Discussion** — at least 7 days on the community channel. Concerns
   and the "no" counter-position surface here; this draft is revised.
2. **Decision meeting** — the facilitator walks through this proposal
   and any remaining concerns.
3. **Consent check** — every present member is asked whether they can
   *live with* it (consent / stand aside / block). A single reasoned
   block sends it back to discussion.
4. **Adoption + log** — if adopted, record it in the governance decision
   log, then the engineering change above ships referencing this file.

## Open questions for discussion

1. **Should the member be notified** that their inviter's vouch was
   withdrawn, or only see the neutral roster label? (Phase 1 renders a
   neutral, informational surface; a direct notification is a heavier
   touch and arguably a separate decision.)
2. **Should a withdrawn implicit vouch be re-instatable** if the inviter
   later changes their mind (e.g. by issuing a manual vouch), or is
   retraction final for the implicit edge? (Recommendation: a fresh
   manual vouch simply counts on its own; the retracted *implicit* edge
   stays retracted. No special re-instatement path.)
