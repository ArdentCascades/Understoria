/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export type PostType = "NEED" | "OFFER";

export type PostStatus =
  | "open"
  | "claimed"
  | "awaiting_confirmation"
  | "completed"
  | "cancelled"
  | "disputed";

export type Urgency = "low" | "medium" | "high";

export const CATEGORIES = [
  "transport",
  "food",
  "childcare",
  "skilled_labor",
  "emotional_support",
  "education",
  "housing",
  "tech",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type AvailabilityChip =
  | "weekday_days"
  | "weekday_evenings"
  | "weekend_days"
  | "weekend_evenings"
  | "ask_me";

export interface Member {
  publicKey: string;
  displayName: string;
  skills: string[];
  availability: string;
  availabilityChips: AvailabilityChip[];
  seedBalance: number;
  vouchedBy: string[];
  createdAt: number;
  nodeId: string;
  locationZone: string;
}

export interface Post {
  id: string;
  type: PostType;
  category: Category;
  title: string;
  description: string;
  estimatedHours: number;
  urgency: Urgency;
  postedBy: string;
  claimedBy: string | null;
  status: PostStatus;
  createdAt: number;
  expiresAt: number | null;
  locationZone: string;
  /** Public keys of members who have confirmed completion. */
  confirmedBy: string[];
  /** Which node this post originated from. Set by createPost at
   *  creation time; preserved across federation so peer nodes see
   *  which community a post came from. Posts created before Agent 3
   *  posts federation (schema < v7) get backfilled to the local node id. */
  nodeId: string;
  /** Ed25519 signature over the canonical immutable payload (see
   *  `canonicalPostPayload` in `@understoria/shared/crypto`). Empty
   *  string for legacy posts created before this field existed; the
   *  federation push and the server-side verify both treat empty as
   *  "not federable" rather than as an invalid signature. */
  signature: string;
}

/**
 * The immutable, signed subset of a Post. This is what the poster
 * signs at creation time and what crosses the federation boundary —
 * status / claimedBy / confirmedBy are mutable lifecycle fields that
 * stay local to each node (federating lifecycle would require an
 * event-sourced model; out of scope for this slice).
 */
export interface PostPayload {
  id: string;
  type: PostType;
  category: Category;
  title: string;
  description: string;
  estimatedHours: number;
  urgency: Urgency;
  postedBy: string;
  createdAt: number;
  expiresAt: number | null;
  locationZone: string;
  nodeId: string;
}

export interface Exchange {
  id: string;
  postId: string;
  helperKey: string;
  helpedKey: string;
  hoursExchanged: number;
  /** Ed25519 detached signatures over the canonical payload. */
  helperSignature: string;
  helpedSignature: string;
  completedAt: number;
  category: Category;
  nodeId: string;
  /**
   * Set by the anti-gaming safeguards (Agent 6 task 6) when an exchange
   * matches a pattern worth a community conversation — very short
   * duration, or a tight reciprocal loop between the same two members.
   * This is advisory; the community, not the code, decides what to do
   * about it.
   */
  flaggedForReview?: boolean;
  flagReason?: FlagReason;
  /**
   * True iff the helped-side signature was produced by the node's
   * system key after `autoConfirmHours` elapsed without a member
   * confirmation. See `docs/auto-confirm-key.md` §4. The pair
   * (`autoConfirmed`, `autoConfirmedBy`) is the verifier-
   * distinguishability surface any peer can read without knowing
   * this node's keys ahead of time. Absent / false on every member-
   * confirmed row.
   */
  autoConfirmed?: boolean;
  /**
   * Identity of the helped-side signer when `autoConfirmed === true`.
   * Format: `"system:<nodeId>"`. Deliberately NOT named `confirmedBy` —
   * that name is already taken on Post (the array of member pubkeys
   * who confirmed) and reusing it would muddy the semantics. Present
   * only on rows where `autoConfirmed === true`.
   */
  autoConfirmedBy?: string;
  /**
   * Millisecond epoch when the system key signed the helped-side
   * signature. Distinct from `completedAt` (which is the canonical
   * payload's timestamp — what the helper signed). A peer auditor can
   * detect operator early-fire (§5 of the design note) by comparing
   * this to the underlying post / task's `awaiting_confirmation`
   * transition time, which is also federated and signed.
   */
  autoConfirmedAt?: number;
}

/**
 * Per-node configuration — replaces the hardcoded safeguard constants
 * in the PWA so a community can tune them to local conditions
 * (Ostrom principle 2: rules fit local conditions).
 *
 * Defaults match what the PWA shipped with before this type existed,
 * so a community that never touches their config gets the exact same
 * behaviour as before.
 */
export interface NodeConfig {
  /** Maximum exchanges a single helper can complete in a 24-hour window.
   *  Hard stop — exceeding this is the one genuinely punitive rule. */
  dailyHelperLimit: number;
  /** Exchanges shorter than this (in hours) get an advisory flag for
   *  community review. Not blocked, not punished — just surfaced. */
  shortExchangeHours: number;
  /** When the same (helper, helped) pair completes this many exchanges
   *  in 30 days, the latest one gets a reciprocal-pattern advisory flag. */
  reciprocalPairThreshold: number;
  /** Days after claim before the claimer gets a private "still on
   *  it?" nudge in their AttentionSection. Lets a claimer release
   *  without the community ever seeing they were behind. Default
   *  7 — a week feels generous without becoming silent indefinitely. */
  taskCheckInDays: number;
  /** Days after claim before a task can be community-visibly
   *  marked "could use more hands." Framed at the task, not the
   *  person. Default 14 — long enough to follow the private
   *  nudge by a similar window. */
  taskNeedsHelpDays: number;
  /** Grace window (in days) after the claimer acknowledges the
   *  private nudge during which the public "could use more
   *  hands" chip stays suppressed, even if `taskNeedsHelpDays`
   *  is past. Lets a claimer who is engaging — even just to say
   *  "yes, still on it" — keep the task out of community
   *  signalling. The chip only fires when the claimer has gone
   *  silent for this long after the private window has lapsed.
   *  Default 2 — short, so prolonged silence still surfaces, but
   *  long enough that one ack buys real quiet. Solidarity-not-
   *  shame: a member who is responsive shouldn't ever appear in
   *  a community-visible signal. */
  taskCheckInGraceDays: number;
  /** Agent 13 — minimum days a proposal must stay open before it
   *  can auto-pass on consensus. Prevents rush votes; gives time
   *  for the community to weigh in. Default 3 — matches the
   *  "modified consensus over a few days" cadence in `GOVERNANCE.md`. */
  proposalDeliberationDays: number;
  /** Agent 13 — minimum distinct affirm votes required for a
   *  proposal to auto-pass on consensus. Even with the deliberation
   *  window satisfied, a proposal that only one person has affirmed
   *  shouldn't pass silently. Default 2 — same threshold the
   *  vouch system uses for "trusted" status. */
  proposalMinAffirms: number;
  /**
   * Plan 11 — days a project's primary organizer must be without any
   * logged activity on that project before the community may file an
   * adoption proposal to install a new primary. Stewardship cadence,
   * not emergency response: default 60 (≈4× `taskNeedsHelpDays`).
   * Measured only from `projectActivity` rows (reads are deliberately
   * untracked), so it can under-count a silently-active primary —
   * mitigated by the notice item and the always-available cancel.
   */
  adoptionQuietDays: number;
  /**
   * Auto-confirm window for `awaiting_confirmation` posts and project
   * tasks. After this many hours without a member confirmation, the
   * node's system key signs the helped-side signature so credit can
   * flow. See `docs/auto-confirm-key.md`.
   *
   * Special value: `0` disables the sweep entirely. The system key
   * signs nothing when this is 0 — useful for a community that wants
   * to launch with auto-confirm off and turn it on via a proposal
   * later. Default `168` (7 days) matches the design note's pilot
   * recommendation; communities can lower or zero it.
   */
  autoConfirmHours: number;
  /** Community-defined milestones layered ON TOP of the baseline
   *  hardcoded set in `lib/milestones.ts`. Lets a community celebrate
   *  thresholds meaningful to *them* (e.g. "100 union meetings",
   *  "1,000 fridge visits") without forking the baseline. Dedup against
   *  the baseline happens at read time — baseline wins on
   *  `(type, threshold)` collision so a community can't accidentally
   *  shadow a shipped milestone. */
  customMilestones: Milestone[];
  /**
   * When true, the WelcomePage's self-onboarding flow is gated:
   * - If the local members table is empty (fresh node), the first
   *   visitor may complete onboarding without an invite — this is
   *   the operator-bootstrap exception.
   * - Once at least one member exists, the WelcomePage shows the
   *   "invite-only" landing instead of the profileSetup step, and
   *   the only path to onboard is /invite#<signed-token>.
   *
   * Defaults to false (legacy behavior — open self-onboarding) for
   * backward compatibility on existing deployments. Operators
   * enable it from Settings → Community.
   */
  inviteOnly?: boolean;
}

export const DEFAULT_NODE_CONFIG: NodeConfig = {
  dailyHelperLimit: 3,
  shortExchangeHours: 0.25,
  reciprocalPairThreshold: 3,
  taskCheckInDays: 7,
  taskNeedsHelpDays: 14,
  taskCheckInGraceDays: 2,
  proposalDeliberationDays: 3,
  proposalMinAffirms: 2,
  adoptionQuietDays: 60,
  autoConfirmHours: 168,
  customMilestones: [],
  inviteOnly: false,
};

/**
 * Public-facing operator / hosting info for a community node. Set by the
 * operator at deploy time via environment variables; served from
 * `GET /config` so members and peer nodes can see who runs the node and
 * how it's sustained. Folded into Agent 11 from the original "Beyond
 * Ostrom" Agent 21 (infrastructure transparency).
 *
 * Defaults to `null` — a node operator who hasn't configured any of this
 * is treated as "unspecified," not as a default.
 */
export interface NodeOperatorInfo {
  /** Display name(s) of the operator(s). */
  name: string;
  /** Free-form note about hosting — donated, dues-funded, grant, etc. */
  fundingNote: string;
  /** Operator's preferred contact channel — Matrix room, email, URL. */
  contact: string;
}

export type FlagReason =
  | "short_duration"
  | "reciprocal_pattern"
  | "daily_limit_warning";

export type AchievementType =
  | "first_exchange"
  | "connector_5"
  | "regular_4weeks"
  | "bridge_builder"
  | "seed_planter"
  | "listener"
  | "weaver"
  | "groundbreaker"
  | "crew_member"
  | "momentum_maker"
  | "keystone";

export interface Achievement {
  id: string;
  memberKey: string;
  achievementType: AchievementType;
  earnedAt: number;
  metadata: Record<string, unknown>;
}

/**
 * Web-of-trust vouch — a signed statement: "I, voucher, attest that
 * vouchee is a member of our community." Stored locally on the
 * redeeming node and federated to peers so any node can compute
 * trust status without a central authority.
 *
 * The canonical payload + signature pair lives in `crypto.ts`; this
 * type is the wire shape that crosses the federation boundary.
 */
export interface VouchPayload {
  voucherKey: string;
  voucheeKey: string;
  createdAt: number;
  /** `invite` when auto-generated by invite redemption; `manual`
   *  when a trusted member vouched directly. */
  kind: "invite" | "manual";
}

export interface SignedVouch extends VouchPayload {
  id: string;
  signature: string;
}

/**
 * Cryptographic invite — a signed, single-use token shared out-of-band
 * (Signal, paper, in-person) that lets a new member join with the
 * inviter's vouch. Federated to the community node so peer nodes can
 * discover and verify cross-node invites.
 */
export interface InvitePayload {
  token: string;
  inviterKey: string;
  inviterName: string;
  nodeId: string;
  createdAt: number;
  expiresAt: number;
}

export interface SignedInvite extends InvitePayload {
  signature: string;
}

/**
 * Redemption receipt — Phase 1 of `docs/invite-redemption.md` (§6).
 * Signed by the NEW member and embedding the inviter's original
 * `SignedInvite` verbatim, so one record carries two independently
 * verifiable attestations: the inviter's intent to admit a
 * token-holder, and the token-holder's proof of key possession plus
 * consent to appear on the roster under a chosen name.
 *
 * Identity / dedup key is `invite.token` — an invite is single-use
 * and the receipt inherits that. The server enforces first-writer-
 * wins on the token (`POST /redemptions` → 409 for a different
 * `redeemedBy`), which is the server-side single-use enforcement the
 * local-only design never had.
 *
 * The receipt is deliberately NOT a `SignedVouch`: a vouch is signed
 * by the voucher, and the inviter is not present at redemption. The
 * redeemed-invite row this receipt materializes on every device is
 * what `trustStatusWithInvites` already consumes as the implicit
 * first vouch (design note §9).
 *
 * `displayName` rides in the receipt by operator ruling (§15.1):
 * the member types it on the accept screen knowing it is her
 * community-facing name; a roster of bare keys would fail the
 * incident's actual complaint.
 *
 * FIELD ORDER IS THE WIRE CONTRACT — the canonical serializer emits
 * the properties in declared order and the signature covers exactly
 * those bytes. Do NOT alphabetize. Do NOT reorder.
 */
export interface RedemptionPayload {
  /** Embedded verbatim: token, inviterKey, inviterName, nodeId,
   *  createdAt, expiresAt, signature. Verifies independently against
   *  `invite.inviterKey` via `verifyInvite`. */
  invite: SignedInvite;
  /** New member's Ed25519 public key — the outer signer. */
  redeemedBy: string;
  /** ≤ 60 chars (matches the InviteAccept input's maxLength). */
  displayName: string;
  /** Epoch ms, redeeming device's clock. Client-claimed — see the
   *  back-dating analysis in `docs/invite-redemption.md` §11; the
   *  server-side cursor is its own `receivedAt`, never this. */
  redeemedAt: number;
}

export interface RedemptionReceipt extends RedemptionPayload {
  /** Ed25519 detached signature by `redeemedBy` over
   *  `canonicalRedemptionPayload(payload)`. */
  signature: string;
}

/**
 * Lightweight claim notification — pushed to the outbox when a member
 * claims a cross-node post so the poster's node learns about it.
 * Unsigned for v1 (the exchange itself is the authoritative signed
 * record; this is just a heads-up).
 */
export interface ClaimRecord {
  postId: string;
  claimerKey: string;
  claimedAt: number;
  nodeId: string;
}

export interface CommunityStats {
  totalHoursExchanged: number;
  totalExchanges: number;
  activeMembersThisWeek: number;
  activeMembersThisMonth: number;
  solidarityStreakDays: number;
  needsFulfilledThisWeek: number;
  /** Needs posted in the last 7 days that have a claimer.
   *  Captures community responsiveness — "of what came up this
   *  week, someone has stepped up for X." We use the post's
   *  `createdAt` as the time window because we don't persist a
   *  separate "claimed at" timestamp. */
  needsAnsweredThisWeek: number;
  /** Needs posted in the last 7 days, period. The pair
   *  (answered, posted) lets the UI render a ratio without the
   *  caller recomputing. */
  needsPostedThisWeek: number;
  categoryBreakdown: Partial<Record<Category, number>>;
  milestonesReached: Milestone[];
}

export type MilestoneType = "hours" | "exchanges" | "members";

export interface Milestone {
  type: MilestoneType;
  threshold: number;
  label: string;
}

// ---------------------------------------------------------------------------
// Agent 10 — Community Projects & Momentum
// ---------------------------------------------------------------------------

export const PROJECT_CATEGORIES = [
  ...CATEGORIES,
  "infrastructure",
  "organizing",
  "mutual_aid_drive",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export type ProjectStatus =
  | "planning"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  organizerKey: string;
  coOrganizerKeys: string[];
  status: ProjectStatus;
  /** Total estimated hours to complete the project. */
  targetHours: number;
  /** Sum of completed task hours — materialized; recomputed on every
   *  task completion / unclaim cycle. */
  contributedHours: number;
  /** Optional ms-epoch deadline. */
  deadline: number | null;
  createdAt: number;
  /** Set when status transitions to "completed". */
  completedAt: number | null;
  /** Note from the organizer when status transitions to "paused". */
  pauseNote: string | null;
  /**
   * ms-epoch when the project most recently transitioned to "paused".
   * `null` outside the paused state; set by `pauseProject`, cleared by
   * `resumeProject` and `completeProject`. Optional on the wire — legacy
   * Project rows persisted before this field was introduced won't have
   * it; readers must handle `undefined` (`attention.ts` surfaces the
   * paused-long item with day-count-free copy in that case rather than
   * faking precision against `createdAt`).
   */
  pausedAt?: number | null;
  locationZone: string;
  tags: string[];
  nodeId: string;
  /** Stable template ID from `apps/web/src/content/projectTemplates.ts`
   *  (e.g. `"community-fridge"`). `null` means the project wasn't
   *  created from a template — started from scratch, created before
   *  this field existed, or imported. */
  templateId: string | null;
}

export type ProjectTaskStatus =
  | "open"
  | "claimed"
  | "awaiting_confirmation"
  | "completed"
  | "blocked";

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: ProjectCategory;
  estimatedHours: number;
  urgency: Urgency;
  /** Optional list of skills the organizer suggests for this task. */
  requiredSkills: string[];
  /** Public key of the member who has claimed the task. */
  assignedTo: string | null;
  status: ProjectTaskStatus;
  /** DAG of in-project task IDs that should complete before this is
   *  workable. Cycle detection at the write layer. Claim is allowed
   *  regardless of dependency status — the attention rail and the
   *  public `needs_more_hands` chip suppress nudges until all deps
   *  clear (soft block). See `docs/task-ordering-and-dependencies.md`
   *  §3 + §6. */
  dependencies: string[];
  /** Sort key within a project. Higher index = lower in the list.
   *  Tasks insert via the midpoint between neighbors (fractional
   *  indexing) — `orderIndex = (prev.orderIndex + next.orderIndex) / 2`
   *  on a reorder; new tasks land at the bottom with
   *  `orderIndex = max(existing) + 1000`. Renumber the whole list
   *  lazily when precision degrades. See
   *  `docs/task-ordering-and-dependencies.md` §4 + §5.1. */
  orderIndex: number;
  createdAt: number;
  completedAt: number | null;
  /** Set when the task transitions to awaiting_confirmation. */
  completedBy: string | null;
  /** Claimer-stated ACTUAL hours, set at mark-complete (claimed →
   *  awaiting_confirmation) so credit records time given, not the
   *  organizer's estimate (`equal-time`). `null` means never stated —
   *  legacy rows, or a programmatic completion; consumers fall back to
   *  `estimatedHours` via `creditHoursForTask` in `lib/timebank.ts`,
   *  which is the single source of "which number moves." Cleared back
   *  to `null` when the completer walks an awaiting task back, so a
   *  future completion by someone else doesn't inherit it. The figure
   *  `confirmProjectTaskCompletion` writes onto the signed Exchange's
   *  `hoursExchanged` is exactly this (or the estimate fallback). */
  actualHours: number | null;
  /** Set on confirmation. Mirrors the Exchange record's id. */
  exchangeId: string | null;
  /** When the current claim happened. Stamped by
   *  `claimProjectTask`, cleared by release/completion.
   *  Backfilled to `now()` for pre-existing claimed tasks in the
   *  v12 migration so the "could use more hands" prompts don't all
   *  fire at once on first load. */
  claimedAt: number | null;
  /** When the claimer last said "yes, still on it" to the private
   *  staleness nudge. Lets the private clock reset without losing
   *  the original `claimedAt`. Null until first ack. */
  checkInAcknowledgedAt: number | null;
}

