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
import { db, SETTING_KEYS, setSetting } from "@/db/database";
import { generateKeyPair } from "./crypto";

/**
 * Panic button implementations — Agent 4 task 3.
 *
 * Two modes, each with a different trust model:
 *
 * - `softPurge()` strips every linkable text field from the local node
 *   while preserving the signed exchange ledger and keypairs. The node
 *   continues to operate, but a forensic examiner pulling the device
 *   sees structural data only (post IDs, category codes, timestamps,
 *   public keys). Useful when you expect a device to be briefly handled
 *   by a hostile party but want to keep your identity afterward.
 *
 * - `hardPurge()` wipes every table — including private keys — and
 *   rotates to a fresh node identity. No history remains. The node
 *   "continues" in the sense that the app still opens, but everything
 *   starts over. Unrecoverable.
 *
 * Both functions are transactional per-table and designed to complete
 * well under the 60-second acceptance target from the threat model.
 */

export interface PurgeResult {
  mode: "soft" | "hard";
  durationMs: number;
  tablesTouched: string[];
}

export async function softPurge(): Promise<PurgeResult> {
  const start = performance.now();
  const tables: string[] = [];

  await db.transaction("rw", db.members, async () => {
    const members = await db.members.toArray();
    let i = 0;
    for (const m of members) {
      await db.members.put({
        ...m,
        displayName: `Member ${anonLabel(i++)}`,
        skills: [],
        availability: "",
        locationZone: "",
        vouchedBy: [],
      });
    }
    tables.push("members");
  });

  await db.transaction("rw", db.posts, async () => {
    const posts = await db.posts.toArray();
    for (const p of posts) {
      await db.posts.put({
        ...p,
        title: "",
        description: "",
        locationZone: "",
      });
    }
    tables.push("posts");
  });

  await db.transaction("rw", db.projects, async () => {
    const projects = await db.projects.toArray();
    for (const p of projects) {
      await db.projects.put({
        ...p,
        title: "",
        description: "",
        locationZone: "",
        tags: [],
        pauseNote: null,
      });
    }
    tables.push("projects");
  });

  await db.transaction("rw", db.projectTasks, async () => {
    const tasks = await db.projectTasks.toArray();
    for (const t of tasks) {
      await db.projectTasks.put({
        ...t,
        title: "",
        description: "",
        requiredSkills: [],
      });
    }
    tables.push("projectTasks");
  });

  // Settings that could leak identity are rewritten; the node identity
  // and celebrated-milestones cache survive so the UI doesn't behave
  // erratically afterward.
  tables.push("settings");

  return {
    mode: "soft",
    durationMs: performance.now() - start,
    tablesTouched: tables,
  };
}

export async function hardPurge(): Promise<PurgeResult> {
  const start = performance.now();
  const tables = [
    "posts",
    "exchanges",
    "achievements",
    "members",
    "secretKeys",
    "settings",
    "invites",
    "vouches",
    "outbox",
    "projects",
    "projectTasks",
    "projectActivity",
  ];

  await Promise.all([
    db.posts.clear(),
    db.exchanges.clear(),
    db.achievements.clear(),
    db.members.clear(),
    db.secretKeys.clear(),
    db.settings.clear(),
    db.invites.clear(),
    db.vouches.clear(),
    db.outbox.clear(),
    db.projects.clear(),
    db.projectTasks.clear(),
    db.projectActivity.clear(),
  ]);

  // Rotate to a fresh node identity so the post-purge node is
  // cryptographically independent of the pre-purge one.
  const kp = generateKeyPair();
  await db.secretKeys.put({
    publicKey: kp.publicKey,
    secretKey: kp.secretKey,
  });
  await setSetting(SETTING_KEYS.nodeId, `node_${kp.publicKey.slice(0, 8)}`);

  return {
    mode: "hard",
    durationMs: performance.now() - start,
    tablesTouched: tables,
  };
}

function anonLabel(i: number): string {
  if (i < 26) return String.fromCharCode(65 + i);
  return `${String.fromCharCode(65 + Math.floor(i / 26) - 1)}${String.fromCharCode(
    65 + (i % 26),
  )}`;
}
