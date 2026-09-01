/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db, SETTING_KEYS, setSetting } from "./database";
import { createMember } from "./seed";
import {
  blobTranscriptKey,
  messageTranscriptKey,
  readTranscript,
  saveTranscript,
} from "./transcripts";
import { softPurge } from "@/lib/panic";

// Encrypted transcript twins (#477 Phase 2): ciphertext at rest
// under the member's own key, readable by that identity alone,
// cleared whole by the panic purge.

const NODE = "node_transcripts_test";
const SPOKEN = "meet me at the tool library on saturday";

async function reset() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

async function signIn() {
  const me = await createMember(
    {
      displayName: "Me",
      skills: [],
      availability: "",
      availabilityChips: [],
      locationZone: "",
    },
    NODE,
  );
  await setSetting(SETTING_KEYS.currentMember, me.publicKey);
  return me;
}

describe("transcript twins", () => {
  beforeEach(reset);

  it("round-trips through ciphertext — plaintext never at rest", async () => {
    await signIn();
    const key = messageTranscriptKey("m1");
    expect(await saveTranscript(key, "en", SPOKEN)).toBe(true);

    // The stored row carries no readable trace of the words.
    const row = (await db.transcripts.get(key))!;
    expect(JSON.stringify(row)).not.toContain("tool library");
    expect(row.nonce).toBeTruthy();
    expect(row.ciphertext).toBeTruthy();

    expect(await readTranscript(key)).toBe(SPOKEN);
    // Distinct key spaces: a blob key never collides with a message.
    expect(blobTranscriptKey("m1")).not.toBe(key);
  });

  it("opens only for the identity that wrote it", async () => {
    await signIn();
    const key = messageTranscriptKey("m2");
    await saveTranscript(key, "en", SPOKEN);

    // A different identity on the same device reads nothing.
    const other = await createMember(
      {
        displayName: "Other",
        skills: [],
        availability: "",
        availabilityChips: [],
        locationZone: "",
      },
      NODE,
    );
    await setSetting(SETTING_KEYS.currentMember, other.publicKey);
    expect(await readTranscript(key)).toBeNull();
  });

  it("stores nothing without a signed-in identity", async () => {
    expect(await saveTranscript(messageTranscriptKey("m3"), "en", SPOKEN)).toBe(
      false,
    );
    expect(await db.transcripts.count()).toBe(0);
  });

  it("is cleared whole by the panic purge", async () => {
    await signIn();
    await saveTranscript(messageTranscriptKey("m4"), "en", SPOKEN);
    await saveTranscript(blobTranscriptKey("b1"), "en", SPOKEN);
    expect(await db.transcripts.count()).toBe(2);

    const result = await softPurge();
    expect(await db.transcripts.count()).toBe(0);
    expect(result.tablesTouched).toContain("transcripts");
  });
});
