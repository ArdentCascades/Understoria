# Understoria — Device Pairing (design note)

> **Status:** design note. This document is the predicate for the
> implementation PRs; no code in this branch. Pairs with the
> threat-model §7 entry "Device pairing widens the identity-key
> surface" and the existing entry on QR codes as camera-surveillance
> targets (introduced for the invite share sheet, PR #91 family). Read
> alongside `docs/privacy-policy.md` §3 and `docs/auto-confirm-key.md`
> for the analogous values-tension precedent.

---

## 1. Problem

A member who wants to use Understoria from more than one device today
has only two choices, both bad:

1. **Two identities.** Treat the phone and the laptop as separate
   members. Two avatars on the Board, two seed grants, two key
   fingerprints. The community sees two presences of one person and
   has no way to know they're the same. Vouches don't transfer; trust
   accumulates per-identity.
2. **Use only one device.** The mutual-aid use case explicitly
   includes members who do organizing work at a laptop and respond to
   needs from a phone. Forcing one or the other is the wrong answer.

Neither is good enough now that pilot deployments exist. A real
community member with a laptop and a phone should be one member.

The question this document answers is **how the Ed25519 identity
keypair gets onto a second device** while preserving the existing
threat-model commitments — specifically, that the community node
never sees a member's private key, that camera-surveillance attacks
are explicitly mitigated, and that the failure modes are intelligible
to members deciding whether to commit.

## 2. Constraint: identity = key

Understoria's identity model is bare: an Ed25519 keypair signs every
record the member authors. Federation relies on the signature, not on
a server-side session. There is no "log in with a passkey" shortcut
that lets a second device act as the member without having the
keypair on hand — the second device needs the secret bytes to sign
new exchanges, vouches, and DM cipher ceremonies. Authentication
schemes that don't transport the key transport nothing useful.

The design problem is therefore about **key transport** — getting
the 64-byte NaCl Ed25519 secretKey from device A to device B without
the community node, a peer node, an attacker on the network, or an
adversary holding camera footage of the room learning the bytes.

## 3. The values tension

Three principles pull in different directions:

- **`privacy-precondition`** says the threat model is the floor.
  Surveillance, employer retaliation, and state interference are
  routine — not edge cases — for the populations this app serves.
- **`solidarity-not-shame`** says the system shouldn't punish members
  for normal life patterns. Owning a phone *and* a laptop is normal.
- **`community-authority`** says technical decisions should not
  silently move trust onto third parties. Cloud key sync via Apple /
  Google / 1Password — the obvious passkey path — relocates a portion
  of the trust onto whoever holds the keychain. That's not nothing:
  a passkey provider compelled by subpoena or court order to share
  a member's keychain is a real adversary in our §3 list, just
  outside the current technical surface.

The shipped invite-QR work (PR #91 family) navigated this same
tension and converged on a specific posture: opt-in QR display
gated behind a camera-awareness prompt, a "send without showing"
alternative path, no persistent state on the server, no
clipboard-paste of the secret. Device pairing extends that posture;
it does not invent a new one.

## 4. Decision: local-only QR transfer

Device pairing in v1 ships as **local-only QR transfer**:

- Source device generates a fresh per-transfer wrapping passphrase
  and wraps the Ed25519 keypair + profile fields.
- The wrapped envelope is rendered as a QR code on the source
  device.
- Destination device captures the QR via the device camera
  (`BarcodeDetector` where available, paste-from-clipboard fallback),
  collects the wrapping passphrase from the member (typed or read
  aloud from the source device), unwraps, and imports.
- The wrapped envelope never leaves the source device's screen and
  the destination device's memory. The community node sees nothing.
- The wrapping passphrase is **single-use** — destroyed after the
  import completes, even on the source device, which only ever held
  it in component state.

The passkey-PRF path (server-stored wrapped envelope decryptable
only via WebAuthn ceremony) is **deferred** to a future design doc.
It may turn out to be the right answer once pilot communities have
operated long enough to surface where QR transfer is too
inconvenient. It is not the right answer for the first ship.

The reason isn't that passkey-PRF is wrong — it's that it changes
the values posture meaningfully (the community node now stores
wrapped identity bytes; trust delegates to whoever holds the
keychain) and the right way to make that decision is with pilot
signal in hand, not in the abstract.

## 5. Cryptographic design

### 5.1 Envelope shape

```
envelope = {
  version:    1,                      // version byte for forward compat
  salt:       32 random bytes,        // fresh per transfer
  nonce:      24 random bytes,        // fresh per transfer
  ciphertext: nacl.secretbox(plaintext, nonce, scrypt(passphrase, salt))
}

plaintext (JSON, parsed after unwrap) = {
  version:    1,
  secretKey:  base64(NaCl Ed25519 64-byte secretKey),
  publicKey:  base64(Ed25519 32-byte publicKey),      // sanity-check
  profile:    {
    displayName,
    skills,
    availability,
    availabilityChips,
    locationZone
  },
  issuedAt:   ms epoch,
  expiresAt:  issuedAt + 5*60*1000,                  // 5-minute window
}
```

### 5.2 Why these primitives

- **scrypt for passphrase wrapping** matches the existing
  per-device passphrase wrapping in `apps/web/src/lib/passphrase.ts`.
  Same parameters (N=32768, r=8, p=1, 32-byte derived key). Reusing
  the helper is mandatory — a second wrapping scheme would
  proliferate the surface a future security review has to cover.
- **NaCl secretbox** (XSalsa20-Poly1305) over the resulting key.
  Authenticated encryption end-to-end on the envelope; tampering
  with the ciphertext is detectable on unwrap.
- **Fresh salt + nonce per transfer.** No reuse, ever — even
  on retry the source device generates new values.
- **5-minute `expiresAt`.** Enforced on the destination after a
  successful unwrap. A captured QR is useless after the window even
  if the passphrase is known.

### 5.3 Passphrase generation

The source device generates a **6-word BIP39-style passphrase**
from a 2048-word wordlist. ~66 bits of entropy; combined with
scrypt's cost, offline cracking inside the 5-minute window is not
feasible. The member never picks this passphrase — it's generated,
displayed, and conveyed to the destination by reading aloud or
typing.

Specifically, we do NOT:

- Use the member's existing per-device session passphrase as the
  wrap key. The session passphrase is the member's secret; the
  transfer passphrase is a one-time token. Conflating them would
  mean reading the session passphrase aloud, which is the wrong
  shape.
- Offer "copy passphrase to clipboard." Clipboard managers persist.
  The flow has to feel awkward enough that members type or read it
  rather than paste it.
- Allow member-chosen passphrases. Weak choices would defeat the
  scrypt cost; entropy has to be guaranteed.

### 5.4 Sizing

Approximate ciphertext size:

- secretKey (64) + publicKey (32) + profile (~200) + JSON
  framing (~80) → plaintext ~376 bytes.
- + secretbox auth tag 16, base64 inflation ~1.33x → ~520 chars
  for the ciphertext.
- + salt 32 + nonce 24, base64 + framing → envelope ~620 chars total.

Fits comfortably in a medium-density QR (alphanumeric ~2900 char
ceiling). No tiling, no multi-QR sequencing.

## 6. UX — source device (the device that already has the identity)

### 6.1 Entry point

`Profile → Add another device`. The affordance is intentionally
placed alongside the existing emergency / panic-button section, not
next to invites or "share my profile" — pairing a device is more
sensitive than either.

### 6.2 Comparison card (before the camera-warning gate)

Before any QR appears, the source device shows a comparison card
laying out exactly what does and doesn't transfer. The card is
the first screen of the flow — members see consequences *before*
they commit, not after the QR is on screen.

The card content (final copy goes in en + es locale files; this
is the spec):

```
What follows you to the new device

  ✓  Your identity            Both devices sign as the same member.
  ✓  Your profile             Display name, skills, availability, area.
  ✓  Your balance and history Visible on both devices — these live in
                              the community ledger, not on your device.

What stays on this device

  ◯  Direct messages          DMs are end-to-end encrypted to this
                              device. The new device starts fresh.
  ◯  Drafts in progress       Local-only on purpose. Finish or copy
                              anything you don't want to lose first.
  ◯  Theme and density        Per-device on purpose — your eyes, not
                              your identity.
  ◯  Achievements             These rebuild on the new device once it
                              syncs with the community.

  [ Cancel ]    [ Continue → ]
```

Copy decisions worth flagging:

- **"Your balance and history"** under ✓ is a chance to teach a
  newcomer that the ledger is federated, not per-device. Many
  members will not have internalised this; the comparison card is
  the right moment.
- **"DMs start fresh"** rather than "DMs don't transfer." The first
  tells the member what to expect; the second tells them what's
  missing. Both are true; the first is kinder.
- **"Drafts in progress"** is a real loss vector. Naming it gives
  the member a chance to save the draft post or proposal *before*
  pairing, rather than discovering it gone later.
- No bullet for **the seed grant**. Seed grants accrue to the
  identity, not the device. The "balance and history" bullet
  already covers it.

### 6.3 Camera-surveillance awareness gate

After the comparison card and before the QR is generated, the
camera gate from the invite share sheet (see threat-model §7,
"QR codes are camera-surveillance targets") fires. Copy is sharper
because the stakes are higher:

```
Heads up: this QR is your identity for 5 minutes.

Security cameras, doorbell cams, and webcams can read QR codes from
across a room. Once it's on screen, anyone in camera view can save it
and replay it within the next 5 minutes — even after you close this
screen. With the passphrase, that gives them everything: your name,
your history, the ability to sign as you.

Do this in a room you control. If you're not sure, cancel.

  [ Cancel ]    [ Show the QR ]
```

Note: unlike the invite share gate, there is **no** "send without
showing" escape hatch. For invites, the URL is small enough to type
into Signal; the hatch routes it through `navigator.share` /
clipboard so the URL never lands on a framebuffer. For device
pairing the envelope is several hundred bytes of base64 — typing it
defeats the purpose, and clipboard-routing into a second device's
text field reintroduces the persistence problem the invite hatch
was designed to avoid. The threat model concludes there is no safe
non-QR channel for this transfer; the room-control discipline is
the mitigation.

### 6.4 Display screen

After the member confirms "Show the QR":

- The 6-word transfer passphrase appears in a large, readable
  monospaced font, segmented visually for spoken delivery
  (`canvas | river | toolbox | yellow | march | empty`).
- The QR appears below the passphrase.
- A live countdown ticks down from 5:00 (mm:ss).
- Two actions: **"I'm done"** (member confirms the other device
  imported successfully) and **"Cancel"** (abort and discard).
- At T=0, the QR and passphrase auto-dismiss regardless. The
  screen reverts to the comparison card so a member who looked
  away doesn't return to readable identity material.

The wrapped envelope and the transfer passphrase are held in
**component state only** — not localStorage, not IndexedDB, not
sessionStorage, not the service worker. On cancel, on completion,
on auto-dismiss, on route change, the state is dropped.

### 6.5 Why no auto-pair / no real-time ack

The source device cannot tell whether the destination device
imported successfully. We deliberately do not:

- Open a long-poll to the community node ("the other device
  pinged us — you're done"). That would put pairing state on the
  server, which is exactly what this design avoids.
- Use BroadcastChannel / WebRTC peer discovery. Both add code with
  no values win for the threat model.

The "I'm done" button is therefore a member assertion, not a system
confirmation. The screen auto-dismisses at 5 minutes regardless,
which is the actual security property.

## 7. UX — destination device (the new device)

### 7.1 Entry point

The Welcome flow gains a third path. Today's flow offers two:
"I have an invite" and "Start a new community" (the operator
path). After this change:

- I have an invite
- **I have another device** *(new)*
- Start a new community

### 7.2 Capture

The "I have another device" screen offers two capture modes,
detected at runtime:

- **Camera scan** via `BarcodeDetector` API (Chrome / Edge, Safari
  18+, Firefox 137+). Permission is requested at scan time, not at
  page load. If permission is denied, the page falls back silently
  to the paste path.
- **Paste from clipboard** as the universal fallback. The QR
  payload is base64url and pastes cleanly even on devices that
  can't activate the camera.

### 7.3 Passphrase entry

After capture succeeds, the destination prompts for the 6-word
transfer passphrase. The input is six labelled text boxes with
autocomplete drawn from the BIP39 wordlist (this is also how every
hardware-wallet recovery UI behaves; members familiar with crypto
recognise the shape, and members who aren't get autocomplete to
help).

### 7.4 Unwrap and import

On submit, the destination:

1. Re-derives the scrypt key from passphrase + envelope salt.
2. Calls `nacl.secretbox.open` on the ciphertext.
3. If unwrap fails: "These words don't match. Check each one."
   (Distinct error: malformed input vs. wrong passphrase. Both
   tell the member to verify what they typed.)
4. Parses the plaintext JSON.
5. Checks `expiresAt`. If past: "This transfer is more than 5
   minutes old. Ask the other device to start over."
6. Sanity-checks `publicKey === derive(secretKey).publicKey` —
   guards against malformed input that survived secretbox.
7. Prompts the member to set a **session passphrase** for this
   device. The transfer passphrase is single-use; the session
   passphrase is the member's own choice for unlocking the local
   key on this device going forward.
8. Re-wraps the imported secretKey under the new session
   passphrase via the existing `lib/passphrase.ts` flow and writes
   the member row + wrapped key to IndexedDB.
9. Calls `markOnboarded()` and sets `currentMember`.
10. Navigates to the Board.

### 7.5 The brief "what to expect" reminder

The destination shows a one-paragraph reminder on the bootstrap
success screen, immediately before landing on the Board:

```
You're in. A few things this device starts without:

  • No DM history. Direct messages are encrypted to whichever
    device received them. Anything from before today will only
    appear on the other device.
  • No drafts. The other device may have unsaved posts or
    proposals; those don't follow.
  • No theme or density preferences. Set them in Profile →
    Settings if you want them to match.

Achievements rebuild on their own as this device syncs with the
community.

  [ Continue to the Board ]
```

This is the "no, your DM history isn't broken — it's working as
designed" surface. The cost is one extra screen; the value is
converting a potential support question into a fact the member
already knew.

## 8. What gets transferred — full list

**Transferred:** identity (Ed25519 keypair), profile (displayName,
skills, availability, availabilityChips, locationZone).

**Not transferred:**

- Direct messages. E2E encrypted to specific device keys; no
  re-encryption flow exists.
- Drafts. Local-only on purpose.
- Settings: theme, density, text size, dismissed nudges, hint
  banners, mirror-consent state, community node URL setting.
- Achievements (regenerate from federated records on first
  sync).
- Federation cursors (regenerate on first sync).
- The session passphrase or its wrapping. The destination
  device's session passphrase is set by the member at pairing
  time.

**Not in scope for v1** (may be added later, each requires its
own threat-model entry):

- DM history transfer. Would need a second-device public-key
  re-encryption flow that does not exist today.
- Cross-device sync of drafts. Likely never — drafts are
  intentionally local.

## 9. Operational properties after pairing

After a successful pair, both devices hold the same identity
keypair. Notable consequences:

- **Both devices can sign as the member.** Outbox conflicts are
  fine because record IDs are deterministic from canonical
  payloads; the community node dedups on insert. Concurrent
  signing of distinct exchanges from each device is fine; there
  is no "primary" device.
- **No revocation.** Ed25519 has no key-revocation mechanism in
  the protocol. If a paired device is lost or stolen, the
  member's only path is the existing hard-purge (rotate to a new
  identity, lose all signed history attribution). The comparison
  card and the threat-model entry both name this.
- **Pairing is one-way per session.** A single source device can
  pair multiple destinations sequentially, but each pairing is a
  fresh transfer with its own envelope. There is no "pair group"
  concept.

## 10. Out of scope

- **Multi-party transfer** (one phone → many destinations in a
  single ceremony). Not common; adds complexity.
- **Persistent re-sync after pairing.** Each device pulls
  federation independently; no special channel between paired
  devices.
- **Web-Bluetooth / NFC transfer.** QR is universal; specialised
  channels add code with no values win for the threat model.
- **Passkey-PRF / WebAuthn-derived wrapping.** Tracked as
  future work pending pilot signal.

## 11. Threat-model and privacy-policy deltas

This design ships with two prose changes alongside the design doc:

- **`docs/threat-model.md` §7** adds an entry titled "Device
  pairing widens the identity-key surface" that extends the
  existing QR-camera entry, names the specific mitigations in
  §6.2–§6.4 above, and documents the rejected alternatives
  (server-stored wrapped envelope, real-time ack, "send without
  showing" hatch).
- **`docs/privacy-policy.md` §3** amends the "private key never
  leaves the device" claim to read: "*Your private key, encrypted
  under your passphrase. We never see it; we cannot recover it.
  The only exception is the device-pairing flow you initiate —
  when you pair a second device, the key is wrapped under a fresh
  one-time passphrase and shown as a QR code on this device's
  screen. It is never transmitted to the community node or any
  third party.*"

Both edits land in the same PR as this design note so the values
posture is consistent at any commit that touches `main`.

## 12. Open questions

- **Wordlist locale.** BIP39 has standardised wordlists in many
  languages, including Spanish. The transfer passphrase entropy
  is constant either way; the question is whether the source
  device generates words in the member's PWA locale or always
  English. Recommendation: locale-matched, because the words are
  read aloud / typed; the locale match reduces transcription
  errors.
- **Camera permission UX on the destination.** If
  `BarcodeDetector` permission is denied at scan time, the
  current plan falls back silently to paste. An alternative is
  to surface a one-line note: "Camera blocked — paste the QR
  contents instead." Lean toward the explicit note.
- **Hard-purge after stolen-device suspicion.** Not strictly part
  of this design but worth surfacing in the member-facing copy
  on the comparison card: "If a paired device is lost, you can
  rotate identity from Profile → Emergency." Worth a UX review
  pass.

## 13. Implementation breakdown

- **PR 1 (this PR):** design note + threat-model §7 entry +
  privacy-policy §3 amendment. No code.
- **PR 2:** `lib/devicePairing.ts` + BIP39 wordlist data files +
  unit tests for wrap / unwrap / passphrase generation / expiry /
  version mismatch / replay. No UI.
- **PR 3:** Source UI (`Profile → Add another device` wizard,
  comparison card, camera gate, QR display, passphrase display,
  countdown) + destination UI (Welcome third path, camera scan +
  paste fallback, passphrase entry, bootstrap reminder).
- **Threat-model and privacy-policy edits land in PR 1** so
  reviewers can audit the values posture before any code reads
  or writes secretKey bytes.
