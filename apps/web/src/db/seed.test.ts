/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { db, getSetting, SETTING_KEYS } from "./database";
import { seedDemoCommunityIfDev, seedDemoCommunityIfEmpty } from "./seed";
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

// Operator ruling R1: the demo community is DEV-MODE ONLY. Production
// (isDev: false) must start with a genuinely empty node — no members,
// no posts, no vouches, no current-member setting — because the first
// identity is minted by onboarding, never by the seed.
describe("seedDemoCommunityIfDev", () => {
  beforeEach(reset);

  it("does NOT seed when isDev is false — production starts empty", async () => {
    const result = await seedDemoCommunityIfDev(false);
    expect(result).toBeNull();
    expect(await db.members.count()).toBe(0);
    expect(await db.posts.count()).toBe(0);
    expect(await db.vouches.count()).toBe(0);
    expect(await db.secretKeys.count()).toBe(0);
    expect(await getSetting(SETTING_KEYS.currentMember)).toBeUndefined();
  });

  it("seeds the demo community when isDev is true", async () => {
    const result = await seedDemoCommunityIfDev(true);
    expect(result).not.toBeNull();
    // Founder + 4 fictional members.
    expect(await db.members.count()).toBe(5);
    expect(await getSetting(SETTING_KEYS.currentMember)).toBe(
      result!.publicKey,
    );
  });

  it("defaults the flag from import.meta.env.DEV (true under vitest)", async () => {
    // Vitest runs with DEV=true, so the zero-arg call — the exact shape
    // AppContext uses — must seed. If the default-param wiring ever
    // breaks, dev builds silently lose their demo community.
    const result = await seedDemoCommunityIfDev();
    expect(result).not.toBeNull();
    expect(await db.members.count()).toBe(5);
  });
});
