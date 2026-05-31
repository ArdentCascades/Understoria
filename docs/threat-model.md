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

- **Federated task comments expose plain-text bodies.** Task
  comments (PRs #72–#73) federate the same way posts do — a
  comment authored on node A is signed by the author, POSTed to
  the community node via the outbox, fetched by peer nodes' pull
  workers, and surfaced in each peer PWA's local Dexie. The wire
  shape carries `projectId`, `taskId`, `authorKey`, `body` (up
  to 2 000 chars), `createdAt`, `deletedAt`, `nodeId`, and
  `signature`. Bodies are **not encrypted at rest** on the
  community node or in peer Dexie stores — same exposure model
  as posts and project announcements. Soft deletes federate via
  tombstone-wins merge (`deletedAt` is monotonic; once set
  anywhere, set everywhere — `COALESCE` keeps the first value).
  Mitigations in place: bodies are author-authored (the author
  chose to publish), tombstones replace the body in the UI with
  "(comment deleted by author)" so casual readers don't see the
  text after deletion. Mitigations *not* in place: encrypted
  comments (would require deriving a per-task or per-project key
  and distributing it — out of scope for the pilot), retention
  bounds (federated peers keep tombstoned bodies indefinitely).
  Risk: an author posts something sensitive, then realizes and
  soft-deletes — the row plus body survive on every peer that
  pulled it before the delete, including the server SQLite. This
  is documented in the in-app UI by the standard "what gets sent"
  language on Profile → Community node.

- **Comment flags carry a body snapshot that survives author
  delete.** Flagging a task comment (PR #74) creates a Proposal
  row with `kind: "dispute"` whose payload (a
  `CommentDisputePayload`) carries a snapshot of the comment's
  body, authorKey, and createdAt at flag time. The snapshot is
  intentional — community accountability outlasts the author's
  choice to soft-delete their own comment (otherwise an author
  could nullify a flag by deleting). Today this exposure is
  local-only: proposals don't federate. When proposals federation
  ships (tracked, no PR yet), the snapshot will federate too,
  and the exposure shape will match the federated-bodies entry
  above. Mitigation in place: flagging requires the flagger to
  type a (optional) reason via `window.prompt`, which is a
  speed-bump against accidental flagging. No anonymous flagging
  — the `proposerKey` on the proposal row is the flagger's
  public key.

- **Availability chips are local member-preference data
  (PR #78).** Members can optionally set 0–5 chips
  (`weekday_days` / `weekday_evenings` / `weekend_days` /
  `weekend_evenings` / `ask_me`) on their profile. Chips are
  stored on the `Member` row alongside `availability` free-text
  and `skills`. Chips render on the member's own offer cards,
  offer detail, and member detail pages. Exposure model:
  identical to the existing `availability` free-text field —
  visible to anyone with the member's local record, NOT
  federated. Cross-node members have no local Member record so
  chips never appear on cross-node posts (preserved by the
  existing `memberMap.get(...)` returning undefined for non-
  local authors). Soft purge clears chips alongside other
  identifying preference data. The threat model decision worth
  recording is what we explicitly chose **not** to build,
  because the temptation will recur:

  - **No fine-grained time grid** (e.g. 7-day × 30-minute
    editable windows). Even with no event metadata stored, the
    pattern of repeated unavailability leaks structural
    information about a member's life — "unavailable every
    Tuesday 6:30–8:00 PM for a year" implies therapy;
    "unavailable every Tuesday & Thursday 7–8 AM" implies AA;
    "unavailability shifts every week" implies fleeing DV. The
    coarse-bucket chip set is intentionally too wide for these
    inferences to land.
  - **No `.ics` calendar import.** Even stripping titles /
    descriptions / attendees / locations leaves the busy-block
    pattern, which is the actual leak. An import that
    *coarsens* upload data into the chip buckets would be safe;
    an import that preserves the precise time ranges would
    reintroduce the inference attack. If we ever ship import,
    it must coarsen, not preserve.
  - **No "available now" presence indicator.** Would require
    tracking when each member is online and broadcasting it.
    The project has no presence tracking, by design.
  - **No Board filter by chip set.** Would cross from
    coordination context into algorithmic ranking; once
    filterable, "people who don't match the asker's filter"
    becomes a class. The chips render where they help
    (pre-conversation context on offer cards) but never gate
    visibility.
  - **No federation of chips.** Member data doesn't federate
    today; chips ride along with that intentional locality.
    If member federation ships later, chips should be opt-in
    per-member and the pattern-leak analysis above re-applied.

- **Message search is local decrypt-and-scan, never an index
  or a directory.** Members can search inside an individual
  conversation and across the conversation list on `/messages`.
  Both operations decrypt-and-scan at query time using the
  current member's secret key — no plaintext search index is
  ever persisted to IndexedDB. A locked session disables search
  entirely (returns `[]` rather than partial results from the
  cache, so a casual observer can't probe for matches without
  the passphrase). The search surface only finds messages the
  member already has on this device — there is no cross-node
  message search, no federated index, no search across the
  member list to start a new DM (that would supersede the
  existing "messaging scoped to coordination context" entry
  below and require its own write-up). What an attacker with
  device-level access gains: nothing they didn't already have
  — once the device is unlocked, every message is decryptable.
  Pilot-scale (≤ ~5 000 messages) decrypt-and-scan completes
  in well under 100 ms; if we ever need to scale past that, the
  right next step is paged iteration, NOT a persisted index
  (which would undo encrypted-at-rest).

- **Messaging is scoped to coordination context, not a
  platform-wide social channel.** The "Reach out" button on
  `PostDetail` (PR #79) is anchored to a specific post — to
  message someone, you have to interact with a coordination
  artifact (need, offer) that exists between you. Once a
  conversation has started, it continues normally via the
  Messages list; the scoping applies to *initiation*. No
  Message button on `MemberDetail` (PR #79 added one; PR #80
  removed it on reflection). No directory search by name. No
  member-list browsing surface. Rationale: this is a mutual
  aid platform, not a social network — DMs that aren't
  anchored to coordination work drift the platform toward
  generic chat. Phishing/spam mitigation is the immediate
  threat-model angle: a hostile actor cannot enumerate the
  member list and DM everyone; they must engage with each
  member's specific posts. Any future entry point that allows
  initiating a conversation outside a coordination context
  (e.g. a "Message any member" search) must justify itself
  against this principle — propose the addition, weigh the
  social-drift and spam-vector cost, and only ship with an
  explicit threat-model entry that supersedes this one.

- **QR codes are camera-surveillance targets.** The invite share
  sheet (PR #91) renders the invite URL as a QR code so it can
  be scanned face-to-face. QR codes are *designed* for
  machine-readability — high-contrast pattern, error correction,
  no font rendering needed — which makes them the easiest
  possible target for off-the-shelf computer vision. Modern
  consumer cameras (workplace CCTV, doorbell cams, laptop
  webcams, library / café surveillance) capture at resolutions
  where a QR on a phone screen is decodable from 3–6 meters
  with no special hardware. For the populations this app is
  built for — organizers under camera surveillance by their
  own employer, tenants on cameras a landlord controls — this
  is a routine concern, not an edge case.
  The mitigation shipped on the QR is a deliberate
  awareness gate: the share sheet opens with the QR + URL
  *hidden* behind a plain-language prompt naming the threat
  ("Security cameras and webcams can read QR codes from across
  a room. Once it's on screen, anyone in camera view can save
  it…"). The member must explicitly tap "Show the invite" to
  reveal. The pause itself is the value — the app cannot see
  the room, so the member is the only one who can assess camera
  context. The gate re-prompts on every share (no persistent
  dismissal): the member's surroundings can change between
  sessions on the same device. An escape hatch ("Send the link
  without showing it") routes through `navigator.share()` /
  clipboard directly so the URL never appears on screen for
  cases where the member is sharing via Signal / Messages and
  doesn't need the visual at all. **The "Send the link without
  showing it" path is the visually-primary action on the gate**
  (PR after #94) — both the camera threat and the device-
  compromise threat are minimized when the URL never lands on
  the framebuffer; the on-screen reveal is the explicit "I
  trust this device and this room" path, not the default. The
  "send without showing"
  path runs a pre-flight check (`canShareUrl()`) for
  `navigator.share` OR `navigator.clipboard.writeText`; if
  neither is available (legacy browser, insecure context like
  `http://` in some contexts, locked-down permissions), the
  button is disabled with an inline explanation pointing the
  member at the manual-copy path instead. False confidence is
  worse than a clear "your browser can't do this — use the
  other path." Autofocus targets the safer-available button —
  the share-without-showing button when it's available, the
  Cancel button when it isn't — so a stray Enter ships safely
  or closes, never reveals. The URL is also
  OCR-readable in principle, just less reliably than the QR;
  it's behind the same gate.
  What we explicitly do NOT do: attempt camera-presence
  detection. The app has no way to see the member's
  environment, and pretending to would be false confidence
  worse than the current gate. Any future "auto-hide on
  inactivity / time-limited display" addition would need its
  own threat-model entry justifying why it doesn't disadvantage
  slow scanners and members with motor impairments.

- **Device-level compromise is out of scope.** The camera-gate
  entry above protects against an *external* observer (CCTV,
  doorbell cam, line-of-sight surveillance). It does NOT
  protect against an attacker who already has code execution
  on the same device: malware, stalkerware, browser extensions
  exfiltrating page content, employer-installed monitoring
  software, screen-recording suites, OS-level capture tools.
  Any of these can read the QR code, the URL, the member's
  passphrase as it's typed, the messages in clear view, the
  exchange details, the entire app. The threat is real and
  routine for the populations we serve — workplace MDM,
  parental-control software, jealous-partner stalkerware — but
  **web apps have no API to defend against it.** Native iOS /
  Android apps can set `FLAG_SECURE` /
  `UIView.isSecureCoded` to block screenshots and screen
  recording at the OS level; PWAs in browsers have no
  equivalent. None of the alternatives work: DRM-style hacks
  (Encrypted Media Extensions) only block video DRM, not
  arbitrary content; flickering / rapid redraw defeats
  accessibility and slow scanners and is trivially bypassed by
  any malware capable of recording at > 2 FPS; CSP / sandboxing
  protects against page-injected scripts, not the user's own
  OS.
  We do **not** ship "screenshot protection" or "secure mode"
  framing for this reason. Members who trust such framing would
  lower other defenses (sharing screens more readily, opening
  the app on devices they wouldn't otherwise trust). The
  project's
  job is to raise costs and be honest about its boundaries, not
  to promise impossible guarantees. The opsec guide's "Trust
  the device, or don't open the app" item is the actual
  mitigation: clean device, clean OS, no unfamiliar
  extensions, in your physical custody since last reset. The
  panic-button path (Profile → Emergency → Hard purge) is the
  response when compromise is suspected, rotating to a fresh
  identity. Any future
  proposal that would imply otherwise (a "secure share mode," a
  watermark overlay, an animated QR, etc.) supersedes this
  entry and needs to explain how it doesn't create the false-
  confidence problem named above.

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