export type ProjectActivityType =
  | "project_created"
  | "task_added"
  | "task_claimed"
  | "task_unclaimed"
  | "task_released_after_complete"
  | "task_completed"
  | "task_confirmed"
  | "project_paused"
  | "project_resumed"
  | "project_completed"
  | "project_archived"
  | "project_unarchived"
  | "milestone_reached"
  | "organizer_handoff"
  | "coorganizer_stepdown"
  | "coorganizer_invited"
  | "coorganizer_accepted"
  | "coorganizer_declined"
  | "coorganizer_revoked"
  | "announcement"
  // Local-only: logged when an organizer schedules a community event as
  // a project work day (plan 10). `ProjectActivity` never federates, so
  // adding a member here is NOT a wire-format change — the activity log
  // is a local Dexie table read only by the project history timeline.
  // The work-day LINK itself lives in a separate local-only table
  // (`eventProjectLinks`) and never enters the outbox or the wire.
  | "work_day_scheduled"
  // Local-only: the community installed a new primary organizer through
  // a `project_adoption` proposal (plan 11). Distinct from
  // `organizer_handoff` on purpose — handoff means the primary chose;
  // adoption means the community acted while they were away. Never a
  // wire change (ProjectActivity is local-only).
  | "adopted_by_community";

export interface ProjectActivity {
  id: string;
  projectId: string;
  type: ProjectActivityType;
  actorKey: string;
  /** Type-specific extras: { taskId? , milestone? , note? }. */
  data: Record<string, unknown>;
  createdAt: number;
  nodeId: string;
}

