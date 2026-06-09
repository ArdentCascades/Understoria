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
import { db } from "@/db/database";

/**
 * Tables that are deliberately excluded from the data export bundle.
 * Exported as a const so tests can assert the exclusion list without
 * inspecting the assembled payload by table name.
 *
 *   - `secretKeys` — private keys never leave the device via export.
 *     Key backup / recovery is a separate passphrase-wrapped flow
 *     (see SecuritySection).
 *   - `blocks` + `previouslyBlocked` — local-only personal-relief data
 *     per `docs/blocking.md` §4 + §7 (+ `docs/privacy-policy.md` §3).
 *     Carrying these into an export bundle (which the member may share
 *     for backup or transfer-by-file) would re-introduce the surveillance
 *     surface §11.1 rejected federation to avoid. Settled — block state
 *     rides the device-pairing transfer envelope (see
 *     `lib/devicePairing.ts`), never the export bundle.
 */
export const EXPORT_EXCLUDED_TABLES = [
  "secretKeys",
  "blocks",
  "previouslyBlocked",
] as const;

/**
 * Build the in-memory export bundle without serialising or triggering a
 * download. Split out from `exportData` so tests can assert the shape
 * (specifically the exclusion list above) without faking a DOM.
 */
export async function buildExportBundle(): Promise<{
  exportedAt: string;
  schemaVersion: number;
  data: Record<string, unknown>;
}> {
  const [members, posts, exchanges, achievements, settings] = await Promise.all(
    [
      db.members.toArray(),
      db.posts.toArray(),
      db.exchanges.toArray(),
      db.achievements.toArray(),
      db.settings.toArray(),
    ],
  );
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    data: { members, posts, exchanges, achievements, settings },
  };
}

// Builds a JSON snapshot of the member's local data and triggers a
// browser download. Used by the Settings page's Data export card.
// The tables listed in EXPORT_EXCLUDED_TABLES are deliberately omitted
// — see the const docstring for the per-table rationale.
export async function exportData(): Promise<void> {
  const payload = await buildExportBundle();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `understoria-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
