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
 * Everything NOT on this list is exported — the bundle is derived from
 * `db.tables` (see `buildExportBundle`), so a newly-added table is
 * included by default rather than silently dropped. This inverts the
 * previous hand-maintained include-list, which had drifted to 5 of the
 * ~28 tables and silently omitted the member's projects, tasks,
 * messages, events, governance, and trust data from their own backup.
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
 *   - `invites` — rows carry the `encoded` field, a LIVE redeemable
 *     invite credential. A backup file the member may share must not
 *     hand out working invite links; issued-invite state is
 *     reconstructable on a paired device via the pairing envelope.
 *   - `pairingLog` — the "which devices I have authorized" history is
 *     device-graph metadata in the same personal-relief class as
 *     blocks; it does not belong in a shareable file.
 *   - `eventRsvps` — the member's event-attendance graph (who went
 *     where), which `docs/community-events.md` §4.2/§7 and the schema
 *     declare "never synced, never exported, never federated"; the
 *     events design promises never to aggregate attendance, and a
 *     shareable backup file is exactly such an aggregation surface.
 *   - `eventProjectLinks` — same posture as `eventRsvps` and `blocks`
 *     per the schema: ties a federated event to a LOCAL-ONLY project
 *     with the linker's key; a project pointer must never leave the
 *     device in a file the member may hand to someone else.
 *   - `eventShifts` + `shiftSignups` — the shift-signup layer
 *     (`docs/shift-signups.md` §4): signups are a per-slot
 *     attendance-intent graph, strictly finer-grained than the
 *     `eventRsvps` rows already excluded, and shift definitions carry
 *     the member's organizing pattern. Neither may leave the device.
 */
export const EXPORT_EXCLUDED_TABLES = [
  "secretKeys",
  "blocks",
  "previouslyBlocked",
  "invites",
  "pairingLog",
  "eventRsvps",
  "eventProjectLinks",
  "eventShifts",
  "shiftSignups",
] as const;

/**
 * Build the in-memory export bundle without serialising or triggering a
 * download. Split out from `exportData` so tests can assert the shape
 * without faking a DOM.
 *
 * Completeness is enforced by enumerating `db.tables` and subtracting
 * the exclusion list — the same drift-proof pattern `hardPurge` uses —
 * so this can never again quietly lose a table's worth of the member's
 * data.
 */
export async function buildExportBundle(): Promise<{
  exportedAt: string;
  schemaVersion: number;
  data: Record<string, unknown>;
}> {
  const excluded = new Set<string>(EXPORT_EXCLUDED_TABLES);
  const tables = db.tables.filter((t) => !excluded.has(t.name));
  const arrays = await Promise.all(tables.map((t) => t.toArray()));
  const data: Record<string, unknown> = {};
  tables.forEach((t, i) => {
    data[t.name] = arrays[i];
  });
  return {
    exportedAt: new Date().toISOString(),
    // Bumped from 1: the bundle now spans the member's full local
    // dataset (minus the documented exclusions), not the prior
    // 5-table subset.
    schemaVersion: 2,
    data,
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
