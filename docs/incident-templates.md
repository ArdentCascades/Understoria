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
- [ ] Old `NODE_SYSTEM_SECRET_KEY` saved offline as `previous-key.txt`
      for the rotation-history field
- [ ] `.env` updated, `docker compose up -d` restarted
- [ ] `GET /api/config` returns the new public key
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

## 6. Annual transparency report

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

## Cross-references

- Privacy commitments behind these templates: [`privacy-policy.md`](./privacy-policy.md)
- Operator obligations: [`terms-of-service.md`](./terms-of-service.md) §5
- Threat model adversaries these incidents map to:
  [`threat-model.md`](./threat-model.md) §3
- Security disclosure process: [`../SECURITY.md`](../SECURITY.md)
- Auto-confirm key rotation procedure: [`auto-confirm-key.md`](./auto-confirm-key.md) §6
