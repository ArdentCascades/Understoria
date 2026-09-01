# On-device Transcription & Search (V7, issue #477)

Status: **PHASES 1–2 SHIPPED** — engine spike + opt-in (PR #589),
then the encrypted transcript twin + persistent captions, alongside
two fixes from the first live tap on hardware: the engine now says
"the node doesn't offer a model for your language" instead of
pointing at a Settings download that doesn't exist, and the manifest
entry is cached beside the model bytes so inference is genuinely
zero-network once downloaded (the acceptance line "runs fully
offline after model fetch" held only by accident before). Phase 3
(search over transcripts) shipped behind it — **the program is
complete**; what remains open is hardware validation (the runbook
pass) and the per-community operator setup (§7b).

Optional local captions: a member can turn a voice note into text on
their own device, for their own eyes, to serve Deaf and
hard-of-hearing members and (later) power search. Never a dependency
of the core loop, never cloud.

## 1. Decisions (made at design time, recorded here)

### D1 — Engine: Vosk small models, Whisper deferred

`vosk-browser` (Apache-2.0, pinned exact at 0.0.8) wrapping the WASM
build of Vosk/Kaldi. Chosen over Whisper-WASM because the pilot's
phones are cheap Androids: Vosk small models are ~40–50 MB per
language, stream incrementally, and were built for
Raspberry-Pi-class hardware. Whisper's smallest usable multilingual
model is larger and markedly slower on exactly the devices that
matter. Revisit only if accuracy complaints outweigh the size/speed
cost, per the issue's own framing ("Whisper-WASM where accuracy
justifies size").

Package mechanics, verified against the shipped bundle:
- One 5.8 MB JS file; the recognizer worker is spawned from a
  `blob:` URL with the WASM embedded (base64) inside it.
- `createModel(url)` — the worker fetches and unpacks the model
  archive itself. We hand it an object URL over bytes we already
  verified (D4), so the worker never touches the network.
- `KaldiRecognizer.acceptWaveformFloat(Float32Array, sampleRate)` +
  `retrieveFinalResult()`; `model.terminate()` frees everything.

### D2 — Spoken query: dropped

The issue left this open. On iOS, `SpeechRecognition` routes audio
through Apple's servers — a direct violation of the standing rules
(on-device only). A feature that exists on one platform and silently
ships audio to a third party on another is not worth the asterisk.
Typed query only; revisit never, unless a genuinely on-device API
appears.

### D3 — Transcript crypto: boxed under the member's own key

Phase 2 stores each transcript as NaCl-box ciphertext
(`encryptMessage(plaintext, mySecretKey, myOwnPublicKey)`) — the
same construction `guardianShards` uses for ciphertext at rest. The
device-master-key (DMK) wrap was considered and rejected as the
primary: the DMK only exists once a passphrase or passkey is
enrolled, and the default install is unprotected. Self-box works on
every install from day one. Messages are ciphertext at rest;
transcripts of messages must not be the weaker copy.

### D4 — Model hosting: the community's own node, static tier, public

Models are served like the AGPL source bundle: files under
`/models/` on the node's static tier (Caddy `file_server`), with a
`manifest.json` declaring per-language `{file, bytes, sha256,
label}`. No third-party CDN, no egress: the operator downloads the
model once from alphacephei.com (or a mirror they trust), checks its
hash, and hosts it themselves (runbook in `docs/operator-guide.md`).

Public, not member-gated: Vosk models are generic public artifacts —
gating them adds auth machinery to the static tier and protects
nothing. (The `/models/` path sits outside the node's `readAuth`
guard by construction, same as `/source/`.)

The client:
1. fetches `/models/manifest.json` (`cache: "no-store"`; absence =
   the node doesn't host models — an honest state, not an error),
2. downloads the archive for the app language (primary subtag),
3. computes SHA-256 over the received bytes and refuses a mismatch,
4. stores the verified bytes in Cache Storage
   (`understoria-models`), where the member can see and delete them
   from Settings.

Cache Storage is evictable under OS storage pressure — deliberate.
The Settings card shows "model on this device / not downloaded", so
an eviction is visible, and re-downloading is the member's call.

### D5 — CSP: `'wasm-unsafe-eval'` + `worker-src blob:`

The shipped CSP (`deploy/Caddyfile`, both site blocks) blocked all
WASM and all `blob:` workers. Transcription needs exactly two
additions, no more:
- `script-src` gains `'wasm-unsafe-eval'` — WASM compilation only;
  it does NOT permit JS `eval` (that would be `'unsafe-eval'`,
  which stays banned).
- `worker-src` gains `blob:` — vosk-browser's worker ships inside
  its JS bundle and is spawned from a blob URL. The blob's content
  comes from our own bundled, integrity-checked chunk; a `blob:`
  worker inherits the page's CSP, so this does not open remote
  worker loading.

Existing deployments must apply the Caddyfile update before
transcription works there; until then the capability probe (D6)
reports the truth. Both Caddyfile variants and the
`scripts/csp-hash.sh` discipline apply (docs/themes-plan.md records
the drill).

### D6 — The low-resource contract

The acceptance criterion "works acceptably, or degrades honestly, on
a cheap phone — no hard model dependency" is enforced structurally:

- **Off = zero cost.** The 5.8 MB engine is its own lazy chunk,
  excluded from the service-worker precache; nothing loads, spawns,
  or downloads until a member opts in AND taps Transcribe. Voice
  messaging and the voice board never depend on any of it.
- **Costs stated before they're paid.** The Settings card states the
  model size in plain language before the download, and that
  transcription runs one clip at a time, on demand, using battery
  while it runs.
- **On-demand, per clip, once.** No background auto-transcription.
  A tap transcribes one clip in the worker (UI stays responsive);
  Phase 2 persists the result so each clip is paid for at most once;
  the engine is terminated after use, freeing its memory.
- **Honest failure at every rung.** No `WebAssembly`/`Worker` API,
  or WASM compilation blocked by an un-updated CSP → the card says
  the device (or this deployment) can't run transcription — probed
  with an 8-byte module compile, not assumed. Node hosts no
  manifest → "this community's node doesn't offer models". No model
  for the member's language (today: Tibetan; likely Urdu) → the
  same honest per-language note pattern as read-aloud's missing
  voices. Hash mismatch → refused, said plainly. Inference error or
  watchdog timeout → a failure line on the clip, engine torn down,
  audio playback unaffected.

### D7 — What Phase 1 deliberately does not do

- No transcripts table yet: Phase 1 results are in-memory, shown as
  the clip's caption until the screen closes. Phase 2 adds the
  encrypted twin + purge classification (the #476 CI guard forces
  it) + captions-from-store.
- No search changes yet: `searchAllMessages` still skips voice rows
  (`db/messages.ts` — the skip line is the Phase 3 diff).
- No `<track>`/WebVTT: visible text under the player serves Deaf
  members better than a timed track for short clips, and Vosk small
  models don't emit reliable word timings anyway.

## 2. Phases

1. **Engine spike + opt-in (this phase).** Everything above:
   `lib/transcription.ts` (prefs + capability probe),
   `lib/transcriptionModels.ts` (manifest, verified download, Cache
   Storage, delete), `lib/transcriptionEngine.ts` (decode → worker →
   text, watchdog, teardown), `TranscriptionSection` in Settings
   zone 1 (beside Read aloud), Transcribe affordance in
   `VoicePlayer` (covers DMs, voice posts, and recorder preview in
   one place), CSP change, operator runbook, strings ×11.
2. **Encrypted transcript twin — SHIPPED.** Dexie v40 `transcripts`
   table (ciphertext at rest per D3, self-boxed; open/seal only in
   `db/transcripts.ts`), `SOFT_PURGE_CLASSIFICATION: "cleared"` +
   real handling in `softPurge` (the #476 guard held the door until
   both existed), excluded from the export bundle (transcripts of
   other people's voices don't travel in a shareable file — the
   `guardianShards` reasoning) and absent from `SNAPSHOT_TABLES`.
   Clips are keyed "msg:<id>" / "blob:<id>"; a stored transcript
   renders as the caption on mount — each clip transcribed at most
   once. The recorder preview stays ephemeral (no key, no row).
3. **Search over transcripts — SHIPPED.** `searchAllMessages`
   matches voice rows through their decrypted twin: identity/secret
   resolve once per scan (`transcriptReader()`), each voice row is
   one indexed get + unbox, and a hit's snippet IS the transcript —
   so the existing normalize/match/highlight pipeline works
   untouched. Untranscribed clips stay unsearchable (search never
   runs the engine — it reads only what a tap already paid for), the
   old-client fallback line still never matches, and another
   identity's twins open as null. Known seam, deliberately left: the
   result link carries `?q=` into the conversation, whose in-page
   match highlighting still skips voice bubbles — extending it means
   async transcript reads inside Conversation's render state; do it
   only if members actually miss it.

## 3. Audio path (Phase 1 detail)

Playback clips are WebM/Opus (most platforms) or MP4/AAC (iOS).
Decode on the main thread — `OfflineAudioContext` at 16 kHz mono
(browsers resample in `decodeAudioData`), channels averaged to one
`Float32Array` — then feed the worker in bounded chunks via
`acceptWaveformFloat(chunk, 16000)`, `retrieveFinalResult()`, join
the `result` events' text. Decoding a sub-minute clip is
milliseconds; the expensive part stays in the worker. A watchdog
(120 s) bounds a hung engine: terminate, report, leave playback
alone.

## 4. Testing posture

CI cannot run a 40 MB model, and jsdom has no WASM audio pipeline —
so CI locks every rung of the ladder EXCEPT real inference:
capability probe honesty (API missing, compile refused), manifest
states (absent, malformed, missing language), hash verification
(reject on mismatch, byte-exact accept), Cache Storage
presence/delete, Settings card states, VoicePlayer gating, and the
structural no-network-during-inference property (the engine consumes
bytes + an object URL; it is never handed a remote URL — asserted in
tests). Real inference is validated on hardware via the
accessibility-test-runbook pass added in this phase, like
read-aloud's.

## 5. Issue-scope map (#477)

- "Local WASM STT, model from the community's node, never bundled" —
  Phase 1 (this doc §1 D1/D4).
- "Encrypted transcript twin, purge-classified" — Phase 2.
- "Search over transcripts (typed query first…)" — Phase 3; spoken
  query dropped per D2, documented here.
- "Captions when a transcript exists" — Phase 1 (in-memory), Phase 2
  (persistent).
- "Explicit opt-in with size + battery cost stated" — Phase 1.
- "No network during inference" — structural, tested (this doc §4).
- "Cheap-phone contract" — D6.
