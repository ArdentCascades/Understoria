/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./database";
import { seedDemoCommunityIfEmpty } from "./seed";
import { trustStatusWithInvites, vouchersFor } from "@/lib/vouch";

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.vouches.clear(),
    db.outbox.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.posts.clear(),
  ]);
}

describe("seedDemoCommunityIfEmpty", () => {
  beforeEach(reset);

  it("seeds the founder and established members as trusted via real signed vouches", async () => {
    const you = await seedDemoCommunityIfEmpty();
    const members = await db.members.toArray();
    const vouches = await db.vouches.toArray();
    const ctx = { vouches, invites: [] };

    // Real signed vouch records exist — the old cross-vouch wrote only
    // the (unused) Member.vouchedBy array, leaving db.vouches empty and
    // every member "pending trust".
    expect(vouches.length).toBeGreaterThan(0);
    for (const v of vouches) expect(v.kind).toBe("manual");

    // The founder ("You") is trusted, so they aren't locked out of
    // vouching on a fresh node.
    expect(trustStatusWithInvites(you.publicKey, ctx)).toBe("trusted");

    const statuses = members.map((m) =>
      trustStatusWithInvites(m.publicKey, ctx),
    );
    // Most members are established; exactly one newcomer stays pending so
    // the Vouch button is visible (you're trusted) AND usable (there's
    // someone to vouch for).
    expect(statuses.filter((s) => s === "trusted").length).toBeGreaterThanOrEqual(4);
    expect(statuses.filter((s) => s === "pending_trust").length).toBe(1);
  });

  it("leaves the newcomer one vouch short, so a single vouch tips them to trusted", async () => {
    await seedDemoCommunityIfEmpty();
    const members = await db.members.toArray();
    const vouches = await db.vouches.toArray();
    const ctx = { vouches, invites: [] };

    const newcomer = members.find(
      (m) => trustStatusWithInvites(m.publicKey, ctx) === "pending_trust",
    );
    expect(newcomer).toBeDefined();
    // Exactly one existing voucher → one more vouch reaches the trust
    // threshold of two.
    expect(vouchersFor(newcomer!.publicKey, ctx).size).toBe(1);
  });
});
