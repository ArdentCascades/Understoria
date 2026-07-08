# Passkey restore — a new phone, nothing but your passkey

Status: **design proposal — NOT built, awaiting a community
decision.** Phase 1 (passkey *unlock*, PR #375) shipped without any
server change; this phase is separated out precisely because it
changes what the community's node stores. Nothing here should be
implemented until the community has read the trade-offs below and
said yes — ideally as an in-app proposal, the same way other
node-posture questions travel.

## 1. The gap this closes

The recovery ladder today (`docs/identity-recovery.md`):

1. **A second linked device** — the best answer, when it exists.
2. **A recovery kit** — a file or printed QR, encrypted under a
   kit passphrase. Excellent, but it must have been made in
   advance, kept findable, and its passphrase remembered.
3. **Guardian shards** — social recovery; needs guardians chosen in
   advance and reachable now.
4. None of those → a fresh identity, history orphaned.

Every rung requires *preparation the member did while things were
fine*. The Helene scenario makes the miss concrete: a member's only
phone drowns. They never exported a kit; their guardians are
scattered by the same storm. But their **passkey survived** —
platform passkeys sync through the member's iCloud Keychain /
Google Password Manager account, and a brand-new phone signed into
the same platform account already holds it.

Phase 2 turns that surviving passkey into a recovery root: a new
phone, the installed app, one biometric tap, identity back.

## 2. The mechanism

**While things are fine** (opt-in, from Settings → Security, only
offered where a passkey is already enrolled):

1. The device evaluates the passkey's PRF with a **fresh random
   restore salt** — deliberately NOT the unlock salt, so the two
   derived keys are independent (domain separation; neither
   ceremony's output opens the other's blob).
2. It derives a restore key (HKDF, its own info string) and
   encrypts a **restore bundle** — the same fields as the recovery
   kit (`lib/recoveryKit.ts`): secret key, public key, display
   name, community id, node URLs. Same secretbox primitives, no new
   cryptography.
3. It derives a **lookup handle** from the credential id (HKDF,
   a third info string) and uploads `{handle, restoreSalt,
   ciphertext, memberSignature}` to the community node — a new
   record kind, `PasskeyRestoreVault`, one per member,
   last-writer-wins by the signing key, delivered via the normal
   outbox and replicated to mirrors like any record (so restore
   works at a storm hub too).

**On the drowned-phone day:**

1. The member installs the app (community domain or hub WiFi) and
   taps "Restore with passkey" on the Welcome screen.
2. A discoverable-credential assertion (no `allowCredentials` — the
   fresh phone doesn't know the id yet) returns the credential id
   and the PRF output for the restore salt… except the salt lives
   on the node. So the flow is two steps: assert once with no PRF
   to learn the credential id → derive the handle → fetch
   `{restoreSalt, ciphertext}` → assert again evaluating PRF with
   that salt → derive the restore key → decrypt. Two biometric
   taps, zero typing.
3. The identity lands exactly as a recovery-kit restore does today
   (same code path from that point), and normal sync repopulates
   the board, ledger, and roster.

## 3. Why this is safe to put on the node (and what the node learns)

- **The node holds ciphertext it can never open.** The restore key
  comes from the passkey's PRF — 32 uniform bytes gated behind
  platform user verification. Unlike a passphrase-encrypted blob,
  there is **nothing to brute-force offline**: no human-chosen
  secret is in the loop. (This is exactly why we do NOT offer
  "store your recovery kit on the node" — kit passphrases are
  human-chosen and a server-side copy would be a dictionary-attack
  target. The passkey version has no dictionary.)
- **The handle is a bearer capability, not an identity.** It's
  HKDF(credential id), so the node (and anyone who can read the
  fetch endpoint) sees a stable pseudonymous key per member. The
  fetch route must work for a phone that has no member identity
  yet, so it is public the way `/health` is — mitigated by the
  handle being unguessable and the payload being ciphertext.
  Honest cost: an observer who obtains a member's handle can
  confirm a vault exists and watch its update times. Named in
  §5 as decision point 2.
- **Revocation is real.** Removing the passkey (Settings →
  Security) or disabling protection deletes the vault (signed
  tombstone through the outbox). Hard purge deletes it. A member
  who loses trust in their platform account deletes the vault and
  still has every other recovery rung.
- **The platform account becomes a recovery root — say it out
  loud.** Whoever controls the member's iCloud/Google account (and
  can pass its biometric/PIN) can restore this identity on their
  own phone. That is the same trust the member already places in
  passkey sync for their bank; it is NOT the same as today's
  Understoria posture, where no third platform is in any recovery
  path. This is the single biggest reason this phase is a
  community decision and per-member opt-in, default OFF.

## 4. What it does not change

- Identity and record signing: untouched (the Ed25519 key is what's
  *inside* the bundle; WebAuthn still signs nothing federated).
- The existing recovery ladder: untouched and still recommended —
  this adds a rung, replaces none. Kit and guardians remain the
  platform-independent answers.
- Phase-1 unlock: independent. Unlock never touches the network;
  a member can use unlock without ever creating a vault.

## 5. The decision points for the community

1. **Should the community's node hold encrypted identity copies at
   all?** (The privacy-posture question. Everything else is
   downstream of a yes.)
2. **Public fetch route** (capability-URL style, works for
   identity-less phones, required for the feature to function) —
   acceptable, given the ciphertext-only payload?
3. **Default off, per-member opt-in** with a consent card that
   names the platform-account trade in plain words — is the
   proposed consent copy strong enough?
4. **Retention**: vaults refresh on enrollment changes; should
   stale vaults (no refresh for N months) expire?

## 6. Implementation sketch (for when/if the community says yes)

Server: `passkey_restore_vaults` table (handle PK, member key,
salt, ciphertext, signature, timestamps); `POST /restore-vaults`
(signed, member-gated, insert-capped, LWW by signer);
`GET /restore-vaults/:handle` (public route, READ_AUTH-exempt like
`/health`); tombstone kind for deletion; peerPull feed with
composite cursors. Web: vault build/refresh in the passkey
Settings block behind the consent card; "Restore with passkey" on
Welcome beside the recovery-kit path, sharing its restore tail;
threat-model §7 entry; operator-powers note (operator holds
ciphertext + handle metadata, can deny service but never read).
Discoverable credentials: phase-1 enrollment already requests
`residentKey: "preferred"`; the vault flow requires discoverable,
so vault creation re-checks and says so when the credential isn't.

## 7. Relationship to open work

Ships nothing until decided. If adopted, it slots beside the
recovery kit in `docs/identity-recovery.md` as rung 2b, and the
storm-hub runbook (`docs/offline-resilience.md` §4) gains one line:
vaults replicate to the hub like everything else, so passkey
restore works in the shelter.
