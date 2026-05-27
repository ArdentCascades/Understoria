# Understoria — Threat Model (v0.1, draft)

> **Status:** initial draft, Agent 4 workstream, Phase 1. This document is
> expected to be reviewed by at least three community members before being
> treated as ratified (per the Agent 4 acceptance criteria). It is a living
> document — revisit it every release.

---

## 1. Why this exists

Understoria is built for mutual aid networks and labor organizing
communities. The people using it often face real retaliation from
employers, landlords, and state actors. Threats here are not abstract.
Security and privacy are not features of this project — they are
pre-conditions for the project existing at all.

If this document ever feels like a compliance exercise, stop and re-read
it with a specific member in mind: the shop steward whose manager is
looking for a reason to discipline them, the tenant who can't afford to
be identified on a rent-strike roster, the undocumented community
member whose presence on any list could be catastrophic.

---

## 2. Assets we are protecting

1. **Membership lists** — who is part of the community at all.
2. **Relationship graphs** — who has helped whom, who has vouched for
   whom, who talks to whom.
3. **Activity history** — when someone posted, when they claimed, when
   they showed up.
4. **Communication content** — direct messages, group messages,
   organizing strategy discussions.
5. **Campaign data** — card counts, targets, timelines, power maps.
6. **Private-key material** — the root of a member's identity.
7. **Trust of the community in the software itself** — losing this is
   terminal.

## 3. Adversaries

Ranked roughly by likelihood × impact for our pilot contexts:

| # | Adversary | Goal | Capability |
|---|-----------|------|------------|
| 1 | Employer / management | Identify organizers; preempt action | Moderate: can subpoena, socially engineer, spy on workplace devices and networks |
| 2 | Union-busting firms | Same as above, plus disrupt | High: professional surveillance, infiltration budget, legal resources |
| 3 | Data breach / opportunistic attacker | Credential dumps, ransom, resale | High technical capability, no targeted knowledge |
| 4 | Law enforcement | Discovery in investigations, surveillance | Very high: legal compulsion, NSLs, device seizure |
| 5 | Platform operators (ourselves) | Good-faith mistake; compelled disclosure; compromise | Full access by definition; mitigate via minimal logging and compartmentalization |
| 6 | Infiltrator / bad-faith member | Gather intel; disrupt trust | Full member-level access once admitted |
| 7 | Intimate-partner or stalker | Track a specific member | Variable capability; often has physical device access |

## 4. Attack surfaces

- **Client device** — seizure, theft, screen-over-shoulder, malicious
  browser extensions, OS-level surveillance software.
- **Transport** — network monitoring (workplace WiFi, captive portals,
  ISP, state).
- **Server / node** — remote compromise, insider threat, legal
  compulsion, misconfigured hosting.
- **Federation layer** — a malicious peer node; replay; metadata
  harvesting from inter-node traffic.
