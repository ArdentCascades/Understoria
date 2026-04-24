# Member Guide

> **Audience:** anyone in a community that has decided to use Understoria.
> You do not need to know anything about apps, cryptography, or
> timebanking. If any of this is unclear, tell a community coordinator —
> the guide is supposed to work for you.

Understoria is a way for our community to ask for help, offer help, and
keep track of what we do for each other. One hour of help equals one
hour of help — no matter what kind of work it is.

This guide walks through the main things you'll do.

---

## 1. Getting in

Someone in the community sends you an **invite link**. It looks like
`https://our-community.example/invite#...` and is good for 14 days.

1. Open the link on your phone.
2. The app shows you the inviter's name and a short key fingerprint
   (a string like `xPfj…3kQ7`). Ask the person who sent you the link
   whether that fingerprint matches what they see on their end — in
   person, over Signal, or over a phone call. A mismatch means
   something went wrong; don't accept the invite.
3. If the fingerprint matches, choose a **display name** (a nickname is
   fine, many people use them) and tap **Accept invite and join**.

That's it. You're a member. The app stores your identity locally on
this device. There is no username or password.

## 2. Your starting credits

Every new member starts with **5 hours** of time credits. This means
you can ask for help before you've given any. That's on purpose:
nobody should have to earn permission to need something.

Your balance shows on your **Profile** page. It can go below zero —
the app does not stop you from asking when you're low. The community
decides how far the collective should stretch, not the software.

## 3. The board

Tap **Board** at the bottom of the screen. You'll see two tabs:

- **Needs** — things people are asking for.
- **Offers** — things people are offering.

Each post card shows what the post is, who posted it, about how many
hours it'll take, and how urgent it is. Tap any card to see the full
details.

### Filters

Use the dropdowns at the top of the board to narrow down by
**category** (food, transport, childcare, emotional support, and so on)
or **urgency**. The search box searches titles and descriptions.

## 4. Posting a need

Near the bottom of the board, tap **Post a need**.

Fill in:

- **Title** — a short line, like "Ride to clinic Thursday afternoon."
- **Description** — details that will help someone decide whether they
  can help. Timing, accessibility, what to bring, anything you want
  the other person to know.
- **Category** — pick the closest fit. "Other" is fine if nothing
  matches.
- **Estimated hours** — your best guess. It doesn't have to be exact.
- **Urgency** — "When you can" is fine for most things. "Soon" and
  "Urgent" let the community know when timing matters.
- **Expires in (days)** — optional. Leave blank if there's no deadline.

Tap **Post to the board**. Your need is live.

## 5. Posting an offer

Same flow, but tap **Post an offer** instead. Use this when you have
something you can share — an afternoon to help with childcare, extra
soup you cooked, a skill you're willing to teach.

Don't over-promise. If your week fills up, you can cancel an offer
from the post detail page.

## 6. Claiming a post

When you see a need you can help with, tap the post to open it, then
tap **Offer to help**. A confirmation asks you to be sure.

When you see an offer you want to receive, tap **Claim this offer**.

Once you've claimed, you're **matched**. Now it's time to actually do
the thing. Figure out how you'll coordinate — many people use the
messaging app they already share with the other person (Signal is a
good choice).

## 7. Confirming an exchange

After the help has actually happened, both of you confirm it:

1. Open the post.
2. Tap **Confirm it's complete**.
3. The other person does the same.

Once both of you have confirmed, the hours move between your balances
and the exchange is recorded.

If something went wrong — you didn't receive what was promised, or the
other person didn't show — tap **Something's wrong — flag it**
instead. A community mediator will reach out.

## 8. Your Profile page

Tap **Profile** to see:

- **Your balance** and a note about what it means.
- **About you** — display name, skills, availability, neighborhood
  area. You can edit any of these any time.
- **Invites you've issued** — once you've been in the community a
  while, you can generate invite links for people you want to bring
  in. (See §9.)
- **Community roles** you've earned — things like "First Exchange,"
  "Connector," "Listener." These are ways of naming what you've done,
  not a ranking.
- **Your exchange history** — every give or receive, with who and when.
- **Security** — turn on a passphrase for your identity (§10).
- **Emergency** — panic buttons in case a device is at risk (§11).

## 9. Inviting someone new

Two vouches turn a new member into a **trusted** member. Your invite
counts as the first; someone else will need to vouch for them after
they join.

1. Go to **Profile → Invites you've issued**.
2. Tap **Generate invite link**.
3. Copy the link and send it to one person over a trusted channel —
   Signal, in person, or written down. Not email, not plain text
   message, not a group chat where other people can see.
4. Tell them what the inviter-key fingerprint looks like (the app
   shows it) so they can verify when they open the link.

You can revoke an unredeemed invite from the same page if you change
your mind.

## 10. Setting a passphrase

If your phone has full-disk encryption on and a strong lock screen,
you're already in decent shape. Setting a passphrase on top of that
means that even if someone gets around your phone's lock, they can't
use your Understoria identity without your passphrase.

1. **Profile → Security → Enable passphrase protection.**
2. Type a passphrase. At least 8 characters. A four-word phrase from
   a password manager is ideal.
3. **Write it down somewhere safe.** There is no recovery. If you
   forget it, your identity on this device is gone.

From then on, the app asks for the passphrase every time you open it.

You can **Change** or **Disable** protection from the same page. There
is also a **Lock now** button if you need to hand the device to
someone briefly.

## 11. If the device is at risk

**Profile → Emergency** has two panic buttons.

- **Soft purge** — blanks out all the names, descriptions, and areas.
  Your signed exchange history stays intact. Use this if the device
  will briefly be in hostile hands.
- **Hard purge** — wipes everything on this device, including your
  identity. The page reloads as a fresh install. **Unrecoverable.**

Both happen entirely on this device. Neither contacts a server.

## 12. FAQ

**What if nobody responds to my post?** Bump it. Repost with more
detail. Tell a coordinator. Nobody gets everything they need, but if
you keep being invisible, that's a community conversation.

**What if I don't want to give my real name?** Pseudonyms are fine
and common. The software was designed this way on purpose.

**Can my boss see my activity?** Not from outside the community.
Don't use Understoria on an employer-owned device or network —
that's a separate problem the software can't solve. See the
[Opsec Guide](opsec-guide.md).

**What if someone I don't like is in the community?** Tell a
moderator. The [Code of Conduct](../CODE_OF_CONDUCT.md) describes the
conflict-resolution process.

**What if I give a lot and never receive?** That's a community
conversation too. The dashboard is designed to surface whether aid is
really reaching everyone. If it isn't, we adjust.

**Where does my data live?** On your device, in the browser's
storage. Nothing leaves this device without you knowing — the only
thing that does is encrypted messages to people you explicitly
message, in a future release.

**Is it really free?** Yes. The software is AGPL-3.0-or-later. No
advertisements, no subscriptions, no data sale. If your community
runs a server, that may cost someone a few dollars a month to host —
ask your coordinator.

---

*If something in this guide is unclear, that's our fault. Tell a
coordinator what confused you so we can fix it.*
