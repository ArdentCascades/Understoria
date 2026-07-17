/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// DM plaintext envelope — the structured body that rides INSIDE the
// encrypted message payload.
//
// Why in-payload and not a column: a DM row already leaks
// sender/recipient/timestamp to anyone with device access to the
// Dexie file — that's inherent to local storage of an E2E scheme.
// But a cleartext `aboutPostId` column would additionally leak
// conversation TOPIC (which offer/need two members are talking
// about), which the ciphertext otherwise hides. That's a real
// widening under the privacy-precondition principle, so the post
// reference travels as part of the plaintext that gets encrypted,
// and only exists in the clear transiently after decryption.
//
// Format decision (versioned, backward + forward compatible):
//
//   - Legacy / plain messages: the plaintext is the bare message
//     string, exactly as before this module existed. Messages with
//     no post reference are STILL encoded as bare strings — we never
//     wrap a plain message in JSON, so the overwhelmingly common
//     case stays byte-identical to what old clients produce and
//     expect.
//   - Messages carrying a post reference: the plaintext is a JSON
//     envelope `{"v":1,"text":"...","aboutPostId":"..."}`.
//
// Decode is try-parse-with-fallback:
//
//   - Anything that doesn't parse as a JSON object with a numeric
//     `v` and a string `text` is treated as a bare legacy string —
//     including malformed JSON, arrays, primitives, and JSON-ish
//     text a member typed by hand.
//   - `v: 1` envelopes yield `text` + optional `aboutPostId`.
//   - Unknown FUTURE versions (v > 1) still yield `text` if present
//     (graceful degradation: an older client renders the words and
//     ignores fields it doesn't know), but we don't trust
//     version-specific fields like `aboutPostId` beyond the string
//     check — future versions may re-shape them.
//
// Known ambiguity, accepted: a member who hand-types a literal
// `{"v":1,"text":"hi"}` message will see it rendered as `hi`. The
// alternative (enveloping every message to disambiguate) breaks
// every pre-envelope message on every device; the hand-typed-JSON
// case is vanishingly rare and lossy only in display.

/** Decoded message body: the member-visible text plus an optional
 *  reference to the post the message is about. */
export interface MessageBody {
  text: string;
  aboutPostId?: string;
  /** Present when this body is an emoji REACTION to another message
   *  rather than a chat message (v2 envelope, kind "reaction").
   *  `emoji: ""` means "clear my reaction". */
  reaction?: { reactsTo: string; emoji: string };
  /** Present when this body is a VOICE NOTE (v3 envelope, kind
   *  "voice"): the recording itself, base64, riding inside the
   *  encrypted payload — the server relays ciphertext and never
   *  learns a message carried audio at all. */
  voice?: { mime: string; durationMs: number; audio: string };
}

/** What a pre-voice client shows for a voice note (the v>1 decode
 *  fallback renders `text`). Deliberately bilingual-ish and short. */
export const VOICE_FALLBACK_TEXT = "🎙️ Voice message — update the app to listen.";

/**
 * Encode a message body for encryption. Bare string when there is no
 * post reference (maximum legacy compatibility); v1 JSON envelope
 * when there is one.
 */
export function encodeMessageBody(
  text: string,
  aboutPostId?: string,
): string {
  if (!aboutPostId) return text;
  return JSON.stringify({ v: 1, text, aboutPostId });
}

/**
 * Encode an emoji reaction to another message (v2 envelope, kind
 * "reaction"). Rides the SAME sealed E2E relay as a chat message —
 * the server sees one more opaque envelope, never that it was a
 * reaction, to what, or which emoji (the privacy posture of the
 * module doc, unchanged). The `text` field is the graceful-
 * degradation path: a pre-reactions client decodes v2 via the
 * future-version fallback below and renders the emoji itself as a
 * tiny message instead of raw JSON. An empty `emoji` clears the
 * sender's earlier reaction (text falls back to "✕" so old clients
 * show something rather than an empty bubble).
 */
export function encodeReactionBody(reactsTo: string, emoji: string): string {
  return JSON.stringify({
    v: 2,
    kind: "reaction",
    text: emoji || "✕",
    reactsTo,
    emoji,
  });
}

/**
 * Encode a voice note (v3 envelope, kind "voice"). The audio bytes
 * travel base64 INSIDE the plaintext that gets sealed — same posture
 * as aboutPostId: the ciphertext hides not just the recording but
 * the fact that any recording exists. A 45s Opus/AAC clip is
 * ~100–180 KB raw (~240 KB as an envelope), well inside the relay's
 * per-route body limit. Old clients degrade to VOICE_FALLBACK_TEXT
 * via the v>1 decode fallback.
 */
export function encodeVoiceBody(
  audioBase64: string,
  mime: string,
  durationMs: number,
): string {
  return JSON.stringify({
    v: 3,
    kind: "voice",
    text: VOICE_FALLBACK_TEXT,
    mime,
    durationMs,
    audio: audioBase64,
  });
}

/**
 * Decode a decrypted plaintext into a MessageBody. Never throws:
 * anything that isn't a recognizable envelope comes back verbatim as
 * `{ text: plain }`.
 */
export function decodeMessageBody(plain: string): MessageBody {
  // Fast path — an envelope is always a JSON object. Anything not
  // starting with "{" (after the sendMessage trim, envelopes never
  // have leading whitespace) is a bare legacy string.
  if (!plain.startsWith("{")) return { text: plain };
  let parsed: unknown;
  try {
    parsed = JSON.parse(plain);
  } catch {
    return { text: plain };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { text: plain };
  }
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.v !== "number" || typeof obj.text !== "string") {
    return { text: plain };
  }
  // v1 (and, degradedly, future versions): surface the text; carry
  // the post reference through only when it's the expected shape.
  const body: MessageBody = { text: obj.text };
  if (typeof obj.aboutPostId === "string" && obj.aboutPostId !== "") {
    body.aboutPostId = obj.aboutPostId;
  }
  // v2 reaction envelope. Shape-checked like aboutPostId — a future
  // version that reshapes these fields degrades to a text message.
  if (
    obj.kind === "reaction" &&
    typeof obj.reactsTo === "string" &&
    obj.reactsTo !== "" &&
    typeof obj.emoji === "string"
  ) {
    body.reaction = { reactsTo: obj.reactsTo, emoji: obj.emoji };
  }
  // v3 voice envelope — same shape discipline.
  if (
    obj.kind === "voice" &&
    typeof obj.audio === "string" &&
    obj.audio !== "" &&
    typeof obj.mime === "string" &&
    obj.mime !== ""
  ) {
    body.voice = {
      mime: obj.mime,
      durationMs: typeof obj.durationMs === "number" ? obj.durationMs : 0,
      audio: obj.audio,
    };
  }
  return body;
}
