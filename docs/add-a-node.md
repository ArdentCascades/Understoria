# Add a node — grow another root

This is the guide behind the Dashboard resilience card's "Grow
another root" button. It is written for a community member who has
never run a server. If you want the full operator reference, it's
[`operator-guide.md`](./operator-guide.md); this page is the shorter
path and the honest picture.

## Why this matters (one minute)

When a community's coordination lives on one company's servers, there
is a physical way to break it: pressure the company, seize the
machine, knock on one person's door. Understoria removes that lever
twice over:

1. **Every member's device already carries the whole community** —
   every post, exchange, project, and roster, cryptographically
   signed. A seized server takes *nothing*; the community's history
   walks around in everyone's pockets.
2. **Nodes can multiply.** Any member can run one. Every extra node
   run by a different member in a different household means there is
   no single person an anti-union or anti-mutual-aid group can target
   to disrupt the community. Distributing the infrastructure
   distributes the target until there isn't one.

**What a second node gives you today:** automatic failover. Set up
as a MIRROR (below), the two servers replicate every record
continuously, and members' apps switch between them on their own —
nobody lifts a finger, nothing is lost. The Dashboard resilience
card counts it honestly: two reachable nodes is "Sturdy," three or
more is "Deep-rooted."

## What you need

- **A computer that can stay on.** An old laptop (lid shut, in a
  closet), a mini-PC, or a Raspberry-Pi-class board. The node is
  deliberately lightweight — a pilot community's whole database is
  smaller than one phone photo.
- **A home internet connection** and the ability to either forward a
  port on your router or use a tunneling service — the operator guide
  (§4, "Publish — the three options") walks through each with
  tradeoffs.
- **An afternoon**, plus a conversation with whoever runs your
  community's current node.

## The short version of the steps

1. **Install** — build from source per operator-guide §3 (Node.js +
   two commands), or use the Docker compose file in `deploy/`.
2. **Set the basics** — a `NODE_ID`, and set `DATABASE_KEY` from day
   one so the disk is encrypted at rest before any data touches it
   (operator-guide §6 env table).
3. **Match the community's trust settings** — the same
   `NODE_FOUNDER_KEYS` as the existing node, and `READ_AUTH=on` if
   (and only if) the community has flipped it: a second node must be
   exactly as closed to strangers as the first.
4. **Publish it** at an address members could reach
   (operator-guide §4).
5. **Pair the nodes as mirrors** — on each node, point
   `MIRROR_NODE_URLS` at the other (plus `MIRROR_READ_TOKENS` if the
   community runs `READ_AUTH=on`), and add your node's address to the
   existing node's `MIRROR_ANNOUNCE_URLS` so members' apps offer it
   on a consent card. The operator guide's mirror runbook (§6) has
   the exact lines. From then on the two servers replicate every
   record continuously, and members' apps fail over on their own —
   if either machine is ever lost, the community doesn't even pause,
   and a replacement node re-fills from the survivor.
6. **Read [`operator-powers.md`](./operator-powers.md).** Running a
   node makes you an operator, with the powers and limits that page
   names for your community. That transparency is part of the deal.

## Not ready to run a node? Be a seed vault

There is a zero-ops version of this whole page: open Settings →
Data on a device with room to spare (an old laptop, the tablet in a
drawer) and choose **"Keep the complete archive on this device."**
No port forwarding, no TLS, no operator powers — just storage and
solidarity. A seed vault never frees up space, keeps syncing like
any device, and counts on the resilience card ("2 servers · 3 seed
vaults") so the community can SEE how many complete copies exist.
If every server is ever lost, seed vaults are the best devices to
restore from (`community-reseed.md`). The pledge is public and
revocable; withdrawing it deletes nothing.

## Governance, not just hardware

A second node is also a social act: your community now has two
operators, which is the healthiest number (`operator-powers.md`,
"How communities keep this healthy"). Agree together on who holds
which keys, where the `DATABASE_KEY` copies live, and how often you
check in. The resilience the Dashboard card shows is made of exactly
these agreements plus a little electricity.