/**
 * Agent 13 — community Decisions surface.
 *
 * A `Proposal` is the unit of community decision-making. The roadmap
 * (`docs/roadmap.md`) collapses Agent 14 (Disputes) into this same
 * table — a dispute is structurally a proposal: a question, named
 * parties, a deliberation period, a binding outcome. The `kind`
 * discriminator splits the two; v1 only supports `kind === "proposal"`
 * for `config_change` proposals (replacing the temporary
 * "anyone can edit community settings" bootstrap).
 *
 * Reversibility tiers ship from day one because the roadmap is
 * explicit that bolting them on later would require rewriting the
 * proposal lifecycle. v1 only renders `easy` and doesn't enforce
 * impact-reflection — those structural pauses come with the
 * `moderate` / `hard` categories in follow-up PRs.
 */
export type ProposalKind = "proposal" | "dispute";

/**
 * `config_change` proposals carry a NodeConfig payload (Agent 13).
 * `dispute` decisions link back to a flagged exchange via
 * `Proposal.disputePostId` and carry a JSON snapshot of the
 * exchange details so the governance row is self-contained even
 * if the underlying post is later modified.
 */
export type ProposalCategory =
  | "config_change"
  | "dispute"
  // Community stewardship of an orphaned project — when a primary
  // organizer has gone quiet, the community can install a new primary
  // through a proposal (the one role transition that happens ABOUT
  // someone who isn't there). Rides `kind: "proposal"`; see
  // `docs/project-adoption.md`.
  | "project_adoption";

