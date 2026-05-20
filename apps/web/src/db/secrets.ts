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
import { db, type SecretKeyRow } from "./database";
import {
  DEFAULT_ITERATIONS,
  deriveMasterKey,
  newSalt,
  saltFromBlob,
  unwrap,
  validatePassphrase,
  wrap,
  type WrappedBlob,
} from "@/lib/passphrase";

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

interface SessionState {
  masterKey: Uint8Array | null;
}

const session: SessionState = { masterKey: null };

export async function currentLockState(): Promise<LockState> {
  const rows = await db.secretKeys.toArray();
  const anyWrapped = rows.some((r) => r.wrapped);
  if (!anyWrapped) return "unprotected";
  return session.masterKey ? "unlocked" : "locked";
}

export function isUnlocked(): boolean {
  return session.masterKey !== null;
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
  const rows = await db.secretKeys.toArray();
  const wrappedRows = rows.filter((r): r is SecretKeyRow & { wrapped: WrappedBlob } =>
    !!r.wrapped,
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
  return "unlocked";
}

export function lockSession(): void {
  if (session.masterKey) {
    session.masterKey.fill(0);
  }
  session.masterKey = null;
}

/**
 * Enable passphrase protection on every plaintext row on this device.
 * No-op rows (already wrapped) are left alone. Refuses if any row is
 * already wrapped and the session isn't unlocked — callers should gate
 * this action behind an unlock prompt when that happens.
 */
export async function enablePassphrase(
  passphrase: string,
): Promise<void> {
  const problem = validatePassphrase(passphrase);
  if (problem) throw new Error(problem);

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
        : unwrap(row.wrapped!, session.masterKey!);
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
}

export async function changePassphrase(
  currentPassphrase: string,
  nextPassphrase: string,
): Promise<void> {
  const problem = validatePassphrase(nextPassphrase);
  if (problem) throw new Error(problem);

  const unlock = await unlockSession(currentPassphrase);
  if (unlock === "wrong_passphrase") {
    throw new Error("That passphrase didn't match the current one.");
  }
  if (unlock === "nothing_to_unlock") {
    throw new Error(
      "Passphrase protection isn't enabled on this device — use Enable instead.",
    );
  }

  // unlockSession set session.masterKey; enablePassphrase will rewrap
  // using a fresh salt and the new passphrase.
  await enablePassphrase(nextPassphrase);
}

/**
 * Remove passphrase protection entirely. Requires that the session is
 * already unlocked — otherwise the secret keys are inaccessible. Rewrites
 * every wrapped row as plaintext.
 */
export async function disablePassphrase(): Promise<void> {
  if (!session.masterKey) {
    throw new Error(
      "Unlock the session before disabling passphrase protection.",
    );
  }

  const rows = await db.secretKeys.toArray();
  await db.transaction("rw", db.secretKeys, async () => {
    for (const row of rows) {
      if (row.secretKey && !row.wrapped) continue;
      const plaintext = unwrap(row.wrapped!, session.masterKey!);
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
}

/** Test-only: forcibly clear session state between tests. */
export function __resetSessionForTests(): void {
  lockSession();
}
