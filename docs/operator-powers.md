# What your node operator can and cannot do

This page is for **members**, not engineers. Someone in your
community runs the server ("the node") that your apps sync through.
Running it is real work and real trust — and trust works best when
everyone can see exactly how far it extends. This page names the
operator's powers plainly, so the community can govern them, instead
of leaving them implied.

## What the operator CANNOT do

- **Forge anything in your name.** Every record — posts, exchanges,
  RSVPs, project changes — is signed by the member who made it, with
  a key that never leaves that member's device. The operator cannot
  create, alter, or re-attribute a record. Your app checks every
  signature itself and silently drops anything that doesn't verify.
- **Read your direct messages.** Messages are end-to-end encrypted;
  the node relays ciphertext it cannot open.
- **Read a device-link transfer.** When you add a device, your
  identity crosses the node sealed to the new device's key; the node
  holds ciphertext for minutes and hands it out exactly once.
- **Quietly reassign authority.** A project stays its organizer's; an
  event stays its organizer's; your RSVP stays yours. The rules are
  checked by every member's app against signed records — not by the
  server's say-so.
- **Remove anyone from the community.** Member removal exists
  (`docs/member-removal.md`) and the operator appears NOWHERE in it:
  a removal takes a quorum of members co-signing one public record,
  and every device verifies the signatures itself. An operator who
  fabricated one would need the quorum's secret keys — which never
  leave those members' devices.

## What the operator CAN do (like any member)

The community's shared records — the board, events, project state,
rosters — are readable by every member; that mutual visibility *is*
the noticeboard. The operator, being a member, reads the same
records. Since member-authenticated reads shipped
(`docs/member-authenticated-reads.md`), *non-members* cannot: an
outsider with the node's URL gets `401`, and membership is proven by
the invite chain, not by an account the operator administers.

There is deliberately no dashboard, leaderboard, or per-member
history surface for anyone — operator included. The app refuses to
aggregate (see the threat model's permanent boundaries). A motivated
person could still tally by hand what their own device already
holds; that is inherent to a community whose members can see each
other, and no cipher changes it.

## What the operator can do that members cannot

Named plainly, with the honest remedies:

1. **See metadata.** Which network addresses connect and when, how
   much they transfer. The server deliberately logs almost nothing
   (no IPs, no member identifiers in logs), but a live operator
   watching the process can observe traffic. *Remedy: minimal
   logging is the default and the deploy guide keeps it that way;
   members with high exposure can reach the node through a VPN.*
2. **Withhold records.** The operator can't forge, but they could
   drop or selectively not serve records. Members' devices keep
   their own copies (nothing is lost), and gaps show — a member
   whose posts never appear for others will notice. *Remedy: any two
   members comparing screens detects it; the export path
   (Settings → export) plus a fresh node makes the community
   portable.*
3. **Turn the service off.** Hosting is a plug that can be pulled.
   *Remedy: every device holds the full community data; standing up
   a replacement node loses nothing but the URL.*
4. **Hold the membership roots.** With authenticated reads enabled,
   the operator configures the founding keys the invite chain grows
   from (`NODE_FOUNDER_KEYS`). Misconfiguring them locks members
   out of *reading* — visibly, loudly, and recoverably; it cannot
   expose anything or forge anyone. *Remedy: lockouts are noticed
   immediately (nobody can sync) and fixed by correcting one
   environment variable.*
5. **Hold the disk.** The node's database holds the community's
   shared records. With `DATABASE_KEY` set (see the operator guide),
   the file is encrypted at rest — a stolen backup, seized disk, or
   decommissioned SD card is unreadable. A live, root-compromised
   host still sees data in use; that is true of every server on
   earth. *Remedy: at-rest encryption on, backups of the key kept
   separately from backups of the file.*

## How communities keep this healthy

Structure beats vigilance:

- **Two operators are better than one — and now it's a mechanism,
  not just advice.** A second member can run a MIRROR node
  (`docs/community-resilience.md` Phase B): the two servers
  replicate every record continuously, and members' apps switch
  between them on their own when one is unreachable. No single
  person is "the one with the server," vacations don't take the
  community down, and there is no longer one household to pressure.
  Honesty note: a mirror's operator IS an operator — everything on
  this page applies to them too, and the app's consent card says so
  before a member's device adopts a mirror. The role should rotate
  the way any stewardship role does.
- **Operator transparency is built in.** `GET /config` publishes the
  operator's self-declared name, funding note, and contact — set at
  deploy, visible to every member in the app.
- **The exit is real.** Because every device carries the data and
  every record is signed, the community can leave a bad operator
  with an afternoon's work. That fact, known by everyone, is itself
  the strongest check.

## Where the deeper analysis lives

- `docs/member-authenticated-reads.md` — who can read the node, how
  membership is proven, why community-key encryption was weighed and
  set aside.
- `docs/threat-model.md` — the adversary-by-adversary analysis,
  including the §7 entry for authenticated reads and at-rest
  encryption.
- `docs/privacy-policy.md` — what leaves your device, ever, and to
  whom it is visible.
