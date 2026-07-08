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
import { db, getSetting, SETTING_KEYS, type SecretKeyRow } from "./database";
import {
  DEFAULT_ITERATIONS,
  deriveMasterKey,
  isDirectBlob,
  newSalt,
  saltFromBlob,
  unwrap,
  unwrapDirect,
  validatePassphrase,
  wrap,
  wrapDirect,
  type DirectWrappedBlob,
  type WrappedBlob,
} from "@/lib/passphrase";
import { b64decode, b64encode, randomBytes } from "@/lib/bytes";
import type { PasskeyEnrollmentMeta } from "@/lib/passkeyUnlock";

/**
 * Session-scoped secret-key manager.
 *
 * A node is in one of three states:
 *
 *   - `unprotected`: every SecretKeyRow carries a plaintext `secretKey`.
 *     This is the default for fresh installs and demo/dev sessions.
 *   - `locked`: at least one row is `wrapped` and no master key has been
 *     admitted into the session. Signing is refused.
 *   - `unlocked`: wrapped rows exist and the session holds a master key
 *     that successfully decrypted at least one of them. Signing works.
 *
 * Session state lives in module-local memory. It is never persisted to
 * IndexedDB, so a tab close always relocks. Clearing the session is
 * equivalent to locking.
 */

export type LockState = "unprotected" | "locked" | "unlocked";

/**
 * The device-master-key envelope (v2, passkey-era layout).
 *
 * v1 (passphrase only, unchanged for devices that never enroll a
 * passkey): each secret-key row is wrapped DIRECTLY by the
 * passphrase-derived key.
 *
 * v2 (created the first time a passkey is enrolled): rows are wrapped
 * by a random 32-byte device master key (DMK), and the DMK is stored
 * wrapped once per unlock method — under the passphrase's PBKDF2 key
 * and under the passkey's PRF-derived key. Changing the passphrase
 * then rewraps only the DMK's passphrase wrapper; the passkey wrapper
 * (and every row) is untouched, and vice versa. The wrappers record
 * lives in `settings` (small, device-local, never exported).
 *
 * Invariant the UI relies on: a passkey is never the ONLY unlock
 * method — `disablePassphrase` refuses while a passkey is enrolled,
 * and enrollment requires passphrase protection already on. A lost
 * or platform-reset passkey therefore never locks anyone out of
 * their own identity.
 */
export interface DeviceKeyWrappers {
  v: 1;
  /** DMK wrapped under the passphrase-derived key (self-contained
   *  PBKDF2 params, like any v1 blob). */
  passphrase?: WrappedBlob;
  /** DMK wrapped under the passkey PRF-derived KEK, plus the
   *  non-secret enrollment metadata the assert ceremony needs. */
  passkey?: PasskeyEnrollmentMeta & { blob: DirectWrappedBlob };
}

interface SessionState {
  /** v1 sessions: the passphrase-derived key that unwraps rows. */
  masterKey: Uint8Array | null;
  /** The salt + iterations the active masterKey was derived from. New
   *  keys minted while unlocked must be wrapped with the SAME salt so
   *  the one session masterKey unwraps every row (see persistSecretKey).
   */
  salt: Uint8Array | null;
  iterations: number | null;
  /** v2 sessions: the device master key that unwraps rows. */
  dmk: Uint8Array | null;
}

const session: SessionState = {
  masterKey: null,
  salt: null,
  iterations: null,
  dmk: null,
};

