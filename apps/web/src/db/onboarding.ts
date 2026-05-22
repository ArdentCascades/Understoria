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
import { db, getSetting, SETTING_KEYS, setSetting } from "./database";

// Wraps SETTING_KEYS.onboarded — the flag that decides whether a
// device sees the welcome flow on first launch. The key has existed
// in SETTING_KEYS since the original schema but was never read or
// written; Agent 16 activates it.

const ONBOARDED_VALUE = "1";

export async function isOnboarded(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.onboarded);
  return value === ONBOARDED_VALUE;
}

export async function markOnboarded(): Promise<void> {
  await setSetting(SETTING_KEYS.onboarded, ONBOARDED_VALUE);
}

// Upgrade path for devices that have been using Understoria from
// before Agent 16. If members already exist locally, the user has
// clearly seen the app — silently mark the device as onboarded so
// they don't get a welcome flow for software they already know.
export async function backfillOnboardedForExistingUsers(): Promise<void> {
  if (await isOnboarded()) return;
  const memberCount = await db.members.count();
  if (memberCount > 0) {
    await markOnboarded();
  }
}
