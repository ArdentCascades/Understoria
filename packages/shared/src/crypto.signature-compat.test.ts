/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  canonicalPostPayload,
  generateKeyPair,
  sign,
  verifyPost,
} from "./crypto.js";
import type { Post } from "./types.js";

// Voice board (#474) compatibility lock: adding the optional `audio`
// field to the signed post payload must NOT change the bytes any
// pre-audio post signed — and a signed audio reference must be
// tamper-evident.

describe("post signature compatibility (audio is conditionally signed)", () => {
  const kp = generateKeyPair();
  const base = {
    id: "post_1",
    type: "OFFER" as const,
    category: "food" as const,
    title: "Bread to share",
    description: "Two loaves",
    estimatedHours: 1,
    urgency: "low" as const,
    postedBy: kp.publicKey,
    createdAt: 1_700_000_000_000,
    expiresAt: null,
    locationZone: "North",
    nodeId: "node_a",
  };

  it("a pre-audio payload serializes byte-identically (no audio key at all)", () => {
    const canon = canonicalPostPayload(base);
    expect(canon).not.toContain("audio");
    // The exact legacy byte layout, locked.
    expect(canon).toBe(
      JSON.stringify({
        id: base.id,
        type: base.type,
        category: base.category,
        title: base.title,
        description: base.description,
        estimatedHours: base.estimatedHours,
        urgency: base.urgency,
        postedBy: base.postedBy,
        createdAt: base.createdAt,
        expiresAt: base.expiresAt,
        locationZone: base.locationZone,
        nodeId: base.nodeId,
      }),
    );
  });

  it("an old signature still verifies; a signed audio ref is tamper-evident", () => {
    const legacySig = sign(canonicalPostPayload(base), kp.secretKey);
    const legacyPost: Post = {
      ...base,
      claimedBy: null,
      status: "open",
      confirmedBy: [],
      signature: legacySig,
    };
    expect(verifyPost(legacyPost)).toBe(true);

    const audio = { blobId: "hash_abc", mime: "audio/mp4", durationMs: 9000 };
    const voiceSig = sign(
      canonicalPostPayload({ ...base, audio }),
      kp.secretKey,
    );
    const voicePost: Post = { ...legacyPost, audio, signature: voiceSig };
    expect(verifyPost(voicePost)).toBe(true);
    // Swapping the recording under the signature fails verification.
    expect(
      verifyPost({
        ...voicePost,
        audio: { ...audio, blobId: "hash_evil" },
      }),
    ).toBe(false);
    // Stripping the audio from a voice post also fails.
    expect(verifyPost({ ...voicePost, audio: undefined })).toBe(false);
  });
});
