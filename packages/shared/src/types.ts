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

export interface Member {
  publicKey: string;
  displayName: string;
  skills: string[];
  availability: string;
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
  locationZone: string;
  tags: string[];
  nodeId: string;
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
  /** Other task IDs that should complete before this is workable.
   *  Advisory; the UI shows "blocked" but does not enforce. */
  dependencies: string[];
  createdAt: number;
  completedAt: number | null;
  /** Set when the task transitions to awaiting_confirmation. */
  completedBy: string | null;
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
  | "task_completed"
  | "task_confirmed"
  | "project_paused"
  | "project_resumed"
  | "project_completed"
  | "milestone_reached";

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
export type ProposalCategory = "config_change" | "dispute";

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
