# Incident Announcement Templates

> **Status:** operator-facing templates. Each one is meant to be
> usable in the moment of incident: copy, fill in the brackets, send.
> Edit them before launch so the voice matches your community's
> conventions, but resist softening the honesty — see the §0 note.

---

## 0. Why these are written the way they are

When something goes wrong, the temptation is to reassure ("we have
everything under control"), defer ("we'll have more details soon"),
or technicalize ("our security team is investigating with industry-
leading tools"). All three are how communities lose trust.

These templates do the opposite by default:

- **Say what happened, plainly.** "The auto-confirm key on this node
  was potentially exposed" beats "a security event involving
  cryptographic material is under review."
- **Say what you did.** Specific actions, with timestamps.
- **Say what members should do.** A clear ask, not "stay tuned."
- **Say what you don't yet know.** Then come back and update.
- **Sign your name.** Not "the team." A specific person, reachable.

Each template ends with **Contact** and **Next update by**. Both
matter. "Next update by 2026-06-12 17:00 UTC even if nothing has
changed" is part of the contract; missing that deadline is its own
event.

---

## 1. System-key rotation (auto-confirm)

**When to send.** The auto-confirm system key (see
[`auto-confirm-key.md`](./auto-confirm-key.md)) may be compromised,
was compromised, or you are rotating it preemptively. Send as soon
as the decision to rotate is made; do not wait for the rotation to
complete.

**Who sends.** The operator. CC the CoC enforcement contact.

**Where.** In-app announcement, community channel, and direct email
or DM to any member who has had an auto-confirmed exchange in the
last 30 days (those rows depend on the rotated key for verification).

**Pre-flight checklist.**
- [ ] New keypair generated (`scripts/generate-system-key.mjs`)
- [ ] Old PUBLIC key recorded (the history needs the pubkey, not the
      secret — destroy the old secret once the switch is verified)
- [ ] `.env` updated per
      [`system-key-rotation.md`](./system-key-rotation.md) §3 — BOTH
      `NODE_SYSTEM_SECRET_KEY` (new) and `NODE_SYSTEM_KEY_HISTORY`
      (old pubkey + retirement timestamp, append-only)
- [ ] `docker compose up -d` restarted
- [ ] `GET /api/config` returns the new public key AND the old one
      in `systemKey.history`
- [ ] Threat-model entry for this incident drafted (you'll publish
      it within 7 days; see §7)

**Template.**

```
Subject: [Understoria — [DOMAIN]] System key rotation — please read

What happened
On [YYYY-MM-DD HH:MM UTC] we rotated the auto-confirm system key
on this node. The previous public key was:
  [OLD_PUBLIC_KEY_BASE64]
The new public key is:
  [NEW_PUBLIC_KEY_BASE64]
You can verify the new key at https://[DOMAIN]/api/config.

Why we rotated
[ One of:
  - "We have reason to believe the previous key was exposed. Specifically: [BRIEF FACTUAL DESCRIPTION]."
  - "We rotated as a precaution because [REASON — e.g., the server was reinstalled, a contributor with key access stepped back, a vulnerability was disclosed in a dependency that touches the signer]."
  - "This is a scheduled rotation per our annual key-hygiene practice." ]

What auto-confirmed records look like now
Records auto-confirmed BEFORE [YYYY-MM-DD HH:MM UTC] were signed by
the old key. They remain valid — the old public key is published as
part of the rotation history at /api/config so any peer can still
verify them. Records auto-confirmed AFTER that timestamp are signed
by the new key.

What you should do
Most members: nothing. Your PWA will pick up the new key on the
next federation sync.
If you operate a peer node that pulls from us: confirm /api/config
returns both keys (current + history). If your client is on an
older version that doesn't read history, update it before relying on
this node's auto-confirms in audit pipelines.
If you previously had concerns about a specific auto-confirmed
exchange: re-check it now and let us know.

What we still don't know
[List anything genuinely unclear: how long the old key was exposed,
which records (if any) were forged, who had access. If nothing is
unclear, say so explicitly: "We have full audit trail of every
record signed by the old key and none of them appear suspicious."]

Next update by
[YYYY-MM-DD HH:MM UTC] — within 72 hours.

Contact
[OPERATOR_NAME], [OPERATOR_CONTACT]
Code of Conduct enforcement: [COC_CONTACT]
Security disclosure: [SECURITY_CONTACT]
```

---

## 2. Member data breach (server side)

**When to send.** The node server, the SQLite database file, a
backup, or the operator's local copy of any of these was accessed
by an unauthorized party. Send within 72 hours of discovery, or
sooner if law requires. (Privacy Policy §11 commits to this.)

**Who sends.** The operator. CoC contact is informed first;
SECURITY contact is informed first if the breach was via a software
vulnerability so coordinated disclosure can be set up.

**Where.** In-app announcement, community channel, direct email to
every member.

**Pre-flight checklist.**
- [ ] Breach scope determined: which tables, which rows, which time
      window
- [ ] Access path closed (revoked credential, patched bug, etc.)
- [ ] Logs preserved for forensic review (do NOT rotate them)
- [ ] Legal counsel consulted if jurisdiction requires it
- [ ] Threat-model §3 adversary entry updated to reflect what was
      learned

**Template.**

```
Subject: [Understoria — [DOMAIN]] Member data accessed without
         authorization — please read

What happened
Between [START YYYY-MM-DD HH:MM UTC] and [END YYYY-MM-DD HH:MM UTC],
an unauthorized party had access to [SCOPE — e.g., "the SQLite
database file on the production server", "a backup snapshot from
[DATE] stored in [LOCATION]", "the operator's laptop with a copy of
the .env file"].

Specifically, this means they could have read:
[ Enumerate, per Privacy Policy §4–§5:
  - "Every signed Post, Exchange, Vouch, Claim, and TaskComment
     ever pushed to this node (including pseudonymous public keys
     and the record metadata listed in our privacy policy §4)."
  - "Request logs containing IP addresses from [START] to [END]." ]

They could NOT have read:
- Direct messages — these are end-to-end encrypted and not stored
  on the server.
- Member private keys — these never leave the device.
- Member profiles (display name, skills, availability, location
  zone) — these are local-only.

How we found out
[BRIEF FACTUAL: alert, report from a member, log review, etc.]

What we did
[Timeline of actions, with timestamps. Be specific.]
- [YYYY-MM-DD HH:MM UTC] [Action 1]
- [YYYY-MM-DD HH:MM UTC] [Action 2]
- ...

What you should do
[Specific to scope. For example, if IP logs were exposed:
"If your IP address being associated with this node's activity is a
concrete risk for you, consider that your participation during the
window [START] to [END] may be known to whoever obtained the data."
If signed records were exposed in a federation that doesn't already
treat them as public: "Your exchange history with this community is
now potentially known to a third party. Consider whether to inform
the people you have exchanges with."]

What we still don't know
[Genuine uncertainties. List them.]

Next update by
[YYYY-MM-DD HH:MM UTC] — within 7 days.

Contact
[OPERATOR_NAME], [OPERATOR_CONTACT]
Code of Conduct enforcement: [COC_CONTACT]
Security disclosure: [SECURITY_CONTACT]
```

---

## 3. Federation peer dispute or depeering

**When to send.** A peer node is removed from `PEER_NODE_URLS`,
either because they asked, because the operator decided, or because
the community decided through governance.

**Who sends.** The operator. If the depeering is contentious, the
CoC contact reviews the announcement before it goes out.

**Where.** In-app announcement, community channel. If the depeering
is over a Code of Conduct concern, also send to the peer operator
directly (they should already know — this is the public record).

**Template.**

```
Subject: [Understoria — [DOMAIN]] Federation change — peer removed

What changed
On [YYYY-MM-DD HH:MM UTC], we removed [PEER_DOMAIN] from this
node's peer list. Records signed before this change remain valid
in our local store; new records from that node will not be pulled.

Why
[ One of:
  - "The peer operator requested the depeering." [+context if shared]
  - "We removed the peer because [CONCRETE REASON — e.g., Code of
     Conduct concerns, federation-protocol incompatibility, or a
     specific incident at the peer node]."
  - "The community decided via proposal [PROPOSAL_ID] to depeer.
     The decision rationale is preserved in the proposal record." ]

What this means for you
Existing signed records from members on [PEER_DOMAIN] remain in
your PWA's local store. New records they sign will no longer flow
to this node. If you had ongoing exchanges with members on that
node, those exchanges remain valid; future confirmations will need
either a re-peering decision or out-of-band coordination.

What stays the same
- Your local data is unaffected.
- Your private key, identity, and message history are unaffected.
- Other peers (if any) continue to federate normally.

Contact
[OPERATOR_NAME], [OPERATOR_CONTACT]
Code of Conduct enforcement: [COC_CONTACT]
```

---

## 4. Extended outage

**When to send.** The node has been or will be unavailable for more
than 24 hours. Send as soon as the duration is known; do not wait
until the outage is over.

**Who sends.** The operator.

**Where.** Community channel. If you can reach members through a
non-PWA channel (mailing list, signal group, etc.), use it — the
PWA itself may not be reachable.

**Template.**

```
Subject: [Understoria — [DOMAIN]] Node outage —
         expected back by [DATE]

What's down
[Specific: "The community node at https://[DOMAIN]". If the PWA
itself is also unreachable, say so. If only federation is affected
(local-only PWA still works), say so.]

Since when
[YYYY-MM-DD HH:MM UTC]

Why
[ One of:
  - "Planned maintenance" + scope
  - "Hosting provider outage" + provider name
  - "Software issue I'm working on" + brief description
  - "Hardware failure" + brief description ]

What you can do meanwhile
- Your PWA continues to work LOCALLY. Posts, exchanges, and
  messages you create are queued in the outbox and will federate
  when the node returns.
- If you have an urgent need that requires the community ledger,
  reach out to [BACKUP_CONTACT] or post in [BACKUP_CHANNEL].

When I expect it back
[YYYY-MM-DD HH:MM UTC]

If I'm wrong about that
Next update by [YYYY-MM-DD HH:MM UTC] — within 24 hours.

Contact
[OPERATOR_NAME], [OPERATOR_CONTACT]
```

---

## 5. Routine security update

**When to send.** A dependency CVE landed that doesn't affect the
runtime posture (e.g., a dev-tool vuln, or a patched library that
the node uses for non-sensitive paths) and you want members to know
you're paying attention.

**Who sends.** The operator.

**Where.** Community channel (not in-app — this isn't urgent
enough to demand attention).

**Template.**

```
Subject: [Understoria — [DOMAIN]] Routine security update —
         no action required

What happened
[CVE_ID / advisory link] was disclosed in [DEPENDENCY_NAME] on
[YYYY-MM-DD]. The advisory describes [BRIEF DESCRIPTION].

Does this affect us
[ One of:
  - "No — this is a [dev-tool / test-runner / build-time] dependency
     and does not ship in the production bundle members use."
  - "Yes, marginally — the affected code path is [SPECIFIC]. We have
     [no known exploit / a low-impact exploit / a non-trivial
     exploit] but updated to the patched version anyway."
  - "Yes — see the incident announcement at [LINK]." ]

What we did
Bumped [DEPENDENCY_NAME] from [OLD_VERSION] to [NEW_VERSION] on
[YYYY-MM-DD HH:MM UTC]. Deployment verified at [YYYY-MM-DD HH:MM
UTC]. See [PR_LINK] for the change.

What you should do
[ Usually: "Nothing — the PWA will pick up the update on next
visit." If a service-worker cache busting is needed: "Reload your
PWA once to pick up the updated bundle." ]

Contact
[OPERATOR_NAME], [OPERATOR_CONTACT]
Security disclosure: [SECURITY_CONTACT]
```

---

## 6. Federated event spam from peer node

**When to send.** A peer node is propagating `Event` records that
are spam, harassment, or geographically irrelevant to this
community (commercial promotion, off-topic content, content that
violates this community's Code of Conduct, or a recurring stream
of events from a venue thousands of kilometres away with no
mutual-aid relationship to this node). The operator action below
hides the affected events from this node's calendar; the longer
community process opens a `Proposal{kind:"dispute"}` for
deliberation.

**Who sends.** The operator. CC the CoC enforcement contact when
the spam shape is harassment rather than promotion.

**Where.** In-app announcement, community channel. Do NOT depeer
the upstream node for content disputes — the wire is shared
infrastructure, and content disagreement is community-process work
(`docs/threat-model.md` §7 federation entries; `GOVERNANCE.md`).
Depeering belongs in §3 of these templates, not here.

**Pre-flight checklist.**
- [ ] Hide-event action taken on this node within 48 hours of the
      decision to hide (the documented SLA — see
      `docs/community-events.md` §11 and the open question on
      pilot-validation of this number).
- [ ] Hidden events identified by `id`; this node continues to
      hold the signed records (the operator never deletes peer-node
      records, only refuses to display them).
- [ ] `Proposal{kind:"dispute"}` filed if the situation warrants
      community deliberation rather than a one-off hide. Cite the
      proposal id in the announcement.
- [ ] No depeering. If the peer's content shape warrants
      depeering, that is a separate decision and uses §3 above.

**Template.**

```
Subject: [Understoria — [DOMAIN]] Hidden events from
         [PEER_DOMAIN] — please read

What happened
On [YYYY-MM-DD HH:MM UTC], we hid [N] event(s) federated from
[PEER_DOMAIN] from this node's calendar. The records remain in our
local store — we do not delete records from peer nodes — but they
no longer render in the events views on this node.

The hidden event ids are:
[ ID_1 ]
[ ID_2 ]
...

Why we hid them
[ One of:
  - "The events were commercial promotion not aligned with this
     community's purpose (mutual aid and labor organizing)."
  - "The event titles or descriptions contained harassment or
     content that violates our Code of Conduct, specifically:
     [BRIEF FACTUAL DESCRIPTION]."
  - "The events are scheduled at locations with no mutual-aid
     relationship to this community and were filling the calendar
     surface to the detriment of locally-relevant entries." ]

What we did NOT do
- We did NOT delete the records. Other nodes that federate with
  [PEER_DOMAIN] continue to receive and (at their operators'
  choice) display them. Each node decides what its members see.
- We did NOT depeer [PEER_DOMAIN]. The federation wire is shared
  infrastructure; content disagreement is community-process work,
  not a federation-layer decision.

What happens next
[ One of:
  - "This is a one-time hide. If similar events appear from
     [PEER_DOMAIN] in the future, we'll consider whether to open
     a community proposal."
  - "We have opened a community proposal — [PROPOSAL_ID] — to
     deliberate on whether this node should continue federating
     event records from [PEER_DOMAIN] at all. The proposal is
     open for [N days] of comment before consensus check." ]

What you should do
Most members: nothing. The hidden events will simply not appear
on your calendar.
If you had RSVP'd to one of the hidden events on the original
node (not this one — RSVPs are local to the node where they
happen), your RSVP is unaffected; this announcement is about
*display* on this node's calendar, not about the underlying
events.
If you disagree with the hide decision: comment on
[PROPOSAL_ID] (if a proposal is open) or reach out to me
directly.

What we still don't know
[Genuine uncertainties. List them. If none, say so explicitly.]

Next update by
[YYYY-MM-DD HH:MM UTC] — within 7 days, or when the proposal
closes, whichever is sooner.

Contact
[OPERATOR_NAME], [OPERATOR_CONTACT]
Code of Conduct enforcement: [COC_CONTACT]
```

---

## 7. Annual transparency report

**When to send.** Once a year, on a fixed date the operator commits
to. The Privacy Policy §11 promises this report; it goes out even
in years when the count is zero. Especially in years when the count
is zero — a regular zero is the signal.

**Who sends.** The operator.

**Where.** Community channel and a public copy at
`https://[DOMAIN]/transparency-[YEAR].txt` (or wherever the
operator commits to publishing it).

**Template.**

```
Subject: [Understoria — [DOMAIN]] Transparency report [YEAR]

This is the annual transparency report for the period
[YYYY-01-01] to [YYYY-12-31], covering the community node at
https://[DOMAIN] operated by [OPERATOR_NAME].

Legal process requests received
- Subpoenas / court orders / law-enforcement requests:  [N]
  Of which complied with: [N]
  Of which resisted or quashed:  [N]
  Of which still in process: [N]
- National security letters (where lawful to disclose): [N]
- Civil discovery requests:                              [N]
- Other government inquiries:                            [N]

For each request complied with, this is what was produced:
[Itemize, scrubbed of identifying detail of the affected member if
the request is ongoing. If zero, say "No requests were complied
with during this period."]

Security incidents
- Server intrusions detected: [N]
- Backups exposed without authorization: [N]
- System-key compromises (incl. precautionary rotations): [N]
- Other incidents reported via [SECURITY_CONTACT] that resulted
  in a CVE or member notification: [N]

For each incident, the incident announcement is linked here:
[LIST]

Federation changes
- Peers added: [N] — [LIST_PEER_DOMAINS]
- Peers removed: [N] — [LIST_PEER_DOMAINS + reason]

Operator changes
- Operator name change: [yes/no]
- Operator contact change: [yes/no]
- CoC enforcement contact change: [yes/no]

Code of Conduct enforcement
- Reports received: [N]
- Cases referred to community deliberation: [N]
- Cases the enforcement contact acted on directly: [N]
- Members suspended: [N]
- Members removed: [N]

Anything else members should know
[A paragraph or two. If nothing, say nothing, with words.]

Verified by
[OPERATOR_NAME], [DATE]
[Optional: PGP signature or signed commit hash of this file in
the repository, so a member can verify the report wasn't tampered
with after publication.]

Questions / corrections
[OPERATOR_CONTACT]
```

---

## 8. Member holding community role faces mass conscientious objection

**When to use it.** Multiple members are privately reporting to
the operator that they have blocked X, who holds community role Y
(moderator, organizer, treasurer, facilitator — any role named in
[`GOVERNANCE.md`](../GOVERNANCE.md) §3). The reports arrive one
at a time, through private channels, because the block primitive
is local-only by design (see [`docs/blocking.md`](./blocking.md)
§7 and the threat-model §7 entry "Member blocking is a local-only
personal-relief surface"). The operator's awareness is itself an
artifact of members choosing to share — the system did not surface
it, and the system has no aggregate of who-blocked-whom to draw on.

**What this template is NOT.** This is NOT a federated signal. It
is NOT a quorum. It is NOT a vote. It is NOT a moderator action.
The operator only knows because members have voluntarily disclosed.
The blocked individual — the community-role holder X — does NOT
know who has blocked them; the blocks emit no signal in either
direction. There is no dashboard, no count, no aggregate. The
operator's read of "this is widespread" is judgment based on
voluntary private reports, not on a system surface.

**Who sends.** The operator. CC the CoC enforcement contact if any
of the underlying concerns members raised in their disclosures
touches Code of Conduct enforcement; otherwise this is governance
work, not enforcement work.

**Where.** Community channel. This is a governance announcement,
not a moderator action.

**Operator action — what to do.**
- **Route to `GOVERNANCE.md` §3 (rotation cadence).** Roles
  rotate every 3 months by default per `GOVERNANCE.md` §3. If
  the next rotation is imminent, name the cadence in the
  announcement and let rotation do its work. If rotation is far
  out, the announcement names the option to convene rotation
  early per `GOVERNANCE.md` §3 (rotation is a community
  decision, not the operator's call to make unilaterally).
- **Route to `GOVERNANCE.md` §5 (community process for the
  substantive concern).** If the disclosures included a
  substantive concern (rather than only "I don't want to
  interact with X"), the right tool is the dispute / proposal
  process. The operator can encourage members to file via the
  normal channels; the operator does NOT file on members'
  behalf.
- **Route to `GOVERNANCE.md` §5 (appeals).** The role-holder X
  has a right to appeal any role-change decision through the
  appeals process. The announcement names this explicitly.

**Operator action — what NOT to do.**
- Do NOT depeer any node. This is community-process work, not a
  federation-layer fix.
- Do NOT auto-suspend X from the role. Role changes go through
  the community process named in `GOVERNANCE.md` §3 and §5,
  not through operator action.
- Do NOT surface aggregates of who-blocked-whom. There is no
  legitimate path that takes the operator's private knowledge
  of voluntary disclosures and turns it into a community-facing
  count. The cumulative invariant from `blocking.md` §6.3
  depends on this absence.
- Do NOT name in the announcement *which members* have
  disclosed blocks. Their disclosure to the operator was
  private; treating it as a publication grade signal would
  betray that privacy and would also chill future disclosures.
- Do NOT name in the announcement *which individual is the
  subject* of the disclosures. The announcement is about the
  community process for the role, not about social judgment on
  the person. If a community process is opened, the proposal
  itself names what it names — that is community work, not
  operator work.

**Pre-flight checklist.**
- [ ] At least three members have independently and voluntarily
      disclosed a block of X to the operator. (Below three, the
      disclosures are personal and the operator's role is to
      listen, not to announce.) **Note:** the "three" threshold
      is a starting guess subject to pilot revision — small
      communities may need it lower, larger ones higher. Revisit
      after first pilot use; do not change unilaterally without
      naming the new threshold here.
- [ ] The disclosures were unsolicited — the operator did not
      ask members "have you blocked X?" Asking would compromise
      the privacy posture of the block primitive.
- [ ] Rotation cadence per `GOVERNANCE.md` §3 has been
      consulted. The announcement names where in the cadence
      the community currently is.
- [ ] No aggregate-block surface, no per-member block count, no
      "who has blocked whom" data has been built or surfaced
      anywhere in service of this announcement. The operator's
      knowledge is from private disclosure only.
- [ ] CoC enforcement contact has been consulted if any
      disclosure touches Code of Conduct enforcement (rather
      than only "I don't want to interact with X").

**Template.**

```
Subject: [Understoria — [DOMAIN]] Community process check-in:
         [ROLE] role

What this is about
Several members have, in private, let me know they would prefer
not to interact with the current holder of the [ROLE] role.
Members do this through their own personal block surface, which
is private to them and never federates or aggregates.

I do not have a count. I do not have a list of who has chosen
this. I am writing because several members have voluntarily told
me, and I want the community to have a chance to think about
whether the regular community process is the right next step.

What this is NOT
- This is NOT a moderator action.
- This is NOT a suspension or removal.
- This is NOT a vote against anyone.
- This is NOT a federated signal — no other community sees
  this. The blocks members have chosen are private to them and
  stay on their own devices.

What I'd like to invite the community to think about
[ One or more of, as appropriate:
  - "Our rotation cadence for community roles is 3 months per
     GOVERNANCE.md §3. The next rotation for [ROLE] is on or
     around [DATE]. If members would like rotation to happen
     earlier this cycle, that is a community decision and we can
     convene that conversation."
  - "If members have substantive concerns about how the [ROLE]
     role is being held, the right tool is a community
     proposal — Proposal{kind:\"dispute\"} or the appropriate
     proposal shape per GOVERNANCE.md §5. I am happy to help
     anyone who wants to draft one."
  - "The current holder of the [ROLE] role has the right to
     appeal any community decision about the role through the
     appeals process named in GOVERNANCE.md §5." ]

What I will not do
- I will not depeer any node based on this.
- I will not suspend or remove anyone based on this. Role
  changes go through the community process.
- I will not publish or share a list of who has chosen to block
  whom. Those disclosures were private.
- I will not name a specific individual in this announcement.
  This message is about the community process for the role.

What you should do
If you have a substantive concern about the [ROLE] role that
you would like the community to deliberate on: consider
drafting a proposal per GOVERNANCE.md §5.
If you are the holder of the [ROLE] role and you would like to
talk: reach out to me directly. Your role is not at risk from
this announcement alone — the community process is the path
for any role change, and you have appeal rights through
GOVERNANCE.md §5.
If you are unsure what to do: that is also fine. The community
process does not require any specific action from you.

Next update by
[YYYY-MM-DD HH:MM UTC] — at the next regular community check-in,
or when a proposal opens, whichever is sooner.

Contact
[OPERATOR_NAME], [OPERATOR_CONTACT]
Code of Conduct enforcement: [COC_CONTACT]
```

---

## Cross-references

- Privacy commitments behind these templates: [`privacy-policy.md`](./privacy-policy.md)
- Operator obligations: [`terms-of-service.md`](./terms-of-service.md) §5
- Threat model adversaries these incidents map to:
  [`threat-model.md`](./threat-model.md) §3
- Security disclosure process: [`../SECURITY.md`](../SECURITY.md)
- Auto-confirm key rotation procedure: [`system-key-rotation.md`](./system-key-rotation.md) §3 (design background: [`auto-confirm-key.md`](./auto-confirm-key.md))
