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
//
// The device-master-key envelope (v2) — the storage half of passkey
// unlock. These tests drive db/secrets.ts with plain KEK bytes (the
// WebAuthn ceremony is lib/passkeyUnlock.ts's seam, tested there),
// which is exactly the split the code makes. Locks:
//   1. Enrolling migrates v1 → v2 atomically and BOTH unlock paths
//      (passphrase, KEK) open every key afterwards.
//   2. changePassphrase on v2 rewraps only the DMK's passphrase
//      wrapper — the passkey KEK still unlocks after the change (the
//      property the envelope exists to provide).
//   3. disablePassphrase REFUSES while a passkey is enrolled — a
//      passkey may never be the only unlock method — and works after
//      removePasskeyWrapper, returning rows to plaintext.
//   4. Keys minted while KEK-unlocked wrap under the DMK and open
//      from both paths.
//   5. A wrong KEK does not unlock and leaves the session locked.
//   6. Passphrase-only devices never see the envelope (no wrappers
//      record; v1 blobs stay v1).
//
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { db, getSetting, SETTING_KEYS } from "./database";
import {
  __resetSessionForTests,
  changePassphrase,
  currentLockState,
  disablePassphrase,
  enablePassphrase,
  enrollPasskeyWrapper,
  getSecretKey,
  isUnlocked,
  lockSession,
  passkeyEnrollment,
  persistSecretKey,
  removePasskeyWrapper,
  unlockSession,
  unlockSessionWithKek,
} from "./secrets";
import { isDirectBlob } from "@/lib/passphrase";
import { b64encode } from "@/lib/bytes";

const PASS = "correct horse battery";
const PASS2 = "battery staple horse";
const KEK = new Uint8Array(32).fill(3);
const WRONG_KEK = new Uint8Array(32).fill(4);
const META = {
  credentialId: "AQIDBAUGBwg",
  prfSalt: b64encode(new Uint8Array(32).fill(5)),
  createdAt: 1_700_000_000_000,
};

const keyA = { publicKey: "pub-a", secretKey: b64encode(new Uint8Array(64).fill(1)) };
const keyB = { publicKey: "pub-b", secretKey: b64encode(new Uint8Array(64).fill(2)) };

async function freshProtectedDevice(): Promise<void> {
  await db.secretKeys.clear();
  await db.settings.clear();
  __resetSessionForTests();
  await db.secretKeys.put({ ...keyA });
  await enablePassphrase(PASS); // wraps keyA (v1) and leaves unlocked
}

async function enrolled(): Promise<void> {
  await freshProtectedDevice();
  await enrollPasskeyWrapper(KEK, META);
}

beforeEach(async () => {
  await db.secretKeys.clear();
  await db.settings.clear();
  __resetSessionForTests();
});

describe("envelope migration (v1 → v2) at enrollment", () => {
  it("rewraps rows under the DMK and stores both wrappers", async () => {
    await enrolled();
    const row = await db.secretKeys.get(keyA.publicKey);
    expect(row?.secretKey).toBeUndefined();
    expect(row?.wrapped && isDirectBlob(row.wrapped)).toBe(true);
    const raw = await getSetting(SETTING_KEYS.deviceKeyWrappers);
    expect(raw).toBeTruthy();
    const wrappers = JSON.parse(raw!);
    expect(wrappers.passphrase).toBeTruthy();
    expect(wrappers.passkey.credentialId).toBe(META.credentialId);
    // Session stays unlocked (now via DMK) and can read the key.
    expect(isUnlocked()).toBe(true);
    expect(await getSecretKey(keyA.publicKey)).toBe(keyA.secretKey);
  });

  it("refuses without passphrase protection (plaintext device)", async () => {
    await db.secretKeys.put({ ...keyA });
    await expect(enrollPasskeyWrapper(KEK, META)).rejects.toThrow(
      /unlock the session/i,
    );
  });

  it("refuses while locked", async () => {
    await freshProtectedDevice();
    lockSession();
    await expect(enrollPasskeyWrapper(KEK, META)).rejects.toThrow(
      /unlock the session/i,
    );
  });
});

