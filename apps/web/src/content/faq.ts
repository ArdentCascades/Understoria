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
          "After the help actually happens, both of you tap Confirm " +
            "on the post detail page. The credit only moves once " +
            "you've both confirmed.",
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
            "review on the post detail page. That surfaces it on the " +
            "Disputes page, where the community can help sort it out — " +
            "there are no admins. Credit stays pending until it's " +
            "resolved.",
          "You're not stuck waiting forever, either. If your community " +
            "has auto-confirmation turned on, the community node steps " +
            "in after the agreed waiting period and completes a " +
            "confirmation that's clearly just been forgotten, so " +
            "nobody's credit sits in limbo indefinitely.",
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
        id: "install-app",
        question: "Can I install Understoria like an app?",
        answer: [
          "Yes. Understoria is a web app you can put on your home " +
            "screen like any other app: you get an icon, it opens " +
            "full-screen without the browser bars, it starts faster, " +
            "and it keeps working offline.",
          "On iPhone or iPad, open Understoria in Safari, tap the " +
            "Share button, and choose 'Add to Home Screen.'",
          "On Android, open it in Chrome, tap the menu (⋮) in the " +
            "top corner, and choose 'Add to Home screen' or 'Install " +
            "app.'",
          "On a desktop browser, look for the install icon at the " +
            "right end of the address bar.",
          "One thing to know before you install: on iPhone and iPad " +
            "the installed app gets its OWN separate storage, so it " +
            "starts out signed out even though the browser copy is " +
            "signed in — nothing is lost, you just have two separate " +
            "'devices' on one phone. The installed app asks about " +
            "this on its very first screen: choose 'I already use " +
            "Understoria in this phone's browser' and it walks you " +
            "through bringing your identity over, step by step. (On " +
            "Android and desktop the installed app shares the " +
            "browser's storage, so you stay signed in.)",
        ],
      },
      {
        id: "new-device",
        question: "How do I move to a new device?",
        answer: [
          "On the device that already has your identity, go to " +
            "Profile → Add another device. It shows six words. On the " +
            "new device, pick the pairing option on the welcome screen " +
            "and type those six words, in order — that's the whole " +
            "transfer. The words are good for 15 minutes and work " +
            "exactly once; your community node relays the encrypted " +
            "bundle but can never read it. (No node, or offline? " +
            "There's a QR option one tap away that goes device to " +
            "device with nothing stored anywhere.)",
          "Two things don't come along: your message history (messages " +
            "are encrypted to each device's own keys, so they stay " +
            "where they were received) and per-device settings like " +
            "theme and text size. Everything that lives on the shared " +
            "community record — posts, exchanges, vouches — shows up " +
            "on the new device through the normal sync.",
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
          "You can also show an invite as a QR code for in-person " +
            "sharing. Each invite is single-use, expires on its own, " +
            "and can be revoked from Profile → Invites until it's " +
            "redeemed. When someone joins on your invite, that counts " +
            "as you vouching for them — your name backs their join, so " +
            "invite people you actually know.",
        ],
      },
      {
        id: "how-vouching-works",
        question: "How does vouching work?",
        answer: [
          "A vouch is a signed public statement that you know this " +
            "person and stand behind their place in the community. " +
            "Someone becomes 'trusted' once two different members " +
            "have vouched for them — and inviting someone counts as " +
            "your vouch automatically, so vouching by hand is how " +
            "you back a person someone else brought in.",
          "You vouch from a member's page: tap their name anywhere " +
            "in the app and look for the Vouch section. The button " +
            "shows when your vouch would actually add trust — you're " +
            "trusted yourself, they're still gathering vouches, and " +
            "you haven't vouched for them already. Otherwise the " +
            "section explains why not, so you're never guessing.",
          "It's worth a moment's thought: your name backs theirs, " +
            "visibly and permanently — a vouch can't be taken back " +
            "in the app. If you later regret one, the path is a " +
            "conversation with your community, not a button. Vouch " +
            "for people you actually know.",
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
            "single exchange, you can open a dispute from Profile → " +
            "Disputes — disputes go through the community's open " +
            "proposal process, because there are no admins to take " +
            "the call for you.",
          "And if what you need is simply distance from someone, " +
            "blocking is always available too — see 'What if someone " +
            "is bothering me?' under Messages.",
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
            "exchange history. Peer communities receive the signed " +
            "records you publish — posts, confirmed exchanges, events — " +
            "under your public key, not your display name. Because " +
            "exchanges federate, a peer node can see your key's " +
            "exchange activity and work out its balance; what never " +
            "leaves your community are RSVPs, shift signups, project " +
            "tasks, blocks, drafts, and messages.",
          "Direct messages are different: they're end-to-end encrypted " +
            "between your device and the other person's, so only the " +
            "two of you can read them — not the node, not other " +
            "members. See 'How do I message another member?' under " +
            "Messages for the details.",
        ],
      },
    ],
  },
  {
    id: "messages",
    title: "Messages",
    entries: [
      {
        id: "message-someone",
        question: "How do I message another member?",
        answer: [
          "Open any post and tap the Message button to reach out — it " +
            "goes to the poster, or, if it's your own post, to the " +
            "person helping you. You can also start a conversation " +
            "from a member's page, or open Messages in the navigation " +
            "to see all your conversations and search through them.",
          "Messages are end-to-end encrypted and travel device to " +
            "device. Only you and the person you're writing to can " +
            "read them — the community node passes them along but " +
            "can't see inside.",
          "There are deliberately no read receipts and no typing " +
            "indicators. Nobody can see when (or whether) you've read " +
            "a message, and nobody is watching you compose a reply. " +
            "Read when you read, answer when you have capacity — the " +
            "app won't tell on you either way.",
        ],
      },
      {
        id: "someone-bothering-me",
        question: "What if someone is bothering me?",
        answer: [
          "You can block them. Open your conversation with them and " +
            "choose Block contact from the menu at the top, or use " +
            "the block option on their member page.",
          "Blocking is immediate and private. You stop seeing their " +
            "posts, events, comments, and messages, and neither of " +
            "you can message, vouch for, claim from, or invite the " +
            "other anymore. They are not told — there's no " +
            "notification, no mark on their profile, nothing anyone " +
            "else can see.",
          "Blocking does NOT file a complaint. No moderator is " +
            "alerted, no dispute opens, and past exchanges stay as " +
            "they were. If you want the community to weigh in, file " +
            "a dispute from Profile → Disputes — blocking and a " +
            "dispute work fine together. The block gives you quiet " +
            "now; the dispute follows the community process at its " +
            "own pace.",
          "You can review, edit, or undo your blocks any time in " +
            "Settings → Blocked contacts.",
        ],
      },
    ],
  },
  {
    id: "events",
    title: "Events and the calendar",
    entries: [
      {
        id: "community-events",
        question: "How do community events work?",
        answer: [
          "Anyone can create an event: open the Calendar and tap the " +
            "+ button. Give it a time, a place, and a description, " +
            "and it appears on the community calendar for everyone.",
          "Tap an event to RSVP — going, maybe, or not going. Your " +
            "RSVP stays on this community's node: the organizer and " +
            "the other people who RSVP'd can see your name, members " +
            "who haven't RSVP'd see only the counts, and peer " +
            "communities never see your RSVP at all. If you change " +
            "your answer to 'not going', your name comes off the " +
            "list right away.",
          "Some events also have shifts — time slots where the " +
            "organizer needs a certain number of hands, like a " +
            "setup crew or a serving rota. Signing up for a shift " +
            "also RSVPs you 'going' to the event. The shift roster " +
            "works like the RSVP list: it stays on this " +
            "community's node, and changing your RSVP to 'not " +
            "going' takes you off any shifts too.",
          "Events can't be edited after they're created — a signed " +
            "event stays exactly what people said yes to. If the " +
            "details change, the organizer cancels it and posts a " +
            "new one. When an event you RSVP'd to is cancelled, " +
            "you'll see a note about it (with the organizer's " +
            "reason, if they gave one) the next time you open the " +
            "app.",
        ],
      },
    ],
  },
  {
    id: "projects",
    title: "Projects and tasks",
    entries: [
      {
        id: "task-follows",
        question: "Why does a task say 'Follows: …'?",
        answer: [
          "Tasks in a project can be sequenced. 'Follows' means this " +
            "task naturally comes after another one — pour the " +
            "foundation before you frame the walls. Nothing is stuck " +
            "and nobody is in anyone's way; it's just an order.",
          "You can still claim a follows-task whenever you like. The " +
            "only difference is that the app deliberately won't check " +
            "in with you about it until the earlier task is done — " +
            "there's no point asking how it's going when the " +
            "groundwork it builds on isn't there yet. The system " +
            "waits with you, not on you.",
        ],
      },
    ],
  },
] as const;
