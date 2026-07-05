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
import { db } from "./database";
import { createMember } from "./seed";
import {
  __resetSessionForTests,
  changePassphrase,
  currentLockState,
  disablePassphrase,
  enablePassphrase,
  getSecretKey,
  isUnlocked,
  lockSession,
  persistSecretKey,
  unlockSession,
} from "./secrets";
import {
  claimPost,
  confirmExchange,
  createPost,
} from "./actions";
import { generateKeyPair } from "@/lib/crypto";

const NODE = "node_pass";

async function reset() {
  __resetSessionForTests();
  await Promise.all([
    db.members.clear(),
    db.posts.clear(),
    db.exchanges.clear(),
    db.achievements.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.invites.clear(),
    db.vouches.clear(),
    db.outbox.clear(),
    db.projects.clear(),
    db.projectTasks.clear(),
    db.projectActivity.clear(),
    db.pairingLog.clear(),
    db.coorgInvitations.clear(),
    db.coorgInvitationResponses.clear(),
    db.coorgInvitationRevocations.clear(),
  ]);
}

describe("currentLockState", () => {
  beforeEach(reset);

  it("reports unprotected when no row is wrapped", async () => {
    await createMember({ displayName: "A" }, NODE);
    expect(await currentLockState()).toBe("unprotected");
  });

  it("reports unlocked after enablePassphrase + unlockSession", async () => {
    await createMember({ displayName: "A" }, NODE);
    await enablePassphrase("correct-horse-battery");
    expect(await currentLockState()).toBe("unlocked");
    lockSession();
    expect(await currentLockState()).toBe("locked");
    await unlockSession("correct-horse-battery");
    expect(await currentLockState()).toBe("unlocked");
  });
});

describe("getSecretKey", () => {
  beforeEach(reset);

  it("returns plaintext for unprotected rows", async () => {
    const m = await createMember({ displayName: "A" }, NODE);
    const row = await db.secretKeys.get(m.publicKey);
    expect(row?.secretKey).toBeTruthy();
    const fetched = await getSecretKey(m.publicKey);
    expect(fetched).toBe(row?.secretKey);
  });

  it("refuses to return secrets while locked", async () => {
    const m = await createMember({ displayName: "A" }, NODE);
    await enablePassphrase("passphrase-one");
    lockSession();
    await expect(getSecretKey(m.publicKey)).rejects.toThrow(/locked/);
  });

  it("returns the same plaintext before and after a wrap / unwrap cycle", async () => {
    const m = await createMember({ displayName: "A" }, NODE);
    const before = await getSecretKey(m.publicKey);
    await enablePassphrase("passphrase-one");
    const duringUnlocked = await getSecretKey(m.publicKey);
    lockSession();
    await unlockSession("passphrase-one");
    const afterReUnlock = await getSecretKey(m.publicKey);
    expect(duringUnlocked).toBe(before);
    expect(afterReUnlock).toBe(before);
  });
});

describe("unlockSession", () => {
  beforeEach(reset);

  it("rejects the wrong passphrase without establishing a session", async () => {
    await createMember({ displayName: "A" }, NODE);
    await enablePassphrase("real-passphrase");
    lockSession();
    const result = await unlockSession("wrong-passphrase");
    expect(result).toBe("wrong_passphrase");
    expect(isUnlocked()).toBe(false);
  });

  it("returns nothing_to_unlock when no wrapped rows exist", async () => {
    await createMember({ displayName: "A" }, NODE);
    const result = await unlockSession("any");
    expect(result).toBe("nothing_to_unlock");
  });
});

describe("enablePassphrase", () => {
  beforeEach(reset);

  it("rejects passphrases that fail validation", async () => {
    await createMember({ displayName: "A" }, NODE);
    await expect(enablePassphrase("short")).rejects.toThrow(/at least/);
  });

  it("wraps every plaintext row in a single call", async () => {
    await createMember({ displayName: "A" }, NODE);
    await createMember({ displayName: "B" }, NODE);
    await enablePassphrase("pass-one");
    const rows = await db.secretKeys.toArray();
    expect(rows).toHaveLength(2);
    for (const r of rows) {
      expect(r.wrapped).toBeTruthy();
      expect(r.secretKey).toBeUndefined();
    }
  });
});

