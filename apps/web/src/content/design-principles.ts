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

export interface DesignPrinciple {
  id: string;
  title: string;
  statement: string;
  example: string;
}

export const DESIGN_PRINCIPLES: readonly DesignPrinciple[] = [
  {
    id: "equal-time",
    title: "Equal time credits",
    statement:
      "One hour of help always equals one hour of credit, regardless of the type of work.",
    example:
      "Early timebanks that tried market-rate pricing found that emotional support and childcare — the work most often done by women and disabled members — was consistently valued lowest. Equal time is the structural fix.",
  },
  {
    id: "no-leaderboards",
    title: "No leaderboards or individual scores",
    statement:
      "Progress is tracked at the community level. The unit of measurement is us, not me.",
    example:
      "When Couchsurfing added a reputation score, hosts started gaming it and the most vulnerable guests — those who couldn’t reciprocate with high ratings — got frozen out of the system entirely.",
  },
  {
    id: "no-notifications",
    title: "No push notifications",
    statement:
      "We show what needs your attention when you open the app. No buzzing, no badge counts, no urgency theater.",
    example:
      "Studies of mutual aid groups during COVID showed that notification-driven platforms burned out the most active organizers first — the people communities could least afford to lose.",
  },
  {
    id: "solidarity-not-shame",
    title: "Solidarity, not shame",
    statement:
      "Never frame a situation as stalled, overdue, or failed. Capacity changes; the system adapts without blaming anyone.",
    example:
      "Gig economy platforms use “you’re falling behind” nudges to extract more labor. The workers most affected are those already dealing with a crisis — exactly the people mutual aid exists to support.",
  },
  {
    id: "community-authority",
    title: "The community is the authority",
    statement:
      "No admin role. Governance decisions go through community proposals, not individual power.",
    example:
      "Mondragón cooperatives demonstrated over 60+ years that worker governance outperforms manager governance on both equity and longevity. The role of “admin” is a design choice, not a necessity.",
  },
  {
    id: "asking-never-gated",
    title: "Asking for help is never gated",
    statement:
      "Every new member starts with seed credits. You can receive before you give.",
    example:
      "Timebanks that required earning before spending saw the most vulnerable members — the elderly, newly arrived, those in crisis — never ask for help. Seed credits are the structural fix.",
  },
  {
    id: "privacy-precondition",
    title: "Privacy is a precondition",
    statement:
      "No email, no phone number, minimal logging. Your identity is a cryptographic key on your device.",
    example:
      "Worker centers that used digital sign-in sheets had their membership lists subpoenaed or leaked to employers. Organizing requires that membership itself is protected, not just the content.",
  },
  {
    id: "deliberation-over-speed",
    title: "Deliberation over speed",
    statement:
      "Proposals stay open for a configurable period. Consensus needs time, not just a quorum.",
    example:
      "Rapid online votes in cooperatives consistently left night-shift workers, caregivers, and members with limited internet access unheard. The 3-day default deliberation window gives everyone a real chance to weigh in (communities can tune it, down to a 1-day floor).",
  },
  {
    id: "no-post-editing",
    title: "Why repost instead of edit",
    statement:
      "Posts are cryptographically signed at creation. Editing would break the signature that lets any node verify the post independently.",
    example:
      "Platforms that allow silent edits to posts create deniability problems — 'I never said that' becomes unresolvable. Immutable signed records plus a repost flow preserves both flexibility and accountability.",
  },
  {
    id: "no-read-receipts",
    title: "No read receipts on messages",
    statement:
      "We don't tell senders when their message was read. Who-talks-to-whom is the relationship graph the threat model protects most.",
    example:
      "WhatsApp's blue checkmarks created social pressure to respond immediately and enabled abusive partners to monitor response times. Removing read receipts removes the surveillance affordance entirely.",
  },
  {
    id: "no-activity-search",
    title: "No member search by activity",
    statement:
      "You can't search for 'who's been most active' or 'who helped the most.' Activity patterns are surveillance data.",
    example:
      "When Strava published aggregate activity heatmaps, they accidentally revealed the locations of secret military bases. Individual activity patterns are even more revealing — they show who is organizing, when, and with whom.",
  },
  {
    id: "follows-not-blocked",
    title: "Tasks 'follow' — they're never 'blocked'",
    statement:
      "A task waiting on another task is sequenced, not stuck. The framing shapes how people feel about the work.",
    example:
      "Project management tools that label tasks 'blocked' create a blame dynamic — someone is 'blocking' someone else. 'Follows' frames the same dependency as a natural sequence, removing the interpersonal friction.",
  },
];
