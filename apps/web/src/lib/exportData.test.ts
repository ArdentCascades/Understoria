/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { EXPORT_EXCLUDED_TABLES, buildExportBundle } from "./exportData";
import { db } from "@/db/database";
import { blockMember, unblockMember } from "@/db/blocks";

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.posts.clear(),
    db.exchanges.clear(),
    db.achievements.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.blocks.clear(),
    db.previouslyBlocked.clear(),
  ]);
}

describe("buildExportBundle excludes local-only privacy tables", () => {
  beforeEach(reset);

  it("never includes blocks, previouslyBlocked, or secretKeys in the exported JSON (docs/blocking.md §7 + privacy-policy.md §3)", async () => {
    // Populate the tables that ARE supposed to be excluded.
    await db.secretKeys.put({
      publicKey: "secret_pubkey",
      secretKey: "secret_seckey",
    });
    await blockMember({
      blockerKey: "alice_key",
      blockedKey: "bob_key",
      hideGovernance: false,
      note: "secret note",
    });
    await blockMember({
      blockerKey: "alice_key",
      blockedKey: "carol_key",
      hideGovernance: true,
      note: null,
    });
    await unblockMember({
      blockerKey: "alice_key",
      blockedKey: "carol_key",
    });

    // Sanity: the rows we just populated really are there before export.
    expect(await db.secretKeys.count()).toBeGreaterThan(0);
    expect(await db.blocks.count()).toBeGreaterThan(0);
    expect(await db.previouslyBlocked.count()).toBeGreaterThan(0);

    const bundle = await buildExportBundle();
    const json = JSON.stringify(bundle);

    // Top-level keys: every excluded table must be absent.
    const dataKeys = Object.keys(bundle.data);
    for (const excluded of EXPORT_EXCLUDED_TABLES) {
      expect(dataKeys).not.toContain(excluded);
    }

    // String-level check — even nested under a different key, the
    // identifying fragments are nowhere in the bundle.
    expect(json).not.toContain("alice_key");
    expect(json).not.toContain("bob_key");
    expect(json).not.toContain("carol_key");
    expect(json).not.toContain("secret note");
    expect(json).not.toContain("secret_seckey");
  });

  it("declares the excluded table list (lock the exclusion in code)", () => {
    expect(EXPORT_EXCLUDED_TABLES).toContain("secretKeys");
    expect(EXPORT_EXCLUDED_TABLES).toContain("blocks");
    expect(EXPORT_EXCLUDED_TABLES).toContain("previouslyBlocked");
  });
});
