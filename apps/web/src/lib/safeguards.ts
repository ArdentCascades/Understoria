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
import type { Exchange, FlagReason } from "@/types";

/**
 * Anti-gaming safeguards — Agent 6 task 6.
 *
 * The plan explicitly says: "Community discussion if patterns emerge,
 * not automated punishment." So these safeguards fall into two tiers:
 *
 * - Tier 1 (hard stop): a daily exchange limit per helper. This is the
 *   one genuinely punitive rule and it's configurable per-node.
 * - Tier 2 (soft flag): mark suspicious patterns for community review.
 *   No credits are withheld; no member is muted; the flag just surfaces
 *   in moderation workflows (Agent 5).
 */

export const DEFAULT_DAILY_HELPER_LIMIT = 3;
const SHORT_EXCHANGE_HOURS = 0.25;
const RECIPROCAL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const RECIPROCAL_PAIR_THRESHOLD = 3;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class DailyLimitExceededError extends Error {
  readonly code = "DAILY_LIMIT_EXCEEDED";
  constructor(readonly limit: number) {
    super(
      `You've completed ${limit} exchanges today. Give the day a breath — the board will still be here tomorrow.`,
    );
  }
}

/**
 * Throws `DailyLimitExceededError` if the helper has already hit the
 * per-day limit. Must be called BEFORE writing the new exchange, with
 * the existing exchange log.
 */
export function assertWithinDailyLimit(
  helperKey: string,
  existingExchanges: readonly Exchange[],
  now: number,
  limit = DEFAULT_DAILY_HELPER_LIMIT,
): void {
  const dayStart = Math.floor(now / MS_PER_DAY) * MS_PER_DAY;
  const count = existingExchanges.filter(
    (x) =>
      x.helperKey === helperKey &&
      x.completedAt >= dayStart &&
      x.completedAt < dayStart + MS_PER_DAY,
  ).length;
  if (count >= limit) {
    throw new DailyLimitExceededError(limit);
  }
}

export interface SafeguardEvaluation {
  flaggedForReview: boolean;
  flagReason?: FlagReason;
}

/**
 * Decides whether a just-to-be-recorded exchange should carry an
 * advisory flag. Pure function, easy to unit-test.
 */
export function evaluateSafeguards(
  pendingExchange: {
    helperKey: string;
    helpedKey: string;
    hoursExchanged: number;
    completedAt: number;
  },
  existingExchanges: readonly Exchange[],
): SafeguardEvaluation {
  if (pendingExchange.hoursExchanged < SHORT_EXCHANGE_HOURS) {
    return { flaggedForReview: true, flagReason: "short_duration" };
  }

  const pairWindowStart = pendingExchange.completedAt - RECIPROCAL_WINDOW_MS;
  const reciprocalCount = existingExchanges.filter(
    (x) =>
      x.completedAt >= pairWindowStart &&
      ((x.helperKey === pendingExchange.helperKey &&
        x.helpedKey === pendingExchange.helpedKey) ||
        (x.helperKey === pendingExchange.helpedKey &&
          x.helpedKey === pendingExchange.helperKey)),
  ).length;
  if (reciprocalCount + 1 >= RECIPROCAL_PAIR_THRESHOLD) {
    return { flaggedForReview: true, flagReason: "reciprocal_pattern" };
  }

  return { flaggedForReview: false };
}
