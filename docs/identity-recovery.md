# Identity recovery — a lost phone should not mean a lost self

Status: **Phases K1 and K2 shipped** (K1: the recovery kit —
export in Settings, printable QR, and the Welcome "I have a
recovery kit" restore path. K2: guardian shards — Settings →
Guardians for setup/duties, "Recover with guardians" on the
restore page). **K3 deferred.** Companion docs: `docs/device-pairing.md` / tap-to-link (the
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

## 1. Phase K1 — the Recovery Kit (self-custody) — SHIPPED

Implemented as specified below: `lib/recoveryKit.ts` (build / strict
parse / restore, reusing `lib/passphrase.ts` byte-for-byte, with the
decrypted key verified against the named public key so a corrupted
kit fails closed), `RecoveryKitCard` in Settings (independent kit
passphrase, download + printable QR page), `/recover` linked from
the Welcome tour beside the pairing path (file upload or
paste-from-any-QR-scanner), restore mirroring the device-pairing
import guards (locked-device refusal, fresh-device-only adoption of
the kit's community coordinates), and the keep-access nudge naming
the kit as the paper backup. Original design, for the record:

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

## 2. Phase K2 — Guardian shards (social recovery) — SHIPPED

For members who can't safely keep a kit (no printer, shared
housing, seizure risk) — spread the trust across people instead.
As built (`lib/sss.ts`, `lib/guardianShards.ts`,
`GuardianShardsCard`, `GuardianRecoveryFlow`):

- **Secret sharing:** Shamir k-of-n over the 64-byte Ed25519
  secret key, GF(256), member-picked k and n within k ≥ 2, n ≤ 7.
  Implemented in-repo (~150 readable lines, per-byte fresh random
  coefficients, tested against subset/tamper/threshold cases)
  rather than as a dependency — the dependency-audit bar
  (`threat-model.md` §8.3) is easier to clear for first-party code
  than for an npm tree. Shamir provides NO integrity; the
  reconstruction is verified by re-deriving the public key from
  the reconstructed seed and requiring it to equal the owner's
  known key (`secretMatchesPublicKey` — the same anchor the
  recovery kit uses).
- **Delivery delta from the original design:** the plan above
  assumed shards could ride the E2E message channel. In the
  shipped codebase direct messages have NO transport — they are
  written locally only (no outbox kind, no federation pull, no
  node route). So every hand-off in K2 is **device-to-device**:
  QR scan or copy/paste via the same capture component device
  pairing uses. This is strictly LESS metadata than the mailbox
  design — the node appears nowhere in any leg of the ceremony,
  not even as a ciphertext relay.
- **Distribution:** each shard is sealed to the chosen guardian's
  X25519 key (ed2curve — the shared `crypto.ts` box construction)
  and shown to that guardian as a QR, one guardian at a time. The
  guardian accepts it in Settings → Guardians (decrypt-to-verify,
  then the row is stored still-encrypted in a `guardianShards`
  table keyed by owner); their card permanently lists "Rosa —
  piece 1 of 5, any 3 recover". Accepting is the consent; a
  guardian can drop the duty at any time.
- **Recovery ceremony:** the member's NEW device mints a temporary
  keypair and shows a request QR. The member contacts guardians
  out of band. Each guardian opens "Help recover", is shown
  deliberate friction copy (verify it's really her, face to face
  or on a call YOU place), scans the request, and their app
  re-encrypts their share to the temporary key and shows a release
  QR. The new device captures releases one by one (progress:
  "2 of 3 pieces"), reconstructs at threshold, verifies the key,
  and restores through the same core path as the recovery kit.
  The temp key lives only in that page's memory.
- **Threats, honestly:** k colluding guardians CAN steal the
  identity — choosing guardians is choosing who you trust with
  your self; the picker copy says exactly that. Social engineering
  of guardians is the live attack (hence the friction + in-person
  bias). Re-sharding does NOT revoke the old set: the key itself
  never rotates, so k old shards still reconstruct it — the UI
  says so and points a worried member at making a fresh account. A
  guardian who is REMOVED from the community keeps their device
  data — same honesty applies. Shard-holder liveness nudges from
  the original sketch are NOT built (there is no channel to check
  over); redundancy erosion is a member-visible fact in each
  guardian's duties list instead.
- On the guardian's device the share exists ONLY as ciphertext
  sealed owner→guardian; a guardian's stolen/imaged device without
  its unlocked key material yields nothing. `guardianShards` rows
  are relational (whom I guard), so soft purge clears them and
  data export excludes them.

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

## 3b. Passkey restore (design proposal — community decision)

A candidate rung between the kit and the shards: the member's
synced platform passkey (shipped for UNLOCK in
`lib/passkeyUnlock.ts`) opens a node-held, PRF-encrypted copy of
the identity — a brand-new phone recovers with two biometric taps
and zero preparation beyond having enrolled the passkey. It is the
only rung that would place anything in a server's care (ciphertext
the node can never open, but a real posture change) and it makes
the member's platform account a recovery root. Full design,
trade-offs, and the community decision points:
`docs/passkey-restore.md`. Not built until decided.

## 4. Order of shipping + sizing

1. **K1** — small-to-medium PR: kit export/import, Welcome path,
   nudge update, en/es, tests (wrap round-trip, wrong passphrase,
   stale URL handling), threat-model §7.
2. **K2** — SHIPPED (one PR: SSS + ceremony module + guardian
   card + recovery flow; the mailbox leg dissolved into
   device-to-device QR since messages have no transport). The
   ceremony is covered by multi-device unit drills (three guardian
   contexts simulated by wiping and re-seeding the test database
   between roles).
3. **K3** — not scheduled.

## 5. Threat-model / docs obligations (owed at implementation)

§7 entries per phase (kit-at-rest analysis mirroring the passphrase
entry; SSS parameters + in-repo implementation note + guardian
collusion bound; mailbox reuse note). Member-facing Help entries:
"What happens if I lose my phone?" gains the honest decision tree
(paired device → kit → guardians → new invite). `operator-powers.md`
unchanged — by design the operator appears NOWHERE in any recovery
path; say so explicitly.
