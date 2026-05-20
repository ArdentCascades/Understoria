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
  | "listener";

export interface Achievement {
  id: string;
  memberKey: string;
  achievementType: AchievementType;
  earnedAt: number;
  metadata: Record<string, unknown>;
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