export type ReversibilityTier = "easy" | "moderate" | "hard";

export type ProposalStatus =
  | "open"
  | "passed"
  | "rejected"
  | "withdrawn";

export interface Proposal {
  id: string;
  nodeId: string;
  kind: ProposalKind;
  category: ProposalCategory;
  reversibilityTier: ReversibilityTier;
  title: string;
  description: string;
  /** Category-specific payload as a JSON string. For `config_change`
   *  this serializes a `NodeConfigProposalPayload` (the proposed
   *  diff against the current node config). The store is
   *  intentionally schema-agnostic so future categories (recall,
   *  policy) can ride the same table. */
  payload: string;
  proposerKey: string;
  status: ProposalStatus;
  createdAt: number;
  /** Filled in when the proposal is closed (passed / rejected /
   *  withdrawn). null while open. */
  closedAt: number | null;
  /** Free-form note recorded at close — why this outcome.
   *  Voting + automatic close come in a follow-up PR. */
  closedReason: string | null;
  /**
   * Impact reflection — 1-year, 5-year, reversal path, vulnerable
   * impact. Required (by convention, not code) for `hard`-tier
   * proposals. JSON string of `ImpactReflection` when present.
   * Null when the proposer skipped or the tier doesn't require it.
   */
  impactReflection: string | null;
  /**
   * For `kind: "dispute"` rows, the id of the underlying post
   * (the flagged exchange). `null` for `kind: "proposal"` rows.
   * Lets the governance row link back to the exchange truth
   * without duplicating the post lifecycle.
   */
  disputePostId: string | null;
}

