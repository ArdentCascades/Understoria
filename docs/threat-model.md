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
- **Encrypted storage on nodes: IMPLEMENTED.** For most of the
  project's life this bullet claimed SQLCipher aspirationally while
  the server ran plain SQLite. It is now real: the node's driver is
  better-sqlite3-multiple-ciphers, and setting `DATABASE_KEY` keys
  the database (SQLCipher scheme) so the file at rest — the seized
  disk, the stolen backup, the retired SD card — is unreadable
  without it. Protects the powered-off artifact, not a live-rooted
  host (the key is in the process env). Rollout + plaintext-DB
  migration: operator guide; design:
  `docs/member-authenticated-reads.md` §2. IndexedDB private-key
  material sits behind the shipped passphrase wrapper. (Agent 2)
- **Member-authenticated reads: IMPLEMENTED (staged).** Joining was
  always invite-gated; READING was not — any holder of the node URL
  could pull every feed. With `READ_AUTH=on`, federation GETs
  require a signed member read (membership proven by the
  founder-rooted redemption-receipt chain, no separate register) or
  a configured peer token. Full entry in §7; design:
  `docs/member-authenticated-reads.md`. (This review)
- **Signed exchange transactions.** Every exchange is signed by both
  parties; any node can verify independently. No central ledger. (Agent 2)
- **Minimal server logging.** No IP addresses, no member identifiers,
  no request bodies. Retention is bounded by size, not time: the
  shipped compose file caps each container at three rotating 10 MB
  log files (~30 MB max), which a busy node cycles through in hours
  but a quiet node can retain for well over a week; deployments
  outside the provided compose file get no cap unless the operator
  configures one. (Agent 4, task 4)
- **Federation via opt-in peering.** A node can disconnect at any time
  and keep functioning. No mandatory third parties. (Agent 3)
- **Compartmentalization.** Mutual aid data, organizing data, and admin
  data are separate trust tiers — compromise of one does not trivially
  grant the others. (Agent 4, task 5)
- **Panic button / data purge.** Member-triggered local wipe with
  soft (anonymize) and hard (delete) modes, in Profile → Emergency.
  The dead-man's-switch variant is NOT built — still pending, with
  node-level purge (§7). (Agent 4, task 3)
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
  disabling protection lives in Settings → Security. Forgotten
  passphrases are unrecoverable by design — this is documented in the
  UI and on the lock screen. Argon2id remains a viable future
  migration; the blob format carries a `kdf` field for that.
- **Passkey unlock: IMPLEMENTED (an additional method, never the only
  one).** A member can enroll a platform passkey (Settings →
  Security) whose WebAuthn `prf` extension output — 32 high-entropy
  bytes released only after the platform's user verification
  (biometric / device PIN) — is HKDF-SHA256-derived into a key that
  wraps the device master key. Enrollment migrates the device to an
  envelope layout: secret-key rows wrapped by a random device master
  key, the master key wrapped once per unlock method (passphrase
  PBKDF2, passkey PRF), so changing one method never touches the
  other. What this changes and doesn't: the Ed25519 identity and all
  record signing are untouched (WebAuthn cannot sign canonical
  payloads); nothing new reaches any server — the wrappers record is
  device-local and excluded from export, and the ceremony is fully
  offline (no relying-party round-trip, so unlock works at a storm
  hub or with no network at all). Trade named honestly: the
  biometric replaces the knowledge factor, so anyone enrolled in the
  device's OS biometrics/PIN can unlock — the same exposure class as
  a shoulder-surfed passphrase, delegated to the platform.
  Invariants enforced in code: enrollment requires passphrase
  protection already on, and disabling the passphrase refuses while
  a passkey is enrolled — a lost or platform-reset passkey can never
  lock a member out of their own identity. The credential's user
  handle is random, deliberately NOT the member's public key, so the
  platform credential store learns nothing linking the passkey to
  the federated identity. Phase 2 — passkey-based identity RESTORE
  via a node-held encrypted vault — is a design proposal only
  (`docs/passkey-restore.md`), not built: it would change what the
  node stores and make the member's platform account a recovery
  root, so it awaits a community decision.
- **E2E direct messaging: IMPLEMENTED, node-relayed**
  (docs/message-relay.md). Messages between members on the same node
  are encrypted with NaCl box (X25519 + XSalsa20-Poly1305). X25519
  encryption keys are derived from Ed25519 identity keys via ed2curve
  (0.3.0, ~2 KB, depends only on tweetnacl). Each message uses a
  random 24-byte nonce from a CSPRNG. Messages are stored encrypted
  at rest in IndexedDB and decrypted on read. Delivery is a
  store-and-forward relay through the community node: the sender's
  device pushes the sealed envelope (sender-signed so the node
  refuses spoofed senders), the node holds it for a bounded retention
  window (`MESSAGE_RETENTION_DAYS`, default 30, then pruned), and the
  recipient's devices fetch it via a read that cryptographically
  proves the recipient key — one member's proof can never fetch
  another member's envelopes, independent of the READ_AUTH setting.
  (An earlier revision of this entry said "no server relay, no
  federation" — that made the feature undeliverable between real
  devices, which surfaced the moment two pilot members tried it; the
  in-app FAQ had promised the relay all along.) **Metadata exposure,
  stated plainly:** the node operator's disk sees who messaged whom,
  when, how often, and envelope sizes — inherent to any relay and
  bounded by the retention window plus the minimal-logging policy
  (§6). Contents and the which-post-is-this-about reference stay
  sealed (the reference rides inside the ciphertext). Envelopes do
  NOT mirror-replicate and never cross to peer nodes. Still no read
  receipts, no typing indicators. `conversationId` (deterministic
  from two public keys) and message timestamps remain visible to
  anyone with device-level IndexedDB access. Messages are not
  recoverable if the member's secret key is lost.
