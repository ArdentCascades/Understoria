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
import type { Exchange, FlagReason, NodeConfig } from "@/types";
import { DEFAULT_NODE_CONFIG } from "@/types";

/**
 * Anti-gaming safeguards.
 *
 * Two tiers, per the plan ("Community discussion if patterns emerge,
 * not automated punishment"):
 *
 * - Tier 1 (hard stop): a daily exchange limit per helper. The one
 *   genuinely punitive rule.
 * - Tier 2 (soft flag): mark suspicious patterns for community review.
 *   No credits are withheld; no member is muted; the flag just surfaces
 *   in moderation workflows.
 *
 * Thresholds come from `NodeConfig` (Agent 11). Defaults live in
 * `DEFAULT_NODE_CONFIG` in `packages/shared/src/types.ts`. Both
 * functions accept an optional config so call sites that haven't
 * loaded it yet (initial render, tests) behave identically to the
 * pre-Agent-11 PWA.
 */

const RECIPROCAL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
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
  config: NodeConfig = DEFAULT_NODE_CONFIG,
): void {
  const limit = config.dailyHelperLimit;
  // Rolling 24-hour window, not a fixed UTC calendar day (Round-4
  // review). The config field documents "a 24-hour window", but a UTC
  // bucket let a helper do `limit` exchanges at 23:50 UTC and `limit`
  // more at 00:10 — double the hard stop in 20 minutes (and it reset
  // mid-afternoon for a US-west community).
  const windowStart = now - MS_PER_DAY;
  const count = existingExchanges.filter(
    (x) => x.helperKey === helperKey && x.completedAt >= windowStart,
  ).length;
  if (count >= limit) {
    throw new DailyLimitExceededError(limit);
  }
}

/**
 * Non-throwing daily-limit check for the auto-confirm path. A
 * system-signed exchange is already built and signed by the time it
 * reaches the client, so the hard-stop `assertWithinDailyLimit` (which
 * throws) is wrong there — it would strand a valid node-signed row.
 * Instead the sweep FLAGS an over-limit auto-confirm for review
 * (`daily_limit_warning`), so the anti-gaming signal still surfaces
 * without discarding credit the node legitimately confirmed.
 */
export function exceedsDailyLimit(
  helperKey: string,
  existingExchanges: readonly Exchange[],
  now: number,
  config: NodeConfig = DEFAULT_NODE_CONFIG,
): boolean {
  const limit = config.dailyHelperLimit;
  const windowStart = now - MS_PER_DAY;
  const count = existingExchanges.filter(
    (x) => x.helperKey === helperKey && x.completedAt >= windowStart,
  ).length;
  return count >= limit;
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
  config: NodeConfig = DEFAULT_NODE_CONFIG,
): SafeguardEvaluation {
  if (pendingExchange.hoursExchanged < config.shortExchangeHours) {
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
  if (reciprocalCount + 1 >= config.reciprocalPairThreshold) {
    return { flaggedForReview: true, flagReason: "reciprocal_pattern" };
  }

  return { flaggedForReview: false };
}
