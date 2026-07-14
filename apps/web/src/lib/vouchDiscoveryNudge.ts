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
import {
  trustStatusWithInvites,
  verifyVouch,
  type SignedVouch,
} from "@/lib/vouch";
import type { InviteRow } from "@/db/database";

// This nudge fires at most once, for one moment: when the member
// has just been welcomed into trust by someone vouching for them.
// It points at the action without asking for it. Dismissal is
// permanent (no-notifications: the member said no, we heard them).
// Self-retires if the member vouches for someone before dismissing.
// We never re-prompt, never count vouches, never gamify trust —
// see solidarity-not-shame.

const DISMISSED_VALUE = "1";

/**
 * The current member has been welcomed into trust — i.e. they have
 * the `trusted` status as computed against the full vouch + invite
 * context. This is the same predicate used everywhere else in the
 * app (`trustStatusWithInvites` from `lib/vouch.ts`) so we never
 * disagree with the trust UI a member sees on their own profile.
 */
export function memberIsTrusted(
  memberKey: string | null,
  vouches: readonly SignedVouch[],
  invites: readonly InviteRow[],
  founderRoots?: ReadonlySet<string>,
): boolean {
  if (!memberKey) return false;
  return (
    trustStatusWithInvites(memberKey, { vouches, invites, founderRoots }) ===
    "trusted"
  );
}

/**
 * Has this member ever vouched for anyone? Self-retire trigger:
 * the action the nudge points at has been performed, so the nudge
 * has done its job. We verify the signature so a malformed row in
 * Dexie can't accidentally retire the nudge — only a valid signed
 * vouch authored by this member counts.
 */
export function memberHasVouchedForSomeone(
  memberKey: string,
  vouches: readonly SignedVouch[],
): boolean {
  return vouches.some(
    (v) => v.voucherKey === memberKey && verifyVouch(v),
  );
}

export async function isVouchDiscoveryNudgeDismissed(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.vouchDiscoveryNudgeDismissed);
  return value === DISMISSED_VALUE;
}

export async function dismissVouchDiscoveryNudge(): Promise<void> {
  await setSetting(
    SETTING_KEYS.vouchDiscoveryNudgeDismissed,
    DISMISSED_VALUE,
  );
}