export interface ImpactReflection {
  yearOne: string;
  fiveYear: string;
  reversalPath: string;
  vulnerableImpact: string;
}

/**
 * Payload shape for `config_change` proposals — the proposed
 * `NodeConfig` values. Stored as JSON inside `Proposal.payload`.
 */
export type NodeConfigProposalPayload = NodeConfig;

/**
 * Payload shape for `dispute` proposals — a snapshot of the
 * flagged exchange. Persisted in `Proposal.payload` (as JSON) so
 * the governance row is self-contained even if the underlying
 * post later changes. The full Post row is still the source of
 * truth for the exchange lifecycle (status, confirmedBy, etc.);
 * the snapshot is for read-only display on the Decisions surface.
 */
export interface DisputePayload {
  postType: PostType;
  postTitle: string;
  category: Category;
  hours: number;
  /** The helper key — whoever was offering the work. */
  helperKey: string | null;
  /** The recipient key — whoever was receiving help. */
  recipientKey: string;
  /** When the original post was created. */
  postCreatedAt: number;
}

/**
 * Payload shape for `project_adoption` proposals — a community offer to
 * become a quiet project's new primary organizer. Stored as JSON inside
 * `Proposal.payload`, following the same snapshot discipline as
 * `DisputePayload`: the file-time snapshots (`projectTitle`,
 * `sittingPrimaryKey`) keep the governance row honest after the flip and
 * let execution detect "stewardship has changed since this was filed."
 * See `docs/project-adoption.md`.
 *
 * Adoption is a LOCAL governance act — projects never federate, so
 * `organizerKey` lives only on the local Project row, in the same
 * consistency domain as proposals and votes. No new wire records.
 */
