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

**What a second node gives you today, honestly:** a warm standby (a
complete replacement server, ready if the first is lost) and the
distributed-target effect above. Automatic switchover — where members'
apps quietly move to the second node with nobody lifting a finger —
is the designed next step (`community-resilience.md` Phase B) and the
Dashboard card will start counting higher when it lands. This guide
doesn't promise it before it exists.

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
5. **Read [`operator-powers.md`](./operator-powers.md).** Running a
   node makes you an operator, with the powers and limits that page
   names for your community. That transparency is part of the deal.

Until Phase B lands, the second node runs as a warm standby: back up
the primary's (encrypted) database file onto it on whatever cadence
your community likes, or simply keep it installed and ready — if the
primary is ever lost, you set your node's address in members' apps
(one settings field) and the community re-converges, with members'
devices re-pushing anything a stale backup missed. When Phase B
ships, the two nodes will replicate continuously and members' apps
will fail over on their own.

## Governance, not just hardware

A second node is also a social act: your community now has two
operators, which is the healthiest number (`operator-powers.md`,
"How communities keep this healthy"). Agree together on who holds
which keys, where the `DATABASE_KEY` copies live, and how often you
check in. The resilience the Dashboard card shows is made of exactly
these agreements plus a little electricity.
