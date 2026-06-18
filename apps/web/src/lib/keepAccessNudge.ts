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
import { listPairings } from "@/db/pairing";

// This nudge is the calm, post-onboarding reassurance that an account
// living only on one device has a real backup path: pairing a second
// device. There is no key export, recovery, or seed phrase — the only
// thing that preserves account access is a second paired device. The
// nudge points at that action without nagging. Dismissal is permanent
// (no-notifications: the member said "maybe later", we heard them).
// Self-retires the moment a second device exists — see the predicate
// below.

const DISMISSED_VALUE = "1";

/**
 * Does this account already have a second device? A pairing-log row of
 * EITHER kind means a backup exists: `source` = this device generated a
 * QR for another device, `destination` = this device imported the
 * identity from a scanned QR. Either direction proves the same account
 * lives on two devices, so the reassurance nudge has nothing left to
 * say and retires.
 */
export async function memberHasPairedDevice(): Promise<boolean> {
  return (await listPairings()).length > 0;
}

export async function isKeepAccessNudgeDismissed(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.keepAccessNudgeDismissed);
  return value === DISMISSED_VALUE;
}

export async function dismissKeepAccessNudge(): Promise<void> {
  await setSetting(SETTING_KEYS.keepAccessNudgeDismissed, DISMISSED_VALUE);
}
