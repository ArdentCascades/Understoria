# Identity recovery — a lost phone should not mean a lost self

Status: **designed, not built.** This document is the implementation
plan. Companion docs: `docs/device-pairing.md` / tap-to-link (the
existing and still-best mitigation: a second linked device),
`docs/threat-model.md` (passphrase protection §7),
`docs/member-removal.md` (whose quorum machinery Phase 3 would
reuse), `docs/community-reseed.md`.

## 0. The gap

A member IS their Ed25519 keypair: balance, vouches, project roles,
authored history, and — since member-authenticated reads —
membership itself all hang off it. Today:

- **Second linked device** = full protection (identity + data live
  on both). This remains the headline recommendation everywhere.
- **Passphrase protection** protects the key AT REST on a device
  someone else holds — it recovers nothing when the device is gone.
- **One device, lost or dead** = the identity is unrecoverable.
  Hours earned, vouches received, organizer roles: gone. The member
  re-joins as a stranger via a new invite.

Not everyone has two devices. The people MOST likely to have exactly
one cheap phone are often the people mutual-aid communities exist
for — this gap is an equity gap, which is why it merits real work.

Design constraints, non-negotiable: **no custodial recovery** (no
"the node emails you a reset link" — the node must never hold key
material), **no weakening of the live key** (recovery paths must be
strictly offline/consensual artifacts), and **honesty in the UI**
about what each layer does and does not protect.

## 1. Phase K1 — the Recovery Kit (self-custody, ship first)

A file (and printable page) a member creates in
Profile → Security → "Create a recovery kit":

```jsonc
{
  "kind": "understoria-recovery-kit",
  "version": 1,
  "publicKey": "<b64>",
  "displayName": "…",
  "nodeId": "node_…",
  "communityNodeUrl": "https://…/api",
  "mirrors": ["https://…"],          // accepted mirrors at export time
  "createdAt": 1234567890,
  "secret": {                          // EXACTLY the existing wrap format
    "kdf": "pbkdf2-sha256",
    "iterations": 600000,
    "salt": "<b64>",
    "nonce": "<b64>",
    "box": "<b64>"                     // secretbox(secretKey, recoveryPassphrase)
  }
}
```

- **Reuses the shipped crypto wholesale**: the same
  PBKDF2-HMAC-SHA256 (600k) + NaCl secretbox wrap `db/secrets.ts`
  already implements for passphrase protection — no new primitives,
  no new dependency. The kit passphrase is CHOSEN AT EXPORT and
  deliberately independent of the session passphrase (a kit in a
  drawer shouldn't unlock just because someone shoulder-surfed the
  daily passphrase — and members without daily passphrases still get
  kits).
- **Two shapes, one payload:** a downloadable `.json` file, and a
  printable page (payload as a single QR — 32-byte secrets wrap to a
  comfortably scannable QR — plus the public key and community URL
  in human-readable text). Paper survives phone loss by definition.
- **Restore path:** Welcome screen gains "I have a recovery kit"
  beside the pairing options → scan/upload → passphrase → identity
  restored → node config adopted from the kit → the existing
  first-sync machinery (same as linked-device arrival) pulls the
  community history back. The member walks in as themselves.
- **What restore does NOT recover, said in the UI:** E2E messages
  (their ciphertext lives only on devices — key recovery restores
  the ABILITY to message, not old conversations), unsynced drafts,
  and anything a lost-forever community (no node, no other members)
  can't re-serve.
- **Metadata staleness:** node URLs in an old kit may be dead; the
  restore flow treats them as suggestions (editable field, health
  probe) not gospel. Identity keys never rotate, so the SECRET never
  goes stale — a kit from year one restores in year five.
- **Nudge, gently:** the existing keep-access nudge (which today
  points at pairing + passphrase) gains the kit as a third option,
  with the honest ordering: linked device ≥ kit > nothing.

Threats: kit theft (must also know the passphrase; KDF-bounded
brute force — same analysis as session passphrases; UI copy: store
it like a spare house key), passphrase forgotten (kit is inert —
stated at creation, twice), kit + passphrase both lost (you are
where you are today). Threat-model §7 entry required.

## 2. Phase K2 — Guardian shards (social recovery)

