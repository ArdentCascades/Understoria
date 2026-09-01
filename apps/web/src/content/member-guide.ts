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

// Condensed in-app member guide. Source of truth is
// docs/member-guide.md on disk; this file is the version that ships
// to members offline, kept short enough to read in a few minutes.
//
// Lives outside the i18n locales because long-form prose is authored
// content, not UI strings: this module carries English (the eager
// fallback), and every other shipped language has a
// member-guide.<code>.ts twin loaded through content/registry.ts —
// same ids, same section/paragraph structure, enforced by
// guides.parity.test.ts. Render through getMemberGuide(locale).

export interface GuideSection {
  id: string;
  title: string;
  body: readonly string[];
}

export const MEMBER_GUIDE: readonly GuideSection[] = [
  {
    id: "what-it-is",
    title: "What Understoria is",
    body: [
      "Understoria is a timebank: a way for a community to exchange " +
        "help, with every hour tracked equally. One hour of fixing a " +
        "sink equals one hour of listening to someone after a hard day.",
      "It is not an app for finding gigs. It is software that supports " +
        "an existing community — a workplace, a neighborhood, an " +
        "affinity group — that already trusts each other and wants a " +
        "lightweight way to keep mutual help visible.",
    ],
  },
  {
    id: "credits",
    title: "How credits work",
    body: [
      "Every new member starts with 5 hours of seed credit. You can ask " +
        "for help before you've given any. Asking is not debt — it's " +
        "how the network comes alive.",
      "When you help someone, both of you confirm the exchange. Your " +
        "balance goes up by the hours given; theirs goes down. No " +
        "money changes hands; no one keeps a running score.",
      "Your balance is computed from a signed log of every exchange. " +
        "If something looks wrong, you can audit it.",
    ],
  },
  {
    id: "identity",
    title: "Your identity",
    body: [
      "Your identity is a cryptographic key pair. There is no email, " +
        "phone number, or account password. Your display name is " +
        "whatever you choose — it's a label, not a credential.",
      "You can lock your device-side keys with your fingerprint, face, " +
        "or device PIN (a passkey — offered right in onboarding, and " +
        "it works with no internet at all), or with a passphrase you " +
        "type; you can also have both, with the passphrase as the " +
        "backup way in. Nothing about the lock is sent to Apple, " +
        "Google, or any server — the check happens on your device.",
      "If you lose your passphrase — or your phone with its " +
        "fingerprint lock — no one can recover it for you. That's the " +
        "trade — there is no central authority who can read your data, " +
        "and that means there is no central authority who can rescue " +
        "it either. What brings you back is a backup you made while " +
        "things were fine: a second paired device, guardians you " +
        "chose, or a recovery kit — each takes about a minute in " +
        "Settings.",
      "If you ever need to wipe everything fast — soft (anonymize) or " +
        "hard (start over) — there's a panic button in Profile under " +
        "Emergency.",
    ],
  },
  {
    id: "trust",
    title: "Trust and onboarding",
    body: [
      "New members need vouches from two existing members to become " +
        "fully trusted. When someone redeems your invite, that counts " +
        "as your implicit vouch.",
      "Members can post and claim help before they're fully trusted — " +
        "asking is never gated — but the community sees a chip showing " +
        "the trust state so they can extend a manual vouch where it's " +
        "warranted.",
    ],
  },
  {
    id: "governance",
    title: "Decisions and conflict",
    body: [
      "Decisions in the community are made together, not by admins — " +
        "there is deliberately no admin or moderator role in the app. " +
        "Community-wide choices go through open proposals: anyone can " +
        "raise one from Profile → Community proposals, everyone can " +
        "see it, and it stays open for a deliberation period before " +
        "it closes.",
      "Conflicts about a specific exchange go through the same " +
        "machinery: open a dispute from Profile → Community disputes " +
        "and it becomes a proposal the community weighs in on, with " +
        "the outcome applied automatically when it closes.",
      "Anything the app doesn't decide — norms, meeting rhythms, how " +
        "you talk to each other — happens on whatever channel your " +
        "community already uses. The app records decisions; it " +
        "doesn't replace the conversation.",
    ],
  },
  {
    id: "where-from-here",
    title: "Where to go from here",
    body: [
      "Open the Board to see what neighbors are offering and asking " +
        "for right now.",
      "Open the Dashboard to see how your community is doing — total " +
        "hours exchanged, where help is flowing, what's been " +
        "celebrated.",
      "Open Profile to update your skills and availability, invite " +
        "someone new, or read the longer guides on disk.",
    ],
  },
] as const;

import { getContentBundle } from "./registry";

/** The member guide in the given UI locale, English for any locale
 *  without a translated bundle. Synchronous by the same gate every
 *  content selector relies on (see content/registry.ts). */
export function getMemberGuide(
  locale: string | undefined,
): readonly GuideSection[] {
  return getContentBundle(locale).MEMBER_GUIDE;
}
