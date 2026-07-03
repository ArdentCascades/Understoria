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
import { getSetting, setSetting } from "@/db/database";
import type { InviteRow } from "@/db/database";

// The persistent, dismissible not-joined affordance of
// `docs/invite-redemption.md` §5.1.4. A member who hit a redemption
// error and continued to the board anyway (or self-onboarded on an
// open node) is participating on an island: nothing they do can reach
// a community. The Board shows a QUIET card — "You haven't joined a
// community yet. Have an invite link?" — linking to /invite, which now
// carries the paste-the-link recovery input.
//
// It is an affordance, not a warning badge: no red, no countdown, no
// nagging cadence (solidarity-not-shame, no-notifications). Not having
// joined is a legitimate state, not a failure state.
//
// Dismissal is per-identity (the settings key embeds the member's
// public key, so a shared device with two identities tracks each
// separately) and permanent — the member said "I know", we heard them.
// The /invite route stays reachable from Settings regardless.

const DISMISSED_VALUE = "1";

/** Per-identity dismissal key. Lives in the Dexie settings table like
 *  the other nudge flags (cleared by hard purge); unlike them it is
 *  keyed by identity, per the §5.1.4 "per-identity and permanent"
 *  dismissal rule. */
export function notJoinedDismissKey(memberKey: string): string {
  return `notJoinedNudgeDismissed:${memberKey}`;
}

/**
 * Detection rule from §5.1.4: not-joined means no redeemed invite row
 * naming the current member AND no configured community node. Either
 * one is evidence of a community connection — a redeemed invite is
 * membership; a configured node means the member (or the §5.3
 * suggestion they confirmed) already wired this device to a community.
 */
export function isNotJoined(input: {
  memberKey: string | null;
  invites: Pick<InviteRow, "status" | "redeemedBy">[];
  communityNodeUrl: string;
}): boolean {
  if (!input.memberKey) return false; // no identity yet — Welcome's job
  if (input.communityNodeUrl.trim() !== "") return false;
  return !input.invites.some(
    (row) =>
      row.status === "redeemed" && row.redeemedBy === input.memberKey,
  );
}

export async function isNotJoinedNudgeDismissed(
  memberKey: string,
): Promise<boolean> {
  const value = await getSetting(notJoinedDismissKey(memberKey));
  return value === DISMISSED_VALUE;
}

export async function dismissNotJoinedNudge(
  memberKey: string,
): Promise<void> {
  await setSetting(notJoinedDismissKey(memberKey), DISMISSED_VALUE);
}
