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
    db.eventRsvps.clear(),
    db.eventProjectLinks.clear(),
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
    // The attendance graph + the local-project pointer — both declared
    // never-exported by the schema (docs/community-events.md §4.2/§7).
    await db.eventRsvps.put({
      id: "rsvp_export_1",
      eventId: "evt_export",
      memberKey: "rsvp_member_key",
      status: "going",
      respondedAt: 111,
    });
    await db.eventProjectLinks.put({
      id: "epl_export_1",
      eventId: "evt_export",
      projectId: "local_project_ptr",
      linkedBy: "linker_key",
      createdAt: 222,
    });

    // Sanity: the rows we just populated really are there before export.
    expect(await db.secretKeys.count()).toBeGreaterThan(0);
    expect(await db.blocks.count()).toBeGreaterThan(0);
    expect(await db.previouslyBlocked.count()).toBeGreaterThan(0);
    expect(await db.eventRsvps.count()).toBeGreaterThan(0);
    expect(await db.eventProjectLinks.count()).toBeGreaterThan(0);

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
    expect(json).not.toContain("rsvp_member_key");
    expect(json).not.toContain("local_project_ptr");
  });

  it("declares the excluded table list (lock the exclusion in code)", () => {
    expect(EXPORT_EXCLUDED_TABLES).toContain("secretKeys");
    expect(EXPORT_EXCLUDED_TABLES).toContain("blocks");
    expect(EXPORT_EXCLUDED_TABLES).toContain("previouslyBlocked");
    expect(EXPORT_EXCLUDED_TABLES).toContain("invites");
    expect(EXPORT_EXCLUDED_TABLES).toContain("pairingLog");
    expect(EXPORT_EXCLUDED_TABLES).toContain("eventRsvps");
    expect(EXPORT_EXCLUDED_TABLES).toContain("eventProjectLinks");
  });

  it("exports EVERY table that is not explicitly excluded (no silent drift)", () => {
    // The bug this guards: the export had drifted to a hand-maintained
    // 5-table include-list and silently dropped 20 tables of the
    // member's own data. Completeness is now derived from db.tables.
    const excluded = new Set<string>(EXPORT_EXCLUDED_TABLES);
    const expected = db.tables
      .map((t) => t.name)
      .filter((name) => !excluded.has(name))
      .sort();
    // buildExportBundle is async; assert the key set against a fresh
    // (empty) DB — presence of the key, not row count, is the contract.
    return buildExportBundle().then((bundle) => {
      expect(Object.keys(bundle.data).sort()).toEqual(expected);
      // Spot-check tables the old include-list dropped.
      for (const name of [
        "projects",
        "projectTasks",
        "messages",
        "events",
        "proposals",
        "votes",
        "taskComments",
        "vouches",
      ]) {
        expect(Object.keys(bundle.data)).toContain(name);
      }
    });
  });
});