For members who can't safely keep a kit (no printer, shared
housing, seizure risk) — spread the trust across people instead:

- **Secret sharing:** Shamir k-of-n over the 32-byte secret key,
  GF(256), k=3/n=5 default (member-tunable within sane bounds,
  k ≥ 2, n ≤ 7). Implemented in-repo (~150 lines + published test
  vectors) rather than as a dependency — the dependency-audit bar
  (`threat-model.md` §8.3) is easier to clear for readable
  first-party code than for an npm tree.
- **Distribution rides the shipped E2E channel:** each shard is
  encrypted to a chosen guardian member's X25519 key (ed2curve —
  exactly the `db/messages.ts` construction) and delivered as a
  special message kind. The guardian's app stores it in a
  `guardianShards` table and shows a quiet permanent line in
  Profile: "You hold a recovery shard for Rosa (1 of 5, 3 needed)."
  Guardians consent before storing (accept/decline card — the
  informed-consent house style).
- **Recovery ceremony:** the member's NEW device mints a temporary
  keypair and displays it as QR + code words. The member contacts
  guardians out of band ("it's really me, I lost my phone"). Each
  guardian, in person or over a trusted call, opens "Release
  Rosa's shard", is shown deliberate friction copy (verify it's
  really her, really her asking, ideally face to face), then their
  app re-encrypts the shard to the temporary key and hands it over
  via QR (in person) or the node's existing device-link mailbox
  (opaque ciphertext, TTL'd, exactly its design). k shards →
  reconstruct → real identity restored → temp key discarded →
  guardians notified their shards are stale; the member re-shards.
- **Threats, honestly:** k colluding guardians CAN steal the
  identity — choosing guardians is choosing who you trust with
  your self; the picker copy says exactly that. Social engineering
  of guardians is the live attack (hence the friction + in-person
  bias). Guardian device loss silently erodes redundancy — the
  member's app periodically (and privately) checks shard-holder
  liveness via the message channel and nudges re-sharding below
  n-1. A guardian who is REMOVED from the community
  (`member-removal.md`) keeps their device data — the member is
  nudged to re-shard, rotating the removed guardian out.
- The node learns only what the mailbox already leaks: that two
  devices exchanged ciphertext. No shard metadata surface.

## 3. Phase K3 — community re-binding (design sketch only, deferred)

The last resort — no kit, no shards, no paired device: a quorum of
members attests "the person we know as Rosa now holds key B"
(`KeyRebind {oldKey, newKey, decidedAt, signatures[]}` riding the
`member-removal.md` quorum machinery). Deferred because its blast
radius is large and its guarantees are weaker:

- It re-binds MEMBERSHIP and display identity, but cannot re-sign
  history: balances, vouches, and LWW authority all reference the
  old key. Every consumer (balance derivation, project authority,
  RSVP natural keys, block lists) would need old→new aliasing —
  a cross-cutting change touching most of the data layer.
- It is exactly the record a socially-engineered quorum could abuse
  to hijack an account — a strictly worse failure than K2's
  guardian collusion because the VICTIM chose the guardians but not
  the quorum.

Decision: **do not build K3 until K1+K2 have shipped and a real
community asks for more.** The sketch lives here so the door is
visibly open and the reasons for waiting are on record.

## 4. Order of shipping + sizing

1. **K1** — small-to-medium PR: kit export/import, Welcome path,
   nudge update, en/es, tests (wrap round-trip, wrong passphrase,
   stale URL handling), threat-model §7.
2. **K2** — two PRs: (a) SSS + shard message kind + guardian
   storage/consent; (b) the recovery ceremony (temp key, release
   flow, mailbox leg, re-shard nudges). E2E: full lose-the-phone
   drill with three guardian contexts.
3. **K3** — not scheduled.

## 5. Threat-model / docs obligations (owed at implementation)

§7 entries per phase (kit-at-rest analysis mirroring the passphrase
entry; SSS parameters + in-repo implementation note + guardian
collusion bound; mailbox reuse note). Member-facing Help entries:
"What happens if I lose my phone?" gains the honest decision tree
(paired device → kit → guardians → new invite). `operator-powers.md`
unchanged — by design the operator appears NOWHERE in any recovery
path; say so explicitly.