describe("changePassphrase", () => {
  beforeEach(reset);

  it("rejects the wrong current passphrase", async () => {
    await createMember({ displayName: "A" }, NODE);
    await enablePassphrase("original");
    lockSession();
    await expect(
      changePassphrase("wrong", "new-passphrase"),
    ).rejects.toThrow(/didn't match/);
  });

  it("re-wraps under the new passphrase and invalidates the old", async () => {
    const m = await createMember({ displayName: "A" }, NODE);
    await enablePassphrase("original");
    await changePassphrase("original", "brand-new-one");
    lockSession();
    const wrong = await unlockSession("original");
    expect(wrong).toBe("wrong_passphrase");
    const right = await unlockSession("brand-new-one");
    expect(right).toBe("unlocked");
    const plaintext = await getSecretKey(m.publicKey);
    expect(plaintext).toBeTruthy();
  });
});

describe("disablePassphrase", () => {
  beforeEach(reset);

  it("requires the session to be unlocked", async () => {
    await createMember({ displayName: "A" }, NODE);
    await enablePassphrase("some-passphrase");
    lockSession();
    await expect(disablePassphrase()).rejects.toThrow(/Unlock the session/);
  });

  it("rewrites every wrapped row as plaintext when unlocked", async () => {
    await createMember({ displayName: "A" }, NODE);
    await enablePassphrase("some-passphrase");
    await disablePassphrase();
    const rows = await db.secretKeys.toArray();
    for (const r of rows) {
      expect(r.secretKey).toBeTruthy();
      expect(r.wrapped).toBeUndefined();
    }
    expect(await currentLockState()).toBe("unprotected");
  });
});

describe("signing flows with passphrase protection", () => {
  beforeEach(reset);

  it("still signs an exchange after enable → lock → unlock cycle", async () => {
    const poster = await createMember({ displayName: "A" }, NODE);
    const claimer = await createMember({ displayName: "B" }, NODE);

    await enablePassphrase("shared-passphrase");

    const post = await createPost(poster.publicKey, "", {
      type: "NEED",
      category: "other",
      title: "help",
      description: "",
      estimatedHours: 1,
      urgency: "low",
      expiresAt: null,
    }, NODE);
    await claimPost(post.id, claimer.publicKey);

    // Poster's first confirmation doesn't require a signature — no block.
    await confirmExchange(post.id, poster.publicKey, NODE);

    // Now the second confirmation would sign. A locked session must
    // refuse at that step.
    lockSession();
    await expect(
      confirmExchange(post.id, claimer.publicKey, NODE),
    ).rejects.toThrow(/secret key/);

    await unlockSession("shared-passphrase");
    const result = await confirmExchange(
      post.id,
      claimer.publicKey,
      NODE,
    );
    expect(result.exchange).not.toBeNull();
  });

  it("refuses to issue an invite while locked", async () => {
    const m = await createMember({ displayName: "A" }, NODE);
    await enablePassphrase("shared-passphrase");
    lockSession();
    const { issueInvite } = await import("./invites");
    await expect(
      issueInvite({
        inviterKey: m.publicKey,
        inviterName: m.displayName,
        nodeId: NODE,
      }),
    ).rejects.toThrow(/locked/);
  });
});

describe("persistSecretKey — wrap on write (Round-4)", () => {
  beforeEach(reset);

  it("wraps a key minted AFTER protection is enabled; it is unreadable while locked", async () => {
    const { publicKey, secretKey } = generateKeyPair();
    // Enable protection with one identity present.
    await createMember({ displayName: "First" }, NODE);
    await enablePassphrase("shared-passphrase");
    // A second identity is minted while unlocked (invite-redeem / pair).
    await persistSecretKey(publicKey, secretKey);

    // The new row is WRAPPED, not plaintext.
    const row = await db.secretKeys.get(publicKey);
    expect(row?.secretKey).toBeUndefined();
    expect(row?.wrapped).toBeDefined();

    // While unlocked it reads back; after locking it does NOT (the old
    // bug: getSecretKey returned a plaintext row regardless of lock).
    expect(await getSecretKey(publicKey)).toBe(secretKey);
    lockSession();
    await expect(getSecretKey(publicKey)).rejects.toThrow(/locked/);
    // And it re-unlocks with the shared passphrase.
    await unlockSession("shared-passphrase");
    expect(await getSecretKey(publicKey)).toBe(secretKey);
  });

  it("stores plaintext when the device is unprotected (unchanged default)", async () => {
    const { publicKey, secretKey } = generateKeyPair();
    await persistSecretKey(publicKey, secretKey);
    const row = await db.secretKeys.get(publicKey);
    expect(row?.secretKey).toBe(secretKey);
    expect(row?.wrapped).toBeUndefined();
  });
});
