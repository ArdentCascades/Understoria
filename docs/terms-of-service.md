# Terms of Service

> **Status:** template. The operator running this Understoria node fills
> in the bracketed values, deletes or amends any section that does not
> match how they actually run the node, and publishes a copy at `/terms`
> or links to it from the PWA's footer. Date the document.
>
> **Last reviewed:** YYYY-MM-DD by `[OPERATOR_NAME]`

---

## 1. What Understoria is — and isn't

Understoria is **timebank and mutual-aid coordination software**.
Members track hours of help given and received, post needs and
offers, vouch for each other, and run community projects together.

Understoria is **not**:

- A bank, a money-transmission service, or a payment processor.
  Hours are not currency. They cannot be redeemed for cash or
  goods, transferred outside the community ledger, or held as
  investments.
- A charity, a 501(c) entity, or a regulated platform unless the
  specific operator running this node has independently incorporated
  as one and says so above.
- A general-purpose social network, marketplace, or messaging app.
  It is purpose-built for mutual aid; the features stop there on
  purpose.

## 2. Who this agreement is between

These terms describe the agreement between you (the member) and:

- **Operator:** `[OPERATOR_NAME]`
- **Contact:** `[OPERATOR_CONTACT]`
- **Node URL:** `https://[DOMAIN]`

If you joined Understoria through a different community's node,
your agreement is with that operator. Different nodes can publish
different terms.

The Understoria software is licensed under the GNU AGPL v3 or later;
see [`LICENSE`](../LICENSE). The license governs the software. These
terms govern your use of this **specific node**.

## 3. Membership

Membership requires a **vouch from an existing member**. By
accepting an invite and joining, you affirm that:

- You are at least `[AGE THRESHOLD, typically 16 or 18 depending
  on jurisdiction]` years old.
- You will read and follow [`CODE_OF_CONDUCT.md`](
  ../CODE_OF_CONDUCT.md).
- You understand that hours tracked here are a **community
  accounting tool**, not money. The seed balance you receive on
  joining is granted by the community, not purchased.
- You will not use Understoria to coordinate harassment, harm,
  or activity that would put other members at risk.

There is no application process beyond the vouch. There are no
fees. You do not owe Understoria anything for joining and we do
not owe you anything for joining either, beyond what these terms
and the Code of Conduct say.

## 4. What you agree to when you sign a record

Almost every action in Understoria produces a **signed,
cryptographic record**: a post, an exchange confirmation, a vouch,
a task comment. (Claiming a post is the deliberate exception — a
claim is an unsigned heads-up, no credit moves on it, and the
exchange that follows is the signed record.) When your client signs
and sends one of these, you assert:

- The content is true to the best of your knowledge (the hours
  actually happened; the vouch reflects your actual judgment of
  the person).
- You are willing to have the record persist in the federated
  ledger. **You cannot un-sign it.** Once it reaches a peer node,
  the operator cannot retract it. See the Privacy Policy §9.
- You understand that the helper-side and helped-side signatures
  on an exchange are how community members audit each other; a
  pattern of bad signatures is itself a Code of Conduct matter.

The auto-confirm system key (see [`auto-confirm-key.md`](
./auto-confirm-key.md)) may sign the helped-side of an exchange
on your behalf after `[AUTO_CONFIRM_HOURS]` hours of no response,
producing a `system-signed` record distinguishable from a
member-signed one. This is the community-set default; you can
ask the community to change `autoConfirmHours` through a
governance proposal, or disable it entirely (set to 0). The
operator does not sign anything on your behalf except via this
documented, capped, time-delayed path.

## 5. What the operator commits to

`[OPERATOR_NAME]` commits to:

- **Run the node honestly.** Not silently modify, suppress, or
  fabricate signed records. Every signature is verifiable; lying
  is detectable and would itself be a Code of Conduct violation.
- **Apply the Code of Conduct evenly.** Including to themselves.
  No invisible exemption for the operator.
- **Honor governance outcomes.** When the community decides a
  config knob (see `nodeConfig` in [`operator-guide.md`](
  ./operator-guide.md)), the operator implements it. If they cannot
  in good conscience, they say so publicly and the community
  decides whether to keep them as operator.
- **Maintain the security posture** described in the Privacy
  Policy §12.
- **Disclose conflicts of interest** — if the operator is paid
  by, employed by, or otherwise tied to any organization the node
  interacts with (a peer node, a member, a funder), that is
  publicly noted.

If the operator stops being able to do these things, they commit to
**hand off operatorship** through the governance process documented
in [`GOVERNANCE.md`](../GOVERNANCE.md) rather than abandon the node
without notice.

## 6. What you commit to as a member

You agree to:

- **Treat other members as the Code of Conduct requires.**
- **Sign honestly.** Confirming an exchange that did not happen,
  or a vouch you do not mean, is a Code of Conduct violation.