- **Voice content: IMPLEMENTED, two deliberately different postures**
  (2026-07, voice workstreams V1–V4). *Voice notes in direct
  messages* ride the same sealed envelopes as text (a v3 plaintext
  envelope carrying the audio bytes, docs/message-relay.md §10) — the
  node sees only the relay metadata stated above, though a voice
  note's larger envelope size makes it distinguishable from a short
  text message. *Voice posts on the board* are the opposite by
  design: board content is community-public, so the recording is
  stored unencrypted in the node's content-addressed blob store
  (`audio_blobs`, docs/voice-board.md) where the operator — like any
  member — can listen. A recording carries the member's actual voice,
  a stronger and less deniable identifier than typed text; the
  member-guide says this plainly at the point of posting. Audio blobs
  are size-capped (400 KB), covered by the per-key insert caps, do
  NOT federate to peer nodes (deferred to workstream V8, #478), and
  board voice references are scrubbed by the same purge paths as the
  posts that carry them.
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
  pinning is not an application-code item: browser PWAs cannot pin
  certificates from JavaScript (HPKP is deprecated and removed from
  browsers; certificate validation is the browser's and OS's
  responsibility). The operative mitigation is HSTS, which already
  ships — the Fastify node registers `@fastify/helmet`, and the
  PWA-only path documents the matching Caddy headers. The one
  remaining step is a deployment task, not an app task: submitting
  the production domain to the HSTS preload list.

- **Safeguard thresholds are community-configurable; the moderation
  workflow is not yet built.** Daily helper limits, short-exchange
  flags, and reciprocal-pair flags now live in per-node `NodeConfig`
  (Phase 5 / Agent 11, shipped) and are read from config by
  `apps/web/src/lib/safeguards.ts` — the module-level constants
  remain only as defaults. A community edits the three thresholds in
  Profile → Community settings, so rules can fit local conditions
  without a code change. What is still missing is the moderation
  side: there is no in-app surface for moderators to review flagged
  exchanges — the "surfacing each member's configured mirror URL in
  their profile so moderators can review" wording elsewhere in this
  document presupposes a queue we have not built. Phase 5 / Agent 12
  adds that moderation queue and the action log it writes to. Until
  it ships, communities that need a moderation workflow must
  coordinate out-of-band per `GOVERNANCE.md` §5.

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
  Mitigation now shipped: an informed-consent gate. The PWA requires
  an explicit confirmation — naming the data sent (counterparty public
  key, signature, category, hours, timestamp) and the trust-graph-leak
  risk — before mirroring is enabled or retargeted to a different URL.
  This is consent, not prevention: it defeats accidental and social-
  engineered misconfiguration, but a determined or deceived member can
  still confirm. See `apps/web/src/lib/mirrorConsent.ts`.
  Deferred, with reasoning:
  (i) The community-blessed allowlist of node URLs is deferred to
  post-pilot. A robust version needs a federation trust anchor — a
  list *served by the target node* is worthless against a malicious
  target that simply attests it is allowed. Design options and the
  recommended approach are spelled out in
  `docs/federated-node-allowlist.md`.
  (ii) "Surface each member's configured mirror URL to moderators" is
  itself a metadata leak — it broadcasts where each member mirrors —
  so it is deliberately not built.
  The current organizational safeguard remains in place: mirroring is
  off by default, and the URL field sits below an explanatory note
  that reminds members what gets sent.

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
  done. Since proposal federation G1, the closure record carries
  `closerKey` and a signature — closing is an ATTRIBUTED public
  act inside the community, deliberately (the same open-ballot
  posture as votes; see the proposal-federation entry in §7). The
  exposure is identity + timing, inside the community only.

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
  could nullify a flag by deleting). Since proposal federation
  G1/G2, flag proposals sign at creation (post-commit, the
  flagger's own row) and federate — the snapshot now travels with
  them, and the exposure shape matches the federated-bodies entry
  above: the snapshotted body survives on every device and node
  that pulled the proposal, beyond the author's soft-delete. Mitigation in place: flagging requires the flagger to
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

- **Device pairing widens the identity-key surface.** The
  device-pairing flow (`docs/device-pairing.md`) is the only
  shipped path by which a member's Ed25519 secretKey leaves the
  device it was generated on. The threat surface is broader
  than the invite QR's because the QR encodes identity material,
  not a single-use join token: an attacker who captures both the
  envelope (via camera) AND the 6-word transfer passphrase
  (overheard, or seen on the source device's screen) gets
  everything — display name, history, the ability to sign as
  the member — for 5 minutes.
  The mitigations are layered, each addressing a distinct
  capture path:
  (a) **Comparison card before any QR.** The flow opens with an
  explicit listing of what does and doesn't transfer. Members
  decide whether to pair before identity material is rendered.
  (b) **Camera-awareness gate**, identical to the invite-QR
  gate but with sharper copy naming the 5-minute replay window.
  No "send without showing" hatch of the invite kind; a narrower
  **envelope-only copy hatch** exists behind its own disclosure
  (see the revision note below and `device-pairing.md` §6.3).
  (c) **Fresh per-transfer passphrase.** Source device generates
  a 6-word BIP39 passphrase, ~66 bits of entropy. Member never
  picks it; clipboard-copy is not offered (clipboard managers
  persist). Conveyed by reading aloud or typing.
  (d) **5-minute hard expiry.** `expiresAt` is in the wrapped
  plaintext and enforced on the destination after a successful
  unwrap. A captured QR is useless after the window even with
  the passphrase.
  (e) **No server-side state — REVISED TWICE.** The default
  transport is now tap-to-link (`device-pairing.md` §6.7): the new
  device posts an ephemeral PUBLIC key (nothing else) as a link
  request bucketed by a salted 4096-way fold of its network address
  (10-minute TTL; raw IPs never stored — same posture as the rate
  limiter); the member's signed-in device lists same-bucket
  requests and, on an explicit tap, seals the transfer payload to
  that key through the one-shot mailbox (ciphertext only, atomic
  take, 15-minute TTL, non-federating). Named residuals, ranked:
  (1) **a malicious node operator can substitute the fetched public
  key and capture a transfer the member approves** — the two-emoji
  recognition badge is 12 bits and grindable, so it defends against
  same-network pranksters, NOT the server itself; linking therefore
  trusts the community's own node for those minutes, and members
  who don't extend that trust are pointed at the QR path (zero
  server involvement), which remains one tap away. (2) Same-bucket
  strangers can surface an impersonation request (guards: badge
  match named in the approve copy, request age, explicit-choice
  list when several are pending, 3-per-bucket cap) or send the
  waiting device a junk identity — never the member's own, which
  this direction cannot leak (guard: the success screen leads with
  the imported display name + a two-tap full local wipe). (3) The
  §6.6 word-relay fallback keeps its own residual: while its
  mailbox row lives, the six words are a bearer credential, and the
  node holds a PBKDF2-600k × ~66-bit brute-force target. The
  positive flip side, also named: in tap-to-link **nothing shown on
  either screen is sensitive** — the QR-era camera-capture threat
  does not exist on the default path, and no identity moves without
  a deliberate tap on the already-trusted device.
  (f) **Component-state-only on the source.** Envelope and
  passphrase live in React state only. No localStorage,
  sessionStorage, or IndexedDB write. Cancel / route-change /
  auto-dismiss drops the state.
  Rejected alternatives, each with the reason:
  - **Server-stored wrapped envelope** — ADOPTED, in bounded form
    (the §6.6 link transport above). The pilot signal arrived: QR
    transfer WAS too inconvenient in practice (same-phone pairing
    can't scan its own screen; iOS clipboard transport is
    unreliable). The bounds that make it acceptable: ciphertext
    only, one-shot, 15-minute TTL, non-federating, channel id as
    expensive to reverse as the envelope key. The passkey-PRF
    variant (durable server storage keyed by a platform
    authenticator) remains future work.
  - **Real-time ack channel** (long-poll, WebRTC, BroadcastChannel)
    would put pairing state on the server or a third party. The
    "I'm done" button is a member assertion, not a system
    confirmation; the 5-minute auto-dismiss is the actual
    security property.
  - **"Send without showing" hatch** of the kind the invite QR
    uses — REVISED, partially. v1 rejected all clipboard routing,
    but that left the destination's paste fallback with no
    sanctioned source and made phone→desktop pairing
    camera-or-nothing. As shipped: the display screen offers a
    gated **copy hatch for the wrapped envelope only** — the
    passphrase is never copyable, so both halves cannot travel one
    channel by our hand. The disclosure names clipboard-manager
    persistence and cross-device clipboard sync before the button
    exists; on expiry / wizard exit the clipboard is cleared
    best-effort (read-compare-clear — never clobbers a later
    copy; browsers may deny both calls, and the clear is hygiene
    on top of the passphrase wrapping + expiry, not the boundary).
    Accepted residual: a synced clipboard (e.g. OS cloud
    clipboard) may relay the wrapped envelope through its vendor;
    the envelope is PBKDF2-wrapped (HMAC-SHA256, 600k iterations,
    the shared `deriveMasterKey` helper) under ~66 bits of passphrase
    the vendor never sees. Still rejected: any *shareable URL*
    form of the envelope — links transit chat threads (persistent
    logs, previews, and the near-certainty the six words follow in
    the same thread); copy-paste is device-local, a link is a
    message.
  After successful pairing, both devices hold the same identity.
  This is a deliberate design choice, not a bug:
  Ed25519 has no in-protocol revocation, so a stolen paired
  device is recoverable only by the existing hard-purge (rotate
  identity, lose history attribution). Members are told this
  on the comparison card; the privacy-policy §3 amendment names
  the device-pairing exception explicitly. DM history does NOT
  transfer (DMs are E2E to specific device keys); a brief
  "what to expect" reminder on the destination device after
  import names this so it isn't a surprise.
  A local-only **paired-device inventory** on Profile (see
  `docs/device-pairing.md` §9.1) records each completed pair —
  source or destination — with a member-provided label. It is a
  memory aid for the "I forgot I paired Aunt's laptop" case and
  gives the destination-side surface a chance to flag an
  unexpected entry. It is NOT a defense: an attacker who already
  has the key bytes never runs the destination flow, so no row
  appears for a silent re-import; and there is no per-row revoke
  (Ed25519 has no revocation primitive). The only remediation is
  still hard-purge, which clears the inventory alongside the
  identity.

- **Co-organizer role requires signed invitation + signed
  acceptance (shipped).** Before this design landed, the primary
  organizer of a project could call the legacy `addCoOrganizer`
  function in `apps/web/src/db/projects.ts` and write the new key
  directly into `Project.coOrganizerKeys` — no consent step from
  the invitee. The legacy function was removed in PR #218 once the
  signed-invitation flow was fully shipped. The design in
  `docs/co-organizer-invitations.md` replaces it with two
  federated record types (`CoOrganizerInvitation` signed by the
  inviter, `CoOrganizerInvitationResponse` signed by the invitee)
  and makes
  the role effective only when an accepted response exists. This is
  a **values fix**, not a new mitigation — co-organizers were
  already a trust position with the same metadata visibility as a
  vouch. The change tightens audit-trail provenance (every
  co-organizer role grant now has an end-to-end-verifiable
  acceptance signature) and closes the conscription gap
  (signed records imputed to a member trace back to that member's
  deliberate act). What it does **not** defend against: an organizer
  sending an invitation under coercion; the invitee accepting under
  coercion; pre-existing unilateral additions, which grandfather as
  accepted because the alternative would silently strip authority
  from members exercising the role in good faith. No new key
  material, no new public exposure. Pairs with the complementary
  self-removal fix (`fix/coorganizer-self-removal`), which addresses
  the trapped-co-organizer half of this values gap. The full flow
  is shipped: signed invitations, responses, and revocations in
  `apps/web/src/db/coorgInvitations.ts` with matching server routes
  and federation pull, authority reads reconciled onto the
  materialized signed-acceptance array, and the legacy unilateral
  `addCoOrganizer` removed (PR #218).

- **Calendar aggregation as a faster surveillance surface.**
  The community calendar (`docs/calendar.md`) collapses
  date-shaped data already present in `Project`, `Post`, and
  `Exchange` records into a single time-spatial view. For an
  adversary with limited time to enumerate, this reduces the cost
  of building a picture of "what is this community doing in
  November" from "walk every project page" to "open the calendar
  tab." The data itself is not new — anyone who can already see
  the Board can see expiry dates; anyone who can see a project
  page can see its deadline. The change is presentation, not
  exposure.
  Mitigations, each addressing a distinct exposure path:
  (a) **Local aggregation only.** `lib/calendar.ts` runs in the
  PWA on data already loaded by federation pull. No new server
  endpoint, no new federated record type, no schema migration.
  Nothing the server logs changes; `LOG_REQUEST_PATHS=false`
  (server default) keeps the calendar's request shape unlogged
  like every other page.
  (b) **No member-level aggregation by default.** v1 never groups
  entries by who-they-belong-to. A "Mine" filter exists and
  shows ONLY the viewing member's own data — their own
  authored posts, their own organized projects, their own
  exchanges. A `/member/X/calendar` per-member time-spatial
  view is explicitly out of scope and named as a rejected
  alternative in `docs/calendar.md` §10.5.
  (c) **No availability or location-zone projection.** Profile
  fields (`availabilityChips`, `locationZone`) already appear on
  the member's own profile and on their posts. They do NOT get
  projected onto specific dates on the calendar — that would
  turn coarse availability into a stalking surface ("X is in
  zone Y, available Tuesday evenings"). Profile is the right
  home for availability; the calendar is the wrong amplifier.
  (d) **No recurring-task materialization.** Today the cadence
  of a recurring template task lives in description text
  (`projects.templates.recurringSuffix.<cadence>`). Parsing
  localized strings back into structured cadences to project
  virtual entries forward in time is rejected in v1 — both
  because it's fragile and because materializing weekly /
  monthly cadences would amplify the surveillance shape of
  "this happens every Tuesday at this place." A future PR may
  promote `recurringCadence` to a first-class field on
  `ProjectTask` with its own threat-model entry covering the
  projection surface.
  Rejected alternatives with reasons (full enumeration in
  `docs/calendar.md` §10.5):
  - **iCal subscription URLs.** No authentication boundary; any
    URL holder pulls full schedule data. Surveillance escape
    valve.
  - **Per-member calendar URLs.** Per-member time-spatial
    aggregation is a stalking surface; no values win.
  - **Server-rendered ICS feed via federation.** Federation
    surface widens for a low-value feature.
  What this does NOT mitigate, said plainly: the calendar makes
  scanning the same data faster. It does not protect against an
  adversary who was going to enumerate the project pages anyway.
  Saying this in the threat-model entry avoids overclaiming
  protection that the design does not provide.

- **Federated `Event` records widen the public wire surface.**
  *Shipped — `Event` and `EventCancellation` ride the federation
  layer; `EventRSVP` stays local-only per the §4.2 carveout.*
  The community-events design (`docs/community-events.md`)
  introduces two new federated, signed record types — `Event` and
  `EventCancellation` — to let members
  put skillshares, potlucks, work days, and meetings on the
  community calendar as first-class entries. This is a wire-surface
  widening over the existing calendar entry above: the calendar
  collapses *already-federated* fields (`Project.deadline`,
  `Post.expiresAt`) into one view, whereas events introduce *new*
  fields that did not previously cross any wire.
  New wire fields on `Event`, each described in the shape this §7
  uses:
  - `title` (free text, ≤ 200 chars) — visible on every peer. The
    member chose to publish it; same exposure model as a `Post`
    title.
  - `description` (free text, ≤ 2000 chars) — same exposure model as
    `Post.description` and `TaskComment.body`. Not encrypted at rest.
  - `category` — visible on every peer; same shape as existing
    post / project categories.
  - `location` (FREE TEXT, ≤ 200 chars) — visible on every peer. NOT
    a GPS coordinate, NOT a structured address. The free-text shape
    is a deliberate mitigation: "Community room, 3rd floor" is the
    intended granularity, not "47.6062 N, 122.3321 W." A
    coordinate-pair location field would be a stalking-grade
    location signal on a public federated wire; the free-text field
    lets the organizer decide what level of specificity to publish.
  - `startsAt`, `endsAt` (epoch ms, UTC) — visible on every peer.
    Same shape as existing project deadlines and post expiries.
  - `capacity` (integer or null) — visible on every peer. A soft cap,
    not a count of who has RSVP'd.
  - `signature`, `createdBy` (organizer pubkey), `nodeId`,
    `createdAt`, `id` — same shape as every other signed record.
  Adversary mapping (§3 rows benefiting from this new exposure):
  - **Row 1 (Employer / management).** "Organizer X holds a
    skillshare on Y category at location Z on date T" lets an
    employer correlate workplace organizing activity with
    after-hours gatherings. If location string is a recognizable
    union hall or organizing meeting venue, the inference is direct.
  - **Row 2 (Union-busting firms).** Professional surveillance
    correlates organizer pubkeys (already exposed via existing
    `Vouch`, `Post`, `Exchange` records) with new
    location-and-time fields. The federation pull is the harvest
    mechanism; events are the high-signal payload.
  - **Row 7 (Intimate-partner / stalker).** "Member X is at
    location Z on Saturday at 2 PM" is the canonical stalking
    signal. Free-text location reduces but does not eliminate this:
    an organizer who consistently uses the same venue string leaks
    that venue.
  Mitigations baked in (full design rationale in
  `docs/community-events.md` §§4, 6, 7):
  (a) **RSVPs are LOCAL ONLY.** `EventRSVP` is a Dexie row that
  never enters the outbox. The discriminator `"EventRSVP"` MUST NOT
  appear in `OutboxRow.kind`. There is no `POST /event-rsvps` route.
  This closes the federated-attendance-graph surveillance vector:
  the public peer wire never carries "key X is attending event Y."
  An adversary harvesting the federation sees that the event exists
  and who organized it; they do NOT see who is going. This is the
  load-bearing decision in the events design, and it is settled at
  the architecture layer rather than left as a per-deployment switch
  because a per-deployment switch would be a foot-gun the moment a
  community misconfigures it. Mirrors the `Post.claimedBy` pattern:
  signed records federate; local rosters do not.
  **(a) SUPERSEDED IN PART** by participation federation Phase 2
  (docs/project-federation.md §6): RSVPs now DO travel through the
  member's own community node — the reversal, its bounds (community
  node only, never the cross-node peer wire), and its adversary
  re-mapping are in the "Federated participation records" entry near
  the end of this section. Mitigations (b)–(d) below, the venue
  residual, and the permanent exchange-label boundary all survive
  unchanged.
  (b) **Attendee roster is tiered, with an informed-consent surface
  on the RSVP control.** Non-RSVP'd members on the same node see a
  count only, not names. Peer-node viewers see neither names nor
  counts (the count renders as "not visible from this node" with an
  affordance to RSVP at the organizer's node, per
  `community-events.md` §7.3). The organizer and members who have
  RSVP'd "going" or "maybe" see names. The RSVP control's expanded
  card surfaces the visibility consequence *before* submission —
  same informed-consent discipline as the co-organizer invitation
  comparison card and the device-pairing comparison card. A member
  who changes their RSVP to `not_going` is removed from the visible
  roster immediately, no delta exposed.
  (c) **Free-text location, no GPS pin, no structured address.** A
  structured location field would invite phone-keyboard
  autocomplete from the device's address book / map app and
  normalize publishing precise locations. The free-text shape keeps
  the granularity decision in the organizer's hands and keeps
  adversaries guessing about specifics.
  (d) **No member-pattern aggregation across events.** The calendar
  renders events on the per-day grid (per `community-events.md` §9)
  but does NOT add a per-member event-attendance aggregate — no
  "members who attended these N events" view, no per-member event
  history page. The same posture as the calendar's per-member
  rejection (`calendar.md` §10.5).
  Residual risk acknowledged honestly: an organizer who
  *repeatedly* hosts events at the same location does leak that
  location pattern. Three events at "Community room, 3rd floor"
  triangulate to a specific community room as effectively as a
  single coordinate would. The right mitigation here is operator
  and community guidance — opsec-guide.md and member-guide.md
  should name "rotate venue strings, or use a generic locator like
  'address sent on confirmation'" as a privacy practice for
  high-risk events. A technical lock (e.g., refusing to publish an
  event if the location string matches a prior event's) would be
  too coarse and would break legitimate weekly-skillshare cadences.
  Pilot communities decide their own threshold; the doc is honest
  about the limit.
  No browser push notifications on this surface (cited:
  `no-notifications` principle in `community-events.md` §8 and
  §11.4) — events surface on pull-only attention rails, never on
  OS-level notification surfaces that would create their own
  disclosure to anyone with device access. iCal export is deferred
  to phase 2 as opt-in only (cited: `calendar.md` §10.5's
  "surveillance escape valve" framing, re-applied in
  `community-events.md` §11.5).
  A member-initiated single-event `.ics` export exists per
  `community-events.md` §11.5a (client-side, on-demand, no server
  route, no subscription URL): the file contains only what the
  member already sees on the event detail screen (never RSVP data),
  and once downloaded or imported into a device calendar it sits
  outside the app's soft/hard-purge reach — a consequence of the
  member's own export choice, named plainly in the member guide.
  Implementation shipped in PRs #186-#192 per
  `community-events.md` §13; this entry describes the surface as
  it now exists on the wire.
  Project work days (the event⇄project link, `community-events.md`
  §10.1) do NOT widen this surface: the link is a local-only Dexie
  row, the `"event_project_link"` discriminator is rejected at the
  `OutboxRow.kind` type level, and no new bytes cross any wire. A
  linked event federates as a plain event — identical on the peer
  wire to one created without a project. The only thing that can leak
  a project↔event correlation is the organizer's own editable
  free-text title, decided in front of the §3 signing card; no
  `projectId` correlator is ever published.
  Shift signups (`docs/shift-signups.md`) originally did NOT widen
  this surface: shift definitions and signups shipped as local-only
  Dexie rows in the `EventRSVP` posture, with the `"event_shift"` and
  `"shift_signup"` discriminators rejected at the `OutboxRow.kind`
  type level. **That too is SUPERSEDED IN PART** by the same Phase 2
  entry: shift structure and signups now reach the member's own
  community node (never the peer wire), because a slot roster only
  one device can see cannot coordinate anything. The reasoning this
  paragraph recorded — shift structure is an operational schedule,
  a signup is per-slot attendance intent — is precisely what the
  Phase 2 entry weighs and accepts, with its bounds.
  One permanent boundary, recorded here so it stays visible to
  contributors reading the threat model rather than the design note:
  **no `Exchange.postId` label may ever encode an event id, shift
  id, or any event-derived identifier.** Exchanges federate, and
  such a label would publish "member X exchanged hours in connection
  with event Y, slot Z" — signed by both parties, permanent, public:
  the federated attendance graph rejected in `community-events.md`
  §11.1, rebuilt through a side door. The shift credit bridge is
  prefill-only (`shift-signups.md` §9.3): the resulting exchange is
  indistinguishable on the wire from one recorded with no shifts
  involved, and nothing may ever reconcile the signup roster against
  exchanges (that comparison is the attendance tracking
  `community-events.md` §11.6 permanently rejected). The sanctioned
  alternative for gathering-adjacent (and spontaneous) credit is the
  **`direct:` label namespace** (`docs/direct-exchange-label.md`,
  adopted): `direct:` + a freshly random uuid, derived from NOTHING —
  the pressure-release valve that makes the boundary livable. The
  plain-event shift affordance prefills the ceremony FORM only
  (hours, category); the recorded exchange carries the random label,
  the grammar is locked by `isDirectExchangeLabel` + tests, and a
  suffix that smuggles structure (`direct:event-123`) is refused by
  every consumer.

- **Member blocking is a local-only personal-relief surface.**
  *Shipped — `Block` and `previouslyBlocked` are local Dexie rows;
  the `"block"` discriminator is rejected at the `OutboxRow.kind`
  type level per PR #195.*
  The member-blocking design
  (`docs/blocking.md`) introduces a single Dexie record type —
  `Block` — that lets a member stop unwanted interaction with
  another specific member. The load-bearing decision is that
  `Block` rows are **local to the blocker's device cluster**, are
  never signed, never enter the outbox, never federate, and are
  excluded from data export. Same architectural posture as
  `EventRSVP` (see the prior §7 entry).
  What it is, in the shape this §7 uses:
  - `Block` row carries `id`, `blockerKey`, `blockedKey`,
    `createdAt`, `hideGovernance: boolean` (per-block governance
    visibility choice — see `blocking.md` §3.2 and §6), and a
    private `note: string | null` field (≤ 500 chars) for the
    blocker's own reference. No `signature`, no `nodeId`.
  - A separate `previouslyBlocked` row (local-only, same posture)
    records pairwise unblock history for the blocker's reference.
    Wiped on soft-purge.
  - The discriminator string `"block"` MUST NOT appear in
    `OutboxRow.kind`. PR B in `blocking.md` §13 asserts this with
    `@ts-expect-error` at the type level; PR C asserts the
    runtime equivalent in `events.test.ts`-shape unit tests.
    There is no `POST /blocks` route. There is no
    `GET /blocks?since=` cursor. There is no PWA-side
    `pullFederatedBlocks`. The federation layer has no knowledge
    of these types.
  What it defends against: the blocker's experience of unwanted
  DMs, post claims, vouches, co-organizer invitations, and event
  RSVPs from a specific other member. The blocker stops seeing
  the blocked party's posts, projects, events, vouches, and task
  comments in their feed and surfaces, per the consumer-surface
  table in `blocking.md` §6. Generic-error discipline is
  load-bearing: every blocked-from action returns the same
  generic "not available" / "not found" error a withdrawn-post or
  cancelled-event action would return — never block-specific
  copy. This preserves the shadow-on-blocked-side posture
  (`blocking.md` §6.1).
  What it does NOT defend against:
  - A determined blocked party using a peer node's PWA to view
    federated public content from the blocker. The blocker's
    posts, projects, events, and vouches federate normally and
    are visible to any peer-node viewer; block does not withdraw
    federated content from the wire. This is the federation
    property, not a leak (cited: `blocking.md` §7.1).
  - An attacker who has already harvested federation traffic.
    Past federated content already exists on the wire; block has
    no retroactive effect.
  - A stalker who already has device access to the blocker's
    cluster. The blocker's local `blocks` and
    `previouslyBlocked` tables are visible to any code with
    storage access on the blocker's device. Mitigated by the
    same posture as every other local Dexie surface: passphrase-
    wrapped private key, soft-purge / hard-purge from
    Profile → Emergency.
  - Mob-block aggregation as a social signal — which doesn't
    exist because blocks are never aggregated, exposed, or
    counted. There is no surface (member-facing, operator-facing,
    or otherwise) that says "X has been blocked by N people."
    The §8 incident template in `docs/incident-templates.md`
    documents the operator response when the operator becomes
    aware, through members voluntarily disclosing, that a
    community-role holder is the subject of widespread blocks:
    route to `GOVERNANCE.md` §3 (rotation) and §5 (appeals); do
    NOT depeer; do NOT auto-suspend; do NOT surface aggregates.
  Adversary mapping (§3 rows benefiting from a federated block
  graph, which is why blocks stay local):
  - **Row 1 (Employer / management).** A federated block graph
    would let an employer harvesting the public peer wire
    correlate "organizer X has blocked these specific other
    members" as a signal of social fractures inside the
    organizing group. The local-only posture closes this vector:
    there is no wire to harvest.
  - **Row 2 (Union-busting firms).** Professional surveillance
    treats relational fracture graphs as primary intelligence. A
    federated block graph would hand them a relational-fracture
    map for free. The local-only posture means the map does not
    exist anywhere a peer-pull request could touch.
  - **Row 7 (Intimate-partner / stalker).** A stalker notified
    of a block gains a retaliation trigger plus a path to test
    whether a block engaged (move to a peer node and observe).
    Local-only with no signal to the blocked party closes both
    vectors: no notification on the blocked party's side, no
    cross-node propagation that could be probed.
  Mitigations baked in (full design rationale in
  `docs/blocking.md` §§4, 6, 7, 11):
  (a) **Type-level rejection of `"block"` in `OutboxRow.kind`.**
  Asserted at compile time in PR B with `@ts-expect-error`. A
  future contributor cannot accidentally enqueue a `Block` row
  to the outbox without removing the assertion, which a review
  would catch. Same discipline as the `"EventRSVP"`
  type-rejection asserted in the events workstream.
  (b) **Soft-purge clears the tables.** The existing
  Profile → Emergency soft-purge wipes `blocks` and
  `previouslyBlocked` alongside the other anonymizable surfaces.
  Hard-purge wipes everything by definition.
  (c) **Data-export excludes the tables.** The Settings-page
  Data export JSON snapshot excludes `blocks` and
  `previouslyBlocked` explicitly, alongside the existing
  private-key exclusion. A member exporting their data does not
  leak their block list into a JSON file that might be stored on
  a less-secure surface than the device's IndexedDB.
  (d) **UI never surfaces aggregate block counts.** There is no
  member-facing surface that reads "this member has been blocked
  by N members." There is no operator-facing dashboard with a
  per-member block count. Aggregations against the blocks table
  are not part of any data path. The cumulative invariant from
  `blocking.md` §6.3 — the blocked party's participation in the
  community is unchanged from every other member's view —
  depends on this absence.
  (e) **Generic-error discipline.** Per `blocking.md` §6.1,
  every blocked-from action returns the same generic
  "not available" error a not-found action returns. The blocked
  party cannot fingerprint which not-found errors are blocks.
  This is the technical mitigation for the
  `no-read-receipts` / shadow-on-blocked-side posture.
  Residual risk acknowledged honestly: a blocker's local
  `previouslyBlocked` history is a target if their device is
  compromised. A stalker with device-access to the blocker's
  cluster can read the `blocks` and `previouslyBlocked` tables
  in clear from IndexedDB the same way they can read any other
  local-only Dexie surface. The mitigation is the same posture
  as the rest of the local-only surface: passphrase-wrapped
  private key, soft-purge and hard-purge in
  Profile → Emergency. This is a device-access threat, not a
  federation-layer threat; it does not change the federation
  posture.
  The Settings → Blocked contacts panel ships a
  **tap-to-reveal** affordance (see `blocking.md` §6 row
  "Block-list rendering" and §6.2): each row in both the
  active list and the `previouslyBlocked` history renders
  obscured by default (generic avatar, "Blocked contact," block
  date) and reveals the display name + truncated pubkey only
  when the blocker taps the row. This is a
  **privacy-from-overshoulder mitigation** — it reduces
  incidental exposure to someone glancing at the screen or
  picking up a briefly-borrowed device. It is **NOT a defense
  against an attacker with full device access**. An attacker
  with code execution on the unlocked device, or with
  IndexedDB read access, sees the underlying rows in clear
  regardless of UI obscuring. The residual-risk shape above
  (device-access threat, mitigated by passphrase-wrap and
  soft-purge / hard-purge) is unchanged by the tap-to-reveal
  affordance; tap-to-reveal narrows the over-the-shoulder
  surface, not the device-access surface.
  Implementation shipped in PRs #195 (types + outbox-kind lock),
  #196 (Dexie v24 + actions), #197 (UI), and #198 (consumer-
  surface wiring) per `blocking.md` §13; PR D was intentionally
  skipped because there is no server work for this primitive.

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

- **In-app URLs reveal client-side navigation to corporate MITM
  proxies, browser history, and address-bar onlookers.** The
  PWA uses BrowserRouter, so client routes appear in the URL
  bar — `/?tab=projects`, `/post/<id>`, `/project/<id>`,
  `/messages/<memberKey>`, `/member/<publicKey>`. **What an
  on-path observer can see depends sharply on who they are:**
  - **An ISP or generic network observer** sees the hostname
    only (DNS + TLS SNI). The URL path and query string are
    encrypted inside HTTPS — they cannot see `/?tab=projects`
    or `/messages/<key>` from network observation alone. This
    is already covered by §4 (Transport) + the HTTPS-everywhere
    posture.
  - **A corporate MITM proxy** (employer-installed TLS-
    intercepting middlebox with its root CA on the device) sees
    the full URL on the initial page load and on every API
    request to the community node. They can log
    `/messages/abc1…2def` and correlate it back to "this member
    DMed this counterparty." For workplace-organizing pilots
    this is the highest-impact observer in the URL surface.
  - **The community-node operator** receives the initial page-
    load path as a `GET` request. The project's minimal-logging
    posture (§6, Agent 4 task 4) doesn't log paths, but a node
    operator who fronts the dist bundle with Cloudflare or a
    generic Nginx logger may capture them by accident.
  - **Anyone with device access** (theft, seizure, household
    member) can read URLs from the browser history database,
    cached service-worker entries, and browser-sync stores.
  - **Anyone with screen visibility** (shoulder-surfer, camera,
    screen-share) reads the address bar in real time — same
    threat surface as the QR-code camera entry above.

  **What we have not done** and the reasoning:
  - We have NOT switched to hash-based routing (`/#/messages/…`)
    even though hash fragments are never sent to the server.
    The trade-off: hash routing would defend against the node-
    operator-logging case but doesn't help against MITM,
    browser history, or address-bar visibility (the harder
    cases). For tab navigation (`/?tab=projects`) the
    information content is too low to justify the cost. For
    member-identifying routes (`/messages/<key>`,
    `/member/<key>`) the case is real and is tracked as a
    candidate change — switching just those routes to hash-
    based would meaningfully shrink the node-operator and
    casual-onlooker surface. Not blocked, not committed.
  - We have NOT obscured the path text (e.g. `/?v=a8f3c2`
    instead of `/?tab=projects`). It doesn't actually defend
    against any of the observers above: MITM still sees the
    full URL, browser history still stores it, address bar
    still shows it. It only costs shareability and break the
    intuition of the back / forward affordances.
  - We have NOT removed URL state entirely. The shareability
    and browser-history semantics are real organizing utility
    — a Signal handoff "see this post: …/post/abc" is a
    common pattern.

  **What the actual defense is**: the opsec-guide.md "Trust the
  device, or don't open the app" item — clean device, no
  corporate MITM, in physical custody. The panic button purges
  device-side state. Members worried about address-bar /
  shoulder-surfing onlookers should treat the URL bar the same
  way the camera-gate entry above treats the QR code: glance
  around before navigating to a sensitive route. Future hash-
  routing work on member-identifying routes (if shipped) gets
  its own entry that supersedes this paragraph for those
  specific routes.

- **Node system key for auto-confirmation.**
  *Shipped — `apps/server/src/systemSigner.ts`, the
  `NODE_SYSTEM_SECRET_KEY` / `AUTO_CONFIRM_MIN_HOURS` env config
  (absent/`0` = off, and the server warns loudly when a window is
  configured with no key), the sweep, the `GET /api/config`
  advertisement of `systemKey.current` + the `NODE_SYSTEM_KEY_HISTORY`
  rotation trail + `nodeId`, and the peer-side verification chain in
  `peerPull.ts`. Operator procedure: `docs/system-key-rotation.md`;
  design + abuse model: `auto-confirm-key.md` §5.* A per-node Ed25519
  signing key, held by the node operator, signs the helped-side
  signature on `Exchange` records when neither party has confirmed
  within the configured window. Introduced because an unresponsive
  partner otherwise blocks credit permanently, and the project-task
  confirmation flow deliberately forbids the completer from
  confirming themselves — so for organizer-is-completer tasks with
  no co-organizer, credit could not flow at all. This is **the
  closest the codebase has to admin authority**, and the design doc
  does not soften that. What makes it acceptable is the bound: the
  key only signs records the helper has already signed (cannot
  invent exchanges), cannot modify hours / category / parties /
  completion time (all inside the helper's signed canonical
  payload), and every record it touches is audit-tagged
  (`autoConfirmed: true`, `autoConfirmedBy: "system:<nodeId>"`,
  `autoConfirmedAt`) so any verifier can distinguish a system-signed
  auto-confirm from a member-signed mutual confirm.
  Verification chain as shipped (hardened across review rounds 2–3):
  peers verify every auto-confirmed row STRICTLY on ingestion
  against the key the claimed node advertises — what cannot be
  verified is rejected, never relayed; key selection is
  rotation-aware (the key current at the record's `autoConfirmedAt`,
  from the published history); nodeId conflicts fail closed on the
  FULL key material — a second peer claiming the same nodeId with a
  different `current` key *or a different rotation history* poisons
  resolution for that nodeId into a visible denial (`current` is
  public and can be echoed; a forged history entry was the smuggling
  path), and peer-served `retiredAt` values are bounded at parse
  (past events; one day of skew).
  Accepted residual risks, updated: a leaked *retired* key can still
  sign a **backdated** record (`autoConfirmedAt` before `retiredAt`)
  — the attacker controls both the key and the self-declared
  timestamp, so signing the timestamp would not help; treat a leaked
  system key as a governance incident (`system-key-rotation.md` §1),
  with receive-time retirement enforcement tracked as the closing
  fix (roadmap deferred row). The operator can fire the threshold
  earlier than the community expects (detectable post-hoc against
  the `awaiting_confirmation` transition); can refuse to run the
  sweep (a credit-flow denial equivalent to the pre-feature status
  quo); can collude with a member filing bogus completions — but the
  helper's signature stays on the record, so attribution is public
  and the safeguards module still applies.
  **Window-anchor update (awaiting-transition artifact, shipped):**
  the age gate at `POST /auto-confirm` originally trusted the
  client-claimed `awaitingSince`, so a caller could claim an old
  value and skip the waiting window entirely — and project-task
  confirmations had no age anchor at all. Now, when an exchange
  enters `awaiting_confirmation` (or a project-task completion is
  marked), the client signs and submits an `AwaitingTransition`
  record; the server stores a **server-stamped `received_at`**
  (INSERT OR IGNORE — first writer wins, so a later re-submission
  cannot refresh or backdate the anchor) and the sweep substitutes
  that server clock for the client claim when checking the window
  (`resolveWindowAnchor` in `apps/server/src/routes/autoConfirm.ts`,
  store in `db.ts` v14/v15). Rollout knob:
  `AUTO_CONFIRM_REQUIRE_TRANSITION` — off, a missing artifact falls
  back to the legacy client-claimed anchor (compatibility window for
  fielded clients); on, no artifact means no auto-confirm. Residual
  until the knob is flipped on: the legacy fallback preserves the
  original gaming vector for records without artifacts, which is why
  the flip is tracked as a pilot-gated operator action
  (`operator-guide.md` env table) rather than a default.
  **Capacity-posture reuse (the key's SECOND payload, shipped —
  `docs/capacity-forecast.md` §6):** the same node system key now also
  signs one additional shape, a coarse `CapacityPosture`
  (`apps/server/src/capacityEmitter.ts` → `signCapacityPosture`) — the
  "node identity attestation" §4 explicitly anticipated, REUSED not
  duplicated so there is still exactly one operator-held key and one
  audit story. It is bounded the same way: `systemSigner.ts`'s §2
  contract header enumerates exactly two authorized payloads and its
  export-surface lock test fails if a third appears; the posture carries
  ONLY three coarse buckets (`pressure` green/amber/red, `horizon`
  ample/months/weeks, `growthRecommended`) plus the LWW clock — no byte
  count, no percentage, no member data, and the raw samples it derives
  from never leave the box (they live in the operator-local
  `node_capacity_samples` ring buffer, which has no route and no pull
  leg). Verification mirrors the auto-confirm chain: same-community
  mirrors verify each posture STRICTLY on ingestion against the emitting
  node's rotation-aware system key (`applyCapacityPosture` →
  `resolveSystemPubkey`; unresolvable ⇒ halt, never skip), and member
  clients refuse any posture whose `signerKey` isn't the resolved node
  system key for its `nodeId` (`resolveCommunitySystemPubkey`), never
  advancing the cursor past an unverifiable row.

- **No operator-distinguished surface (capacity flow).**
  *Shipped with the capacity forecast (`docs/capacity-forecast.md`
  §5/§7).* A node running low on room is surfaced as a *community*
  signal, never an operator one: nothing in the app marks which account
  runs the server, there is no operator-only readout and no route that
  serves raw node metrics (`/health` still returns bare `{status:"ok"}`;
  the only capacity route, `GET /capacity-postures`, serves the coarse
  node-signed posture under the normal member read-auth guard). The
  posture is signed by the node SYSTEM key, not a member key, precisely
  so the community can act on "grow a root" without anyone — trusted or
  not — learning who hosts; signing it with a member key, or adding an
  operator-labelled readout, would be a privacy regression and is
  rejected. The signal is visible only to members who can already read
  the community feed, so it is not a reconnaissance surface for
  outsiders.

- **Server insert ceilings (disk-fill backstop).**
  *Shipped — `apps/server/src/insertCaps.ts`, one `preHandler` over
  a static path→{table, key column} map of the public insert
  surfaces; env knobs `TABLE_ROW_CEILING` (per table) and
  `PER_KEY_ROW_CEILING` (per submitting key per table), absent/`0` =
  off.* Threat: any holder of a valid member key — or a compromised
  peer relay — can submit records in a loop until the node's disk
  fills, taking the community offline; nothing in the signature
  model bounds *volume*. Mitigation: once a ceiling is reached the
  server refuses further inserts on that surface with **HTTP 507**,
  which the PWA outbox already treats as retryable — a member's
  queued post survives the outage and delivers after the operator
  raises the ceiling, so the failure mode is "pause", not "lose
  data". Deliberate bounds: the ceilings are **lifetime counts, not
  rolling windows** — record timestamps are client-claimed, so any
  time-windowed rate limit could be dodged by backdating; a lifetime
  ceiling is gameable by no clock. Residual: a determined key holder
  can still exhaust their own per-key allowance (self-DoS of one
  key) and a fleet of Sybil keys bounded only by invite redemption
  can approach the table ceiling — both leave the node up and are
  operator-visible; invite hygiene (revocation, redemption caps) is
  the upstream control.

- **`ProjectTask.orderIndex` and `dependencies` remain local;
  widening would need a wire-surface review.**
  *Shipped (PRs #206–#216; PR D loudly skipped per
  `docs/task-ordering-and-dependencies.md` §12).* The task-ordering
  workstream adds a new local field `orderIndex: number` to
  `ProjectTask` (Dexie v25, backfilled from `createdAt` rank ×
  1000) and gives the existing `dependencies: string[]` field
  honest runtime semantics — switching the claim path from a
  hard throw at `apps/web/src/db/projects.ts:486-489` to a
  soft block where the attention rail and the public
  `needs_more_hands` chip suppress nudges while a task is
  structurally blocked. The design doc is at
  `docs/task-ordering-and-dependencies.md`; the per-PR rationale
  for switching to soft block (alignment with
  `solidarity-not-shame` and with the existing type doc-comment
  at `packages/shared/src/types.ts:455-457`) is in §3.1 there.
  **What does NOT change on the wire.** *(SUPERSEDED on this
  point by project federation Phase 1 — the wire claims below
  described the codebase at writing time and are kept for the
  historical record. Projects and tasks NOW sync within the
  community as signed `ProjectState`/`TaskState` LWW records:
  `apps/server/src/routes/projectStates.ts`,
  `pullFederatedProjectStates`/`pullFederatedTaskStates`, and the
  §7 project-federation entry. Cross-node `peerPull` still carries
  neither.)* At the time of this PR, tasks remained local: no
  project or task routes, no pull, no `signature` field on
  `Project`/`ProjectTask` rows, no outbox enqueue, no peer-pull
  cursor. Adding `orderIndex` and rewriting the `dependencies`
  semantics changed none of that.
  **Why this matters for §7.** This file's existing precedent
  at line 572 names the discipline explicitly: *"A future PR
  may promote `recurringCadence` to a first-class field on
  `ProjectTask` with its own threat-model entry covering the
  projection surface."* The same precedent applies to every
  `ProjectTask` field. Promoting any of `orderIndex`,
  `dependencies`, or any other task field to a federated wire
  surface requires its own §7 entry at promotion time —
  enumerating the new wire fields, the adversary mapping (per
  §3), the mitigations, and the residual risk — in the same
  shape the `Event` entry above did for the community-events
  workstream and the `CoOrganizerInvitation` entry did for the
  co-organizer workstream. This PR preserves that boundary
  explicitly: by landing the local-only design with no wire
  changes, the discipline is intact, and a future project /
  task federation PR knows exactly what it owes the
  threat-model section. The flag is forward-pointing, not a
  punt.
  **No new adversary surface in this PR.** The §3 adversary
  rows (employer / management, union-busting firms, stalker,
  the rest) gain no new observable signal. The `orderIndex`
  field never leaves the device. The `dependencies` field
  semantics are runtime-local: the soft-block reversal changes
  *what the local UI nudges about*, not *what bytes leave the
  device*. The attention-rail and chip-suppression decisions
  in `docs/task-ordering-and-dependencies.md` §6 are also pure
  local computations over local state — they re-use
  `canClaimTask` (which is already a pure function over the
  local task list) and produce no new wire signal.
  **Residual.** As long as tasks stay local, the residual for
  this entry is just "any future federation PR must reopen
  this entry." Said plainly: this entry's job is to be the
  honest local-only acknowledgment so the boundary stays
  visible. The day project / task federation lands is the day
  this entry is superseded by a new entry that enumerates the
  wire fields.
  **SUPERSEDED:** that day came. Project & task federation
  Phase 1 shipped (`docs/project-federation.md`); the owed
  entry — wire fields, adversary mapping, mitigations,
  residuals — is "Federated `ProjectState` / `TaskState`
  records" near the end of this section. `orderIndex` and
  `dependencies` now DO cross the wire as fields of the
  full-row `TaskState` record.

- **Federated `RedemptionReceipt` records.**
  *Shipped — Phase 1 of `docs/invite-redemption.md` (§14 PRs 1a–1d,
  landed as one PR): `RedemptionPayload` / `RedemptionReceipt` +
  `canonicalRedemptionPayload` / `verifyRedemptionReceipt` /
  `parseRedemption` in `@understoria/shared`, the `redemptions`
  table (server schema v11), `POST/GET /redemptions`, the outbox
  kind `redemption_receipt`, and `pullFederatedRedemptions` in
  `federationSync.ts`.* The invite-redemption design
  (`docs/invite-redemption.md`) introduces one new federated, signed
  record type — `RedemptionReceipt` — so that redeeming an invite
  stops being invisible outside the redeeming device (the incident:
  the inviter's invite row never left "open," the roster never
  gained the member, the implicit first vouch never reached anyone's
  trust computation). The receipt is signed by the NEW member and
  embeds the inviter's original `SignedInvite` verbatim, so it
  carries two independently verifiable attestations. New wire fields,
  in the shape this §7 uses:
  - the embedded `SignedInvite` (`token`, `inviterKey`,
    `inviterName`, `nodeId`, `createdAt`, `expiresAt`,
    `signature`) — the token is DEAD once the receipt exists
    (replay of the invite yields already-redeemed); the inviter key
    and name were already handed by the inviter to the invitee
    inside the invite link itself.
  - `redeemedBy` (new member's pubkey), `displayName` (≤ 60 chars,
    the name the member typed on the accept screen knowing it is
    community-facing), `redeemedAt` (client clock), `signature`
    (by `redeemedBy`).
  Endpoints: `POST /redemptions` (verify-then-idempotent-store;
  409 first-writer-wins on the token is the server-side single-use
  enforcement the local-only design never had) and
  `GET /redemptions?since=&limit=` (cursor is server-assigned
  `receivedAt` — a deliberate deviation from the sibling routes'
  client-timestamp cursors, required for offline/out-of-order
  convergence; arrival time is something the server inherently
  observes, so storing it adds no new observation).
  Adversary mapping (§3): rows 3/4/5 — the community's own node now
  holds the roster and the invite graph explicitly (asset #1 and #2)
  rather than partially inferably from vouches/posts/exchanges it
  already stores; this is the priced cost of the design, held under
  the same minimal-logging/purge posture as everything else on the
  node. Row 6 — any member-level actor can read the invite graph
  via `GET /redemptions`, which grants nothing beyond what
  `GET /vouches` (unauthenticated, already shipped) grants for the
  manual-vouch graph; the web-of-trust graph is community-visible by
  design. Rows 1/2/7 — the receipt carries no location, no
  availability, no activity; roster enumeration by an adversary who
  can reach the node URL is bounded by the deployment posture and
  the tracked allowlist work (`docs/federated-node-allowlist.md`).
  Mitigations baked in (full analysis in `invite-redemption.md`
  §§10–11): (a) OPEN invites never cross any wire — only
  consummated redemptions do, so recruitment intent, cadence, and
  volume stay off the server (the registration-at-creation
  alternative is rejected in §10.1); (b) receipts do NOT
  peer-replicate — the roster stays off the inter-node wire and a
  malicious peer or foreign operator learns nothing new; (c) the
  same PR REMOVES the unwired `POST /invites` / `GET /invites`
  routes and `pullInvitesFromPeer` — `GET /invites` returns full
  `SignedInvite` rows (token + signature) to any caller, i.e. every
  field needed to reconstruct a live redeemable invite link; today
  its store is empty so the leak is theoretical, and removal keeps
  it that way (net wire surface: +2 endpoints, −2 endpoints);
  (d) forgery requires forging one of two Ed25519 signatures;
  byte-identical replay is idempotent; a double-redeemed (stolen)
  link becomes VISIBLE (409 on the loser, unexpected name on the
  inviter's Invites page) instead of today's silent divergence.
  Residual risk acknowledged honestly: `redeemedAt` is
  client-claimed — a holder of an expired-but-unredeemed invite can
  back-date within the delivery-grace window (default 7 days on
  `receivedAt`); the receipt stays signed and attributable, so the
  play is evidence-producing. Retention is node-lifetime (receipts
  are trust edges; bounded retention would break trust convergence
  for every future fresh device), with purge tooling deleting a
  hard-purged member's `redeemed_by` rows. The same PR removed the
  `POST/GET /invites` routes and `pullInvitesFromPeer` as designed
  (mitigation (c) above), and a negative test in `peerPull.test.ts`
  locks receipts and invites off the inter-node wire.

- **Federated `InviteRevocation` records.**
  *Shipped — Phase 1 of `docs/invite-revocation.md` (§10, the
  convergence-only half): `InviteRevocationPayload` /
  `InviteRevocation` + `canonicalInviteRevocationPayload` /
  `verifyInviteRevocation` / `parseInviteRevocation` in
  `@understoria/shared`, the `invite_revocations` table (server schema
  v13), `POST/GET /invite-revocations`, the outbox kind
  `invite_revocation`, and `pullFederatedInviteRevocations` in
  `federationSync.ts`.* Pairs with the `RedemptionReceipt` entry
  above. Before this, `revokeInvite` wrote only the inviter's local
  Dexie row, so a revoked-then-redeemed invite showed `revoked` on the
  inviter's device and `redeemed` (counting the implicit first vouch)
  on every other device — the newcomer's trust state diverged per
  device, permanently. The new record is signed by the ORIGINAL
  INVITER (a single signer, unlike the receipt's two attestations) and
  names one already-killed token. New wire fields, in the shape this
  §7 uses:
  - `token` (identity/dedup key — the same token the DEAD invite
    named; the invite is already unredeemable-or-redeemed by the time
    a revocation exists), `inviterKey` (the signer, and the authority
    anchor — see below), `revokedAt` (client clock, display-only:
    "revoked on …"), `nodeId`, `signature` (by `inviterKey`).
  Endpoints: `POST /invite-revocations` (verify-then-idempotent-store;
  409 first-writer-wins on the token blocks a third party from
  claiming an already-revoked token — poison for the outbox, never
  succeeds on retry) and `GET /invite-revocations?since=&limit=`
  (cursor is server-assigned `receivedAt`, inclusive with a token
  tiebreak — the same skew-safe deviation the redemptions route uses).
  Like `/redemptions`, this is PWA↔node only — NO peer-replication
  leg, so the revocation graph stays off the inter-node wire exactly
  as the roster does.
  Adversary mapping (§3): rows 3/4/5 — the node now holds, explicitly,
  which invites their inviter took back; this is strictly LESS than
  the redemption graph it already stores (a revocation names a token
  the node already saw redeemed, or one it never will), held under the
  same minimal-logging/purge posture. Row 6 — any member-level actor
  can read the revocation feed via `GET /invite-revocations`; it
  reveals only that an inviter retracted an admission the same actor
  could already see in `GET /redemptions`, no new subject data (no
  location, availability, or activity). Rows 1/2/7 — carries no PII
  beyond the two pubkeys already on the paired receipt.
  Mitigations baked in (full analysis in `invite-revocation.md`
  §§5,7): (a) **authority binding** (§3.1) — a revocation acts only
  when its `inviterKey` matches the redemption receipt's embedded,
  inviter-signed invite; a third party who signs a revocation for
  someone else's token produces no match and the client merge drops it
  (`federationSync.ts`, "dropped … does not match the local invite"),
  so revocation cannot be turned against an invite one did not issue;
  (b) the merge is **presence-based and commutative** — the terminal
  state is a pure function of which records exist for a token, never a
  `revokedAt`-vs-`redeemedAt` comparison, so a **backdated `revokedAt`
  buys nothing** (it is retained for display only); (c) forgery
  requires forging the inviter's Ed25519 signature; byte-identical
  replay is idempotent (dedup by token); (d) revocation is **never
  ejection** (§2) — the worst it does is move the member to
  `redeemed_despite_revocation` and, once the §9 ruling ships Phase 2,
  withdraw the one implicit vouch; it never reverses credit or removes
  the account, and the member reaches full trust again with one
  ordinary vouch. Residual risk acknowledged honestly: an
  un-redeemed token's revocation is inert on every device but the
  inviter's own (nothing to bind to), so it federates a few dead rows
  — accepted over the alternative (enqueue only once a receipt is
  known) which would break the "each record self-contained" property
  (`invite-revocation.md` §12). Retention/purge: the
  `invite_revocations` store gets the same soft/hard purge hooks as the
  redemptions store, and the local `invites` table is already cleared
  by both purges. **Phase 2 (trust withdrawal) is not yet shipped** —
  the `vouchersFor` filter that drops the implicit vouch for
  `redeemed_despite_revocation` is gated behind a `GOVERNANCE.md`
  modified-consensus ruling (§9); until then the vouch counts as today
  and the only visible change is the converged label.

- **PWA vouch pull puts the vouch graph on every member device.**
  *Shipped — `pullFederatedVouches()` in `federationSync.ts`, landed
  with the invite-redemption Phase 1 PR.* Companion leg of the
  invite-redemption design (`docs/invite-redemption.md` §9). Before
  this landed, manual vouches were pushed device→node
  (`POST /vouches`) and replicated node↔node (`pullVouchesFromPeer`),
  but NO member device ever pulled them down — `federationSync.ts`
  had no vouch pull — so a vouch was visible only on the device that
  authored it and trust status diverged per device.
  `pullFederatedVouches()` makes trust computation converge. NO new
  server surface: `GET /vouches?since=` already existed and already
  served the full vouch graph, unauthenticated, to any caller. The
  change is a new exposure LOCATION: every member's Dexie now holds
  the node's who-vouched-for-whom graph, readable by anyone with
  device-level storage access. This normalizes onto member devices
  a graph that was already one `curl` away for a §3 row-6
  infiltrator; device-level compromise exposure follows the standard
  local-Dexie posture (passphrase-wrapped keys, soft/hard purge).
  Display discipline is unchanged and load-bearing: per the existing
  operator ruling + `no-leaderboards` (`lib/vouch.ts:139-145`),
  voucher sets/counts render only on one's OWN profile; other
  members' pages show only the qualitative trust status. Any future
  surface that renders per-member voucher lists from the newly
  local data must supersede this entry.

- **Origin-derived community-node suggestion.**
  *Shipped (PR #303, invite-redemption Phase 0 —
  `lib/nodeOriginSuggest.ts` + the consent card on the invite-accept
  success path and Board).* Phase 0 of `docs/invite-redemption.md`
  (§5.3): when
  the PWA was served from a community node's origin (the canonical
  `deploy/Caddyfile` topology puts the API at
  `${location.origin}/api`), the app probes `GET /api/health`
  (same-origin only; localhost/dev origins excluded; no third-party
  request) and, on success, PREFILLS the community-node settings and
  presents the existing informed-consent card. Zero new wire bytes.
  This entry exists to amend the "Configurable node URL can leak
  counterparty public keys" entry above: the consent gate there is
  load-bearing, so auto-configuration is auto-SUGGEST, never
  auto-enable — the member still explicitly confirms, and the card
  names the origin so a member who intends a different node than
  the serving origin declines. Mis-derivation cases (PWA-only
  static hosting, dev servers) fail the health probe and produce no
  suggestion; failure is silent because an unconfigured node is a
  normal state, not an error.

- **Federated `ProjectState` / `TaskState` records (project &
  participation federation Phase 1).**
  *Shipped — `docs/project-federation.md`; supersedes the
  "`ProjectTask.orderIndex` and `dependencies` remain local" entry
  above, which reserved exactly this obligation.* Projects and their
  tasks now cross the wire as signed **last-writer-wins state
  records** — the node's first MUTABLE record kinds: `POST/GET
  /project-states` and `/task-states`, outbox kinds `project_state` /
  `task_state`, pulls in `federationSync.ts`, and a 3-minute re-pull
  of the whole federation fan-out.
  **New wire fields.** The FULL `Project` row (title, description,
  category, status, target/contributed hours, deadline, location
  zone, tags, organizer + co-organizer public keys, template id) and
  the FULL `ProjectTask` row (title, description, hours estimated
  and actual, urgency, status, `assignedTo` claimer key, claim and
  check-in timestamps, dependencies, orderIndex) plus `updatedAt`,
  `signerKey`, `signature` on each. Canonical form is
  `stableStringify(record minus signature)` — every field is signed,
  including ones a given app version doesn't know, so records pass
  through servers and clients verbatim.
  **Adversary mapping (§3).** A node-watching adversary (operator,
  subpoena, MITM on a plain-HTTP pilot) now sees who organizes what,
  who claims which task, and when — the same class of signal the
  existing `Post` / `Exchange` / `TaskComment` surfaces already
  leak (a task COMMENT already named the project, task, and author;
  the comment "done!" federated while the status change didn't).
  Claim timestamps (`claimedAt`, `checkInAcknowledgedAt`) extend the
  "public task check-in chip reveals claim duration" entry's
  reasoning onto the wire: claim-duration is now node-visible, not
  just peer-visible. Accepted for the same reason as the chip —
  it is precisely the coordination signal multi-member projects
  exist to share. E2E encryption was considered and rejected for
  community-audience data (§2 of the design doc): "encrypted to
  whom?" has no good answer for a whole community with changing
  membership, and the node's community IS the intended audience.
  **Mitigations.** (a) Server-side authority rules checked against
  the STORED version so a hostile write can't grant itself authority:
  genesis must be self-organized; updates require the stored
  organizer / a stored co-organizer; `organizerKey` changes only by
  the stored organizer's signature (handoff). (b) The same rules are
  recomputed client-side on pull against the LOCAL stored version —
  a compromised node serving fabricated rows can't reassign
  authority on member devices. (c) LWW accepts only strictly-newer
  `updatedAt`, bounded at ingestion to now+24h, and the pull cursor
  applies the standard plausibility bound (cursor-poisoning
  defense). (d) Insert caps cover both tables (row-count ceilings;
  LWW replaces in place, so an honest project's lifetime of edits
  costs one row per project/task). (e) 409 for task-before-project
  keeps ordering server-enforced; the outbox retries.
  **Residuals, stated plainly.** (1) A task's claimer can vandalize
  non-claim fields of the task they hold — the server does not diff
  fields; the comment trail and the organizer's next LWW write
  repair it. (2) LWW on wall clocks: same-millisecond edits can drop
  one edit silently; the next edit repairs it. (3) A co-organizer's
  writes are honored only after the organizer's device republishes a
  version naming them (it does so automatically on ingesting the
  signed acceptance — but an offline organizer device delays this).
  (4) Project ADOPTION stays local: the node's stored authority
  still names the absent organizer, deliberately — the alternative
  is a quorum-takeover surface. (5) Members with a locked device
  publish on their next unlocked mutation, not immediately.

- **Federated participation records (`EventRsvpState` /
  `EventShiftState` / `ShiftSignupState` — Phase 2).**
  *Shipped — docs/project-federation.md §6; supersedes IN PART the
  "Federated `Event` records" entry's mitigation (a) and its shift
  paragraph above, both of which now carry pointers here.* This is
  the most values-heavy reversal in the federation workstream and it
  is recorded as such: the original events design called RSVP
  locality its load-bearing decision, and the shifts design shipped
  with type-level locks against exactly these three outbox kinds.
  **Why it was reversed anyway:** field use showed the stance's real
  effect was that an organizer literally could not see attendance
  from anyone else's phone — the roster the feature exists to build
  only ever existed on each member's own device. "Who's coming" is
  the coordination signal an event announcement solicits; a
  per-device answer is no answer. The same argument that carried
  task claims in Phase 1 carries here.
  **What now crosses which wire, precisely.** Three signed LWW state
  records reach the member's OWN community node: the RSVP (event id,
  member key, going/maybe/not_going, timestamps), the shift
  definition (label, window, soft capacity, organizer key), and the
  signup (shift id, member key, timestamps). RSVPs and signups are
  SINGLE-OWNER (signature must be the named member's own; enforced
  server-side and on every pulling device) and keyed by their
  natural key so devices can't double-count a roster. Withdrawals
  and shift deletions travel as tombstones so removal converges too
  — "I'm not coming" removes the member's name from every device's
  roster, not just their own. **NOT on the cross-node peer wire:**
  none of the three kinds joins `peerPull`; an adversary harvesting
  peer federation still sees only that the event exists and who
  organized it. The perimeter that moved is the community node
  itself (and, until member-authenticated reads are enforced —
  `READ_AUTH`, see the entry below — anyone who can query it; with
  enforcement on, readers must prove membership).
  **Adversary re-mapping (§3).** The node-watching rows (operator,
  subpoena, MITM on plain-HTTP pilots) gain the within-community
  attendance graph: who intends to be where, when, in which slot —
  the sharper location+time signal the superseded paragraphs named.
  Weighed against: this is exactly what every attending member's
  screen already shows (§6 visibility tiers still gate RENDERING —
  non-RSVP'd members still see counts, not names), the event's
  time/place was already on the wire signed by the organizer, and
  the free-text-venue guidance for high-risk events (rotate venue
  strings / "address sent on confirmation") applies with the same
  force and is now doubly load-bearing.
  **What survives unchanged, permanently:** (1) the never-compare
  rule — a signup is INTENT, not attendance; nothing may ever
  reconcile rosters against exchanges or presence
  (docs/shift-signups.md §9, community-events.md §11.6); (2) the
  exchange-label boundary — no `Exchange.postId` may ever encode an
  event or shift id (exchanges DO cross the peer wire; that label
  would rebuild the cross-node attendance graph through a side
  door); (3) no per-member attendance aggregation surface; (4) no
  notifications.
  **Residuals, stated plainly.** (1) A member's RSVP history for an
  event is visible to their community node operator for as long as
  the node retains rows — mitigated only by the operator-trust
  model every other record kind already lives under. (2) Tombstoned
  rows persist on the node as tombstones (the removal is what
  federates; the row's existence remains attested). (3) A shift
  deletion arriving on a device where signups exist locally clears
  that roster without per-member consent ceremony — organizer
  authority, same as the local deleteShift guard's intent. (4)
  Locked devices publish late, same as Phase 1.
  **Discovery surface (docs/ways-to-plug-in.md, shipped):** the
  `/plug-in` shelf that matches a member against open shifts, needs,
  and tasks is a LOCAL READ over rows the device already holds —
  no new wire surface, no new stored rows, no logs; nothing about
  what a member browsed, matched, or ignored exists anywhere to
  leak.

- **Member-authenticated reads + at-rest encryption (the
  reader-power review).**
  *Shipped — `docs/member-authenticated-reads.md`; companion
  member-facing doc `docs/operator-powers.md`.* Two gaps and one
  false claim, closed together:
  **(1) The open-read gap.** Every federation GET feed answered any
  caller. Joining is invite-gated; reading was not — an abusive
  ex-member's new keypair, an employer, or a scraper with the node
  URL held the same view members earn by invitation. Now, with
  `READ_AUTH=on`, GETs require headers signing
  `read|<path+query>|<ts>` (±10-minute skew bound — reads are
  idempotent, so replay of a captured header within the window
  yields only a response the key holder could fetch anyway, and the
  path binding stops cross-feed reuse). **Membership is derived, not
  registered:** the set is the transitive closure from the
  operator-configured `NODE_FOUNDER_KEYS` over verified
  redemption receipts — artifacts the node already stores — so no
  new member-directory surface is created for a subpoena to find;
  the receipts already implied it. Two invented keys attesting each
  other never reach the closure. Peer nodes authenticate with
  pair-exchanged bearer tokens (`PEER_READ_TOKENS`).
  Exemptions, each self-limiting: `/health`, `/config` (needed
  before membership is provable), and the device-link/tap-to-link
  surfaces (a brand-new device has no identity; they authenticate
  by unguessable ids and ciphertext with TTLs+caps).
  Staged rollout: apps sign reads unconditionally (harmless when
  off); the operator flips `READ_AUTH=on` once members are on a
  signing build. Boot refuses `on` with no founder keys.
  **Residuals, stated plainly:** ~~membership is append-only~~ —
  CLOSED by member removal M1 (`docs/member-removal.md`; its own §7
  entry below carries the replacement trust assumption). A
  passphrase-locked session
  cannot sign reads and silently stops pulling until unlocked
  (named in the operator runbook). POSTs remain ungated — writes
  always carried their own signatures, and insert caps bound abuse.
  **(2) At-rest encryption made real.** §6's SQLCipher bullet was
  aspirational; the driver now supports it and `DATABASE_KEY` keys
  the file. Scope honesty: protects the powered-off disk / backup /
  retired media (§3 seizure row), not a live-rooted host — the key
  lives in the process environment.
  **(3) The operator-power frame.** The same review weighed
  encrypting all community records under a shared community key and
  set it aside: every member (operator included) holds such a key,
  so it removes no insider's view; in a local-first app every
  member's device already replicates the full dataset, so "nobody
  can see everything" is not achievable cryptographically. The
  honest levers — read gating, at-rest encryption, the shipped
  no-aggregation UI boundaries, and social structure — are now all
  either implemented or documented (`docs/operator-powers.md`
  enumerates the operator's residual powers: metadata visibility,
  record withholding, service denial, founder-key configuration —
  each with its remedy).

- **Mirror nodes + client failover (community resilience Phase B).**
  *Shipped — `docs/community-resilience.md` §B.* Same-community
  replica nodes (`MIRROR_NODE_URLS`) replicate **every durable
  kind** — including the five signed-LWW participation/project state
  kinds that deliberately never cross the *peer* wire, and the
  redemption receipts the membership closure derives from. The
  participation-privacy boundary from Phase 2 ("never to other
  communities") is not crossed: the data moves between the same
  community's own servers. What a reviewer should check:
  **(1) Each mirror operator is an operator.** A mirror widens the
  COUNT of hosts holding the community's records by one, and its
  operator holds every power `docs/operator-powers.md` names. The
  member-facing consent card says so before a mirror is adopted
  (auto-suggest via `GET /config.mirrors`, never auto-enable), and
  `add-a-node.md` step 5 already required reading that page.
  **(2) The read gate must match.** A mirror running `READ_AUTH=off`
  serves the whole replicated dataset to anyone with its URL, no
  matter how tightly the primary is gated — mirrors must run the
  same `READ_AUTH` + `NODE_FOUNDER_KEYS` as the primary (the
  membership closure derives identically from the replicated
  receipts). `MIRROR_READ_TOKENS` get the same hygiene as
  `PEER_READ_TOKENS`: ≥16 chars, exchanged out of band, rotated on
  suspicion.
  **(3) Replication reuses the write gate.** The mirror worker
  applies pulled records by re-POSTing them through the node's OWN
  routes (`app.inject`), so every mirrored record passes the same
  parse/signature/authority/LWW checks as a member submission —
  no second ingestion path to audit. The per-boot internal token
  that marks those self-POSTs only (a) exempts them from rate
  limiting and (b) lets `/redemptions` skip its delivery-grace bound
  and preserve the origin `receivedAt` (a receipt the community
  accepted long ago must still replicate to a new mirror or its
  membership closure would be missing members); it never leaves the
  process and relaxes nothing else.
  **(4) One small widening, named:** the CORS allow-list now includes
  the three `x-understoria-*` read-signature headers — required for
  the FIRST cross-origin surface that carries them (a mirror URL);
  the canonical same-origin `/api` deploy never preflighted. This
  permits browsers to SEND the headers cross-origin; the read gate
  itself is unchanged.
  **Residuals:** auto-confirm authority stays with exactly ONE node
  (`NODE_SYSTEM_SECRET_KEY` is never shared; mirrors verify via the
  published key, and a lost primary means registering a new system
  key per the existing rotation runbook). Failover is convergence,
  not high-availability: records pushed to different nodes during a
  partition reunite through mirror replication and idempotent pulls,
  with LWW records resolving by version exactly as they do between
  devices.

- **Re-seed Phase R0 (artifact persistence).**
  *Shipped — `docs/community-reseed.md` §1b; the full re-seed
  capability (R1) owes its own entry when it lands.* Devices now
  persist the SIGNED redemption receipts and invite revocations they
  verify (new Dexie tables), instead of dropping the signatures
  after materializing bookkeeping rows. No new exposure: every
  device already held the derived who-invited-whom rows and display
  names; the artifact adds only the signatures binding what was
  already stored — and it is exactly what a fresh node's membership
  closure would need re-uploaded after total node loss. Handling
  matches the `invites` table's posture everywhere it matters: soft
  purge clears both tables whole (the payloads are signed, so
  scrubbing names would destroy them; in a panic the member's safety
  outranks the community's redundancy — the next pull refills from
  any live node), and both are excluded from the shareable export
  (same relational-graph rationale that excludes `invites`). The
  device also captures the node's published auto-confirm system key
  (`/config.systemKey`) into settings — disaster bookkeeping for
  R1's `TRUSTED_SYSTEM_KEYS`, public data by definition.
  Companion Phase 0 of `docs/storage-budget.md` shipped alongside:
  the app requests the browser's durable-storage grant (an eviction
  under disk pressure could otherwise silently delete the
  community's local copy) and Settings shows the copy's size and
  protection state. The estimate never leaves the device; no new
  wire bytes anywhere in either change.

- **Community re-seed Phase R1 (the restore flow).**
  *Shipped — `docs/community-reseed.md` §2–§4; extends the R0 entry
  above.* Any member can now upload the community's entire
  replicated history from their device to a fresh node through the
  node's ORDINARY write routes — the design's core property is that
  no new ingestion surface exists to audit: routes authenticate
  signatures, not submitters, and everything is idempotent. Two
  operator-declared, deliberately-bounded relaxations exist for
  recovery and nothing else:
  **(1) `RESEED_GRACE_UNTIL`** — while open, `/redemptions` skips
  its delivery-grace bound (historical receipts necessarily arrive
  years "late") and preserves plausible wire `receivedAt` stamps.
  The window re-opens the §11 back-dated-play risk for stolen,
  expired, still-unredeemed invites — bounded by: config refuses
  windows longer than 30 days, boot logs loudly while open, invite
  revocations re-seed too, and the play remains signed and
  attributable. Verification and first-writer-wins never relax.
  **(2) `TRUSTED_SYSTEM_KEYS`** — an explicit operator trust
  statement that a LOST node's system key is authentic, letting its
  auto-confirmed exchanges re-verify through the shared §4 gate
  (fail-closed when unset; refuses duplicate nodeId declarations).
  A WRONG key here would launder forged auto-confirms — the runbook
  says to copy it from a member device's captured `/config` record
  (R0), never from memory.
  The walker itself is client-side, member-initiated, paced under
  the node's existing rate limits and insert caps, resumable, and
  its skip counts are surfaced (never silent). Multiple members
  restoring concurrently union by idempotency.

- **Identity recovery kit (K1).**
  *Shipped — `docs/identity-recovery.md` §1.* A member can export
  their secret key wrapped under an independent RECOVERY passphrase
  (the same PBKDF2-HMAC-SHA256 600k + secretbox construction as
  session protection — no new primitives, no new dependency; the QR
  path reuses the existing `qrcode` package) into a downloadable
  file or printed page, and restore it on a fresh device from the
  Welcome flow. At-rest analysis mirrors the passphrase §7 entry:
  kit theft alone yields a KDF-bounded brute-force target; kit +
  passphrase IS the identity (the creation copy says so bluntly);
  a forgotten kit passphrase makes the kit permanently inert (no
  custodial reset exists, by design — the operator and the node
  appear NOWHERE in this path). Restore refuses a locked device
  (never writes a plaintext key beside wrapped ones), verifies the
  decrypted key against the kit's named public key (a tampered kit
  fails closed rather than installing a mismatched key), and treats
  the kit's node coordinates as suggestions that never clobber a
  configured device. What restore cannot recover is stated in the
  UI: E2E message history and unsynced drafts (device-only by
  design).

- **Guardian shards (K2).**
  *Shipped — `docs/identity-recovery.md` §2.* Shamir k-of-n
  (GF(256), k ≥ 2, n ≤ 7) over the member's secret key, split
  across chosen guardian members. SSS is implemented in-repo
  (~150 readable lines, `lib/sss.ts`) rather than as a dependency
  — deliberately, per §8.3: first-party auditable code over an npm
  tree. Security properties, honestly: below k shares the scheme
  is information-theoretically blind (fresh random coefficients
  per byte); at k, ANY k guardians together CAN reconstruct the
  identity — the collusion bound is exactly the threshold the
  member picked, and the picker copy says so. Shamir carries no
  integrity, so reconstruction is anchored by re-deriving the
  public key from the recovered seed and requiring it to match the
  owner (a naive `fromSecretKey` check would pass a tampered seed
  — the embedded public-key half is copied, not derived). The live
  attack is social engineering of guardians (impersonating the
  member to collect releases); the mitigation is human and the UI
  builds it in: deliberate friction copy before release, in-person
  bias, and releases sealed to the ONE requesting session's
  temporary key so a photographed release QR is inert anywhere
  else. Every hand-off is device-to-device (QR/paste) — the node,
  operator, and message channel appear NOWHERE; there is no new
  network surface, no mailbox, no metadata. New relational surface
  per §8 question 6: a guardian's device knows whom they guard
  (`guardianShards` rows, ciphertext-at-rest sealed to the
  guardian's key) — soft purge clears the table (the panicking
  member's safety outranks the guarded member's redundancy) and
  data export excludes it (it is another person's key material in
  trust, not the exporter's data). Known limitation, stated in the
  UI: re-sharding does not revoke an old set — the key never
  rotates, so k old shards still reconstruct; a member who
  distrusts a former guardian should mint a fresh identity.

- **Member removal (the append-only residual, closed).**
  *Shipped — `docs/member-removal.md` M1.* `MemberRemoval` is the
  app's first MULTI-signed record: ≥ `REMOVAL_QUORUM` (default 3,
  operator-visible on `/config`, must match across a mirror set)
  distinct member signatures over one canonical payload, never the
  subject's own. It subtracts from the membership closure (read
  standing ends) and closes the pen (POSTs by a removed author
  answer 403 `author_removed` — history stands, replication of
  pre-removal records is exempt via the mirror-internal token).
  Chain rule, non-retroactive: receipts extend the closure iff the
  inviter was not removed at `redeemedAt` — pre-removal invitees
  stay, unredeemed invites die; removal never cascades.
  `MemberReinstatement` (same shape, same quorum) reopens the door;
  ties resolve to reinstatement. **The trust assumption that
  replaced the residual:** any K members CAN remove anyone — that
  is the community governing itself; the mitigations are structural
  (the record is public and permanently attributed on the Decisions
  surface; reinstatement needs only the same quorum; a captured
  community's remedy is the exit, which re-seed makes concrete) and
  the last non-removed founder cannot be removed (the closure keeps
  a root). Client trust posture, stated: devices re-verify
  signatures/distinctness/quorum against the published
  `removalQuorum` but cannot recompute the founder-rooted closure
  (founder keys are deliberately not public) — the signers-are-
  members half is each node's job at ingestion, re-checked by every
  mirror as replication re-POSTs through its local routes; the
  same posture as auto-confirm label verification. Gate coverage
  honesty: the write gate checks the signing author each surface
  validates (an exchange naming a removed counterparty still lands
  — the ledger records what happened). Reason text is length-capped
  plain text, never rendered as markup. The operator STILL cannot
  remove anyone — quorum only (`operator-powers.md`).

- **Proposal federation (open ballots).**
  *Shipped (G1 + G2) — `docs/proposal-federation.md`.* Proposals, votes,
  and closures became signed federated records. The trade named
  before the schema: **votes are now public, attributed records
  inside the community** — the same posture as removal signatures,
  and the only posture under which no-silent-disenfranchisement
  (`docs/blocking.md` §11.10) is checkable. Nothing new leaves the
  community: the read gate covers the new feeds by deny-by-default,
  legacy unsigned rows never cross the wire (no migration mints
  signatures a member never made), and a re-castable vote means the
  newest version is what tallies. Governance writes are the app's
  first MEMBER-GATED write surfaces (membership resolver at POST):
  an invented key may post an offer; it may not vote. Closures are
  first-writer-wins per proposal — the community's answer is total
  and convergent — with a parameter-free standing-block guard at
  ingestion (mirror replication exempt, so an origin-accepted
  decision replicates rather than diverging the set) and the
  config-dependent eligibility half re-checked on devices. Soft
  purge still clears the local votes table; the community's copy
  persists on nodes — the standard federated-record honesty, now
  true of votes too. G2 adds the effect surface: a pulled passed
  `config_change` closure MOVES LOCAL CONFIG on every device —
  the first mechanism by which a remote record changes local
  behavior rather than local data. Bounds: the closure must
  verify, its closer must be a member, first-writer-wins makes
  the applied config total across the community, invalid payloads
  soft-degrade (record stands, knobs don't move), and a passed
  closure whose merged ballot shows standing blocks renders as
  CONTESTED on every device rather than being silently honored.
  A hostile node hiding votes before closing remains the residual
  risk named in the plan's §6 — mirrors and re-seed bound how
  long the omission survives, and the contested flag names it
  when the merged set disagrees.

- **Storage windowing (coverage-claim downgrade).**
  *Shipped — `docs/storage-budget.md` Phase 1.* A member may free up
  space on a constrained device: old SETTLED records (settled posts,
  past events, closed projects — with their subtrees) older than a
  member-chosen horizon are deleted locally, while a pinned working
  set never windows (the roster, membership receipts, the exchange
  ledger and vouch graph, governance history, everything the member
  authored, everything still live). No new data or network surface —
  windowing is strictly a LOCAL delete plus a merge-time refusal to
  re-insert (cursors alone cannot enforce it: mirror failover and
  node moves legitimately re-pull from zero). What §7 owes is the
  CLAIM downgrade: "every member's device is a complete seed"
  becomes conditional the moment any device can window, so the
  resilience card and the re-seed flow now state THIS device's
  coverage instead of asserting completeness, and the re-seed
  guarantee is collective (devices union; seed vaults — Phase 2 —
  make the full-archive role visible again). Deliberately NOT added:
  any cross-device census of who windows what — the honest copy is
  device-local. Two local-only tables (project activity, event↔
  project links) window with their parents and cannot be re-fetched
  by the undo path; the undo copy says so.

- **Seed-vault pledges (a new public role claim).**
  *Shipped — `docs/storage-budget.md` Phase 2.* `SeedVaultPledge` is
  a signed, single-owner LWW record announcing that a MEMBER keeps
  the complete community archive on a device of theirs. What §7 owes
  is scrutiny of the new public surface: the pledge is deliberately
  **member-granular, never device-granular** — it names a person
  holding a role and says nothing about hardware, addresses, or how
  many devices they own (no device census exists and none should).
  It is public by design (the community must be able to COUNT its
  full copies for the resilience card and know whom to restore from
  after total node loss), revocable at any time (retraction is
  `active:false` and must keep winning LWW — a stale active copy
  cannot resurrect the role), and forgery-proof in the usual way
  (the only legitimate signer is the member the pledge names;
  server, mirror pull, and client pull all enforce it). Social
  consideration, named: the resilience card nudges the COMMUNITY
  when coverage is thin — it never names a member who "should"
  pledge, and declining to pledge while quietly keeping everything
  is always fine (the pledge is for visibility, not surveillance).
  Adversary who pledges falsely (claims the archive, holds
  nothing): they gain nothing — the pledge grants no authority, no
  read power, no operator role; the harm is an overstated coverage
  count, the same lie a node operator could already tell, and
  re-seed unions many devices so one hollow vault degrades nothing
  that another copy covers. Storage posture matches vouches (public
  signed claims): exported, snapshot-carried, never windowed,
  untouched by soft purge.

- **In-person exchange over QR (no new leak; fingerprint gate).**
  *Shipped — `docs/offline-resilience.md` §5,
  `apps/web/src/lib/inPersonExchange.ts`.* Two members with no
  network confirm a completed exchange phone-to-phone: the helper
  shows a helper-signed offer QR, the helped member reviews and
  co-signs, and a receipt QR carries the finished double-signed
  record back. What §7 is owed, paid: **nothing new leaks** — the
  offer and receipt QRs carry exactly the fields the final
  federated exchange record already publishes (post id, the two
  member keys, hours, category, timestamp, node id, signatures), so
  a photographed QR reveals only what the public ledger will say;
  and **the capture surface refuses impostors** — an offer is
  rejected unless it matches a post the scanner already holds,
  names that post's exact parties, and addresses the scanner as
  the helped counterparty, with the helper's 64-bit key fingerprint
  displayed on BOTH screens (the `lib/keyFingerprint.ts` check
  device pairing uses) so the human confirms WHO they are crediting
  before signing. Same delivery posture as guardian shards: nothing
  is enforceable until both signatures exist. Replay is inert — the
  exchange id is minted once at offer time, both devices enqueue
  the same record, and the node (idempotent on id) keeps one copy;
  re-scanning either QR is a local no-op. Deliberately NOT built:
  post-less "spontaneous help" records (the un-ratified
  direct-exchange-label proposal) — every in-person record hangs
  off a claimed post both parties already hold.

- **Print surfaces (paper doesn't purge).**
  *Shipped — `docs/desktop-power-tools.md` plan 5.* The invite
  poster and the board sheet put member data on PAPER: an offline
  copy outside every purge, revocation, and expiry path the app
  enforces — a shelter-lobby sheet keeps naming needs and zones
  after the posts close, and a poster's invite QR outlives a
  revocation (redemption still fails at the node, but the paper
  keeps advertising). Mitigations are honesty and lifecycle, not
  code: every printout carries a dated "paper doesn't sync or
  purge — recycle stale sheets" footer, the poster prints the
  expiry date on its face and refuses to render an already-expired
  or unverifiable invite, and printing is always an explicit member
  act behind the same reveal gate the on-screen QR has. Same
  posture as the recovery kit's print path: the member is told
  what the paper is before it exists.
  The offline kit (paper-systems P4) additionally prints a WiFi
  CREDENTIAL: the storm-hub SSID and password, as text and as a
  phone-native `WIFI:` QR. Deliberate — the wall poster's whole job
  is to hand the shelter WiFi to everyone in the room during an
  outage. Mitigations: the credential is TYPED by the member on
  screen-only fields (never read from the OS or stored anywhere),
  the poster carries a shares-with-everyone caveat on its face, and
  the artifact makes sense only for a hub AP that is a deliberately
  public utility in the scenario it exists for — a member who
  prints their HOME WiFi onto a poster has been warned by the
  caveat in the very ink they're posting.
- **Casual identity display is collision-aware: IMPLEMENTED
  (2026-07).** The truncated key fingerprint (`shortKey()`) no
  longer renders beside names on casual surfaces (post-detail
  parties, the me-menu identity row) — all four pilot personas read
  the ubiquitous `(a1b2…c3d4)` chrome as a rendering glitch, which
  taught members to ignore it everywhere, including the one place
  it mattered. The key now sits behind a subtle tap affordance
  (`IdentityKey.tsx`) that reveals it together with a one-sentence
  explanation of what the code is. The inline key's actual
  protective job in casual chrome — telling two members with the
  same display name apart — is preserved automatically: when two or
  more members share a display name (case-insensitive, trimmed —
  `lib/nameCollisions.ts`), the key renders inline again wherever
  that name appears, so the name-squatting disambiguator activates
  exactly when the attack precondition exists. Deliberately
  unchanged: every verification ceremony (invite fingerprint,
  in-person exchange, device pairing, cosigned removals, signed
  records) keeps its always-visible key — there the key IS the
  content; the canonical identity spots (MemberDetail header, own
  Profile) keep their visible keys and gain the same tap explainer;
  and `shortKey()` fallbacks for members with no local display name
  are untouched (a key is better than nothing). Residual, named:
  a member who never taps learns the code exists only when a
  collision or a ceremony shows it — accepted, because ceremonies
  are where recognition is actually verified, and the avatar
  (`MemberAvatar`, derived from the same key) still gives every
  name a visual identity handle at a glance.
- **Founder-rooted trust + trusted-only invites (anti-sybil
  hardening).** Two connected changes, operator-decided ("we want
  to protect our communities"). (1) *The trusted tier is now
  founder-rooted*: a member is trusted if they are a founding trust
  root or have ≥2 distinct vouchers who are THEMSELVES trusted —
  a least fixpoint from the founder set
  (`@understoria/shared/trust`), replacing the flat distinct-voucher
  count. The flat count had a real hole: two accounts invited by one
  careless member could vouch each other straight into "trusted"
  (each held the inviter's implicit vouch plus the sibling's),
  manufacturing the tier entirely inside a sybil cluster. Rooted,
  no cluster without a path from a founder can ever bootstrap in.
  The node enforces the same rule (it holds the full vouch +
  redemption graph): `POST /vouches` refuses vouches from untrusted
  vouchers, so a cluster cannot even store its self-vouch edges.
  (2) *Only trusted members can issue invites.* Client-side the
  invite surfaces gate with an explanation and a path in (get
  vouched by helping people); server-side `POST /redemptions`
  refuses receipts whose inviter is not trusted, so a client-minted
  invite from a pending member is dead on arrival regardless of UI.
  Named trade-offs, stated honestly: a genuine newcomer cannot
  invite their neighbor until two trusted members vouch for them —
  a deliberate growth-vs-protection trade the operator chose; a
  single founder alone cannot mint trusted members (it takes two
  trusted voices), which slows the very first cohort of a
  one-founder community — mitigations are claiming co-founders or
  founder-side patience; and members who were "trusted" under the
  flat count via pending vouchers are demoted until their vouchers
  qualify — no stored data changes, only the computed tier.
  Founderless nodes (no NODE_FOUNDER_KEYS and no claimed founder)
  cannot compute the fixpoint and skip both gates with a logged
  warning — the same degraded posture as the rest of the
  founder-dependent machinery. Peer-pull ingestion of
  already-accepted records is deliberately exempt so federation
  convergence never diverges.
- **Removal co-signing is a trusted-member power (closing the
  tracked gap above).** Operator-decided follow-up: a signature on
  a member-removal or reinstatement record now counts toward quorum
  only if the signer is TRUSTED under the founder-rooted closure,
  not merely a member. Without this, the removal quorum was the one
  formal power still reachable by pending accounts — one careless
  or compromised trusted member could mint three sock-puppet
  invitees and expel anyone, including founders, and shrinking the
  trusted circle is itself an attack primitive. The quorum NUMBER
  stays fixed (default 3) — deliberately NOT adapted downward for
  small circles. The operator's reasoning, recorded: at a trusted
  circle of exactly two, both trusted members are necessarily
  founders (promotion needs two trusted voices, and there was only
  ever one other), so a trusted predator at that scale means a
  rotten root no removal mechanism can save, while a pending
  predator has no structural power at all (cannot invite, vouch, or
  co-sign) and is handled by blocking and by talking to the trusted
  member who invited them. Consequence, stated honestly in the UI:
  a community with fewer than three trusted members cannot formally
  remove anyone yet. Mechanics: enforcement lives in the node's
  quorum count (`routes/memberRemovals.ts`, both removal and
  reinstatement) with the same retryable-409 convergence posture as
  the membership half — a catching-up mirror that hasn't pulled the
  signers' vouches yet answers `quorum_not_met` and converges when
  they land; mirror-internal replication bypasses the trust
  judgment (the record was judged at its origin); founderless nodes
  keep the member-only rule (no root, no fixpoint); records already
  stored are never re-judged (grandfathered — trust is currently
  monotone, so a co-sign valid when made stays valid). The client
  ceremony surfaces gate with the shared trust-gate card at the
  point of action, per the standing clarity ruling. Still tracked,
  undecided: proposal governance remains membership-only, and the
  exposure there is real — auto-pass EXISTS
  (`lib/autoCloseProposals.ts`: ≥ `proposalMinAffirms` affirm
  votes, default 2, no blocks, deliberation window elapsed →
  passed; an earlier revision of this entry wrongly said it did
  not), any member may also manually record an outcome closure at
  any time (the contested chip is the honesty layer, not a gate),
  and a passed `config_change` applies a full `NodeConfig`
  payload — including `dailyHelperLimit`, `autoConfirmHours`, and
  the auto-pass knobs themselves. Pending members' affirms and
  closures currently count. The open question is whether
  affirm-counting and closure signing should require trust
  (block votes should likely stay open to every member — they are
  protective, and one block halts auto-pass).
- **Newcomer daily creation caps (anti-spam for pending
  authors).** Operator-decided ("I do want to prevent spam";
  credit farming explicitly deprioritized — balances are private
  under no-leaderboards and hours are not currency, so
  wash-trading buys nothing socially visible and the existing
  advisory flags suffice there). The node now caps how much NEW
  community-visible content a NOT-yet-trusted author can create
  per rolling day (`apps/server/src/newcomerCaps.ts`): board
  posts 10, events 3, project/task state writes 20, proposals 3,
  voice audio blobs 5, task comments 40 — numbers chosen so a
  genuine newcomer never meets them; each env-overridable and the
  whole guard can be disabled. Participation is deliberately
  untouched: claiming, exchanging, RSVPs, shift signups, votes,
  and messages (already anchored, lifetime-capped, and blockable)
  have no newcomer cap. Mechanics: counters are persisted and run
  on the SERVER's clock — record timestamps are client-claimed
  and backdatable, the same reason the lifetime insert caps
  refused rolling windows; breaches answer a retryable 429
  `newcomer_daily_limit`, so an honest member's queued record
  waits in their outbox and delivers itself after the window
  (never poisoned), with humane en/es copy on the telemetry
  surface. The cap lifts the moment the author becomes trusted —
  the guard re-checks trust per request, so vouches converging
  mid-day open the gate immediately. Trusted members, founders,
  mirror-internal replication, reseed-window traffic, and
  founderless nodes are exempt. What this is NOT: a reputation
  system, a visible quota, or a message-rate control. Residual,
  named: a rogue trusted member can still mint pending accounts
  (each with fresh caps) — bounded by the trusted-only invite
  gate's accountability chain and the per-inviter announcement
  trail; a per-inviter invite rate cap is the natural follow-up
  if pilots show it needed.
- **Links from not-yet-vouched authors render non-tappable
  (anti-phishing).** Operator-decided companion to the daily caps
  ("it should have a blurb… This shouldnt be a shame framework
  just keeping people safe"): the caps bound spam VOLUME; this
  bounds damage per item, because links are where spam becomes
  harm. Mechanism: every federated rich-text surface renders
  through one component (`components/Markdown.tsx`), and its link
  branch now checks the AUTHOR's trust on the VIEWER's device —
  a pending author's link renders as plain text showing the REAL
  destination address (killing `[nice-label](evil.com)` label
  deception for exactly the authors most likely to attempt it),
  visibly non-interactive, with a tap-for-why affordance
  explaining the rule in mechanism-not-person terms. The poster
  sees a calm composer note the moment their draft contains a
  link, so nothing is a surprise at render time. Because the
  gate is computed at render time from the federated vouch graph,
  nothing is stripped or stored: the moment the author becomes
  trusted, every link they ever posted becomes tappable on every
  device automatically, leaving no trace the restriction existed
  — the no-shame property is structural, not copy. Deliberately
  NOT changed: messages (never linkified for anyone), and the
  address stays readable/copyable — transparency plus one-tap
  friction, not censorship; a determined reader can still type
  the URL, which is an informed act rather than an impulse.
  Residual, named: devices without a founder capture fall back to
  the flat vouch count (same as every client-side gate), and the
  protection is only as current as each device's synced vouch
  graph. A source-guard test pins that every federated Markdown
  call site passes the author key, so future surfaces cannot
  silently forget the gate.
- **Desktop shell (Linux AppImage): a new client runtime, named
  costs.** `apps/desktop` wraps the byte-identical web bundle in
  Electron so a member needs no installed browser and — because the
  `app://` origin is a secure context by construction — can join a
  node that has never held a browser-trusted certificate
  (`docs/desktop-appimage.md`). What this adds to the surface, and
  what contains it: (1) *Chromium ships inside the artifact* — the
  AppImage inherits Chromium's CVE cadence, so desktop builds must
  be rebuilt when Electron patches; recorded as an operator/release
  obligation, and the app shows its build stamp in Settings. (2)
  *A filesystem-privileged main process* — contained by keeping it
  glue-thin over pure, tested policy modules: renderer sandboxed
  (`contextIsolation`, `sandbox`, no `nodeIntegration`, **no
  preload bridge at all**), permissions allowlisted (media,
  clipboard-read, sanitized clipboard-write, wake-lock; all else
  denied), navigation locked to `app://`, `window.open` limited to
  the print popup, external links only ever handed to the OS as
  http(s)/mailto (never `file:` or foreign schemes), CSP with
  hashed inline scripts (no `unsafe-inline` for script). (3) *No
  auto-update, deliberately* — a self-updating binary is a
  supply-chain surface pointed at member laptops; updates travel
  the community's own channels (CI artifact, node, flash drive),
  and turning on auto-update is a future governance decision, not a
  default. (4) *Capability honesty*: WebAuthn passkeys cannot bind
  to a domainless `app://` origin, so the desktop build reports
  passkeys unsupported (passphrase unlock remains guaranteed);
  camera QR scanning is absent in Electron and every scan surface
  falls back to paste. Residual, named: a compromised AppImage
  file is a compromised client — the same class as a malicious
  browser extension on the web path; the mitigation is source
  (drive/node/CI artifacts are checksummed and, on drives,
  optionally signed), not code.
- **Sealed server keys on the flash drive (drive + passphrase =
  the node).** A drive built with `make-flash-drive.sh
  --include-env` carries the node's live `.env` — the server signing
  keys, founder trust roots, and every operational secret —
  encrypted as `private/env.sealed` (AES-256-CBC, PBKDF2-SHA256 at
  200,000 iterations, salted; passphrase chosen at build time and
  never written to the drive, the manifest, or any file). The point
  IS the exposure: a non-technical person restoring the community
  after total node loss with one passphrase and one command
  (`docs/flash-drive-install.md` §3b). Mitigations: the encryption
  itself; the drive's README, the sealed-env README, and the printed
  emergency sheet all state "whoever holds this drive AND its
  passphrase can become this community's server — store them
  separately"; a passphrase-less finder gets ciphertext plus source
  code they could have downloaded anyway; three failed decrypt
  attempts fall through to the ordinary fresh-install path rather
  than looping forever. Residual, named: an adversary holding both
  drive and passphrase is indistinguishable from the community
  restoring itself — key rotation plus the re-seed runbook
  (operator-guide §6) is the recovery from that compromise, and
  offline brute-force against a weak passphrase is bounded only by
  the 200k-iteration KDF, so the build prompt insists on a phrase,
  not a word.

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
