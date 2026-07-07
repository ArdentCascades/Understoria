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

/**
 * Storage budget, Phase 0 — docs/storage-budget.md.
 *
 * IndexedDB is BEST-EFFORT storage: a browser under disk pressure may
 * silently delete the community's entire local copy — the strongest
 * claim in the architecture ("every member's device carries the
 * community") undone by an eviction heuristic. `ensurePersistentStorage`
 * asks for the durable grant once per launch; where the browser says
 * no (or the API is missing) the app keeps working exactly as before,
 * just without the protection — the meter says which.
 *
 * `estimateStorage` feeds the Settings meter so a full device fails
 * legibly instead of opaquely. The numbers never leave the device.
 */

export interface StorageStatus {
  /** True once the origin holds the durable-storage grant; false when
   *  the browser refused; null when the API is unavailable. */
  persisted: boolean | null;
  /** Bytes used / granted for this origin, when the browser reports
   *  them (estimates are deliberately fuzzy per spec — display-only). */
  usage: number | null;
  quota: number | null;
}

/** Request the durable-storage grant. Safe to call every launch:
 *  `persist()` is idempotent and cheap once granted. Never throws. */
export async function ensurePersistentStorage(): Promise<boolean | null> {
  try {
    const storage = navigator?.storage;
    if (!storage?.persist) return null;
    if (storage.persisted && (await storage.persisted())) return true;
    return await storage.persist();
  } catch {
    return null;
  }
}

export async function readStorageStatus(): Promise<StorageStatus> {
  const status: StorageStatus = { persisted: null, usage: null, quota: null };
  try {
    const storage = navigator?.storage;
    if (storage?.persisted) status.persisted = await storage.persisted();
    if (storage?.estimate) {
      const est = await storage.estimate();
      status.usage = typeof est.usage === "number" ? est.usage : null;
      status.quota = typeof est.quota === "number" ? est.quota : null;
    }
  } catch {
    // Display-only telemetry; absence is a valid state.
  }
  return status;
}

/** Human-readable size for the meter. Display-only precision. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}
