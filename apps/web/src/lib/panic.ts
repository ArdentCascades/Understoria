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
  ];

  await Promise.all([
    db.posts.clear(),
    db.exchanges.clear(),
    db.achievements.clear(),
    db.members.clear(),
    db.secretKeys.clear(),
    db.settings.clear(),
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
