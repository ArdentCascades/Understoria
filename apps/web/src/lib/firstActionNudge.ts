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
import type { Post } from "@/types";
import { getSetting, SETTING_KEYS, setSetting } from "@/db/database";

// Decides whether to show the "two ways to get started" nudge on
// Board. The trigger is "this member has neither posted nor
// claimed anything." Once they do either, the nudge stops showing
// on its own — no second nag. The dismiss flag only matters for
// members who want to lurk forever without ever taking action.

const DISMISSED_VALUE = "1";

/** Has this member done anything on the board yet? "Anything"
 *  means: created a post OR is the claimer on someone else's post.
 *  Confirmations, vouches, etc. don't count — by the time you've
 *  done one of those you've necessarily already posted or claimed.
 */
export function memberHasTakenFirstAction(
  memberKey: string,
  posts: readonly Post[],
): boolean {
  return posts.some(
    (p) => p.postedBy === memberKey || p.claimedBy === memberKey,
  );
}

export async function isFirstActionNudgeDismissed(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.firstActionNudgeDismissed);
  return value === DISMISSED_VALUE;
}

export async function dismissFirstActionNudge(): Promise<void> {
  await setSetting(SETTING_KEYS.firstActionNudgeDismissed, DISMISSED_VALUE);
}