export interface ProjectAdoptionPayload {
  projectId: string;
  /** File-time snapshot of the project title (for honest display after
   *  the project may have changed). */
  projectTitle: string;
  /** The member offering to take on the primary role — always equal to
   *  the proposer (`proposerKey`); adoption is self-nomination, never
   *  nominating someone else (GOVERNANCE.md §4). */
  proposedPrimaryKey: string;
  /** File-time snapshot of `Project.organizerKey` — the quiet primary
   *  being demoted (not removed). Execution refuses if the project's
   *  current `organizerKey` no longer matches this. */
  sittingPrimaryKey: string;
  /** Required free-text: the offerer's connection to the project and
   *  what they'd keep going. Carries the social weight in place of an
   *  impact reflection. */
  rationale: string;
  /** File-time snapshot of the most recent organizer-authored activity
   *  timestamp on the project (or `null` if none), for the "quiet
   *  since" display. A proxy: task edits/reorders write no activity
   *  row, so this can under-count a silently-active primary. */
  lastOrganizerActivityAt: number | null;
}

/**
 * Per-`GOVERNANCE.md` decision model. Members express a position on
 * an open proposal: affirm (consent), block (object — should carry
 * a reason), or abstain (intentional non-position). Silence is also
 * valid in lazy consensus, but only the explicit choices are stored.
 *
 * Votes are unsigned for v1 because they stay local to the node. When
 * Agent 15 (federation governance) lands and votes need to cross
 * peer boundaries, we'll add a signature field alongside.
 *
 * Latest vote per (voter, proposal) wins. The `votes` table indexes
 * on the composite key so replacing a vote is a simple `put` with
 * the same `id`.
 */
export type VoteChoice = "affirm" | "block" | "abstain";

