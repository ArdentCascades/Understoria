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
import type { Member } from "@/types";
import { getSetting, SETTING_KEYS, setSetting } from "@/db/database";

// Decides whether to show the "want to fill out your profile?"
// nudge on Board. Trigger is purely "they haven't set any of the
// optional profile fields yet" — we don't track whether they
// skipped the profile step during onboarding vs. just never got
// around to it. Either way the action is the same.

const DISMISSED_VALUE = "1";

export function profileIsBare(member: Member | null): boolean {
  if (!member) return false;
  const noZone = !member.locationZone || member.locationZone.trim() === "";
  const noSkills = !member.skills || member.skills.length === 0;
  const noAvailText =
    !member.availability || member.availability.trim() === "";
  const noAvailChips =
    !member.availabilityChips || member.availabilityChips.length === 0;
  // Setting either the free-text notes OR any chip satisfies the
  // "tell us when you're around" piece — chips alone are a complete
  // answer, including "Ask me anytime".
  const noAvail = noAvailText && noAvailChips;
  return noZone && noSkills && noAvail;
}

export async function isProfileNudgeDismissed(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.profileNudgeDismissed);
  return value === DISMISSED_VALUE;
}

export async function dismissProfileNudge(): Promise<void> {
  await setSetting(SETTING_KEYS.profileNudgeDismissed, DISMISSED_VALUE);
}