async function readWrappers(): Promise<DeviceKeyWrappers | null> {
  const raw = await getSetting(SETTING_KEYS.deviceKeyWrappers);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DeviceKeyWrappers;
    if (!parsed || typeof parsed !== "object" || parsed.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeWrappers(wrappers: DeviceKeyWrappers): Promise<void> {
  await db.settings.put({
    key: SETTING_KEYS.deviceKeyWrappers,
    value: JSON.stringify(wrappers),
  });
}

export async function currentLockState(): Promise<LockState> {
  const rows = await db.secretKeys.toArray();
  const anyWrapped = rows.some((r) => r.wrapped);
  if (!anyWrapped) return "unprotected";
  return session.masterKey || session.dmk ? "unlocked" : "locked";
}

export function isUnlocked(): boolean {
  return session.masterKey !== null || session.dmk !== null;
}

/** The passkey enrollment on this device (metadata only — never the
 *  wrapped key material), or null. Drives the lock screen's passkey
 *  button and the Security section's enrolled state. */
export async function passkeyEnrollment(): Promise<PasskeyEnrollmentMeta | null> {
  const wrappers = await readWrappers();
  if (!wrappers?.passkey) return null;
  const { credentialId, prfSalt, createdAt } = wrappers.passkey;
  return { credentialId, prfSalt, createdAt };
}

/**
 * Returns the plaintext (base64) secret key for the given public key.
 * Throws if the row is missing, or if the row is wrapped and the session
 * is locked. Plaintext rows are returned as-is regardless of session
 * state — a node without any protection-enabled keys is always "open."
 */
export async function getSecretKey(publicKey: string): Promise<string> {
  const row = await db.secretKeys.get(publicKey);
  if (!row) {
    throw new Error(
      `No secret key on this device for ${publicKey.slice(0, 8)}… — cannot sign.`,
    );
  }
  if (row.secretKey) return row.secretKey;
  if (!row.wrapped) {
    throw new Error(
      "Secret key row is malformed: neither plaintext nor wrapped.",
    );
  }
  if (isDirectBlob(row.wrapped)) {
    if (!session.dmk) {
      throw new Error(
        "This device is locked. Unlock with your passkey or passphrase before continuing.",
      );
    }
    const plaintext = unwrapDirect(row.wrapped, session.dmk);
    if (!plaintext) {
      throw new Error(
        "The session key can't decrypt this wrapped secret — try locking and re-unlocking.",
      );
    }
    return plaintext;
  }
  if (!session.masterKey) {
    throw new Error(
      "This device is locked. Enter your passphrase before continuing.",
    );
  }
  const plaintext = unwrap(row.wrapped, session.masterKey);
  if (!plaintext) {
    throw new Error(
      "The session key can't decrypt this wrapped secret — try locking and re-unlocking.",
    );
  }
  return plaintext;
}

/**
 * Attempt to unlock the session with a given passphrase. Any one wrapped
 * row that successfully decrypts is enough — every row shares the same
 * master passphrase.
 */
export async function unlockSession(
  passphrase: string,
): Promise<"unlocked" | "wrong_passphrase" | "nothing_to_unlock"> {
  // v2 envelope: the passphrase opens the DMK's passphrase wrapper,
  // never the rows directly.
  const wrappers = await readWrappers();
  if (wrappers?.passphrase) {
    const kek = await deriveMasterKey(
      passphrase,
      saltFromBlob(wrappers.passphrase),
      wrappers.passphrase.iterations,
    );
    const dmkB64 = unwrap(wrappers.passphrase, kek);
    if (!dmkB64) return "wrong_passphrase";
    session.dmk = b64decode(dmkB64);
    return "unlocked";
  }

  const rows = await db.secretKeys.toArray();
  const wrappedRows = rows.filter(
    (r): r is SecretKeyRow & { wrapped: WrappedBlob } =>
      !!r.wrapped && !isDirectBlob(r.wrapped),
  );
  if (wrappedRows.length === 0) return "nothing_to_unlock";
  const sample = wrappedRows[0];
  const masterKey = await deriveMasterKey(
    passphrase,
    saltFromBlob(sample.wrapped),
    sample.wrapped.iterations,
  );
  const decrypted = unwrap(sample.wrapped, masterKey);
  if (!decrypted) return "wrong_passphrase";
  session.masterKey = masterKey;
  session.salt = saltFromBlob(sample.wrapped);
  session.iterations = sample.wrapped.iterations;
  return "unlocked";
}

/**
 * Unlock with a passkey-derived KEK (lib/passkeyUnlock.ts ran the
 * WebAuthn ceremony; this half only touches storage — the split keeps
 * everything here unit-testable with plain bytes).
 */
export async function unlockSessionWithKek(
  kek: Uint8Array,
): Promise<"unlocked" | "wrong_key" | "no_passkey"> {
  const wrappers = await readWrappers();
  if (!wrappers?.passkey) return "no_passkey";
  const dmkB64 = unwrapDirect(wrappers.passkey.blob, kek);
  if (!dmkB64) return "wrong_key";
  session.dmk = b64decode(dmkB64);
  return "unlocked";
}

export function lockSession(): void {
  if (session.masterKey) {
    session.masterKey.fill(0);
  }
  if (session.dmk) {
    session.dmk.fill(0);
  }
  session.masterKey = null;
  session.salt = null;
  session.iterations = null;
  session.dmk = null;
}

/**
 * Persist a freshly-minted secret key, WRAPPING it when the device has
 * passphrase protection unlocked (Round-4 review). Before this, new
 * identities (invite-redeem mint, device pairing) always wrote plaintext
 * even on a protected device, and `getSecretKey` returns any plaintext
 * row while "locked" — so a key minted after enabling a passphrase sat
 * readable in IndexedDB and the app signed with it while nominally
 * locked. Route ALL secret-key writes through here.
 *
 * If the session is unprotected/locked (no live masterKey), the key is
 * stored plaintext — the same as before, and correct: a locked device
 * can't wrap (no key), and enabling protection later wraps it then.
 */
export async function persistSecretKey(
  publicKey: string,
  secretKey: string,
): Promise<void> {
  if (session.dmk) {
    await db.secretKeys.put({
      publicKey,
      wrapped: wrapDirect(secretKey, session.dmk),
    });
    return;
  }
  if (session.masterKey && session.salt && session.iterations !== null) {
    const wrapped = wrap(
      secretKey,
      session.masterKey,
      session.salt,
      session.iterations,
    );
    await db.secretKeys.put({ publicKey, wrapped });
    return;
  }
  await db.secretKeys.put({ publicKey, secretKey });
}

/**
 * Enable passphrase protection on every plaintext row on this device.
 * No-op rows (already wrapped) are left alone. Refuses if any row is
 * already wrapped and the session isn't unlocked — callers should gate
 * this action behind an unlock prompt when that happens.
 */
/**
 * Enroll a passkey as an additional unlock method. Requires an
 * unlocked session AND passphrase protection already on — the
 * passphrase is the guaranteed fallback, so a passkey may never be
 * the only way in. On a v1 device this performs the one-time envelope
 * migration: mint a DMK, rewrap every row under it, and store the DMK
 * wrapped under both the (already-derived) passphrase key and the
 * passkey KEK — atomically, so a crash mid-migration leaves the old
 * v1 layout fully intact.
 */
export async function enrollPasskeyWrapper(
  kek: Uint8Array,
  meta: PasskeyEnrollmentMeta,
): Promise<void> {
  if (!isUnlocked()) {
    throw new Error("Unlock the session before adding a passkey.");
  }

  // Already v2: just add (or replace) the passkey wrapper.
  if (session.dmk) {
    const wrappers = await readWrappers();
    if (!wrappers) {
      throw new Error(
        "Device key wrappers are missing — lock and unlock, then retry.",
      );
    }
    await writeWrappers({
      ...wrappers,
      passkey: { ...meta, blob: wrapDirect(b64encode(session.dmk), kek) },
    });
    return;
  }

  // v1 → v2 migration. The session must be passphrase-unlocked (the
  // only other unlocked state), which also proves protection is on.
  if (!session.masterKey || !session.salt || session.iterations === null) {
    throw new Error(
      "Turn on passphrase protection before adding a passkey — the passphrase stays as your fallback.",
    );
  }
  const masterKey = session.masterKey;
  const salt = session.salt;
  const iterations = session.iterations;
  const dmk = randomBytes(32);
  const dmkB64 = b64encode(dmk);

  await db.transaction("rw", [db.secretKeys, db.settings], async () => {
    const rows = await db.secretKeys.toArray();
    for (const row of rows) {
      const plaintext =
        row.secretKey ??
        (row.wrapped && !isDirectBlob(row.wrapped)
          ? unwrap(row.wrapped, masterKey)
          : null);
      if (!plaintext) {
        throw new Error(
          `Could not decrypt an existing wrapped row for ${row.publicKey.slice(0, 8)}….`,
        );
      }
      await db.secretKeys.put({
        publicKey: row.publicKey,
        wrapped: wrapDirect(plaintext, dmk),
      });
    }
    const wrappers: DeviceKeyWrappers = {
      v: 1,
      passphrase: wrap(dmkB64, masterKey, salt, iterations),
      passkey: { ...meta, blob: wrapDirect(dmkB64, kek) },
    };
    await db.settings.put({
      key: SETTING_KEYS.deviceKeyWrappers,
      value: JSON.stringify(wrappers),
    });
  });

  session.dmk = dmk;
  session.masterKey.fill(0);
  session.masterKey = null;
  session.salt = null;
  session.iterations = null;
}

/**
 * Remove the passkey unlock method. The device stays on the v2
 * envelope with the passphrase wrapper alone — rows are untouched.
 * (The platform credential itself can't be deleted from JS; the
 * member removes it from their OS password manager, and without the
 * wrapper it opens nothing.)
 */
export async function removePasskeyWrapper(): Promise<void> {
  if (!isUnlocked()) {
    throw new Error("Unlock the session before removing the passkey.");
  }
  const wrappers = await readWrappers();
  if (!wrappers?.passkey) return;
  const { passkey: _removed, ...rest } = wrappers;
  await writeWrappers(rest);
}

export async function enablePassphrase(
  passphrase: string,
): Promise<void> {
  const problem = validatePassphrase(passphrase);
  if (problem) throw new Error(problem);

  const wrappers = await readWrappers();
  if (wrappers) {
    throw new Error(
      "Passphrase protection is already on — use Change instead.",
    );
  }

  const rows = await db.secretKeys.toArray();
  const wrappedRows = rows.filter((r) => r.wrapped);
  if (wrappedRows.length > 0 && !session.masterKey) {
    throw new Error(
      "Unlock the session before enabling passphrase protection.",
    );
  }

  const salt = newSalt();
  const masterKey = await deriveMasterKey(
    passphrase,
    salt,
    DEFAULT_ITERATIONS,
  );

  await db.transaction("rw", db.secretKeys, async () => {
    for (const row of rows) {
      const plaintext = row.secretKey
        ? row.secretKey
        : row.wrapped && !isDirectBlob(row.wrapped)
          ? unwrap(row.wrapped, session.masterKey!)
          : null;
      if (!plaintext) {
        throw new Error(
          `Could not decrypt an existing wrapped row for ${row.publicKey.slice(0, 8)}….`,
        );
      }
      const wrapped = wrap(plaintext, masterKey, salt, DEFAULT_ITERATIONS);
      await db.secretKeys.put({ publicKey: row.publicKey, wrapped });
    }
  });

  session.masterKey = masterKey;
  session.salt = salt;
  session.iterations = DEFAULT_ITERATIONS;
}

export async function changePassphrase(
  currentPassphrase: string,
  nextPassphrase: string,
): Promise<void> {
  const problem = validatePassphrase(nextPassphrase);
  if (problem) throw new Error(problem);

  // v2 envelope: verify the current passphrase against the DMK's
  // passphrase wrapper, then rewrap ONLY that wrapper under the new
  // passphrase. Rows and the passkey wrapper are untouched — this is
  // the whole point of the envelope.
  const wrappers = await readWrappers();
  if (wrappers?.passphrase) {
    const kek = await deriveMasterKey(
      currentPassphrase,
      saltFromBlob(wrappers.passphrase),
      wrappers.passphrase.iterations,
    );
    const dmkB64 = unwrap(wrappers.passphrase, kek);
    if (!dmkB64) {
      throw new Error("That passphrase didn't match the current one.");
    }
    const salt = newSalt();
    const nextKek = await deriveMasterKey(
      nextPassphrase,
      salt,
      DEFAULT_ITERATIONS,
    );
    await writeWrappers({
      ...wrappers,
      passphrase: wrap(dmkB64, nextKek, salt, DEFAULT_ITERATIONS),
    });
    session.dmk = b64decode(dmkB64);
    return;
  }

  const unlock = await unlockSession(currentPassphrase);
  if (unlock === "wrong_passphrase") {
    throw new Error("That passphrase didn't match the current one.");
  }
  if (unlock === "nothing_to_unlock") {
    throw new Error(
      "Passphrase protection isn't enabled on this device — use Enable instead.",
    );
  }

  // unlockSession set session.masterKey; the v1 rewrap below uses a
  // fresh salt and the new passphrase. (enablePassphrase now refuses
  // when wrappers exist, but this path only runs when they don't.)
  await rewrapV1Rows(nextPassphrase);
}

/** The v1 change-passphrase tail: rewrap every row under a key
 *  derived from the new passphrase. Split out of enablePassphrase so
 *  the enable path can refuse v2 devices without breaking change. */
async function rewrapV1Rows(nextPassphrase: string): Promise<void> {
  const rows = await db.secretKeys.toArray();
  const salt = newSalt();
  const masterKey = await deriveMasterKey(
    nextPassphrase,
    salt,
    DEFAULT_ITERATIONS,
  );
  await db.transaction("rw", db.secretKeys, async () => {
    for (const row of rows) {
      const plaintext = row.secretKey
        ? row.secretKey
        : row.wrapped && !isDirectBlob(row.wrapped)
          ? unwrap(row.wrapped, session.masterKey!)
          : null;
      if (!plaintext) {
        throw new Error(
          `Could not decrypt an existing wrapped row for ${row.publicKey.slice(0, 8)}….`,
        );
      }
      const wrapped = wrap(plaintext, masterKey, salt, DEFAULT_ITERATIONS);
      await db.secretKeys.put({ publicKey: row.publicKey, wrapped });
    }
  });
  session.masterKey = masterKey;
  session.salt = salt;
  session.iterations = DEFAULT_ITERATIONS;
}

/**
 * Remove passphrase protection entirely. Requires that the session is
 * already unlocked — otherwise the secret keys are inaccessible. Rewrites
 * every wrapped row as plaintext.
 */
export async function disablePassphrase(): Promise<void> {
  const wrappers = await readWrappers();
  if (wrappers?.passkey) {
    throw new Error(
      "Remove the passkey first — the passphrase must stay on while a passkey can unlock this device.",
    );
  }

  // v2 without a passkey (a passkey was enrolled, then removed):
  // unwrap rows back to plaintext with the DMK and drop the wrappers.
  if (wrappers) {
    if (!session.dmk) {
      throw new Error(
        "Unlock the session before disabling passphrase protection.",
      );
    }
    const dmk = session.dmk;
    await db.transaction("rw", [db.secretKeys, db.settings], async () => {
      const rows = await db.secretKeys.toArray();
      for (const row of rows) {
        if (row.secretKey && !row.wrapped) continue;
        const plaintext =
          row.wrapped && isDirectBlob(row.wrapped)
            ? unwrapDirect(row.wrapped, dmk)
            : null;
        if (!plaintext) {
          throw new Error(
            `Could not decrypt an existing wrapped row for ${row.publicKey.slice(0, 8)}….`,
          );
        }
        await db.secretKeys.put({
          publicKey: row.publicKey,
          secretKey: plaintext,
        });
      }
      await db.settings.delete(SETTING_KEYS.deviceKeyWrappers);
    });
    lockSession();
    return;
  }

  if (!session.masterKey) {
    throw new Error(
      "Unlock the session before disabling passphrase protection.",
    );
  }

  const rows = await db.secretKeys.toArray();
  await db.transaction("rw", db.secretKeys, async () => {
    for (const row of rows) {
      if (row.secretKey && !row.wrapped) continue;
      const plaintext =
        row.wrapped && !isDirectBlob(row.wrapped)
          ? unwrap(row.wrapped, session.masterKey!)
          : null;
      if (!plaintext) {
        throw new Error(
          `Could not decrypt an existing wrapped row for ${row.publicKey.slice(0, 8)}….`,
        );
      }
      await db.secretKeys.put({
        publicKey: row.publicKey,
        secretKey: plaintext,
      });
    }
  });

  session.masterKey = null;
  session.salt = null;
  session.iterations = null;
}

/** Test-only: forcibly clear session state between tests. */
export function __resetSessionForTests(): void {
  lockSession();
}
