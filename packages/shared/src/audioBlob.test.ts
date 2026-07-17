/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import nacl from "tweetnacl";
import {
  AUDIO_BLOB_MAX_BYTES,
  audioBlobId,
  canonicalAudioBlobUploadPayload,
  generateKeyPair,
  isAllowedAudioMime,
  parseAudioBlobUpload,
  sign,
  verifyAudioBlobUpload,
} from "./crypto.js";
import { b64encode, utf8encode } from "./bytes.js";
import type { AudioBlobUpload } from "./types.js";

// Voice-board audio blobs (#474): the content address + signed upload
// envelope. The load-bearing property is that blobId ↔ bytes can never
// disagree — everything else (dedup, replay idempotence, tamper
// evidence on posts) follows from it.

const BYTES = utf8encode("fake-opus-bytes-for-the-content-address");

function makeUpload(
  overrides: Partial<AudioBlobUpload> = {},
): AudioBlobUpload {
  const uploader = generateKeyPair();
  const payload = {
    blobId: audioBlobId(BYTES),
    uploaderKey: uploader.publicKey,
    mime: "audio/webm;codecs=opus",
  };
  return {
    ...payload,
    audio: b64encode(BYTES),
    signature: sign(canonicalAudioBlobUploadPayload(payload), uploader.secretKey),
    ...overrides,
  };
}

describe("audioBlobId", () => {
  it("is deterministic, 64 lowercase hex chars", () => {
    const id = audioBlobId(BYTES);
    expect(id).toMatch(/^[0-9a-f]{64}$/);
    expect(audioBlobId(BYTES)).toBe(id);
  });

  it("changes when a single byte changes", () => {
    const tampered = new Uint8Array(BYTES);
    tampered[0] ^= 1;
    expect(audioBlobId(tampered)).not.toBe(audioBlobId(BYTES));
  });

  it("is domain-separated from a bare SHA-512 of the same bytes", () => {
    // The prefix means no other hash in the system (inviteTokenHash,
    // founderKeyHash, ...) can collide with an audio content address.
    const bare = nacl.hash(BYTES);
    let bareHex = "";
    for (let i = 0; i < 32; i++) {
      bareHex += bare[i].toString(16).padStart(2, "0");
    }
    expect(audioBlobId(BYTES)).not.toBe(bareHex);
  });
});

describe("verifyAudioBlobUpload", () => {
  it("accepts a well-signed upload", () => {
    expect(verifyAudioBlobUpload(makeUpload())).toBe(true);
  });

  it("rejects a tampered mime (the signature covers it)", () => {
    const upload = makeUpload();
    expect(
      verifyAudioBlobUpload({ ...upload, mime: "audio/mp4" }),
    ).toBe(false);
  });

  it("rejects a swapped blobId (the signature covers it)", () => {
    const upload = makeUpload();
    const other = audioBlobId(utf8encode("different bytes"));
    expect(verifyAudioBlobUpload({ ...upload, blobId: other })).toBe(false);
  });

  it("rejects an empty signature", () => {
    expect(verifyAudioBlobUpload(makeUpload({ signature: "" }))).toBe(false);
  });
});

describe("parseAudioBlobUpload", () => {
  it("passes a valid upload through unchanged", () => {
    const upload = makeUpload();
    const parsed = parseAudioBlobUpload(upload);
    expect(parsed).toEqual({ ok: true, value: upload });
  });

  it("rejects a non-hex blobId", () => {
    const parsed = parseAudioBlobUpload(makeUpload({ blobId: "not-hex!" }));
    expect(parsed.ok).toBe(false);
  });

  it("rejects a disallowed mime", () => {
    const parsed = parseAudioBlobUpload(makeUpload({ mime: "video/mp4" }));
    expect(parsed.ok).toBe(false);
  });

  it("rejects base64 audio longer than the ceiling's encoding", () => {
    const over = "A".repeat(Math.ceil(AUDIO_BLOB_MAX_BYTES / 3) * 4 + 8);
    const parsed = parseAudioBlobUpload(makeUpload({ audio: over }));
    expect(parsed.ok).toBe(false);
  });

  it("rejects missing fields and non-objects", () => {
    expect(parseAudioBlobUpload(null).ok).toBe(false);
    expect(parseAudioBlobUpload("hi").ok).toBe(false);
    const { audio: _audio, ...rest } = makeUpload();
    expect(parseAudioBlobUpload(rest).ok).toBe(false);
  });
});

describe("isAllowedAudioMime", () => {
  it("accepts every mime the recorder negotiation can produce", () => {
    for (const mime of [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
      "audio/aac",
      "audio/mpeg",
    ]) {
      expect(isAllowedAudioMime(mime)).toBe(true);
    }
  });

  it("refuses non-audio and oversize values", () => {
    expect(isAllowedAudioMime("video/webm")).toBe(false);
    expect(isAllowedAudioMime("text/html")).toBe(false);
    expect(isAllowedAudioMime("application/octet-stream")).toBe(false);
    expect(isAllowedAudioMime(`audio/webm;${"x".repeat(80)}`)).toBe(false);
  });
});
