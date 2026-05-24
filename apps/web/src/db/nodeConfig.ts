/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { NodeConfig } from "@/types";
import { DEFAULT_NODE_CONFIG } from "@/types";
import { db } from "./database";

// Agent 11: per-node config CRUD. The PWA always operates on exactly
// one node, so there's never more than one row in this table. The
// `getNodeConfig()` reader is the only allowed access path — call sites
// MUST go through it (and not `db.nodeConfig.get(nodeId)` directly) so
// the default-fill behaviour is consistent everywhere.

/**
 * Returns the stored config for `nodeId`, filling in defaults for any
 * unset field. Returning a complete NodeConfig (rather than `null` or
 * a partial) means call sites don't have to repeat the default-merging
 * logic and can't accidentally treat "missing field" as "zero." */
export async function getNodeConfig(nodeId: string): Promise<NodeConfig> {
  const row = await db.nodeConfig.get(nodeId);
  if (!row) return { ...DEFAULT_NODE_CONFIG };
  return {
    dailyHelperLimit: row.dailyHelperLimit ?? DEFAULT_NODE_CONFIG.dailyHelperLimit,
    shortExchangeHours:
      row.shortExchangeHours ?? DEFAULT_NODE_CONFIG.shortExchangeHours,
    reciprocalPairThreshold:
      row.reciprocalPairThreshold ?? DEFAULT_NODE_CONFIG.reciprocalPairThreshold,
    taskCheckInDays:
      row.taskCheckInDays ?? DEFAULT_NODE_CONFIG.taskCheckInDays,
    taskNeedsHelpDays:
      row.taskNeedsHelpDays ?? DEFAULT_NODE_CONFIG.taskNeedsHelpDays,
    taskCheckInGraceDays:
      row.taskCheckInGraceDays ?? DEFAULT_NODE_CONFIG.taskCheckInGraceDays,
  };
}

/**
 * Writes a complete config row for `nodeId`. Validation lives here
 * rather than in components so the same checks apply to any future
 * caller (governance proposal application, sync from a peer, etc.).
 */
export async function putNodeConfig(
  nodeId: string,
  next: NodeConfig,
): Promise<NodeConfig> {
  const validated = validate(next);
  await db.nodeConfig.put({ nodeId, ...validated });
  return validated;
}

export class InvalidNodeConfigError extends Error {
  readonly code = "INVALID_NODE_CONFIG";
}

function validate(config: NodeConfig): NodeConfig {
  if (!Number.isFinite(config.dailyHelperLimit) || config.dailyHelperLimit < 1) {
    throw new InvalidNodeConfigError(
      "Daily helper limit must be at least 1.",
    );
  }
  if (
    !Number.isFinite(config.shortExchangeHours) ||
    config.shortExchangeHours < 0 ||
    config.shortExchangeHours > 24
  ) {
    throw new InvalidNodeConfigError(
      "Short-exchange threshold must be between 0 and 24 hours.",
    );
  }
  if (
    !Number.isFinite(config.reciprocalPairThreshold) ||
    config.reciprocalPairThreshold < 2
  ) {
    throw new InvalidNodeConfigError(
      "Reciprocal-pair threshold must be at least 2 (one exchange isn't a pattern).",
    );
  }
  if (
    !Number.isInteger(config.taskCheckInDays) ||
    config.taskCheckInDays < 1
  ) {
    throw new InvalidNodeConfigError(
      "Task check-in threshold must be a whole number of days >= 1.",
    );
  }
  if (
    !Number.isInteger(config.taskNeedsHelpDays) ||
    config.taskNeedsHelpDays < config.taskCheckInDays
  ) {
    throw new InvalidNodeConfigError(
      "Task 'needs more hands' threshold must be a whole number of days >= the check-in threshold.",
    );
  }
  if (
    !Number.isInteger(config.taskCheckInGraceDays) ||
    config.taskCheckInGraceDays < 0
  ) {
    throw new InvalidNodeConfigError(
      "Task check-in grace must be a whole number of days >= 0.",
    );
  }
  return config;
}

/**
 * Resets `nodeId`'s config to the shipped defaults. Used by the
 * "Reset to defaults" action in the settings UI. */
export async function resetNodeConfig(nodeId: string): Promise<NodeConfig> {
  const defaults = { ...DEFAULT_NODE_CONFIG };
  await db.nodeConfig.put({ nodeId, ...defaults });
  return defaults;
}
