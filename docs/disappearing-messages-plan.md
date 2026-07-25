# Per-conversation disappearing messages — implementation plan

> **Status: PLANNED** (code-verified 2026-07-25 against the working
> tree). Part of the authoritarian-resilience initiative: a seized
> member device — or a seized community node — must yield less
> message history. Discipline model: docs/react-19-plan.md /
> docs/react-router-8-plan.md (verified ground truth → design with
> rationale → phased commits with full gates → named risks → audit
> trail).
>
> Three OPERATOR-SET, NON-NEGOTIABLE design requirements shape every
> decision below:
>   R1 **Receiver clarity** — no message may ever disappear silently.
>      Persistent banner, inline system events, per-message
>      affordances; both parties always see the same timer state.
>   R2 **Anti-abuse** — the feature must not become a harassment tool
>      (abuse that conveniently deletes itself).
>   R3 **Victim recourse without breaking resilience** — a harassed
>      member must be able to DO something with evidence before it
>      disappears, while the feature still protects everyone against
>      seizure.

## ⚠ Operator decisions (all marked ⚠ in the body; summary here)

| # | Decision | Recommendation |
|---|---|---|
| D1 | Conversation.tsx (FROZEN) needs a small, render-only diff (§6.2) — ~30 lines across 5 insertion points, zero scroll-machinery lines | **Approve the scoped diff** (precedent: router-8 plan's approved 1-line change; every heavy element delegates to NEW components) |
| D2 | Timer floor / duration choices | **Off / 24 h / 7 d / 30 d — nothing shorter than 24 h** (§4.1) |
| D3 | Does keeping a message notify the other party? | **No notification** (Signal-style absence; victim-safety over sender comfort — §4.3) |
| D4 | Mutual consent to enable a timer, or unilateral-with-loud-notice? | **Unilateral with loud notice** (Signal model; consent would let a harasser veto a victim's own safety — §4.5) |
| D5 | Cleartext `expiresAt` hint on the wire envelope (unsigned) so the NODE can prune early | **Yes — hybrid** (sealed value stays authoritative; node sheds ciphertext sooner; leak is one duration number on already-visible metadata — §2.3) |
| D6 | Block-with-evidence: "keep this conversation" checkbox in the block ceremony + kept-messages viewer in BlockedContactsPanel | **Yes to checkbox; viewer in BlockedContactsPanel (never in frozen Conversation.tsx)** (§4.4) |
| D7 | `conversationTimers` rides the device-pairing snapshot | **Yes** (receiver clarity must survive device-linking — §3.4) |

## 0. Verified ground truth (all read from the actual code)

**Message storage + lifecycle**
- `apps/web/src/db/messages.ts` — `sendMessage` / `sendVoiceMessage` /
  `sendReaction` each: mutual-block gate → `encryptMessage(body, sk,
  recipientKey)` (NaCl box; `nonce` + `ciphertext` base64) → local
  `db.messages.put(DirectMessage)` → signed `RelayedMessage` envelope →
  `enqueueMessageOutbox` + `flushOutboxNow`. `DecryptedMessage` extends
  `DirectMessage` with `plaintext | null`, optional `aboutPostId`,
  `reaction`, `voice`, folded `reactions`. Reaction rows are ordinary
  sealed rows folded OUT of the thread by `foldReactions` in
  `getConversation` — the exact precedent a timer-change row follows.
- `DirectMessage` (packages/shared/src/types.ts:1061) = `{id,
  conversationId, senderKey, recipientKey, nonce, ciphertext,
  createdAt}`. `RelayedMessage` (:1084) adds `signature` over
  `canonicalRelayedMessagePayload` (packages/shared/src/crypto.ts:963–983
  — field-ordered JSON of id/senderKey/recipientKey/nonce/ciphertext/
  createdAt; `verifyRelayedMessage` :991).
- Dexie: messages table added at **v14** (`"id, conversationId,
  createdAt, [conversationId+createdAt]"`); latest schema version is
  **v39** (`founderAccessions`) — new work starts at **v40**
  (apps/web/src/db/database.ts:805, :1238).
- Envelope versioning (`apps/web/src/lib/messageEnvelope.ts`): bare
  string (legacy) / v1 `aboutPostId` / v2 `reaction` / v3 `voice`.
  Decode of unknown FUTURE versions gracefully degrades to rendering
  `obj.text` — **v4 is free**, and its `text` field is the built-in
  old-client fallback (the mechanism `VOICE_FALLBACK_TEXT` uses).
- Server relay (`apps/server/src/routes/messages.ts`): `POST /messages`
  (640 KB body limit, signature-verified, membership-gated when
  READ_AUTH=on, **retention sweep rides the write path**:
  `store.pruneOlderThan(now − retentionMs)`); `GET /messages` is
  recipient-proof-scoped (x-understoria-key/-ts/-sig), refuses peer
  bearer tokens. `MessageStore` (apps/server/src/db.ts:107) has
  `pruneOlderThan(cutoff)` — the ONLY expiring store; SQLite table
  `messages` with `messages_created_at_idx` (:1294–1306).
  `MESSAGE_RETENTION_DAYS` default **30** (config.ts:365). The server
  has NO delivery tracking (multi-device cursors — message-relay.md
  §4.3), so "prune on delivery" is impossible by design; the client's
  `pruneDeliveredOutbox` (lib/outbox.ts:939, 7-day retention on
  DELIVERED outbox rows, runs every worker tick) is a different thing
  and already ships.
- Delivery loop: `pullFederatedMessages`
  (lib/federationSync.ts:1750–1859) — per-node AND per-member cursor,
  verifies signature (bad signature = skip WITHOUT advancing cursor —
  a liveness landmine for any signed-payload change, see §2.3), drops
  blocked senders (advancing), dedups by id, then stores the
  **ciphertext row verbatim — no decryption on merge** (the session may
  be locked; `getSecretKey` can throw). Conversation.tsx runs a 2.5 s
  chat-mode poll + `SYNC_KICK_EVENT` from the SSE nudge bus
  (server.ts:515–532 broadcasts on any accepted federation POST,
  including `/messages` via SURFACES).

**Existing expiry machinery**
- `lib/storageWindow.ts`: three total classification sets
  (`WINDOW_LOCAL_TABLES` — includes `messages` — / PINNED / WINDOWABLE);
  `storageWindow.test.ts:102–118` fails the build if any live table is
  not classified exactly once. The window machinery is **year-scale,
  settled-record, member-choice compaction with a merge-time admission
  guard** — wrong shape for per-conversation TTL (days-scale, applies
  to the member's OWN live correspondence, must run regardless of any
  horizon setting). **Reuse the scheduling seam, not the mechanism**:
  the outbox worker tick (lib/outbox.ts:950–960) already chains
  `flushOutboxOnce → pruneDeliveredOutbox → maybeCompactWindow`; the
  message-expiry sweeper slots in as a fourth call, plus a boot-time
  run and read-path filtering (§3.3).
- Purge contract: `SOFT_PURGE_CLASSIFICATION` (lib/panic.ts:71) must
  cover every table; `purgeCoverage.test.ts` fails the build otherwise;
  `hardPurge` enumerates `db.tables` live (wipe-by-default). `messages`
  is already `"cleared"` on soft purge — kept/preserved evidence is
  therefore ALREADY inside the panic blast radius (R3's "the victim's
  evidence is still theirs to destroy instantly" holds with zero extra
  work; the new table must be classified — §8).
- Export: `buildExportBundle` enumerates `db.tables` minus
  `EXPORT_EXCLUDED_TABLES` (lib/exportData.ts:55) — `messages`
  currently EXPORTS (as ciphertext rows). §8 decides the new table.
- Pairing snapshot: `SNAPSHOT_TABLES` (lib/communitySnapshot.ts:44)
  **excludes `messages`** ("E2E-encrypted…"); message-relay.md §7:
  "**No sender-side multi-device backfill**" — sent messages stay on
  the writing device. Timer STATE therefore cannot rely on message
  rows reaching a linked device (§3.4). `communitySnapshot.test.ts`
  asserts the excluded/required lists — updating it is planned.

**Conversation.tsx (FROZEN)**
- `apps/web/src/pages/Conversation.tsx` (1 505 lines). Everything is in
  this one file: header + `OverflowMenu` (lines 903–920, currently one
  "block" item), the `noReadReceipts` notice line (1017–1020), the
  scroll machinery (listRef/effects/poll — the actual subject of the
  freeze, lines 546–740), inline bubble rendering inside
  `messages.map` (1037–1353) with day chips (1062), timestamp footer
  (1126–1130), long-press menu action row (1258–1332), Info block
  (1333–1347), and the blocked-conversation branch (818–855).
  **There is no separate MessageBubble component.** Precedent for
  touching the file: the router-8 plan shipped an operator-approved
  1-line change; the tailwind-4 plan shipped none. §6.2 scopes the
  minimal render-only diff.

**Block flow**
- `db/blocks.ts`: strictly LOCAL-ONLY (no outbox kind, no federation);
  `BLOCK_NOTE_MAX_LENGTH = 500`; `blockMember` ceremony via
  `BlockConfirmCard.tsx` (comparison card: consequences list,
  `hideGovernance` toggle, optional note). `BlockRow` in
  `apps/web/src/types/index.ts:64`. Blocked-sender inbound envelopes
  are dropped at pull time (federationSync.ts:1828) — a block already
  stops FUTURE abuse from landing; the evidence question is about
  what's already on disk (§4.4).

**i18n**
- `apps/web/src/i18n/locales/{en,es}.json` (3 763 lines each);
  `parity.test.ts` enforces identical key sets; `esPlurals.test.ts`
  checks plural forms. Existing `messages.*` block (en.json ~795–880)
  sets the register: plain, humane, no-shame ("Messages are private.
  No read receipts.").

## 1. How the mechanism satisfies the three requirements (overview)

A per-conversation timer is itself a MESSAGE: a sealed **v4
"timerChange" envelope** riding the existing relay exactly as
reactions (v2) and voice (v3) do. Turning a timer on/off/changing it
sends one; the row persists in both parties' threads as an inline
system event ("Ana set messages to disappear after 7 days") and
materializes into a local `conversationTimers` state row that drives a
persistent banner. Every subsequent chat/voice/reaction message sent
while a timer is active carries a sealed `expiresAt` stamp (send-time
anchored). Expiry executes locally on each device (sweeper + read-path
filter); the node independently sheds the ciphertext early via an
unsigned wire hint. Receiver-side: a stamp is honored ONLY when a
rendered timer event covers it, and never earlier than 24 h after the
row arrived — so a silently-disappearing or fast-vanishing message is
impossible even from a modified client (R1 + R2). The recipient's
device remains the recipient's: a **Keep** affordance pins any
received message past expiry, the block ceremony offers to keep the
whole conversation as evidence, and everything kept is still inside
the panic-purge blast radius (R3).

## 2. Wire format & expiry semantics

### 2.1 The v4 envelope (sealed — the authoritative layer)

`lib/messageEnvelope.ts` gains:

- `encodeTimerChangeBody(expireAfterMs: number): string` →
  `{"v":4,"kind":"timerChange","text":TIMER_FALLBACK_TEXT,
  "expireAfterMs":<ms; 0 = off>}`. The `text` field is the old-client
  fallback (the VOICE_FALLBACK_TEXT mechanism, verified): a pre-v4
  client renders it as a normal bubble — e.g. `"⏳ I turned on
  disappearing messages (7 days) for this chat. Mensajes temporales
  activados. Update the app to see timers."` Receiver clarity
  degrades to a LOUD text message, never to silence. (This string is
  a module constant like VOICE_FALLBACK_TEXT, not an i18n key — it
  travels inside the sealed payload.)
- Chat/voice/reaction bodies sent under an active timer gain an
  `expiresAt` (absolute ms epoch) field INSIDE the sealed plaintext.
  For bare-string legacy chat messages this means wrapping in a
  versioned envelope only when a timer is active (same rule as
  `aboutPostId` — the common no-timer case stays byte-identical).
- `decodeMessageBody` gains shape-checked `timerChange?:
  { expireAfterMs: number }` and `expiresAt?: number` outputs, same
  discipline as the v2/v3 branches.

### 2.2 Send-time `expiresAt` vs read-time computation — analysis

- **Read-time (Signal counts from read)**: requires read state. This
  app has **none, anywhere, on purpose** (message-relay.md §7 "No
  delivery receipts… No read state exists anywhere") — building it
  for this feature would widen the metadata surface the whole design
  avoids. Rejected.
- **Send-time absolute `expiresAt` in the sealed payload
  (recommended)**: both ends agree on one instant; survives offline
  periods (the stamp doesn't drift while an envelope sits on the
  node's shelf); survives clock skew as well as `createdAt` already
  does (the server rejects `createdAt` > now+24 h —
  validate.ts:213). Residual skew/malice is handled by the
  receiver-side clamp: **effective deletion on the recipient's device
  = max(sealed expiresAt, localMergedAt + 24 h)** — a backdated or
  hostile stamp can never shorten the victim's window below 24 h from
  receipt (§4.2). Sender deletes at the sealed instant. Asymmetry
  (late-pulled messages live slightly longer on the receiver) is
  accepted and documented — it errs in the abuse-victim's favor.

### 2.3 The wire hint (unsigned) — ⚠ D5

The client-side expiry alone leaves the node holding ciphertext for
the full 30-day shelf. To make a **seized node** yield less:

- `RelayedMessage` gains OPTIONAL `expiresAt?: number` — **outside
  the signature**. `canonicalRelayedMessagePayload` is NOT touched.
  Why: `pullFederatedMessages` skips bad-signature rows WITHOUT
  advancing the cursor (federationSync.ts:1813–1822) — changing the
  signed payload would wedge every old client's inbox cursor on the
  first new-format message. An unsigned hint is invisible to old
  verifiers.
- Server: `parseRelayedMessage` accepts the optional field (integer,
  `> createdAt`, `≤ createdAt + 90 d`, else silently dropped);
  `messages` table gains nullable `expires_at` (SQLite migration →
  schema_version **33**); the existing write-path sweep additionally
  deletes `expires_at < now`; `listForRecipient` excludes expired
  rows. Effective node retention per envelope:
  `min(MESSAGE_RETENTION_DAYS, hint)`.
- Trust analysis, stated honestly: the hint is sender-controlled and
  node-alterable. Stripping it only restores today's 30-day shelf
  (no worse); shortening it only sheds ciphertext (the goal). No
  client ever trusts it — the sealed value is authoritative; on first
  decrypt the client uses the SEALED stamp regardless of the hint.
- Cost, stated honestly: the node (and anyone seizing it) learns
  "this pair uses a timer of duration X" — one number on top of
  metadata it already sees (who/whom/when/size — message-relay.md
  §6). ⚠ If the operator weighs that leak above the seized-node
  reduction, ship sealed-only (drop the server commit's route/store
  delta; everything else is unchanged). **Recommended: ship the
  hint.**

### 2.4 Timer state convergence

Current timer per conversation = the latest `timerChange` row by
`createdAt` (either party; ties broken by id — the reactions
"latest wins" shape). Both parties see the same state because the
state IS a delivered message (R1: "both parties always see the same
timer state"). Turning the timer off is itself a loud event. Changing
a timer applies to messages sent AFTER the change; already-stamped
messages keep their sealed expiry (Signal semantics — simpler, and
re-stamping other people's messages is impossible in an E2E design
anyway). `timerChange` rows themselves never expire: deleting the
notice would undermine the clarity requirement, and they carry no
content (panic purge clears them with the rest of `messages`).

## 3. Client data layer

### 3.1 Dexie v40

```
this.version(40).stores({
  messages: "id, conversationId, createdAt, expiresAt, [conversationId+createdAt]",
  conversationTimers: "conversationId, updatedAt",
});
```
- `DirectMessage` row gains OPTIONAL cleartext columns: `expiresAt?`
  (indexed — the sweeper must run under a LOCKED session; a seized
  locked device still expires on schedule at next boot) and `keptAt?`
  (the Keep affordance, §4.3). Privacy widening is real and small:
  the column reveals "a timer was active, dying at T" on rows whose
  sender/recipient/timestamp are already cleartext by construction
  (messageEnvelope.ts module doc) — the sweep-while-locked property
  is worth it, and the doc says so.
- `ConversationTimerRow` = `{conversationId, otherKey, expireAfterMs,
  setByKey, setAt, updatedAt}` — materialized current state, derived
  exclusively from decoded `timerChange` rows (local sends write it
  synchronously; inbound rows write it at decrypt time).

### 3.2 db/messages.ts changes

- `setConversationTimer(myKey, otherKey, expireAfterMs)` — validates
  against `TIMER_CHOICES` (§4.1), sends the v4 envelope through the
  standard send path (block gate, outbox, signature), writes the
  local row + `conversationTimers`.
- `sendMessage` / `sendVoiceMessage` / `sendReaction`: read
  `conversationTimers`; when active, seal `expiresAt = createdAt +
  expireAfterMs` into the body AND set the row's cleartext column AND
  (D5) the envelope's wire hint.
- `decryptAndDecode` surfaces `timerChange` and sealed `expiresAt`.
  `getConversation` grows a post-decode **lazy-stamp** pass: rows
  whose sealed stamp decoded but whose cleartext column is missing
  get a one-time `bulkPut` backfill (inbound rows merge undecrypted —
  verified; this is the moment the device can first read the stamp).
  Enforcement of R1/R2 lives here: a sealed stamp is honored only if
  a `timerChange` row for this conversation is active at the
  message's `createdAt` (otherwise the stamp is IGNORED and the
  message never expires locally — a stamp without a visible notice is
  treated as hostile), and the stamped column is clamped to
  `max(sealed, mergedAt + RECIPIENT_MIN_RESIDENCY_MS)` for inbound
  rows.
- Read-path filter: `getConversation`, `listConversations`,
  `searchAllMessages` all drop rows with `expiresAt ≤ now && !keptAt`
  before decrypt — an expired message never renders even if the
  sweeper hasn't ticked.
- `keepMessage(id)` / `keepConversation(conversationId)` — set
  `keptAt`; kept rows are skipped by sweeper and filter, and remain
  covered by soft/hard purge (verified: `messages` clears whole).

### 3.3 The sweeper

`lib/messageExpiry.ts` — `expireMessagesNow(now)`: one indexed range
delete (`where("expiresAt").below(now)` filtered on `!keptAt`), plus
the guards above. Wired in three places: (1) the outbox worker tick
(outbox.ts:950 — after `pruneDeliveredOutbox`, dynamic-import like
`maybeCompactWindow`), (2) app boot, (3) exported for tests. It does
NOT join the storage-window walker: windowing is an opt-in, year-scale
member choice; expiry is an always-on promise between two people.

### 3.4 Multi-device / pairing honesty (⚠ D7)

Verified: sent messages never reach the sender's other devices and
`messages` is excluded from the pairing snapshot. Consequences and
mitigations, stated plainly in the docs:
- Add `conversationTimers` to `SNAPSHOT_TABLES` (it is state, not
  correspondence; the snapshot is sealed to the member's own new
  device) → a freshly linked device knows every active timer from
  first render. Update `communitySnapshot.test.ts` lists.
- After pairing, a linked device also converges from any inbound
  `timerChange` row and from the lazy-stamp pass on inbound stamped
  messages. Residual gap: a timer the member sets ON DEVICE A after
  pairing is not seen by their own device B until the counterparty's
  next message/timer event arrives. Documented as a known limitation
  (same class as the existing per-device sent history).

## 4. Anti-abuse and victim recourse (R2 + R3)

### 4.1 ⚠ D2 — the floor

`TIMER_CHOICES = [off, 24 h, 7 d, 30 d]`. **No timer shorter than
24 hours.** Rationale: this is a mutual-aid coordination app, not an
ephemeral-chat product — there is no legitimate "vanish in 30
seconds" use here, and every sub-day option is pure harassment
surface (abuse that deletes itself before the victim can show anyone).
24 h guarantees a full wake-sleep cycle to notice, keep, screenshot,
or block. Signal offers 30 s; Signal's threat model is different and
its users chose the app FOR ephemerality — this community chose it
for solidarity. The floor is enforced three times: UI offers nothing
shorter; `setConversationTimer` validates; and the receiver-side
clamp (§4.2) holds even against a modified client.

### 4.2 The receiver-side residency clamp (the load-bearing anti-abuse rule)

`RECIPIENT_MIN_RESIDENCY_MS = 24 h`, applied at lazy-stamp time:
an inbound message is never deleted earlier than 24 h after it landed
on THIS device, regardless of what any sender's client sealed into
it. Combined with the stamp-requires-visible-timer-event rule (§3.2),
a harasser cannot (a) send fast-vanishing abuse, (b) send silently-
vanishing abuse, or (c) shorten the victim's evidence window by
manipulating clocks or clients. What they CAN still do is delete
their own copy — always true of any E2E system, and irrelevant to
the victim's copy.

### 4.3 The Keep affordance + ⚠ D3 (notify or not)

- Any party may **Keep** any message in the thread (long-press menu
  item; kept rows show a small "Kept" chip and stop expiring). The
  docs say the honest thing out loud: **on-device data is inherently
  under the device holder's control** — the sender cannot prevent
  keeping, screenshots, photographs of the screen, or a modified
  client, and pretending otherwise (as some products do) would be a
  false promise this project refuses to make. Keep is that reality
  given a humane, first-class UI instead of pushing victims toward
  screenshots.
- **Keeping does not notify the other party — recommended.**
  The tradeoff, honestly: WhatsApp-style notification is symmetric
  courtesy between people in good faith ("no shame — you know what I
  know"). But the scenario this feature must not fail is the bad-faith
  one: a victim quietly preserving evidence of harassment. Notifying
  the harasser that evidence was kept invites escalation, retaliation,
  or preemptive deniability — it weaponizes the courtesy against the
  person the courtesy was meant to protect. Signal has no keep
  concept at all; between "no concept" and "concept that snitches,"
  this project's safety-first culture picks "concept that doesn't."
  The no-shame value is served instead by universal, symmetric
  disclosure UP FRONT: the timer sheet and the Help copy both state
  plainly that either person can keep or screenshot messages —
  nobody is promised more than the technology can deliver.

### 4.4 ⚠ D6 — block-flow integration

- `BlockConfirmCard` gains one opt-in checkbox, shown only when the
  conversation has messages: *"Keep a copy of this conversation on
  this device (it stops disappearing)"*. On confirm it calls
  `keepConversation` in the same flow as `blockMember`. No `BlockRow`
  schema change required (kept rows are self-describing via `keptAt`);
  the block `note` (≤ 500 chars, verified) remains the memory-aid it
  is.
- Viewing kept evidence after blocking: the blocked-conversation
  branch replaces the thread (Conversation.tsx:818 — frozen), so the
  viewer lives in **`BlockedContactsPanel`** (Settings → Blocked
  contacts → "View kept messages"): a NEW read-only component
  (`KeptMessagesView`) rendering `getConversation` output without a
  composer. Kept evidence stays local-only, stays out of federation,
  and is destroyed by soft/hard purge like all messages — the
  resilience story is not weakened by recourse (R3).
- Path beyond the device: the existing governance ceremonies
  (dispute proposals, member-removal quorum) are where a community
  acts on evidence; this plan deliberately builds no in-app "report
  with attached transcript" pipeline (it would be a new federated
  free-text surface with its own abuse modes). Documented as a
  non-goal with the reasoning, so it stays a decision.

### 4.5 ⚠ D4 — mutual consent vs unilateral

**Unilateral-with-loud-notice — recommended.** Requiring the other
party's acknowledgment sounds consent-respecting but inverts the
power dynamic this feature exists for: the person who most needs
disappearing messages (organizer fearing device seizure; member
extracting themselves from a bad dynamic) would need their
counterpart's — possibly their harasser's — permission to get it.
Signal is unilateral for the same reason. The loud-notice half is
non-negotiable and triple-redundant (§5): system event + banner +
per-message marks, and on old clients the v4 fallback text. Either
party can also turn the timer OFF unilaterally — equally loudly —
and can always Keep individual messages, so neither party is ever
trapped by the other's setting.

## 5. Receiver-clarity surfaces (R1) — the full inventory

1. **Inline system event** — every timerChange row renders as a
   centered chip in chronological position: "Ana set messages to
   disappear after 7 days" / "You turned off disappearing messages."
2. **Persistent banner** — while a timer is active, a one-line banner
   sits above the thread (adjacent to the existing `noReadReceipts`
   line): "⏳ Messages disappear after 7 days" + tap → the timer
   sheet. Derived from `conversationTimers`, so it survives scrolling
   the event out of the loaded window.
3. **Per-message affordance** — an ⏳ glyph beside the burst
   timestamp on expiring messages; the Info block (existing long-press
   menu) gains "Disappears {{relative time}}" / "Kept on this device".
4. **Timer sheet** (`DisappearingTimerSheet`, new component, opened
   from the conversation OverflowMenu): choices from §4.1, plus the
   honest one-paragraph disclosure (both sides see the timer; either
   side can keep/screenshot; devices already holding a message keep
   it until their own copy expires).
5. **Messages list** (`Messages.tsx`, not frozen): ⏳ glyph on
   conversations with an active timer.
6. **Old clients**: the sealed v4 fallback text (§2.1) — the notice
   arrives as a visible message even on builds that predate the
   feature. There is no path by which a timer can be active without
   the receiver having been shown it (R1's "no silently-disappearing
   message").

## 6. Conversation.tsx — the freeze (⚠ D1)

### 6.1 What lives in NEW files (no freeze exposure)

`DisappearingBanner.tsx`, `DisappearingTimerSheet.tsx`,
`TimerEventRow.tsx`, `MessageExpiryFooter.tsx` (glyph + aria),
`KeptMessagesView.tsx`, `lib/messageExpiry.ts`, all db/ and i18n work,
`Messages.tsx` list glyph, `BlockConfirmCard` checkbox.

### 6.2 The unavoidable minimal diff (operator approval requested)

The thread, header menu, and long-press menu are all inside the
frozen file (verified — no separate bubble component). Five
insertion points, **all render-only, zero lines touching the scroll
machinery** (listRef, the effects at 546–740, the poll, `openMenuFor`
geometry — untouched):

| # | Anchor (current lines) | Change | ~lines |
|---|---|---|---|
| 1 | imports (21–61) | import 4 new components + hook | 5 |
| 2 | OverflowMenu items (903–920) | add "Disappearing messages" item + `timerSheetOpen` state + render `<DisappearingTimerSheet>` beside the existing Block dialogs (925–940) | 8 |
| 3 | after the noReadReceipts `<p>` (1017–1020) | `<DisappearingBanner otherKey={otherKey} />` (self-hiding when no timer) | 1 |
| 4 | top of the `messages.map` return (1060) | `if (m.timerChange) return <TimerEventRow key={m.id} m={m} otherName={otherName} />;` | 2 |
| 5 | timestamp footer (1126–1130) + Info block (1333–1347) + action row (~1320) | `<MessageExpiryFooter m={m} />` beside `formatRelativeTime`; one Info line; one "Keep" menu button calling `keepMessage` | 12 |

Total ≈ 28 lines. Fallback if #4/#5 are refused: timerChange rows can
be given a localized `plaintext` in the data layer and render as
ordinary bubbles, and the expiry/keep affordances can live only in
`BlockedContactsPanel`/`Messages.tsx` — R1 survives degraded (events
still visible, banner still present via #3, which is a 1-line
insert), but per-message affordances would be lost; **not
recommended**. The 8 existing Conversation.* suites plus new
freeze-scoped tests gate the commit; the diff is reviewable line by
line against the table above.

## 7. i18n (en + es, every key in both; parity test enforces)

Under `messages.disappearing.`: `banner`, `bannerAria`, `menuItem`,
`sheetTitle`, `sheetIntro`, `sheetHonesty` (the keep/screenshot
disclosure), `optionOff`, `option1d`, `option7d`, `option30d`,
`eventSetSelf` ("You set messages to disappear after {{duration}}"),
`eventSetOther`, `eventOffSelf`, `eventOffOther`, `eventChangedSelf`,
`eventChangedOther`, `expiresIn` ("Disappears {{when}}"),
`expiryGlyphAria`, `keptChip`, `infoExpires`, `infoKept`.
Under `messages.menu.`: `keep`, `kept`. Under `block.confirm.`:
`keepEvidenceLabel`, `keepEvidenceHint`. Under `settings.blocked.`
(match existing BlockedContactsPanel namespace): `viewKept`,
`keptEmpty`, `keptTitle`. Durations reuse existing relative-time
formatting (`lib/format.ts`). Register: plain and unshaming — the
Spanish copy is written, not machine-mirrored, per the i18n-expansion
doc's practice.

## 8. Classification guards (they WILL trip — planned, not discovered)

| Guard | Action |
|---|---|
| `storageWindow.test.ts` classification drift | add `conversationTimers` to `WINDOW_LOCAL_TABLES` (per-device state; the walker has no business in it) |
| `purgeCoverage.test.ts` | `conversationTimers: "cleared"` (the row IS a relationship + a behavioral signal: which pairs wanted history gone) + implement in `softPurge`'s cleared transaction; `messages` already cleared (kept evidence dies in a panic — R3's requirement, verified satisfied) |
| `communitySnapshot.test.ts` | add `conversationTimers` to `SNAPSHOT_TABLES` + required list (D7) |
| export | add `conversationTimers` to `EXPORT_EXCLUDED_TABLES` (same personal-relief class as blocks; message rows themselves keep today's export posture — expired rows are simply gone before any export) |
| `hardPurge` | nothing — enumerates `db.tables` live (verified) |

## 9. Threat-model honesty — the §7 entry (draft, ships in commit 4)

What disappearing messages do: bound how much 1:1 history a seized
member device yields (per-conversation, member-chosen, 24 h–30 d) and
how long the node shelf holds the ciphertext (≤ existing 30 d,
further bounded by the D5 hint). What they do NOT do, stated plainly:
- The other party's device keeps its copy until ITS OWN expiry — and
  may keep it forever (Keep, screenshots, a camera pointed at the
  screen, a modified client). No E2E system can promise remote
  deletion; this one refuses to pretend.
- A device compromised BEFORE expiry yields everything still present;
  expiry is prospective hygiene, not retroactive protection.
- The node held the ciphertext until delivery/expiry and permanently
  learns the routing metadata (who/whom/when/size — message-relay §6),
  plus, under D5, the timer duration. A node seized within the window
  yields that.
- Locked-session edge: inbound rows that were never decrypted carry no
  cleartext stamp yet; they expire at the LATER of first-unlock
  lazy-stamp or the wire-hint-independent sweep — a device seized
  locked may hold undecryptable expired ciphertext slightly past its
  nominal expiry (bounded by the node retention + clamp).
- Kept evidence is a deliberate, local, panic-purgeable exception —
  the victim's copy is under the victim's control, including the
  control to destroy it instantly (soft/hard purge both clear
  `messages`, verified).
- Timers are hygiene for members in good standing, not a defense
  against a malicious counterparty; the defense against a malicious
  counterparty is the floor, the clamp, Keep, and the block ceremony.

## 10. Phased commits (each with full gates; sized like the governance work)

**Commit 1 — "shared: v4 timer envelope + relay expiry hint; server:
prune expired envelopes"**
- packages/shared: `RelayedMessage.expiresAt?` (unsigned),
  envelope-adjacent types; NO change to
  `canonicalRelayedMessagePayload` (locked by a regression test —
  the §2.3 cursor-wedge analysis).
- apps/web `lib/messageEnvelope.ts`: v4 encode/decode + fallback
  constant (pure functions — lives with its tests; no UI).
- apps/server: `validate.ts` optional-field clamps; db.ts migration →
  schema_version 33 (`expires_at` column + index); route/store prune +
  `listForRecipient` exclusion; server tests (accept/clamp/ignore
  malformed hint, expired rows never served, prune counts, old-shape
  POST still accepted).
- Gates: `npm run shared:build`; root `npm test` (server + shared +
  desktop); `npm --workspace @understoria/web run typecheck`; web
  suite from apps/web (`npx vitest run` — count must match baseline +
  new envelope tests); `npm --workspace @understoria/web run lint`.
- Rollback: pure revert; old clients/servers interoperate throughout
  (hint is optional and unsigned).

**Commit 2 — "web: message expiry data layer + sweeper +
conversationTimers"**
- Dexie v40 (§3.1); db/messages.ts changes (§3.2);
  `lib/messageExpiry.ts` + outbox-tick/boot wiring; federation merge
  untouched except none (stamping is lazy — verified merge can't
  decrypt); classification updates (§8) — this is the commit where
  purge/window/snapshot guard tests are UPDATED IN THE SAME CHANGE
  as the table lands.
- Tests: stamp-on-send under active timer; no stamp without timer;
  stamp ignored without covering timerChange row; residency clamp;
  floor validation; sweeper deletes/skips-kept/skips-timerless;
  read-path filters in all three read functions; lazy-stamp backfill;
  keep/keepConversation; timers ride the snapshot; purge clears both
  tables; locked-session behavior.
- Gates: same full set as Commit 1.

**Commit 3 — "web: disappearing-messages UI + i18n + block-flow
evidence" (contains the ⚠ D1 frozen-file diff — operator sign-off
recorded in the commit message, router-8 precedent)**
- New components (§6.1); the five scoped Conversation.tsx insertions
  (§6.2); Messages.tsx glyph; BlockConfirmCard checkbox;
  BlockedContactsPanel viewer; en+es keys (§7).
- Tests: banner presence/absence; system-row rendering + copy both
  directions; sheet choices (no sub-24 h option exists in the DOM);
  keep from the menu; block-with-evidence keeps rows; kept viewer;
  ALL 8 existing Conversation.* suites green unchanged (the freeze
  guard); parity + esPlurals green.
- Gates: full set + `npm --workspace @understoria/web run build`;
  manual smoke: set timer on device A → event + banner on B; message
  expires from list and thread; keep survives sweep; panic purge
  destroys kept evidence; old-build fallback text (manual envelope
  decode check).

**Commit 4 — "docs: disappearing messages"**
- message-relay.md §11 (wire + semantics + hint honesty);
  threat-model.md §7 entry (§9 draft); blocking.md cross-reference
  (evidence checkbox); member-guide + opsec-guide sections;
  privacy-policy note (`conversationTimers` posture); CHANGELOG.
- Gates: typecheck/lint/web suite (docs-only, but the suite is cheap
  insurance); doc cross-references resolve.

## 11. Named risks

1. **Conversation.tsx freeze** — the one real hazard. Mitigation:
   render-only diff, delegation to new components, the insertion-point
   table (§6.2) as the review checklist, 8 existing suites as the
   tripwire, and the fallback posture if refused.
2. **Cursor-wedge via signed-payload drift** — any future temptation
   to sign the wire hint re-creates the §2.3 wedge; locked by a
   canonical-payload regression test in Commit 1.
3. **Sweep under lock vs sealed-only stamps** — inbound rows
   undecrypted at expiry linger until first unlock; bounded and
   documented (§9). Do not "fix" by decrypting in the merge path —
   that would demand the secret key in a context designed to work
   locked.
4. **Guard-test drift** — three classification guards trip by design;
   the rule is decide-in-the-same-commit (§8), never loosen a guard.
5. **Multi-device timer drift** (own second device, post-pairing) —
   known limitation, converges on next counterparty event; documented
   rather than papered over.
6. **Abuse-by-configuration** — a harasser toggling the timer
   on/off rapidly to spam events: rate-limited by the send path's
   existing outbox economics and rendered harmless by R1 (every
   toggle is loud, attributable evidence — kept like anything else).
7. **Rollback** — Commit 1 is wire-compatible both ways; Commit 2's
   Dexie v40 is additive (revert keeps stray optional columns, which
   old code ignores); Commit 3 is UI-only; server migration 33 is
   additive (a column no rollback needs to drop).

## 12. Audit trail (files read / greps run, 2026-07-25)

Read in full: `apps/web/src/db/messages.ts`, `apps/web/src/db/blocks.ts`,
`apps/web/src/db/database.ts` (both pages; v39 latest, SETTING_KEYS),
`apps/web/src/lib/storageWindow.ts`, `apps/web/src/lib/messageEnvelope.ts`,
`apps/web/src/lib/panic.ts`, `apps/web/src/lib/purgeCoverage.test.ts`,
`apps/web/src/pages/Conversation.tsx` (all 1 505 lines),
`apps/server/src/routes/messages.ts`, `apps/web/src/components/BlockConfirmCard.tsx`
(to line 120), `docs/react-router-8-plan.md`,
`apps/web/src/lib/communitySnapshot.ts` (SNAPSHOT_TABLES + builder),
`apps/web/src/lib/exportData.ts` (EXPORT_EXCLUDED_TABLES + builder),
`apps/web/src/lib/syncLoop.ts` (to line 120), `apps/web/src/lib/outbox.ts`
(retention constants + `pruneDeliveredOutbox` + `tick`),
`apps/server/src/server.ts` (message-route registration + nudge hook),
`apps/server/src/config.ts` (MESSAGE_RETENTION_DAYS=30),
`apps/server/src/validate.ts` (`parseRelayedMessage`),
`apps/web/src/lib/federationSync.ts` (`pullFederatedMessages` complete,
lines 1750–1859).
Targeted greps: `MessageStore`/prune in apps/server/src/db.ts
(interface :107, table DDL :1294, `createMessageStore` :1724, latest
schema_version=32 :1528); `DirectMessage`/`RelayedMessage`/
`canonicalRelayedMessagePayload` across packages/shared (types :1061/
:1084, crypto :963/:991); `Conversation.tsx` across docs/*.md (freeze
precedents: i18next/react-19/tailwind-4/router-7/router-8 plans);
`hardPurge|softPurge` UI call site (Profile.tsx:1148); `nudgeBus`
wiring (server.ts:515–532); storageWindow.test.ts classification
guard (:102–118); communitySnapshot.test.ts list assertions; i18n
layout (`locales/{en,es}.json`, 3 763 lines each; parity.test.ts
flatten-equality; messages block en ~795–880); `delivered` prune in
outbox.ts (:120–127, :939–948); message-relay.md §4.3/§6/§7 (shelf
semantics, node-visibility ledger, no-read-state + no sender-side
multi-device backfill non-goals); threat-model.md heading map (§7 =
"Known gaps (tracked work)").
