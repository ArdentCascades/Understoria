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
// Lives outside the i18n locales because long-form prose translation
// is a separate workstream from UI string translation — see
// docs/roadmap.md "i18n debt compounding" in the failure-modes
// section. English-only for now.

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
      "You can protect your device-side keys with a passphrase. If you " +
        "lose your passphrase, no one can recover it for you. That's " +
        "the trade — there is no central authority who can read your " +
        "data, and that means there is no central authority who can " +
        "rescue it either.",
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
      "Decisions in the community are made together, not by admins. " +
        "Currently this happens on whatever channel your community " +
        "uses — a meeting, a thread, a shared doc. In-app proposal and " +
        "dispute tooling is on the roadmap.",
      "If a moderator role exists in your community, they can issue " +
        "warnings and temporary suspensions with two co-signatures, " +
        "and propose permanent removals to the full group. Every " +
        "moderation action is logged publicly.",
      "Appeals go to a different set of members than the original " +
        "decision. See GOVERNANCE.md for the full process.",
    ],
  },
  {
    id: "where-from-here",
    title: "Where to go from here",
    body: [
      "Open the Board to see what neighbors are offering and asking " +
        "for right now.",
      "Open the Dashboard to see how your community is doing — total " +
        "hours exchanged, who's connecting different parts of the " +
        "network, what's been celebrated.",
      "Open Profile to update your skills and availability, invite " +
        "someone new, or read the longer guides on disk.",
    ],
  },
] as const;