- **Not game the system.** The anti-gaming safeguards
  (very-short-duration patterns, tight reciprocal loops) flag
  for community review. Trying to evade them is a Code of Conduct
  violation; the safeguards themselves are not the rule, they are
  a signal to the rule, which is the community.
- **Not impersonate** another person, a vouching member, or the
  operator.
- **Keep your passphrase to yourself.** Letting someone else sign
  records as you means those records are credited to you and the
  community will treat them as yours.
- **Report harm** — what you saw, when, who was involved — to the
  enforcement contact at `[COC_CONTACT]`.

## 7. Hours are not currency

To be explicit, because this is the most common confusion:

- Hours **cannot be redeemed for money**, goods outside the
  community ledger, or services from any third party.
- Hours **cannot be transferred to a non-member**.
- Hours **have no market value** and the operator does not back
  them with anything.
- Your seed balance was **granted**, not loaned. The operator is
  not your creditor and you are not the operator's debtor.
- A negative balance (helping less than being helped) is
  **information for the community**, not a defaulted debt. The
  Code of Conduct's "Solidarity, not charity" commitment applies
  here directly.

## 8. Disputes

If something a member or the operator does seems wrong:

1. **Talk to them** if it is safe to. Many issues are
   misunderstandings.
2. If that is not enough, **file a Proposal** through the in-app
   Decisions surface, or flag the specific record. This brings
   the issue to community deliberation per [`GOVERNANCE.md`](
   ../GOVERNANCE.md).
3. For matters involving safety, harassment, or significant harm,
   **contact `[COC_CONTACT]` directly**. The enforcement contact
   can act outside the proposal process when the situation
   warrants it; their decisions remain accountable to the
   community.

The operator does **not** sit in private judgment of member-to-
member disputes. Disputes resolve through the community process or
they don't resolve — that is by design.

## 9. Suspension and termination

The operator may **suspend or remove your access to this node**
if the community decides through the dispute process that you have
broken the Code of Conduct. The operator may **temporarily
suspend** access to address an imminent safety threat, with the
community vote following promptly.

You may **leave at any time** — see Privacy Policy §9 (the panic
button, soft and hard purge). Your signed records up to that point
remain in the federated ledger; the operator cannot remove them
from peer nodes.

Termination of node access does not terminate the underlying
licenses or your authorship of the records you signed.

## 10. Disclaimer and limitation of liability

The Understoria software is provided under the AGPL v3 license,
which includes the standard "AS IS" warranty disclaimer. The
operator runs the node on a best-effort basis. Specifically:

- The operator **does not guarantee uptime, data durability beyond
  the backup schedule** described in the operator guide, or
  freedom from bugs. Read [`opsec-guide.md`](./opsec-guide.md) and
  back up anything you would be devastated to lose.
- The operator **does not guarantee** that other members will
  fulfill their offers, that hours owed will be reciprocated, or
  that the community will function smoothly. Those are community
  outcomes, not operator outcomes.
- The operator is **not liable** for damages arising from your use
  of Understoria, to the maximum extent permitted by law in
  `[OPERATOR JURISDICTION]`. This limit does not apply to
  liability the operator cannot legally disclaim.

If the disclaimers above leave you uncomfortable, that is the
appropriate level of discomfort for a community-run, volunteer-
operated tool. Choose accordingly.

## 11. Federation

The operator may **peer with other communities' nodes** to allow
signed records to flow across community boundaries. Before adding
a peer, the operator commits to the process in Privacy Policy §6.

Peer nodes are governed by their own terms; your agreement here
does not bind a peer operator. If a peer's behavior is the problem,
the proximate fix is for this node to drop the peer; the long-term
fix is the federation governance work tracked in Agent 15 of
[`roadmap.md`](./roadmap.md).

## 12. Changes to these terms

Material changes — to the dispute process, to membership
requirements, to the operator's commitments — require a 14-day
notice period announced in-app and through the community channel.
Members who object during that window can file a Proposal to
contest the change; if the proposal passes, the change does not
take effect.

Editorial changes (typos, clarifications that do not alter
behaviour) take effect immediately and are tracked in the
document's git history.

The change history of this document is the **git log** of this
file in the repository at `[REPO URL]`.

## 13. Governing terms

These terms, the Code of Conduct, and the Privacy Policy together
describe the agreement between you and `[OPERATOR_NAME]`. Where
they conflict, the Code of Conduct controls on questions of how
members treat each other, the Privacy Policy controls on questions
of data flow, and these Terms control everything else.

The community's governance process (see [`GOVERNANCE.md`](
../GOVERNANCE.md)) is the venue for amending any of these documents.

## 14. Contact

- General terms questions: `[OPERATOR_CONTACT]`
- Code-of-Conduct enforcement: `[COC_CONTACT]`
- Software security: `[SECURITY_CONTACT]`
