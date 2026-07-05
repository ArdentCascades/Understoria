# Changelog

All notable changes to Understoria will be documented in this
file. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project adheres roughly to
[Semantic Versioning](https://semver.org/). Pre-1.0 releases may
include breaking changes.

## [Unreleased]

### Security
- **The auto-confirm waiting window is now server-enforceable
  (signed awaiting-transition artifact).** Previously the age gate at
  `POST /auto-confirm` trusted the client-claimed `awaitingSince`, so
  a caller could always claim an old value and skip the window — and
  project-task confirmations had no age gate at all. Now, when an
  exchange enters `awaiting_confirmation` (first confirmation of a
  post exchange; a claimer marking a project task complete), the
  acting party signs a small `AwaitingTransition` record that the
  client pushes to a new `POST /awaiting-transitions` endpoint. The
  node stamps its OWN clock at ingestion (first-writer-wins per post),
  and `/auto-confirm` measures the window from that stamp — wall-clock
  waiting on the node's clock that no client can backdate, covering
  the project-task path via its label. Rollout knob:
  `AUTO_CONFIRM_REQUIRE_TRANSITION` (default off) controls whether a
  request with no artifact is refused (`missing_transition`) or falls
  back to the legacy advisory behavior while clients upgrade.

### Security
- **Disk-fill backstop: per-table and per-key insert ceilings.** A
  node accepts any validly-signed record and attackers own the keys
  they generate, so row growth was bounded only by the rate limiter.
  Two env knobs now cap it: `TABLE_ROW_CEILING` (total rows per
  federated table) and `PER_KEY_ROW_CEILING` (lifetime rows per
  signing key per table — lifetime, not rolling, because record
  timestamps are client-claimed and a window could be dodged by
  backdating). One preHandler covers every federation POST; breaches
  answer 507 so honest members' outboxes retry rather than poison,
  and the node never deletes anything. Defaults are far above pilot
  traffic; `0` disables.

### Fixed
- **Federation cursors can no longer wedge inside a timestamp tie
  (composite-cursor phase 1, server side).** Every federation store
  and GET route now accepts an optional `sinceId` pair component:
  with `(since, sinceId)` the page is strictly after that exact
  position, so even a batch of hundreds of rows sharing one
  millisecond pages through cleanly. The legacy `since`-only inclusive
  cursor is preserved byte-for-byte for existing pullers. Client-side
  adoption (peer pull + PWA pulls) is specced as phases 2–3 in
  `docs/composite-federation-cursors.md`.

### Added
- **Two follow-up design notes (proposed — awaiting ratification).**
  `docs/direct-exchange-label.md`: a `direct:<uuid>` namespace for
  `Exchange.postId` so help with no post and no project — a plain
  event's setup crew, spontaneous in-person help — can become credit
  through the unchanged mutual-signature ceremony, with the uuid
  deliberately random so no gathering correlator ever reaches the
  wire, and no auto-confirm path by construction.
  `docs/ways-to-plug-in.md`: a local-read-only discovery shelf
  matching a member's offer categories/skills to open shifts, needs,
  and tasks — deliberately dumb token matching, browsable never a
  queue, nothing stored about what was browsed, pull-only.
- **Shift signups (phase 1).** Events can now be broken into
  time-boxed, optionally-capped shifts ("Setup crew, 9–12, 4 spots")
  that members sign themselves up for — the coordination layer
  between "a work day is on the calendar" and "we have enough hands."
  Signing up also RSVPs the member "Going" (one transaction), so the
  block gates, cancelled-event guards, and the existing
  `event_today` / `event_cancelled` attention items all compose with
  zero new rail machinery; RSVP'ing "not going" clears the member's
  signups atomically. Shifts and signups are local-only Dexie rows in
  the `EventRSVP` posture — never signed, never federated, never
  exported, cleared by soft-purge; an event with twelve shifts
  federates byte-for-byte identical to one with none. Spot counts
  render as invitation ("2 spots open"), never deficit; capacity is
  soft; there is no check-in, no attendance record, and no
  roster-vs-exchange reconciliation, permanently. After a work-day
  shift passes, a quiet link offers the path back to the linked
  project, where credit flows through the existing claimer-stated
  task confirmation — nothing on the wire references the event or
  shift (a permanent boundary now recorded in the threat model: no
  event-derived identifier may ever appear in an `Exchange.postId`
  label). Design: `docs/shift-signups.md` (all four §14 rulings
  adopted their recommended defaults); member/organizer guides
  updated.

### Security
- **Rate limiting no longer collapses to one bucket behind the reverse
  proxy (Round-4 review).** `trustProxy` was hard-off, so behind the
  documented Caddy proxy every request carried the proxy's loopback
  address and the whole community shared ONE per-minute rate-limit
  bucket — one noisy client throttled everyone, and per-client limits
  were unenforceable. A new `TRUST_PROXY` env var (default off, so a
  spoofed `X-Forwarded-For` on a direct connection still can't influence
  `req.ip`) lets the operator set `loopback` when fronted by the proxy,
  restoring real per-client buckets. The IP is still only ever HASHED to
  a bucket, never stored raw. Documented in `docs/operator-guide.md`.
- **Pairing fingerprint widened to 64 bits (Round-4 review).** The
  device-pairing safety number rendered only the first 4 bytes (32 bits)
  of the public key. Because the downstream `publickey_mismatch` check
  confirms only that the envelope's key pair is internally consistent —
  an attacker's own valid keypair passes it — the fingerprint is the
  sole defense against a mid-flow QR swap, and a 32-bit prefix was
  grindable offline (~2^32 keygens to forge a match). It now renders 8
  bytes as `XXXX XXXX XXXX XXXX`, pushing a pre-grinding attack out of
  practical reach while still reading aloud in one breath.

### Fixed
- **Posts now cap their free-text fields on the wire (Round-4 review).**
  Events and task comments already bounded their free text, but a signed
  post's `title`/`description`/`locationZone` were length-unchecked, so a
  validly-signed post carrying a ~60 KB title (bounded only by the 64 KB
  body cap) was accepted and federated verbatim. `parsePost` now enforces
  the same ceilings the event validator uses (title/location 200,
  description 2000), rejecting oversize posts at the shape gate before
  signature verification.
- **RSVP writes are guarded against ghost and cancelled events (Round-4
  review).** `rsvpToEvent` never checked the event exists, so a stray
  call wrote a dangling RSVP row for an event not on this node; it now
  refuses. It also re-asserts organizer-authoritative cancellation (the
  same check the calendar uses) so a tap landing in the render window
  after an event is cancelled can no longer record an RSVP to it.
- **Daily exchange limit counts a rolling 24 hours, not a UTC calendar
  bucket (Round-4 review).** The hard-stop `dailyHelperLimit` was
  evaluated against a fixed UTC day, so a helper could hit the limit at
  23:50 UTC and the limit again at 00:10 — double the cap in twenty
  minutes, and the window reset mid-afternoon for a US-west community.
  It now counts exchanges completed within the trailing 24 hours, which
  the config field already described.

### Fixed
- **Disputes now resolve (Round-4 review).** Closing a dispute proposal
  only stamped the proposal row; nothing transitioned the flagged post
  out of `"disputed"`, so a REJECTED (baseless) dispute stranded the
  post forever and permanently denied the helper credit. `closeProposal`
  now applies the outcome to the post: rejected/withdrawn restores the
  pre-dispute status (normal flow and credit resume); an upheld dispute
  cancels a pre-completion post (no credit flows) and leaves an
  already-completed one alone (credit is never reversed — see the new
  `docs/dispute-resolution.md`). The `/disputes` list shows only OPEN
  disputes, so a resolved one no longer renders a live "Flagged" chip
  contradicting Profile's count. `castVote` refuses a vote on a closed
  proposal.

### Security
- **A blocker can no longer pass a proposal over a hidden block vote
  (Round-4 review).** The per-viewer governance-hide filter (`hideGovernance`)
  also fed the auto-close eligibility math, so a member who hid a
  blocking voter's vote computed "passes" and could close the proposal
  over a standing block. Eligibility is now computed from the UNFILTERED
  vote set, and `closeProposal` refuses to record "passed" while any
  block vote stands (server-of-record) — a block changes what a member
  SEES, never what they can ENACT (docs/blocking.md §6.3).

### Fixed
- **Block-filter leaks on deep-linked / project surfaces (Round-4
  review).** A blocked organizer's event rendered in full via a direct
  `/event/<id>` link (EventDetail read Dexie raw instead of the
  block-filtered context); a blocked member's project announcements and
  history-timeline rows rendered in ProjectDetail/TaskDetail unlike the
  already-filtered task comments. All now honor the block filter. And a
  project-adoption proposal about the viewer's OWN project is no longer
  governance-hidden — the attention rail deep-links a sitting primary to
  it to warn of a stewardship transfer, which they must be able to read
  and contest.

### Security
- **Passphrase protection now covers keys minted after it was enabled
  (Round-4 review).** `getSecretKey` returns any plaintext row before
  checking the session lock, and new identities (invite-redeem mint,
  device pairing) always wrote plaintext — so a key created after a
  member enabled a passphrase sat readable in IndexedDB and the app
  signed with it while nominally "locked". All secret-key writes now go
  through a new `persistSecretKey`, which WRAPS the key under the live
  session master key on a protected device. Device pairing was also
  reworked: it resolves the protection state before writing (refusing
  cleanly on a locked device instead of committing a plaintext key),
  wraps the imported key under the EXISTING passphrase rather than
  calling `enablePassphrase` (which rewrapped every identity under the
  new member's passphrase, locking others out of their own keys), and
  `softPurge` now clears `pairingLog` (device labels + pairing graph
  survived a scrub). `randomBytes` fails closed when Web Crypto is
  absent instead of silently using `Math.random()` for nonces/salts/
  the transfer passphrase.

### Fixed
- **Device-pairing data-integrity fixes (Round-4 review).** A re-pair
  now MERGES an existing member row's profile fields instead of a full
  `createMember` replace that reset `seedBalance`/`createdAt`/`nodeId`
  and silently changed the member's timebank balance across their own
  devices. The imported block bundle is merged with per-pair dedup and
  no longer resurrects a locally-unblocked pair or creates duplicate
  block rows; `unblockMember` deletes ALL rows for a pair (not just the
  first), so a duplicate could no longer leave someone "still blocked"
  with nothing to unblock. `passphrase.unwrap` returns `null` on a
  corrupt/truncated blob instead of throwing, so the unlock path
  surfaces `wrong_passphrase` rather than crashing.

### Security
- **Only an event's organizer can cancel it (Round-4 review).** An
  `EventCancellation` is signed, but its signature proves only that
  *whoever* `createdBy` names signed it — not that they organize the
  event. Nothing re-checked `createdBy === event.createdBy`, so anyone
  could sign a cancellation over a victim's `eventId` with their own
  key and make the gathering vanish from every calendar, the detail
  page, "Coming up", and every RSVP'er's notifications. Every client
  surface that renders cancellation state now re-asserts organizer
  authority via a shared `isAuthoritativeCancellation` helper (a
  non-organizer's cancellation is inert), the client federation pull
  drops a mismatched cancellation when it already holds the event, and
  the server peer-pull applies the same organizer check the POST route
  already had — so a forged cancellation can't be laundered node to
  node either.

- **Auto-confirm can no longer mint credit against an arbitrary victim
  (Round-4 review).** `POST /auto-confirm` was unauthenticated and took
  the confirmation's `helpedKey`, `hours`, `category`, and pending-age
  (`awaitingSince`) straight from the request body without consulting
  any signed artifact — so a caller could get the node system key to
  sign an exchange debiting anyone for any amount. The endpoint now
  **binds** each post-based request to the poster-signed post it
  finalizes: the confirmed-for party must be the real poster (helped
  side of a NEED / helper side of an OFFER), and the hours and category
  must match what the poster signed; unbindable project-task requests
  (projects don't federate) are bounded by a generous hours cap.
  `completedAt`/`awaitingSince` are also future-bounded. Two residuals
  are documented honestly in `docs/auto-confirm-key.md` §5 and filed on
  the roadmap: the age *window* stays client-advisory (the node holds
  no signed awaiting-transition record), and the project-task path
  stays an operator-trust surface — both closed by a future signed
  awaiting-transition artifact.
- **Anti-gaming safeguards now apply to auto-confirmed and project-task
  exchanges.** `applyAutoConfirmedExchange` and `_writeTaskConfirmation`
  previously skipped the short-duration / reciprocal-pattern / daily
  hard-stop checks that the manual board path enforces, contradicting
  `docs/auto-confirm-key.md`. They now evaluate the same safeguards and
  **flag** (rather than throw — the row is already signed, so credit is
  not discarded) any short/reciprocal/over-daily-limit pattern for
  community review.


### Fixed
- **Floating pill buttons no longer clipped by the bottom nav.** The
  BottomNav's height includes `env(safe-area-inset-bottom)` (the
  home-indicator band on modern iPhones), but the floating action
  pills (Board's post buttons, Calendar's "+ Create event"), toasts,
  and the update prompt were anchored at plain `bottom-20`/`bottom-24`
  offsets that ignored it — so the nav swallowed their bottom edge by
  roughly the inset. All four anchors now add the safe-area inset,
  the same treatment the offline banner already had; on desktop the
  inset is 0 and nothing moves.

### Fixed
- **Bottom nav no longer detaches while typing.** `position: fixed`
  pins to the layout viewport, and iOS Safari (and Android Chrome
  since 108) only pans the VISUAL viewport when the on-screen keyboard
  opens — so the tab bar, the offline banner, toasts, the update
  prompt, and the Board/Calendar floating buttons all floated
  detached mid-screen above the keyboard on every page with an input.
  A new `useVirtualKeyboardOpen` hook (VisualViewport-based,
  scale-corrected so pinch-zoom never triggers it, 150px floor so
  URL-bar chrome never does, and hardware keyboards unaffected) now
  hides that fixed-bottom chrome while the keyboard is up and restores
  it on close. Live-region surfaces (offline banner, toasts) hide via
  opacity with pointer-events gated, so screen-reader announcements
  still fire mid-typing and nothing invisible stays tappable.

### Security
- **Round-3 review: federation cursor poisoning closed.**
  `pullFederatedExchanges` and the three co-organizer pulls advanced
  their persisted cursor past rows whose signature FAILED verification,
  using the rejected row's own attacker-chosen timestamp — one forged
  row from a compromised node or plain-HTTP MITM wedged that pull
  forever. Refused rows never move the cursor now. Defense in depth:
  every client pull bounds its cursor timestamp (positive integer,
  ≤ now+24h) so a fabricated-signer row — self-consistently signed by
  keypairs a malicious node invents — cannot wedge the cursor either;
  claims (unsigned by design) get the same bound server-side, where
  `claimedAt` previously accepted `Infinity`/`1e18` and one stored row
  hid all subsequent claims from every puller.
- **§4 rotation-history smuggling closed.** The same-nodeId
  fail-closed guard compared only the `current` key — which is public
  and can be echoed verbatim by an impostor peer smuggling its own key
  in a forged `history` entry, letting fabricated exchanges verify as
  "auto-confirmed by" the victim node. The guard now requires the full
  published trail (current AND history) to agree, and peer-served
  `retiredAt` values are bounded at parse time (positive integer,
  ≤ now+24h).

### Fixed
- **Round-3 review: invite-revocation regressions.** `redeemInvite`
  did not treat `redeemed_despite_revocation` as terminal, so a
  converged token could be redeemed again on a shared device — minting
  a ghost identity with a fresh seed balance and clobbering the
  converged state. And the revocation pull advanced its cursor past an
  authority-mismatch drop, permanently stranding a genuine revocation
  when an attacker's placeholder landed first; the drop now leaves the
  cursor untouched so the genuine record re-applies once the receipt
  corrects the row.
- **Never-exported tables were exported.** `eventRsvps` (the member's
  event-attendance graph) and `eventProjectLinks` (local-project
  pointers) are declared "never synced, never exported, never
  federated" by the schema but were missing from
  `EXPORT_EXCLUDED_TABLES`; both now stay out of the shareable backup
  bundle, and `softPurge` clears `eventProjectLinks` (it already
  cleared `eventRsvps`).
- **Crash-atomicity.** Server schema migrations now run DDL + version
  bump in one transaction (a crash mid-migration bricked the next boot
  with "table already exists"); `createMember` writes the key and the
  member row atomically; `redeemInvite`'s mint mode joins the member/
  key writes to the invite+receipt transaction, closing the
  orphan-identity crash window §5.2 exists to prevent.
- **Doc drift.** Three stale references describing the redemptions
  cursor as exclusive (`> since`) corrected to the actual inclusive
  `>=`-with-token-tiebreak contract; the theoretical >page-size
  same-timestamp tie wedge is filed as a roadmap deferred item
  (composite cursors need their own design pass).

### Added
- **Invite revocation now converges across devices (Phase 1).** A
  revoked invite that was redeemed anyway used to show `revoked` only
  on the inviter's device and `redeemed` everywhere else — a permanent
  per-device split of the newcomer's trust state, contradicting the
  redemption receipt's own "arrival order never matters" contract. A
  new signed `InviteRevocation` record (single signer: the inviter,
  over `{token, inviterKey, revokedAt, nodeId}`) now federates PWA↔node
  like a redemption receipt: `revokeInvite` signs and enqueues it, a
  new `POST/GET /invite-revocations` route stores it first-writer-wins
  on a server-monotonic `receivedAt` cursor, and both devices pull it.
  The merge is presence-based and commutative — a token's terminal
  state is a pure function of which records exist for it, so a receipt
  and a revocation may arrive in any order on any device and all land
  on the same `redeemed_despite_revocation` state. The revocation is
  authority-bound (§3.1): it only acts when its `inviterKey` matches
  the redemption receipt's embedded, inviter-signed invite, so a third
  party cannot revoke someone else's invite. This is the
  convergence-only half of `docs/invite-revocation.md` §10; the trust
  effect is unchanged (the implicit vouch still counts, "behaves as
  today"), with vouch withdrawal deferred to Phase 2 behind the §9
  governance ruling.

### Fixed
- **Round-2 review, UI batch.** Co-organizer project actions
  (complete/resume/launch/pause/archive/add-task/bulk-add) are now
  attributed to the acting member, not the primary organizer — the
  misattribution corrupted project history and the adoption
  "organizer gone quiet" signal. The repost form no longer loses the
  member's edits when a background posts write re-runs its prefill
  (one-shot seed). Switching conversations in the split pane now
  remounts the view (keyed on the member), fixing a wrong-recipient
  draft carryover, stale search state, and a cross-thread message
  flash. PostForm's "matching needs" links land on the Needs tab
  (were `?tab=NEED`, which parsed to Projects). `useDraftAutosave`
  flushes its pending write on unmount instead of dropping the last
  ≤600ms of edits. `formatRelativeTime` no longer renders "0y ago"
  for timestamps 360–364 days old.

### Security
- **§4 auto-confirm: fail closed on nodeId shadowing.** A compromised
  peer could serve `GET /config` claiming another node's `nodeId`
  with its own key and forge "auto-confirmed by" that node. The
  resolver now refuses to verify any record for a `nodeId` that two
  peers claim with different keys (a legitimate key comes from the one
  peer that IS that node), downgrading a would-be forgery to a
  detectable denial. Separately, the rotation docs are corrected to
  state honestly that a leaked *retired* key can still sign a
  *backdated* record (the attacker controls both key and self-declared
  timestamp, so signing the timestamp does not help); the real fix —
  receive-time retirement enforcement — is documented and deferred
  (`docs/system-key-rotation.md` §6).

### Fixed
- **Round-2 review, purge/federation correctness.** softPurge now
  clears `outbox` (verbatim payload text), `invites` (live redeemable
  tokens), and `votes` (governance graph) — the sensitive tables it
  had been leaving intact. `NODE_ID`, `NODE_SYSTEM_KEY_HISTORY`, and
  `PEER_PULL_INTERVAL_MS` are plumbed through `docker-compose.yml`
  (and `NODE_ID` documented in `.env.example`) — previously a Docker
  deployment silently defaulted `NODE_ID` to `node_local` (colliding
  the §4 nodeId↔key binding) and ignored any rotation history. The
  outbox flush no longer marks a row delivered when its payload was
  replaced mid-POST (which lost task-comment tombstones), and
  auto-confirmed exchanges are no longer enqueued to `/exchanges`
  (which 422-poisoned one outbox row per auto-confirm).

### Fixed
- **Round-2 review, production-breaking set.** (1) A single request
  could wedge task-comment federation mesh-wide: `deletedAt` is
  excluded from the signed payload and the federation cursor is
  `max(created_at, deleted_at)`, so a replayed signed comment with an
  unbounded `deletedAt` jumped every puller's high-water mark to the
  far future and hid all later comments. `parseTaskComment` (and the
  web puller) now bound `deletedAt` to `≤ now + 24h` and `≥ createdAt`.
  (2) The cross-node claims pull advanced its cursor only on APPLIED
  rows, so under oldest-first paging a full page of non-applicable
  claims stalled the cursor and newer claims were never fetched; it now
  advances on every well-formed row like the other pullers. (3) Three
  pages (`PostDetail`, `ProjectDetail`, `Profile`) called hooks after
  an `if (!entity) return` early return, so any cold load / deep link
  crashed the whole app when the entity hydrated a tick later; the
  hooks now run unconditionally (Profile's authenticated body split
  into a child that only mounts with a non-null member). A top-level
  `ErrorBoundary` is added as defense-in-depth so a future render throw
  shows a recovery card instead of a blank screen. (4) Data export had
  drifted to a hand-maintained 5-table include-list, silently dropping
  20 tables of the member's own data (projects, tasks, messages,
  governance, events, trust) from their backup; it now enumerates
  `db.tables` minus a documented exclusion set (adding live invite
  tokens and the device-pairing log to the security/privacy exclusions).

### Added
- **System-key rotation is now operable end-to-end.** The verifier
  side shipped previously, but `GET /config` hardcoded
  `systemKey.history: []` — an operator had no way to publish a
  retired key, so rotating would still have orphaned every
  pre-rotation system-signed record on pulling peers. New
  `NODE_SYSTEM_KEY_HISTORY` env var (JSON array of
  `{pubkey, retiredAt}` entries, validated loudly at boot, sorted
  ascending) is served verbatim in `GET /config.systemKey.history`.
  `docs/system-key-rotation.md` is the operator runbook: procedure,
  what peers experience, and the recovery paths for
  rotated-without-publishing and lost-old-pubkey; deploy and
  incident-template docs now route to it (including the correction
  that a node which ever system-signed records must disable via
  `AUTO_CONFIRM_MIN_HOURS=0`, not by removing the key — removing the
  key also unpublishes the history peers need).

### Fixed
- **Redemptions cursor is inclusive with a token tiebreak.** Two
  receipts sharing a `received_at` millisecond could straddle a page
  boundary and the strict `>` cursor skipped the un-served one
  forever — the same tie class fixed for the other federated stores.
  Pullers merge idempotently by token, so re-served boundary rows are
  no-ops; the §7 server-monotonic cursor design is unchanged.

### Added
- **Rotation-aware system-key verification (§4).** The strict
  auto-confirm gate on peer ingestion would have rejected every
  historical system-signed exchange the moment an operator rotated
  their node's system key — §4 requires verifiers to "accept
  signatures from any previously-published system pubkey," and the
  verifier side must exist before any rotation happens.
  `verifyExchangeLabel`'s resolver now receives the record's signing
  time (`autoConfirmedAt`, falling back to `completedAt`), and the
  peer pull worker consumes `systemKey.history` from each peer's
  `GET /config`, selecting the key that was current at that moment:
  pre-rotation records verify against the retired key forever, while
  a record claiming a retired key for a post-retirement timestamp
  resolves to the newer key and fails — retiring a compromised key
  actually disarms it. `history` is still `[]` until a rotation
  procedure ships; publishing the trail is now all an operator needs
  for pulling peers to keep converging.
- **Strict §4 verification of auto-confirmed exchanges on peer
  ingestion** (`docs/auto-confirm-key.md` §4). The server's peer pull
  previously used the lenient `verifyExchange`, which accepts an
  `autoConfirmed` row on the helper signature alone — anyone
  controlling a single member key could fabricate "auto-confirmed"
  hours into a peer's ledger. The pull worker now refreshes each
  peer's published system key from `GET /config` every cycle (the
  response gains a `nodeId` field alongside `systemKey`, providing
  the authenticated nodeId↔pubkey binding) and verifies every pulled
  exchange with `verifyExchangeLabel`: member-signed and
  system-signed rows are accepted, anything else — including an
  auto-confirmed row whose origin node's key is outside the mesh —
  is rejected. The resolver spans all configured peers, so rows
  relayed through one peer but signed by another's system key still
  verify. Safety property: while a peer's `/config` has never been
  reachable its exchange pull FAILS (cursor stays put, next cycle
  retries) rather than running with an empty resolver, which would
  reject auto-confirmed rows while sibling rows advance the cursor
  past them — a permanent skip; after a first success, transient
  config failures fall back to the last-known-good key. The PWA's
  own-node pull keeps its documented lenient path — it now inherits
  the strict gate transitively, since its node ingests strictly.

### Changed
- **Delivered outbox rows are pruned after 7 days.** They only serve
  as the "identical payload already shipped" dedup guard; pending and
  poisoned rows are never touched. Previously delivered rows
  accumulated for the life of the device.
- **Soft-purge scrubs project-activity text by allowlist.** Every
  string-valued key in an activity `data` blob that is not a known
  structural identifier (ids, member keys, lifecycle enums) is now
  blanked, so a future activity type stashing a new free-text key is
  scrubbed by default instead of silently escaping the purge.

### Added
- **Invite redemption Phase 1: redemption receipts — invite status
  and roster convergence** (`docs/invite-redemption.md` §6–§9; new
  wire surface, covered by the three now-shipped threat-model §7
  entries). Redeeming an invite now signs a `RedemptionReceipt` —
  the new member's Ed25519 signature over a payload embedding the
  inviter's original `SignedInvite` verbatim (two independently
  verifiable attestations) — and enqueues it in the same transaction
  as the invite row, in both mint and attach modes. Uniquely among
  outbox kinds, the receipt is enqueued even before a community-node
  URL is configured (a fresh device redeems first and confirms the
  node afterwards); nothing crosses any wire until the member
  explicitly confirms a URL, after which the queued receipt delivers
  retroactively. The server gains a `redemptions` table (schema v11,
  node-lifetime retention) and `POST /redemptions` (verifies both
  signatures + self-redeem + expiry; first-writer-wins on the
  token — the server-side single-use enforcement the local-only
  design never had; a 7-day delivery-grace window bounds late
  arrivals) plus `GET /redemptions?since=` cursored by the
  server-assigned `receivedAt` (the deliberate deviation from
  sibling routes: convergence for an inviter offline a week must not
  depend on client clocks). The web app pulls receipts
  (`pullFederatedRedemptions`): a verified receipt flips the
  inviter's invite row open→redeemed (her Invites page finally shows
  it, with who and when), records redeemed-despite-revocation on
  revoked rows as information for a conversation, and materializes a
  member row on every device so rosters and member counts converge —
  never clobbering a richer local member row. The §9 companion
  `pullFederatedVouches` ends the manual-vouch dead end so trust
  status converges across devices. Receipts deliberately do NOT
  peer-replicate (the roster stays off the inter-node wire), and the
  never-wired `POST/GET /invites` routes + `pullInvitesFromPeer` are
  REMOVED — `GET /invites` served full `SignedInvite` rows (token +
  signature: a live redeemable-link feed) to any caller (§10.1). Net
  wire surface: +2 endpoints, −2 endpoints. Operators redeploying
  the node: the v11 schema migration runs automatically on boot
  (new `redemptions` table; drops the always-empty `invites` table).

