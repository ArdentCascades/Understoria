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
import type { FastifyInstance } from "fastify";
import {
  AUDIO_BLOB_MAX_BYTES,
  audioBlobId,
  parseAudioBlobUpload,
  verifyAudioBlobUpload,
} from "@understoria/shared/crypto";
import type { AudioBlobStore } from "../db.js";

interface Deps {
  store: AudioBlobStore;
  now?: () => number;
}

/**
 * Voice-board audio blobs (#474) — the node-side store for board
 * recordings. Content-addressed: the blobId a post's SIGNED `audio`
 * reference names is `audioBlobId(bytes)`, and this route recomputes
 * that hash from the bytes that actually arrived, so the store can
 * never hold bytes that disagree with the id — a compromised relay
 * cannot swap a recording under a post's signature.
 *
 * POST /audio-blobs
 *   - Body: one signed AudioBlobUpload (base64 audio + content
 *     address + uploader signature over {blobId, uploaderKey, mime}).
 *   - 201 — verified and novel (stored)
 *   - 200 — idempotent replay: the blob is already here. Identical
 *     bytes hash to the identical id, so who re-uploads is irrelevant.
 *   - 400 — malformed body / disallowed mime / oversize
 *   - 422 — signature invalid, or the bytes don't hash to blobId
 *   Member-gated like every attributable POST (readAuth.ts write
 *   guard keys on `uploaderKey` via the SURFACES map); per-key insert
 *   caps bound disk growth.
 *
 * GET /audio-blobs/:blobId
 *   - The raw audio bytes with the stored content-type. Immutable by
 *     construction (the id IS the content), so cached hard.
 *   Member-authenticated read — the deny-by-default read guard covers
 *   this GET like every other federation read.
 *
 * PWA↔node only in this slice: blobs do NOT ride the peer-pull legs.
 * A federated post referencing a recording its node doesn't hold plays
 * as "recording unavailable" until V8 (#478) federates blobs.
 */
export async function registerAudioBlobRoutes(
  app: FastifyInstance,
  { store, now = () => Date.now() }: Deps,
): Promise<void> {
  // Per-route body ceiling (the /messages and /device-link precedent):
  // the server-wide 64 KB default is far too small for base64 audio,
  // and 640 KB comfortably fits the 400 KB byte ceiling after base64
  // expansion plus JSON envelope.
  app.post("/audio-blobs", { bodyLimit: 640 * 1024 }, async (req, reply) => {
    const parsed = parseAudioBlobUpload(req.body);
    if (!parsed.ok) {
      reply.code(400);
      return { error: "invalid_body", reason: parsed.error };
    }
    const upload = parsed.value;

    if (!verifyAudioBlobUpload(upload)) {
      reply.code(422);
      return { error: "bad_signature" };
    }

    const bytes = Buffer.from(upload.audio, "base64");
    if (bytes.length === 0 || bytes.length > AUDIO_BLOB_MAX_BYTES) {
      reply.code(400);
      return { error: "invalid_body", reason: "audio exceeds the size ceiling" };
    }
    // The content-address check — the heart of the surface. The
    // signature only vouches for {blobId, uploaderKey, mime}; this
    // recomputation is what binds the actual bytes to that blobId.
    if (audioBlobId(new Uint8Array(bytes)) !== upload.blobId) {
      reply.code(422);
      return { error: "content_address_mismatch" };
    }

    if (store.has(upload.blobId)) {
      reply.code(200);
      return { stored: false, blobId: upload.blobId };
    }

    store.insert({
      blobId: upload.blobId,
      uploaderKey: upload.uploaderKey,
      mime: upload.mime,
      bytes,
      signature: upload.signature,
      createdAt: now(),
    });
    reply.code(201);
    return { stored: true, blobId: upload.blobId };
  });

  app.get<{ Params: { blobId: string } }>(
    "/audio-blobs/:blobId",
    async (req, reply) => {
      const row = store.get(req.params.blobId);
      if (row === null) {
        reply.code(404);
        return { error: "not_found" };
      }
      // Content-addressed ⇒ immutable: the same id can never serve
      // different bytes, so let the browser cache the recording for
      // good. `private` keeps shared proxies out of it — the GET is
      // member-authenticated.
      reply
        .type(row.mime)
        .header("Cache-Control", "private, max-age=31536000, immutable");
      return reply.send(row.bytes);
    },
  );
}
