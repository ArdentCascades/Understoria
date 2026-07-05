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

## Scope: only the implicit invite-edge

This proposal is narrow on purpose. The only thing it can withdraw is
the **implicit** vouch a member gets automatically from having invited
someone — and the **only way to withdraw it is to revoke the invite you
issued**. That is a deliberate, bounded act, not a free-floating
"un-endorse this person" button.

A general **manual-vouch retraction** feature — a standing control to
drop any endorsement at will — is explicitly **out of scope** here. That
is where the "endorsement held over someone's head" risk is sharpest
(see the next section), and if the community ever wants it, it deserves
its own proposal with its own, more skeptical scrutiny. Keeping this
decision to the invite-tied implicit edge is part of what makes it safe.

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

## Why withdrawal can't be held over someone's head

The hard part of "yes, you can withdraw" is making sure withdrawal is a
*real* correction to the record without becoming a *lever* — a standing
threat of "do what I want or I pull my vouch." A retraction that hurts a
lot is exactly what makes the threat of it powerful. The design defuses
this not by weakening withdrawal but by making it **weak as a weapon**:

- **It self-heals.** A single withdrawal drops at most one edge, and
  **any one ordinary vouch fully restores** the member — from the same
  inviter or anyone else. The community routes around a bad-faith
  retraction almost trivially. The lever is weakest exactly when a
  member is well-embedded, which is when you most want it to be.
- **The resulting state carries no stigma.** A member whose implicit
  edge was withdrawn reads as an ordinary *un-endorsed* member — "new,
  could use a vouch" — **not** as someone flagged or marked. The trust
  computation places them exactly where a member with no inviter edge
  sits, never below it (see "What changes"). Withdrawing an endorsement
  corrects the record; it does not brand the person. An endorsement is a
  statement the voucher makes, not a possession the endorsee holds.
- **A pattern of withdrawals reflects on the withdrawer.** The
  anti-coercion move that actually bites: if one member repeatedly yanks
  vouches, that pattern is a moderation signal about *them*, not their
  targets. Weaponizing withdrawal exposes the person doing it. A threat
  that can only be carried out in a legible, accountable way is a much
  weaker threat.

**The sharpest residual risk — the sole-edge newcomer.** Maximum
leverage falls on the most vulnerable person: a brand-new member whose
*only* trust edge is that one inviter. For them a withdrawal is not "one
of several"; it is back to zero. The answer is **not** to weaken
withdrawal (that just re-forces the endorsement) but to (a) keep the
resulting state stigma-free, as above, and (b) treat "get every
newcomer a second trust edge quickly" as an onboarding goal, so no
member's standing hangs on a single relationship for long. Flagged here
so the decision meeting weighs it with eyes open.

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

## Alternatives considered and rejected

- **Do nothing — the vouch always counts (the "no" position).** Covered
  under "Recommendation" above. Removes any unilateral trust lever, but
  forces a member to keep endorsing someone they have explicitly stopped
  standing behind, and makes revocation hollow. Recommended against; a
  member may still bring it at the decision meeting.

- **Charge the withdrawer a vouch (make withdrawal "cost" something).**
  The instinct — withdrawal should not be *costless*, so it cannot be
  used casually or as a threat — is sound, but attaching the cost to the
  member's own trust standing backfires and is rejected:
  - **It taxes honesty.** The point of withdrawal is to keep the graph
    *accurate*. If retracting costs you, you are incentivized to leave a
    *false* endorsement standing to avoid the toll — penalizing the
    person who corrects the record and rewarding the one who lets a
    stale vouch ride. Backwards.
  - **It does not fix the asymmetry it targets.** A flat "lose one"
    barely scratches a well-embedded member (nine edges left, still
    trusted) while a newcomer with a single edge still drops to zero.
    Coercion is a *power-asymmetry* problem; a flat cost bites the
    vulnerable, not the powerful.
  - **It breaks the trust model.** Your standing is the count of *other
    people's signed statements about you*, not a balance you own. To
    "cost you a vouch," the system would have to delete a third party's
    honest, signed attestation for reasons that party never consented
    to — impossible in the signed-record model — or bolt on a separate
    mutable "penalty score." The latter discards the property that makes
    trust converge commutatively across devices with no coordination
    (it is just *which signed records exist*), replacing it with a
    ledger that must be synchronized and reconciled. A real regression.
  - **It chills vouching and invites retaliation.** If giving a vouch
    creates a future exit cost, members vouch *less* — raising the price
    of the thing the community wants more of — and coupling the give
    side to the receive side turns retraction into a two-way weapon
    (you withdraw from me, I retaliate-withdraw from you).

  The legitimate version of the instinct is handled by "Why withdrawal
  can't be held over someone's head" instead: the cost on a bad-faith
  withdrawal is **reputational and pattern-based, applied to the
  withdrawer**, plus the fact that any single retraction self-heals with
  one ordinary vouch. And the implicit edge already carries natural
  friction — the only way to withdraw it is to revoke the invite you
  issued, a deliberate act, not a costless click.

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
