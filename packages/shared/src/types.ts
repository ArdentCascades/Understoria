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
}

export const DEFAULT_NODE_CONFIG: NodeConfig = {
  dailyHelperLimit: 3,
  shortExchangeHours: 0.25,
  reciprocalPairThreshold: 3,
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
