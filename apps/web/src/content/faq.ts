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

// Task-oriented FAQ that complements the conceptual MEMBER_GUIDE.
// Members hit this when they have a specific "how do I..." or "what
// if..." question; the guide is for "what is this and why does it
// work this way."
//
// Lives outside the i18n locales for the same reason as the member
// guide — long-form prose translation is a separate workstream from
// UI string translation (see docs/roadmap.md). English-only for now.
//
// IDs become URL fragments — `/help#confirm-exchange` — so changing
// them breaks links members may have shared. Add new entries
// freely; rename existing ones with care.

export interface FaqEntry {
  id: string;
  question: string;
  answer: readonly string[];
}

export interface FaqSection {
  id: string;
  title: string;
  entries: readonly FaqEntry[];
}

export const FAQ_SECTIONS: readonly FaqSection[] = [
  {
    id: "posts",
    title: "Posts and exchanges",
    entries: [
      {
        id: "post-something",
        question: "How do I post a need or an offer?",
        answer: [
          "On the Board, tap the green + Post a need or + Post an offer " +
            "button at the bottom of the screen. Add a short title, " +
            "describe what you need or can give, and post it. You can " +
            "edit or cancel it later from the post's detail page.",
        ],
      },
      {
        id: "claim-post",
        question: "How do I claim someone else's post?",
        answer: [
          "Tap any post on the Board to open its detail page, then tap " +
            "Claim. The post moves into 'awaiting confirmation' state " +
            "and the poster gets a chance to confirm before any credit " +
            "moves.",
          "If you change your mind, you can release the claim from the " +
            "same page — the post reopens for someone else.",
        ],
      },
      {
        id: "confirm-exchange",
        question: "How does confirming an exchange work?",
        answer: [
          "After the help actually happens, both parties tap Confirm " +
            "on the post detail page. The credit only moves once both " +
            "of you have confirmed.",
          "The order doesn't matter — one of you confirms first, the " +
            "other sees the post is waiting on them, and confirms when " +
            "they're ready.",
        ],
      },
      {
        id: "other-not-confirmed",
        question: "The other person hasn't confirmed yet. What should I do?",
        answer: [
          "First, check in with them outside the app. Most of the time " +
            "it's a forgotten tap, not a refusal.",
          "If there's a real disagreement about whether the exchange " +
            "happened or whether it counted as full help, use Flag for " +
            "review on the post detail page. A community mediator can " +
            "help sort it out; credits stay pending until then.",
        ],
      },
      {
        id: "cancel-post",
        question: "How do I cancel a post I no longer need?",
        answer: [
          "Open the post (from the Board or from your profile's " +
            "history) and tap Cancel post. Cancelled posts stay visible " +
            "so the community can see what was asked or offered, but " +
            "they can't be claimed.",
        ],
      },
    ],
  },
  {
    id: "balance",
    title: "Balance and credits",
    entries: [
      {
        id: "what-is-balance",
        question: "What does my balance mean?",
        answer: [
          "Your balance is the running total of hours you've given " +
            "minus hours you've received. Everyone starts at 5 (the " +
            "seed credit), so a brand-new member is at 5, not 0.",
          "A negative balance is fine — asking for help isn't debt. " +
            "Balances are visible to your community but they aren't a " +
            "score, and there is no leaderboard.",
        ],
      },
      {
        id: "negative-balance",
        question: "Can my balance go negative?",
        answer: [
          "Yes. Receiving more than you've given is part of how mutual " +
            "aid works — the network is meant to flow. The community " +
            "will only see a flag if the daily exchange limit is " +
            "approached or a pattern looks unusual; otherwise nobody " +
            "is policing your number.",
        ],
      },
    ],
  },
  {
    id: "identity",
    title: "Your identity and devices",
    entries: [
      {
        id: "change-name",
        question: "How do I change my display name or neighborhood?",
        answer: [
          "Profile → Edit details. Names are labels, not credentials, " +
            "so you can change yours whenever you want. Your cryptographic " +
            "identity stays the same.",
        ],
      },
      {
        id: "lost-passphrase",
        question: "What happens if I lose my passphrase?",
        answer: [
          "There is no recovery, by design. The trade is: no central " +
            "authority can read your data, and so no central authority " +
            "can rescue it either.",
          "If this worries you, the safest path is to pick a passphrase " +
            "you can remember and to write it down somewhere offline. " +
            "If you do lose access, the only remaining option is Profile " +
            "→ Emergency → Hard purge, which wipes the device and lets " +
            "you start over with a fresh identity. You won't get your " +
            "old credit history back.",
        ],
      },
      {
        id: "new-device",
        question: "How do I move to a new device?",
        answer: [
          "Multi-device key transfer isn't in the app yet. For now, the " +
            "practical path is: on the new device, accept a fresh invite " +
            "from a community member you trust, then ask them to vouch " +
            "for you under the new identity. Your old device's history " +
            "stays on the old device.",
        ],
      },
    ],
  },
  {
    id: "community",
    title: "Community and invites",
    entries: [
      {
        id: "invite-someone",
        question: "How do I invite someone?",
        answer: [
          "Profile → Invites → Generate invite. You'll get a single-use " +
            "link. Share it in person, by Signal, or in any channel " +
            "where you can confirm it actually reached the person you " +
            "meant. Don't post invite links publicly.",
        ],
      },
      {
        id: "disagree-with-member",
        question: "What if I disagree with another member?",
        answer: [
          "Talk to them first. Most disagreements aren't about the app " +
            "and don't need the app's involvement.",
          "If it's about a specific exchange, use Flag for review on " +
            "the post detail page. If it's about behaviour beyond a " +
            "single exchange, raise it in whatever channel your " +
            "community uses for disputes — there are no admins to take " +
            "the call for you.",
        ],
      },
      {
        id: "lurking-ok",
        question: "Can I just browse without posting anything?",
        answer: [
          "Yes. Reading what others are offering and asking for is a " +
            "valid way to participate. Some members lurk for weeks " +
            "before posting their first need; some never post and just " +
            "respond to others. Both are welcome.",
        ],
      },
      {
        id: "who-sees-what",
        question: "Who can see what I post?",
        answer: [
          "Everyone in your community node can see your posts, your " +
            "display name, your neighborhood (if you set one), and your " +
            "exchange history. Other communities can see federated " +
            "posts you publish, but they can't see your balance or " +
            "your activity history.",
          "There is no direct messaging in the app yet — coordination " +
            "happens out-of-band (Signal, in person, whatever your " +
            "community uses).",
        ],
      },
    ],
  },
] as const;
