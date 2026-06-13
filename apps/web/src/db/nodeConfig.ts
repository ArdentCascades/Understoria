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
import type { Milestone, NodeConfig } from "@/types";
import { DEFAULT_NODE_CONFIG } from "@/types";
import { db } from "./database";

/** Hard cap on community-defined milestone rows. Prevents config bloat
 *  (the row syncs through governance proposals and ships in the
 *  config payload of every `config_change` proposal — keeping it small
 *  keeps proposal diffs human-readable). 20 is large enough for any
 *  realistic community list while still bounding the worst case. */
export const MAX_CUSTOM_MILESTONES = 20;
const MAX_LABEL_LENGTH = 80;
const VALID_MILESTONE_TYPES = new Set<Milestone["type"]>([
  "hours",
  "exchanges",
  "members",
]);

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
    proposalDeliberationDays:
      row.proposalDeliberationDays ??
      DEFAULT_NODE_CONFIG.proposalDeliberationDays,
    proposalMinAffirms:
      row.proposalMinAffirms ?? DEFAULT_NODE_CONFIG.proposalMinAffirms,
    adoptionQuietDays:
      row.adoptionQuietDays ?? DEFAULT_NODE_CONFIG.adoptionQuietDays,
    autoConfirmHours:
      row.autoConfirmHours ?? DEFAULT_NODE_CONFIG.autoConfirmHours,
    customMilestones: row.customMilestones ?? [],
    // Defaults to false so pre-existing deployments behave exactly as
    // before (open self-onboarding). Operators opt in from Settings.
    inviteOnly: row.inviteOnly ?? false,
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
  if (
    !Number.isInteger(config.proposalDeliberationDays) ||
    config.proposalDeliberationDays < 1
  ) {
    throw new InvalidNodeConfigError(
      "Proposal deliberation period must be a whole number of days >= 1.",
    );
  }
  if (
    !Number.isInteger(config.proposalMinAffirms) ||
    config.proposalMinAffirms < 1
  ) {
    throw new InvalidNodeConfigError(
      "Proposal minimum affirms must be a whole number >= 1.",
    );
  }
  // Adoption quiet period: whole days, with a floor of 7 so a community
  // can't set a window short enough to make a role transfer over an
  // absent member's head trivially winnable (the 14-day deliberation
  // floor in autoCloseProposals.ts is the other half of this guard).
  if (
    !Number.isInteger(config.adoptionQuietDays) ||
    config.adoptionQuietDays < 7
  ) {
    throw new InvalidNodeConfigError(
      "Adoption quiet period must be a whole number of days >= 7.",
    );
  }
  // Auto-confirm window: integer hours, 0 = disabled. Upper bound
  // (8760 = a year) is generous — a community that wants
  // "effectively never auto-confirm without turning it off" should
  // use 0 instead, but we don't reject extra-long windows.
  if (
    !Number.isInteger(config.autoConfirmHours) ||
    config.autoConfirmHours < 0 ||
    config.autoConfirmHours > 24 * 365
  ) {
    throw new InvalidNodeConfigError(
      "Auto-confirm hours must be a whole number between 0 and 8760. 0 disables auto-confirm entirely.",
    );
  }
  // `inviteOnly` is optional and only meaningful as a boolean. Coerce
  // any non-boolean (undefined, garbage from a corrupted row) to
  // `false` so the gate defaults to the legacy "open" behavior — same
  // posture as the read path in `getNodeConfig`.
  if (
    config.inviteOnly !== undefined &&
    typeof config.inviteOnly !== "boolean"
  ) {
    throw new InvalidNodeConfigError("inviteOnly must be a boolean.");
  }
  const validatedCustom = validateCustomMilestones(config.customMilestones);
  return { ...config, customMilestones: validatedCustom };
}

function validateCustomMilestones(input: unknown): Milestone[] {
  if (!Array.isArray(input)) {
    throw new InvalidNodeConfigError(
      "Custom milestones must be an array.",
    );
  }
  if (input.length > MAX_CUSTOM_MILESTONES) {
    throw new InvalidNodeConfigError(
      `Up to ${MAX_CUSTOM_MILESTONES} custom milestones.`,
    );
  }
  const seen = new Set<string>();
  const out: Milestone[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") {
      throw new InvalidNodeConfigError(
        "Each custom milestone must be an object.",
      );
    }
    const m = raw as Partial<Milestone>;
    if (
      typeof m.type !== "string" ||
      !VALID_MILESTONE_TYPES.has(m.type as Milestone["type"])
    ) {
      throw new InvalidNodeConfigError(
        "Custom milestone type must be hours, exchanges, or members.",
      );
    }
    // `members` and `exchanges` are intrinsically integers; `hours`
    // is a count of whole hours for a celebrate-this-threshold
    // marker (sub-hour milestones don't fit the "meaningful
    // threshold" framing). Keeping all three integer simplifies the
    // form and the dedup key.
    if (
      typeof m.threshold !== "number" ||
      !Number.isFinite(m.threshold) ||
      !Number.isInteger(m.threshold) ||
      m.threshold <= 0
    ) {
      throw new InvalidNodeConfigError(
        "Custom milestone threshold must be a positive whole number.",
      );
    }
    if (typeof m.label !== "string") {
      throw new InvalidNodeConfigError(
        "Custom milestone label must be a string.",
      );
    }
    const label = m.label.trim();
    if (label.length === 0) {
      throw new InvalidNodeConfigError(
        "Custom milestone label cannot be empty.",
      );
    }
    if (label.length > MAX_LABEL_LENGTH) {
      throw new InvalidNodeConfigError(
        `Label is too long (max ${MAX_LABEL_LENGTH} characters).`,
      );
    }
    // Duplicates within the custom set are user error and rejected
    // here. Baseline-vs-custom dedup is handled at read time in
    // `effectiveMilestones` (baseline wins) — that one isn't an
    // error, just a no-op.
    const key = `${m.type}|${m.threshold}`;
    if (seen.has(key)) {
      throw new InvalidNodeConfigError(
        "A milestone with this type and threshold already exists.",
      );
    }
    seen.add(key);
    out.push({
      type: m.type as Milestone["type"],
      threshold: m.threshold,
      label,
    });
  }
  return out;
}

/**
 * Toggles the `inviteOnly` flag for `nodeId`. Loads the current
 * config (so unset fields stay defaulted), flips the flag, and writes
 * it back via the normal `putNodeConfig` path so the same validation
 * rules apply. Returns the persisted config.
 *
 * The CommunitySettingsSection form normally writes the full config in
 * one go; this helper is here so callers that only need to flip the
 * gate (e.g. future automation, tests) don't have to reconstruct the
 * whole config object.
 */
export async function setInviteOnly(
  nodeId: string,
  inviteOnly: boolean,
): Promise<NodeConfig> {
  const current = await getNodeConfig(nodeId);
  return putNodeConfig(nodeId, { ...current, inviteOnly });
}

/**
 * Resets `nodeId`'s config to the shipped defaults. Used by the
 * "Reset to defaults" action in the settings UI. */
export async function resetNodeConfig(nodeId: string): Promise<NodeConfig> {
  const defaults = { ...DEFAULT_NODE_CONFIG };
  await db.nodeConfig.put({ nodeId, ...defaults });
  return defaults;
}
