# Understoria — Device Pairing (design note)

> **Status:** **shipped.** Design note + threat-model §7 entry +
> privacy-policy §3 amendment landed in PR #162; crypto library + tests
> in PR #163; source-side wizard UI in PR #166; destination-side UI in
> PR #167; public-key fingerprint verification on both devices in
> PR #168; paired-device inventory on Profile in PR #169; "where to
> find the QR" directions in PR #170. Pairs with the threat-model §7
> entry "Device pairing widens the identity-key surface" and the
> existing entry on QR codes as camera-surveillance targets (introduced
> for the invite share sheet, PR #91 family). Read alongside
> `docs/privacy-policy.md` §3 and `docs/auto-confirm-key.md` for the
> analogous values-tension precedent.

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
  salt:       16 random bytes,        // fresh per transfer
  nonce:      24 random bytes,        // fresh per transfer
  ciphertext: nacl.secretbox(plaintext, nonce,
              pbkdf2_sha256(passphrase, salt, 600k iters))
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
                                                     // (15 min on the
                                                     // relayed paths)
  blocks?:            BlockRow[],                    // blocking.md §14.1
  previouslyBlocked?: PreviouslyBlockedRow[],
  communityNode?: { url, enabled },  // the member's community-node
                                     // connection. Their own prior
                                     // consent traveling with their
                                     // identity: adopted by the
                                     // destination ONLY when it has no
                                     // URL of its own, followed by an
                                     // immediate first federation pull.
                                     // Without this a linked device
                                     // arrives to an empty community —
                                     // every pull is gated on the
                                     // setting. Optional on the wire
                                     // (older sources omit it).
}
```

### 5.2 Why these primitives

- **PBKDF2-HMAC-SHA256 for passphrase wrapping** — the transfer
  envelope reuses `deriveMasterKey` from
  `apps/web/src/lib/passphrase.ts` verbatim: PBKDF2-HMAC-SHA256 at
  600,000 iterations (NIST current guidance), 16-byte salt, 32-byte
  derived key. Reusing the helper is mandatory — a second wrapping
  scheme would proliferate the surface a future security review has
  to cover. (Earlier drafts of this note said scrypt; the shipped
  shared helper is PBKDF2, and the doc follows the code.)
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
the 600k-iteration KDF cost, offline cracking inside the 5-minute window is not
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
  KDF cost; entropy has to be guaranteed.

### 5.4 Sizing

Approximate ciphertext size:

- secretKey (64) + publicKey (32) + profile (~200) + JSON
  framing (~80) → plaintext ~376 bytes.
- + secretbox auth tag 16, base64 inflation ~1.33x → ~520 chars
  for the ciphertext.
- + salt 16 + nonce 24, base64 + framing → envelope ~600 chars total.

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
defeats the purpose. v1 concluded there was no safe non-QR channel
for this transfer at all.

**Revision — the envelope copy hatch.** That v1 conclusion was
internally inconsistent: the destination's capture screen has
always offered paste-from-clipboard as a fallback (§7.2), which
implies the clipboard channel while giving it no sanctioned source
— and phone→desktop pairing (the common direction) was
camera-or-nothing, with cameraless desktops locked out entirely.
The revised position: the actual security boundary is the
**wrapped envelope + out-of-band passphrase**, not pixels-only
transport. The display screen therefore now offers a **copy
hatch — for the envelope only, never the passphrase** — behind a
disclosure that states plainly that clipboards can sync across
devices and persist in clipboard-manager history. The passphrase
keeps its speak-or-type-only channel, so the two halves cannot
travel the same route by our hand; the 5-minute expiry bounds an
honest client's use of a stale envelope; and on expiry / wizard
exit the clipboard is cleared best-effort (read-compare-clear, so a
member's later copy is never clobbered; both clipboard calls can be
denied by the browser and the clear is hygiene, not the boundary).
What remains deliberately out: a *shareable URL* form of the
envelope. A pairing link invites transit through chat threads —
persistent logs, notification previews, and the near-certainty
that the six words get typed into the same thread. Copy-paste is a
device-local act; a link is a message. Only the former ships.

### 6.4 Display screen

After the member confirms "Show the QR":

- The 6-word transfer passphrase appears in a large, readable
  monospaced font, segmented visually for spoken delivery
  (`canvas | river | toolbox | yellow | march | empty`).
- A short hex fingerprint of the member's public key
  (`1A2B 3C4D` — first 4 bytes of the Ed25519 public key, hex,
  one space) appears between the passphrase and the QR, labelled
  "Confirm on the other device." The destination shows the same
  string on its own confirm step (§7.4). The cryptographic
  identity check is already enforced by the unwrap path's
  `publickey_mismatch` reason; this string is human-visible
  signal for mistaken-pairing and mid-flow QR swap.
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

### 6.6 Node-relayed linking (the default transport)

**Revision.** The QR + split-channel design above optimizes for a
threat (cross-room camera capture of the envelope) at a UX cost that
field use showed to be unacceptable: same-phone pairing can't scan
at all, clipboard transport is broken on iOS, and the full flow is
ten steps across two apps against a five-minute clock. The revised
default is Signal-class device linking through the community node:

1. The source device generates the usual 6-word code and
   `wrapForTransfer` envelope (same KDF, same secretbox, same
   payload — but a **15-minute** expiry).
2. It derives an opaque **channel id** from the code —
   `hex(SHA-512(PBKDF2(code, "understoria-device-link-v1", 600k))[0..32])`
   — and POSTs `{channelId, envelope}` to `POST /api/device-link`.
3. The screen shows ONLY the six words. No QR, no envelope, no
   clipboard: the words are the one thing that travels by human.
4. The destination types the words. It derives the same channel id,
   claims the envelope with `GET /api/device-link/:channelId` —
   **one-shot: the row is deleted atomically with the read** — and
   unwraps with the same words. Fingerprint confirm and the import
   path are unchanged.

What the node sees: an opaque channel id and passphrase-wrapped
ciphertext, for at most 15 minutes, gone on first claim. It cannot
decrypt (the words never cross the wire), and it cannot cheaply
brute the channel id back to a code — testing one candidate code
costs the same PBKDF2-600k as an envelope-key guess, and the code
space is ~66 bits. Rows never federate; the mailbox has a row
ceiling and is pruned on every write.

The honest tradeoff, stated plainly: **in link mode the six words
alone are a bearer credential while the row lives.** They locate
AND decrypt. Whoever enters them first gets the identity — and
because the row is one-shot, a hijacked code makes the member's own
import visibly fail (a signal, not a silent fork). The display
screen says this in member language. The QR flow remains, one tap
away, as the offline path and the option for members who want the
split-channel property or nothing on the node at all.

Direction of trust vs. Signal: Signal authenticates the relay
exchange with a QR (a camera channel); we authenticate with the
code itself doing double duty, which is what makes the no-camera,
no-clipboard, type-6-words UX possible. Both accept "the relay
stores ciphertext" as the price of linking that ordinary people
complete.

### 6.7 Tap-to-link (the shipped default)

**Revision of the revision.** Field use of §6.6 showed that
same-phone word entry still forces per-word app switching (the
words display in one app and are typed in the other) and still ends
in a fingerprint quiz against a screen the member can no longer
see. The shipped default eliminates typing entirely by reversing
who carries information: **the new device asks; the member
approves with one tap on the device that already holds the
identity.**

Flow:

1. The NEW device generates a one-time X25519 keypair and POSTs
   only the public key to `POST /api/link-request`. The node files
   it under a salted, 4096-bucket fold of the requester's network
   address (same non-reversible posture as the rate limiter's
   buckets; raw IPs are never stored) with a 10-minute TTL. The
   screen shows a **two-emoji recognition badge** derived from the
   key, the "go approve it" steps, and a countdown, then polls its
   grant channel.
2. The member's SIGNED-IN device, on Profile → Add another device,
   polls `GET /api/link-request` — which returns pending requests
   *from the same address bucket only* — and renders each as a card
   with its badge and age. One tap on **Link it** seals the
   standard TransferPayload to the request's key (fresh-sender
   NaCl box) and parks it in the §6.6 one-shot mailbox under
   `hash(pubkey)`.
3. The new device's poll finds the grant, opens it with its
   one-time secret key, imports, and lands on **"You're in as
   {name}"** — no fingerprint stage (approval already happened on
   the trusted device), no mandatory lock-passphrase stage
   (Settings → Security offers locking later).

The rendezvous needs both devices behind the same public address —
always true on one phone, true at home for two devices. Different
networks (or iCloud Private Relay splitting the phone's own
traffic; a whole-device VPN is fine since both apps share its exit)
fall back to §6.6 words / §6 QR behind "Other ways to link."
Because this failure is otherwise SILENT — each side just sees
nothing happen — both screens surface a hint after 45 quiet seconds
naming the VPN/Private-Relay cause and pointing at the pause-it or
other-ways fixes.

Security properties, honestly ranked:

- The link request contains a public key and nothing else; a
  shoulder-surfer of the badge learns nothing usable. **Nothing on
  either screen is sensitive**, so the camera-awareness gate does
  not apply to this path.
- **No identity moves without the member's explicit tap on their
  signed-in device.** The waiting app can receive only what someone
  chooses to send it.
- Same-bucket strangers (shared Wi-Fi, CGNAT) can make a request
  APPEAR on the member's screen — the impersonation race. Guards:
  the badge match named in the card copy, visible request age, an
  explicit-choice list when more than one request is pending (no
  default), the 3-per-bucket cap, and the 10-minute TTL.
- Same-bucket strangers can also send the waiting app a **junk
  grant** (their own identity — never the member's, which they
  cannot obtain this way). Guard: the success screen leads with the
  imported display name and offers a two-tap full local wipe.
- **A malicious node operator can substitute the public key the
  member's device fetches** and thereby capture a transfer the
  member approves. The badge cannot prevent this (12 bits is
  grindable offline in milliseconds); no human-comparable string
  can. This is the named trust cost of tap-to-link, identical in
  kind to §6.6's brute-force residual but sharper: linking trusts
  the community's own node for those minutes. Members who do not
  extend that trust use the QR path, which involves no server.
- Grant transport inherits every §6.6 mailbox property: ciphertext
  only, one-shot atomic take, 15-minute TTL, non-federating,
  capped, pruned on write.

## 7. UX — destination device (the new device)

### 7.1 Entry point

The Welcome flow gains a third path. Today's flow offers two:
"I have an invite" and "Start a new community" (the operator
path). After this change:

- I have an invite
- **I have another device** *(new)*
- Start a new community

**Installed-arrival fork.** When the app launches as an *installed*
copy (home-screen app) with no identity, the Welcome flow prepends a
fork screen before the concept tour: "I already use Understoria in
this phone's browser" vs. "I'm new." Installed web apps get their
own isolated storage container, so a member who onboarded in the
browser lands in the installed copy signed out — without the fork,
the natural path is accidentally minting a duplicate identity. The
bring-my-identity card routes to `/pair-device?samePhone=1`, which
starts capture in same-phone mode (below). The fork has no Skip:
defaulting a returning member into a second identity is the failure
the screen exists to prevent.

### 7.2 Capture

**Default: word entry (§6.6).** The destination opens on six word
inputs with BIP39 autocomplete. Directions above them are journey-
aware (`?samePhone=1` says "flip to your browser"; the two-device
copy says "glance at the other screen"). Submitting derives the
channel id, claims the envelope from the node, and unwraps — one
typed thing, no camera, no clipboard. "Nothing waiting under these
words" covers typo, expiry, and already-claimed in one honest
message. A device that can't reach a node (the fresh device probes
`${origin}/api/health`, since the canonical deploy serves the PWA
from the node) is told so and pointed at the QR path below.

The QR capture screen remains behind a "scan a QR instead" link,
with two modes detected at runtime:

- **Camera scan** via `BarcodeDetector` API (Chrome / Edge, Safari
  18+, Firefox 137+). Permission is requested at scan time, not at
  page load. If permission is denied, the page falls back silently
  to the paste path.
- **Paste from clipboard** as the universal fallback. The QR
  payload is base64url and pastes cleanly even on devices that
  can't activate the camera. The sanctioned source is the display
  screen's gated copy hatch (§6.3) — the phone→desktop path.

**Same-phone mode** (`?samePhone=1`, reached from the installed-
arrival fork; both modes offer a link to the other): a phone cannot
scan its own screen, so this mode never opens the camera. It shows
numbered steps — open the browser, **write down the six words on
paper first** (leaving the source tab can cause a reload, which
regenerates the envelope and invalidates memorised words), copy the
code via the §6.3 hatch, return — and a one-tap paste button
(`navigator.clipboard.readText`, needs a user gesture) with the
manual paste box as the fallback when clipboard read is denied. The
security posture is unchanged from the copy hatch's: the clipboard
carries the wrapped envelope only; the passphrase travels on paper
or in the member's head, never alongside it.

Because the async clipboard API is unreliable on exactly the
platform this mode exists for (iOS standalone WebKit can leave
`readText()` pending forever; iOS Firefox can block `writeText`),
neither end may *depend* on it:

- The one-tap paste read is bounded (3s); timeout, denial, and
  empty clipboard all land on the manual paste box with focus and
  an honest hint — the button can never silently do nothing.
- Captured text is validated with `decodeEnvelope` at the capture
  step. Garbage (a URL, a partial copy) shows "that doesn't look
  like a pairing code" immediately instead of advancing the member
  into six words that can only fail.
- Pasting a valid code into the manual box captures on the paste
  event itself — no Continue tap — since native long-press paste
  works even where the JS API doesn't.
- The §6.3 hatch shows the envelope in a read-only select-all
  textarea alongside the Copy button, so native Select All → Copy
  remains available when programmatic copy is blocked. Same
  exposure posture as the QR (the envelope is already on screen);
  a natively-copied envelope is outside the best-effort unmount
  clear, which is hygiene, not the boundary.

### 7.3 Passphrase entry

After capture succeeds, the destination prompts for the 6-word
transfer passphrase. The input is six labelled text boxes with
autocomplete drawn from the BIP39 wordlist (this is also how every
hardware-wallet recovery UI behaves; members familiar with crypto
recognise the shape, and members who aren't get autocomplete to
help).

### 7.4 Unwrap and import

On submit, the destination:

1. Re-derives the PBKDF2 key from passphrase + envelope salt.
2. Calls `nacl.secretbox.open` on the ciphertext.
3. If unwrap fails: "These words don't match. Check each one."
   (Distinct error: malformed input vs. wrong passphrase. Both
   tell the member to verify what they typed.) The wrong-passphrase
   copy also names the stale-envelope trap: if the source screen
   was reopened or reloaded, it generated a NEW envelope and new
   words, so a correctly-typed *old* passphrase fails here — the
   fix is to re-copy both from the screen the source shows now.
4. Parses the plaintext JSON.
5. Checks `expiresAt`. If past: "This transfer is more than 5
   minutes old. Ask the other device to start over."
6. Sanity-checks `publicKey === derive(secretKey).publicKey` —
   guards against malformed input that survived secretbox.
7. Renders the public-key fingerprint (same `XXXX XXXX` shape as
   the source device, §6.4) and asks the member to confirm it
   matches. "Yes" advances. "No" drops the payload and bounces
   back to capture — letting the member retype the passphrase
   doesn't help, because if the fingerprints diverge the envelope
   on the wire is the wrong envelope.
8. Prompts the member to set a **session passphrase** for this
   device. The transfer passphrase is single-use; the session
   passphrase is the member's own choice for unlocking the local
   key on this device going forward.
9. Re-wraps the imported secretKey under the new session
   passphrase via the existing `lib/passphrase.ts` flow and writes
   the member row + wrapped key to IndexedDB.
10. Calls `markOnboarded()` and sets `currentMember`.
11. Navigates to the Board.

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

### 9.1 Paired-device inventory (local-only)

After each member-initiated pair *completion*, the device writes a
row to a local `pairingLog` table (Dexie v20) and surfaces the
inventory on Profile. The row records `kind` ("source" or
"destination"), `completedAt`, and an optional member-provided
`label` ("Aunt's laptop", "work phone"). Cancelled and failed
attempts are not recorded — the source flow includes an explicit
"don't save — the pair failed" option so a well-meaning attempt
that the destination never completed doesn't pollute the inventory.

Properties:

- **Local-only.** The inventory never federates, never syncs, never
  rides the outbox, and is excluded from data export. The label is
  member memory, not community memory.
- **UX surface, not a security boundary.** It catches "I forgot I
  paired Aunt's laptop" — what the member did themselves and lost
  track of. It does NOT detect a silent re-import an attacker
  performed without the member's involvement: if the attacker
  already has the key bytes, they don't run the destination flow,
  they just sign. The destination-side list does, however, give the
  member a chance to notice an unexpected entry on their own
  device, which is a weak but non-zero signal.
- **No remove affordance.** Ed25519 has no revocation primitive (see
  §9 above). A "delete this row" button would imply the row had a
  security meaning it doesn't have — the paired device would still
  hold the key. The only remediation is Emergency → Hard purge,
  which rotates the identity and clears the inventory alongside
  every other table.
- **Clears on Hard purge.** `db.pairingLog.clear()` runs in the
  hard-purge transaction list so the inventory drops with the
  rotated identity.

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

- **PR 1 (PR #162) — SHIPPED:** design note + threat-model §7 entry +
  privacy-policy §3 amendment. No code.
- **PR 2 (PR #163) — SHIPPED:** `lib/devicePairing.ts` + BIP39 wordlist
  data files + unit tests for wrap / unwrap / passphrase generation /
  expiry / version mismatch / replay. No UI.
- **PR 3 (PRs #166–#170) — SHIPPED:** split across five PRs as it
  landed. Source UI (`Profile → Add another device` wizard, comparison
  card, camera gate, QR display, passphrase display, countdown) in
  PR #166; destination UI (Welcome third path, camera scan + paste
  fallback, passphrase entry, bootstrap reminder) in PR #167;
  public-key fingerprint verification on both devices in PR #168
  (closes the §6.4 / §7.4 fingerprint comparison loop); paired-device
  inventory surface on Profile (with Dexie v20 `pairingLog` table) in
  PR #169; final "where to find the QR" directions copy in PR #170.
- **Threat-model and privacy-policy edits landed in PR #162** so
  reviewers could audit the values posture before any code read or
  wrote secretKey bytes.