describe("both unlock paths open the same keys", () => {
  it("passphrase unlock works on a v2 device", async () => {
    await enrolled();
    lockSession();
    expect(await currentLockState()).toBe("locked");
    expect(await unlockSession(PASS)).toBe("unlocked");
    expect(await getSecretKey(keyA.publicKey)).toBe(keyA.secretKey);
  });

  it("KEK unlock works and reads the same key", async () => {
    await enrolled();
    lockSession();
    expect(await unlockSessionWithKek(KEK)).toBe("unlocked");
    expect(await currentLockState()).toBe("unlocked");
    expect(await getSecretKey(keyA.publicKey)).toBe(keyA.secretKey);
  });

  it("a wrong KEK is rejected and the session stays locked", async () => {
    await enrolled();
    lockSession();
    expect(await unlockSessionWithKek(WRONG_KEK)).toBe("wrong_key");
    expect(isUnlocked()).toBe(false);
    await expect(getSecretKey(keyA.publicKey)).rejects.toThrow(/locked/i);
  });

  it("a wrong passphrase is rejected on a v2 device", async () => {
    await enrolled();
    lockSession();
    expect(await unlockSession("not the passphrase")).toBe(
      "wrong_passphrase",
    );
    expect(isUnlocked()).toBe(false);
  });

  it("KEK unlock without an enrollment reports no_passkey", async () => {
    await freshProtectedDevice();
    lockSession();
    expect(await unlockSessionWithKek(KEK)).toBe("no_passkey");
  });
});

describe("changePassphrase on the envelope", () => {
  it("keeps the passkey wrapper valid across a passphrase change", async () => {
    await enrolled();
    lockSession();
    await changePassphrase(PASS, PASS2);
    // New passphrase opens; old does not.
    lockSession();
    expect(await unlockSession(PASS)).toBe("wrong_passphrase");
    expect(await unlockSession(PASS2)).toBe("unlocked");
    // And the passkey KEK still opens — rows and passkey wrapper
    // were untouched.
    lockSession();
    expect(await unlockSessionWithKek(KEK)).toBe("unlocked");
    expect(await getSecretKey(keyA.publicKey)).toBe(keyA.secretKey);
  });

  it("rejects a wrong current passphrase on v2", async () => {
    await enrolled();
    lockSession();
    await expect(changePassphrase("wrong", PASS2)).rejects.toThrow(
      /didn't match/i,
    );
  });
});

describe("the passphrase-first invariant", () => {
  it("disablePassphrase refuses while a passkey is enrolled", async () => {
    await enrolled();
    await expect(disablePassphrase()).rejects.toThrow(/remove the passkey/i);
    // Nothing changed.
    expect(await passkeyEnrollment()).not.toBeNull();
    expect(await currentLockState()).toBe("unlocked");
  });

  it("after removing the passkey, disable returns rows to plaintext and drops the wrappers", async () => {
    await enrolled();
    await removePasskeyWrapper();
    expect(await passkeyEnrollment()).toBeNull();
    await disablePassphrase();
    const row = await db.secretKeys.get(keyA.publicKey);
    expect(row?.secretKey).toBe(keyA.secretKey);
    expect(row?.wrapped).toBeUndefined();
    expect(await getSetting(SETTING_KEYS.deviceKeyWrappers)).toBeUndefined();
    expect(await currentLockState()).toBe("unprotected");
  });

  it("removePasskeyWrapper requires an unlocked session", async () => {
    await enrolled();
    lockSession();
    await expect(removePasskeyWrapper()).rejects.toThrow(/unlock/i);
  });
});

describe("keys minted under the envelope", () => {
  it("persistSecretKey wraps under the DMK and both paths read it", async () => {
    await enrolled();
    await persistSecretKey(keyB.publicKey, keyB.secretKey);
    const row = await db.secretKeys.get(keyB.publicKey);
    expect(row?.secretKey).toBeUndefined();
    expect(row?.wrapped && isDirectBlob(row.wrapped)).toBe(true);

    lockSession();
    await unlockSession(PASS);
    expect(await getSecretKey(keyB.publicKey)).toBe(keyB.secretKey);

    lockSession();
    await unlockSessionWithKek(KEK);
    expect(await getSecretKey(keyB.publicKey)).toBe(keyB.secretKey);
  });
});

describe("passphrase-only devices never see the envelope", () => {
  it("enable/unlock/change stay v1 with no wrappers record", async () => {
    await freshProtectedDevice();
    expect(await getSetting(SETTING_KEYS.deviceKeyWrappers)).toBeUndefined();
    const row = await db.secretKeys.get(keyA.publicKey);
    expect(row?.wrapped && isDirectBlob(row.wrapped)).toBe(false);

    lockSession();
    expect(await unlockSession(PASS)).toBe("unlocked");
    await changePassphrase(PASS, PASS2);
    expect(await getSetting(SETTING_KEYS.deviceKeyWrappers)).toBeUndefined();
    lockSession();
    expect(await unlockSession(PASS2)).toBe("unlocked");
    expect(await getSecretKey(keyA.publicKey)).toBe(keyA.secretKey);
  });
});
