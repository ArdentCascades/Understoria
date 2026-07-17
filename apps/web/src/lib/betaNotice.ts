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
import { getSetting, SETTING_KEYS, setSetting } from "@/db/database";

// Dismissal state for the beta/AI disclosure card (BetaNotice.tsx).
// One device-wide flag shared by every door the card appears on:
// dismissing it on the welcome tour also clears it from the invite
// page and the node-setup screen — the member read it once, that's
// the point. Permanent by design (no-notifications: re-showing a
// dismissed notice is nagging); the permanent copies in Help
// (FAQ "beta-status") and Settings stay findable forever. Follows
// the keepAccessNudge pattern; cleared by Hard purge with the rest
// of the settings table.

const DISMISSED_VALUE = "1";

export async function isBetaNoticeDismissed(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.betaNoticeDismissed);
  return value === DISMISSED_VALUE;
}

export async function dismissBetaNotice(): Promise<void> {
  await setSetting(SETTING_KEYS.betaNoticeDismissed, DISMISSED_VALUE);
}