### Fixed
- **Code-review sweep: federation data loss, double credit, purge
  coverage, and six smaller correctness bugs.** (1) Server federation
  cursor pagination could permanently skip records: the `list()`
  queries for exchanges, vouches, posts, invites, claims, task
  comments and the three co-organizer record kinds returned the
  NEWEST page while pullers advance a max-cursor, so any backlog
  larger than one page (new node onboarding, >500-row bursts)
  orphaned everything below the newest page forever. All eleven
  stores now page oldest-first with an inclusive cursor and id
  tiebreak (timestamp ties at a page boundary can no longer be
  lost). (2) The PWA ingested federated posts without verifying
  their signatures — a compromised node or MITM could inject posts
  attributed to any member's key; `pullFederatedPosts` now
  shape-checks strictly and runs `verifyPost` like every other pull.
  (3) Task-comment soft-delete tombstones never reached peers: the
  outbox deduped on recordId alone (dropping the re-enqueued
  tombstone), the pull window used `created_at` (a late tombstone
  fell behind the cursor), and comment writes weren't atomic with
  their outbox rows. Dedup is now on (recordId, payload), the pull
  window/cursor use `max(created_at, deleted_at)`, and the writes
  are transactional. (4) Project-task confirmation validated
  eligibility outside its write transaction: two concurrent
  confirmations (double-click, second tab, sweep racing a manual
  confirm) each wrote a distinct signed Exchange — double credit —
  and confirmations of different tasks clobbered each other's
  `contributedHours`. The write path now re-reads and re-validates
  task + project in-transaction. (5) The server never persisted the
  §4 auto-confirm provenance columns, so system-signed exchanges
  were served stripped of their `autoConfirmed*` markers and
  REJECTED by every pulling peer (server schema v11 adds the
  columns); the auto-confirm route's idempotent re-submission also
  now returns the stored row via a point lookup instead of a broken
  `list({limit:1}).find()`. (6) `hardPurge` had drifted ten tables
  behind the schema — messages, task comments, drafts, proposals,
  votes, events, RSVPs, cancellations, event-project links and node
  config all survived the emergency wipe; it now enumerates
  `db.tables` so nothing can drift again. `softPurge` gains the
  missing content scrubs (comment bodies, event text, proposal text,
  activity text; messages/drafts/RSVPs cleared) and no longer
  falsely reports settings as scrubbed. (7) `disputeExchange`
  accepted never-claimed, cancelled and already-disputed posts.
  (8) The auto-confirm sweep measured a post's waiting window from
  `createdAt` instead of when it entered `awaiting_confirmation`,
  collapsing the dispute grace period for old posts; posts now stamp
  `awaitingSince` at the transition. (9) `milestoneProgress` showed
  the first milestone as reached before it was; below-first-threshold
  now reports `current: null`. (10) The outbox worker scheduled its
  wake from an arbitrary pending row instead of the earliest-due one.
- **Invite redemption Phase 0: honest error exits, paste recovery,
  attach-don't-mint, origin-derived node suggestion**
  (`docs/invite-redemption.md` §5, client-only — zero new wire
  bytes). A failed redemption is never silently converted into
  looks-like-success self-onboarding again: `/invite` with a missing
  fragment (the incident vector — messenger in-app browsers strip
  `#fragments` from tapped link previews) renders a paste-the-link
  recovery input instead of an immediate `malformed` error, every
  error screen carries the same input (`extractInviteToken` accepts
  a full URL, a whole pasted message, or a bare token), per-error
  guidance blames the transport rather than the member, and the
  exit is renamed "Continue without joining" with plain not-joined
  copy. On a device that already holds the current member's secret
  key, `redeemInvite` now ATTACHES the invite to the existing
  identity (display-name edit offered; no new keypair, no member
  row, no second seed-credit balance) instead of minting a ghost
  second identity — the shared-device "I'm someone else" escape
  hatch keeps the mint path one tap away, and the self-redeem guard
  still runs first. A quiet, dismissible (per-identity) Board card
  offers `/invite` to members who onboarded without joining, and
  `/invite` is now reachable from Settings. When the PWA was served
  by a community node and no node is configured, the derived
  `${origin}/api` is health-probed and offered behind an explicit
  informed-consent card (invite-accept success path + Board;
  localhost/dev and already-configured devices excluded; decline is
  permanent; never silent — operator ruling §15.2).

### Added
- **Invite redemption propagation (design note,
  [`docs/invite-redemption.md`](./docs/invite-redemption.md)).**
  Docs-only response to a live production incident: redeeming an
  invite is purely local, so the inviter's invite row stays "open"
  forever, the new member appears on no one else's roster, and the
  implicit first vouch never reaches any other device's trust
  computation — and a redemption error silently funnels into the
  welcome tour, minting an orphan identity that looks like success.
  Phase 0 (client-only, no wire change): honest error exits with a
  paste-the-link recovery input, a "continue without joining" state
  with a quiet re-join affordance, attach-don't-mint redemption on
  already-identified devices, and an origin-derived
  `communityNodeUrl` suggestion behind the existing informed-consent
  card. Phase 1 (the wire change): a single new federated record —
  a `RedemptionReceipt` signed by the new member, embedding the
  inviter's original `SignedInvite` — pushed via the outbox to
  `POST /redemptions` and pulled by every member device, flipping
  the inviter's row open→redeemed, materializing the roster row,
  and feeding the existing `trustStatusWithInvites` machinery; plus
  the companion `pullFederatedVouches` so manual vouches stop
  dead-ending at the server. Open invites never cross any wire
  (registration-at-creation is analyzed and rejected), receipts do
  not peer-replicate, and the unwired `POST/GET /invites` routes —
  whose GET would serve live redeemable tokens if ever wired — are
  removed in the same phase. Three threat-model §7 entries ship
  with the note *(design only; not yet shipped)*; three operator
  rulings surfaced with recommended defaults (§15). Implementation
  not started; PR ladder in §14 with Phase 0 shippable
  independently.
