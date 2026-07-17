# Voice board — audio posts by content address

Voice workstream **V4** (issue #474), building on the voice-notes
transport from #471/#472. **Status: shipped** (2026-07; server schema
v30). A member can attach a recording to a board post: pick the
category icon, record up to 45 seconds, review, post. Other members
see a playable card. The typed path is untouched — text posts remain
first-class, and a voice post can carry text too.

## 1. Shape of a voice post

A voice post is **two records**:

1. **The recording** — the raw audio bytes, stored on the community
   node's content-addressed blob store (`audio_blobs`, schema v30).
   Its identity is `audioBlobId(bytes)`: a domain-separated
   SHA-512/256 of the bytes themselves, hex-encoded (64 chars,
   URL-safe). The id and the content can never disagree.
2. **The post** — the ordinary signed post record, extended with an
   optional signed reference:

   ```jsonc
   "audio": { "blobId": "<64 hex>", "mime": "audio/webm;codecs=opus", "durationMs": 12000 }
   ```

   `canonicalPostPayload` includes `audio` **only when present**, so
   every pre-audio post serializes byte-identically and every existing
   signature keeps verifying — the same conditional-inclusion move as
   other payload extensions.

Because the post signs the blobId and the blobId is the hash of the
bytes, the poster's signature binds the **exact recording**
transitively. A compromised node or relay cannot swap the audio under
a post: the server recomputes the hash on upload, and the client
recomputes it again on fetch.

## 2. Server surface

- `POST /audio-blobs` — a signed `AudioBlobUpload`
  `{blobId, uploaderKey, mime, audio (base64), signature}`. The
  signature covers `{blobId, uploaderKey, mime}` only; the bytes are
  bound by the content address, which the route recomputes and
  refuses on mismatch (422 `content_address_mismatch`). Identical
  bytes dedup on the primary key (200), whoever re-uploads them.
  Standard posture for an attributable POST: member-write gate,
  per-key + per-table insert caps (the disk backstop — these are the
  largest rows a node stores, up to 400 KB each), nudge broadcast,
  640 KB per-route body limit (the `/messages` precedent).
- `GET /audio-blobs/:blobId` — the bytes with their stored
  content-type, `Cache-Control: private, max-age=31536000, immutable`
  (content-addressed ⇒ the same URL can never serve different bytes).
  Covered by the deny-by-default member-read guard like every read.
- `POST /posts` / `GET /posts` / peer pull — `parsePost` validates and
  passes the optional `audio` reference through (hex blobId,
  allowlisted mime, bounded durationMs); text posts keep serializing
  with **no** `audio` key.

MIME allowlist (shared, `isAllowedAudioMime`): `audio/webm`,
`audio/mp4` (iOS Safari records AAC), `audio/mpeg`, `audio/ogg`,
`audio/aac` — parameters like `;codecs=opus` allowed.

## 3. Storage budget

The deliberate design choice: **a device stores only the reference,
never the bytes.**

- The recording exists on the device transiently (recorder state →
  outbox row until delivered). The posts table carries ~100 bytes of
  reference per voice post. Local windowing, the pinned working set,
  and the seed-vault role are therefore **unchanged** — a voice post
  costs a windowed device the same as a text post, and a seed-vault
  device archives references, not audio.
- Playback fetches by content address and leans on the browser's HTTP
  cache (the response is immutable); nothing lands in Dexie, so panic
  has nothing extra to purge beyond the reference (see §4).
- Node-side growth is bounded by the existing insert caps
  (`PER_KEY_ROW_CEILING` / `TABLE_ROW_CEILING`); at 400 KB max per
  blob, the audio table is the first table where the per-key cap is
  doing real disk work. Pruning recordings whose posts are gone is
  deferred to the V8 (#478) federation/GC design — append-only until
  then, matching every other federated table.

## 4. Purge

Soft purge scrubs posts; the scrub now also **drops the `audio`
reference** — a voice is more identifying than any title. The bytes on
the node are unaffected (they are community data, same as a delivered
text post), but this device can no longer name them. Hard purge
deletes the posts table outright, reference included. The
purge-coverage CI guard (#476) holds this in place.

## 5. Not in this slice

- **Cross-node audio**: a post federated from a peer community carries
  its audio reference, but the peer's blobs don't replicate — the
  player shows "recording unavailable" with a retry. Blob federation
  is V8 (#478), which reuses this store and content-address scheme.
- **Search over voice posts**: needs transcripts — V7 (#477).
- **Post deletion GC** of node-side blobs — with V8, above.