export interface Vote {
  /** Deterministic id: `${proposalId}|${voterKey}`. One row per
   *  voter per proposal — re-casting overwrites. */
  id: string;
  proposalId: string;
  voterKey: string;
  choice: VoteChoice;
  /** Optional note. Strongly encouraged for `block` (so the
   *  community can resolve the objection); usually empty for
   *  affirm / abstain. */
  reason: string | null;
  createdAt: number;
  nodeId: string;
}

// ---------------------------------------------------------------------------
// Agent 2 task 5 — E2E encrypted direct messages
// ---------------------------------------------------------------------------

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderKey: string;
  recipientKey: string;
  nonce: string;
  ciphertext: string;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Task comments — per-task conversation threads
// ---------------------------------------------------------------------------

/**
 * Payload for a `kind: "dispute"` Proposal that flags a task
 * comment. The `subjectType` field discriminates this payload from
 * `DisputePayload` (which flags an exchange post and omits
 * `subjectType` entirely for back-compat with pre-existing rows).
 *
 * The body / authorKey / createdAt snapshot is preserved so the
 * Disputes view still has something to show even if the author
 * later soft-deletes the underlying comment. That's the whole
 * point of flagging — community accountability survives author
 * action.
 */
export interface CommentDisputePayload {
  subjectType: "task_comment";
  commentId: string;
  projectId: string;
  taskId: string;
  body: string;
  authorKey: string;
  createdAt: number;
}

/**
 * A comment authored on a project task. Anyone with an unlocked
 * session can post; only the author can soft-delete their own
 * comment. Tombstones (deletedAt set) are preserved so federated
 * peers converge cleanly — hard deletes would break peers that
 * haven't yet seen the original.
 *
 * The immutable subset (everything except `deletedAt`) is signed
 * by the author's secret key at creation time. Federation will
 * verify the signature when comments cross node boundaries; the
 * local-only slice stores the signature but doesn't push.
 */
export interface TaskComment {
  id: string;
  /** Denormalized from the task — lets peers route a comment to
   *  the right project without first resolving the task. */
  projectId: string;
  taskId: string;
  /** Public key of the author. */
  authorKey: string;
  /** Plain-text body, up to 2000 chars. Trimmed. */
  body: string;
  createdAt: number;
  /** Tombstone marker. Null while the comment is live; set to the
   *  delete timestamp once the author has soft-deleted. The body
   *  stays in the row so federation converges; the UI renders a
   *  "(comment deleted)" placeholder. */
  deletedAt: number | null;
  /** Origin node id. */
  nodeId: string;
  /** Ed25519 signature over the canonical payload. Empty string for
   *  legacy / unsigned rows (not federable). */
  signature: string;
}

// ---------------------------------------------------------------------------
// Co-organizer invitations — signed-invitation + signed-acceptance.
// See `docs/co-organizer-invitations.md` §3–§4. Three signed record
// types, one signer per record: invitation (inviter), response
// (invitee, accept/decline), revocation (inviter). Single-signer-per-
// record is the discipline the rest of the federated ledger relies
// on; co-organizer invitations preserve it.
// ---------------------------------------------------------------------------

/**
 * Canonical, signed by the inviter (the primary organizer). The
 * `inviterKey` MUST equal `Project.organizerKey` at issue time —
 * verifiers re-check that against the project row. `organizerKey`
 * legitimately changes two ways: an `organizer_handoff` (the primary
 * chose) and an `adopted_by_community` flip (the community installed a
 * new primary while the old one was away — see `docs/project-adoption.md`);
 * after either, the new primary's invitations pass the issue-time check
 * on their own flipped row and verify cleanly everywhere.
 */
export interface CoOrganizerInvitationPayload {
  projectId: string;
  inviterKey: string;
  inviteeKey: string;
  createdAt: number;
  /** `createdAt + 14 days` by default, matching member invites. */
  expiresAt: number;
  nodeId: string;
}

export interface CoOrganizerInvitation extends CoOrganizerInvitationPayload {
  /** UUID; the federation-stable handle peers dedupe on. */
  id: string;
  /** Inviter's Ed25519 detached signature over the canonical payload. */
  signature: string;
}

/**
 * Canonical, signed by the invitee. Only `accept` or `decline` —
 * revocation is its own record type so every signed record has a
 * single, unambiguous signer (see design doc §4).
 */
export interface CoOrganizerInvitationResponsePayload {
  invitationId: string;
  inviteeKey: string;
  decision: "accept" | "decline";
  decidedAt: number;
  nodeId: string;
}

export interface CoOrganizerInvitationResponse
  extends CoOrganizerInvitationResponsePayload {
  id: string;
  /** Invitee's Ed25519 detached signature over the canonical payload. */
  signature: string;
}

