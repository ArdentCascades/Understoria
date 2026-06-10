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
  No "send without showing" hatch — the envelope is several
  hundred base64 bytes and the no-hatch decision is documented
  in `device-pairing.md` §6.3.
  (c) **Fresh per-transfer passphrase.** Source device generates
  a 6-word BIP39 passphrase, ~66 bits of entropy. Member never
  picks it; clipboard-copy is not offered (clipboard managers
  persist). Conveyed by reading aloud or typing.
  (d) **5-minute hard expiry.** `expiresAt` is in the wrapped
  plaintext and enforced on the destination after a successful
  unwrap. A captured QR is useless after the window even with
  the passphrase.
  (e) **No server-side state.** The community node sees
  nothing — no envelope, no acknowledgment, no peer-discovery
  channel. Pairing succeeds or fails entirely within the two
  devices' memories.
  (f) **Component-state-only on the source.** Envelope and
  passphrase live in React state only. No localStorage,
  sessionStorage, or IndexedDB write. Cancel / route-change /
  auto-dismiss drops the state.
  Rejected alternatives, each with the reason:
  - **Server-stored wrapped envelope** (passkey-PRF style)
    relocates identity bytes onto the community node and shifts
    a portion of trust onto whoever holds the passkey keychain.
    Tracked as future work in `device-pairing.md` §4, pending
    pilot signal on whether QR transfer is too inconvenient in
    practice.
  - **Real-time ack channel** (long-poll, WebRTC, BroadcastChannel)
    would put pairing state on the server or a third party. The
    "I'm done" button is a member assertion, not a system
    confirmation; the 5-minute auto-dismiss is the actual
    security property.
  - **"Send without showing" hatch** of the kind the invite QR
    uses. The envelope is too large to type, and clipboard /
    `navigator.share` routing re-introduces the persistence
    problem we removed from the invite flow.
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
  acceptance (design only; not yet shipped).** Today the primary
  organizer of a project can call `addCoOrganizer(projectId,
  callerKey, newCoOrgKey)` in `apps/web/src/db/projects.ts` (~line
  328) and write the new key directly into
  `Project.coOrganizerKeys` — no consent step from the invitee. The
  design in `docs/co-organizer-invitations.md` replaces that with
  two new federated record types
  (`CoOrganizerInvitation` signed by the inviter,
  `CoOrganizerInvitationResponse` signed by the invitee) and makes
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
  the trapped-co-organizer half of this values gap. Until the
  implementation PRs land (PR A data + types; PR B server
  federation; PR C UI — see
  `docs/co-organizer-invitations.md` §11), no signed-acceptance
  flow exists in the codebase and this entry tracks design intent
  only.

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
  Implementation shipped in PRs #186-#192 per
  `community-events.md` §13; this entry describes the surface as
  it now exists on the wire.

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
  (c) **Data-export excludes the tables.** The Profile →
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

- **Node system key for auto-confirmation (design only; not yet
  shipped).** A per-node Ed25519 signing key, held by the node
  operator, will sign the helped-side signature on `Exchange`
  records when neither party has confirmed within a community-
  configured window (default proposal: 7 days; `0` disables).
  Introduced because today an unresponsive partner blocks credit
  permanently, and the project-task confirmation flow deliberately
  forbids the completer from confirming themselves
  (`apps/web/src/db/projects.ts` ~line 600) — so for organizer-
  is-completer tasks with no co-organizer, credit cannot flow at
  all. This is **the closest the codebase has to admin authority**,
  and the design doc (`auto-confirm-key.md`) does not soften that.
  What makes it acceptable is the bound: the key only signs
  records the helper has already signed (cannot invent exchanges),
  cannot modify hours / category / parties / completion time (all
  inside the helper's signed canonical payload), and every record
  it touches is audit-tagged (`autoConfirmed: true`, `confirmedBy:
  "system:<nodeId>"`) so any verifier can distinguish a system-
  signed auto-confirm from a member-signed mutual confirm. The
  threshold is community-configurable through the existing Agent
  11 / Agent 13 surfaces, including `0 = off`.
  Accepted residual risks: the operator can change the threshold
  to fire earlier than the community expects (detectable post-hoc
  by comparing `autoConfirmedAt` to the original
  `awaiting_confirmation` transition); the operator can refuse to
  run the sweep entirely, which is a denial-of-service against
  credit flow but is equivalent to today's status quo where
  unresponsive partners block credit forever; the operator can
  collude with a member who files bogus completions, but the
  helper's signature is still on the bogus record so the
  attribution is public and the existing safeguards module still
  applies. Full abuse model: `auto-confirm-key.md` §5. Until that
  PR lands, no system key exists in the codebase and this entry
  tracks design intent only.

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
