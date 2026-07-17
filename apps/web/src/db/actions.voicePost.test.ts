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
import { beforeEach, describe, expect, it } from "vitest";
import {
  audioBlobId,
  verifyAudioBlobUpload,
  verifyPost,
} from "@understoria/shared/crypto";
import { b64encode, utf8encode } from "@understoria/shared/bytes";
import type { AudioBlobUpload, Post } from "@/types";
import { createPost } from "./actions";
import { db } from "./database";
import { createMember } from "./seed";
import { setSetting, SETTING_KEYS } from "./database";
import { softPurge } from "@/lib/panic";

// Voice board (#474): a voice post is two records — the recording
// rides the outbox to the node's content-addressed store, and the
// post SIGNS the {blobId, mime, durationMs} reference. These tests
// lock the pairing: signature covers the audio ref, both halves
// enqueue atomically, text posts stay byte-identical, and panic
// drops the recording reference with the rest of the content.

const NODE = "node_test";
const BYTES = utf8encode("voice-post-bytes-for-the-board");
const CLIP = {
  base64: b64encode(BYTES),
  mime: "audio/webm;codecs=opus",
  durationMs: 9_000,
};

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.posts.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.outbox.clear(),
  ]);
  // enqueueOutbox no-ops without a configured node URL.
  await setSetting(SETTING_KEYS.communityNodeUrl, "https://node.test");
}

describe("createPost with a voice clip", () => {
  beforeEach(reset);

  it("signs the audio reference into the post (tamper-evident)", async () => {
    const poster = await createMember({ displayName: "Rosa" }, NODE);
    const post = await createPost(poster.publicKey, "zone", {
      type: "NEED",
      category: "other",
      title: "Voice ask",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
      voice: CLIP,
    }, NODE);

    expect(post.audio).toEqual({
      blobId: audioBlobId(BYTES),
      mime: CLIP.mime,
      durationMs: CLIP.durationMs,
    });
    expect(verifyPost(post)).toBe(true);
    // The reference is INSIDE the signature: swapping the recording
    // breaks verification.
    const swapped: Post = {
      ...post,
      audio: { ...post.audio!, blobId: audioBlobId(utf8encode("other")) },
    };
    expect(verifyPost(swapped)).toBe(false);
  });

  it("enqueues the blob upload AND the post wire (with audio) atomically", async () => {
    const poster = await createMember({ displayName: "Rosa" }, NODE);
    const post = await createPost(poster.publicKey, "zone", {
      type: "OFFER",
      category: "food",
      title: "Soup, spoken",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
      voice: CLIP,
    }, NODE);

    const rows = await db.outbox.toArray();
    const blobRow = rows.find((r) => r.kind === "audio_blob");
    const postRow = rows.find((r) => r.kind === "post");
    expect(blobRow).toBeDefined();
    expect(postRow).toBeDefined();

    const upload = JSON.parse(blobRow!.payload) as AudioBlobUpload;
    expect(upload.blobId).toBe(audioBlobId(BYTES));
    expect(upload.uploaderKey).toBe(poster.publicKey);
    expect(upload.audio).toBe(CLIP.base64);
    expect(verifyAudioBlobUpload(upload)).toBe(true);

    // The post's wire payload must carry the audio ref — stripping it
    // would 422 at the node (the signature covers it).
    const wire = JSON.parse(postRow!.payload) as Post;
    expect(wire.audio).toEqual(post.audio);
    expect(verifyPost({ ...wire, claimedBy: null, status: "open", confirmedBy: [] })).toBe(
      true,
    );
  });

  it("keeps text posts byte-identical: no audio key anywhere", async () => {
    const poster = await createMember({ displayName: "Rosa" }, NODE);
    const post = await createPost(poster.publicKey, "zone", {
      type: "NEED",
      category: "other",
      title: "Plain text",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    }, NODE);

    expect("audio" in post).toBe(false);
    expect(verifyPost(post)).toBe(true);
    const postRow = (await db.outbox.toArray()).find((r) => r.kind === "post");
    expect(JSON.parse(postRow!.payload)).not.toHaveProperty("audio");
  });

  it("soft purge drops the audio reference from posts", async () => {
    const poster = await createMember({ displayName: "Rosa" }, NODE);
    const post = await createPost(poster.publicKey, "zone", {
      type: "NEED",
      category: "other",
      title: "Voice ask",
      description: "words",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
      voice: CLIP,
    }, NODE);
    expect((await db.posts.get(post.id))?.audio).toBeDefined();

    await softPurge();

    const scrubbed = await db.posts.get(post.id);
    expect(scrubbed).toBeDefined();
    expect(scrubbed!.title).toBe("");
    expect(scrubbed!.audio).toBeUndefined();
  });
});
