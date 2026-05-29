# Changelog

All notable changes to Understoria will be documented in this
file. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project adheres roughly to
[Semantic Versioning](https://semver.org/). Pre-1.0 releases may
include breaking changes.

## [Unreleased]

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
