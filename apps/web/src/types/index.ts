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
  /** Placeholder signatures — Agent 2 will replace with real Ed25519 signatures. */
  helperSignature: string;
  helpedSignature: string;
  completedAt: number;
  category: Category;
  nodeId: string;
}

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