- **Event ↔ need bridge (design note,
  [`docs/event-need-bridge.md`](./docs/event-need-bridge.md)).**
  Docs-only predicate for connecting board Needs with community
  events — a member's many-hands need becomes a scheduled
  gathering, the need card shows "a gathering is planned," and
  the event page shows the ask it answers. The recommended shape
  is a local-only `EventNeedLinkRow` Dexie row in the
  `EventProjectLinkRow` posture: never signed, never enqueued,
  never pulled, `"event_need_link"` rejected at the
  `OutboxRow.kind` type level — **zero new wire bytes**, so no
  threat-model §7 entry ships with the note (the federated-
  pointer alternative is analyzed and rejected in §7: needs do
  federate, but the pointer would be a breaking canonical-payload
  change and a permanent public correlator binding a vulnerable
  ask to a gathering's place and time). Links may be created only
  by the need's author, in phase 1 only at event creation
  (`EventNew ?needId=` deep link mirroring the `?projectId=`
  work-day gate, plus an own-needs picker). Event completion
  suggests — never triggers — need fulfillment via an
  author-only inline line; no new attention-rail items; no
  volunteer counts, staleness nudges, or pressure mechanics
  (permanently rejected in §11). Three operator rulings surfaced
  with recommended defaults (§14). Implementation not started;
  PR ladder in §13 with the server slot loudly skipped.

### Changed
- **Dev-toolchain migration: vite 5 → 8, vitest 2 → 4.** Bumped the
  build/test chain together — `vite` 5.4.21 → 8.1.3, `vitest` 2.1.9 →
  4.1.9 (web + server), `@vitejs/plugin-react` 4.7.0 → 6.0.3,
  `vite-plugin-pwa` 0.21.2 → 1.3.0 (workbox stays ^7.4.1). No runtime
  behavior change intended: `vite.config.ts` needed no edits, and the
  only source churn was typing two `scrollIntoView` test spies for
  vitest 4's stricter `vi.fn` types. Vite 8 builds with rolldown/oxc
  instead of rollup/esbuild; the generated service worker still
  registers in `prompt` mode with `skipWaiting` gated on the member's
  explicit Refresh tap, and the full update flow (new deploy → "A new
  version is available." card → Refresh activates the new build, never
  a silent swap) was re-verified in a real browser against the vite 8
  output. Full gate green: 1,858 web + 135 server tests, typecheck,
  lint, both builds, both Docker images.

### Security
- **All remaining `npm audit` advisories cleared (5 → 0).** The
  vite 8 / vitest 4 migration above clears the five advisories left
  after the 2026-07-03 lockfile pass — nested `esbuild` ≤ 0.28.0
  (GHSA-67mh-4wv8-2f99), `vite` ≤ 6.4.2 dev-server advisories
  (GHSA-4w7w-66w2-5vf9 and related), their `@vitest/mocker` /
  `vite-node` propagation, and the critical-rated vitest UI-server
  RCE (GHSA-5xrq-8626-4rwp, unreachable here since nothing runs
  `--ui` or an `api:` server). `npm audit` now reports 0 advisories.
- **Dev-tooling advisory cleanup (lockfile-only).** `npm audit fix`
  plus an in-range `tsx` update bumped `form-data` 4.0.5 → 4.0.6,
  `ws` 8.20.1 → 8.21.0, `js-yaml` 4.1.1 → 4.3.0, `@babel/core` (and
  `@babel/*` sub-packages) 7.29.0 → 7.29.7, and `tsx` 4.21.0 → 4.23.0
  (moving its `esbuild` to 0.28.1), clearing 5 of 10 open `npm audit`
  advisories — including both standalone highs. No `package.json`
  manifest changed and no production code is affected; all advisories
  were dev/build tooling only. The remaining 5 sit on the vite/vitest
  chain and clear only with the deferred vite 8 / vitest 4 migration
  (see `docs/maintenance.md`).

## [0.3.0] — 2026-07-03

Third development release. Community life beyond one-to-one
exchange: a community events calendar with RSVPs, project work
days, and .ics export; local-only member blocking (softblock,
never federated); task ordering with "Follows" dependencies; and
a three-tier UX pass that reorganized ProjectDetail, Board,
Calendar, Dashboard, EventNew, and Profile around every-visit
content. Onboarding now mints the identity in the welcome flow
and states the no-recovery tradeoff before the point of no
return; the demo community seeds in dev builds only, so
production first-run is an empty node. en/es locale parity and
the accessibility DOM-order rule held throughout. Full suite:
1,858 web + 135 server tests (was 215 at 0.2.0).

### Fixed
- **Community-settings auto-confirm control shows its real strings
  again.** Both locale files declared the top-level `"community"`
  key twice; JSON parsing is last-wins, so the first block — the one
  carrying `community.autoConfirmHours.{label,help,unit}` — was
  silently discarded and the auto-confirm hours control in
  Profile → Community settings rendered raw key-path fallbacks.
  The two blocks are now merged into one per file (en + es, no keys
  dropped — every key in both blocks is referenced), and a new
  `duplicateKeys.test.ts` scans the raw locale JSON for duplicate
  keys at any nesting depth so `JSON.parse`'s silent shadowing can't
  eat translations again. Also refreshed `docs/quickstart.md`'s
  stale "162 tests passing" claim.

### Changed
- **Onboarding overhaul: production first-run is now an EMPTY node.**
  The demo community (the "You" founder, Rosa/Marcus/Imani/Theo,
  their vouches and five sample posts) seeds in dev builds only
  (`import.meta.env.DEV`) — real deployments start with no members
  and no posts, and no purge choreography is needed before inviting
  anyone. The first identity is minted by onboarding itself:
  (1) Welcome's profile-setup step now carries a required
  display-name field and creates a real Ed25519 member on finish
  (open nodes, plus the first-device bootstrap on invite-only
  nodes, which previously could never fire because the seed always
  won the race); when a member already exists — an invited member
  arriving from InviteAccept, or the dev founder — the step greets
  them by name, prefills the field, and updates the profile instead
  of minting a second identity. Invited members keep the full
  five-screen concept tour (operator ruling). (2) Skipping the tour
  now lands on profile setup instead of finishing outright:
  "onboarded" can never be true without a named identity behind it,
  and the profile-setup step itself has no Skip affordance (Back and
  leaving still work — nobody is trapped). (3) The identity concept
  screen now states the honest other half of "no one can lock you
  out": there is no reset and no company that can restore the key —
  losing the device without a paired backup device means the
  identity is gone. Operator and quickstart guides updated to the
  dev-only-seed contract, including the corrected purge-first step
  order for existing deployments that still carry demo data.
  sections indexed and a two-pane layout at lg+.** (1) Mobile stack:
  balance (+ its hint) → exchange history → participation rows
  (carrying / organizing / Invites, with the invite hint now adjacent
  to the Invites card) → Roles earned → the About editor (rarely
  touched; it no longer separates the balance from the ledger that
  itemizes it). The `?edit=1` Board-nudge deep link still lands on
  the editor. (2) Exchange history clamps to its newest 10 settled
  rows behind a "Show N older exchanges" toggle (render-layer only —
  `transactionHistory` stays unbounded; pending rows never clamp).
  (3) Learn, Disputes, Proposals, the Settings row, and Add device
  fold into one "Community & account" index of labeled rows; Learn
  and Add device disclose in place (the `/profile#design-principles`
  deep link now auto-opens Learn's principles panel), Disputes /
  Proposals keep their open counts. (4) CommunitySettings collapses
  behind a default-closed `<details>` — still on the page per
  `community-authority`, no longer ~500px of every visit. (5) At lg+
  a sticky 320px rail (header/identity, balance + hint, Roles
  earned) docks beside the main column, ProjectDetail-rail style:
  two render sites for Roles earned, never CSS `order-*`, so DOM
  order equals visual order at every breakpoint (WCAG 2.4.3).
  Emergency stays a top-level card — never inside any disclosure
  (privacy-as-precondition); the page above it is strictly shorter
  than before. New `Profile.reflow.test.tsx`, `historyClamp` unit
  tests, and disclosure default-closed tests lock the invariants.

### Removed
- **Member pages carry no comparable stats or badges (operator
  ruling + `no-leaderboards`).** MemberDetail — the page for viewing
  ANOTHER member — no longer displays anything a member can compare
  themselves against: the trust chip dropped its vouch count
  ("Trusted (3 vouches)" / "New here (1/2 vouches)" → plain
  "Trusted" / "New here"; the count variant remains on the member's
  OWN Profile), and the "Vouched for by" roster (`TrustedByList`,
  now deleted along with its `trustedBy.*` locale keys) is gone —
  its length was a de facto score, its per-vouch timestamps a
  browsable activity record (`no-activity-search`), and its empty
  state shamed newcomers (`solidarity-not-shame`). Everything
  functional stays: skills/availability/area, qualitative trust
  status, and the Vouch and Block actions with unchanged gating.
  A guard comment atop `MemberDetail.tsx` documents the ruling and
  `MemberDetail.test.tsx` adds absence assertions plus a tripwire
  against "N exchanges/vouches/hours"-shaped copy returning.

### Added
- **History-row task links + hint CTAs land on their answers
  (wayfinding audit + hint-CTA inventory).** (1) Project History
  timeline rows for task activity (added / claimed / released /
  completed / confirmed) now link to the task page
  (`/project/:id/task/:taskId`) whenever the activity row's `data`
  carries the task id stamped at write time; rows without one stay
  plain text (never title-matched), and member names deliberately
  never link. The "stepped back from …" sentence links just the task
  title (via `Trans`); links are absolute so they also work from the
  timeline's mount on the task page. (2) Hint CTAs: the install
  card's "More help" goes to `/help#install-app` (was `/profile`)
  and gains the 44px touch-target floor; the profile nudge's "Add
  some details" goes to `/profile?edit=1`, which scrolls the editor
  into view, focuses the display-name field, and strips the param
  via history replace; the Board / balance / invite ContextualHints
  swap their FAQ-duplicating `<details>` toggles for descriptive
  links to the FAQ anchors (`/help#post-something`,
  `/help#what-is-balance`, `/help#invite-someone`) — removing the
  `<summary>` hit-area/focus issues outright; the vouch-discovery
  nudge stops over-promising a Vouch button on "any member's
  profile" and links "How vouching works" to a new
  `how-vouching-works` FAQ entry (en + es) covering what a vouch
  commits, where the button lives, and why it can't be retracted.
  Dismissal behavior of every hint/nudge is unchanged.
- **Single-event `.ics` export (community-events.md §11.5a, PR #289).**
  "Add to calendar" in the event detail overflow menu downloads a
  one-event RFC 5545 file built entirely client-side
  (`apps/web/src/lib/eventIcs.ts`): UID from event id + node id,
  UTC DTSTART/DTEND (DTEND omitted for point events per §3.6.1),
  TEXT escaping, 75-octet line folding, CRLF endings, and a
  link-back URL in the description. Deliberately excluded and
  locked by tests: no server route or subscription URL (calendar.md
  §10.5 stands), no VALARM (reminders belong to the member's own
  calendar app), no ATTENDEE/ORGANIZER properties, no RSVP data.
  Item hides on cancelled events, mirroring the RSVP control.
  Threat-model §7 events entry and the member guide gained the
  §11.5a-obligated sentences (exported files outlive a panic-purge).
- **Navigation quick batch (wayfinding audit).** (1) New `<BackLink>`
  primitive extracted from TaskDetail's "← Back to {project}"
  breadcrumb — a real link (middle-click/new-tab work) with
  TaskDetail's exact styling plus an optional history-aware mode
  (`navigate(-1)` when `window.history.state.idx > 0`, the named
  fallback on a cold entry); adopted by TaskDetail (zero visual
  change), EventDetail, MemberDetail (its duplicate top
  `navigate(-1)` + footer "Back to board" pair unified into one),
  Conversation, Project archive, Settings, Proposals, and Disputes —
  the last four of which previously had a dead Back button on cold
  entries. (2) EventDetail's back is history-aware: project →
  work-day → event → Back returns to the project instead of dumping
  members onto /calendar; direct links still fall back to the
  calendar. (3) The amber "in community review" chip on flagged
  exchange-history rows on Profile now links to the dispute
  conversation it names — anchored to the matching card
  (`/disputes#<proposalId>`) when resolvable from the exchange's
  post, plain `/disputes` otherwise; same chip styling, no new alarm.
  (4) Profile gains a labeled "Settings" row (with a one-line
  description of what lives there) as a peer of the governance
  cards, so the 20px header gear is no longer the only doorway to
  /settings; the gear stays for muscle memory.
- **Conversations show which post they're about.** "Reach out" on a
  post now arms the conversation with `?about=<postId>`: a dismissible
  hint above the composer shows "You're writing about: {title}", and
  the first message sent carries the post reference — so the OTHER
  party's thread finally shows which offer/need the conversation
  concerns (top finding of the wayfinding audit). The reference rides
  INSIDE the encrypted payload as a versioned envelope
  (`{"v":1,"text","aboutPostId"}`), never as a cleartext column — a
  cleartext topic link would widen what device access reveals beyond
  sender/recipient/timestamp (privacy-precondition). Messages without
  a reference stay bare strings, so legacy threads keep working;
  decode is try-parse-with-fallback. Each referencing message renders
  a quiet "about: {title} →" chip linking to the post (generic
  "about a post →" when the post isn't locally known), per-message
  rather than a sticky header so a thread that touches several posts
  over time stays truthful. Conversation-list previews and message
  search operate on the envelope's text, never raw JSON.
- **EventNew create-form parity batch (PR #287).** Five refinements
  bringing the event-creation form to parity with ProjectNew (the
  house create-form pattern), plus one silent-wrong-time fix.
  (1) Draft autosave + DraftBanner (`event-new` Dexie draft key):
  every field including the selected template and the end-time
  toggle round-trips, restoring collapses the template picker (the
  #233 rule), and a `?projectId=` work-day deep-link always wins —
  no banner, no autosave, the stored plain-visit draft survives for
  a later plain visit. (2) Inline validation via
  `useFieldValidation` (title, location, capacity, start
  date/time), plus cross-field on-change errors for past-start and
  end-before-start shown at the field group the moment both parts
  combine — the submit-time guards all stay (defense in depth; the
  clock moves between blur and submit). (3) Two-pane lg+ layout
  mirroring ProjectNew: sticky template rail left
  (`EventTemplatePicker` gains the same `layout="rail"` prop as
  TemplatePicker), form right with a reading-width cap; mobile DOM
  order picker → form preserved (WCAG 2.4.3, no CSS `order`); the
  §3 signing card stays in-flow immediately above Cancel/Submit —
  mandated placement, now locked by a test. (4) The start time no
  longer defaults to the next round hour: the date still seeds to
  today, but the member must consciously pick a time — an unnoticed
  default on a permanent signed federated record is worse than one
  extra tap (a template picked before a time exists parks its
  suggested duration and applies it the moment a time is chosen).
  (5) Location + capacity pair on one row at sm+; date/time pairs
  unchanged; everything stays stacked full-width below sm.
- **Dashboard doorways batch (PR #288).** Six-part pass turning the
  read-only stats page into one with pull-based paths to action —
  doorways, never pressure. (1) The needs-answered stat card gains a
  quiet "See open needs →" link to the Board's Needs tab
  (`/?tab=needs`); stat copy byte-identical, no "unmet"/"remaining"
  framing. (2) New "Where hands are welcome" section — the second
  instance of the Coming-up pattern (unranked recency ordering,
  capped at 3, self-hiding at zero, no counts) mixing open NEED
  posts with active projects whose tasks could use more hands
  (reusing `projectNeedsMoreHands` from `lib/projectFilter.ts`,
  which was already extracted — Board behaviour untouched).
  (3) CanopyMilestones names each row's next unreached leaf in its
  accessible name and a quiet visible "next: {{label}}" caption —
  no progress bar, no quantified gap. (4) Streak-card zero-state
  renders a warm word ("gathering" / "en camino") instead of
  "0 days in a row" (solidarity-not-shame); the other four stat
  cards keep their honest plain zeros. (5) A one-line governance
  doorway near the federation summary — "{{count}} proposals open
  for discussion" linking to `/proposals`, hidden at zero, never
  "awaiting your vote", no deadlines. (6) Federation-summary
  tappability was investigated and deliberately skipped: the
  summary only counts peer communities and no peer-communities
  surface exists to link to (no new routes invented). i18n: new
  keys in both locales (`dashboard.handsWelcome.*`,
  `dashboard.proposalsOpen_one/_other`,
  `dashboard.stats.streakGathering(Sub)`,
  `dashboard.stats.seeOpenNeeds(Aria)`,
  `dashboard.milestones.next`).
- **Calendar polish batch (PR #284).** Five smaller refinements
  from a fresh audit. (1) The agenda weights the viewer's own
  commitments — an RSVP'd-going event, a project deadline they
  organize/co-organize, their own expiring post — with a canopy
  left-accent + semibold plus an sr-only "(yours)" suffix (or the
  existing going aria-label) so the cue is never colour-only. A
  personal-view distinction computed purely from the viewer's own
  local data; no counts, no popularity signal (no-leaderboards).
  (2) The filter row shows a quiet "Filters · N active" summary
  (mirroring Board's `filtersActive`), and Mine becomes a labeled
  chip beside Events-only instead of a bare checkbox. (3) View
  choice and filters persist across visits via the Dexie settings
  table (`calendarViewMode`, `calendarFilters`) — a deliberate,
  operator-approved reversal of the earlier session-only choice
  (device-local, never federated); paging/offset state is
  deliberately NOT persisted, the calendar always opens on today.
  (4) Event detail renders capacity as "8 of 12 going" using the
  same node-local count every local viewer already sees — §6
  attendee-visibility tiers unchanged. (5) The truly-empty calendar
  now points at the + button ("Know of something the community
  should gather for?"), and a filtered-empty calendar gets the
  Board-style "Nothing matches these filters" + Clear filters
  escape instead of the misleading quiet-week copy.
- **Calendar month paging + same-day time sort + bounded week
  paging.** The month view (the lg+ default) gains prev/next
  paging with a quiet "Today" jump, mirroring the week view's
  controls (aria-labelled buttons, `aria-live` month heading,
  both locales). The entries window now FOLLOWS the paged view
  (`calendarViewWindow` in `lib/calendar.ts`: union of the
  default 30-back/60-forward window with the viewed month grid /
  week) — previously the fixed window silently hid every event
  more than 60 days out from all three views, since `EventNew`
  caps the past but not the future. Paging is bounded to ±12
  months (±52 weeks for the week view, which previously paged
  unbounded into permanently empty grids); buttons disable at
  the bounds. Same-day events now sort by `startsAt` ascending
  within the day (a 10am skillshare lists above a 7pm potluck)
  instead of insertion order; density stays exchange-keyed and
  the agenda's past-entry filter is untouched.
- **Markdown rendering for long-form prose (PRs #277, #278;
  supersedes the #275 linkify pass).** Post, event, and project
  descriptions plus task descriptions and comments now render a
  safe Markdown subset. The pipeline is XSS-proof by construction:
  `lib/markdown.ts` is a pure parser producing an AST (never an
  HTML string), and `components/Markdown.tsx` walks it into a
  fixed, closed set of React elements — no
  `dangerouslySetInnerHTML` anywhere. #277 shipped the Essentials
  set (bold / italic / inline code / links / flat lists); #278
  extended to the full safe set: strikethrough, headings (rendered
  `role="heading"` + `aria-level` so federated content never
  pollutes the page's real heading outline), blockquotes, fenced
  code blocks (verbatim, never re-parsed), tables (in
  `overflow-x-auto` wrappers), horizontal rules, GFM task-list
  items, and nesting. Hardening rules: `sanitizeUrl` allows only
  http(s)/mailto (a rejected link drops to plain text); raw HTML
  in the input is inert text; image syntax `![alt](url)` degrades
  to a safe LINK, never an `<img>` (auto-fetching a remote image
  would leak every viewer's IP to an author-chosen server). Links
  open `target="_blank"` with `rel="noopener noreferrer
  nofollow"`. A small `MarkdownHint` one-liner under each
  Markdown-enabled editor teaches the syntax by example.
- **Overflow (kebab) menus + Copy link on detail pages (PRs
  #279–#281).** New reusable `OverflowMenu` component (extracted
  from the Conversation header kebab; 44×44 trigger,
  `aria-haspopup="menu"` / `aria-expanded`, `role="menu"` popover,
  Escape-closes-and-refocuses). The task page (#279), project
  header (#280), and post + event detail pages (#281) each gain a
  kebab holding **Copy link** (canonical URL via the `shareUrl`
  helper) plus relocated secondary actions: the project header
  menu absorbs the one-tap organizer lifecycle verbs (Reorder
  tasks, Mark complete, Resume, Archive/Unarchive — exact gates
  unchanged); the post menu absorbs "Repost with changes" / "Post
  this again". Primary and sensitive actions (Claim, Confirm,
  Flag, RSVP, Message) stay inline.
- **Per-task pages (PRs #273, #274).** Every project task gets its
  own page at `/project/:id/task/:taskId`. Phase 1 (#273) added
  the route + `useProjectTaskContext` (context reconstructed from
  global state — no new data loading). Phase 2 (#274) split the
  old all-in-one task row: the project list renders a slim
  `TaskCard` (status/hours chips, badges, one-line description
  preview, Claim, and a quiet "Open task · N comments" link) while
  the page renders `TaskDetailBody` — the full description, every
  lifecycle action, the claimer narrative, and the entire comment
  thread, which previously ballooned inline on the project page.
  The page header carries a "← Back to {project}" breadcrumb
  (later extracted as the app-wide `BackLink` primitive in #291).
- **Project page real-estate pass (PRs #268, #270, #271, #272).**
  Surface the work, collapse the governance (#268): on mobile the
  organizer/stewardship sections move out of the rail to the
  bottom of the main column, and the infrequent governance
  (co-organizer management, handoff, step-down) collapses behind
  one default-collapsed **"Manage project"** disclosure; the
  reading order becomes summary → updates → work days → tasks →
  management with no CSS `order`. Task search + filter pills hide
  until a project has 7+ tasks (#270) — below that the bare list
  renders unfiltered so a stale filter can never strand a short
  list. Long project descriptions clamp to four lines behind
  "Show more" (#271; CSS-only clamp, full text always in the DOM
  for screen readers). The desktop rail gains a `NextWorkDayGlance`
  (#272) — the single soonest upcoming work day as a calm link,
  self-hiding when none is scheduled, no counts.
- **Board calm-prompt orchestration (PRs #265, #266).**
  `KeepAccessNudge` (#265): a calm "keep a spare copy of your
  account" prompt for members on a single device (no pairing-log
  row), pointing at device pairing — the only real access-recovery
  path, since there is no key export or seed phrase. `BoardNudges`
  (#266): the Board previously mounted all five calm prompts
  (first-action, profile, vouch-discovery, keep-access, install
  card) as independent siblings that could stack into a wall of
  cards; a new orchestrator renders AT MOST ONE — the
  highest-priority prompt that is both resolved and eligible —
  with each prompt's gating moved into a per-prompt status hook.
  `ContextualHint` renders only as the fallback so hint and nudge
  can never stack.
- **PWA install guide (PRs #261, #262, #267).** The app was fully
  installable but nothing ever said so. `lib/installGuide.ts`
  feature-detects the install posture (installed / one-tap
  `beforeinstallprompt` / manual steps) and `InstallGuide` renders
  a dismissible Board card plus a Profile → Learn panel (#261).
  Reframed from an OS×browser dropdown to three device buckets
  (#262) — Chromium browsers get the one-tap button from
  detection, iOS is Safari-only, the rest is one generic
  instruction each. The welcome tour gains an optional,
  non-blocking install step (#267) that auto-skips when the app
  is already installed.
- **Onboarding + demo polish (PRs #263, #264).** The demo seed now
  writes real signed vouches (`db.vouches`) instead of the legacy
  `Member.vouchedBy` array the trust computation no longer reads —
  previously every seeded member showed "pending trust" and the
  Vouch button could never appear (#263). The five welcome-tour
  concept screens gain in-style inline SVG illustrations
  (hourglass-sprouting-leaf, key-as-leaf, tree) and
  plain-language copy for a mixed-literacy audience (#264).
- **Calendar + events batch (PRs #257–#260, #269).** A personal
  "you're going" marker on event chips (#257) — the viewer's OWN
  local RSVP only, never anyone else's, never a count. A quiet
  "Coming up" gatherings glance on the Dashboard (#258;
  `UpcomingGatherings`, soonest non-cancelled events capped at 4,
  chronological, no attendance counts). The "Mine" filter now
  covers events (organized or RSVP'd going/maybe) and the category
  filter works for event categories (#259). Multi-day events
  render on every spanned day instead of vanishing after day one
  (#260; per-day entries with `isMultiDay` / `dayIndex` /
  `dayCount`). Expiring needs are reframed as a call for help
  (#269): a 🤲 glyph for open needs vs 🌱 for offers, with
  invitation copy instead of deadline-alarm copy.
- **Event templates — camaraderie gatherings (PRs #254–#256).**
  Curated event templates for the create-event flow, per
  `docs/event-templates-plan.md` (landed with #254). Phase A
  (#254): content + data layer (`content/eventTemplates.ts`,
  en + es), enabling the already-signed `EventPayload.templateId`
  wire slot (a guard change, not a wire change) and the server
  validator fix. The "Create Event" picker + unified prefill
  (#255; `EventTemplatePicker`). Event visual identity on the
  calendar and detail page (#256): per-category emoji + palette
  via `lib/categories.ts`, so gatherings read differently from
  deadlines at a glance.
- **Project-UX queue, all twelve plans (PRs #242–#253; plans in
  `docs/project-ux-plans.md` via PR #241).** Task deep-links
  (#242): attention-rail and /my-tasks links land on the task row
  (`#task-<id>` scroll + focus + motion-safe ring), not the page
  top. Confirmation-outflow attribution (#243): an organizer's
  balance breakdown explains hours moved to helpers on a project's
  behalf. "Working alongside" roster (#244): names-only,
  alphabetical contributor card on the project page — reveals
  nothing the task rows don't already show. One-tap fresh copy of
  a completed task (#245) for recurring work. "Could use more
  hands" project filter on the Board's Projects tab (#246).
  Co-organizer authority reconciliation (#247): every read site
  uses the materialized signed-acceptance array. Actual hours at
  completion (#248): the claimer states the time actually given
  and the signed Exchange credits that, not the organizer's
  estimate (Dexie v26, wire format unchanged). "Projects you
  organize" workbench at `/my-projects` (#249): pull-only,
  read-only, counts only what is waiting on the viewer.
  Aggregate-only project completion moment (#250): a one-time,
  per-device pop card for ANY viewer plus a permanent low-volume
  line in the completed banner — the unit is *us*, not *me*.
  Project work days (#251): a LOCAL-ONLY `eventProjectLinks` Dexie
  table (v27) linking events to projects with no wire surface —
  `scheduleProjectWorkDay` re-validates organizer authority,
  EventNew accepts `?projectId=` prefill (location deliberately
  never prefilled), ProjectDetail gains an "Upcoming work days"
  section, and the calendar's project filter narrows to linked
  work days; peers see a plain event. Orphaned-project adoption
  (#252): a `project_adoption` proposal category installs
  community stewardship when a primary organizer goes quiet —
  self-nominated proposer, quiet-period-gated, an "I'm still
  here" cancel for the returning organizer, no shame framing
  (design in `docs/project-adoption.md`). Clone re-issues
  co-organizer invitations (#253): a pre-checked checklist of the
  source roster sends fresh invitations — consent re-performed,
  never inherited.
- **Cross-project "tasks you're carrying" view + fixes batch
  (PR #238).** New `/my-tasks` route listing the member's active
  claims (claimed + awaiting confirmation) grouped by project,
  newest first, read-only by design — claim / release /
  mark-complete stay on the project page so the #236/#237
  consequence dialogs remain the single home for those actions.
  Same PR: accepted co-organizer invitations materialize into the
  live authority list; light-mode secondary text moves moss-500 →
  moss-600 (AA); a restored project draft keeps its template
  selection; the device-pairing FAQ names the six-word phrase
  instead of a "passphrase".
- **Copy honesty batch (PR #239).** Softened deficit framings
  (surplus thanks, trust chip, check-in counter, review chips),
  traded market vocabulary for flow vocabulary, and retired
  wording that contradicted the principle ledger.
- **Maintenance log (`docs/maintenance.md`, PR #259).** A running
  log of deferred maintenance + the standing dependency policy,
  opened with the deferred dev-tooling security upgrade (vite 5→8
  / vitest 2→4 chain; the surgical esbuild override breaks
  `vite build`, so it's its own future migration).
- **Task ordering + dependencies workstream (PRs #206–#216).**
  The full task-ordering and soft-block-dependency design from
  `docs/task-ordering-and-dependencies.md` shipped across six PR
  slots (D loudly skipped because tasks remain local-only — same
  loud-skip pattern as `docs/blocking.md` §13 + community-events
  EventRSVP). Predicate doc + threat-model §7 addendum +
  co-organizer-invitations §4 capabilities enumeration in #206,
  with the threat-model crossreference echoed in #207 and #208.
  Shared types (`ProjectTask.orderIndex: number`,
  `dependencies` doc-comment rewrite) in #207. Dexie v25 +
  backfill + `reorderProjectTask` action + **removal of the
  claim-time hard throw at `projects.ts:486-489`** + tests in
  #209 (the load-bearing test "Claim of a structurally blocked
  task SUCCEEDS" locks the soft-block reversal in code). UI in
  #214: `@dnd-kit` drag + always-visible Move up / Move down
  buttons + "Follows: &lt;upstream task&gt;" badge + the
  claimant's "You'll be reminded when it's ready" line + i18n.
  FLIP animation + Reorder modal in #215 (keyboard / screen-
  reader parity for projects with many tasks where drag is
  awkward). Public-chip suppression for structurally-blocked
  tasks (`needs_more_hands` honours `isStructurallyBlocked`) in
  #216. PR D — server / federation — was deliberately not
  shipped: tasks remain local-only, no federation surface.
- **Co-organizer legacy cleanup (PR #218).** Removed the legacy
  `addCoOrganizer(projectId, callerKey, newCoOrgKey)` path now
  that the signed-invitation flow from
  `docs/co-organizer-invitations.md` is fully landed and
  pilot-validated. Removing the unilateral entry point closes
  the loophole the threat-model §7 entry called out (a primary
  organiser could otherwise re-add a co-org without their
  signed acceptance). `co-organizer-invitations.md` §4 already
  carries the explicit "the unilateral `addCoOrganizer` legacy
  path was removed in PR #218" cross-reference.
- **Calendar + events polish (PRs #204, #205, #217).** Agenda
  default hides past items behind a small "Show past" toggle
  (#204) so the view leads with "today and forward" rather than
  greeting members with a long backlog. The Month view gives the
  current day a soft canopy highlight (#205) so "now" is
  findable without scanning the row. Create-event flow validates
  against past-event creation (#217) — clear inline error rather
  than the previous silent reject.
- **UX polish batch (PRs #210, #211, #212, #213).** Removed the
  redundant Launch button from `OrganizerControls` (#210) — the
  Planning banner from PR #103 already carries the launch
  affordance, so the duplicate was clutter. Conversation header
  block menu + clearer empty-state copy in Messages (#211): the
  ⋮ menu on a conversation header reaches Block / Unblock
  without leaving the thread, and a fresh conversation greets
  the member with "No messages yet — say hi" instead of a blank
  pane. Messages list reactivity to changes in `blockedKeys`
  (#213) — blocking a contact from another surface (member
  profile, Settings → Blocked) removes their thread from the
  Messages list immediately without a manual refresh. BottomNav
  GPU layer hint (#212) — `will-change: transform` on the
  fixed-position nav so iOS Safari doesn't drop frames during
  rapid scroll.
- **UX audit Tier 1 (PRs #219, #220, #221, #222).** Service-
  worker update prompt (#219) — when an updated SW installs,
  a small "A new version is available" prompt with a Reload
  button surfaces so members pick up the new build at a moment
  of their choosing; deploy-runbook §11 updated to name the
  prompt. Offline banner + outbox transparency (#220) — the
  shell shows a "You're offline" banner with a count of queued
  changes so the outbox is never opaque. Balance pending
  breakdown on Profile (#221) — the headline balance breaks
  out exchanges awaiting confirmation by source so members can
  see exactly what's in flight; covers project tasks awaiting
  organiser confirmation (groundwork for #234). FAQ refresh,
  permanent nudge dismissal, and attention-rail actionability
  ordering (#222) — FAQ entries reflect current behaviour;
  dismissed nudges stay dismissed across reloads; the
  attention rail orders items by how actionable they are
  rather than by recency alone.
- **UX audit Tier 2 (PRs #223, #224, #225, #226, #227).** PWA
  PNG manifest icons + Add-to-Home-Screen polish (#223) — the
  manifest serves crisp PNGs at every launcher size, so the
  installed PWA is iconographically clean across iOS / Android
  / desktop. Co-organiser capability disclosure card +
  acceptance pointer (#224) — the project page renders a
  capability card enumerating what a co-organiser can do; the
  invitation card carries the same pointer so the role is
  consented-to rather than assumed. Dark-mode secondary-text
  contrast audit (#225) — secondary text tokens raised to meet
  AA at the smaller text sizes and at Largest. Exchange state
  narrative on PostDetail (#226) — the page narrates the
  exchange's state in plain language above the affordances so
  the member doesn't have to infer it from buttons. Board
  empty-state clarity, Welcome CTA, invite expiry visible at
  redeem, Settings descriptions (#227).
- **UX audit Tier 3 (PRs #228, #229, #230, #231, #232).** Full
  Spanish FAQ translation (#228) — the FAQ keys now have es
  parity in `faq.es.ts`. Message-search thread context +
  name-only-match bug fix (#229) — each search result shows
  the conversation it came from, with the matched substring
  highlighted; a prior bug where a hit on the conversation
  partner's display name alone showed an empty thread is
  fixed. Vouch-moment discovery nudge (#230) — when a member
  is in a vouch-eligible moment, a calm pointer surfaces the
  vouch affordance without making it adversarial. iOS
  apple-touch-startup-image splash screens (#231) — cold-
  launching the installed PWA on iOS renders a canopy splash
  in place of the white flash. Disputed-state operational
  pointer (#232) — a disputed exchange surfaces a small link
  to the dispute conversation and a one-line explanation of
  what the community process looks like next.
- **Organiser / claimer cycle (PRs #233–#237).** Template
  picker collapses on draft restore (#233) — opening a draft
  project keeps the picker collapsed so the form is the focal
  point. Pending task credit on Profile (#234) — the balance-
  pending breakdown from #221 now includes hours from project
  tasks the member has completed but the organiser hasn't
  confirmed yet. Co-org authority uses a derived view + honest
  `pausedAt` (#235) — the effective co-organiser set comes
  from the signed-acceptance flow rather than the legacy
  array, so authority checks are correct under acceptance /
  decline / self-removal; `pausedAt` records *when* the
  organiser paused, not the project creation time. Claimer
  QoL batch (#236) — the "Mine" filter on a project's task
  list narrows to tasks the viewer has claimed (same
  affordance for organisers); a claim summary + gentle
  release-of-claim path ("step back, no judgment") + ack
  feedback when the organiser confirms. Task exchange honesty
  (#237) — confirm-task dialog names the debit out loud
  ("Confirming credits Sasha with 3 hours; the same amount
  comes from your balance"); release of an
  `awaiting_confirmation` task is its own activity entry
  rather than being elided.
- **Linkify URLs in task comments + event / post descriptions
  (PR #275).** Free-text fields render bare URLs as real
  `<a>` elements with `rel="noopener noreferrer"` so members
  can tap through without copy-paste. Pure rendering pass —
  the underlying text content is unchanged; markdown rendering
  for the same fields is the subject of a separate workstream
  whose docs land alongside that PR.
- **Community events (PRs #186–#192).** A federated `Event` +
  `EventCancellation` record family for skillshares, potlucks,
  work days, meetings, and care circles. The local `EventRSVP`
  table never enters the outbox — RSVPs stay on the node where
  they happen, closing the federated-attendance-graph surveillance
  vector the design names. Create-event surface uses the
  comparison-card discipline that the co-organizer flow established;
  RSVP control expands an informed-consent card naming the
  visibility tiers before submission. Location is free text (no
  GPS pin); the soft `capacity` field surfaces an
  `event_capacity_reached` attention item to the organizer when
  the local RSVP count crosses the threshold. Calendar integration
  gains an "Events only" filter chip; three new attention-rail
  kinds (`event_today`, `event_cancelled`, `event_capacity_reached`)
  are pull-only per `no-notifications`. Threat-model §7 entry,
  privacy-policy §4 / §6 amendment, and an incident template for
  federated event spam from a peer node landed alongside the
  design in PR #186. Implementation: shared types + canonical
  payloads + signature verification (PR #187, with wire-contract
  alignment); Dexie v22 + actions + federation pull (PR #188, with
  cursor-key naming alignment in PR #189); server-side ingestion
  + peer pull (PR #190); event create / detail / RSVP / cancel UI
  (PR #191); calendar marker + attention rail wiring (PR #192).
  Full design in [`docs/community-events.md`](./docs/community-events.md).
- **Member blocking (PRs #193–#198).** A local-only personal-relief
  surface, parallel to and independent of the community dispute
  process. A single `Block` Dexie row records `blockerKey`,
  `blockedKey`, `createdAt`, `hideGovernance: boolean`, and an
  optional private `note`. Blocks never federate, never aggregate
  to any community-facing surface, never signal anything to the
  blocked party — the discriminator `"block"` is rejected at the
  `OutboxRow.kind` type level with `@ts-expect-error`. Generic-error
  discipline holds across every consumer surface: a blocked-from
  claim, RSVP, vouch issuance, or co-organizer invitation returns
  the same generic "not available" error a withdrawn-post would
  return, so the blocked party cannot fingerprint which not-found
  errors are blocks. Settings → Blocked contacts renders each row
  obscured by default (generic avatar, "Blocked contact," block
  date); tap-to-reveal swaps in the display name and truncated
  pubkey for privacy-from-overshoulder. Soft-purge clears both
  `blocks` and `previouslyBlocked`; data export excludes them;
  the device-pairing transfer payload carries block state to
  newly-paired devices (already-paired devices need a manual
  re-pair). Design + threat-model §7 entry + privacy-policy §3 /
  §4 amendment + incident-templates §8 + member-guide §14a +
  organizer-guide §7a + the `co-organizer-invitations.md` §10
  cross-reference landed in PR #193, with three settled open
  questions folded in via PR #194. Implementation: shared/local
  types + outbox-kind lock (PR #195); Dexie v24 + actions
  (PR #196); MemberDetail block flow + Settings panel + paired-
  device sync (PR #197); consumer-surface wiring (PR #198). Full
  design in [`docs/blocking.md`](./docs/blocking.md).
- **Invite-only mode (PR #202).** A new `nodeConfig.inviteOnly`
  flag. When enabled, the `/welcome` profile-setup step is
  replaced with an invite-only landing component; concept slides
  still render so visitors understand what they were invited to.
  Closes the walk-in-from-a-shared-event-URL path the operator
  surfaced. The existing signed-invite redemption flow at
  `/invite#<token>` stays the only way in once the gate is
  active. First-member bootstrap exception: if the local
  `members` table is empty, the gate is bypassed so the operator
  can set up a fresh node without needing an invite from
  themselves. Defaults to false for backward compatibility;
  operators flip it from Settings → Community. Federation
  unaffected — invite-only is a local node policy; peer nodes
  neither enforce nor verify it. The deploy-runbook
  recommendation to flip the toggle after onboarding yourself
  is in [`docs/deploy-linode.md`](./docs/deploy-linode.md)
  "Before going public."
- **Bottom-nav mobile labels at every viewport (PR #185).** The
  bottom-nav previously collapsed labels to icon-only below `sm`,
  trading legibility for the 44×44 touch floor. Labels now
  render at every viewport in a rem-based small size so members
  can identify each tab without memorizing the iconography.
- **AttentionSection emoji prefixes (PR #200).** Each attention-
  rail item kind gains a leading emoji glyph keyed to the kind,
  rendered `aria-hidden="true"` so the screen-reader name is
  unchanged. Sighted scanning aid only.

### Changed
- **Project detail-page ordering reflow — tasks first, forms
  disclosed.** Four screen-real-estate fixes to
  `ProjectDetail.tsx`: (1) on mobile the rail's secondary meta
  (momentum sparkline, created/area/deadline/contributors grid,
  Working-alongside roster) now renders AFTER the main column so
  a phone visitor reaches the task list without scrolling past
  stats — two render sites (`hidden lg:block` / `lg:hidden`),
  never CSS `order`, so mobile DOM order matches visual order
  (WCAG 2.4.3; same pattern as the Board filter rails from
  PR #199, locked by `ProjectDetail.reflow.test.tsx`). Title,
  chips + kebab, description, message-organizer button, progress
  bar, and the completion/paused banners stay at the top. (2)
  AddTaskForm collapses behind a "+ Add task" disclosure
  (mirror of BulkTaskForm's); expanding focuses the first field,
  a successful add collapses it. (3) The Updates
  (announcements) section moved below the task list + task
  forms, and its compose form folded behind a native "Write an
  update" `<details>` — announcement cards stay visible; the
  completion moment's "say thanks" CTA opens the disclosure
  before focusing the textarea. (4) Pause + Clone (with their
  note/title/re-invite forms) moved into the "Manage project"
  disclosure; the standalone organizer-controls card is gone.
  2 new i18n keys in en + es; parity passes. Desktop (`lg+`)
  layout unchanged.
- **Board screen-real-estate polish (mobile chrome reduction +
  card density).** Seven small ordering/density fixes, all
  preserving the PR #199 mobile DOM-order-equals-visual-order
  invariant (no CSS `order` utilities): (1) below `sm` the
  Board filter rails collapse behind a loud full-width card
  trigger ("Filters", or "Filters · N active" while any filter
  narrows the list — plain text, no badge pill; default
  collapsed, session-only); (2) the tablist now sticks together
  with search at `top-0` on mobile in one backdrop-blur band
  (desktop sticky story unchanged); (3) below `lg` the attention
  rail collapses behind a card-styled summary row previewing the
  waiting item kinds via their emoji prefixes — default EXPANDED
  whenever a tier-0 confirm item (someone's credit blocked on
  you) is present, collapsed otherwise, per `KIND_PRIORITY`;
  (4) `ContextualHint` now renders as `BoardNudges`' fallback so
  hint and nudge can never stack (nudge priority unchanged);
  (5) `PostCard` drops the redundant "needs help"/"offers" meta
  label — the active tab already declares the type; (6) the post
  grid keeps `lg:grid-cols-1` after measurement (the lg shell
  cap leaves a constant ~424px middle column — two ~206px
  columns would be unusable); (7) `ProjectCard` swaps its
  hand-rolled untranslated category chip for the shared
  `CategoryBadge` (emoji + translated label, both locales).
- **Bottom-nav pinned to viewport on mobile + iOS safe-area
  inset (PR #201).** `BottomNav` switched from `sticky bottom-0`
  (which sticks to the bottom of the containing block) to
  `fixed inset-x-0 bottom-0` on `<lg`, with
  `pb-[env(safe-area-inset-bottom)]` so the nav clears the
  iPhone home-indicator zone. Desktop (`lg+`) preserves the
  current `sticky` container-width look. `main`'s bottom padding
  becomes `pb-[calc(5rem+env(safe-area-inset-bottom))]` to
  compensate. Closes the operator-reported "nav detaches on
  long scroll, especially iOS Safari URL-bar resize" bug.
- **Board mobile DOM order matches visual order (PR #199, WCAG
  2.4.3).** The Board mobile layout previously used `order-*`
  utilities to position the filter rails visually after the
  post list while keeping them earlier in DOM order — which
  broke focus order and reading order for screen reader and
  keyboard users. The filter rails are now extracted to their
  own components and placed in DOM-order matching their visual
  position, with no `order-*` utility on the mobile path.
- **Dashboard title wraps at Large / Largest text size (PR #184).**
  The "Community dashboard" `<h1>` previously held
  `whitespace-nowrap` and overflowed at the Largest text-size
  preference on mobile, hiding behind the Sprig flanking
  ornaments. The title now wraps cleanly across two lines at
  the larger sizes without losing the Sprig framing.


  you've issued" moves from inside the Profile InvitesSection card to
  a dedicated `/invites` route reachable via a "Manage all →" link
  from a compact summary line ("3 open · 2 redeemed · 1 expired").
  Profile keeps the Generate flow + share banner + InviteShareSheet
  modal — the primary "issue a link" interaction stays one tap deep —
  but the unbounded list no longer blows out the Profile card's
  height (a real problem for community organizers who'd issued many
  invites). The dedicated page sorts open invites first (then
  redeemed / revoked / expired; within each tier newest first) so
  the most actionable rows are always at the top, and each open row
  gains a **Show QR** button that re-opens the existing
  InviteShareSheet so the QR code stays reachable after the
  fresh-share banner has scrolled away. i18n keys added in en + es:
  pluralized `profile.invites.summary.{open,redeemed,revoked,expired}`
  + `summary.manageAll`, plus a new `invitesPage.*` block. Parity
  test green; 677/677 tests pass.
- **Settings sub-page.** Five device-local sections — Language,
  Appearance (Theme / Text size / Layout density), Community Node,
  Security, Data export — move from the Profile page to a new
  `/settings` route reachable from a gear icon in the Profile header.
  Splits the kitchen-sink Profile into two focused surfaces:
  Profile = "who you are + what you've done" (identity, balance,
  invites, roles earned, exchange history, learn, disputes,
  proposals, community settings), Settings = "how the app behaves
  on this device." `EmergencySection` is deliberately NOT moved —
  per the privacy-as-precondition principle, panic buttons need to
  stay reachable in a stress moment, not buried behind a Settings
  tap. `InvitesSection` is also kept on Profile because invites are
  a record of community participation (who you vouched for), not a
  device preference. Inline `SecuritySection` (~204 lines) and the
  `exportData` helper extract to dedicated files
  (`components/SecuritySection.tsx`, `lib/exportData.ts`). New
  `IconSettings` joins the existing line-art icon set
  (`components/visual/icons.tsx`) — gear shape matching the 1.5px
  stroke / fill-none style of the others. Profile's column clusters
  re-pencil to two: community-participation (Invites + Roles +
  History) and community-governance (Learn + Disputes + Proposals +
  Community Settings), each `lg:columns-2` (no `xl:columns-3` —
  3-and-4 cards balance well in 2 columns). i18n keys added in en +
  es: `settings.openSettings`, `settings.title`, `settings.intro`,
  `settings.back`. Parity test green.

- **Welcome slide for community projects.** Adds a fifth slide
  between Community-authority and the Profile-setup step,
  introducing collective work as a principle rather than a feature.
  Title: "Some help takes more than one person." Body 1 names the
  shape (community fridge, tool library, tenant defense network —
  shared goals with task lists, starter templates available or
  begin from scratch). Body 2 names the routing intent ("if a
  template you'd pick is already running in your community, we'll
  surface it before you start a new one" — solidarity over
  duplication). One slide deliberately; the density preference,
  sticky search, and layout reflows added this cycle are UX polish
  members discover naturally and don't warrant their own slides.
  Spanish translation written in parallel; parity test green. Icon
  is 🌳 — the tree, next stage in the seedling / herb / sprig
  metaphor used elsewhere in the design language; projects are the
  collective form of that growth.
- **Layout density preference (Compact).** New opt-in radio under
  Profile → Appearance, mirroring the text-size and theme patterns:
  default ships the comfortable card padding (1rem); compact trims
  it to 0.75rem so denser screens — especially the lg+ reflowed
  multi-column lists — fit more above the fold. Dexie is the source
  of truth (`SETTING_KEYS.density`); localStorage is the no-FOUC
  cache; the inline script in `index.html` applies the class
  synchronously before first paint. No `prefers-reduced-data`
  auto-resolution — bandwidth and visual density mean different
  things. Touch-target floors are unchanged at every setting; only
  chrome compresses. Implementation in `lib/density.ts` follows the
  `textSize.ts` apply / cache / preference-guard shape so a future
  contributor adding a fourth preference has a template. Unit tests
  cover the type guard, the class-toggle, and idempotence.
- **"Already in your community" routing on Start-a-project.** When
  a member opens the project-template picker and an existing
  Planning- or Active-status project was already seeded from the
  same template, a small canopy-palette ribbon sits on top of that
  template's card and a "See them" button appears in the
  selected-template banner — both link to the most recent matching
  project. Solidarity routing toward existing community efforts,
  never duplicate-prevention; nothing blocks creating a new project.
  Strict canopy palette (no amber / red / warning icons),
  presence-coded copy ("already in your community"), and i18next
  pluralization on both surfaces. New `templateId: string | null`
  field on Project (Dexie v17 with `null` backfill, no new index —
  lookups are in-memory against the loaded `projects` list).
  Stable template IDs in `apps/web/src/content/projectTemplates.ts`
  (e.g. `"community-fridge"`) make the linkage exact rather than
  fuzzy-matching by title. Helper in `lib/templateUsage.ts`
  excludes paused / completed / archived / cancelled — only
  ongoing efforts count as "already in your community" — and
  guards both sides of the null-templateId case so an untemplated
  project never false-matches.
- **Messages split-pane at lg+.** Messages becomes a routing shell
  with nested children: `/messages` renders an "Pick a conversation"
  placeholder in the right pane; `/messages/:memberKey` renders the
  conversation in the same outlet. Below lg the shell collapses to
  single-pane based on URL — list when no key, conversation when a
  key is present — so mobile behavior matches pre-3.1. Selected
  list item gets `aria-current="page"` and a canopy `ring-2`.
  Message-input auto-focus on `memberKey` change is gated behind a
  `matchMedia("(min-width: 1024px)")` check so the soft keyboard
  doesn't pop on mobile when entering a conversation. No unread
  badges, no presence dots, no typing indicators, no read receipts
  — the surveillance affordances "modern chat" apps accrete around
  split-pane layouts are deliberately absent.

### Changed
- **Board defaults to the Projects tab.** Members landing on the
  Board now see the Projects list first instead of Needs.
  Rationale: a member arriving with a need is well-served by
  scanning existing community projects before posting a one-off
  Need — a project may already address what they're asking for.
  Single source of truth in `lib/boardTab.ts` (`parseTabParam`
  default flips from `"NEED"` to `"PROJECTS"`); existing
  bookmarks at `/?tab=needs` continue to route correctly via the
  same parser.
- **Screen real estate optimized across three phases.** A
  multi-PR layout pass — strict reflow of existing content, no
  new persistent widgets, no leaderboards / badges / activity
  panels — covering the wasted horizontal space on tablets and
  desktops. Phase 1 lifts the global container cap from 768px
  to a tiered cap (lg 1024 / xl 1280 / 2xl 1440) and reflows the
  Board / Messages / Dashboard / Profile lists into responsive
  grids. Phase 2 introduces sticky side rails at lg+ — filter
  rail and AttentionSection rail on the Board, meta sidebar on
  ProjectDetail, content-cap on PostDetail, and form asides on
  PostForm / ProjectNew. Phase 3 ships the Messages split-pane
  (above), a sticky filter bar on Proposals, and the density
  preference. Implemented throughout with CSS grid placement
  (no DOM duplication), so source order equals mobile reading
  order at every breakpoint and tab / screen-reader navigation
  is unaffected by the visual rail positioning.
- **Sticky search input on Board and Messages.** Search now pins
  to `top-0` (mobile) / `top-4` (lg+, matching the existing rail
  offset) with a backdrop-blur strip so members can search from
  anywhere in a long scroll instead of returning to the page top.
  Treatment matches the Proposals sticky filter bar (95%-opaque
  background, `backdrop-blur`); FAB stays at `z-20` above the
  sticky search.
- **Start-a-project page: templates on the left rail, single
  column inside.** Two adjustments to the Phase 2.4 layout. (a)
  Swap the columns so templates sit on the left and the form on
  the right — matches the "pick a starting point, then act on
  the form" reading flow and mirrors the left-rail pattern
  already used on the Board. (b) New `layout` prop on
  `TemplatePicker` — `"default"` keeps the gallery's responsive
  grid (1 / 2 / 3 columns by breakpoint); `"rail"` forces single
  column always for when the picker is docked in a narrow side
  rail. Rail width widens from 320px → 380px so each card has
  ~348px of usable width.

### Fixed
- **Empty band between Board tablist and search at lg+.** The
  filter rail and AttentionSection at `lg:row-start-1` were
  taller than the tablist, so row 1's auto-height stretched to
  the tallest item and the tablist sat at the top of a tall,
  empty cell. Both side rails now span all three middle-column
  rows via `lg:row-span-3`, so row 1 sizes to the tablist alone,
  row 2 to the search, row 3 to the list. Sticky positioning is
  unchanged. Project-archive link moves from row 2 col 1 (now
  spanned by the filter rail) to row 4 col 1 (an implicit row
  past the list) so it still appears after the list both
  visually and in DOM order. Reasoning baked into a code
  comment so a future contributor doesn't re-flatten the spans.

### Fixed
- **Start-a-project page no longer blanks on render.** `CategoryBadge`
  was typed for `Category` and looked up `CATEGORY_META[category]`,
  but `TemplatePicker` passed `template.defaultCategory` via an
  `as Category` cast — fine until Set 2 templates introduced
  `infrastructure`, `organizing`, and `mutual_aid_drive`, none of
  which had a `CATEGORY_META` entry, so `meta.emoji` threw and the
  whole template gallery crashed. Added `PROJECT_CATEGORY_META`
  covering all 12 `ProjectCategory` values (the three extension
  categories use the same emoji as the existing inline dropdown
  options in `ProjectNew.tsx` / `Board.tsx`), broadened
  `CategoryBadge` to accept `ProjectCategory`, dropped the unsafe
  cast in `TemplatePicker`, and added matching `categories.*` i18n
  keys in en + es. The `categoryLabel` helper in `TemplatePicker`
  collapses from a five-case switch back to a single `t()` call now
  that every project category has a translation.

### Added
- **10 more community-project templates ("Set 5").** Toy Library &
  Play Resource Lending, Food Preservation & Canning Collective,
  Free Haircut & Personal Grooming Days, Mutual Aid Moving Crew,
  Disability & Accessibility Support Network, Books to Prisoners &
  Letter-Writing Program, Community Music & Instrument Program,
  School Supply & Backpack Program, Legal Aid Clinic & Know Your
  Rights Program, and Mutual Aid Resource Hub & Dispatch. Added to
  both `PROJECT_TEMPLATES_EN` and `PROJECT_TEMPLATES_ES`. Two carry
  safety disclaimers (food-safety / botulism risk on Food
  Preservation; licensed-attorney scope on Legal Aid Clinic) woven
  into `whatYoullNeed`. Categories used: `childcare`, `food`,
  `other`, `transport`, `organizing`, `education`,
  `mutual_aid_drive`. Cadences applied per the Set 2–4 convention:
  `session` for "per session," `event` for "per event" / "per move"
  / "per distribution" (no enum expansion; "per move" wording shifts
  to the localized event suffix).
- **10 more community-project templates ("Set 4").** Free Community
  WiFi / Mesh Network, Mental Health Peer Support Circle, Community
  Cleanup & Green Space Restoration, Free Tax Prep & Financial
  Empowerment Clinic, Community Market / Free Farm Stand, Welcome
  Wagon (New Neighbor & New Parent Support), Library of Things,
  Laundry & Shower Access Program, Voter Registration & Civic
  Engagement Drive, and Community Health Navigation Program. Added
  to both `PROJECT_TEMPLATES_EN` and `PROJECT_TEMPLATES_ES`. Four
  carry disclaimers (peer-support vs. clinical care, certified tax
  preparers, nonpartisan election laws, health navigators vs.
  clinicians) woven into `whatYoullNeed`. Categories used:
  `infrastructure`, `emotional_support`, `food`, `organizing`,
  `other`. Cadences applied per the Set 2/3 convention: `session`
  for "per session," `event` for "per event" / "per market"
  (closest existing cadence to "per market"; no enum expansion).
- **10 more community-project templates ("Set 3").** Community Meal /
  People's Kitchen, Seed Library & Seed Swap, Digital Literacy & Device
  Lending Program, Weatherization & Home Repair Brigade, Pet Food Bank
  & Pet Care Support, Youth Mentorship & After-School Program, Gleaning
  Network, Community Mediation & Conflict Resolution Network, Reentry
  Support Network, and Community Wood Bank / Heating Assistance. Added
  to both `PROJECT_TEMPLATES_EN` and `PROJECT_TEMPLATES_ES` with
  parallel content. Five carry safety disclaimers (skilled-trade
  limits, youth-program responsibilities, mediation scope limits,
  reentry privacy, chainsaw/splitter operation) woven into
  `whatYoullNeed`. Categories used: `food`, `education`,
  `skilled_labor`, `mutual_aid_drive`, `other`, `infrastructure`.
  Recurring cadences applied per the established Set 2 convention
  (closest existing cadence; no enum expansion): `session` for "per
  meal" / "per session", `event` for "per distribution" / "per
  project" / "per gleaning", `cycle` for "per season".
- **10 new community-project templates ("Set 2").** Tenant Union &
  Eviction Defense Network, Childcare / Babysitting Collective,
  Community Composting Program, Free Little Library & Book Exchange,
  Community First Aid & Overdose Response Training, Time Bank,
  Solidarity Fund, Diaper & Hygiene Supply Bank, Community Bike
  Workshop, and Newcomer & Translation Support Network. Each is added
  to both `PROJECT_TEMPLATES_EN` and `PROJECT_TEMPLATES_ES` with
  parallel content. Several templates carry safety disclaimers
  (legal-advice, medical-training, money-handling, child-supervision,
  immigration-status) woven into `whatYoullNeed` so they're visible
  on the template card. Categories used: `organizing`, `childcare`,
  `infrastructure`, `education`, `mutual_aid_drive`, `transport`,
  `other` — the template-gallery's category dropdown (PR #112) picks
  these up automatically. Recurring task cadences used: `cycle`
  (composting distribution), `session` (first-aid training), `event`
  (diaper distribution — closest schema fit to "per distribution";
  no enum expansion).
- **Template gallery filters on the Start-a-project page.** Three new
  controls inside `TemplatePicker`: a search input (debounced, matches
  name + purpose + audience + needs), a category dropdown
  (auto-populated from the loaded templates), and a setup-time dropdown
  (Quick ≤10h / Medium 10–25h / Bigger 25h+). All three compose via
  AND. Session-only state, defaults off. The "Start from scratch" card
  always renders as the escape hatch. New `lib/templateFilter.ts` with
  `getSetupBucket` and `matchesTemplate` helpers plus unit tests. 10
  new i18n keys in en + es.
- **Three new filters on the Community Board's Projects tab:** a
  category dropdown, a status dropdown (Planning / Active / Paused /
  Completed), and an "Only with open tasks" toggle pill. All three
  compose with each other AND with the existing project search (from
  PR #107) via AND — a project must satisfy every active filter to
  render. State is session-only (matching the rest of the Board —
  only the active tab lives in the URL); defaults are every filter
  off and both dropdowns set to "All …". Archived projects are
  intentionally NOT exposed in the status dropdown: they remain
  reachable only via the existing "View archive" link below the
  project list, so the Projects tab stays an action-oriented surface
  for what's still in flight. Empty result with active filters shows
  "Nothing matches your filters." (separate from the existing
  "Nothing matches your search." empty state when only the search
  query narrows the list to zero). Reuses `matchesQuery` from
  `lib/messageSearch.ts`, the existing post-filter dropdown styling,
  and the claimed-toggle chip pattern. New helper
  `lib/projectFilter.ts` (`hasOpenTasks`) with 6 unit tests; 10 new
  i18n keys in en + es (parity test passes).
- **Threat-model §7 entry: "In-app URLs reveal client-side
  navigation to corporate MITM proxies, browser history, and
  address-bar onlookers."** Documents what's actually visible
  to each observer class in the URL surface — ISPs see only
  the hostname (HTTPS encrypts paths), corporate MITM proxies
  see the full URL, node operators receive the initial page-
  load path, device-access attackers read browser history,
  shoulder-surfers / cameras / screen-shares read the address
  bar. Captures the design decisions we deliberately did NOT
  make: no path-text obscurity (doesn't defend against any
  real observer, costs shareability), no removal of URL state
  (Signal-handoff URLs are real organizing utility). Hash-
  based routing for member-identifying routes (e.g.
  `/messages/<key>`, `/member/<key>`) is recorded as a
  candidate future change, not blocked, not committed —
  flagging the trade-off so a future PR author finds the prior
  reasoning. Names the actual defense: the opsec-guide
  "Trust the device, or don't open the app" criterion.

### Fixed
- **"Back to projects" now actually returns to the Projects tab.**
  Pilot-reported: tapping the "Back to projects" button on a project
  detail page took the user to the Board's default Needs tab, not the
  Projects tab they came from. The Board now encodes its active tab
  in the URL as `?tab=needs|offers|projects`, and the back-to-
  projects buttons on project detail / new / archive pages navigate
  to `/?tab=projects` so the destination matches the button's text.
  Free side benefits: browser back/forward works naturally across
  tab switches, and Board URLs are shareable (e.g.
  `/?tab=projects` deep-links to the Projects tab).

### Added
- **Per-project task search + four-pill status filter.** Each
  project's detail page now renders a debounced search input and
  a four-pill status filter row (`All` / `Open` / `In progress`
  / `Done`) directly under the "Tasks" heading. The search and
  the filter compose via AND — typing "fridge" with the `Open`
  pill selected shows only unclaimed tasks whose title or
  description contains "fridge." The matched substring is
  highlighted in each task's title with the project's existing
  amber `<mark>` style so a member can see at a glance why a row
  matched.
  - **Four design decisions, deliberately scoped down for v1.**
    (1) The controls are always visible when the project has at
    least one task — no conditional rendering based on task
    count, because hiding a search input "until you have N
    tasks" makes the page feel like it shifts under you. (2) The
    default filter on every page load is `All`, with no
    personalization by role; an organizer and a member both see
    the same starting view. (3) State is session-only — opening
    the page always starts with an empty query and the `All`
    pill selected, with no URL parameters, no `localStorage`,
    and no Dexie persistence. (4) The `In progress` pill bundles
    `claimed` + `awaiting_confirmation` together because they're
    both "somebody's working on it"; `blocked` stays accessible
    via `All` and via search, since pilots have a handful of
    blocked tasks at most.
  - **Reuses two existing, already-tested primitives.**
    `matchesQuery` from `apps/web/src/lib/messageSearch.ts`
    (14 unit tests, case-insensitive, trimmed, empty-query
    short-circuit) does the matching against
    `task.title + " " + task.description`; `HighlightedText`
    from `apps/web/src/components/HighlightedText.tsx` does the
    `<mark>` wrapping. The new `matchesFilter` helper lives in
    `apps/web/src/lib/taskFilter.ts` with its own four-branch
    unit test, so the page component stays declarative.
  - **Three filter-specific empty states + one search empty
    state.** When the query matches nothing, the page shows
    "Nothing matches your search." When a non-`All` pill matches
    nothing (and the query is empty), the page shows one of
    "No open tasks right now." / "No tasks in progress." /
    "No tasks done yet." The existing "this project has no
    tasks at all" empty state is untouched — that branch keeps
    its full illustration card. Ten new i18n keys in en + es;
    the parity test still passes.

- **Search bar on the Community Board.** A new debounced search
  input now sits above the Board's existing filter row. Typing
  narrows the currently-visible tab's list (Needs, Offers, or
  Projects) by a case-insensitive substring match against post
  title + description (or project title + description). The
  search composes with the existing filters (category, zone,
  urgency, claimed toggle) via AND, and the matched substring in
  each card's title is highlighted with the project's amber
  `<mark>` style so a member can see at a glance why each result
  matched.
  - **Four design decisions, deliberately scoped down for v1.**
    (1) Search is scoped to the current tab — switching tabs
    clears the input, because a query that's meaningful in Needs
    usually isn't meaningful in Projects. (2) The claimed toggle
    is respected as-is — search filters within whatever the
    toggle currently shows, and the "Show N claimed" pill is one
    tap away. (3) No URL persistence; the query lives in pure
    session-local state, the same as every other Board filter.
    (4) Project search reads project title + description only —
    not task names or descriptions, because a task-level hit
    would need card-level "matched on task X" affordance that
    adds confusion.
  - **Reuses two existing, already-tested primitives.**
    `matchesQuery` from `apps/web/src/lib/messageSearch.ts`
    (14 unit tests, case-insensitive, trimmed, empty-query
    short-circuit) does the matching; `HighlightedText` from
    `apps/web/src/components/HighlightedText.tsx` does the
    `<mark>` wrapping with the existing amber-on-amber styling.
    No new matching logic, no new highlight component, no new
    color tokens.
  - **Three i18n keys added in en + es** under `board.search.*`:
    `placeholderPosts`, `placeholderProjects`, `noMatches`. The
    parity test still passes. Spanish members see Spanish
    placeholders and Spanish "Nothing matches your search."
    copy. Empty result with an active query shows the new
    `noMatches` copy; empty result with no query keeps the
    existing "Nothing growing here yet" / "Aún no crece nada
    aquí" empty state so the calm onboarding signal is
    preserved.
- **Project-templates gallery on the Start-a-project flow.** A
  member who taps "Start a project" now sees a 10-card gallery at
  the top of the create page — community fridge, community garden,
  tool & equipment lending library, neighborhood care network,
  emergency & disaster preparedness, free store / goods swap, skill
  share & free classes, bulk-buying food co-op, repair café, and
  rides & transportation. Each card shows the template name, a
  one-line purpose, the rough setup-hours estimate, the task count,
  and the default category. Picking a card pre-fills the project
  form (title, multi-paragraph description, category, target hours)
  and stages all of the template's tasks so they're created with
  the project on submit. Picking "Start from scratch" leaves the
  form blank for fully custom projects.
  - **Content lives in `apps/web/src/content/projectTemplates.ts`**
    as a content-driven file, the same shape as `member-guide.ts`
    and `opsec-guide.ts`. Single source of truth — no DB rows, no
    server fetch, no federation surface. Edits are PRs against this
    file.
  - **Full Spanish parity from day one.** Every template name,
    purpose, who-it-serves, what-you'll-need, task name, and task
    description has a Spanish equivalent in the same content file,
    selected via `getProjectTemplates(locale)`. Members on `es*`
    see Spanish content end-to-end; unknown locales fall back to
    English. Parity test passes.
  - **Recurring tasks (e.g. monthly volunteer debrief, per-cycle
    bulk-order sort) are modeled as one-off tasks with a localized
    cadence sentence appended to the description** (" Recurs
    monthly." / " Se repite mensualmente." etc.). No new schema
    field on `ProjectTask` — the cadence is a content concern, not
    a lifecycle one, and keeping the type flat protects federation
    and the rest of the project surface from churn for what is
    really a content feature.
  - **Picker placement is above the existing form**, not a
    separate route. The form is still the same form — the picker
    is an optional accelerator. A "Starting from the X template —
    edit anything below" banner with a "Clear template" affordance
    appears once a card is picked.
  - **17 new i18n keys** under `projects.templates.*` in en + es
    (title, intro, scratch/scratchHint, selected, clear,
    meta.tasks_one/tasks_other/setupHours, four
    recurringSuffix.*). Parity test passes.
  - **Tone**: templates are framed as *friendly starting points,
    not prescriptions* — copy in the intro says "you can edit
    anything before creating" and explicitly invites the
    start-from-scratch path. No counts of "how many communities
    have used this template," no popularity ranking, no
    leaderboard.
  - **Ethos check**: no streaks, no leaderboards, no color-as-rank.
    The selected card uses the existing canopy ring pattern, same
    as every other focus / selection treatment in the app.
  - **Out of scope for this PR** (deferred follow-ups):
    per-community customization of the gallery, federation /
    sharing of templates between nodes, "save this project as a
    template" affordance from a finished project. The current
    surface is content-driven and ships with the app build; those
    deferred items would need DB rows and policy choices we're
    not making yet.
  - **No threat-model entry needed** — no new exposure surface
    (everything is local content already shipping in the bundle).

  Tests: 583 passing (552 prior + 31 new). Lint, typecheck, build
  clean.

- **"Draft mode" banner + organizer-side task hint on planning
  projects.** Follow-up to PR #103. The previous fix correctly
  hid the Claim button on non-active projects with an
  explanatory chip for *non-organizers*, but the organizer
  themselves still got no on-page guidance about why their
  members couldn't claim tasks yet — they'd see the small
  "Launch project" button in `OrganizerControls` (with an
  even smaller hint underneath) but nothing at the point of
  expected interaction. Two clarifying additions:
  - **Persistent canopy-tinted banner at the top of every
    Planning-status project** (visible to everyone, naturally
    disappears on launch). "Draft mode. This project is being
    put together…" with role-specific body copy — organizers
    see *"Members can see it but can't claim tasks yet. Launch
    it when you're ready to invite hands."* with an inline
    Launch button; non-organizers see *"Tasks become claimable
    once the organizer launches it."* No new launch path —
    same `launchProject()` call as the existing
    `OrganizerControls` button.
  - **Inline hint on each open task row for the organizer**
    of a Planning project: *"Members will be able to claim
    this once you launch the project."* — mirrors the
    non-organizer chip shipped in PR #103. Now the connection
    is made at the point of action whether or not the
    organizer noticed the banner.
  - **4 new i18n keys** (`projects.detail.planningBanner.title`,
    `bodyOrganizer`, `bodyMember`, `projects.task.claimableAfterLaunch`)
    in en + es. Parity passes.
  - **Tone**: canopy-tinted, not amber / rose. Planning isn't
    an error state, it's a normal stage. Solidarity-not-shame
    holds.
  - **No threat-model entry needed** — no new exposure surface
    (project state was already on the page, just less
    legibly).

  Tests: 552 passing (unchanged — pure UI clarity work). Lint,
  typecheck, build clean.

### Fixed
- **Claim button on planning / paused projects.** Pilot-reported:
  members viewing a project in planning status saw a Claim button
  on each open task, but clicking it failed with the unhelpful
  generic error "Project isn't accepting claims right now." The
  button checked task-level state (`status === "open"`) and
  organizer-membership but NOT the project's lifecycle status —
  so a non-organizer member tapping Claim on a planning project's
  task got the back-end rejection as a wall instead of an
  explanation. Now: the Claim button is gated on
  `project.status === "active"` too, and when the project isn't
  accepting claims, an inline explanatory chip takes its place
  — different copy for planning ("This project is still planning
  — the organizer hasn't launched it yet"), paused ("This project
  is paused — no new claims right now"), and other ("This project
  isn't accepting claims right now"). The back-end check stays
  as a safety net; the UI just stops setting members up to hit
  it. Organizers see the same launch button they already had in
  `OrganizerControls`. 3 new i18n keys in en + es; parity passes.

### Changed
- **Invite share gate: "Send the link without showing it" is now
  the visually-primary path.** The camera-gate work (PRs #92–93)
  shipped with "Show the invite" as the primary call-to-action
  and the safer share-without-showing path as the secondary peer
  option. Review of the threat model surfaced a second, related
  threat: device-level compromise — malware, browser extensions,
  stalkerware, employer monitoring software — can read whatever
  the app renders, including the QR code and URL. Web apps have
  no API to block screenshots or screen recording from the
  browser (no PWA equivalent of Android `FLAG_SECURE` or iOS
  `isSecureCoded`), so the only honest defense is to keep the
  payload off the framebuffer entirely. The share-without-
  showing path does exactly that; it should therefore be the
  default.
  - **Visual hierarchy reversal**: Send-without-showing is
    `btn-primary` on top; Show-the-invite is `btn-secondary` in
    the middle; Cancel stays as the ghost button on the bottom.
    When `canShareUrl()` is false (legacy browser, no
    clipboard), the disabled state on Send-without-showing stays
    in the primary visual slot with its explanation, and
    Show-the-invite gets the primary class so the "do something"
    affordance is still clear. The visual *order* never changes
    so the teaching ("the safer path is listed first") is
    consistent.
  - **Autofocus tracks the safest available action**:
    Send-without-showing when available, Cancel when not. A
    stray Enter ships the link safely or closes the sheet —
    never reveals.

### Added
- **Avatar artwork polish.** Refined SVG drawing primitives for the
  `MemberAvatar` component — hand-tuned leaf paths (round leaf with
  apex point, elongated willow-style, lobed maple-style scalloped),
  per-leaf linear gradients (lighter at the base, primary fill at the
  tip), tapered `Sapling` stem with a small sprout at the base,
  rule-of-thirds composition shift for each shape variant, subtle
  darker stroke on every filled shape for definition, refined
  `SprigOverlay` as small leaf-buds instead of circles. The
  derivation algorithm in `lib/avatar.ts` is unchanged — every
  existing member's avatar still maps to the same spec, just rendered
  with prettier shapes. No new tests, no new i18n keys, no
  behavioral changes. Lands on top of the layout-prominence work
  (PR #101 — framed treatment + larger sizes + Profile hero).
- **Threat-model §7 entry: "Device-level compromise is out of
  scope."** New bullet making the boundary explicit. Names the
  threat (malware, browser extensions, stalkerware, employer
  monitoring, screen-recording suites), states plainly that web
  apps have no API to defend against an attacker with code
  execution on the same device, names the alternatives that
  *don't* work (DRM hacks only block video DRM; flickering
  defeats accessibility and is trivially bypassed; CSP protects
  against page-injected scripts but not the user's own OS), and
  records why we don't ship "screenshot protection" framing —
  the same "false confidence is worse than honest boundary"
  principle that informed the camera-presence-detection
  rejection. Tells the member what to do: clean device, clean
  OS, no unfamiliar extensions; if compromise is suspected,
  panic-purge and rotate identity. Any future proposal that
  would imply otherwise (a "secure share mode," watermark
  overlay, animated QR, etc.) needs to address the false-
  confidence problem named in the entry.
- **`opsec-guide.md` "On your device" — new bullet: "Trust the
  device, or don't open the app."** Concrete checklist
  (physical custody since last reset, OS you installed, no
  unfamiliar extensions, no remote-management software you
  didn't install). Explicit acknowledgment that PWAs have no
  equivalent of `FLAG_SECURE` / `isSecureCoded` so members
  understand the boundary. Practical fallback: panic purge if
  compromise is suspected.
- **Threat-model camera-surveillance entry updated** to note
  the share-without-showing path is now the visually-primary
  default and the autofocus tracks the safest-available
  button, so future readers understand the current behavior
  matches the threat hierarchy.

### Added
- **Deterministic member avatars derived from public keys.** Each
  member now has a parametric botanical illustration as their
  visual identity, drawn deterministically from their Ed25519
  public key. Same key produces the same plant on every device,
  every time, forever. The avatar IS the public key in pictorial
  form — it carries no information the public key didn't already
  carry, so there is no new exposure surface.
  - **`lib/avatar.ts`** — pure derivation. Decodes the public
    key base64, takes the first 8 bytes (Ed25519 keys are
    cryptographically random by construction; no hashing
    needed), maps each byte via modulo into small enums:
    shape (sapling / leaf-cluster / sprig / branch) × leaf
    count (3–7) × branch angle × primary fill × accent fill ×
    sprig decoration × leaf shape (round / elongated /
    scalloped) × rotation. Frozen enum orderings —
    changing them after ship breaks recognition.
  - **`components/MemberAvatar.tsx`** — inline-SVG renderer.
    Four shape sub-components compose primitive `Leaf` shapes.
    Palette stays strictly within canopy / moss / bark (no
    ember — would imply status). Always-visible (not marked
    decorative): the avatar is information, not decoration.
    `aria-label` is the short-key fingerprint so screen-reader
    users get the same identification handle sighted users
    get from the existing `shortKey()` chrome.
  - **11 new tests** in `avatar.test.ts` — determinism,
    fallback behavior on empty / malformed / too-short input,
    distinctness across random keys, byte-position
    assignments, all-zeros edge case, avalanche on a one-bit
    flip.
  - **Six surface wirings**: PostCard, TrustedByList,
    MemberDetail header (96px), Messages list, Messages
    search results, Conversation header, Profile "About you"
    (with explanatory note). **Not** per-message-bubble —
    would clutter the thread.
  - **i18n**: 2 new keys (`avatar.label`, `profile.about.avatarNote`)
    in en + es. Parity passes.
  - **Design README**: new "Member avatars (frozen algorithm)"
    section documenting the derivation, the freeze commitment,
    and the not-decorative / always-visible rule.
  - **Ethos**: not a "profile photo" (no real-face identity),
    not customizable (would become a status game), not
    federated as member data (derived locally from the public
    key, which already federates), doesn't appear next to
    numeric counts (would imply ranking), doesn't replace
    `shortKey()` (both ride together — avatar for fast
    recognition, short-key for verifiable identity).

  Tests: 552 passing (541 → 552; +11 in `avatar.test.ts`).
  Lint, typecheck, build clean. PWA precache 957 → 999 KiB.


- **Camera-surveillance awareness gate on the invite share
  sheet.** Modern security cameras (workplace CCTV, doorbell
  cams, laptop webcams) can read QR codes from across a room
  using off-the-shelf vision models — QR is *designed* for
  machine-readability. For the populations this app is built
  for (organizers under employer camera surveillance, tenants
  on cameras a landlord controls) this is routine, not edge-
  case. The share sheet (PR #91) now opens with the QR + URL
  hidden behind a plain-language prompt that names the threat
  and offers two paths forward.
  - **Two-state sheet**: gate (pre-reveal) → revealed.
  - **Gate copy** is concrete and calm, not alarmist:
    "Look around before you show this. Security cameras and
    webcams can read QR codes from across a room. Once it's on
    screen, anyone in camera view can save it and use it to
    join your community themselves."
  - **Three options on the gate**: "Show the invite" (primary),
    "Send the link without showing it" (uses `navigator.share`
    directly — URL never appears on screen, only routed through
    the OS share sheet / clipboard), and "Not now" (close).
  - **Re-prompts every time** the sheet opens (no persistent
    dismissal). A member's surroundings can change between two
    shares on the same device — the deliberate pause is per-
    share, not per-device.
  - **Autofocus on Cancel**, not on Reveal, so a stray Enter
    keypress doesn't expose the invite. Keyboard members pay
    one Tab to proceed; the safe default is the unsafe path
    requiring active intent.
  - **`useFocusTrap`** keeps Tab cycling inside the card,
    matching the rest of the app's modal pattern.
  - **No camera detection**: the app can't see the room and
    pretending to would be false confidence. The threat-model
    §7 entry records this as a deliberate non-feature.
  - **i18n**: 6 new keys under
    `profile.invites.shareSheet.cameraGate.*` in en + es;
    parity test passes.
  - **Threat model**: new §7 entry — "QR codes are camera-
    surveillance targets" — documenting the threat, the
    awareness-gate mitigation, the no-camera-detection
    decision, and the URL-also-OCR-readable note. Future
    "let's simplify the share flow" PRs will have prior
    context to argue against.

- **Invite share sheet with QR code + Web Share API.** When a
  member generates an invite link on Profile → Invites, a share
  sheet opens immediately with three affordances: a scannable
  QR code (for handing off in person), the URL as selectable
  text (with Copy), and a "Open share menu" button that uses
  `navigator.share()` to invoke the native OS share sheet
  (iOS / Android) with a clipboard fallback on desktop.
  - **`lib/share.ts`** — wrapper around `navigator.share` that
    returns a tagged `ShareResult` (`"shared"` | `"cancelled"`
    | `"copied"` | `"failed"`). User-dismissed sheets return
    `"cancelled"` silently; other rejections fall through to
    clipboard so the link doesn't get lost.
  - **`components/InviteQRCode.tsx`** — lazy-loads the `qrcode`
    package via dynamic `import()` so its ~24 KB chunk is only
    fetched when a member opens the share sheet. Always
    renders black-on-white regardless of dark-mode preference;
    cheap QR scanners expect maximum contrast and a white
    quiet zone.
  - **`components/InviteShareSheet.tsx`** — modal sheet mirroring
    the `ConfirmDialog` pattern (backdrop click + Escape to
    close, autofocus on Done so a stray Enter doesn't trigger
    Share by accident). The sheet auto-opens immediately after
    invite issuance — that's when a member is most likely to
    want to hand the link off in person. A "Show QR code"
    button on the existing share box re-opens the sheet.
  - **i18n**: 13 new keys under `profile.invites.shareSheet.*`
    + `profile.invites.showShareSheet` in en + es. Parity test
    passes.
  - **Threat model**: no new exposure surface — QR encodes the
    same URL already displayed as text. Web Share API runs
    in-OS; no third-party preview generator, no analytics,
    no telemetry.
  - **Tests**: 6 new in `share.test.ts` covering the four
    `ShareResult` branches + the missing-clipboard case +
    that AbortError doesn't fall through to clipboard.

  PWA main precache stays unchanged; `qrcode` is a separate
  ~24 KB chunk loaded on demand. No Dexie bump.

- **Text-size preference in Profile → Appearance.** Three-step
  comfort setting (Default / Larger / Largest) that scales every
  rem-based size in the app — typography, stack-* spacing, button
  padding — proportionally. Aimed at older members and anyone for
  whom WCAG-AA-conformant text is technically legible but not
  comfortable, but framed as a comfort option for everyone (no
  "accessibility mode" segregation per
  `docs/accessibility.md` §4).
  - **Mechanism**: `html.text-larger { font-size: 112.5%; }` and
    `html.text-largest { font-size: 125%; }` in `index.css`. The
    percentage **multiplies** on top of the user's OS / browser
    default font-size, so a member who already set Dynamic Type
    to large gets a stacked effect — the in-app preference is
    additive, not a replacement.
  - **`lib/textSize.ts`**: pure helpers `isTextSize`,
    `applyTextSize` (toggles the right class on `<html>`, removes
    any previously-applied class), `cacheTextSize`
    (localStorage cache for the no-FOUC inline script).
  - **`AppContext`** loads the preference from Dexie on boot,
    exposes `textSize` + `setTextSize`. Same pattern as theme.
  - **No-FOUC**: extends the existing inline `<script>` in
    `index.html` to also apply the text-size class before first
    paint. No layout shift on reload.
  - **`AppearanceSection`** reworked into a single card with two
    sub-groups (Theme + Text size) separated by a thin divider.
    Each text-size label renders at the size it represents
    (`text-base` / `text-lg` / `text-xl`) so the choice is
    self-demonstrating.
  - **Touch-target floor bump**: under `html.text-largest`, the
    `.touch-target` utility floor goes from 44×44 to 52×52 so
    taps stay comfortable relative to the larger type. WCAG AAA
    SC 2.5.5 territory.
  - **Audit pass**: grepped for hardcoded `text-[Npx]` and
    `fontSize: "Npx"` values that wouldn't scale. Two hits —
    `TrustChip` compact (`text-[10px]`) and `AchievementBadge`
    rarity label (`text-[11px]`) — both converted to rem
    (`text-[0.625rem]` / `text-[0.6875rem]`) so they scale with
    the preference.
  - **i18n**: 5 new keys under `profile.appearance.*`
    (`textSizeTitle`, `textSizeIntro`, `default`, `larger`,
    `largest`) in en + es. Parity test passes.
  - **Design README** documents the mechanism + the "don't use
    `text-[Npx]`" rule + the audit grep.
  - **No schema bump** (kv setting). **No threat-model entry** —
    local-only preference, no exposure surface change.
  - **6 new tests** in `textSize.test.ts` cover `isTextSize`
    accept/reject and `applyTextSize` add/clear/switch.

  Tests: 522 passing (515 → 522; +7). Lint, typecheck, build
  clean. PWA precache 955 → 957 KiB.

  **Follow-up in the same PR — `auto` preference, larger on
  desktop by default.** The default text-size for first-time
  visitors is now `auto`, which resolves to `larger` on viewports
  ≥1024px (Tailwind's `lg` — desktops + tablet-landscape) and
  `default` on anything narrower. Members who already explicitly
  picked Default / Larger / Largest in v1 of the feature keep
  their pick — `auto` is the new value for the unset case, not
  an upgrade path.
  - `TextSizePreference = "auto" | "default" | "larger" | "largest"`
    is the user pick; `TextSize` stays the resolved value.
    `resolveTextSize(pref, wide)` is a pure resolver (8 truth-
    table tests).
  - `AppContext` subscribes to viewport-width changes via
    `matchMedia` only while pref === `auto` — switching to an
    explicit size cancels the subscription (mirrors the theme
    `system` pattern). A live window resize updates the
    resolved size without reloading.
  - The Auto button on Profile → Appearance renders at the
    currently-resolved size's class (`text-base` on phone,
    `text-lg` on desktop) and a small sublabel under the
    radiogroup reads "On this screen, Auto shows {{resolved}}.
    Resize the window to see it switch."
  - The no-FOUC inline script in `index.html` was extended to
    perform the viewport check synchronously before first
    paint, so a fresh visitor on desktop sees the right size
    on the first frame.
  - 2 new i18n keys (`auto`, `autoSublabel`) in en + es;
    parity test passes.
  - Tests: 530 passing (522 → 530; +8 in textSize.test.ts
    covering the resolver truth table + the auto validator
    case). PWA precache 957 → 959 KiB.

- **Message search — local decrypt-and-scan across the conversation
  list and inside each thread.** Adds two search surfaces while
  preserving the messaging-scope principle recorded in
  threat-model §7: search only finds messages I already have on
  this device, never the member directory.
  - **`lib/messageSearch.ts`** — pure helpers: `matchesQuery`
    (case-insensitive, whitespace-trimmed, empty query never
    matches) and `highlightRanges` (non-overlapping span list for
    the highlight renderer). 14 unit tests cover both.
  - **`db/messages.ts:searchAllMessages`** — iterates every
    message I'm a party to, decrypts with my secret key + the
    counterparty's pubkey (same pattern as the existing helpers),
    returns hits grouped by conversation. **Locked session
    returns `[]`** — search is unavailable rather than partially
    silent, matching the existing read/send pattern.
  - **`Messages.tsx`** — search input above the conversation
    list (debounced 250 ms). Non-empty query → conversations
    containing matches OR conversations with a participant whose
    name matches the query ("I remember talking to Maria but
    can't remember about what"). Each result deep-links to the
    conversation with `?q=` so the in-thread search opens
    pre-filled. Locked-state disables the input with an
    "Unlock to search" hint.
  - **`Conversation.tsx`** — search input above the thread with
    match-jump UX: prev / next arrows, "N of M" position
    indicator, all messages stay visible (no thread-filtering)
    and the active match scrolls into view with a 2-px amber
    ring. Auto-scroll-to-bottom suppressed while searching.
    URL `?q=` syncs (debounced, `replace`) so deep-links work
    and the search is bookmarkable.
  - **`HighlightedText`** — small component that wraps matches
    in `<mark>` using `bg-amber-100 dark:bg-amber-900/40`. Amber,
    not ember — ember stays reserved for reciprocity moments per
    `design/README.md`; a search hit is an attention signal.
  - **Threat-model §7 entry** — documents the decrypt-and-scan
    semantics, the locked-session fail-closed behavior, the
    rejection of a persisted index (would undo encrypted-at-
    rest), and the explicit "no search-by-name to start a new
    DM" constraint so a future "find a person" proposal has the
    prior decision to argue against.
  - **i18n**: 10 new keys under `messages.search.*` in en + es
    (including `_one`/`_other` plural pair for match counts).
    Parity test passes.
  - **Out of scope**, with reasons recorded in the threat-model
    entry: no persisted index, no federation of search, no
    search-by-name to start new DMs, no regex / operators / fuzzy
    matching, no search history, no analytics, no autocomplete.

  Tests: 515 passing (501 → 515; +14 in `messageSearch.test.ts`).
  Lint, typecheck, build clean. PWA precache 948 → 955 KiB.

- **Dark mode toggle in Profile → Appearance.** The codebase already
  carried ~390 `dark:` Tailwind variants across every component,
  but no mechanism ever set the `dark` class on `<html>` — the
  variants were inert. This PR ships the toggle and the activation
  pipeline.
  - **Three-state preference**: `system` (default — follows
    `prefers-color-scheme`), `light`, `dark`. Stored on the
    `settings` table (no Dexie version bump — kv store).
  - **No-FOUC**: a tiny synchronous inline script in `index.html`
    reads `localStorage["understoria.theme"]` and applies the
    `dark` class before first paint. AppContext mirrors the
    resolved preference to localStorage on every change so the
    next page load has the right value cached.
  - **`lib/theme.ts`** owns the pure resolver, the apply helper,
    the localStorage cache writer, and the `matchMedia` subscription
    (active only when pref === `system` — pinned light/dark skips
    it). AppContext exposes `themePreference` and
    `setThemePreference`.
  - **`color-scheme: light` / `html.dark { color-scheme: dark }`**
    in `index.css` so native form controls and scrollbars track
    the theme.
  - **`AppearanceSection`** mirrors the LanguageSection pattern —
    three radio buttons, `aria-checked`, identical card chrome.
    Slotted on Profile between Language and Community node.
  - **8 new tests** in `lib/theme.test.ts` (resolver truth table
    + `isThemePreference` validator). Existing
    `palette-contrast.test.ts` already enforces WCAG AA for both
    light and dark pairings — no new contrast tests needed since
    this PR adds no new color pairings.
  - **i18n**: 5 new keys under `profile.appearance.*` in en + es;
    parity test passes.
  - **Audit pass**: grepped for `bg-white`, `text-moss-9xx`,
    `border-moss-{200,300}` etc. without `dark:` siblings — only
    multi-line-className false positives in `BottomNav` (the
    `dark:` declaration is on the same className, just wraps to
    the next line) and intentional white-on-tone chip buttons
    inside `ToastContainer` (the toast is dark in both modes by
    design). No leaks found.
  - **Design README updated** to document the toggle, the
    no-FOUC mechanism, and the class-based Tailwind mode.

  Tests: 501 passing (493 → 501; +8 in `theme.test.ts`). Lint,
  typecheck, build clean. PWA precache 917 → 948 KiB (theme
  module + AppearanceSection + i18n strings + inline script).

### Fixed
- **Co-organizers can now confirm task completions (PR #84).**
  Pilot-reported UX bug: the "Confirm completion" button on a task
  awaiting confirmation rendered for every member with organizer
  status (including co-organizers), but clicking it failed with
  "Only the project organizer can confirm completions." The UI
  gate used `isOrganizer()` (which accepts primary OR co-
  organizers), while `confirmProjectTaskCompletion` had a stricter
  inline check requiring the primary specifically.

  Resolution: loosen the server check rather than tighten the UI.
  Co-organizers exist precisely to share organizer load; primary-
  only confirmation defeats that. **The credit math holds either
  way** — the signed `Exchange` records the confirmer as the
  helped party and is signed with the confirmer's own secret key,
  so the confirming co-organizer's balance is debited (not the
  primary's). There's no shared treasury to protect; each
  confirmation is an individual decision affecting an individual
  balance. The "confirmer is the helped party" mechanic is also
  newly asserted in the test suite.

  Existing safeguards preserved: a member cannot confirm their
  own completed task (the self-confirmation check stays); the
  exchange is still signed by both helper and helped, still flows
  through the outbox to federate, still appears in the disputes
  surface if anyone flags it.

  Tests: existing non-organizer rejection test renamed for
  clarity (it's testing a member who is neither primary NOR co-
  organizer); new positive test asserts a co-organizer can
  confirm and that the confirmer's balance — not the primary's —
  is debited. 493/493 tests pass.

### Added
- **Community dashboard visual upgrade (PR #82).** Two-batch
  warming of the dashboard surface, both shipped together.
  - **Botanical visual touches.** `Sprig` ornament flanking the
    page title (mirrors the LockScreen lockup), `LeafDivider`s
    (short variant) between major sections so the wall of cards
    reads with rhythm, per-category bar color on the category-
    breakdown bars (new `barColorClass` field on `CategoryMeta`,
    all shades within canopy/moss/bark family — no ranking
    intent, just visual variation), faint `Sprig` in the top-
    right corner of the "Total hours" hero card (`opacity-10`,
    `pointer-events-none`, `data-decorative="true"` so the
    existing `prefers-contrast: more` rule suppresses it).
  - **Growing canopy milestone visualization.** Replaces the
    three `MilestoneBar` rows with a horizontal row of stylized
    leaves per milestone type (hours / exchanges / members).
    Filled leaves (`canopy-700`) = milestones reached. Outlined
    leaves (`moss-300`) = milestones yet to grow. The most-
    recently-reached leaf gets a one-time `ember-500` fade-in —
    the one place ember belongs on this surface, marking the
    community's reciprocity moment. Critical framing: it's the
    community's growing canopy, not anyone's individual
    contribution; no "next milestone X" text, no percentage,
    no member attribution, no count-up animation. New
    `CanopyMilestones` component + `milestonesForType` helper.
    Leaves are screen-reader accessible (`role="img"` + the
    milestone label as `aria-label`) — distinct from purely
    decorative SVGs (no `data-decorative`).
  - Design ethos held: no ember on regular dashboard stats
    (reserved for reciprocity moments); no growth chart; no
    leaderboards; no animated counters. The single ember use is
    on the freshly-reached leaf and matches the existing
    `design/README.md` rule.
  - 492/492 tests pass; no schema change.

- **Plain "Got it" tips with optional "Learn more" disclosure
  (PR #81).** Rewrites the 5 dismissible tip surfaces (3
  `ContextualHint`s + `FirstActionNudge` + `ProfileNudge`) into
  plain primary copy with a collapsed "Learn more" block
  underneath that reveals technical depth on tap. Pattern: native
  HTML `<details>`/`<summary>` styled as a small text-chevron
  disclosure (▾ collapsed, ▴ open via CSS `::after`) — no React
  state, no JS event handlers, keyboard accessible (space/enter
  to toggle), screen readers announce expanded/collapsed
  automatically. Plain stays as primary; technical detail goes
  *deeper* than the original copy (specific algorithm names —
  Ed25519 — file references like `lib/vouch.ts`, exact
  thresholds like `MINIMUM_VOUCHES_FOR_TRUST = 2`), available to
  curious members one tap away. The original jargon ("cryptographic
  link," "redeems," "seed credits") that confused first-touch
  users is out of the primary message and tucked into the
  disclosure.
  - `ContextualHint.tsx` gets a new optional `technicalDetail`
    prop; renders the disclosure block when provided.
  - `FirstActionNudge` + `ProfileNudge` get the same disclosure
    block added inline (kept standalone to avoid refactor churn).
  - `index.css` suppresses the browser-default disclosure marker
    (varies across browsers) and adds a clean text chevron via
    `::after` that flips on `[open]`.
  - Plain copy rewrites for `hints.board.message`,
    `hints.balance.message`, `hints.invite.message`. 6 new
    `.technical` keys plus 1 new `common.learnMore` for the
    disclosure label. en + es parity preserved.

- **Messaging scope: principle + Member-detail entry removed
  (PR #80).** Scopes DM initiation to coordination context
  rather than free-form member-to-member messaging from profile
  browsing. The "Reach out" button on `PostDetail` (shipped in
  #79) stays — it's anchored to a specific post. The Message
  button on `MemberDetail` (also shipped in #79) is removed on
  reflection: it implied "you can DM anyone whose profile you've
  reached," which would let a hostile actor enumerate the member
  list and DM everyone. Already-running conversations continue
  normally via the Messages list; the scoping applies to
  *initiation*. New `threat-model §7` entry records the
  principle as load-bearing — any future entry point that
  initiates conversations outside a coordination context must
  justify itself against this principle and supersede the entry
  with its own threat-model write-up. `messages.messageTarget`
  i18n key kept in place (still used by PostDetail's Reach-out
  button).

- **Optional availability chips on member profile + offers (PR #78).**
  Augments the existing `member.availability` free-text field with
  5 optional chips — Weekday days, Weekday evenings, Weekend days,
  Weekend evenings, Ask me anytime. Members pick zero, one, or
  many. Chips surface as quiet metadata on offer cards, offer
  detail, and member detail pages so an asker has scannable
  context before reaching out. Coarse-bucket semantics — no times
  stored, no calendar import, no individual events inferable from
  the pattern, no presence tracking, no federation. NOT surfaced
  on needs, in messages, or on project tasks. NOT filterable on
  the Board (would cross from context into ranking).

  Why this shape and not a weekly time-grid or calendar import:
  even with maximum metadata stripping, the *shape* of repeated
  unavailability leaks structural information about a member's
  life (therapy Tuesdays, AA Tues/Thurs mornings, custody
  Sundays, methadone clinic Mondays) — a known threat-model
  concern that scales with federation. Coarse buckets wide
  enough to wash out individual events are the right resolution
  for "when to reach me" without becoming a presence-tracking
  system. The threat-model §7 entry records the design decision
  so it isn't relitigated.

  Data: shared/types.ts `AvailabilityChip` union + `Member`
  field; Dexie v16 additive backfill; createMember and
  updateMemberProfile updated (undefined-is-no-change semantics
  on chips). New components `AvailabilityChipPicker` (setter)
  and `AvailabilityChips` (read-only renderer). profileNudge
  broadened so chips OR free-text satisfies; panic soft purge
  also clears chips. 9 new i18n strings × 2 locales; parity
  test passes. 492/492 tests pass (491 + 1 new chips-alone case
  on profileNudge). Cross-node posts show no chips by intentional
  preservation of the existing member-data locality model.

- **Density caps on thread surfaces (PR #76).** Project announcements
  ("Updates") and per-task comment threads now show only the
  newest items inline (5 announcements, 3 comments) with a
  "Show older (N)" toggle to expand. Prevents a long thread or
  a long-running project's announcement history from pushing
  later tasks off-screen. No data model change; pure render
  logic. New i18n strings in en and es (parity preserved).
- **Per-task comment threads with community flag-for-review
  (PRs #72–#74).** A new conversation surface on every project task,
  signed and federated like posts, with the existing disputes flow
  extended to cover comments — community moderation without
  admins.
  - **Local-only foundation (PR #72).** New Dexie table
    `taskComments` (schema v15), composite index
    `[projectId+taskId+createdAt]`. Anyone with an unlocked session
    can post (max 2 000 chars). Only the author can soft-delete
    their own comment; tombstones render as "(comment deleted by
    author)" so federation later converges cleanly. `TaskComments`
    component is collapsed by default under each task, showing the
    count; expanded view shows the thread + composer. 12 new DB
    tests cover post / list / delete / scoping / validation.
  - **Federation (PR #73).** Comments federate exactly like posts:
    outbox push from the PWA, server endpoint
    `POST/GET /task-comments`, peer pull worker fetches across
    nodes, periodic PWA pull from the community node. Server
    schema v8 adds the `task_comments` table + a
    `last_task_comment_created_at` cursor on `peer_pull_state`.
    Soft deletes federate via a re-push of the same signed row
    with `deletedAt` populated (the signature still verifies —
    `deletedAt` is excluded from the canonical payload). Single
    **tombstone-wins merge rule** applied identically in three
    places (server route, server peer pull, web federationSync):
    once tombstoned anywhere, tombstoned everywhere; `COALESCE`
    keeps the first `deletedAt`. 7 new server tests cover accept,
    idempotent re-post, bad signature, malformed body, body too
    long, tombstone application, repeat tombstone no-op.
  - **Flag a comment (PR #74).** Anyone except the author can flag
    a comment for community review. Flagging creates a `Proposal`
    row with `kind: "dispute"` carrying a new
    `CommentDisputePayload` (discriminated by
    `subjectType: "task_comment"`) that surfaces on the existing
    `/disputes` page alongside flagged exchanges. **Flagging does
    not hide or remove the comment** — visibility is the
    governance signal, per ethos. The payload carries a body
    snapshot at flag time so the community can still see what was
    flagged even if the author later soft-deletes the underlying
    comment; this accountability property is explicitly tested.
    `DisputeCard` dispatches on `payload.subjectType` to either
    `ExchangeDisputeCard` (legacy behavior — `subjectType` absent
    reads as "exchange") or the new `CommentDisputeCard`. 5 new
    web tests cover the flag flow.

  Federation of comment flags (i.e. proposals) is out of scope
  here — same constraint as existing exchange disputes. Tracked
  for a future PR alongside general proposals federation.

  Tests: 491 web (474 + 12 + 5 new), 60 server (53 + 7 new), all
  passing. i18n parity test passes (7 new strings in en/es).

- **UI polish track — foundation, identity, typography, empty
  states, polish (PRs #70, #71).** A five-workstream visual
  redesign that earns "attractive" through craft — typography,
  whitespace, identity, restraint — without violating project
  ethos (no leaderboards, no streaks, no color-as-rank, no
  individual-celebration motion).
  - **Foundation tokens (PR #70).** `ember-*` warm accent
    **reserved for reciprocity moments only** (a fulfilled need,
    an exchange accepted — never status/rank). `bark-*` warm
    neutral that pairs with moss/canopy without introducing a
    second hue. `font-serif` → Source Serif 4 Variable,
    self-hosted, unicode-range-split. 5-step type scale
    (`text-display` / `text-title` / `text-heading` / `text-body`
    / `text-caption`). `stack-*` vertical-rhythm spacing tokens.
    `shadow-leaf` soft canopy-tinted dual-layer card shadow. New
    `apps/web/src/design/README.md` documents tokens + ethos
    guardrails.
  - **Botanical visual identity (PR #71).** New
    `components/visual/` module: `Icon` base wrapper, 4 line-art
    nav icons (Board/Dashboard/Messages/Profile), 5 hand-drawn
    illustrations (Sapling/Hands/Book/Basket/Path), `LeafDivider`
    (full/short/dotted), `Sprig` ornament. BottomNav rewired to
    use SVG icons; emoji removed from chrome (user-content emoji
    on category badges + achievement badges untouched).
    EmptyState API extended with `illustration` and `title`
    props.
  - **Typographic polish (PR #71).** `.page-title`
    (`font-serif text-display`) and `.section-title` utility
    classes. 13 site-name page titles converted to the serif
    display style (user-content titles stay sans-serif because
    they're user data, not the page's name). `.card` chrome →
    `shadow-leaf` + warmer `bark-200/60` border.
  - **Empty states + ember reciprocity debut (PR #71).** Every
    EmptyState callsite (13 sites) migrated to a bespoke
    illustration + title per the design plan. 11 new title keys
    added to both en and es locales. **Ember reciprocity debut:**
    PostDetail "completed" status — the two stacked canopy-50
    paragraphs became a single `ember-50` banner framed by
    `LeafDivider`s. First ember-colored surface in the app,
    marking a fulfilled exchange as a reciprocity moment (never
    status/rank).
  - **Welcome lockup + leaf-divided principles + contrast support
    (PR #71).** LockScreen shows the serif "Understoria" wordmark
    flanked by `Sprig` ornaments. Splash swaps the sapling emoji
    for `IllustrationSapling`. LearnSection design principles
    separated by short `LeafDivider`s. **`prefers-contrast: more`
    support** — decorative SVGs (LeafDivider, Sprig, all 5
    illustrations) carry `data-decorative="true"` and are hidden
    under high contrast. Per ethos, accessible text does the
    work; high-contrast users get strengthened signal-to-noise.

  Verified: shared build clean, tsc clean, lint clean, 474/474
  tests pass (no behavior change), production build succeeds. PWA
  precache 909 → 917 KiB across the track — bundle impact is the
  variable serif font (~50 KB Latin subset, lazy-loaded by
  unicode-range) and the new SVG components.

- **Offer-poster UX improvements (PR #69).** Three features
  symmetric to the help-seeker improvements (PRs #66–#67),
  focused on the offer side of the Board.
  - **"Still offering?" variant** — the 3-day-old gentle prompt
    on PostDetail now branches on `post.type`. NEEDs see the
    existing "Still looking" copy; OFFERs see "Still offering?"
    framing. New i18n key `postDetail.stillOffering`.
  - **"Post this again"** — button on completed posts navigates
    to PostForm with `?repost=<id>&again=1`. PostForm recognizes
    the `again=1` flag and skips the auto-cancel-on-submit
    behaviour (the original is already completed, not unclaimed),
    so a poster can re-list a recurring offer or need without
    disturbing the prior exchange's record. New i18n key
    `postDetail.postAgain`.
  - **"Active needs in this category" hint** — on PostForm when
    posting an OFFER with a category selected, an inline hint
    shows the count of active NEEDs in that category with a link
    to the Board filtered to that category. Helps a poster see
    immediately whether their offer matches an open need. New
    i18n key `postForm.matchingNeeds`.

  Tests: 527 passing. No schema changes. Lint, typecheck, build
  clean.

- **Help-seeker UX improvements (PRs #66–#67).** Six features
  improving the experience for members seeking or browsing help
  on the Board.
  - **Repost with changes** — "Repost with changes" button on
    unclaimed posts pre-fills PostForm with the original post's
    data and auto-cancels the original on submit, so a poster
    can refine without losing context.
  - **Expiry visibility** — `ExpiryChip` on `PostCard` with
    color-coded urgency: amber when ≤3 days remain, rose when
    ≤24 hours, muted when expired.
  - **Category descriptions** — PostForm category selector
    changed from a plain `<select>` to a radio-button fieldset
    showing emoji + label + description for each category.
  - **Exchange confirmation guidance** — inline status-specific
    text on PostDetail at each exchange stage, so both parties
    know what to do next.
  - **Location-zone filtering** — zone dropdown on Board
    alongside the existing category and urgency filters,
    with zone list derived from posts.
  - **"Still looking" gentle prompt** — soft hint on PostDetail
    when a poster views their own unclaimed post that is 3+
    days old, encouraging them to repost or adjust.

  Tests: 527 passing. Lint, typecheck, build clean.

- **E2E encrypted direct messaging between members (Agent 2,
  task 5).** Members on the same node can exchange private messages,
  encrypted end-to-end with NaCl box (X25519 + XSalsa20-Poly1305).
  Local-only — no server relay, no federation.

  **Crypto layer:**
  - `deriveEncryptionKeyPair()` converts an Ed25519 signing key to
    an X25519 encryption key pair via **ed2curve** (0.3.0, ~2 KB,
    depends only on tweetnacl).
  - `ed25519PkToX25519()` converts a recipient's Ed25519 public key
    for encryption.
  - `encryptMessage()` seals plaintext with NaCl box and a random
    24-byte nonce (CSPRNG).
  - `decryptMessage()` opens the box on read.
  - `conversationId()` derives a deterministic conversation
    identifier from two public keys.

  **UI layer:**
  - `/messages` — conversation list (all threads for the current
    member).
  - `/messages/:memberKey` — thread view with the selected member.
  - `BottomNav` gains a Messages tab (speech-bubble icon).
  - "Message" link on `PostDetail` for non-self members (entry
    point from the Board).

  **Storage & schema:**
  - Schema v14 adds a `messages` table in IndexedDB.
  - Messages stored encrypted at rest; decrypted on read.
  - DB helpers: `sendMessage()`, `getConversation()`,
    `listConversations()`.

  **Privacy design (deliberate omissions):**
  - No read receipts, no typing indicators, no delivery
    confirmation — these are metadata leaks.
  - Locked session blocks sending.
  - Messages are not recoverable if the secret key is lost.

  i18n: `nav.messages` + `messages.*` namespace in en + es.

  Tests: lint, typecheck, build clean.

- **Task "follows" dependencies (Agent 10 continuation).** Tasks can
  now declare they "follow" other tasks — a positive framing (no
  "blocked" language) that communicates sequencing without implying
  failure. Unmet dependencies hide the claim button and show a
  "Follows: [task names]" chip on the task row.
  - **`canClaimTask()`** — pure predicate that checks whether all
    declared dependencies are complete before allowing a claim.
  - **`detectCycle()`** — prevents circular dependency chains at
    write time.
  - **`setTaskDependencies()`** — sets the dependency list for a
    task, with cycle detection.
  - **`claimProjectTask`** rejects claims on tasks with unmet
    dependencies.
  - **`editProjectTask`** extended to support dependency updates.
  - **Attention system** skips `task_check_in` for tasks with unmet
    dependencies (no nudges for work that can't start yet).

  Tests: 15 new tests covering dependency enforcement, cycle
  detection, claim rejection, and attention filtering.

- **Project archive + history view (Agent 10 continuation).** Primary
  organizer can archive completed projects, and completed/archived
  projects display a full activity history.
  - **`archiveProject()` / `unarchiveProject()`** in `projects.ts`
    for lifecycle management.
  - **`"project_archived"` / `"project_unarchived"`** activity types
    in `ProjectActivity`.
  - **New `/projects/archive` page** listing completed and archived
    projects.
  - **`HistoryTimeline` component** on completed/archived project
    detail pages showing the full activity log with human-readable
    labels for all 13 activity types.
  - **"View archive" link** on Board for discovering past projects.

  Tests: 4 new tests covering archive/unarchive lifecycle and
  activity recording.

  Combined with "follows" dependencies: 517 tests passing. Lint,
  typecheck, build clean.

- **Task editing, project attention items, contributor
  acknowledgment, and project cloning (Agent 10 continuation).**
  Four organizer-facing features shipped together, extending the
  co-organizer and project-management surface from Agent 10.
  - **Task editing** — organizers can edit unclaimed tasks (title,
    description, hours, urgency) via `editProjectTask()` in
    `projects.ts`. Inline edit form on `TaskRow`.
  - **Project attention items** — two new `AttentionItem` kinds:
    `project_deadline_approaching` (fires 3 days before deadline)
    and `project_paused_long` (fires after 7 days paused). Both
    surface in the pull-based `AttentionSection` for organizers
    and co-organizers.
  - **Contributor acknowledgment** — optional thank-you note when
    confirming a task completion. `confirmProjectTaskCompletion`
    gains an optional 4th parameter; the note is stored in the
    `task_confirmed` activity data.
  - **Project cloning** — `cloneProject()` copies project metadata
    and all tasks into a new draft. "Clone project" button in
    `OrganizerControls`.

  Tests: 498 passing. No schema bump. Lint, typecheck, build clean.

- **Organizer handoff, project announcements, and bulk task
  quick-add (Agent 10 continuation).** Three organizer-facing
  features shipped together, all building on the co-organizer
  support from Agent 10 Phase 3.
  - **Organizer handoff** — primary organizer can transfer the role
    to any co-organizer via `handoffOrganizer()`. The old primary
    stays on as a co-organizer. `HandoffSection` UI on
    ProjectDetail. New `organizer_handoff` activity type in
    `ProjectActivity`.
  - **Project announcements** — organizers and co-organizers can
    post text updates (max 2 000 chars) visible to everyone on the
    project page. Reuses the existing `ProjectActivity` table with
    a new `"announcement"` type — no schema bump needed.
    `AnnouncementSection` UI. Pull-based (no notifications),
    consistent with the app's attention model.
  - **Bulk task quick-add** — multi-line textarea, one task per
    line, capped at 50 tasks. `bulkAddTasks()` applies the
    project's default category, hours, and urgency to each new
    task. `BulkTaskForm` UI.

  Tests: 498 passing. No schema bump (reuses `ProjectActivity`
  table). Lint, typecheck, build clean.

- **Design principles with contextual "(why?)" tooltips.** Eight
  design principles (equal time, no leaderboards, no notifications,
  solidarity not shame, community authority, asking never gated,
  privacy precondition, deliberation over speed) each paired with a
  historical example. New `WhyTooltip` component placed at six
  points (balance card, dashboard, attention section, community
  settings, proposal tier, task chip). "Design principles" panel
  in Profile > Learn section. Content lives in
  `content/design-principles.ts`.

- **Cross-node claim notifications.** When a member claims a
  cross-node post, a lightweight claim record is pushed to the
  outbox so the poster's node learns about it. New `ClaimRecord`
  type (unsigned). Server: `POST /claims` + `GET /claims`
  endpoints, schema v7. PWA: `pullFederatedClaims()` applies
  incoming claims to local posts, triggering the existing
  `post_claimed` attention item.

- **PWA pulls and surfaces cross-node posts (Agent 3 completion).**
  New `lib/federationSync.ts` fetches `GET /posts` from the
  community node on startup, inserts into local IndexedDB with
  lifecycle defaults. `PostCard` gains `isCrossNode` prop showing
  an indigo "Peer community" badge. Cross-node posts are fully
  interactive (claimable + exchangeable).

- **Federation: invite pull in peer worker.** Extended
  `peerPull.ts` to pull `/invites` from peers (fourth record
  kind). Server schema v6 adds `last_invite_created_at` cursor
  column.

- **Federation: invites endpoint on community server.**
  `POST /invites` + `GET /invites`. `InvitePayload` +
  `SignedInvite` types moved to shared package.
  `verifyInvite()` + `canonicalInvitePayload()` added to shared
  crypto. Server schema v5 adds `invites` table.

- **Co-organizer support (Agent 10 Phase 3).**
  `Project.coOrganizerKeys: string[]`. `isOrganizer()` helper.
  `addCoOrganizer()` / `removeCoOrganizer()` (primary-only).
  Co-organizers can confirm tasks, add tasks, launch / pause /
  resume / complete. `CoOrganizerSection` UI on ProjectDetail.
  Schema v13 migration backfills `coOrganizerKeys: []`. Attention
  items for task confirmation surface for co-organizers.

- **Duplicate "Start a project" button removed.** EmptyState CTA
  on Projects tab removed since the FAB already serves as the
  call-to-action.

- **Agent 16 completed — opsec guide + contextual hints.** In-app
  opsec guide (6 sections from `docs/opsec-guide.md`) in
  Profile > Learn. Three contextual first-time hints: Board
  orientation, balance explanation, invite explanation. Generic
  `ContextualHint` component.

- **Impact reflection fields required for hard-tier proposals.**
  All four fields (1-year, 5-year, reversal path, vulnerable
  impact) are now enforced programmatically when tier is "hard".
  Inline validation errors on submit.

- **Roadmap updated for shipped agents.** Agent 13 → shipped,
  Agent 16 → shipped, ordering diagram redrawn, schema version
  tracking updated.

- **Threat model §7 entries.** Two new entries: public task
  check-in chip exposure + proposal close button timing channel.

- **Rename TaskStaleness → TaskCheckInState.** Type, function,
  files, and local variables renamed for ethos consistency.

- **Auto-close replaced with manual consensus button.** The
  `useEffect` that auto-closed proposals is removed. New
  "Close as passed" button visible when consensus conditions are
  met. `closedReason` is now localized. `pickProposalsToAutoPass`
  removed (dead code).

- **Post-claimed + vouch-received attention items.** Two new
  `AttentionItem` kinds in the pull-based attention surface.
  `post_claimed` shows until the exchange progresses.
  `vouch_received` time-boxed to 7 days.

- **Solidarity-not-shame fixes for the public task chip.**
  Claimer's name hidden from public row when "could use more
  hands" fires. New `taskCheckInGraceDays` config field
  (default 2) — public chip requires both claim-age floor AND
  silence since last ack. Tooltip made non-numeric.

- **Board hides claimed posts + needs-answered stat.** Claimed
  posts hidden by default with "Show N claimed" toggle. Dashboard
  gains "Needs answered this week" stat card.

- **Voting on proposals + consensus config.** Affirm / block /
  abstain on proposals. `proposalDeliberationDays` +
  `proposalMinAffirms` config fields. Manual "Close as passed"
  button.

- **Dispute migration into the unified Decisions table.** Per the
  roadmap (`docs/roadmap.md`), Agents 13 + 14 ship as one
  surface. v1 had disputes living in their own data shape (the
  `posts` row's `status === "disputed"` field); this PR adds a
  matching `Proposal` row for every flagged exchange so the
  governance layer is one table.
  - **`ProposalKind` extended** with `"dispute"`;
    **`ProposalCategory` extended** with `"dispute"`. New
    **`disputePostId: string | null`** field on `Proposal`
    links the governance row back to the underlying post (the
    source of truth for the exchange lifecycle stays on the
    post; the proposal is the deliberation view).
  - **`DisputePayload`** type — JSON shape stored in
    `Proposal.payload` for dispute kind. Contains a snapshot of
    the exchange (post title, type, hours, both parties) so the
    Decisions surface is self-contained even if the post later
    changes.
  - **`buildDisputeProposal` / `ensureDisputeProposal`** in
    `db/proposals.ts`. Builder is pure; the DB-side helper is
    idempotent — if a proposal already exists for the given
    `disputePostId`, return it instead of double-creating.
    **6 new tests** cover the NEED / OFFER helper-recipient
    mapping, whitespace-only reason trimming, idempotency, and
    the new `listProposals({ kind })` filter.
  - **`disputeExchange` extended** to accept an optional reason
    and to write the linked dispute proposal inside the same
    transaction. Idempotent guard handles tab races. The reason
    parameter is forward-compatible with the unmerged
    "dispute reason" PR (#37) — when that lands, callers can
    pass it through.
  - **Schema v11** adds the `kind` and `disputePostId` indexes
    on `proposals` and runs a one-time backfill: every
    disputed post gets a matching dispute proposal row (id
    prefixed `dispute_backfill_`). Old rows where `kind` and
    `disputePostId` are missing get defaulted to `"proposal"`
    and `null` respectively so the index is populated.
  - **`/disputes` page rewritten** to read from `proposals`
    (filter to `kind === "dispute"`) instead of from
    `lib/disputes.ts:listDisputes`. Same card layout, same
    URL — continuity preserved. Adds a small "Open in
    Decisions" link to bridge to the unified surface.
  - **`/proposals` page** now renders dispute proposals
    alongside config-change ones. A new `DisputePayloadView`
    component shows the exchange snapshot (type, hours, both
    parties) with a link to the underlying post. The category
    chip uses the rose tone for dispute kind so it stands out
    visually.
  - **`DisputesSection` entry card** on Profile now counts open
    dispute proposals (same data path the page reads from)
    instead of dispute posts.
  - **`lib/disputes.ts:listDisputes`** stays in the codebase but
    is no longer the dispute UI's data source. Kept for now
    because it's referenced from one component test fixture
    and the cost of removing it is more than the cost of
    leaving it. Future PR can delete.

  Not in scope: deleting `lib/disputes.ts`, redirecting
  `/disputes` → `/proposals?kind=dispute` (would break existing
  bookmarks), auto-resolving the post-level
  `status === "disputed"` when the dispute proposal closes
  (the resolution lifecycle for "what to do with the credits"
  is a separate community-policy question).

  Tests: 413 passing (407 → 413; +6 in `proposals.test.ts`).
  Locale parity passes (new `disputes.openInDecisions` and
  `proposals.category.dispute` keys in en + es). Lint,
  typecheck, build clean.

- **Impact reflection form for hard-tier proposals.** The
  `impactReflection` slot was already in the `Proposal` data
  model (from the Proposals MVP PR); this PR wires the form on
  ProposalNew and the display on Proposals.
  - **Structural pause, not gatekeeping.** Per the roadmap:
    when the proposer picks `hard` reversibility tier, four
    textareas appear — year-one impact, five-year impact,
    reversal path, vulnerable impact — but NONE are required.
    Submitting with all blank is fine. The form's existence is
    the pause; gatekeeping would just push the friction into
    bypass behaviour.
  - **`ProposalNew`** conditionally renders an `ImpactReflectionForm`
    fieldset (rose-tinted to match the hard-tier framing) when
    `reversibilityTier === "hard"`. Fields persist across tier
    toggles so flipping back from hard → moderate → hard
    doesn't lose what was typed. Submit serializes the four
    fields to JSON (only if at least one is non-empty;
    all-blank → `null`).
  - **`Proposals` page** renders an `ImpactReflectionDisplay`
    card on any proposal with a populated reflection. Same
    rose tone, formatted as a definition list with one
    section per non-empty field. Empty fields are skipped so
    a partial reflection still reads cleanly.
  - **i18n**: new `proposals.new.impact.*` + `impactHeader`
    + `impactIntro` + `impactFooter` for the form, plus
    `proposals.impact.*` for the display headings, in en + es.

  No new tests — the data path (`createProposal` with
  `impactReflection: ImpactReflection`) was already covered by
  `proposals.test.ts:serializes impactReflection to JSON when
  provided`. The new code is pure UI on top of existing
  storage.

  Tests: 407 passing (unchanged). Locale parity passes. Lint,
  typecheck, build clean.

- **Automatic close on consensus.** Builds on the voting layer
  from the previous PR. A proposal now auto-passes when:
  - the **deliberation period** has elapsed
    (`proposalDeliberationDays`, default 3),
  - there are **zero remaining blocks**, and
  - there are at least **`proposalMinAffirms` distinct affirm
    votes** (default 2 — same threshold the vouch system uses
    for "trusted").

  Auto-reject is intentionally NOT implemented. A stalled
  proposal stays open until someone manually withdraws it or
  the community agrees out-of-band that it's dead. The
  "supermajority fallback" `GOVERNANCE.md` describes is left
  for a more contentious mechanism in a future PR.
  - **Two new `NodeConfig` fields** —
    `proposalDeliberationDays` (default 3) and
    `proposalMinAffirms` (default 2). Old config rows that
    pre-date these fields read them as the defaults; no
    schema migration needed because the reader
    (`getNodeConfig`) already null-coalesces.
  - **`autoCloseProposals.ts`** — pure decision logic:
    `autoCloseEligibility(proposal, votes, config, now)`
    returns a tagged result (`passes` / `wait_deliberation`
    / `wait_affirms` / `blocked` / `not_open`). The page-
    level effect uses `pickProposalsToAutoPass` to find every
    eligible proposal in one pass and close it via the
    existing `closeProposal` helper (with a "Auto-passed on
    consensus" reason for the historical record).
    **10 tests** cover the five eligibility branches +
    cross-proposal vote isolation + the boundary cases (exact
    deliberation cutoff, abstains-don't-count, configurable
    thresholds).
  - **Eligibility banner on every open proposal card** —
    surfaces the current state inline:
    - `"Auto-passes {{when}} if no blocks land before then."`
      (amber tone, deliberation window still ticking)
    - `"Needs N affirms to auto-pass on consensus; has M so
      far."` (amber tone, deliberation done but undervoted)
    - `"Held by 1 block — needs to be resolved before this
      can move forward."` (rose tone)
    The `passes` state doesn't render — by the time the
    component re-renders the auto-close effect has already
    flipped the proposal to closed.
  - **The auto-close effect** runs on every render of
    `/proposals`, so the moment the last condition is
    satisfied (deliberation done, min affirms, no blocks)
    the proposal closes. Race-safe — `closeProposal` rejects
    on already-closed rows, and the effect swallows that
    error so two tabs visiting the page simultaneously
    don't trip each other.
  - **CommunitySettingsSection** now exposes the two new
    thresholds alongside the existing three, so a community
    can tune deliberation period + minimum affirms to local
    cadence (per Ostrom principle 2: rules fit local
    conditions).
  - **i18n**: new `proposals.eligibility.*` (wait-deliberation,
    wait-affirms, blocked) and
    `profile.communitySettings.deliberationDays.*` /
    `profile.communitySettings.minAffirms.*` in en + es.

  Tests: 407 passing (397 → 407; +10 in
  `autoCloseProposals.test.ts`). Locale parity passes. Lint,
  typecheck, build clean.

- **Voting on proposals.** Builds on the Proposals MVP from the
  previous PR. Members can now affirm / block / abstain on any
  open proposal directly from `/proposals`. Each card shows the
  running tally + a list of blockers with their reasons.
  - **`Vote` type** in `packages/shared/src/types.ts`:
    `choice: "affirm" | "block" | "abstain"`, optional `reason`
    (strongly encouraged for blocks, so the community can
    resolve the objection), `voterKey`, `proposalId`,
    `createdAt`. Deterministic id `${proposalId}|${voterKey}`
    so a re-cast vote overwrites the prior row in place.
    Unsigned for v1 because votes stay local — federation
    governance (Agent 15) will add a signature field.
  - **Schema v10** adds a `votes` table indexed on `proposalId`,
    `voterKey`, `createdAt`, and `[proposalId+voterKey]`.
  - **`lib/votes.ts`** — pure `tallyVotes(votes)` returns
    `{ affirms, blocks, abstains, totalVoters }` with each
    bucket sorted newest-first, plus `currentMemberVote(key,
    votes)` and `voteId(proposalId, voterKey)`. **11 tests**
    cover empty / by-choice grouping / latest-per-voter dedup /
    out-of-order rows / sort order / distinct-voter count, plus
    the current-member-vote and id-composition helpers.
  - **`db/votes.ts`** — `castVote`, `listVotesFor`,
    `getMemberVote`. Reason is trimmed and whitespace-only
    becomes null. Re-casting overwrites in place (one row per
    voter per proposal). **7 tests** cover the lifecycle.
  - **Inline voting UI on each open proposal** — three pill
    buttons (Affirm / Block / Abstain) with the member's current
    choice highlighted via `aria-pressed`. Tapping Block opens a
    reason textarea before recording. Tally renders inline:
    "Affirm: 3 (Alice, Bob, Carol) — Block: 1 (Dave: 'concerned
    about edge case X') — Abstain: 0".
  - **Latest-vote-wins**. Changing your mind is one tap away;
    the tally helper dedups defensively even if multiple rows
    somehow exist.
  - **Closure stays manual for v1.** A proposal doesn't
    automatically pass on N affirms or fail on M blocks —
    deliberation periods and supermajority thresholds are real
    community decisions that need pilot input. Voting gives the
    signal; humans still record the outcome.
  - **`AppContext` loads votes** via a live Dexie query so
    every voting surface stays in sync without prop drilling.
  - **i18n**: extended `proposals.*` with a `vote.*` block
    (heading pluralization, prompt, choice labels, tally
    labels, block-reason dialog) in en + es.

  Not in scope: automatic close on consensus/supermajority,
  signed votes (Agent 15), per-proposal deliberation periods,
  showing "your block is unresolved" reminders. Each is a
  separate slice once we see how voting plays in practice.

  Tests: 397 passing (379 → 397; +18 across `votes.test.ts`
  and `db/votes.test.ts`). Locale parity passes. Lint,
  typecheck, build clean.

- **Two-tier check-in handling for project tasks.** Per the
  project ethos — never frame missed delivery as "stalled" /
  "overdue" / "failed." Two paired affordances surface a task
  that's been claimed a while without acting on it, both
  framed at the task (not the person):
  - **Private "still on it?" nudge for the claimer**, after a
    configurable `taskCheckInDays` (default 7). Surfaces in
    AttentionSection — visible only to the claimer. Two
    buttons: *Still on it* (resets the clock for another N
    days) and *Release it for someone else* (un-claims with
    no record kept). Hint copy: "Capacity changes — release
    it if you need to. No record kept."
  - **Public "could use more hands" chip** on the project task
    row, after a configurable `taskNeedsHelpDays` (default
    14) AND a grace window since the claimer's last
    acknowledgement. Framed at the task. When the chip
    fires, the claimer's name is dropped from the public row
    — the task is community work again, and the claimer's
    own affordances (private nudge, in-row buttons) remain
    visible to them. Tooltip carries no day count;
    framing-at-the-task all the way down. *Solidarity not
    shame: a member who is engaging — even just to say "yes,
    still on it" — should never appear in a community-
    visible signal.*
  - **Pure helper module** `lib/taskStaleness.ts` —
    `taskStaleness(task, config, now)` returns a tagged result
    (`fresh` / `check_in_due` / `needs_more_hands`). The
    public chip requires BOTH (a) the task has been claimed
    for at least `taskNeedsHelpDays` AND (b) the claimer has
    been silent for at least `taskCheckInDays +
    taskCheckInGraceDays` since their most recent ack (or
    since the claim if they've never acked). Each ack buys
    grace; sustained silence is what surfaces the public
    chip. 21 tests cover branches, boundaries, and
    configurable thresholds — including the grace-window
    transitions.
  - **`ProjectTask`** gains `claimedAt` + `checkInAcknowledgedAt`
    fields. Schema v11 migration backfills `claimedAt = now()`
    for any currently-claimed task so the prompts don't all
    fire at once on first load. `claimProjectTask` stamps
    `claimedAt`; `unclaimProjectTask` clears both; new
    `acknowledgeTaskCheckIn` action stamps
    `checkInAcknowledgedAt`.
  - **`NodeConfig`** gains `taskCheckInDays` + `taskNeedsHelpDays`
    + `taskCheckInGraceDays` (defaults 7 / 14 / 2). Surfaced
    in CommunitySettingsSection so a community can tune the
    cadence to their own rhythm — short for fast-moving
    groups, long for slow-cooking projects. Validators
    ensure `needsHelpDays >= checkInDays` and
    `taskCheckInGraceDays >= 0`. A grace of 0 means the
    public chip fires the moment the claim floor is met
    (the previous behaviour).
  - **New AttentionItem kind** `task_check_in` joins
    `confirm_exchange` and `confirm_task`. The component
    renders inline action buttons (not a Link wrapper) because
    the actions live on the prompt itself; the project name
    stays tappable as a deep-link.
  - **i18n**: new `attention.taskCheckIn.*`,
    `projects.task.needsMoreHands*`, and
    `profile.communitySettings.taskCheckInDays.*` /
    `taskNeedsHelpDays.*` in en + es.

  Not in scope: co-helpers / helpers list (raises questions
  about exchange-credit splitting), per-project threshold
  override, auto-release after some long N (would feel
  punitive even if quiet).

  Tests: 419 passing (398 after rebase onto voting + board-hide,
  +21 in `taskStaleness.test.ts` covering the grace-window
  transitions, +2 in `nodeConfig.test.ts` covering the new
  validator). Locale parity passes. Lint, typecheck, build
  clean.

- **Board hides claimed posts by default + "needs answered this
  week" stat.** Two paired changes — both keep the Board
  action-oriented and surface community responsiveness as a
  collective signal (not a personal score).
  - **`Board`** now filters out posts where `claimedBy !== null`
    by default. A small pill at the top of the list ("Show 3
    claimed") toggles them back in. The pill only renders when
    claimed posts exist in the current tab + filter scope, so
    members who don't have any claimed posts in view never see
    the affordance. State is session-local — flips back to
    hide-claimed on reload, which matches the action-oriented
    framing every time someone returns to the Board.
  - **`CommunityStats`** gains `needsAnsweredThisWeek` +
    `needsPostedThisWeek`. "Answered" = a NEED posted in the
    last 7 days that has a claimer. The pair lets the Dashboard
    render a ratio ("12 of 18 posted this week") without the
    caller doing the math.
  - **`Dashboard`** gets a 5th `StatCard`: "Needs answered this
    week — 12 / of 18 posted this week." Sublabel handles the
    "no needs posted this week" case so the card stays
    grammatical when the community is quiet.
  - **Anti-engagement-bait note**: deliberately stays
    community-level. No per-member "you've answered N needs"
    surface — that tips into leaderboard energy. The Achievement
    system already covers individual recognition by "naming
    the shapes your contributions take," not by scoring.
  - **+1 test** in `stats.test.ts` covers the new fields
    (window enforcement, OFFER posts don't count toward NEED
    stats, claimed vs unclaimed within window).

  i18n: `board.showClaimed` / `board.hideClaimed`,
  `dashboard.stats.needsAnswered` / `ofPosted` /
  `noNeedsPosted` in en + es.

  Tests: 380 passing (379 → 380) before rebase; rebased onto
  the voting layer for a combined 398 passing. Locale parity
  passes. Lint, typecheck, build clean.

- **Agent 13 — Proposals MVP at `/proposals`.** First slice of
  the Decisions surface that the roadmap (`docs/roadmap.md`)
  describes. v1 is `config_change` proposals only, no voting,
  no impact-reflection form — but the data model carries every
  field the future kinds and the moderate / hard tiers will
  need, so follow-up PRs add behavior without rewriting
  storage.
  - **`Proposal` type** in `packages/shared/src/types.ts` with
    `kind: "proposal"` (the dispute kind folds in later per
    the roadmap's "Decisions" plan), `category: "config_change"`
    (recall / policy land later), `reversibilityTier:
    "easy" | "moderate" | "hard"`, `status: "open" | "passed"
    | "rejected" | "withdrawn"`, JSON-string `payload`, and a
    pre-existing `impactReflection` slot for the `hard`-tier
    structural pause that ships in a follow-up.
  - **Schema v9** adds a `proposals` table indexed on `status`,
    `category`, `createdAt`, and `[status+createdAt]`.
  - **`db/proposals.ts`** — `createProposal`, `listProposals`,
    `getProposal`, `closeProposal` helpers. v1 closure is
    manual: the community reaches a decision out-of-band
    (their usual channel) and any member records the outcome
    + reason here. 13 tests cover create / list (with status
    filter + newest-first sort) / close (with the
    refuse-double-close + missing-row paths) / get.
  - **`/proposals` page** lists proposals with a status filter
    (open/all/passed/rejected/withdrawn). Each card shows
    status / reversibility / category chips, the proposed
    config diff (parsed from the JSON payload), proposer +
    timestamps, and an inline "record outcome" affordance for
    open proposals (passed / rejected / withdrawn with an
    optional reason note).
  - **`/proposals/new` form** scoped to `config_change` for v1.
    Editing any of the three NodeConfig thresholds (daily
    helper limit, short-exchange hours, reciprocal-pair
    threshold) shows the current value as a hint so the
    proposer sees what they're changing. Reversibility-tier
    picker defaults to easy.
  - **`ProposalsSection` entry card on Profile** mirrors
    `DisputesSection` — live count of open proposals + link to
    the page.
  - **`CommunitySettingsSection` bootstrap note** now links to
    `/proposals/new` as the alternative to direct edit. Direct
    edit stays in place for v1 (still the only path that
    actually applies the change); once voting lands in a
    follow-up, the direct-edit path will route through the
    proposal flow.
  - **`AppContext` loads proposals** via a live Dexie query so
    every surface that needs them stays in sync.
  - **i18n**: new `proposals.*` namespace in en + es covering
    page chrome, list labels, status / reversibility / category
    labels, the outcome dialog, error messages, and the
    Profile entry card pluralization.

  What's intentionally *not* in here: voting, automatic close,
  impact-reflection form, dispute migration into the same
  table, moderate/hard categories beyond label/tier (no
  recall, no policy yet). Each is a separate slice once the
  surface has real proposals to design against.

  Tests: 379 passing (366 → 379; +13 in `proposals.test.ts`).
  Locale parity passes. Lint, typecheck, build clean.

- **Trust visualization across the app.** Vouches existed in the
  backend (`lib/vouch.ts`) and the binary `TrustChip` was rendered
  on Profile / MemberDetail, but: the chip showed no count, no
  one could see *who* vouched for a member, and the Board feed
  showed no trust state at all. This PR makes trust visible
  everywhere it matters.
  - **`vouchersFor(memberKey, ctx)`** in `lib/vouch.ts` — returns
    the distinct voucher set as a `Map<voucherKey, VoucherRef>`
    where each ref carries `kind: "invite" | "manual"` and (for
    manual vouches) `createdAt`. If a voucher both invited
    someone and later signed a manual vouch, the manual kind
    wins — it's the stronger signal. Plus
    **`vouchCountFor(memberKey, ctx)`** for the common "just
    give me the number" case.
  - **`TrustChip`** gains an optional `count` prop and a
    `compact` size variant. When `count` is supplied, the chip
    reads "Pending (1/2)" or "Trusted (3 vouches)" instead of
    the bare binary label. The compact size is for inline use
    next to a name in a list, where the full chip would feel
    heavy.
  - **`TrustedByList` component** — sectioned list on
    MemberDetail showing every voucher with a chip
    distinguishing manual vs invite vouches, a link to each
    voucher's MemberDetail page so trust can be followed
    transitively ("Rosa vouched for them, I trust Rosa"), and
    the manual-vouch timestamp where present. Empty state when
    no one has vouched yet.
  - **Board PostCards** now surface the poster's trust chip
    inline (compact variant) so members can see trust state
    without navigating away. Trust map is computed once at the
    Board level (`Map<memberKey, TrustStatus>`) and passed
    down per-card — not per-row recomputation.
  - **Profile + MemberDetail headers** show the count alongside
    the chip — same data path, just a richer label.
  - **6 new tests** in `vouch.test.ts` covering `vouchersFor`
    (empty / manual-only / invite-only / manual-beats-invite
    deduplication / invalid-signature filtering) and
    `vouchCountFor` (distinct counting).
  - **i18n**: extended `trust.*` with `trustedWithCountOne/
    Other` and `pendingWithCount`; new `trustedBy.*` namespace
    for the list section. Both en + es.

  Per `GOVERNANCE.md`: trust is a community property, not an
  admin grant. Making vouches transparent is part of how the
  community holds itself accountable for who's in.

  Tests: 366 passing (360 → 366; +6 in `vouch.test.ts`).
  Locale parity passes. Lint, typecheck, build clean.

- **Community-visible Disputes surface at `/disputes`.** First slice
  of the governance workstream (Agent 12 in `docs/roadmap.md`).
  The dispute-flag flow already wrote a `"disputed"` status onto
  posts, but nothing surfaced it to anyone except the two parties
  on the original post detail page — flags landed in a dead drop.
  Now there's a community-visible list so members can see what's
  been flagged and ground real cases for the resolution lifecycle
  that follows.
  - **View-only is intentional for v1.** Resolution still happens
    out-of-band (talk to both parties, take it to the community's
    usual decision-making channel). In-app proposal / resolution
    tooling is Agent 13 on the roadmap; this PR's job is to
    surface the signal, not to design the response without real
    cases to design against.
  - **`apps/web/src/lib/disputes.ts`** — pure `listDisputes(posts,
    members)` that filters to `status === "disputed"`, maps
    helper/recipient by post type (NEED → claimer helps poster;
    OFFER → poster helps claimer), and sorts newest-first.
    Defensive against malformed rows (skips disputes with no
    claimer). 8 tests cover empty, mixed-status, NEED vs OFFER
    direction, missing names, defensive skip, sort order, and
    field preservation.
  - **`apps/web/src/pages/Disputes.tsx`** — sectioned card list
    matching the rest of the app's surfaces. Each entry shows
    flagged chip + type + category + hours + both parties (with
    short keys for verification) + when the post was originally
    posted, plus a link to the underlying post for the full
    context.
  - **New `/disputes` route** in `App.tsx`, gated behind onboarding
    the same as other authenticated routes.
  - **`DisputesSection` component** added to Profile (above
    CommunitySettingsSection) — small entry card with a live
    count chip so members can see "N exchanges flagged for
    community review" at a glance.
  - **No role-gating.** Per `GOVERNANCE.md`: no admins. Every
    member of the node can see the list. The two parties already
    see the flag on the underlying post; this surface makes it
    findable for the rest of the community.
  - **Privacy posture**: the post itself is already visible to
    the community node; "this is disputed" is already on the
    post detail page. Disputes surface introduces no new
    information disclosure — it just makes existing public
    state easier to find.
  - **i18n**: new `disputes.*` namespace in en + es covers the
    page chrome, list labels, footer, and Profile entry card
    pluralization.

  Future PRs:
  - Persist a `disputedAt` timestamp so sort can use recency of
    flag rather than recency of original post.
  - Resolution lifecycle (Agent 13): mark resolved with a
    co-signed outcome, transition out of disputed state.
  - "Why was this flagged?" — currently the flag carries no
    reason; adding an optional note from the flagger would
    sharpen the signal.

  Tests: 360 passing (352 → 360; +8 in `disputes.test.ts`).
  Locale parity passes. Lint, typecheck, build clean.

- **Time-formatting consistency sweep.** Date / time rendering
  used to mix three patterns (the canonical `formatRelativeTime`
  helper, raw `toLocaleString()` / `toLocaleDateString()` with
  or without the i18n locale, and a custom compact-date in
  `ProjectSparkline`). Four sites silently rendered dates in
  the browser-default locale even when the UI was set to
  Spanish. Future-facing dates always read absolute, which
  made nearby deadlines ("expires Mar 5, 2026") read worse
  than they had to.
  - **Three new helpers** in `apps/web/src/lib/format.ts`:
    - `formatAbsoluteDate(timestamp)` — always passes
      `i18n.resolvedLanguage` to `toLocaleDateString`.
    - `formatAbsoluteDateTime(timestamp)` — same for
      `toLocaleString`; for surfaces where the hour-of-day
      matters (federation sync timestamp, etc.).
    - `formatDeadline(timestamp, now?)` — smart picker. Uses
      `formatRelativeTime` when the gap is < 7 days
      ("in 3 days", "2 days ago"); falls back to
      `formatAbsoluteDate` otherwise ("Mar 5, 2026"). 7-day
      cutoff mirrors the same week-boundary
      `formatRelativeTime` already uses for past events.
  - **Sites updated** to use the helpers, in order of impact:
    - `PostDetail` `expiresAt` — was bare
      `toLocaleDateString()`; now `formatDeadline` so a
      close-to-expiry post reads "in 2 days" instead of
      "Mar 5, 2026".
    - `ProjectDetail` `deadline` — same. Also fixes the
      label/value duplication that rendered the same date
      twice ("Deadline: Mar 5" / "Mar 5") — the i18n key
      `projects.detail.deadline` no longer interpolates the
      date; the value below carries it.
    - `Profile` invite expiries and `InviteAccept` —
      `formatDeadline` for both.
    - `NodeSection` federation last-success — now
      `formatAbsoluteDateTime` (always-localized).
    - `AchievementBadge` earned-at — now `formatAbsoluteDate`.
    - `CommunitySettingsSection` saved-at time — locale fix
      (was using browser default).
  - **`ProjectSparkline`** keeps its custom compact-date
    formatter — "Mar 5" / "5 mar" is genuinely more useful
    than a relative time on a per-day axis label.
  - **`formatHours` and `formatRelativeTime` get test
    coverage** alongside the new helpers — 17 tests in
    `format.test.ts` covering the 0h / sub-hour /
    integer / signed cases plus the 7-day boundary on
    `formatDeadline`. Locked in a quirk where
    `formatHours(0.25)` returns "18m" not "15m" (the
    function rounds to 0.1-hour granularity first then
    converts) so a future "fix" doesn't silently shift
    display.

  Tests: 352 passing (335 → 352; +17 in `format.test.ts`).
  Locale parity passes. Lint, typecheck, build clean.

- **Error-recovery toasts with Retry.** When a task / project /
  post action fails (claim a task, confirm an exchange, launch
  a project, etc.), an inline error appeared somewhere on the
  page — but the dialog had just closed, the page may have
  scrolled, and the in-row button that triggered the action
  often was no longer visible. Recovery was "find the button
  again." Now those failures also surface as a persistent
  error toast with a Retry button that re-runs the original
  action.
  - **`ToastTone` gains `"error"`.** Success / info auto-dismiss
    after 4s (the action they acknowledge already happened);
    error toasts persist until dismissed or Retry is tapped.
  - **`ToastState.action`** — optional `{ label, onAction }`.
    The Retry button calls `onAction()` then dismisses the
    toast. Caller decides what Retry means.
  - **`showToast` signature** stays backward-compatible:
    `showToast("msg")` still works, `showToast("msg", "info")`
    still works (the 2nd arg can be a string tone for the
    common case). New shape: `showToast("msg", { tone, action })`.
  - **`ToastContainer` layout** branches by tone. Success/info
    keep the single-tap pill. Errors and toasts-with-actions
    render a richer row: message + Retry + explicit X
    dismiss. Errors use `role="alert"` + `aria-live="assertive"`;
    success/info stay `polite`.
  - **PostDetail's `run()` wrapper** captures the closure and
    re-runs it on Retry. The inline error display stays in
    place too — both surfaces are reliable, and the toast just
    catches the user wherever they happened to look.
  - **ProjectDetail's `run()` wrapper** gets the same treatment.
    Task actions (claim, mark done, release, confirm) and
    project status actions (launch, pause, complete, resume)
    all route through this wrapper, so a single change covers
    all of them.

  Not done here, by design: form submissions (PostForm,
  ProjectNew, Profile edit) still use inline-error-only. The
  form preserves state, the submit button is still visible,
  and toasting on top of that would be redundant noise. Retry
  toasts are specifically for action buttons where the
  trigger is ephemeral.

  Tests: 320 passing (unchanged — the change is layout + flow,
  and existing tests still cover the underlying actions).
  Locale parity passes (reuses the pre-existing
  `common.tryAgain` string). Lint, typecheck, build clean.
- **Help / FAQ surface at `/help`.** Task-oriented Q→A
  reference that complements the existing conceptual MEMBER_GUIDE.
  Members hit this when they have a specific "how do I…" or
  "what if…" question; the guide is for "what is this and why
  does it work this way."
  - **`apps/web/src/content/faq.ts`** — 14 entries across four
    sections (Posts and exchanges, Balance and credits, Your
    identity and devices, Community and invites). English-only
    for now, same convention as `member-guide.ts` (long-form
    prose translation is a separate workstream from UI
    strings, per the i18n debt note in `docs/roadmap.md`).
  - **Each entry has a stable `id`** that becomes a URL
    fragment — `/help#confirm-exchange`, `/help#lost-passphrase`,
    etc. Members can share specific answers. On mount the Help
    page reads `location.hash` and scroll-targets the matching
    `<article>`.
  - **`apps/web/src/pages/Help.tsx`** — sectioned card layout
    matching the rest of the app's surfaces. `scroll-mt-4` on
    each article keeps the deep-linked entry visible below the
    sticky header.
  - **New route** `/help` in `App.tsx` (gated behind onboarding
    same as the other authenticated routes; reachable via a new
    "Common questions" button in `LearnSection`).
  - **`LearnSection` updated** — three buttons before (Revisit
    welcome, Member guide, Study prompts), four now. The new
    button is a `<Link to="/help">` so deep-linkable URLs
    survive the round-trip.
  - **Title-level i18n** for `help.*` in en + es (page title,
    subtitle, footer). FAQ content itself stays English-only.

  Anti-engagement-bait note: no telemetry on which questions
  members open; no "was this helpful?" prompts; no follow-up
  suggestions designed to keep readers scrolling. The footer
  ends with "Most of what isn't here is a community
  conversation, not an app feature — talk to a member you
  trust." That's the stance.

  Tests: 320 passing (unchanged — the change is content +
  structural, and locale parity already covers the new
  `help.*` keys). Lint, typecheck, build clean.
- **Inline form validation across `PostForm`, `ProjectNew`, and
  `InviteAccept`.** Validation used to fire only on submit and
  surface as a single error message at the bottom of the form.
  Now each validated field surfaces its own error next to the
  field, shown only after the member has interacted with it
  (or attempted to submit).
  - **Validator primitives** at `apps/web/src/lib/validation.ts`:
    `required`, `positiveNumber`, `positiveInteger`, `optional`
    (a combinator that lets through empty strings — for fields
    like "deadline in days, blank = no deadline"), `combine`
    (run validators left-to-right, return first error). Each
    returns `null` (valid) or a `FieldError` carrying an i18n
    key and optional interpolation values. 15 tests cover the
    boundaries (empty, whitespace, non-numeric, zero, negative,
    fractional).
  - **`useFieldValidation` hook** tracks per-field touched state.
    `onBlur(field)` marks one as touched (so we hold off
    showing errors until interaction). `markAllTouched()` is
    called from `handleSubmit` so untouched-but-invalid fields
    surface their errors before the submit handler runs.
    `shouldShowError(field)` returns `touched && hasError`.
  - **No `<Field>` wrapper component** — the three forms have
    varied layouts (labels with hints, two-column grids,
    selects), and forcing them all through a wrapper would
    have ballooned the diff. The hook gives the state; each
    form renders it the way that fits.
  - **Accessibility**: each invalid field gets
    `aria-invalid="true"` and an `aria-describedby` pointing to
    the error `<p role="alert">`. Hint text (where present)
    moves to a separate id so it doesn't fight the error for
    `aria-describedby`. `noValidate` on the `<form>` keeps
    browser-default validation out of the way — our hook is
    the source of truth.
  - **Submit button stays enabled** even when errors exist.
    Clicking submit calls `markAllTouched`, which surfaces the
    errors visibly; this is gentler than disabling the button
    (which leaves users wondering why nothing happens).
  - **Existing form-level error display** stays in place for
    submission failures (network errors, db errors). Field
    validation errors no longer appear there — they're inline
    where they belong.
  - **Two new i18n keys** added: `postForm.errorExpiresInDays`
    and `projects.create.errorDeadlineDays` (both en + es).
    Other error keys (title required, hours positive,
    displayName required) were already in i18n and got
    repointed at the validators.

  Tests: 335 passing (320 → 335; +15 in `validation.test.ts`).
  Locale parity passes. Lint, typecheck, build clean.

- **First-action nudge on Board.** One-time orientation banner
  for brand-new members who haven't posted or claimed anything
  yet: "Two ways in: tap any post that catches your eye to see
  how exchange works, or share something you need or can offer.
  No pressure to post first — lurking is welcome too." The
  explicit "lurking is welcome" matters because new members
  often assume they have to publish before they belong.
  - **Trigger** is purely state-based: the member has no posts
    where they're the poster or the claimer, AND the dismiss
    flag isn't set.
  - **Self-clearing.** Posting or claiming anything makes the
    banner stop showing on its own. The dismiss flag only
    matters for members who want to lurk forever without ever
    taking action.
  - **No CTA button.** The Board already has the affordances
    (tabs, post FAB, tappable cards); the nudge points them out
    rather than duplicating them.
  - **Stacks above `ProfileNudge`** on Board. Both can appear
    for a brand-new bare-profile member, but they're informational
    sidecars (small, dismissible, no urgency) so the stack is
    fine. Each dismisses independently.
  - **`memberHasTakenFirstAction(memberKey, posts)`** +
    `dismissFirstActionNudge()` / `isFirstActionNudgeDismissed()`
    helpers in `apps/web/src/lib/firstActionNudge.ts`. 8 tests
    cover the empty-posts case, posted-but-not-claimed,
    claimed-but-not-posted, unrelated posts, and the dismiss
    sentinel.
  - **`firstActionNudgeDismissed` setting key** added to
    `SETTING_KEYS`, same shape as `onboarded` and
    `profileNudgeDismissed`.
  - **i18n** in en + es. Note the copy explicitly invites
    lurking — that's the project's stance, not a bug.

  Same anti-engagement-bait posture as the profile nudge:
  one-time, dismiss-forever, informational not urgent, no
  telemetry, no completion percentages.

  Tests: 320 passing (312 → 320; +8 in
  `firstActionNudge.test.ts`). Locale parity passes. Lint,
  typecheck, build clean.

- **Profile-completion nudge on Board.** Pairs with the onboarding
  profile-setup step (previous PR): for members who Skipped that
  step, or who joined before it existed, a small dismissible
  banner appears above the Board content offering to take them
  to Profile to fill in their area / skills / availability.
  - **Trigger** is purely state-based: render iff the current
    member has all three fields empty AND the dismiss flag isn't
    set. Filling any one of the fields (or dismissing) makes
    the banner stop showing on its own — no second nag.
  - **`profileIsBare(member)` + `dismissProfileNudge()` /
    `isProfileNudgeDismissed()`** helpers in
    `apps/web/src/lib/profileNudge.ts`. Pure-ish module, 9 tests
    cover the null-member case, each individual field as a
    de-bare-er, whitespace-only handling, and the dismiss
    sentinel.
  - **`profileNudgeDismissed` setting key** added to
    `SETTING_KEYS`. Same shape as the existing `onboarded`
    sentinel — "1" means dismissed, anything else means undismissed.
  - **`ProfileNudge` component** renders the canopy-50 banner;
    matches `DraftBanner`'s visual language so the two read as
    the same "informational sidecar" pattern. Two actions —
    "Add some details" (navigates to /profile) and "Not now"
    (writes the dismiss setting).
  - **Mounted in Board** above `AttentionSection` so it's the
    first thing a returning bare-profile member sees, but below
    the page title so it doesn't shout.

  Anti-engagement-bait note: this is a one-time, dismiss-forever
  nudge with informative (not urgent) copy. It is not a
  notification, doesn't count completion percentages, and
  cannot reappear once dismissed.

  Tests: 312 passing (303 → 312; +9 in `profileNudge.test.ts`).
  Locale parity passes. Lint, typecheck, build clean.

- **Onboarding: profile-setup step.** The welcome flow used to drop
  members on the Board with a default profile (no location zone,
  no skills, no availability). It now ends with a fifth screen
  inviting them to fill those in — all optional, all skippable,
  all reachable later in Profile.
  - **`OnboardingScreen` body became a `ReactNode`** (was
    `readonly string[]`). Concept screens still pass paragraphs;
    the new step passes form fields. New `busy` prop disables
    Skip / Back / Next while the async save is in flight.
  - **New step kind** in `Welcome.tsx` — `{ kind: "profileSetup" }`
    alongside the existing `{ kind: "concept" }`. Step-machine
    pattern means future steps (a "tour highlight" step, say)
    plug in the same way.
  - **Fields prepopulate from the current member** so a returning
    user who re-opens `/welcome` via the LearnSection link sees
    their existing values, not blanks. Empty values aren't
    written (no clobbering with empty strings).
  - **Skip still works exactly as before** — marks onboarded,
    navigates to Board, leaves the profile alone.
  - **i18n**: `welcome.profileSetup.title / intro / hint` in en
    and es. Field labels reuse `profile.about.*` so the welcome
    copy and the Profile page stay in lockstep if either is
    edited.

  Not done here, by design: pre-filling the display name field is
  intentionally skipped because invitees already chose one in
  InviteAccept, and the seed dev-fixture member is fine with its
  default. If the name-defaulting case becomes a real problem we
  can add it then.

  Tests: 303 passing (unchanged — the change is structural; the
  existing onboarding state machine tests still cover the
  setting). Locale parity passes. Lint, typecheck, build clean.

- **Form draft autosave for `PostForm` + `ProjectNew`.** Losing
  half a request because you tabbed away or accidentally
  navigated back is one of those small-but-painful failures —
  this PR plugs the gap.
  - **`drafts` IndexedDB table** (DB version 8). One row per
    form, keyed by a stable string (`"post-new"`,
    `"project-new"`); payload is a JSON string the form
    serializes / revives itself. The store is intentionally
    schema-agnostic so adding new draftable forms later is
    one-line work.
  - **Helpers** in `apps/web/src/db/drafts.ts` —
    `saveDraft / loadDraft / clearDraft / purgeExpiredDrafts`.
    Drafts older than 7 days (`DRAFT_MAX_AGE_MS`) are dropped
    lazily on read; corrupt JSON is treated as missing and
    deleted. 10 tests cover the lifecycle.
  - **`useDraftAutosave` hook** at
    `apps/web/src/lib/useDraftAutosave.ts` — debounced writes
    (600ms) whenever the form value changes. Caller passes an
    `enabled` flag so autosave is paused while the restore
    banner is pending (otherwise it'd overwrite the draft we
    just offered back) or while a submit is in flight.
  - **`DraftBanner` component** — visually understated
    canopy-50 banner above the form: "You started one of these
    {{when}}. Continue where you left off, or start fresh?"
    Two buttons: "Continue draft" (populates the form) and
    "Start fresh" (deletes the draft).
  - **Lifecycle**: on form mount, load any existing draft and
    stash it as `pendingDraft`. The banner renders until the
    user picks one of the two actions. Autosave is suppressed
    while `pendingDraft !== null` and while the form is at
    untouched defaults. Successful submit clears the draft.
  - **i18n**: new `drafts` namespace in `en` + `es` covers the
    banner copy. The relative timestamp ("3 hours ago") reuses
    `formatRelativeTime` so it speaks the rest of the app's
    voice.

  Not done here, by design: draft autosave for inline forms
  inside ProjectDetail (add-task, pause-note) or the Profile
  edit form. Those are short, in-context forms where losing
  state is less painful — the big wins are PostForm and
  ProjectNew because those are the ones with multi-line
  descriptions you don't want to retype.

  Tests: 303 web passing (293 → 303; +10 in `drafts.test.ts`
  covering round-trip / overwrite / key isolation / 7-day
  expiry / corrupt-JSON recovery / clear / purge). Locale parity
  passes. Lint, typecheck, build all clean.

- **Shared `EmptyState` component + empty-state pass.** The Board's
  inline empty-state pattern (icon + message) graduated into
  `apps/web/src/components/EmptyState.tsx`, which adds an optional
  call-to-action link and two layout variants: `"card"` (stands as
  its own card) and `"inset"` (slots inside an existing card or
  section). Applied to every list surface a first-time member is
  likely to land on while it's still empty:
  - **Board → Needs / Offers** — now shows a "Post a need" /
    "Post an offer" CTA in addition to the existing copy.
  - **Board → Projects** — same pattern, with a "Start a project"
    CTA.
  - **Profile → Roles earned / Transaction history / Issued
    invites** — promoted from bare paragraph text into the shared
    empty-state layout. Transaction history gets a "Go to the
    Board" CTA (the action that would generate history); roles
    and invites are passive / form-driven, so no CTA.
  - **Dashboard → Category breakdown / Breadth / Reciprocity** —
    same promotion. No CTAs (community-wide stats, not personal
    actions).
  - **ProjectDetail → Tasks** — same promotion. No CTA (the
    organizer's add-task form is already on the page).

  All existing i18n strings (the warm "be the first" copy) are
  preserved. No new copy was written — the change is purely
  visual: every empty surface now reads as deliberate rather
  than as a half-loaded page.

  Tests: 293 passing (unchanged — the surfaces touched have no
  unit tests; the swap is structural). Lint, typecheck, build
  all clean.
- **Pending-action feedback across confirm dialogs + project task
  buttons.** Between tap and resolution, several action buttons
  used to sit idle — no spinner, no disable, no label change —
  leaving a window where users could double-tap or wonder if the
  tap registered. This pass fills the gap.
  - **`usePendingAction` hook** at `apps/web/src/lib/usePendingAction.ts`.
    Wraps a Promise-returning action; exposes a `pending` flag and
    a `run` helper. Single source of truth, mirrors the per-page
    `run()` wrappers that several pages already invented locally —
    but only owns pending state, leaving error handling to the
    caller (toast, inline alert, whatever they already do).
    Unmount guard with a ref keeps setState-after-unmount tidy.
  - **`ConfirmDialog` auto-detects Promise return.** When
    `onConfirm` returns a thenable, the dialog disables both
    buttons + sets `aria-busy` on confirm + swaps the label to
    the new `confirmingLabel` prop. Zero extra wiring at the
    callsite — the existing `() => run(...)` pattern already
    returns a Promise. Applied to all five PostDetail dialogs
    (claim / confirm-complete / dispute / cancel / release).
  - **Project task buttons** in `ProjectDetail` (claim / mark
    done / release / confirm completion) and **project status
    buttons** (launch / pause / complete / resume) now disable
    themselves during the action via per-row / per-panel
    `usePendingAction`. Visible label flips to "Working…"
    (`common.working`, also wired into Spanish as "Trabajando…")
    so the in-flight state is also screen-reader audible via
    `aria-busy`.
  - **Profile → Revoke invite** tracks the in-flight token so
    only the specific row's revoke button disables (siblings
    stay tappable).

  Existing forms that already had local `submitting` / `saving` /
  `busy` / `issuing` / `vouching` state (PostForm, ProjectNew,
  ProjectDetail add-task form, Profile save, Profile security,
  Profile generate invite, InviteAccept redeem, MemberDetail
  vouch) are intentionally left alone — they work; refactoring
  them all to use the hook would balloon the diff for little
  user-visible gain. New surfaces should use the hook.

  Tests: 293 passing (unchanged — the change is structural and
  the hook is small enough that adding @testing-library/react
  just for one hook test wasn't worth a new dev dependency;
  end-to-end coverage comes from manual exercise of the surfaces).
  Lint, typecheck, build all clean.

- **Agent 22 PR 22.4 — color-contrast verification + sparkline
  per-day detail.** Closes two of the four remaining items in
  `docs/accessibility.md` §6 (Known gaps).
  - **WCAG contrast primitives** in `apps/web/src/lib/a11y/`:
    `contrast.ts` exports `parseHex`, `relativeLuminance`,
    `contrastRatio`, and `composite` (alpha-compositing for
    translucent backgrounds), plus the `AA_NORMAL` / `AA_LARGE`
    constants. Pure functions following WCAG 2.1 SC 1.4.3.
    15 unit tests cover known anchor pairings (black/white,
    same-color → 1:1, symmetry, alpha clamping).
  - **Programmatic palette audit** in `palette-contrast.test.ts`.
    Asserts every chip / badge color pairing in the codebase —
    light mode (15 pairings) and dark mode (15 pairings,
    translucent backgrounds composited over `moss-900`) —
    clears AA 4.5:1. New chip pairings must be mirrored into
    this test before merge.
  - **Three failures caught and fixed** by the new audit:
    - `ProjectMomentumChip` archived variant in light mode used
      `text-moss-500` on `bg-moss-50` (3.79:1) and in dark mode
      used `text-moss-400` on a `bg-moss-900/40` composite
      (4.28:1). Both now use the same shades as the paused /
      planning variants (`text-moss-600` light, `text-moss-300`
      dark) — clears AA in both modes.
    - `ToastContainer` success tone in dark mode used
      `dark:bg-canopy-600` on `dark:text-canopy-50` (3.15:1).
      Now uses `dark:bg-canopy-700` to match the light-mode
      background (~6.2:1).
  - **`ProjectSparkline` per-day detail.** The SVG curve already
    had an `aria-label` summary; it now also renders a
    visually-hidden `<table>` (Tailwind `sr-only`) with one
    row per day (`Day` / `Hours`). Screen reader users get
    both the summary and the day-by-day breakdown; sighted
    users see only the curve. Day labels use
    `Date.toLocaleDateString` with the current i18n language,
    so the table localizes the same way the rest of the app
    does. New i18n keys `projects.sparkline.tableCaption` /
    `tableHeaderDay` / `tableHeaderHours` added to `en` and `es`.

  `docs/accessibility.md` updated — color-contrast verification
  and sparkline per-day detail move from §6 (Known gaps) into
  §5 (Current state). A new known gap is added: a broader
  body-text contrast survey on white card backgrounds
  (especially `text-moss-500`) that the chip-only audit
  doesn't cover. Remaining gaps after 22.4 are that body-text
  survey, screen-reader testing, and the formal audit.

  Tests: 293 web passing (248 → 293; +45 from `contrast.test.ts`
  15 + `palette-contrast.test.ts` 30). Lint, typecheck, build
  all clean.
- **Agent 22 PR 22.3 — first batch of accessibility surface fixes.**
  Uses the primitives shipped in 22.2.
  - **`ConfirmDialog`** now wires `useFocusTrap` to the dialog
    card. Tab/Shift+Tab cycle within the dialog; the confirm
    button remains the autofocus target; focus restores on close.
    The backdrop became visual-only — click-outside-to-dismiss
    was removed because it had no keyboard equivalent (Esc and
    the visible Cancel button cover everyone). The two TODO
    `eslint-disable` comments from PR 22.2 are gone.
  - **`BottomNav`** gains arrow-key navigation. Tab still moves
    into and out of the nav as a unit; once inside,
    ArrowRight / ArrowLeft / Home / End move focus between items
    without re-traversing the document. The `<nav>`'s
    `aria-label` is now the localized "Primary navigation"
    string instead of one of the items' labels (small but real
    fix — screen readers were announcing the nav as "Board",
    same as the first link).
  - **`AttentionSection`** items list is now `aria-live="polite"`
    + `aria-relevant="additions text"`. New items get announced
    when they appear (a task you organize gets marked complete,
    an exchange is awaiting your confirmation) without
    interrupting whatever the screen reader is doing.

  `docs/accessibility.md` updated — the three items move from §6
  (Known gaps) into §5 (Current state). The remaining known gaps
  are the sparkline detail, color-contrast verification across
  chip variants, screen-reader testing, and the formal audit.

  Tests: 248 web passing (unchanged — the primitives' tests from
  22.2 already cover the focusable-elements math). Lint, typecheck,
  build all clean.
- **Agent 22 PR 22.2 — lint + reusable a11y patterns.** Toolchain
  + primitives, no surface fixes yet (those start in PR 22.3).
  Adds `eslint-plugin-jsx-a11y` scoped to a11y rules only (the
  project still relies on `tsc --noEmit` for type checking; no
  general code-style enforcement). Lint runs in CI as a required
  step alongside typecheck. First run found 6 real findings —
  two ConfirmDialog backdrop-click patterns and one InviteAccept
  `autoFocus`; the dialog ones are documented with TODOs
  referencing PR 22.3 (they'll be fixed alongside the focus
  trap), the InviteAccept `autoFocus` was removed outright (it
  pulled keyboard users past explanatory text). The LockScreen
  `autoFocus` stays — the entire surface is "enter your
  passphrase" and there's nothing else to do on the view.

  New reusable primitives in `apps/web/src/lib/a11y/`:
  - `getFocusableElements(container)` + `nextFocusable(...)` —
    pure DOM helpers, 13 tests covering button / link / input /
    select / textarea / disabled / hidden / tabindex variants
    and forward / backward / wrap cases.
  - `useFocusTrap(ref, isOpen)` hook — keyboard Tab/Shift+Tab
    containment within the open container, initial focus on
    first focusable element, focus restoration on close.
  - `useReducedMotion()` hook — wraps
    `prefers-reduced-motion: reduce`; updates live if the user
    toggles the OS preference while the app is open.

  New `SkipLink` component rendered at the top of `Layout`,
  visually hidden until focused (first Tab on any page).
  `<main id="main" tabIndex={-1}>` becomes the jump target.
  WCAG SC 2.4.1.

  Global `prefers-reduced-motion` media query in `index.css`
  collapses all transitions / animations to 0.01ms when the
  user has reduced-motion on. Floor for any future animation
  the codebase adds.

  Tests: 248 web passing (was 235; +13 for `focusable.test.ts`).
  Locale parity passes (en + es get one new key for the skip
  link).
- **`docs/accessibility.md` + Agent 22 (Accessibility & Inclusive
  Design) roadmap entry.** Names accessibility as a sustained
  cross-cutting workstream modelled on Agent 4 (Security &
  Opsec) rather than a one-shot pass. WCAG 2.1 AA as the
  standards floor. Disability-justice framing carried forward
  from `docs/political-education/README.md` (Mingus,
  Piepzna-Samarasinha; "interdependence as precondition, not a
  fallback"). Includes a current-state inventory, a list of
  known gaps (ConfirmDialog focus trap, BottomNav keyboard
  nav, AttentionSection aria-live, color contrast verification,
  reduced-motion, lint coverage, screen-reader testing, formal
  audit), planned PR sequence (22.2 lint + patterns,
  22.3 first surface fixes, 22.4+ continued), per-PR reviewer
  questions, and a review cadence. `CONTRIBUTING.md` now points
  contributors at the doc alongside the threat model. Docs-only;
  no code touched.
- **Inline action feedback (toast system).** Small global toast
  surface for ephemeral success messages. Single toast at a time
  (new replaces older — no queue, no pile-up), auto-dismisses
  after 4 seconds, tap or Esc to dismiss earlier, ARIA polite so
  screen readers hear it once without interruption. No badges, no
  counters, no telemetry — closes the loop on actions that
  previously navigated away silently. Wired into four sites:
  PostForm (needPosted / offerPosted), ProjectNew
  (projectCreated), and PostDetail's confirm-exchange action
  (exchangeConfirmedPending vs exchangeConfirmedComplete depending
  on whether the second party still needs to confirm). New
  `ToastProvider` + `useToast` hook + `ToastContainer` component;
  six new i18n keys × en + es; parity passes.
- **UX polish round 1 — humane errors + Profile invites empty state.**
  Smaller piece following the attention-surface work, same "make
  the app talk to humans" theme. New `lib/humanizeError.ts` maps
  thrown errors to user-facing strings: humane sentences pass
  through; `SCREAMING_CASE` codes, `snake_case` codes, and
  `http_<status>` fallbacks get replaced with a generic friendly
  fallback. Applied to every component that previously surfaced
  `(err as Error).message` directly — PostDetail, ProjectDetail,
  ProjectNew, PostForm, MemberDetail, LockScreen, Profile (four
  sites: profile edit, data export, security flows, invite issue).
  Members can no longer see a raw `http_422` or
  `fetch_not_available` on screen. 10 new tests covering the full
  classifier. Also added the missing empty state to Profile →
  Invites you've issued (previously showed nothing when no invites
  had been issued — now a brief welcoming explanation).
- **"Needs your attention" surface on the Board.** A small section
  at the top of the Board that surfaces things waiting on the
  current member's action — exchanges in `awaiting_confirmation`
  where they haven't signed yet, and project tasks an organizer
  needs to confirm. Pure utility: information you already need but
  currently have to dig for, with humane copy
  ("Bob marked 'Ride to clinic' complete — confirm it happened.")
  instead of technical status codes. Renders null when nothing is
  waiting — no "you have 0 things to do" framing. No badges, no
  push, no time-on-app metric. New pure `lib/attention.ts` with
  10 tests covering the conditions for each kind of item plus
  ordering and unknown-counterparty fallback. UI strings i18n'd
  in en + es; locale parity passes.
- **Posts federation (Agent 3 task 2, continued).** Posts now sign,
  store, and federate the same way exchanges and vouches do. The
  longest-standing missing piece of Phase 3 federation.

  Type changes:
  - `Post` in `@understoria/shared` gains two required fields:
    `nodeId` (which node originated this post) and `signature` (Ed25519
    signature over the immutable subset). Lifecycle fields (`status`,
    `claimedBy`, `confirmedBy`) deliberately stay outside the signed
    payload — they're local mutations, not part of the post's
    federation identity.
  - New `PostPayload` interface for the canonical signed subset.
  - New `canonicalPostPayload` and `verifyPost` helpers in
    `@understoria/shared/crypto`, parallel to the exchange and vouch
    pair.

  PWA:
  - Dexie schema v7 with an `upgrade()` callback that backfills
    `nodeId` from the local `nodeId` setting and `signature = ""` on
    every existing post. Empty signature == legacy/not-federable,
    treated explicitly throughout.
  - `createPost` now signs the post at creation time. Takes a new
    `nodeId` parameter; pre-loads the poster's secret key outside the
    write transaction (so a locked session throws cleanly rather than
    producing an unsigned post). Enqueues a post outbox row in the
    same transaction as the post itself.
  - `OutboxRow.kind` extended to `"exchange" | "vouch" | "post"`.
    `enqueuePostOutbox` strips the lifecycle fields before
    serializing — the wire shape is exactly what the canonical
    payload signs.
  - `submitPostToNode` mirrors `submitExchangeToNode` /
    `submitVouchToNode` via the shared `postSignedRecord` helper.
  - Seed posts are now real signed records (the demo flow exposes
    each demo member's secret key during seeding so the canonical
    payload + signature round-trips through `verifyPost()` correctly).

  Server:
  - Schema v4: new `posts` table (immutable wire shape only — no
    lifecycle fields). `peer_pull_state` grows a
    `last_post_created_at` cursor.
  - `POST /posts` verifies the signature via `verifyPost` and stores
    if novel; `GET /posts?since=&limit=` returns the most recent
    posts newer than the cursor.
  - `pullPostsFromPeer` mirrors the exchange / vouch puller; the
    worker now pulls all three kinds per peer per tick in parallel.

  Smoke-tested live two-server: signed a post in Node, POSTed it to
  the peer at :8921, watched the puller at :8922 fetch it within
  one interval. `/peers` reflected the per-kind cursors correctly.

  **Not in this slice** (separate PRs):
  - PWA-side display of federated posts on the Board (cross-node
    visibility requires the PWA to pull from its configured node,
    which is its own architectural shift).
  - Cross-community claiming of federated posts — federated posts
    are read-only on peer nodes by design. A peer member sees the
    need/offer for awareness and reaches out via whatever channel
    the communities already share.
- **Manual vouching UI + outbox push.** Closes a real gap: the
- **Manual vouching UI + outbox push.** Closes a real gap: the
  `db.vouches` table was read by Profile for trust computation but
  had no production write path — `createVouch` was exported but
  only called by tests, so members could never reach the "trusted"
  state past their inviter's implicit vouch. This release adds:
  - A `/member/:publicKey` page (`pages/MemberDetail.tsx`) showing
    a member's display name, key fingerprint, trust chip, profile
    fields, and exchange count. Reachable from PostDetail (the
    poster name is now a link).
  - A "Vouch for this member" button on that page, gated to: not
    self, current member is trusted, target is not already trusted,
    no prior vouch from the current member exists.
  - `db/vouches.ts` with `addManualVouch()` — signs, persists, and
    enqueues to the outbox in a single transaction. Validates
    `VouchValidationError("self_vouch" | "duplicate" | "signing_failed")`.
  - Outbox extended: `OutboxRow.kind` is now `"exchange" | "vouch"`.
    `enqueueVouchOutbox()` mirrors the exchange helper.
    `flushOutboxOnce` dispatches on `kind` to either
    `submitExchangeToNode` or the new `submitVouchToNode`.
  - `lib/nodeSubmit.ts` refactor: the shared POST + record-outcome
    logic extracted into `postSignedRecord(path, record, ...)`;
    `submitExchangeToNode` and `submitVouchToNode` are thin
    wrappers. Behaviour for exchanges unchanged.
  - 5 new tests in `db/vouches.test.ts` covering persistence,
    self-vouch rejection, duplicate rejection, outbox enqueue when
    a community node is configured, and the no-enqueue path when
    it isn't. Full web suite: 215 (was 210).

## [0.2.0] — 2026-05-22

Second development release. Pilot-ready surface: in-app onboarding,
configurable safeguards, federation pull loop, project momentum,
relational dashboard depth, plus a roadmap revision that absorbs
the Beyond-Ostrom proposal. Reproduced end-to-end on a fresh Debian
13 VM clone of `main`.

### Added
- **Agent 3 task 2 (continued) — Vouches federation.** Extends the
  federation pull loop to also replicate signed web-of-trust vouches
  across peers. New `POST /vouches` and `GET /vouches?since=` server
  endpoints mirror the exchange pattern; the pull worker now runs
  both kinds per peer in parallel. Server schema v3 adds a `vouches`
  table (mirrors the exchanges-table indexes) and a
  `last_vouch_created_at` column on `peer_pull_state`. The
  `SignedVouch` type and its `canonicalVouchPayload` / `verifyVouch`
  helpers moved from `apps/web/src/lib/vouch.ts` to
  `@understoria/shared` so the server can verify the same way the
  PWA does. `GET /peers` response shape gains the `lastVouchCreatedAt`
  cursor alongside the existing exchange cursor — both pulled records
  resume from their own high-water marks on restart.
- Per-peer success updates no longer clear `last_error`. When the
  two pulls (exchange + vouch) run in parallel, the previous
  behaviour raced — a vouch failure could be silently wiped by a
  concurrent exchange success. Operators can read `lastSuccessAt`
  vs. `lastPulledAt` to tell whether the most recent attempt
  succeeded; per-kind error columns are a future refinement.

### Smoke-tested

Live, two-server end-to-end: POSTed a signed vouch to peer at
:8901, watched the puller at :8902 fetch it within one interval,
`/vouches` returned the row, `/peers` reflected the pull.

- **Agent 10 Phase 3 — Project momentum + four project achievements.**
  Closes a workstream that's been pending since Agent 10 Phase 2
  landed. New pure `lib/projectMomentum.ts` computes a 14-day daily
  histogram of project contributions plus a coarse momentum state
  (`humming` / `active` / `stalled` / `completed` / `paused` /
  `planning` / `archived`). Per-project surface on ProjectDetail:
  inline SVG sparkline below the progress bar and a small momentum
  chip beside the status. No external charting library; works
  offline. Four new achievements — **Groundbreaker** (launched a
  project that drew a contributor), **Crew Member** (3+ confirmed
  task completions across community projects), **Momentum Maker**
  (organized a project that crossed 50% of target hours), and
  **Keystone** (organized a project that completed). Achievements
  fire from inside `confirmProjectTaskCompletion` and
  `completeProject` — the project flow now also runs the standard
  achievement evaluator for both parties, so a helper who only ever
  does project tasks finally gets credit for First Exchange,
  Connector, etc. (previously they never would have, since project
  exchanges bypassed `confirmExchange`). UI strings i18n'd in en +
  es; parity test passes. Spanish is bootstrap-quality; joins the
  native-speaker-review queue.
- **Agent 3 task 2 — Federation pull loop.** Server-to-server
  replication of the signed exchange ledger. Nodes can now be
  configured (via comma-separated `PEER_NODE_URLS`) to periodically
  pull `GET /exchanges?since=` from peers. Each pulled row goes
  through the same `verifyExchange` check as the POST endpoint
  (a peer cannot inject anything unsigned) and is deduped by id.
  Pulled rows retain their original `nodeId` — federation is
  replication of a signed ledger, not re-attribution. New
  per-peer state table (server schema v2) tracks `lastPulledAt`,
  `lastSuccessAt`, `lastCompletedAt`, `lastError`, and
  `lastPulledCount` for observability via the new public
  `GET /peers` endpoint (peer URLs are inherently public; no
  member counts or operational config). The pull worker is a thin
  shell over `pullFromPeer()` — the pure function takes an
  injectable `fetcher`, making the whole flow testable without
  network. Default pull interval 5 minutes, configurable via
  `PEER_PULL_INTERVAL_MS`. Agent 15 (federation governance) will
  replace env-var peer config with signed federation agreements
  per the roadmap.
- **Agent 11 — Node configuration & local rules.** First proper
  stage of the Ostrom track. The three safeguard thresholds that
  used to live as constants in `apps/web/src/lib/safeguards.ts`
  (`dailyHelperLimit`, `shortExchangeHours`, `reciprocalPairThreshold`)
  are now read from a per-node `NodeConfig` persisted in a new
  Dexie table (schema v6, single row keyed by `nodeId`). Defaults
  match the pre-Agent-11 PWA exactly, so behaviour is unchanged
  for a community that never opens settings. New "Community
  settings" section on Profile with input + validation (range
  checks live in `db/nodeConfig.ts`, not the component, so the
  same rules apply to any future caller — governance proposals,
  peer sync) and a "Reset to defaults" action. The UI carries an
  explicit yellow note that the affordance is a bootstrap measure
  until Agent 13 (in-app governance) routes edits through a
  proposal. `assertWithinDailyLimit()` and `evaluateSafeguards()`
  now take an optional `NodeConfig` parameter and fall back to
  `DEFAULT_NODE_CONFIG` — every existing call site continues to
  work; the `confirmExchange` flow passes the live config through.
  Server-side: new `GET /config` endpoint returns an
  operator/hosting transparency block (`name`, `fundingNote`,
  `contact`) when any of the new `OPERATOR_*` env vars are set,
  or `{}` otherwise. The folded-in transparency block from the
  original "Beyond Ostrom" Agent 21; deliberately a small surface
  (no member counts, no node id, no operational config).
- **Agent 18a — Breadth & reciprocity Dashboard.** Two new sections
  on the Dashboard, both rendered without external charting
  libraries: a *breadth bar* listing members by how many distinct
  people they've helped (rewards distribution, not volume — never
  shows hours per person), and a *reciprocity pulse* showing what
  fraction of community connections flow both ways. Both sections
  include empty states and a footnote making clear that this is a
  window into the shape of help, not a score. New "Weaver"
  achievement awarded when a member's exchanges span 3+ distinct
  location zones (the counterparty's `locationZone`); computed at
  exchange-confirmation time. New pure `lib/flow.ts` module
  separated from `lib/stats.ts` because it answers a different
  question (relational distribution vs. aggregate totals). All UI
  strings i18n'd in en + es; parity test passes. The community web
  graph (original Agent 18b) is *not* shipped — it remains gated
  on a threat-model §7 entry and a governance opt-in per the
  roadmap.
- **Agent 16 — Onboarding & political literacy.** Four-screen
  welcome flow at `/welcome` shown once on first launch, marked
  via `SETTING_KEYS.onboarded` (which existed in the schema since
  v0.1.0 but was never read or written). Screens cover: timebank
  semantics, seed credit, cryptographic identity, community
  authority. New "Learn" section in Profile with three actions:
  revisit the welcome flow, expand an in-app condensed member
  guide, expand the 13 study-group prompts mirrored from
  `docs/political-education/README.md` with copy-for-meeting
  support. Existing pilot devices (any device with members already
  in IndexedDB) are silently backfilled as onboarded so they don't
  see a welcome flow for software they already know. `/invite` is
  allow-listed pre-onboarding so invited members can still land
  on the redemption screen first. UI strings i18n'd in English and
  Spanish (8 new keys × 2 locales = 16; parity test passes). The
  member guide and study prompts live as TS content files rather
  than i18n locales per the roadmap's i18n-debt failure mode:
  long-form prose translation is a separate workstream from UI
  string translation.
- This `CHANGELOG.md`, the `DCO` file (Developer Certificate of
  Origin v1.1), `SECURITY.md` (vulnerability disclosure policy),
  GitHub issue and pull-request templates, a CI workflow, and a
  commit-msg hook template. AGPL-3.0-or-later header on every
  source file.
- `docs/roadmap.md` — canonical agent-by-agent work plan, including
  the new **Phase 5 (Commons governance)** built on Elinor Ostrom's
  design principles. Adds Agents 11 – 15 (node configuration,
  moderation & sanctions, in-app proposals, dispute resolution,
  federation governance) with a staged ordering: Agent 11 first
  (grounded in issue #6), then finish Agent 3, then 13 + 14 as one
  surface, then 12 once telemetry exists, then 15 once peers
  federate in practice.
- Roadmap revision integrating a "Beyond Ostrom" proposal (Kerala,
  Zapatista, potlatch, Mondragon, Haudenosaunee, Cooperation Jackson
  traditions). Result: two new standalone agents (**Agent 16 —
  onboarding & political literacy**, **Agent 18a — breadth +
  reciprocity Dashboard**); reversibility tiers + impact reflection
  + operator transparency folded into Agents 13 and 11 respectively;
  co-organizer support routed through Agent 10 Phase 3; organizer
  recall + pool allocations routed through the Agent 13 Decisions
  surface; community web graph (18b), balance cap + community pool
  (19), and federation mutual aid fund (21) deferred behind explicit
  gates documented in the roadmap.

### Testing

- 210 web + 31 server = **241 vitest tests passing** at v0.2.0
  (up from 162 at v0.1.0)
- All three high-severity `npm audit` findings cleared via
  non-breaking `npm audit fix` (lockfile-only updates); only 5
  moderate dev-tooling advisories remain
- Reproduced end-to-end on a fresh Debian 13 VM clone of `main`:
  install → PWA → node → onboarding flow → community settings →
  dashboard breadth/reciprocity → project momentum surface

### Known gaps (tracked work)

See `docs/threat-model.md` §7 and `docs/roadmap.md` for the full
picture. Highlights:

- E2E messaging (Agent 2 task 5)
- Posts / vouches / invites server endpoints (Phase 3 server-side)
- PWA-side surfacing of cross-node exchanges (Phase 3 PWA-side)
- Phase 5 agents 12–15 (moderation, governance, disputes,
  federation governance), per the staged ordering in the roadmap
- Agent 7 (organizing integration) not started
- 5 moderate `npm audit` advisories in dev tooling (esbuild
  dev-server, brace-expansion, ws, etc.), all gated on a future
  Vite 8 upgrade

### CI / chore

- GitHub Actions: `actions/checkout` and `actions/setup-node`
  bumped to v5 for Node 24 compatibility ahead of the
  2026-09-16 deprecation of Node 20 runners.

## [0.1.0] — 2026-05-16

First development release. Two deployable artifacts: a React PWA
and an optional Fastify community node, both AGPL-3.0-or-later.

### Added

**Core PWA (Agent 1)**
- Community Board with Needs / Offers tabs, category and urgency
  filters, search, floating post buttons
- Post → claim → dual-confirm → credit exchange flow
- Time-credit system with 5-hour seed balance per member; balances
  derived from event-sourced exchange log
- Community Dashboard with total hours, active members, solidarity
  streak, category breakdown bars, milestone progress
- Six achievements as community roles (First Exchange, Connector,
  Regular, Bridge Builder, Seed Planter, Listener)
- Profile page with balance, editable skills / availability / area,
  exchange history, signed records, data export, dev member
  switcher
- PWA manifest + service worker via vite-plugin-pwa, mobile-first
  layout, 44 px touch targets, dark mode

**Crypto & Identity (Agent 2)**
- Ed25519 keypair identity via tweetnacl — no email / phone /
  external IdP
- Signed exchange transactions with canonical JSON payload,
  independently verifiable
- Cryptographic single-use invite tokens with 14-day expiry and
  issuer revocation
- Web-of-trust vouching: two distinct voucher keys promotes
  `pending_trust` → `trusted`
- Passphrase-wrapped private keys (PBKDF2-HMAC-SHA256 600k
  iterations + NaCl secretbox) with explicit "no recovery"
  semantics

**Federation & Infrastructure (Agent 3 — partial)**
- Fastify community node (`apps/server/`) with `GET /health`,
  `POST /exchanges` (verifies signatures, persists), and
  `GET /exchanges?since=&limit=` for federation pull
- `better-sqlite3` storage with versioned migrations, WAL mode,
  indexes for federation queries
- Helmet (CSP, HSTS, X-Frame-Options, Referrer-Policy), Fastify
  rate-limit keyed by an FNV-1a bucket of the IP (no IPs in logs)
- Multi-stage Dockerfile + `docker-compose.yml`, runs as non-root,
  drops every Linux capability, read-only filesystem, tini as PID 1

**Security & Opsec (Agent 4 — partial)**
- Threat model (`docs/threat-model.md`) with adversaries, mitigations,
  tracked gaps, per-PR review questions
- Member-facing opsec guide (`docs/opsec-guide.md`)
- Panic button: soft purge (anonymize while preserving the signed
  ledger and keypair) and hard purge (wipe everything, rotate node
  identity)
- Anti-gaming safeguards: configurable daily exchange limit and
  advisory flags for short / reciprocal patterns

**Governance & Cooperative Design (Agent 5 — partial)**
- `CODE_OF_CONDUCT.md` with restorative-justice conflict resolution
- `GOVERNANCE.md` (modified consensus, three-month role rotation,
  moderation with appeals)
- `TRADEMARK.md` (AGPL-the-code, protect-the-name)

**Documentation (Agent 9 — partial)**
- `docs/member-guide.md`, `docs/organizer-guide.md`,
  `docs/operator-guide.md` (incl. Caddy reverse-proxy config, Docker
  + Raspberry Pi notes, env var reference)
- `docs/developer-guide.md` (architecture, design patterns, module
  map)
- `docs/political-education/README.md` (reading list, 10 discussion
  prompts, 90-minute workshop outline)
- `docs/quickstart.md` (Debian 13 VM walkthrough)
- `CONTRIBUTING.md`

**Internationalization (Agent 9 task 6)**
- `i18next` + `react-i18next` + browser language detector
- Full English source and bootstrap-quality Spanish translation
  marked for native-speaker review
- Parity test asserts identical key sets across locales
- Language switcher in Profile

**PWA → community node mirror**
- Per-device "Community node" config in Profile with URL + toggle
- Finalized exchanges enqueued atomically with the exchange itself
  into a durable outbox, then delivered by a retry worker with
  exponential backoff (4 s × 2^attempts, capped at 5 min)
- Permanent failures (`422`, `400`) poisoned; transient
  (5xx / 408 / 429 / network) retried
- "Pending" and "Poisoned" count chips, "Retry now" button in
  Profile

### Testing

- 148 web + 14 server = **162 vitest tests passing** at v0.1.0
- Verified end-to-end on a fresh Debian 13 VM in GNOME Boxes:
  install → PWA → node → mirror → cross-host POST → signature
  round-trip

### Known gaps (tracked work)

See `docs/threat-model.md` §7 and the in-flight roadmap in
`README.md`. Highlights:

- E2E messaging (Agent 2 task 5)
- Cross-node federation pull loop (Agent 3 task 2)
- Posts / vouches / invites endpoints on the server
- Native-speaker review of Spanish strings
- Agent 7 (Organizing Integration) not started
- Agent 10 (Community Projects & Momentum) not started

---

*Each commit on `main` is signed off under the Developer
Certificate of Origin. See `DCO` at the repo root and the DCO
section in `CONTRIBUTING.md`.*
