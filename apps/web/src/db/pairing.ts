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
import { db, type PairingLogRow } from "./database";

/**
 * Local paired-device inventory — write + read helpers.
 *
 * Why this exists: members lose track of how many copies of their
 * identity exist (`docs/device-pairing.md` §9.x). The inventory is a
 * UX surface that lists what THIS device has paired (as source or
 * destination). It is not a security boundary — Ed25519 has no
 * revocation primitive, so a row in this table cannot be "removed"
 * in any meaningful sense; the only remediation for a lost paired
 * device is Hard purge.
 *
 * Records are written only on member-initiated pair *completions*.
 * Cancelled / failed attempts on the source side are explicitly
 * excluded by the AddDevice flow so the inventory doesn't fill with
 * noise.
 */

/**
 * Stable id generator. `crypto.randomUUID()` is universally
 * available in 2026 browsers and Node 19+; the fallback is here so
 * the helper doesn't throw in the vanishing case where it isn't.
 */
function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: 16 random bytes as base64. Not a UUID shape, but the
  // primary key only needs uniqueness, not the canonical form.
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/=+$/, "");
}

export async function recordPairing(opts: {
  kind: "source" | "destination";
  label: string;
  /** Override for tests; production callers omit it and get
   *  `Date.now()`. */
  completedAt?: number;
}): Promise<PairingLogRow> {
  const row: PairingLogRow = {
    id: newId(),
    kind: opts.kind,
    label: opts.label,
    completedAt: opts.completedAt ?? Date.now(),
  };
  await db.pairingLog.put(row);
  return row;
}

/**
 * Returns every entry sorted by `completedAt` DESC (most recent
 * first). Callers split by `kind` in memory — the table is short
 * enough (one row per pair the member has ever performed on this
 * device) that an extra query per kind doesn't earn its keep.
 */
export async function listPairings(): Promise<PairingLogRow[]> {
  const rows = await db.pairingLog.orderBy("completedAt").reverse().toArray();
  return rows;
}
