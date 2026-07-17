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
import {
  audioBlobId,
  canonicalAudioBlobUploadPayload,
  sign,
} from "@understoria/shared/crypto";
import { b64decode, b64encode } from "@understoria/shared/bytes";
import type { AudioBlobUpload, Post } from "@/types";
import type { CapturedClip } from "@/components/VoiceRecorder";
import { authorizedFetch } from "@/lib/authorizedRead";
import { readSubmitConfig } from "@/lib/nodeSubmit";

/**
 * Voice board (#474), client half of the audio-blob surface.
 *
 * A voice post is two records: the recording's bytes go to the node's
 * content-addressed store (POST /audio-blobs, via the outbox), and the
 * post carries a SIGNED reference {blobId, mime, durationMs} whose
 * blobId is the hash of those exact bytes — so the pair is
 * tamper-evident end to end without the node ever understanding the
 * audio. Playback fetches the bytes back by content address
 * (member-authenticated GET) and never caches them in Dexie: the
 * device keeps only the reference, the node keeps the bytes, and the
 * browser's HTTP cache (the response is immutable by construction)
 * absorbs repeat listens.
 */

export interface VoiceAttachment {
  /** The signed upload envelope for the outbox. */
  upload: AudioBlobUpload;
  /** The reference the post signs over. */
  audio: NonNullable<Post["audio"]>;
}

/**
 * Turn a captured clip into the signed upload + the post's audio
 * reference. Pure of I/O — the caller decides where both halves go
 * (createPost enqueues the upload and signs the reference into the
 * post in one transaction).
 */
export function buildVoiceAttachment(
  clip: CapturedClip,
  uploaderKey: string,
  uploaderSecret: string,
): VoiceAttachment {
  const bytes = b64decode(clip.base64);
  const blobId = audioBlobId(bytes);
  const payload = { blobId, uploaderKey, mime: clip.mime };
  return {
    upload: {
      ...payload,
      audio: clip.base64,
      signature: sign(canonicalAudioBlobUploadPayload(payload), uploaderSecret),
    },
    audio: {
      blobId,
      mime: clip.mime,
      durationMs: clip.durationMs,
    },
  };
}

export interface FetchedAudioBlob {
  base64: string;
  mime: string;
}

/**
 * Fetch a recording's bytes from the community node by content
 * address. Returns null when no node is configured, the node doesn't
 * hold the blob (yet — the uploader may still be offline, or the post
 * federated from a peer community whose blobs don't replicate before
 * V8/#478), or the request fails; callers render the "recording
 * unavailable" fallback and the next attempt simply retries.
 */
export async function fetchAudioBlob(
  blobId: string,
): Promise<FetchedAudioBlob | null> {
  const cfg = await readSubmitConfig();
  if (!cfg.enabled || cfg.url.trim() === "") return null;
  const baseUrl = cfg.url.replace(/\/+$/, "");
  try {
    const res = await authorizedFetch(
      `${baseUrl}/audio-blobs/${encodeURIComponent(blobId)}`,
      baseUrl,
    );
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes.length === 0) return null;
    // Trust boundary: the response is UNTRUSTED (a compromised node
    // controls it), but the blobId is a hash of the bytes the poster
    // signed — recompute and refuse a swap, exactly like the server
    // does on upload.
    if (audioBlobId(bytes) !== blobId) return null;
    return {
      base64: b64encode(bytes),
      mime: res.headers.get("content-type") ?? "audio/webm",
    };
  } catch {
    return null;
  }
}
