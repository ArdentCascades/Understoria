# Understoria — Dispute Resolution (design note)

> **Status: shipped** (Round-4 review). Documents how a dispute
> proposal's outcome is applied back to the flagged exchange. Pairs
> with `db/actions.ts` (`disputeExchange`), `db/proposals.ts`
> (`closeProposal`), and the never-reverse-credit principle in
> `docs/invite-redemption.md` §2.

---

## §1 The gap this closes

`disputeExchange` moves a post to `status: "disputed"` and files a
`kind: "dispute"` governance proposal so the community can review the
flag on the Decisions surface. Before this note, **closing that
proposal only stamped the proposal row** — nothing transitioned the
post out of `"disputed"`. Consequences:

- A **rejected** (baseless) dispute stranded the post in `"disputed"`
  forever: `confirmExchange` refuses a disputed post, `disputeExchange`
  refuses to re-flag it, and no other writer of the status existed — so
  the helper's credit could **never flow**, even though the community
  found the flag had no merit.
- An **upheld** dispute changed nothing material either — the outcome
  was inert.

## §2 The rule

When a `kind: "dispute"` proposal closes, `closeProposal` applies the
outcome to the flagged post (both live in the same transaction). The
post's status BEFORE the dispute is remembered in the local-only
`Post.preDisputeStatus` field, stamped by `disputeExchange`.

| Dispute outcome | Effect on the post |
|---|---|
| **rejected** / **withdrawn** (flag did not stand) | Restore `preDisputeStatus`. The normal flow resumes — a `claimed` / `awaiting_confirmation` exchange can be confirmed and credit flows as usual. |
| **passed** (flag upheld) — post had already `completed` | Stays `completed`. Credit is **never reversed** (`invite-redemption.md` §2); the dispute record is the community-accountability signal. |
| **passed** (flag upheld) — post was pre-completion (`claimed` / `awaiting_confirmation`) | `cancelled`. The exchange never completes, so credit never flows. Nothing is clawed back because nothing was ever transferred. |

`preDisputeStatus` is cleared on resolution.

## §3 What this deliberately does NOT do

- **Never reverses transferred credit.** Upholding a dispute on an
  already-completed exchange does not claw back hours — that would
  violate the settled never-reverse-credit ethos. The honest record
  (the closed dispute proposal, visible on Decisions) is the
  accountability, not a balance edit.
- **Never ejects a member.** A dispute is about one exchange, not a
  person; resolution touches only that post.
- **Does not federate a new record.** Dispute proposals and their
  outcomes are governance-local; the underlying signed `Exchange` (if
  one exists) is unchanged, so peers' ledgers are untouched.

## §4 Surfaces

- The `/disputes` page lists only **open** disputes (active flags),
  matching Profile's `DisputesSection` count. A resolved dispute stops
  showing a live "Flagged" chip there; its outcome remains visible on
  the Decisions page like any other closed proposal.
- `castVote` refuses a vote on a closed proposal, so a resolved dispute
  can't be re-litigated by a stale tab.

## §5 Open question

Whether a **rejected** dispute on a *completed* exchange should be able
to re-open the credit flow is moot — a completed exchange already
transferred credit, so "restore to completed" is a no-op. If a future
lifecycle lets an exchange be disputed and then un-completed, this
table's `completed` rows would need revisiting.
