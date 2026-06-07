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
// before Agent 16. If the device shows real evidence of prior use —
// at least one signed record authored by a LOCAL member — silently
// mark the device as onboarded so they don't get a welcome flow for
// software they already know.
//
// "Member row exists" is NOT enough on its own: a device that just
// accepted an invite has a member row before any federation pull,
// before any signed record — and we still want that member to see
// the welcome concept screens + profile-setup step. Checking for an
// authored signed record (exchange, vouch, or post) discriminates
// returning users from freshly-invited ones.
export async function backfillOnboardedForExistingUsers(): Promise<void> {
  if (await isOnboarded()) return;
  const localKeys = new Set(
    (await db.members.toArray()).map((m) => m.publicKey),
  );
  if (localKeys.size === 0) return;

  // First match wins — we only need to know whether ANY signed record
  // was authored locally, not which one. `.find()` walks the table
  // and stops at the first hit, so cost is bounded even on big stores.
  const authoredExchange = await db.exchanges
    .filter((e) => localKeys.has(e.helperKey) || localKeys.has(e.helpedKey))
    .first();
  if (authoredExchange) {
    await markOnboarded();
    return;
  }
  const authoredVouch = await db.vouches
    .filter((v) => localKeys.has(v.voucherKey))
    .first();
  if (authoredVouch) {
    await markOnboarded();
    return;
  }
  const authoredPost = await db.posts
    .filter((p) => localKeys.has(p.postedBy))
    .first();
  if (authoredPost) {
    await markOnboarded();
    return;
  }
}
