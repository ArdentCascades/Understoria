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
import type {
  Achievement,
  AchievementType,
  Category,
  Exchange,
} from "@/types";
import { uuid } from "./id";

export interface AchievementDefinition {
  type: AchievementType;
  label: string;
  description: string;
}

export const ACHIEVEMENT_DEFINITIONS: Record<
  AchievementType,
  AchievementDefinition
> = {
  first_exchange: {
    type: "first_exchange",
    label: "First Exchange",
    description: "You completed your first exchange — giving or receiving.",
  },
  connector_5: {
    type: "connector_5",
    label: "Connector",
    description: "You've helped 5 different people in our community.",
  },
  regular_4weeks: {
    type: "regular_4weeks",
    label: "Regular",
    description:
      "You've been active for 4 consecutive weeks — at least one exchange each week.",
  },
  bridge_builder: {
    type: "bridge_builder",
    label: "Bridge Builder",
    description: "You fulfilled a need in a category no one had filled before.",
  },
  seed_planter: {
    type: "seed_planter",
    label: "Seed Planter",
    description: "3 people you invited have each completed an exchange.",
  },
  listener: {
    type: "listener",
    label: "Listener",
    description: "You've completed 3 exchanges supporting someone emotionally.",
  },
  weaver: {
    type: "weaver",
    label: "Weaver",
    description:
      "Your exchanges have connected members across 3 or more areas of our community.",
  },
};

export interface MemberRelationContext {
  /** Invitees of this member who have completed at least one exchange. */
  activeInviteeKeys?: string[];
  /** Categories that had been filled by any prior exchange before this log. */
  previouslyFilledCategories?: Set<Category>;
  /** How many distinct location zones this member has reached via the
   *  counterparties of exchanges where they were the helper. Computed
   *  by the caller (it needs Member records, which evaluateAchievements
   *  doesn't itself receive). Undefined means "not computed" — the
   *  Weaver achievement is skipped rather than incorrectly awarded. */
  zoneReach?: number;
}

/**
 * Evaluates which achievements a member has earned given their complete
 * exchange history. Pure function — no DB access, no side effects.
 */
export function evaluateAchievements(
  memberKey: string,
  allExchanges: readonly Exchange[],
  context: MemberRelationContext = {},
  now: number = Date.now(),
): AchievementType[] {
  const earned = new Set<AchievementType>();
  const memberExchanges = allExchanges.filter(
    (x) => x.helperKey === memberKey || x.helpedKey === memberKey,
  );

  if (memberExchanges.length >= 1) earned.add("first_exchange");

  const helpedUniqueRecipients = new Set(
    allExchanges
      .filter((x) => x.helperKey === memberKey)
      .map((x) => x.helpedKey),
  );
  if (helpedUniqueRecipients.size >= 5) earned.add("connector_5");

  if (hasConsecutiveActiveWeeks(memberKey, memberExchanges, 4, now)) {
    earned.add("regular_4weeks");
  }

  if (
    context.previouslyFilledCategories &&
    allExchanges.some(
      (x) =>
        x.helperKey === memberKey &&
        !context.previouslyFilledCategories!.has(x.category),
    )
  ) {
    earned.add("bridge_builder");
  }

  if ((context.activeInviteeKeys?.length ?? 0) >= 3) {
    earned.add("seed_planter");
  }

  const emotionalHelped = allExchanges.filter(
    (x) => x.helperKey === memberKey && x.category === "emotional_support",
  ).length;
  if (emotionalHelped >= 3) earned.add("listener");

  if ((context.zoneReach ?? 0) >= 3) earned.add("weaver");

  return Array.from(earned);
}

function hasConsecutiveActiveWeeks(
  memberKey: string,
  memberExchanges: readonly Exchange[],
  weeks: number,
  now: number,
): boolean {
  if (memberExchanges.length < weeks) return false;
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  const activeWeeks = new Set<number>();
  for (const x of memberExchanges) {
    if (x.helperKey !== memberKey && x.helpedKey !== memberKey) continue;
    const weekIndex = Math.floor(x.completedAt / MS_PER_WEEK);
    activeWeeks.add(weekIndex);
  }
  const currentWeek = Math.floor(now / MS_PER_WEEK);
  for (let start = currentWeek; start >= 0; start--) {
    let run = 0;
    for (let w = start; w > start - weeks; w--) {
      if (activeWeeks.has(w)) run += 1;
      else break;
    }
    if (run >= weeks) return true;
  }
  return false;
}

/**
 * Takes currently-stored achievements and the member's exchange history,
 * returns the new Achievement records to insert (no duplicates).
 */
export function diffAchievements(
  memberKey: string,
  currentTypes: readonly AchievementType[],
  allExchanges: readonly Exchange[],
  context: MemberRelationContext = {},
  now: number = Date.now(),
): Achievement[] {
  const earnedTypes = evaluateAchievements(
    memberKey,
    allExchanges,
    context,
    now,
  );
  const current = new Set(currentTypes);
  return earnedTypes
    .filter((t) => !current.has(t))
    .map<Achievement>((t) => ({
      id: uuid(),
      memberKey,
      achievementType: t,
      earnedAt: now,
      metadata: {},
    }));
}