- **Social** — infiltration, coercion, social engineering ("can you add
  my cousin, they're organizing too?").
- **Human factors** — screenshots shared in a group chat, members
  signing in on the office computer, burnout-driven oversharing.

## 5. Non-goals

We are not trying to protect against:

- A nation-state adversary with unlimited time and resources targeting
  a specific individual. Our goal is to raise the cost enough that
  broad dragnet surveillance is uneconomical and targeted attacks
  require physical access or coercion.
- Side-channel attacks on end-user CPUs. Out of scope for an
  application-level design.

## 6. Core mitigations (what's already in the architecture)

- **No email / phone on signup.** Identity is an Ed25519 public key
  held on the device. No central username directory. (Agent 2)
- **Client-side encrypted storage** via SQLCipher on nodes; IndexedDB
  data is paired with plans to move private-key material behind a
  passphrase-derived wrapper. (Agent 2)
- **Signed exchange transactions.** Every exchange is signed by both
  parties; any node can verify independently. No central ledger. (Agent 2)
- **Minimal server logging.** No IP addresses, no member identifiers,
  no request bodies. 7-day retention max. (Agent 4, task 4)
- **Federation via opt-in peering.** A node can disconnect at any time
  and keep functioning. No mandatory third parties. (Agent 3)
- **Compartmentalization.** Mutual aid data, organizing data, and admin
  data are separate trust tiers — compromise of one does not trivially
  grant the others. (Agent 4, task 5)
- **Panic button / data purge.** Admin-triggered wipe with soft
  (anonymize) and hard (delete) modes. Dead-man's-switch variant. (Agent 4, task 3)
- **Web of trust onboarding: IMPLEMENTED.** Signed single-use invite
  tokens (Ed25519), 14-day default expiry, revocable by the issuer
  pre-redemption. Redeeming a valid invite counts as the inviter's
  implicit vouch; a second manual vouch promotes the new member from
  `pending_trust` to `trusted`. Members below two vouches can still
  post needs and offers (solidarity-first onboarding) but are visibly
  flagged so the community can extend verification at its own pace.
  (Agent 2, tasks 2 and 3.)

## 7. Known gaps (tracked work)

- **Private-key storage: IMPLEMENTED.** Secret keys on a device can be
  wrapped with a passphrase-derived master key (PBKDF2-HMAC-SHA256 at
  600,000 iterations + NaCl secretbox / XSalsa20-Poly1305). The master
  key is held in session memory only; a tab close or explicit "Lock
  now" returns the device to a locked state. Enabling / changing /
  disabling protection lives in Profile → Security. Forgotten
  passphrases are unrecoverable by design — this is documented in the
  UI and on the lock screen. Argon2id remains a viable future
  migration; the blob format carries a `kdf` field for that.
- **E2E direct messaging: IMPLEMENTED.** Messages between members on
  the same node are encrypted with NaCl box (X25519 + XSalsa20-Poly1305).
  X25519 encryption keys are derived from Ed25519 identity keys via
  ed2curve (0.3.0, ~2 KB, depends only on tweetnacl). Each message uses
  a random 24-byte nonce from a CSPRNG. Messages are stored encrypted at
  rest in IndexedDB and decrypted on read. No server relay, no
  federation, no read receipts, no typing indicators — each of these
  would be a metadata leak. Metadata exposure: `conversationId`
  (deterministic from two public keys) and message timestamps are
  visible to anyone with device-level IndexedDB access. Messages are
  not recoverable if the member's secret key is lost.
- **Metadata leakage via federation.** Broadcast of need/offer to peers
  reveals category, zone, timing. Mitigation: opt-in per post, zone is
  already coarsened to neighborhood, no precise location.
- **No zero-knowledge exchange counts.** Selective disclosure is v1
  "signed summary from your own node" — a trusted-third-party model.
  True ZK is deferred.
- **Panic button (local): IMPLEMENTED.** Soft purge (anonymize all
  linkable text while preserving the signed exchange ledger and
  keypair) and hard purge (wipe every table, rotate to a fresh node
  identity) are both available in Profile → Emergency. Tested with
  a 50-member, 200-post fixture: completes in ~500 ms, well under the
  60-second acceptance target. Node-level purge and dead-man's-switch
  are still pending.
- **CSP / HSTS / cert pinning: PARTIALLY IMPLEMENTED.** The Fastify
  community node ships with helmet middleware (CSP with self-only
  defaults, HSTS, X-Frame-Options DENY-equivalent, Referrer-Policy
  no-referrer) and a non-reversible bucket id for rate-limit keying
  so client IPs never reach memory or logs. The PWA-only deployment
  path documents the matching Caddy header config. Certificate
  pinning in the PWA is still not implemented; tracked.

- **Safeguard thresholds and moderation workflow are not yet
  community-configurable.** Daily helper limits, short-exchange
  flags, and reciprocal-pair flags currently live as module-level
  constants in `apps/web/src/lib/safeguards.ts`. There is also no
  in-app surface for moderators to review flagged exchanges — the
  "surfacing each member's configured mirror URL in their profile so
  moderators can review" wording elsewhere in this document
  presupposes a queue we have not built. Phase 5 / Agent 11 moves
  the thresholds to per-node config; Phase 5 / Agent 12 adds the
  moderation queue and the action log it writes to. Until those
  ship, communities that need different thresholds or a moderation
  workflow must coordinate out-of-band per `GOVERNANCE.md` §5.

- **Configurable node URL can leak counterparty public keys.** When a
  member enables exchange mirroring in Profile → Community node and
  points at a URL, every exchange they participate in is POSTed to
  that URL — including the counterparty's public key, signature,
  category, hours, and timestamp. The counterparty has no veto over
  which destination receives the record.
  In practice the keys are already on the wire when the exchange
  happens (both parties hold the signed record), but a member can
  deliberately or accidentally leak the community's trust graph to a
  hostile observer at a chosen URL. A misconfigured operator could
  also point a whole community at an adversarial node by social
  engineering ("paste this URL into Profile → Community node").
  Mitigations not yet implemented: a community-blessed allowlist of
  node URLs, with the PWA refusing or warning on URLs outside the
  list; surfacing each member's configured mirror URL in their
  profile so moderators can review. The current safeguard is
  organizational: mirroring is off by default, and the URL field
  sits below an explanatory note that reminds members what gets
  sent. Tracked work.

- **Public task check-in chip reveals claim duration.** When a
  claimed task crosses both the `taskNeedsHelpDays` floor and
  the `taskCheckInGraceDays` silence window, a community-visible
  "could use more hands" chip appears on the task row. This is a
  new exposure surface: any member viewing the project page can
  infer that *some* member claimed this task a while ago and has
  been unresponsive to private check-in prompts.
  Mitigations already in place: the claimer's name is dropped
  from the public row once the chip fires (the task is
  "community work again"); the tooltip is non-numeric (no day
  count); the grace window means a claimer who is responding to
  private nudges will never trigger the public chip. The
  remaining exposure is structural: a task's *existence* on the
  "needs more hands" list is itself a signal about the claim
  lifecycle. This is deemed acceptable because the alternative
  (no community signal) leaves tasks silently stuck. Communities
  can tune or effectively disable the chip by setting
  `taskNeedsHelpDays` very high.

- **Proposal close button reveals closer timing.** When a member
  presses "Close as passed" on a proposal that has met consensus
  conditions, their action writes a `closedAt` timestamp.
  Federated peer nodes pulling proposals can observe this
  timestamp. The previous design (auto-close via `useEffect`)
  was worse: it fired on the first browser to load the page,
  leaking who-is-online-when by accident. The current design
  makes closing an intentional governance act — the member
  choosing to close is performing a visible community function,
  analogous to a meeting facilitator calling a consensus vote
  done. The `closedBy` field does not exist (no identity is
  recorded), so the exposure is limited to timing. Risk is low
  but worth noting for federation threat modeling.

## 8. Guidance for reviewers

When reviewing a pull request, ask:

1. Does this add a new data surface? Where does it live, for how long,
   and who can see it?
2. Does this add a new log line? Can it be removed? Can it be
   aggregated?
3. Does this add a dependency? What is its attack surface and how
   actively is it maintained?
4. Does this create a new privileged role? Is it rotatable? Revocable?
5. Does this undermine any core mitigation listed in §6?
6. Does this expose a new relational surface (who-helps-whom,
   who-operates-this-node, who-flagged-what)? If yes: is there a §7
   entry, is the default off, and has the exposure been gated through
   the Phase 5 governance / proposal process per
   [`docs/roadmap.md`](roadmap.md#privacy--threat-surface)?

If any answer is unclear, ask. The defaults favor the adversary.

## 9. Review cadence

- **Per-PR:** the questions in §8 are part of code review.
- **Monthly:** dependency audit, access review, log audit.
- **Quarterly:** walk through this document. Anything still true?
  Anything new?
- **Annually:** external review if resources allow.

## 10. Sign-off

This document becomes "ratified" when three community members — at
least one not involved in writing the code — have read it, asked hard
questions, and agreed it reflects reality. Record their names and the
date below.

| Reviewer | Date | Notes |
|----------|------|-------|
| _pending_ | | |
| _pending_ | | |
| _pending_ | | |
