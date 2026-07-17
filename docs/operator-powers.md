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
- **Read your direct messages.** Messages — typed or voice — are
  end-to-end encrypted between your device and the other person's.
  Delivery is a store-and-forward relay through the node
  (`docs/message-relay.md`): the operator's disk holds the sealed
  envelope until the recipient's device fetches it (bounded
  retention, about a month), and can never open it — contents,
  reactions, and the which-post-is-this-about reference all ride
  inside the ciphertext. The honest cost of any relay, named in the
  threat model: the operator *does* see who messaged whom, when, how
  often, and envelope sizes. (Board posts are different and public
  by design — a voice recording attached to a board post is
  community content the operator can play like any member.)
- **Read a device-link transfer — with one named exception.** When
  you add a device, your identity crosses the node sealed to the new
  device's key; the node holds ciphertext for minutes and hands it
  out exactly once. The honest caveat: on the tap-to-link path, an
  operator who is *actively* attacking during those minutes could
  substitute the ephemeral key your device seals to, and capture the
  transfer — a residual named in the threat model and
  `docs/device-pairing.md` §6.7. The word-code and QR paths don't
  have this hole: the QR never touches the server, and the word-code
  path ends in a fingerprint-compare screen on both devices that
  catches a swapped envelope. Linking by tap trusts your own
  community's node for those minutes; if you don't extend that
  trust, the other paths are one tap away.
- **Quietly reassign authority.** A project stays its organizer's; an
  event stays its organizer's; your RSVP stays yours. The rules are
  checked by every member's app against signed records — not by the
  server's say-so.
- **Remove anyone from the community.** Member removal exists
  (`docs/member-removal.md`) and the operator appears NOWHERE in it:
  a removal takes a quorum of members co-signing one public record.
  Your device checks the record's structure itself — real
  signatures, distinct signers, none of them the removed member,
  enough to meet the quorum. Honesty about the one thing your
  device *cannot* check: whether those signers are actually members.
  Only the node can compute membership (the founding keys aren't
  public), so a hostile operator could mint fresh keys and dress
  them up as a quorum. What keeps that survivable rather than
  silent: the removal record is public and permanently attributed —
  every member can see it and its signer keys, and signers nobody
  recognizes are the alarm; reinstatement needs only a genuine
  quorum; and a community whose node lies to it can leave that node
  (the exit below is real).

## What the operator CAN do (like any member)

The community's shared records — the board, events, project state,
rosters — are readable by every member; that mutual visibility *is*
the noticeboard. The operator, being a member, reads the same
records. With authenticated reads enabled
(`READ_AUTH=on` — the default since the secure-by-default change; an
operator must explicitly opt out with `READ_AUTH=off` for dev/demo
use; `docs/member-authenticated-reads.md`), *non-members* cannot: an
outsider with the node's URL gets `401`, and membership is proven by
the invite chain, not by an account the operator administers. On a
node that has opted out, the feeds remain readable to anyone
holding the URL.

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
   *Remedy: the community's devices collectively hold the data.
   Since storage windowing, a single device may keep only a recent
   window (`docs/storage-budget.md`) — but seed-vault pledges mark
   the members keeping full copies, and re-seeding a replacement
   node unions every device's records, so the community as a whole
   loses nothing but the URL.*
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
- **The exit is real.** Because the community's devices together
  carry the data — individual devices may hold only a window, and
  seed-vault pledges name who keeps full copies — and every record
  is signed, the community can leave a bad operator with an
  afternoon's work: a re-seed unions everyone's copies onto the new
  node. That fact, known by everyone, is itself the strongest check.

## Where the deeper analysis lives

- `docs/member-authenticated-reads.md` — who can read the node, how
  membership is proven, why community-key encryption was weighed and
  set aside.
- `docs/threat-model.md` — the adversary-by-adversary analysis,
  including the §7 entry for authenticated reads and at-rest
  encryption.
- `docs/privacy-policy.md` — what leaves your device, ever, and to
  whom it is visible.
