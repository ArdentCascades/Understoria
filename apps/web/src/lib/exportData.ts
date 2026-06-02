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

// Builds a JSON snapshot of the member's local data and triggers a
// browser download. Used by the Settings page's Data export card.
// `db.secretKeys` is deliberately excluded — private keys never leave
// the device via export. Key backup / recovery is a separate
// passphrase-wrapped flow (see SecuritySection).
export async function exportData(): Promise<void> {
  const [members, posts, exchanges, achievements, settings] = await Promise.all(
    [
      db.members.toArray(),
      db.posts.toArray(),
      db.exchanges.toArray(),
      db.achievements.toArray(),
      db.settings.toArray(),
    ],
  );
  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    data: { members, posts, exchanges, achievements, settings },
  };
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