/**
 * Canonical, signed by the inviter — cancels an outstanding
 * invitation before the invitee has responded. Revocation after
 * acceptance is a different action (removeCoOrganizer / the
 * self-removal PR); this record type only models pre-response
 * cancellation.
 */
export interface CoOrganizerInvitationRevocationPayload {
  invitationId: string;
  inviterKey: string;
  revokedAt: number;
  nodeId: string;
}

export interface CoOrganizerInvitationRevocation
  extends CoOrganizerInvitationRevocationPayload {
  id: string;
  /** Inviter's Ed25519 detached signature over the canonical payload. */
  signature: string;
}

// ---------------------------------------------------------------------------
// Community events — federated `Event` + `EventCancellation`. See
// `docs/community-events.md` §3, §4, §11. Two signed record types,
// single-signer-per-record. RSVPs are deliberately NOT modeled here —
// `EventRSVP` is local-Dexie only (see design doc §4.2 + §7.2) and
// never enters the wire format, so it does not belong in the shared
// package.
//
// FIELD ORDER IS THE WIRE CONTRACT. The order of properties in
// `EventPayload` / `EventCancellationPayload` below is the order the
// canonical serializer emits, which is the order the signature covers.
// Do NOT alphabetize. Do NOT reorder. Adding a field is a breaking
// change to the federation wire format.
// ---------------------------------------------------------------------------

/**
 * Canonical, signed by the organizer. Mirrors the §3 comparison-card
 * enumeration of "what an Event commits to": public organizer record,
 * public location and time, permanent + append-only. The signature
 * covers exactly the fields below in declared order.
 *
 * Note on `templateId`: reserved for phase 2 (see design doc §10).
 * Phase 1 enforcement is at the application layer — the types layer
 * accepts any `string | null`, the app layer requires `null`. No
 * canonical-level rejection here; that would couple the wire format
 * to a phase boundary the wire format shouldn't know about.
 */
export interface EventPayload {
  /** Canonical-hash-derived federation-stable handle. */
  id: string;
  kind: "event";
  /** 1..200 chars. */
  title: string;
  /** 0..2000 chars; empty allowed. */
  description: string;
  /** Free-text category identifier; 1..50 chars. Not constrained to
   *  `CATEGORIES` so phase-2 templates can introduce category strings
   *  the legacy `Post` enum doesn't carry. */
  category: string;
  /** Epoch milliseconds, UTC. */
  startsAt: number;
  /** Epoch milliseconds, UTC; `null` = single-point event with no
   *  defined end. */
  endsAt: number | null;
  /** Free text; 1..200 chars. NOT a GPS pin — threat-model §7
   *  rejects coordinate pairs on the public wire. "Community room,
   *  3rd floor" is the shape this field is for. */
  location: string;
  /** Positive integer or `null` for uncapped. Soft cap — the server
   *  never enforces a count; counts are local per node. */
  capacity: number | null;
  /** Reserved for phase 2. MUST be `null` in phase 1; enforced at
   *  the application layer, not at the canonical-serialization layer. */
  templateId: string | null;
  /** Epoch milliseconds, UTC. */
  createdAt: number;
  /** Base64-encoded Ed25519 public key of the organizer; signs this
   *  payload. */
  createdBy: string;
  /** Origin node id. */
  nodeId: string;
}

export interface Event extends EventPayload {
  /** Organizer's Ed25519 detached signature, base64-encoded, over
   *  `canonicalEventPayload(payload)`. */
  signature: string;
}

/**
 * Canonical, signed by the organizer. Cancellation is the only
 * lifecycle transition phase 1 supports — no edits. The federation
 * route additionally enforces that `createdBy` equals the referenced
 * `Event.createdBy` (single-signer authority); this types-and-crypto
 * layer verifies the signature only, leaving the cross-record check
 * to the application layer (PR C/D).
 */
export interface EventCancellationPayload {
  /** Canonical-hash-derived federation-stable handle. */
  id: string;
  kind: "event_cancellation";
  /** References `Event.id`. */
  eventId: string;
  /** Free text, 0..500 chars; empty allowed. Rendered as
   *  "Cancelled (no reason given)" when empty. */
  reason: string;
  /** Epoch milliseconds, UTC. */
  cancelledAt: number;
  /** Base64-encoded Ed25519 public key of the organizer. The
   *  application layer (PR C/D) verifies this equals the cancelled
   *  `Event.createdBy`; this layer verifies the signature only. */
  createdBy: string;
  /** Origin node id. */
  nodeId: string;
}

export interface EventCancellation extends EventCancellationPayload {
  /** Organizer's Ed25519 detached signature, base64-encoded, over
   *  `canonicalEventCancellationPayload(payload)`. */
  signature: string;
}
